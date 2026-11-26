import {
  type BillingRecord,
  type ClientStatus,
  type Currency,
  type DashboardFilters,
  type DashboardMetrics,
  EMPTY_DASHBOARD_FILTERS,
  type ExecutiveComparison,
  type FilteredDataset,
  type MonthlyExecutiveMetric,
  type OperationalConclusion,
  TIVIPLAY_DAILY_REVENUE_GOAL_USD,
  TIVIPLAY_EXPECTED_COVERAGE,
  type PaymentRecord,
  type TiviplayPaymentsSnapshot,
} from "@/features/tiviplay-payments/domain";

const CURRENCIES: Currency[] = ["USD", "COP", "CAD"];
const STATUSES: ClientStatus[] = [
  "Al día",
  "Por vencer",
  "Vencido",
  "Pendiente de pago",
  "Desactivado",
  "Requiere revisión",
];

function includesSearch(value: string, search: string): boolean {
  return value.toLocaleLowerCase("es-CO").includes(search.trim().toLocaleLowerCase("es-CO"));
}

function temporalMatch(record: { date: string | null; year: number; month: number }, filters: DashboardFilters): boolean {
  // CORRECTION DEF-TIVI-001: 
  // If the record status is 'Pendiente de pago', it MUST be included in the count regardless of date validity.
  // Note: This function is used inside filterDataset.
  // To avoid breaking other KPIs, we handle the 'Pendiente de pago' override at the filter level or within this match.
  // However, the requirement is that the Pending Payments KPI (which uses clientsByStatus) should not be filtered out by date.
  
  if (filters.year && record.year !== Number(filters.year)) return false;
  if (filters.month && record.month !== Number(filters.month)) return false;
  
  // Date range filtering: 
  // We only filter out records if they have a date AND it's outside the range.
  // If the date is null/malformed, we keep it so it can be counted as 'Pendiente' and flagged as DQ issue.
  if (filters.dateFrom && record.date && record.date < filters.dateFrom) return false;
  if (filters.dateTo && record.date && record.date > filters.dateTo) return false;
  
  return true;
}

function commonMatch(
  record: {
    date: string | null;
    year: number;
    month: number;
    panel: string;
    plan?: string;
    status?: ClientStatus;
    currency?: Currency;
    clientLabel?: string;
  },
  filters: DashboardFilters,
): boolean {
  return (
    temporalMatch(record, filters) &&
    (!filters.panel || record.panel === filters.panel) &&
    (!filters.plan || record.plan === filters.plan) &&
    (!filters.clientStatus || record.status === filters.clientStatus) &&
    (!filters.currency || record.currency === filters.currency) &&
    (!filters.client || includesSearch(record.clientLabel ?? "", filters.client))
  );
}

export function filterDataset(snapshot: TiviplayPaymentsSnapshot, filters: DashboardFilters): FilteredDataset {
  const payments = snapshot.payments.filter(
    (record) =>
      commonMatch(record, filters) &&
      (!filters.advisor || record.advisor === filters.advisor) &&
      (!filters.method || record.paymentMethod === filters.method) &&
      (!filters.origin || record.origin === filters.origin) &&
      (!filters.reconciliation || record.reconciliationStatus === filters.reconciliation) &&
      (!filters.type || record.type === filters.type),
  );

  const hasPaymentOnlyFilters = Boolean(
    filters.advisor || filters.origin || filters.reconciliation || filters.type,
  );
  const paymentClientKeys = new Set(payments.map((record) => record.clientKey).filter(Boolean));

  const billings = snapshot.billings.filter(
    (record) =>
      commonMatch(record, filters) &&
      (!filters.method || record.expectedMethod === filters.method) &&
      (!hasPaymentOnlyFilters || paymentClientKeys.has(record.clientKey)),
  );

  const credits = snapshot.credits.filter(
    (record) =>
      temporalMatch(record, filters) &&
      (!filters.panel || record.panel === filters.panel) &&
      (!filters.advisor || record.advisor === filters.advisor) &&
      (!filters.origin || record.origin === filters.origin),
  );

  return { billings, payments, credits };
}

export function calculateMetrics(dataset: FilteredDataset): DashboardMetrics {
  const confirmedPayments = dataset.payments.filter(
    (payment) => payment.confirmed && !payment.isDuplicate && payment.amount > 0,
  );
  const eligibleBillings = dataset.billings.filter(
    (billing) => billing.isEligible && !billing.isFreeReferralMonth && billing.amount > 0,
  );
  const uniquePaymentGroups = new Set(confirmedPayments.map((payment) => payment.paymentGroupId));
  const uniqueClients = new Set(confirmedPayments.map((payment) => payment.clientKey).filter(Boolean));
  const currencyMetrics = Object.fromEntries(
    CURRENCIES.map((currency) => {
      const currencyPayments = confirmedPayments.filter((payment) => payment.currency === currency);
      const confirmed = sum(currencyPayments.map((payment) => payment.amount));
      const expected = sum(
        eligibleBillings.filter((billing) => billing.currency === currency).map((billing) => billing.amount),
      );
      const paymentGroups = new Set(currencyPayments.map((payment) => payment.paymentGroupId)).size;

      return [
        currency,
        {
          currency,
          confirmed,
          expected,
          pending: Math.max(0, expected - confirmed),
          paymentCount: paymentGroups,
          ticketAverage: paymentGroups ? confirmed / paymentGroups : 0,
          collectionRate: expected > 0 ? (confirmed / expected) * 100 : null,
        },
      ];
    }),
  ) as Record<Currency, DashboardMetrics["currencies"][Currency]>;

  const clientsByStatus = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      new Set(dataset.billings.filter((billing) => billing.status === status).map((billing) => billing.clientKey)).size,
    ]),
  ) as Record<ClientStatus, number>;
  const paypalPayments = confirmedPayments.filter((payment) => payment.paymentMethod === "PayPal");
  const paypalCommission = sum(paypalPayments.map((payment) => payment.paypalCommission ?? 0));
  const paypalGross = sum(
    paypalPayments.map((payment) => payment.paypalGrossAmount ?? payment.amount + (payment.paypalCommission ?? 0)),
  );
  const reconciliationGroups = new Map<string, PaymentRecord["reconciliationStatus"]>();
  for (const payment of confirmedPayments) {
    reconciliationGroups.set(payment.paymentGroupId, payment.reconciliationStatus);
  }
  const reconciliationCandidates = [...reconciliationGroups.values()];
  const reconciled = reconciliationCandidates.filter((status) => status === "Conciliado").length;
  const dailyUsd = groupNumber(
    confirmedPayments.filter((payment) => payment.currency === "USD" && payment.date),
    (payment) => payment.date ?? "",
    (payment) => payment.amount,
  );
  const activeDays = Object.keys(dailyUsd).length;
  const averageDailyUsd = activeDays ? sum(Object.values(dailyUsd)) / activeDays : 0;

  return {
    currencies: currencyMetrics,
    paymentCount: uniquePaymentGroups.size,
    uniquePayingClients: uniqueClients.size,
    clientsByStatus,
    advancePayments: new Set(
      confirmedPayments.filter((payment) => payment.isAdvance).map((payment) => payment.paymentGroupId),
    ).size,
    newSales: new Set(
      confirmedPayments.filter((payment) => payment.type === "Venta").map((payment) => payment.paymentGroupId),
    ).size,
    renewals: new Set(
      confirmedPayments.filter((payment) => payment.type === "Facturación").map((payment) => payment.paymentGroupId),
    ).size,
    paypalNet: sum(paypalPayments.map((payment) => payment.amount)),
    paypalCommission,
    paypalGross,
    paypalEffectiveRate: paypalGross > 0 ? (paypalCommission / paypalGross) * 100 : null,
    reconciliationRate: reconciliationCandidates.length ? (reconciled / reconciliationCandidates.length) * 100 : 0,
    unreconciledRecords: reconciliationCandidates.length - reconciled,
    creditsConsumed: sum(dataset.credits.map((record) => record.credits)),
    dailyGoalUsd: TIVIPLAY_DAILY_REVENUE_GOAL_USD,
    averageDailyUsd,
    dailyGoalRate: (averageDailyUsd / TIVIPLAY_DAILY_REVENUE_GOAL_USD) * 100,
  };
}

export function confirmedPayments(dataset: FilteredDataset): PaymentRecord[] {
  return dataset.payments.filter((record) => record.confirmed && !record.isDuplicate && record.amount > 0);
}

export function groupNumber<T>(records: T[], key: (record: T) => string, value: (record: T) => number): Record<string, number> {
  return records.reduce<Record<string, number>>((groups, record) => {
    const group = key(record);
    if (!group) return groups;
    groups[group] = (groups[group] ?? 0) + value(record);
    return groups;
  }, {});
}

export function groupCount<T>(records: T[], key: (record: T) => string): Record<string, number> {
  return groupNumber(records, key, () => 1);
}

export function billingByMonth(records: BillingRecord[], currency: Currency): Record<string, number> {
  return groupNumber(
    records.filter((record) => record.currency === currency && record.isEligible && !record.isFreeReferralMonth),
    (record) => record.period,
    (record) => record.amount,
  );
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

export function buildExecutiveComparison(snapshot: TiviplayPaymentsSnapshot): ExecutiveComparison {
  const focusMonths = snapshot.availableMonths.filter(
    (period) =>
      period.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      period.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      period.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth,
  );

  let previousUsd: number | null = null;
  const rows: MonthlyExecutiveMetric[] = focusMonths.map((period) => {
    const dataset = filterDataset(snapshot, {
      ...EMPTY_DASHBOARD_FILTERS,
      year: String(period.year),
      month: String(period.month),
    });
    const metrics = calculateMetrics(dataset);
    const usdPayments = confirmedPayments(dataset).filter((payment) => payment.currency === "USD");
    const methodTotals = groupNumber(usdPayments, (payment) => payment.paymentMethod, (payment) => payment.amount);
    const advisorTotals = groupNumber(
      usdPayments.filter((payment) => payment.advisor !== "Sin identificar"),
      (payment) => payment.advisor,
      (payment) => payment.amount,
    );
    const topMethod = topEntry(methodTotals);
    const topAdvisor = topEntry(advisorTotals);
    const audit = snapshot.monthlyAudits.find(
      (item) => item.year === period.year && item.month === period.month,
    );
    const currentUsd = metrics.currencies.USD.confirmed;
    const row: MonthlyExecutiveMetric = {
      period: `${period.year}-${String(period.month).padStart(2, "0")}`,
      label: period.label,
      metrics,
      variationUsd: previousUsd !== null
        ? {
            absolute: currentUsd - previousUsd,
            percentage: previousUsd > 0 ? ((currentUsd - previousUsd) / previousUsd) * 100 : null,
          }
        : null,
      topMethod: topMethod ? { label: topMethod[0], amountUsd: topMethod[1] } : null,
      topAdvisor: topAdvisor ? { label: topAdvisor[0], amountUsd: topAdvisor[1] } : null,
      creditsByPanel: groupNumber(dataset.credits, (record) => record.panel, (record) => record.credits),
      qualityIssues: audit ? sum(Object.values(audit.quality)) : 0,
    };
    previousUsd = currentUsd;
    return row;
  });

  return { rows, conclusions: buildExecutiveConclusions(rows, snapshot) };
}

function buildExecutiveConclusions(
  rows: MonthlyExecutiveMetric[],
  snapshot: TiviplayPaymentsSnapshot,
): OperationalConclusion[] {
  if (!rows.length) return [];

  const conclusions: OperationalConclusion[] = [];
  for (const row of rows.filter((item) => item.variationUsd)) {
    const variation = row.variationUsd;
    if (!variation) continue;
    conclusions.push({
      id: `variation-${row.period}`,
      level: variation.absolute >= 0 ? "Informativo" : "Atención",
      finding: `${row.label} ${variation.absolute >= 0 ? "aumentó" : "redujo"} el recaudo USD frente al mes anterior.`,
      evidence: `${formatCurrency(row.metrics.currencies.USD.confirmed, "USD")} confirmados.`,
      comparison: `${variation.absolute >= 0 ? "+" : ""}${formatCurrency(variation.absolute, "USD")} · ${variation.percentage === null ? "sin base porcentual" : `${variation.percentage >= 0 ? "+" : ""}${formatPercent(variation.percentage)}`}.`,
      action: variation.absolute >= 0
        ? "Identificar y sostener los métodos y asesores que explican el crecimiento."
        : "Revisar pendiente de recaudo, conciliación y actividad comercial del mes.",
    });
  }

  const bestRevenue = [...rows].sort(
    (left, right) => right.metrics.currencies.USD.confirmed - left.metrics.currencies.USD.confirmed,
  )[0];
  conclusions.push({
    id: "best-month",
    level: "Informativo",
    finding: `${bestRevenue.label} concentra el mayor recaudo USD del periodo comparado.`,
    evidence: `${formatCurrency(bestRevenue.metrics.currencies.USD.confirmed, "USD")} confirmados.`,
    comparison: `Cumplimiento de meta diaria: ${formatPercent(bestRevenue.metrics.dailyGoalRate)}.`,
    action: "Usar este mes como referencia operativa, sin convertirlo en meta histórica definitiva.",
  });

  const bestGoal = [...rows].sort(
    (left, right) => right.metrics.dailyGoalRate - left.metrics.dailyGoalRate,
  )[0];
  conclusions.push({
    id: "best-goal",
    level: bestGoal.metrics.dailyGoalRate >= 100 ? "Informativo" : "Atención",
    finding: `${bestGoal.label} tuvo el mejor cumplimiento de la meta diaria.`,
    evidence: `${formatPercent(bestGoal.metrics.dailyGoalRate)} · ${formatCurrency(bestGoal.metrics.averageDailyUsd, "USD")} por día activo.`,
    comparison: `Meta configurada: ${formatCurrency(bestGoal.metrics.dailyGoalUsd, "USD")} diarios.`,
    action: "Comparar días activos y prácticas de cobranza antes de ajustar la meta.",
  });

  const focusUsdPayments = snapshot.payments.filter(
    (payment) =>
      payment.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      payment.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      payment.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth &&
      payment.currency === "USD" &&
      payment.confirmed &&
      !payment.isDuplicate &&
      payment.amount > 0,
  );
  const allMethods = groupNumber(focusUsdPayments, (payment) => payment.paymentMethod, (payment) => payment.amount);
  const allAdvisors = groupNumber(
    focusUsdPayments.filter((payment) => payment.advisor !== "Sin identificar"),
    (payment) => payment.advisor,
    (payment) => payment.amount,
  );
  const dominantMethod = topEntry(allMethods);
  const dominantAdvisor = topEntry(allAdvisors);
  if (dominantMethod || dominantAdvisor) {
    conclusions.push({
      id: "period-leaders",
      level: "Informativo",
      finding: "El periodo tiene líderes operativos identificables en recaudo USD.",
      evidence: [
        dominantMethod ? `Método: ${dominantMethod[0]}` : null,
        dominantAdvisor ? `Asesor: ${dominantAdvisor[0]}` : null,
      ].filter(Boolean).join(" · "),
      comparison: "Liderazgo calculado con pagos USD confirmados y sin mezclar monedas.",
      action: "Comparar participación y continuidad antes de decidir redistribuciones.",
    });
  }

  const pendingChanges = rows.slice(1).map((row, index) => ({
    row,
    previous: rows[index],
    delta: row.metrics.currencies.USD.pending - rows[index].metrics.currencies.USD.pending,
  }));
  const largestPendingIncrease = pendingChanges
    .filter((item) => item.delta > 0)
    .sort((left, right) => right.delta - left.delta)[0];
  if (largestPendingIncrease) {
    conclusions.push({
      id: "pending-increase",
      level: "Atención",
      finding: `${largestPendingIncrease.row.label} registró el mayor aumento mensual de cartera pendiente USD.`,
      evidence: `${formatCurrency(largestPendingIncrease.row.metrics.currencies.USD.pending, "USD")} pendientes.`,
      comparison: `+${formatCurrency(largestPendingIncrease.delta, "USD")} frente a ${largestPendingIncrease.previous.label}.`,
      action: "Priorizar seguimiento de facturación elegible y explicar la diferencia antes del cierre.",
    });
  }

  const partialFamilies = snapshot.monthlyAudits
    .filter((audit) => audit.year === TIVIPLAY_EXPECTED_COVERAGE.year && audit.month >= 6 && audit.month <= 8)
    .flatMap((audit) =>
      audit.coverage
        .filter((family) => !family.present)
        .map((family) => `${audit.label}: ${familyLabel(family.family)}`),
    );
  if (partialFamilies.length) {
    conclusions.push({
      id: "partial-families",
      level: "Atención",
      finding: "La cobertura mensual contiene familias ausentes, aunque los meses están disponibles.",
      evidence: partialFamilies.join(" · "),
      comparison: "La ausencia de una familia se muestra como cobertura parcial y no invalida las demás hojas.",
      action: "Validar la ausencia con el propietario de la fuente; no completar ni estimar filas faltantes.",
    });
  }

  return conclusions.slice(0, 8);
}

function topEntry(groups: Record<string, number>): [string, number] | null {
  return Object.entries(groups).sort((left, right) => right[1] - left[1])[0] ?? null;
}

function familyLabel(family: string): string {
  const labels: Record<string, string> = {
    billing: "PAGOS",
    zelle: "ZELLE",
    paypal: "PAYPAL",
    transfer: "TRANSF",
    panel1: "CONTROL P1",
    panel2: "CONTROL P2",
    panel3: "CONTROL P3",
  };
  return labels[family] ?? family;
}

export function buildOperationalConclusions(
  dataset: FilteredDataset,
  metrics: DashboardMetrics,
  snapshot: TiviplayPaymentsSnapshot,
): OperationalConclusion[] {
  const payments = confirmedPayments(dataset);
  const conclusions: OperationalConclusion[] = [];
  const usdByDay = groupNumber(
    payments.filter((payment) => payment.currency === "USD" && payment.date),
    (payment) => payment.date ?? "",
    (payment) => payment.amount,
  );
  const days = Object.entries(usdByDay).sort((a, b) => b[1] - a[1]);
  const usdByMethod = groupNumber(
    payments.filter((payment) => payment.currency === "USD"),
    (payment) => payment.paymentMethod,
    (payment) => payment.amount,
  );
  const methods = Object.entries(usdByMethod).sort((a, b) => b[1] - a[1]);
  const usdByAdvisor = groupNumber(
    payments.filter((payment) => payment.currency === "USD" && payment.advisor !== "Sin identificar"),
    (payment) => payment.advisor,
    (payment) => payment.amount,
  );
  const advisors = Object.entries(usdByAdvisor).sort((a, b) => b[1] - a[1]);
  const usdTotal = metrics.currencies.USD.confirmed;

  conclusions.push({
    id: "daily-goal",
    level: metrics.dailyGoalRate >= 100 ? "Informativo" : metrics.dailyGoalRate >= 70 ? "Atención" : "Crítico",
    finding: metrics.dailyGoalRate >= 100 ? "La media diaria alcanzó la meta configurada." : "La media diaria quedó por debajo de la meta configurada.",
    evidence: `${formatCurrency(metrics.averageDailyUsd, "USD")} por día activo (${formatPercent(metrics.dailyGoalRate)} de la meta).`,
    comparison: `Meta diaria: ${formatCurrency(metrics.dailyGoalUsd, "USD")}.`,
    action: metrics.dailyGoalRate >= 100 ? "Mantener seguimiento diario por método y asesor." : "Priorizar cobranza conciliable y revisar los días sin recaudo confirmado.",
  });

  if (days.length) {
    const strongest = days[0];
    const weakest = days.at(-1) ?? strongest;
    conclusions.push({
      id: "daily-extremes",
      level: "Informativo",
      finding: "El recaudo diario presenta una diferencia visible entre sus extremos.",
      evidence: `Mayor: ${strongest[0]} con ${formatCurrency(strongest[1], "USD")}; menor: ${weakest[0]} con ${formatCurrency(weakest[1], "USD")}.`,
      comparison: "Comparación entre días con pagos USD confirmados del filtro actual.",
      action: "Revisar qué acciones comerciales y de cobranza antecedieron al día de mayor recaudo.",
    });
  }

  if (methods.length && usdTotal > 0) {
    const [method, amount] = methods[0];
    const share = (amount / usdTotal) * 100;
    conclusions.push({
      id: "dominant-method",
      level: share >= 70 ? "Atención" : "Informativo",
      finding: `${method} es el método dominante en recaudo USD.`,
      evidence: `${formatCurrency(amount, "USD")} (${formatPercent(share)} del recaudo USD confirmado).`,
      comparison: "Participación frente a los demás métodos del filtro.",
      action: share >= 70 ? "Vigilar riesgo de concentración y continuidad del canal." : "Mantener la mezcla actual de medios de pago.",
    });
  }

  if (advisors.length && usdTotal > 0) {
    const [advisor, amount] = advisors[0];
    const share = (amount / usdTotal) * 100;
    conclusions.push({
      id: "top-advisor",
      level: share >= 60 ? "Atención" : "Informativo",
      finding: `${advisor} lidera el recaudo USD identificado.`,
      evidence: `${formatCurrency(amount, "USD")} (${formatPercent(share)} del recaudo USD).`,
      comparison: "Comparación entre asesores identificados.",
      action: share >= 60 ? "Revisar capacidad, continuidad y distribución de cartera." : "Compartir prácticas efectivas con el resto del equipo.",
    });
  }

  if (metrics.unreconciledRecords > 0) {
    conclusions.push({
      id: "reconciliation",
      level: metrics.reconciliationRate < 70 ? "Crítico" : "Atención",
      finding: "Existen pagos sin conciliación exacta o que requieren revisión.",
      evidence: `${metrics.unreconciledRecords} registros; conciliación de ${formatPercent(metrics.reconciliationRate)}.`,
      comparison: "Objetivo operativo: 100% de pagos explicados sin coincidencias difusas.",
      action: "Resolver nombres/identificadores ambiguos en la fuente antes del cierre del periodo.",
    });
  }

  if (metrics.clientsByStatus["Por vencer"] + metrics.clientsByStatus.Vencido > 0) {
    conclusions.push({
      id: "client-risk",
      level: metrics.clientsByStatus.Vencido > 0 ? "Crítico" : "Atención",
      finding: "La cartera contiene clientes con vencimiento próximo o superado.",
      evidence: `${metrics.clientsByStatus["Por vencer"]} por vencer y ${metrics.clientsByStatus.Vencido} vencidos.`,
      comparison: "Estado calculado con próximo pago y fecha de referencia de la fuente.",
      action: "Priorizar seguimiento de vencidos y preparar contacto preventivo para los próximos a vencer.",
    });
  }

  if (snapshot.missingExpectedMonths.length) {
    conclusions.push({
      id: "coverage",
      level: "Crítico",
      finding: "La fuente canónica no cubre todo el periodo solicitado.",
      evidence: `Disponibles: ${snapshot.availableMonths.map((month) => month.label).join(", ") || "ninguno"}.`,
      comparison: `Faltan ${snapshot.missingExpectedMonths.map((month) => month.label).join(", ")}.`,
      action: "Sustituir el archivo fuente por una versión gobernada que contenga los meses faltantes; no combinar archivos parciales sin aprobación.",
    });
  }

  const criticalQuality = snapshot.quality.filter((issue) => issue.severity === "critical" && issue.count > 0);
  if (criticalQuality.length) {
    conclusions.push({
      id: "quality",
      level: "Crítico",
      finding: "La calidad de la fuente limita la interpretación de algunos indicadores.",
      evidence: criticalQuality.slice(0, 3).map((issue) => `${issue.label}: ${issue.count}`).join("; "),
      comparison: "Controles determinísticos aplicados durante la carga.",
      action: "Corregir la fuente en su proceso propietario y recargar; el dashboard no altera el libro original.",
    });
  }

  return conclusions.slice(0, 7);
}

export function formatCurrency(value: number, currency: Currency): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value) + "%";
}
