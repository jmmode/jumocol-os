import { operationalRuntime } from "@/server/tiviplay-live/runtime-access";
import { audit } from "@/server/auth/store";
import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { TiviplayRuntimeDashboard } from "@/features/tiviplay-runtime/tiviplay-runtime-dashboard";
import { getTiviplayMonthlyCloseLive, type TiviplayMonthlyCloseLive } from "@/server/tiviplay-live/monthly-close";
import { bogotaToday, getTiviplayRuntimeLive } from "@/server/tiviplay-live/runtime-source";

export const metadata: Metadata = {
  title: "TiviPlay · Runtime Operativo",
};

export const dynamic = "force-dynamic";

export default async function TiviplayRuntimePage({ searchParams }: { searchParams: Promise<{ refresh?: string; month?: string }> }) {
  const identity = await requirePage("/operaciones/tiviplay/runtime");
  const { refresh, month } = await searchParams;
  // Cierre mensual (Runtime V1): mismo mes por defecto que la versión validada, seleccionable con ?month=YYYY-MM.
  const closeMonth = month ?? process.env.TIVIPLAY_TARGET_MONTH ?? bogotaToday().slice(0, 7);
  const [runtime, close] = await Promise.allSettled([
    getTiviplayRuntimeLive({ force: refresh === "1" }),
    getTiviplayMonthlyCloseLive(closeMonth),
  ]);
  const model = runtime.status === "fulfilled" ? runtime.value : null;
  const monthlyClose: TiviplayMonthlyCloseLive | null = close.status === "fulfilled" ? close.value : null;
  const closeError = close.status === "rejected" ? "Fuente de cierre temporalmente no disponible" : null;

  audit(identity.id, "tiviplay-runtime", refresh === "1" ? "refresh" : "read", model ? "SUCCESS" : "UNAVAILABLE");
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones/tiviplay">TiviPlay</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">Runtime Operativo</span>
      </nav>

      <PageHeader
        badge={model ? "Datos vivos · Google Sheets" : "Fuente no disponible"}
        description="Recaudo, cartera, clientes y paneles del mes en curso, calculados desde las hojas vigentes del libro de pagos. Cada indicador expone su cadena fuente → regla → cálculo."
        eyebrow="Operaciones · TiviPlay"
        title="Runtime Operativo"
      />
      <TiviplayNavigation />

      {model ? (
        <TiviplayRuntimeDashboard closeError={closeError} closeMonth={closeMonth} model={operationalRuntime(model)} managementModel={identity.role === "ADMIN" ? model : undefined} monthlyClose={monthlyClose} />
      ) : (
        <p className="mt-6 rounded-2xl border border-brand-red/30 bg-brand-red/5 px-5 py-4 text-sm text-status-error">
          BLOQUEADO: no fue posible leer Google Sheets (fuente temporalmente no disponible). No se muestran indicadores sin fuente viva.
        </p>
      )}
    </div>
  );
}
