import { notFound } from "next/navigation";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { documentId, libraryEntry } from "@/server/documents/library";
import { MarkdownDocument } from "@/components/documents/markdown-document";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { PublicationControl } from "@/features/identity/publication-control";
import { DriveLink } from "@/components/documents/drive-link";
import { readPanelEndpoints } from "@/server/documents/panel-endpoints";
export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requirePage("/operaciones/tiviplay/manuales");
  const id = documentId((await params).id);
  if (!id) notFound();
  const entry = await libraryEntry(id, actor);
  if (!entry) { audit(actor.id, `document:${id}`, "read", "DENIED"); notFound(); }
  audit(actor.id, `document:${id}`, "read", "SUCCESS");
  return <div><h1 className="text-2xl font-semibold">{entry.document.title}</h1><TiviplayNavigation />
    <p className="my-4">Versión {entry.document.version} · {entry.document.status} · Responsable: {entry.owner ?? "NO DOCUMENTADO"}</p>
    {actor.role === "ADMIN" ? <aside className="my-5 rounded-xl border p-4"><p>{entry.published ? `Publicado por ${entry.approval?.approved_by} · ${entry.approval?.approved_at}` : "REQUIERE DECISIÓN · lectura pendiente de autorización para operadores"}</p><p className="my-2 break-all text-xs">SHA-256: {entry.document.sha256}</p>{entry.approval ? <p>Referencia de aprobación: {entry.approval.evidence}</p> : null}<PublicationControl id={id} sha256={entry.document.sha256} draft={entry.draft} published={entry.published} /></aside> : null}
    {entry.driveUrl ? <DriveLink url={entry.driveUrl} /> : null}
    <article className="rounded-2xl border bg-white p-6"><MarkdownDocument markdown={entry.document.markdown} panelEndpoints={/```endpoints [123]/.test(entry.document.markdown) ? readPanelEndpoints() : undefined} /></article>
  </div>;
}
