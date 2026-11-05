import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-brand-border bg-brand-background p-8 text-center shadow-[var(--brand-shadow)] sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-primary">Ruta no disponible</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-brand-text">Esta vista aún no existe</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-brand-muted">
          Regresa a la visión general para continuar navegando por las áreas habilitadas del MVP.
        </p>
        <Link
          className="mt-7 inline-flex rounded-full bg-brand-primary-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary"
          href="/"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
