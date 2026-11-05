import "server-only";

import { GoogleSheetsLeadRepository } from "@/server/leads/google-sheets/google-sheets-lead-repository";
import type { LeadRepository } from "@/server/leads/lead-repository";
import { LeadRepositoryError } from "@/server/leads/lead-repository";

let googleSheetsLeadRepository: LeadRepository | null = null;

export function getLeadRepository(): LeadRepository {
  const repository = process.env.JUMOCOL_LEAD_REPOSITORY ?? "fixtures";

  if (repository !== "google-sheets") {
    throw new LeadRepositoryError(
      `Repositorio de leads no autorizado para lectura real: ${repository}`,
    );
  }

  googleSheetsLeadRepository ??= new GoogleSheetsLeadRepository();
  return googleSheetsLeadRepository;
}
