import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { CREDIT_STATE_LABEL, type CreditKpi, type CreditState, type CreditTask, type CreditosHoy, type PanelCredits } from "@/server/tiviplay-live/creditos-hoy-projection";

const STATE_ORDER: CreditState[] = ["HABILITADO", "REQUIERE_REVISION", "SIN_PAGAR", "NO_HABILITADO", "EJECUTADO"];
const STATE_CLASS: Record<CreditState, string> = {
  HABILITADO: "border-brand-green/40 bg-brand-green/10 text-status-success",
  NO_HABILITADO: "border-brand-red/30 bg-brand-red/5 text-status-error",
  SIN_PAGAR: "border-brand-red/30 bg-brand-red/5 text-status-error",
  REQUIERE_REVISION: "border-brand-yellow/50 bg-brand-yellow/10 text-status-warning",
  EJECUTADO: "border-brand-border bg-brand-surface text-brand-muted",
};
const STATE_HINT: Record<CreditState, string> = {
  HABILITADO: "Ejecutar en el panel y registrar en CONTROL",
  NO_HABILITADO: "No ejecutar",
  SIN_PAGAR: "Gestionar el pago; no ejecutar",
  REQUIERE_REVISION: "Escalar a Dirección",
  EJECUTADO: "Ya registrado en CONTROL",
};
const PANEL_NAME = { P1: "Panel 1", P2: "Panel 2", P3: "Panel 3" } as const;
const KPI_COLS: Array<[keyof Omit<CreditKpi, "avance">, string, string]> = [["programados", "Por otorgar", "Mes"], ["otorgados", "Otorgados", "Otorg."], ["faltantes", "Faltantes", "Faltan"], ["hoy", "Hoy", "Hoy"]];

const fmt = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const sortTasks = (tasks: CreditTask[]) => [...tasks].sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || a.row - b.row);

function Chip({ state }: { state: CreditState }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${STATE_CLASS[state]}`}>{CREDIT_STATE_LABEL[state]}</span>;
}

function TaskItem({ t, isAdmin = false }: { t: CreditTask; isAdmin?: boolean }) {
  const actionable = t.state === "HABILITADO";
  const blocked = t.state === "NO_HABILITADO" || t.state === "SIN_PAGAR";
  const actionLabel = actionable ? "PAGÓ · DAR CRÉDITO" : blocked ? "NO HA PAGADO · NO DAR CRÉDITO" : t.state === "REQUIERE_REVISION" ? "REQUIERE DECISIÓN" : "CRÉDITO EJECUTADO";
  return (
    <li className="py-3">
      <div className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${STATE_CLASS[t.state]}`}>
        <div className="min-w-0">
          <p className="break-all font-mono text-base font-black">{t.user}</p>
          <p className="mt-0.5 text-xs font-semibold">{PANEL_NAME[t.panel]}{t.recharge ? ` · ${t.recharge}` : ""}{t.creditDate ? ` · ${fmt(t.creditDate)}` : ""}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-black uppercase tracking-[0.04em]">{actionLabel}</p>
          {actionable ? <p className="mt-0.5 text-xs font-semibold">Otorgue el crédito en el panel y registre el nuevo vencimiento en CONTROL.</p> : null}
          {blocked ? <p className="mt-0.5 text-xs font-semibold">No otorgue crédito. Gestionar/confirmar pago antes de ejecutar.</p> : null}
          {t.state === "REQUIERE_REVISION" ? <p className="mt-0.5 max-w-xl text-xs font-semibold">{t.reason}</p> : null}
        </div>
      </div>
      {isAdmin ? (
        <details className="mt-1 px-2 text-[11px] text-brand-muted">
          <summary className="cursor-pointer">Detalle de auditoría</summary>
          <div className="mt-1 space-y-0.5">
            <p>{t.reason}</p>
            {t.newDue ? <p>F.VENCIMIENTO (H): {fmt(t.newDue)}</p> : null}
            {t.baseSync ? <p>BASE GENERAL: {t.baseSync.state} · {t.baseSync.detail}</p> : null}
            {t.observation ? <p>Observación: {t.observation}</p> : null}
            <p>CONTROL fila {t.row} · TC {t.tc} · Crédito {t.credit ?? "—"}{t.advisor ? ` · Asesor ${t.advisor}` : ""}</p>
          </div>
        </details>
      ) : null}
    </li>
  );
}
function KpiCell({ value, sheet, showParity }: { value: number | undefined; sheet: number | undefined; showParity: boolean }) {
  const differs = showParity && sheet != null && value != null && sheet !== value;
  return (
    <td className="px-1.5 py-2 sm:px-3 text-right tabular-nums">
      {value ?? "—"}
      {differs ? <span className="block text-[10px] font-semibold text-status-warning">hoja: {sheet}</span> : null}
    </td>
  );
}

function PanelSection({ p, isAdmin = false }: { p: PanelCredits; isAdmin?: boolean }) {
  const open = p.status !== "OK" || p.tasks.some((t) => t.state !== "EJECUTADO" || (t.baseSync && t.baseSync.state !== "ACTUALIZADA"));
  return (
    <details className="rounded-2xl border border-brand-border" open={open}>
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span className="font-semibold">{PANEL_NAME[p.panel]} · hoy {p.tasks.length} <span className="text-xs font-normal text-brand-muted">· {p.sheet ?? "sin hoja"}</span></span>
        <span className="flex flex-wrap gap-1.5">
          {p.status !== "OK" ? <span className="text-xs font-bold text-status-warning">{p.status === "REQUIERE_DECISION" ? "REQUIERE DECISIÓN" : "REQUIERE_REVISION"}</span>
            : STATE_ORDER.filter((s) => p.tasks.some((t) => t.state === s)).map((s) => <span className="text-xs text-brand-muted" key={s}>{CREDIT_STATE_LABEL[s]} {p.tasks.filter((t) => t.state === s).length}</span>)}
        </span>
      </summary>
      <div className="border-t border-brand-border px-4 py-3">
        {p.warning ? <p className="mb-2 text-xs text-status-warning">{p.warning}</p> : null}
        {p.status !== "OK" ? (
          <p className="text-sm text-status-warning">{p.reason}</p>
        ) : p.tasks.length === 0 ? (
          <p className="text-sm text-brand-muted">Sin créditos con fecha de hoy en este panel.</p>
        ) : (
          <ul className="divide-y divide-brand-border">{sortTasks(p.tasks).map((t) => <TaskItem key={t.reference} t={t} isAdmin={isAdmin} />)}</ul>
        )}
        {p.pending.length ? (
          <details className="mt-3 rounded-xl border border-brand-border">
            <summary className="cursor-pointer px-1.5 py-2 sm:px-3 text-sm font-semibold">Pendientes de días anteriores · {p.pending.length}</summary>
            <ul className="divide-y divide-brand-border border-t border-brand-border px-3">{sortTasks(p.pending).map((t) => <TaskItem key={t.reference} t={t} isAdmin={isAdmin} />)}</ul>
          </details>
        ) : null}
      </div>
    </details>
  );
}

/** Bloque 4 de HOY: resumen de créditos del mes y cola diaria por panel (solo lectura; el crédito se ejecuta en el panel). */
export function CreditosHoyBlock({ data, isAdmin = false }: { data: CreditosHoy | null; isAdmin?: boolean }) {
  return (
    <SectionCard
      eyebrow="Bloque 4"
      title="Créditos TiviPlay"
      description="Cola operativa del día. Verde: otorgar crédito. Rojo: no otorgar. Amarillo: escalar. El sistema valida automáticamente la cobertura contra CONTROL y BASE GENERAL."
    >
      {!data ? (
        <p className="rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error">REQUIERE_REVISION: no fue posible leer las hojas CONTROL. No se muestra una cola sin fuente.</p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-brand-muted">Fecha operacional: <strong className="text-brand-text">{fmt(data.date)}</strong></p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-brand-text">
                Hoy hay <span className="text-status-success">{data.totals.HABILITADO}</span> {data.totals.HABILITADO === 1 ? "crédito" : "créditos"} por ejecutar
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATE_ORDER.map((s) => (
                <span className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${STATE_CLASS[s]}`} key={s}>{CREDIT_STATE_LABEL[s]} · {data.totals[s]}</span>
              ))}
            </div>
          </div>

          <div className={`${isAdmin ? "block" : "hidden"} overflow-x-auto rounded-2xl border border-brand-border`}>
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-brand-surface text-[9px] font-black uppercase tracking-[0.06em] text-brand-muted sm:text-[10px] sm:tracking-[0.12em]">
                <tr><th className="px-1.5 py-2 sm:px-3 text-left">Panel</th>{KPI_COLS.map(([, label, short]) => <th className="px-1.5 py-2 sm:px-3 text-right" key={label}><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{short}</span></th>)}<th className="px-1.5 py-2 sm:px-3 text-right"><span className="hidden sm:inline">Avance</span><span className="sm:hidden">%</span></th></tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {data.panels.map((p) => (
                  <tr key={p.panel}>
                    <th className="px-1.5 py-2 sm:px-3 text-left font-semibold">{PANEL_NAME[p.panel]}</th>
                    {p.kpi ? KPI_COLS.map(([k]) => <KpiCell key={k} value={p.kpi![k]} sheet={p.sheetKpi?.[k]} showParity={isAdmin} />)
                      : <td className="px-1.5 py-2 sm:px-3 text-right text-xs font-bold text-status-warning" colSpan={4}>REVISAR · {p.reason}</td>}
                    <td className="px-1.5 py-2 sm:px-3 text-right tabular-nums text-brand-muted">{p.kpi?.avance != null ? `${p.kpi.avance}%` : "—"}</td>
                  </tr>
                ))}
                <tr className="bg-brand-primary-dark font-semibold text-white">
                  <th className="px-1.5 py-2 sm:px-3 text-left">Total TiviPlay</th>
                  {KPI_COLS.map(([k]) => <td className="px-1.5 py-2 sm:px-3 text-right tabular-nums" key={k}>{data.kpi[k]}</td>)}
                  <td className="px-1.5 py-2 sm:px-3 text-right tabular-nums">{data.kpi.avance != null ? `${data.kpi.avance}%` : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {isAdmin && data.panels.some((p) => p.kpi && p.sheetKpi && KPI_COLS.some(([k]) => p.sheetKpi![k] != null && p.sheetKpi![k] !== p.kpi![k])) ? (
            <p className="text-xs text-status-warning">«hoja: X» indica que la celda resumen de la hoja difiere del cálculo sobre los datos. En «Hoy» la hoja compara G con TODAY(), pero G es texto con hora, por lo que su celda da 0.</p>
          ) : null}
          {isAdmin ? <p className="text-[11px] text-brand-muted">El avance es operativo (otorgados / por otorgar); no es conciliación financiera.</p> : null}

          {isAdmin && data.totals.EJECUTADO ? (
            <p className={`rounded-2xl border px-4 py-3 text-xs ${data.basePending ? "border-brand-yellow/50 bg-brand-yellow/10 text-status-warning" : "border-brand-green/40 bg-brand-green/10 text-status-success"}`}>
              Cierre del ciclo (H → BASE GENERAL): {data.basePending ? `${data.basePending} de ${data.totals.EJECUTADO} créditos ejecutados hoy todavía no tienen su nueva F.VENCIMIENTO en BASE GENERAL (o no se pudo verificar).` : `los ${data.totals.EJECUTADO} créditos ejecutados hoy ya tienen su nueva F.VENCIMIENTO en BASE GENERAL.`}
            </p>
          ) : null}

          {data.financeSource !== "OK" ? (
            <p className="rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-xs text-status-warning">No fue posible leer BASE GENERAL o las hojas de pago: los créditos pendientes quedan en REQUIERE_REVISION hasta poder verificar la habilitación.</p>
          ) : null}

          {data.panels.map((p) => <PanelSection key={p.panel} p={p} isAdmin={isAdmin} />)}
        </div>
      )}
    </SectionCard>
  );
}
