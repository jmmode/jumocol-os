// Avance del mes TIVIPLAY — modelo puro (sin E/S), probado en avance-model.test.ts.
//
// LEE → CLASIFICA → PRESENTA. Nunca escribe y no recalcula el motor: muestra la planilla viva del mes
// (PAGOS <MES> <AÑO>), la cruza por USUARIO con el último corte de paneles disponible y lista lo pendiente.
// Reglas de presentación (Julian, 02/11/2026):
// - un crédito pendiente nunca se presenta como otorgado; no se infieren liberaciones;
// - un pago de otro mes (p. ej. CONFIRMADO JM de octubre en la planilla) no es confirmación del mes objetivo;
// - CONTRASEÑA, CORREO y OBSERVACIONES no se leen.

import type { ServiceRecord } from "@/server/tiviplay-live/conciliacion-model";

/** Columnas de la planilla PAGOS <MES> que se solicitan (por encabezado). Nada más. */
export const COBROS_COLUMNS = [
  "TC", "CLIENTE", "TELEFONO", "PLAN ACTIVO", "PANTALLAS", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "PANEL",
  "F.VENCIMIENTO", "F. PRÓXIMO PAGO", "ORIGEN BASE", "FECHA_PAGO", "CONFIRMACION_FINANCIERA", "SEMANA",
  "CLASIFICACION_BORRADOR", "CATEGORIA", "CAUSA / ACCIÓN", "RESPONSABLE", "ID_BORRADOR", "ESTADO_COBRO",
  "FECHA_GESTION", "GESTIONADO_POR", "NOTA_EQUIPO",
] as const;
export const COBROS_REQUIRED = ["CLIENTE", "USUARIO", "F. PRÓXIMO PAGO"];

export type CobroRow = {
  row: number;
  week: string;
  nextDue: string;
  client: string;
  phone: string;
  plan: string;
  screens: string;
  value: string;
  method: string;
  user: string;
  panel: string;
  /** F.VENCIMIENTO de la planilla (copiada de BASE GENERAL al corte). */
  due: string | null;
  classification: string;
  category: string;
  cause: string;
  owner: string;
  draftId: string;
  baseRef: string;
  /** Gestión del equipo (columnas de la planilla, se conservan por ID). */
  status: string;
  managedAt: string;
  managedBy: string;
  note: string;
  /** Mes (yyyy-mm) del último pago confirmado que trae la ficha; solo contexto, nunca confirmación del mes. */
  lastPaymentMonth: string | null;
};

export type SourceInfo = {
  label: string;
  sheet: string | null;
  url: string | null;
  /** Fecha del corte o de la lectura, tal como la declara la fuente. */
  cut: string | null;
  status: "LEIDA" | "NO_INTEGRADA" | "ERROR";
  validation: string;
  detail?: string;
};

export type Cobros = {
  source: SourceInfo;
  title: string | null;
  banner: string | null;
  signature: string | null;
  rows: CobroRow[];
};

export type CreditState = "VIGENTE" | "VENCIDA" | "DIFERENCIA";
export type CreditCross = {
  row: number;
  client: string;
  user: string;
  state: CreditState;
  panel: string | null;
  expiration: string | null;
  /** F.VENCIMIENTO de la planilla, para comparar con el panel. */
  sheetDue: string | null;
  reason: string;
};

export const norm = (v: string) => v.normalize("NFKC").replace(/\s+/g, "").toUpperCase();

/** yyyy-mm-dd desde yyyy-mm-dd, dd-mm-yy, dd/mm/yyyy. */
export function isoDate(value: string): string | null {
  const v = (value ?? "").trim();
  let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

/** Fichas de la planilla: filas con CLIENTE y F. PRÓXIMO PAGO válida. Separadores de semana y totales quedan fuera. */
export function parseCobros(firstRow: number, columns: Record<string, string[]>): CobroRow[] {
  const col = (name: string, i: number) => (columns[name]?.[i] ?? "").trim();
  const n = Math.max(0, ...Object.values(columns).map((c) => c.length));
  const out: CobroRow[] = [];
  let week = "";
  for (let i = 0; i < n; i++) {
    const client = col("CLIENTE", i);
    const next = isoDate(col("F. PRÓXIMO PAGO", i));
    const sep = client.match(/^SEMANA\s+(\d+)/i);
    if (sep) { week = `S${sep[1]}`; continue; }
    if (!client || !next) continue;
    const usd = col("USD", i);
    const cop = col("COP", i);
    const confirmed = /CONFIRMADO/i.test(col("CONFIRMACION_FINANCIERA", i));
    const paid = isoDate(col("FECHA_PAGO", i));
    out.push({
      row: firstRow + i,
      week: col("SEMANA", i) ? `S${col("SEMANA", i)}` : week,
      nextDue: next,
      client,
      phone: col("TELEFONO", i),
      plan: col("PLAN ACTIVO", i),
      screens: col("PANTALLAS", i),
      value: [usd && `USD ${usd}`, cop && `COP ${cop}`].filter(Boolean).join(" · "),
      method: col("MÉTODO DE PAGO", i),
      user: col("USUARIO", i),
      panel: col("PANEL", i),
      due: isoDate(col("F.VENCIMIENTO", i)),
      classification: col("CLASIFICACION_BORRADOR", i),
      category: col("CATEGORIA", i),
      cause: col("CAUSA / ACCIÓN", i),
      owner: col("RESPONSABLE", i),
      draftId: col("ID_BORRADOR", i),
      baseRef: col("ORIGEN BASE", i),
      status: col("ESTADO_COBRO", i),
      managedAt: col("FECHA_GESTION", i),
      managedBy: col("GESTIONADO_POR", i),
      note: col("NOTA_EQUIPO", i),
      lastPaymentMonth: confirmed && paid ? paid.slice(0, 7) : null,
    });
  }
  return out;
}

/** Corte y firma declarados por la propia planilla en sus filas de cabecera ("corte:2026-11-01", "firma: …"). */
export function parsePreface(preface: string[][]) {
  const cells = preface.flat().map((c) => c.trim()).filter(Boolean);
  const cut = cells.find((c) => /^corte\s*:/i.test(c))?.replace(/^corte\s*:\s*/i, "") ?? null;
  const signature = cells.find((c) => /^firma\s*:/i.test(c))?.replace(/^firma\s*:\s*/i, "") ?? null;
  const title = cells.find((c) => /^PAGOS\s/i.test(c)) ?? null;
  const banner = cells.find((c) => /fichas/i.test(c)) ?? null;
  return { cut, signature, title, banner };
}

/**
 * Cruce por USUARIO con el último corte de paneles (dataset de conciliación de servicio).
 * VIGENTE / VENCIDA se decide SOLO con el vencimiento del panel al corte, contra `today`.
 * DIFERENCIA = sin línea, varias líneas, excepción abierta o sin vencimiento: pendiente de revisión, sin inferir nada.
 */
export function crossCredits(rows: CobroRow[], services: ServiceRecord[], today: string): CreditCross[] {
  const byUser = new Map<string, ServiceRecord[]>();
  for (const s of services) {
    const k = norm(s.username);
    byUser.set(k, [...(byUser.get(k) ?? []), s]);
  }
  return rows.map((r) => {
    const base = { row: r.row, client: r.client, user: r.user, sheetDue: r.due };
    if (!r.user) return { ...base, state: "DIFERENCIA", panel: null, expiration: null, reason: "Ficha sin USUARIO en la planilla." };
    const found = byUser.get(norm(r.user)) ?? [];
    if (found.length === 0) return { ...base, state: "DIFERENCIA", panel: null, expiration: null, reason: "USUARIO sin línea en el corte de paneles." };
    if (found.length > 1) return { ...base, state: "DIFERENCIA", panel: found.map((f) => f.panel ?? "?").join(" + "), expiration: null, reason: `USUARIO con ${found.length} registros en el corte: requiere revisión.` };
    const s = found[0];
    if (s.state === "EXCEPCION") return { ...base, state: "DIFERENCIA", panel: s.panel, expiration: s.expiration, reason: s.note || "Excepción abierta en la conciliación de servicio." };
    if (!s.expiration) return { ...base, state: "DIFERENCIA", panel: s.panel, expiration: null, reason: "Línea sin vencimiento en el corte." };
    const state: CreditState = s.expiration >= today ? "VIGENTE" : "VENCIDA";
    return { ...base, state, panel: s.panel, expiration: s.expiration, reason: state === "VIGENTE" ? "Vencimiento del panel posterior o igual a hoy." : "Vencimiento del panel anterior a hoy (no implica liberación)." };
  });
}

/** Diferencias de fecha: vencimiento del panel al corte ≠ F.VENCIMIENTO de la planilla. Solo se reportan, no se corrigen. */
export const dateDifferences = (cross: CreditCross[]) =>
  cross.filter((c) => c.expiration && c.sheetDue && c.expiration !== c.sheetDue);

/** Casos de la planilla en revisión o bloqueados, con su responsable declarado. */
export const reviewCases = (rows: CobroRow[]) =>
  rows.filter((r) => r.classification && !/^FACTURABLE$/i.test(r.classification));

export const isBackOffice = (owner: string) => /\bBO\b|BACK\s*OFFICE/i.test(owner);

export function summarize(rows: CobroRow[], cross: CreditCross[] | null, targetMonth: string) {
  const count = (pred: (r: CobroRow) => boolean) => rows.filter(pred).length;
  return {
    fichas: rows.length,
    facturables: count((r) => /^FACTURABLE$/i.test(r.classification)),
    enRevision: count((r) => /REVISION/i.test(r.classification)),
    bloqueadas: count((r) => /BLOQUE/i.test(r.classification)),
    /** Con gestión registrada por el equipo (FECHA_GESTION o GESTIONADO_POR). */
    gestionadas: count((r) => !!(r.managedAt || r.managedBy)),
    /** Fichas cuyo último pago confirmado es de un mes anterior: contexto, no cobro del mes. */
    pagoMesAnterior: count((r) => !!r.lastPaymentMonth && r.lastPaymentMonth < targetMonth),
    vigentes: cross ? cross.filter((c) => c.state === "VIGENTE").length : null,
    vencidas: cross ? cross.filter((c) => c.state === "VENCIDA").length : null,
    diferencias: cross ? cross.filter((c) => c.state === "DIFERENCIA").length : null,
  };
}
