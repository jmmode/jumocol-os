import Link from "next/link";

import type { AreaDefinition, AreaTone } from "@/config/areas";

const toneClasses: Record<AreaTone, { accent: string; index: string; surface: string }> = {
  blue: {
    accent: "bg-brand-blue",
    index: "bg-brand-blue-soft text-brand-primary-dark",
    surface: "hover:border-brand-blue",
  },
  cyan: {
    accent: "bg-brand-cyan",
    index: "bg-brand-cyan/25 text-brand-primary-dark",
    surface: "hover:border-brand-cyan",
  },
  green: {
    accent: "bg-brand-green",
    index: "bg-brand-green/12 text-status-success",
    surface: "hover:border-brand-green",
  },
  yellow: {
    accent: "bg-brand-yellow",
    index: "bg-brand-yellow/15 text-brand-text ring-1 ring-status-warning/25",
    surface: "hover:border-brand-yellow",
  },
  red: {
    accent: "bg-brand-red",
    index: "bg-brand-red/10 text-status-error",
    surface: "hover:border-brand-red",
  },
};

type AreaCardProps = {
  area: AreaDefinition;
};

export function AreaCard({ area }: AreaCardProps) {
  const tone = toneClasses[area.tone];
  const isActiveModule = area.id === "marketing-commercial";

  return (
    <Link
      className={`group relative overflow-hidden rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] transition duration-200 hover:-translate-y-1 sm:p-6 ${tone.surface}`}
      href={area.href}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${tone.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <span className={`flex size-10 items-center justify-center rounded-2xl text-xs font-black tracking-[0.08em] ${tone.index}`}>
          {area.index}
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
            isActiveModule ? "bg-brand-blue-soft text-status-info" : "bg-brand-surface text-brand-muted"
          }`}
        >
          {isActiveModule ? "Módulo activo" : "Vista base"}
        </span>
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-brand-text">{area.label}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-brand-muted">{area.description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-brand-primary">
        Abrir área
        <span aria-hidden="true" className="text-base transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
