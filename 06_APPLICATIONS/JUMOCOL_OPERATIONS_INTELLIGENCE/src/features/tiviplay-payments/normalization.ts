import type { ClientStatus, Currency } from "@/features/tiviplay-payments/domain";

const MONTHS: Record<string, number> = {
  ENE: 1,
  ENERO: 1,
  FEB: 2,
  FEBRERO: 2,
  MAR: 3,
  MARZO: 3,
  ABR: 4,
  ABRIL: 4,
  MAY: 5,
  MAYO: 5,
  JUN: 6,
  JUNIO: 6,
  JUL: 7,
  JULIO: 7,
  AGO: 8,
  AGOSTO: 8,
  SEP: 9,
  SEPTIEMBRE: 9,
  OCT: 10,
  OCTUBRE: 10,
  NOV: 11,
  NOVIEMBRE: 11,
  DIC: 12,
  DICIEMBRE: 12,
};

export function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function monthFromText(value: unknown): number | null {
  const tokens = normalizeToken(value).split(" ");

  for (const token of tokens) {
    if (MONTHS[token]) return MONTHS[token];
  }

  return null;
}

export function isoDate(year: number, month: number, day: number): string | null {
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseExcelDate(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + Math.floor(value) * 86_400_000);
    return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }

  const text = String(value ?? "").trim();
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) return isoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));

  const localMatch = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (localMatch) {
    const year = Number(localMatch[3]) < 100 ? 2000 + Number(localMatch[3]) : Number(localMatch[3]);
    return isoDate(year, Number(localMatch[2]), Number(localMatch[1]));
  }

  return null;
}

export function parseLocalizedAmount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const negative = /^\s*\(.*\)\s*$/.test(value);
  let text = value
    .replace(/[()]/g, "")
    .replace(/USD|COP|CAD|US\$|\$/gi, "")
    .replace(/\s+/g, "")
    .replace(/[^0-9,.-]/g, "");

  if (!text || !/\d/.test(text)) return null;

  if (text.includes(",") && text.includes(".")) {
    text =
      text.lastIndexOf(",") > text.lastIndexOf(".")
        ? text.replace(/\./g, "").replace(",", ".")
        : text.replace(/,/g, "");
  } else if (text.includes(",")) {
    const decimals = text.split(",").at(-1)?.length ?? 0;
    text = decimals > 0 && decimals <= 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  }

  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -Math.abs(parsed) : parsed;
}

export function normalizeCurrency(value: unknown): Currency | null {
  const token = normalizeToken(value);
  if (token.includes("USD") || token.includes("DOLAR")) return "USD";
  if (token.includes("COP") || token.includes("PESO") || token.includes("COLOMB")) return "COP";
  if (token.includes("CAD") || token.includes("CANAD")) return "CAD";
  return null;
}

export function normalizePaymentMethod(value: unknown): string {
  const token = normalizeToken(value);
  const compact = token.replace(/\s+/g, "");
  if (!token) return "Sin identificar";
  if (token.includes("ZELLE")) return "Zelle";
  if (compact.includes("PAYPAL")) return "PayPal";
  if (token.includes("WESTERN") && token.includes("BANCOLOMBIA")) return "Western Union / Bancolombia";
  if (token.includes("BANCOLOMBIA")) return "Bancolombia";
  if (token.includes("NEQUI")) return "Nequi";
  if (token.includes("DAVIVIENDA")) return "Davivienda";
  if (token.includes("WESTERN")) return "Western Union";
  if (token.includes("TRANSF")) return "Transferencia";
  return "Sin identificar";
}

export function normalizePanel(value: unknown): string {
  const token = normalizeToken(value);
  const match = token.match(/(?:PANEL|P)\s*([123])/);
  if (match) return `Panel ${match[1]}`;
  if (token.includes("RESELLER")) return "Reseller";
  return "Sin identificar";
}

export function normalizeAdvisor(value: unknown): string {
  const token = normalizeToken(value);
  if (
    !token ||
    /\d/.test(token) ||
    /CODIGOS|TOTAL|CANCELAR|LINKS?|CREDITOS?|PAGOS?|INGRESOS?|NUEVO MEX|^MES /.test(token)
  ) return "Sin identificar";
  return titleCase(token);
}

export function normalizeOrigin(value: unknown): string {
  const token = normalizeToken(value);
  if (!token) return "Sin identificar";
  if (token.includes("FACTUR")) return "Facturación";
  if (token.includes("VENTA")) return "Venta";
  if (token.includes("RECONEX")) return "Reconexión";
  if (token.includes("PROMOC")) return "Promoción";
  if (token.includes("SIN PAGAR")) return "Sin pagar";
  if (token.includes("RESELLER")) return "Reseller";
  if (token.includes("INACT")) return "Inactivo";
  if (token === "COMPRA") return "Compra";
  if (token.includes("CORTESIA")) return "Cortesía";
  if (token.includes("CREDITOS OTORGADOS")) return "Créditos otorgados";
  if (token === "DEMO") return "Demo";
  if (token.includes("MIGRA")) return "Migración";
  if (token.includes("PROPINA")) return "Propina";
  return "Sin identificar";
}

export function originType(origin: string): "Venta" | "Facturación" | "Otro" {
  if (origin === "Venta") return "Venta";
  if (origin === "Facturación") return "Facturación";
  return "Otro";
}

export function normalizePlan(value: unknown): string {
  const token = normalizeToken(value);
  if (!token) return "Sin identificar";
  const duration = token.match(/(\d+)\s*(?:MES|MESES)/);
  const prefix = token.includes("ADD") || token.includes("ADC") ? "Adicional" : "Plan";
  if (duration) return `${prefix} ${duration[1]} ${duration[1] === "1" ? "mes" : "meses"}`;
  return "Sin identificar";
}

export function normalizeSourceStatus(value: unknown): ClientStatus {
  const token = normalizeToken(value);
  if (token.includes("DESACT") || token === "INACTIVO") return "Desactivado";
  if (token.includes("PENDIENTE")) return "Pendiente de pago";
  if (token.includes("POR VENCER")) return "Por vencer";
  if (token.includes("VENCIDO")) return "Vencido";
  if (token.includes("AL DIA")) return "Al día";
  return "Requiere revisión";
}

export function calculateClientStatus(
  nextPaymentDate: string | null,
  referenceDate: string | null,
  sourceStatus: unknown,
  hasConfirmedRenewal = false,
): ClientStatus {
  const normalized = normalizeSourceStatus(sourceStatus);
  if (normalized === "Desactivado" || normalized === "Pendiente de pago") return normalized;
  if (!nextPaymentDate || !referenceDate) return normalized;

  const next = Date.parse(`${nextPaymentDate}T00:00:00Z`);
  const reference = Date.parse(`${referenceDate}T00:00:00Z`);
  if (!Number.isFinite(next) || !Number.isFinite(reference)) return "Requiere revisión";

  // Semáforo comercial de BASE GENERAL (aprobado 28/10/2026): > 5 días Al día · 1–5 Por vencer · ≤ 0 Vencido.
  const days = Math.round((next - reference) / 86_400_000);
  if (days <= 0) return hasConfirmedRenewal ? "Al día" : "Vencido";
  if (days <= 5) return "Por vencer";
  return "Al día";
}

export function sanitizeObservation(value: unknown): string {
  return String(value ?? "")
    .replace(/https?:\/\/\S+/gi, "[enlace oculto]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[correo oculto]")
    .replace(/(?:\+?\d[\s().-]*){8,}/g, "[teléfono oculto]")
    .replace(/(?:CONTRASE(?:N|Ñ)A|PASSWORD|CLAVE)\s*[:=-]?\s*\S+/gi, "[dato protegido]")
    .trim()
    .slice(0, 180);
}

export function isFreeReferralEvidence(...values: unknown[]): boolean {
  const token = normalizeToken(values.join(" "));
  return token.includes("GRAT") && token.includes("REFER");
}

export function titleCase(value: string): string {
  return value
    .toLocaleLowerCase("es-CO")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-CO"));
}

export function monthLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const label = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  return label.charAt(0).toLocaleUpperCase("es-CO") + label.slice(1);
}
