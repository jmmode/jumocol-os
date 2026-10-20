import type { LandingPageOpportunity } from "@/features/landing-page-commercial/types";

const bogotaDateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

function formatDate(value: string | null): string {
  if (!value) return "Sin registrar";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no válida" : bogotaDateFormatter.format(date);
}

type RealLeadCardProps = {
  opportunity: LandingPageOpportunity;
};

export function RealLeadCard({ opportunity }: RealLeadCardProps) {
  const isUnknownStage = opportunity.stage === "unknown";
  const origin = opportunity.utmSource
    ? `${opportunity.source ?? "Origen no registrado"} · UTM ${opportunity.utmSource}`
    : opportunity.source ?? "Origen no registrado";

  return (
    <article className="rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-muted">Contacto</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-brand-text">
            {opportunity.contactName ?? "Nombre no registrado"}
          </h3>
          <p className="mt-1 text-xs text-brand-muted">
            {opportunity.companyName ?? "Empresa no registrada"}
          </p>
        </div>
        <span
          className={
            isUnknownStage
              ? "rounded-full bg-brand-yellow/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-brand-text ring-1 ring-status-warning/25"
              : "rounded-full bg-brand-green/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-status-success"
          }
        >
          {opportunity.stageLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-brand-border pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Producto</dt>
          <dd className="mt-1.5 text-xs font-semibold leading-5 text-brand-text">
            {opportunity.product ?? "Sin producto registrado"}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Origen</dt>
          <dd className="mt-1.5 text-xs font-semibold leading-5 text-brand-text">{origin}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Fecha</dt>
          <dd className="mt-1.5 text-xs font-semibold leading-5 text-brand-text">
            <time dateTime={opportunity.createdAt}>{formatDate(opportunity.createdAt)}</time>
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Responsable</dt>
          <dd className="mt-1.5 text-xs font-semibold leading-5 text-brand-text">
            {opportunity.owner ?? "Sin asignar"}
          </dd>
        </div>
        <div>
          <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Próxima acción</dt>
          <dd className="mt-1.5 text-xs font-semibold leading-5 text-brand-text">
            {formatDate(opportunity.nextActionAt)}
          </dd>
        </div>
        {isUnknownStage ? (
          <div>
            <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-brand-muted">Estado de origen</dt>
            <dd className="mt-1.5 text-xs font-semibold leading-5 text-status-warning">
              {opportunity.sourceStage ?? "Vacío · requiere mapeo"}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
