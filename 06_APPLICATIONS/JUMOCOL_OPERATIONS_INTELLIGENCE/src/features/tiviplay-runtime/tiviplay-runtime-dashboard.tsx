"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { EmptyChart, InteractiveBarList, MetricCard, SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { CARTERA_LABEL, evidenceText, formatDate, formatMoney, formatNumber } from "@/features/tiviplay-runtime/format";
import type { CarteraState, Evidence, Kpi, PanelId, PanelSummary } from "@/server/tiviplay-live/runtime-read-model";
import type { TiviplayMonthlyCloseLive } from "@/server/tiviplay-live/monthly-close";
import type { TiviplayRuntimeLive } from "@/server/tiviplay-live/runtime-source";

import type { OperationalRuntime } from "@/server/tiviplay-live/runtime-access";

type Tab = "gerencial" | "operativa" | "clientes" | "cierre";

const TABS: Array<{ id: Tab; label: string; question: string }> = [
  { id: "gerencial", label: "Vista gerencial", question: "¿Cómo está TiviPlay hoy?" },
  { id: "operativa", label: "Vista operativa", question: "¿Qué tiene que hacer el equipo hoy?" },
  { id: "clientes", label: "Buscar cliente", question: "Ficha operativa por cliente" },
  { id: "cierre", label: "Cierre mensual", question: "Pre-cierre BASE GENERAL por mes (Runtime V1)" },
];

type CloseProps = { monthlyClose: TiviplayMonthlyCloseLive | null; closeError: string | null; closeMonth: string };

export function TiviplayRuntimeDashboard({ model, managementModel, ...close }: { model: OperationalRuntime; managementModel?: TiviplayRuntimeLive } & CloseProps) {
  const [tab, setTab] = useState<Tab>(managementModel ? "gerencial" : "operativa");

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-background px-4 py-3 text-[11px] text-brand-muted">
        <span>
          <strong className="text-brand-text">Fuente viva:</strong> {model.source.workbook} · {model.source.sheetsRead.length} hojas · ventana{" "}
          {model.scope.start} → {model.scope.end} ({model.scope.id})
        </span>
        <span className="flex items-center gap-3">
          <span>Leído {new Date(model.generatedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}{model.source.cached ? " · caché 60 s" : ""}</span>
          <Link className="rounded-full border border-brand-border px-3 py-1.5 font-black uppercase tracking-[0.1em] text-brand-primary hover:border-brand-primary" href="?refresh=1" prefetch={false}>
            Actualizar
          </Link>
        </span>
      </div>

      <div role="tablist" aria-label="Vistas del runtime" className="mt-5 flex flex-wrap gap-2">
        {TABS.filter(t => t.id !== "gerencial" || managementModel).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition ${tab === t.id ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border bg-brand-background text-brand-muted hover:border-brand-primary hover:text-brand-primary"}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
        <span className="self-center text-xs text-brand-muted">{TABS.find((t) => t.id === tab)?.question}</span>
      </div>

      <div className="mt-5">
        {tab === "gerencial" && managementModel ? <ManagementView model={managementModel} /> : null}
        {tab === "operativa" ? <OperationsView model={model} /> : null}
        {tab === "clientes" ? <ClientSearch model={model} /> : null}
        {tab === "cierre" ? <MonthlyCloseView {...close} /> : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- gerencial */

function KpiCard<T>({ label, kpi, value, detail, tone }: { label: string; kpi: Kpi<T>; value: string; detail: string; tone?: "blue" | "green" | "yellow" | "red" | "cyan" }) {
  const decision = kpi.evidence.status === "REQUIERE_DECISION";
  return (
    <div title={evidenceText(kpi.evidence)}>
      <MetricCard label={label} value={decision ? "REQUIERE DECISIÓN" : value} detail={decision ? kpi.evidence.rule : detail} tone={decision ? "yellow" : tone} />
    </div>
  );
}

function ManagementView({ model }: { model: TiviplayRuntimeLive }) {
  const g = model.management;
  const panels = (["P1", "P2", "P3"] as PanelId[]).map((id) => model.panels[id]);
  const consolidated = panels.reduce(
    (acc, p) => (p ? { credits: acc.credits + p.creditsByField, balance: acc.balance + (p.currentBalance ?? 0), diff: acc.diff + p.difference, pending: acc.pending + p.scheduledPending } : acc),
    { credits: 0, balance: 0, diff: 0, pending: 0 },
  );
  const maxWeek = Math.max(...g.weekly.value.map((w) => w.collected.USD), 1);
  const maxMonth = Math.max(...g.monthly.value.map((m) => m.registered.USD), 1);
  const stateEntries = Object.entries(g.portfolioStates.value) as Array<[CarteraState, { count: number; nominal: TiviplayRuntimeLive["operations"]["pendingValue"] }]>;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard label="Meta del día" kpi={g.dailyTarget} value="—" detail="" />
        <KpiCard label="Recaudo del día" kpi={g.collectedToday} value={formatMoney(g.collectedToday.value)} detail={`Confirmado ${formatDate(model.today)}`} tone="green" />
        <KpiCard label="Recaudo del mes" kpi={g.collectedMonth} value={formatMoney(g.collectedMonth.value)} detail={`Recibido total ${formatMoney(g.receivedMonth.value)}`} tone="green" />
        <KpiCard label="Pendiente por recaudar" kpi={g.pendingToCollect} value={formatMoney(g.pendingToCollect.value)} detail={`${g.portfolioStates.value.SIN_PAGO.count} fichas sin pago`} tone="red" />
        <KpiCard label="Cartera del mes" kpi={g.portfolioNominal} value={formatMoney(g.portfolioNominal.value)} detail={`${g.coverage.value.total} vencimientos ${model.currentMonth}`} />
        <KpiCard label="Cobertura vencimientos" kpi={g.coverage} value={`${g.coverage.value.pct}%`} detail={`${g.coverage.value.paid} de ${g.coverage.value.total} fichas con pago`} tone="cyan" />
        <KpiCard label="Pagos por confirmar" kpi={g.paymentsToConfirm} value={formatNumber(g.paymentsToConfirm.value.count)} detail={formatMoney(g.paymentsToConfirm.value.amount)} tone="yellow" />
        <KpiCard label="Casos que requieren decisión" kpi={g.decisionCases} value={formatNumber(g.decisionCases.value)} detail="Tarifa/enlace, no renovación, filas con error" tone="yellow" />
        <KpiCard label="Clientes activos" kpi={g.activeClients} value={formatNumber(g.activeClients.value)} detail={`${model.clients.pendingRenewal} por vencer · ${model.clients.inScope} en ventana`} tone="blue" />
        <KpiCard label="Clientes vencidos" kpi={g.inactiveClients} value={formatNumber(g.inactiveClients.value)} detail={`ESTADO=Vencido (comercial, no es baja) · TC=0 fuera de conteo: ${model.clients.excludedTc0}`} tone="red" />
        <KpiCard label="Proyección de cierre" kpi={g.projection} value="—" detail="" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard eyebrow="Recaudo por método" title={`Métodos de pago · ${model.currentMonth}`} description="Confirmado por método. Pendiente y revisión se muestran aparte; no se suman al recaudo.">
          <div title={evidenceText(g.byMethod.evidence)}>
            <InteractiveBarList
              data={g.byMethod.value.map((m) => ({
                key: m.method,
                label: `${m.method} · ${m.count} pagos`,
                value: m.confirmed.USD,
                secondary: `Confirmado ${formatMoney(m.confirmed)} · Pendiente ${formatMoney(m.pending)} · Revisión ${formatMoney(m.review)}`,
              }))}
              formatValue={(v) => `USD ${formatNumber(v)}`}
              onSelect={() => undefined}
            />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Paneles / servicio" title="Consolidado Panel 1 · 2 · 3" description="Créditos consumidos según campo CREDITO; diferencia = consumo por saldo − consumo por CREDITO.">
          <div className="grid gap-3 sm:grid-cols-3">
            {panels.map((p, i) => (p ? <PanelCard key={p.panel} panel={p} /> : <EmptyChart key={i} label={`P${i + 1}: REQUIERE DECISIÓN — sin hoja CONTROL del mes`} />))}
          </div>
          <p className="mt-4 rounded-2xl bg-brand-surface px-4 py-3 text-xs text-brand-graphite">
            <strong>Total consolidado:</strong> {formatNumber(consolidated.credits)} créditos consumidos · saldo {formatNumber(consolidated.balance)} · diferencia {formatNumber(consolidated.diff)} · {formatNumber(consolidated.pending)} vencimientos por procesar ·{" "}
            <span className="font-bold text-status-warning">Costo por panel: REQUIERE DECISIÓN (sin precio por crédito en la fuente)</span>
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard eyebrow="Mes en curso" title="Evolución semanal" description="Recaudo confirmado (USD) y vencimientos por semana.">
          <div className="space-y-3" title={evidenceText(g.weekly.evidence)}>
            {g.weekly.value.map((w) => (
              <div key={w.week} className="text-xs">
                <div className="flex justify-between gap-2"><span className="font-semibold text-brand-graphite">S{w.week} · {w.label}</span><span className="tabular-nums text-brand-primary-dark">{formatMoney(w.collected)} · {w.due} venc.</span></div>
                <span className="mt-1 block h-2 rounded-full bg-brand-surface"><span className="block h-full rounded-full bg-brand-green" style={{ width: `${(w.collected.USD / maxWeek) * 100}%` }} /></span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Cartera" title="Estados de cobro" description={`Vencimientos ${model.currentMonth} según ESTADO_FINANCIERO.`}>
          <div title={evidenceText(g.portfolioStates.evidence)}>
            <InteractiveBarList data={stateEntries.filter(([, v]) => v.count).map(([k, v]) => ({ key: k, label: CARTERA_LABEL[k], value: v.count, secondary: formatMoney(v.nominal) }))} formatValue={(v) => `${v} fichas`} onSelect={() => undefined} />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Ventana jun → hoy" title="Recaudo mensual" description="Registrado en hojas de pago vs confirmado. Jun–ago tienen confirmación incompleta en la fuente.">
          <div className="space-y-3" title={evidenceText(g.monthly.evidence)}>
            {g.monthly.value.map((m) => (
              <div key={m.month} className="text-xs">
                <div className="flex justify-between gap-2"><span className="font-semibold text-brand-graphite">{m.month}</span><span className="tabular-nums text-brand-primary-dark">USD {formatNumber(m.registered.USD)} · conf. {formatNumber(m.confirmed.USD)}</span></div>
                <span className="relative mt-1 block h-2 rounded-full bg-brand-surface">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-brand-cyan" style={{ width: `${(m.registered.USD / maxMonth) * 100}%` }} />
                  <span className="absolute inset-y-0 left-0 rounded-full bg-brand-primary" style={{ width: `${(m.confirmed.USD / maxMonth) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard eyebrow="Portafolio" title="Planes de clientes activos" description="BASE GENERAL · plan canónico.">
          <InteractiveBarList data={g.plans.value.slice(0, 8).map((p) => ({ key: p.plan, label: p.plan, value: p.active }))} formatValue={(v) => `${v}`} onSelect={() => undefined} />
        </SectionCard>
        <SectionCard eyebrow="Gobierno del dato" title="Requiere decisión" description="Indicadores que no se muestran hasta tener regla explícita.">
          <ul className="space-y-2 text-xs leading-5 text-brand-graphite">
            {model.decisions.map((d) => <li key={d} className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-2">{d}</li>)}
          </ul>
        </SectionCard>
      </div>

      <EvidenceTable model={model} />
    </div>
  );
}

function PanelCard({ panel }: { panel: PanelSummary }) {
  return (
    <article className="rounded-2xl border border-brand-border p-4 text-xs">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-primary">{panel.panel} · {panel.panelName}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-text">{formatNumber(panel.creditsByField)}</p>
      <p className="text-[10px] text-brand-muted">créditos consumidos</p>
      <dl className="mt-3 space-y-1 text-[11px] text-brand-graphite">
        <Row k="Saldo actual" v={panel.currentBalance == null ? "—" : formatNumber(panel.currentBalance)} />
        <Row k="Saldo inicial" v={panel.openingBalance == null ? "—" : formatNumber(panel.openingBalance)} />
        <Row k="Compras" v={panel.purchases.length ? panel.purchases.map((p) => `→ ${p.newBalance}`).join(", ") : "0"} />
        <Row k="Diferencia" v={formatNumber(panel.difference)} warn={panel.difference !== 0} />
        <Row k="Liberados / sin asignar" v={`${panel.released} / ${panel.unassigned}`} />
        <Row k="Por procesar" v={formatNumber(panel.scheduledPending)} />
      </dl>
    </article>
  );
}

function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-brand-muted">{k}</dt>
      <dd className={`tabular-nums font-semibold ${warn ? "text-status-error" : ""}`}>{v}</dd>
    </div>
  );
}

function EvidenceTable({ model }: { model: TiviplayRuntimeLive }) {
  const rows: Array<[string, Evidence]> = Object.entries(model.management).map(([k, v]) => [k, (v as Kpi<unknown>).evidence]);
  return (
    <details className="rounded-3xl border border-brand-border bg-white p-5 text-xs">
      <summary className="cursor-pointer font-black uppercase tracking-[0.12em] text-brand-primary">Cadena de evidencia · FUENTE → CAMPO → REGLA → CÁLCULO → ESTADO</summary>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="text-[10px] uppercase tracking-[0.1em] text-brand-muted"><tr><th className="py-2">KPI</th><th>Fuente</th><th>Campo</th><th>Regla</th><th>Cálculo</th><th>Estado</th></tr></thead>
          <tbody>
            {rows.map(([k, e]) => (
              <tr key={k} className="border-t border-brand-border align-top"><td className="py-2 font-semibold">{k}</td><td>{e.source}</td><td>{e.field}</td><td>{e.rule}</td><td>{e.calculation}</td><td className={e.status === "VALIDADO" ? "text-status-success" : "text-status-warning"}>{e.status}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-brand-muted">Evidencia: firma SHA-256 de la lectura <code>{model.source.signature.slice(0, 16)}…</code> · hojas leídas: {model.source.sheetsRead.join(" · ")} · excluidas: {model.sources.excluded.length}</p>
      </div>
    </details>
  );
}

/* --------------------------------------------------------------- operativa */

function OperationsView({ model }: { model: OperationalRuntime }) {
  const o = model.operations;
  const unconfirmed = model.payments.month.filter((p) => p.confirmation !== "CONFIRMADO");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Cobros de hoy" value={formatNumber(o.dueToday)} detail={`Vencen ${formatDate(model.today)}`} tone="blue" />
        <MetricCard label="Vencidos sin pago" value={formatNumber(o.overdue)} detail="F. próximo pago < hoy" tone="red" />
        <MetricCard label="Valor pendiente" value={formatMoney(o.pendingValue)} detail="Fichas SIN PAGO del mes" tone="red" />
        <MetricCard label="Pagos recibidos" value={formatNumber(model.payments.month.length)} detail={`Mes ${model.currentMonth}`} tone="green" />
        <MetricCard label="Pagos sin confirmar" value={formatNumber(unconfirmed.length)} detail="Pendiente o revisión" tone="yellow" />
        <MetricCard label="Excepciones" value={formatNumber(o.exceptions.length + model.payments.openInvoices.length)} detail="Filas con error y facturas abiertas" tone="yellow" />
      </div>

      <WorkQueue model={model} />

      <SectionCard eyebrow="Excepciones de fuente" title="Para corregir en la fuente" description="Filas desalineadas, totales que no cuadran, facturas PayPal sin cobro y diferencias de panel.">
        <ul className="space-y-2 text-xs">
          {o.exceptions.map((e) => <li key={`${e.sheet}-${e.row}-${e.type}`} className="rounded-xl border border-brand-red/25 bg-brand-red/5 px-3 py-2"><strong>{e.type}</strong> · {e.sheet}{e.row ? ` fila ${e.row}` : ""} — {e.detail}</li>)}
          {model.payments.openInvoices.map((f) => <li key={`${f.sheet}-${f.row}`} className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-2"><strong>FACTURA PAYPAL ABIERTA</strong> · {f.client} · USD {f.amount} · creada {formatDate(f.created)} — {f.note || "sin observación"}</li>)}
          {model.panelExceptions.map((e) => <li key={`${e.panel}-${e.row}-${e.type}`} className="rounded-xl border border-brand-border px-3 py-2"><strong>{e.panel} · {e.type}</strong> fila {e.row} — {e.detail}</li>)}
        </ul>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------- cola de trabajo */

type QueueTab = "ventas" | "cobros" | "servicio" | "listo" | "excepciones";

const STATE_TONE: Record<string, string> = {
  COBRO_HOY: "text-brand-primary", VENCIDO: "text-status-error", PENDIENTE_CONFIRMACION_JM: "text-status-warning", PAGO_REGISTRADO: "text-status-warning",
  CONFIRMADO_JM: "text-status-success", SERVICIO_VALIDADO: "text-status-success", CREDITO_APLICADO: "text-brand-primary", SERVICIO_HOY: "text-brand-primary",
  CREDITO_PENDIENTE: "text-status-warning", INCONSISTENCIA_CREDITOS: "text-status-error", REQUIERE_DECISION: "text-status-error", DUPLICIDAD: "text-status-error",
  LISTO_PARA_CONTINUAR: "text-status-success", LISTO_PARA_BASE: "text-status-success", SINCRONIZADO: "text-brand-muted", BLOQUEADO: "text-status-error",
  PENDIENTE_CONFIRMACION: "text-status-warning", YA_EN_BASE: "text-brand-muted", PROGRAMADO: "text-brand-muted",
};

function StateChip({ state }: { state: string }) {
  return <span className={`text-[10px] font-black uppercase tracking-[0.06em] ${STATE_TONE[state] ?? "text-brand-graphite"}`}>{state.replace(/_/g, " ")}</span>;
}

function Filters({ states, state, setState, advisors, advisor, setAdvisor }: { states: Record<string, number>; state: string; setState: (s: string) => void; advisors?: string[]; advisor?: string; setAdvisor?: (s: string) => void }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs">
      <select aria-label="Filtrar por estado" className="rounded-full border border-brand-border px-3 py-1.5" value={state} onChange={(e) => setState(e.target.value)}>
        <option value="TODOS">Todos los estados</option>
        {Object.entries(states).map(([k, v]) => <option key={k} value={k}>{k.replace(/_/g, " ")} ({v})</option>)}
      </select>
      {advisors && setAdvisor ? (
        <select aria-label="Filtrar por asesor" className="rounded-full border border-brand-border px-3 py-1.5" value={advisor} onChange={(e) => setAdvisor(e.target.value)}>
          <option value="TODOS">Todos los asesores</option>
          {advisors.map((a) => <option key={a} value={a}>{a}</option>)}
          <option value="SIN">Sin responsable</option>
        </select>
      ) : null}
    </div>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: ReactNode[]; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-xs">
        <thead className="text-[10px] uppercase tracking-[0.1em] text-brand-muted"><tr>{head.map((h) => <th key={h} className="py-2 pr-2">{h}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
      {!rows.length ? <EmptyChart label={empty} /> : null}
    </div>
  );
}

const FIN_ORDER = ["COBRO_HOY", "VENCIDO", "PENDIENTE_CONFIRMACION_JM", "PAGO_REGISTRADO", "REQUIERE_DECISION", "CONFIRMADO_JM", "REPROGRAMADO", "PROGRAMADO"];
const SVC_ORDER = ["SERVICIO_HOY", "CREDITO_PENDIENTE", "INCONSISTENCIA_CREDITOS", "REQUIERE_DECISION", "CREDITO_APLICADO", "SERVICIO_VALIDADO", "PROGRAMADO"];
const byOrder = (order: string[]) => (a: { state: string }, b: { state: string }) => order.indexOf(a.state) - order.indexOf(b.state);

function WorkQueue({ model }: { model: OperationalRuntime }) {
  const sy = model.sync;
  const [tab, setTab] = useState<QueueTab>("cobros");
  const [state, setState] = useState("TODOS");
  const [advisor, setAdvisor] = useState("TODOS");
  const advFilter = (a: string) => (advisor === "TODOS" ? true : advisor === "SIN" ? !a : a === advisor);
  const stFilter = (s: string) => state === "TODOS" || s === state;
  const tabs: Array<[QueueTab, string, number]> = [
    ["ventas", "Ventas", sy.counts.ventas],
    ["cobros", "Cobros", sy.counts.cobros],
    ["servicio", "Servicio", sy.counts.servicio],
    ["listo", "Listo para Base", sy.counts.listoParaBase],
    ["excepciones", "Excepciones", sy.counts.excepciones],
  ];
  const finAdvisors = [...new Set(sy.financial.map((f) => f.advisor).filter(Boolean))].sort();
  const svcAdvisors = [...new Set(sy.service.map((f) => f.advisor).filter(Boolean))].sort();
  const switchTab = (t: QueueTab) => {
    setTab(t);
    setState("TODOS");
    setAdvisor("TODOS");
  };

  return (
    <SectionCard
      eyebrow="Cola de trabajo · solo lectura"
      title="VENTAS → FINANCIERO → SERVICIO → MATCH → BASE GENERAL"
      description={`Mes ${sy.month}. Ventas: ${sy.sources.sales.join(", ") || "sin acceso"} · Financiero: ${sy.sources.financial.join(", ")} · Servicio: ${sy.sources.service.join(", ")}. Ninguna acción escribe en Google Sheets.`}
    >
      <div role="tablist" aria-label="Colas operativas" className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([id, label, n]) => (
          <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => switchTab(id)}
            className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${tab === id ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted hover:border-brand-primary"}`}>
            {label} · {formatNumber(n)}
          </button>
        ))}
      </div>

      {tab === "ventas" ? (
        <>
          <Filters states={sy.byState.sales} state={state} setState={setState} />
          <Table
            head={["Venta", "Cliente", "Tipo", "Confirmación", "Identidad", "Estado", "Siguiente acción"]}
            empty="Sin ventas para el filtro."
            rows={sy.sales.filter((x) => stFilter(x.gate)).sort((a, b) => b.month.localeCompare(a.month)).map((x) => (
              <tr key={x.id} className="border-t border-brand-border align-top">
                <td className="py-2 pr-2">{x.sheet} fila {x.row}<span className="block text-[10px] text-brand-muted">{x.concept} · {x.advisor}</span></td>
                <td className="pr-2 font-semibold">{x.client}<span className="block font-normal text-[10px] text-brand-muted">{x.plan} · {x.panel} · {x.amount} · {x.method}</span></td>
                <td className="pr-2"><StateChip state={x.type} /></td>
                <td className="pr-2"><StateChip state={x.confirmation} /><span className="block text-[10px] text-brand-muted">{x.confirmationSource}</span></td>
                <td className="pr-2 text-[11px]">{x.identity.status}<span className="block text-[10px] text-brand-muted">{x.identity.detail}</span></td>
                <td className="pr-2"><StateChip state={x.gate} />{x.missing.length ? <span className="block text-[10px] text-status-warning">Falta: {x.missing.join(", ")}</span> : null}</td>
                <td className="pr-2">{x.nextAction}</td>
              </tr>
            ))}
          />
        </>
      ) : null}

      {tab === "cobros" ? (
        <>
          <Filters states={sy.byState.financial} state={state} setState={setState} advisors={finAdvisors} advisor={advisor} setAdvisor={setAdvisor} />
          <Table
            head={["Cliente", "Valor", "Método", "Fecha", "Responsable", "Estado", "Siguiente acción"]}
            empty="Sin cobros para el filtro."
            rows={sy.financial.filter((x) => stFilter(x.state) && advFilter(x.advisor)).sort(byOrder(FIN_ORDER)).map((x) => (
              <tr key={x.id} className={`border-t border-brand-border align-top ${x.state === "COBRO_HOY" ? "bg-brand-blue-soft/50" : x.state === "VENCIDO" ? "bg-brand-red/5" : ""}`}>
                <td className="py-2 pr-2 font-semibold">{x.client}<span className="block font-normal text-[10px] text-brand-muted">{x.source}</span></td>
                <td className="pr-2 tabular-nums">{x.amount}</td>
                <td className="pr-2">{x.method || "—"}</td>
                <td className="pr-2 tabular-nums">{formatDate(x.date)}</td>
                <td className="pr-2">{x.advisor || <span className="text-brand-muted">Sin responsable</span>}</td>
                <td className="pr-2"><StateChip state={x.state} />{x.reasons[0] ? <span className="block text-[10px] text-brand-muted">{x.reasons.join(" · ")}</span> : null}</td>
                <td className="pr-2">{x.nextAction}</td>
              </tr>
            ))}
          />
        </>
      ) : null}

      {tab === "servicio" ? (
        <>
          <Filters states={sy.byState.service} state={state === "TODOS" ? "TODOS" : state} setState={setState} advisors={svcAdvisors} advisor={advisor} setAdvisor={setAdvisor} />
          <Table
            head={["Cliente / usuario", "Panel", "Créditos aplicados / requeridos", "Fecha", "Responsable", "Estado", "Siguiente acción"]}
            empty="Sin tareas de servicio para el filtro."
            rows={sy.service.filter((x) => (state === "TODOS" ? x.state !== "PROGRAMADO" : x.state === state) && advFilter(x.advisor)).sort(byOrder(SVC_ORDER)).map((x) => (
              <tr key={x.id} className={`border-t border-brand-border align-top ${x.state === "SERVICIO_HOY" ? "bg-brand-blue-soft/50" : ""}`}>
                <td className="py-2 pr-2 font-semibold">{x.client || <span className="text-brand-muted">Sin ficha</span>}<span className="block font-normal text-[10px] text-brand-muted">{x.usuario} · {x.sheet} fila {x.row}</span></td>
                <td className="pr-2">{x.panel}</td>
                <td className="pr-2 tabular-nums">{x.recharge} · {x.creditsApplied ?? "—"} / <span className="text-status-warning">{x.creditsRequired}</span></td>
                <td className="pr-2 tabular-nums">{formatDate(x.date)}</td>
                <td className="pr-2">{x.advisor || "—"}</td>
                <td className="pr-2"><StateChip state={x.state} />{x.reasons[0] ? <span className="block text-[10px] text-brand-muted">{x.reasons.join(" · ")}</span> : null}</td>
                <td className="pr-2">{x.nextAction}</td>
              </tr>
            ))}
          />
          <p className="mt-2 text-[10px] text-brand-muted">Servicios programados (fecha futura sin recarga) ocultos por defecto: {sy.byState.service.PROGRAMADO ?? 0}. Selecciónalos en el filtro de estado.</p>
        </>
      ) : null}

      {tab === "listo" ? (
        <>
          <Filters states={sy.byState.sync} state={state} setState={setState} />
          <div className="space-y-3">
            {sy.sync.filter((x) => (state === "TODOS" ? x.state === "LISTO_PARA_BASE" : x.state === state)).map((x) => (
              <article key={x.key} className="rounded-2xl border border-brand-border p-4 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{x.client} <span className="font-normal text-brand-muted">· {x.usuario || "sin usuario"} · {x.baseRow ? `BASE GENERAL!${x.baseRow}` : "nueva ficha"}</span></h3>
                  <span className="flex gap-3"><StateChip state={x.action} /><StateChip state={x.state} /></span>
                </div>
                <p className="mt-1 text-[10px] text-brand-muted">Venta: {x.sale ?? "—"} · Financiero: {x.financial ?? "—"} · Servicio: {x.service ?? "—"}</p>
                {x.changes.length ? (
                  <table className="mt-2 w-full text-left text-[11px]"><thead className="text-[9px] uppercase text-brand-muted"><tr><th>Campo BASE GENERAL</th><th>Actual</th><th>Propuesto</th></tr></thead>
                    <tbody>{x.changes.map((c) => <tr key={c.field} className="border-t border-brand-border"><td className="py-1 font-semibold">{c.field}</td><td>{c.from}</td><td className="text-status-success">{c.to}</td></tr>)}</tbody></table>
                ) : <p className="mt-2 text-brand-muted">Sin cambios: BASE GENERAL ya refleja la fuente.</p>}
                {x.blockers.length ? <ul className="mt-2 list-disc pl-4 text-status-error">{x.blockers.map((b) => <li key={b}>{b}</li>)}</ul> : null}
                <p className="mt-2 text-[10px] text-brand-muted">No incluido: {x.notApplied.join(" · ")}</p>
              </article>
            ))}
            {!sy.sync.some((x) => (state === "TODOS" ? x.state === "LISTO_PARA_BASE" : x.state === state)) ? <EmptyChart label="Sin registros para el filtro." /> : null}
          </div>
        </>
      ) : null}

      {tab === "excepciones" ? (
        <Table
          head={["Capa", "Referencia", "Cliente", "Motivo"]}
          empty="Sin excepciones."
          rows={sy.exceptions.map((e) => (
            <tr key={`${e.layer}-${e.ref}`} className="border-t border-brand-border align-top">
              <td className="py-2 pr-2 font-black text-[10px]">{e.layer}</td><td className="pr-2">{e.ref}</td><td className="pr-2 font-semibold">{e.client}</td><td className="pr-2">{e.reason}</td>
            </tr>
          ))}
        />
      ) : null}

      {sy.decisions.length ? (
        <ul className="mt-4 space-y-1 text-[11px] text-brand-graphite">{sy.decisions.map((d) => <li key={d} className="rounded-xl border border-brand-yellow/40 bg-brand-yellow/10 px-3 py-2">REQUIERE DECISIÓN · {d}</li>)}</ul>
      ) : null}
    </SectionCard>
  );
}

/* ---------------------------------------------------------------- clientes */

function ClientSearch({ model }: { model: OperationalRuntime }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLocaleUpperCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const results = useMemo(() => (query.length < 2 ? [] : model.clientIndex.filter((c) => c.key.includes(query)).slice(0, 30)), [model.clientIndex, query]);
  const salesOnly = useMemo(
    () => (query.length < 2 ? [] : model.sync.sales.filter((x) => !x.identity.baseRow && x.client.toLocaleUpperCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)).slice(0, 10)),
    [model.sync.sales, query],
  );

  return (
    <SectionCard eyebrow="Filtro por cliente" title="Ficha operativa" description={`${formatNumber(model.clientIndex.length)} clientes con actividad desde ${model.scope.start}. Sin teléfono, correo ni credenciales.`}>
      <input
        aria-label="Buscar cliente por nombre"
        autoFocus
        className="w-full rounded-2xl border border-brand-border px-4 py-3 text-sm outline-none focus:border-brand-primary"
        onChange={(e) => setQ(e.target.value)}
        placeholder="Escribe al menos 2 letras del nombre…"
        value={q}
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {results.map((c) => (
          <article key={`${c.key}-${c.name}`} className="rounded-2xl border border-brand-border p-4 text-xs">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-brand-text">{c.name}</h3>
              <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${/vencido/i.test(c.status) ? "bg-brand-red/10 text-status-error" : "bg-brand-green/10 text-status-success"}`}>{c.status}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              <Row k="Próximo pago" v={formatDate(c.nextPayment)} />
              <Row k="Saldo" v={formatMoney(c.balance)} warn={c.balance.USD > 0 || c.balance.COP > 0} />
              <Row k="Último pago" v={formatDate(c.lastPayment)} />
              <Row k="Método" v={c.method || "—"} />
              <Row k="Plan" v={c.plan || "—"} />
              <Row k="Responsable" v={c.advisor || "—"} />
            </dl>
            <p className="mt-2 text-[10px] text-brand-muted">{c.lastPaymentDetail} · {c.balanceRule}</p>
            {c.note ? <p className="mt-2 rounded-xl bg-brand-surface px-3 py-2 text-[11px] text-brand-graphite">{c.note}</p> : null}
            <SyncChain model={model} baseRow={c.baseRow} />
          </article>
        ))}
        {salesOnly.map((x) => (
          <article key={x.id} className="rounded-2xl border border-dashed border-brand-border p-4 text-xs">
            <h3 className="text-sm font-semibold text-brand-text">{x.client} <span className="font-normal text-brand-muted">· venta sin ficha en BASE GENERAL</span></h3>
            <SyncChain model={model} saleId={x.id} />
          </article>
        ))}
      </div>
      {query.length >= 2 && !results.length && !salesOnly.length ? <EmptyChart label="Sin coincidencias en la ventana jun → hoy." /> : null}
    </SectionCard>
  );
}

function SyncChain({ model, baseRow, saleId }: { model: OperationalRuntime; baseRow?: number; saleId?: string }) {
  const sy = model.sync;
  const sale = sy.sales.filter((x) => (saleId ? x.id === saleId : x.identity.baseRow === baseRow)).sort((a, b) => b.month.localeCompare(a.month))[0];
  const saleRef = sale?.confirmationSource.split(" ")[0];
  const fin = sy.financial.filter((x) => (baseRow != null && x.identity.baseRow === baseRow) || (!!saleRef && x.id === saleRef));
  const svc = sy.service.filter((x) => (baseRow != null ? x.identity.baseRow === baseRow : sale && x.usuario === sale.usuario));
  const match = sy.sync.find((x) => (saleId ? x.sale === saleId : x.baseRow === baseRow));
  const step = (label: string, value: ReactNode) => (
    <li className="min-w-0 flex-1 rounded-xl border border-brand-border px-2 py-1.5">
      <span className="block text-[9px] font-black uppercase tracking-[0.1em] text-brand-muted">{label}</span>
      {value}
    </li>
  );
  return (
    <div className="mt-3">
      <ol className="flex flex-col gap-1.5 sm:flex-row" aria-label="Venta → Financiero → Servicio → Base General">
        {step("Venta", sale ? <><StateChip state={sale.gate} /><span className="block text-[10px] text-brand-muted">{sale.sheet} · {sale.concept}</span></> : <span className="text-[10px] text-brand-muted">Sin venta jun→hoy</span>)}
        {step("Financiero", fin.length ? fin.map((f) => <span key={f.id} className="block"><StateChip state={f.state} /><span className="block text-[10px] text-brand-muted">{f.amount} · {formatDate(f.date)}</span></span>) : <span className="text-[10px] text-brand-muted">Sin cobro {sy.month}</span>)}
        {step("Servicio", svc.length ? svc.slice(0, 3).map((x) => <span key={x.id} className="block"><StateChip state={x.state} /><span className="block text-[10px] text-brand-muted">{x.panel} · {x.recharge} · {formatDate(x.date)}</span></span>) : <span className="text-[10px] text-brand-muted">Sin registro CONTROL {sy.month}</span>)}
        {step("Base General", match ? <><StateChip state={match.state} /><span className="block text-[10px] text-brand-muted">{match.action}{match.changes.length ? ` · ${match.changes.length} campo(s)` : ""}</span></> : <span className="text-[10px] text-brand-muted">Sin movimiento a sincronizar</span>)}
      </ol>
      {match?.blockers.length ? <p className="mt-1 text-[10px] text-status-error">Bloqueo: {match.blockers.join(" · ")}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------- cierre mensual (V1) */

const REASON_LABEL: Record<string, string> = {
  POSSIBLE_FREE_MONTH: "Posible mes gratis",
  POSSIBLE_NO_RENEWAL: "Posible no renovación",
  EXPLICIT_EXCEPTION: "Excepción explícita",
};

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function MonthlyCloseView({ monthlyClose: data, closeError, closeMonth }: CloseProps) {
  const nav = (
    <div className="flex gap-2 text-xs">
      {[-1, 0, 1].map((d) => {
        const m = shiftMonth(closeMonth, d);
        return (
          <Link key={d} className={`rounded-full border px-3 py-1.5 font-bold ${d === 0 ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted hover:border-brand-primary"}`} href={`?month=${m}`} prefetch={false}>
            {m}
          </Link>
        );
      })}
    </div>
  );

  if (!data) {
    return (
      <SectionCard eyebrow="Cierre mensual" title={`Pre-cierre ${closeMonth}`} description="BASE GENERAL · F. PRÓXIMO PAGO del mes objetivo." action={nav}>
        <p className="rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error">BLOQUEADO: {closeError ?? "sin datos"}</p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard eyebrow="Cierre mensual · Runtime V1" title={`Pre-cierre ${data.source.targetMonth} · ${data.status}`} description={`Fuente viva ${data.source.workbook} / ${data.source.sheet}: fichas TC=1 con F. PRÓXIMO PAGO en el mes objetivo.`} action={nav}>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Universo" value={formatNumber(data.summary.total)} detail="Fichas con vencimiento en el mes" tone="blue" />
          <MetricCard label="Facturar candidato" value={formatNumber(data.summary.facturarCandidato)} detail="Universo − requiere revisión" tone="green" />
          <MetricCard label="Requiere revisión" value={formatNumber(data.summary.requiereRevision)} detail="Señales en ESTADO/OBSERVACIONES/REFERIDO" tone="yellow" />
          <MetricCard label="Duplicados" value={formatNumber(data.summary.duplicates)} detail="Identidad usuario|cliente|contacto|panel" tone={data.summary.duplicates ? "red" : "cyan"} />
          <MetricCard label="Errores de datos" value={formatNumber(data.summary.dataExceptions)} detail="F. PRÓXIMO PAGO inválida" tone={data.summary.dataExceptions ? "red" : "cyan"} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">Semanas operativas</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {data.summary.weeks.map((v, i) => (
                <div key={i} className="rounded-xl bg-brand-surface p-3 text-center text-xs"><div className="text-brand-muted">S{i + 1}</div><div className="mt-1 text-lg font-semibold tabular-nums">{v}</div></div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-muted">Motivos de revisión</p>
            <dl className="mt-3 space-y-1 text-xs">
              {Object.entries(data.reviewReasons).map(([k, v]) => <Row key={k} k={REASON_LABEL[k] ?? k} v={formatNumber(v)} />)}
            </dl>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-xs md:grid-cols-3">
          <Row k="Fuente estable durante lectura" v={data.source.stableDuringRead ? "SÍ" : "NO"} warn={!data.source.stableDuringRead} />
          <Row k="Generado" v={new Date(data.generatedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })} />
          <Row k="Firma resultado" v={`${data.signatures.result.slice(0, 16)}…`} />
        </dl>
      </SectionCard>
      {data.exceptions.length ? (
        <SectionCard eyebrow="Calidad de datos" title="Requiere corrección en BASE GENERAL" description="Filas con F. PRÓXIMO PAGO no interpretable.">
          <ul className="space-y-1 text-xs">
            {data.exceptions.map((e) => <li key={e.sourceRow}>BASE GENERAL!{e.sourceRow} · {e.type} · valor: <code>{e.rawValue}</code></li>)}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}
