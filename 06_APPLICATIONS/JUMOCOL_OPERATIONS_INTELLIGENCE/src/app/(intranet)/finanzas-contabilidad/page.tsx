import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { AreaOverview } from "@/components/areas/area-overview";

export const metadata: Metadata = {
  title: "Finanzas y contabilidad",
};

export default async function FinanceAccountingPage() {
  await requirePage("/finanzas-contabilidad");
  return <AreaOverview areaId="finance-accounting" />;
}
