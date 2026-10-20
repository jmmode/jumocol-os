import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { TiviplayMarketingDashboard } from "@/features/tiviplay-marketing/tiviplay-marketing-dashboard";
import { getDataProvider } from "@/server/data/provider";

export const metadata: Metadata = {
  title: "TiviPlay Marketing",
};

export default async function TiviplayMarketingPage() {
  await requirePage("/marketing-comercial/tiviplay");
  const snapshot = await getDataProvider().marketingCommercial.getTiviplaySnapshot();

  return <TiviplayMarketingDashboard snapshot={snapshot} />;
}
