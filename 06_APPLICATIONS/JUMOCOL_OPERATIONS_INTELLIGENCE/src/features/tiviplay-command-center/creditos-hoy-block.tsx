import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { CREDIT_STATE_LABEL, type CreditState, type CreditosHoy } from "@/server/tiviplay-live/creditos-hoy-projection";

const STATE_ORDER: CreditState[] = ["HABILITADO", "REQUIERE_REVISION", "NO_HABILITADO", "EJECUTADO"];
const STATE_CLASS: Record<CreditState, string> = {
  HABILITADO: "border-brand-green/40 bg-brand-green/10 text-status-success",
  NO_HABILITADO: "border-brand-red/30 bg-brand-red/5 text-status-error",
  REQUIERE_REVISION: "border-brand-yellow/50 bg-brand-yellow/10 text-status-warning",
  EJECUTADO: "border-brand-border bg-brand-surface text-brand-muted",
};
const STATE_HINT: Record<CreditState, string> = {
  HABILITADO: "Ejecutar en el panel y registrar en CONTROL",
  NO_HABILITADO: "No ejecutar",
  REQUIERE_REVISION: "Escalar a Dirección",
  EJECUTADO: "Ya registrado",
};
const PANEL_NAME = { P1: "Panel 1", P2: "Panel 2", P3: "Panel 3" } as const;

const fmt = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

function Chip({ state }: { state: CreditState }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${STATE_CLASS[state]}`}>{CREDIT_STATE_LABEL[state]}</span>;
}

/** Bloque 4 de HOY: cola diaria de créditos por panel (solo lectura; el crédito se ejecuta en el panel). */
export function CreditosHoyBlock({ data }: { data: CreditosHoy | null }) {
  return (
    <SectionCard
      eyebrow="Bloque 4"
      title="Créditos de hoy"
      description="Filas de CONTROL P1/P2/P3 con FECHA (G) = hoy. G indica la necesidad técnica; la habilitación sigue el contrato S0 v0.3 §7.1. Solo lectura: el crédito se ejecuta en el panel y se registra en CONTROL (H = nuevo vencimiento)."
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

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {data.panels.map((p) => (
              <div className="rounded-2xl border border-brand-border px-4 py-3" key={p.panel}>
                <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">{PANEL_NAME[p.panel]}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{p.status === "OK" ? p.tasks.length : <span className="text-base text-status-warning">REVISAR</span>}</dd>
              </div>
            ))}
            <div className="rounded-2xl border border-brand-primary-dark bg-brand-primary-dark px-4 py-3 text-white">
              <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">Total</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{data.totals.total}</dd>
            </div>
          </dl>

          {data.financeSource !== "OK" ? (
            <p className="rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-xs text-status-warning">No fue posible leer BASE GENERAL o las hojas de pago: los créditos pendientes quedan en REQUIERE_REVISION hasta poder verificar la habilitación.</p>
          ) : null}

          {data.panels.map((p) => (
            <details className="rounded-2xl border border-brand-border" key={p.panel} open={p.status !== "OK" || p.tasks.some((t) => t.state !== "EJECUTADO")}>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="font-semibold">{PANEL_NAME[p.panel]} <span className="text-xs font-normal text-brand-muted">· {p.sheet ?? "sin hoja"}</span></span>
                <span className="flex flex-wrap gap-1.5">
                  {p.status !== "OK" ? <span className="text-xs font-bold text-status-warning">{p.status === "REQUIERE_DECISION" ? "REQUIERE DECISIÓN" : "REQUIERE_REVISION"}</span>
                    : STATE_ORDER.filter((s) => p.tasks.some((t) => t.state === s)).map((s) => <span className="text-xs text-brand-muted" key={s}>{CREDIT_STATE_LABEL[s]} {p.tasks.filter((t) => t.state === s).length}</span>)}
                </span>
              </summary>
              <div className="border-t border-brand-border px-4 py-3">
                {p.status !== "OK" ? (
                  <p className="text-sm text-status-warning">{p.reason}</p>
                ) : p.tasks.length === 0 ? (
                  <p className="text-sm text-brand-muted">Sin créditos con fecha de hoy en este panel.</p>
                ) : (
                  <ul className="divide-y divide-brand-border">
                    {[...p.tasks].sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || a.row - b.row).map((t) => (
                      <li className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-start sm:gap-4" key={t.reference}>
                        <div className="min-w-0">
                          <p className="break-all font-mono text-sm font-semibold text-brand-text">{t.user}</p>
                          <p className="text-xs text-brand-muted">{t.recharge || "Recarga sin dato"} · {t.advisor || "Sin asesor"}{t.creditTime ? ` · ${t.creditTime}` : ""}</p>
                        </div>
                        <div className="min-w-0 text-xs text-brand-graphite">
                          <p>{t.reason}</p>
                          {t.newDue ? <p className="mt-0.5 text-brand-muted">Nuevo vencimiento (H): {fmt(t.newDue)}</p> : null}
                          {t.observation ? <p className="mt-0.5 text-brand-muted">Obs.: {t.observation}</p> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                          <Chip state={t.state} />
                          <span className="text-[11px] text-brand-muted">{STATE_HINT[t.state]}</span>
                          <span className="font-mono text-[10px] text-brand-muted">Fila {t.row}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
