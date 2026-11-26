import Link from "next/link";
import { requirePage } from "@/server/auth/access";
import { audit, listUsers } from "@/server/auth/store";
import { CATALOG_STATUS_LABEL, LIBRARY_SECTIONS, type CatalogStatus } from "@/server/documents/curation";
import { libraryInventory, linkEligible } from "@/server/documents/library";
import { discoverLifeosDocuments } from "@/server/documents/lifeos-discovery";

export const dynamic = "force-dynamic";

const viewerHref = (id: string) => `/operaciones/tiviplay/manuales/${id}`;
const STATUS_ORDER: Array<CatalogStatus | "VIGENTE_APTO"> = ["VIGENTE_APTO", "PENDIENTE_VALIDACION", "HISTORICO", "RESTRINGIDO", "DUPLICADO_CONTRADICTORIO"];

export default async function LibraryInventoryPage() {
  const actor = await requirePage("/administracion/biblioteca");
  listUsers(actor); // Live ADMIN check on the server, not only the route policy.
  const fullDiscovery = discoverLifeosDocuments({ fresh: true });
  // Recursos solo-enlace ya figuran como entradas del catálogo: no listarlos dos veces.
  const discovery = { ...fullDiscovery, skipped: fullDiscovery.skipped.filter(item => !linkEligible(item)) };
  const entries = await libraryInventory(actor);
  const readable = entries.filter(entry => "document" in entry);
  const blocked = entries.filter(entry => !("document" in entry));
  const statusOf = (entry: (typeof entries)[number]) => ("published" in entry && entry.published ? "VIGENTE_APTO" : entry.catalogStatus);
  const counts = STATUS_ORDER.map(status => [status, entries.filter(e => statusOf(e) === status).length + discovery.skipped.filter(s => s.catalogStatus === status).length] as const);
  audit(actor.id, "library", "inventory", "SUCCESS");
  const stat = (label: string, value: number) => <div key={label} className="min-w-0 rounded-xl border p-4"><dt className="text-sm leading-5">{label}</dt><dd className="text-2xl font-semibold">{value}</dd></div>;
  const cell = "p-3 [overflow-wrap:anywhere]";

  return <div className="min-w-0">
    <h1 className="text-2xl font-semibold">Inventario documental TiviPlay</h1>
    <p className="my-3 max-w-3xl">Fuente LIFE-OS: {discovery.available ? "disponible (solo lectura)" : "NO DISPONIBLE en este equipo"}. Los originales nunca se modifican. «Vigente y apto» solo existe cuando ADMIN publica una versión exacta con evidencia y el estándar operativo 7/7. Vuelva aquí con «Biblioteca» en la barra superior.</p>
    <dl className="my-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {stat("Archivos encontrados", entries.length + discovery.skipped.length)}
      {counts.map(([status, n]) => stat(CATALOG_STATUS_LABEL[status], n))}
    </dl>

    {LIBRARY_SECTIONS.map(section => {
      const rows = readable.filter(entry => entry.category === section);
      const locked = blocked.filter(entry => entry.category === section);
      const files = discovery.skipped.filter(item => item.section === section);
      const total = rows.length + locked.length + files.length;
      return <section key={section} className="my-8 min-w-0">
        <h2 className="text-lg font-semibold">{section} ({total})</h2>
        {total === 0 ? <p className="mt-2 text-sm">Sin documentos.</p> : (
          // Overflow stays inside this box: the page never scrolls sideways under the fixed sidebar.
          <div className="mt-3 max-w-full overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[820px] table-fixed text-left text-sm">
              <colgroup><col className="w-[34%]" /><col className="w-[16%]" /><col className="w-[34%]" /><col className="w-[16%]" /></colgroup>
              <thead className="bg-brand-surface text-xs uppercase tracking-wide"><tr><th className="p-3">Documento</th><th className="p-3">Catálogo</th><th className="p-3">Motivo / decisión requerida</th><th className="p-3">Lectura</th></tr></thead>
              <tbody>
                {rows.map(entry => <tr key={entry.id} className="border-t align-top">
                  <td className={cell}>
                    <Link className="font-semibold text-brand-primary-dark underline" href={viewerHref(entry.id)}>{entry.document.title}</Link>
                    <div className="mt-1 text-xs text-brand-muted">{entry.document.sourceReference}</div>
                  </td>
                  <td className={cell}><strong>{entry.catalogLabel}</strong>{entry.proposedCurrent && !entry.published ? <span className="mt-1 block text-xs">Propuesto como vigente</span> : null}</td>
                  <td className={cell}>{entry.published ? `Publicado por ${entry.approval?.approved_by} · ${entry.approval?.evidence}` : entry.catalogReason}</td>
                  <td className="p-3"><Link className="inline-block rounded-lg border px-3 py-1 font-semibold" href={viewerHref(entry.id)} aria-label={`Abrir ${entry.document.title}`}>Abrir</Link></td>
                </tr>)}
                {locked.map(entry => <tr key={entry.id} className="border-t align-top">
                  <td className={cell}>{entry.id}<div className="mt-1 text-xs text-brand-muted">{entry.origin}</div></td>
                  <td className={cell}><strong>{CATALOG_STATUS_LABEL[entry.catalogStatus]}</strong></td>
                  <td className={cell}>{entry.catalogReason}</td>
                  <td className={cell}>Bloqueada: {entry.restriction ?? "fuente no disponible"}</td>
                </tr>)}
                {files.map(item => <tr key={item.relativePath} className="border-t align-top">
                  <td className={cell}>{item.relativePath.split("/").pop()}<div className="mt-1 text-xs text-brand-muted">LIFE-OS/TIVIPLAY_OPERATION_SYSTEM/{item.relativePath}</div></td>
                  <td className={cell}><strong>{item.catalogStatus ? CATALOG_STATUS_LABEL[item.catalogStatus] : "SIN CURADURÍA"}</strong></td>
                  <td className={cell}>{item.catalogReason ?? "Revisión documental pendiente."}</td>
                  <td className={cell}>No disponible en el visor: {item.reason}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>;
    })}

    {discovery.skipped.some(item => !item.section) ? <section className="my-8"><h2 className="text-lg font-semibold">Sin sección asignada</h2><ul className="list-disc pl-6 text-sm">{discovery.skipped.filter(item => !item.section).map(item => <li key={item.relativePath} className="[overflow-wrap:anywhere]">{item.relativePath}: {item.reason}</li>)}</ul></section> : null}
  </div>;
}
