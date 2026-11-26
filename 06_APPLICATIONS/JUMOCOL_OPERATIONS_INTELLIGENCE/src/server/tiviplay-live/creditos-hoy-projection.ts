// Bloque 4 de HOY — CRÉDITOS DE HOY. Proyección pura (sin I/O) sobre CONTROL P1/P2/P3 del mes.
//
// Regla de Dirección (22/10/2026):
//   G (FECHA)          = fecha en que corresponde otorgar el crédito técnico → población del día: G = hoy.
//   H (F.VENCIMIENTO)  = vencimiento resultante, registrado después de ejecutar el crédito. Es el dato que se lleva
//                        a BASE GENERAL (F.VENCIMIENTO): el match CONTROL.H ↔ BASE.F.VENCIMIENTO cierra el ciclo.
// La regla es la misma para P1, P2 y P3 (Dirección, 23/10/2026): ningún panel tiene una regla distinta.
// Habilitación financiera: contrato S0 v0.3 §7.1, sin reglas nuevas:
//   NECESIDAD TÉCNICA + HABILITACIÓN FINANCIERA + IDENTIDAD INEQUÍVOCA = CRÉDITO EJECUTABLE
//   Caso A: CONFIRMADO JM + ESTADO_ENLACE = ENLAZADO + FILA_BASE = fila del USUARIO.
//   Caso B: TC=1 + F. PRÓXIMO PAGO posterior a la fecha del crédito + cobertura coherente con PLAN ACTIVO (+k).
// Columnas canónicas de CONTROL (WO-TIVI-HOY-CREDITOS, 23/10/2026): A TC = crédito programado, J CREDITO = crédito
// efectivamente ejecutado, I ORIGEN = motivo; I = COMPRA es carga de inventario del panel (K), nunca un crédito de cliente.
// KPI = mismas fórmulas de la hoja, sin hardcodear rangos: el bloque resumen («⬅️ …») marca el fin de los datos.
//   programados = Σ A (I ≠ COMPRA) · otorgados = Σ J (I ≠ COMPRA) · faltantes = programados − otorgados
//   hoy = Σ A con fecha(G) = hoy (I ≠ COMPRA). La hoja calcula «hoy» con G = TODAY(), pero G es texto con hora,
//   así que su celda siempre da 0; aquí se compara la fecha de G y se reporta la diferencia (paridad visible).
// Ejecución = J > 0 (o TC 0 con ORIGEN y H: movimiento sin consumo de crédito). H por sí sola no es ejecución.
// CRÉDITO EJECUTADO ≠ BASE GENERAL ACTUALIZADA. Nunca se lee ni se expone la columna CONTRASEÑA.
import { canon, clean, parseDate, type PanelId } from "@/server/tiviplay-live/runtime-read-model";

export type CreditState = "HABILITADO" | "NO_HABILITADO" | "SIN_PAGAR" | "REQUIERE_REVISION" | "EJECUTADO";

export const CREDIT_STATE_LABEL: Record<CreditState, string> = {
  HABILITADO: "AL DÍA · HABILITADO PARA CRÉDITO",
  NO_HABILITADO: "PENDIENTE DE PAGO",
  SIN_PAGAR: "PENDIENTE DE PAGO",
  REQUIERE_REVISION: "REQUIERE DECISIÓN",
  EJECUTADO: "CRÉDITO EJECUTADO",
};

export type CreditTask = {
  panel: PanelId;
  sheet: string;
  row: number;
  reference: string; // Hoja!fila, para volver a la fuente
  user: string;
  advisor: string;
  recharge: string; // RECARGA (duración)
  creditDate: string | null; // fecha de G (ISO)
  creditTime: string; // hora registrada en G, si existe
  tc: number; // A · créditos programados
  credit: number | null; // J · crédito registrado (null si vacío)
  newDue: string | null; // H como fecha ISO, solo si es válida
  origin: string;
  observation: string;
  state: CreditState;
  basis: "A" | "B" | "E" | null; // caso S0 §7.1 que habilita (E = excepción aprobada por Dirección)
  reason: string;
  /** Solo EJECUTADO: match de H contra F.VENCIMIENTO de BASE GENERAL (cierre del ciclo). */
  baseSync: BaseSync | null;
  /** Excepción accionable para Dirección (CONFIRMAR · CORREGIR · RECHAZAR), si la hay. */
  exception: CycleException | null;
};

export type BaseSync = { state: "ACTUALIZADA" | "PENDIENTE" | "SIN_VERIFICAR"; baseDue: string | null; detail: string };

export type PanelCredits = {
  panel: PanelId;
  sheet: string | null;
  status: "OK" | "REQUIERE_REVISION" | "REQUIERE_DECISION";
  reason: string | null;
  columns: { date: string; due: string } | null; // letras reales de G/H encontradas por encabezado
  /** Aviso no bloqueante: ninguna FECHA de la hoja cae en su mes (se aplica igual la regla G = hoy). */
  warning: string | null;
  /** KPI calculados por la aplicación desde las filas de datos. */
  kpi: CreditKpi | null;
  /** Valores del bloque resumen de la propia hoja (control de paridad); null si no se encontró. */
  sheetKpi: Partial<Record<keyof Omit<CreditKpi, "avance">, number>> | null;
  /** Filas de datos detectadas (encabezado+1 … fila anterior al bloque resumen). */
  dataRange: { first: number; last: number } | null;
  tasks: CreditTask[];
  /** Días anteriores con crédito programado y no ejecutado (J < A), excluido COMPRA. */
  pending: CreditTask[];
  /** Semáforo E2E de cada fila de cliente del mes. */
  cycles: CycleItem[];
};

export type CreditKpi = { programados: number; otorgados: number; faltantes: number; hoy: number; avance: number | null };

export type CreditosHoy = {
  date: string;
  targetMonth: string;
  panels: PanelCredits[];
  totals: Record<CreditState, number> & { total: number };
  /** KPI consolidados (solo paneles leídos). */
  kpi: CreditKpi;
  /** Créditos ejecutados cuyo H todavía no está en BASE GENERAL (o no se pudo verificar). */
  basePending: number;
  financeSource: "OK" | "REQUIERE_REVISION";
  cycle: CycleSummary;
  /** Créditos disponibles (hoja USUARIOS LIBERADOS, ESTADO = DISPONIBLE). null = no se pudo leer o la estructura cambió. */
  available: AvailableCredit[] | null;
};

export type CreditosHoyInput = {
  today: string;
  targetMonth: string;
  controls: Record<PanelId, { sheet: string | null; rows: unknown[][] | null }>;
  base: unknown[][] | null;
  payments: Array<{ sheet: string; rows: unknown[][] }> | null;
  /** Fallo global de lectura (credenciales o metadatos): todos los paneles quedan en REQUIERE_REVISION. */
  readError?: string;
  /** Decisiones de Dirección sobre excepciones (orden cronológico; la última por asunto gana). */
  decisions?: CycleDecision[];
  /**
   * USUARIOS LIBERADOS (libro VENTAS 2026) leída sin la columna D (CONTRASEÑA): cada fila es
   * [A LINE_ID, C USUARIO, E PANEL, F F.VENCIMIENTO, G ESTADO]. null/ausente = lectura fallida.
   */
  released?: unknown[][] | null;
};

export type AvailableCredit = { row: number; lineId: string | null; user: string; panel: string; due: string };

const RELEASED_HEADER = ["LINE_ID", "USUARIO", "PANEL", "F.VENCIMIENTO", "ESTADO"];

/**
 * Inventario de créditos disponibles: solo filas con ESTADO = DISPONIBLE. La hoja es la fuente de verdad;
 * aquí no se guarda ni se modifica nada. Si los encabezados no coinciden con la estructura vigente, devuelve null
 * (no se muestra un inventario leído con columnas equivocadas).
 */
export function projectAvailableCredits(rows: unknown[][] | null | undefined): AvailableCredit[] | null {
  if (!rows) return null;
  const cell = (r: unknown[] | undefined, i: number) => String(r?.[i] ?? "").replace(/\s+/g, " ").trim();
  const header = rows.findIndex((r) => RELEASED_HEADER.every((h, i) => cell(r, i).toUpperCase() === h));
  if (header < 0) return null;
  const out: AvailableCredit[] = [];
  rows.slice(header + 1).forEach((r, i) => {
    if (cell(r, 4).toUpperCase() !== "DISPONIBLE") return;
    const user = String(r?.[1] ?? "").replace(/\s+/g, "");
    if (!user) return;
    out.push({ row: header + i + 2, lineId: cell(r, 0) || null, user, panel: cell(r, 2).toUpperCase(), due: cell(r, 3) });
  });
  return out.sort((a, b) => a.panel.localeCompare(b.panel) || a.due.localeCompare(b.due));
}

const PANELS: PanelId[] = ["P1", "P2", "P3"];

export function columnLetter(index: number) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function headerIndex(rows: unknown[][], required: string[]) {
  return rows.slice(0, 8).findIndex((r) => { const h = (r ?? []).map(canon); return required.every((name) => h.includes(name)); });
}

/** Meses de cobertura de PLAN ACTIVO incluida la bonificación registrada (+k). `null` si no es interpretable. */
export function planMonths(plan: string): number | null {
  const m = canon(plan).match(/(\d+)\s*MES(?:ES)?\s*(?:\+\s*(\d+))?/);
  if (!m) return null;
  return Number(m[1]) + (m[2] ? Number(m[2]) : 0);
}

export function addMonths(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

const panelDigit = (value: string) => canon(value).match(/(?:PANEL\s*|^P)([123])/)?.[1] ?? null;

/** Panel distinto mencionado en la observación del CONTROL («PANEL 1», «CLIENTE EN P1»). */
function otherPanelInObservation(observation: string, panel: PanelId) {
  const found = [...canon(observation).matchAll(/(?:PANEL\s*|\bP)([123])\b/g)].map((m) => m[1]);
  return found.find((d) => `P${d}` !== panel) ?? null;
}
type BaseIndex = { byUser: Map<string, number[]>; rows: unknown[][]; col: Record<"tc" | "user" | "panel" | "plan" | "next" | "due", number | null> } | null;

function indexBase(base: unknown[][] | null): BaseIndex {
  if (!base) return null;
  const h = headerIndex(base, ["USUARIO", "F. PROXIMO PAGO"]);
  if (h < 0) return null;
  const header = (base[h] ?? []).map(canon);
  const col = (name: string) => { const i = header.indexOf(name); return i < 0 ? null : i; };
  const c = { tc: col("TC"), user: col("USUARIO"), panel: col("PANEL"), plan: col("PLAN ACTIVO"), next: col("F. PROXIMO PAGO"), due: col("F.VENCIMIENTO") };
  const byUser = new Map<string, number[]>();
  for (let i = h + 1; i < base.length; i++) {
    const key = canon((base[i] ?? [])[c.user!]);
    if (!key) continue;
    byUser.set(key, [...(byUser.get(key) ?? []), i]);
  }
  return { byUser, rows: base, col: c };
}

/** Pago CONFIRMADO JM y ENLAZADO a una fila de BASE GENERAL (hojas de medio de pago del mes). */
type PaymentLink = { sheet: string; row: number; tarifa: string | null; moneda: string; valor: string; plan: string };

/** Filas BASE (número absoluto) → pagos CONFIRMADO JM enlazados en ZELLE/PAYPAL/TRANSF del mes. */
function confirmedPayments(payments: CreditosHoyInput["payments"]) {
  const out = new Map<number, PaymentLink[]>();
  for (const p of payments ?? []) {
    const h = headerIndex(p.rows, ["CONFIRMACION", "FILA_BASE", "ESTADO_ENLACE"]);
    if (h < 0) continue;
    const header = (p.rows[h] ?? []).map(canon);
    const at = (name: string) => header.indexOf(name);
    const [conf, fila, link, tarifa, moneda, valor, plan] = ["CONFIRMACION", "FILA_BASE", "ESTADO_ENLACE", "VALIDACION_TARIFA", "MONEDA_PAGO", "VALOR_PAGO", "PLAN_CANONICO"].map(at);
    for (let i = h + 1; i < p.rows.length; i++) {
      const row = p.rows[i] ?? [];
      if (canon(row[conf]) !== "CONFIRMADO JM" || canon(row[link]) !== "ENLAZADO") continue;
      const n = Number(clean(row[fila]));
      if (!Number.isInteger(n) || n <= 0) continue;
      const v = (k: number) => (k < 0 ? "" : clean(row[k]));
      // Sin columna VALIDACION_TARIFA no hay control de tarifa que aplicar (hojas antiguas): null.
      out.set(n, [...(out.get(n) ?? []), { sheet: p.sheet, row: i + 1, tarifa: tarifa < 0 ? null : canon(row[tarifa]), moneda: v(moneda), valor: v(valor), plan: v(plan) }]);
    }
  }
  return out;
}

// ─── Excepciones accionables (Dirección: CONFIRMAR · CORREGIR · RECHAZAR) ────────────────────────────────────
// Una excepción no es un callejón sin salida: dice qué impide continuar, con qué evidencia, y propone una salida.
// La decisión se guarda fuera de Google Sheets (base privada de la intranet) y la proyección se reevalúa con ella.
// Solo aplica si la evidencia no cambió (fingerprint): si el dato de la hoja cambia, la tarjeta vuelve a aparecer.
export type DecisionAction = "CONFIRMAR" | "CORREGIR" | "RECHAZAR";
export type CycleDecision = { subject: string; fingerprint: string; action: DecisionAction; value: string | null; by: string; at: string };
export type ExceptionKind = "PANEL" | "DUPLICADO" | "NO_EN_BASE" | "COBERTURA" | "TARIFA" | "EXTENSION";
export type CycleException = {
  subject: string;
  fingerprint: string;
  kind: ExceptionKind;
  /** Qué impide continuar. */
  title: string;
  evidence: string[];
  /** Propuesta concreta (CONFIRMAR la aplica). null: no hay propuesta automática; usar CORREGIR o RECHAZAR. */
  proposal: string | null;
  /** CORREGIR: único dato necesario, con opciones válidas. */
  correct: { label: string; options: Array<{ value: string; label: string }> } | null;
  /** Qué ocurre si se rechaza la propuesta. */
  reject: string;
  references: string[];
};

export const EXCEPTION_TITLE: Record<ExceptionKind, string> = {
  PANEL: "Panel contradictorio",
  DUPLICADO: "USUARIO repetido en BASE GENERAL",
  NO_EN_BASE: "USUARIO sin fila en BASE GENERAL",
  COBERTURA: "Cobertura (Caso B) no verificable",
  TARIFA: "Pago confirmado con tarifa sin validar",
  EXTENSION: "Servicio extendido sin crédito",
};

type Ctx = { base: BaseIndex; financeOk: boolean; paid: Map<number, PaymentLink[]>; decisions: Map<string, CycleDecision> };

function decided(ctx: Ctx, ex: Pick<CycleException, "subject" | "fingerprint">) {
  const d = ctx.decisions.get(ex.subject);
  return d && d.fingerprint === ex.fingerprint ? d : null;
}

function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

type Gate = { state: CreditState; basis: "A" | "B" | "E" | null; reason: string; exception: CycleException | null; baseRow: number | null; planTarget: string | null };
const gateOf = (state: CreditState, reason: string, extra: Partial<Gate> = {}): Gate => ({ state, basis: null, reason, exception: null, baseRow: null, planTarget: null, ...extra });

/** Contradicción de panel (BASE GENERAL u observación de CONTROL). null = Dirección confirmó el panel de esta hoja. */
function panelDecision(task: Pick<CreditTask, "panel" | "user" | "reference">, ctx: Ctx, source: "BASE" | "OBS", other: string, what: string, evidence: string): Gate | null {
  const ex: CycleException = {
    subject: `PANEL:${task.panel}:${canon(task.user)}:${source}`, fingerprint: other, kind: "PANEL",
    title: `El crédito está en CONTROL ${task.panel}, pero ${what}.`,
    evidence: [`CONTROL: ${task.reference}`, evidence],
    proposal: `Tomar ${task.panel} (donde está la tarea de CONTROL) como panel del cliente y evaluar su habilitación.`,
    correct: { label: "Panel real del cliente", options: (["P1", "P2", "P3"] as const).map((p) => ({ value: p, label: p === task.panel ? `${p} · el de esta hoja CONTROL` : `${p} · registrar el crédito en CONTROL ${p}` })) },
    reject: "No se otorga crédito en este panel.", references: [task.reference],
  };
  const d = decided(ctx, ex);
  if (!d) return gateOf("REQUIERE_REVISION", `${ex.title} Dirección decide el panel.`, { exception: ex });
  if (d.action === "RECHAZAR") return gateOf("NO_HABILITADO", "Dirección rechazó el panel de esta hoja: no otorgar crédito aquí.");
  if (d.action === "CORREGIR" && d.value !== task.panel) return gateOf("NO_HABILITADO", `Dirección: el cliente pertenece a ${d.value}; registrar y ejecutar el crédito en CONTROL ${d.value}.`);
  return null;
}

/** Habilitación financiera S0 v0.3 §7.1 (Caso A / Caso B) con identidad inequívoca y decisiones de Dirección aplicadas. */
function financialGate(task: Pick<CreditTask, "panel" | "user" | "observation" | "reference">, creditDate: string, ctx: Ctx): Gate {
  const { base } = ctx;
  if (!base || !ctx.financeOk) return gateOf("REQUIERE_REVISION", "No fue posible leer BASE GENERAL o las hojas de pago: no se decide la habilitación.");
  const key = canon(task.user);
  const rowInfo = (i: number) => { const r = base.rows[i] ?? []; const at = (k: number | null) => (k == null ? "" : clean(r[k])); return `fila ${i + 1} · ${at(base.col.panel) || "sin panel"} · ${at(base.col.plan) || "sin plan"} · F.PRÓXIMO PAGO ${at(base.col.next) || "—"}`; };
  let matches = base.byUser.get(key) ?? [];
  const obsPanel = otherPanelInObservation(task.observation, task.panel);
  if (obsPanel) {
    const r = panelDecision(task, ctx, "OBS", obsPanel, `la observación de CONTROL indica Panel ${obsPanel}`, `Observación de CONTROL: «${task.observation}»`);
    if (r) return r;
  }

  if (matches.length === 0) {
    const near = [...base.byUser.entries()].filter(([u, rows]) => rows.length === 1 && editDistance(u, key) <= 2).slice(0, 5).map(([, rows]) => rows[0]);
    const ex: CycleException = {
      subject: `NO_EN_BASE:${key}`, fingerprint: `${key}|${near.join(",")}`, kind: "NO_EN_BASE",
      title: `El USUARIO ${task.user} de ${task.reference} no tiene fila en BASE GENERAL: no se puede verificar pago ni cobertura.`,
      evidence: [`CONTROL: ${task.reference} · ${task.user}`, near.length ? `Usuarios parecidos en BASE GENERAL: ${near.map((i) => `${clean((base.rows[i] ?? [])[base.col.user!])} (fila ${i + 1})`).join(", ")}` : "Sin usuarios parecidos en BASE GENERAL."],
      proposal: "Tratarlo como ALTA PENDIENTE: no otorgar crédito hasta que el cliente esté en BASE GENERAL.",
      correct: near.length ? { label: "Fila de BASE GENERAL que corresponde a este USUARIO", options: near.map((i) => ({ value: String(i + 1), label: rowInfo(i) })) } : null,
      reject: "No se otorga crédito y el caso queda registrado como rechazado.", references: [task.reference],
    };
    const d = decided(ctx, ex);
    if (!d) return gateOf("REQUIERE_REVISION", `El USUARIO no existe en BASE GENERAL. Dirección decide: ${ex.proposal}`, { exception: ex });
    if (d.action === "CORREGIR" && d.value && near.includes(Number(d.value) - 1)) matches = [Number(d.value) - 1];
    else return gateOf("NO_HABILITADO", d.action === "RECHAZAR" ? "Dirección rechazó la propuesta para un USUARIO sin BASE GENERAL: no otorgar crédito." : "ALTA PENDIENTE (Dirección): no otorgar crédito hasta incorporar el cliente a BASE GENERAL.");
  }

  if (matches.length > 1) {
    const samePanel = matches.filter((i) => { const p = panelDigit(clean((base.rows[i] ?? [])[base.col.panel!])); return !p || `P${p}` === task.panel; });
    const proposalRow = samePanel.length === 1 ? samePanel[0] : null;
    const ex: CycleException = {
      subject: `DUPLICADO:${key}`, fingerprint: matches.map((i) => i + 1).join(","), kind: "DUPLICADO",
      title: `El USUARIO ${task.user} aparece ${matches.length} veces en BASE GENERAL: no se sabe qué fila valida el pago o la cobertura.`,
      evidence: matches.map(rowInfo),
      proposal: proposalRow != null ? `Usar la fila ${proposalRow + 1} (única registrada en ${task.panel}).` : null,
      correct: { label: "Fila de BASE GENERAL que corresponde a este cliente", options: matches.map((i) => ({ value: String(i + 1), label: rowInfo(i) })) },
      reject: "No se otorga crédito hasta depurar el duplicado en BASE GENERAL.", references: [task.reference],
    };
    const d = decided(ctx, ex);
    const chosen = d?.action === "CONFIRMAR" ? proposalRow : d?.action === "CORREGIR" && d.value && matches.includes(Number(d.value) - 1) ? Number(d.value) - 1 : null;
    if (d?.action === "RECHAZAR") return gateOf("NO_HABILITADO", "Dirección rechazó la propuesta para el USUARIO repetido: no otorgar crédito hasta depurar BASE GENERAL.");
    if (chosen == null) return gateOf("REQUIERE_REVISION", `El USUARIO aparece ${matches.length} veces en BASE GENERAL. Dirección decide qué fila aplica.`, { exception: ex });
    matches = [chosen];
  }

  const index = matches[0];
  const row = base.rows[index] ?? [];
  const at = (i: number | null) => (i == null ? "" : clean(row[i]));
  const basePanel = panelDigit(at(base.col.panel));
  if (basePanel && `P${basePanel}` !== task.panel) {
    const r = panelDecision(task, ctx, "BASE", basePanel, `BASE GENERAL (fila ${index + 1}) indica Panel ${basePanel}`, `BASE GENERAL fila ${index + 1}: ${at(base.col.panel) || "sin panel"}`);
    if (r) return { ...r, baseRow: index + 1 };
  }
  // Caso A: pago del ciclo CONFIRMADO JM, enlazado a la fila y con tarifa coherente (regla operativa §4.1).
  const links = ctx.paid.get(index + 1) ?? [];
  const coherent = links.filter((l) => l.tarifa == null || l.tarifa === "COINCIDE PLAN");
  if (coherent.length) return gateOf("HABILITADO", "Caso A: CONFIRMADO JM enlazado a la fila de BASE GENERAL.", { basis: "A", baseRow: index + 1 });

  // Caso B: cobertura previamente pagada vigente.
  const next = parseDate(at(base.col.next));
  const plan = at(base.col.plan);
  let coverage: { ok: true } | { ok: false; why: string } | null = null;
  if (at(base.col.tc) === "1" && next && next > creditDate) {
    const months = planMonths(plan);
    coverage = months == null ? { ok: false, why: `PLAN ACTIVO «${plan || "vacío"}» no es interpretable` }
      : next > addMonths(creditDate, months) ? { ok: false, why: `F. PRÓXIMO PAGO (${next}) excede la cobertura de ${plan} contada desde ${creditDate}` } : { ok: true };
    if (coverage.ok) return gateOf("HABILITADO", `Caso B: cobertura vigente hasta ${next} (${plan}).`, { basis: "B", baseRow: index + 1 });
  }

  // Pago confirmado pero con tarifa sin validar (moneda, cambio de plan…): decide Dirección.
  if (links.length) {
    const l = links[0];
    const plans = [...new Set(base.rows.slice(1).map((r) => clean((r ?? [])[base.col.plan!])).filter((p) => planMonths(p) != null))].sort((a, b) => planMonths(a)! - planMonths(b)! || a.localeCompare(b)).slice(0, 12);
    const ex: CycleException = {
      subject: `TARIFA:${l.sheet}:${l.row}`, fingerprint: `${l.tarifa}|${l.moneda}|${l.valor}|${index + 1}`, kind: "TARIFA",
      title: `${l.sheet} fila ${l.row} está CONFIRMADO JM, pero su tarifa no está validada (${l.tarifa || "sin validación"}).`,
      evidence: [`Pago: ${l.moneda || "moneda ?"} ${l.valor || "?"} · plan del pago ${l.plan || "—"}`, `BASE GENERAL fila ${index + 1}: PLAN ACTIVO ${plan || "—"}`, `Cobertura previa (Caso B): ${coverage && !coverage.ok ? coverage.why : "no aplica"}`],
      proposal: `Aceptar el pago como pago del ciclo (Caso A) para ${plan || "el plan activo"}.`,
      correct: plans.length ? { label: "Plan que paga el cliente", options: plans.map((p) => ({ value: p, label: canon(p) === canon(plan) ? `${p} · plan actual` : `${p} · cambio de plan` })) } : null,
      reject: "El pago no habilita el crédito; continúa el flujo de cobro.", references: [task.reference, `${l.sheet}!${l.row}`],
    };
    const d = decided(ctx, ex);
    if (!d) return gateOf("REQUIERE_REVISION", `${ex.title} Dirección decide si el pago habilita el crédito.`, { exception: ex, baseRow: index + 1 });
    if (d.action === "CONFIRMAR") return gateOf("HABILITADO", "Caso A: pago aceptado por Dirección (tarifa).", { basis: "A", baseRow: index + 1 });
    if (d.action === "CORREGIR" && d.value && plans.includes(d.value)) return gateOf("HABILITADO", `Caso A: pago aceptado por Dirección para ${d.value}.`, { basis: "A", baseRow: index + 1, planTarget: d.value });
    // RECHAZAR: el pago no cuenta; se evalúa lo demás.
  }

  if (coverage && !coverage.ok) {
    const ex: CycleException = {
      subject: `COBERTURA:${key}`, fingerprint: `${next}|${canon(plan)}`, kind: "COBERTURA",
      title: `Sin pago del mes; la cobertura previa no se puede verificar: ${coverage.why}.`,
      evidence: [`BASE GENERAL fila ${index + 1}: TC ${at(base.col.tc) || "—"} · ${plan || "sin plan"} · F.PRÓXIMO PAGO ${next}`, `Fecha del crédito: ${creditDate}`],
      proposal: `Aceptar la cobertura vigente hasta ${next} (Caso B).`,
      correct: { label: "Meses que cubre el plan (incluida bonificación)", options: [1, 2, 3, 4, 6, 7, 12, 13].map((m) => ({ value: String(m), label: `${m} ${m === 1 ? "mes" : "meses"}` })) },
      reject: "No se otorga crédito sin pago confirmado.", references: [task.reference],
    };
    const d = decided(ctx, ex);
    if (!d) return gateOf("REQUIERE_REVISION", `${ex.title} Dirección decide la cobertura.`, { exception: ex, baseRow: index + 1 });
    if (d.action === "CONFIRMAR") return gateOf("HABILITADO", `Caso B: cobertura hasta ${next} aceptada por Dirección.`, { basis: "B", baseRow: index + 1 });
    if (d.action === "CORREGIR" && d.value) {
      const months = Number(d.value);
      if (Number.isInteger(months) && months > 0 && !!next && next <= addMonths(creditDate, months)) return gateOf("HABILITADO", `Caso B: cobertura de ${months} meses (Dirección) hasta ${next}.`, { basis: "B", baseRow: index + 1 });
      return gateOf("NO_HABILITADO", `Con ${d.value} meses (Dirección) la cobertura no alcanza ${next}: no otorgar crédito.`, { baseRow: index + 1 });
    }
    return gateOf("NO_HABILITADO", "Dirección rechazó la cobertura: no otorgar crédito sin pago confirmado.", { baseRow: index + 1 });
  }
  return gateOf("NO_HABILITADO", "Sin CONFIRMADO JM enlazado ni cobertura vigente en BASE GENERAL: no ejecutar.", { baseRow: index + 1 });
}

/** Fila de CONTROL que extiende el servicio sin registrar crédito (LIBERADO / Promoción / Cortesía con H). */
function extensionOf(f: Pick<CreditTask, "panel" | "row" | "reference" | "user" | "recharge" | "origin" | "tc" | "credit" | "newDue" | "creditDate">, ctx: Ctx, gate: Gate | null): CycleException | null {
  if (f.tc <= 0 || (f.credit ?? 0) > 0 || !f.newDue) return null;
  if (!/LIBERADO/.test(canon(f.recharge)) && !/PROMOCION|CORTESIA/.test(canon(f.origin))) return null;
  return {
    subject: `EXTENSION:${f.panel}:${f.row}:${canon(f.user)}`, fingerprint: `${canon(f.recharge)}|${canon(f.origin)}|${f.newDue}|${f.credit ?? ""}`, kind: "EXTENSION",
    title: `${f.reference}: ${f.recharge || "sin RECARGA"} (${f.origin || "sin ORIGEN"}) registra nuevo vencimiento ${f.newDue} con CREDITO ${f.credit ?? "vacío"}: el servicio se extendió sin crédito y sin excepción aprobada.`,
    evidence: [`CONTROL: TC ${f.tc} · RECARGA ${f.recharge || "—"} · ORIGEN ${f.origin || "—"} · CREDITO ${f.credit ?? "vacío"} · F.VENCIMIENTO ${f.newDue} · FECHA ${f.creditDate ?? "—"}`, `Habilitación financiera: ${gate ? gate.reason : "no evaluada"}`],
    proposal: `Aprobar la extensión como excepción (${f.origin || f.recharge}): sustituye el crédito y el ciclo continúa con ${f.newDue} hacia BASE GENERAL.`,
    correct: { label: "Qué representa esta fila", options: [
      { value: "FALTA_CREDITO", label: "Se ejecutó un crédito y falta registrarlo en CONTROL (asesor)" },
      { value: "NO_ES_SERVICIO", label: "No es un servicio del cliente: excluir del ciclo" },
    ] },
    reject: "La extensión no se acepta: revertir en el panel o ejecutar un crédito habilitado.", references: [f.reference],
  };
}

/** Cierre del ciclo: ¿la F.VENCIMIENTO de BASE GENERAL ya es la H registrada en CONTROL? Solo lectura. */
function baseSync(user: string, newDue: string, base: BaseIndex, baseRow: number | null = null): BaseSync {
  if (!base || base.col.due == null) return { state: "SIN_VERIFICAR", baseDue: null, detail: "BASE GENERAL no disponible: no se verifica el match." };
  const matches = baseRow ? [baseRow - 1] : base.byUser.get(canon(user)) ?? [];
  if (matches.length !== 1) return { state: "SIN_VERIFICAR", baseDue: null, detail: matches.length ? `USUARIO repetido ${matches.length} veces en BASE GENERAL: match no inequívoco.` : "USUARIO no existe en BASE GENERAL." };
  const baseDue = parseDate((base.rows[matches[0]] ?? [])[base.col.due]);
  if (baseDue === newDue) return { state: "ACTUALIZADA", baseDue, detail: `BASE GENERAL (fila ${matches[0] + 1}) ya tiene F.VENCIMIENTO ${newDue}.` };
  return { state: "PENDIENTE", baseDue, detail: `Llevar ${newDue} a BASE GENERAL (fila ${matches[0] + 1}); hoy tiene ${baseDue ?? "sin fecha"}.` };
}

const num = (v: unknown) => { const t = clean(v).replace(",", "."); if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n : null; };
const SUMMARY: Array<[keyof Omit<CreditKpi, "avance">, RegExp]> = [
  ["hoy", /CREDITOS POR OTORGAR HOY/], ["programados", /CREDITOS POR OTORGAR/], ["otorgados", /CREDITOS OTORGADOS/], ["faltantes", /FALTAN POR OTORGAR/],
];
const kpiOf = (programados: number, otorgados: number, hoy: number): CreditKpi =>
  ({ programados, otorgados, faltantes: programados - otorgados, hoy, avance: programados > 0 ? Math.round((otorgados / programados) * 1000) / 10 : null });

/** Resultado de la cola diaria para una fila con extensión (LIBERADO/Promoción) según la decisión de Dirección. */
function extensionTask(ex: CycleException, ctx: Ctx, normal: () => Pick<CreditTask, "state" | "basis" | "reason"> & { exception?: CycleException | null }, newDue: string) {
  const d = decided(ctx, ex);
  if (!d) return { state: "REQUIERE_REVISION" as const, basis: null, reason: `${ex.title} Dirección decide.`, exception: ex };
  if (d.action === "CONFIRMAR") return { state: "EJECUTADO" as const, basis: "E" as const, reason: `Extensión aprobada por Dirección como excepción: nuevo vencimiento ${newDue}.`, exception: null };
  if (d.action === "RECHAZAR") return { state: "NO_HABILITADO" as const, basis: null, reason: "Dirección rechazó la extensión sin crédito: no extender el servicio; revertir o ejecutar un crédito habilitado.", exception: null };
  if (d.value === "NO_ES_SERVICIO") return null;
  return normal(); // FALTA_CREDITO: el asesor registra el crédito real; se aplica la habilitación normal.
}

function projectPanel(panel: PanelId, sheet: string | null, rows: unknown[][] | null, input: CreditosHoyInput, ctx: Ctx): PanelCredits {
  const empty = (status: PanelCredits["status"], reason: string): PanelCredits => ({ panel, sheet, status, reason, columns: null, warning: null, kpi: null, sheetKpi: null, dataRange: null, tasks: [], pending: [], cycles: [] });
  if (input.readError) return empty("REQUIERE_REVISION", input.readError);
  if (!sheet) return empty("REQUIERE_REVISION", `No existe la hoja CONTROL ${panel} del mes ${input.targetMonth}.`);
  if (!rows) return empty("REQUIERE_REVISION", "Lectura fallida de la hoja CONTROL.");
  const h = headerIndex(rows, ["TC", "USUARIO", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO"]);
  if (h < 0) return empty("REQUIERE_DECISION", "No se encontraron los encabezados TC, USUARIO, FECHA, F.VENCIMIENTO, ORIGEN y CREDITO.");
  const header = (rows[h] ?? []).map(canon);
  for (const name of ["TC", "USUARIO", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO"]) if (header.filter((x) => x === name).length !== 1) return empty("REQUIERE_DECISION", `Encabezado ${name} ausente o repetido.`);
  const col = (name: string) => { const i = header.indexOf(name); return i < 0 ? null : i; };
  const c = { tc: col("TC")!, advisor: col("ASESOR"), recharge: col("RECARGA"), user: col("USUARIO")!, date: col("FECHA")!, due: col("F.VENCIMIENTO")!, origin: col("ORIGEN")!, credit: col("CREDITO")!, observation: col("OBSERVACION") };
  const columns = { date: columnLetter(c.date), due: columnLetter(c.due) };
  const labelCol = c.advisor ?? 1;
  const baseIndex = ctx.base;

  // Rango de datos: desde el encabezado hasta la fila anterior al bloque resumen («⬅️ Creditos por otorgar …»). Sin números fijos.
  let end = rows.length;
  const sheetKpi: NonNullable<PanelCredits["sheetKpi"]> = {};
  for (let i = h + 1; i < rows.length; i++) {
    const label = canon((rows[i] ?? [])[labelCol]);
    const match = SUMMARY.find(([, re]) => re.test(label));
    if (!match) continue;
    if (end === rows.length) end = i;
    const value = num((rows[i] ?? [])[c.tc]);
    if (value != null && sheetKpi[match[0]] == null) sheetKpi[match[0]] = value;
  }
  const dataRange = { first: h + 2, last: end };

  // Aviso de coherencia (no cambia la regla): si ninguna FECHA cae en el mes de la hoja, se informa el rango real.
  const dated = rows.slice(h + 1, end).map((r) => parseDate((r ?? [])[c.date])).filter((d): d is string => !!d).sort();
  const warning = dated.length && !dated.some((d) => d.startsWith(input.targetMonth))
    ? `Ninguna FECHA (${columns.date}) de esta hoja cae en ${input.targetMonth}: van de ${dated[0]} a ${dated[dated.length - 1]}. Se aplica igual la regla G = hoy.`
    : null;

  let programados = 0, otorgados = 0, hoy = 0;
  const tasks: CreditTask[] = [];
  const pending: CreditTask[] = [];
  const cycles: CycleItem[] = [];
  const seen = new Map<string, number>();
  for (let i = h + 1; i < end; i++) {
    const row = rows[i] ?? [];
    const at = (k: number | null) => (k == null ? "" : clean(row[k]));
    const origin = canon(at(c.origin));
    if (origin === "COMPRA") continue; // inventario del panel: fuera de todos los KPI y de la cola
    const tc = num(row[c.tc]) ?? 0;
    const credit = num(row[c.credit]);
    const creditDate = parseDate(at(c.date));
    programados += tc;
    otorgados += credit ?? 0;
    if (creditDate === input.today) hoy += tc;

    const user = at(c.user);
    if (!user) continue;
    const rawDue = at(c.due);
    const newDue = parseDate(rawDue);
    const fields: Omit<CreditTask, "state" | "basis" | "reason" | "baseSync" | "exception"> = {
      panel, sheet, row: i + 1, reference: `${sheet}!${columns.date}${i + 1}`, user, advisor: at(c.advisor), recharge: at(c.recharge),
      creditDate, creditTime: at(c.date).match(/\d{1,2}:\d{2}/)?.[0] ?? "", tc, credit, newDue, origin: at(c.origin), observation: at(c.observation),
    };

    // Ciclo del mes (todas las filas de cliente con crédito programado o ejecutado): semáforo E2E.
    if (tc > 0 || (credit ?? 0) > 0) {
      const item = cycleOf(fields, origin, ctx, input.today);
      if (item) cycles.push(item);
    }

    const isToday = creditDate === input.today;
    const isPastPending = !!creditDate && creditDate < input.today && tc > 0 && (credit ?? 0) < tc;
    if (!isToday && !isPastPending) continue;

    const gate = (date: string) => financialGate(fields, date, ctx);
    const ext = extensionOf(fields, ctx, null);

    if (isPastPending) {
      // Un crédito vencido sin ejecución no es, por sí solo, una excepción.
      // Se evalúa con el mismo gate financiero Caso A / Caso B que la cola de hoy.
      let pastResult: Pick<CreditTask, "state" | "basis" | "reason"> & { exception?: CycleException | null } | null;
      if (origin === "SIN PAGAR") {
        pastResult = { state: "SIN_PAGAR", basis: null, reason: "ORIGEN «Sin Pagar»: pendiente de gestión de pago; no ejecutar sin habilitación." };
      } else if (rawDue && !newDue) {
        pastResult = { state: "REQUIERE_REVISION", basis: null, reason: "F.VENCIMIENTO registrada no es una fecha válida. Acción: corregir F.VENCIMIENTO en CONTROL." };
      } else if (tc === 0) {
        pastResult = newDue && origin
          ? { state: "EJECUTADO", basis: null, reason: `Movimiento sin consumo de crédito (TC 0, ${fields.origin}): nuevo vencimiento ${newDue}.` }
          : { state: "REQUIERE_REVISION", basis: null, reason: "TC 0 sin evidencia suficiente. Acción: corregir ORIGEN/F.VENCIMIENTO en CONTROL y volver a validar." };
      } else if (ext) {
        pastResult = extensionTask(ext, ctx, () => gate(creditDate), newDue!);
      } else {
        pastResult = gate(creditDate);
      }
      if (!pastResult) continue;
      pending.push({ ...fields, ...pastResult, exception: pastResult.exception ?? null, baseSync: pastResult.state === "EJECUTADO" && newDue ? baseSync(fields.user, newDue, baseIndex) : null });
      continue;
    }

    seen.set(canon(user), (seen.get(canon(user)) ?? 0) + 1);
    let result: Pick<CreditTask, "state" | "basis" | "reason"> & { exception?: CycleException | null } | null;
    if (credit != null && credit > 0) {
      result = newDue && newDue <= input.today
        ? { state: "REQUIERE_REVISION", basis: null, reason: `CREDITO registrado, pero F.VENCIMIENTO (${newDue}) no es posterior a la fecha del crédito. Acción: corregir F.VENCIMIENTO en CONTROL con la fecha del panel.` }
        : { state: "EJECUTADO", basis: null, reason: newDue ? `Crédito registrado en CONTROL (${fields.origin || "sin ORIGEN"}): nuevo vencimiento ${newDue}.` : "CREDITO registrado en CONTROL, pero sin F.VENCIMIENTO (H): falta el dato para BASE GENERAL." };
    } else if (origin === "SIN PAGAR") {
      result = { state: "SIN_PAGAR", basis: null, reason: "ORIGEN «Sin Pagar»: pendiente de gestión de pago; no ejecutar sin habilitación." };
    } else if (rawDue && !newDue) {
      result = { state: "REQUIERE_REVISION", basis: null, reason: "F.VENCIMIENTO registrada no es una fecha válida. Acción: corregir F.VENCIMIENTO en CONTROL." };
    } else if (tc === 0) {
      result = newDue && origin
        ? { state: "EJECUTADO", basis: null, reason: `Movimiento sin consumo de crédito (TC 0, ${fields.origin}): nuevo vencimiento ${newDue}.` }
        : { state: "REQUIERE_REVISION", basis: null, reason: "TC 0 en CONTROL sin ORIGEN ni F.VENCIMIENTO: no hay crédito programado claro. Acción: corregir ORIGEN/F.VENCIMIENTO en CONTROL." };
    } else if (ext) {
      result = extensionTask(ext, ctx, () => gate(input.today), newDue!);
    } else {
      const r = gate(input.today);
      result = newDue ? { ...r, reason: `H anticipada (${newDue}) sin CREDITO: crédito aún no ejecutado. ${r.reason}` } : r;
    }
    if (!result) continue;
    tasks.push({ ...fields, ...result, exception: result.exception ?? null, baseSync: result.state === "EJECUTADO" ? (newDue ? baseSync(fields.user, newDue, baseIndex) : { state: "SIN_VERIFICAR", baseDue: null, detail: "Sin F.VENCIMIENTO (H) en CONTROL: no hay fecha que llevar a BASE GENERAL." }) : null });
  }
  // Usuario repetido en la cola del día del mismo panel: no se decide en silencio.
  for (const t of tasks) {
    if ((seen.get(canon(t.user)) ?? 0) > 1 && t.state !== "EJECUTADO") {
      t.state = "REQUIERE_REVISION";
      t.basis = null;
      t.exception = null;
      t.reason = "El USUARIO aparece más de una vez en la cola de hoy de este panel. Acción: dejar una sola fila en CONTROL.";
    }
  }
  return { panel, sheet, status: "OK", reason: null, columns, warning, kpi: kpiOf(programados, otorgados, hoy), sheetKpi: Object.keys(sheetKpi).length ? sheetKpi : null, dataRange, tasks, pending, cycles };
}

// ─── Semáforo E2E del ciclo (regla operativa v1.0 §7.1) ───────────────────────────────────────────────────────
// VERDE = habilitación (Caso A/B o excepción aprobada) + crédito real en CONTROL + F.VENCIMIENTO válida en CONTROL
//         + F.VENCIMIENTO propagada a BASE GENERAL + sin excepción pendiente. Todo lo demás es AMARILLO.
// CONFIRMADO JM por sí solo nunca produce VERDE.
export type CycleStep = "DIRECCION" | "PAGO" | "CREDITO" | "VENCIMIENTO" | "BASE" | "PLAN" | "CERRADO";
export const CYCLE_STEP_LABEL: Record<CycleStep, string> = {
  DIRECCION: "Decisión de Dirección", PAGO: "Pago / cobertura", CREDITO: "Crédito por ejecutar", VENCIMIENTO: "F.VENCIMIENTO en CONTROL",
  BASE: "Propagación a BASE GENERAL", PLAN: "Plan en BASE GENERAL", CERRADO: "Ciclo cerrado",
};
export type CycleItem = {
  panel: PanelId; row: number; reference: string; user: string; creditDate: string | null; credit: number | null; newDue: string | null;
  basis: "A" | "B" | "E" | null; color: "VERDE" | "AMARILLO"; step: CycleStep; cause: string; owner: string;
  exception: CycleException | null; baseSync: BaseSync | null;
};

function cycleOf(f: Omit<CreditTask, "state" | "basis" | "reason" | "baseSync" | "exception">, origin: string, ctx: Ctx, today: string): CycleItem | null {
  const item = (color: CycleItem["color"], step: CycleStep, cause: string, owner: string, extra: Partial<CycleItem> = {}): CycleItem =>
    ({ panel: f.panel, row: f.row, reference: f.reference, user: f.user, creditDate: f.creditDate, credit: f.credit, newDue: f.newDue, basis: null, color, step, cause, owner, exception: null, baseSync: null, ...extra });
  if (!f.creditDate) return item("AMARILLO", "CREDITO", "FECHA (G) de CONTROL no es una fecha válida: corregir en CONTROL.", "Asesor");
  const gate = origin === "SIN PAGAR" ? gateOf("SIN_PAGAR", "ORIGEN «Sin Pagar» en CONTROL.") : financialGate(f, f.creditDate, ctx);
  const ext = extensionOf(f, ctx, gate);
  const extDecision = ext ? decided(ctx, ext) : null;
  if (ext && extDecision?.action === "CORREGIR" && extDecision.value === "NO_ES_SERVICIO") return null;
  const approvedExtension = !!ext && extDecision?.action === "CONFIRMAR";
  const executed = (f.credit ?? 0) > 0 || approvedExtension;
  const basis = approvedExtension ? "E" : gate.state === "HABILITADO" ? gate.basis : null;

  if (ext && !extDecision) return item("AMARILLO", "DIRECCION", ext.title, "Dirección", { exception: ext });
  if (ext && extDecision?.action === "RECHAZAR") return item("AMARILLO", "CREDITO", "Extensión sin crédito rechazada por Dirección: revertir en el panel o ejecutar un crédito habilitado y registrarlo en CONTROL.", "Asesor");
  if (gate.exception) return item("AMARILLO", "DIRECCION", gate.exception.title, "Dirección", { exception: gate.exception });
  if (!approvedExtension && gate.state !== "HABILITADO") {
    return executed
      ? item("AMARILLO", "PAGO", `Crédito ejecutado sin habilitación financiera: ${gate.reason}`, "Dirección (JM) / cobro")
      : item("AMARILLO", "PAGO", `Pendiente de pago: ${gate.reason}`, "Cobro");
  }
  if (!executed) {
    return f.creditDate > today
      ? item("AMARILLO", "CREDITO", `Habilitado (${basis === "B" ? "Caso B" : "Caso A"}); crédito programado para ${f.creditDate}.`, "Asesor", { basis })
      : item("AMARILLO", "CREDITO", `Habilitado (${basis === "B" ? "Caso B" : "Caso A"}); crédito pendiente de ejecutar en el panel y registrar en CONTROL.`, "Asesor", { basis });
  }
  if (!f.newDue || f.newDue <= f.creditDate) return item("AMARILLO", "VENCIMIENTO", f.newDue ? `F.VENCIMIENTO (${f.newDue}) no es posterior a la fecha del crédito: corregir en CONTROL con la fecha del panel.` : "Crédito ejecutado sin F.VENCIMIENTO (H) en CONTROL: registrarla desde el panel.", "Asesor", { basis });
  const sync = baseSync(f.user, f.newDue, ctx.base, gate.baseRow);
  if (sync.state !== "ACTUALIZADA") return item("AMARILLO", "BASE", sync.detail, "Back Office", { basis, baseSync: sync });
  if (gate.planTarget && ctx.base && gate.baseRow && canon(clean((ctx.base.rows[gate.baseRow - 1] ?? [])[ctx.base.col.plan!])) !== canon(gate.planTarget))
    return item("AMARILLO", "PLAN", `Cambio de plan aprobado por Dirección: actualizar PLAN ACTIVO a ${gate.planTarget} en BASE GENERAL (fila ${gate.baseRow}).`, "Back Office", { basis, baseSync: sync });
  return item("VERDE", "CERRADO", `Ciclo cerrado: ${basis === "E" ? "excepción aprobada" : basis === "B" ? "Caso B" : "Caso A"} + crédito en CONTROL + ${f.newDue} en BASE GENERAL.`, "—", { basis, baseSync: sync });
}

export type CycleSummary = {
  items: CycleItem[];
  totals: { VERDE: number; AMARILLO: number };
  bySteps: Record<CycleStep, number>;
  /** Una tarjeta por excepción (sin repetir el mismo asunto). */
  exceptions: CycleException[];
};

function summarizeCycles(panels: PanelCredits[]): CycleSummary {
  const items = panels.flatMap((p) => p.cycles);
  // Un crédito anterior queda superado si BASE GENERAL tiene el vencimiento de un crédito posterior del mismo USUARIO.
  const lastDue = new Map<string, string>();
  for (const it of items) if ((it.credit ?? 0) > 0 && it.newDue) { const k = canon(it.user); if (!lastDue.has(k) || it.newDue > lastDue.get(k)!) lastDue.set(k, it.newDue); }
  for (const it of items) {
    if (it.step !== "BASE" || !it.baseSync?.baseDue || !it.newDue) continue;
    const latest = lastDue.get(canon(it.user));
    if (latest && latest > it.newDue && it.baseSync.baseDue === latest) {
      it.color = "VERDE"; it.step = "CERRADO";
      it.cause = `Ciclo cerrado y superado: BASE GENERAL ya tiene ${latest}, de un crédito posterior del mismo USUARIO.`; it.owner = "—";
    }
  }
  const totals = { VERDE: 0, AMARILLO: 0 };
  const bySteps = { DIRECCION: 0, PAGO: 0, CREDITO: 0, VENCIMIENTO: 0, BASE: 0, PLAN: 0, CERRADO: 0 };
  const exceptions = new Map<string, CycleException>();
  for (const it of items) {
    totals[it.color]++;
    bySteps[it.step]++;
    if (it.exception && !exceptions.has(it.exception.subject)) exceptions.set(it.exception.subject, it.exception);
    else if (it.exception) { const ex = exceptions.get(it.exception.subject)!; if (!ex.references.includes(it.reference)) ex.references.push(it.reference); }
  }
  for (const t of panels.flatMap((p) => [...p.tasks, ...p.pending])) if (t.exception && !exceptions.has(t.exception.subject)) exceptions.set(t.exception.subject, t.exception);
  return { items, totals, bySteps, exceptions: [...exceptions.values()] };
}

export function projectCreditosHoy(input: CreditosHoyInput): CreditosHoy {
  const base = indexBase(input.base);
  const decisions = new Map<string, CycleDecision>();
  for (const d of input.decisions ?? []) decisions.set(d.subject, d); // la más reciente gana (entrada ordenada por fecha)
  const ctx: Ctx = { base, financeOk: !!base && input.payments != null, paid: confirmedPayments(input.payments), decisions };
  const panels = PANELS.map((p) => projectPanel(p, input.controls[p]?.sheet ?? null, input.controls[p]?.rows ?? null, input, ctx));
  const totals = { HABILITADO: 0, NO_HABILITADO: 0, SIN_PAGAR: 0, REQUIERE_REVISION: 0, EJECUTADO: 0, total: 0 };
  let basePending = 0;
  for (const t of panels.flatMap((p) => p.tasks)) {
    totals[t.state]++;
    totals.total++;
    if (t.baseSync && t.baseSync.state !== "ACTUALIZADA") basePending++;
  }
  const read = panels.flatMap((p) => (p.kpi ? [p.kpi] : []));
  const kpi = kpiOf(read.reduce((a, k) => a + k.programados, 0), read.reduce((a, k) => a + k.otorgados, 0), read.reduce((a, k) => a + k.hoy, 0));
  return { date: input.today, targetMonth: input.targetMonth, panels, totals, kpi, basePending, financeSource: ctx.financeOk ? "OK" : "REQUIERE_REVISION", cycle: summarizeCycles(panels), available: projectAvailableCredits(input.released) };
}
