"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { PageHeader } from "@/components/ui/page-header";
import {
  billingByMonth,
  buildExecutiveComparison,
  buildOperationalConclusions,
  calculateMetrics,
  confirmedPayments,
  filterDataset,
  formatCurrency,
  formatPercent,
  groupCount,
  groupNumber,
} from "@/features/tiviplay-payments/analytics";
import {
  ComparisonBars,
  DailyRevenueChart,
  InteractiveBarList,
  MetricCard,
  OperationalHeatmap,
  SectionCard,
  type DailyDatum,
} from "@/features/tiviplay-payments/dashboard-charts";
import {
  DEFAULT_TIVIPLAY_PAYMENTS_FILTERS,
  type ComparisonMode,
  type Currency,
  type DashboardFilters,
  TIVIPLAY_EXPECTED_COVERAGE,
  type TiviplayPaymentsSnapshot,
} from "@/features/tiviplay-payments/domain";
import { MonthlyExecutiveComparison } from "@/features/tiviplay-payments/monthly-executive-comparison";
import { monthLabel } from "@/features/tiviplay-payments/normalization";
import { PaymentsTable } from "@/features/tiviplay-payments/payments-table";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";

const CURRENCIES: Currency[] = ["USD", "COP", "CAD"];
const FILTER_LABELS: Record<keyof DashboardFilters, string> = {
  dateFrom: "Desde",
  dateTo: "Hasta",
  year: "Año",
  month: "Mes",
  advisor: "Asesor",
  method: "Método",
  origin: "Origen",
  panel: "Panel",
  plan: "Plan",
  clientStatus: "Estado",
  reconciliation: "Conciliación",
  currency: "Moneda",
  client: "Cliente",
  type: "Tipo",
};

export function TiviplayPaymentsDashboard({ initialSnapshot }: { initialSnapshot: TiviplayPaymentsSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_TIVIPLAY_PAYMENTS_FILTERS);
  const [chartCurrency, setChartCurrency] = useState<Currency>("USD");
  const [comparison, setComparison] = useState<ComparisonMode>("previous-month");
  const [isRefreshing, startRefresh] = useTransition();
  const [refreshMessage, setRefreshMessage] = useState("");

  const dataset = useMemo(() => filterDataset(snapshot, filters), [filters, snapshot]);
  const metrics = useMemo(() => calculateMetrics(dataset), [dataset]);
  const conclusions = useMemo(
    () => buildOperationalConclusions(dataset, metrics, snapshot),
    [dataset, metrics, snapshot],
  );
  const charts = useMemo(
    () => buildChartData(dataset, chartCurrency),
    [chartCurrency, dataset],
  );
  const comparisonInsight = useMemo(
    () => calculateComparison(snapshot, filters, metrics.currencies.USD.confirmed, comparison),
    [comparison, filters, metrics.currencies.USD.confirmed, snapshot],
  );
  const executiveComparison = useMemo(() => buildExecutiveComparison(snapshot), [snapshot]);
  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value)) as Array<[
    keyof DashboardFilters,
    string,
  ]>;

  function toggleFilter<K extends keyof DashboardFilters>(key: K, value: string) {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? "" : value }));
  }

  function setDateAndMethod(date: string, method: string) {
    setFilters((current) => {
      const isSame = current.dateFrom === date && current.dateTo === date && current.method === method;
      return { ...current, dateFrom: isSame ? "" : date, dateTo: isSame ? "" : date, method: isSame ? "" : method };
    });
  }

  function setMonth(period: string, currency: Currency = chartCurrency) {
    const [year, month] = period.split("-");
    setFilters((current) => {
      const isSame = current.year === year && current.month === String(Number(month)) && current.currency === currency;
      return isSame
        ? DEFAULT_TIVIPLAY_PAYMENTS_FILTERS
        : {
            ...current,
            dateFrom: "",
            dateTo: "",
            year,
            month: String(Number(month)),
            currency,
          };
    });
  }

  function refreshSource() {
    setRefreshMessage("");
    startRefresh(async () => {
      try {
        const response = await fetch("/api/operations/tiviplay/payments/refresh", { method: "POST" });
        if (!response.ok) throw new Error("refresh-failed");
        const refreshed = (await response.json()) as TiviplayPaymentsSnapshot;
        setSnapshot(refreshed);
        setFilters(DEFAULT_TIVIPLAY_PAYMENTS_FILTERS);
        setRefreshMessage("Fuente releída físicamente y caché renovada.");
      } catch {
        setRefreshMessage("No fue posible recargar la fuente. Revisa el archivo local y vuelve a intentar.");
      }
    });
  }

  return (
    <div className="min-w-0 overflow-x-clip">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link>
        <span aria-hidden="true">/</span>
        <span>TiviPlay</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-brand-primary-dark">Gestión de pagos</span>
      </nav>

      <PageHeader
        badge={snapshot.state === "ready" ? "Fuente real validada" : "Datos parciales"}
        description="Analítica operativa y financiera construida desde el libro Excel gobernado, con monedas separadas, conciliación exacta y protección de datos personales."
        eyebrow="Operaciones · TiviPlay"
        title="Gestión de pagos"
      />
      <TiviplayNavigation />

      <SourceStatus snapshot={snapshot} isRefreshing={isRefreshing} message={refreshMessage} onRefresh={refreshSource} />

      {snapshot.state === "file-not-found" || snapshot.state === "error" || snapshot.state === "no-data" ? (
        <div className="mt-6 rounded-3xl border border-brand-red/25 bg-brand-red/5 p-6">
          <h2 className="text-lg font-semibold text-status-error">Fuente no disponible</h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">{snapshot.message}</p>
        </div>
      ) : (
        <>
          <MonthlyExecutiveComparison comparison={executiveComparison} onSelectMonth={(period) => setMonth(period, "USD")} />

          <FilterPanel
            filters={filters}
            snapshot={snapshot}
            activeFilters={activeFilters}
            onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
            onRemove={(key) => setFilters((current) => ({ ...current, [key]: "" }))}
            onClear={() => setFilters(DEFAULT_TIVIPLAY_PAYMENTS_FILTERS)}
          />

          <section aria-label="Indicadores principales" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {CURRENCIES.flatMap((currency) => {
              const item = metrics.currencies[currency];
              return [
                <MetricCard key={`confirmed-${currency}`} detail={`${item.paymentCount} pagos en ${currency}`} label={`Recaudo confirmado ${currency}`} tone="green" value={formatCurrency(item.confirmed, currency)} />,
                <MetricCard key={`expected-${currency}`} detail="Clientes elegibles del periodo" label={`Recaudo esperado ${currency}`} value={formatCurrency(item.expected, currency)} />,
                <MetricCard key={`pending-${currency}`} detail="Esperado menos confirmado, sin mezclar monedas" label={`Saldo pendiente ${currency}`} tone={item.pending > 0 ? "yellow" : "green"} value={formatCurrency(item.pending, currency)} />,
                <MetricCard key={`rate-${currency}`} detail="Cumplimiento sobre facturación elegible" label={`Porcentaje de recaudo ${currency}`} tone={item.collectionRate !== null && item.collectionRate >= 100 ? "green" : "yellow"} value={item.collectionRate === null ? "Sin base" : formatPercent(item.collectionRate)} />,
              ];
            })}
            <MetricCard detail="Grupos de pago confirmados" label="Número de pagos" value={String(metrics.paymentCount)} />
            <MetricCard detail="Identificadores seudonimizados únicos" label="Clientes únicos que pagaron" value={String(metrics.uniquePayingClients)} />
            <MetricCard detail="Solo pagos USD confirmados" label="Ticket promedio USD" value={formatCurrency(metrics.currencies.USD.ticketAverage, "USD")} />
            <MetricCard detail="Próximo pago a más de 29 días" label="Clientes al día" tone="green" value={String(metrics.clientsByStatus["Al día"])} />
            <MetricCard detail="Entre 1 y 5 días" label="Clientes por vencer" tone="yellow" value={String(metrics.clientsByStatus["Por vencer"])} />
            <MetricCard detail="Fecha superada sin renovación confirmada" label="Clientes vencidos" tone="red" value={String(metrics.clientsByStatus.Vencido)} />
            <MetricCard detail="Estado de cobranza, distinto de vencido" label="Pendientes de pago" tone="yellow" value={String(metrics.clientsByStatus["Pendiente de pago"])} />
            <MetricCard detail="Excluidos de clientes activos" label="Clientes desactivados" tone="red" value={String(metrics.clientsByStatus.Desactivado)} />
            <MetricCard detail="Estado no determinable con evidencia" label="Requieren revisión" tone="cyan" value={String(metrics.clientsByStatus["Requiere revisión"])} />
            <MetricCard detail="Pago anterior al inicio del periodo" label="Pagos anticipados" tone="cyan" value={String(metrics.advancePayments)} />
            <MetricCard detail="Origen normalizado como Venta" label="Nuevas ventas" tone="green" value={String(metrics.newSales)} />
            <MetricCard detail="Origen normalizado como Facturación" label="Renovaciones" value={String(metrics.renewals)} />
            <MetricCard detail={metrics.paypalEffectiveRate === null ? "Sin base PayPal confirmada" : `Neto ${formatCurrency(metrics.paypalNet, "USD")} · tasa efectiva ${formatPercent(metrics.paypalEffectiveRate)}`} label="Comisiones PayPal" tone="yellow" value={formatCurrency(metrics.paypalCommission, "USD")} />
            <MetricCard detail="Coincidencia exacta dentro del mismo mes" label="Porcentaje de conciliación" tone={metrics.reconciliationRate >= 90 ? "green" : "red"} value={formatPercent(metrics.reconciliationRate)} />
            <MetricCard detail="No conciliados o ambiguos" label="Registros sin conciliar" tone={metrics.unreconciledRecords ? "red" : "green"} value={String(metrics.unreconciledRecords)} />
            <MetricCard detail="Controles de Panel 1, 2 y 3" label="Créditos consumidos" value={new Intl.NumberFormat("es-CO").format(metrics.creditsConsumed)} />
            <MetricCard detail="Constante central configurable" label="Meta diaria" value={formatCurrency(metrics.dailyGoalUsd, "USD")} />
            <MetricCard detail={`${formatCurrency(metrics.averageDailyUsd, "USD")} por día activo`} label="Cumplimiento meta diaria" tone={metrics.dailyGoalRate >= 100 ? "green" : "red"} value={formatPercent(metrics.dailyGoalRate)} />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.8fr)]">
            <SectionCard
              action={<ComparisonControl mode={comparison} insight={comparisonInsight} onChange={setComparison} />}
              description="Cada segmento aplica fecha y método al dashboard completo. La línea discontinua representa la meta configurable de USD 500."
              eyebrow="Recaudo diario · USD"
              title="Serie temporal por método de pago"
            >
              <DailyRevenueChart activeDate={filters.dateFrom === filters.dateTo ? filters.dateFrom : undefined} data={charts.daily} formatValue={(value) => formatCurrency(value, "USD")} goal={metrics.dailyGoalUsd} onSelect={setDateAndMethod} />
            </SectionCard>

            <SectionCard
              action={<CurrencySelector value={chartCurrency} onChange={setChartCurrency} />}
              description="La moneda seleccionada controla las visualizaciones financieras; nunca se convierten ni suman monedas distintas."
              eyebrow="Distribución"
              title="Métodos de pago"
            >
              <InteractiveBarList activeKey={filters.method} data={charts.methods} formatValue={(value) => formatCurrency(value, chartCurrency)} onSelect={(value) => toggleFilter("method", value)} />
            </SectionCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <SectionCard description="Esperado, confirmado y saldo se calculan por periodo y moneda seleccionada." eyebrow="Control mensual" title="Recaudo mensual">
              <ComparisonBars formatValue={(value) => formatCurrency(value, chartCurrency)} onSelect={setMonth} rows={charts.monthly} />
            </SectionCard>
            <SectionCard description="Recaudo, pagos, ticket promedio, ventas, facturación y participación se recalculan con los filtros." eyebrow="Equipo comercial" title="Rendimiento por asesor">
              <InteractiveBarList activeKey={filters.advisor} data={charts.advisors} formatValue={(value) => formatCurrency(value, chartCurrency)} onSelect={(value) => toggleFilter("advisor", value)} />
            </SectionCard>
            <SectionCard description="Clientes únicos por estado de vencimiento; el estado pendiente no se confunde con vencido." eyebrow="Cartera" title="Distribución de clientes por estado">
              <InteractiveBarList activeKey={filters.clientStatus} data={charts.statuses} formatValue={(value) => new Intl.NumberFormat("es-CO").format(value)} onSelect={(value) => toggleFilter("clientStatus", value)} />
            </SectionCard>
            <SectionCard description="Cantidad de clientes, recaudo y pantallas asociadas por plan normalizado." eyebrow="Portafolio" title="Distribución por plan">
              <InteractiveBarList activeKey={filters.plan} data={charts.plans} formatValue={(value) => new Intl.NumberFormat("es-CO").format(value)} onSelect={(value) => toggleFilter("plan", value)} />
            </SectionCard>
            <SectionCard description="Recaudo de la moneda seleccionada y créditos consumidos por panel. Las recargas no se interpretan como recaudo." eyebrow="Infraestructura" title="Rendimiento por panel">
              <InteractiveBarList activeKey={filters.panel} data={charts.panels} formatValue={(value) => formatCurrency(value, chartCurrency)} onSelect={(value) => toggleFilter("panel", value)} />
            </SectionCard>
            <SectionCard description="Monto facturado, neto recibido, comisión y tasa efectiva por mes, usando solo pagos con fecha de recibido." eyebrow="Costos de recaudo" title="Análisis de PayPal">
              <ComparisonBars formatValue={(value) => formatCurrency(value, "USD")} onSelect={(period) => setMonth(period, "USD")} rows={charts.paypal} />
            </SectionCard>
          </div>

          <SectionCard className="mt-6" description="Intensidad de recaudo USD por fecha y asesor. Seleccionar una celda combina ambos filtros." eyebrow="Patrón operativo" title="Mapa de calor fecha × asesor">
            <OperationalHeatmap advisors={charts.heatmapAdvisors} dates={charts.heatmapDates} formatValue={(value) => formatCurrency(value, "USD")} onSelect={(date, advisor) => setFilters((current) => ({ ...current, dateFrom: date, dateTo: date, advisor }))} values={charts.heatmapValues} />
          </SectionCard>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <SectionCard description="Hallazgos determinísticos derivados de los datos filtrados, con evidencia, comparación y acción sugerida." eyebrow="Inteligencia gobernada" title="Conclusiones e inteligencia operativa">
              <div className="grid gap-3">
                {conclusions.map((conclusion) => <ConclusionCard key={conclusion.id} conclusion={conclusion} />)}
              </div>
            </SectionCard>
            <SectionCard description="No existen campos explícitos y confiables de país, ciudad o región en la fuente canónica." eyebrow="Cobertura geográfica" title="Mapa no disponible">
              <div className="rounded-2xl border border-dashed border-brand-cyan bg-brand-cyan/10 p-5">
                <p className="text-sm font-semibold text-brand-primary-dark">Ubicación no disponible</p>
                <p className="mt-2 text-xs leading-5 text-brand-muted">No se infiere ubicación desde teléfonos ni se consulta geocodificación externa. El mapa de calor operativo se conserva como visualización principal.</p>
              </div>
            </SectionCard>
          </div>

          <SectionCard className="mt-6" description="Incidencias detectadas sin modificar ni corregir silenciosamente el Excel original." eyebrow="Auditoría" title="Calidad de datos">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {snapshot.quality.map((issue) => <QualityCard key={issue.code} issue={issue} />)}
            </div>
            <MonthlyAuditPanel snapshot={snapshot} />
            <details className="mt-5 rounded-2xl border border-brand-border bg-brand-surface/50 p-4">
              <summary className="cursor-pointer text-xs font-bold text-brand-primary-dark">Ver inventario técnico de hojas</summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-xs">
                  <thead><tr className="text-brand-muted"><th className="pb-2">Hoja</th><th>Familia</th><th>Mes</th><th>Header</th><th>Procesadas</th><th>Confirmadas</th><th>Descartadas</th><th>Vacías</th><th>Fórmulas</th><th>Sin resultado</th><th>Errores</th></tr></thead>
                  <tbody>{snapshot.sheets.map((sheet) => <tr key={sheet.name} className="border-t border-brand-border"><td className="py-2 font-semibold text-brand-graphite">{sheet.name}</td><td>{sheet.family}</td><td>{sheet.month ?? "—"}</td><td>{sheet.headerRow ?? "—"}</td><td>{sheet.usefulRows}</td><td>{sheet.confirmedRows}</td><td>{sheet.discardedRows}</td><td>{sheet.emptyRows}</td><td>{sheet.formulaCount}</td><td>{sheet.formulaWithoutResultCount}</td><td>{sheet.errorCount}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          </SectionCard>

          <SectionCard className="mt-6" description="Vista filtrada de registros normalizados. Los clientes están seudonimizados y no se envían teléfonos, correos, usuarios, contraseñas ni enlaces de confirmación." eyebrow="Trazabilidad" title="Detalle de pagos">
            <PaymentsTable onFilterClient={(client) => toggleFilter("client", client)} records={dataset.payments} />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function SourceStatus({
  snapshot,
  isRefreshing,
  message,
  onRefresh,
}: {
  snapshot: TiviplayPaymentsSnapshot;
  isRefreshing: boolean;
  message: string;
  onRefresh: () => void;
}) {
  const stateTone = snapshot.state === "ready" ? "border-brand-green/35 bg-brand-green/10" : "border-brand-yellow/50 bg-brand-yellow/10";
  const focusAudits = snapshot.monthlyAudits.filter(
    (audit) =>
      audit.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      audit.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      audit.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth,
  );
  return (
    <section className={`mt-6 rounded-3xl border p-5 ${stateTone}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary-dark">Estado de la fuente · {snapshot.state.toLocaleUpperCase("es-CO")}</p>
          <p className="mt-2 max-w-3xl text-sm leading-5 text-brand-graphite">{snapshot.message}</p>
          {snapshot.source ? (
            <p className="mt-2 text-[10px] leading-4 text-brand-muted">{snapshot.source.fileName} · {formatFileSize(snapshot.source.fileSizeBytes)} · huella {snapshot.source.hashPrefix} · {snapshot.source.workbookSheets} hojas · archivo actualizado {formatDateTime(snapshot.source.fileUpdatedAt)} · procesado {formatDateTime(snapshot.source.processedAt)}</p>
          ) : null}
        </div>
        <button className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark disabled:opacity-50" disabled={isRefreshing} onClick={onRefresh} type="button">{isRefreshing ? "Recargando…" : "Recargar fuente"}</button>
      </div>
      {focusAudits.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
          {focusAudits.map((audit) => {
            const present = audit.coverage.filter((family) => family.present).length;
            const isComplete = present === audit.coverage.length;
            return <span key={`${audit.year}-${audit.month}`} className={`rounded-full px-3 py-1.5 ${isComplete ? "bg-brand-green/15 text-status-success" : "bg-brand-yellow/15 text-status-warning"}`}>{isComplete ? "Completo" : "Parcial"}: {audit.label} · {present}/{audit.coverage.length} familias</span>;
          })}
          {snapshot.missingExpectedMonths.map((month) => <span key={`${month.year}-${month.month}`} className="rounded-full bg-brand-red/10 px-3 py-1.5 text-status-error">No disponible: {month.label}</span>)}
        </div>
      ) : null}
      {message ? <p aria-live="polite" className="mt-3 text-xs font-semibold text-brand-primary-dark">{message}</p> : null}
    </section>
  );
}

function MonthlyAuditPanel({ snapshot }: { snapshot: TiviplayPaymentsSnapshot }) {
  const audits = snapshot.monthlyAudits.filter(
    (audit) =>
      audit.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      audit.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      audit.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth,
  );
  const familyLabels: Record<string, string> = {
    billing: "PAGOS",
    zelle: "ZELLE",
    paypal: "PAYPAL",
    transfer: "TRANSF",
    panel1: "CONTROL P1",
    panel2: "CONTROL P2",
    panel3: "CONTROL P3",
  };

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-3">
      {audits.map((audit) => (
        <article key={`${audit.year}-${audit.month}`} className="rounded-2xl border border-brand-border bg-brand-surface/45 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-brand-primary">Auditoría mensual</p>
              <h3 className="mt-1 text-sm font-semibold text-brand-text">{audit.label}</h3>
            </div>
            <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${audit.coverage.every((family) => family.present) ? "bg-brand-green/10 text-status-success" : "bg-brand-yellow/15 text-status-warning"}`}>
              {audit.coverage.every((family) => family.present) ? "Completo" : "Parcial"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {audit.coverage.map((family) => (
              <div key={family.family} className={`rounded-xl border px-3 py-2 ${family.present ? "border-brand-green/20 bg-white" : "border-brand-yellow/40 bg-brand-yellow/10"}`}>
                <p className="text-[9px] font-black text-brand-graphite">{familyLabels[family.family]}</p>
                <p className="mt-1 text-[9px] leading-4 text-brand-muted">
                  {family.present ? `${family.usefulRows} procesadas · ${family.confirmedRows} confirmadas · ${family.discardedRows} descartadas · ${family.emptyRows} vacías` : "Hoja no presente"}
                </p>
              </div>
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[9px]">
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-brand-muted">Fechas / montos inválidos</dt><dd className="mt-1 font-bold text-brand-graphite">{audit.quality.invalidDates} / {audit.quality.invalidAmounts}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-brand-muted">Duplicados cliente / pago</dt><dd className="mt-1 font-bold text-brand-graphite">{audit.quality.duplicateClients} / {audit.quality.duplicatePayments}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-brand-muted">Sin cliente / fecha</dt><dd className="mt-1 font-bold text-brand-graphite">{audit.quality.missingClients} / {audit.quality.missingDates}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-brand-muted">Pagos sin conciliar</dt><dd className="mt-1 font-bold text-brand-graphite">{audit.quality.unreconciledPayments}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-brand-muted">Fórmulas erróneas / sin resultado</dt><dd className="mt-1 font-bold text-brand-graphite">{audit.quality.formulaErrors} / {audit.quality.formulaWithoutResults}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function FilterPanel({
  filters,
  snapshot,
  activeFilters,
  onChange,
  onRemove,
  onClear,
}: {
  filters: DashboardFilters;
  snapshot: TiviplayPaymentsSnapshot;
  activeFilters: Array<[keyof DashboardFilters, string]>;
  onChange: (key: keyof DashboardFilters, value: string) => void;
  onRemove: (key: keyof DashboardFilters) => void;
  onClear: () => void;
}) {
  const years = [...new Set(snapshot.availableMonths.map((month) => String(month.year)))];
  return (
    <section className="mt-6 rounded-3xl border border-brand-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">Filtros globales</p><p className="mt-1 text-xs text-brand-muted">Los filtros de gráficos y controles se combinan sobre todo el dashboard.</p></div><button className="rounded-xl border border-brand-primary px-3 py-2 text-xs font-bold text-brand-primary" onClick={onClear} type="button">Restablecer junio–agosto</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <FilterInput label="Desde" type="date" value={filters.dateFrom} onChange={(value) => onChange("dateFrom", value)} />
        <FilterInput label="Hasta" type="date" value={filters.dateTo} onChange={(value) => onChange("dateTo", value)} />
        <FilterSelect label="Año" options={years} value={filters.year} onChange={(value) => onChange("year", value)} />
        <FilterSelect label="Mes" options={snapshot.availableMonths.map((month) => ({ value: String(month.month), label: month.label }))} value={filters.month} onChange={(value) => onChange("month", value)} />
        <FilterSelect label="Asesor" options={snapshot.dictionary.advisors} value={filters.advisor} onChange={(value) => onChange("advisor", value)} />
        <FilterSelect label="Método" options={snapshot.dictionary.methods} value={filters.method} onChange={(value) => onChange("method", value)} />
        <FilterSelect label="Origen" options={snapshot.dictionary.origins} value={filters.origin} onChange={(value) => onChange("origin", value)} />
        <FilterSelect label="Panel" options={snapshot.dictionary.panels} value={filters.panel} onChange={(value) => onChange("panel", value)} />
        <FilterSelect label="Plan" options={snapshot.dictionary.plans} value={filters.plan} onChange={(value) => onChange("plan", value)} />
        <FilterSelect label="Estado" options={snapshot.dictionary.statuses} value={filters.clientStatus} onChange={(value) => onChange("clientStatus", value)} />
        <FilterSelect label="Conciliación" options={["Conciliado", "No conciliado", "Requiere revisión"]} value={filters.reconciliation} onChange={(value) => onChange("reconciliation", value)} />
        <FilterSelect label="Moneda" options={CURRENCIES} value={filters.currency} onChange={(value) => onChange("currency", value)} />
        <FilterInput label="Cliente" placeholder="Ej. •A1B2" type="search" value={filters.client} onChange={(value) => onChange("client", value)} />
        <FilterSelect label="Venta / facturación" options={["Venta", "Facturación", "Otro"]} value={filters.type} onChange={(value) => onChange("type", value)} />
      </div>
      {activeFilters.length ? <div className="mt-4 flex flex-wrap gap-2">{activeFilters.map(([key, value]) => <button key={key} className="rounded-full border border-brand-primary/30 bg-brand-blue-soft px-3 py-1.5 text-[10px] font-bold text-brand-primary-dark" onClick={() => onRemove(key)} type="button">{FILTER_LABELS[key]}: {key === "month" ? monthLabel(Number(filters.year || snapshot.availableMonths[0]?.year || 2026), Number(value)) : value} <span aria-hidden="true">×</span></button>)}</div> : null}
    </section>
  );
}

function FilterSelect({ label, options, value, onChange }: { label: string; options: Array<string | { value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-muted">{label}<select className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium normal-case tracking-normal text-brand-graphite" onChange={(event) => onChange(event.target.value)} value={value}><option value="">Todos</option>{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={`${label}-${item.value}`} value={item.value}>{item.label}</option>; })}</select></label>;
}

function FilterInput({ label, value, type, placeholder, onChange }: { label: string; value: string; type: "date" | "search"; placeholder?: string; onChange: (value: string) => void }) {
  return <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-muted">{label}<input className="mt-1 block w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium normal-case tracking-normal text-brand-graphite" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} /></label>;
}

function CurrencySelector({ value, onChange }: { value: Currency; onChange: (currency: Currency) => void }) {
  return <label className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Moneda<select className="ml-2 rounded-lg border border-brand-border bg-white px-2 py-1 text-xs font-semibold text-brand-graphite" onChange={(event) => onChange(event.target.value as Currency)} value={value}>{CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}</select></label>;
}

function ComparisonControl({ mode, insight, onChange }: { mode: ComparisonMode; insight: { label: string; value: string }; onChange: (mode: ComparisonMode) => void }) {
  return <div className="max-w-64 rounded-2xl bg-brand-surface p-3 text-right"><select aria-label="Comparación" className="w-full rounded-lg border border-brand-border bg-white px-2 py-1 text-[10px] font-bold text-brand-graphite" onChange={(event) => onChange(event.target.value as ComparisonMode)} value={mode}><option value="previous-period">Periodo anterior</option><option value="previous-month">Mes anterior</option><option value="selected-average">Promedio de meses disponibles</option></select><p className="mt-2 text-[10px] text-brand-muted">{insight.label}</p><p className="mt-0.5 text-xs font-bold text-brand-primary-dark">{insight.value}</p></div>;
}

function ConclusionCard({ conclusion }: { conclusion: ReturnType<typeof buildOperationalConclusions>[number] }) {
  const tone = conclusion.level === "Crítico" ? "border-brand-red/25 bg-brand-red/5" : conclusion.level === "Atención" ? "border-brand-yellow/45 bg-brand-yellow/10" : "border-brand-blue/20 bg-brand-blue-soft/50";
  return <article className={`rounded-2xl border p-4 ${tone}`}><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-semibold text-brand-text">{conclusion.finding}</h3><span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-brand-muted">{conclusion.level}</span></div><dl className="mt-3 grid gap-2 text-xs leading-5"><div><dt className="font-bold text-brand-graphite">Valor</dt><dd className="text-brand-muted">{conclusion.evidence}</dd></div><div><dt className="font-bold text-brand-graphite">Comparación</dt><dd className="text-brand-muted">{conclusion.comparison}</dd></div><div><dt className="font-bold text-brand-graphite">Acción</dt><dd className="text-brand-muted">{conclusion.action}</dd></div></dl></article>;
}

function QualityCard({ issue }: { issue: TiviplayPaymentsSnapshot["quality"][number] }) {
  const tone = issue.severity === "critical" ? "border-brand-red/25 bg-brand-red/5" : issue.severity === "warning" ? "border-brand-yellow/40 bg-brand-yellow/10" : "border-brand-border bg-brand-surface/70";
  return <article className={`rounded-2xl border p-4 ${tone}`}><div className="flex items-start justify-between gap-3"><h3 className="text-xs font-bold text-brand-graphite">{issue.label}</h3><span className="text-lg font-semibold tabular-nums text-brand-primary-dark">{issue.count}</span></div><p className="mt-2 text-[10px] leading-4 text-brand-muted">{issue.description}</p></article>;
}

function buildChartData(dataset: ReturnType<typeof filterDataset>, currency: Currency) {
  const payments = confirmedPayments(dataset);
  const currencyPayments = payments.filter((payment) => payment.currency === currency);
  const dailyGroups = new Map<string, Map<string, number>>();
  for (const payment of payments.filter((record) => record.currency === "USD" && record.date)) {
    const byMethod = dailyGroups.get(payment.date ?? "") ?? new Map<string, number>();
    byMethod.set(payment.paymentMethod, (byMethod.get(payment.paymentMethod) ?? 0) + payment.amount);
    dailyGroups.set(payment.date ?? "", byMethod);
  }
  const daily: DailyDatum[] = [...dailyGroups.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([date, methods]) => ({ date, total: [...methods.values()].reduce((sum, value) => sum + value, 0), segments: [...methods.entries()].map(([method, value]) => ({ method, value })) }));
  const expectedByMonth = billingByMonth(dataset.billings, currency);
  const confirmedByMonth = groupNumber(currencyPayments, (payment) => `${payment.year}-${String(payment.month).padStart(2, "0")}`, (payment) => payment.amount);
  const periods = [...new Set([...Object.keys(expectedByMonth), ...Object.keys(confirmedByMonth)])].sort();
  const monthly = periods.map((period) => ({ key: period, label: monthLabel(Number(period.slice(0, 4)), Number(period.slice(5, 7))), expected: expectedByMonth[period] ?? 0, confirmed: confirmedByMonth[period] ?? 0, pending: Math.max(0, (expectedByMonth[period] ?? 0) - (confirmedByMonth[period] ?? 0)) }));
  const methodValues = groupNumber(currencyPayments, (payment) => payment.paymentMethod, (payment) => payment.amount);
  const methods = Object.entries(methodValues).sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, label: key, value, secondary: `${groupCount(currencyPayments, (payment) => payment.paymentMethod)[key] ?? 0} registros normalizados` }));
  const advisorValues = groupNumber(currencyPayments.filter((payment) => payment.advisor !== "Sin identificar"), (payment) => payment.advisor, (payment) => payment.amount);
  const advisorCounts = groupCount(currencyPayments, (payment) => payment.advisor);
  const advisorSales = groupCount(currencyPayments.filter((payment) => payment.type === "Venta"), (payment) => payment.advisor);
  const advisorBilling = groupCount(currencyPayments.filter((payment) => payment.type === "Facturación"), (payment) => payment.advisor);
  const total = currencyPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const advisors = Object.entries(advisorValues).sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, label: key, value, secondary: `${advisorCounts[key] ?? 0} pagos · ticket ${formatCurrency(value / Math.max(1, advisorCounts[key] ?? 0), currency)} · ${advisorSales[key] ?? 0} ventas · ${advisorBilling[key] ?? 0} facturación · ${formatPercent(total ? (value / total) * 100 : 0)}` }));
  const statusClients = new Map<string, Set<string>>();
  for (const billing of dataset.billings) {
    const clients = statusClients.get(billing.status) ?? new Set<string>();
    clients.add(billing.clientKey);
    statusClients.set(billing.status, clients);
  }
  const statuses = [...statusClients.entries()].map(([key, clients]) => ({ key, label: key, value: clients.size })).sort((a, b) => b.value - a.value);
  const planClients = new Map<string, Set<string>>();
  const planScreens: Record<string, number> = {};
  for (const billing of dataset.billings) { const clients = planClients.get(billing.plan) ?? new Set<string>(); clients.add(billing.clientKey); planClients.set(billing.plan, clients); planScreens[billing.plan] = (planScreens[billing.plan] ?? 0) + (billing.screens ?? 0); }
  const planRevenue = groupNumber(currencyPayments, (payment) => payment.plan, (payment) => payment.amount);
  const plans = [...planClients.entries()].map(([key, clients]) => ({ key, label: key, value: clients.size, secondary: `${formatCurrency(planRevenue[key] ?? 0, currency)} · ${planScreens[key] ?? 0} pantallas` })).sort((a, b) => b.value - a.value);
  const panelRevenue = groupNumber(currencyPayments, (payment) => payment.panel, (payment) => payment.amount);
  const panelCredits = groupNumber(dataset.credits, (record) => record.panel, (record) => record.credits);
  const panels = [...new Set([...Object.keys(panelRevenue), ...Object.keys(panelCredits)])].map((key) => ({ key, label: key, value: panelRevenue[key] ?? 0, secondary: `${new Intl.NumberFormat("es-CO").format(panelCredits[key] ?? 0)} créditos consumidos` })).sort((a, b) => b.value - a.value);
  const paypalPayments = payments.filter((payment) => payment.paymentMethod === "PayPal" && payment.currency === "USD");
  const paypalNet = groupNumber(paypalPayments, (payment) => `${payment.year}-${String(payment.month).padStart(2, "0")}`, (payment) => payment.amount);
  const paypalGross = groupNumber(paypalPayments, (payment) => `${payment.year}-${String(payment.month).padStart(2, "0")}`, (payment) => payment.paypalGrossAmount ?? payment.amount);
  const paypalCommission = groupNumber(paypalPayments, (payment) => `${payment.year}-${String(payment.month).padStart(2, "0")}`, (payment) => payment.paypalCommission ?? 0);
  const paypal = [...new Set([...Object.keys(paypalNet), ...Object.keys(paypalGross)])].sort().map((period) => ({ key: period, label: `${monthLabel(Number(period.slice(0, 4)), Number(period.slice(5, 7)))} · comisión ${formatPercent(paypalGross[period] ? ((paypalCommission[period] ?? 0) / paypalGross[period]) * 100 : 0)}`, expected: paypalGross[period] ?? 0, confirmed: paypalNet[period] ?? 0, pending: paypalCommission[period] ?? 0 }));
  const heatmapPayments = payments.filter((payment) => payment.currency === "USD" && payment.date && payment.advisor !== "Sin identificar");
  const heatmapDates = [...new Set(heatmapPayments.map((payment) => payment.date ?? ""))].sort().slice(-14);
  const heatmapAdvisors = [...new Set(heatmapPayments.map((payment) => payment.advisor))].sort();
  const heatmapValues = groupNumber(heatmapPayments, (payment) => `${payment.date}|${payment.advisor}`, (payment) => payment.amount);
  return { daily, monthly, methods, advisors, statuses, plans, panels, paypal, heatmapDates, heatmapAdvisors, heatmapValues };
}

function calculateComparison(snapshot: TiviplayPaymentsSnapshot, filters: DashboardFilters, currentUsd: number, mode: ComparisonMode): { label: string; value: string } {
  const available = snapshot.availableMonths.filter(
    (period) =>
      period.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      period.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      period.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth,
  );
  if (!available.length) return { label: "Sin periodo comparable", value: "—" };
  let comparisonUsd = 0;
  let label = "";
  if (mode === "selected-average") {
    const values = available.map((period) => calculateMetrics(filterDataset(snapshot, { ...filters, dateFrom: "", dateTo: "", year: String(period.year), month: String(period.month) })).currencies.USD.confirmed);
    comparisonUsd = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    label = "Promedio de meses disponibles";
  } else if (mode === "previous-period" && filters.dateFrom && filters.dateTo) {
    const from = new Date(`${filters.dateFrom}T00:00:00Z`);
    const to = new Date(`${filters.dateTo}T00:00:00Z`);
    const duration = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
    const previousTo = new Date(from.getTime() - 86_400_000);
    const previousFrom = new Date(previousTo.getTime() - (duration - 1) * 86_400_000);
    const previousFilters = {
      ...filters,
      year: "",
      month: "",
      dateFrom: previousFrom.toISOString().slice(0, 10),
      dateTo: previousTo.toISOString().slice(0, 10),
    };
    comparisonUsd = calculateMetrics(filterDataset(snapshot, previousFilters)).currencies.USD.confirmed;
    label = `Periodo anterior (${previousFilters.dateFrom} a ${previousFilters.dateTo})`;
  } else {
    const current = filters.year && filters.month ? { year: Number(filters.year), month: Number(filters.month) } : available.at(-1) ?? available[0];
    const previousDate = new Date(Date.UTC(current.year, current.month - 2, 1));
    const previous = { year: previousDate.getUTCFullYear(), month: previousDate.getUTCMonth() + 1 };
    comparisonUsd = calculateMetrics(filterDataset(snapshot, { ...filters, dateFrom: "", dateTo: "", year: String(previous.year), month: String(previous.month) })).currencies.USD.confirmed;
    label = mode === "previous-period" ? `Periodo anterior disponible (${monthLabel(previous.year, previous.month)})` : `Mes anterior (${monthLabel(previous.year, previous.month)})`;
  }
  const delta = comparisonUsd ? ((currentUsd - comparisonUsd) / comparisonUsd) * 100 : null;
  return { label, value: `${formatCurrency(comparisonUsd, "USD")} · ${delta === null ? "sin base para variación" : `${delta >= 0 ? "+" : ""}${formatPercent(delta)}`}` };
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatFileSize(bytes: number): string {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(bytes / 1_048_576)} MB`;
}
