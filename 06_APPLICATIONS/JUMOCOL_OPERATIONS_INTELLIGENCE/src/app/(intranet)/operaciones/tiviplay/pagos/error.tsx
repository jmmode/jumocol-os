"use client";

export default function TiviplayPaymentsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-3xl border border-brand-red/25 bg-white p-7 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-status-error">Error controlado</p>
      <h1 className="mt-3 text-2xl font-semibold text-brand-text">No fue posible presentar Gestión de pagos</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-muted">La ruta permanece disponible, pero la lectura o normalización de la fuente falló. No se modificó el archivo original.</p>
      <button className="mt-5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white" onClick={reset} type="button">Reintentar</button>
    </div>
  );
}
