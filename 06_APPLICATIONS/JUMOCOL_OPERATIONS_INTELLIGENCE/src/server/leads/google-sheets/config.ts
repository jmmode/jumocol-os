import "server-only";

import { LeadRepositoryError } from "@/server/leads/lead-repository";

export type GoogleSheetsLeadConfig = {
  clientEmail: string;
  privateKey: string;
  spreadsheetId: string;
  sheetName: string;
};

function requireServerEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new LeadRepositoryError(
      `Falta la variable de entorno server-side requerida: ${name}`,
    );
  }

  return value;
}

export function getGoogleSheetsLeadConfig(): GoogleSheetsLeadConfig {
  const privateKey = requireServerEnvironmentVariable("GOOGLE_SHEETS_PRIVATE_KEY")
    .replace(/\\n/g, "\n")
    // OpenSSL rejects empty lines inside a PEM block, including before END.
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .join("\n");

  if (
    !privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new LeadRepositoryError(
      "GOOGLE_SHEETS_PRIVATE_KEY no contiene una clave privada PEM válida.",
    );
  }

  return {
    clientEmail: requireServerEnvironmentVariable("GOOGLE_SHEETS_CLIENT_EMAIL"),
    privateKey,
    spreadsheetId: requireServerEnvironmentVariable("COMMERCIAL_LEADS_SPREADSHEET_ID"),
    sheetName: requireServerEnvironmentVariable("COMMERCIAL_LEADS_SHEET_NAME"),
  };
}
