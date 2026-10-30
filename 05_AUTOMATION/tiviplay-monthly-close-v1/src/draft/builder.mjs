import crypto from "node:crypto";

import { monthBounds, parseOperationalDate, weekBucket } from "../core.mjs";
import {
  DRAFT_COLUMNS,
  DRAFT_HEADERS,
  ID_COL,
  META_CUTOFF_COL,
  META_ROW,
  META_SIGNATURE_COL,
  draftTarget,
} from "./contract.mjs";
import { isConfirmed, isUniquelyLinked, linkPaymentsByBaseRow, shortSource } from "./payments.mjs";

const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const num = (value) => {
  const n = Number(clean(value).replace(/[$,\s]/g, ""));
  return clean(value) && Number.isFinite(n) ? n : null;
};

// Catálogo vigente USD por pantallas → meses (P0-2 abierto para tarifas fuera de catálogo).
const CATALOG = {
  1: { 1: 15, 2: 25, 3: 40, 6: 70, 12: 130 },
  2: { 1: 21, 2: 30, 3: 48, 6: 82, 12: 150 },
  3: { 1: 27, 2: 42, 3: 55, 6: 105, 12: 180 },
  4: { 1: 33, 2: 60, 3: 75, 6: 140, 12: 240 },
  5: { 1: 39, 2: 72, 3: 87, 6: 160, 12: 270 },
};

const REASON_TEXT = {
  POSSIBLE_FREE_MONTH: "Motor: posible mes gratis pendiente",
  POSSIBLE_NO_RENEWAL: "Motor: posible no renovación",
  EXPLICIT_EXCEPTION: "Motor: excepción explícita",
};

// Señales de no continuidad en OBSERVACIONES que el motor base no clasifica.
const CONTINUITY_SIGNAL = /CANCELA|OTRO OPERADOR|NO CONTIN/;

// Índices de BASE GENERAL (contrato A..X). N (CONTRASEÑA) nunca llega aquí.
const B = { tc: 0, client: 1, status: 4, notes: 5, plan: 6, screens: 7, usd: 9, cop: 10, method: 11, user: 12, panel: 14, due: 15, last: 16, next: 17, t: 18, code: 23 };

function planMonths(row) {
  const code = clean(row[B.code]).match(/PLN_(\d+)/);
  if (code) return Number(code[1]);
  const plan = canon(row[B.plan]).match(/(\d+)\s*MES/);
  return plan ? Number(plan[1]) : null;
}

export function tariffCheck(row) {
  const screens = Number.parseInt(clean(row[B.screens]), 10);
  const months = planMonths(row);
  const expected = CATALOG[screens]?.[months];
  const usd = num(row[B.usd]);
  const cop = num(row[B.cop]);
  if ((usd == null || usd === 0) && cop) return `COP ${clean(row[B.cop])}: sin catálogo COP (se factura valor registrado)`;
  if (expected == null || usd == null) return "SIN_DATO";
  if (Math.abs(usd - expected) < 0.01) return `COINCIDE (${expected})`;
  return `DIFIERE: registrado ${clean(row[B.usd])} / catálogo ${expected} (${screens} pant., ${months}M)`;
}

/**
 * Secciones de BASE GENERAL a partir de sus filas de rótulo (TC distinto de 0/1 con texto en B).
 * Todo lo que sigue a "TOTAL GENERAL" es histórico (bajas, ventas en excepción) y nunca se factura.
 */
export function detectSections(rows, headerIndex) {
  const sections = new Map();
  let label = "ACTIVOS";
  let historical = false;
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const tc = clean(row[B.tc]);
    const text = clean(row[B.client]);
    if (tc !== "0" && tc !== "1" && text) {
      const up = canon(text);
      if (up.startsWith("TOTAL GENERAL")) historical = true;
      else if (!up.startsWith("TOTAL") && !/^(ACTIVOS|VENCIDOS) TIVIPLAY/.test(up)) label = text;
    }
    sections.set(i + 1, { label, historical });
  }
  return sections;
}

function findHeaderIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const keys = new Set((rows[i] ?? []).map(canon));
    if (keys.has("TC") && keys.has("CLIENTE")) return i;
  }
  throw new Error("BASE GENERAL: encabezado TC/CLIENTE no encontrado");
}

const WEEK_LABEL = (month) => {
  const [y, m] = month.split("-").map(Number);
  const end = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return { 1: `01–04/${mm}`, 2: `05–11/${mm}`, 3: `12–18/${mm}`, 4: `19–25/${mm}`, 5: `26–${end}/${mm}` };
};

const describePayment = (p) => `${p.source} ${p.row} ${p.currency} ${p.amount}`;

/**
 * Construye los valores de la hoja BORRADOR. Función pura y determinista:
 * mismas fuentes → mismos valores → misma firma. No usa la fecha de ejecución.
 *
 * Aislamiento: la clasificación de una ficha solo depende de su propia fila, de los pagos
 * enlazados de forma única a esa fila, de la decisión registrada para esa fila y de la
 * repetición de su USUARIO. Una excepción en una ficha nunca reclasifica otra.
 */
export function buildDraft({ baseRows, close, payments = [], decisions = {}, cutoffDate }) {
  const month = close.targetMonth;
  const target = draftTarget(month);
  if (!cutoffDate || cutoffDate !== close.cutoffDate) throw new Error("buildDraft requiere el mismo cutoffDate que el motor");
  const { end } = monthBounds(month);
  const P = target.prefix;
  const R = (n) => baseRows[n - 1] ?? [];
  const headerIndex = findHeaderIndex(baseRows);
  const sections = detectSections(baseRows, headerIndex);
  const sectionOf = (n) => sections.get(n) ?? { label: "", historical: false };
  const decisionRows = decisions.rows ?? {};
  const decisionOf = (n) => decisionRows[String(n)] ?? null;

  const linked = linkPaymentsByBaseRow(payments);
  const lastPayment = (n) => {
    const list = linked.get(n);
    return list?.length ? list[list.length - 1] : null;
  };

  const users = new Map();
  for (let n = headerIndex + 2; n <= baseRows.length; n++) {
    const key = canon(R(n)[B.user]);
    if (key && !sectionOf(n).historical) users.set(key, [...(users.get(key) ?? []), n]);
  }
  const othersWithUser = (n) => {
    const key = canon(R(n)[B.user]);
    return key ? (users.get(key) ?? []).filter((x) => x !== n) : [];
  };

  /* ------------------------------------------------------------ universo */
  const universe = [];
  const excluded = [];
  for (const p of close.preview) {
    const n = p.sourceRow;
    const r = R(n);
    if (sectionOf(n).historical) {
      excluded.push({ n, section: sectionOf(n).label, tc: clean(r[B.tc]), next: clean(r[B.next]), cause: "SECCION_HISTORICA_TC1" });
      continue;
    }
    const tv = tariffCheck(r);
    const lp = lastPayment(n);
    const decision = decisionOf(n);
    let cls = "FACTURABLE";
    let cat = "";
    let cause = "";
    let owner = "SISTEMA";

    if (decision?.clase) {
      ({ clase: cls, categoria: cat = "", causa: cause = "", responsable: owner = "DIRECCIÓN" } = decision);
    } else if (lp && isConfirmed(lp) && lp.proposedNext && lp.proposedNext > end) {
      cls = "PAGADO_SIN_PROPAGAR";
      cat = "CONCILIACIÓN";
      cause = `${describePayment(lp)} CONFIRMADO JM. PROP_F_PROXIMO ${lp.proposedNext}; BASE sigue en ${p.nextPaymentDate}. No facturar en el mes.`;
      owner = "BO: propagar F. PRÓXIMO PAGO";
    } else {
      const reasons = p.reviewReasons.map((x) => REASON_TEXT[x] ?? x);
      if (CONTINUITY_SIGNAL.test(canon(r[B.notes]))) reasons.push("Observación: señal de no continuidad (cancela / otro operador / no continúa).");
      if (tv.startsWith("DIFIERE")) reasons.push(`Tarifa ${tv}`);
      // MONEDA NO USD no es alerta en el universo: la ficha factura el COP registrado (ver tariffCheck).
      if (lp && isConfirmed(lp) && lp.tariffCheck === "SIN COINCIDENCIA TARIFA" && !lp.proposedNext) {
        reasons.push(`Pago ${describePayment(lp)} confirmado sin propuesta de F. PRÓXIMO (${lp.tariffCheck.toLowerCase()})`);
      }
      if (lp && !isConfirmed(lp)) reasons.push(`Pago ${describePayment(lp)} sin confirmar (${lp.confirmation || "vacío"})`);
      if (/MIRA/.test(canon(sectionOf(n).label))) reasons.push("Ficha MIRA+: confirmar ciclo de facturación MIRA+.");
      const others = othersWithUser(n);
      if (others.length) reasons.push(`USUARIO repetido en ficha(s) ${others.join(", ")}.`);
      if (decision?.revision) reasons.push(decision.revision);
      if (reasons.length) {
        cls = "REQUIERE_REVISION";
        owner = "BO (verificar) → DIRECCIÓN si cambia valor o universo";
        const tags = new Set();
        for (const x of reasons) {
          if (/mes gratis/i.test(x)) tags.add("MES GRATIS");
          else if (/no renov|no continuidad/i.test(x)) tags.add("NO RENOVACIÓN");
          else if (/arifa|moneda/i.test(x)) tags.add("TARIFA");
          else if (/sin confirmar/.test(x)) tags.add("CONFIRMACIÓN");
          else if (/USUARIO/.test(x)) tags.add("IDENTIDAD");
          else if (/MIRA\+/.test(x)) tags.add("SEGMENTO MIRA+");
          else tags.add("EXCEPCIÓN");
        }
        cat = [...tags].sort().join(" + ");
        cause = reasons.join(" · ");
      }
    }
    universe.push({ n, p, r, week: p.week, cls, cat, cause, owner, tv, lp });
  }

  /* ------------------------------------------------- cartera y excluidos */
  const cartera = [];
  for (const c of close.carteraVencida) {
    const n = c.sourceRow;
    const sec = sectionOf(n);
    if (sec.historical) {
      excluded.push({ n, section: sec.label, tc: clean(R(n)[B.tc]), next: clean(R(n)[B.next]), cause: "SECCION_HISTORICA_TC1" });
      continue;
    }
    const sub = [];
    const note = [];
    if (c.daysPastDue != null && c.daysPastDue < 0) sub.push("POR_VENCER_AL_CORTE");
    const lp = lastPayment(n);
    if (lp) {
      if (!isConfirmed(lp)) {
        sub.push("PAGO SIN CONFIRMAR");
        note.push(`${describePayment(lp)} sin CONFIRMACION.`);
      } else if (/SIN COINCIDENCIA TARIFA|MONEDA NO USD/.test(lp.tariffCheck) && !lp.proposedNext) {
        sub.push("BLOQUEADO TARIFA");
        note.push(`${describePayment(lp)} CONFIRMADO JM (${lp.tariffCheck.toLowerCase()}), sin propuesta.`);
      } else if (lp.proposedNext && lp.proposedNext <= end && lp.proposedNext.slice(0, 7) === month) {
        sub.push("SALE AL MES AL PROPAGAR");
        note.push(`${describePayment(lp)} CONFIRMADO JM → PROP ${lp.proposedNext}: entra al ciclo (S${weekBucket(lp.proposedNext)}) cuando BO propague.`);
      } else if (lp.proposedNext && lp.proposedNext > end) {
        sub.push("PAGADO SIN PROPAGAR");
        note.push(`${describePayment(lp)} CONFIRMADO JM → PROP ${lp.proposedNext}. Sale de cartera al propagar.`);
      }
    }
    const others = othersWithUser(n);
    if (others.length) {
      sub.push("POSIBLE_DUPLICADO");
      note.push(`USUARIO repetido en fila(s) ${others.join(", ")}.`);
    }
    if (c.signals.length) sub.push(`SEÑAL:${c.signals.join(",")}`);
    const decision = decisionOf(n);
    if (decision?.nota) note.push(decision.nota);
    cartera.push({ n, c, section: sec.label, sub: sub.join(" + ") || "CARTERA_VENCIDA", note: note.join(" ") });
  }
  const blocked = [];
  for (const e of close.exceptions) {
    const sec = sectionOf(e.sourceRow);
    if (sec.historical) excluded.push({ n: e.sourceRow, section: sec.label, tc: clean(R(e.sourceRow)[B.tc]), next: "", cause: "SIN_F_PROXIMO_EN_SECCION_HISTORICA" });
    else blocked.push({ n: e.sourceRow, cause: `TC=1 con F. PRÓXIMO PAGO ${e.cause === "EMPTY_NEXT_PAYMENT_DATE" ? "vacía" : "no interpretable"}. ${decisionOf(e.sourceRow)?.nota ?? ""}`.trim() });
  }
  for (let n = headerIndex + 2; n <= baseRows.length; n++) {
    const r = R(n);
    if (!sectionOf(n).historical && clean(r[B.tc]) === "0" && clean(r[B.next])) {
      excluded.push({ n, section: sectionOf(n).label, tc: "0", next: clean(r[B.next]), cause: "TC_0" });
    }
  }
  excluded.sort((a, b) => a.n - b.n);
  cartera.sort((a, b) => b.c.nextPaymentDate.localeCompare(a.c.nextPaymentDate) || b.n - a.n);

  /* ---------------------------------- ajustes por pagos no propagados */
  const inUniverse = new Map(universe.map((u) => [u.n, u]));
  const inCartera = new Set(cartera.map((c) => c.n));
  const adjustments = [];
  for (const [n, list] of [...linked.entries()].sort((a, b) => a[0] - b[0])) {
    if (!inUniverse.has(n) && !inCartera.has(n)) continue;
    const lp = list[list.length - 1];
    if (!isConfirmed(lp) || !lp.proposedNext) continue;
    const baseNext = parseOperationalDate(R(n)[B.next]);
    if (lp.proposedNext === baseNext) continue;
    let effect;
    if (inUniverse.has(n) && lp.proposedNext > end) effect = "Sale del cobro del mes (ya pagó; PAGADO_SIN_PROPAGAR).";
    else if (inUniverse.has(n)) {
      const a = weekBucket(baseNext);
      const b = weekBucket(lp.proposedNext);
      effect = a === b ? `Desfase de anclaje: BASE ${baseNext} vs pago ${lp.proposedNext} (misma semana).` : `Desfase de anclaje: BASE ${baseNext} (S${a}) vs pago ${lp.proposedNext} (S${b}). BO valida regla.`;
    } else if (lp.proposedNext.slice(0, 7) === month) effect = `Entra al mes S${weekBucket(lp.proposedNext)} (${lp.proposedNext}) al propagar.`;
    else effect = `Sin efecto en el mes: sale de cartera (PROP ${lp.proposedNext}).`;
    adjustments.push({ n, lp, baseNext, effect });
  }

  const pending = payments
    .filter((p) => !isConfirmed(p) || !isUniquelyLinked(p) || p.link === "SIN BASE" || p.link === "REQUIERE DECISIÓN")
    .sort((a, b) => a.source.localeCompare(b.source) || a.row - b.row);

  /* -------------------------------------------------------------- matriz */
  const out = [];
  const row = (...cells) => {
    const c = [...cells, ...new Array(DRAFT_COLUMNS).fill("")].slice(0, DRAFT_COLUMNS);
    out.push(c);
    return c;
  };
  const sectionRow = (title, id) => {
    const c = row("", title);
    c[ID_COL] = id;
  };
  const count = (items) => items.reduce((acc, u) => ((acc[u.cls] = (acc[u.cls] ?? 0) + 1), acc), {});
  const usdSum = (items) => Math.round(items.reduce((s, u) => s + (num(u.r[B.usd]) ?? 0), 0) * 100) / 100;
  const tot = count(universe);
  const classLine = (c) => `FACTURABLE ${c.FACTURABLE ?? 0} · REVISIÓN ${c.REQUIERE_REVISION ?? 0} · BLOQUEADO ${c.BLOQUEADO ?? 0} · PAGADO SIN PROPAGAR ${c.PAGADO_SIN_PROPAGAR ?? 0}`;

  const paymentsSignature = sha256(JSON.stringify(payments)).slice(0, 12);
  const decisionsSignature = sha256(JSON.stringify(decisions)).slice(0, 12);

  row(`PAGOS ${target.label} · BORRADOR · CORTE ${cutoffDate}`);
  const meta = row(
    `Motor tiviplay-monthly-close-v1 + sync-draft. Universo ${universe.length} · ${classLine(tot)} · motor ${close.signature.slice(0, 12)} · pagos ${paymentsSignature} · decisiones ${decisionsSignature} · BORRADOR NO DEFINITIVO · Columnas C, D, F, I, N, T, U vacías a propósito (sin PII ni contraseña).`,
  );
  meta[META_CUTOFF_COL] = `corte:${cutoffDate}`;
  meta[ID_COL] = `${P}-META`;
  out.push([...DRAFT_HEADERS]);

  const weekLabel = WEEK_LABEL(month);
  for (let wk = 1; wk <= 5; wk++) {
    const items = universe.filter((u) => u.week === wk).sort((a, b) => a.p.nextPaymentDate.localeCompare(b.p.nextPaymentDate) || a.n - b.n);
    sectionRow(`SEMANA ${wk} · ${weekLabel[wk]}`, `${P}-S${wk}`);
    for (const u of items) {
      const { r, p, lp } = u;
      const v = new Array(DRAFT_COLUMNS).fill("");
      Object.assign(v, {
        0: clean(r[B.tc]), 1: clean(r[B.client]), 4: clean(r[B.status]), 6: clean(r[B.plan]), 7: clean(r[B.screens]),
        9: clean(r[B.usd]), 10: clean(r[B.cop]), 11: clean(r[B.method]), 12: clean(r[B.user]), 14: clean(r[B.panel]),
        15: clean(r[B.due]), 16: clean(r[B.last]), 17: p.nextPaymentDate, 18: clean(r[B.t]), 21: `BASE GENERAL!${u.n}`,
        30: u.tv, 32: u.week, 33: u.cls, 34: u.cat, 35: u.cause, 36: u.owner, 37: `${P}-B${u.n}`,
      });
      if (lp) Object.assign(v, { 22: lp.confirmation, 24: lp.matches, 25: lp.source, 26: lp.row, 27: lp.paymentDate ?? "", 28: lp.currency, 29: lp.amount, 31: lp.confirmation });
      out.push(v);
    }
    const c = row("", `SUBTOTAL SEMANA ${wk}: ${items.length} fichas · ${classLine(count(items))}`);
    c[9] = usdSum(items);
    c[ID_COL] = `${P}-T${wk}`;
    row();
  }
  const total = row("", `TOTAL ${target.label}: ${universe.length} fichas · ${classLine(tot)}`);
  total[9] = usdSum(universe);
  total[ID_COL] = `${P}-TOTAL`;
  row();

  sectionRow("AJUSTES POR PAGOS CONFIRMADOS NO PROPAGADOS A BASE (no cambian BASE; BO propaga)", `${P}-SEC-AJ`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "FUENTE", "FILA_FUENTE", "FECHA_PAGO", "VALOR", "CONFIRMACION", "PROP_F_PROXIMO", "F. PRÓX BASE", "EFECTO EN EL MES");
  for (const a of adjustments) {
    row(`${P}-AJ${a.n}`, a.n, `BASE GENERAL!${a.n}`, a.lp.source, a.lp.row, a.lp.paymentDate ?? "", a.lp.amount, a.lp.confirmation, a.lp.proposedNext, a.baseNext ?? "", a.effect);
  }
  row();

  sectionRow("PAGOS SIN ENLACE ÚNICO A BASE O SIN CONFIRMAR (pueden cambiar el universo; sin nombres)", `${P}-SEC-PG`);
  row("ID", "FUENTE", "FILA_FUENTE", "FECHA_PAGO", "VALOR", "CONFIRMACION", "COINCIDENCIAS_BASE", "ESTADO_ENLACE", "ACCIÓN", "RESPONSABLE");
  for (const p of pending) {
    let action;
    let owner;
    if (!isConfirmed(p)) [action, owner] = [p.confirmation ? "Confirmar o rechazar" : "Registrar CONFIRMACION", "DIRECCIÓN"];
    else if (!p.matches || p.matches === "0") [action, owner] = ["Alta de ficha o enlace (P0-3)", "BO"];
    else [action, owner] = [`Elegir la ficha correcta entre ${p.matches} coincidencias`, "BO"];
    const src = p.source.replace(/[^A-Z]/gi, "").toUpperCase();
    row(`${P}-PG-${src}${p.row}`, p.source, p.row, p.paymentDate ?? "", p.amount, p.confirmation || "(vacío)", p.matches, p.link, action, owner);
  }
  row();

  sectionRow("BLOQUEADOS FUERA DEL UNIVERSO MENSUAL", `${P}-SEC-BQ`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "CAUSA", "RESPONSABLE");
  for (const b of blocked) row(`${P}-BQ${b.n}`, b.n, `BASE GENERAL!${b.n}`, b.cause, "BO (F. PRÓX) → DIRECCIÓN si cambia tarifa");
  row();

  sectionRow("CARTERA VENCIDA · SEPARADA DEL UNIVERSO MENSUAL", `${P}-SEC-CV`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "SECCIÓN", "CLIENTE", "USUARIO", "ESTADO", "F. ÚLTIMO PAGO", "F. PRÓXIMO PAGO", "MES", "DÍAS VENCIDO AL CORTE", "SUBESTADO", "NOTA");
  for (const c of cartera) {
    const r = R(c.n);
    row(`${P}-CV${c.n}`, c.n, c.c.origin, c.section, clean(r[B.client]), clean(r[B.user]), clean(r[B.status]), clean(r[B.last]), c.c.nextPaymentDate, c.c.dueMonth, c.c.daysPastDue ?? "", c.sub, c.note);
  }
  row();

  sectionRow("EXCLUIDOS CON CAUSA VERIFICABLE · TC_0 = ficha no facturable · SECCION_HISTORICA_TC1 = TC 1 en sección de baja/excepción", `${P}-SEC-EX`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "SECCIÓN", "TC", "F. PRÓXIMO PAGO", "CAUSA");
  for (const e of excluded) row(`${P}-EX${e.n}`, e.n, `BASE GENERAL!${e.n}`, e.section, e.tc, e.next, e.cause);
  row();

  sectionRow("VALIDACIÓN Y CONTROL", `${P}-SEC-VA`);
  const validationStart = out.length;
  const facturableWeeks = [1, 2, 3, 4, 5].map((w) => universe.filter((u) => u.week === w && u.cls === "FACTURABLE").length);
  row("", "Universo motor", `${close.total} fichas · semanas ${close.weeks.join("/")} · duplicados ${close.duplicates.length} · firma ${close.signature.slice(0, 12)}`);
  row("", "Clasificación", `${classLine(tot)} · facturable por semana ${facturableWeeks.join("/")} · cartera ${cartera.length} · excluidos ${excluded.length} · pagos pendientes ${pending.length}`);
  row("", "Fechas", universe.every((u) => u.p.nextPaymentDate.slice(0, 7) === month) ? `Todas dentro de ${month}` : "REVISAR");
  row("", "Idempotencia", "");
  row("", "Sincronización", "sync-draft: recalcula con fecha de corte explícita y reescribe solo este rango; segunda ejecución sin cambios = sin escritura.");
  row("", "Gate", "NO APTO PARA MOTOR MENSUAL mientras existan P0 abiertos. Este borrador no es cierre definitivo.");

  const ids = [];
  for (const r of out) {
    if (r[ID_COL]) ids.push(r[ID_COL]);
    if (String(r[0]).startsWith(`${P}-`)) ids.push(r[0]);
  }
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`ID_BORRADOR duplicado: ${[...new Set(dup)].join(", ")}`);
  out[validationStart + 3][2] = `Clave ID_BORRADOR única (${ids.length} ids, 0 duplicados). Escritura sobre rango fijo A1:AL${out.length}; el resto del rango se limpia.`;

  const values = out.map((r) => r.map(normalizeCell));
  const signature = contentSignature(values);
  values[META_ROW - 1][META_SIGNATURE_COL] = `firma:${signature}`;

  return {
    values,
    signature,
    ids,
    summary: {
      targetMonth: month,
      cutoffDate,
      universe: universe.length,
      weeks: close.weeks,
      classes: { FACTURABLE: tot.FACTURABLE ?? 0, REQUIERE_REVISION: tot.REQUIERE_REVISION ?? 0, BLOQUEADO: tot.BLOQUEADO ?? 0, PAGADO_SIN_PROPAGAR: tot.PAGADO_SIN_PROPAGAR ?? 0 },
      facturableWeeks,
      cartera: cartera.length,
      excluded: excluded.length,
      pendingPayments: pending.length,
      adjustments: adjustments.length,
      blocked: blocked.length,
      rows: values.length,
    },
    classByRow: Object.fromEntries(universe.map((u) => [u.n, u.cls])),
  };
}

export function normalizeCell(value) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  return String(value);
}

/** Firma del contenido con la celda de firma en blanco y sin celdas vacías finales (forma de la API). */
export function contentSignature(values) {
  const rows = values.map((r, i) => {
    const copy = r.map((c) => (typeof c === "number" ? String(c) : normalizeCell(c)));
    if (i === META_ROW - 1 && copy.length > META_SIGNATURE_COL) copy[META_SIGNATURE_COL] = "";
    while (copy.length && copy[copy.length - 1] === "") copy.pop();
    return copy;
  });
  while (rows.length && rows[rows.length - 1].length === 0) rows.pop();
  return sha256(JSON.stringify(rows));
}

export function storedSignature(values) {
  const cell = String(values?.[META_ROW - 1]?.[META_SIGNATURE_COL] ?? "");
  return cell.startsWith("firma:") ? cell.slice(6) : null;
}
