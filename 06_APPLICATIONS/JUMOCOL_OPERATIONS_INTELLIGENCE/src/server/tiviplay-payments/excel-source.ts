import "server-only";

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import ExcelJS from "exceljs";

import {
  type BillingRecord,
  type CreditRecord,
  type Currency,
  type MonthlyAudit,
  type PaymentRecord,
  type QualityIssue,
  type SheetAudit,
  type SheetAuditFamily,
  type SourceMonth,
  TIVIPLAY_EXPECTED_COVERAGE,
  type TiviplayPaymentsSnapshot,
} from "@/features/tiviplay-payments/domain";
import {
  calculateClientStatus,
  isFreeReferralEvidence,
  monthFromText,
  monthLabel,
  normalizeAdvisor,
  normalizeOrigin,
  normalizePanel,
  normalizePaymentMethod,
  normalizePlan,
  normalizeToken,
  originType,
  parseExcelDate,
  parseLocalizedAmount,
  sanitizeObservation,
} from "@/features/tiviplay-payments/normalization";

type SheetFamily = SheetAuditFamily;

type HeaderInfo = {
  row: number;
  columns: Map<string, number>;
};

type BaseAttributes = {
  plan: string;
  panel: string;
  expectedMethod: string;
  screens: number | null;
  sourceStatus: unknown;
  dueDate: string | null;
  nextPaymentDate: string | null;
};

type MutableQuality = Record<
  | "invalidDates"
  | "nonNumericAmounts"
  | "mixedCurrencies"
  | "duplicateClients"
  | "duplicatePayments"
  | "unnormalizedMethods"
  | "unknownAdvisors"
  | "missingDates"
  | "missingClients"
  | "unreconciledPayments"
  | "formulaErrors"
  | "formulaWithoutResults"
  | "periodDifferences"
  | "geographyMissing"
  | "ambiguousStates",
  number
>;

type CacheEntry = {
  signature: string;
  snapshot: TiviplayPaymentsSnapshot;
};

let cache: CacheEntry | null = null;

const HEADER_HINTS = new Set([
  "CLIENTE",
  "ESTADO",
  "PLAN ACTIVO",
  "MONTO RECIBIDO",
  "VALOR EN PESOS",
  "FECHA",
  "FECHA DE RECIBIDO",
  "ASESOR",
  "ORIGEN",
  "PANEL",
  "CREDITO",
  "RECARGA",
]);

export async function loadTiviplayPaymentsSnapshot(options: { force?: boolean } = {}): Promise<TiviplayPaymentsSnapshot> {
  const configuredPath = process.env.TIVIPLAY_PAYMENTS_WORKBOOK_PATH?.trim();
  const sourcePath = configuredPath
    ? path.resolve(/*turbopackIgnore: true*/ process.cwd(), configuredPath)
    : path.join(
        process.cwd(),
        "data",
        "private",
        "tiviplay",
        "GESTION_DIA_PAGOS_2026_TIVIPLAY.xlsx",
      );

  let sourceStat;
  let sourceBuffer: Buffer;
  try {
    [sourceStat, sourceBuffer] = await Promise.all([stat(sourcePath), readFile(sourcePath)]);
  } catch {
    return emptySnapshot(
      "file-not-found",
      "No se encontró la fuente Excel configurada. Copia el archivo autorizado en data/private/tiviplay o configura TIVIPLAY_PAYMENTS_WORKBOOK_PATH.",
    );
  }

  const sha256 = createHash("sha256").update(sourceBuffer).digest("hex").toUpperCase();
  const signature = [sourcePath, sourceStat.size, sourceStat.mtimeMs, sha256].join("|");

  if (!options.force && cache?.signature === signature) {
    return cache.snapshot;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const workbookData = sourceBuffer.buffer.slice(
      sourceBuffer.byteOffset,
      sourceBuffer.byteOffset + sourceBuffer.byteLength,
    ) as ArrayBuffer;
    await workbook.xlsx.load(workbookData);
    const snapshot = buildSnapshot(workbook, {
      fileName: path.basename(sourcePath),
      fileSizeBytes: sourceStat.size,
      sha256,
      hashPrefix: sha256.slice(0, 12),
      fileUpdatedAt: sourceStat.mtime.toISOString(),
    });
    cache = { signature, snapshot };
    return snapshot;
  } catch {
    return emptySnapshot(
      "error",
      "La fuente existe, pero no pudo procesarse. Verifica que sea un .xlsx válido y que no esté dañado.",
    );
  }
}

export function clearTiviplayPaymentsCache(): void {
  cache = null;
}

export function buildSnapshot(
  workbook: ExcelJS.Workbook,
  source: {
    fileName: string;
    fileSizeBytes: number;
    sha256: string;
    hashPrefix: string;
    fileUpdatedAt: string;
  },
): TiviplayPaymentsSnapshot {
  const referenceDate = findReferenceDate(workbook);
  const baseAttributes = readBaseAttributes(workbook, referenceDate);
  const billings = readBillings(workbook, referenceDate, baseAttributes);
  const payments = readPayments(workbook, billings, baseAttributes);
  const credits = readCredits(workbook);
  const sheets = workbook.worksheets.map((worksheet) => describeSheet(worksheet, billings, payments, credits));
  const monthlyAudits = buildMonthlyAudits(sheets, billings, payments, credits);
  const qualityCounts = collectQualityCounts(sheets, billings, payments, credits);
  const availableMonths = monthlyAudits
    .filter((audit) => audit.available)
    .map(({ year, month }) => sourceMonth(year, month));
  const expectedMonths = Array.from(
    {
      length:
        TIVIPLAY_EXPECTED_COVERAGE.throughMonth -
        TIVIPLAY_EXPECTED_COVERAGE.fromMonth +
        1,
    },
    (_, index) => TIVIPLAY_EXPECTED_COVERAGE.fromMonth + index,
  );
  const availableKeys = new Set(availableMonths.map((month) => `${month.year}-${month.month}`));
  const missingExpectedMonths = expectedMonths
    .filter((month) => !availableKeys.has(`${TIVIPLAY_EXPECTED_COVERAGE.year}-${month}`))
    .map((month) => sourceMonth(TIVIPLAY_EXPECTED_COVERAGE.year, month));
  const quality = qualityIssues(qualityCounts);
  const hasData = billings.length > 0 || payments.length > 0 || credits.length > 0;
  const hasIncompleteExpectedFamily = monthlyAudits.some(
    (audit) =>
      audit.year === TIVIPLAY_EXPECTED_COVERAGE.year &&
      audit.month >= TIVIPLAY_EXPECTED_COVERAGE.fromMonth &&
      audit.month <= TIVIPLAY_EXPECTED_COVERAGE.throughMonth &&
      audit.available &&
      audit.coverage.some((family) => !family.present),
  );

  return {
    state:
      !hasData
        ? "no-data"
        : missingExpectedMonths.length || hasIncompleteExpectedFamily
          ? "partial"
          : "ready",
    message: !hasData
      ? "El libro fue leído, pero no contiene registros utilizables en las familias de hojas reconocidas."
      : missingExpectedMonths.length || hasIncompleteExpectedFamily
        ? "Fuente real cargada con cobertura mensual parcial. Los meses o familias ausentes no se estiman ni se completan con otros archivos."
        : "Fuente real cargada y normalizada.",
    source: {
      ...source,
      processedAt: new Date().toISOString(),
      referenceDate,
      workbookSheets: workbook.worksheets.length,
    },
    availableMonths,
    missingExpectedMonths,
    monthlyAudits,
    billings,
    payments,
    credits,
    quality,
    sheets,
    dictionary: {
      advisors: uniqueSorted([...payments.map((record) => record.advisor), ...credits.map((record) => record.advisor)]),
      methods: uniqueSorted([...payments.map((record) => record.paymentMethod), ...billings.map((record) => record.expectedMethod)]),
      origins: uniqueSorted([...payments.map((record) => record.origin), ...credits.map((record) => record.origin)]),
      panels: uniqueSorted([...billings.map((record) => record.panel), ...payments.map((record) => record.panel), ...credits.map((record) => record.panel)]),
      plans: uniqueSorted([...billings.map((record) => record.plan), ...payments.map((record) => record.plan)]),
      statuses: uniqueSorted([...billings.map((record) => record.status), ...payments.map((record) => record.status)]),
    },
  };
}

function emptySnapshot(state: TiviplayPaymentsSnapshot["state"], message: string): TiviplayPaymentsSnapshot {
  return {
    state,
    message,
    source: null,
    availableMonths: [],
    missingExpectedMonths: [],
    monthlyAudits: [],
    billings: [],
    payments: [],
    credits: [],
    quality: [],
    sheets: [],
    dictionary: { advisors: [], methods: [], origins: [], panels: [], plans: [], statuses: [] },
  };
}

function classifySheet(name: string): SheetFamily {
  const token = normalizeToken(name);
  if (token.includes("BASE GENERAL")) return "base";
  if (token.startsWith("PAGOS")) return "billing";
  if (token.startsWith("ZELLE")) return "zelle";
  if (token.startsWith("PAYPAL")) return "paypal";
  if (token.startsWith("TRANSF")) return "transfer";
  if (token.startsWith("CONTROL")) {
    const panel = normalizePanel(token);
    if (panel === "Panel 1") return "panel1";
    if (panel === "Panel 2") return "panel2";
    if (panel === "Panel 3") return "panel3";
  }
  return "ignored";
}

function scalar(value: ExcelJS.CellValue): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date || typeof value !== "object") return value;
  if ("result" in value) return value.result ?? null;
  if ("text" in value && typeof value.text === "string") return value.text;
  if ("richText" in value) return value.richText.map((part) => part.text).join("");
  if ("error" in value) return null;
  return null;
}

function detectHeader(worksheet: ExcelJS.Worksheet): HeaderInfo | null {
  let best: HeaderInfo | null = null;
  let bestScore = 0;
  const maxColumns = Math.min(Math.max(worksheet.actualColumnCount, 1), 40);

  for (let rowIndex = 1; rowIndex <= Math.min(worksheet.rowCount, 40); rowIndex += 1) {
    const columns = new Map<string, number>();
    let score = 0;
    for (let column = 1; column <= maxColumns; column += 1) {
      const token = normalizeToken(scalar(worksheet.getCell(rowIndex, column).value));
      if (!token) continue;
      columns.set(token, column);
      if (HEADER_HINTS.has(token)) score += 2;
      else if (/CLIENTE|FECHA|MONTO|VALOR|ESTADO|PLAN|PANEL|ASESOR|ORIGEN/.test(token)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = { row: rowIndex, columns };
    }
  }

  return bestScore >= 2 ? best : null;
}

function column(headers: HeaderInfo, ...names: string[]): number | null {
  for (const name of names) {
    const found = headers.columns.get(normalizeToken(name));
    if (found) return found;
  }
  return null;
}

function value(worksheet: ExcelJS.Worksheet, row: number, columnIndex: number | null): unknown {
  return columnIndex ? scalar(worksheet.getCell(row, columnIndex).value) : null;
}

function hasValue(valueToCheck: unknown): boolean {
  return valueToCheck !== null && valueToCheck !== undefined && String(valueToCheck).trim() !== "";
}

function isLikelyClient(valueToCheck: unknown): boolean {
  const token = normalizeToken(valueToCheck);
  return Boolean(token) && /[A-Z]/.test(token) && !/(^| )(TOTAL|SEMANA|CLIENTE|VENCIDOS?|RESUMEN|INGRESOS?|PENDIENTES?|CODIGOS?)( |$)/.test(token);
}

function clientIdentity(valueToCheck: unknown): { key: string; label: string } {
  const token = normalizeToken(valueToCheck);
  if (!token) return { key: "", label: "Cliente no identificado" };
  const key = createHash("sha256").update(token).digest("hex").slice(0, 16);
  return { key, label: `Cliente •${key.slice(-4).toUpperCase()}` };
}

function findReferenceDate(workbook: ExcelJS.Workbook): string | null {
  const dates: string[] = [];
  for (const worksheet of workbook.worksheets) {
    const family = classifySheet(worksheet.name);
    if (family !== "zelle" && family !== "paypal" && family !== "transfer") continue;
    const headers = detectHeader(worksheet);
    if (!headers) continue;
    const dateColumn = column(headers, "FECHA DE RECIBIDO", "FECHA");
    if (!dateColumn) continue;
    for (let row = headers.row + 1; row <= worksheet.rowCount; row += 1) {
      const parsed = parseExcelDate(value(worksheet, row, dateColumn));
      if (parsed) dates.push(parsed);
    }
  }
  return dates.sort().at(-1) ?? null;
}

function readBaseAttributes(workbook: ExcelJS.Workbook, referenceDate: string | null): Map<string, BaseAttributes> {
  const attributes = new Map<string, BaseAttributes>();
  for (const worksheet of workbook.worksheets.filter((sheet) => classifySheet(sheet.name) === "base")) {
    const headers = detectHeader(worksheet);
    if (!headers) continue;
    const clientColumn = column(headers, "CLIENTE");
    for (let row = headers.row + 1; row <= worksheet.rowCount; row += 1) {
      const rawClient = value(worksheet, row, clientColumn);
      if (!isLikelyClient(rawClient)) continue;
      const client = clientIdentity(rawClient);
      const nextPaymentDate = parseExcelDate(value(worksheet, row, column(headers, "F PROXIMO PAGO")));
      attributes.set(client.key, {
        plan: normalizePlan(value(worksheet, row, column(headers, "PLAN ACTIVO"))),
        panel: normalizePanel(value(worksheet, row, column(headers, "PANEL"))),
        expectedMethod: normalizePaymentMethod(value(worksheet, row, column(headers, "METODO DE PAGO"))),
        screens: integer(value(worksheet, row, column(headers, "PANTALLAS"))),
        sourceStatus: calculateClientStatus(
          nextPaymentDate,
          referenceDate,
          value(worksheet, row, column(headers, "ESTADO")),
        ),
        dueDate: parseExcelDate(value(worksheet, row, column(headers, "F VENCIMIENTO"))),
        nextPaymentDate,
      });
    }
  }
  return attributes;
}

function readBillings(
  workbook: ExcelJS.Workbook,
  referenceDate: string | null,
  baseAttributes: Map<string, BaseAttributes>,
): BillingRecord[] {
  const records: BillingRecord[] = [];
  for (const worksheet of workbook.worksheets.filter((sheet) => classifySheet(sheet.name) === "billing")) {
    const month = monthFromText(worksheet.name);
    const headers = detectHeader(worksheet);
    if (!month || !headers) continue;
    const year = TIVIPLAY_EXPECTED_COVERAGE.year;
    const period = `${year}-${String(month).padStart(2, "0")}`;
    const clientColumn = column(headers, "CLIENTE");
    for (let row = headers.row + 1; row <= worksheet.rowCount; row += 1) {
      const rawClient = value(worksheet, row, clientColumn);
      if (!isLikelyClient(rawClient)) continue;
      const client = clientIdentity(rawClient);
      const base = baseAttributes.get(client.key);
      const rawNextPayment = value(worksheet, row, column(headers, "F PROXIMO PAGO"));
      const nextPaymentDate = parseExcelDate(rawNextPayment) ?? base?.nextPaymentDate ?? null;
      const rawDueDate = value(worksheet, row, column(headers, "F VENCIMIENTO"));
      const dueDate = parseExcelDate(rawDueDate) ?? base?.dueDate ?? null;
      const sourceStatus = value(worksheet, row, column(headers, "ESTADO")) ?? base?.sourceStatus;
      const plan = normalizePlan(value(worksheet, row, column(headers, "PLAN ACTIVO")) ?? base?.plan);
      const panel = normalizePanel(value(worksheet, row, column(headers, "PANEL")) ?? base?.panel);
      const expectedMethod = normalizePaymentMethod(
        value(worksheet, row, column(headers, "METODO DE PAGO")) ?? base?.expectedMethod,
      );
      const screens = integer(value(worksheet, row, column(headers, "PANTALLAS"))) ?? base?.screens ?? null;
      const observation = value(worksheet, row, column(headers, "OBSERVACIONES", "OBSERVACION"));
      const referral = value(worksheet, row, column(headers, "REFERIDO"));
      const isFreeReferralMonth = isFreeReferralEvidence(observation, referral);
      const status = calculateClientStatus(nextPaymentDate, referenceDate, sourceStatus);
      const amountCandidates: Array<[Currency, unknown]> = [
        ["USD", value(worksheet, row, column(headers, "USD"))],
        ["COP", value(worksheet, row, column(headers, "COP"))],
        ["CAD", value(worksheet, row, column(headers, "CAD"))],
      ];
      const parsedAmounts = amountCandidates
        .map(([currency, raw]) => ({ currency, raw, amount: parseLocalizedAmount(raw) }))
        .filter(({ amount }) => amount !== null && amount >= 0);
      const amounts = parsedAmounts.some(({ amount }) => (amount ?? 0) > 0)
        ? parsedAmounts.filter(({ amount }) => (amount ?? 0) > 0)
        : [{ currency: "USD" as const, raw: null, amount: 0 }];
      for (const { currency, amount } of amounts) {
        const qualityFlags: string[] = [];
        if (hasValue(rawNextPayment) && !parseExcelDate(rawNextPayment)) qualityFlags.push("INVALID_NEXT_PAYMENT_DATE");
        if (hasValue(rawDueDate) && !parseExcelDate(rawDueDate)) qualityFlags.push("INVALID_DUE_DATE");
        if (amount === 0) qualityFlags.push("MISSING_EXPECTED_AMOUNT");
        if (status === "Requiere revisión") qualityFlags.push("AMBIGUOUS_STATUS");
        records.push({
          id: `billing-${year}-${month}-${row}-${currency}`,
          kind: "Facturación",
          period,
          date: `${period}-01`,
          year,
          month,
          clientKey: client.key,
          clientLabel: client.label,
          status,
          plan,
          screens,
          amount: amount ?? 0,
          currency,
          expectedMethod,
          panel,
          dueDate,
          nextPaymentDate,
          isFreeReferralMonth,
          isEligible: status !== "Desactivado" && !isFreeReferralMonth,
          sourceSheet: worksheet.name,
          sourceRow: row,
          qualityFlags,
        });
      }
    }
  }
  return records;
}

function readPayments(
  workbook: ExcelJS.Workbook,
  billings: BillingRecord[],
  baseAttributes: Map<string, BaseAttributes>,
): PaymentRecord[] {
  const records: PaymentRecord[] = [];
  const billingGroups = new Map<string, BillingRecord[]>();
  for (const billing of billings) {
    const key = `${billing.period}|${billing.clientKey}`;
    const group = billingGroups.get(key) ?? [];
    group.push(billing);
    billingGroups.set(key, group);
  }

  for (const worksheet of workbook.worksheets) {
    const family = classifySheet(worksheet.name);
    if (family !== "zelle" && family !== "paypal" && family !== "transfer") continue;
    const month = monthFromText(worksheet.name);
    const headers = detectHeader(worksheet);
    if (!month || !headers) continue;
    const year = TIVIPLAY_EXPECTED_COVERAGE.year;
    const clientColumn = column(headers, "CLIENTE");
    const dateColumn = column(headers, "FECHA DE RECIBIDO", "FECHA");
    const advisorColumn = column(headers, "ASESOR");
    const originColumn = column(headers, "ORIGEN");
    const observationColumn = column(headers, "OBSERVACION", "OBSERVACIONES");
    const proofColumn = column(headers, "CONFIRMACION", "LINK DE CONFIRMACION");
    const methodColumn = column(headers, "MEDIO DE PAGO", "METODO DE PAGO");

    for (let row = headers.row + 1; row <= worksheet.rowCount; row += 1) {
      const rawClient = value(worksheet, row, clientColumn);
      const dateRaw = value(worksheet, row, dateColumn);
      const paymentDate = parseExcelDate(dateRaw);
      const hasClient = isLikelyClient(rawClient);
      const client = clientIdentity(hasClient ? rawClient : null);
      const amountCandidates = paymentAmounts(worksheet, headers, row, family);
      const positiveAmounts = amountCandidates.filter(({ amount }) => amount !== null && amount > 0);
      const proof = normalizeToken(value(worksheet, row, proofColumn));
      if (!hasClient && !paymentDate) continue;
      if (!positiveAmounts.length && !hasClient) continue;
      if (family === "zelle" && !paymentDate && proof !== "CONFIRMADO") continue;
      if (family === "paypal" && !paymentDate && !proof) continue;
      const amounts = positiveAmounts.length
        ? positiveAmounts
        : [{ currency: "USD" as Currency, amount: 0, raw: null }];
      const paymentGroupId = `payment-${family}-${year}-${month}-${row}`;
      const advisor = normalizeAdvisor(value(worksheet, row, advisorColumn));
      const origin = normalizeOrigin(value(worksheet, row, originColumn));
      const paymentMethod =
        family === "zelle"
          ? "Zelle"
          : family === "paypal"
            ? "PayPal"
            : normalizePaymentMethod(value(worksheet, row, methodColumn) ?? "Transferencia");
      const base = client.key ? baseAttributes.get(client.key) : undefined;
      const billingCandidates = billingGroups.get(
        `${year}-${String(month).padStart(2, "0")}|${client.key}`,
      ) ?? [];
      const billingRows = new Map(billingCandidates.map((billing) => [`${billing.sourceSheet}:${billing.sourceRow}`, billing]));
      const uniqueBillingRows = [...billingRows.values()];
      const reconciliationStatus =
        !client.key || uniqueBillingRows.length === 0
          ? "No conciliado"
          : uniqueBillingRows.length === 1
            ? "Conciliado"
            : "Requiere revisión";
      const matched = uniqueBillingRows.length === 1 ? uniqueBillingRows[0] : null;
      const confirmationEvidence =
        family === "zelle"
          ? proof === "CONFIRMADO"
            ? "Confirmación explícita"
            : "Sin confirmación explícita"
          : family === "paypal"
            ? paymentDate
              ? "Monto y fecha de recibido"
              : "Sin fecha de recibido"
            : paymentDate
              ? "Registro fechado en transferencias"
              : "Transferencia sin fecha";
      const paypalCommission =
        family === "paypal"
          ? parseLocalizedAmount(value(worksheet, row, column(headers, "COMISION PAYPAL")))
          : null;
      const paypalInvoiceAmount =
        family === "paypal"
          ? parseLocalizedAmount(value(worksheet, row, column(headers, "FACTURA ENVIADA")))
          : null;
      const evidenceValid =
        Boolean(client.key) &&
        Boolean(paymentDate) &&
        positiveAmounts.length > 0 &&
        (family !== "zelle" || proof === "CONFIRMADO");
      const qualityFlags: string[] = [];
      if (!client.key) qualityFlags.push("MISSING_CLIENT");
      if (!paymentDate) qualityFlags.push(hasValue(dateRaw) ? "INVALID_DATE" : "MISSING_DATE");
      if (!positiveAmounts.length) qualityFlags.push("INVALID_AMOUNT");
      if (amounts.length > 1) qualityFlags.push("MIXED_CURRENCIES");
      if (advisor === "Sin identificar") qualityFlags.push("UNKNOWN_ADVISOR");
      if (reconciliationStatus === "No conciliado") qualityFlags.push("UNRECONCILED");
      if (reconciliationStatus === "Requiere revisión") qualityFlags.push("AMBIGUOUS_RECONCILIATION");

      for (const { currency, amount } of amounts) {
        const currencyMatch = billingCandidates.find((billing) => billing.currency === currency) ?? matched;
        records.push({
          id: `${paymentGroupId}-${currency}`,
          paymentGroupId,
          kind: "Pago",
          date: paymentDate,
          year,
          month,
          clientKey: client.key,
          clientLabel: client.label,
          amount: amount ?? 0,
          currency,
          paymentMethod,
          advisor,
          origin,
          type: originType(origin),
          panel: currencyMatch?.panel ?? base?.panel ?? "Sin identificar",
          plan: currencyMatch?.plan ?? base?.plan ?? "Sin identificar",
          status: currencyMatch?.status ?? calculateClientStatus(base?.nextPaymentDate ?? null, paymentDate, base?.sourceStatus),
          reconciliationStatus,
          reconciliationReason:
            reconciliationStatus === "Conciliado"
              ? "Coincidencia exacta del cliente normalizado dentro del mismo mes."
              : reconciliationStatus === "Requiere revisión"
                ? `${uniqueBillingRows.length} registros mensuales candidatos; no se seleccionó uno arbitrariamente.`
                : "No existe un registro mensual exacto para el cliente y periodo.",
          matchedBillingId: currencyMatch?.id ?? null,
          confirmed: evidenceValid,
          confirmationEvidence,
          isDuplicate: false,
          isAdvance: Boolean(paymentDate && paymentDate < `${year}-${String(month).padStart(2, "0")}-01`),
          paypalGrossAmount:
            family === "paypal" ? paypalInvoiceAmount ?? (amount ?? 0) + (paypalCommission ?? 0) : null,
          paypalCommission,
          observation: sanitizeObservation(value(worksheet, row, observationColumn)),
          dueDate: currencyMatch?.dueDate ?? base?.dueDate ?? null,
          nextPaymentDate: currencyMatch?.nextPaymentDate ?? base?.nextPaymentDate ?? null,
          sourceFamily: family,
          sourceSheet: worksheet.name,
          sourceRow: row,
          qualityFlags: [...qualityFlags],
        });
      }
    }
  }

  const fingerprints = new Set<string>();
  for (const record of records) {
    const fingerprint = [
      record.clientKey,
      record.date,
      record.currency,
      record.amount.toFixed(2),
      record.paymentMethod,
    ].join("|");
    if (record.clientKey && record.date && fingerprints.has(fingerprint)) {
      record.isDuplicate = true;
      record.qualityFlags.push("POSSIBLE_DUPLICATE_PAYMENT");
    } else if (record.clientKey && record.date) {
      fingerprints.add(fingerprint);
    }
  }

  return records;
}

function paymentAmounts(
  worksheet: ExcelJS.Worksheet,
  headers: HeaderInfo,
  row: number,
  family: SheetFamily,
): Array<{ currency: Currency; amount: number | null; raw: unknown }> {
  if (family === "zelle" || family === "paypal") {
    const raw = value(worksheet, row, column(headers, "MONTO RECIBIDO", "USD"));
    return [{ currency: "USD", amount: parseLocalizedAmount(raw), raw }];
  }
  return ([
    ["COP", "VALOR EN PESOS"],
    ["USD", "USD"],
    ["CAD", "CAD"],
  ] as const).map(([currency, header]) => {
    const raw = value(worksheet, row, column(headers, header));
    return { currency, amount: parseLocalizedAmount(raw), raw };
  });
}

function readCredits(workbook: ExcelJS.Workbook): CreditRecord[] {
  const records: CreditRecord[] = [];
  for (const worksheet of workbook.worksheets.filter((sheet) => classifySheet(sheet.name).startsWith("panel"))) {
    const headers = detectHeader(worksheet);
    const month = monthFromText(worksheet.name);
    if (!headers || !month) continue;
    const panel = normalizePanel(worksheet.name);
    for (let row = headers.row + 1; row <= worksheet.rowCount; row += 1) {
      const dateRaw = value(worksheet, row, column(headers, "FECHA"));
      const recordDate = parseExcelDate(dateRaw);
      const credits = parseLocalizedAmount(value(worksheet, row, column(headers, "CREDITO")));
      const recharge = parseLocalizedAmount(value(worksheet, row, column(headers, "RECARGA")));
      const advisor = normalizeAdvisor(value(worksheet, row, column(headers, "ASESOR")));
      const origin = normalizeOrigin(value(worksheet, row, column(headers, "ORIGEN")));
      if (!recordDate && credits === null && recharge === null) continue;
      const qualityFlags: string[] = [];
      if (!recordDate) qualityFlags.push(hasValue(dateRaw) ? "INVALID_DATE" : "MISSING_DATE");
      if (advisor === "Sin identificar") qualityFlags.push("UNKNOWN_ADVISOR");
      records.push({
        id: `credit-${TIVIPLAY_EXPECTED_COVERAGE.year}-${month}-${panel}-${row}`,
        kind: "Crédito",
        date: recordDate,
        year: TIVIPLAY_EXPECTED_COVERAGE.year,
        month,
        panel,
        advisor,
        origin,
        credits: credits ?? 0,
        recharge: recharge ?? 0,
        sourceSheet: worksheet.name,
        sourceRow: row,
        qualityFlags,
      });
    }
  }
  return records;
}

function describeSheet(
  worksheet: ExcelJS.Worksheet,
  billings: BillingRecord[],
  payments: PaymentRecord[],
  credits: CreditRecord[],
): SheetAudit {
  const family = classifySheet(worksheet.name);
  const headers = detectHeader(worksheet);
  let formulaCount = 0;
  let formulaWithoutResultCount = 0;
  let errorCount = 0;
  let emptyRows = 0;
  const start = headers ? headers.row + 1 : 1;
  let nonEmptyDataRows = 0;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (typeof cell.value === "object" && cell.value && "formula" in cell.value) {
        formulaCount += 1;
        if (!("result" in cell.value) || cell.value.result === null || cell.value.result === undefined) {
          formulaWithoutResultCount += 1;
        }
      }
      if (typeof cell.value === "object" && cell.value && "error" in cell.value) errorCount += 1;
    });
    if (rowNumber >= start && row.hasValues) nonEmptyDataRows += 1;
  });

  for (let row = start; row <= worksheet.rowCount; row += 1) {
    if (!worksheet.getRow(row).hasValues) emptyRows += 1;
  }

  const usefulSourceRows = new Set<number>();
  const confirmedSourceRows = new Set<number>();
  if (family === "billing") {
    for (const record of billings.filter((item) => item.sourceSheet === worksheet.name)) {
      usefulSourceRows.add(record.sourceRow);
      confirmedSourceRows.add(record.sourceRow);
    }
  } else if (family === "zelle" || family === "paypal" || family === "transfer") {
    for (const record of payments.filter((item) => item.sourceSheet === worksheet.name)) {
      usefulSourceRows.add(record.sourceRow);
      if (record.confirmed && !record.isDuplicate) confirmedSourceRows.add(record.sourceRow);
    }
  } else if (family.startsWith("panel")) {
    for (const record of credits.filter((item) => item.sourceSheet === worksheet.name)) {
      usefulSourceRows.add(record.sourceRow);
      confirmedSourceRows.add(record.sourceRow);
    }
  }

  const discardedRows = Math.max(0, nonEmptyDataRows - usefulSourceRows.size);
  return {
    name: worksheet.name,
    normalizedName: normalizeToken(worksheet.name),
    family,
    month: monthFromText(worksheet.name),
    panel: family.startsWith("panel") ? normalizePanel(worksheet.name) : null,
    headerRow: headers?.row ?? null,
    usefulRows: usefulSourceRows.size,
    confirmedRows: confirmedSourceRows.size,
    discardedRows,
    discardReasons: discardedRows ? { FILA_NO_OPERATIVA_O_INCOMPLETA: discardedRows } : {},
    emptyRows,
    formulaCount,
    formulaWithoutResultCount,
    errorCount,
    headerCount: headers?.columns.size ?? 0,
  };
}

const MONTHLY_AUDIT_FAMILIES: Array<MonthlyAudit["coverage"][number]["family"]> = [
  "billing",
  "zelle",
  "paypal",
  "transfer",
  "panel1",
  "panel2",
  "panel3",
];

function buildMonthlyAudits(
  sheets: SheetAudit[],
  billings: BillingRecord[],
  payments: PaymentRecord[],
  credits: CreditRecord[],
): MonthlyAudit[] {
  const months = uniqueMonths(
    sheets
      .filter((sheet) => sheet.month !== null && sheet.family !== "ignored" && sheet.family !== "base")
      .map((sheet) => ({ year: TIVIPLAY_EXPECTED_COVERAGE.year, month: sheet.month as number })),
  );

  return months.map(({ year, month, label }) => {
    const monthSheets = sheets.filter((sheet) => sheet.month === month);
    const coverage = MONTHLY_AUDIT_FAMILIES.map((family) => {
      const familySheets = monthSheets.filter((sheet) => sheet.family === family);
      return {
        family,
        sheetName: familySheets.length ? familySheets.map((sheet) => sheet.name).join(" · ") : null,
        present: familySheets.length > 0,
        usefulRows: familySheets.reduce((total, sheet) => total + sheet.usefulRows, 0),
        confirmedRows: familySheets.reduce((total, sheet) => total + sheet.confirmedRows, 0),
        discardedRows: familySheets.reduce((total, sheet) => total + sheet.discardedRows, 0),
        emptyRows: familySheets.reduce((total, sheet) => total + sheet.emptyRows, 0),
      };
    });
    const monthBillings = billings.filter((record) => record.year === year && record.month === month);
    const monthPayments = payments.filter((record) => record.year === year && record.month === month);
    const monthCredits = credits.filter((record) => record.year === year && record.month === month);
    const billingClientRows = new Map<string, Set<string>>();
    for (const record of monthBillings) {
      const rows = billingClientRows.get(record.clientKey) ?? new Set<string>();
      rows.add(`${record.sourceSheet}:${record.sourceRow}`);
      billingClientRows.set(record.clientKey, rows);
    }

    return {
      year,
      month,
      label,
      available: coverage
        .filter((item) => !item.family.startsWith("panel"))
        .some((item) => item.usefulRows > 0),
      coverage,
      quality: {
        invalidDates:
          countFlag(monthBillings, "INVALID_NEXT_PAYMENT_DATE") +
          countFlag(monthBillings, "INVALID_DUE_DATE") +
          countFlag(monthPayments, "INVALID_DATE") +
          countFlag(monthCredits, "INVALID_DATE"),
        invalidAmounts:
          countFlag(monthBillings, "MISSING_EXPECTED_AMOUNT") +
          countFlag(monthPayments, "INVALID_AMOUNT"),
        duplicateClients: [...billingClientRows.values()].filter((rows) => rows.size > 1).length,
        duplicatePayments: uniquePaymentGroupCount(monthPayments.filter((record) => record.isDuplicate)),
        missingClients: uniquePaymentGroupCount(
          monthPayments.filter((record) => record.qualityFlags.includes("MISSING_CLIENT")),
        ),
        missingDates:
          uniquePaymentGroupCount(
            monthPayments.filter((record) => record.qualityFlags.includes("MISSING_DATE")),
          ) + countFlag(monthCredits, "MISSING_DATE"),
        unknownAdvisors:
          uniquePaymentGroupCount(monthPayments.filter((record) => record.advisor === "Sin identificar")) +
          monthCredits.filter((record) => record.advisor === "Sin identificar").length,
        unreconciledPayments: uniquePaymentGroupCount(
          monthPayments.filter(
            (record) => record.confirmed && !record.isDuplicate && record.reconciliationStatus !== "Conciliado",
          ),
        ),
        formulaErrors: monthSheets.reduce((total, sheet) => total + sheet.errorCount, 0),
        formulaWithoutResults: monthSheets.reduce(
          (total, sheet) => total + sheet.formulaWithoutResultCount,
          0,
        ),
      },
    };
  });
}

function uniquePaymentGroupCount(records: PaymentRecord[]): number {
  return new Set(records.map((record) => record.paymentGroupId)).size;
}

function collectQualityCounts(
  sheets: SheetAudit[],
  billings: BillingRecord[],
  payments: PaymentRecord[],
  credits: CreditRecord[],
): MutableQuality {
  const billingClientRows = new Map<string, Set<string>>();
  for (const record of billings) {
    const key = `${record.period}|${record.clientKey}`;
    const rows = billingClientRows.get(key) ?? new Set<string>();
    rows.add(`${record.sourceSheet}:${record.sourceRow}`);
    billingClientRows.set(key, rows);
  }
  const periodsWithDifference = new Set<string>();
  for (const period of new Set(billings.map((record) => record.period))) {
    for (const currency of ["USD", "COP", "CAD"] as Currency[]) {
      const expected = billings
        .filter((record) => record.period === period && record.currency === currency && record.isEligible)
        .reduce((total, record) => total + record.amount, 0);
      const received = payments
        .filter((record) => record.date?.startsWith(period) && record.currency === currency && record.confirmed && !record.isDuplicate)
        .reduce((total, record) => total + record.amount, 0);
      if (expected !== received) periodsWithDifference.add(`${period}-${currency}`);
    }
  }
  return {
    invalidDates: countFlag(billings, "INVALID_NEXT_PAYMENT_DATE") + countFlag(billings, "INVALID_DUE_DATE") + countFlag(payments, "INVALID_DATE") + countFlag(credits, "INVALID_DATE"),
    nonNumericAmounts: countFlag(billings, "MISSING_EXPECTED_AMOUNT") + countFlag(payments, "INVALID_AMOUNT"),
    mixedCurrencies: new Set(payments.filter((record) => record.qualityFlags.includes("MIXED_CURRENCIES")).map((record) => record.paymentGroupId)).size,
    duplicateClients: [...billingClientRows.values()].filter((rows) => rows.size > 1).length,
    duplicatePayments: new Set(payments.filter((record) => record.isDuplicate).map((record) => record.paymentGroupId)).size,
    unnormalizedMethods: payments.filter((record) => record.paymentMethod === "Sin identificar").length,
    unknownAdvisors: new Set(payments.filter((record) => record.advisor === "Sin identificar").map((record) => record.paymentGroupId)).size + credits.filter((record) => record.advisor === "Sin identificar").length,
    missingDates: new Set(payments.filter((record) => record.qualityFlags.includes("MISSING_DATE")).map((record) => record.paymentGroupId)).size + countFlag(credits, "MISSING_DATE"),
    missingClients: new Set(payments.filter((record) => record.qualityFlags.includes("MISSING_CLIENT")).map((record) => record.paymentGroupId)).size,
    unreconciledPayments: new Set(
      payments
        .filter(
          (record) => record.confirmed && !record.isDuplicate && record.reconciliationStatus !== "Conciliado",
        )
        .map((record) => record.paymentGroupId),
    ).size,
    formulaErrors: sheets.reduce((total, sheet) => total + sheet.errorCount, 0),
    formulaWithoutResults: sheets.reduce((total, sheet) => total + sheet.formulaWithoutResultCount, 0),
    periodDifferences: periodsWithDifference.size,
    geographyMissing: new Set(payments.filter((record) => record.confirmed).map((record) => record.paymentGroupId)).size,
    ambiguousStates: countFlag(billings, "AMBIGUOUS_STATUS"),
  };
}

function qualityIssues(counts: MutableQuality): QualityIssue[] {
  return [
    issue("INVALID_DATES", "Fechas inválidas", counts.invalidDates, "warning", "Valores de fecha presentes que no pudieron normalizarse."),
    issue("NON_NUMERIC_AMOUNTS", "Montos faltantes o no numéricos", counts.nonNumericAmounts, "warning", "Registros útiles sin un monto facturable o recibido válido."),
    issue("MIXED_CURRENCIES", "Monedas mezcladas", counts.mixedCurrencies, "warning", "Filas con más de una moneda positiva; se separan sin convertir."),
    issue("DUPLICATE_CLIENTS", "Clientes duplicados", counts.duplicateClients, "warning", "Más de una fila mensual candidata para el mismo cliente normalizado."),
    issue("DUPLICATE_PAYMENTS", "Pagos posiblemente duplicados", counts.duplicatePayments, "critical", "Coincidencia exacta de cliente, fecha, moneda, monto y método; el duplicado no suma recaudo."),
    issue("UNKNOWN_METHODS", "Métodos sin normalizar", counts.unnormalizedMethods, "warning", "Métodos vacíos o no reconocibles."),
    issue("UNKNOWN_ADVISORS", "Asesores sin identificar", counts.unknownAdvisors, "warning", "Registros sin un asesor textual confiable."),
    issue("MISSING_DATES", "Registros sin fecha", counts.missingDates, "critical", "Pagos o consumos sin fecha válida; no se confirman como recaudo."),
    issue("MISSING_CLIENTS", "Registros sin cliente", counts.missingClients, "critical", "Movimientos fechados con monto, pero sin cliente identificable."),
    issue("UNRECONCILED", "Pagos no conciliados", counts.unreconciledPayments, "critical", "Pagos sin una única coincidencia exacta en la facturación mensual."),
    issue("FORMULA_ERRORS", "Fórmulas o celdas con error", counts.formulaErrors, "critical", "Celdas de error detectadas en el libro."),
    issue("FORMULA_WITHOUT_RESULTS", "Fórmulas sin resultado calculado", counts.formulaWithoutResults, "warning", "Fórmulas presentes sin valor cacheado; no se usan como evidencia ni se evalúan en el servidor."),
    issue("EXPECTED_RECEIVED_DIFFERENCE", "Diferencias esperado/recibido", counts.periodDifferences, "info", "Combinaciones de periodo y moneda cuyo esperado no coincide con el recaudo confirmado."),
    issue("GEOGRAPHY_COVERAGE", "Sin cobertura geográfica explícita", counts.geographyMissing, "info", "Los pagos confirmados no incluyen país, ciudad o región autorizados; no se infiere ubicación."),
    issue("AMBIGUOUS_STATUS", "Ambigüedades de estado", counts.ambiguousStates, "warning", "No fue posible determinar el estado con fecha de próximo pago o estado fuente."),
  ];
}

function issue(code: string, label: string, count: number, severity: QualityIssue["severity"], description: string): QualityIssue {
  return { code, label, count, severity, description };
}

function countFlag(records: Array<{ qualityFlags: string[] }>, flag: string): number {
  return records.filter((record) => record.qualityFlags.includes(flag)).length;
}

function integer(valueToParse: unknown): number | null {
  const parsed = parseLocalizedAmount(valueToParse);
  return parsed === null ? null : Math.round(parsed);
}

function uniqueSorted<T extends string>(values: T[]): T[] {
  return [...new Set(values.filter((value) => value && value !== "Sin identificar"))].sort((a, b) => a.localeCompare(b, "es"));
}

function uniqueMonths(months: Array<{ year: number; month: number }>): SourceMonth[] {
  const byKey = new Map(months.map(({ year, month }) => [`${year}-${month}`, sourceMonth(year, month)]));
  return [...byKey.values()].sort((a, b) => a.year - b.year || a.month - b.month);
}

function sourceMonth(year: number, month: number): SourceMonth {
  return { year, month, label: monthLabel(year, month) };
}
