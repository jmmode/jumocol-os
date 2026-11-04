import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { ShiftChecklist } from "@/features/tiviplay-atencion/shift-checklist";
import { WorkdayPanel } from "@/features/tiviplay-atencion/workday-panel";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";
import { getTiviplayWorkday } from "@/server/tiviplay-live/workday";

export const metadata: Metadata = { title: "TiviPlay · Apertura de turno" };
export const dynamic = "force-dynamic";

export default async function TiviplayTurnoPage() {
  const actor = await requirePage("/operaciones/tiviplay/turno");
  const result = await getTiviplayWorkday();
  audit(actor.id, "tiviplay-turno", "read", result.ok ? "SUCCESS" : "UNAVAILABLE");
  return (
    <div>
      <PageHeader
        badge={result.ok ? (result.source.mode === "SNAPSHOT" ? "Captura local" : "Fuente viva") : "Fuente no disponible"}
        description="Apertura diaria: cartera, clientes a contactar, importes por moneda y créditos, desde las mismas lecturas de Runtime y HOY. Solo lectura."
        eyebrow="Operaciones · TiviPlay"
        title="Apertura de turno"
      />
      <TiviplayNavigation />
      <WorkdayPanel admin={actor.role === "ADMIN"} result={result} />
      <ShiftChecklist today={bogotaToday()} />
    </div>
  );
}
