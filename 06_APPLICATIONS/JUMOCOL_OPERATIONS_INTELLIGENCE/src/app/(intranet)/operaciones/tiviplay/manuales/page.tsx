import Link from "next/link";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { libraryInventory } from "@/server/documents/library";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const actor = await requirePage("/operaciones/tiviplay/manuales");
  const params = await searchParams;
  const all = await libraryInventory(actor);
  const query = (params.q ?? "").slice(0, 120).toLocaleLowerCase("es");
  const entries = all.filter(x => (!params.category || x.category === params.category) && ("document" in x ? x.document.title : x.id).toLocaleLowerCase("es").includes(query));
  audit(actor.id, "library", "list", "SUCCESS");
  return <div><h1 className="text-3xl font-semibold">Manuales y procesos</h1><TiviplayNavigation />
    <p className="my-5">Documentación canónica consultada desde su fuente. La publicación autoriza la lectura y no certifica la validación E2E del proceso.</p>
    <form className="my-5 flex flex-wrap gap-3"><input className="rounded-lg border p-3" aria-label="Buscar por título" name="q" defaultValue={params.q} placeholder="Buscar por título" maxLength={120} /><select name="category" aria-label="Categoría" className="rounded-lg border p-3" defaultValue={params.category ?? ""}><option value="">Todas las categorías</option>{[...new Set(all.map(x => x.category))].map(x => <option key={x}>{x}</option>)}</select><button className="rounded-lg border px-4">Buscar</button></form>
    {!entries.length ? <p role="status">No hay documentos autorizados que coincidan con la búsqueda.</p> : null}
    <div className="grid gap-4 md:grid-cols-2">{entries.map(entry => <article className="rounded-2xl border p-5" key={entry.id}>
      {"document" in entry ? <><h2 className="font-semibold"><Link className="underline" href={`/operaciones/tiviplay/manuales/${entry.id}`}>{entry.document.title}</Link></h2><p className="mt-3">Versión: {entry.document.version} · {entry.category}</p><p>Estado documental: {entry.document.status}</p><p>Responsable: {entry.owner ?? "NO DOCUMENTADO"}</p><p className="mt-2 font-semibold">{entry.published ? "Publicado para operadores" : "REQUIERE DECISIÓN · pendiente de aprobación para operadores"}</p></> : <p>{entry.id} · BLOQUEADO: fuente no disponible.</p>}
    </article>)}</div>
  </div>;
}
