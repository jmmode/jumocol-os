"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LIBRARY_SECTIONS } from "@/server/documents/curation";

const LINKS = [
  { href: "/operaciones/tiviplay/manuales", label: "Manuales y procesos" },
  { href: "/operaciones/tiviplay/hoy", label: "HOY" },
  { href: "/operaciones/tiviplay/avance", label: "Avance del mes" },
  { href: "/operaciones/tiviplay/conciliacion", label: "Conciliación" },
  { href: "/operaciones/tiviplay", label: "Command Center" },
  { href: "/operaciones/tiviplay/contexto", label: "Contexto" },
  { href: "/operaciones/tiviplay/runtime", label: "Runtime Operativo" },
] as const;

const LIBRARY = "/operaciones/tiviplay/manuales";
const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition ${active ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border bg-brand-background text-brand-muted hover:border-brand-primary hover:text-brand-primary"}`;

/**
 * Presentation only: one-click links to the existing ?category= filter. Access control stays on the server.
 * Plain <a> (full load) on purpose: the existing search form uses an uncontrolled <select defaultValue>,
 * which a client-side transition would leave showing the previous area.
 */
function LibraryAreas() {
  const params = useSearchParams();
  const current = params.get("category") ?? "";
  return (
    <nav aria-label="Áreas de la biblioteca" className="mt-3 flex flex-wrap gap-2">
      <a aria-current={!current ? "page" : undefined} className={chip(!current)} href={LIBRARY}>Todas las áreas</a>
      {LIBRARY_SECTIONS.map((section) => (
        <a aria-current={current === section ? "page" : undefined} className={chip(current === section)} href={`${LIBRARY}?category=${encodeURIComponent(section)}`} key={section}>
          {section}
        </a>
      ))}
    </nav>
  );
}

export function TiviplayNavigation() {
  const pathname = usePathname();
  const inViewer = pathname.startsWith(`${LIBRARY}/`);

  return (
    <>
      <nav aria-label="Navegación TiviPlay" className="mt-5 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link aria-current={active ? "page" : undefined} className={chip(active)} href={link.href} key={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      {pathname === LIBRARY ? <Suspense fallback={null}><LibraryAreas /></Suspense> : null}
      {inViewer ? (
        <Link className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary-dark underline" href={LIBRARY}>
          <span aria-hidden="true">←</span> Volver a Manuales y procesos
        </Link>
      ) : null}
    </>
  );
}
