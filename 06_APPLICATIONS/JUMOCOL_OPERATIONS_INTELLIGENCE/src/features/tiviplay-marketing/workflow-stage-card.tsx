import type {
  TiviplayWorkflowStage,
  TiviplayWorkflowStageStatus,
} from "@/features/tiviplay-marketing/types";

const statusClasses: Record<
  TiviplayWorkflowStageStatus,
  { accent: string; badge: string; marker: string }
> = {
  completed: {
    accent: "bg-brand-green",
    badge: "border-brand-green/40 bg-brand-green/10 text-status-success",
    marker: "bg-brand-green/12 text-status-success",
  },
  next: {
    accent: "bg-brand-yellow",
    badge: "border-status-warning/40 bg-brand-yellow/15 text-brand-text",
    marker: "bg-brand-yellow/15 text-brand-text ring-1 ring-status-warning/25",
  },
};

type WorkflowStageCardProps = {
  stage: TiviplayWorkflowStage;
};

export function WorkflowStageCard({ stage }: WorkflowStageCardProps) {
  const status = statusClasses[stage.status];

  return (
    <li className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${status.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-2xl text-[10px] font-black ${status.marker}`}>
          {String(stage.sequence).padStart(2, "0")}
        </span>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${status.badge}`}>
          <span className={`size-2 rounded-full ${status.accent}`} />
          {stage.statusLabel}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-brand-text">{stage.label}</h3>
      <ul className="mt-4 space-y-2.5 border-t border-brand-border pt-4 text-xs leading-5 text-brand-muted">
        {stage.items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}
