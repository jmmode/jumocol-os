import "server-only";

import { buildClientHistory, type ClientHistory, type HistoryTab } from "@/server/tiviplay-live/client-history-model";
import { bogotaToday, getRuntimeValuesCached } from "@/server/tiviplay-live/runtime-source";
import { batchReadRanges, getSheetsAccessToken, getTiviplaySpreadsheetId, quoteSheet, readSheetMetadata } from "@/server/tiviplay-live/sheets-client";
import { columnLetter, findHeaderRow, headerKey, isSensitiveHeader } from "@/server/tiviplay-live/sheet-columns";
import { snapshotFile } from "@/server/tiviplay-live/sheets-snapshot";

const TTL_MS = 5 * 60_000;
const CHUNK = 60;
// CONTROL P3 se consulta solo para historial, sin habilitar créditos. Nunca se solicitan credenciales.
const PAGOS = ["USUARIO", "PLAN ACTIVO", "PANTALLAS", "USD", "COP", "F.ULTIMO PAGO", "CONFIRMACION"];
const CONTROL = ["USUARIO", "FECHA", "F.VENCIMIENTO", "CREDITO"];
const PAGO = ["CLIENTE_KEY", "ESTADO_ENLACE", "COINCIDENCIAS_BASE", "FILA_BASE", "VALOR_PAGO", "MONEDA_PAGO", "CONFIRMACION", "PLAN_CANONICO"];

type Plan = { title: string; kind: HistoryTab["kind"]; wanted: string[]; dateHeader?: string; required: string[] };

function planTab(title: string): Plan | null {
  if (/^PAGOS\s/i.test(title)) return { title, kind: "PAGOS", wanted: PAGOS, required: ["TC", "USUARIO"] };
  if (/^CONTROL\s*\(.*\)\s*P[123]$/i.test(title)) return { title, kind: "CONTROL", wanted: CONTROL, required: ["TC", "USUARIO"] };
  if (/^(ZELLE|PAYPAL|TRANSF)\s*\(/i.test(title)) return { title, kind: "PAGO", wanted: PAGO, required: ["CLIENTE_KEY", "ESTADO_ENLACE"] };
  return null;
}

const DATE_HEADERS = ["FECHA", "FECHA DE RECIBIDO"];

/** Solo las hojas de pago unifican su fecha: en CONTROL, FECHA conserva su nombre. */
export const columnKey = (kind: HistoryTab["kind"], name: string) => (kind === "PAGO" && DATE_HEADERS.includes(name) ? "__date" : name);

/** Las columnas se ubican por encabezado en cada hoja: cada mes puede tener otro orden. Nunca devuelve una columna sensible. */
export function resolveTabColumns(plan: Pick<Plan, "title" | "kind" | "wanted" | "required">, probe: unknown[][]) {
  const h = findHeaderRow(probe, plan.required);
  if (h < 0) return [];
  const header = probe[h] ?? [];
  const names = plan.kind === "PAGO" ? [...plan.wanted, ...DATE_HEADERS] : plan.wanted;
  return names.flatMap((name) => {
    const at = header.findIndex((v) => headerKey(v) === headerKey(name));
    return at < 0 || isSensitiveHeader(header[at]) ? [] : [{ name, first: h + 2, range: `${quoteSheet(plan.title)}!${columnLetter(at)}${h + 2}:${columnLetter(at)}` }];
  });
}

async function readTabs(): Promise<HistoryTab[]> {
  const id = getTiviplaySpreadsheetId();
  const token = await getSheetsAccessToken();
  const plans = (await readSheetMetadata(id, token)).sheets.filter((s) => !s.hidden).flatMap((s) => planTab(s.title) ?? []);
  const headers = await batchReadRanges(id, token, plans.map((p) => `${quoteSheet(p.title)}!A1:BZ4`));
  const columns = plans.flatMap((plan, i) => resolveTabColumns(plan, headers[i] ?? []).map((c) => ({ plan, ...c })));
  const values: unknown[][][] = [];
  for (let i = 0; i < columns.length; i += CHUNK) values.push(...await batchReadRanges(id, token, columns.slice(i, i + CHUNK).map((c) => c.range)));
  const tabs = new Map<string, HistoryTab>();
  columns.forEach((c, i) => {
    const tab = tabs.get(c.plan.title) ?? { title: c.plan.title, kind: c.plan.kind, rows: [] };
    tabs.set(c.plan.title, tab);
    (values[i] ?? []).forEach((cell, r) => {
      const row = (tab.rows[r] ??= { __row: String(c.first + r) });
      const key = columnKey(c.plan.kind, c.name);
      row[key] ||= String(cell?.[0] ?? "").trim();
    });
  });
  return [...tabs.values()].map((t) => ({ ...t, rows: t.rows.filter(Boolean) }));
}

let cache: { at: number; tabs: Promise<HistoryTab[]> } | null = null;

function cachedTabs() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.tabs;
  const tabs = readTabs();
  cache = { at: Date.now(), tabs };
  tabs.catch(() => { if (cache?.tabs === tabs) cache = null; });
  return tabs;
}

function baseKey(baseRow: number | null) {
  const rows = getRuntimeValuesCached()?.["BASE GENERAL"];
  if (!rows || !baseRow) return null;
  const h = findHeaderRow(rows.slice(0, 8), ["TC", "CLIENTE"]);
  const at = h < 0 ? -1 : (rows[h] ?? []).findIndex((v) => headerKey(v) === "CLIENTE_KEY");
  const value = at < 0 ? "" : String(rows[baseRow - 1]?.[at] ?? "").trim();
  return value || null;
}

export async function getClientHistory(client: { user: string; baseRow: number | null }): Promise<{ ok: true; history: ClientHistory } | { ok: false; reason: string }> {
  if (snapshotFile()) return { ok: false, reason: "La captura local no incluye historial." };
  if (!client.user) return { ok: false, reason: "El cliente no tiene USUARIO: no hay identificador verificable." };
  try {
    return { ok: true, history: buildClientHistory(await cachedTabs(), { ...client, clientKey: baseKey(client.baseRow) }, bogotaToday()) };
  } catch {
    return { ok: false, reason: "No se pudo leer el historial." };
  }
}
