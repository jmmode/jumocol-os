import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { AreaCard } from "@/components/dashboard/area-card";
import { AREA_CATALOG } from "@/config/areas";
import { CORPORATE_BRAND } from "@/config/brand";
import { MODULE_CATALOG } from "@/config/module-catalog";

export const metadata: Metadata = {
  title: "Visión general",
};

export default async function HomePage() {
  await requirePage("/");
  return (
    <div>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.7fr)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-primary-dark p-7 text-white shadow-[var(--brand-shadow)] sm:p-9 lg:p-11">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-brand-cyan/10 blur-3xl" />
          <div className="relative">
            <div className="mb-7 inline-flex max-w-full rounded-2xl bg-brand-background px-4 py-3 shadow-[var(--brand-shadow)]">
              <BrandLockup placement="home" />
            </div>
            <p className="max-w-2xl text-[11px] font-black uppercase tracking-[0.17em] text-brand-cyan">
              {CORPORATE_BRAND.product} · {CORPORATE_BRAND.descriptor}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mt-5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-brand-cyan">
                MVP navegable
              </span>
              <span className="mt-5 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Entorno local
              </span>
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-[3.5rem]">
              La operación de JUMOCOL, visible desde un solo lugar.
            </h1>
            <span className="brand-accent-rule mt-7 block h-1.5 w-24 rounded-full" />
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-[15px]">
              Un punto de entrada común para entender prioridades, navegar por áreas y evolucionar hacia datos autorizados sin crear fuentes paralelas.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-3 border-t border-white/10 pt-7 sm:max-w-2xl sm:gap-5">
              {[
                ["5", "Áreas funcionales"],
                ["7", "Ámbitos previstos"],
                ["1", "Command Center activo"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-brand-cyan sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-brand-border bg-brand-background p-7 shadow-[var(--brand-shadow)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Estado del sistema</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Base operacional</h2>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-blue-soft text-lg font-black text-brand-primary-dark">01</span>
          </div>
          <dl className="mt-7 divide-y divide-brand-border">
            {[
              ["Arquitectura", "Activa"],
              ["Navegación", "5 áreas"],
              ["Fuente de datos", "Fixtures"],
              ["Persistencia", "Desactivada"],
              ["Integraciones", "No conectadas"],
            ].map(([term, value]) => (
              <div key={term} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <dt className="text-brand-muted">{term}</dt>
                <dd className="font-semibold text-brand-graphite">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="mt-10" aria-labelledby="areas-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Mapa funcional</p>
            <h2 id="areas-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl">
              Cinco áreas, una misma arquitectura
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-brand-muted">Marketing & Comercial inicia el trabajo funcional; las demás rutas conservan un contrato de extensión claro.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AREA_CATALOG.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-brand-border bg-brand-background p-6 shadow-[var(--brand-shadow)] sm:p-8" aria-labelledby="modules-title">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Catálogo transversal</p>
            <h2 id="modules-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text">Ámbitos preparados</h2>
            <p className="mt-3 text-sm leading-6 text-brand-muted">Son contextos de trabajo, no aplicaciones ni fuentes de datos independientes.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MODULE_CATALOG.map((module) => (
              <article key={module.id} className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                <p className="font-semibold text-brand-graphite">{module.name}</p>
                <p className="mt-1 text-xs text-brand-muted">{module.category}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
