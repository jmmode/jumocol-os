import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { MarketingCommandCenter } from "@/features/marketing-commercial/marketing-command-center";
import { getDataProvider } from "@/server/data/provider";

export const metadata: Metadata = {
  title: "Marketing & Comercial",
};

export default async function MarketingCommercialPage() {
  await requirePage("/marketing-comercial");
  const snapshot = await getDataProvider().marketingCommercial.getSnapshot();

  return <MarketingCommandCenter snapshot={snapshot} />;
}
