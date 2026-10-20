import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { ClientWebDeliveryDashboard } from "@/features/client-web-delivery/client-web-delivery-dashboard";
import { getDataProvider } from "@/server/data/provider";

export const metadata: Metadata = {
  title: "Clientes Web",
};

export default async function ClientWebDeliveryPage() {
  await requirePage("/operaciones/clientes-web");
  const snapshot = await getDataProvider().operations.getClientWebDeliverySnapshot();

  return <ClientWebDeliveryDashboard snapshot={snapshot} />;
}
