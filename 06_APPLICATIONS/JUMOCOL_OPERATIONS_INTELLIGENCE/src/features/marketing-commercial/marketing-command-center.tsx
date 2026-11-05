import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/features/marketing-commercial/kpi-card";
import { OperationalCard } from "@/features/marketing-commercial/operational-card";
import type { MarketingCommercialSnapshot } from "@/features/marketing-commercial/types";

type MarketingCommandCenterProps = {
  snapshot: MarketingCommercialSnapshot;
};

export function MarketingCommandCenter({ snapshot }: MarketingCommandCenterProps) {
  const activeWorkstreams = snapshot.workstreams.filter((workstream) => workstream.status === "active").length;
  const buildingWorkstreams = snapshot.workstreams.length - activeWorkstreams;

  return (
    <div>
      <PageHeader
        badge={snapshot.source.label}
        description="Centro visual para entender el movimiento comercial, los frentes activos y la siguiente acción de cada iniciativa."
        eyebrow="Área 04 · Command Center"
        title="Marketing & Comercial"
      />

      <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand-blue/25 bg-brand-blue-soft px-4 py-3 text-xs text-brand-primary-dark sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="font-bold">Modo demostración</span>
        <span className="text-status-info">{snapshot.source.disclosure}</span>
      </aside>

      <section className="mt-8" aria-labelledby="commercial-kpis-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Pulso comercial</p>
            <h2 id="commercial-kpis-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">
              Indicadores principales
            </h2>
          </div>
          <p className="text-xs text-brand-muted">Valores estáticos para validación visual del MVP</p>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-5" data-testid="marketing-kpi-grid">
          {snapshot.kpis.map((kpi, index) => (
            <KpiCard key={kpi.id} kpi={kpi} sequence={index + 1} />
          ))}
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="commercial-workstreams-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Frentes operativos</p>
            <h2 id="commercial-workstreams-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">
              Qué está activo y qué sigue
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full bg-brand-green/10 px-3 py-2 text-status-success">{activeWorkstreams} activos</span>
            <span className="rounded-full bg-brand-yellow/15 px-3 py-2 text-brand-text ring-1 ring-status-warning/25">{buildingWorkstreams} en construcción</span>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2" data-testid="marketing-operational-grid">
          {snapshot.workstreams.map((workstream, index) => (
            <OperationalCard key={workstream.id} sequence={index + 1} workstream={workstream} />
          ))}
        </div>
      </section>
    </div>
  );
}
