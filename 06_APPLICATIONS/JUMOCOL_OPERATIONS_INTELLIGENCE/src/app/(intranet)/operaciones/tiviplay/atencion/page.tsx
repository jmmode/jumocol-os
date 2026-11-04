import type { Metadata } from "next";
import Link from "next/link";

import { CopyableMessage } from "@/components/documents/copyable-message";
import { MarkdownDocument } from "@/components/documents/markdown-document";
import { PageHeader } from "@/components/ui/page-header";
import { ClientSearch, MessageClassifier } from "@/features/tiviplay-atencion/atencion-assistant";
import { ClientFicha } from "@/features/tiviplay-atencion/client-ficha";
import { parseCobranza } from "@/features/tiviplay-atencion/cobranza";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";
import { scriptOf } from "@/features/tiviplay-atencion/classify";
import { ATENCION_CATEGORIES, FICHAS_DOCUMENT_ID, parseFichas, searchFichas, type Ficha } from "@/features/tiviplay-atencion/fichas";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { libraryEntry } from "@/server/documents/library";
import { getTiviplayWorkday, type DirectoryEntry, type QueueItem } from "@/server/tiviplay-live/workday";
import { displayDate, greetingName, personalizeScript } from "@/server/tiviplay-live/workday-model";

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
const fichaHref = (id: string, clienteId: string | null) => `${ROUTE}?${clienteId ? `cliente=${clienteId}&` : ""}ficha=${id}&proc=1#ficha`;

function Validation({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${VALIDATION_CLASS[value] ?? "border-brand-border text-brand-muted"}`}>{value}</span>;
}

function FichaLink({ ficha, clienteId }: { ficha: Ficha; clienteId: string | null }) {
  return <Link className={chip} href={fichaHref(ficha.id, clienteId)} prefetch={false}>{ficha.id} · {ficha.motive}</Link>;
}

async function loadFichas(actor: Awaited<ReturnType<typeof requirePage>>) {
  try {
    const entry = await libraryEntry(FICHAS_DOCUMENT_ID, actor);
    return entry ? { fichas: parseFichas(entry.document.markdown), published: entry.published, version: entry.document.version } : null;
  } catch {
    return null;
  }
}

async function loadClient(id: string | undefined): Promise<{ entry: DirectoryEntry | null; queue: QueueItem | null; error: string | null; directory: DirectoryEntry[] | null }> {
  if (!id || !/^[a-f0-9]{16}$/.test(id)) return { entry: null, queue: null, error: null, directory: null };
  const result = await getTiviplayWorkday();
  if (!result.ok) return { entry: null, queue: null, error: result.reason, directory: null };
  return { entry: result.directory.find((d) => d.id === id) ?? null, queue: [...result.workday.queue, ...result.workday.reconciliation].find((q) => q.id === id) ?? null, error: null, directory: result.directory };
}

/** Mensajes de cobro: documento propio para no invalidar la publicación de las fichas. */
async function loadCobranza(actor: Awaited<ReturnType<typeof requirePage>>) {
  try {
    const entry = await libraryEntry("tiviplay-mensajes-cobro", actor);
    return entry ? parseCobranza(entry.document.markdown) : null;
  } catch {
    return null;
  }
}

export default async function TiviplayAtencionPage({ searchParams }: { searchParams: Promise<{ q?: string; ficha?: string; cliente?: string; proc?: string }> }) {
  const actor = await requirePage(ROUTE);
  const params = await searchParams;
  const clienteId = params.cliente && /^[a-f0-9]{16}$/.test(params.cliente) ? params.cliente : null;
  const client = await loadClient(clienteId ?? undefined);
  const source = await loadFichas(actor);
  const fichas = source?.fichas ?? [];
  const query = (params.q ?? "").slice(0, 120).trim();
  const matches = query ? searchFichas(fichas, query) : [];
  // Sin ficha elegida, ATENDER usa la sugerida por la cola: la respuesta debe estar lista en la tarjeta Acción.
  const selected = fichas.find(f => f.id === (params.ficha ?? (client.entry ? client.queue?.suggestedFicha ?? "A1" : ""))) ?? null;
  const showProcedure = !client.entry || params.proc === "1" || !!query;
  const admin = actor.role === "ADMIN";
  const repeated = client.entry ? (client.directory ?? []).filter((d) => d.user && d.user.toUpperCase() === client.entry?.user.toUpperCase()).length > 1 : false;
  const active = selected ? 4 : query ? 2 : client.entry ? 1 : 0;
  const script = selected ? scriptOf(selected) : null;
  const personalized = script ? personalizeScript(script, {
    NOMBRE: client.entry ? greetingName(client.entry.name) : null,
    ASESOR: actor.name,
    FECHA: displayDate(client.entry?.nextPayment ?? null),
    PLAN: client.entry?.plan ?? null,
  }) : null;
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

      {!client.entry ? <ol aria-label="Pasos de la atención" className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
        {STEPS.map((step, index) => <li aria-current={index === active ? "step" : undefined} className={`rounded-full border px-3 py-1 ${index === active ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted"}`} key={step}>{index + 1}. {step}</li>)}
      </ol> : null}

        <section aria-labelledby="identificar" className={`${card} mt-6`}>
          {client.entry ? <details><summary className="cursor-pointer text-sm font-semibold" id="identificar">Buscar otro cliente</summary><ClientSearch selectedFicha={null} /></details> : <>
          <h2 className="text-lg font-semibold" id="identificar">1. Identifica al cliente</h2>
          <p className="mt-1 text-xs text-brand-muted">Búsqueda de solo lectura sobre BASE GENERAL y la cartera del mes. El texto buscado no queda en la dirección del navegador.</p>
          <ClientSearch selectedFicha={selected?.id ?? null} /></>}
          {client.error ? <p className="mt-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error">BLOQUEADO: {client.error}</p> : null}
          {clienteId && !client.entry && !client.error ? <p className="mt-3 text-sm text-status-warning">El cliente seleccionado ya no aparece en la fuente. Vuelve a buscarlo.</p> : null}
          {client.entry ? <ClientFicha actor={actor.name} admin={admin} client={client.entry} cobranza={await loadCobranza(actor)} fallback={selected && personalized ? { title: `${selected.id} · ${selected.title}`, text: personalized.text, pending: personalized.pending, validation: selected.validation } : null} queue={client.queue} today={bogotaToday()} userRepeated={repeated} /> : null}
        </section>

      {!source ? <section className={`${card} mt-5`} role="note">
        <h2 className="font-semibold">Procedimientos pendientes de publicación</h2>
        <p className="mt-2 text-sm text-brand-muted">Puedes consultar el cliente y sus credenciales de servicio. Para habilitar clasificación y respuestas copiables, Dirección debe publicar la versión vigente de las fichas desde Manuales y procesos.</p>
      </section> : <>
      <details className="mt-5" open={showProcedure}>
      <summary className="cursor-pointer text-sm font-semibold">{client.entry ? "Otro motivo: clasificar o abrir el procedimiento" : "Clasificación y procedimientos"}</summary>
      {!source.published ? <p className="mt-5 rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm text-status-warning" role="note">Vista de Dirección: los operadores no ven estas fichas hasta publicar esta versión en <Link className="font-semibold underline" href={`/operaciones/tiviplay/manuales/${FICHAS_DOCUMENT_ID}`}>su documento</Link>.</p> : null}

        <section aria-labelledby="entrada" className="mt-6">
          <h2 className="text-lg font-semibold" id="entrada">2. ¿Qué dice el cliente?</h2>
          <p className="mt-1 text-xs text-brand-muted">La clasificación se calcula en este equipo: el mensaje no se envía ni se guarda.</p>
          <MessageClassifier clienteId={clienteId} fichas={fichas} />
          <form action={ROUTE} className="mt-3 flex flex-wrap gap-3">
            {clienteId ? <input name="cliente" type="hidden" value={clienteId} /> : null}
            <input aria-label="Buscar procedimiento" className="w-full rounded-lg border p-3 sm:w-auto sm:min-w-[320px] sm:flex-1" defaultValue={query} maxLength={120} name="q" placeholder="O busca por motivo: comprobante, canal sin señal" type="search" />
            <button className="rounded-lg border px-4 py-3">Buscar ficha</button>
          </form>
          {query ? <div className="mt-3" role="status">
            <p className="text-sm">{matches.length ? `${matches.length} ficha(s) para «${query}».` : `Sin fichas para «${query}». Clasifica el caso con los cajones de abajo.`}</p>
            <div className="mt-2 flex flex-wrap gap-2">{matches.map(f => <FichaLink clienteId={clienteId} ficha={f} key={f.id} />)}</div>
          </div> : null}
        </section>

        <details className="mt-5" open={!selected}>
          <summary className="cursor-pointer text-lg font-semibold">3. Clasifica: A Financiera · B Servicio · C Soporte técnico</summary>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {ATENCION_CATEGORIES.map(category => <section className={card} id={`categoria-${category.key}`} key={category.key}>
              <h3 className="font-semibold">{category.key}. {category.label}</h3>
              <p className="mt-1 text-xs leading-5 text-brand-muted">{category.hint}</p>
              <div className="mt-3 flex flex-wrap gap-2">{fichas.filter(f => f.category === category.key).map(f => <FichaLink clienteId={clienteId} ficha={f} key={f.id} />)}</div>
            </section>)}
          </div>
        </details>

        {selected ? <article aria-labelledby="ficha-titulo" className="mt-6 scroll-mt-24 rounded-2xl border bg-white p-6" id="ficha">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-muted">{selected.categoryLabel} · {selected.motive}</p>
          <h2 className="mt-2 text-2xl font-semibold" id="ficha-titulo">{selected.id} · {selected.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2"><Validation value={selected.validation} /><span className="text-xs text-brand-muted">Fichas versión {source.version}</span></div>
          {selected.validation === "PENDIENTE DE VALIDACIÓN" ? <p className="mt-3 rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm text-status-warning">Texto pendiente de validación de Dirección: envíalo tal cual. No agregues tarifas, promociones, enlaces, plazos ni fechas que no muestre la fuente.</p> : null}
          {selected.validation === "REQUIERE DECISIÓN" ? <p className="mt-3 rounded-xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error">Falta una decisión de Dirección. El mensaje es neutro: no agregues oferta, condición ni fecha.</p> : null}
          {personalized ? <section aria-labelledby="respuesta" className="mt-5 rounded-2xl border border-brand-primary/40 p-4">
            <h3 className="font-semibold" id="respuesta">Respuesta {client.entry ? `para ${greetingName(client.entry.name)}` : "lista para copiar"}</h3>
            <p className="mt-1 text-xs text-brand-muted">{personalized.pending ? `${personalized.pending} dato(s) sin confirmar quedan entre corchetes: complétalos con lo que muestre la fuente o elimínalos.` : "Datos tomados de la fuente; verifica antes de enviar."}</p>
            <CopyableMessage text={personalized.text} />
          </section> : null}
          <MarkdownDocument markdown={selected.body} />

          <section aria-labelledby="reclasificar" className="mt-8 border-t pt-5">
            <h3 className="font-semibold" id="reclasificar">¿La causa es otra? Reclasifica</h3>
            <div className="mt-2 flex flex-wrap gap-2">{selected.reclassify.flatMap(id => fichas.filter(f => f.id === id)).map(f => <FichaLink clienteId={clienteId} ficha={f} key={f.id} />)}</div>
          </section>

          <section aria-labelledby="resultado" className="mt-8 border-t pt-5">
            <h3 className="font-semibold" id="resultado">6. Resultado o escalamiento</h3>
            <p className="mt-1 text-sm text-brand-graphite">Anota en la planilla de pendientes lo que quede abierto.</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">{OUTCOMES.map(([label, detail]) => <div className="rounded-xl border border-brand-border p-3" key={label}><dt className="text-sm font-semibold">{label}</dt><dd className="text-xs leading-5 text-brand-muted">{detail}</dd></div>)}</dl>
          </section>
        </article> : null}
      </details>
      </>}
    </div>
  );
}
