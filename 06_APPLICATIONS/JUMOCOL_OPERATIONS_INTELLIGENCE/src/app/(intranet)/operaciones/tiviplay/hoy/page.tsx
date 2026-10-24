import type { Metadata } from "next";
import Link from "next/link";

import { weekBucket } from "@motor/tiviplay-monthly-close-v1/core";

import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { getPendingConfirmadoJm, type PendingSource } from "@/server/tiviplay-live/confirmado-jm";
import { getCreditosHoy, type CreditosHoy } from "@/server/tiviplay-live/creditos-hoy";
import { CreditosHoyBlock } from "@/features/tiviplay-command-center/creditos-hoy-block";
import { type HoyException, type TiviplayHoy } from "@/server/tiviplay-live/hoy-projection";
import { getTiviplayHoyLive } from "@/server/tiviplay-live/monthly-close";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";

export const metadata: Metadata = { title: "TiviPlay · HOY" };
export const dynamic = "force-dynamic";

const KIND_LABEL: Record<HoyException["kind"], string> = {
  INVALID_NEXT_PAYMENT_DATE: "Dato inválido",
  DUPLICADO: "Duplicado",
  REQUIERE_REVISION: "Requiere revisión",
};

const th = "px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] text-brand-muted";
const td = "px-3 py-2 align-top text-xs text-brand-text";
const blocked = "rounded-2xl border border-brand-red/30 bg-brand-red/5 px-4 py-3 text-sm text-status-error";

export default async function TiviplayHoyPage({ searchParams }: { searchParams: Promise<{ month?: string; semana?: string }> }) {
  const identity = await requirePage("/operaciones/tiviplay/hoy");
  const { month, semana } = await searchParams;
  const today = bogotaToday();
  const targetMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : process.env.TIVIPLAY_TARGET_MONTH ?? today.slice(0, 7);
  // Semana operativa actual según el propio motor; solo aplica si hoy cae en el mes objetivo.
  const currentWeek = today.startsWith(targetMonth) ? weekBucket(today) : null;
  const showAll = semana === "todas" || currentWeek == null;

  // Bloque 3 es de Dirección: la lectura financiera solo se ejecuta para ADMIN.
  const isAdmin = identity.role === "ADMIN";
  const [result, pendingResult, creditsResult] = await Promise.allSettled([
    getTiviplayHoyLive(targetMonth),
    isAdmin ? getPendingConfirmadoJm(targetMonth, today) : Promise.resolve(null),
    getCreditosHoy(targetMonth, today),
  ]);
  const credits: CreditosHoy | null = creditsResult.status === "fulfilled" ? creditsResult.value : null;
  const data: TiviplayHoy | null = result.status === "fulfilled" ? result.value : null;
  const pending: PendingSource[] | null = pendingResult.status === "fulfilled" ? pendingResult.value : null;
  const pendingItems = pending?.flatMap((s) => s.items) ?? [];
  const pendingProblems = isAdmin ? (pending ?? (["ZELLE", "PAYPAL", "TRANSF"] as const).map((source) => ({ source, status: "REQUIERE_REVISION" as const, reason: "lectura fallida" }))).filter((s) => s.status !== "OK") : [];
  audit(identity.id, "tiviplay-hoy", "read", data ? "SUCCESS" : "UNAVAILABLE");

  const contacts = data ? data.contacts.filter((c) => showAll || c.week === currentWeek) : [];

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-muted">
        <Link className="hover:text-brand-primary" href="/">JUMOCOL OS</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones">Operaciones</Link><span aria-hidden="true">→</span>
        <Link className="hover:text-brand-primary" href="/operaciones/tiviplay">TiviPlay</Link><span aria-hidden="true">→</span>
        <span aria-current="page" className="text-brand-primary-dark">HOY</span>
      </nav>

      <PageHeader
        badge={data ? `${data.status} · ${data.targetMonth}` : "Fuente no disponible"}
        description="Qué hacer hoy, tomado de la salida del motor monthly-close-v1 sobre BASE GENERAL (solo lectura). Si el cliente está aquí, no hace falta abrir el Sheet para saber a quién contactar."
        eyebrow="Operaciones · TiviPlay"
        title="HOY"
      />
      <TiviplayNavigation />

      <div className="mt-6 space-y-5">
        <CreditosHoyBlock data={credits} isAdmin={isAdmin} />

        {data ? (
          <p className="rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-xs text-brand-muted">
            Motor <code>05_AUTOMATION/tiviplay-monthly-close-v1</code> · universo del mes {data.motorTotal} · fuente estable durante lectura:{" "}
            <strong className={data.stableDuringRead ? "" : "text-status-error"}>{data.stableDuringRead ? "SÍ" : "NO"}</strong> · generado{" "}
            {new Date(data.generatedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })} · firma <code>{data.signature.slice(0, 12)}…</code>
            {data.status === "PARCIAL" ? <strong className="ml-1 text-status-error">· PARCIAL: revise duplicados o cambios de la fuente antes de actuar.</strong> : null}
          </p>
        ) : null}

        <SectionCard
          eyebrow="Bloque 1"
          title="Clientes por contactar"
          description="Solo casos que el motor clasificó como FACTURAR_CANDIDATO (F. PRÓXIMO PAGO en el mes, TC=1, sin señales de revisión). La última gestión no la expone el motor: no se muestra."
          action={currentWeek != null ? (
            <div className="flex gap-2 text-xs">
              <Link className={`rounded-full border px-3 py-1.5 font-bold ${!showAll ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted"}`} href={`?month=${targetMonth}`} prefetch={false}>Semana actual · S{currentWeek}</Link>
              <Link className={`rounded-full border px-3 py-1.5 font-bold ${showAll ? "border-brand-primary-dark bg-brand-primary-dark text-white" : "border-brand-border text-brand-muted"}`} href={`?month=${targetMonth}&semana=todas`} prefetch={false}>Todo el mes</Link>
            </div>
          ) : undefined}
        >
          {!data ? (
            <p className={blocked}>BLOQUEADO: no fue posible leer BASE GENERAL. No se muestran clientes sin fuente viva.</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-brand-muted">El motor no produjo candidatos para {showAll ? `el mes ${targetMonth}` : `la semana S${currentWeek}`}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border">
                <thead><tr><th className={th}>Sem.</th><th className={th}>F. próximo pago</th><th className={th}>Cliente</th><th className={th}>Teléfono</th><th className={th}>Plan</th><th className={th}>Método de pago</th><th className={th}>Origen</th></tr></thead>
                <tbody className="divide-y divide-brand-border">
                  {contacts.map((c) => (
                    <tr key={c.sourceRow}>
                      <td className={td}>S{c.week}</td>
                      <td className={`${td} tabular-nums`}>{c.nextPaymentDate}</td>
                      <td className={`${td} font-semibold`}>{c.client || "—"}</td>
                      <td className={`${td} tabular-nums`}>{c.phone || "—"}</td>
                      <td className={td}>{c.plan || "—"}</td>
                      <td className={td}>{c.paymentMethod || "—"}</td>
                      <td className={`${td} font-mono text-[11px] text-brand-muted`}>{c.origin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-brand-muted">{contacts.length} de {data.contacts.length} candidatos del mes.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Bloque 2"
          title="Excepciones que bloquean"
          description="Excepciones y revisiones producidas por el motor: fechas no interpretables, duplicados de identidad y casos REQUIERE_REVISION. No hay responsable gobernado: cada caso queda en REQUIERE DECISIÓN."
        >
          {!data ? (
            <p className={blocked}>BLOQUEADO: sin fuente viva no se listan excepciones.</p>
          ) : data.exceptions.length === 0 ? (
            <p className="text-sm text-brand-muted">El motor no reportó excepciones para {data.targetMonth}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border">
                <thead><tr><th className={th}>Tipo</th><th className={th}>Fila(s) BASE GENERAL</th><th className={th}>Cliente</th><th className={th}>Detalle</th><th className={th}>Salida del motor</th><th className={th}>Responsable</th></tr></thead>
                <tbody className="divide-y divide-brand-border">
                  {data.exceptions.map((e) => (
                    <tr key={`${e.kind}-${e.rows.join("-")}`}>
                      <td className={`${td} font-semibold`}>{KIND_LABEL[e.kind]}</td>
                      <td className={`${td} font-mono text-[11px]`}>{e.rows.join(", ")}</td>
                      <td className={td}>{e.client ?? "—"}</td>
                      <td className={td}>{e.detail}</td>
                      <td className={`${td} font-mono text-[11px] text-brand-muted`}>{e.motorOutput}</td>
                      <td className={`${td} font-bold text-status-warning`}>{e.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Bloque 3 · Dirección"
          title="Pendientes de Confirmado JM"
          description="Pagos registrados con CONFIRMACION = PENDIENTE CONFIRMACION en ZELLE, PAYPAL y TRANSF del mes. Solo lectura: la confirmación se hace en la hoja de origen."
        >
          {!isAdmin ? (
            <p className="text-sm text-brand-muted">Bloque reservado a Dirección.</p>
          ) : (
            <div className="space-y-4">
              {pendingProblems.map((s) => (
                <p className={blocked} key={s.source}>
                  {s.status === "REQUIERE_DECISION" ? "REQUIERE DECISIÓN" : "REQUIERE_REVISION"} — no fue posible verificar {s.source}
                  {s.reason ? ` (${s.reason})` : ""}
                </p>
              ))}
              {pending ? (
                <p className="text-xs text-brand-muted">
                  {pending.map((s) => `${s.source}: ${s.status === "OK" ? s.items.length : "sin verificar"}`).join(" · ")}
                </p>
              ) : null}
              {pendingItems.length === 0 ? (
                pendingProblems.length === 0 ? <p className="text-sm text-brand-muted">Sin pagos pendientes de Confirmado JM.</p> : null
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border">
                    <thead><tr><th className={th}>Fuente</th><th className={th}>Fila</th><th className={th}>Cliente</th><th className={th}>Fecha</th><th className={th}>Valor</th><th className={th}>Plan</th><th className={th}>Enlace</th><th className={th}>Estado</th><th className={th}>Referencia</th></tr></thead>
                    <tbody className="divide-y divide-brand-border">
                      {pendingItems.map((p) => (
                        <tr key={p.reference}>
                          <td className={`${td} font-semibold`}>{p.source}</td>
                          <td className={`${td} font-mono text-[11px]`}>{p.row}</td>
                          <td className={td}>{p.client || "—"}</td>
                          <td className={`${td} tabular-nums`}>{p.date || "—"}</td>
                          <td className={`${td} tabular-nums`}>{p.amount || "—"}</td>
                          <td className={td}>{p.plan || "—"}</td>
                          <td className={td}>{p.link || "—"}</td>
                          <td className={`${td} font-bold text-status-warning`}>{p.confirmation}</td>
                          <td className={`${td} font-mono text-[11px] text-brand-muted`}>{p.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-brand-muted">{pendingItems.length} pagos pendientes de Confirmado JM.</p>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
