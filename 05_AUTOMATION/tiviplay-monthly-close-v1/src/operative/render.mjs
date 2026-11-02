import crypto from "node:crypto";
import { parseOperationalDate } from "../core.mjs";
import { isConfirmed } from "../draft/payments.mjs";
import { COL, OPERATIVE_HEADERS, OPERATIVE_WIDTH, OUT_OF_SHEET_CLASSES, PASSWORD_COL, ROW_KIND } from "./contract.mjs";

const clean = (v) => String(v ?? "").trim();
const canon = (v) => clean(v).toLocaleUpperCase("es").replace(/\s+/g, " ");
const num = (v) => {
  const n = Number(clean(v).replace(/[$,\s]/g, ""));
  return clean(v) && Number.isFinite(n) ? n : null;
};
const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MONTH_NAMES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

export const isMiraPlus = (sectionLabel) => /MIRA/.test(canon(sectionLabel));

function weekLabels(month) {
  const [y, m] = month.split("-").map(Number);
  const end = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const ab = MONTHS[m - 1];
  return { 1: `01–04 ${ab}`, 2: `05–11 ${ab}`, 3: `12–18 ${ab}`, 4: `19–25 ${ab}`, 5: `26–${end} ${ab}` };
}

const isoOrText = (value) => parseOperationalDate(clean(value)) ?? clean(value);

/**
 * Planilla operativa del asesor a partir del modelo de buildDraft. Función pura y determinista.
 *
 * - panel: Map<filaBase, { id, reason, expiration }> de reconcilePanelIds (opcional).
 * - secrets: Map<filaBase, { user, secret }> (opcional). Solo se usa para llenar N cuando el USUARIO
 *   de la fila coincide; nunca entra en la firma, en el resumen ni en las excepciones.
 * - sectionOf: (filaBase) => { label } para separar MIRA+.
 */
export function renderOperative({ model, panel = new Map(), secrets = null, sectionOf = () => ({ label: "" }) }) {
  const { month, cutoffDate, prefix: P, B } = model;
  const [yy, mo] = month.split("-");
  const lastDay = new Date(Date.UTC(Number(yy), Number(mo), 0)).getUTCDate();
  const labels = weekLabels(month);
  const exceptions = [];
  const exc = (e) => exceptions.push({ id: e.id, baseRow: e.baseRow ?? "", code: e.code, problem: e.problem, evidence: e.evidence ?? "", owner: e.owner, action: e.action });

  const inSheet = [];
  for (const u of model.universe) {
    const n = u.n;
    const user = clean(u.r[B.user]);
    if (isMiraPlus(sectionOf(n).label)) {
      exc({ id: `${P}-B${n}`, baseRow: n, code: "MIRA_PLUS", problem: "Ficha de la sección MIRA+ en BASE GENERAL: no se incorpora a la hoja TIVIPLAY.", evidence: `Sección «${sectionOf(n).label}» · USUARIO ${user}`, owner: "DIRECCIÓN", action: "Confirmar si la operación es MIRA+ (se cobra fuera de TIVIPLAY) o reclasificar en BASE con evidencia." });
      continue;
    }
    if (OUT_OF_SHEET_CLASSES.has(u.cls)) {
      const paid = u.cls === "PAGADO_SIN_PROPAGAR";
      exc({
        id: `${P}-B${n}`, baseRow: n, code: u.cls, problem: paid ? "Ya pagó: el próximo cobro comercial cae después del mes." : "Bloqueada por decisión registrada.",
        evidence: u.cause, owner: u.owner, action: paid ? `Propagar F. PRÓXIMO PAGO ${u.lp?.proposedNext ?? ""} en BASE GENERAL fila ${n}. No cobrar en ${month}.` : "Resolver el bloqueo según la decisión registrada antes de cobrar.",
      });
      continue;
    }
    inSheet.push(u);
    if (u.cls === "REQUIERE_REVISION") {
      exc({ id: `${P}-B${n}`, baseRow: n, code: `REVISION · ${u.cat}`, problem: "La ficha se cobra en el mes, pero tiene una condición por verificar.", evidence: u.cause, owner: u.owner, action: "Verificar y resolver en la fuente (BASE / pagos). La ficha sigue en la hoja del asesor." });
    }
  }

  /* ------------------------------------------------------------ filas */
  const rows = [];
  const push = (kind, cells, id) => {
    const values = [...cells, ...new Array(OPERATIVE_WIDTH).fill("")].slice(0, OPERATIVE_WIDTH);
    rows.push({ kind, id, values });
    return values;
  };
  const usdSum = (items) => Math.round(items.reduce((s, u) => s + (num(u.r[B.usd]) ?? 0), 0) * 100) / 100;
  const copSum = (items) => Math.round(items.reduce((s, u) => s + (num(u.r[B.cop]) ?? 0), 0) * 100) / 100;
  const fmt = (n) => n.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  const ddmmyyyy = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

  push(ROW_KIND.TITLE, ["", `PAGOS ${MONTH_NAMES[Number(mo) - 1]} ${yy} · CORTE BASE GENERAL ${ddmmyyyy(cutoffDate)}`], `${P}-TITULO`);
  push(ROW_KIND.SUMMARY, ["", `F. PRÓXIMO PAGO 01–${lastDay}/${mo}/${yy} · ${inSheet.length} fichas · USD ${fmt(usdSum(inSheet))} + COP ${fmt(copSum(inSheet))}. Metas y recaudo se concilian por separado.`], `${P}-RESUMEN`);
  push(ROW_KIND.HEADER, OPERATIVE_HEADERS, `${P}-ENCABEZADO`);

  let filled = 0;
  let mismatched = 0;
  const weeks = [];
  for (let wk = 1; wk <= 5; wk++) {
    const items = inSheet.filter((u) => u.week === wk).sort((a, b) => a.p.nextPaymentDate.localeCompare(b.p.nextPaymentDate) || a.n - b.n);
    weeks.push(items.length);
    push(ROW_KIND.WEEK, ["", `SEMANA ${wk} · ${labels[wk]}`], `${P}-S${wk}`);
    for (const u of items) {
      const { r, n, lp } = u;
      const user = clean(r[B.user]);
      const paidInPrevious = lp && isConfirmed(lp) && lp.paymentDate && lp.paymentDate < cutoffDate;
      const v = new Array(OPERATIVE_WIDTH).fill("");
      v[COL.TC] = clean(r[B.tc]);
      v[COL.CLIENTE] = clean(r[B.client]);
      v[COL.TELEFONO] = clean(r[B.phone]);
      v[COL.CORREO] = clean(r[B.email]);
      // Estado real: si la fecha comercial salió de un pago confirmado (BASE sin propagar), la ficha está por vencer en el mes.
      v[COL.ESTADO] = u.moved ? "Por vencer" : clean(r[B.status]);
      v[COL.OBSERVACIONES] = clean(r[B.notes]);
      v[COL["PLAN ACTIVO"]] = clean(r[B.plan]);
      v[COL.PANTALLAS] = clean(r[B.screens]);
      v[COL.CELULAR] = clean(r[B.cell]);
      v[COL.USD] = num(r[B.usd]) ?? clean(r[B.usd]);
      v[COL.COP] = num(r[B.cop]) ?? clean(r[B.cop]);
      v[COL["MÉTODO DE PAGO"]] = clean(r[B.method]);
      v[COL.USUARIO] = user;
      v[COL.PANEL] = clean(r[B.panel]);
      v[COL["F.VENCIMIENTO"]] = isoOrText(r[B.due]);
      v[COL.DISPOSITIVOS] = clean(r[B.devices]);
      v[COL["F.ULTIMO PAGO"]] = paidInPrevious ? lp.paymentDate : isoOrText(r[B.last]);
      v[COL["F. PRÓXIMO PAGO"]] = u.p.nextPaymentDate;
      v[COL.T] = clean(r[B.t]);

      const baseId = clean(r[B.id]);
      const pm = panel.get(n);
      if (baseId && (!pm || !pm.id || pm.id === baseId)) v[COL.ID] = baseId;
      else if (!baseId && pm?.id) v[COL.ID] = pm.id;
      else if (baseId && pm?.id && pm.id !== baseId) {
        exc({ id: `${P}-B${n}`, baseRow: n, code: "ID_CONFLICTO", problem: "El ID de BASE no coincide con el ID único del panel para el mismo USUARIO.", evidence: `BASE M=${baseId} · PANELES Id=${pm.id} · USUARIO ${user}`, owner: "BACK OFFICE", action: "Verificar en el panel cuál cuenta está vigente y corregir BASE GENERAL!M. Hasta entonces la columna ID queda vacía." });
      }
      if (!v[COL.ID] && pm?.reason) {
        exc({ id: `${P}-B${n}`, baseRow: n, code: pm.reason, problem: "Sin ID técnico inequívoco para la ficha.", evidence: pm.evidence ?? `USUARIO ${user}`, owner: "BACK OFFICE", action: pm.action ?? "Identificar la cuenta vigente en el panel y registrar su ID en BASE GENERAL!M." });
      }
      if (pm?.expiration && pm.id && pm.expiration < u.p.nextPaymentDate) {
        exc({ id: `${P}-B${n}`, baseRow: n, code: "FECHA_TECNICA_ANTES_DE_COMERCIAL", problem: "La cuenta técnica vence antes del próximo cobro comercial.", evidence: `PANELES Expiration ${pm.expiration} · F. PRÓXIMO PAGO comercial ${u.p.nextPaymentDate} · ID ${pm.id}`, owner: "BACK OFFICE", action: "Verificar si existe otra cuenta vigente asociada antes de pedir liberación de crédito. No pedir crédito por una cuenta ya vencida." });
      }

      if (secrets) {
        const s = secrets.get(n);
        if (s && canon(s.user) === canon(user) && s.secret) {
          v[PASSWORD_COL] = s.secret;
          filled += 1;
        } else if (s && canon(s.user) !== canon(user)) mismatched += 1;
      }
      rows.push({ kind: ROW_KIND.FICHA, id: `${P}-B${n}`, values: v, baseRow: n, cls: u.cls });
    }
    const t = push(ROW_KIND.WEEK_TOTAL, [items.length, `TOTAL SEMANA ${wk}`], `${P}-T${wk}`);
    t[COL.USD] = usdSum(items);
    t[COL.COP] = copSum(items);
  }
  const total = push(ROW_KIND.TOTAL, [inSheet.length, `TOTAL VENCIMIENTOS ${MONTH_NAMES[Number(mo) - 1]} · NO META`], `${P}-TOTAL`);
  total[COL.USD] = usdSum(inSheet);
  total[COL.COP] = copSum(inSheet);

  /* ------------------------------------------- excepciones fuera de ficha */
  for (const b of model.blocked) {
    exc({ id: `${P}-BQ${b.n}`, baseRow: b.n, code: "SIN_F_PROXIMO_PAGO", problem: "TC=1 sin F. PRÓXIMO PAGO interpretable: fuera del universo.", evidence: b.cause, owner: "BACK OFFICE", action: `Registrar F. PRÓXIMO PAGO en BASE GENERAL fila ${b.n}.` });
  }
  for (const p of model.pending) {
    const src = p.source.replace(/[^A-Z]/gi, "").toUpperCase();
    const confirmed = isConfirmed(p);
    exc({
      id: `${P}-PG-${src}${p.row}`, baseRow: p.baseRow ?? "", code: confirmed ? "PAGO_SIN_ENLACE_UNICO" : "PAGO_SIN_CONFIRMAR",
      problem: confirmed ? "Pago confirmado sin enlace único a una ficha." : "Pago sin CONFIRMADO JM: no mueve fechas.",
      evidence: `${p.source} fila ${p.row} · ${p.paymentDate ?? "sin fecha"} · ${p.currency} ${p.amount} · coincidencias ${p.matches || "0"} · ${p.link || "sin estado"}`,
      owner: confirmed ? "BACK OFFICE" : "DIRECCIÓN",
      action: confirmed ? "Enlazar el pago con la ficha correcta (FILA_BASE) o dar de alta la ficha." : "Confirmar o rechazar el pago en la hoja de pagos.",
    });
  }
  exceptions.sort((a, b) => String(a.code).localeCompare(String(b.code)) || String(a.id).localeCompare(String(b.id), "es", { numeric: true }));

  const ids = rows.map((r) => r.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`ID de fila duplicado en la planilla operativa: ${[...new Set(dup)].join(", ")}`);

  return {
    rows,
    signature: operativeSignature(rows),
    exceptions,
    summary: {
      month, cutoffDate, fichas: inSheet.length, weeks, rows: rows.length,
      usd: usdSum(inSheet), cop: copSum(inSheet),
      classes: inSheet.reduce((acc, u) => ((acc[u.cls] = (acc[u.cls] ?? 0) + 1), acc), {}),
      outOfSheet: model.universe.length - inSheet.length,
      withId: rows.filter((r) => r.kind === ROW_KIND.FICHA && r.values[COL.ID]).length,
      withDevices: rows.filter((r) => r.kind === ROW_KIND.FICHA && r.values[COL.DISPOSITIVOS]).length,
      passwords: secrets ? { filled, mismatched, empty: inSheet.length - filled } : null,
      exceptions: exceptions.reduce((acc, e) => ((acc[e.code.split(" · ")[0]] = (acc[e.code.split(" · ")[0]] ?? 0) + 1), acc), {}),
    },
  };
}

/** Firma de la planilla con CONTRASEÑA en blanco: idéntica con o sin contraseñas, y nunca las expone. */
export function operativeSignature(rows) {
  const data = rows.map((r) => r.values.map((c, i) => (i === PASSWORD_COL && r.kind === ROW_KIND.FICHA ? "" : typeof c === "number" ? String(c) : clean(c))));
  return sha256(JSON.stringify(data));
}
