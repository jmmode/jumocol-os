import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";
import { connection } from "next/server";

import { LandingPageCommercialDashboard } from "@/features/landing-page-commercial/landing-page-commercial-dashboard";
import { getDataProvider } from "@/server/data/provider";

export const metadata: Metadata = {
  title: "Landing Page",
};

export default async function LandingPageCommercialPage() {
  await requirePage("/marketing-comercial/landing-page");
  await connection();
  const snapshot = await getDataProvider().marketingCommercial.getLandingPageSnapshot();

  return <LandingPageCommercialDashboard snapshot={snapshot} />;
}
