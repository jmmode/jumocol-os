/**
 * TiviPlay Runtime Operativo — read model puro (sin I/O).
 *
 * Regla de alcance: TIVIPLAY_RUNTIME_DATE_SCOPE_V1
 *   - ventana operativa 2026-06-01 → hoy (America/Bogota)
 *   - enero–mayo 2026 y anteriores quedan fuera del runtime diario
 *   - el histórico no se borra: simplemente no se lee por defecto
 *
 * Cadena de evidencia por indicador: FUENTE → CAMPO → REGLA → CÁLCULO → ESTADO → EVIDENCIA.
 * Cada KPI expuesto lleva su `evidence`. Si una regla no es demostrable se publica
 * como `REQUIERE_DECISION` en lugar de inventar un valor.
 *
 * Nunca se exponen CONTRASEÑA, TELEFONO ni CORREO.
 */

export const RUNTIME_SCOPE = {
  id: "TIVIPLAY_RUNTIME_DATE_SCOPE_V1",
  start: "2026-06-01",
  workbookYear: 2026,
} as const;

export type SheetMeta = { title: string; hidden?: boolean };
export type SheetValues = Record<string, unknown[][]>;

export type Currency = "USD" | "COP" | "CAD";
export type Money = Record<Currency, number>;
export type PaymentMethod = "ZELLE" | "PAYPAL" | "TRANSFERENCIA";
export type ConfirmationState = "CONFIRMADO" | "PENDIENTE" | "REVISION" | "SIN_CONFIRMACION";
export type PanelId = "P1" | "P2" | "P3";

export type SheetRole =
  | { role: "BASE"; title: string }
  | { role: "CARTERA"; title: string; month: string }
  | { role: "PAGO"; title: string; month: string; method: PaymentMethod }
  | { role: "PANEL"; title: string; month: string; panel: PanelId };

export type SheetSelection = {
  included: SheetRole[];
  excluded: Array<{ title: string; reason: string }>;
};

export type Evidence = {
  source: string;
  field: string;
  rule: string;
  calculation: string;
  status: "VALIDADO" | "PARCIAL" | "REQUIERE_DECISION";
};

export type Kpi<T> = { value: T; evidence: Evidence };

export type PaymentRecord = {
  sheet: string;
  row: number;
  month: string;
  method: PaymentMethod;
  channel: string;
  date: string | null;
  client: string;
  clientKey: string;
  currency: Currency;
  amount: number;
  confirmation: ConfirmationState;
  advisor: string;
  origin: string;
  needsDecision: boolean;
  decisionReason: string;
};

export type PanelSummary = {
  panel: PanelId;
  sheet: string;
  panelName: string;
  openingBalance: number | null;
  creditsByField: number;
  creditsByBalance: number;
  difference: number;
  currentBalance: number | null;
  purchases: Array<{ row: number; previousBalance: number | null; newBalance: number }>;
  processed: number;
  released: number;
  unassigned: number;
  scheduledPending: number;
  scheduledToday: number;
  byAdvisor: Record<string, number>;
  exceptions: Array<{ row: number; type: string; detail: string }>;
};

export type CarteraState =
  | "PAGADO_VALIDADO"
  | "PAGADO_REQUIERE_DECISION"
  | "PAGO_POR_CONFIRMAR"
  | "SIN_PAGO"
  | "EXCEPCION_ESTRUCTURA";

export type CarteraItem = {
  row: number;
  client: string;
  clientKey: string;
  status: string;
  plan: string;
  panel: string;
  method: string;
  nominal: Money;
  dueDate: string | null;
  week: number | null;
  state: CarteraState;
  overdue: boolean;
  dueToday: boolean;
  paymentSource: string;
  paymentDate: string | null;
  paymentAmount: number | null;
  paymentCurrency: Currency | null;
  advisor: string;
  signals: string[];
  nextAction: string;
  note: string;
};

export type ClientCard = {
  key: string;
  name: string;
  status: string;
  plan: string;
  panel: string;
  method: string;
  nextPayment: string | null;
  lastPayment: string | null;
  lastPaymentDetail: string;
  balance: Money;
  balanceRule: string;
  advisor: string;
  note: string;
  carteraState: CarteraState | null;
  baseRow: number;
};

export type RuntimeReadModel = {
  generatedAt: string;
  today: string;
  currentMonth: string;
  scope: typeof RUNTIME_SCOPE & { end: string };
  sources: SheetSelection;
  management: {
    collectedToday: Kpi<Money>;
    collectedMonth: Kpi<Money>;
    receivedMonth: Kpi<Money>;
    pendingToCollect: Kpi<Money>;
    portfolioNominal: Kpi<Money>;
    coverage: Kpi<{ paid: number; total: number; pct: number }>;
    paymentsToConfirm: Kpi<{ count: number; amount: Money }>;
    decisionCases: Kpi<number>;
    activeClients: Kpi<number>;
    inactiveClients: Kpi<number>;
    dailyTarget: Kpi<null>;
    projection: Kpi<null>;
    byMethod: Kpi<Array<{ method: PaymentMethod; count: number; confirmed: Money; pending: Money; review: Money }>>;
    weekly: Kpi<Array<{ week: number; label: string; collected: Money; due: number }>>;
    monthly: Kpi<Array<{ month: string; registered: Money; confirmed: Money; payments: number; confirmedPayments: number }>>;
    portfolioStates: Kpi<Record<CarteraState, { count: number; nominal: Money }>>;
    plans: Kpi<Array<{ plan: string; active: number }>>;
    clientStates: Kpi<Record<string, number>>;
  };
  clients: {
    totalRows: number;
    inScope: number;
    active: number;
    pendingRenewal: number;
    inactive: number;
    excludedTc0: number;
    withError: number;
    errors: Array<{ row: number; type: string; detail: string }>;
  };
  payments: {
    month: PaymentRecord[];
    totals: Record<PaymentMethod, { count: number; confirmed: Money; pending: Money; review: Money; unconfirmed: Money }>;
    openInvoices: Array<{ sheet: string; row: number; client: string; amount: number; created: string | null; note: string }>;
  };
  panels: Record<PanelId, PanelSummary | null>;
  operations: {
    advisors: string[];
    items: CarteraItem[];
    dueToday: number;
    overdue: number;
    pendingValue: Money;
    exceptions: Array<{ sheet: string; row: number; type: string; detail: string }>;
  };
  clientIndex: ClientCard[];
  decisions: string[];
};

/* ------------------------------------------------------------------ utils */

const MONTHS: Record<string, string> = {
  ENE: "01", ENERO: "01", FEB: "02", FEBRERO: "02", MAR: "03", MARZ: "03", MARZO: "03",
  ABR: "04", ABRIL: "04", MAY: "05", MAYO: "05", JUN: "06", JUNIO: "06", JUL: "07", JULIO: "07",
  AGO: "08", AGOSTO: "08", SEP: "09", SEPT: "09", SEPTIEMBRE: "09", OCT: "10", OCTUBRE: "10",
  NOV: "11", NOVIEMBRE: "11", DIC: "12", DICIEMBRE: "12",
};

export const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
export const canon = (v: unknown) =>
  clean(v).toLocaleUpperCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "");

const emptyMoney = (): Money => ({ USD: 0, COP: 0, CAD: 0 });
const addMoney = (m: Money, c: Currency, v: number) => {
  m[c] = Math.round((m[c] + v) * 100) / 100;
};

export function parseAmount(raw: unknown): number | null {
  let s = clean(raw).replace(/\$/g, "").replace(/USD|COP|CAD/gi, "").replace(/\s/g, "");
  if (!s || s === "-") return null;
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else if (/^-?\d+,\d{1,2}$/.test(s)) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Fechas operativas del libro: yyyy-mm-dd[ hh:mm], dd-mm-yy, dd/mm/yyyy, d/m/yyyy. */
export function parseDate(raw: unknown): string | null {
  const s = clean(raw);
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (!m) return null;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  const month = Number(m[2]);
  const day = Number(m[1]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function weekBucket(isoDate: string) {
  const day = Number(isoDate.slice(-2));
  if (day <= 4) return 1;
  if (day <= 11) return 2;
  if (day <= 18) return 3;
  if (day <= 25) return 4;
  return 5;
}

const WEEK_LABELS = ["01–04", "05–11", "12–18", "19–25", "26–fin"];

function headerIndex(rows: unknown[][], required: string[]) {
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const keys = (rows[i] ?? []).map(canon);
    if (required.every((r) => keys.includes(canon(r)))) return i;
  }
  return -1;
}

function columns(header: unknown[]) {
  const map = new Map<string, number>();
  header.forEach((v, i) => {
    const k = canon(v);
    if (k && !map.has(k)) map.set(k, i);
  });
  return (...aliases: string[]) => {
    for (const a of aliases) {
      const i = map.get(canon(a));
      if (i != null) return i;
    }
    return null;
  };
}

const at = (row: unknown[], i: number | null) => (i == null ? "" : clean(row[i]));

export function clientKey(name: unknown) {
  return canon(name).replace(/[^A-Z0-9/ ]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeConfirmation(raw: string): ConfirmationState {
  const v = canon(raw);
  if (!v) return "SIN_CONFIRMACION";
  if (/REVISION/.test(v)) return "REVISION";
  if (/PENDIENTE/.test(v)) return "PENDIENTE";
  if (/CONFIRMADO/.test(v)) return "CONFIRMADO";
  return "SIN_CONFIRMACION";
}

const REVIEW_PATTERNS: Array<[string, RegExp]> = [
  ["POSIBLE NO RENOVACIÓN", /NO\s+RENUEV|NO\s+VA\s+RENOVAR|NO\s+RENOVAR/],
  ["POSIBLE MES GRATIS", /MES\s+GRATIS/],
  ["EXCEPCIÓN EXPLÍCITA", /EXCEPCION/],
];

function signals(text: string) {
  const v = canon(text);
  return REVIEW_PATTERNS.filter(([, re]) => re.test(v)).map(([label]) => label);
}

/** La primera entrada de OBSERVACIONES es la gestión más reciente. */
function latestNote(raw: string) {
  const first = clean(raw).split(/\/{2,}|\|/)[0]?.trim() ?? "";
  return first.length > 160 ? `${first.slice(0, 157)}…` : first;
}

/* ------------------------------------------------------- sheet selection */

export function selectRuntimeSheets(sheets: SheetMeta[], today: string): SheetSelection {
  const included: SheetRole[] = [];
  const excluded: SheetSelection["excluded"] = [];
  const currentMonth = today.slice(0, 7);

  const monthOf = (token: string) => {
    const mm = MONTHS[canon(token).replace(/[^A-Z]/g, "")];
    return mm ? `${RUNTIME_SCOPE.workbookYear}-${mm}` : null;
  };
  const inWindow = (month: string) =>
    month >= RUNTIME_SCOPE.start.slice(0, 7) && month <= currentMonth;

  for (const sheet of sheets) {
    const title = sheet.title;
    const t = canon(title).replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

    if (sheet.hidden) {
      excluded.push({ title, reason: "Hoja oculta (respaldo)" });
      continue;
    }
    if (t === "BASE GENERAL") {
      included.push({ role: "BASE", title });
      continue;
    }
    if (/PRELIMINAR|RESP_|AUDITORIA|CATALOGO|EQUIVALENCIAS|PRUEBA_|FLUJO|MIGRACION|FREE PANEL|RESUMEN|CONTROL OPERATIVO|ACTIVOS \(/.test(t)) {
      excluded.push({ title, reason: "Derivada, auditoría, catálogo o respaldo: no es fuente operativa diaria" });
      continue;
    }

    let m = t.match(/^(ZELLE|PAYPAL|TRANSF)\s*\(([A-Z]+)\)$/);
    if (m) {
      const month = monthOf(m[2]);
      const method: PaymentMethod = m[1] === "TRANSF" ? "TRANSFERENCIA" : (m[1] as PaymentMethod);
      if (month && inWindow(month)) included.push({ role: "PAGO", title, month, method });
      else excluded.push({ title, reason: month ? "Fuera de ventana 2026-06 → presente" : "Mes no reconocido" });
      continue;
    }

    m = t.match(/^CONTROL\s*\(([A-Z]+)\)\s*P([123])$/) ?? t.match(/^CONTROL\s+([A-Z]+)\s*\(P([123])\)$/);
    if (m) {
      const month = monthOf(m[1]);
      if (month && inWindow(month)) included.push({ role: "PANEL", title, month, panel: `P${m[2]}` as PanelId });
      else excluded.push({ title, reason: month ? "Fuera de ventana 2026-06 → presente" : "Mes no reconocido" });
      continue;
    }

    m = t.match(/^PAGOS[ _]([A-Z]+)(?: \d{4})?$/);
    if (m) {
      const month = monthOf(m[1]);
      if (month && inWindow(month)) included.push({ role: "CARTERA", title, month });
      else excluded.push({ title, reason: month ? "Fuera de ventana 2026-06 → presente" : "Mes no reconocido" });
      continue;
    }

    excluded.push({ title, reason: "Sin rol operativo reconocido" });
  }

  return { included, excluded };
}

/* ---------------------------------------------------------- normalizers */

export function normalizePayments(title: string, month: string, method: PaymentMethod, rows: unknown[][]) {
  const payments: PaymentRecord[] = [];
  const openInvoices: RuntimeReadModel["payments"]["openInvoices"] = [];
  const h = headerIndex(rows, ["TC", "CLIENTE"]);
  if (h < 0) return { payments, openInvoices, error: "Encabezado TC/CLIENTE no encontrado" };
  const col = columns(rows[h]);
  const c = {
    tc: col("TC"),
    client: col("CLIENTE"),
    key: col("CLIENTE_KEY"),
    date: method === "PAYPAL" ? col("FECHA DE RECIBIDO") : col("FECHA"),
    created: col("FECHA DE CREACION"),
    amountRaw: method === "PAYPAL" ? col("MONTO RECIBIDO") : method === "ZELLE" ? col("MONTO RECIBIDO") : null,
    usd: col("USD"),
    cad: col("CAD"),
    cop: col("VALOR EN PESOS"),
    channel: col("MEDIO DE PAGO"),
    currency: col("MONEDA_PAGO"),
    value: col("VALOR_PAGO"),
    confirmation: col("CONFIRMACION"),
    advisor: col("ASESOR"),
    origin: col("ORIGEN"),
    note: col("OBSERVACION"),
    link: col("ESTADO_ENLACE"),
    tariff: col("VALIDACION_TARIFA"),
    proposal: col("ESTADO_PROPUESTA"),
    gate: col("GATE_CAMBIO_PLAN"),
  };

  for (let i = h + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    if (at(row, c.tc) !== "1") continue;
    const client = at(row, c.client);
    if (!client) continue;
    const date = parseDate(at(row, c.date));

    // PayPal: factura creada sin fecha de recibido = cobro abierto, no recaudo.
    if (method === "PAYPAL" && !date) {
      openInvoices.push({
        sheet: title,
        row: i + 1,
        client,
        amount: parseAmount(at(row, c.amountRaw)) ?? 0,
        created: parseDate(at(row, c.created)),
        note: latestNote(at(row, c.note)),
      });
      continue;
    }

    let currency: Currency = "USD";
    let amount: number | null = null;
    const canonicalCurrency = canon(at(row, c.currency));
    const canonicalValue = parseAmount(at(row, c.value));
    if ((canonicalCurrency === "USD" || canonicalCurrency === "COP" || canonicalCurrency === "CAD") && canonicalValue && canonicalValue > 0) {
      currency = canonicalCurrency;
      amount = canonicalValue;
    } else if (method === "TRANSFERENCIA") {
      const usd = parseAmount(at(row, c.usd));
      const cad = parseAmount(at(row, c.cad));
      const cop = parseAmount(at(row, c.cop));
      if (usd && usd > 0) amount = usd;
      else if (cad && cad > 0) [currency, amount] = ["CAD", cad];
      else if (cop && cop > 0) [currency, amount] = ["COP", cop];
    } else {
      amount = parseAmount(at(row, c.amountRaw));
    }
    if (!amount || amount <= 0) continue;

    const reasons = [
      canon(at(row, c.proposal)) === "REQUIERE DECISION" ? "Propuesta requiere decisión" : "",
      canon(at(row, c.gate)) === "REQUIERE DECISION" ? "Cambio de plan por decidir" : "",
      /SIN COINCIDENCIA/.test(canon(at(row, c.tariff))) ? "Tarifa sin coincidencia" : "",
      canon(at(row, c.link)) === "SIN BASE" ? "Pago sin ficha en BASE GENERAL" : "",
    ].filter(Boolean);

    payments.push({
      sheet: title,
      row: i + 1,
      month,
      method,
      channel: method === "TRANSFERENCIA" ? at(row, c.channel) || "TRANSFERENCIA" : method,
      date,
      client,
      clientKey: clientKey(at(row, c.key) || client),
      currency,
      amount,
      confirmation: normalizeConfirmation(at(row, c.confirmation)),
      advisor: canon(at(row, c.advisor)),
      origin: at(row, c.origin),
      needsDecision: reasons.length > 0,
      decisionReason: reasons.join(" · "),
    });
  }
  return { payments, openInvoices, error: null };
}

export function normalizePanel(title: string, panel: PanelId, rows: unknown[][], today: string): PanelSummary {
  const summary: PanelSummary = {
    panel,
    sheet: title,
    panelName: "",
    openingBalance: null,
    creditsByField: 0,
    creditsByBalance: 0,
    difference: 0,
    currentBalance: null,
    purchases: [],
    processed: 0,
    released: 0,
    unassigned: 0,
    scheduledPending: 0,
    scheduledToday: 0,
    byAdvisor: {},
    exceptions: [],
  };
  const h = headerIndex(rows, ["TC", "RECARGA", "CREDITO"]);
  if (h < 0) {
    summary.exceptions.push({ row: 0, type: "ESTRUCTURA", detail: "Encabezado TC/RECARGA/CREDITO no encontrado" });
    return summary;
  }
  const col = columns(rows[h]);
  const c = {
    advisor: col("ASESOR"),
    recharge: col("RECARGA"),
    user: col("USUARIO"),
    panel: col("PANEL"),
    date: col("FECHA"),
    credit: col("CREDITO"),
  };
  const balanceCol = c.credit == null ? null : c.credit + 1;
  summary.openingBalance = parseAmount(at(rows[h], balanceCol));
  let previous = summary.openingBalance;

  for (let i = h + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const recharge = canon(at(row, c.recharge));
    const user = at(row, c.user);
    const date = parseDate(at(row, c.date));
    if (!summary.panelName && at(row, c.panel)) summary.panelName = at(row, c.panel);

    if (!recharge) {
      if (user && date) {
        summary.scheduledPending += 1;
        if (date === today) summary.scheduledToday += 1;
      }
      continue;
    }

    const balance = parseAmount(at(row, balanceCol));
    if (recharge.startsWith("COMPRA")) {
      if (balance != null) summary.purchases.push({ row: i + 1, previousBalance: previous, newBalance: balance });
      previous = balance ?? previous;
      continue;
    }

    summary.processed += 1;
    if (/LIBERADO/.test(recharge)) summary.released += 1;
    if (/SIN ASIG/.test(recharge)) summary.unassigned += 1;
    const credit = parseAmount(at(row, c.credit)) ?? 0;
    summary.creditsByField += credit;
    if (credit > 0) {
      const advisor = canon(at(row, c.advisor)) || "SIN ASESOR";
      summary.byAdvisor[advisor] = (summary.byAdvisor[advisor] ?? 0) + credit;
    }
    if (balance != null) {
      if (previous != null) {
        const drop = previous - balance;
        if (drop > 0) summary.creditsByBalance += drop;
        if (drop < 0) summary.exceptions.push({ row: i + 1, type: "SALDO_SUBE_SIN_COMPRA", detail: `${previous} → ${balance}` });
        if (drop !== credit && drop >= 0) {
          summary.exceptions.push({ row: i + 1, type: "CREDITO_VS_SALDO", detail: `CREDITO ${credit} · saldo ${previous} → ${balance}` });
        }
      }
      previous = balance;
      summary.currentBalance = balance;
    } else if (credit > 0) {
      summary.exceptions.push({ row: i + 1, type: "SALDO_VACIO", detail: "Recarga sin saldo registrado" });
    }
  }
  summary.difference = summary.creditsByBalance - summary.creditsByField;
  return summary;
}

function normalizeCartera(title: string, rows: unknown[][], today: string) {
  const items: CarteraItem[] = [];
  const exceptions: RuntimeReadModel["operations"]["exceptions"] = [];
  let sheetDeclaredTotal: number | null = null;
  const h = headerIndex(rows, ["TC", "CLIENTE", "F. PRÓXIMO PAGO"]);
  if (h < 0) return { items, exceptions: [{ sheet: title, row: 0, type: "ESTRUCTURA", detail: "Encabezado no encontrado" }], sheetDeclaredTotal };
  const col = columns(rows[h]);
  const c = {
    tc: col("TC"),
    client: col("CLIENTE"),
    status: col("ESTADO"),
    note: col("OBSERVACIONES"),
    plan: col("PLAN ACTIVO"),
    usd: col("USD"),
    cop: col("COP"),
    method: col("MÉTODO DE PAGO"),
    panel: col("PANEL"),
    due: col("F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"),
    referral: col("REFERIDO"),
    key: col("CLIENTE_KEY_PAGO"),
    fin: col("ESTADO_FINANCIERO"),
    finSource: col("FUENTE_FINANCIERA"),
    finRow: col("FILA_FUENTE"),
    payDate: col("FECHA_PAGO"),
    payCurrency: col("MONEDA_PAGO"),
    payValue: col("VALOR_PAGO"),
    gateReason: col("MOTIVO_GATE_FINANCIERO"),
  };

  for (let i = h + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const client = at(row, c.client);
    if (!client) continue;
    if (/^TOTAL VENCIMIENTOS/.test(canon(client))) {
      sheetDeclaredTotal = parseAmount(at(row, c.tc));
      continue;
    }
    if (/^(TOTAL|SEMANA)/.test(canon(client)) || at(row, c.tc) !== "1") continue;

    const dueDate = parseDate(at(row, c.due));
    const fin = canon(at(row, c.fin));
    let state: CarteraState;
    if (fin === "VALIDADO") state = "PAGADO_VALIDADO";
    else if (fin === "REQUIERE DECISION") state = "PAGADO_REQUIERE_DECISION";
    else if (fin === "PENDIENTE CONFIRMACION") state = "PAGO_POR_CONFIRMAR";
    else if (fin === "SIN PAGO") state = "SIN_PAGO";
    else {
      state = "EXCEPCION_ESTRUCTURA";
      exceptions.push({ sheet: title, row: i + 1, type: "FILA_DESALINEADA", detail: `${client}: ESTADO_FINANCIERO="${at(row, c.fin)}"` });
    }

    const nominal = emptyMoney();
    const usd = parseAmount(at(row, c.usd));
    const cop = parseAmount(at(row, c.cop));
    if (usd) addMoney(nominal, "USD", usd);
    if (cop) addMoney(nominal, "COP", cop);

    const itemSignals = signals([at(row, c.status), at(row, c.note), at(row, c.referral)].join(" | "));
    const overdue = state === "SIN_PAGO" && !!dueDate && dueDate < today;
    const dueToday = !!dueDate && dueDate === today;
    const payCurrency = canon(at(row, c.payCurrency));

    let nextAction: string;
    switch (state) {
      case "PAGADO_VALIDADO":
        nextAction = "Sin acción: pago validado";
        break;
      case "PAGADO_REQUIERE_DECISION":
        nextAction = `Decidir: ${at(row, c.gateReason) || "revisar tarifa/enlace"}`;
        break;
      case "PAGO_POR_CONFIRMAR":
        nextAction = `Confirmar pago en ${at(row, c.finSource) || "fuente"}${at(row, c.finRow) ? ` fila ${at(row, c.finRow)}` : ""}`;
        break;
      case "SIN_PAGO":
        nextAction = itemSignals.includes("POSIBLE NO RENOVACIÓN")
          ? "Decidir: cliente reporta no renovación"
          : overdue
            ? "Gestionar cobro vencido"
            : dueToday
              ? "Cobrar hoy"
              : "Cobro programado";
        break;
      default:
        nextAction = "Corregir fila en la hoja de cartera";
    }

    items.push({
      row: i + 1,
      client,
      clientKey: clientKey(at(row, c.key) || client),
      status: at(row, c.status),
      plan: at(row, c.plan),
      panel: canon(at(row, c.panel)),
      method: canon(at(row, c.method)),
      nominal,
      dueDate,
      week: dueDate ? weekBucket(dueDate) : null,
      state,
      overdue,
      dueToday,
      paymentSource: [at(row, c.finSource), at(row, c.finRow)].filter(Boolean).join("!"),
      paymentDate: parseDate(at(row, c.payDate)),
      paymentAmount: parseAmount(at(row, c.payValue)),
      paymentCurrency: payCurrency === "USD" || payCurrency === "COP" || payCurrency === "CAD" ? payCurrency : null,
      advisor: "",
      signals: itemSignals,
      nextAction,
      note: latestNote(at(row, c.note)),
    });
  }
  return { items, exceptions, sheetDeclaredTotal };
}

/* ------------------------------------------------------------ builder */

const ACTIVE = new Set(["AL DIA", "POR VENCER"]);

function ev(source: string, field: string, rule: string, calculation: string, status: Evidence["status"] = "VALIDADO"): Evidence {
  return { source, field, rule, calculation, status };
}

export function buildRuntimeReadModel(input: {
  sheets: SheetMeta[];
  values: SheetValues;
  today: string;
  generatedAt?: string;
}): RuntimeReadModel {
  const { today } = input;
  const currentMonth = today.slice(0, 7);
  const selection = selectRuntimeSheets(input.sheets, today);
  const roles = selection.included;
  const decisions: string[] = [];
  const operationsExceptions: RuntimeReadModel["operations"]["exceptions"] = [];

  /* Pagos */
  const allPayments: PaymentRecord[] = [];
  const openInvoices: RuntimeReadModel["payments"]["openInvoices"] = [];
  for (const r of roles) {
    if (r.role !== "PAGO") continue;
    const out = normalizePayments(r.title, r.month, r.method, input.values[r.title] ?? []);
    if (out.error) operationsExceptions.push({ sheet: r.title, row: 0, type: "ESTRUCTURA", detail: out.error });
    // Solo filas cuya fecha cae en la ventana; filas sin fecha se asignan al mes de la hoja.
    for (const p of out.payments) {
      if (p.date && p.date < RUNTIME_SCOPE.start) continue;
      allPayments.push(p);
    }
    if (r.month === currentMonth) openInvoices.push(...out.openInvoices);
  }
  const monthPayments = allPayments.filter((p) => p.month === currentMonth);

  const methodTotals = Object.fromEntries(
    (["ZELLE", "PAYPAL", "TRANSFERENCIA"] as PaymentMethod[]).map((m) => [
      m,
      { count: 0, confirmed: emptyMoney(), pending: emptyMoney(), review: emptyMoney(), unconfirmed: emptyMoney() },
    ]),
  ) as RuntimeReadModel["payments"]["totals"];
  const collectedMonth = emptyMoney();
  const receivedMonth = emptyMoney();
  const collectedToday = emptyMoney();
  const toConfirm = emptyMoney();
  let toConfirmCount = 0;
  const weekly = WEEK_LABELS.map((label, idx) => ({ week: idx + 1, label, collected: emptyMoney(), due: 0 }));

  for (const p of monthPayments) {
    const t = methodTotals[p.method];
    t.count += 1;
    addMoney(receivedMonth, p.currency, p.amount);
    if (p.confirmation === "CONFIRMADO") {
      addMoney(t.confirmed, p.currency, p.amount);
      addMoney(collectedMonth, p.currency, p.amount);
      if (p.date === today) addMoney(collectedToday, p.currency, p.amount);
      if (p.date) addMoney(weekly[weekBucket(p.date) - 1].collected, p.currency, p.amount);
    } else {
      toConfirmCount += 1;
      addMoney(toConfirm, p.currency, p.amount);
      if (p.confirmation === "PENDIENTE") addMoney(t.pending, p.currency, p.amount);
      else if (p.confirmation === "REVISION") addMoney(t.review, p.currency, p.amount);
      else addMoney(t.unconfirmed, p.currency, p.amount);
    }
  }

  const monthly = [...new Set(allPayments.map((p) => p.month))].sort().map((month) => {
    const registered = emptyMoney();
    const confirmed = emptyMoney();
    let payments = 0;
    let confirmedPayments = 0;
    for (const p of allPayments.filter((x) => x.month === month)) {
      payments += 1;
      addMoney(registered, p.currency, p.amount);
      if (p.confirmation === "CONFIRMADO") {
        confirmedPayments += 1;
        addMoney(confirmed, p.currency, p.amount);
      }
    }
    return { month, registered, confirmed, payments, confirmedPayments };
  });

  /* Paneles (mes en curso) */
  const panels: RuntimeReadModel["panels"] = { P1: null, P2: null, P3: null };
  for (const r of roles) {
    if (r.role === "PANEL" && r.month === currentMonth) {
      panels[r.panel] = normalizePanel(r.title, r.panel, input.values[r.title] ?? [], today);
    }
  }
  for (const id of ["P1", "P2", "P3"] as PanelId[]) {
    if (!panels[id]) decisions.push(`Panel ${id}: no existe hoja CONTROL del mes ${currentMonth}.`);
  }
  decisions.push("Costo por panel: las hojas CONTROL registran créditos pero no precio por crédito. Definir valor unitario por panel para calcular costo.");

  /* Cartera del mes */
  const carteraRole = roles.find((r) => r.role === "CARTERA" && r.month === currentMonth);
  let items: CarteraItem[] = [];
  if (carteraRole) {
    const out = normalizeCartera(carteraRole.title, input.values[carteraRole.title] ?? [], today);
    items = out.items;
    operationsExceptions.push(...out.exceptions);
    if (out.sheetDeclaredTotal != null && out.sheetDeclaredTotal !== items.length) {
      operationsExceptions.push({
        sheet: carteraRole.title,
        row: 0,
        type: "TOTAL_HOJA_DIFIERE",
        detail: `La hoja declara ${out.sheetDeclaredTotal} fichas; filas TC=1 leídas: ${items.length}`,
      });
    }
  } else {
    decisions.push(`No existe hoja PAGOS de ${currentMonth}: cartera del mes no calculable.`);
  }

  // Asesor responsable: enlace explícito FUENTE_FINANCIERA!FILA_FUENTE → hoja de pago del mes.
  const paymentByRef = new Map<string, PaymentRecord>();
  for (const p of monthPayments) {
    // FILA_FUENTE es la fila absoluta de la hoja de pago (ej. ZELLE!4 = fila 4 de ZELLE (OCT)).
    paymentByRef.set(`${p.method}!${p.row}`, p);
  }
  const lastPaymentByKey = new Map<string, PaymentRecord>();
  for (const p of allPayments) {
    const prev = lastPaymentByKey.get(p.clientKey);
    if (!prev || (p.date ?? "") >= (prev.date ?? "")) lastPaymentByKey.set(p.clientKey, p);
  }
  for (const it of items) {
    const linked = paymentByRef.get(canon(it.paymentSource));
    const fallback = monthPayments.find((p) => p.clientKey === it.clientKey);
    it.advisor = (linked ?? fallback)?.advisor ?? "";
  }

  const portfolioStates = {
    PAGADO_VALIDADO: { count: 0, nominal: emptyMoney() },
    PAGADO_REQUIERE_DECISION: { count: 0, nominal: emptyMoney() },
    PAGO_POR_CONFIRMAR: { count: 0, nominal: emptyMoney() },
    SIN_PAGO: { count: 0, nominal: emptyMoney() },
    EXCEPCION_ESTRUCTURA: { count: 0, nominal: emptyMoney() },
  } satisfies Record<CarteraState, { count: number; nominal: Money }>;
  const portfolioNominal = emptyMoney();
  const pendingValue = emptyMoney();
  for (const it of items) {
    const s = portfolioStates[it.state];
    s.count += 1;
    for (const cur of ["USD", "COP", "CAD"] as Currency[]) {
      addMoney(s.nominal, cur, it.nominal[cur]);
      addMoney(portfolioNominal, cur, it.nominal[cur]);
      if (it.state === "SIN_PAGO") addMoney(pendingValue, cur, it.nominal[cur]);
    }
    if (it.week) weekly[it.week - 1].due += 1;
  }
  const paid = portfolioStates.PAGADO_VALIDADO.count + portfolioStates.PAGADO_REQUIERE_DECISION.count + portfolioStates.PAGO_POR_CONFIRMAR.count;
  const decisionCases =
    portfolioStates.PAGADO_REQUIERE_DECISION.count +
    items.filter((i) => i.state === "SIN_PAGO" && i.signals.includes("POSIBLE NO RENOVACIÓN")).length +
    portfolioStates.EXCEPCION_ESTRUCTURA.count;

  /* Clientes — BASE GENERAL */
  const base = input.values[roles.find((r) => r.role === "BASE")?.title ?? "BASE GENERAL"] ?? [];
  const bh = headerIndex(base, ["TC", "CLIENTE", "ESTADO"]);
  const clientErrors: RuntimeReadModel["clients"]["errors"] = [];
  const clientStates: Record<string, number> = {};
  const plans = new Map<string, number>();
  const clientIndex: ClientCard[] = [];
  let totalRows = 0;
  let inScope = 0;
  let active = 0;
  let pendingRenewal = 0;
  let inactive = 0;
  let excludedTc0 = 0;
  const carteraByKey = new Map(items.map((i) => [i.clientKey, i]));

  if (bh >= 0) {
    const col = columns(base[bh]);
    const c = {
      tc: col("TC"),
      client: col("CLIENTE"),
      status: col("ESTADO"),
      note: col("OBSERVACIONES"),
      plan: col("PLAN ACTIVO"),
      canonicalPlan: col("VALOR_CANONICO"),
      method: col("MÉTODO DE PAGO"),
      panel: col("PANEL"),
      last: col("F.ULTIMO PAGO"),
      next: col("F. PRÓXIMO PAGO", "F.PRÓXIMO PAGO"),
      key: col("CLIENTE_KEY"),
    };
    const seen = new Map<string, number>();
    for (let i = bh + 1; i < base.length; i++) {
      const row = base[i] ?? [];
      const name = at(row, c.client);
      if (!name) continue;
      const tc = at(row, c.tc);
      if (tc === "0") {
        excludedTc0 += 1;
        continue;
      }
      if (tc !== "1") continue;
      totalRows += 1;
      const last = parseDate(at(row, c.last));
      const next = parseDate(at(row, c.next));
      if (at(row, c.next) && !next) clientErrors.push({ row: i + 1, type: "FECHA_PROXIMO_PAGO_INVALIDA", detail: `${name}: "${at(row, c.next)}"` });
      const relevant = (last ?? "") >= RUNTIME_SCOPE.start || (next ?? "") >= RUNTIME_SCOPE.start;
      if (!relevant) continue;
      inScope += 1;

      const key = clientKey(at(row, c.key) || name);
      if (seen.has(key)) clientErrors.push({ row: i + 1, type: "FICHA_DUPLICADA", detail: `${name} (también fila ${seen.get(key)})` });
      else seen.set(key, i + 1);

      const status = canon(at(row, c.status)) || "SIN ESTADO";
      clientStates[status] = (clientStates[status] ?? 0) + 1;
      if (ACTIVE.has(status)) {
        active += 1;
        if (status === "POR VENCER") pendingRenewal += 1;
        const plan = canon(at(row, c.canonicalPlan) || at(row, c.plan)) || "SIN PLAN";
        plans.set(plan, (plans.get(plan) ?? 0) + 1);
      } else if (status === "VENCIDO") inactive += 1;
      else clientErrors.push({ row: i + 1, type: "ESTADO_NO_RECONOCIDO", detail: `${name}: "${at(row, c.status)}"` });

      const cartera = carteraByKey.get(key) ?? null;
      const lp = lastPaymentByKey.get(key);
      const balance = emptyMoney();
      if (cartera?.state === "SIN_PAGO") for (const cur of ["USD", "COP", "CAD"] as Currency[]) balance[cur] = cartera.nominal[cur];
      clientIndex.push({
        baseRow: i + 1,
        key,
        name,
        status: at(row, c.status) || "Sin estado",
        plan: at(row, c.canonicalPlan) || at(row, c.plan),
        panel: at(row, c.panel),
        method: at(row, c.method),
        nextPayment: next,
        lastPayment: lp?.date ?? last,
        lastPaymentDetail: lp
          ? `${lp.currency} ${lp.amount} · ${lp.channel} · ${lp.confirmation === "CONFIRMADO" ? "confirmado" : lp.confirmation.toLowerCase().replace("_", " ")}`
          : last
            ? "Según F.ULTIMO PAGO (sin registro en hojas de pago jun→hoy)"
            : "Sin registro",
        balance,
        balanceRule: cartera
          ? cartera.state === "SIN_PAGO"
            ? `Vencimiento ${currentMonth} sin pago (${carteraRole?.title})`
            : `Vencimiento ${currentMonth}: ${cartera.state.replace(/_/g, " ").toLowerCase()}`
          : `Sin vencimiento en ${currentMonth}`,
        advisor: cartera?.advisor || lp?.advisor || "",
        note: cartera?.nextAction && cartera.state !== "PAGADO_VALIDADO" ? cartera.nextAction : latestNote(at(row, c.note)),
        carteraState: cartera?.state ?? null,
      });
    }
  } else {
    decisions.push("BASE GENERAL: encabezado TC/CLIENTE/ESTADO no encontrado.");
  }

  decisions.push("Meta del día: ninguna hoja vigente define meta diaria (PAGOS del mes indica «NO META»). Definir meta para habilitar % cumplimiento vs meta.");
  decisions.push("Proyección de cierre: no existe regla de proyección aprobada.");
  decisions.push("Conversión de moneda: recaudo se reporta separado por USD / COP / CAD; no existe tasa oficial definida para consolidar en una sola moneda.");
  decisions.push("Clientes desactivados: se usa ESTADO=Vencido en fichas TC=1 con actividad desde 2026-06-01. Confirmar si TC=0 equivale a baja definitiva.");

  const source = (role: SheetRole["role"]) =>
    roles.filter((r) => r.role === role && ("month" in r ? r.month === currentMonth : true)).map((r) => r.title).join(", ") || "—";

  const advisors = [...new Set(items.map((i) => i.advisor).filter(Boolean))].sort();

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    today,
    currentMonth,
    scope: { ...RUNTIME_SCOPE, end: today },
    sources: selection,
    management: {
      collectedToday: { value: collectedToday, evidence: ev(source("PAGO"), "FECHA / VALOR_PAGO / CONFIRMACION", "CONFIRMACION=CONFIRMADO y FECHA=hoy", "Σ VALOR_PAGO por moneda") },
      collectedMonth: { value: collectedMonth, evidence: ev(source("PAGO"), "VALOR_PAGO / MONEDA_PAGO / CONFIRMACION", "TC=1, CONFIRMACION=CONFIRMADO, hoja del mes en curso", "Σ por moneda") },
      receivedMonth: { value: receivedMonth, evidence: ev(source("PAGO"), "VALOR_PAGO / MONEDA_PAGO", "TC=1 con monto > 0 (cualquier confirmación)", "Σ por moneda") },
      pendingToCollect: { value: pendingValue, evidence: ev(carteraRole?.title ?? "—", "ESTADO_FINANCIERO / USD / COP", "ESTADO_FINANCIERO=SIN PAGO", "Σ valor nominal de la ficha", carteraRole ? "VALIDADO" : "REQUIERE_DECISION") },
      portfolioNominal: { value: portfolioNominal, evidence: ev(carteraRole?.title ?? "—", "USD / COP", "Fichas TC=1 con F. PRÓXIMO PAGO en el mes", "Σ valor nominal", carteraRole ? "VALIDADO" : "REQUIERE_DECISION") },
      coverage: {
        value: { paid, total: items.length, pct: items.length ? Math.round((paid / items.length) * 1000) / 10 : 0 },
        evidence: ev(carteraRole?.title ?? "—", "ESTADO_FINANCIERO", "Fichas con pago registrado (validado, por decidir o por confirmar) / fichas del mes", "conteo / conteo"),
      },
      paymentsToConfirm: { value: { count: toConfirmCount, amount: toConfirm }, evidence: ev(source("PAGO"), "CONFIRMACION", "CONFIRMACION ≠ CONFIRMADO (pendiente, revisión o vacío)", "conteo y Σ por moneda") },
      decisionCases: { value: decisionCases, evidence: ev(carteraRole?.title ?? "—", "ESTADO_FINANCIERO / OBSERVACIONES", "REQUIERE DECISIÓN + SIN PAGO con señal de no renovación + filas desalineadas", "conteo") },
      activeClients: { value: active, evidence: ev("BASE GENERAL", "TC / ESTADO / F.ULTIMO PAGO / F. PRÓXIMO PAGO", "TC=1, ESTADO ∈ {Al dia, Por vencer}, actividad ≥ 2026-06-01", "conteo") },
      inactiveClients: { value: inactive, evidence: ev("BASE GENERAL", "TC / ESTADO", "TC=1, ESTADO=Vencido, actividad ≥ 2026-06-01", "conteo", "PARCIAL") },
      dailyTarget: { value: null, evidence: ev("—", "—", "Sin meta diaria definida en fuentes vigentes", "—", "REQUIERE_DECISION") },
      projection: { value: null, evidence: ev("—", "—", "Sin regla de proyección aprobada", "—", "REQUIERE_DECISION") },
      byMethod: {
        value: (Object.keys(methodTotals) as PaymentMethod[]).map((method) => ({
          method,
          count: methodTotals[method].count,
          confirmed: methodTotals[method].confirmed,
          pending: methodTotals[method].pending,
          review: methodTotals[method].review,
        })),
        evidence: ev(source("PAGO"), "VALOR_PAGO / CONFIRMACION", "Hoja ZELLE/PAYPAL/TRANSF del mes en curso", "Σ por método y moneda"),
      },
      weekly: { value: weekly, evidence: ev(`${source("PAGO")} · ${carteraRole?.title ?? "—"}`, "FECHA / F. PRÓXIMO PAGO", "Semanas 01–04, 05–11, 12–18, 19–25, 26–fin", "Σ recaudo confirmado y conteo de vencimientos") },
      monthly: { value: monthly, evidence: ev("ZELLE/PAYPAL/TRANSF (jun→hoy)", "VALOR_PAGO o MONTO / CONFIRMACION", "Ventana 2026-06-01 → hoy", "Σ por mes y moneda", "PARCIAL") },
      portfolioStates: { value: portfolioStates, evidence: ev(carteraRole?.title ?? "—", "ESTADO_FINANCIERO", "Estado financiero explícito de la hoja", "conteo y Σ nominal") },
      plans: {
        value: [...plans.entries()].map(([plan, n]) => ({ plan, active: n })).sort((a, b) => b.active - a.active),
        evidence: ev("BASE GENERAL", "VALOR_CANONICO / PLAN ACTIVO", "Clientes activos en ventana", "conteo por plan"),
      },
      clientStates: { value: clientStates, evidence: ev("BASE GENERAL", "ESTADO", "TC=1 con actividad ≥ 2026-06-01", "conteo por estado") },
    },
    clients: {
      totalRows,
      inScope,
      active,
      pendingRenewal,
      inactive,
      excludedTc0,
      withError: clientErrors.length,
      errors: clientErrors,
    },
    payments: { month: monthPayments, totals: methodTotals, openInvoices },
    panels,
    operations: {
      advisors,
      items,
      dueToday: items.filter((i) => i.dueToday).length,
      overdue: items.filter((i) => i.overdue).length,
      pendingValue,
      exceptions: operationsExceptions,
    },
    clientIndex: clientIndex.sort((a, b) => a.name.localeCompare(b.name, "es")),
    decisions,
  };
}
