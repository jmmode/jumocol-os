export default function TiviplayPaymentsLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="h-36 animate-pulse rounded-3xl bg-white" />
      <div className="h-28 animate-pulse rounded-3xl bg-brand-blue-soft" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}
      </div>
      <span className="sr-only">Procesando fuente Excel de TiviPlay…</span>
    </div>
  );
}
