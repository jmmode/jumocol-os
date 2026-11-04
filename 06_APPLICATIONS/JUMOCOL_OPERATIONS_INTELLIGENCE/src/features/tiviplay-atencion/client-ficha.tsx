import { CopyableMessage } from "@/components/documents/copyable-message";
import { cobranzaStage } from "@/features/tiviplay-atencion/cobranza";
import { GestionRegistro } from "@/features/tiviplay-atencion/gestion-registro";
import { ServiceCredentials } from "@/features/tiviplay-atencion/service-credentials";
import { technicalDue, type ClientHistory } from "@/server/tiviplay-live/client-history-model";
import { getClientHistory } from "@/server/tiviplay-live/client-history";
import { observationsHash } from "@/server/tiviplay-live/gestion-core";
import { GESTION_ETIQUETAS, parseGestiones } from "@/server/tiviplay-live/gestion-model";
import { gestionWriteEnabled } from "@/server/tiviplay-live/gestion-write";
import { getRuntimeValuesCached } from "@/server/tiviplay-live/runtime-source";
import { headerKey } from "@/server/tiviplay-live/sheet-columns";
import { displayDate, greetingName, personalizeScript, type DirectoryEntry, type QueueItem } from "@/server/tiviplay-live/workday-model";
import { readPaymentReferences } from "@/server/tiviplay-live/payment-references";

const card = "rounded-2xl border border-brand-border bg-brand-background p-4";
const label = "text-[10px] font-bold uppercase tracking-[0.08em] text-brand-muted";
const th = "px-2 py-1 text-left text-[10px] font-bold uppercase text-brand-muted";
const td = "px-2 py-1 align-top text-xs";

function Item({ name, value, wide }: { name: string; value: React.ReactNode; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : undefined}><dt className={label}>{name}</dt><dd className="text-sm font-semibold">{value || "—"}</dd></div>;
}

const money = (t: DirectoryEntry["tariff"]) => (["USD", "COP", "CAD"] as const).filter((c) => t[c]).map((c) => `${c} ${t[c].toLocaleString("es-CO")}`);

/** Resuelve siempre por encabezado, incluso cuando la ficha no aparece en la cola inmediata. */
function carteraField(client: DirectoryEntry, wanted: string) {
  const [sheet, row] = client.source.split("!");
  const values = getRuntimeValuesCached()?.[sheet];
  if (!/^PAGOS /.test(sheet) || !values) return null;
  const key = headerKey(wanted);
  const header = values.slice(0, 8).find((cells) => (cells ?? []).some((cell) => headerKey(cell) === "OBSERVACIONES GESTION"));
  const col = header?.findIndex((cell) => headerKey(cell) === key) ?? -1;
  if (col < 0) return null;
  return String(values[Number(row) - 1]?.[col] ?? "");
}

/** Solo F alimenta el historial estructurado de gestiones y su huella. */
const observations = (client: DirectoryEntry) => carteraField(client, "OBSERVACIONES GESTION");

function History({ history }: { history: ClientHistory }) {
  const pending = history.payments.filter((p) => p.pending);
  const confirmed = history.payments.filter((p) => !p.pending);
  const payments = (title: string, rows: ClientHistory["payments"]) => rows.length ? <div className="mt-3">
    <h4 className="text-xs font-bold">{title}</h4>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Fecha</th><th className={th}>Método</th><th className={th}>Valor</th><th className={th}>Plan</th><th className={th}>Confirmación</th></tr></thead>
      <tbody>{rows.map((p) => <tr key={p.source}><td className={td}>{displayDate(p.date) ?? "—"}</td><td className={td}>{p.method}</td><td className={td}>{p.currency} {p.amount}</td><td className={td}>{p.plan || "—"}</td><td className={td}>{p.confirmation || "SIN CONFIRMAR"}</td></tr>)}</tbody></table></div>
  </div> : null;
  return <>
    {payments("Pagos pendientes de confirmación", pending)}
    {payments("Pagos confirmados", confirmed)}
    {!history.payments.length ? <p className="mt-2 text-xs text-brand-muted">Sin pagos con enlace verificable a esta ficha.</p> : null}
    {history.renewals.length ? <div className="mt-3"><h4 className="text-xs font-bold">Renovaciones en CONTROL P1/P2</h4>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Fecha</th><th className={th}>Crédito</th><th className={th}>Nuevo vencimiento</th></tr></thead>
        <tbody>{history.renewals.map((r) => <tr key={r.source}><td className={td}>{displayDate(r.date) ?? "—"}</td><td className={td}>{r.credit}</td><td className={td}>{displayDate(r.due) ?? "—"}</td></tr>)}</tbody></table></div></div> : null}
    {history.plans.length ? <div className="mt-3"><h4 className="text-xs font-bold">Plan por mes</h4>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Hoja</th><th className={th}>Plan</th><th className={th}>Pantallas</th><th className={th}>Tarifa</th><th className={th}>Último pago</th></tr></thead>
        <tbody>{history.plans.map((p) => <tr key={p.source}><td className={td}>{p.month}</td><td className={td}>{p.plan || "—"}</td><td className={td}>{p.screens || "—"}</td><td className={td}>{p.tariff || "—"}</td><td className={td}>{displayDate(p.lastPayment) ?? "—"}</td></tr>)}</tbody></table></div></div> : null}
    <p className="mt-3 text-[11px] text-brand-muted">Cobertura: {history.monthsRead.length} hoja(s) PAGOS leídas; no representa la antigüedad del cliente. {history.ambiguousMonths.length ? `USUARIO repetido en ${history.ambiguousMonths.join(", ")}: REQUIERE VALIDACIÓN.` : ""}</p>
  </>;
}

type Fallback = { title: string; text: string; pending: number; validation: string };

export async function ClientFicha({ client, queue, actor, admin, cobranza, today, userRepeated, fallback }: { client: DirectoryEntry; queue: QueueItem | null; actor: string; admin: boolean; cobranza: Record<string, string> | null; today: string; userRepeated: boolean; fallback: Fallback | null }) {
  const result = await getClientHistory(client);
  const history = result.ok ? result.history : null;
  const unverified = userRepeated || !client.user || (history?.ambiguousMonths.length ?? 0) > 0;
  const panelThree = /PANEL\s*3/i.test(client.panel);
  const due = technicalDue({ panel: client.panel, due: client.technicalDue, userRepeated: unverified, controlDue: history?.controlDue ?? null });
  const cell = observations(client);
  const advisorNote = queue?.advisorObservation ?? carteraField(client, "OBSERVACIONES ASESOR");
  const confirmationX = queue?.paymentConfirmation ?? carteraField(client, "CONFIRMACION");
  const collectionAN = queue?.collectionStatus ?? carteraField(client, "ESTADO_COBRO");
  const gestiones = cell ? parseGestiones(cell) : [];
  const last = gestiones.at(-1);
  const gestionState = last ? GESTION_ETIQUETAS[last.estado].toUpperCase() : queue?.lastManaged ? "GESTIONADO EN LA HOJA" : "SIN GESTIÓN";
  const amounts = money(client.tariff);

  const stage = cobranzaStage(client.nextPayment, today, client.method);
  const template = stage && cobranza ? cobranza[stage.key] : null;
  const references = await readPaymentReferences();
  const method = stage?.key.split(" ")[1];
  const message = template ? personalizeScript(template, {
    NOMBRE: greetingName(client.name), ASESOR: actor, FECHA: displayDate(client.nextPayment), PLAN: client.plan,
    VALOR: amounts.length === 1 ? amounts[0] : null, DATOS_PAGO: method ? references?.[method] ?? null : null,
  }) : null;

  const shown = message ?? fallback;
  const blocked = !gestionWriteEnabled() ? (admin ? "registro deshabilitado hasta validar la escritura en hoja de ensayo." : "el guardado aún no está disponible. Anota el resultado en la planilla de pendientes.")
    : cell === null ? "el cliente no tiene fila verificable en la cartera del mes."
    : unverified ? "identidad requiere validación." : null;

  return <div className="mt-4 scroll-mt-24 space-y-3" id="cliente">
    <header className={card}>
      <p className={label}>Cliente en atención{admin ? ` · ${client.source}` : ""}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">{client.name}</h3><span className="rounded-full border border-brand-border px-2 py-0.5 text-[10px] font-black">{gestionState}</span></div>
      <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Item name="Teléfono" value={client.phone} />
        <Item name="Usuario" value={<span className="font-mono">{client.user || "—"}</span>} />
        <Item name="Panel" value={client.panel} />
        <Item name="Estado" value={client.status} />
      </dl>
    </header>

    {panelThree ? <p className="rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-2 text-sm text-status-warning" role="note">Panel 3: el vencimiento técnico requiere validación y los créditos están detenidos. Puedes gestionar el cobro; no asignes créditos.</p> : null}

    <div className="grid gap-3 md:grid-cols-2">
      <section aria-label="Capa financiera" className={card}>
        <h3 className="font-semibold">Financiera</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <Item name="Próximo pago" value={displayDate(client.nextPayment) ?? "POR VALIDAR"} />
          <Item name="Valor registrado" value={amounts.join(" + ") || "POR VALIDAR"} />
          <Item name="Moneda" value={(["USD", "COP", "CAD"] as const).filter((c) => client.tariff[c]).join(" + ")} />
          <Item name="Método de pago" value={client.method} />
          <Item name="Estado de cobro (AN)" value={queue ? `${collectionAN || "SIN ESTADO"} · ${queue.lane}` : (collectionAN || "Fuera de la cola de hoy")} />
          <Item name="Confirmación (X)" value={<>{confirmationX || "SIN CONFIRMACIÓN EN X"}<span className="block text-[11px] font-normal text-brand-muted">Requiere cruce con el pago del ciclo actual.</span></>} />
          {queue?.confirmedMethodReference ? <Item name="Pago confirmado del mes" value={`CONFIRMADO JM · ${queue.confirmedMethodReference} · pendiente de sincronización con cartera`} wide /> : null}
          <Item name="Último pago" value={displayDate(client.lastPayment)} />
          <Item name="Observaciones asesor (W)" value={advisorNote || "SIN OBSERVACIÓN"} wide />
          <Item name="Última gestión" value={last ? `${last.at} · ${last.actor}` : queue?.lastManaged || "SIN GESTIÓN"} wide />
        </dl>
      </section>

      <section aria-label="Capa de servicio" className={card}>
        <h3 className="font-semibold">Servicio</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <Item name="Panel" value={client.panel} />
          <Item name="Plan" value={client.plan || "POR VALIDAR"} />
          <Item name="Pantallas" value={client.screens} />
          <Item name="Estado técnico" value={due.status} />
          <Item name="Vencimiento técnico" value={<>{displayDate(due.date) ?? "REQUIERE VALIDACIÓN"}<span className="block text-[11px] font-normal text-brand-muted">{due.reason}</span></>} wide />
        </dl>
        <ServiceCredentials clientId={client.id} key={client.id} panel={client.panel} user={client.user} />
      </section>
    </div>

    {queue?.releaseAlert ? <section aria-label="Alerta de liberación de línea" className="rounded-2xl border border-brand-yellow/50 bg-brand-yellow/10 p-4" role="alert">
      <h3 className="font-bold text-status-warning">Cola Operacional · Alerta de liberación de línea</h3>
      <p className="mt-2 text-sm">Responsable: asesor que atiende · {queue.releaseAlert.state === "PENDIENTE_VERIFICACION_FINANCIERA" ? "Primero verificar confirmación financiera e identidad" : "Pendiente de revisión técnica"}</p>
      <p className="mt-1 text-sm">{queue.releaseAlert.instruction}</p>
      <p className="mt-1 text-xs text-brand-muted">La alerta es de solo lectura. No confirma liberación ni cambia el estado del panel; el cierre requiere evidencia de suspensión y registro de gestión verificado.</p>
    </section> : null}

    <section aria-label="Acción" className={card}>
      <h3 className="font-semibold">Acción{stage ? ` · ${stage.label}` : ""}</h3>
      {stage ? <p className="text-xs text-brand-muted">Canal: {stage.channel}. {stage.note}</p> : null}
      {shown ? <><p className="mt-2 text-xs font-semibold">Mensaje recomendado{message ? "" : ` · ${fallback?.title}`}</p><CopyableMessage text={shown.text} />{shown.pending ? <p className="mt-1 text-xs text-status-warning">{shown.pending} dato(s) sin confirmar quedan entre corchetes. No envíes datos de pago que no sean los autorizados.</p> : null}</> : <p className="mt-2 text-sm text-status-warning">Sin mensaje publicado para este caso.</p>}
      <GestionRegistro blocked={blocked} clientId={client.id} expectedHash={cell === null ? null : observationsHash(cell)} key={client.id} />
    </section>

    <details className={card}>
      <summary className="cursor-pointer font-semibold">Historial</summary>
      {history ? <History history={history} /> : <p className="mt-2 text-sm text-status-warning">REQUIERE VALIDACIÓN: {!result.ok ? result.reason : ""}</p>}
      {gestiones.length ? <div className="mt-3"><h4 className="text-xs font-bold">Gestiones registradas</h4><ul className="mt-1 space-y-1 text-xs">{[...gestiones].reverse().map((g, i) => <li key={i}>{g.at} · {g.actor} · {GESTION_ETIQUETAS[g.estado]}{g.detail ? ` · ${g.detail}` : ""}</li>)}</ul></div> : null}
    </details>
  </div>;
}
