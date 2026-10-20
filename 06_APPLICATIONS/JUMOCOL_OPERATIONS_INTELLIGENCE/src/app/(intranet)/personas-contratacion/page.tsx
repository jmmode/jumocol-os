import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { AreaOverview } from "@/components/areas/area-overview";

export const metadata: Metadata = {
  title: "Personas y contratación",
};

export default async function PeopleHiringPage() {
  await requirePage("/personas-contratacion");
  return <AreaOverview areaId="people-hiring" />;
}
