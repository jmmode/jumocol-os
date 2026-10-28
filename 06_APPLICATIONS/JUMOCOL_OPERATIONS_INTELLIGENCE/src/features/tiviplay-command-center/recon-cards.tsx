"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { PANEL_LABEL, RELEASED_SHEET, type CaseView, type ReleasedRow, type TaskView } from "@/server/tiviplay-live/conciliacion-model";

type PreparedRow = { advisor: string; username: string; password: string; panel: string; date: string; status: string; lineId: string };

const button = "rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-[0.06em] disabled:opacity-40";

async function post(url: string, body: Record<string, string>) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  return response.ok ? null : (result.error as string) ?? "No se pudo guardar.";
}

/** Tarjeta de Gerencia: alternativas reales del servicio; la elección queda bloqueada y dispara BASE + tareas. */
export function ReconCaseCard({ c, client, cut }: { c: CaseView; client: string | null; cut: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(option: string) {
    setBusy(true); setMessage("");
    const error = await post("/api/admin/tiviplay/conciliacion/decision", {
      caseId: c.id, option, fingerprint: c.fingerprint,
      ...(c.decision ? { supersedes: String(c.decision.id), reason } : {}),
    });
    setBusy(false);
    if (error) setMessage(error);
    else { setMessage("Decisión registrada y bloqueada. Reevaluando…"); setCorrecting(false); router.refresh(); }
  }

  const locked = c.decision != null && !correcting;
  return (
    <li className={`rounded-xl border px-4 py-3 text-sm ${c.status === "PENDIENTE" ? "border-brand-yellow/50 bg-brand-yellow/10" : "border-brand-green/40 bg-brand-green/5"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-brand-text">{client ?? `BASE fila ${c.baseRows.join(", ") || "—"}`} · <span className="font-mono">{c.username}</span></p>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted">{c.status}</p>
      </div>
      <p className="mt-1 text-xs text-brand-muted">{c.contradiction}</p>
      {c.lines.length ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {c.lines.map((l) => (
            <div className={`rounded-lg border px-3 py-2 text-xs ${c.chosen?.keep === l.panel ? "border-brand-green" : "border-brand-border"}`} key={`${l.panel}-${l.lineId}`}>
              <p className="font-black">{PANEL_LABEL[l.panel]} · <span className={l.expiration >= cut ? "text-status-success" : "text-status-error"}>{l.expiration >= cut ? "VIGENTE" : "VENCIDA"}</span></p>
              <p>Línea ID {l.lineId} · fila {l.row}</p>
              <p>Vence <strong className="tabular-nums">{l.expiration}</strong></p>
              <p className="text-brand-muted">Última conexión: {l.lastConnection ?? "sin dato confiable"}</p>
            </div>
          ))}
        </div>
      ) : null}
      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-brand-muted">{c.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
      {c.proposal ? <p className="mt-2 text-xs"><strong>Propuesta del sistema:</strong> {c.options.find((o) => o.id === c.proposal)?.label}</p> : <p className="mt-2 text-xs"><strong>Propuesta del sistema:</strong> sin propuesta — la evidencia no distingue el servicio.</p>}
      {locked ? (
        <div className="mt-3 text-xs">
          <p><strong>Decidido:</strong> {c.chosen?.label} · {c.decision!.by} · {new Date(c.decision!.at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
          <p className="text-brand-muted">{c.chosen?.effect}</p>
          {c.history.length > 1 ? <p className="text-brand-muted">Historial: {c.history.map((h) => `${c.options.find((o) => o.id === h.option)?.label ?? h.option} (${h.by})`).join(" → ")}</p> : null}
          {c.status === "AUTOMATICO" || c.decision?.id === 0 ? <p className="mt-1 font-semibold">Resuelto por regla de vigencia: no requiere decisión.</p> : <button className={`${button} mt-2 border-brand-border`} onClick={() => setCorrecting(true)} type="button">Registrar corrección</button>}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {correcting ? (
            <label className="flex flex-col gap-1 text-xs">Motivo de la corrección (queda en el historial)
              <input className="rounded-lg border px-2 py-1" maxLength={300} onChange={(e) => setReason(e.target.value)} value={reason} />
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {c.options.filter((o) => !correcting || o.id !== c.decision?.option).map((o) => (
              <button className={`${button} ${o.id === c.proposal ? "border-brand-green/60 text-status-success" : "border-brand-border"}`} disabled={busy || (correcting && reason.trim().length < 5)} key={o.id} onClick={() => decide(o.id)} title={o.effect} type="button">{o.label}</button>
            ))}
            {correcting ? <button className={`${button} border-brand-border`} onClick={() => setCorrecting(false)} type="button">Cancelar</button> : null}
          </div>
          <ul className="list-disc pl-5 text-[11px] text-brand-muted">{c.options.map((o) => <li key={o.id}><strong>{o.label}:</strong> {o.effect}</li>)}</ul>
        </div>
      )}
      {message ? <p aria-live="polite" className="mt-1 text-xs font-semibold">{message}</p> : null}
    </li>
  );
}

/** Tarea del Asesor: exactamente qué hacer, y solo EJECUTADO / NO SE PUEDE. */
export function ReconTaskRow({ t, client, prepared, released, releasedReadable }: { t: TaskView; client: string | null; prepared?: PreparedRow | null; released?: ReleasedRow | null; releasedReadable?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [note, setNote] = useState("");

  async function report(action: "EJECUTADO" | "NO_SE_PUEDE") {
    setBusy(true); setMessage("");
    const error = await post("/api/operations/tiviplay/conciliacion/task", { taskId: t.id, action, ...(note ? { note } : {}) });
    setBusy(false);
    if (error) setMessage(error);
    else { setMessage(action === "EJECUTADO" ? "Registrado. Reevaluando…" : "Impedimento registrado."); setBlocking(false); router.refresh(); }
  }

  async function copyRow() {
    if (!prepared) return;
    // Orden de columnas B..H de la hoja. CONTRASEÑA (D) va vacía: se copia desde el panel, nunca desde la intranet.
    const tsv = [prepared.advisor, prepared.username, "", prepared.panel, prepared.date, prepared.status, prepared.lineId].join("\t");
    try { await navigator.clipboard.writeText(tsv); setMessage(`Fila copiada. Péguela en la columna B de ${RELEASED_SHEET} y escriba la CONTRASEÑA desde el panel.`); }
    catch { setMessage("No se pudo copiar automáticamente: use la fila mostrada."); }
  }

  const last = t.events[t.events.length - 1];
  const field = "rounded-lg border border-brand-border px-3 py-2";
  const label = "text-[10px] font-black uppercase tracking-[0.1em] text-brand-muted";
  const statusClass = t.status === "EJECUTADO" ? "text-status-success" : t.status === "NO_SE_PUEDE" ? "text-status-error" : "text-status-warning";
  return (
    <li className="rounded-xl border border-brand-border px-4 py-3 text-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{t.title}</p>
        <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${statusClass}`}>{t.status.replace(/_/g, " ")}</p>
      </div>
      {t.kind === "LIBERAR" && t.line && t.releasePanel && t.keepPanel ? (
        <>
          <p className="mt-1 text-xs">Cliente: <strong>{client ?? "ver BASE"}</strong></p>
          <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className={field}><dt className={label}>USERNAME</dt><dd className="font-mono font-semibold">{t.username}</dd></div>
            <div className={`${field} border-brand-red/40`}><dt className={label}>Panel a liberar</dt><dd className="font-semibold">{PANEL_LABEL[t.releasePanel]}</dd></div>
            <div className={`${field} border-brand-red/40`}><dt className={label}>LINE_ID</dt><dd className="font-mono font-semibold">{t.line.lineId}</dd></div>
            <div className={`${field} border-brand-green/50`}><dt className={label}>Panel a conservar</dt><dd className="font-semibold">{PANEL_LABEL[t.keepPanel]}</dd></div>
          </dl>
          <div className="mt-2 grid gap-2 text-xs lg:grid-cols-2">
            <div className={field}><p className={label}>Acción exacta</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>En <strong>{PANEL_LABEL[t.releasePanel]}</strong>, abrir la línea <strong className="font-mono">ID {t.line.lineId}</strong> (USERNAME <span className="font-mono">{t.username}</span>, vence {t.line.expiration}) y liberarla.</li>
                <li>No tocar la línea de <strong>{PANEL_LABEL[t.keepPanel]}</strong>: es el servicio del cliente.</li>
                <li>Registrar la línea en la hoja <strong>{RELEASED_SHEET}</strong> con la fila preparada abajo (la CONTRASEÑA se toma del panel).</li>
                <li>Marcar <strong>EJECUTADO</strong>. Si no se puede, <strong>NO SE PUEDE</strong> con el motivo.</li>
              </ol>
            </div>
            <div className={field}><p className={label}>Resultado esperado</p>
              <p className="mt-1">El cliente queda solo en {PANEL_LABEL[t.keepPanel]}. La línea {PANEL_LABEL[t.releasePanel]} · ID {t.line.lineId} queda libre en el panel y registrada en {RELEASED_SHEET}; al marcar EJECUTADO pasa a <strong>DISPONIBLE</strong> en la intranet. Mientras la tarea esté PENDIENTE, la línea no es DISPONIBLE.</p>
            </div>
          </div>
          {prepared ? (
            <div className={`mt-2 ${field} text-xs`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={label}>Fila preparada · {RELEASED_SHEET}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${released ? "text-status-success" : "text-status-warning"}`}>
                  {!releasedReadable ? "Hoja no legible: verificar manualmente" : released ? `Registrada en la fila ${released.row} (${released.status || "sin estado"})` : "Aún no registrada en la hoja"}
                </p>
              </div>
              <div className="mt-1 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead><tr className={label}>{["B ASESOR", "C USUARIO", "D CONTRASEÑA", "E PANEL", "F FECHA", "G ESTADO", "H LINE_ID"].map((h) => <th className="pr-3" key={h}>{h}</th>)}</tr></thead>
                  <tbody><tr className="font-mono">
                    <td className="pr-3">{prepared.advisor || "(su nombre)"}</td><td className="pr-3">{prepared.username}</td>
                    <td className="pr-3 font-sans text-brand-muted">desde el panel</td><td className="pr-3">{prepared.panel}</td>
                    <td className="pr-3">{prepared.date}</td><td className="pr-3">{prepared.status}</td><td className="pr-3">{prepared.lineId}</td>
                  </tr></tbody>
                </table>
              </div>
              {t.status !== "EJECUTADO" ? <button className={`${button} mt-2 border-brand-border`} onClick={copyRow} type="button">Copiar fila (sin contraseña)</button> : null}
              <p className="mt-1 text-[11px] text-brand-muted">Pegar solo después de liberar la línea en el panel. ESTADO DISPONIBLE en la hoja significa línea ya liberada.</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-1 text-xs">Cliente: <strong>{client ?? "ver BASE"}</strong> · USERNAME <span className="font-mono">{t.username}</span>
            {t.keepPanel ? <> · conservar <strong>{PANEL_LABEL[t.keepPanel]}</strong></> : null}
            {t.releasePanel ? <> · liberar <strong>{PANEL_LABEL[t.releasePanel]}</strong></> : null}</p>
          <p className="mt-1 text-xs"><span className={label}>Acción exacta </span>{t.instruction}</p>
        </>
      )}
      <p className="mt-1 text-[11px] text-brand-muted">Motivo / evidencia: {t.evidence}</p>
      <p className="mt-1 text-[11px]"><span className={label}>Estado </span><strong className={statusClass}>{t.status.replace(/_/g, " ")}</strong></p>
      {last ? <p className="mt-1 text-[11px] text-brand-muted">Último registro: {last.action.replace(/_/g, " ")} · {last.by} · {new Date(last.at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}{last.note ? ` · ${last.note}` : ""}</p> : null}
      {t.status !== "EJECUTADO" ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <button className={`${button} border-brand-green/50 text-status-success`} disabled={busy} onClick={() => report("EJECUTADO")} type="button">Ejecutado</button>
          <button className={`${button} border-brand-red/40 text-status-error`} disabled={busy} onClick={() => setBlocking((v) => !v)} type="button">No se puede</button>
          {blocking ? (
            <>
              <input aria-label="Motivo" className="min-w-[14rem] rounded-lg border px-2 py-1 text-xs" maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Motivo" value={note} />
              <button className={`${button} border-brand-border`} disabled={busy || note.trim().length < 5} onClick={() => report("NO_SE_PUEDE")} type="button">Registrar</button>
            </>
          ) : null}
          {t.kind === "LIBERAR" && releasedReadable && !released ? <p className="text-[11px] text-status-warning">Antes de EJECUTADO, registre la línea en {RELEASED_SHEET}.</p> : null}
        </div>
      ) : null}
      {message ? <p aria-live="polite" className="mt-1 text-xs font-semibold">{message}</p> : null}
    </li>
  );
}
