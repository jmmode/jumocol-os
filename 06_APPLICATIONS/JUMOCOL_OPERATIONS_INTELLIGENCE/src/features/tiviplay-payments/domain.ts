export const TIVIPLAY_DAILY_REVENUE_GOAL_USD = 500;

export const TIVIPLAY_EXPECTED_COVERAGE = {
  year: 2026,
  fromMonth: 6,
  throughMonth: 8,
} as const;

export const TIVIPLAY_OPERATIONAL_WINDOW = {
  dateFrom: "2026-06-01",
  dateTo: "2026-08-31",
} as const;

export type Currency = "USD" | "COP" | "CAD";
export type ClientStatus =
  | "Al día"
  | "Por vencer"
  | "Vencido"
  | "Pendiente de pago"
  | "Desactivado"
  | "Requiere revisión";
export type ReconciliationStatus = "Conciliado" | "No conciliado" | "Requiere revisión";
export type SourceFamily = "billing" | "zelle" | "paypal" | "transfer" | "credits";
export type RecordKind = "Facturación" | "Pago" | "Crédito";
export type ComparisonMode = "previous-period" | "previous-month" | "selected-average";
export type SnapshotState = "ready" | "partial" | "file-not-found" | "no-data" | "error";
export type QualitySeverity = "info" | "warning" | "critical";
export type SheetAuditFamily =
  | "base"
  | "billing"
  | "zelle"
  | "paypal"
  | "transfer"
  | "panel1"
  | "panel2"
  | "panel3"
  | "ignored";

export type SourceMonth = {
  year: number;
  month: number;
  label: string;
};

export type BillingRecord = {
  id: string;
  kind: "Facturación";
  period: string;
  date: string;
  year: number;
  month: number;
  clientKey: string;
  clientLabel: string;
  status: ClientStatus;
  plan: string;
  screens: number | null;
  amount: number;
  currency: Currency;
  expectedMethod: string;
  panel: string;
  dueDate: string | null;
  nextPaymentDate: string | null;
  isFreeReferralMonth: boolean;
  isEligible: boolean;
  sourceSheet: string;
  sourceRow: number;
  qualityFlags: string[];
};

export type PaymentRecord = {
  id: string;
  paymentGroupId: string;
  kind: "Pago";
  date: string | null;
  year: number;
  month: number;
  clientKey: string;
  clientLabel: string;
  amount: number;
  currency: Currency;
  paymentMethod: string;
  advisor: string;
  origin: string;
  type: "Venta" | "Facturación" | "Otro";
  panel: string;
  plan: string;
  status: ClientStatus;
  reconciliationStatus: ReconciliationStatus;
  reconciliationReason: string;
  matchedBillingId: string | null;
  confirmed: boolean;
  confirmationEvidence: string;
  isDuplicate: boolean;
  isAdvance: boolean;
  paypalGrossAmount: number | null;
  paypalCommission: number | null;
  observation: string;
  dueDate: string | null;
  nextPaymentDate: string | null;
  sourceFamily: Exclude<SourceFamily, "billing" | "credits">;
  sourceSheet: string;
  sourceRow: number;
  qualityFlags: string[];
};

export type CreditRecord = {
  id: string;
  kind: "Crédito";
  date: string | null;
  year: number;
  month: number;
  panel: string;
  advisor: string;
  origin: string;
  credits: number;
  recharge: number;
  sourceSheet: string;
  sourceRow: number;
  qualityFlags: string[];
};

export type QualityIssue = {
  code: string;
  label: string;
  count: number;
  severity: QualitySeverity;
  description: string;
};

export type SheetAudit = {
  name: string;
  normalizedName: string;
  family: SheetAuditFamily;
  month: number | null;
  panel: string | null;
  headerRow: number | null;
  usefulRows: number;
  confirmedRows: number;
  discardedRows: number;
  discardReasons: Record<string, number>;
  emptyRows: number;
  formulaCount: number;
  formulaWithoutResultCount: number;
  errorCount: number;
  headerCount: number;
};

export type MonthlyFamilyAudit = {
  family: Exclude<SheetAuditFamily, "base" | "ignored">;
  sheetName: string | null;
  present: boolean;
  usefulRows: number;
  confirmedRows: number;
  discardedRows: number;
  emptyRows: number;
};

export type MonthlyQualityAudit = {
  invalidDates: number;
  invalidAmounts: number;
  duplicateClients: number;
  duplicatePayments: number;
  missingClients: number;
  missingDates: number;
  unknownAdvisors: number;
  unreconciledPayments: number;
  formulaErrors: number;
  formulaWithoutResults: number;
};

export type MonthlyAudit = SourceMonth & {
  available: boolean;
  coverage: MonthlyFamilyAudit[];
  quality: MonthlyQualityAudit;
};

export type TiviplayPaymentsSnapshot = {
  state: SnapshotState;
  message: string;
  source: {
    fileName: string;
    fileSizeBytes: number;
    sha256: string;
    hashPrefix: string;
    fileUpdatedAt: string;
    processedAt: string;
    referenceDate: string | null;
    workbookSheets: number;
  } | null;
  availableMonths: SourceMonth[];
  missingExpectedMonths: SourceMonth[];
  monthlyAudits: MonthlyAudit[];
  billings: BillingRecord[];
  payments: PaymentRecord[];
  credits: CreditRecord[];
  quality: QualityIssue[];
  sheets: SheetAudit[];
  dictionary: {
    advisors: string[];
    methods: string[];
    origins: string[];
    panels: string[];
    plans: string[];
    statuses: ClientStatus[];
  };
};

export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
  year: string;
  month: string;
  advisor: string;
  method: string;
  origin: string;
  panel: string;
  plan: string;
  clientStatus: string;
  reconciliation: string;
  currency: string;
  client: string;
  type: string;
};

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  dateFrom: "",
  dateTo: "",
  year: "",
  month: "",
  advisor: "",
  method: "",
  origin: "",
  panel: "",
  plan: "",
  clientStatus: "",
  reconciliation: "",
  currency: "",
  client: "",
  type: "",
};

export const DEFAULT_TIVIPLAY_PAYMENTS_FILTERS: DashboardFilters = {
  ...EMPTY_DASHBOARD_FILTERS,
  dateFrom: TIVIPLAY_OPERATIONAL_WINDOW.dateFrom,
  dateTo: TIVIPLAY_OPERATIONAL_WINDOW.dateTo,
};

export type FilteredDataset = {
  billings: BillingRecord[];
  payments: PaymentRecord[];
  credits: CreditRecord[];
};

export type CurrencyMetrics = {
  currency: Currency;
  confirmed: number;
  expected: number;
  pending: number;
  paymentCount: number;
  ticketAverage: number;
  collectionRate: number | null;
};

export type DashboardMetrics = {
  currencies: Record<Currency, CurrencyMetrics>;
  paymentCount: number;
  uniquePayingClients: number;
  clientsByStatus: Record<ClientStatus, number>;
  advancePayments: number;
  newSales: number;
  renewals: number;
  paypalNet: number;
  paypalCommission: number;
  paypalGross: number;
  paypalEffectiveRate: number | null;
  reconciliationRate: number;
  unreconciledRecords: number;
  creditsConsumed: number;
  dailyGoalUsd: number;
  averageDailyUsd: number;
  dailyGoalRate: number;
};

export type OperationalConclusion = {
  id: string;
  level: "Informativo" | "Atención" | "Crítico";
  finding: string;
  evidence: string;
  comparison: string;
  action: string;
};

export type MonthlyExecutiveMetric = {
  period: string;
  label: string;
  metrics: DashboardMetrics;
  variationUsd: {
    absolute: number;
    percentage: number | null;
  } | null;
  topMethod: { label: string; amountUsd: number } | null;
  topAdvisor: { label: string; amountUsd: number } | null;
  creditsByPanel: Record<string, number>;
  qualityIssues: number;
};

export type ExecutiveComparison = {
  rows: MonthlyExecutiveMetric[];
  conclusions: OperationalConclusion[];
};
