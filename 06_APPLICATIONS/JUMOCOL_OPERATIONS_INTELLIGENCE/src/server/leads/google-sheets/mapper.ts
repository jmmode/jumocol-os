import type {
  CommercialLead,
  CommercialLeadStage,
} from "@/domain/commercial-lead";
import { LeadRepositoryError } from "@/server/leads/lead-repository";

const REQUIRED_HEADERS = [
  "created_at",
  "lead_id",
  "producto_interes",
  "source",
  "landing_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "nombre",
  "empresa",
  "whatsapp",
  "email",
  "necesidad",
  "mensaje",
  "consent_privacy",
  "status",
  "owner",
  "next_action_at",
  "notes",
  "consent_version",
  "consent_at",
  "consent_purpose",
] as const;

type SourceStageMapping = {
  stage: CommercialLeadStage;
  sourceStage: string | null;
};

function normalizeOptionalValue(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseConsent(value: string | undefined): boolean | null {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "TRUE" || normalized === "SI" || normalized === "SÍ") {
    return true;
  }

  if (normalized === "FALSE" || normalized === "NO") {
    return false;
  }

  return null;
}

export function mapSourceStage(value: string | undefined): SourceStageMapping {
  const sourceStage = normalizeOptionalValue(value)?.toUpperCase() ?? null;

  switch (sourceStage) {
    case "NUEVO":
      return { stage: "NEW_LEAD", sourceStage };
    default:
      return { stage: "UNKNOWN", sourceStage };
  }
}

function createHeaderIndex(headers: readonly string[]): Map<string, number> {
  const headerIndex = new Map(
    headers.map((header, index) => [header.trim().toLowerCase(), index]),
  );
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headerIndex.has(header));

  if (missingHeaders.length > 0) {
    throw new LeadRepositoryError(
      `La pestaña LEADS no cumple el contrato de columnas. Faltan: ${missingHeaders.join(", ")}.`,
    );
  }

  return headerIndex;
}

function readCell(
  row: readonly string[],
  headerIndex: ReadonlyMap<string, number>,
  header: (typeof REQUIRED_HEADERS)[number],
): string | undefined {
  const index = headerIndex.get(header);
  return index === undefined ? undefined : row[index];
}

function mapRow(
  row: readonly string[],
  headerIndex: ReadonlyMap<string, number>,
  sheetRowNumber: number,
): CommercialLead {
  const id = normalizeOptionalValue(readCell(row, headerIndex, "lead_id"));
  const createdAt = normalizeOptionalValue(readCell(row, headerIndex, "created_at"));

  if (!id || !createdAt) {
    throw new LeadRepositoryError(
      `La fila ${sheetRowNumber} de LEADS no contiene lead_id y created_at válidos.`,
    );
  }

  const sourceStage = mapSourceStage(readCell(row, headerIndex, "status"));

  return {
    id,
    createdAt,
    product: normalizeOptionalValue(readCell(row, headerIndex, "producto_interes")),
    source: normalizeOptionalValue(readCell(row, headerIndex, "source")),
    landingPath: normalizeOptionalValue(readCell(row, headerIndex, "landing_path")),
    utmSource: normalizeOptionalValue(readCell(row, headerIndex, "utm_source")),
    utmMedium: normalizeOptionalValue(readCell(row, headerIndex, "utm_medium")),
    utmCampaign: normalizeOptionalValue(readCell(row, headerIndex, "utm_campaign")),
    utmContent: normalizeOptionalValue(readCell(row, headerIndex, "utm_content")),
    utmTerm: normalizeOptionalValue(readCell(row, headerIndex, "utm_term")),
    contactName: normalizeOptionalValue(readCell(row, headerIndex, "nombre")),
    companyName: normalizeOptionalValue(readCell(row, headerIndex, "empresa")),
    phone: normalizeOptionalValue(readCell(row, headerIndex, "whatsapp")),
    email: normalizeOptionalValue(readCell(row, headerIndex, "email")),
    need: normalizeOptionalValue(readCell(row, headerIndex, "necesidad")),
    message: normalizeOptionalValue(readCell(row, headerIndex, "mensaje")),
    stage: sourceStage.stage,
    sourceStage: sourceStage.sourceStage,
    owner: normalizeOptionalValue(readCell(row, headerIndex, "owner")),
    nextActionAt: normalizeOptionalValue(readCell(row, headerIndex, "next_action_at")),
    notes: normalizeOptionalValue(readCell(row, headerIndex, "notes")),
    privacyConsent: {
      granted: parseConsent(readCell(row, headerIndex, "consent_privacy")),
      version: normalizeOptionalValue(readCell(row, headerIndex, "consent_version")),
      grantedAt: normalizeOptionalValue(readCell(row, headerIndex, "consent_at")),
      purpose: normalizeOptionalValue(readCell(row, headerIndex, "consent_purpose")),
    },
  };
}

export function mapGoogleSheetsLeadValues(
  values: readonly (readonly string[])[],
): readonly CommercialLead[] {
  const [headers, ...rows] = values;

  if (!headers) {
    throw new LeadRepositoryError("La pestaña LEADS no contiene encabezados.");
  }

  const headerIndex = createHeaderIndex(headers);

  return rows
    .map((row, index) => ({ row, sheetRowNumber: index + 2 }))
    .filter(({ row }) => row.some((value) => value.trim().length > 0))
    .map(({ row, sheetRowNumber }) => mapRow(row, headerIndex, sheetRowNumber));
}
