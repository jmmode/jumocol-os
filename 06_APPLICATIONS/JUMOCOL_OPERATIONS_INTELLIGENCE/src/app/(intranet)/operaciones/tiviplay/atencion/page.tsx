import type { Metadata } from "next";
import Link from "next/link";

import { MarkdownDocument } from "@/components/documents/markdown-document";
import { PageHeader } from "@/components/ui/page-header";
import { ATENCION_CATEGORIES, FICHAS_DOCUMENT_ID, parseFichas, searchFichas, type Ficha } from "@/features/tiviplay-atencion/fichas";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { libraryEntry } from "@/server/documents/library";

export const metadata: Metadata = { title: "TiviPlay · Atención" };
export const dynamic = "force-dynamic";

const ROUTE = "/operaciones/tiviplay/atencion";
const STEPS = ["Entrada", "Identificación", "Clasificación", "Procedimiento", "Script", "Resultado"] as const;
const VALIDATION_CLASS: Readonly<Record<string, string>> = {
  VALIDADO: "border-brand-green/35 bg-brand-green/10 text-status-success",
  "PENDIENTE DE VALIDACIÓN": "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
  "REQUIERE DECISIÓN": "border-brand-red/30 bg-brand-red/8 text-status-error",
};
// Estados propuestos en el paquete de WhatsApp. Hoy no existe registro de casos: el resultado se anota en la planilla de pendientes.
const OUTCOMES = [
  ["Resuelto", "El cliente confirmó el servicio."],
  ["Pendiente de facturación", "Hay comprobante y falta el cruce. Lo confirma Dirección."],
  ["Pendiente técnico", "La falla sigue después de la ficha."],
  ["Fuera de horario", "Quedó el aviso y el motivo. Se retoma en el turno."],
  ["Escalado", "Panel, crédito o excepción. No lo cierra el operador."],
] as const;

const card = "rounded-2xl border border-brand-border bg-brand-background p-5";
const chip = "rounded-full border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-primary-dark hover:border-brand-primary";
const fichaHref = (id: string) => `${ROUTE}?ficha=${id}#ficha`;

function Validation({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${VALIDATION_CLASS[value] ?? "border-brand-border text-brand-muted"}`}>{value}</span>;
}

function FichaLink({ ficha }: { ficha: Ficha }) {
  return <Link className={chip} href={fichaHref(ficha.id)}>{ficha.id} · {ficha.motive}</Link>;
}

async function loadFichas(actor: Awaited<ReturnType<typeof requirePage>>) {
  try {
    const entry = await libraryEntry(FICHAS_DOCUMENT_ID, actor);
    return entry ? { fichas: parseFichas(entry.document.markdown), published: entry.published, version: entry.document.version } : null;
  } catch {
    return null;
  }
}

export default async function TiviplayAtencionPage({ searchParams }: { searchParams: Promise<{ q?: string; ficha?: string }> }) {
  const actor = await requirePage(ROUTE);
  const params = await searchParams;
  const source = await loadFichas(actor);
  const fichas = source?.fichas ?? [];
  const query = (params.q ?? "").slice(0, 120).trim();
  const matches = query ? searchFichas(fichas, query) : [];
  const selected = fichas.find(f => f.id === params.ficha) ?? null;
  const active = selected ? 3 : query ? 2 : 0;
  audit(actor.id, selected ? `ficha:${selected.id}` : "tiviplay-atencion", "read", source ? "SUCCESS" : "UNAVAILABLE");

  return (
    <div>
      <PageHeader
        badge="Consulta guiada"
        description="De lo que dice el cliente al procedimiento y al mensaje listo para copiar. Esta vista no guarda casos ni datos de clientes."
        eyebrow="Operaciones · TiviPlay"
        title="Atención al cliente"
      />
      <TiviplayNavigation />

      <ol aria-label="Pasos de la atención" className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
        {STEPS.map((step, index) => <li aria-current={index === active ? "step" : undefined} className={`rounded-full border px-3 py-1 ${index === active ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted"}`} key={step}>{index + 1}. {step}</li>)}
      </ol>

      {!source ? <section className={`${card} mt-6`} role="note">
        <h2 className="text-lg font-semibold">BLOQUEADO: fichas pendientes de publicación</h2>
        <p className="mt-2 text-sm leading-6 text-brand-graphite">Dirección aún no publica esta versión para operadores. Mientras tanto usa la <Link className="font-semibold underline" href="/operaciones/tiviplay/manuales/tiviplay-guia-rapida-turno">Guía rápida de turno</Link>.</p>
      </section> : <>
        {!source.published ? <p className="mt-5 rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm text-status-warning" role="note">Vista de Dirección: los operadores no ven estas fichas hasta publicar esta versión en <Link className="font-semibold underline" href={`/operaciones/tiviplay/manuales/${FICHAS_DOCUMENT_ID}`}>su documento</Link>.</p> : null}

        <section aria-labelledby="entrada" className="mt-6">
          <h2 className="text-lg font-semibold" id="entrada">1. ¿Qué dice el cliente?</h2>
          <form action={ROUTE} className="mt-3 flex flex-wrap gap-3">
            <input aria-label="Buscar procedimiento" className="w-full rounded-lg border p-3 sm:w-auto sm:min-w-[320px] sm:flex-1" defaultValue={query} maxLength={120} name="q" placeholder="Ej.: comprobante, se eliminó la app, canal sin señal" type="search" />
            <button className="rounded-lg border px-4 py-3">Buscar</button>
          </form>
          <p className="mt-2 text-xs text-brand-muted">Escribe el motivo, no el nombre, teléfono ni usuario del cliente. La búsqueda queda en la dirección del navegador.</p>
          {query ? <div className="mt-3" role="status">
            <p className="text-sm">{matches.length ? `${matches.length} ficha(s) para «${query}».` : `Sin fichas para «${query}». Clasifica el caso con los cajones de abajo.`}</p>
            <div className="mt-2 flex flex-wrap gap-2">{matches.map(f => <FichaLink ficha={f} key={f.id} />)}</div>
          </div> : null}
        </section>

        <details className={`${card} mt-5`} open={!selected}>
          <summary className="cursor-pointer text-lg font-semibold">2. Identifica al cliente</summary>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-brand-graphite">
            <li>Busca al cliente en <Link className="font-semibold underline" href="/operaciones/tiviplay/runtime">Runtime</Link> o en <Link className="font-semibold underline" href="/operaciones/tiviplay/hoy">HOY</Link>.</li>
            <li>Confirma vencimiento, plan y estado desde esa fuente, no desde el chat.</li>
            <li>Si no aparece, no lo agregues al flujo: usa la ficha A6 o B1 según el caso.</li>
          </ol>
        </details>

        <details className="mt-5" open={!selected}>
          <summary className="cursor-pointer text-lg font-semibold">3. Clasifica la solicitud</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {ATENCION_CATEGORIES.map(category => <section className={card} id={`categoria-${category.key}`} key={category.key}>
              <h3 className="font-semibold">{category.key}. {category.label}</h3>
              <p className="mt-1 text-xs leading-5 text-brand-muted">{category.hint}</p>
              <div className="mt-3 flex flex-wrap gap-2">{fichas.filter(f => f.category === category.key).map(f => <FichaLink ficha={f} key={f.id} />)}</div>
            </section>)}
          </div>
        </details>

        {selected ? <article aria-labelledby="ficha-titulo" className="mt-6 scroll-mt-24 rounded-2xl border bg-white p-6" id="ficha">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-muted">{selected.categoryLabel} · {selected.motive}</p>
          <h2 className="mt-2 text-2xl font-semibold" id="ficha-titulo">{selected.id} · {selected.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2"><Validation value={selected.validation} /><span className="text-xs text-brand-muted">Fichas versión {source.version}</span></div>
          {selected.validation === "REQUIERE DECISIÓN" ? <p className="mt-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error">Falta una decisión de Dirección. El mensaje es neutro: no agregues oferta, condición ni fecha.</p> : null}
          <MarkdownDocument markdown={selected.body} />

          <section aria-labelledby="reclasificar" className="mt-8 border-t pt-5">
            <h3 className="font-semibold" id="reclasificar">¿La causa es otra? Reclasifica</h3>
            <div className="mt-2 flex flex-wrap gap-2">{selected.reclassify.flatMap(id => fichas.filter(f => f.id === id)).map(f => <FichaLink ficha={f} key={f.id} />)}</div>
          </section>

          <section aria-labelledby="resultado" className="mt-8 border-t pt-5">
            <h3 className="font-semibold" id="resultado">6. Resultado o escalamiento</h3>
            <p className="mt-1 text-sm text-brand-graphite">Esta vista no guarda el resultado. Anótalo en la planilla de pendientes con fecha y hora si queda algo abierto.</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">{OUTCOMES.map(([label, detail]) => <div className="rounded-xl border border-brand-border p-3" key={label}><dt className="text-sm font-semibold">{label}</dt><dd className="text-xs leading-5 text-brand-muted">{detail}</dd></div>)}</dl>
          </section>
        </article> : null}
      </>}
    </div>
  );
}
