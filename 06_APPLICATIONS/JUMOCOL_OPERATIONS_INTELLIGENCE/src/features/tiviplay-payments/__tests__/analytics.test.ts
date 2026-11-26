import { describe, expect, it } from "vitest";

import { calculateMetrics, filterDataset } from "@/features/tiviplay-payments/analytics";
import {
  EMPTY_DASHBOARD_FILTERS,
  type BillingRecord,
  type PaymentRecord,
  type TiviplayPaymentsSnapshot,
} from "@/features/tiviplay-payments/domain";
import { buildPaymentsCsv } from "@/features/tiviplay-payments/payments-table";

const billing: BillingRecord = {
  id: "billing-1",
  kind: "Facturación",
  period: "2026-01",
  date: "2026-01-01",
  year: 2026,
  month: 1,
  clientKey: "safe-client-1",
  clientLabel: "Cliente •0001",
  status: "Por vencer",
  plan: "Plan 1 mes",
  screens: 2,
  amount: 100,
  currency: "USD",
  expectedMethod: "Zelle",
  panel: "Panel 1",
  dueDate: "2026-01-15",
  nextPaymentDate: "2026-02-15",
  isFreeReferralMonth: false,
  isEligible: true,
  sourceSheet: "PAGOS ENERO",
  sourceRow: 3,
  qualityFlags: [],
};

function payment(overrides: Partial<PaymentRecord>): PaymentRecord {
  return {
    id: "payment-1",
    paymentGroupId: "group-1",
    kind: "Pago",
    date: "2026-01-10",
    year: 2026,
    month: 1,
    clientKey: "safe-client-1",
    clientLabel: "Cliente •0001",
    amount: 100,
    currency: "USD",
    paymentMethod: "Zelle",
    advisor: "Jorge",
    origin: "Facturación",
    type: "Facturación",
    panel: "Panel 1",
    plan: "Plan 1 mes",
    status: "Por vencer",
    reconciliationStatus: "Conciliado",
    reconciliationReason: "Exacta",
    matchedBillingId: "billing-1",
    confirmed: true,
    confirmationEvidence: "Confirmación explícita",
    isDuplicate: false,
    isAdvance: false,
    paypalGrossAmount: null,
    paypalCommission: null,
    observation: "",
    dueDate: "2026-01-15",
    nextPaymentDate: "2026-02-15",
    sourceFamily: "zelle",
    sourceSheet: "ZELLE (ENE)",
    sourceRow: 3,
    qualityFlags: [],
    ...overrides,
  };
}

const snapshot: TiviplayPaymentsSnapshot = {
  state: "ready",
  message: "ok",
  source: null,
  availableMonths: [{ year: 2026, month: 1, label: "Enero de 2026" }],
  missingExpectedMonths: [],
  monthlyAudits: [],
  billings: [billing],
  payments: [payment({}), payment({ id: "payment-2", paymentGroupId: "group-2", advisor: "Nelsy", paymentMethod: "PayPal", confirmed: false, amount: 80 })],
  credits: [],
  quality: [],
  sheets: [],
  dictionary: { advisors: ["Jorge", "Nelsy"], methods: ["Zelle", "PayPal"], origins: ["Facturación"], panels: ["Panel 1"], plans: ["Plan 1 mes"], statuses: ["Por vencer"] },
};

describe("analítica y filtros TiviPlay", () => {
  it("combina filtros de asesor, método, periodo y moneda", () => {
    const filtered = filterDataset(snapshot, { ...EMPTY_DASHBOARD_FILTERS, advisor: "Jorge", method: "Zelle", year: "2026", month: "1", currency: "USD" });
    expect(filtered.payments).toHaveLength(1);
    expect(filtered.payments[0].advisor).toBe("Jorge");
    expect(filtered.billings).toHaveLength(1);
  });

  it("calcula KPIs solo con pagos confirmados y conserva USD separado", () => {
    const metrics = calculateMetrics(filterDataset(snapshot, EMPTY_DASHBOARD_FILTERS));
    expect(metrics.currencies.USD.confirmed).toBe(100);
    expect(metrics.currencies.USD.expected).toBe(100);
    expect(metrics.currencies.COP.confirmed).toBe(0);
    expect(metrics.paymentCount).toBe(1);
    expect(metrics.reconciliationRate).toBe(100);
  });

  it("excluye meses gratis del recaudo esperado", () => {
    const freeSnapshot = { ...snapshot, billings: [{ ...billing, isFreeReferralMonth: true, isEligible: false }] };
    const metrics = calculateMetrics(filterDataset(freeSnapshot, EMPTY_DASHBOARD_FILTERS));
    expect(metrics.currencies.USD.expected).toBe(0);
  });

  it("exporta la vista filtrada a CSV y neutraliza fórmulas", () => {
    const csv = buildPaymentsCsv(
      [payment({ observation: "=HYPERLINK(\"https://example.com\")" })],
      [
        { key: "client", label: "Cliente" },
        { key: "observation", label: "Observación" },
      ],
    );
    expect(csv).toContain("Cliente •0001");
    expect(csv).toContain("'=HYPERLINK");
    expect(csv.split("\r\n")).toHaveLength(2);
  });
});
