import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { AreaNavigation } from "@/components/layout/area-navigation";
import { Topbar } from "@/components/layout/topbar";
import { CORPORATE_BRAND } from "@/config/brand";

type AppShellProps = {
  children: ReactNode;
  user: import("@/server/auth/store").Identity;
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[292px] flex-col overflow-hidden bg-brand-primary-dark px-5 py-6 text-white lg:flex">
        <div className="absolute -top-24 -right-24 size-64 rounded-full bg-brand-cyan/10 blur-3xl" />

        <Link className="relative block px-2" href="/" aria-label="JUMOCOL Operations Intelligence, inicio">
          <span className="flex min-h-20 items-center justify-center rounded-2xl bg-brand-background px-3 py-3 shadow-[var(--brand-shadow)]">
            <BrandLockup placement="sidebar" />
          </span>
          <span className="mt-4 block min-w-0 border-l-2 border-brand-cyan pl-3">
            <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-white">
              {CORPORATE_BRAND.product}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
              {CORPORATE_BRAND.descriptor}
            </span>
          </span>
        </Link>

        <div className="relative mt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan/70">Áreas</p>
          <AreaNavigation role={user.role} variant="desktop" />
        </div>

        {user.role === "ADMIN" ? <div className="relative mt-auto rounded-3xl border border-white/10 bg-white/6 p-4">
          <span className="brand-accent-rule mb-4 block h-1 w-16 rounded-full" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cyan/70">MVP 0.1</p>
          <p className="mt-2 text-sm font-semibold leading-5 text-white/90">Arquitectura lista para crecer por módulos.</p>
          <p className="mt-2 text-xs leading-5 text-white/65">Fuentes autorizadas · identidad y auditoría persistentes en el Nitro.</p>
        </div> : null}
      </aside>

      <div className="min-h-screen lg:pl-[292px]">
        <Topbar />
        <div className="flex flex-wrap items-center gap-4 border-b px-5 py-3 text-sm">
          <span>{user.name} · {user.role}</span>
          {user.role === "ADMIN" ? <><Link href="/administracion/usuarios#accesos">Accesos</Link><Link href="/administracion/usuarios">Usuarios</Link><Link href="/administracion/auditoria">Auditoría</Link><Link href="/administracion/biblioteca">Biblioteca</Link></> : null}
          <form action="/api/auth/logout" method="post"><button className="underline">Cerrar sesión</button></form>
        </div>
        <div className="border-b border-brand-border bg-brand-background lg:hidden">
          <div className="overflow-x-auto">
            <AreaNavigation role={user.role} variant="mobile" />
          </div>
        </div>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">{children}</main>
        {user.role === "ADMIN" ? <footer className="mx-auto flex w-full max-w-[1480px] flex-col gap-2 border-t border-brand-border px-4 py-6 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>JUMOCOL Operations Intelligence · MVP local</span>
          <span>Fuentes gobernadas · procesamiento del lado servidor</span>
        </footer> : null}
      </div>
    </div>
  );
}
