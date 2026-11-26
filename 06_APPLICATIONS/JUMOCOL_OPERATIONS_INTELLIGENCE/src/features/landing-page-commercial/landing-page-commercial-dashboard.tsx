import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { FunnelStageCard } from "@/features/landing-page-commercial/funnel-stage-card";
import { RealLeadCard } from "@/features/landing-page-commercial/real-lead-card";
import type {
  LandingPageAcquisitionChannelStatus,
  LandingPageCommercialSnapshot,
  LandingPageFunnelStageId,
  LandingPageMetric,
  LandingPageOpportunity,
} from "@/features/landing-page-commercial/types";

const GOOGLE_SHEET_LEADS_URL =
  "https://docs.google.com/spreadsheets/d/1WV06WG7V4-8w2GEnYKTvnIMi3mRxVcqM2-gzPVLcPo4/edit";

const channelStatusClasses: Record<LandingPageAcquisitionChannelStatus, string> = {
  active: "border-brand-green/40 bg-brand-green/10 text-status-success",
  preparation: "border-status-warning/40 bg-brand-yellow/15 text-brand-text",
  "to-confirm": "border-brand-border bg-brand-surface text-brand-muted",
  "to-define": "border-brand-border bg-brand-surface text-brand-muted",
};

function getMetricDisplayValue(metric: LandingPageMetric): string {
  if (metric.value === null) {
    return "Información insuficiente";
  }

  if (metric.format === "currency") {
    return metric.currency === "USD" ? `US$${metric.value}` : String(metric.value);
  }

  if (metric.format === "percentage") {
    return `${metric.value}%`;
  }

  return String(metric.value);
}

function getStageOpportunityCount(
  opportunities: readonly LandingPageOpportunity[],
  stageId: LandingPageFunnelStageId,
): number {
  return opportunities.filter((opportunity) => opportunity.stage === stageId).length;
}

type LandingPageCommercialDashboardProps = {
  snapshot: LandingPageCommercialSnapshot;
};

export function LandingPageCommercialDashboard({ snapshot }: LandingPageCommercialDashboardProps) {
  const currentBacklog = snapshot.backlog.filter((item) => item.horizon === "current");
  const futureBacklog = snapshot.backlog.filter((item) => item.horizon === "future");
  const product = snapshot.product;
  const hasRealData = snapshot.source.kind === "google-sheets";

  return (
    <div>
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="transition hover:text-brand-primary" href="/marketing-comercial">
          Marketing & Comercial
        </Link>
        <span aria-hidden="true" className="text-brand-primary">→</span>
        <span aria-current="page" className="text-brand-text">Landing Page</span>
      </nav>

      <PageHeader
        badge={snapshot.source.label}
        description="Funnel comercial para captar empresas y convertir oportunidades en clientes pagos de servicios digitales JUMOCOL."
        eyebrow="Marketing & Comercial · Producto prioritario"
        title="Landing Page"
      />

      <aside className="mt-6 flex flex-col gap-4 rounded-3xl border border-brand-blue/25 bg-brand-blue-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
            Gestión operativa de leads
          </p>
          <p className="mt-2 text-sm leading-6 text-brand-primary-dark">
            Fuente operativa comercial. La gestión de estado, responsable, próxima acción y observaciones se realiza actualmente en Google Sheets.
          </p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-primary-dark px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-brand-primary"
          href={GOOGLE_SHEET_LEADS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Abrir Google Sheet — Gestionar Leads
          <span aria-hidden="true">↗</span>
        </Link>
      </aside>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]" aria-labelledby="product-title">
        <article className="relative overflow-hidden rounded-[2rem] bg-brand-primary-dark p-7 text-white shadow-[var(--brand-shadow)] sm:p-9">
          <div className="absolute -top-24 -right-20 size-64 rounded-full bg-brand-cyan/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Qué vendemos</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-brand-cyan">
                <span className="size-2 rounded-full bg-brand-green" />
                {product.statusLabel}
              </span>
            </div>
            <h2 id="product-title" className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              {product.name}
            </h2>
            <p className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-brand-cyan sm:text-5xl">{product.startingPrice.label}</p>
            <span className="brand-accent-rule mt-6 block h-1.5 w-24 rounded-full" />
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70">{product.objective}</p>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-brand-border bg-brand-background p-7 shadow-[var(--brand-shadow)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Resumen comercial</p>
          <dl className="mt-5 divide-y divide-brand-border">
            <div className="py-4 first:pt-0">
              <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">Canal prioritario previsto</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-text">
                {product.priorityChannel}
                <span className="rounded-full bg-brand-yellow/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-brand-text ring-1 ring-status-warning/25">
                  {product.priorityChannelStatusLabel}
                </span>
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">Conversión principal</dt>
              <dd className="mt-2 text-sm font-semibold text-brand-text">{product.primaryConversion}</dd>
            </div>
            <div className="py-4 last:pb-0">
              <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">Integraciones</dt>
              <dd className="mt-2 text-sm font-semibold text-brand-muted">
                {hasRealData ? "Google Sheets · lectura autorizada" : "No conectadas"}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <aside className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-blue/25 bg-brand-blue-soft px-4 py-3 text-xs text-brand-primary-dark sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="font-bold">
          {hasRealData ? "Datos reales — Google Sheets" : "Sin datos comerciales conectados"}
        </span>
        <span className="text-status-info">{snapshot.source.disclosure}</span>
      </aside>

      <section className="mt-10" aria-labelledby="funnel-title">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Funnel comercial</p>
          <h2 id="funnel-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Del lead al onboarding</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">
            Cada etapa define propósito, entrada, salida y próxima acción para mantener el avance comercial verificable.
          </p>
        </div>

        <div aria-hidden="true" className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-border bg-brand-background p-3 text-[9px] font-black uppercase tracking-[0.09em] text-brand-primary-dark">
          {snapshot.funnelStages.map((stage, index) => (
            <div key={stage.id} className="contents">
              <span className="rounded-full bg-brand-blue-soft px-3 py-2">{stage.name}</span>
              {index < snapshot.funnelStages.length - 1 ? <span className="text-brand-primary">→</span> : null}
            </div>
          ))}
        </div>

        <ol className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="landing-page-funnel">
          {snapshot.funnelStages.map((stage) => (
            <FunnelStageCard key={stage.id} stage={stage} />
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="pipeline-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Visibilidad por etapa</p>
            <h2 id="pipeline-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Pipeline Landing Page</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-primary-dark px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white">
              {snapshot.pipeline.opportunityCount} oportunidades reales
            </span>
            <span className="rounded-full border border-brand-border bg-brand-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">
              {snapshot.pipeline.connectionLabel}
            </span>
            {snapshot.pipeline.unknownStageCount > 0 ? (
              <span className="rounded-full bg-brand-yellow/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-text ring-1 ring-status-warning/25">
                {snapshot.pipeline.unknownStageCount} sin mapear
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
          <p className="text-xs font-semibold text-brand-muted">{snapshot.pipeline.disclosure}</p>
          <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9" data-testid="landing-page-pipeline">
            {snapshot.funnelStages.map((stage) => (
              <li key={stage.id} className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                <p className="text-[9px] font-black uppercase leading-4 tracking-[0.1em] text-brand-muted">{stage.name}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-brand-text">
                  {getStageOpportunityCount(snapshot.pipeline.opportunities, stage.id)}
                </p>
                <p className="mt-1 text-[10px] text-brand-muted">Oportunidades</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-2xl bg-brand-blue-soft px-4 py-3 text-xs leading-5 text-brand-primary-dark">
            {hasRealData
              ? "Lectura operativa desde la fuente autorizada. Esta vista no crea ni modifica filas en Google Sheets."
              : "No hay clientes ficticios: la colección de oportunidades está vacía y preparada para una futura fuente autorizada."}
          </p>
        </div>
      </section>

      {hasRealData ? (
        <section className="mt-10" aria-labelledby="real-leads-title" data-testid="landing-page-real-leads">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                Registros comerciales
              </p>
              <h2 id="real-leads-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">
                Leads actuales
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">
                Vista mínima para gestión comercial. Teléfono, correo, necesidad, mensaje y evidencia de consentimiento permanecen en el dominio server-side y no se exponen en esta pantalla.
              </p>
            </div>
            <span className="rounded-full bg-brand-green/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-status-success">
              Solo lectura
            </span>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {snapshot.pipeline.opportunities.map((opportunity) => (
              <RealLeadCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div aria-labelledby="channels-title">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Fuentes de leads</p>
          <h2 id="channels-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Canales de adquisición</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {snapshot.acquisitionChannels.map((channel) => (
              <article key={channel.id} className="rounded-2xl border border-brand-border bg-brand-background p-4 shadow-[var(--brand-shadow)]">
                <p className="text-sm font-semibold text-brand-text">{channel.name}</p>
                <span className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${channelStatusClasses[channel.status]}`}>
                  {channel.statusLabel}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div aria-labelledby="metrics-title">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
            {hasRealData ? "Indicadores respaldados por fuente" : "Indicadores preparados"}
          </p>
          <h2 id="metrics-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Métricas comerciales</h2>
          <dl className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {snapshot.metrics.map((metric) => (
              <div
                key={metric.id}
                className={
                  metric.availability === "available"
                    ? "rounded-2xl border border-brand-border bg-brand-background p-4 shadow-[var(--brand-shadow)]"
                    : "rounded-2xl border border-brand-border bg-brand-surface p-4"
                }
              >
                <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">{metric.label}</dt>
                <dd className="mt-3 text-xl font-semibold tracking-[-0.04em] text-brand-primary-dark">{getMetricDisplayValue(metric)}</dd>
                <p className="mt-2 text-[10px] leading-4 text-brand-muted">{metric.context}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="backlog-title">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Ejecución pendiente</p>
          <h2 id="backlog-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Próximas acciones</h2>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-brand-text">Actuales</h3>
              <span className="rounded-full bg-brand-blue-soft px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-status-info">Prioridad operativa</span>
            </div>
            <ol className="mt-5 space-y-3">
              {currentBacklog.map((item, index) => (
                <li key={item.id} className="flex gap-3 rounded-2xl bg-brand-surface p-4 text-sm leading-6 text-brand-graphite">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-blue-soft text-[10px] font-black text-status-info">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-3xl border border-brand-blue/25 bg-brand-blue-soft p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-brand-primary-dark">Futuras</h3>
              <span className="rounded-full border border-brand-blue/25 bg-brand-background px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-status-info">Sin implementar</span>
            </div>
            <ul className="mt-5 space-y-3">
              {futureBacklog.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-brand-blue/15 bg-brand-background/70 p-4 text-sm leading-6 text-brand-primary-dark">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-primary" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="handoff-title">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Frontera operacional</p>
          <h2 id="handoff-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">Handoff a Clientes Web</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-muted">
            El pago confirmado habilita la transferencia formal. Operaciones inicia ejecución únicamente cuando el handoff está completo y aceptado.
          </p>
        </div>

        <div aria-hidden="true" className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-border bg-brand-background p-3 text-[10px] font-black uppercase tracking-[0.1em]">
          {snapshot.handoff.steps.map((step, index) => (
            <div key={step} className="contents">
              <span className={step === "Handoff" ? "rounded-full bg-brand-primary-dark px-3 py-2 text-white" : "rounded-full bg-brand-blue-soft px-3 py-2 text-brand-primary-dark"}>
                {step}
              </span>
              {index < snapshot.handoff.steps.length - 1 ? <span className="text-brand-primary">→</span> : null}
            </div>
          ))}
        </div>

        <div className="mt-5 grid overflow-hidden rounded-[2rem] border border-brand-border bg-brand-background shadow-[var(--brand-shadow)] lg:grid-cols-2">
          <article className="border-b border-brand-border p-6 sm:p-8 lg:border-r lg:border-b-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Termina responsabilidad principal</p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-brand-text">{snapshot.handoff.closingResponsibility}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-muted">Gate de entrada: <strong className="text-brand-text">{snapshot.handoff.entryGate}</strong>.</p>
            <p className="mt-4 rounded-2xl bg-brand-surface p-4 text-sm font-semibold text-brand-graphite">PAGO CONFIRMADO → HANDOFF</p>
          </article>

          <article className="bg-brand-primary-dark p-6 text-white sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">Comienza responsabilidad operacional</p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{snapshot.handoff.openingResponsibility} → {snapshot.handoff.destination}</h3>
            <p className="mt-3 text-sm leading-6 text-white/70">Objetivo: {snapshot.handoff.outcome}.</p>
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm font-semibold">{snapshot.handoff.completionGate} → PROYECTO → ONBOARDING</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link className="rounded-full bg-brand-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary-dark transition hover:bg-brand-cyan" href={snapshot.handoff.destinationHref}>
                Abrir Clientes Web
              </Link>
              <Link className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-brand-cyan transition hover:bg-white/8" href={snapshot.handoff.extensionHref}>
                Ver Operaciones
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
