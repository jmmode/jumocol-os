import Link from "next/link";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { libraryInventory } from "@/server/documents/library";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { DriveLink } from "@/components/documents/drive-link";
import { QUICK_GUIDE_ID, resolveQuickAccess } from "@/components/documents/quick-access";
import { foldText, matchesTerms, queryTerms, searchSections } from "@/components/documents/section-search";


export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const actor = await requirePage("/operaciones/tiviplay/manuales");
  const params = await searchParams;
  const all = await libraryInventory(actor);
  // Búsqueda en títulos y contenido, sin distinguir tildes ni mayúsculas: «instalacion» encuentra «INSTALACIÓN».
  // Todos los términos deben aparecer; las coincidencias en contenido enlazan a la sección exacta del documento.
  const rawQuery = (params.q ?? "").slice(0, 120).trim();
  const terms = queryTerms(rawQuery);
  const results = all
    .filter(x => !params.category || x.category === params.category)
    .map(x => {
      const title = "document" in x ? x.document.title : x.id;
      if (!rawQuery) return { entry: x, titleMatch: true, sections: [] };
      const titleMatch = matchesTerms(title, terms) || foldText(title).includes(foldText(rawQuery));
      const sections = "document" in x && !x.linkOnly ? searchSections(x.document.markdown, rawQuery) : [];
      return { entry: x, titleMatch, sections };
    })
    .filter(x => x.titleMatch || x.sections.length)
    .sort((a, b) => Number(b.titleMatch) - Number(a.titleMatch));
  const guide = all.find(x => x.id === QUICK_GUIDE_ID);
  const quick = resolveQuickAccess(guide && "document" in guide ? guide.document.markdown : null);
  const guidePublished = !!guide && "published" in guide && guide.published;
  audit(actor.id, "library", "list", "SUCCESS");
  return <div><h1 className="text-3xl font-semibold">Manuales y procesos</h1><TiviplayNavigation />
    <p className="my-5">Documentación autorizada de TiviPlay. Abre el título para leerlo aquí o usa «Abrir original en Drive» cuando esté disponible. La publicación autoriza la lectura y no certifica la validación E2E del proceso.</p>
    <form className="my-5 flex flex-wrap gap-3"><input className="w-full rounded-lg border p-3 sm:w-auto sm:min-w-[320px] sm:flex-1" type="search" aria-label="Buscar en títulos y contenido" name="q" defaultValue={params.q} placeholder="Ej.: recibí comprobante, Panel 2, Downloader" maxLength={120} /><select name="category" aria-label="Categoría" className="rounded-lg border p-3" defaultValue={params.category ?? ""}><option value="">Todas las categorías</option>{[...new Set(all.map(x => x.category))].map(x => <option key={x}>{x}</option>)}</select><button className="rounded-lg border px-4 py-3">Buscar</button></form>
    <nav aria-label="Búsquedas rápidas" className="-mt-2 mb-5 flex flex-wrap items-center gap-2 text-sm"><span className="text-brand-muted">Búsquedas rápidas:</span>{quick.map(q => q.href
      ? <Link key={q.label} className="rounded-full border px-3 py-1 hover:bg-brand-surface" href={q.href}>{q.label}</Link>
      : <span key={q.label} aria-disabled="true" className="rounded-full border border-dashed px-3 py-1 text-brand-muted">{q.label}</span>)}</nav>
    {!guide ? <p role="note" className="-mt-3 mb-5 rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm text-status-warning">La Guía rápida de turno todavía no está publicada para operadores: los accesos rápidos se activan cuando Dirección la publique.</p>
      : !guidePublished ? <p role="note" className="-mt-3 mb-5 rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm text-status-warning">Vista de Dirección: los operadores aún no ven estos accesos porque la Guía rápida de turno no está publicada para ellos.</p> : null}
    {rawQuery ? <p role="status" className="mb-4 text-sm">{results.length ? `${results.length} documento(s) para «${rawQuery}».` : "No hay documentos autorizados que coincidan con la búsqueda."}</p> : !results.length ? <p role="status">No hay documentos autorizados que coincidan con la búsqueda.</p> : null}
    <div className="grid gap-4 md:grid-cols-2">{results.map(({ entry, sections }) => <article className="rounded-2xl border p-5" key={entry.id}>
      {"document" in entry ? <><h2 className="font-semibold"><Link className="underline" href={`/operaciones/tiviplay/manuales/${entry.id}`}>{entry.document.title}</Link></h2><p className="mt-3">{entry.linkOnly ? `Presentación en Drive · ${entry.category}` : `Versión: ${entry.document.version} · ${entry.category}`}</p><p>Estado documental: {entry.document.status}</p><p>Responsable: {entry.owner ?? "NO DOCUMENTADO"}</p><p className="mt-2 font-semibold">{entry.published ? "Publicado para operadores" : "REQUIERE DECISIÓN · pendiente de aprobación para operadores"}</p>{sections.length ? <div className="mt-4 border-t pt-3"><p className="text-sm font-semibold">Dónde aparece:</p><ul className="mt-2 space-y-2">{sections.map(section => <li key={section.anchor}><Link className="font-semibold text-brand-primary underline" href={`/operaciones/tiviplay/manuales/${entry.id}#${section.anchor}`}>{section.heading}</Link>{section.snippet ? <p className="text-sm text-brand-graphite">{section.snippet}</p> : null}</li>)}</ul></div> : null}{entry.driveUrl ? <DriveLink url={entry.driveUrl} compact /> : null}</> : <p>{entry.id} · BLOQUEADO: fuente no disponible.</p>}
    </article>)}</div>
  </div>;
}
