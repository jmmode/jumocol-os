import type { ClientWebLifecycleStage } from "@/features/client-web-delivery/types";

type LifecycleStageCardProps = {
  stage: ClientWebLifecycleStage;
};

export function LifecycleStageCard({ stage }: LifecycleStageCardProps) {
  return (
    <li className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
      <span className="absolute inset-x-0 top-0 h-1 bg-brand-green" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-status-success">
            Etapa {String(stage.sequence).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-lg font-semibold uppercase tracking-[-0.025em] text-brand-text">{stage.name}</h3>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-green/12 text-[10px] font-black text-status-success">
          {String(stage.sequence).padStart(2, "0")}
        </span>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-brand-muted">{stage.purpose}</p>

      <dl className="mt-5 space-y-4 border-t border-brand-border pt-5">
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Condición de entrada</dt>
          <dd className="mt-1.5 text-xs leading-5 text-brand-graphite">{stage.entryCondition}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Actividad principal</dt>
          <dd className="mt-1.5 text-xs leading-5 text-brand-graphite">{stage.primaryActivity}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Condición de salida</dt>
          <dd className="mt-1.5 text-xs leading-5 text-brand-graphite">{stage.exitCondition}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl bg-brand-surface p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Responsable conceptual</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-brand-text">{stage.conceptualOwner}</p>
        <p className="mt-3 border-t border-brand-border pt-3 text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Siguiente acción</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-status-info">{stage.nextAction}</p>
      </div>
    </li>
  );
}
