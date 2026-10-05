import Link from "next/link";

import { getTiviplayMonthlyCloseLive } from "@/server/tiviplay-live/monthly-close";

export const dynamic = "force-dynamic";

const reasonLabel: Record<string, string> = {
  POSSIBLE_FREE_MONTH: "Posible mes gratis",
  POSSIBLE_NO_RENEWAL: "Posible no renovación",
  EXPLICIT_EXCEPTION: "Excepción explícita",
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export default async function TiviplayRuntimePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const month =
    params.month ??
    process.env.TIVIPLAY_TARGET_MONTH ??
    new Date().toISOString().slice(0, 7);

  let data;
  try {
    data = await getTiviplayMonthlyCloseLive(month);
  } catch (error) {
    return (
      <main className="space-y-6">
        <div>
          <Link
            href="/operaciones/tiviplay"
            className="text-sm text-slate-500 hover:text-slate-950"
          >
            ← TiviPlay
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">Runtime TiviPlay</h1>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <div className="font-semibold">BLOQUEADO</div>
          <div className="mt-2 text-sm">
            {error instanceof Error ? error.message : "No fue posible leer la fuente viva."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/operaciones/tiviplay"
            className="text-sm text-slate-500 hover:text-slate-950"
          >
            ← TiviPlay
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Runtime TiviPlay
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Fuente viva · {data.source.workbook} / {data.source.sheet}
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
          <span className="font-medium">{data.status}</span>
          <span className="ml-2 text-slate-500">{data.source.targetMonth}</span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Universo" value={data.summary.total} />
        <Metric label="Facturar candidato" value={data.summary.facturarCandidato} />
        <Metric label="Requiere revisión" value={data.summary.requiereRevision} />
        <Metric label="Duplicados" value={data.summary.duplicates} />
        <Metric label="Errores de datos" value={data.summary.dataExceptions} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Semanas operativas</h2>
          <div className="mt-5 grid grid-cols-5 gap-3">
            {data.summary.weeks.map((value, index) => (
              <div key={index} className="rounded-lg bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">S{index + 1}</div>
                <div className="mt-1 text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Excepciones operativas</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(data.reviewReasons).map(([reason, value]) => (
              <div
                key={reason}
                className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm"
              >
                <span>{reasonLabel[reason] ?? reason}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span>Calidad de datos</span>
              <span className="font-semibold">{data.summary.dataExceptions}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Integridad del runtime</h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-slate-500">Fuente estable durante lectura</dt>
            <dd className="mt-1 font-medium">
              {data.source.stableDuringRead ? "SÍ" : "NO"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Generado</dt>
            <dd className="mt-1 font-medium">{data.generatedAt}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Firma resultado</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              {data.signatures.result}
            </dd>
          </div>
        </dl>
      </section>

      {data.exceptions.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">
            Calidad de datos · requiere corrección
          </h2>
          <div className="mt-3 space-y-2 text-sm text-amber-950">
            {data.exceptions.map((item) => (
              <div key={item.sourceRow}>
                BASE GENERAL!{item.sourceRow} · {item.type} · valor:{" "}
                <code>{item.rawValue}</code>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
