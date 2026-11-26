import "server-only";

import { cache } from "react";
import { GoogleAuth } from "google-auth-library";

import {
  summarizeCommercialLeads,
  type CommercialLead,
} from "@/domain/commercial-lead";
import { getGoogleSheetsLeadConfig } from "@/server/leads/google-sheets/config";
import { mapGoogleSheetsLeadValues } from "@/server/leads/google-sheets/mapper";
import type { LeadRepository } from "@/server/leads/lead-repository";
import { LeadRepositoryError } from "@/server/leads/lead-repository";

const READ_ONLY_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

type GoogleSheetsValuesResponse = {
  range?: string;
  majorDimension?: string;
  values?: string[][];
};

const readGoogleSheetsLeads = cache(async (): Promise<readonly CommercialLead[]> => {
  const config = getGoogleSheetsLeadConfig();
  const auth = new GoogleAuth({
    credentials: {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    },
    scopes: [READ_ONLY_SHEETS_SCOPE],
  });
  const escapedSheetName = config.sheetName.replaceAll("'", "''");
  const range = encodeURIComponent(`'${escapedSheetName}'!A:X`);
  const spreadsheetId = encodeURIComponent(config.spreadsheetId);

  let values: string[][];

  try {
    const response = await auth.request<GoogleSheetsValuesResponse>({
      method: "GET",
      retry: true,
      retryConfig: {
        httpMethodsToRetry: ["GET"],
        retry: 2,
        statusCodesToRetry: [[429, 429], [500, 599]],
      },
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?majorDimension=ROWS`,
    });
    values = response.data.values ?? [];
  } catch {
    throw new LeadRepositoryError(
      "No fue posible leer la fuente comercial autorizada en Google Sheets.",
    );
  }

  return mapGoogleSheetsLeadValues(values);
});

export class GoogleSheetsLeadRepository implements LeadRepository {
  async listLeads() {
    return readGoogleSheetsLeads();
  }

  async getLeadById(id: string) {
    const leads = await readGoogleSheetsLeads();
    return leads.find((lead) => lead.id === id) ?? null;
  }

  async getLeadSummary() {
    const leads = await readGoogleSheetsLeads();
    return summarizeCommercialLeads(leads);
  }
}
