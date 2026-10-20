import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { AreaOverview } from "@/components/areas/area-overview";

export const metadata: Metadata = {
  title: "Operaciones",
};

export default async function OperationsPage() {
  await requirePage("/operaciones");
  return <AreaOverview areaId="operations" />;
}
