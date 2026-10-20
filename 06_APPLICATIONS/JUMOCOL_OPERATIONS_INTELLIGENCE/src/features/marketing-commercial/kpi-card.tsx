import type { KpiTone, MarketingKpi } from "@/features/marketing-commercial/types";

const toneClasses: Record<KpiTone, { accent: string; value: string; marker: string }> = {
  blue: {
    accent: "bg-brand-blue",
    value: "text-brand-primary-dark",
    marker: "bg-brand-blue-soft text-status-info",
  },
  cyan: {
    accent: "bg-brand-cyan",
    value: "text-brand-primary-dark",
    marker: "bg-brand-cyan/25 text-brand-primary-dark",
  },
  green: {
    accent: "bg-brand-green",
    value: "text-brand-text",
    marker: "bg-brand-green/12 text-status-success",
  },
  yellow: {
    accent: "bg-brand-yellow",
    value: "text-brand-text",
    marker: "bg-brand-yellow/15 text-brand-text ring-1 ring-status-warning/25",
  },
  navy: {
    accent: "bg-brand-primary-dark",
    value: "text-brand-primary-dark",
    marker: "bg-brand-primary-dark/10 text-brand-primary-dark",
  },
};

type KpiCardProps = {
  kpi: MarketingKpi;
  sequence: number;
};

export function KpiCard({ kpi, sequence }: KpiCardProps) {
  const tone = toneClasses[kpi.tone];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
      <span className={`absolute inset-x-0 top-0 h-1 ${tone.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <dt className="text-xs font-black uppercase tracking-[0.14em] text-brand-muted">{kpi.label}</dt>
        <span className={`flex size-7 items-center justify-center rounded-full text-[9px] font-black ${tone.marker}`}>
          {String(sequence).padStart(2, "0")}
        </span>
      </div>
      <dd className={`mt-5 text-[2rem] font-semibold leading-none tracking-[-0.055em] sm:text-[2.35rem] ${tone.value}`}>
        {kpi.value}
      </dd>
      <p className="mt-3 text-xs leading-5 text-brand-muted">{kpi.context}</p>
    </div>
  );
}
