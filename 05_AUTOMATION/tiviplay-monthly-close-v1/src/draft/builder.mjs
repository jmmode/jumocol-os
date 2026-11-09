import crypto from "node:crypto";

import { monthBounds, parseOperationalDate, weekBucket } from "../core.mjs";
import {
  DRAFT_COLUMNS,
  DRAFT_HEADERS,
  ID_COL,
  INITIAL_COLLECTION_STATE,
  MANAGED_COLUMNS,
  META_CUTOFF_COL,
  META_ROW,
  META_SIGNATURE_COL,
  draftTarget,
} from "./contract.mjs";
import { isConfirmed, isUniquelyLinked, linkPaymentsByBaseRow, shortSource } from "./payments.mjs";

const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");
export const normalizeTechnicalUser = (value) => {
  let user = clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase("es").replace(/\s+/g, "");
  let previous;
  do {
    previous = user;
    user = user.replace(/^(?:VENCIO|LIBERADO)\//, "");
  } while (user !== previous);
  return user;
};
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
  // Mismo rótulo que PAGOS OCTUBRE 2026 («SEMANA 1 · 01–04 OCT»).
  const ab = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"][m - 1];
  return { 1: `01–04 ${ab}`, 2: `05–11 ${ab}`, 3: `12–18 ${ab}`, 4: `19–25 ${ab}`, 5: `26–${end} ${ab}` };
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
    const key = normalizeTechnicalUser(R(n)[B.user]);
    if (key && clean(R(n)[B.tc]) === "1" && !sectionOf(n).historical) users.set(key, [...(users.get(key) ?? []), n]);
  }
  const identityOf = (n) => {
    const key = normalizeTechnicalUser(R(n)[B.user]);
    const rows = key ? (users.get(key) ?? []) : [];
    return { key, rows, unique: !!key && rows.length === 1 };
  };
  const othersWithUser = (n) => identityOf(n).rows.filter((x) => x !== n);
  const originOf = (n) => {
    const identity = identityOf(n);
    return identity.unique ? `BASE GENERAL!${identity.rows[0]}` : "";
  };
  const stableClientId = (kind, n) => {
    const identity = identityOf(n);
    return identity.unique ? `${P}-${kind}U${sha256(identity.key).slice(0, 12)}` : `${P}-${kind}B${n}`;
  };

  /* ------------------------------------------------------------ universo */
  const universe = [];
  const excluded = [];
  // Secciones históricas (bajas, ventas en excepción): un renglón por sección con su rango de filas.
  const historical = new Map();
  const addHistorical = (n) => {
    const label = sectionOf(n).label || "HISTÓRICO";
    const h = historical.get(label) ?? { label, from: n, to: n, count: 0 };
    h.from = Math.min(h.from, n);
    h.to = Math.max(h.to, n);
    h.count += 1;
    historical.set(label, h);
  };
  for (const p of close.preview) {
    const n = p.sourceRow;
    const r = R(n);
    if (sectionOf(n).historical) {
      addHistorical(n);
      continue;
    }
    const tv = tariffCheck(r);
    const lp = lastPayment(n);
    const decision = decisionOf(n);
    let cls = "FACTURABLE";
    let cat = "";
    let cause = "";
    let owner = "EQUIPO COBROS";

    if (decision?.clase) {
      ({ clase: cls, categoria: cat = "", causa: cause = "", responsable: owner = "DIRECCIÓN" } = decision);
    } else if (lp && isConfirmed(lp) && lp.proposedNext && lp.proposedNext > end) {
      cls = "PAGADO_SIN_PROPAGAR";
      cat = "CONCILIACIÓN";
      cause = `${describePayment(lp)} CONFIRMADO JM. PROP_F_PROXIMO ${lp.proposedNext}; BASE sigue en ${p.nextPaymentDate}. No facturar en el mes.`;
      owner = "BO: propagar F. PRÓXIMO PAGO";
    } else {
      const reasons = p.reviewReasons.map((x) => REASON_TEXT[x] ?? x);
      const identity = identityOf(n);
      if (!identity.key) reasons.push("USUARIO vacío: ORIGEN BASE no se emite.");
      else if (!identity.unique) reasons.push(`USUARIO técnico ambiguo tras normalización: filas ${identity.rows.join(", ")}. ORIGEN BASE no se emite.`);
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
      addHistorical(n);
      continue;
    }
    const lpc = lastPayment(n);
    // Vencida en BASE pero con pago confirmado cuyo próximo vencimiento cae en el mes: se cobra en el mes.
    // BASE no se toca; la fecha sale de PROP_F_PROXIMO del pago CONFIRMADO JM y BO la propaga.
    if (lpc && isConfirmed(lpc) && lpc.proposedNext && lpc.proposedNext.slice(0, 7) === month && !decisionOf(n)?.clase) {
      const week = weekBucket(lpc.proposedNext);
      universe.push({
        n, r: R(n), week, lp: lpc, tv: tariffCheck(R(n)), moved: c.nextPaymentDate,
        p: { sourceRow: n, week, nextPaymentDate: lpc.proposedNext, reviewReasons: [] },
        cls: "REQUIERE_REVISION",
        cat: "PROPAGACIÓN PENDIENTE",
        cause: `BASE F. PRÓXIMO PAGO ${c.nextPaymentDate} sin propagar. Vence ${lpc.proposedNext} según ${describePayment(lpc)} CONFIRMADO JM: gestionar en esa fecha. BO propaga a BASE.`,
        owner: "EQUIPO COBROS · BO propaga",
      });
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
    if (sec.historical) addHistorical(e.sourceRow);
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
    if (inUniverse.get(n)?.moved) effect = `Incluida en S${weekBucket(lp.proposedNext)} del borrador con la fecha del pago confirmado; BASE sigue en ${baseNext}.`;
    else if (inUniverse.has(n) && lp.proposedNext > end) effect = "Sale del cobro del mes (ya pagó; PAGADO_SIN_PROPAGAR).";
    else if (inUniverse.has(n)) {
      const a = weekBucket(baseNext);
      const b = weekBucket(lp.proposedNext);
      effect = a === b ? `Desfase de anclaje: BASE ${baseNext} vs pago ${lp.proposedNext} (misma semana).` : `Desfase de anclaje: BASE ${baseNext} (S${a}) vs pago ${lp.proposedNext} (S${b}). BO valida regla.`;
    } else if (lp.proposedNext.slice(0, 7) === month) effect = `Entra al mes S${weekBucket(lp.proposedNext)} (${lp.proposedNext}) al propagar.`;
    else effect = `Sin efecto en el mes: sale de cartera (PROP ${lp.proposedNext}).`;
    adjustments.push({ n, lp, baseNext, effect });
  }

  const tally = { tc1: 0, tc1Historical: 0, nextMonths: 0, tc0: 0 };
  for (let n = headerIndex + 2; n <= baseRows.length; n++) {
    const tc = clean(R(n)[B.tc]);
    if (tc === "0" && !sectionOf(n).historical) tally.tc0 += 1;
    if (tc !== "1") continue;
    if (sectionOf(n).historical) {
      tally.tc1Historical += 1;
      continue;
    }
    tally.tc1 += 1;
    const d = parseOperationalDate(R(n)[B.next]);
    if (d && d > end) tally.nextMonths += 1;
  }
  const movedCount = universe.filter((u) => u.moved).length;
  const historicalTotal = [...historical.values()].reduce((t, h) => t + h.count, 0);
  const reconciled = universe.length - movedCount + (cartera.length + movedCount) + blocked.length + tally.nextMonths === tally.tc1
    && historicalTotal === tally.tc1Historical;

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
  const copSum = (items) => Math.round(items.reduce((s, u) => s + (num(u.r[B.cop]) ?? 0), 0) * 100) / 100;
  const [yy, mo] = month.split("-");
  const lastDay = new Date(Date.UTC(Number(yy), Number(mo), 0)).getUTCDate();
  const monthName = target.label.split(" ")[0];
  const ddmmyyyy = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
  const tot = count(universe);
  const classLine = (c) => `FACTURABLE ${c.FACTURABLE ?? 0} · REVISIÓN ${c.REQUIERE_REVISION ?? 0} · BLOQUEADO ${c.BLOQUEADO ?? 0} · PAGADO SIN PROPAGAR ${c.PAGADO_SIN_PROPAGAR ?? 0}`;

  const paymentsSignature = sha256(JSON.stringify(payments)).slice(0, 12);
  const decisionsSignature = sha256(JSON.stringify(decisions)).slice(0, 12);

  // Encabezado con el mismo diseño que PAGOS OCTUBRE 2026: título y resumen en la columna B.
  row("", `PAGOS ${target.label} · CORTE BASE GENERAL ${ddmmyyyy(cutoffDate)}`);
  const fmtNum = (n) => n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  const meta = row(
    "",
    `F. PRÓXIMO PAGO 01–${lastDay}/${mo}/${yy} · ${universe.length} fichas · cartera nominal USD ${fmtNum(usdSum(universe))} + COP ${fmtNum(copSum(universe))}. Metas y recaudo se concilian por separado.`,
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
        15: clean(r[B.due]), 16: clean(r[B.last]), 17: p.nextPaymentDate, 18: clean(r[B.t]), 21: originOf(u.n),
        30: u.tv, 32: u.week, 33: u.cls, 34: u.cat, 35: u.cause, 36: u.owner, 37: stableClientId("B", u.n),
        38: INITIAL_COLLECTION_STATE[u.cls],
      });
      if (lp) Object.assign(v, { 22: lp.confirmation, 24: lp.matches, 25: lp.source, 26: lp.row, 27: lp.paymentDate ?? "", 28: lp.currency, 29: lp.amount, 31: lp.confirmation });
      out.push(v);
    }
    // Consolidado como en octubre: A = fichas, J = USD, K = COP; el desglose por clase va en CAUSA / ACCIÓN.
    const c = row(items.length, `TOTAL SEMANA ${wk}`);
    c[9] = usdSum(items);
    c[10] = copSum(items);
    c[35] = `${items.length} fichas · ${classLine(count(items))}`;
    c[ID_COL] = `${P}-T${wk}`;
  }
  const total = row(universe.length, `TOTAL VENCIMIENTOS ${monthName} · NO META`);
  total[9] = usdSum(universe);
  total[10] = copSum(universe);
  total[35] = `${universe.length} fichas · ${classLine(tot)}`;
  total[ID_COL] = `${P}-TOTAL`;
  row();

  sectionRow("AJUSTES POR PAGOS CONFIRMADOS NO PROPAGADOS A BASE (no cambian BASE; BO propaga)", `${P}-SEC-AJ`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "FUENTE", "FILA_FUENTE", "FECHA_PAGO", "VALOR", "CONFIRMACION", "PROP_F_PROXIMO", "F. PRÓX BASE", "EFECTO EN EL MES");
  for (const a of adjustments) {
    row(stableClientId("AJ", a.n), a.n, originOf(a.n), a.lp.source, a.lp.row, a.lp.paymentDate ?? "", a.lp.amount, a.lp.confirmation, a.lp.proposedNext, a.baseNext ?? "", a.effect);
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
  for (const b of blocked) row(stableClientId("BQ", b.n), b.n, originOf(b.n), b.cause, "BO (F. PRÓX) → DIRECCIÓN si cambia tarifa")[38] = INITIAL_COLLECTION_STATE.BLOQUEADO;
  row();

  sectionRow("CARTERA VENCIDA · SEPARADA DEL UNIVERSO MENSUAL", `${P}-SEC-CV`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "SECCIÓN", "CLIENTE", "USUARIO", "ESTADO", "F. ÚLTIMO PAGO", "F. PRÓXIMO PAGO", "MES", "DÍAS VENCIDO AL CORTE", "SUBESTADO", "NOTA", "RESPONSABLE");
  for (const c of cartera) {
    const r = R(c.n);
    const v = row(stableClientId("CV", c.n), c.n, originOf(c.n), c.section, clean(r[B.client]), clean(r[B.user]), clean(r[B.status]), clean(r[B.last]), c.c.nextPaymentDate, c.c.dueMonth, c.c.daysPastDue ?? "", c.sub, c.note,
      /PAGADO|SALE AL MES/.test(c.sub) ? "BO: propagar pago a BASE" : /BLOQUEADO|DUPLICADO/.test(c.sub) || decisionOf(c.n) ? "BO → DIRECCIÓN" : "EQUIPO COBROS (cartera)");
    v[38] = /PAGADO/.test(c.sub) ? INITIAL_COLLECTION_STATE.PAGADO_SIN_PROPAGAR : INITIAL_COLLECTION_STATE.CARTERA;
  }
  row();

  sectionRow("EXCLUIDOS CON CAUSA VERIFICABLE · TC_0 = ficha no facturable · SECCION_HISTORICA_TC1 = TC 1 en sección de baja/excepción", `${P}-SEC-EX`);
  row("ID", "FILA_BASE", "ORIGEN BASE", "SECCIÓN", "TC", "F. PRÓXIMO PAGO", "CAUSA");
  for (const e of excluded) row(stableClientId("EX", e.n), e.n, originOf(e.n), e.section, e.tc, e.next, e.cause);
  for (const h of [...historical.values()].sort((a, b) => a.from - b.from)) {
    row(`${P}-EXH${h.from}`, `${h.from}–${h.to}`, `BASE GENERAL!${h.from}:${h.to}`, h.label, `TC=1 × ${h.count}`, "", "SECCION_HISTORICA_TC1: baja o venta en excepción; no se cobra en el ciclo");
  }
  row();

  sectionRow("PROCEDIMIENTO PARA MOVIMIENTOS POSTERIORES AL CORTE", `${P}-SEC-PR`);
  [
    "Pago recibido: el asesor lo registra en la hoja de pagos del mes (ZELLE / PAYPAL / TRANSF), como en octubre. No se anota el pago en BASE ni en esta hoja como confirmado.",
    "Confirmación: solo Dirección marca CONFIRMADO JM en la hoja de pagos. Nadie más la escribe.",
    "Gestión: el equipo actualiza aquí ESTADO_COBRO (PENDIENTE → CONTACTADO → PAGO REPORTADO → COBRADO / NO RENUEVA), FECHA_GESTION, GESTIONADO_POR y NOTA_EQUIPO (columnas AM:AP). No borrar ni mover filas.",
    "Propagación: BO actualiza F. PRÓXIMO PAGO en BASE GENERAL con el pago confirmado, como hoy.",
    "Regeneración: el borrador se recalcula desde BASE y pagos (ensayo, revisión del diff y escritura solo en esta hoja). Las columnas del equipo se conservan por ID_BORRADOR.",
    "Altas, bajas o fechas corregidas en BASE entran en la siguiente regeneración. Las excepciones (tarifa, identidad, duplicados) las resuelve el RESPONSABLE de la fila; tarifa e identidad las decide Dirección.",
  ].forEach((text, i) => row(`${P}-PR${i + 1}`, `Paso ${i + 1}`, text));
  row();

  sectionRow("VALIDACIÓN Y CONTROL", `${P}-SEC-VA`);
  const validationStart = out.length;
  const facturableWeeks = [1, 2, 3, 4, 5].map((w) => universe.filter((u) => u.week === w && u.cls === "FACTURABLE").length);
  row("", "Universo motor", `${close.total} fichas · semanas ${close.weeks.join("/")} · duplicados ${close.duplicates.length} · firma ${close.signature.slice(0, 12)}`);
  row("", "Clasificación", `${classLine(tot)} · facturable por semana ${facturableWeeks.join("/")} · cartera ${cartera.length} · excluidos ${excluded.length} · pagos pendientes ${pending.length}`);
  row("", "Fechas", universe.every((u) => u.p.nextPaymentDate.slice(0, 7) === month) ? `Todas dentro de ${month}` : "REVISAR");
  row("", "Idempotencia", "");
  row("", "Cuadre con BASE", `${reconciled ? "OK" : "REVISAR"} · TC=1 operativas ${tally.tc1} = universo ${universe.length - movedCount} + cartera ${cartera.length + movedCount} (de ellas ${movedCount} incluidas en el mes por pago confirmado) + sin F. PRÓX ${blocked.length} + vencen después del mes ${tally.nextMonths} · TC=1 en secciones históricas ${tally.tc1Historical} (excluidas por sección) · TC=0 operativas ${tally.tc0} (excluidas fila a fila)`);
  row("", "Sincronización", "Columnas AM:AP son del equipo y se conservan por ID_BORRADOR al regenerar. A:AL las calcula el motor: no editarlas a mano.");
  row("", "Gate", "NO APTO PARA MOTOR MENSUAL mientras existan P0 abiertos. Este borrador no es cierre definitivo.");
  row("", "Trazabilidad", `Motor tiviplay-monthly-close-v1 + sync-draft · corte ${cutoffDate} · motor ${close.signature.slice(0, 12)} · pagos ${paymentsSignature} · decisiones ${decisionsSignature} · Columnas C, D, F, I, N, T, U vacías a propósito (sin PII ni contraseña).`);

  const ids = [];
  for (const r of out) {
    if (r[ID_COL]) ids.push(r[ID_COL]);
    if (String(r[0]).startsWith(`${P}-`)) ids.push(r[0]);
  }
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`ID_BORRADOR duplicado: ${[...new Set(dup)].join(", ")}`);
  out[validationStart + 3][2] = `Clave ID_BORRADOR única (${ids.length} ids, 0 duplicados). Escritura sobre rango fijo A1:AP${out.length}; el resto del rango se limpia.`;

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
      weeks: [1, 2, 3, 4, 5].map((w) => universe.filter((u) => u.week === w).length),
      motorWeeks: close.weeks,
      classes: { FACTURABLE: tot.FACTURABLE ?? 0, REQUIERE_REVISION: tot.REQUIERE_REVISION ?? 0, BLOQUEADO: tot.BLOQUEADO ?? 0, PAGADO_SIN_PROPAGAR: tot.PAGADO_SIN_PROPAGAR ?? 0 },
      facturableWeeks,
      cartera: cartera.length,
      excluded: excluded.length,
      pendingPayments: pending.length,
      adjustments: adjustments.length,
      movedFromCartera: movedCount,
      historicalSections: historical.size,
      tally,
      reconciled,
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
  return signatureOf(values, MANAGED_COLUMNS);
}

/** Firma de toda la hoja (incluye columnas del equipo): detecta ediciones concurrentes. */
export function fullSignature(values) {
  return signatureOf(values, Infinity);
}

function signatureOf(values, width) {
  const rows = values.map((r, i) => {
    const copy = r.slice(0, width).map((c) => (typeof c === "number" ? String(c) : normalizeCell(c)));
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
