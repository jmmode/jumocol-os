import { GoogleAuth } from "google-auth-library";

import { isSensitiveHeader } from "./core.mjs";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const API = "https://sheets.googleapis.com/v4/spreadsheets";
const HEADER_SEARCH_ROWS = 20;

// Lectura de solo lectura que nunca solicita a la API las columnas sensibles
// (CONTRASEÑA y equivalentes): primero localiza la fila de encabezados fila por
// fila y después pide solo los tramos de columnas permitidos. Las columnas
// excluidas se devuelven vacías para conservar las posiciones.
export async function readSheetValues({ spreadsheetId, sheetName, range = "A1:W5000" }, deps = {}) {
  if (!spreadsheetId) throw new Error("spreadsheetId is required");
  if (!sheetName) throw new Error("sheetName is required");

  const bounds = parseA1Range(range);
  const fetchImpl = deps.fetchImpl ?? fetch;
  const token = deps.accessToken ?? (await getAccessToken());
  const sheet = quoteSheet(sheetName);
  const base = `${API}/${encodeURIComponent(spreadsheetId)}`;

  const getJson = async (url) => {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      throw new Error(`Google Sheets read failed (${response.status})`);
    }
    return response.json();
  };

  const width = bounds.endCol - bounds.startCol + 1;
  const leading = [];
  let headerRow = null;

  for (let r = bounds.startRow; r <= Math.min(bounds.endRow, bounds.startRow + HEADER_SEARCH_ROWS - 1); r++) {
    const a1 = `${sheet}!${columnLetter(bounds.startCol)}${r}:${columnLetter(bounds.endCol)}${r}`;
    const payload = await getJson(`${base}/values/${encodeURIComponent(a1)}?valueRenderOption=FORMATTED_VALUE`);
    const row = payload.values?.[0] ?? [];
    leading.push(row);
    if (isHeaderRow(row)) {
      headerRow = r;
      break;
    }
  }

  if (headerRow == null) throw new Error("Header row not found");

  const header = leading[leading.length - 1];
  const sensitive = new Set(
    header.map((value, index) => (isSensitiveHeader(value) ? index : -1)).filter((index) => index >= 0),
  );
  if (headerRow === bounds.endRow) return leading;

  const segments = allowedSegments(width, sensitive);
  const params = new URLSearchParams({ valueRenderOption: "FORMATTED_VALUE" });
  for (const [from, to] of segments) {
    params.append(
      "ranges",
      `${sheet}!${columnLetter(bounds.startCol + from)}${headerRow + 1}:${columnLetter(bounds.startCol + to)}${bounds.endRow}`,
    );
  }
  const payload = await getJson(`${base}/values:batchGet?${params.toString()}`);
  const segmentValues = (payload.valueRanges ?? []).map((vr) => vr.values ?? []);

  return [...leading, ...stitchSegments(segments, segmentValues, width)];
}

export function parseA1Range(range) {
  const m = String(range).trim().toUpperCase().match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!m) throw new Error(`range must look like A1:W5000, received: ${range}`);
  const bounds = {
    startCol: columnIndex(m[1]),
    startRow: Number(m[2]),
    endCol: columnIndex(m[3]),
    endRow: Number(m[4]),
  };
  if (bounds.endCol < bounds.startCol || bounds.endRow < bounds.startRow) {
    throw new Error(`invalid range: ${range}`);
  }
  return bounds;
}

// Tramos [desde, hasta] (índices relativos, inclusivos) sin columnas sensibles.
export function allowedSegments(width, sensitive) {
  const segments = [];
  let start = null;
  for (let i = 0; i < width; i++) {
    if (sensitive.has(i)) {
      if (start != null) segments.push([start, i - 1]);
      start = null;
    } else if (start == null) {
      start = i;
    }
  }
  if (start != null) segments.push([start, width - 1]);
  return segments;
}

export function stitchSegments(segments, segmentValues, width) {
  const rowCount = Math.max(0, ...segmentValues.map((values) => values.length));
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const row = new Array(width).fill("");
    segments.forEach(([from, to], s) => {
      const values = segmentValues[s]?.[r] ?? [];
      for (let c = from; c <= to; c++) row[c] = values[c - from] ?? "";
    });
    while (row.length && row[row.length - 1] === "") row.pop();
    rows.push(row);
  }
  return rows;
}

// Claves privadas pegadas en .env (comillas, "\n" literales, CRLF de Windows)
// producen ERR_OSSL_UNSUPPORTED al firmar el JWT; se normalizan sin imprimirlas.
export function normalizePrivateKey(raw) {
  let key = String(raw ?? "").trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\r/g, "").replace(/\\n/g, "\n").replace(/\r/g, "").trim();
}

async function getAccessToken() {
  const client = await buildGoogleAuth().getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error("Could not obtain Google access token");
  return token.token;
}

function buildGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (clientEmail && privateKeyRaw) {
    return new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: normalizePrivateKey(privateKeyRaw),
      },
      scopes: [SHEETS_SCOPE],
    });
  }

  return new GoogleAuth({ scopes: [SHEETS_SCOPE] });
}

function isHeaderRow(row) {
  const keys = new Set(row.map((value) => String(value ?? "").trim().toLocaleUpperCase("es")));
  return keys.has("TC") && keys.has("CLIENTE");
}

function columnIndex(letters) {
  return [...letters].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
}

function columnLetter(index) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function quoteSheet(name) {
  return `'${String(name).replaceAll("'", "''")}'`;
}
