import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { ShiftChecklist } from "@/features/tiviplay-atencion/shift-checklist";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";

export const metadata: Metadata = { title: "TiviPlay · Apertura de turno" };
export const dynamic = "force-dynamic";

export default async function TiviplayTurnoPage() {
  const actor = await requirePage("/operaciones/tiviplay/turno");
  audit(actor.id, "tiviplay-turno", "read", "SUCCESS");
  return (
    <div>
      <PageHeader
        badge="Sin datos simulados"
        description="Recorrido de inicio de turno. Cada punto abre su fuente autorizada; aquí no se muestran cifras ni clientes."
        eyebrow="Operaciones · TiviPlay"
        title="Apertura de turno"
      />
      <TiviplayNavigation />
      <ShiftChecklist today={bogotaToday()} />
    </div>
  );
}
