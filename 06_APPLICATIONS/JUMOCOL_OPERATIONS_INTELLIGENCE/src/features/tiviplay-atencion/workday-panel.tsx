import Link from "next/link";

import type { Money } from "@/server/tiviplay-live/runtime-read-model";
import type { QueueBucket, QueueLane, WorkdayResult } from "@/server/tiviplay-live/workday";
import { ADVANCE_WINDOW } from "@/server/tiviplay-live/workday-model";

const card = "rounded-xl border border-brand-border bg-brand-background p-3";
const blocked = "rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error";
const BUCKET_LABEL: Record<QueueBucket, string> = { VENCIDO: "Vencido", HOY: "Vence hoy", ANTICIPADO: "Gestión anticipada", MES: "Resto del mes" };
const LANE_LABEL: Record<QueueLane, string> = { COBRAR: "Cobrar", CONFIRMAR_PAGO: "Confirmar pago", VERIFICAR: "Verificar antes de cobrar", BLOQUEADO: "Bloqueado · Dirección" };
const LANE_CLASS: Record<QueueLane, string> = {
  COBRAR: "border-brand-green/35 bg-brand-green/10 text-status-success",
  CONFIRMAR_PAGO: "border-brand-primary/35 bg-brand-primary/10 text-brand-primary-dark",
  VERIFICAR: "border-brand-yellow/45 bg-brand-yellow/10 text-status-warning",
  BLOQUEADO: "border-brand-red/30 bg-brand-red/8 text-status-error",
};

const isP3 = (b: string) => b.includes("P3:") || b.includes("P3 ");

export const money = (m: Money) => (["USD", "COP", "CAD"] as const).filter((c) => m[c]).map((c) => `${c} ${m[c].toLocaleString("es-CO")}`).join(" + ") || "—";

/** Indicador con su procedencia: fuente · fecha · alcance. */
function Stat({ label, value, source, scope, tone, admin = true }: { label: string; value: string | number; source: string; scope: string; tone?: "warn" | "error"; admin?: boolean }) {
  const toneClass = tone === "error" ? "text-status-error" : tone === "warn" ? "text-status-warning" : "";
  return <div className={card}>
    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</p>
    <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    {admin ? <details className="mt-1 text-[11px] leading-4 text-brand-muted">
      <summary className="cursor-pointer">Fuente y alcance · {scope}</summary>
      <p className="mt-1">Fuente: {source}</p>
    </details> : null}
  </div>;
}

export function WorkdayPanel({ result, admin }: { result: WorkdayResult; admin: boolean }) {
  if (!result.ok) return <p className={`${blocked} mt-6`} role="alert">BLOQUEADO: {result.reason} No se muestran clientes ni importes sin fuente verificable.</p>;
  const { workday: w, source } = result;
  const partial = w.scope.status === "PARCIAL";
  const scope = partial ? "PARCIAL" : "mes completo";
  const when = source.mode === "SNAPSHOT" ? `captura ${new Date(source.capturedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}` : `en vivo ${w.today}`;
  const cartera = `${w.carteraSheet ?? "sin hoja"} (${when})`;
  const control = `CONTROL ${w.month} P1/P2/P3 (${when})`;
  const sum = (k: "programados" | "otorgados" | "habilitados" | "pendientes" | "bloqueados") => {
    const ok = w.credits.panels.filter((p) => p[k] != null);
    return ok.length ? ok.reduce((a, p) => a + (p[k] ?? 0), 0) : null;
  };
  const show = (v: number | null) => (v == null ? "BLOQUEADO" : v);
  const creditScope = w.credits.status === "OK" ? scope : `${w.credits.status} (${w.credits.panels.filter((p) => p.status === "OK").map((p) => p.panel).join(", ") || "ningún panel"})`;
  const p3Observed = w.credits.panels.find((p) => p.panel === "P3")?.observed;

  return <div className="mt-6 space-y-5">
    <div className={`rounded-xl border px-3 py-2 text-xs ${source.mode === "SNAPSHOT" ? "border-brand-yellow/50 bg-brand-yellow/10 text-status-warning" : "border-brand-border bg-brand-surface text-brand-muted"}`}>
      <strong>{w.today}</strong> · {source.mode === "SNAPSHOT" ? "CAPTURA LOCAL · alcance parcial" : "Google Sheets en vivo · solo lectura"}
      {admin ? <details className="mt-1">
        <summary className="cursor-pointer">Ver procedencia de los datos</summary>
        <p className="mt-1">{source.workbook} · hojas: {source.sheetsRead.join(", ")} · firma <code>{source.signature.slice(0, 12)}…</code></p>
      </details> : null}
    </div>
    {!admin && w.blockers.some(isP3) ? <p className={blocked} role="note">Panel 3: CONTROL disponible para auditoría de lectura; la autorización de nuevos créditos sigue bloqueada por excepciones de identidad y cobertura. Revisa el detalle en Créditos técnicos. No asignes créditos sin validación.</p> : null}
    {admin ? w.blockers.map((b) => <details className={blocked} key={b}>
      <summary className="cursor-pointer font-semibold">{isP3(b) ? "Panel 3 bloqueado: identidad no verificable. No se incluyen sus créditos." : "Excepción operacional: revisar antes de actuar"}</summary>
      <p className="mt-1">{b}</p>
    </details>) : null}

    {!admin ? <div className="grid gap-3 sm:grid-cols-3">
      <Stat admin={false} label="Por gestionar hoy" value={w.queue.length} source={cartera} scope={scope} />
      <Stat admin={false} label="Vencidos" value={w.counts.VENCIDO} source={cartera} scope={scope} tone={w.counts.VENCIDO ? "warn" : undefined} />
      <Stat admin={false} label="Vencen hoy" value={w.counts.HOY} source={cartera} scope={scope} />
    </div> : null}

    {admin ? <>
    <section aria-labelledby="indicadores">
      <h2 className="text-lg font-semibold" id="indicadores">Cartera y cobranza</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clientes por gestionar hoy" value={w.queue.length} source={cartera} scope={scope} />
        <Stat label="Vencidos" value={w.counts.VENCIDO} source={cartera} scope={scope} tone={w.counts.VENCIDO ? "warn" : undefined} />
        <Stat label="Vencen hoy" value={w.counts.HOY} source={cartera} scope={scope} />
        <Stat label={`Gestión anticipada (${ADVANCE_WINDOW.days} día)`} value={w.counts.ANTICIPADO} source={`${cartera}; regla: ${ADVANCE_WINDOW.source}, ${ADVANCE_WINDOW.validation}`} scope={scope} />
        <Stat label="Cobrable nominal hoy (vencidos + hoy + anticipada)" value={money(w.toCollectToday)} source={`${cartera}, columnas USD/COP; carril Cobrar. Es lo esperado, no dinero recibido`} scope={scope} />
        <Stat label="Pagos pendientes de confirmación" value={w.paymentsToConfirm.status === "OK" ? `${w.paymentsToConfirm.count} · ${money(w.paymentsToConfirm.amount)}` : "BLOQUEADO"} source={w.paymentsToConfirm.status === "OK" ? `${w.paymentsToConfirm.source}; solo CONFIRMADO JM acredita` : w.paymentsToConfirm.reason ?? "—"} scope={w.paymentsToConfirm.status === "OK" ? scope : "sin fuente"} tone={w.paymentsToConfirm.status === "OK" ? undefined : "error"} />
        <Stat label="En revisión (mes)" value={`${w.lanes.VERIFICAR.count} · ${money(w.lanes.VERIFICAR.amount)}`} source={`${cartera}, CLASIFICACION_BORRADOR = REQUIERE_REVISION`} scope={scope} tone="warn" />
        <Stat label="Bloqueados (mes)" value={`${w.lanes.BLOQUEADO.count} · ${money(w.lanes.BLOQUEADO.amount)}`} source={`${cartera}, CLASIFICACION_BORRADOR = BLOQUEADO`} scope={scope} tone={w.lanes.BLOQUEADO.count ? "error" : undefined} />
      </div>
      <p className="mt-2 text-xs text-brand-muted">Fichas del mes: {w.universe} · cobrar {w.lanes.COBRAR.count} ({money(w.lanes.COBRAR.amount)}) · programadas después de la ventana: {w.later}. USD, COP y CAD no se suman entre sí.</p>
    </section>

    <section aria-labelledby="creditos" className={card}>
      <h2 className="text-lg font-semibold" id="creditos">Créditos técnicos</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Programados" value={show(sum("programados"))} source={control} scope={creditScope} />
        <Stat label="Otorgados" value={show(sum("otorgados"))} source={`${control}, CRÉDITO > 0`} scope={creditScope} />
        <Stat label="Habilitados" value={show(sum("habilitados"))} source="Motor getCreditosHoy: habilitación financiera Caso A/B/E" scope={creditScope} />
        <Stat label="Pendientes de pago" value={show(sum("pendientes"))} source="Motor getCreditosHoy: sin habilitación financiera" scope={creditScope} tone="warn" />
        <Stat label="Bloqueados (Dirección)" value={show(sum("bloqueados"))} source="Motor getCreditosHoy: excepción por decidir" scope={creditScope} tone="error" />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead><tr className="text-left text-[10px] uppercase tracking-[0.12em] text-brand-muted"><th className="py-1 pr-4">Panel</th><th className="pr-4">Hoja</th><th className="pr-4">Estado</th><th className="pr-4">Programados</th><th className="pr-4">Otorgados</th><th className="pr-4">Habilitados</th><th className="pr-4">Pendientes</th><th className="pr-4">Bloqueados</th><th>Motivo</th></tr></thead>
          <tbody>{w.credits.panels.map((p) => <tr className="border-t border-brand-border" key={p.panel}>
            <td className="py-1 pr-4 font-semibold">{p.panel}</td><td className="pr-4">{p.sheet ?? "—"}</td>
            <td className={`pr-4 font-bold ${p.status === "OK" ? "text-status-success" : "text-status-error"}`}>{p.status === "OK" ? (partial ? "OK · PARCIAL" : "OK") : "BLOQUEADO"}</td>
            {(["programados", "otorgados", "habilitados", "pendientes", "bloqueados"] as const).map((k) => <td className="pr-4 tabular-nums" key={k}>{p[k] ?? "—"}</td>)}
            <td className="text-brand-muted">{p.reason ?? ""}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {p3Observed ? <div className="mt-4 rounded-xl border border-brand-yellow/45 bg-brand-yellow/10 p-4" role="note">
        <h3 className="text-sm font-bold">Panel 3 · Auditoría de CONTROL en solo lectura</h3>
        <p className="mt-1 text-xs">La hoja es legible; el otorgamiento permanece BLOQUEADO. Estos conteos NO son créditos habilitados.</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          {([
            ["Fichas CONTROL", p3Observed.records],
            ["Créditos registrados", p3Observed.recordedCredits],
            ["Sin crédito registrado", p3Observed.noCredit],
            ["Identidad única en BASE", p3Observed.matchedUnique],
            ["Sin BASE", p3Observed.noBase],
            ["USUARIO duplicado", p3Observed.ambiguousBase],
            ["Contradicción de panel", p3Observed.otherPanel],
          ] as const).map(([label, value]) => <div className="rounded-lg border border-brand-border bg-brand-background p-2" key={label}><dt className="text-brand-muted">{label}</dt><dd className="text-lg font-bold tabular-nums">{value}</dd></div>)}
        </dl>
        <p className="mt-2 text-xs text-brand-muted">Solo la evidencia individual de CONTROL, BASE y confirmación financiera habilita una decisión futura; no se infiere autorización de estos agregados.</p>
      </div> : null}
      <p className="mt-2 text-xs text-brand-muted">Un comprobante no habilita un crédito: lo habilita el motor con CONFIRMADO JM y cobertura. Las decisiones se toman en <Link className="font-semibold underline" href="/operaciones/tiviplay/hoy">HOY</Link>; esta vista no otorga créditos.</p>
    </section>

    </> : null}

    <section aria-labelledby="cola">
      <h2 className="text-lg font-semibold" id="cola">Cola Operacional · Contactos y alertas ({w.queue.length})</h2>
      <p className="mt-2 rounded-xl border border-brand-yellow/45 bg-brand-yellow/10 px-3 py-2 text-xs text-status-warning" role={w.releaseAlerts ? "alert" : "status"}>
        Alertas de liberación de línea: <strong>{w.releaseAlerts}</strong>. Responsable: el asesor que abre ATENDER.
        Son alertas calculadas desde D0: no prueban que la línea esté suspendida ni que se haya ejecutado la acción.
        Comprobar primero el pago del ciclo y después el estado real del panel.
      </p>
      {admin ? <p className="mt-1 text-xs text-brand-muted">Orden: vencidos → hoy → anticipada; en cada grupo: cobrar → confirmar → verificar → bloqueado. ATENDER abre Atención con el cliente y la ficha sugerida. Fuente: {cartera} · Alcance: {scope}.</p> : null}
      {w.queue.length === 0 ? <p className="mt-3 text-sm text-brand-muted">La cartera no tiene clientes por gestionar en la jornada.</p> : <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {w.queue.map((q, i) => <li className={`${card} flex flex-col`} key={`${q.source}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-brand-muted">#{i + 1}</span>
            <span className="rounded-full border border-brand-border px-2 py-0.5 text-[10px] font-black uppercase">{BUCKET_LABEL[q.bucket]}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${LANE_CLASS[q.lane]}`}>{LANE_LABEL[q.lane]}</span>
          </div>
          {q.releaseAlert ? <div className="mt-2 rounded-xl border border-brand-yellow/45 bg-brand-yellow/10 px-3 py-2 text-xs text-status-warning" role="alert">
            <p className="font-bold">ALERTA · Verificar liberación de línea · D+{q.releaseAlert.daysOverdue}</p>
            <p>Estado: {q.releaseAlert.state === "PENDIENTE_VERIFICACION_FINANCIERA" ? "VERIFICAR FINANZAS ANTES DE ACTUAR" : "PENDIENTE DE VERIFICACIÓN TÉCNICA"}</p>
            <p>Responsable: asesor que atiende · {q.releaseAlert.instruction}</p>
          </div> : null}
          <p className="mt-2 font-semibold">{q.client}</p>
          <p className="text-xs text-brand-graphite">{q.phone || "Sin teléfono"} · usuario <span className="font-mono">{q.user || "—"}</span></p>
          <p className="text-xs text-brand-muted">{q.plan || "Plan POR VALIDAR"} · {q.panel || "—"} · {q.method || "—"}</p>
          <p className="mt-1 text-sm tabular-nums">Vence {q.dueDate ?? "POR VALIDAR"} · <strong>{money(q.amount)}</strong> <span className="text-[10px] text-brand-muted">nominal</span></p>
          <p className="mt-1 text-xs"><strong>Motivo:</strong> {q.reason || BUCKET_LABEL[q.bucket]}</p>
          <p className="text-xs"><strong>Acción:</strong> {q.nextAction}</p>
          <p className="text-xs">{q.lastManaged ? <><strong>Última gestión:</strong> {q.lastManaged}</> : <span className="text-brand-muted">Sin historial de gestión en la fuente: no se asume etapa (primer contacto o seguimiento).</span>}</p>
          {admin ? <p className="text-[10px] text-brand-muted">Estado de cobro en hoja: {q.collectionStatus || "—"} · {q.source}</p> : null}
          <Link className="mt-3 self-start rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white" href={`/operaciones/tiviplay/atencion?cliente=${q.id}&ficha=${q.suggestedFicha}#cliente`} prefetch={false}>ATENDER · {q.suggestedFicha}</Link>
        </li>)}
      </ul>}
    </section>

    {admin ? <>
    <section aria-labelledby="excepciones" className={card}>
      <h2 className="text-lg font-semibold" id="excepciones">Excepciones ({w.exceptions.length})</h2>
      {w.exceptions.length === 0 ? <p className="mt-2 text-sm text-brand-muted">Sin excepciones en las fuentes leídas ({scope}).</p> : <ul className="mt-2 space-y-1 text-xs">
        {w.exceptions.slice(0, 40).map((e) => <li key={`${e.type}-${e.source}`}><strong>{e.type}</strong> · {e.detail} <span className="text-brand-muted">({e.source})</span></li>)}
      </ul>}
    </section>
    </> : null}
  </div>;
}
