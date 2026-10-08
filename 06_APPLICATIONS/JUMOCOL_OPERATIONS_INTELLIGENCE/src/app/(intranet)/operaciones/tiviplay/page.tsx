import Link from "next/link";

const modules = [
  {
    title: "Runtime operativo",
    description:
      "Consulta el cierre mensual, integridad de fuente y excepciones de la operación TiviPlay.",
    href: "/operaciones/tiviplay/runtime",
    status: "OPERATIVO",
  },
  {
    title: "Capacitación TiviPlay",
    description:
      "Onboarding operativo por días y bloques, con ejercicios, evidencia y gates de validación.",
    href: "/operaciones/tiviplay/capacitacion",
    status: "EN IMPLEMENTACIÓN",
  },
];

export default function TiviplayHomePage() {
  return (
    <main className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Operaciones
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">TiviPlay</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Punto de entrada a la operación, continuidad y capacitación del equipo.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {module.status}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
