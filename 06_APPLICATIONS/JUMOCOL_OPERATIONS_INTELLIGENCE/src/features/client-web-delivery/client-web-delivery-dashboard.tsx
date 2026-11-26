import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { LifecycleStageCard } from "@/features/client-web-delivery/lifecycle-stage-card";
import { ProjectPhaseCard } from "@/features/client-web-delivery/project-phase-card";
import type { ClientWebDeliverySnapshot, ClientWebMetric } from "@/features/client-web-delivery/types";

const futureProjectStatuses = ["Pendiente", "En proceso", "Bloqueado", "En revisión", "Completado"] as const;

function getMetricDisplayValue(metric: ClientWebMetric): string {
  if (metric.value === null) {
    return "Pendiente de conexión";
  }

  if (metric.format === "duration") {
    return `${metric.value} días`;
  }

  return String(metric.value);
}

type ClientWebDeliveryDashboardProps = {
  snapshot: ClientWebDeliverySnapshot;
};

export function ClientWebDeliveryDashboard({ snapshot }: ClientWebDeliveryDashboardProps) {
  return (
    <div>
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="transition hover:text-brand-primary" href="/operaciones">
          Operaciones
        </Link>
        <span aria-hidden="true" className="text-brand-primary">→</span>
        <span aria-current="page" className="text-brand-text">Clientes Web</span>
      </nav>

      <PageHeader
        badge={snapshot.source.label}
        description="Centro operacional para convertir una venta cerrada en un proyecto web publicado, entregado y soportado."
        eyebrow="Operaciones · Entrega y Soporte"
        title="Clientes Web"
      />

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]" aria-labelledby="delivery-summary-title">
        <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary-dark p-7 text-white shadow-[var(--brand-shadow)] sm:p-9">
          <div className="absolute -top-24 -right-20 size-64 rounded-full bg-brand-green/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Producto inicial</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-brand-cyan">
                <span className="size-2 rounded-full bg-brand-green" />
                {snapshot.summary.statusLabel}
              </span>
            </div>
            <h2 id="delivery-summary-title" className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              {snapshot.summary.product}
            </h2>
            <span className="brand-accent-rule mt-6 block h-1.5 w-24 rounded-full" />
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70">{snapshot.summary.objective}</p>
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-xs font-semibold leading-5 text-white/80">
              {snapshot.summary.lifecycleLabel}
            </p>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-brand-border bg-brand-background p-7 shadow-[var(--brand-shadow)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Proyectos de Clientes Web</p>
          <p className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-brand-primary-dark">{snapshot.projects.count}</p>
          <p className="mt-2 text-sm font-semibold text-brand-text">proyectos reales</p>
          <div className="mt-6 rounded-2xl bg-brand-blue-soft p-4">
            <p className="text-xs font-bold text-brand-primary-dark">{snapshot.projects.disclosure}</p>
            <p className="mt-2 text-xs leading-5 text-brand-muted">No se crearon clientes ni proyectos de demostración.</p>
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8" aria-labelledby="conceptual-progress-title">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Lectura rápida del ciclo</p>
            <h2 id="conceptual-progress-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Progreso conceptual de un cliente</h2>
          </div>
          <span className="w-fit rounded-full bg-brand-yellow/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-text ring-1 ring-status-warning/25">
            Ejemplo · Sin cliente real
          </span>
        </div>
        <p className="mt-3 text-xs leading-5 text-brand-muted">{snapshot.conceptualProgress.disclosure}</p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8" data-testid="client-web-conceptual-progress">
          {snapshot.conceptualProgress.steps.map((step) => (
            <li
              key={step.id}
              className={`rounded-2xl border p-4 ${
                step.status === "completed"
                  ? "border-brand-green/35 bg-brand-green/10"
                  : step.status === "current"
                    ? "border-brand-blue/35 bg-brand-blue-soft"
                    : "border-brand-border bg-brand-surface"
              }`}
            >
              <span className={`flex size-7 items-center justify-center rounded-full text-xs font-black ${
                step.status === "completed"
                  ? "bg-brand-green text-white"
                  : step.status === "current"
                    ? "bg-brand-primary text-white"
                    : "border border-brand-border bg-brand-background text-brand-muted"
              }`}>
                {step.status === "completed" ? "✓" : step.status === "current" ? "→" : "○"}
              </span>
              <p className="mt-3 text-xs font-semibold text-brand-text">{step.label}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8" aria-labelledby="metrics-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Estado operacional</p>
            <h2 id="metrics-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Indicadores preparados</h2>
          </div>
          <span className="w-fit rounded-full border border-brand-border bg-brand-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">
            Sin datos conectados
          </span>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {snapshot.metrics.map((metric) => (
            <div key={metric.id} className="rounded-2xl border border-brand-border bg-brand-background p-4 shadow-[var(--brand-shadow)]">
              <dt className="text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-brand-muted">{metric.label}</dt>
              <dd className="mt-3 text-xl font-semibold tracking-[-0.04em] text-brand-primary-dark">{getMetricDisplayValue(metric)}</dd>
              <p className="mt-2 text-[10px] leading-4 text-brand-muted">{metric.context}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="responsibility-title">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Contrato entre áreas</p>
          <h2 id="responsibility-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Dónde termina Marketing y comienza Operaciones</h2>
        </div>

        <div aria-hidden="true" className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-border bg-brand-background p-3 text-[9px] font-black uppercase tracking-[0.09em] text-brand-primary-dark">
          {snapshot.responsibilities.path.map((step, index) => (
            <div key={step} className="contents">
              <span className={step === "Handoff" ? "rounded-full bg-brand-primary-dark px-3 py-2 text-white" : "rounded-full bg-brand-blue-soft px-3 py-2"}>{step}</span>
              {index < snapshot.responsibilities.path.length - 1 ? <span className="text-brand-primary">→</span> : null}
            </div>
          ))}
        </div>

        <div className="mt-5 grid overflow-hidden rounded-[2rem] border border-brand-border bg-brand-background shadow-[var(--brand-shadow)] xl:grid-cols-3">
          <article className="border-b border-brand-border p-6 sm:p-7 xl:border-r xl:border-b-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">{snapshot.responsibilities.commercial.name}</p>
            <p className="mt-3 text-sm font-semibold text-brand-text">Responsable hasta {snapshot.responsibilities.commercial.closesAt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot.responsibilities.commercial.stages.map((stage) => <span key={stage} className="rounded-full bg-brand-surface px-3 py-1.5 text-[10px] font-semibold text-brand-muted">{stage}</span>)}
            </div>
          </article>
          <article className="border-b border-brand-border bg-brand-blue-soft p-6 sm:p-7 xl:border-r xl:border-b-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-status-info">{snapshot.responsibilities.handoff.name}</p>
            <p className="mt-3 text-sm font-semibold text-brand-primary-dark">Transfiere el contexto mínimo de ejecución</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-semibold text-brand-muted">
              {snapshot.responsibilities.handoff.transfers.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </article>
          <article className="bg-brand-primary-dark p-6 text-white sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-cyan">{snapshot.responsibilities.operations.name}</p>
            <p className="mt-3 text-sm font-semibold">Responsable desde {snapshot.responsibilities.operations.startsAt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {snapshot.responsibilities.operations.stages.map((stage) => <span key={stage} className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-semibold text-white/80">{stage}</span>)}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="gates-title">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-status-warning">JUM_OPS_STD_CLIENT_001 · v1.0</p>
        <h2 id="gates-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Gates operacionales</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">Condiciones de transición visibles y auditables. Esta iteración no implementa bloqueos automáticos ni un motor de workflow.</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-5" data-testid="client-web-operational-gates">
          {snapshot.operationalGates.map((gate) => (
            <li key={gate.id} className="rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-status-warning">Gate {gate.sequence}</p>
                  <h3 className="mt-2 text-base font-semibold text-brand-text">{gate.name}</h3>
                </div>
                <span className="rounded-full bg-brand-primary-dark px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-white">{gate.requiredState}</span>
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-brand-primary-dark">Habilita: {gate.unlocks}</p>
              <p className="mt-3 text-[10px] leading-4 text-brand-muted">{gate.rule}</p>
              <p className="mt-3 border-t border-brand-border pt-3 text-[10px] leading-4 text-brand-muted"><strong className="text-brand-text">Evidencia:</strong> {gate.evidence}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-2xl bg-brand-blue-soft px-4 py-3 text-xs leading-5 text-brand-primary-dark">
          Reglas transversales: toda etapa requiere owner; los cambios de alcance se tratan como change request o nuevo requerimiento; los cambios críticos deben quedar preparados para auditoría.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="lifecycle-title">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-status-success">Ciclo completo</p>
        <h2 id="lifecycle-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">De venta cerrada a soporte</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">Cada etapa fija entrada, actividad, salida, responsable y siguiente acción sin ejecutar transferencias automáticas.</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="client-web-lifecycle">
          {snapshot.lifecycleStages.map((stage) => <LifecycleStageCard key={stage.id} stage={stage} />)}
        </ol>

        <div className="mt-6 rounded-3xl border border-brand-border bg-brand-surface p-5 sm:p-6" aria-labelledby="canonical-states-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 id="canonical-states-title" className="text-lg font-semibold text-brand-text">Catálogo canónico de estados</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">20 identificadores estables · entidades separadas</span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2" data-testid="client-web-canonical-states">
            {snapshot.canonicalStates.map((state) => (
              <li key={state.id} className={`rounded-full border px-3 py-2 text-[9px] font-black tracking-[0.06em] ${state.kind === "exception" ? "border-status-warning/40 bg-brand-yellow/15 text-brand-text" : "border-brand-border bg-brand-background text-brand-primary-dark"}`}>
                <span className="uppercase">{state.entity}</span>
                <span aria-hidden="true" className="px-1.5 text-brand-muted">·</span>
                {state.id}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="onboarding-title">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Onboarding</p>
        <h2 id="onboarding-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Información requerida</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">Checklist estructural; no es un formulario y no almacena información.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="client-web-onboarding">
          {snapshot.onboardingRequirements.map((category) => (
            <article key={category.id} className="rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-brand-text">{category.name}</h3>
                <span className="rounded-full bg-brand-surface px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">Requerido</span>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {category.requirements.map((requirement) => (
                  <li key={requirement.id} className="flex gap-2 rounded-xl bg-brand-surface px-3 py-2.5 text-xs text-brand-graphite">
                    <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full border-2 border-brand-primary" />
                    <span>{requirement.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="phases-title">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Control de ejecución</p>
            <h2 id="phases-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Fases del proyecto</h2>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Estados futuros soportados">
            {futureProjectStatuses.map((status) => <span key={status} className="rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-brand-muted">{status}</span>)}
          </div>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2" data-testid="client-web-phases">
          {snapshot.projectPhases.map((phase) => <ProjectPhaseCard key={phase.id} phase={phase} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-2">
        <div aria-labelledby="payment-contract-title" className="min-w-0 rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-status-warning">Contrato futuro de datos</p>
          <h2 id="payment-contract-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Payment</h2>
          <p className="mt-3 text-sm leading-6 text-brand-muted">{snapshot.paymentContract.disclosure}</p>
          <p className="mt-4 rounded-2xl bg-brand-yellow/15 px-4 py-3 text-xs font-black text-brand-text ring-1 ring-status-warning/25">{snapshot.paymentContract.distinction}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {snapshot.paymentContract.fields.map((field) => (
              <div key={field.id} className="rounded-2xl bg-brand-surface p-4">
                <dt className="break-words text-xs font-semibold text-brand-text">{field.label}</dt>
                <dd className="mt-2 text-[10px] leading-4 text-brand-muted">{field.purpose}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div aria-labelledby="handoff-contract-title" className="min-w-0 rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Contrato futuro de datos</p>
          <h2 id="handoff-contract-title" className="mt-2 break-words text-2xl font-semibold tracking-[-0.04em] text-brand-text">CommercialToOperationsHandoff</h2>
          <p className="mt-3 text-sm leading-6 text-brand-muted">{snapshot.handoffContract.disclosure}</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {snapshot.handoffContract.fields.map((field) => (
              <div key={field.id} className="rounded-2xl bg-brand-surface p-4">
                <dt className="text-xs font-semibold text-brand-text">{field.label}</dt>
                <dd className="mt-2 text-[10px] leading-4 text-brand-muted">{field.purpose}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-2xl bg-brand-blue-soft px-4 py-3 text-xs font-semibold text-brand-primary-dark">
            {snapshot.handoffContract.records.length} transferencias reales · Sin eventos ni persistencia
          </p>
        </div>
      </section>

      <aside aria-labelledby="alerts-title" className="mt-5 min-w-0 rounded-[2rem] bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)] sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.65fr)_minmax(0,1.35fr)] lg:items-start">
          <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Control preventivo</p>
          <h2 id="alerts-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Alertas preparadas</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">Definiciones conceptuales; no existen notificaciones ni alertas activas calculadas.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.alerts.map((alert) => (
              <li key={alert.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold">{alert.label}</p>
                  <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-brand-cyan">Pendiente</span>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-white/60">{alert.trigger}</p>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="mt-10 rounded-[2rem] border border-brand-blue/25 bg-brand-blue-soft p-6 sm:p-8" aria-labelledby="next-milestone-title">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Próximo milestone</p>
            <h2 id="next-milestone-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-primary-dark sm:text-3xl">{snapshot.nextMilestone.name}</h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">{snapshot.nextMilestone.disclosure}</p>
          </div>
          <span className="w-fit rounded-full border border-brand-blue/25 bg-brand-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-status-info">{snapshot.nextMilestone.statusLabel}</span>
        </div>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
          {snapshot.nextMilestone.forms.map((form) => (
            <li key={form} className="rounded-2xl border border-brand-blue/15 bg-brand-background/75 px-4 py-3 text-xs font-semibold text-brand-primary-dark">{form}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="delivery-document-title">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-status-success">Criterio de cierre</p>
        <h2 id="delivery-document-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Documento de entrega</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">Un proyecto se considera entregado cuando su publicación, accesos, condiciones de soporte y aceptación quedan registrados. Esta iteración no genera documentos.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" data-testid="client-web-delivery-requirements">
          {snapshot.deliveryRequirements.map((requirement) => (
            <li key={requirement.id} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-background p-4 text-xs font-semibold text-brand-graphite shadow-[var(--brand-shadow)]">
              <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-green/12 text-[10px] text-status-success">✓</span>
              <span>{requirement.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
