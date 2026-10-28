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

/** Lee varias hojas en una sola llamada (values:batchGet). Los rangos inician en A1 para conservar filas absolutas. */
export async function batchReadSheets(spreadsheetId: string, token: string, titles: string[], lastColumn = "AN", lastRow = 4000) {
  if (!titles.length) return {} as Record<string, unknown[][]>;
  const params = new URLSearchParams({ valueRenderOption: "FORMATTED_VALUE", majorDimension: "ROWS" });
  for (const t of titles) params.append("ranges", `${quoteSheet(t)}!A1:${lastColumn}${lastRow}`);
  const payload = await sheetsFetch<{ valueRanges?: Array<{ values?: unknown[][] }> }>(
    `${API}/${encodeURIComponent(spreadsheetId)}/values:batchGet?${params.toString()}`,
    token,
  );
  const out: Record<string, unknown[][]> = {};
  titles.forEach((t, i) => {
    out[t] = payload.valueRanges?.[i]?.values ?? [];
  });
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
