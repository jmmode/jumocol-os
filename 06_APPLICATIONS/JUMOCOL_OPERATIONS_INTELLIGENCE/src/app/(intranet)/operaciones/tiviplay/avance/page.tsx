import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { readCobros, readPanelCut, workbookUrl, type SourceInfo } from "@/server/tiviplay-live/avance";
import { dateDifferences, isBackOffice, reviewCases, summarize, type CreditState } from "@/server/tiviplay-live/avance-model";
import { getPendingConfirmadoJm, type PendingSource } from "@/server/tiviplay-live/confirmado-jm";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";

export const metadata: Metadata = { title: "TiviPlay · Avance del mes" };
export const dynamic = "force-dynamic";

/**
 * Resultado del corte congelado tal como quedó documentado (no se recalcula aquí: el motor no se ejecuta desde esta vista).
 * Fuente: checkpoint de recepción TIVIPLAY §18–19 (02/11/2026).
 */
const FROZEN_CUTS: Record<string, { date: string; fichas: number; signature: string; ref: string }> = {
  "2026-11": { date: "2026-11-01", fichas: 98, signature: "f6e16fceb84b", ref: "Checkpoint de recepción §18–19 (02/11/2026)" },
};

const MONTH_NAME = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const STATE_LABEL: Record<CreditState, string> = { VIGENTE: "Vigente en panel", VENCIDA: "Vencida en panel", DIFERENCIA: "Diferencia · revisar" };
const STATE_TONE: Record<CreditState, string> = { VIGENTE: "text-status-success", VENCIDA: "text-status-error", DIFERENCIA: "text-status-warning" };

const th = "px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted";
const td = "px-3 py-2 align-top text-xs text-brand-text";
const notice = "rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-xs text-brand-muted";
const blocked = "rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error";

function SourceLine({ source }: { source: SourceInfo }) {
  return (
    <p className={notice}>
      <strong className="text-brand-text">Fuente:</strong> {source.label}{source.sheet ? ` · ${source.sheet}` : ""} ·{" "}
      <strong className="text-brand-text">Fecha:</strong> {source.cut ?? "sin fecha declarada"} ·{" "}
      <strong className="text-brand-text">Validación:</strong>{" "}
      <span className={source.status === "LEIDA" && !/PROVISIONAL/.test(source.validation) ? "font-bold text-status-success" : "font-bold text-status-warning"}>{source.validation}</span>
      {source.url ? (
        <>
          {" "}·{" "}
          <a className="font-semibold text-brand-primary-dark underline" href={source.url} rel="noreferrer" target={source.url.startsWith("http") ? "_blank" : undefined}>
            Abrir fuente
          </a>
        </>
      ) : null}
    </p>
  );
}

function Unavailable({ source, what }: { source: SourceInfo; what: string }) {
  return (
    <div className="space-y-2">
      <p className={blocked}>
        {source.status === "NO_INTEGRADA" ? "FUENTE NO INTEGRADA" : "FUENTE NO DISPONIBLE"}: {source.detail ?? "sin lectura."} No se muestran {what} sin fuente verificada.
      </p>
      {source.url ? (
        <p className="text-sm">
          Consulta en solo lectura:{" "}
          <a className="font-semibold text-brand-primary-dark underline" href={source.url} rel="noreferrer" target={source.url.startsWith("http") ? "_blank" : undefined}>abrir la fuente verificada</a>.
        </p>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, tone = "" }: { label: string; value: number | string | null; tone?: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-background px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>{value ?? "—"}</p>
    </div>
  );
}

export default async function TiviplayAvancePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const identity = await requirePage("/operaciones/tiviplay/avance");
  const isAdmin = identity.role === "ADMIN";
  const { month } = await searchParams;
  const today = bogotaToday();
  const targetMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : process.env.TIVIPLAY_TARGET_MONTH ?? today.slice(0, 7);
  const monthName = `${MONTH_NAME[Number(targetMonth.slice(5)) - 1] ?? targetMonth} ${targetMonth.slice(0, 4)}`;

  const [cobros, pendingResult] = await Promise.all([
    readCobros(targetMonth, today),
    getPendingConfirmadoJm(targetMonth, today).catch(() => null as PendingSource[] | null),
  ]);
  const panelCut = readPanelCut(cobros, today);
  const cross = panelCut.cross;
  const summary = summarize(cobros.rows, cross, targetMonth);
  const frozen = FROZEN_CUTS[targetMonth];
  const pending = pendingResult ?? [];
  const pendingItems = pending.flatMap((s) => s.items);
  const pendingProblems = pendingResult ? pending.filter((s) => s.status !== "OK") : null;
  const diffs = cross ? dateDifferences(cross) : [];
  const cases = reviewCases(cobros.rows);
  const boCases = cases.filter((c) => isBackOffice(c.owner));
  const otherCases = cases.filter((c) => !isBackOffice(c.owner));
  audit(identity.id, "tiviplay-avance", "read", cobros.source.status === "LEIDA" ? "SUCCESS" : "UNAVAILABLE");

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones/tiviplay">TiviPlay</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">Avance del mes</span>
      </nav>

      <PageHeader
        badge={cobros.source.status === "LEIDA" ? `Solo lectura · ${cobros.source.validation}` : "Fuente no disponible"}
        description="Cobros, créditos técnicos y pendientes del mes en una sola vista de consulta. Todo se lee de las fuentes del equipo: aquí no se escribe ni se confirma nada."
        eyebrow="Operaciones · TiviPlay"
        title={`Avance de ${monthName}`}
      />
      <TiviplayNavigation />

      <div className="mt-6 space-y-5">
        <section aria-label="Fuentes y validación" className="rounded-3xl border border-status-warning/40 bg-status-warning/5 p-5 text-sm text-brand-text">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-status-warning">Fuentes y estado de validación</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5">
            <li>
              <strong>Planilla viva</strong> ({cobros.source.sheet ?? "sin lectura"}): {cobros.source.status === "LEIDA" ? `${summary.fichas} fichas leídas` : "no leída"}
              {cobros.source.cut ? ` · corte ${cobros.source.cut}` : ""} · <strong>{cobros.source.validation}</strong>. Las fichas son provisionales hasta revalidar la firma.
            </li>
            {frozen ? (
              <li>
                <strong>Corte congelado del motor</strong> ({frozen.date}): {frozen.fichas} fichas · documentado en {frozen.ref}
                {isAdmin ? <> · firma <code>{frozen.signature}…</code></> : null}. Si difiere de la planilla viva, prevalece la revalidación pendiente; esta vista no recalcula el motor.
              </li>
            ) : null}
            <li><strong>Corte de paneles</strong>: {panelCut.source.status === "LEIDA" ? `corte ${panelCut.source.cut} · ${panelCut.source.validation}` : panelCut.source.validation}.</li>
            <li>Los pagos confirmados de meses anteriores que trae la planilla <strong>no</strong> se cuentan como cobros ni confirmaciones de {monthName}.</li>
          </ul>
        </section>

        {/* ÁREA 1 */}
        <SectionCard eyebrow="Área 1" title={`Cobros ${monthName}`} description="Clientes de la planilla actual con su próximo vencimiento comercial, contacto, plan, valor y estado de gestión registrado por el equipo.">
          <div className="space-y-4">
            <SourceLine source={cobros.source} />
            {cobros.source.status !== "LEIDA" ? (
              <Unavailable source={cobros.source} what="clientes" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <Kpi label="Fichas" value={summary.fichas} />
                  <Kpi label="Facturables" value={summary.facturables} tone="text-status-success" />
                  <Kpi label="En revisión" value={summary.enRevision} tone="text-status-warning" />
                  <Kpi label="Bloqueadas" value={summary.bloqueadas} tone="text-status-error" />
                  <Kpi label="Con gestión registrada" value={summary.gestionadas} />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border">
                    <thead><tr>
                      <th className={th}>Sem.</th><th className={th}>Próx. vencimiento</th><th className={th}>Cliente</th><th className={th}>Contacto</th>
                      <th className={th}>Plan</th><th className={th}>Valor</th><th className={th}>Método</th><th className={th}>Validación</th><th className={th}>Estado de gestión</th>
                      {isAdmin ? <th className={th}>Ref.</th> : null}
                    </tr></thead>
                    <tbody className="divide-y divide-brand-border">
                      {cobros.rows.map((r) => (
                        <tr key={r.row}>
                          <td className={td}>{r.week || "—"}</td>
                          <td className={`${td} tabular-nums`}>{r.nextDue}</td>
                          <td className={`${td} font-semibold`}>{r.client}</td>
                          <td className={`${td} tabular-nums`}>{r.phone || "—"}</td>
                          <td className={td}>{r.plan || "—"}{r.screens ? ` · ${r.screens} pant.` : ""}</td>
                          <td className={`${td} tabular-nums`}>{r.value || "—"}</td>
                          <td className={td}>{r.method || "—"}</td>
                          <td className={`${td} font-semibold ${/^FACTURABLE$/i.test(r.classification) ? "text-status-success" : "text-status-warning"}`}>{r.classification || "—"}</td>
                          <td className={td}>
                            <span className="font-semibold">{r.status || "Sin gestión"}</span>
                            {r.managedAt || r.managedBy ? <span className="block text-[11px] text-brand-muted">{[r.managedAt, r.managedBy].filter(Boolean).join(" · ")}</span> : null}
                            {r.note ? <span className="block text-[11px] text-brand-muted">{r.note}</span> : null}
                          </td>
                          {isAdmin ? <td className={`${td} font-mono text-[11px] text-brand-muted`}>{r.draftId || r.baseRef || `fila ${r.row}`}</td> : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* ÁREA 2 */}
        <SectionCard eyebrow="Área 2" title="Créditos técnicos" description="Cruce por USUARIO entre la planilla y el último corte disponible de paneles. Vigente o vencida se decide solo con el vencimiento del panel; una cuenta vencida no significa que esté liberada. Lo que no cuadra queda como diferencia pendiente de revisión.">
          <div className="space-y-4">
            <SourceLine source={panelCut.source} />
            {!cross ? (
              <Unavailable source={{ ...panelCut.source, url: "/operaciones/tiviplay/conciliacion" }} what="estados de créditos" />
            ) : cobros.source.status !== "LEIDA" ? (
              <p className={blocked}>Sin planilla del mes no hay universo que cruzar.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Kpi label="Vigentes" value={summary.vigentes} tone="text-status-success" />
                  <Kpi label="Vencidas" value={summary.vencidas} tone="text-status-error" />
                  <Kpi label="Diferencias por revisar" value={summary.diferencias} tone="text-status-warning" />
                </div>
                {(["DIFERENCIA", "VENCIDA", "VIGENTE"] as const).map((state) => {
                  const list = cross.filter((c) => c.state === state);
                  if (!list.length) return null;
                  return (
                    <details className="rounded-2xl border border-brand-border" key={state} open={state === "DIFERENCIA"}>
                      <summary className={`cursor-pointer px-4 py-3 text-sm font-bold ${STATE_TONE[state]}`}>{STATE_LABEL[state]} · {list.length}</summary>
                      <div className="overflow-x-auto px-2 pb-3">
                        <table className="min-w-full divide-y divide-brand-border">
                          <thead><tr><th className={th}>Cliente</th><th className={th}>Usuario</th><th className={th}>Panel (corte)</th><th className={th}>Vence en panel</th><th className={th}>Vence en planilla</th><th className={th}>Motivo</th></tr></thead>
                          <tbody className="divide-y divide-brand-border">
                            {list.map((c) => (
                              <tr key={c.row}>
                                <td className={`${td} font-semibold`}>{c.client}</td>
                                <td className={`${td} font-mono text-[11px]`}>{c.user || "—"}</td>
                                <td className={td}>{c.panel ?? "—"}</td>
                                <td className={`${td} tabular-nums`}>{c.expiration ?? "—"}</td>
                                <td className={`${td} tabular-nums`}>{c.sheetDue ?? "—"}</td>
                                <td className={td}>{c.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  );
                })}
              </>
            )}
          </div>
        </SectionCard>

        {/* ÁREA 3 */}
        <SectionCard eyebrow="Área 3" title="Confirmaciones y excepciones" description={`Pagos de ${monthName} pendientes de confirmación, diferencias de fechas y casos que esperan a Back Office. La confirmación se hace en la hoja de origen.`}>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-text">Pagos por confirmar ({monthName})</h3>
              <p className={notice}>
                <strong className="text-brand-text">Fuente:</strong> hojas ZELLE, PAYPAL y TRANSF de {monthName} · <strong className="text-brand-text">Validación:</strong> CONFIRMACION = PENDIENTE CONFIRMACION ·{" "}
                {workbookUrl() ? <a className="font-semibold text-brand-primary-dark underline" href={workbookUrl() ?? undefined} rel="noreferrer" target="_blank">Abrir libro</a> : "libro no configurado"}
              </p>
              {pendingProblems === null ? (
                <p className={blocked}>FUENTE NO DISPONIBLE: no fue posible leer las hojas de pagos del mes. No se muestran pagos sin fuente verificada.</p>
              ) : (
                <>
                  {pendingProblems.map((s) => <p className={blocked} key={s.source}>{s.source}: sin verificar ({s.reason ?? "lectura fallida"}).</p>)}
                  {pendingItems.length === 0 ? (
                    pendingProblems.length === 0 ? <p className="text-sm text-brand-muted">Sin pagos pendientes de confirmación en {monthName}.</p> : null
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-brand-border">
                        <thead><tr><th className={th}>Medio</th><th className={th}>Cliente</th><th className={th}>Fecha</th><th className={th}>Valor</th><th className={th}>Plan</th><th className={th}>Estado</th>{isAdmin ? <th className={th}>Ref.</th> : null}</tr></thead>
                        <tbody className="divide-y divide-brand-border">
                          {pendingItems.map((p) => (
                            <tr key={`${p.source}-${p.row}`}>
                              <td className={`${td} font-semibold`}>{p.source}</td>
                              <td className={td}>{p.client || "—"}</td>
                              <td className={`${td} tabular-nums`}>{p.date || "—"}</td>
                              <td className={`${td} tabular-nums`}>{p.amount || "—"}</td>
                              <td className={td}>{p.plan || "—"}</td>
                              <td className={`${td} font-bold text-status-warning`}>Por confirmar</td>
                              {isAdmin ? <td className={`${td} font-mono text-[11px] text-brand-muted`}>{p.reference}</td> : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              {summary.pagoMesAnterior ? (
                <p className="text-xs text-brand-muted">{summary.pagoMesAnterior} fichas de la planilla traen un pago confirmado de un mes anterior: es el ciclo pasado, no un cobro de {monthName}.</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-text">Diferencias de fechas (panel al corte ≠ planilla)</h3>
              {!cross || cobros.source.status !== "LEIDA" ? (
                <p className="text-sm text-brand-muted">{!cross ? "Sin corte de paneles en este servidor" : "Sin planilla del mes"}: no se pueden comparar fechas.</p>
              ) : diffs.length === 0 ? (
                <p className="text-sm text-brand-muted">Sin diferencias de fecha entre el corte de paneles y la planilla.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border">
                    <thead><tr><th className={th}>Cliente</th><th className={th}>Usuario</th><th className={th}>Vence en panel</th><th className={th}>Vence en planilla</th></tr></thead>
                    <tbody className="divide-y divide-brand-border">
                      {diffs.map((d) => (
                        <tr key={d.row}>
                          <td className={`${td} font-semibold`}>{d.client}</td>
                          <td className={`${td} font-mono text-[11px]`}>{d.user}</td>
                          <td className={`${td} tabular-nums`}>{d.expiration}</td>
                          <td className={`${td} tabular-nums`}>{d.sheetDue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-brand-muted">Una diferencia puede deberse a un crédito aplicado después del corte. Se revisa; no se corrige desde aquí.</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-text">Casos pendientes (Back Office primero)</h3>
              {cobros.source.status !== "LEIDA" ? (
                <p className="text-sm text-brand-muted">Sin planilla del mes no se listan casos.</p>
              ) : cases.length === 0 ? (
                <p className="text-sm text-brand-muted">La planilla no tiene casos en revisión ni bloqueados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border">
                    <thead><tr><th className={th}>Cliente</th><th className={th}>Próx. vencimiento</th><th className={th}>Validación</th><th className={th}>Motivo</th><th className={th}>Causa / acción</th><th className={th}>Responsable</th><th className={th}>Estado de gestión</th></tr></thead>
                    <tbody className="divide-y divide-brand-border">
                      {[...boCases, ...otherCases].map((c) => (
                        <tr key={c.row}>
                          <td className={`${td} font-semibold`}>{c.client}</td>
                          <td className={`${td} tabular-nums`}>{c.nextDue}</td>
                          <td className={`${td} font-semibold text-status-warning`}>{c.classification}</td>
                          <td className={td}>{c.category || "—"}</td>
                          <td className={td}>{c.cause || "—"}</td>
                          <td className={`${td} ${isBackOffice(c.owner) ? "font-bold" : ""}`}>{c.owner || "Sin responsable"}</td>
                          <td className={td}>{c.status || "Sin gestión"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-brand-muted">{boCases.length} con Back Office como responsable · {otherCases.length} con otro responsable.</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
