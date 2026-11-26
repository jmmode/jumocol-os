// Proyección pura (sin I/O) de pagos en PENDIENTE CONFIRMACION para el Bloque 3 de HOY.
// Regla: solo cuenta el valor literal de la columna CONFIRMACION, localizada por encabezado.
// No se infiere Confirmado JM desde ESTADO, observaciones, montos ni BASE GENERAL.
import { canon, clean } from "@/server/tiviplay-live/runtime-read-model";

export const PENDING_STATE = "PENDIENTE CONFIRMACION";

export type PendingConfirmation = {
  source: "ZELLE" | "PAYPAL" | "TRANSF";
  sheet: string;
  row: number;
  reference: string; // Hoja!Celda de CONFIRMACION, para volver a la fuente
  client: string;
  date: string;
  amount: string; // VALOR_PAGO + MONEDA_PAGO si la hoja los calcula; si no, el valor registrado
  plan: string; // PLAN_CANONICO calculado por la hoja
  link: string; // ESTADO_ENLACE calculado por la hoja
  confirmation: string; // valor literal de CONFIRMACION
};

export type PendingSource = {
  source: PendingConfirmation["source"];
  sheet: string | null;
  status: "OK" | "REQUIERE_REVISION" | "REQUIERE_DECISION";
  reason: string | null;
  items: PendingConfirmation[];
};

const DATE_HEADER = { ZELLE: ["FECHA"], PAYPAL: ["FECHA DE RECIBIDO"], TRANSF: ["FECHA"] } as const;
const RAW_AMOUNT: Record<PendingConfirmation["source"], Array<[string, string]>> = {
  ZELLE: [["MONTO RECIBIDO", "USD"]],
  PAYPAL: [["MONTO RECIBIDO", "USD"]],
  TRANSF: [["USD", "USD"], ["CAD", "CAD"], ["VALOR EN PESOS", "COP"]],
};

function columnLetter(index: number) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function buildPendingConfirmations(source: PendingConfirmation["source"], sheet: string, rows: unknown[][]): PendingSource {
  const headerRow = rows.slice(0, 8).findIndex((r) => (r ?? []).map(canon).includes("CONFIRMACION"));
  if (headerRow < 0) return { source, sheet, status: "REQUIERE_DECISION", reason: "no se encontró el encabezado CONFIRMACION", items: [] };
  const header = (rows[headerRow] ?? []).map(canon);
  const all = (name: string) => header.flatMap((h, i) => (h === name ? [i] : []));
  if (all("CONFIRMACION").length !== 1) return { source, sheet, status: "REQUIERE_DECISION", reason: "más de una columna CONFIRMACION", items: [] };
  const col = (name: string) => { const i = header.indexOf(name); return i < 0 ? null : i; };
  const at = (row: unknown[], i: number | null) => (i == null ? "" : clean(row[i]));
  const c = {
    confirmation: col("CONFIRMACION")!,
    client: col("CLIENTE"),
    date: DATE_HEADER[source].map(col).find((i) => i != null) ?? null,
    value: col("VALOR_PAGO"),
    currency: col("MONEDA_PAGO"),
    plan: col("PLAN_CANONICO"),
    link: col("ESTADO_ENLACE"),
  };
  const letter = columnLetter(c.confirmation);

  const items: PendingConfirmation[] = [];
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const raw = at(row, c.confirmation);
    if (canon(raw) !== PENDING_STATE) continue;
    const computed = at(row, c.value) && at(row, c.currency) ? `${at(row, c.currency)} ${at(row, c.value)}` : "";
    const registered = RAW_AMOUNT[source].map(([h, cur]) => [at(row, col(h)), cur] as const).find(([v]) => v && !/^\$?0+([.,]0+)?$/.test(v.replace(/\s/g, "")));
    items.push({
      source,
      sheet,
      row: i + 1,
      reference: `${sheet}!${letter}${i + 1}`,
      client: at(row, c.client),
      date: at(row, c.date),
      amount: computed || (registered ? `${registered[1]} ${registered[0]}` : ""),
      plan: at(row, c.plan),
      link: at(row, c.link),
      confirmation: raw,
    });
  }
  return { source, sheet, status: "OK", reason: null, items };
}
