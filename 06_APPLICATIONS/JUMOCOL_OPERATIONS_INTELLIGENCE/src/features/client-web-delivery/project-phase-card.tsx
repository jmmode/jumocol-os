import type { ClientWebProjectPhase } from "@/features/client-web-delivery/types";

type ProjectPhaseCardProps = {
  phase: ClientWebProjectPhase;
};

export function ProjectPhaseCard({ phase }: ProjectPhaseCardProps) {
  return (
    <article className="rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Fase de proyecto</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">{phase.name}</h3>
        </div>
        <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">
          Sin proyecto
        </span>
      </div>
      <p className="mt-3 min-h-12 text-xs leading-5 text-brand-muted">{phase.purpose}</p>
      <ul className="mt-5 space-y-2.5">
        {phase.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-brand-surface px-4 py-3">
            <span className="text-xs font-semibold text-brand-graphite">{item.label}</span>
            <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.08em] text-brand-muted">
              {item.status ?? "Sin evaluar"}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
