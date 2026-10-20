import { formatCurrency, formatPercent } from "@/features/tiviplay-payments/analytics";
import type { ExecutiveComparison } from "@/features/tiviplay-payments/domain";

export function MonthlyExecutiveComparison({
  comparison,
  onSelectMonth,
}: {
  comparison: ExecutiveComparison;
  onSelectMonth: (period: string) => void;
}) {
  if (!comparison.rows.length) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm">
      <div className="border-b border-brand-border bg-gradient-to-r from-brand-primary-dark to-brand-primary px-5 py-5 text-white sm:px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
          Vista ejecutiva · junio–agosto 2026
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Comparación mensual gobernada</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-white/75">
              Importes separados por moneda. Selecciona un mes para aplicar el filtro al dashboard completo.
            </p>
          </div>
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold">
            {comparison.rows.length} meses disponibles
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1720px] border-collapse text-left text-xs">
          <thead className="bg-brand-surface text-[9px] font-black uppercase tracking-[0.08em] text-brand-muted">
            <tr>
              <th className="sticky left-0 z-10 border-b border-brand-border bg-brand-surface px-4 py-3">Mes</th>
              <th className="border-b border-brand-border px-3 py-3">Confirmado USD</th>
              <th className="border-b border-brand-border px-3 py-3">Variación USD</th>
              <th className="border-b border-brand-border px-3 py-3">Confirmado COP</th>
              <th className="border-b border-brand-border px-3 py-3">Esperado / pendiente COP</th>
              <th className="border-b border-brand-border px-3 py-3">Confirmado CAD</th>
              <th className="border-b border-brand-border px-3 py-3">Esperado / pendiente USD</th>
              <th className="border-b border-brand-border px-3 py-3">Meta diaria</th>
              <th className="border-b border-brand-border px-3 py-3">Pagos / clientes</th>
              <th className="border-b border-brand-border px-3 py-3">Ventas / renovaciones</th>
              <th className="border-b border-brand-border px-3 py-3">Método líder</th>
              <th className="border-b border-brand-border px-3 py-3">Asesor líder</th>
              <th className="border-b border-brand-border px-3 py-3">Ticket USD</th>
              <th className="border-b border-brand-border px-3 py-3">PayPal</th>
              <th className="border-b border-brand-border px-3 py-3">Conciliación</th>
              <th className="border-b border-brand-border px-3 py-3">Créditos</th>
              <th className="border-b border-brand-border px-3 py-3">Alertas</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => {
              const variation = row.variationUsd;
              const credits = Object.values(row.creditsByPanel).reduce((total, value) => total + value, 0);
              return (
                <tr key={row.period} className="border-b border-brand-border/70 bg-white last:border-b-0 hover:bg-brand-blue-soft/20">
                  <td className="sticky left-0 z-10 bg-white px-4 py-4 align-top">
                    <button
                      className="font-bold text-brand-primary-dark hover:text-brand-primary hover:underline"
                      onClick={() => onSelectMonth(row.period)}
                      type="button"
                    >
                      {row.label}
                    </button>
                  </td>
                  <td className="px-3 py-4 align-top font-bold tabular-nums text-status-success">
                    {formatCurrency(row.metrics.currencies.USD.confirmed, "USD")}
                  </td>
                  <td className={`px-3 py-4 align-top font-bold tabular-nums ${variation && variation.absolute < 0 ? "text-status-error" : "text-status-success"}`}>
                    {variation
                      ? `${variation.absolute >= 0 ? "+" : ""}${formatCurrency(variation.absolute, "USD")} · ${variation.percentage === null ? "sin base" : `${variation.percentage >= 0 ? "+" : ""}${formatPercent(variation.percentage)}`}`
                      : "Base inicial"}
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">{formatCurrency(row.metrics.currencies.COP.confirmed, "COP")}</td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block">{formatCurrency(row.metrics.currencies.COP.expected, "COP")}</span>
                    <span className="mt-1 block text-[10px] text-brand-muted">Pendiente {formatCurrency(row.metrics.currencies.COP.pending, "COP")}</span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">{formatCurrency(row.metrics.currencies.CAD.confirmed, "CAD")}</td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block">{formatCurrency(row.metrics.currencies.USD.expected, "USD")}</span>
                    <span className="mt-1 block text-[10px] text-brand-muted">Pendiente {formatCurrency(row.metrics.currencies.USD.pending, "USD")}</span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block font-bold">{formatPercent(row.metrics.dailyGoalRate)}</span>
                    <span className="mt-1 block text-[10px] text-brand-muted">{formatCurrency(row.metrics.averageDailyUsd, "USD")}/día activo</span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">{row.metrics.paymentCount} / {row.metrics.uniquePayingClients}</td>
                  <td className="px-3 py-4 align-top tabular-nums">{row.metrics.newSales} / {row.metrics.renewals}</td>
                  <td className="px-3 py-4 align-top">
                    <span className="block font-bold">{row.topMethod?.label ?? "Sin evidencia"}</span>
                    {row.topMethod ? <span className="mt-1 block text-[10px] text-brand-muted">{formatCurrency(row.topMethod.amountUsd, "USD")}</span> : null}
                  </td>
                  <td className="px-3 py-4 align-top">
                    <span className="block font-bold">{row.topAdvisor?.label ?? "Sin evidencia"}</span>
                    {row.topAdvisor ? <span className="mt-1 block text-[10px] text-brand-muted">{formatCurrency(row.topAdvisor.amountUsd, "USD")}</span> : null}
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">{formatCurrency(row.metrics.currencies.USD.ticketAverage, "USD")}</td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block">Neto {formatCurrency(row.metrics.paypalNet, "USD")}</span>
                    <span className="mt-1 block text-[10px] text-brand-muted">Comisión {formatCurrency(row.metrics.paypalCommission, "USD")} · bruto {formatCurrency(row.metrics.paypalGross, "USD")}</span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block font-bold">{formatPercent(row.metrics.reconciliationRate)}</span>
                    <span className="mt-1 block text-[10px] text-brand-muted">{row.metrics.unreconciledRecords} por revisar</span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className="block font-bold">{new Intl.NumberFormat("es-CO").format(credits)}</span>
                    <span className="mt-1 block max-w-40 text-[10px] leading-4 text-brand-muted">
                      {Object.entries(row.creditsByPanel).map(([panel, value]) => `${panel}: ${value}`).join(" · ") || "Sin registros"}
                    </span>
                  </td>
                  <td className="px-3 py-4 align-top tabular-nums">
                    <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black ${row.qualityIssues ? "bg-brand-yellow/15 text-status-warning" : "bg-brand-green/10 text-status-success"}`}>
                      {row.qualityIssues}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-brand-border bg-brand-surface/50 p-5 md:grid-cols-2 xl:grid-cols-3">
        {comparison.conclusions.map((conclusion) => (
          <article key={conclusion.id} className="rounded-2xl border border-brand-border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xs font-bold leading-5 text-brand-text">{conclusion.finding}</h3>
              <span className="rounded-full bg-brand-blue-soft px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-brand-primary-dark">
                {conclusion.level}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-brand-muted">{conclusion.evidence}</p>
            <p className="mt-2 text-[10px] font-semibold leading-4 text-brand-graphite">{conclusion.comparison}</p>
            <p className="mt-2 text-[10px] leading-4 text-brand-primary-dark">Acción: {conclusion.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
