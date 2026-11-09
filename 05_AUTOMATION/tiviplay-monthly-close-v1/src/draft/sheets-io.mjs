import { GoogleAuth } from "google-auth-library";

import { normalizePrivateKey, readSheetValues } from "../google-sheets.mjs";
import { DRAFT_LAST_COLUMN, DRAFT_MAX_ROWS, assertAllowedDraftTitle, columnLetter, draftTarget } from "./contract.mjs";
import { PAYMENT_FIELDS, locatePaymentColumns, normalizePayments } from "./payments.mjs";

const API = "https://sheets.googleapis.com/v4/spreadsheets";
export const READ_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
// Google no ofrece un scope por hoja: el límite real es la allowlist de este módulo
// más la protección de las demás hojas del libro (ver README § Sincronización del borrador).
export const WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const HEADER_SEARCH_ROWS = 5;
const PAYMENT_LAST_ROW = 400;

const quote = (title) => `'${String(title).replaceAll("'", "''")}'`;

const canonHeader = (value) => String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase("es").replace(/\s+/g, " ");
const BASE_CANONICAL_HEADERS = Object.freeze([
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO",
  "DISPOSITIVOS", "CUMPLEAÑOS", "TIPO_SERVICIO", "CODIGO_CANONICO",
]);

export function normalizeBaseRowsForDraft(rows) {
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i += 1) {
    const keys = (rows[i] ?? []).map(canonHeader);
    if (keys.includes("TC") && keys.includes("CLIENTE") && keys.includes("USUARIO")) {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex < 0) throw new Error("BASE GENERAL: encabezado TC/CLIENTE/USUARIO no encontrado");
  const sourceHeader = (rows[headerIndex] ?? []).map(canonHeader);
  const index = (name, aliases = []) => {
    for (const candidate of [name, ...aliases]) {
      const i = sourceHeader.indexOf(canonHeader(candidate));
      if (i >= 0) return i;
    }
    return -1;
  };
  const columns = BASE_CANONICAL_HEADERS.map((name) => {
    if (name === "CONTRASEÑA") return -1;
    if (name === "OBSERVACIONES") return index(name, ["OBSERVACIONES GESTION"]);
    if (name === "F. PRÓXIMO PAGO") return index(name, ["F.PRÓXIMO PAGO"]);
    if (name === "CODIGO_CANONICO") return index(name, ["CÓDIGO_CANÓNICO", "CODIGO CANONICO"]);
    return index(name);
  });
  return rows.map((row, rowIndex) => {
    if (rowIndex === headerIndex) return [...BASE_CANONICAL_HEADERS];
    const projected = columns.map((i) => i < 0 ? "" : row?.[i] ?? "");
    while (projected.length && projected[projected.length - 1] === "") projected.pop();
    return projected;
  });
}

export function googleTokenProvider(scope) {
  return async () => {
    const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const auth = email && key
      ? new GoogleAuth({ credentials: { client_email: email, private_key: normalizePrivateKey(key) }, scopes: [scope] })
      : new GoogleAuth({ scopes: [scope] });
    const token = await (await auth.getClient()).getAccessToken();
    if (!token?.token) throw new Error("Could not obtain Google access token");
    return token.token;
  };
}

/**
 * E/S de Google Sheets para syncDraft. Lecturas con token read-only; la escritura usa un token aparte
 * y solo acepta la hoja BORRADOR autorizada del mes, en el libro configurado, dentro de A1:AL600.
 */
export function createSheetsIo({ spreadsheetId, targetMonth, readToken, writeToken = null, fetchImpl = fetch }) {
  if (!spreadsheetId) throw new Error("spreadsheetId is required");
  const target = draftTarget(targetMonth);
  const base = `${API}/${encodeURIComponent(spreadsheetId)}`;

  const call = async (url, token, init = {}) => {
    const response = await fetchImpl(url, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
    if (!response.ok) throw new Error(`Google Sheets ${init.method ?? "GET"} failed (${response.status})`);
    return response.json();
  };

  async function sheetTitles(token) {
    const meta = await call(`${base}?fields=sheets.properties.title`, token);
    return new Set((meta.sheets ?? []).map((s) => s.properties?.title ?? ""));
  }

  async function readPaymentSheet(title, token) {
    // Encabezado fila a fila (las filas de datos traen nombres y correos: no se piden completas).
    const headerRows = [];
    let located = null;
    for (let r = 1; r <= HEADER_SEARCH_ROWS && !located; r++) {
      const payload = await call(`${base}/values/${encodeURIComponent(`${quote(title)}!A${r}:AL${r}`)}`, token);
      headerRows.push(payload.values?.[0] ?? []);
      try {
        located = locatePaymentColumns(headerRows);
      } catch (error) {
        if (r === HEADER_SEARCH_ROWS || /incompleto/.test(error.message)) throw new Error(`${title}: ${error.message}`);
      }
    }
    const fields = Object.keys(PAYMENT_FIELDS).filter((f) => located.columns[f] != null);
    const params = new URLSearchParams({ valueRenderOption: "FORMATTED_VALUE" });
    for (const f of fields) {
      const col = columnLetter(located.columns[f]);
      params.append("ranges", `${quote(title)}!${col}1:${col}${PAYMENT_LAST_ROW}`);
    }
    const payload = await call(`${base}/values:batchGet?${params.toString()}`, token);
    const rowsByField = Object.fromEntries(fields.map((f, i) => [f, payload.valueRanges?.[i]?.values ?? []]));
    return normalizePayments(title, { headerRow: located.headerRow, rowsByField });
  }

  async function readDraftWith(token, title) {
    assertAllowedDraftTitle(title);
    const titles = await sheetTitles(token);
    if (!titles.has(title)) return null;
    const range = `${quote(title)}!A1:${DRAFT_LAST_COLUMN}${DRAFT_MAX_ROWS}`;
    const payload = await call(`${base}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`, token);
    return payload.values ?? [];
  }

  return {
    async readSources() {
      const token = await readToken();
      const baseRaw = await readSheetValues({ spreadsheetId, sheetName: "BASE GENERAL", range: "A1:AJ4000" }, { accessToken: token, fetchImpl });\n      const baseRows = normalizeBaseRowsForDraft(baseRaw);
      const titles = await sheetTitles(token);
      const payments = [];
      const missingSheets = [];
      for (const title of target.paymentSheets) {
        if (!titles.has(title)) {
          missingSheets.push(title);
          continue;
        }
        payments.push(...(await readPaymentSheet(title, token)));
      }
      return { baseRows, payments, missingSheets };
    },

    async readDraft(title) {
      return readDraftWith(await readToken(), title);
    },

    async writeDraft(title, values) {
      assertAllowedDraftTitle(title);
      if (title !== target.title) throw new Error(`Escritura rechazada: ${title} no corresponde a ${targetMonth}`);
      if (!writeToken) throw new Error("Escritura deshabilitada: no hay credencial de escritura");
      if (!Array.isArray(values) || values.length === 0 || values.length > DRAFT_MAX_ROWS) {
        throw new Error(`Escritura rechazada: ${values?.length ?? 0} filas fuera del rango A1:${DRAFT_LAST_COLUMN}${DRAFT_MAX_ROWS}`);
      }
      const token = await writeToken();
      const titles = await sheetTitles(token);
      if (!titles.has(title)) throw new Error(`Escritura rechazada: la hoja ${title} no existe (el motor no crea hojas)`);
      const range = `${quote(title)}!A1:${DRAFT_LAST_COLUMN}${values.length}`;
      await call(`${base}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, token, {
        method: "PUT",
        body: JSON.stringify({ range, majorDimension: "ROWS", values }),
      });
      if (values.length < DRAFT_MAX_ROWS) {
        const rest = `${quote(title)}!A${values.length + 1}:${DRAFT_LAST_COLUMN}${DRAFT_MAX_ROWS}`;
        await call(`${base}/values/${encodeURIComponent(rest)}:clear`, token, { method: "POST", body: "{}" });
      }
    },
  };
}
