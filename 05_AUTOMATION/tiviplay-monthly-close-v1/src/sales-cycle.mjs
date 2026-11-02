// Ciclo comercial TIVIPLAY: VENTAS (mes) × pagos CONFIRMADO JM × CONTROL × BASE GENERAL.
// Reglas: TIVIPLAY_REGLAS_CIRCUITO_COMERCIAL_Y_CIERRE_MENSUAL_V1_0_2026-11-01 (§2–§5).
// - Solo lectura y determinístico: nunca genera ni infiere CONFIRMADO JM.
// - El plan, la duración y las pantallas vendidas salen de VENTAS, nunca del importe.
// - Las columnas con encabezado sensible (CONTRASEÑA) se eliminan antes de procesar.
// - La salida no contiene nombres, teléfonos ni correos: solo referencias de fila.
import { isSensitiveHeader, parseOperationalDate } from "./core.mjs";

const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");
const strip = (value) => canon(value).normalize("NFD").replace(/[̀-ͯ]/g, "");

export const CONFIRMED = "CONFIRMADO JM";

/** Promociones excepcionales v1 (DEC-2026-11-01-025). No reemplazan el catálogo. */
export const PROMOTIONS = [
  { code: "PROMO_ANUAL_70", usd: 70, months: 12, screens: 3, until: null },
  { code: "PROMO_MENSUAL_10", usd: 10, months: 1, screens: null, until: "2026-10-31" },
];

function headerIndex(row) {
  const map = new Map();
  (row ?? []).forEach((value, index) => {
    const key = strip(value);
    if (key && !map.has(key)) map.set(key, index);
  });
  return map;
}

function findHeaderRow(rows, required) {
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const h = headerIndex(rows[i]);
    if (required.every((alias) => [].concat(alias).some((a) => h.has(strip(a))))) return i;
  }
  return -1;
}

function col(h, aliases) {
  for (const alias of aliases) {
    const key = strip(alias);
    if (h.has(key)) return h.get(key);
  }
  return null;
}

/** Tabla con encabezado resuelto por texto y columnas sensibles eliminadas. */
export function readTable(rows, required, aliases) {
  const headerRow = findHeaderRow(rows ?? [], required);
  if (headerRow < 0) throw new Error(`Encabezado no encontrado: ${required.flat().join(", ")}`);
  const header = rows[headerRow] ?? [];
  const sensitive = new Set(header.map((v, i) => (isSensitiveHeader(v) ? i : -1)).filter((i) => i >= 0));
  const h = headerIndex(header.map((v, i) => (sensitive.has(i) ? "" : v)));
  const idx = Object.fromEntries(Object.entries(aliases).map(([k, a]) => [k, col(h, a)]));
  const records = [];
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const rec = { row: i + 1 };
    for (const [k, j] of Object.entries(idx)) rec[k] = j == null || sensitive.has(j) ? "" : clean(row[j]);
    records.push(rec);
  }
  return { headerRow: headerRow + 1, columns: idx, records };
}

export function parseAmount(value) {
  const s = clean(value).replace(/[^\d.,-]/g, "");
  if (!s) return null;
  const normalized = s.includes(",") && s.includes(".") ? s.replace(/,/g, "") : s.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** «PLAN 12 MESES+2» → { months: 12, bonus: 2 }; «PLAN 1 MES» → { months: 1, bonus: 0 }. */
export function parsePlan(value) {
  const m = strip(value).match(/(\d+)\s*MES(?:ES)?\s*(?:\+\s*(\d+))?/);
  if (!m) return null;
  return { months: Number(m[1]), bonus: m[2] ? Number(m[2]) : 0 };
}

export function addMonths(iso, months) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** Serial de Google Sheets (días desde 1899-12-30). */
export function toSerial(iso) {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86400000);
}

function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

function parseDateLoose(value) {
  return parseOperationalDate(clean(value).split(/\s+/)[0]);
}

/** Hoja de medio de pago según el MÉTODO DE PAGO registrado en VENTAS. */
export function paymentSheetFor(method) {
  const m = strip(method);
  if (m.includes("ZELLE")) return "ZELLE";
  if (m.includes("PAYPAL")) return "PAYPAL";
  return m ? "TRANSF" : null;
}

function catalogPrice(catalog, months, screens) {
  const hit = catalog.find((c) => c.months === months && c.screens === screens);
  return hit ? hit.usd : null;
}

function readPayments(sheet, rows) {
  const t = readTable(rows, [["CONFIRMACION"], ["ORIGEN"]], {
    tc: ["TC"],
    amount: sheet === "TRANSF" ? ["USD"] : ["MONTO RECIBIDO"],
    date: sheet === "PAYPAL" ? ["FECHA DE RECIBIDO"] : ["FECHA"],
    origin: ["ORIGEN"],
    confirmation: ["CONFIRMACION"],
    baseRow: ["FILA_BASE"],
    link: ["ESTADO_ENLACE"],
  });
  return t.records
    .filter((r) => r.amount || r.date)
    .map((r) => ({ ...r, sheet, usd: parseAmount(r.amount), iso: parseDateLoose(r.date), ref: `${sheet}!${r.row}` }));
}

function readBase(rows, operativeMaxRow) {
  const t = readTable(rows, [["TC"], ["USUARIO"]], {
    tc: ["TC"],
    status: ["ESTADO"],
    plan: ["PLAN ACTIVO"],
    user: ["USUARIO"],
    panel: ["PANEL"],
    next: ["F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"],
    mark: ["CONCILIACION_SERVICIO_27OCT"],
  });
  return t.records
    .filter((r) => r.tc === "0" || r.tc === "1")
    .map((r) => ({ ...r, operative: r.row <= operativeMaxRow, nextIso: parseDateLoose(r.next) }));
}

function readControl(sets) {
  const out = [];
  for (const [panel, rows] of Object.entries(sets ?? {})) {
    const t = readTable(rows, [["USUARIO"], ["FECHA"]], {
      tc: ["TC"],
      user: ["USUARIO"],
      date: ["FECHA"],
      expiry: ["F.VENCIMIENTO"],
      origin: ["ORIGEN"],
      credit: ["CREDITO"],
      recharge: ["RECARGA"],
    });
    for (const r of t.records) if (r.user) out.push({ ...r, ref: `${panel}!${r.row}`, iso: parseDateLoose(r.date) });
  }
  return out;
}

/**
 * Cruza las ventas del mes con su pago confirmado, la evidencia técnica y BASE.
 * options:
 *  - catalog: [{ months, screens, usd }] (CATALOGO_TARIFAS_VIGENTE).
 *  - anchor: "PAGO" | "ACTIVACION" | null — D1; null = sin ratificar (bloquea escrituras).
 *  - operativeMaxRow: última fila operativa de BASE (secciones históricas después).
 *  - approved: { [paymentRef]: [códigos de bloqueo resueltos por Dirección/BO] }.
 */
export function buildSalesCycle({ salesRows, payments, control, baseRows }, options = {}) {
  const catalog = options.catalog ?? [];
  const anchor = options.anchor ?? null;
  const operativeMaxRow = options.operativeMaxRow ?? Number.MAX_SAFE_INTEGER;
  const approved = options.approved ?? {};

  const sales = readTable(salesRows, [["TC"], ["CONCEPTO"], ["USUARIO"]], {
    tc: ["TC"],
    concept: ["CONCEPTO"],
    origin: ["ORIGEN"],
    user: ["USUARIO"],
    panel: ["PANEL"],
    expiry: ["F.VENCIMIENTO"],
    plan: ["PLAN ACTIVO"],
    screens: ["PANTALLAS"],
    usd: ["USD"],
    method: ["MÉTODO DE PAGO", "METODO DE PAGO"],
    last: ["F.ULTIMO PAGO", "F. ÚLTIMO PAGO"],
    next: ["F.PRÓXIMO PAGO", "F. PRÓXIMO PAGO"],
  });
  const pay = Object.entries(payments ?? {}).flatMap(([sheet, rows]) => readPayments(sheet, rows));
  const ctl = readControl(control);
  const base = readBase(baseRows, operativeMaxRow);
  const baseByRow = new Map(base.map((b) => [b.row, b]));
  const used = new Set();

  const results = [];
  for (const s of sales.records) {
    if (!s.tc && !s.user && !s.usd) continue;
    if (s.tc !== "0" && s.tc !== "1") continue; // filas de tablero / totales
    if (!s.concept && !s.user) continue;
    const r = { salesRow: s.row, concept: s.concept, tc: s.tc, blockers: [], evidence: {} };
    results.push(r);

    if (s.tc !== "1") { r.classification = "EXCLUIDO_TC0"; r.status = "EXCLUIDO"; continue; }
    const isMira = canon(s.origin).includes("MIRA+") || strip(s.panel) === "PANEL 2";

    // 1) Pago confirmado: misma hoja de medio, mismo importe y misma fecha de pago.
    const sheet = paymentSheetFor(s.method);
    const saleIso = parseDateLoose(s.last);
    const usd = parseAmount(s.usd);
    let cands = pay.filter((p) => p.sheet === sheet && p.usd === usd && p.iso && p.iso === saleIso && !used.has(p.ref));
    if (cands.length > 1) {
      const venta = cands.filter((p) => strip(p.origin) === "VENTA");
      if (venta.length) cands = venta;
    }
    if (cands.length > 1) {
      // Descarta pagos ya enlazados a otra ficha con distinto USUARIO.
      cands = cands.filter((p) => {
        const b = baseByRow.get(Number(p.baseRow));
        return !(strip(p.link) === "ENLAZADO" && b && b.user && canon(b.user) !== canon(s.user));
      });
    }
    const payment = cands.length === 1 ? cands[0] : null;
    if (payment) used.add(payment.ref);
    r.payment = payment ? { ref: payment.ref, origin: payment.origin, confirmed: canon(payment.confirmation) === CONFIRMED, usd: payment.usd, date: payment.iso } : null;
    if (!payment) r.blockers.push({ code: cands.length ? "PAGO_AMBIGUO" : "SIN_PAGO", owner: "BO", detail: `${cands.length} candidatos` });
    else if (!r.payment.confirmed) r.blockers.push({ code: "SIN_CONFIRMADO_JM", owner: "DIRECCION" });
    if (payment && strip(payment.origin) !== "VENTA") r.evidence.originMismatch = payment.origin;

    if (isMira) { r.classification = "MIRA_PLUS"; r.status = "FUERA_TIVIPLAY"; continue; }

    // 2) Identidad por USUARIO (nunca por nombre).
    const user = canon(s.user);
    const byUser = user ? base.filter((b) => canon(b.user) === user) : [];
    const current = byUser.filter((b) => b.operative && b.tc === "1");
    const historic = byUser.filter((b) => !(b.operative && b.tc === "1"));
    r.evidence.baseRows = current.map((b) => b.row);
    r.evidence.historicRows = historic.map((b) => b.row);
    if (payment && strip(payment.link) === "ENLAZADO") {
      const linked = baseByRow.get(Number(payment.baseRow));
      if (linked && canon(linked.user) !== user) {
        r.blockers.push({ code: "HOMONIMO_POSIBLE", owner: "BO", detail: `pago enlazado por nombre a BASE!${linked.row} con otro USUARIO` });
      }
    }

    // 3) Evidencia técnica (CONTROL).
    const credits = ctl.filter((c) => canon(c.user) === user);
    const credit = credits.find((c) => c.credit === "1");
    r.evidence.control = credits.map((c) => ({ ref: c.ref, date: c.iso, origin: c.origin, credit: c.credit }));

    if (current.length) {
      r.classification = "YA_EN_BASE";
      r.status = "SIN_ACCION_ALTA";
      if (historic.length) r.blockers.push({ code: "FICHA_HISTORICA_MISMO_USUARIO", owner: "DIRECCION", detail: `vigente ${current.map((b) => b.row)} · histórica ${historic.map((b) => b.row)}` });
      if (current.length > 1) r.blockers.push({ code: "USUARIO_DUPLICADO_EN_BASE", owner: "BO" });
      finalize(r, approved);
      continue;
    }

    const reactivation = strip(s.concept).startsWith("REACTIVACION");
    r.classification = reactivation ? "REACTIVACION" : "ALTA";
    if (reactivation && !historic.length) r.blockers.push({ code: "FICHA_HISTORICA_NO_LOCALIZADA", owner: "BO" });

    // 4) Plan vendido (VENTAS) frente a catálogo y promociones.
    const plan = parsePlan(s.plan);
    const screens = Number(s.screens) || null;
    r.plan = plan ? { ...plan, screens, label: canon(s.plan) } : null;
    if (!plan || !screens) r.blockers.push({ code: "PLAN_INCOMPLETO_EN_VENTAS", owner: "BO" });
    if (plan && screens && usd != null) {
      const expected = catalogPrice(catalog, plan.months, screens);
      const promo = PROMOTIONS.find((p) => p.usd === usd && p.months === plan.months && (p.screens == null || p.screens === screens));
      r.tariff = { catalogUsd: expected, paidUsd: usd, promo: promo?.code ?? null };
      if (promo) {
        if (promo.until && payment?.iso && payment.iso > promo.until) r.blockers.push({ code: "PROMO_FUERA_DE_VIGENCIA", owner: "DIRECCION" });
        const lastNext = historic.map((b) => b.nextIso).filter(Boolean).sort().pop();
        const inactiveDays = lastNext && payment?.iso ? daysBetween(lastNext, payment.iso) : null;
        r.evidence.inactiveDays = inactiveDays;
        if (!reactivation || inactiveDays == null || inactiveDays <= 30) {
          r.blockers.push({ code: "ELEGIBILIDAD_PROMO_NO_DEMOSTRADA", owner: "DIRECCION", detail: inactiveDays == null ? "sin vencimiento anterior" : `${inactiveDays} días` });
        }
      } else if (expected !== usd) {
        r.blockers.push({ code: "TARIFA_FUERA_DE_CATALOGO", owner: "DIRECCION", detail: `catálogo ${expected ?? "—"} · pagado ${usd}` });
      }
      if (plan.bonus > 0) r.blockers.push({ code: "BONO_SIN_RATIFICAR", owner: "DIRECCION", detail: `+${plan.bonus} mes(es)` });
    }

    // 5) Fechas: venta/pago, activación y próximo pago; nunca se corrige por inferencia.
    if (!credit) r.blockers.push({ code: "SIN_CREDITO_EN_CONTROL", owner: "BO" });
    const payIso = payment?.iso ?? saleIso;
    if (credit?.iso && payIso) {
      const lag = daysBetween(payIso, credit.iso);
      // La activación puede diferir de la fecha comercial, pero no por semanas: fecha técnica incoherente.
      if (lag > 7 || lag < -15) r.blockers.push({ code: "FECHA_CONTROL_INCOHERENTE", owner: "BO", detail: `${credit.ref} ${credit.iso} · pago ${payIso}` });
    }
    const months = plan ? plan.months + plan.bonus : null;
    const ventasNext = parseDateLoose(s.next);
    r.dates = {
      payment: payIso,
      activation: credit?.iso ?? null,
      ventasNext,
      nextFromPayment: payIso && months ? addMonths(payIso, months) : null,
      nextFromActivation: credit?.iso && months ? addMonths(credit.iso, months) : null,
      technicalExpiry: parseDateLoose(s.expiry),
    };
    if (ventasNext && r.dates.nextFromPayment && ventasNext !== r.dates.nextFromPayment) {
      r.blockers.push({ code: "FECHA_VENTAS_DISCREPA", owner: "BO", detail: `VENTAS ${ventasNext} · plan ${r.dates.nextFromPayment}` });
    }
    if (!anchor) r.blockers.push({ code: "D1_ANCLAJE_SIN_RATIFICAR", owner: "DIRECCION" });
    const chosen = anchor === "ACTIVACION" ? [r.dates.activation, r.dates.nextFromActivation] : [r.dates.payment, r.dates.nextFromPayment];
    if (chosen[0] && chosen[1]) {
      r.proposal = {
        section: "ALTAS DEL MES DE LA VENTA",
        G: r.plan.label,
        H: String(screens),
        J: String(usd),
        L: canon(s.method),
        N: "<USUARIO de VENTAS>",
        P: canon(s.panel),
        AH: r.dates.technicalExpiry ? toSerial(r.dates.technicalExpiry) : null,
        AI: toSerial(chosen[0]),
        AJ: toSerial(chosen[1]),
        F: `ALTA ${r.classification === "REACTIVACION" ? "REACTIVACIÓN " : ""}· VENTAS!${s.row} · ${payment?.ref ?? "SIN PAGO"} · ${CONFIRMED}`,
      };
    }
    finalize(r, approved);
  }

  const summary = results.reduce((acc, r) => {
    const k = `${r.classification}:${r.status}`;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  return { salesHeaderRow: sales.headerRow, results, summary, unmatchedConfirmedVentas: unmatchedVentas(pay, used) };
}

function finalize(r, approved) {
  const ok = new Set(approved[r.payment?.ref] ?? []);
  r.blockers = r.blockers.filter((b) => !ok.has(b.code));
  if (!r.blockers.length) r.status = r.classification === "YA_EN_BASE" ? "SIN_ACCION_ALTA" : "AUTORIZABLE";
  else if (r.blockers.every((b) => b.code === "D1_ANCLAJE_SIN_RATIFICAR")) r.status = "AUTORIZABLE_TRAS_D1";
  else if (r.blockers.some((b) => b.owner === "BO")) r.status = "REQUIERE_REVISION_BO";
  else r.status = "REQUIERE_DECISION";
}

/** Pagos CONFIRMADO JM con origen VENTA que no tienen fila en VENTAS (no deben quedar). */
function unmatchedVentas(pay, used) {
  return pay
    .filter((p) => canon(p.confirmation) === CONFIRMED && strip(p.origin) === "VENTA" && !used.has(p.ref))
    .map((p) => p.ref);
}
