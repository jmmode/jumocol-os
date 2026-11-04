import Link from "next/link";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { CORPORATE_BRAND } from "@/config/brand";

export function Topbar({ operator = false }: { operator?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border/90 bg-brand-background/92 backdrop-blur-xl">
      <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 ${operator ? "min-h-[54px] py-2" : "min-h-[76px] py-3"}`}>
        <div className="flex min-w-0 items-center gap-3">
          <Link className="shrink-0 lg:hidden" href="/" aria-label="JUMOCOL Operations Intelligence, inicio">
            <BrandLockup placement="mobile" />
          </Link>
          <div className="hidden min-w-0 border-l border-brand-border pl-3 sm:block lg:border-l-0 lg:pl-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary">
              {CORPORATE_BRAND.product}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-brand-graphite">{CORPORATE_BRAND.descriptor}</p>
          </div>
        </div>

        {!operator ? <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-brand-border bg-brand-surface px-3 py-2 text-[11px] font-semibold text-brand-muted md:inline-flex">
            Fuentes mixtas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-[11px] font-bold text-status-success">
            <span className="size-2 rounded-full bg-brand-green" />
            Entorno local
          </span>
        </div> : null}
      </div>
    </header>
  );
}
