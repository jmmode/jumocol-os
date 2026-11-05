import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { getArea, type AreaId } from "@/config/areas";
import { getModulesForArea } from "@/config/module-catalog";

type AreaOverviewProps = {
  areaId: AreaId;
};

export function AreaOverview({ areaId }: AreaOverviewProps) {
  const area = getArea(areaId);
  const modules = getModulesForArea(areaId);
  const accessibleModules = modules.flatMap((module) => {
    const access = module.accessByArea?.[areaId];

    return access ? [{ module, access }] : [];
  });

  return (
    <div>
      <PageHeader
        badge="Estructura base"
        description={`${area.description} Esta primera vista confirma la ruta y reserva un punto de extensión sin implementar todavía lógica profunda.`}
        eyebrow={`Área ${area.index}`}
        title={area.label}
      />

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-primary">Punto de extensión</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-brand-text">Área preparada para su siguiente iteración</h2>
            </div>
            <span className="rounded-full bg-brand-surface px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted">
              {accessibleModules.length > 0 ? "Módulos navegables" : "Sin datos reales"}
            </span>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-brand-muted">
            La ruta ya participa en el shell común, conserva la navegación responsive y podrá incorporar componentes,
            contratos de datos y permisos propios cuando exista una definición funcional aprobada.
          </p>

          {accessibleModules.length > 0 ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {accessibleModules.map(({ module, access }) => (
                <Link
                  key={module.id}
                  className="group rounded-3xl border border-brand-green/40 bg-brand-green/10 p-5 transition hover:-translate-y-1 hover:border-brand-green"
                  href={access.href}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-status-success">{access.statusLabel}</span>
                    <span aria-hidden="true" className="text-lg text-status-success transition-transform group-hover:translate-x-1">→</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-brand-text">{module.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-brand-primary-dark">{access.label}</p>
                  <p className="mt-4 text-xs leading-5 text-brand-muted">Abrir ciclo operacional, requisitos, fases y criterios de entrega.</p>
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-8 border-t border-brand-border pt-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-muted">Ámbitos relacionados</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {modules.map((module) => (
                <span
                  key={module.id}
                  className="rounded-full border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-graphite"
                >
                  {module.name}
                  <span className="ml-2 text-brand-muted">· {module.category}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-3xl bg-brand-primary-dark p-6 text-white shadow-[var(--brand-shadow)] sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Siguiente iteración</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.025em]">Contrato funcional del área</h2>
          <ul className="mt-6 space-y-4 text-sm text-white/70">
            {[
              "Definir objetivo y owner.",
              "Confirmar fuentes autorizadas.",
              "Acordar entradas y salidas.",
              "Validar permisos y excepciones.",
            ].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-brand-cyan">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-5">{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
