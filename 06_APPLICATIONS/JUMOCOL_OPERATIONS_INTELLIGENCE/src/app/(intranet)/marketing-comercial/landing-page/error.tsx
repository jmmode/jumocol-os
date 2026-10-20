"use client";

type LandingPageErrorProps = {
  reset: () => void;
};

export default function LandingPageError({ reset }: LandingPageErrorProps) {
  return (
    <section className="rounded-[2rem] border border-brand-border bg-brand-background p-8 shadow-[var(--brand-shadow)]">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-status-error">
        Fuente temporalmente no disponible
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-brand-text">
        No fue posible leer los leads autorizados
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">
        La intranet no modificó la fuente. Reintenta la consulta o valida la configuración server-side.
      </p>
      <button
        className="mt-6 rounded-full bg-brand-primary-dark px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:bg-brand-primary"
        onClick={reset}
        type="button"
      >
        Reintentar lectura
      </button>
    </section>
  );
}
