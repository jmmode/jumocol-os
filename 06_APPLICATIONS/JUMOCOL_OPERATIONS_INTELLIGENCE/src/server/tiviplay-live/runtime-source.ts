import "server-only";

import crypto from "node:crypto";

import { buildRuntimeReadModel, selectRuntimeSheets, type RuntimeReadModel } from "@/server/tiviplay-live/runtime-read-model";
import { buildSyncModel, selectSalesSheets, type SyncModel } from "@/server/tiviplay-live/runtime-sync-model";
import { batchReadSheets, getSheetsAccessToken, getTiviplaySalesSpreadsheetId, getTiviplaySpreadsheetId, readSheetMetadata } from "@/server/tiviplay-live/sheets-client";

export type TiviplayRuntimeLive = RuntimeReadModel & {
  source: { workbook: string; sheetsRead: string[]; salesWorkbook: string; salesSheetsRead: string[]; signature: string; cached: boolean };
  sync: SyncModel;
};

const CACHE_TTL_MS = 60_000;
let cache: { at: number; today: string; value: TiviplayRuntimeLive; values: Record<string, unknown[][]> } | null = null;

/**
 * Valores leídos en la última carga de Runtime (sin CONTRASEÑA: el lector la excluye por encabezado).
 * Solo para el puesto de trabajo del servidor (directorio de clientes); nunca se serializan en el read model ni en la API.
 */
export function getRuntimeValuesCached() {
  return cache?.values ?? null;
}

/** Invalidar el caché después de una escritura autorizada sobre observaciones. */
export function invalidateTiviplayRuntimeCache() {
  cache = null;
}

export function bogotaToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Google Sheets → motor → read model.
 * Solo se leen las hojas que el runtime necesita:
 *   BASE GENERAL + cartera/pagos/paneles del mes en curso + hojas de pago jun→mes anterior (evolución mensual).
 * Enero–mayo nunca se solicitan a la API.
 */
export async function getTiviplayRuntimeLive(options: { force?: boolean } = {}): Promise<TiviplayRuntimeLive> {
  const today = bogotaToday();
  if (!options.force && cache && cache.today === today && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ...cache.value, source: { ...cache.value.source, cached: true } };
  }

  const spreadsheetId = getTiviplaySpreadsheetId();
  const token = await getSheetsAccessToken();
  const meta = await readSheetMetadata(spreadsheetId, token);
  const currentMonth = today.slice(0, 7);
  const selection = selectRuntimeSheets(meta.sheets, today);
  const titles = selection.included
    .filter((r) => r.role === "BASE" || r.role === "PAGO" || r.month === currentMonth)
    .map((r) => r.title);

  const values = await batchReadSheets(spreadsheetId, token, titles);
  const model = buildRuntimeReadModel({ sheets: meta.sheets, values, today });

  // VENTAS 2026 (Tiviplay): solo hojas VENTAS_<MES> de junio → mes en curso. Solo lectura.
  let salesWorkbook = "";
  let salesSheets: Array<{ title: string; hidden?: boolean }> = [];
  let salesValues: Record<string, unknown[][]> = {};
  let salesTitles: string[] = [];
  let salesError: string | null = null;
  try {
    const salesId = getTiviplaySalesSpreadsheetId();
    const salesMeta = await readSheetMetadata(salesId, token);
    salesWorkbook = salesMeta.workbook;
    salesSheets = salesMeta.sheets;
    salesTitles = selectSalesSheets(salesSheets, today).included.map((x) => x.title);
    salesValues = await batchReadSheets(salesId, token, salesTitles, "AH", 1500);
  } catch (cause) {
    salesError = cause instanceof Error ? cause.message : "Error desconocido";
  }
  const sync = buildSyncModel({ values, sheets: meta.sheets, salesValues, salesSheets, today, salesError });

  const value: TiviplayRuntimeLive = {
    ...model,
    sync,
    source: {
      workbook: meta.workbook,
      sheetsRead: titles,
      salesWorkbook,
      salesSheetsRead: salesTitles,
      signature: crypto.createHash("sha256").update(JSON.stringify([values, salesValues])).digest("hex"),
      cached: false,
    },
  };
  cache = { at: Date.now(), today, value, values };
  return value;
}
