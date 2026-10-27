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
  basis: "A" | "B" | null; // caso S0 §7.1 que habilita
  reason: string;
  /** Solo EJECUTADO: match de H contra F.VENCIMIENTO de BASE GENERAL (cierre del ciclo). */
  baseSync: BaseSync | null;
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
};

export type CreditosHoyInput = {
  today: string;
  targetMonth: string;
  controls: Record<PanelId, { sheet: string | null; rows: unknown[][] | null }>;
  base: unknown[][] | null;
  payments: Array<{ sheet: string; rows: unknown[][] }> | null;
  /** Fallo global de lectura (credenciales o metadatos): todos los paneles quedan en REQUIERE_REVISION. */
  readError?: string;
};

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

/** Filas BASE (número absoluto) con un pago CONFIRMADO JM enlazado en ZELLE/PAYPAL/TRANSF del mes. */
function confirmedBaseRows(payments: CreditosHoyInput["payments"]) {
  const out = new Set<number>();
  for (const p of payments ?? []) {
    const h = headerIndex(p.rows, ["CONFIRMACION", "FILA_BASE", "ESTADO_ENLACE"]);
    if (h < 0) continue;
    const header = (p.rows[h] ?? []).map(canon);
    const [conf, fila, link] = ["CONFIRMACION", "FILA_BASE", "ESTADO_ENLACE"].map((n) => header.indexOf(n));
    for (let i = h + 1; i < p.rows.length; i++) {
      const row = p.rows[i] ?? [];
      if (canon(row[conf]) !== "CONFIRMADO JM" || canon(row[link]) !== "ENLAZADO") continue;
      const n = Number(clean(row[fila]));
      if (Number.isInteger(n) && n > 0) out.add(n);
    }
  }
  return out;
}

/** Cierre del ciclo: ¿la F.VENCIMIENTO de BASE GENERAL ya es la H registrada en CONTROL? Solo lectura. */
function baseSync(user: string, newDue: string, base: BaseIndex): BaseSync {
  if (!base || base.col.due == null) return { state: "SIN_VERIFICAR", baseDue: null, detail: "BASE GENERAL no disponible: no se verifica el match." };
  const matches = base.byUser.get(canon(user)) ?? [];
  if (matches.length !== 1) return { state: "SIN_VERIFICAR", baseDue: null, detail: matches.length ? `USUARIO repetido ${matches.length} veces en BASE GENERAL: match no inequívoco.` : "USUARIO no existe en BASE GENERAL." };
  const baseDue = parseDate((base.rows[matches[0]] ?? [])[base.col.due]);
  if (baseDue === newDue) return { state: "ACTUALIZADA", baseDue, detail: `BASE GENERAL (fila ${matches[0] + 1}) ya tiene F.VENCIMIENTO ${newDue}.` };
  return { state: "PENDIENTE", baseDue, detail: `Llevar ${newDue} a BASE GENERAL (fila ${matches[0] + 1}); hoy tiene ${baseDue ?? "sin fecha"}.` };
}

function financial(task: Pick<CreditTask, "panel" | "user">, creditDate: string, base: BaseIndex, confirmed: Set<number>, financeOk: boolean): Pick<CreditTask, "state" | "basis" | "reason"> {
  const revision = (reason: string) => ({ state: "REQUIERE_REVISION" as const, basis: null, reason });
  if (!base || !financeOk) return revision("No fue posible leer BASE GENERAL o las hojas de pago: no se decide la habilitación.");
  const matches = base.byUser.get(canon(task.user)) ?? [];
  if (matches.length === 0) return revision("El USUARIO no existe en BASE GENERAL.");
  if (matches.length > 1) return revision(`El USUARIO aparece ${matches.length} veces en BASE GENERAL.`);
  const index = matches[0];
  const row = base.rows[index] ?? [];
  const at = (i: number | null) => (i == null ? "" : clean(row[i]));
  const basePanel = panelDigit(at(base.col.panel));
  if (basePanel && `P${basePanel}` !== task.panel) return revision(`BASE GENERAL indica Panel ${basePanel}: contradicción de panel.`);

  if (confirmed.has(index + 1)) return { state: "HABILITADO", basis: "A", reason: "Caso A: CONFIRMADO JM enlazado a la fila de BASE GENERAL." };

  const next = parseDate(at(base.col.next));
  if (at(base.col.tc) === "1" && next && next > creditDate) {
    const months = planMonths(at(base.col.plan));
    if (months == null) return revision("PLAN ACTIVO no interpretable: no se puede verificar la cobertura.");
    if (next > addMonths(creditDate, months)) return revision(`F. PRÓXIMO PAGO (${next}) excede la cobertura de ${at(base.col.plan)}.`);
    return { state: "HABILITADO", basis: "B", reason: `Caso B: cobertura vigente hasta ${next} (${at(base.col.plan)}).` };
  }
  return { state: "NO_HABILITADO", basis: null, reason: "Sin CONFIRMADO JM enlazado ni cobertura vigente en BASE GENERAL: no ejecutar." };
}

const num = (v: unknown) => { const t = clean(v).replace(",", "."); if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n : null; };
const SUMMARY: Array<[keyof Omit<CreditKpi, "avance">, RegExp]> = [
  ["hoy", /CREDITOS POR OTORGAR HOY/], ["programados", /CREDITOS POR OTORGAR/], ["otorgados", /CREDITOS OTORGADOS/], ["faltantes", /FALTAN POR OTORGAR/],
];
const kpiOf = (programados: number, otorgados: number, hoy: number): CreditKpi =>
  ({ programados, otorgados, faltantes: programados - otorgados, hoy, avance: programados > 0 ? Math.round((otorgados / programados) * 1000) / 10 : null });

function projectPanel(panel: PanelId, sheet: string | null, rows: unknown[][] | null, input: CreditosHoyInput, baseIndex: BaseIndex, confirmed: Set<number>, financeOk: boolean): PanelCredits {
  const empty = (status: PanelCredits["status"], reason: string): PanelCredits => ({ panel, sheet, status, reason, columns: null, warning: null, kpi: null, sheetKpi: null, dataRange: null, tasks: [], pending: [] });
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
    const isToday = creditDate === input.today;
    const isPastPending = !!creditDate && creditDate < input.today && tc > 0 && (credit ?? 0) < tc;
    if (!user || (!isToday && !isPastPending)) continue;

    const rawDue = at(c.due);
    const newDue = parseDate(rawDue);
    const fields: Omit<CreditTask, "state" | "basis" | "reason" | "baseSync"> = {
      panel, sheet, row: i + 1, reference: `${sheet}!${columns.date}${i + 1}`, user, advisor: at(c.advisor), recharge: at(c.recharge),
      creditDate, creditTime: at(c.date).match(/\d{1,2}:\d{2}/)?.[0] ?? "", tc, credit, newDue, origin: at(c.origin), observation: at(c.observation),
    };

    if (isPastPending) {
      // Un crédito vencido sin ejecución no es, por sí solo, una excepción.
      // Se evalúa con el mismo gate financiero Caso A / Caso B que la cola de hoy.
      let pastResult: Pick<CreditTask, "state" | "basis" | "reason">;
      if (origin === "SIN PAGAR") {
        pastResult = { state: "SIN_PAGAR", basis: null, reason: "ORIGEN «Sin Pagar»: pendiente de gestión de pago; no ejecutar sin habilitación." };
      } else if (rawDue && !newDue) {
        pastResult = { state: "REQUIERE_REVISION", basis: null, reason: "F.VENCIMIENTO registrada no es una fecha válida. Acción: corregir F.VENCIMIENTO en CONTROL." };
      } else if (tc === 0) {
        pastResult = newDue && origin
          ? { state: "EJECUTADO", basis: null, reason: `Movimiento sin consumo de crédito (TC 0, ${fields.origin}): nuevo vencimiento ${newDue}.` }
          : { state: "REQUIERE_REVISION", basis: null, reason: "TC 0 sin evidencia suficiente. Acción: confirmar si corresponde crédito o movimiento sin consumo y completar ORIGEN/F.VENCIMIENTO." };
      } else {
        const other = otherPanelInObservation(fields.observation, panel);
        pastResult = other
          ? { state: "REQUIERE_REVISION", basis: null, reason: `La observación indica Panel ${other}. Acción: confirmar el panel correcto y corregir CONTROL/BASE GENERAL.` }
          : financial(fields, creditDate, baseIndex, confirmed, financeOk);
        if (pastResult.state === "REQUIERE_REVISION") {
          pastResult = { ...pastResult, reason: `${pastResult.reason} Acción: corregir el dato indicado y volver a validar.` };
        }
      }
      pending.push({ ...fields, ...pastResult, baseSync: pastResult.state === "EJECUTADO" && newDue ? baseSync(fields.user, newDue, baseIndex) : null });
      continue;
    }

    seen.set(canon(user), (seen.get(canon(user)) ?? 0) + 1);
    let result: Pick<CreditTask, "state" | "basis" | "reason">;
    if (credit != null && credit > 0) {
      result = newDue && newDue <= input.today
        ? { state: "REQUIERE_REVISION", basis: null, reason: `CREDITO registrado, pero F.VENCIMIENTO (${newDue}) no es posterior a la fecha del crédito.` }
        : { state: "EJECUTADO", basis: null, reason: newDue ? `Crédito registrado en CONTROL (${fields.origin || "sin ORIGEN"}): nuevo vencimiento ${newDue}.` : "CREDITO registrado en CONTROL, pero sin F.VENCIMIENTO (H): falta el dato para BASE GENERAL." };
    } else if (origin === "SIN PAGAR") {
      result = { state: "SIN_PAGAR", basis: null, reason: "ORIGEN «Sin Pagar»: pendiente de gestión de pago; no ejecutar sin habilitación." };
    } else if (rawDue && !newDue) {
      result = { state: "REQUIERE_REVISION", basis: null, reason: "F.VENCIMIENTO registrada no es una fecha válida." };
    } else if (tc === 0) {
      result = newDue && origin
        ? { state: "EJECUTADO", basis: null, reason: `Movimiento sin consumo de crédito (TC 0, ${fields.origin}): nuevo vencimiento ${newDue}.` }
        : { state: "REQUIERE_REVISION", basis: null, reason: "TC 0 en CONTROL sin ORIGEN ni F.VENCIMIENTO: no hay crédito programado claro." };
    } else {
      const other = otherPanelInObservation(fields.observation, panel);
      const r = other
        ? { state: "REQUIERE_REVISION" as const, basis: null, reason: `La observación indica Panel ${other}: relación de panel no inequívoca.` }
        : financial(fields, input.today, baseIndex, confirmed, financeOk);
      result = newDue ? { ...r, reason: `H anticipada (${newDue}) sin CREDITO: crédito aún no ejecutado. ${r.reason}` } : r;
    }
    tasks.push({ ...fields, ...result, baseSync: result.state === "EJECUTADO" ? (newDue ? baseSync(fields.user, newDue, baseIndex) : { state: "SIN_VERIFICAR", baseDue: null, detail: "Sin F.VENCIMIENTO (H) en CONTROL: no hay fecha que llevar a BASE GENERAL." }) : null });
  }
  // Usuario repetido en la cola del día del mismo panel: no se decide en silencio.
  for (const t of tasks) {
    if ((seen.get(canon(t.user)) ?? 0) > 1 && t.state !== "EJECUTADO") {
      t.state = "REQUIERE_REVISION";
      t.basis = null;
      t.reason = "El USUARIO aparece más de una vez en la cola de hoy de este panel.";
    }
  }
  return { panel, sheet, status: "OK", reason: null, columns, warning, kpi: kpiOf(programados, otorgados, hoy), sheetKpi: Object.keys(sheetKpi).length ? sheetKpi : null, dataRange, tasks, pending };
}

export function projectCreditosHoy(input: CreditosHoyInput): CreditosHoy {
  const baseIndex = indexBase(input.base);
  const financeOk = !!baseIndex && input.payments != null;
  const confirmed = confirmedBaseRows(input.payments);
  const panels = PANELS.map((p) => projectPanel(p, input.controls[p]?.sheet ?? null, input.controls[p]?.rows ?? null, input, baseIndex, confirmed, financeOk));
  const totals = { HABILITADO: 0, NO_HABILITADO: 0, SIN_PAGAR: 0, REQUIERE_REVISION: 0, EJECUTADO: 0, total: 0 };
  let basePending = 0;
  for (const t of panels.flatMap((p) => p.tasks)) {
    totals[t.state]++;
    totals.total++;
    if (t.baseSync && t.baseSync.state !== "ACTUALIZADA") basePending++;
  }
  const read = panels.flatMap((p) => (p.kpi ? [p.kpi] : []));
  const kpi = kpiOf(read.reduce((a, k) => a + k.programados, 0), read.reduce((a, k) => a + k.otorgados, 0), read.reduce((a, k) => a + k.hoy, 0));
  return { date: input.today, targetMonth: input.targetMonth, panels, totals, kpi, basePending, financeSource: financeOk ? "OK" : "REQUIERE_REVISION" };
}
