/**
 * TiviPlay · Gate de sincronización (preview, SOLO LECTURA)
 *
 *   VENTAS → FINANCIERO → SERVICIO → MATCH → BASE GENERAL
 *
 * Reglas tomadas exclusivamente de fuentes vigentes:
 *   - TIVIPLAY_CONTRATO_OPERATIVO_S0 v0.2 (S0-A, S0-D, S0-E, regla T → ESTADO).
 *   - Columnas de propuesta ya calculadas en las hojas de pago
 *     (PROP_F_ULTIMO, PROP_F_PROXIMO, PROP_T, PROP_ESTADO, ESTADO_PROPUESTA, TIPO_CAMBIO).
 *   - Identidad canónica: USUARIO de panel ↔ BASE GENERAL (TC=1) y FILA_BASE explícita en las hojas de pago.
 * Todo lo que no tenga regla explícita queda como REQUIERE_DECISION. Nada se escribe en Google Sheets.
 */

import { RUNTIME_SCOPE, canon, clean, clientKey, parseAmount, parseDate, type SheetMeta, type SheetValues } from "@/server/tiviplay-live/runtime-read-model";

/* ------------------------------------------------------------------ tipos */

export type SaleType = "VENTA_NUEVA" | "REACTIVACION" | "CLIENTE_EXISTENTE" | "REQUIERE_DECISION";
export type SaleGate = "CONFIRMADO_JM" | "PENDIENTE_CONFIRMACION" | "DUPLICIDAD" | "LISTO_PARA_CONTINUAR" | "REQUIERE_DECISION" | "YA_EN_BASE";
export type FinancialState =
  | "COBRO_HOY"
  | "VENCIDO"
  | "PROGRAMADO"
  | "PAGO_REGISTRADO"
  | "PENDIENTE_CONFIRMACION_JM"
  | "CONFIRMADO_JM"
  | "REPROGRAMADO"
  | "REQUIERE_DECISION";
export type ServiceState =
  | "SERVICIO_HOY"
  | "CREDITO_PENDIENTE"
  | "PROGRAMADO"
  | "CREDITO_APLICADO"
  | "SERVICIO_VALIDADO"
  | "INCONSISTENCIA_CREDITOS"
  | "REQUIERE_DECISION";
export type BaseAction = "ALTA_NUEVA" | "REACTIVACION" | "RENOVACION" | "ACTUALIZACION" | "REQUIERE_DECISION";
export type SyncState = "LISTO_PARA_BASE" | "SINCRONIZADO" | "BLOQUEADO" | "EN_PROCESO";

export type Identity = {
  status: "IDENTIFICADO" | "NO_EN_BASE" | "AMBIGUO";
  baseRow: number | null;
  detail: string;
};

export type SaleItem = {
  id: string;
  sheet: string;
  row: number;
  month: string;
  client: string;
  concept: string;
  advisor: string;
  usuario: string;
  panel: string;
  plan: string;
  amount: string;
  method: string;
  type: SaleType;
  confirmation: "CONFIRMADO_JM" | "PENDIENTE_CONFIRMACION";
  confirmationSource: string;
  missing: string[];
  duplicate: boolean;
  identity: Identity;
  gate: SaleGate;
  reasons: string[];
  nextAction: string;
};

export type FinancialItem = {
  id: string;
  source: string;
  client: string;
  usuario: string;
  amount: string;
  method: string;
  date: string | null;
  advisor: string;
  state: FinancialState;
  reasons: string[];
  nextAction: string;
  identity: Identity;
  paymentRef: string;
  proposal: { fUltimo: string | null; fProximo: string | null; t: string; estado: string; validated: boolean; planChange: boolean } | null;
  inCartera: boolean;
  fromSale: boolean;
};

export type ServiceItem = {
  id: string;
  sheet: string;
  row: number;
  panel: "P1" | "P2" | "P3";
  usuario: string;
  client: string;
  recharge: string;
  creditsApplied: number | null;
  creditsRequired: string;
  date: string | null;
  advisor: string;
  state: ServiceState;
  reasons: string[];
  nextAction: string;
  identity: Identity;
};

export type FieldChange = { field: string; from: string; to: string };

export type SyncItem = {
  key: string;
  client: string;
  usuario: string;
  baseRow: number | null;
  action: BaseAction;
  state: SyncState;
  sale: string | null;
  financial: string | null;
  service: string | null;
  changes: FieldChange[];
  notApplied: string[];
  blockers: string[];
};

export type SyncModel = {
  readOnly: true;
  month: string;
  sources: { sales: string[]; financial: string[]; service: string[]; base: string };
  sales: SaleItem[];
  financial: FinancialItem[];
  service: ServiceItem[];
  sync: SyncItem[];
  exceptions: Array<{ layer: "VENTAS" | "FINANCIERO" | "SERVICIO" | "MATCH"; ref: string; client: string; reason: string }>;
  counts: { ventas: number; cobros: number; servicio: number; listoParaBase: number; excepciones: number };
  byState: {
    sales: Record<string, number>;
    financial: Record<string, number>;
    service: Record<string, number>;
    sync: Record<string, number>;
  };
  decisions: string[];
};

/* ---------------------------------------------------------------- helpers */

const MONTHS: Record<string, string> = {
  ENE: "01", ENERO: "01", FEB: "02", FEBRERO: "02", MAR: "03", MARZ: "03", MARZO: "03", ABR: "04", ABRIL: "04", MAY: "05", MAYO: "05",
  JUN: "06", JUNIO: "06", JUL: "07", JULIO: "07", AGO: "08", AGOSTO: "08", SEP: "09", SEPT: "09", SEPTIEMBRE: "09",
  OCT: "10", OCTUBRE: "10", NOV: "11", NOVIEMBRE: "11", DIC: "12", DICIEMBRE: "12",
};
/** Clave de columna: mayúsculas, sin tildes ni espacios ("F. PRÓXIMO PAGO" ≡ "F.PRÓXIMO PAGO"). */
const fk = (v: unknown) => canon(v).replace(/\s+/g, "");

const at = (row: unknown[] | undefined, i: number | null) => (i == null || !row ? "" : clean(row[i]));
export const userKey = (v: unknown) => canon(v).replace(/[^A-Z0-9]/g, "");

function header(rows: unknown[][], required: string[]) {
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const keys = (rows[i] ?? []).map(canon);
    if (required.every((r) => keys.includes(canon(r)))) {
      const map = new Map<string, number>();
      keys.forEach((k, j) => k && !map.has(k) && map.set(k, j));
      return { index: i, col: (...names: string[]) => names.map((n) => map.get(canon(n))).find((x) => x != null) ?? null };
    }
  }
  return null;
}

const count = <T extends string>(items: Array<{ state?: T; gate?: T }>, pick: (x: never) => T) =>
  items.reduce<Record<string, number>>((acc, it) => {
    const k = pick(it as never);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

/** Regla del contrato S0: T = días hasta F.PRÓXIMO PAGO; T ≥ 30 AL DIA, 1–29 POR VENCER, ≤ 0 VENCIDO. */
export function estadoPorT(fProximo: string, today: string) {
  const t = Math.round((Date.parse(`${fProximo}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  return { t, estado: t >= 30 ? "Al dia" : t >= 1 ? "Por vencer" : "Vencido" };
}

/* ---------------------------------------------------------- BASE GENERAL */

type BaseRow = { row: number; name: string; key: string; usuario: string; values: Record<string, string> };

function readBase(rows: unknown[][]) {
  const h = header(rows, ["TC", "CLIENTE", "USUARIO"]);
  const byUser = new Map<string, BaseRow[]>();
  const byName = new Map<string, BaseRow[]>();
  const byRow = new Map<number, BaseRow>();
  if (!h) return { byUser, byName, byRow, headers: [] as string[] };
  const headers = (rows[h.index] ?? []).map(clean);
  for (let i = h.index + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1" || !at(r, h.col("CLIENTE"))) continue;
    const values: Record<string, string> = {};
    headers.forEach((name, j) => name && !(fk(name) in values) && (values[fk(name)] = clean(r[j])));
    const b: BaseRow = { row: i + 1, name: at(r, h.col("CLIENTE")), key: clientKey(at(r, h.col("CLIENTE_KEY")) || at(r, h.col("CLIENTE"))), usuario: userKey(at(r, h.col("USUARIO"))), values };
    byRow.set(b.row, b);
    if (b.usuario) byUser.set(b.usuario, [...(byUser.get(b.usuario) ?? []), b]);
    byName.set(b.key, [...(byName.get(b.key) ?? []), b]);
  }
  return { byUser, byName, byRow, headers };
}

type Base = ReturnType<typeof readBase>;

function identify(base: Base, usuario: string, name: string, explicitRow?: number | null): Identity {
  if (explicitRow) {
    const b = base.byRow.get(explicitRow);
    if (!b) return { status: "AMBIGUO", baseRow: null, detail: `FILA_BASE ${explicitRow} no es una ficha TC=1` };
    const sameUser = usuario ? base.byUser.get(usuario) ?? [] : [];
    if (sameUser.length > 1) return { status: "AMBIGUO", baseRow: null, detail: `USUARIO repetido en BASE GENERAL (filas ${sameUser.map((x) => x.row).join(", ")})` };
    return { status: "IDENTIFICADO", baseRow: b.row, detail: `BASE GENERAL!${b.row} (FILA_BASE)` };
  }
  const u = usuario ? base.byUser.get(usuario) ?? [] : [];
  if (u.length === 1) return { status: "IDENTIFICADO", baseRow: u[0].row, detail: `BASE GENERAL!${u[0].row} (USUARIO)` };
  if (u.length > 1) return { status: "AMBIGUO", baseRow: null, detail: `USUARIO en ${u.length} fichas (filas ${u.map((x) => x.row).join(", ")})` };
  const n = base.byName.get(clientKey(name)) ?? [];
  if (n.length) return { status: "AMBIGUO", baseRow: null, detail: `Sin USUARIO coincidente; nombre coincide con fila(s) ${n.map((x) => x.row).join(", ")}` };
  return { status: "NO_EN_BASE", baseRow: null, detail: "Sin ficha en BASE GENERAL" };
}

/* -------------------------------------------------------- hoja de pagos */

type Payment = {
  ref: string;
  sheet: string;
  row: number;
  method: string;
  client: string;
  key: string;
  date: string | null;
  amount: string;
  advisor: string;
  origin: string;
  confirmation: string;
  baseRow: number | null;
  baseMatches: number | null;
  proposal: FinancialItem["proposal"];
  decision: string;
  received: boolean;
};

function readPayments(title: string, method: "ZELLE" | "PAYPAL" | "TRANSFERENCIA", rows: unknown[][]): Payment[] {
  const h = header(rows, ["TC", "CLIENTE"]);
  if (!h) return [];
  const out: Payment[] = [];
  for (let i = h.index + 1; i < rows.length; i++) {
    const r = rows[i] ?? [];
    if (at(r, h.col("TC")) !== "1" || !at(r, h.col("CLIENTE"))) continue;
    const date = parseDate(at(r, method === "PAYPAL" ? h.col("FECHA DE RECIBIDO") : h.col("FECHA")));
    const currency = canon(at(r, h.col("MONEDA_PAGO")));
    const value = at(r, h.col("VALOR_PAGO")) || at(r, h.col("MONTO RECIBIDO")) || at(r, h.col("USD"));
    const fila = parseAmount(at(r, h.col("FILA_BASE")));
    const matches = parseAmount(at(r, h.col("COINCIDENCIAS_BASE")));
    const propState = canon(at(r, h.col("ESTADO_PROPUESTA")));
    const fU = parseDate(at(r, h.col("PROP_F_ULTIMO")));
    const fP = parseDate(at(r, h.col("PROP_F_PROXIMO")));
    out.push({
      ref: `${method}!${i + 1}`,
      sheet: title,
      row: i + 1,
      method: method === "TRANSFERENCIA" ? at(r, h.col("MEDIO DE PAGO")) || "TRANSFERENCIA" : method,
      client: at(r, h.col("CLIENTE")),
      key: clientKey(at(r, h.col("CLIENTE_KEY")) || at(r, h.col("CLIENTE"))),
      date,
      amount: value ? `${currency || "USD"} ${value.replace(/^\$/, "")}` : "—",
      advisor: canon(at(r, h.col("ASESOR"))),
      origin: canon(at(r, h.col("ORIGEN"))),
      confirmation: canon(at(r, h.col("CONFIRMACION"))),
      baseRow: matches === 1 && fila ? fila : null,
      baseMatches: matches,
      proposal: fU || fP || propState
        ? {
            fUltimo: fU,
            fProximo: fP,
            t: at(r, h.col("PROP_T")),
            estado: at(r, h.col("PROP_ESTADO")),
            validated: propState === "VALIDADO",
            planChange: canon(at(r, h.col("TIPO_CAMBIO"))) === "CAMBIO PLAN",
          }
        : null,
      decision: [at(r, h.col("MOTIVO_PROPUESTA")), at(r, h.col("GATE_CAMBIO_PLAN"))].filter((x) => x && canon(x) !== "PROPUESTA CALCULADA" && canon(x) !== "VALIDADO").join(" · "),
      received: method !== "PAYPAL" || !!date,
    });
  }
  return out;
}

/* ------------------------------------------------------------- builder */

export function selectSalesSheets(sheets: SheetMeta[], today: string) {
  const current = today.slice(0, 7);
  const included: Array<{ title: string; month: string }> = [];
  const excluded: Array<{ title: string; reason: string }> = [];
  for (const s of sheets) {
    const t = canon(s.title);
    const m = t.match(/^(?:\(\d+\)\s*)?VENTAS[ _]([A-Z]+)$/);
    const mm = m ? MONTHS[m[1]] : undefined;
    if (s.hidden) excluded.push({ title: s.title, reason: "Hoja oculta" });
    else if (!m || !mm) excluded.push({ title: s.title, reason: "No es hoja mensual de ventas (pendientes, MIRA+, inactivos, reactivación histórica)" });
    else {
      const month = `${RUNTIME_SCOPE.workbookYear}-${mm}`;
      if (month >= RUNTIME_SCOPE.start.slice(0, 7) && month <= current) included.push({ title: s.title, month });
      else excluded.push({ title: s.title, reason: "Fuera de ventana 2026-06 → presente" });
    }
  }
  return { included, excluded };
}

const SALE_REQUIRED: Array<[string, string]> = [
  ["CLIENTE", "cliente"], ["TELEFONO", "teléfono"], ["CORREO", "correo"], ["PLAN ACTIVO", "plan"], ["PANTALLAS", "pantallas"],
  ["MÉTODO DE PAGO", "método"], ["F.ULTIMO PAGO", "F.ULTIMO PAGO"], ["F.PRÓXIMO PAGO", "F.PRÓXIMO PAGO"],
  ["USUARIO", "usuario"], ["CONTRASEÑA", "contraseña"], ["PANEL", "panel"], ["F.VENCIMIENTO", "F.VENCIMIENTO"],
];

export function buildSyncModel(input: {
  values: SheetValues;
  sheets: SheetMeta[];
  salesValues: SheetValues;
  salesSheets: SheetMeta[];
  today: string;
  salesError?: string | null;
}): SyncModel {
  const { today } = input;
  const month = today.slice(0, 7);
  const decisions: string[] = [];
  const exceptions: SyncModel["exceptions"] = [];
  const base = readBase(input.values["BASE GENERAL"] ?? []);

  // Hojas vigentes del mes en curso, reconocidas por patrón de nombre + token de mes.
  const norm = (t: string) => canon(t).replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  const monthOfToken = (tok: string) => MONTHS[tok.replace(/[^A-Z]/g, "")];
  const visible = input.sheets.filter((x) => !x.hidden);
  const find = (re: RegExp) => visible.find((x) => { const m = norm(x.title).match(re); return !!m && monthOfToken(m[1]) === month.slice(5); })?.title ?? null;
  const carteraTitle = find(/^PAGOS[ _]([A-Z]+)(?: \d{4})?$/);
  const payTitles = {
    ZELLE: find(/^ZELLE \(([A-Z]+)\)$/),
    PAYPAL: find(/^PAYPAL \(([A-Z]+)\)$/),
    TRANSFERENCIA: find(/^TRANSF \(([A-Z]+)\)$/),
  } as const;
  const panelTitles = (["1", "2", "3"] as const).map((p) => find(new RegExp(`^CONTROL\\s*\\(([A-Z]+)\\)\\s*P${p}$`)));

  /* ---------- FINANCIERO: pagos del mes */
  const payments = (Object.entries(payTitles) as Array<["ZELLE" | "PAYPAL" | "TRANSFERENCIA", string | null]>).flatMap(([m, t]) => (t ? readPayments(t, m, input.values[t] ?? []) : []));
  const paymentByRef = new Map(payments.map((p) => [p.ref, p]));
  const usedPayments = new Set<string>();
  const financial: FinancialItem[] = [];

  const finState = (p: Payment | undefined): { state: FinancialState; reasons: string[] } => {
    if (!p) return { state: "REQUIERE_DECISION", reasons: ["Pago enlazado no encontrado"] };
    if (!p.received) return { state: "REQUIERE_DECISION", reasons: ["Factura PayPal sin fecha de recibido"] };
    if (/REVISION/.test(p.confirmation)) return { state: "REQUIERE_DECISION", reasons: ["CONFIRMACION = REQUIERE REVISIÓN"] };
    if (/PENDIENTE/.test(p.confirmation)) return { state: "PENDIENTE_CONFIRMACION_JM", reasons: [] };
    if (/CONFIRMADO/.test(p.confirmation)) return { state: "CONFIRMADO_JM", reasons: [] };
    return { state: "PAGO_REGISTRADO", reasons: [] };
  };

  if (carteraTitle) {
    const rows = input.values[carteraTitle] ?? [];
    const h = header(rows, ["TC", "CLIENTE", "F. PRÓXIMO PAGO"]);
    if (h) {
      for (let i = h.index + 1; i < rows.length; i++) {
        const r = rows[i] ?? [];
        const client = at(r, h.col("CLIENTE"));
        if (!client || at(r, h.col("TC")) !== "1" || /^(TOTAL|SEMANA)/.test(canon(client))) continue;
        const fin = canon(at(r, h.col("ESTADO_FINANCIERO")));
        const ref = [canon(at(r, h.col("FUENTE_FINANCIERA"))), at(r, h.col("FILA_FUENTE"))].filter(Boolean).join("!");
        const payment = ref.includes("!") ? paymentByRef.get(ref) : undefined;
        if (payment) usedPayments.add(payment.ref);
        const due = parseDate(at(r, h.col("F. PRÓXIMO PAGO")));
        const usuario = userKey(at(r, h.col("USUARIO")));
        const identity = identify(base, usuario, client);
        let state: FinancialState;
        let reasons: string[] = [];
        const note = canon(at(r, h.col("OBSERVACIONES")));
        if (!["VALIDADO", "REQUIERE DECISION", "PENDIENTE CONFIRMACION", "SIN PAGO"].includes(fin)) {
          state = "REQUIERE_DECISION";
          reasons = [`Fila desalineada en ${carteraTitle} (ESTADO_FINANCIERO="${at(r, h.col("ESTADO_FINANCIERO"))}")`];
        } else if (fin === "SIN PAGO") {
          if (/NO\s+RENUEV|NO\s+VA\s+RENOVAR|NO\s+RENOVAR/.test(note)) {
            state = "REQUIERE_DECISION";
            reasons = ["Cliente reporta no renovación"];
          } else state = !due ? "REQUIERE_DECISION" : due === today ? "COBRO_HOY" : due < today ? "VENCIDO" : "PROGRAMADO";
          if (!due) reasons = ["F. PRÓXIMO PAGO inválida"];
        } else if (fin === "REQUIERE DECISION") {
          state = "REQUIERE_DECISION";
          reasons = [at(r, h.col("MOTIVO_GATE_FINANCIERO")) || "Gate financiero en REQUIERE DECISIÓN"];
        } else {
          const s = finState(payment);
          state = s.state;
          reasons = s.reasons;
          if (fin === "VALIDADO" && s.state !== "CONFIRMADO_JM") reasons.push(`Cartera dice VALIDADO pero ${ref || "pago"} está ${s.state}`);
          if (fin === "PENDIENTE CONFIRMACION" && s.state === "CONFIRMADO_JM") {
            state = "REQUIERE_DECISION";
            reasons.push(`Cartera dice PENDIENTE pero ${ref} ya está CONFIRMADO JM`);
          }
          if (fin === "VALIDADO" && s.state !== "CONFIRMADO_JM") state = "REQUIERE_DECISION";
        }
        if (identity.status === "AMBIGUO") reasons.push(`Identidad: ${identity.detail}`);
        const nextAction: Record<FinancialState, string> = {
          COBRO_HOY: "Cobrar hoy",
          VENCIDO: "Gestionar cobro vencido",
          PROGRAMADO: `Cobro programado ${due ?? ""}`.trim(),
          PAGO_REGISTRADO: "Solicitar confirmación JM",
          PENDIENTE_CONFIRMACION_JM: `JM: confirmar ${ref || "pago"}`,
          CONFIRMADO_JM: "Pasar a servicio",
          REPROGRAMADO: "Seguir compromiso",
          REQUIERE_DECISION: `Decidir: ${reasons[0] ?? "revisar"}`,
        };
        financial.push({
          id: `${carteraTitle}!${i + 1}`,
          source: `${carteraTitle}!${i + 1}${ref ? ` → ${ref}` : ""}`,
          client,
          usuario,
          amount: [at(r, h.col("USD")) && at(r, h.col("USD")) !== "-" && parseAmount(at(r, h.col("USD"))) ? `USD ${at(r, h.col("USD")).replace(/^\$/, "")}` : "", parseAmount(at(r, h.col("COP"))) ? `COP ${at(r, h.col("COP")).replace(/[\s$]/g, "")}` : ""].filter(Boolean).join(" · ") || "—",
          method: payment?.method ?? canon(at(r, h.col("MÉTODO DE PAGO"))),
          date: payment?.date ?? due,
          advisor: payment?.advisor ?? "",
          state,
          reasons,
          nextAction: nextAction[state],
          identity,
          paymentRef: ref,
          proposal: payment?.proposal ?? null,
          inCartera: true,
          fromSale: payment?.origin === "VENTA",
        });
      }
    }
  } else decisions.push(`No existe hoja PAGOS de ${month}.`);

  for (const p of payments) {
    if (usedPayments.has(p.ref)) continue;
    const identity = p.baseRow ? identify(base, "", p.client, p.baseRow) : p.baseMatches && p.baseMatches > 1 ? { status: "AMBIGUO" as const, baseRow: null, detail: `${p.baseMatches} coincidencias en BASE GENERAL` } : identify(base, "", p.client);
    const s = finState(p);
    const reasons = [...s.reasons];
    if (p.decision) reasons.push(p.decision);
    let state = s.state;
    if (state === "CONFIRMADO_JM" && p.proposal && !p.proposal.validated && p.origin !== "VENTA") {
      state = "REQUIERE_DECISION";
      reasons.push("Propuesta de fechas no validada");
    }
    if (!p.received) state = "REQUIERE_DECISION";
    const bUser = identity.baseRow ? base.byRow.get(identity.baseRow)?.usuario ?? "" : "";
    financial.push({
      id: p.ref,
      source: `${p.sheet}!${p.row} (fuera de cartera ${month})`,
      client: p.client,
      usuario: bUser,
      amount: p.amount,
      method: p.method,
      date: p.date,
      advisor: p.advisor,
      state,
      reasons,
      nextAction: state === "PENDIENTE_CONFIRMACION_JM" ? `JM: confirmar ${p.ref}` : state === "CONFIRMADO_JM" ? "Pasar a servicio" : state === "PAGO_REGISTRADO" ? "Solicitar confirmación JM" : `Decidir: ${reasons[0] ?? "revisar"}`,
      identity,
      paymentRef: p.ref,
      proposal: p.proposal,
      inCartera: false,
      fromSale: p.origin === "VENTA",
    });
  }

  /* ---------- SERVICIO: CONTROL P1/P2/P3 del mes */
  const service: ServiceItem[] = [];
  const financialByBaseRow = new Map<number, FinancialItem[]>();
  const financialByUser = new Map<string, FinancialItem[]>();
  for (const f of financial) {
    if (f.identity.baseRow) financialByBaseRow.set(f.identity.baseRow, [...(financialByBaseRow.get(f.identity.baseRow) ?? []), f]);
    if (f.usuario) financialByUser.set(f.usuario, [...(financialByUser.get(f.usuario) ?? []), f]);
  }

  panelTitles.forEach((title, idx) => {
    const panel = `P${idx + 1}` as ServiceItem["panel"];
    if (!title) {
      decisions.push(`Servicio ${panel}: no existe hoja CONTROL de ${month}.`);
      return;
    }
    const rows = input.values[title] ?? [];
    const h = header(rows, ["TC", "RECARGA", "USUARIO", "CREDITO"]);
    if (!h) return;
    const creditCol = h.col("CREDITO");
    const balanceCol = creditCol == null ? null : creditCol + 1;
    let prevBalance = parseAmount(at(rows[h.index], balanceCol));
    const seen = new Map<string, number>();
    for (let i = h.index + 1; i < rows.length; i++) {
      const r = rows[i] ?? [];
      const recharge = canon(at(r, h.col("RECARGA")));
      const usuario = userKey(at(r, h.col("USUARIO")));
      const balance = parseAmount(at(r, balanceCol));
      if (recharge.startsWith("COMPRA")) {
        prevBalance = balance ?? prevBalance;
        continue;
      }
      if (!usuario) continue;
      const date = parseDate(at(r, h.col("FECHA")));
      const credit = parseAmount(at(r, creditCol));
      const identity = identify(base, usuario, "");
      const baseRow = identity.baseRow ? base.byRow.get(identity.baseRow) : undefined;
      const fins = (identity.baseRow ? financialByBaseRow.get(identity.baseRow) : undefined) ?? financialByUser.get(usuario) ?? [];
      const paid = fins.some((f) => f.state === "CONFIRMADO_JM");
      const reasons: string[] = [];
      let state: ServiceState;
      const repeated = seen.get(usuario);
      seen.set(usuario, i + 1);

      if (!recharge) {
        state = date === today ? "SERVICIO_HOY" : (date && date < today) || paid ? "CREDITO_PENDIENTE" : "PROGRAMADO";
        if (state === "CREDITO_PENDIENTE" && !paid) reasons.push("Fecha de servicio vencida sin pago confirmado");
      } else if (/LIBERADO/.test(recharge)) {
        state = "REQUIERE_DECISION";
        reasons.push(`LIBERADO (${at(r, h.col("ORIGEN")) || "sin origen"}): confirmar excepción aprobada`);
      } else if (/SIN ASIG/.test(recharge)) {
        state = (credit ?? 0) > 0 ? "INCONSISTENCIA_CREDITOS" : "REQUIERE_DECISION";
        reasons.push(`SIN ASIGNAR${at(r, h.col("ORIGEN")) ? ` · ${at(r, h.col("ORIGEN"))}` : ""}${at(r, h.col("OBSERVACIÓN")) ? ` · ${at(r, h.col("OBSERVACIÓN"))}` : ""}`);
      } else {
        const drop = prevBalance != null && balance != null ? prevBalance - balance : null;
        if (!credit) {
          state = "INCONSISTENCIA_CREDITOS";
          reasons.push(`Recarga ${recharge} sin CREDITO registrado`);
        } else if (drop != null && drop !== credit) {
          state = "INCONSISTENCIA_CREDITOS";
          reasons.push(`CREDITO ${credit} pero saldo ${prevBalance} → ${balance}`);
        } else if (repeated) {
          state = "INCONSISTENCIA_CREDITOS";
          reasons.push(`USUARIO ya recargado en fila ${repeated} del mismo panel`);
        } else if (identity.status === "AMBIGUO") {
          state = "REQUIERE_DECISION";
          reasons.push(identity.detail);
        } else state = paid ? "SERVICIO_VALIDADO" : "CREDITO_APLICADO";
        if (state === "CREDITO_APLICADO") {
          const next = parseDate(baseRow?.values[fk("F.PRÓXIMO PAGO")]);
          reasons.push(next && date && next > date ? `Sin pago del mes; BASE indica ciclo pagado hasta ${baseRow?.values[fk("F.PRÓXIMO PAGO")]}` : "Crédito aplicado sin pago CONFIRMADO JM enlazado");
        }
      }
      if (balance != null && recharge) prevBalance = balance;
      const next: Record<ServiceState, string> = {
        SERVICIO_HOY: paid ? "Aplicar crédito hoy" : "Vence hoy: verificar pago antes de renovar",
        CREDITO_PENDIENTE: paid ? `Aplicar crédito en ${panel}` : "Verificar pago / decidir renovación",
        PROGRAMADO: `Servicio programado ${date ?? ""}`.trim(),
        CREDITO_APLICADO: "Esperar CONFIRMADO JM del pago",
        SERVICIO_VALIDADO: "Listo para match con Base",
        INCONSISTENCIA_CREDITOS: `Corregir CONTROL ${panel} fila ${i + 1}`,
        REQUIERE_DECISION: `Decidir: ${reasons[0] ?? "revisar"}`,
      };
      service.push({
        id: `${title}!${i + 1}`,
        sheet: title,
        row: i + 1,
        panel,
        usuario,
        client: baseRow?.name ?? "",
        recharge: recharge || "—",
        creditsApplied: recharge ? credit : null,
        creditsRequired: "REQUIERE DECISIÓN",
        date,
        advisor: canon(at(r, h.col("ASESOR"))),
        state,
        reasons,
        nextAction: next[state],
        identity,
      });
    }
  });
  // P0 S4 (26/10/2026): un CONFIRMADO JM válido no puede desaparecer entre FINANCIERO y SERVICIO
  // solo porque CONTROL todavía no tenga una fila precargada. Generamos una tarea VIRTUAL read-only:
  // el operador ejecuta la renovación y registra la evidencia real en CONTROL. Nunca se simula CREDITO ni F.VENCIMIENTO.
  // PANEL 3M / aliases no se enrutan automáticamente: D4 sigue en REQUIERE DECISIÓN.
  const serviceUsers = new Set(service.map((s) => s.usuario).filter(Boolean));
  const exactPanel = (raw: string): ServiceItem["panel"] | null => {
    const p = canon(raw);
    if (p === "PANEL 1" || p === "P1") return "P1";
    if (p === "PANEL 2" || p === "P2") return "P2";
    if (p === "PANEL 3" || p === "P3") return "P3";
    return null;
  };
  for (const f of financial) {
    if (f.state !== "CONFIRMADO_JM" || f.identity.status !== "IDENTIFICADO" || !f.identity.baseRow || !f.usuario || serviceUsers.has(f.usuario)) continue;
    const b = base.byRow.get(f.identity.baseRow);
    if (!b) continue;
    const panel = exactPanel(b.values[fk("PANEL")]);
    if (!panel) {
      decisions.push(`Servicio pendiente ${f.id}: PANEL "${b.values[fk("PANEL")] || "vacío"}" sin routing aprobado (D4).`);
      continue;
    }
    const sheet = panelTitles[Number(panel.slice(1)) - 1];
    if (!sheet) {
      decisions.push(`Servicio pendiente ${f.id}: no existe CONTROL ${panel} de ${month}.`);
      continue;
    }
    service.push({
      id: `TASK:${f.id}`,
      sheet,
      row: 0,
      panel,
      usuario: f.usuario,
      client: f.client,
      recharge: "—",
      creditsApplied: null,
      creditsRequired: "REQUIERE DECISIÓN",
      date: f.date,
      advisor: f.advisor,
      state: "CREDITO_PENDIENTE",
      reasons: [`Pago CONFIRMADO JM (${f.paymentRef || f.id}); falta ejecutar renovación y registrar evidencia en ${sheet}.`],
      nextAction: `Aplicar crédito en ${panel} y registrar CREDITO + F.VENCIMIENTO en ${sheet}`,
      identity: f.identity,
    });
    serviceUsers.add(f.usuario);
  }

  decisions.push("Créditos requeridos por recarga: no existe tabla vigente (ej. agosto: 12 MESES = 9 créditos). Se muestran créditos aplicados y la coherencia con el saldo.");
  decisions.push("F.VENCIMIENTO nueva tras renovación: el contrato exige actualizarla, pero no define la regla de cálculo. No se incluye en el preview.");
  decisions.push("REPROGRAMADO: ninguna fuente registra un campo de compromiso/reprogramación; el estado queda sin asignar hasta definir el campo.");

  const serviceByBaseRow = new Map<number, ServiceItem[]>();
  const serviceByUser = new Map<string, ServiceItem[]>();
  for (const s of service) {
    if (s.identity.baseRow) serviceByBaseRow.set(s.identity.baseRow, [...(serviceByBaseRow.get(s.identity.baseRow) ?? []), s]);
    serviceByUser.set(s.usuario, [...(serviceByUser.get(s.usuario) ?? []), s]);
  }

  /* ---------- VENTAS */
  const salesSel = selectSalesSheets(input.salesSheets, today);
  if (input.salesError) decisions.push(`VENTAS 2026 (Tiviplay) no legible: ${input.salesError}`);
  const sales: SaleItem[] = [];
  const saleIdentityCount = new Map<string, number>();
  const rawSales: Array<{ sheet: string; month: string; row: number; r: unknown[]; h: NonNullable<ReturnType<typeof header>> }> = [];
  for (const s of salesSel.included) {
    const rows = input.salesValues[s.title] ?? [];
    const h = header(rows, ["TC", "CONCEPTO", "CLIENTE"]);
    if (!h) continue;
    for (let i = h.index + 1; i < rows.length; i++) {
      const r = rows[i] ?? [];
      if (at(r, h.col("TC")) !== "1" || !at(r, h.col("CLIENTE"))) continue;
      rawSales.push({ sheet: s.title, month: s.month, row: i + 1, r, h });
      const idKey = [userKey(at(r, h.col("USUARIO"))), clientKey(at(r, h.col("CLIENTE"))), canon(at(r, h.col("TELEFONO")) || at(r, h.col("CORREO"))), canon(at(r, h.col("PANEL")))].join("|");
      saleIdentityCount.set(idKey, (saleIdentityCount.get(idKey) ?? 0) + 1);
    }
  }
  for (const { sheet, month: sMonth, row, r, h } of rawSales) {
    const client = at(r, h.col("CLIENTE"));
    const usuario = userKey(at(r, h.col("USUARIO")));
    const concept = canon(at(r, h.col("CONCEPTO")));
    const identity = identify(base, usuario, client);
    const idKey = [usuario, clientKey(client), canon(at(r, h.col("TELEFONO")) || at(r, h.col("CORREO"))), canon(at(r, h.col("PANEL")))].join("|");
    const duplicate = (saleIdentityCount.get(idKey) ?? 0) > 1;
    const missing = SALE_REQUIRED.filter(([c]) => !at(r, h.col(c))).map(([, label]) => label);
    const usd = parseAmount(at(r, h.col("USD")));
    const cop = parseAmount(at(r, h.col("COP")));
    if (!(usd && usd > 0) && !(cop && cop > 0)) missing.push("valor");

    const salePayments = payments.filter((p) => p.origin === "VENTA" && p.key === clientKey(client));
    const salesConfirmed = /CONFIRMADO/.test(canon(at(r, h.col("CONFIRMACION"))));
    const payConfirmed = salePayments.find((p) => p.received && /CONFIRMADO/.test(p.confirmation) && !/PENDIENTE|REVISION/.test(p.confirmation));
    const confirmation = salesConfirmed || payConfirmed ? "CONFIRMADO_JM" : "PENDIENTE_CONFIRMACION";
    const confirmationSource = salesConfirmed ? `${sheet}!${row} CONFIRMACION` : payConfirmed ? payConfirmed.ref : salePayments[0] ? `${salePayments[0].ref} (${salePayments[0].confirmation || "sin confirmación"})` : "Sin pago enlazado";

    let type: SaleType;
    const reasons: string[] = [];
    if (/CLIENTE NUEVO|REFERIDO/.test(concept)) type = identity.status === "NO_EN_BASE" ? "VENTA_NUEVA" : "CLIENTE_EXISTENTE";
    else if (/REACTIVACION/.test(concept)) {
      type = identity.status === "IDENTIFICADO" ? "REACTIVACION" : "REQUIERE_DECISION";
      if (type === "REQUIERE_DECISION") reasons.push(identity.status === "NO_EN_BASE" ? "Reactivación sin cliente existente en BASE GENERAL" : identity.detail);
    } else {
      type = "REQUIERE_DECISION";
      reasons.push(`CONCEPTO "${at(r, h.col("CONCEPTO"))}" no es venta, referido ni reactivación`);
    }

    let gate: SaleGate;
    if (duplicate) gate = "DUPLICIDAD";
    else if (identity.status === "AMBIGUO") {
      gate = "DUPLICIDAD";
      reasons.push(identity.detail);
    } else if (type === "REQUIERE_DECISION") gate = "REQUIERE_DECISION";
    else if ((type === "CLIENTE_EXISTENTE" || type === "REACTIVACION") && sMonth < month) gate = "YA_EN_BASE";
    else if (confirmation !== "CONFIRMADO_JM") gate = "PENDIENTE_CONFIRMACION";
    else if (missing.length) {
      gate = "REQUIERE_DECISION";
      reasons.push(`Datos incompletos: ${missing.join(", ")}`);
    } else gate = "LISTO_PARA_CONTINUAR";

    const nextAction: Record<SaleGate, string> = {
      LISTO_PARA_CONTINUAR: "Validar servicio y pasar a match",
      CONFIRMADO_JM: "Validar servicio",
      PENDIENTE_CONFIRMACION: `JM: confirmar ${salePayments[0]?.ref ?? "pago de la venta"}`,
      DUPLICIDAD: "Back Office: resolver identidad/duplicidad",
      REQUIERE_DECISION: `Decidir: ${reasons[0] ?? "revisar"}`,
      YA_EN_BASE: "Sin acción: cliente ya existe en BASE GENERAL",
    };
    sales.push({
      id: `${sheet}!${row}`,
      sheet,
      row,
      month: sMonth,
      client,
      concept: at(r, h.col("CONCEPTO")),
      advisor: canon(at(r, h.col("ASESOR"))),
      usuario,
      panel: at(r, h.col("PANEL")),
      plan: at(r, h.col("PLAN ACTIVO")),
      amount: [usd ? `USD ${usd}` : "", cop ? `COP ${cop}` : ""].filter(Boolean).join(" · ") || "—",
      method: at(r, h.col("MÉTODO DE PAGO")),
      type,
      confirmation,
      confirmationSource,
      missing,
      duplicate,
      identity,
      gate,
      reasons,
      nextAction: nextAction[gate],
    });
  }

  // Servicio de ventas nuevas: el crédito queda autorizado por el pago CONFIRMADO JM de la venta (S0-D → S0-E).
  for (const x of service) {
    if (x.state !== "CREDITO_APLICADO") continue;
    const sale = sales.find((s) => s.usuario === x.usuario && s.confirmation === "CONFIRMADO_JM");
    if (sale) {
      x.state = "SERVICIO_VALIDADO";
      x.reasons = [`Pago de la venta CONFIRMADO JM (${sale.confirmationSource})`];
      x.nextAction = "Listo para match con Base";
    }
  }

  /* ---------- MATCH → BASE GENERAL (preview) */
  const sync: SyncItem[] = [];
  const handledBaseRows = new Set<number>();
  const fmt = (iso: string | null) => (iso ? `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(2, 4)}` : "");

  const pushSync = (item: SyncItem) => {
    item.state = item.blockers.length ? "BLOQUEADO" : item.changes.length ? "LISTO_PARA_BASE" : "SINCRONIZADO";
    if (item.state !== "BLOQUEADO" && item.action === "REQUIERE_DECISION") item.state = "BLOQUEADO";
    sync.push(item);
  };

  // Ventas: mes en curso + ventas anteriores (jun→) aún no reflejadas en BASE GENERAL
  for (const s of sales.filter((x) => x.month === month || x.gate !== "YA_EN_BASE")) {
    const svc = serviceByUser.get(s.usuario) ?? [];
    const svcOk = svc.some((x) => x.state === "SERVICIO_VALIDADO");
    const blockers: string[] = [];
    if (s.gate !== "LISTO_PARA_CONTINUAR") blockers.push(`Venta: ${s.gate}${s.reasons[0] ? ` · ${s.reasons[0]}` : ""}`);
    if (!svc.length) blockers.push(s.month < month ? `Servicio: venta de ${s.month}; USUARIO no aparece en CONTROL de ${month}` : "Servicio: USUARIO no aparece en CONTROL del mes");
    else if (!svcOk) blockers.push(`Servicio: ${svc.map((x) => x.state).join(", ")}`);
    const action: BaseAction = s.type === "VENTA_NUEVA" ? "ALTA_NUEVA" : s.type === "REACTIVACION" ? "REACTIVACION" : s.type === "CLIENTE_EXISTENTE" ? "ACTUALIZACION" : "REQUIERE_DECISION";
    const raw = rawSales.find((x) => x.sheet === s.sheet && x.row === s.row);
    const changes: FieldChange[] = [];
    if (raw) {
      const current = s.identity.baseRow ? base.byRow.get(s.identity.baseRow) : undefined;
      for (const field of ["CLIENTE", "PLAN ACTIVO", "PANTALLAS", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F.PRÓXIMO PAGO", "DISPOSITIVO"]) {
        const to = at(raw.r, raw.h.col(field));
        const from = current?.values[fk(field)] ?? "";
        const same = field.startsWith("F.") ? parseDate(from) === parseDate(to) : canon(from) === canon(to);
        if (to && !same && !(["USD", "COP"].includes(field) && !parseAmount(to))) changes.push({ field, from: from || "∅", to });
      }
      for (const field of ["TELEFONO", "CORREO", "CONTRASEÑA"]) {
        if (at(raw.r, raw.h.col(field)) && !current?.values[fk(field)]) changes.push({ field, from: "∅", to: "(dato de la venta)" });
      }
      const fp = parseDate(at(raw.r, raw.h.col("F.PRÓXIMO PAGO")));
      if (fp) {
        const { t, estado } = estadoPorT(fp, today);
        if (canon(current?.values[fk("ESTADO")]) !== canon(estado)) changes.push({ field: "ESTADO", from: current?.values[fk("ESTADO")] || "∅", to: estado });
        void t;
      }
      if (!current) changes.push({ field: "TC", from: "∅", to: "1" });
    }
    if (s.identity.baseRow) handledBaseRows.add(s.identity.baseRow);
    pushSync({ key: s.id, client: s.client, usuario: s.usuario, baseRow: s.identity.baseRow, action, state: "EN_PROCESO", sale: s.id, financial: s.confirmationSource, service: svc.map((x) => x.id).join(", ") || null, changes, notApplied: ["F.VENCIMIENTO posterior a la renovación (sin regla)", "T (columna derivada de F.PRÓXIMO PAGO)"], blockers });
  }

  // Renovaciones / actualizaciones desde la capa financiera
  for (const f of financial) {
    if (f.fromSale) continue;
    if (!["CONFIRMADO_JM", "PENDIENTE_CONFIRMACION_JM", "PAGO_REGISTRADO", "REQUIERE_DECISION"].includes(f.state)) continue;
    const baseRow = f.identity.baseRow ? base.byRow.get(f.identity.baseRow) : undefined;
    if (baseRow && handledBaseRows.has(baseRow.row)) continue;
    const svc = (baseRow ? serviceByBaseRow.get(baseRow.row) : undefined) ?? (f.usuario ? serviceByUser.get(f.usuario) : undefined) ?? [];
    const blockers: string[] = [];
    if (f.state !== "CONFIRMADO_JM") blockers.push(`Financiero: ${f.state}${f.reasons[0] ? ` · ${f.reasons[0]}` : ""}`);
    if (f.identity.status !== "IDENTIFICADO") blockers.push(`Identidad: ${f.identity.detail}`);
    if (!svc.length) blockers.push("Servicio: sin registro en CONTROL del mes");
    else if (!svc.some((x) => x.state === "SERVICIO_VALIDADO")) blockers.push(`Servicio: ${svc.map((x) => x.state).join(", ")}`);
    if (!f.proposal) blockers.push("Sin propuesta de fechas en la hoja de pago");
    else {
      if (!f.proposal.validated) blockers.push("ESTADO_PROPUESTA ≠ VALIDADO");
      if (f.proposal.planChange) blockers.push("TIPO_CAMBIO = CAMBIO PLAN (requiere decisión)");
    }
    const changes: FieldChange[] = [];
    if (baseRow && f.proposal) {
      const v = (k: string) => baseRow.values[fk(k)] ?? "";
      if (f.proposal.fUltimo && parseDate(v("F.ULTIMO PAGO")) !== f.proposal.fUltimo) changes.push({ field: "F.ULTIMO PAGO", from: v("F.ULTIMO PAGO") || "∅", to: fmt(f.proposal.fUltimo) });
      if (f.proposal.fProximo && parseDate(v("F.PRÓXIMO PAGO")) !== f.proposal.fProximo) changes.push({ field: "F.PRÓXIMO PAGO", from: v("F.PRÓXIMO PAGO") || "∅", to: fmt(f.proposal.fProximo) });
      if (f.proposal.estado && canon(v("ESTADO")) !== canon(f.proposal.estado)) changes.push({ field: "ESTADO", from: v("ESTADO") || "∅", to: f.proposal.estado });
      // Conflictos BASE ↔ propuesta: no se corrigen en silencio.
      const baseLast = parseDate(v("F.ULTIMO PAGO"));
      const baseNext = parseDate(v("F.PRÓXIMO PAGO"));
      if (f.proposal.fUltimo && baseLast === f.proposal.fUltimo && f.proposal.fProximo && baseNext !== f.proposal.fProximo) {
        blockers.push(`Conflicto: BASE ya registra el pago (F.ULTIMO PAGO ${v("F.ULTIMO PAGO")}) pero F.PRÓXIMO PAGO ${v("F.PRÓXIMO PAGO")} ≠ propuesta ${fmt(f.proposal.fProximo)}`);
      } else if (f.proposal.fProximo && baseNext && f.proposal.fProximo < baseNext) {
        blockers.push(`Conflicto: la propuesta retrocede F.PRÓXIMO PAGO (${v("F.PRÓXIMO PAGO")} → ${fmt(f.proposal.fProximo)})`);
      }
    }
    if (baseRow) handledBaseRows.add(baseRow.row);
    pushSync({
      key: f.id,
      client: f.client,
      usuario: baseRow?.usuario ?? f.usuario,
      baseRow: baseRow?.row ?? null,
      action: f.identity.status !== "IDENTIFICADO" ? "REQUIERE_DECISION" : f.inCartera ? "RENOVACION" : "ACTUALIZACION",
      state: "EN_PROCESO",
      sale: null,
      financial: f.id,
      service: svc.map((x) => x.id).join(", ") || null,
      changes,
      notApplied: ["F.VENCIMIENTO posterior a la renovación (sin regla)", "T (columna derivada de F.PRÓXIMO PAGO)", ...(f.proposal?.planChange ? ["PLAN ACTIVO (cambio de plan sin aprobar)"] : [])],
      blockers,
    });
  }

  /* ---------- excepciones */
  for (const s of sales) if (["DUPLICIDAD", "REQUIERE_DECISION"].includes(s.gate)) exceptions.push({ layer: "VENTAS", ref: s.id, client: s.client, reason: s.reasons[0] ?? s.gate });
  for (const f of financial) if (f.state === "REQUIERE_DECISION") exceptions.push({ layer: "FINANCIERO", ref: f.id, client: f.client, reason: f.reasons[0] ?? f.state });
  for (const s of service) if (s.state === "INCONSISTENCIA_CREDITOS" || s.state === "REQUIERE_DECISION") exceptions.push({ layer: "SERVICIO", ref: s.id, client: s.client || s.usuario, reason: s.reasons[0] ?? s.state });
  for (const m of sync) if (m.action === "REQUIERE_DECISION") exceptions.push({ layer: "MATCH", ref: m.key, client: m.client, reason: m.blockers[0] ?? "Identidad ambigua" });

  const ready = sync.filter((x) => x.state === "LISTO_PARA_BASE");
  return {
    readOnly: true,
    month,
    sources: {
      sales: salesSel.included.map((x) => x.title),
      financial: [carteraTitle, ...Object.values(payTitles)].filter((x): x is string => !!x),
      service: panelTitles.filter((x): x is string => !!x),
      base: "BASE GENERAL",
    },
    sales,
    financial,
    service,
    sync,
    exceptions,
    counts: {
      ventas: sales.filter((s) => s.month === month).length,
      cobros: financial.length,
      servicio: service.filter((s) => s.state !== "PROGRAMADO").length,
      listoParaBase: ready.length,
      excepciones: exceptions.length,
    },
    byState: {
      sales: count(sales, (s: SaleItem) => s.gate),
      financial: count(financial, (f: FinancialItem) => f.state),
      service: count(service, (s: ServiceItem) => s.state),
      sync: count(sync, (s: SyncItem) => s.state),
    },
    decisions,
  };
}
