import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { ReconCaseCard, ReconTaskRow } from "@/features/tiviplay-command-center/recon-cards";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { getReconciliation, isApplied, loadDataset, locateRow, readBaseLive } from "@/server/tiviplay-live/conciliacion";
import { PANEL_LABEL, type CaseView } from "@/server/tiviplay-live/conciliacion-model";

export const metadata: Metadata = { title: "TiviPlay · Conciliación de servicio" };
export const dynamic = "force-dynamic";

const KIND: Record<CaseView["kind"], string> = {
  MULTIPANEL: "Servicio en varios paneles",
  EXCEDE: "Panel por encima del crédito registrado",
  IDENTIDAD: "USUARIO compartido por clientes distintos",
  FECHA: "F.VENCIMIENTO BASE sin respaldo",
};
const PAGE = 40;
const blocked = "rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error";
const stat = "rounded-2xl border border-brand-border bg-brand-surface px-4 py-3";

export default async function ConciliacionPage({ searchParams }: { searchParams: Promise<{ q?: string; ver?: string; n?: string }> }) {
  const identity = await requirePage("/operaciones/tiviplay/conciliacion");
  const isAdmin = identity.role === "ADMIN";
  const { q, ver, n } = await searchParams;
  const query = (q ?? "").trim().toUpperCase().slice(0, 40);
  const limit = Math.min(Math.max(Number(n) || PAGE, PAGE), 1000);
  const dataset = loadDataset();
  const [data, live] = await Promise.all([Promise.resolve(getReconciliation(dataset)), readBaseLive()]);
  audit(identity.id, "tiviplay-conciliacion", "read", data ? "SUCCESS" : "UNAVAILABLE");

  const client = (username: string, rows: number[] = []) => { const n = locateRow(live, username, rows[0]); return n ? live?.get(n)?.client || null : null; };
  const syncPending = data?.baseSync.filter((s) => !isApplied(s, live)) ?? [];
  const syncApplied = (data?.baseSync.length ?? 0) - syncPending.length;
  const rowsOf = (username: string) => data?.cases.find((c) => c.username === username)?.baseRows ?? [];
  const match = (u: string) => !query || u.toUpperCase().includes(query);

  const pendingActive = data?.cases.filter((c) => c.status === "PENDIENTE" && c.active && match(c.username)) ?? [];
  const pendingInactive = data?.cases.filter((c) => c.status === "PENDIENTE" && !c.active && match(c.username)) ?? [];
  const decided = data?.cases.filter((c) => c.status !== "PENDIENTE" && match(c.username)) ?? [];
  const openTasks = data?.tasks.filter((t) => t.status !== "EJECUTADO" && match(t.username)) ?? [];
  const doneTasks = data?.tasks.filter((t) => t.status === "EJECUTADO") ?? [];
  const shown = ver === "inactivos" ? pendingInactive : ver === "decididos" ? decided : pendingActive;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones/tiviplay">TiviPlay</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">Conciliación</span>
      </nav>
      <PageHeader
        badge={data ? `Corte ${data.cut}` : "Dataset no disponible"}
        description="Solo excepciones reales. Lo demostrado por los paneles ya se corrigió en BASE GENERAL. Gerencia decide; el Asesor ejecuta; el sistema registra, bloquea y recalcula."
        eyebrow="Operaciones · TiviPlay"
        title="Conciliación de servicio"
      />
      <TiviplayNavigation />

      {!data ? (
        <p className={`mt-6 ${blocked}`}>BLOQUEADO: no se encontró el dataset privado de conciliación (data/private/tiviplay/conciliacion-servicio.json).</p>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Activos</p><p className="text-2xl font-semibold">{data.services.ACTIVO}</p></div>
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Inactivos</p><p className="text-2xl font-semibold">{data.services.INACTIVO}</p></div>
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Excepción</p><p className="text-2xl font-semibold">{data.services.EXCEPCION}</p></div>
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Resueltos por vigencia</p><p className="text-2xl font-semibold">{data.cases.filter((c) => c.decision?.id === 0).length}</p></div>
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Decisiones pendientes</p><p className="text-2xl font-semibold">{data.cases.filter((c) => c.status === "PENDIENTE").length}</p></div>
            <div className={stat}><p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">Tareas Asesor abiertas</p><p className="text-2xl font-semibold">{data.tasks.filter((t) => t.status !== "EJECUTADO").length}</p></div>
          </div>

          <form className="flex flex-wrap items-end gap-2 text-xs" method="get">
            <label className="flex flex-col gap-1">Buscar USERNAME<input className="rounded-lg border px-2 py-1" defaultValue={q ?? ""} maxLength={40} name="q" /></label>
            {ver ? <input name="ver" type="hidden" value={ver} /> : null}
            <button className="rounded-lg border px-3 py-1.5 font-bold" type="submit">Filtrar</button>
          </form>

          {isAdmin ? (
            <SectionCard
              eyebrow="Gerencia"
              title="Decisiones requeridas"
              description="Cada tarjeta muestra solo las alternativas que existen para ese servicio. Al decidir: queda registrada y bloqueada, BASE pasa a la cola de sincronización y cada línea residual genera su tarea LIBERAR."
              action={(
                <div className="flex flex-wrap gap-2 text-xs">
                  {[["", `Activos (${data.cases.filter((c) => c.status === "PENDIENTE" && c.active).length})`], ["inactivos", `Inactivos (${data.cases.filter((c) => c.status === "PENDIENTE" && !c.active).length})`], ["decididos", `Resueltos (${data.cases.filter((c) => c.status !== "PENDIENTE").length})`]].map(([v, label]) => (
                    <Link className={`rounded-full border px-3 py-1.5 font-bold ${(ver ?? "") === v ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted"}`} href={`?${new URLSearchParams({ ...(v ? { ver: v } : {}), ...(q ? { q } : {}) })}`} key={v} prefetch={false}>{label}</Link>
                  ))}
                </div>
              )}
            >
              {shown.length === 0 ? <p className="text-sm text-brand-muted">Sin casos en esta vista.</p> : (
                <>
                  {(Object.keys(KIND) as CaseView["kind"][]).map((kind) => {
                    const list = shown.filter((c) => c.kind === kind).slice(0, limit);
                    if (!list.length) return null;
                    return (
                      <div className="mb-5" key={kind}>
                        <h3 className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-status-warning">{KIND[kind]} · {shown.filter((c) => c.kind === kind).length}</h3>
                        <ul className="space-y-3">{list.map((c) => <ReconCaseCard c={c} client={client(c.username, c.baseRows)} cut={data.cut} key={c.id} />)}</ul>
                      </div>
                    );
                  })}
                  {shown.length > limit ? <Link className="text-xs font-bold underline" href={`?${new URLSearchParams({ ...(ver ? { ver } : {}), ...(q ? { q } : {}), n: String(limit + PAGE) })}`} prefetch={false}>Ver más</Link> : null}
                </>
              )}
            </SectionCard>
          ) : null}

          <SectionCard
            eyebrow="Asesor"
            title="Cola operacional"
            description="Tareas exactas: cliente, USERNAME, panel que se conserva y panel que se libera. EJECUTADO registra responsable y hora, cierra la tarea y deja la línea DISPONIBLE."
          >
            {openTasks.length === 0 ? <p className="text-sm text-brand-muted">Sin tareas abiertas.</p> : (
              <ul className="space-y-3">{openTasks.slice(0, limit).map((t) => <ReconTaskRow client={client(t.username, rowsOf(t.username))} key={t.id} t={t} />)}</ul>
            )}
            <p className="mt-3 text-xs text-brand-muted">{openTasks.length} abiertas · {doneTasks.length} ejecutadas.</p>
          </SectionCard>

          <SectionCard eyebrow="Panel" title="Líneas DISPONIBLES" description="Líneas residuales liberadas por el Asesor tras una decisión.">
            {data.available.length === 0 ? <p className="text-sm text-brand-muted">Aún no hay líneas liberadas.</p> : (
              <ul className="space-y-1 text-xs">{data.available.map((a) => <li key={`${a.line.panel}-${a.line.lineId}`}>{PANEL_LABEL[a.line.panel]} · línea ID {a.line.lineId} · ex {a.username} · liberada por {a.by} el {new Date(a.at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</li>)}</ul>
            )}
          </SectionCard>

          {isAdmin ? (
            <SectionCard eyebrow="Back Office · sistema" title="Cola de sincronización BASE GENERAL" description="Cambios exigidos por decisiones ya registradas. La intranet lee Sheets en solo lectura: estos cambios se escriben y validan por relectura en la fuente (exportación en /api/admin/tiviplay/conciliacion/base-sync).">
              {!live ? <p className={blocked}>No fue posible releer BASE GENERAL: la cola no puede validarse.</p> : null}
              {syncPending.length === 0 ? <p className="text-sm text-brand-muted">Sin cambios pendientes{syncApplied ? ` · ${syncApplied} aplicados y validados por relectura` : ""}.</p> : (
                <>
                  <ul className="space-y-1 text-xs">{syncPending.map((s) => <li key={`${s.caseId}-${s.field}-${s.row}`}>Fila {locateRow(live, s.username, s.row) ?? `${s.row} (verificar)`} · {s.username} · {s.field}: {s.from || "(vacío)"} → <strong>{s.to}</strong></li>)}</ul>
                  <p className="mt-2 text-xs text-brand-muted">{syncPending.length} pendientes · {syncApplied} aplicados y validados por relectura.</p>
                </>
              )}
            </SectionCard>
          ) : null}
        </div>
      )}
    </div>
  );
}
