import "server-only";

import { GoogleAuth } from "google-auth-library";

import { getGoogleSheetsLeadConfig } from "@/server/leads/google-sheets/config";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Cliente read-only compartido por los módulos TiviPlay live.
 * Reutiliza las credenciales de servicio ya validadas por la integración de leads
 * (GOOGLE_SHEETS_CLIENT_EMAIL / GOOGLE_SHEETS_PRIVATE_KEY). Solo cambia el libro.
 */
export function getTiviplaySpreadsheetId() {
  const id = process.env.TIVIPLAY_SPREADSHEET_ID?.trim();
  if (!id) throw new Error("Missing TIVIPLAY_SPREADSHEET_ID");
  return id;
}

/** Libro `VENTAS 2026 (Tiviplay)` (SOURCE_AUDIT_v0.1 §5). Sobrescribible por TIVIPLAY_SALES_SPREADSHEET_ID. */
const DEFAULT_SALES_SPREADSHEET_ID = "1y1yZSxHCz3HhfikgHNvhgKhU7rFCG9U8HH90QeTN6TQ";

export function getTiviplaySalesSpreadsheetId() {
  return process.env.TIVIPLAY_SALES_SPREADSHEET_ID?.trim() || DEFAULT_SALES_SPREADSHEET_ID;
}

export async function getSheetsAccessToken() {
  const shared = getGoogleSheetsLeadConfig();
  const auth = new GoogleAuth({
    credentials: { client_email: shared.clientEmail, private_key: shared.privateKey },
    scopes: [SHEETS_SCOPE],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error("Could not obtain Google access token");
  return token.token;
}

async function sheetsFetch<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Google Sheets read failed (${response.status})`);
  return (await response.json()) as T;
}

export async function readSheetMetadata(spreadsheetId: string, token: string) {
  const payload = await sheetsFetch<{
    properties?: { title?: string };
    sheets?: Array<{ properties?: { title?: string; hidden?: boolean } }>;
  }>(`${API}/${encodeURIComponent(spreadsheetId)}?fields=properties.title,sheets.properties(title,hidden)`, token);

  return {
    workbook: payload.properties?.title ?? "",
    sheets: (payload.sheets ?? []).map((s) => ({ title: s.properties?.title ?? "", hidden: !!s.properties?.hidden })),
  };
}

export const quoteSheet = (title: string) => `'${title.replace(/'/g, "''")}'`;

/**
 * Columnas que nunca se solicitan a la API, por hoja (contrato vigente).
 * BASE GENERAL!N = CONTRASEÑA. Se devuelven vacías para conservar las posiciones de columna.
 */
export const SENSITIVE_COLUMNS: Record<string, string[]> = { "BASE GENERAL": ["N"] };

export function columnIndex(letters: string) {
  return [...letters.toUpperCase()].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
}

export function columnLetter(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** Tramos [desde, hasta] (índices 0-based, inclusivos) de A..lastColumn sin las columnas excluidas. */
export function allowedSegments(lastColumn: string, excluded: string[] = []) {
  const width = columnIndex(lastColumn) + 1;
  const skip = new Set(excluded.map(columnIndex));
  const segments: Array<[number, number]> = [];
  let start: number | null = null;
  for (let i = 0; i < width; i++) {
    if (skip.has(i)) {
      if (start != null) segments.push([start, i - 1]);
      start = null;
    } else if (start == null) start = i;
  }
  if (start != null) segments.push([start, width - 1]);
  return segments;
}

/** Recompone filas completas a partir de los tramos leídos; las columnas excluidas quedan como "". */
export function stitchSegments(segments: Array<[number, number]>, segmentValues: unknown[][][]) {
  const rowCount = Math.max(0, ...segmentValues.map((v) => v.length));
  const rows: unknown[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const row: unknown[] = [];
    segments.forEach(([from, to], s) => {
      const values = segmentValues[s]?.[r] ?? [];
      for (let c = from; c <= to; c++) row[c] = values[c - from] ?? "";
    });
    for (let c = 0; c < row.length; c++) if (row[c] === undefined) row[c] = "";
    while (row.length && row[row.length - 1] === "") row.pop();
    rows.push(row);
  }
  return rows;
}

/** Lee varias hojas en una sola llamada (values:batchGet). Los rangos inician en A1 para conservar filas absolutas. */
export async function batchReadSheets(spreadsheetId: string, token: string, titles: string[], lastColumn = "AN", lastRow = 4000) {
  if (!titles.length) return {} as Record<string, unknown[][]>;
  const params = new URLSearchParams({ valueRenderOption: "FORMATTED_VALUE", majorDimension: "ROWS" });
  const plan = titles.map((t) => {
    const segments = allowedSegments(lastColumn, SENSITIVE_COLUMNS[t]);
    for (const [from, to] of segments) {
      params.append("ranges", `${quoteSheet(t)}!${columnLetter(from)}1:${columnLetter(to)}${lastRow}`);
    }
    return { title: t, segments };
  });
  const payload = await sheetsFetch<{ valueRanges?: Array<{ values?: unknown[][] }> }>(
    `${API}/${encodeURIComponent(spreadsheetId)}/values:batchGet?${params.toString()}`,
    token,
  );
  const out: Record<string, unknown[][]> = {};
  let cursor = 0;
  for (const { title, segments } of plan) {
    const segmentValues = segments.map((_, i) => payload.valueRanges?.[cursor + i]?.values ?? []);
    cursor += segments.length;
    out[title] = segments.length === 1 && segments[0][0] === 0 ? segmentValues[0] : stitchSegments(segments, segmentValues);
  }
  return out;
}

/** Lee rangos A1 explícitos (values:batchGet). Permite omitir columnas sensibles en lugar de leer la hoja completa. */
export async function batchReadRanges(spreadsheetId: string, token: string, ranges: string[]) {
  const params = new URLSearchParams({ valueRenderOption: "FORMATTED_VALUE", majorDimension: "ROWS" });
  for (const r of ranges) params.append("ranges", r);
  const payload = await sheetsFetch<{ valueRanges?: Array<{ values?: unknown[][] }> }>(
    `${API}/${encodeURIComponent(spreadsheetId)}/values:batchGet?${params.toString()}`,
    token,
  );
  return ranges.map((_, i) => payload.valueRanges?.[i]?.values ?? []);
}
