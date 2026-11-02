import { parseOperationalDate } from "../core.mjs";

const clean = (value) => String(value ?? "").trim();
const canon = (value) => clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");

// Columnas que se leen de ZELLE / PAYPAL / TRANSF, localizadas por encabezado.
// CLIENTE, CORREO, CLIENTE_KEY, OBSERVACIÓN y enlaces nunca se solicitan.
export const PAYMENT_FIELDS = Object.freeze({
  confirmation: ["CONFIRMACION"],
  matches: ["COINCIDENCIAS_BASE"],
  baseRow: ["FILA_BASE"],
  amount: ["MONTO RECIBIDO", "USD"],
  amountCop: ["VALOR EN PESOS"],
  paymentDate: ["FECHA", "FECHA DE RECIBIDO"],
  link: ["ESTADO_ENLACE"],
  currency: ["MONEDA_PAGO"],
  value: ["VALOR_PAGO"],
  tariffCheck: ["VALIDACION_TARIFA"],
  proposedNext: ["PROP_F_PROXIMO"],
  proposalState: ["ESTADO_PROPUESTA"],
});

export const REQUIRED_PAYMENT_FIELDS = ["confirmation", "matches", "baseRow", "paymentDate", "proposedNext"];

/** Localiza la fila de encabezados (1-based) y el índice de cada campo permitido. */
export function locatePaymentColumns(headerRows) {
  for (let i = 0; i < headerRows.length; i++) {
    const header = (headerRows[i] ?? []).map(canon);
    if (!header.includes("CONFIRMACION") || !header.includes("FILA_BASE")) continue;
    const columns = {};
    for (const [field, aliases] of Object.entries(PAYMENT_FIELDS)) {
      const index = aliases.map((a) => header.indexOf(canon(a))).find((x) => x >= 0);
      if (index != null) columns[field] = index;
    }
    const missing = REQUIRED_PAYMENT_FIELDS.filter((f) => columns[f] == null);
    if (missing.length) throw new Error(`Contrato de pagos incompleto: faltan ${missing.join(", ")}`);
    return { headerRow: i + 1, columns };
  }
  throw new Error("Contrato de pagos: encabezado CONFIRMACION / FILA_BASE no encontrado");
}

/** Fechas de pagos: 01-10-26, 1/12/2026 o ISO. Día primero, como en el libro. */
export function parsePaymentDate(value) {
  const s = clean(value);
  if (!s) return null;
  return parseOperationalDate(s.replace(/\//g, "-"));
}

const num = (value) => {
  const n = Number(clean(value).replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

/**
 * Normaliza una hoja de pagos. `rowsByField` trae, por campo, la columna leída (1 celda por fila absoluta).
 * Solo se conservan filas con alguna señal financiera (confirmación, fila base o monto).
 */
export function normalizePayments(source, { headerRow, rowsByField }) {
  const height = Math.max(0, ...Object.values(rowsByField).map((v) => v.length));
  const at = (field, r) => clean(rowsByField[field]?.[r]?.[0]);
  const out = [];
  for (let r = headerRow; r < height; r++) {
    const confirmation = canon(at("confirmation", r));
    const baseRowRaw = at("baseRow", r);
    const amountRaw = at("amount", r) || at("value", r);
    if (!confirmation && !baseRowRaw && !amountRaw) continue;
    const amount = num(amountRaw);
    const currencyRaw = canon(at("currency", r));
    out.push({
      source,
      row: r + 1,
      confirmation,
      matches: at("matches", r),
      baseRow: /^\d+$/.test(baseRowRaw) ? Number(baseRowRaw) : null,
      amount: amountRaw,
      amountCop: at("amountCop", r),
      currency: currencyRaw || (amount != null && amount > 1000 ? "COP" : "USD"),
      paymentDate: parsePaymentDate(at("paymentDate", r)),
      link: canon(at("link", r)),
      tariffCheck: canon(at("tariffCheck", r)),
      proposedNext: parsePaymentDate(at("proposedNext", r)),
      proposalState: canon(at("proposalState", r)),
    });
  }
  return out;
}

export const isConfirmed = (p) => p.confirmation === "CONFIRMADO JM";
// Enlace único y verificable a una ficha: una sola coincidencia y FILA_BASE numérica.
export const isUniquelyLinked = (p) => p.baseRow != null && p.matches === "1";

/** Último pago enlazado por ficha (orden fecha de pago, fuente, fila: determinista). */
export function linkPaymentsByBaseRow(payments) {
  const byRow = new Map();
  for (const p of payments) {
    if (!isUniquelyLinked(p)) continue;
    if (!byRow.has(p.baseRow)) byRow.set(p.baseRow, []);
    byRow.get(p.baseRow).push(p);
  }
  for (const list of byRow.values()) {
    list.sort((a, b) => (a.paymentDate ?? "").localeCompare(b.paymentDate ?? "") || a.source.localeCompare(b.source) || a.row - b.row);
  }
  return byRow;
}

export function shortSource(source) {
  return clean(source).split(" ")[0];
}
