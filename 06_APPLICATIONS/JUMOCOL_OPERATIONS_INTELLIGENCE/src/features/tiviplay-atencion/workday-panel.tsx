import Link from "next/link";

import type { Money } from "@/server/tiviplay-live/runtime-read-model";
import type { QueueBucket, QueueLane, WorkdayResult } from "@/server/tiviplay-live/workday";

const card = "rounded-2xl border border-brand-border bg-brand-background p-5";
const blocked = "rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error";
const BUCKET_LABEL: Record<QueueBucket, string> = { VENCIDO: "Vencidos", HOY: "Vencen hoy", SEMANA: "Resto de la semana", MES: "Resto del mes" };
const LANE_LABEL: Record<QueueLane, string> = { COBRAR: "Cobrar", CONFIRMAR_PAGO: "Confirmar pago", VERIFICAR: "Verificar antes de cobrar", BLOQUEADO: "Bloqueado · Dirección" };
const LANE_CLASS: Record<QueueLane, string> = {
  COBRAR: "border-brand-green/35 bg-brand-green/10 text-status-success",
  CONFIRMAR_PAGO: "border-brand-primary/35 bg-brand-primary/10 text-brand-primary-dark",
  VERIFICAR: "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
  BLOQUEADO: "border-brand-red/30 bg-brand-red/8 text-status-error",
};

export const money = (m: Money) => (["USD", "COP", "CAD"] as const).filter((c) => m[c]).map((c) => `${c} ${m[c].toLocaleString("es-CO")}`).join(" + ") || "—";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className={card}><p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>{hint ? <p className="mt-1 text-xs text-brand-muted">{hint}</p> : null}</div>;
}

export function WorkdayPanel({ result }: { result: WorkdayResult }) {
  if (!result.ok) return <p className={`${blocked} mt-6`} role="alert">BLOQUEADO: {result.reason} No se muestran clientes ni importes sin fuente verificable.</p>;
  const { workday: w, source } = result;
  const sourceText = source.mode === "SNAPSHOT"
    ? `CAPTURA LOCAL de solo lectura del ${new Date(source.capturedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })} — no es lectura en vivo`
    : "Google Sheets en vivo (solo lectura)";
  return <div className="mt-6 space-y-5">
    <p className={`rounded-2xl border px-4 py-3 text-xs ${source.mode === "SNAPSHOT" ? "border-brand-yellow/50 bg-brand-yellow/10 text-status-warning" : "border-brand-border bg-brand-surface text-brand-muted"}`}>
      Fecha operativa <strong>{w.today}</strong> (America/Bogota) · Fuente: <strong>{sourceText}</strong> · {source.workbook} · hojas {source.sheetsRead.join(", ")} · firma <code>{source.signature.slice(0, 12)}…</code>
    </p>
    {w.blockers.map((b) => <p className={blocked} key={b} role="note">{b}</p>)}

    <section aria-labelledby="indicadores">
      <h2 className="text-lg font-semibold" id="indicadores">Cartera del día · {w.carteraSheet ?? "sin hoja"}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Fichas del mes" value={w.universe} hint={`${w.later} programadas después de esta semana`} />
        <Stat label="Clientes a gestionar hoy" value={w.queue.length} hint={`Vencidos ${w.counts.VENCIDO} · hoy ${w.counts.HOY} · semana ${w.counts.SEMANA}`} />
        <Stat label="Cobrables hoy (vencidos + hoy)" value={money(w.toCollectToday)} hint={`Solo carril Cobrar. Excluye ${w.queue.filter((q) => q.lane !== "COBRAR" && q.bucket !== "SEMANA").length} ficha(s) a verificar/bloqueadas. Nominal esperado, no recaudo ni CONFIRMADO JM`} />
        <Stat label="Créditos" value={w.credits.status} hint={`Ejecutados ${w.credits.totals.EJECUTADO} · habilitados ${w.credits.totals.HABILITADO} · por decidir ${w.credits.totals.REQUIERE_REVISION}`} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(LANE_LABEL) as QueueLane[]).map((l) => <div className={`rounded-xl border px-4 py-3 ${LANE_CLASS[l]}`} key={l}>
          <p className="text-[10px] font-black uppercase tracking-[0.12em]">{LANE_LABEL[l]} · mes</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{w.lanes[l].count} · {money(w.lanes[l].amount)}</p>
        </div>)}
      </div>
    </section>

    <section aria-labelledby="creditos" className={card}>
      <h2 className="text-lg font-semibold" id="creditos">Créditos por panel</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead><tr className="text-left text-[10px] uppercase tracking-[0.12em] text-brand-muted"><th className="py-1 pr-4">Panel</th><th className="pr-4">Hoja</th><th className="pr-4">Estado</th><th className="pr-4">Programados</th><th className="pr-4">Otorgados</th><th className="pr-4">Faltantes</th><th className="pr-4">Hoy</th><th>Motivo</th></tr></thead>
          <tbody>{w.credits.panels.map((p) => <tr className="border-t border-brand-border" key={p.panel}>
            <td className="py-1 pr-4 font-semibold">{p.panel}</td><td className="pr-4">{p.sheet ?? "—"}</td>
            <td className={`pr-4 font-bold ${p.status === "OK" ? "text-status-success" : "text-status-error"}`}>{p.status === "OK" ? "OK" : "BLOQUEADO"}</td>
            <td className="pr-4 tabular-nums">{p.programados ?? "—"}</td><td className="pr-4 tabular-nums">{p.otorgados ?? "—"}</td><td className="pr-4 tabular-nums">{p.faltantes ?? "—"}</td><td className="pr-4 tabular-nums">{p.hoy ?? "—"}</td>
            <td className="text-brand-muted">{p.reason ?? ""}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-brand-muted">Estados: ejecutado {w.credits.totals.EJECUTADO} · habilitado {w.credits.totals.HABILITADO} · pendiente de pago {w.credits.totals.NO_HABILITADO + w.credits.totals.SIN_PAGAR} · requiere decisión {w.credits.totals.REQUIERE_REVISION}. El detalle y las decisiones están en <Link className="font-semibold underline" href="/operaciones/tiviplay/hoy">HOY</Link>. Esta vista no otorga créditos.</p>
    </section>

    <section aria-labelledby="cola">
      <h2 className="text-lg font-semibold" id="cola">Cola de atención de hoy ({w.queue.length})</h2>
      <p className="mt-1 text-xs text-brand-muted">Orden: vencidos → hoy → resto de la semana; dentro de cada grupo, cobrar → confirmar → verificar → bloqueado. ATENDER abre la ficha sugerida con el mensaje ya personalizado.</p>
      {w.queue.length === 0 ? <p className="mt-3 text-sm text-brand-muted">La cartera no tiene clientes por gestionar en la jornada.</p> : <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {w.queue.map((q) => <li className={`${card} flex flex-col`} key={`${q.source}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand-border px-2 py-0.5 text-[10px] font-black uppercase">{BUCKET_LABEL[q.bucket]}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${LANE_CLASS[q.lane]}`}>{LANE_LABEL[q.lane]}</span>
          </div>
          <p className="mt-2 font-semibold">{q.client}</p>
          <p className="text-xs text-brand-graphite">{q.phone || "Sin teléfono"} · usuario <span className="font-mono">{q.user || "—"}</span></p>
          <p className="text-xs text-brand-muted">{q.plan || "Plan POR VALIDAR"} · {q.panel || "—"} · {q.method || "—"}</p>
          <p className="mt-1 text-sm tabular-nums">Vence {q.dueDate ?? "POR VALIDAR"} · <strong>{money(q.amount)}</strong></p>
          <p className="mt-1 text-xs">{q.nextAction}{q.reason ? <span className="text-brand-muted"> · {q.reason}</span> : null}</p>
          <p className="text-[10px] text-brand-muted">Estado de cobro en hoja: {q.collectionStatus || "—"} · {q.source}</p>
          <Link className="mt-3 self-start rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white" href={`/operaciones/tiviplay/atencion?cliente=${q.id}&ficha=${q.suggestedFicha}#ficha`} prefetch={false}>ATENDER · {q.suggestedFicha}</Link>
        </li>)}
      </ul>}
    </section>
  </div>;
}
