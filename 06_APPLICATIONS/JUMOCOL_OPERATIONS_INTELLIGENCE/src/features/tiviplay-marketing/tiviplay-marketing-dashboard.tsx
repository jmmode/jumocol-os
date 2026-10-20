import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import type { TiviplayDailyActivity, TiviplayMarketingSnapshot } from "@/features/tiviplay-marketing/types";
import { WorkflowStageCard } from "@/features/tiviplay-marketing/workflow-stage-card";

type MetricKey = "conversations" | "leads" | "sales" | "collections";

const METRIC_DEFINITIONS: readonly { key: MetricKey; label: string }[] = [
  { key: "conversations", label: "Conversaciones" },
  { key: "leads", label: "Leads" },
  { key: "sales", label: "Ventas" },
  { key: "collections", label: "Recaudo" },
];

function getMetricDisplayValue(activity: TiviplayDailyActivity, key: MetricKey): string {
  const value = activity[key];

  return value === null ? "Pendiente de medición" : String(value);
}

type TiviplayMarketingDashboardProps = {
  snapshot: TiviplayMarketingSnapshot;
};

export function TiviplayMarketingDashboard({ snapshot }: TiviplayMarketingDashboardProps) {
  const completedStages = snapshot.workflow.filter((stage) => stage.status === "completed").length;
  const currentBacklog = snapshot.backlog.filter((item) => item.horizon === "current");
  const futureBacklog = snapshot.backlog.filter((item) => item.horizon === "future");
  const activity = snapshot.activity;

  return (
    <div>
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="transition hover:text-brand-primary" href="/marketing-comercial">
          Marketing & Comercial
        </Link>
        <span aria-hidden="true" className="text-brand-primary">→</span>
        <span aria-current="page" className="text-brand-text">TiviPlay Marketing</span>
      </nav>

      <PageHeader
        badge={snapshot.source.label}
        description="Workflow operativo diario para generar conversaciones, ventas y recaudo desde contenidos comerciales de TiviPlay."
        eyebrow="Marketing & Comercial · Unidad TiviPlay"
        title="TiviPlay Marketing"
      />

      <dl className="mt-6 grid gap-3 rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Marca / unidad</dt>
          <dd className="mt-2 text-sm font-semibold text-brand-text">TiviPlay</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Área</dt>
          <dd className="mt-2 text-sm font-semibold text-brand-text">Marketing & Comercial</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Objetivo</dt>
          <dd className="mt-2 text-sm font-semibold text-brand-text">Generar conversaciones, ventas y recaudo</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Estado</dt>
          <dd className="mt-2 inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-status-success">
            <span className="size-2 rounded-full bg-brand-green" />
            Activo
          </dd>
        </div>
      </dl>

      <aside className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-blue/25 bg-brand-blue-soft px-4 py-3 text-xs text-brand-primary-dark sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="font-bold">Modo demostración</span>
        <span className="text-status-info">{snapshot.source.disclosure}</span>
      </aside>

      <section className="mt-10" aria-labelledby="workflow-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Workflow diario</p>
            <h2 id="workflow-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">
              De la fuente a la medición
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
              La publicación del día está completada; la medición concentra ahora la siguiente acción operacional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.1em]">
            <span className="rounded-full bg-brand-green/10 px-3 py-2 text-status-success">{completedStages} etapas completas</span>
            <span className="rounded-full bg-brand-yellow/15 px-3 py-2 text-brand-text ring-1 ring-status-warning/25">
              Próxima: {activity.nextAction}
            </span>
          </div>
        </div>

        <div aria-hidden="true" className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-border bg-brand-background p-3 text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary-dark">
          {snapshot.workflow.map((stage, index) => (
            <div key={stage.id} className="contents">
              <span className={stage.status === "completed" ? "rounded-full bg-brand-green/10 px-3 py-2 text-status-success" : "rounded-full bg-brand-yellow/15 px-3 py-2 text-brand-text"}>
                {stage.label}
              </span>
              {index < snapshot.workflow.length - 1 ? <span className="text-brand-primary">→</span> : null}
            </div>
          ))}
        </div>

        <ol className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="tiviplay-workflow">
          {snapshot.workflow.map((stage) => (
            <WorkflowStageCard key={stage.id} stage={stage} />
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="runtime-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Ejecución registrada</p>
            <h2 id="runtime-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Runtime de hoy</h2>
          </div>
          <span className="w-fit rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-status-success">
            {activity.statusLabel}
          </span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <article className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-7">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Fecha</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text"><time dateTime={activity.date}>{activity.dateLabel}</time></dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Marca</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text">{activity.brand}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Tipo</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text">{activity.source}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Canal</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text">{activity.channel}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Objetivo</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text">{activity.objective}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Responsable</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-text">{activity.responsible}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-muted">Próxima acción</dt>
                <dd className="mt-2 text-sm font-semibold text-brand-primary-dark">{activity.nextAction}</dd>
              </div>
            </dl>
          </article>

          <aside className="rounded-3xl bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)] sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Métricas preparadas</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {METRIC_DEFINITIONS.map((metric) => (
                <div key={metric.key} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-cyan">{metric.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-white">{getMetricDisplayValue(activity, metric.key)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-cyan">Observaciones / aprendizaje</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{activity.learning ?? "Pendiente de registrar"}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="actions-title">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Backlog operativo</p>
          <h2 id="actions-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Próximas acciones</h2>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-brand-text">Acciones actuales</h3>
              <span className="rounded-full bg-brand-blue-soft px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-status-info">Ahora</span>
            </div>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {currentBacklog.map((item, index) => (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4 text-sm leading-6 text-brand-graphite">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-blue-soft text-[10px] font-black text-status-info">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ol>
          </article>

          <aside className="rounded-3xl border border-brand-blue/25 bg-brand-blue-soft p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-status-info">Automatización futura</p>
            {futureBacklog.map((item) => (
              <p key={item.id} className="mt-4 text-lg font-semibold leading-7 tracking-[-0.02em] text-brand-primary-dark">{item.label}</p>
            ))}
            <p className="mt-4 text-sm leading-6 text-brand-muted">Dirección prevista; no representa una automatización implementada.</p>
          </aside>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="automation-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Evolución controlada</p>
            <h2 id="automation-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Nivel de automatización</h2>
          </div>
          <span className="w-fit rounded-full bg-brand-primary-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">Actual: Manual asistido</span>
        </div>

        <div aria-hidden="true" className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em]">
          {snapshot.automationLevels.map((level, index) => (
            <div key={level.id} className="contents">
              <span className={level.state === "current" ? "rounded-full bg-brand-primary-dark px-3 py-2 text-white" : "rounded-full border border-brand-border bg-brand-background px-3 py-2 text-brand-muted"}>
                {level.label}
              </span>
              {index < snapshot.automationLevels.length - 1 ? <span className="text-brand-primary">→</span> : null}
            </div>
          ))}
        </div>

        <ol className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {snapshot.automationLevels.map((level, index) => (
            <li
              key={level.id}
              className={level.state === "current" ? "rounded-3xl bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)]" : "rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)]"}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={level.state === "current" ? "text-xs font-black text-brand-cyan" : "text-xs font-black text-brand-primary"}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={level.state === "current" ? "rounded-full border border-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-cyan" : "rounded-full bg-brand-surface px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted"}>
                  {level.state === "current" ? "Estado actual" : "Evolución prevista"}
                </span>
              </div>
              <h3 className={level.state === "current" ? "mt-5 text-lg font-semibold uppercase tracking-[-0.02em] text-white" : "mt-5 text-lg font-semibold uppercase tracking-[-0.02em] text-brand-text"}>
                {level.label}
              </h3>
              <p className={level.state === "current" ? "mt-3 text-sm leading-6 text-white/70" : "mt-3 text-sm leading-6 text-brand-muted"}>
                {level.description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
