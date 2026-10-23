// Bloque 4 de HOY — CRÉDITOS DE HOY. Proyección pura (sin I/O) sobre CONTROL P1/P2/P3 del mes.
//
// Regla de Dirección (22/10/2026):
//   G (FECHA)          = fecha en que corresponde otorgar el crédito técnico → población del día: G = hoy.
//   H (F.VENCIMIENTO)  = vencimiento resultante, registrado después de ejecutar el crédito.
// Habilitación financiera: contrato S0 v0.3 §7.1, sin reglas nuevas:
//   NECESIDAD TÉCNICA + HABILITACIÓN FINANCIERA + IDENTIDAD INEQUÍVOCA = CRÉDITO EJECUTABLE
//   Caso A: CONFIRMADO JM + ESTADO_ENLACE = ENLAZADO + FILA_BASE = fila del USUARIO.
//   Caso B: TC=1 + F. PRÓXIMO PAGO posterior a la fecha del crédito + cobertura coherente con PLAN ACTIVO (+k).
// CRÉDITO EJECUTADO ≠ BASE GENERAL ACTUALIZADA. Nunca se lee ni se expone la columna CONTRASEÑA.
import { canon, clean, parseDate, type PanelId } from "@/server/tiviplay-live/runtime-read-model";

export type CreditState = "HABILITADO" | "NO_HABILITADO" | "REQUIERE_REVISION" | "EJECUTADO";

export const CREDIT_STATE_LABEL: Record<CreditState, string> = {
  HABILITADO: "HABILITADO",
  NO_HABILITADO: "NO HABILITADO",
  REQUIERE_REVISION: "REQUIERE_REVISION",
  EJECUTADO: "EJECUTADO",
};

export type CreditTask = {
  panel: PanelId;
  sheet: string;
  row: number;
  reference: string; // Hoja!fila, para volver a la fuente
  user: string;
  advisor: string;
  recharge: string; // RECARGA (duración)
  creditTime: string; // hora registrada en G, si existe
  newDue: string | null; // H como fecha ISO, solo si es válida
  origin: string;
  observation: string;
  state: CreditState;
  basis: "A" | "B" | null; // caso S0 §7.1 que habilita
  reason: string;
};

export type PanelCredits = {
  panel: PanelId;
  sheet: string | null;
  status: "OK" | "REQUIERE_REVISION" | "REQUIERE_DECISION";
  reason: string | null;
  columns: { date: string; due: string } | null; // letras reales de G/H encontradas por encabezado
  tasks: CreditTask[];
};

export type CreditosHoy = {
  date: string;
  targetMonth: string;
  panels: PanelCredits[];
  totals: Record<CreditState, number> & { total: number };
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

type BaseIndex = { byUser: Map<string, number[]>; rows: unknown[][]; col: Record<"tc" | "user" | "panel" | "plan" | "next", number | null> } | null;

function indexBase(base: unknown[][] | null): BaseIndex {
  if (!base) return null;
  const h = headerIndex(base, ["USUARIO", "F. PROXIMO PAGO"]);
  if (h < 0) return null;
  const header = (base[h] ?? []).map(canon);
  const col = (name: string) => { const i = header.indexOf(name); return i < 0 ? null : i; };
  const c = { tc: col("TC"), user: col("USUARIO"), panel: col("PANEL"), plan: col("PLAN ACTIVO"), next: col("F. PROXIMO PAGO") };
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

function projectPanel(panel: PanelId, sheet: string | null, rows: unknown[][] | null, input: CreditosHoyInput, baseIndex: BaseIndex, confirmed: Set<number>, financeOk: boolean): PanelCredits {
  const empty = (status: PanelCredits["status"], reason: string): PanelCredits => ({ panel, sheet, status, reason, columns: null, tasks: [] });
  if (input.readError) return empty("REQUIERE_REVISION", input.readError);
  if (!sheet) return empty("REQUIERE_REVISION", `No existe la hoja CONTROL ${panel} del mes ${input.targetMonth}.`);
  if (!rows) return empty("REQUIERE_REVISION", "Lectura fallida de la hoja CONTROL.");
  const h = headerIndex(rows, ["USUARIO", "FECHA", "F.VENCIMIENTO"]);
  if (h < 0) return empty("REQUIERE_DECISION", "No se encontraron los encabezados USUARIO, FECHA y F.VENCIMIENTO.");
  const header = (rows[h] ?? []).map(canon);
  for (const name of ["USUARIO", "FECHA", "F.VENCIMIENTO"]) if (header.filter((x) => x === name).length !== 1) return empty("REQUIERE_DECISION", `Encabezado ${name} ausente o repetido.`);
  const col = (name: string) => { const i = header.indexOf(name); return i < 0 ? null : i; };
  const c = { advisor: col("ASESOR"), recharge: col("RECARGA"), user: col("USUARIO")!, date: col("FECHA")!, due: col("F.VENCIMIENTO")!, origin: col("ORIGEN"), observation: col("OBSERVACION") };
  const columns = { date: columnLetter(c.date), due: columnLetter(c.due) };

  // Coherencia de la hoja: G debe pertenecer al mes de la hoja. Si ninguna fecha cae en el mes, la cola no es derivable.
  const dated = rows.slice(h + 1).map((r) => parseDate((r ?? [])[c.date])).filter((d): d is string => !!d);
  if (dated.length && !dated.some((d) => d.startsWith(input.targetMonth))) {
    const sorted = [...dated].sort();
    return { ...empty("REQUIERE_REVISION", `FECHA (${columns.date}) no corresponde al mes ${input.targetMonth}: va de ${sorted[0]} a ${sorted[sorted.length - 1]}. No se deriva la cola del día; Dirección debe definir la regla de este panel.`), columns };
  }

  const tasks: CreditTask[] = [];
  const seen = new Map<string, number>();
  for (let i = h + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const at = (k: number | null) => (k == null ? "" : clean(row[k]));
    const user = at(c.user);
    if (!user || parseDate(at(c.date)) !== input.today) continue;
    seen.set(canon(user), (seen.get(canon(user)) ?? 0) + 1);
    const rawDue = at(c.due);
    const newDue = parseDate(rawDue);
    const fields: Omit<CreditTask, "state" | "basis" | "reason"> = {
      panel, sheet, row: i + 1, reference: `${sheet}!${columns.date}${i + 1}`, user, advisor: at(c.advisor), recharge: at(c.recharge),
      creditTime: at(c.date).match(/\d{1,2}:\d{2}/)?.[0] ?? "", newDue, origin: at(c.origin), observation: at(c.observation),
    };
    let result: Pick<CreditTask, "state" | "basis" | "reason">;
    if (newDue) {
      result = newDue > input.today
        ? { state: "EJECUTADO", basis: null, reason: `Crédito registrado en CONTROL: nuevo vencimiento ${newDue}. BASE GENERAL se actualiza aparte.` }
        : { state: "REQUIERE_REVISION", basis: null, reason: `F.VENCIMIENTO (${newDue}) no es posterior a la fecha del crédito.` };
    } else if (rawDue) {
      result = { state: "REQUIERE_REVISION", basis: null, reason: "F.VENCIMIENTO registrada no es una fecha válida." };
    } else {
      const other = otherPanelInObservation(fields.observation, panel);
      result = other
        ? { state: "REQUIERE_REVISION", basis: null, reason: `La observación indica Panel ${other}: relación de panel no inequívoca.` }
        : financial(fields, input.today, baseIndex, confirmed, financeOk);
    }
    tasks.push({ ...fields, ...result });
  }
  // Usuario repetido en la cola del día del mismo panel: no se decide en silencio.
  for (const t of tasks) {
    if ((seen.get(canon(t.user)) ?? 0) > 1 && t.state !== "EJECUTADO") {
      t.state = "REQUIERE_REVISION";
      t.basis = null;
      t.reason = "El USUARIO aparece más de una vez en la cola de hoy de este panel.";
    }
  }
  return { panel, sheet, status: "OK", reason: null, columns, tasks };
}

export function projectCreditosHoy(input: CreditosHoyInput): CreditosHoy {
  const baseIndex = indexBase(input.base);
  const financeOk = !!baseIndex && input.payments != null;
  const confirmed = confirmedBaseRows(input.payments);
  const panels = PANELS.map((p) => projectPanel(p, input.controls[p]?.sheet ?? null, input.controls[p]?.rows ?? null, input, baseIndex, confirmed, financeOk));
  const totals = { HABILITADO: 0, NO_HABILITADO: 0, REQUIERE_REVISION: 0, EJECUTADO: 0, total: 0 };
  for (const t of panels.flatMap((p) => p.tasks)) { totals[t.state]++; totals.total++; }
  return { date: input.today, targetMonth: input.targetMonth, panels, totals, financeSource: financeOk ? "OK" : "REQUIERE_REVISION" };
}
