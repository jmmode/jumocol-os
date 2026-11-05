"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AREA_CATALOG } from "@/config/areas";

type AreaNavigationProps = {
  variant: "desktop" | "mobile";
  role: "ADMIN" | "OPERADOR";
};

function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AreaNavigation({ variant, role }: AreaNavigationProps) {
  const pathname = usePathname();
  const isDesktop = variant === "desktop";
  if (role === "OPERADOR") return <nav aria-label="Navegación principal" className="p-3"><Link href="/operaciones/tiviplay">Operaciones → TiviPlay</Link></nav>;

  return (
    <nav
      aria-label="Navegación principal"
      className={isDesktop ? "space-y-1.5" : "flex min-w-max items-center gap-2 px-4 py-3"}
    >
      <Link
        aria-current={pathname === "/" ? "page" : undefined}
        className={
          isDesktop
            ? `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                pathname === "/"
                  ? "bg-brand-background text-brand-primary-dark shadow-[var(--brand-shadow)]"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              }`
            : `rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                pathname === "/"
                  ? "border-brand-primary-dark bg-brand-primary-dark text-white"
                  : "border-brand-border bg-brand-background text-brand-muted hover:border-brand-primary"
              }`
        }
        href="/"
      >
        {isDesktop ? (
          <span className="flex size-8 items-center justify-center rounded-xl border border-current/15 text-[10px] tracking-[0.08em]">
            00
          </span>
        ) : null}
        <span>Visión general</span>
      </Link>

      {AREA_CATALOG.map((area) => {
        const active = isCurrentPath(pathname, area.href);

        return (
          <Link
            key={area.id}
            aria-current={active ? "page" : undefined}
            className={
              isDesktop
                ? `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-brand-background text-brand-primary-dark shadow-[var(--brand-shadow)]"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`
                : `rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                    active
                      ? "border-brand-primary-dark bg-brand-primary-dark text-white"
                      : "border-brand-border bg-brand-background text-brand-muted hover:border-brand-primary"
                  }`
            }
            href={area.href}
          >
            {isDesktop ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-current/15 text-[10px] tracking-[0.08em]">
                {area.index}
              </span>
            ) : null}
            <span className={isDesktop ? "leading-5" : undefined}>
              {isDesktop ? area.label : area.shortLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
