import "server-only";

import type {
  CommercialLead,
  CommercialLeadSummary,
} from "@/domain/commercial-lead";

export interface LeadRepository {
  listLeads(): Promise<readonly CommercialLead[]>;
  getLeadById(id: string): Promise<CommercialLead | null>;
  getLeadSummary(): Promise<CommercialLeadSummary>;
}

export class LeadRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadRepositoryError";
  }
}
