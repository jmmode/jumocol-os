import { requirePage } from "@/server/auth/access";
import "server-only";

import { 
  GoogleSheetsLeadRepository 
} from "@/server/leads/google-sheets/google-sheets-lead-repository";
import { 
  loadTiviplayPaymentsSnapshot 
} from "@/server/tiviplay-payments/excel-source";
import { 
  TiviplayUnifiedDashboardPage 
} from "./tiviplay-unified-dashboard";

export default async function Page() {
  await requirePage("/operaciones/tiviplay/dashboard");
  try {
    // Corrected instantiation of LeadRepository
    const repository = new GoogleSheetsLeadRepository();
    const leads = await repository.listLeads();
    
    const commercialSummary = {
        totalLeads: leads.length,
    };

    // 2. Fetch Financial Data
    const paymentsSnapshot = await loadTiviplayPaymentsSnapshot();

    return (
      <TiviplayUnifiedDashboardPage 
        commercialData={commercialSummary}
        paymentsSnapshot={paymentsSnapshot}
      />
    );
  } catch (error) {
    console.error("TiviPlay Dashboard Error:", error);
    return (
      <div className="p-6 text-red-600">
        <h1 className="text-2xl font-bold">Error loading TiviPlay Dashboard</h1>
        <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
      </div>
    );
  }
}
