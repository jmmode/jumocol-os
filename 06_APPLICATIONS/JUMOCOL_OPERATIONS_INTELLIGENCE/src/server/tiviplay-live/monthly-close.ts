import "server-only";

import crypto from "node:crypto";
import { GoogleAuth } from "google-auth-library";

import { getGoogleSheetsLeadConfig } from "@/server/leads/google-sheets/config";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

type ReviewReason =
  | "POSSIBLE_NO_RENEWAL"
  | "POSSIBLE_FREE_MONTH"
  | "EXPLICIT_EXCEPTION";

type CloseStatus = "VALIDADO_TECNICO" | "PARCIAL";

export type TiviplayMonthlyCloseLive = {
  generatedAt: string;
  status: CloseStatus;
  source: {
    workbook: "GESTION_DIA_PAGOS_2026_TIVIPLAY";
    sheet: "BASE GENERAL";
    targetMonth: string;
    stableDuringRead: boolean;
  };
  summary: {
    total: number;
    weeks: [number, number, number, number, number];
    facturarCandidato: number;
    requiereRevision: number;
    duplicates: number;
    dataExceptions: number;
  };
  reviewReasons: Record<ReviewReason, number>;
  exceptions: Array<{
    sourceRow: number;
    type: "INVALID_NEXT_PAYMENT_DATE";
    rawValue: string;
  }>;
  signatures: {
    result: string;
    sourceRead1: string;
    sourceRead2: string;
  };
};

const clean = (value: unknown) => String(value ?? "").trim();
const canon = (value: unknown) =>
  clean(value).toLocaleUpperCase("es").replace(/\s+/g, " ");

function parseOperationalDate(value: unknown) {
  const s = clean(value);
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (!m) return null;

  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function weekBucket(isoDate: string) {
  const day = Number(isoDate.slice(-2));
  if (day <= 4) return 1;
  if (day <= 11) return 2;
  if (day <= 18) return 3;
  if (day <= 25) return 4;
  return 5;
}

function monthBounds(targetMonth: string) {
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    throw new Error("targetMonth must use YYYY-MM");
  }
  const [year, month] = targetMonth.split("-").map(Number);
  const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${targetMonth}-01`,
    end: `${targetMonth}-${String(endDay).padStart(2, "0")}`,
  };
}

function normalizeHeaders(row: unknown[]) {
  const map = new Map<string, number>();
  row.forEach((value, index) => {
    const key = canon(value);
    if (key) map.set(key, index);
  });
  return map;
}

function findHeaderRow(rows: unknown[][]) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const h = normalizeHeaders(rows[i] ?? []);
    if (h.has("TC") && h.has("CLIENTE")) return i;
  }
  throw new Error("BASE GENERAL header row not found");
}

function findColumn(headers: Map<string, number>, aliases: string[]) {
  for (const alias of aliases) {
    const key = canon(alias);
    if (headers.has(key)) return headers.get(key) ?? null;
  }
  return null;
}

function valueAt(row: unknown[], index: number | null) {
  return index == null ? "" : clean(row[index]);
}

function identityKey(
  row: unknown[],
  cols: {
    usuario: number | null;
    cliente: number | null;
    telefono: number | null;
    correo: number | null;
    panel: number | null;
  },
) {
  return [
    valueAt(row, cols.usuario),
    valueAt(row, cols.cliente),
    valueAt(row, cols.telefono) || valueAt(row, cols.correo),
    valueAt(row, cols.panel),
  ]
    .map(canon)
    .join("|");
}

function classifyReview(text: string): ReviewReason[] {
  const reasons: ReviewReason[] = [];
  const normalized = canon(text);

  if (/NO\s+RENUEV|NO\s+VA\s+RENOVAR|NO\s+RENOVAR/.test(normalized)) {
    reasons.push("POSSIBLE_NO_RENEWAL");
  }

  if (
    /MES\s+GRATIS|OTORGAR\s+MES\s+GRATIS|PDTE\s+MES\s+GRATIS|PENDIENTE\s+MES\s+GRATIS/.test(
      normalized,
    )
  ) {
    reasons.push("POSSIBLE_FREE_MONTH");
  }

  if (/EXCEPCI[ÓO]N/.test(normalized)) {
    reasons.push("EXPLICIT_EXCEPTION");
  }

  return reasons;
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function buildReadModel(rows: unknown[][], targetMonth: string) {
  const headerRowIndex = findHeaderRow(rows);
  const headers = normalizeHeaders(rows[headerRowIndex] ?? []);

  const cols = {
    tc: findColumn(headers, ["TC"]),
    cliente: findColumn(headers, ["CLIENTE"]),
    telefono: findColumn(headers, ["TELEFONO"]),
    correo: findColumn(headers, ["CORREO"]),
    estado: findColumn(headers, ["ESTADO"]),
    observaciones: findColumn(headers, ["OBSERVACIONES"]),
    usuario: findColumn(headers, ["USUARIO"]),
    panel: findColumn(headers, ["PANEL"]),
    proximoPago: findColumn(headers, ["F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"]),
    referido: findColumn(headers, ["REFERIDO"]),
  };

  if (cols.tc == null || cols.proximoPago == null) {
    throw new Error("BASE GENERAL requires TC and F. PRÓXIMO PAGO");
  }

  const bounds = monthBounds(targetMonth);
  const weeks: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  const reviewReasons: Record<ReviewReason, number> = {
    POSSIBLE_NO_RENEWAL: 0,
    POSSIBLE_FREE_MONTH: 0,
    EXPLICIT_EXCEPTION: 0,
  };
  const exceptions: TiviplayMonthlyCloseLive["exceptions"] = [];
  const identities = new Map<string, number[]>();
  const stableRows: Array<{
    sourceRow: number;
    nextPaymentDate: string;
    identityHash: string;
  }> = [];

  let total = 0;
  let requiereRevision = 0;

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (valueAt(row, cols.tc) !== "1") continue;

    const rawDate = valueAt(row, cols.proximoPago);
    const date = parseOperationalDate(rawDate);

    if (!date) {
      if (rawDate) {
        exceptions.push({
          sourceRow: i + 1,
          type: "INVALID_NEXT_PAYMENT_DATE",
          rawValue: rawDate,
        });
      }
      continue;
    }

    if (date < bounds.start || date > bounds.end) continue;

    total += 1;
    weeks[weekBucket(date) - 1] += 1;

    const reasons = classifyReview(
      [
        valueAt(row, cols.estado),
        valueAt(row, cols.observaciones),
        valueAt(row, cols.referido),
      ].join(" | "),
    );

    if (reasons.length) {
      requiereRevision += 1;
      for (const reason of reasons) reviewReasons[reason] += 1;
    }

    const identity = identityKey(row, cols);
    if (identity.replace(/\|/g, "")) {
      const list = identities.get(identity) ?? [];
      list.push(i + 1);
      identities.set(identity, list);
    }

    stableRows.push({
      sourceRow: i + 1,
      nextPaymentDate: date,
      identityHash: sha256(identity),
    });
  }

  const duplicates = [...identities.values()].filter((rows) => rows.length > 1).length;
  stableRows.sort((a, b) => a.sourceRow - b.sourceRow);

  return {
    total,
    weeks,
    requiereRevision,
    facturarCandidato: total - requiereRevision,
    duplicates,
    reviewReasons,
    exceptions,
    resultSignature: sha256(JSON.stringify(stableRows)),
  };
}

function getGoogleAuth() {
  // Reuse the same normalized Google Sheets credentials already proven by
  // the commercial leads integration. TiviPlay only overrides the workbook.
  const sharedGoogleConfig = getGoogleSheetsLeadConfig();

  return new GoogleAuth({
    credentials: {
      client_email: sharedGoogleConfig.clientEmail,
      private_key: sharedGoogleConfig.privateKey,
    },
    scopes: [SHEETS_SCOPE],
  });
}

async function readBaseGeneral() {
  const spreadsheetId = process.env.TIVIPLAY_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing TIVIPLAY_SPREADSHEET_ID");
  }

  const auth = getGoogleAuth();
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token?.token) throw new Error("Could not obtain Google access token");

  const a1 = "'BASE GENERAL'!A1:W5000";
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(a1)}?valueRenderOption=FORMATTED_VALUE`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token.token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Sheets read failed (${response.status})`);
  }

  const payload = (await response.json()) as { values?: unknown[][] };
  return payload.values ?? [];
}

export async function getTiviplayMonthlyCloseLive(
  targetMonth: string,
): Promise<TiviplayMonthlyCloseLive> {
  const rows1 = await readBaseGeneral();
  const sourceRead1 = sha256(JSON.stringify(rows1));
  const result = buildReadModel(rows1, targetMonth);

  const rows2 = await readBaseGeneral();
  const sourceRead2 = sha256(JSON.stringify(rows2));
  const stableDuringRead = sourceRead1 === sourceRead2;

  const status: CloseStatus =
    stableDuringRead && result.duplicates === 0 ? "VALIDADO_TECNICO" : "PARCIAL";

  return {
    generatedAt: new Date().toISOString(),
    status,
    source: {
      workbook: "GESTION_DIA_PAGOS_2026_TIVIPLAY",
      sheet: "BASE GENERAL",
      targetMonth,
      stableDuringRead,
    },
    summary: {
      total: result.total,
      weeks: result.weeks,
      facturarCandidato: result.facturarCandidato,
      requiereRevision: result.requiereRevision,
      duplicates: result.duplicates,
      dataExceptions: result.exceptions.length,
    },
    reviewReasons: result.reviewReasons,
    exceptions: result.exceptions,
    signatures: {
      result: result.resultSignature,
      sourceRead1,
      sourceRead2,
    },
  };
}
