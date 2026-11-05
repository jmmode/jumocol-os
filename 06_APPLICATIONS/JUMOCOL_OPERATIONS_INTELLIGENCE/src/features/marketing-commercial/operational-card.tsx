import Link from "next/link";

import type { MarketingWorkstream, WorkstreamStatus } from "@/features/marketing-commercial/types";

const statusClasses: Record<WorkstreamStatus, { badge: string; dot: string; accent: string }> = {
  active: {
    badge: "border-brand-green/40 bg-brand-green/10 text-status-success",
    dot: "bg-brand-green",
    accent: "bg-brand-green",
  },
  building: {
    badge: "border-status-warning/40 bg-brand-yellow/15 text-brand-text",
    dot: "bg-brand-yellow",
    accent: "bg-brand-yellow",
  },
};

type OperationalCardProps = {
  workstream: MarketingWorkstream;
  sequence: number;
};

export function OperationalCard({ workstream, sequence }: OperationalCardProps) {
  const status = statusClasses[workstream.status];

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-7">
      <span className={`absolute inset-y-0 left-0 w-1 ${status.accent}`} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-muted">
            Frente {String(sequence).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-brand-text sm:text-[1.35rem]">{workstream.title}</h3>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${status.badge}`}>
          <span className={`size-2 rounded-full ${status.dot}`} />
          {workstream.statusLabel}
        </span>
      </div>

      <dl className="mt-7 grid gap-5 border-t border-brand-border pt-6 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Objetivo</dt>
          <dd className="mt-2 text-sm font-semibold text-brand-graphite">{workstream.objective}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Actividad actual</dt>
          <dd className="mt-2 text-sm font-semibold text-brand-graphite">{workstream.currentActivity}</dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl bg-brand-blue-soft p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Próxima acción</p>
        <p className="mt-2 flex items-center justify-between gap-4 text-sm font-bold text-brand-primary-dark">
          <span>{workstream.nextAction}</span>
          <span aria-hidden="true" className="text-lg text-brand-primary">→</span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
        <span>{workstream.routeStatus === "available" ? "Módulo disponible" : "Ruta futura preparada"}</span>
        {workstream.routeStatus === "available" ? (
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary-dark px-4 py-2 font-black text-white transition hover:bg-brand-primary"
            href={workstream.futureHref}
          >
            Abrir módulo
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <code className="max-w-full overflow-hidden text-ellipsis rounded-lg bg-brand-surface px-2 py-1 font-mono normal-case tracking-normal text-brand-muted">
            {workstream.futureHref}
          </code>
        )}
      </div>
    </article>
  );
}
