// Historial por cliente. Puro: recibe columnas ya leídas sin datos sensibles.
// Identidad: USUARIO exacto y único en la hoja; los pagos exigen además el enlace gobernado de la hoja.
import { canon, clean, parseAmount, parseDate } from "@/server/tiviplay-live/runtime-read-model";

export type HistoryTab = { title: string; kind: "PAGOS" | "CONTROL" | "PAGO"; rows: Record<string, string>[] };

export type HistoryPayment = { date: string | null; method: string; amount: string; currency: string; confirmation: string; plan: string; source: string; pending: boolean };
export type HistoryPlan = { month: string; plan: string; screens: string; lastPayment: string | null; tariff: string; confirmation: string; source: string };
export type HistoryRenewal = { date: string | null; due: string | null; credit: string; source: string };
export type ClientHistory = {
  payments: HistoryPayment[];
  plans: HistoryPlan[];
  renewals: HistoryRenewal[];
  monthsRead: string[];
  ambiguousMonths: string[];
  /** Último F.VENCIMIENTO con crédito registrado en CONTROL P1/P2/P3; solo evidencia. */
  controlDue: string | null;
};

const sameUser = (a: string, b: string) => canon(a) === canon(b);
const byDateDesc = <T extends { date: string | null }>(a: T, b: T) => (b.date ?? "").localeCompare(a.date ?? "");

export function buildClientHistory(tabs: readonly HistoryTab[], client: { user: string; clientKey: string | null; baseRow: number | null }): ClientHistory {
  const out: ClientHistory = { payments: [], plans: [], renewals: [], monthsRead: [], ambiguousMonths: [], controlDue: null };
  for (const tab of tabs) {
    if (tab.kind === "PAGOS") {
      const rows = tab.rows.filter((r) => r.USUARIO && sameUser(r.USUARIO, client.user));
      out.monthsRead.push(tab.title);
      if (rows.length > 1) { out.ambiguousMonths.push(tab.title); continue; }
      const row = rows[0];
      if (!row) continue;
      out.plans.push({
        month: tab.title, plan: clean(row["PLAN ACTIVO"]), screens: clean(row.PANTALLAS), lastPayment: parseDate(row["F.ULTIMO PAGO"]),
        tariff: [["USD", row.USD], ["COP", row.COP]].filter(([, v]) => parseAmount(v)).map(([c, v]) => `${c} ${clean(v)}`).join(" + "),
        confirmation: clean(row.CONFIRMACION), source: `${tab.title}!${row.__row}`,
      });
    } else if (tab.kind === "CONTROL") {
      for (const row of tab.rows) {
        if (!row.USUARIO || !sameUser(row.USUARIO, client.user) || !(parseAmount(row.CREDITO) ?? 0)) continue;
        const due = parseDate(row["F.VENCIMIENTO"]);
        out.renewals.push({ date: parseDate(row.FECHA), due, credit: clean(row.CREDITO), source: `${tab.title}!${row.__row}` });
        if (due && (!out.controlDue || due > out.controlDue)) out.controlDue = due;
      }
    } else if (client.clientKey && client.baseRow) {
      for (const row of tab.rows) {
        // CLIENTE_KEY es un nombre normalizado: por sí sola no prueba identidad. Exige el enlace único a la misma fila de BASE.
        if (canon(row.CLIENTE_KEY) !== canon(client.clientKey) || row.ESTADO_ENLACE !== "ENLAZADO" || row.COINCIDENCIAS_BASE !== "1" || Number(row.FILA_BASE) !== client.baseRow) continue;
        const confirmation = clean(row.CONFIRMACION);
        out.payments.push({
          date: parseDate(row.__date), method: tab.title.split(" ")[0], amount: clean(row.VALOR_PAGO), currency: clean(row.MONEDA_PAGO),
          confirmation, plan: clean(row.PLAN_CANONICO), source: `${tab.title}!${row.__row}`, pending: confirmation !== "CONFIRMADO JM",
        });
      }
    }
  }
  out.payments.sort(byDateDesc);
  out.renewals.sort(byDateDesc);
  return out;
}

export type TechnicalDue = { status: "VERIFICADO" | "REQUIERE VALIDACIÓN"; date: string | null; reason: string };

/** Vencimiento técnico: F.VENCIMIENTO de BASE GENERAL. Nunca se confunde con F. PRÓXIMO PAGO. */
export function technicalDue(input: { panel: string; due: string | null; userRepeated: boolean; controlDue: string | null }): TechnicalDue {
  if (input.userRepeated) return { status: "REQUIERE VALIDACIÓN", date: null, reason: "El USUARIO aparece repetido en la fuente." };
  if (/PANEL\s*3|^P3\b/i.test(input.panel)) return { status: "REQUIERE VALIDACIÓN", date: input.due,
    reason: input.controlDue && input.due === input.controlDue
      ? "BASE GENERAL coincide con vencimiento de CONTROL P3, pero los créditos siguen bloqueados para ejecución."
      : input.controlDue ? `CONTROL P3 registra ${input.controlDue}; cotejar con BASE GENERAL antes de validar el servicio. Créditos bloqueados.`
      : "Vencimiento de BASE GENERAL informativo; cotejar con la evidencia de CONTROL P3. Créditos bloqueados." };

  if (!input.due) return { status: "REQUIERE VALIDACIÓN", date: null, reason: "F.VENCIMIENTO vacío o no interpretable." };
  if (input.controlDue && input.controlDue > input.due) return { status: "REQUIERE VALIDACIÓN", date: input.due, reason: `CONTROL registra ${input.controlDue}, posterior a BASE GENERAL.` };
  return { status: "VERIFICADO", date: input.due, reason: "F.VENCIMIENTO de BASE GENERAL." };
}
