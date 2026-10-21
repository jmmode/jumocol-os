import type { Metadata } from "next";
import Link from "next/link";

import { weekBucket } from "@motor/tiviplay-monthly-close-v1/core";

import { PageHeader } from "@/components/ui/page-header";
import { TiviplayNavigation } from "@/features/tiviplay-command-center/tiviplay-navigation";
import { SectionCard } from "@/features/tiviplay-payments/dashboard-charts";
import { requirePage } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { CONFIRMADO_JM_BLOCKED, type HoyException, type TiviplayHoy } from "@/server/tiviplay-live/hoy-projection";
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

  const [result] = await Promise.allSettled([getTiviplayHoyLive(targetMonth)]);
  const data: TiviplayHoy | null = result.status === "fulfilled" ? result.value : null;
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
          description="Se mostraría solo si la salida actual del motor permitiera identificar estos casos."
        >
          <p className={blocked}>
            {CONFIRMADO_JM_BLOCKED.state} — {CONFIRMADO_JM_BLOCKED.reason}. El motor lee solo BASE GENERAL y no devuelve la columna CONFIRMACION de ZELLE, PAYPAL ni TRANSF.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
