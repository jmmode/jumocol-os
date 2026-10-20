import { existsSync } from "node:fs";
import path from "node:path";

import ExcelJS from "exceljs";
import { beforeAll, describe, expect, it } from "vitest";

import {
  buildExecutiveComparison,
  calculateMetrics,
  filterDataset,
} from "@/features/tiviplay-payments/analytics";
import {
  EMPTY_DASHBOARD_FILTERS,
  type TiviplayPaymentsSnapshot,
} from "@/features/tiviplay-payments/domain";
import {
  buildSnapshot,
  clearTiviplayPaymentsCache,
  loadTiviplayPaymentsSnapshot,
} from "@/server/tiviplay-payments/excel-source";

const workbookPath = path.resolve(process.cwd(), "data/private/tiviplay/GESTION_DIA_PAGOS_2026_TIVIPLAY.xlsx");
const integration = describe.runIf(existsSync(workbookPath));

integration("adaptador Excel TiviPlay", () => {
  let snapshot: TiviplayPaymentsSnapshot;

  beforeAll(async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(workbookPath);
    snapshot = buildSnapshot(workbook, {
      fileName: path.basename(workbookPath),
      fileSizeBytes: 6_299_344,
      sha256: "92454FCFE03C94CC0D18FCE47F06C37115841D01272B7F41D32007138623DB0B",
      hashPrefix: "92454FCFE03C",
      fileUpdatedAt: "2026-08-30T21:48:44.194Z",
    });
  }, 180_000);

  it("detecta estructura real, encabezados variables y cobertura junio-agosto", () => {
    expect(snapshot.sheets).toHaveLength(54);
    expect(snapshot.availableMonths.map((period) => period.month)).toEqual(
      expect.arrayContaining([6, 7, 8]),
    );
    expect(snapshot.missingExpectedMonths).toEqual([]);
    expect(snapshot.state).toBe("partial");
    expect(snapshot.sheets.find((sheet) => sheet.name === "PAGOS JUNIO")?.headerRow).toBe(2);
    expect(snapshot.sheets.find((sheet) => sheet.name === "ZELLE (AGOSTO)")?.headerRow).toBe(3);
    expect(snapshot.sheets.find((sheet) => sheet.name === "CONTROL ( AGOSTO) P1")?.family).toBe("panel1");
    expect(snapshot.monthlyAudits.find((audit) => audit.month === 6)?.coverage.every((family) => family.present)).toBe(true);
    expect(snapshot.monthlyAudits.find((audit) => audit.month === 7)?.coverage.find((family) => family.family === "panel2")?.present).toBe(false);
    expect(snapshot.monthlyAudits.find((audit) => audit.month === 8)?.coverage.every((family) => family.present)).toBe(true);
  });

  it("cuadra la facturación mensual independiente por moneda", () => {
    const usd = snapshot.billings.filter((record) => record.currency === "USD").reduce((sum, record) => sum + record.amount, 0);
    const cop = snapshot.billings.filter((record) => record.currency === "COP").reduce((sum, record) => sum + record.amount, 0);
    expect(usd).toBeGreaterThan(0);
    expect(cop).toBeGreaterThan(0);
  });

  it("cuadra los pagos confirmados por evidencia sin convertir monedas", () => {
    const confirmed = snapshot.payments.filter((record) => record.confirmed);
    const usd = confirmed.filter((record) => record.currency === "USD").reduce((sum, record) => sum + record.amount, 0);
    const cop = confirmed.filter((record) => record.currency === "COP").reduce((sum, record) => sum + record.amount, 0);
    const paypalCommission = confirmed.filter((record) => record.paymentMethod === "PayPal").reduce((sum, record) => sum + (record.paypalCommission ?? 0), 0);
    expect(usd).toBeGreaterThan(0);
    expect(cop).toBeGreaterThan(0);
    expect(paypalCommission).toBeGreaterThan(0);
  });

  it("calcula KPIs y créditos desde registros normalizados", () => {
    const metrics = calculateMetrics(
      filterDataset(snapshot, {
        ...EMPTY_DASHBOARD_FILTERS,
        dateFrom: "2026-06-01",
        dateTo: "2026-08-31",
      }),
    );
    expect(metrics.creditsConsumed).toBeGreaterThan(0);
    expect(metrics.currencies.CAD.confirmed).toBe(0);
    expect(metrics.paymentCount).toBeGreaterThan(0);
  });

  it.each([
    { month: 6, expectedUsd: 5_200, confirmedUsd: 3_192, confirmedCop: 2_423_896, paypalNet: 1_628, commission: 98.09, credits: 563, payments: 61, reconciliation: 50.819672, unreconciled: 30 },
    { month: 7, expectedUsd: 10_561, confirmedUsd: 3_304, confirmedCop: 4_857_689, paypalNet: 1_658, commission: 76.39, credits: 775, payments: 42, reconciliation: 59.52381, unreconciled: 17 },
    { month: 8, expectedUsd: 10_905, confirmedUsd: 7_928, confirmedCop: 1_515_711, paypalNet: 1_576, commission: 95.38, credits: 766, payments: 120, reconciliation: 75, unreconciled: 30 },
  ])("cuadra el mes $month contra el control independiente", (expected) => {
    const metrics = calculateMetrics(
      filterDataset(snapshot, {
        ...EMPTY_DASHBOARD_FILTERS,
        year: "2026",
        month: String(expected.month),
      }),
    );
    expect(metrics.currencies.USD.expected).toBeCloseTo(expected.expectedUsd, 2);
    expect(metrics.currencies.USD.confirmed).toBeCloseTo(expected.confirmedUsd, 2);
    expect(metrics.currencies.COP.confirmed).toBeCloseTo(expected.confirmedCop, 2);
    expect(metrics.currencies.CAD.confirmed).toBe(0);
    expect(metrics.paypalNet).toBeCloseTo(expected.paypalNet, 2);
    expect(metrics.paypalCommission).toBeCloseTo(expected.commission, 2);
    expect(metrics.creditsConsumed).toBeCloseTo(expected.credits, 2);
    expect(metrics.paymentCount).toBe(expected.payments);
    expect(metrics.reconciliationRate).toBeCloseTo(expected.reconciliation, 4);
    expect(metrics.unreconciledRecords).toBe(expected.unreconciled);
  });

  it("construye la comparación ejecutiva junio-julio-agosto con variaciones exactas", () => {
    const comparison = buildExecutiveComparison(snapshot);
    expect(comparison.rows.map((row) => row.period)).toEqual(["2026-06", "2026-07", "2026-08"]);
    expect(comparison.rows[1].variationUsd?.absolute).toBeCloseTo(112, 2);
    expect(comparison.rows[2].variationUsd?.absolute).toBeCloseTo(4_624, 2);
    expect(comparison.conclusions.some((item) => item.id === "best-goal")).toBe(true);
    expect(comparison.conclusions.some((item) => item.id === "pending-increase")).toBe(true);
    expect(comparison.conclusions.some((item) => item.id === "partial-families")).toBe(true);
  });

  it("excluye campos sensibles y PII cruda del contrato serializable", () => {
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toMatch(/CONTRASE(?:N|Ñ)A|PASSWORD|TELEFONO|CORREO|USUARIO/i);
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(serialized).not.toMatch(/https?:\/\//i);
    expect(snapshot.payments.every((record) => record.clientLabel.startsWith("Cliente •") || record.clientLabel === "Cliente no identificado")).toBe(true);
  });

  it("reutiliza caché estable y fuerza una nueva lectura física cuando se solicita", async () => {
    clearTiviplayPaymentsCache();
    const first = await loadTiviplayPaymentsSnapshot({ force: true });
    const cached = await loadTiviplayPaymentsSnapshot();
    const refreshed = await loadTiviplayPaymentsSnapshot({ force: true });

    expect(cached).toBe(first);
    expect(refreshed).not.toBe(first);
    expect(refreshed.source?.sha256).toBe(first.source?.sha256);
    expect(refreshed.source?.fileSizeBytes).toBe(first.source?.fileSizeBytes);
  }, 180_000);
});
