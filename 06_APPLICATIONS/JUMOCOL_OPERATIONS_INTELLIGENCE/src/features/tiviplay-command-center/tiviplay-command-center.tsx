import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";

const COMPONENTS = [
  { index: "01", name: "Contexto", documentary: "DRAFT — IN REVIEW", technical: "Visor read-only", href: "/operaciones/tiviplay/contexto", enabled: true },
  { index: "02", name: "Integraciones / MCP", documentary: "SCAFFOLD", technical: "NOT IMPLEMENTED", enabled: false },
  { index: "03", name: "Skills", documentary: "SCAFFOLD", technical: "NOT IMPLEMENTED", enabled: false },
  { index: "04", name: "Hooks", documentary: "SCAFFOLD", technical: "NOT IMPLEMENTED", enabled: false },
  { index: "05", name: "Subagentes", documentary: "TARGET ARCHITECTURE", technical: "NOT IMPLEMENTED", enabled: false },
  { index: "06", name: "Plugin", documentary: "FUTURE PACKAGE", technical: "NOT IMPLEMENTED", enabled: false },
] as const;

const ATTENTION = [
  { title: "Apertura de turno", detail: "Checklist y entrega de turno.", href: "/operaciones/tiviplay/turno" },
  { title: "Financiera", detail: "Cobros, comprobantes y facturación.", href: "/operaciones/tiviplay/atencion#categoria-A" },
  { title: "Servicio", detail: "Ventas, renovaciones y referidos.", href: "/operaciones/tiviplay/atencion#categoria-B" },
  { title: "Soporte técnico", detail: "Apps, conexión, acceso y canales.", href: "/operaciones/tiviplay/atencion#categoria-C" },
] as const;

export function TiviplayCommandCenter({ admin = false }: { admin?: boolean }) {
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">TiviPlay</span>
      </nav>

      <PageHeader
        badge="Operación autorizada"
        description="Primer laboratorio operacional de JUMOCOL OS. El Runtime Operativo concentra los datos vivos; debajo se mantiene el blueprint digital con sus seis componentes."
        eyebrow="Operaciones · TiviPlay"
        title="Command Center TiviPlay"
      />
      <TiviplayNavigation />

      <section aria-label="Atención al cliente" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ATTENTION.map((item) => (
          <Link className="rounded-2xl border border-brand-border bg-brand-background p-5 transition hover:border-brand-primary" href={item.href} key={item.href}>
            <h2 className="font-semibold text-brand-text">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-brand-muted">{item.detail}</p>
          </Link>
        ))}
      </section>

      <Link
        aria-label="Abrir Runtime Operativo de TiviPlay"
        className="group mt-6 block rounded-[2rem] bg-brand-primary-dark p-7 text-white shadow-[var(--brand-shadow)] transition hover:-translate-y-0.5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9"
        href="/operaciones/tiviplay/runtime"
      >
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Datos vivos · Google Sheets</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">Runtime Operativo</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">Recaudo del día y del mes, cartera pendiente, pagos por confirmar, clientes activos, consolidado Panel 1 · 2 · 3 y búsqueda por cliente. Ventana junio 2026 → hoy.</p>
        </div>
        <span className="mt-6 inline-flex shrink-0 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-brand-primary-dark transition group-hover:bg-brand-cyan sm:mt-0">Abrir runtime →</span>
      </Link>

      {admin ? <><aside className="mt-6 rounded-2xl border border-brand-yellow/45 bg-brand-yellow/10 px-5 py-4 text-sm leading-6 text-brand-graphite">
        <strong className="text-status-warning">Estado general:</strong> Contexto continúa DRAFT — IN REVIEW. Los otros cinco componentes son scaffolds no implementados.
      </aside>

      <section aria-labelledby="components-title" className="mt-9">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Blueprint digital</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl" id="components-title">Seis componentes, un estado verificable</h2>
          <p className="mt-3 text-sm leading-6 text-brand-muted">Solo Contexto está habilitado. Los demás espacios reservan su responsabilidad futura sin activar capacidades.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMPONENTS.map((component) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-10 items-center justify-center rounded-2xl text-xs font-black ${component.enabled ? "bg-brand-primary text-white" : "bg-brand-surface text-brand-muted"}`}>{component.index}</span>
                  <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${component.enabled ? "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning" : "border-brand-border bg-brand-surface text-brand-muted"}`}>{component.technical}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-brand-text">{component.name}</h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted">Documento · {component.documentary}</p>
                <p className="mt-4 text-xs leading-5 text-brand-muted">{component.enabled ? "Abrir el Contexto Maestro leído desde el Markdown canónico." : "Espacio documental previsto. No existe implementación técnica."}</p>
                {component.enabled ? <span className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.1em] text-brand-primary">Abrir contexto →</span> : null}
              </>
            );

            return component.enabled ? (
              <Link className="group rounded-3xl border border-brand-primary/30 bg-brand-background p-6 shadow-[var(--brand-shadow)] transition hover:-translate-y-1 hover:border-brand-primary" href={component.href} key={component.index}>{content}</Link>
            ) : (
              <article aria-label={`${component.name}: no implementado`} className="rounded-3xl border border-dashed border-brand-border bg-brand-background/70 p-6" key={component.index}>{content}</article>
            );
          })}
        </div>
      </section></> : null}
    </div>
  );
}

