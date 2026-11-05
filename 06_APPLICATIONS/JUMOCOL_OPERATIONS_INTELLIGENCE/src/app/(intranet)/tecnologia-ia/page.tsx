import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { TechnologyAiDashboard } from "@/features/technology-ai/technology-ai-dashboard";
import { getDataProvider } from "@/server/data/provider";

export const metadata: Metadata = {
  title: "Tecnología & Inteligencia Artificial",
};

export default async function TechnologyAiPage() {
  await requirePage("/tecnologia-ia");
  const snapshot = await getDataProvider().technologyAi.getSnapshot();

  return <TechnologyAiDashboard snapshot={snapshot} />;
}
