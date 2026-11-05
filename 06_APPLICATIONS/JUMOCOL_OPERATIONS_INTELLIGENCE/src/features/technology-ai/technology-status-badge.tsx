import type { TechnologyStatus } from "@/features/technology-ai/types";

const statusClasses: Record<TechnologyStatus, string> = {
  VALIDATED: "border-brand-green/40 bg-brand-green/10 text-status-success",
  ACTIVE: "border-brand-blue/30 bg-brand-blue-soft text-status-info",
  "IN VALIDATION": "border-brand-yellow/45 bg-brand-yellow/15 text-status-warning",
  PLANNED: "border-brand-border bg-brand-surface text-brand-muted",
  BLOCKED: "border-brand-red/35 bg-brand-red/10 text-status-error",
  DEPRECATED: "border-brand-graphite/25 bg-brand-graphite/8 text-brand-graphite line-through",
};

type TechnologyStatusBadgeProps = {
  status: TechnologyStatus;
  label?: string;
};

export function TechnologyStatusBadge({ status, label }: TechnologyStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] ${statusClasses[status]}`}
    >
      {label ?? status}
    </span>
  );
}
