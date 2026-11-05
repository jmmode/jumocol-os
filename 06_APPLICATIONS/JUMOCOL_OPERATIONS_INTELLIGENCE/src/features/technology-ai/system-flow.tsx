import type { CSSProperties } from "react";

import type { ArchitectureLayer } from "@/features/technology-ai/types";

type SystemFlowProps = {
  steps: readonly ArchitectureLayer[];
  ariaLabel: string;
  compact?: boolean;
};

export function SystemFlow({ steps, ariaLabel, compact = false }: SystemFlowProps) {
  return (
    <ol
      aria-label={ariaLabel}
      className={
        compact
          ? "grid gap-2 sm:grid-cols-2 xl:grid-cols-[repeat(var(--flow-columns),minmax(0,1fr))]"
          : "grid gap-3 lg:grid-cols-[repeat(var(--flow-columns),minmax(0,1fr))]"
      }
      style={{ "--flow-columns": steps.length } as CSSProperties}
    >
      {steps.map((step, index) => (
        <li className="relative min-w-0" key={step.id}>
          <article
            className={
              compact
                ? "h-full rounded-2xl border border-brand-border bg-brand-background p-4"
                : "h-full rounded-3xl border border-brand-border bg-brand-background p-5 shadow-[var(--brand-shadow)]"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-dark text-[9px] font-black text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="text-lg font-semibold text-brand-primary lg:absolute lg:top-1/2 lg:-right-2.5 lg:z-10 lg:-translate-y-1/2">
                  <span className="lg:hidden">↓</span>
                  <span className="hidden lg:inline">→</span>
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-brand-text">{step.label}</h3>
            <p className="mt-2 text-xs leading-5 text-brand-muted">{step.detail}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
