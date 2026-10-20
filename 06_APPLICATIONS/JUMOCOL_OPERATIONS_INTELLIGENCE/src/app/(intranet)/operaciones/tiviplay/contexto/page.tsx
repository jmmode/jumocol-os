import { libraryEntry } from "@/server/documents/library";
import { requirePage } from "@/server/auth/access";
import type { Metadata } from "next";
import Link from "next/link";

import { MarkdownDocument } from "@/components/documents/markdown-document";
import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";

export const metadata: Metadata = {
  title: "TiviPlay · Contexto Maestro",
};

export const dynamic = "force-dynamic";

export default async function TiviplayContextPage() {
  const identity = await requirePage("/operaciones/tiviplay/contexto");
  const entry = await libraryEntry("tiviplay-context", identity);
  if (!entry) return <div><h1 className="text-2xl font-semibold">Contexto TiviPlay</h1><TiviplayNavigation /><p className="mt-5">No hay contexto autorizado para consulta en este momento.</p></div>;
  const document = entry.document;
  const sectionHeadings = document.headings.filter((heading) => heading.level === 2);

  return (
    <div className="min-w-0">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones/tiviplay">TiviPlay</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">Contexto</span>
      </nav>

      <PageHeader
        badge={document.status}
        description="Representación server-side y read-only del Contexto Maestro canónico. La vista no sustituye Google Drive, Google Sheets ni la revisión humana."
        eyebrow={`${document.module} · ${document.submodule}`}
        title={document.title}
      />
      <TiviplayNavigation />

      <aside className="mt-6 rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 px-5 py-4 text-sm leading-6 text-brand-graphite" role="status">
        <strong className="text-status-warning">DRAFT — IN REVIEW:</strong> este documento organiza evidencia existente y permanece pendiente de aprobación humana. No certifica el modelo operativo completo.
      </aside>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Identificador", document.identifier],
          ["Versión", document.version],
          ["Fecha de corte", document.cutoffDate],
          ["Estado", document.status],
          ["Decisión", document.governingDecision],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-brand-border bg-brand-background p-4" key={label}>
            <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</dt>
            <dd className="mt-2 break-words text-sm font-semibold leading-5 text-brand-text">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)] xl:sticky xl:top-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">Tabla de contenido</p>
          <ol className="mt-4 max-h-[65vh] space-y-1.5 overflow-y-auto pr-2 text-xs leading-5">
            {sectionHeadings.map((heading) => (
              <li key={heading.id}><a className="block rounded-xl px-3 py-2 text-brand-muted transition hover:bg-brand-surface hover:text-brand-primary" href={`#${heading.id}`}>{heading.label}</a></li>
            ))}
          </ol>
          <div className="mt-5 border-t border-brand-border pt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-muted">Fuente canónica</p>
            <p className="mt-2 break-words font-mono text-[10px] leading-5 text-brand-graphite">{document.sourceReference}</p>
            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">SHA-256 · {document.sha256.slice(0, 12)}…</p>
          </div>
        </aside>

        <article className="min-w-0 rounded-[2rem] border border-brand-border bg-brand-background px-5 pb-10 pt-3 shadow-[var(--brand-shadow)] sm:px-8 lg:px-10">
          <MarkdownDocument markdown={document.markdown} />
        </article>
      </div>
    </div>
  );
}

