import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { TiviplayPaymentsDashboard } from "@/features/tiviplay-payments/tiviplay-payments-dashboard";
import { loadTiviplayPaymentsSnapshot } from "@/server/tiviplay-payments/excel-source";

export const metadata: Metadata = {
  title: "TiviPlay · Gestión de pagos",
};

export const dynamic = "force-dynamic";

export default async function TiviplayPaymentsPage() {
  await requirePage("/operaciones/tiviplay/pagos");
  const snapshot = await loadTiviplayPaymentsSnapshot();
  return <TiviplayPaymentsDashboard initialSnapshot={snapshot} />;
}
