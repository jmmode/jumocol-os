"use client";
import { useRef, useState } from "react";
import { bloqueoEtapa, GESTION_ESTADOS, GESTION_ETAPAS, GESTION_ETIQUETAS, type GestionEstado, type GestionEtapa } from "@/server/tiviplay-live/gestion-model";

type Props = {
  clientId: string; expectedHash: string | null; blocked: string | null;
  suggested: GestionEtapa | null; messages: Partial<Record<GestionEtapa, string>>;
  releaseAlert: boolean; s0Date: string | null; paymentConfirmed: boolean; panel: string;
};

/** Amplía el formulario existente y conserva el contrato del endpoint y requestId. */
export function GestionRegistro({ clientId, expectedHash, blocked, suggested, messages, releaseAlert, s0Date, paymentConfirmed, panel }: Props) {
  const [etapa, setEtapa] = useState<GestionEtapa>(suggested ?? "D-5");
  const [estado, setEstado] = useState<GestionEstado | "">("");
  const [mensaje, setMensaje] = useState(messages[suggested ?? "D-5"] ?? "");
  const [observacion, setObservacion] = useState("");
  const [evidenciaPanel, setEvidenciaPanel] = useState("");
  const [panelConfirmado, setPanelConfirmado] = useState(false);
  const [ejecutada, setEjecutada] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const requestId = useRef<string | null>(null);
  const stage = GESTION_ETAPAS.find((item) => item.id === etapa)!;
  const hasMessage = !!messages[etapa];
  const panelGate = etapa === "S0" || etapa === "S+2";
  const stageBlock = bloqueoEtapa(etapa, { releaseAlert, paymentConfirmed, panel, s0Date, hasMessage });
  const detail = `SOP:${etapa}; CANAL:${stage.channel}; OBS:${observacion.trim()}${panelGate ? `; PANEL:${panel.trim()} ${evidenciaPanel.trim()}` : ""}`;
  const canSubmit = !!estado && ejecutada && !blocked && !stageBlock && !pending && !saved && detail.length <= 220 &&
    (!panelGate || (panelConfirmado && evidenciaPanel.trim().length >= 8)) &&
    (estado !== "COMPROMISO_PAGO" || observacion.trim().length >= 5) &&
    (estado !== "MENSAJE_ENVIADO" || (hasMessage && !!mensaje.trim()));

  function changed() { requestId.current = null; setResult(null); }
  function chooseStage(value: GestionEtapa) {
    setEtapa(value); setMensaje(messages[value] ?? ""); setEstado(""); setEjecutada(false);
    setPanelConfirmado(false); setEvidenciaPanel(""); changed();
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !estado) return;
    setPending(true); setResult(null);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/operations/tiviplay/clientes/gestion", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, estado, detalle: detail, requestId: requestId.current, expectedHash }),
      });
      const payload = (await response.json()) as { status?: string; message?: string };
      // SAVED requiere relectura de F; DUPLICATE comprueba el marcador en F.
      if (response.ok && (payload.status === "SAVED" || payload.status === "DUPLICATE")) {
        setResult({ ok: true, message: payload.message ?? "Gestión verificada en F." });
        setObservacion(""); setEjecutada(false); setSaved(true); requestId.current = null;
      } else setResult({ ok: false, message: payload.message ?? "No se comprobó la gestión. Revisa F antes de reintentar." });
    } catch { setResult({ ok: false, message: "Sin respuesta del servidor. Verifica F antes de reintentar." }); }
    finally { setPending(false); }
  }

  return <form onSubmit={submit} className="mt-4 border-t border-brand-border pt-3">
    <h3 className="text-sm font-semibold">Confirmar y guardar gestión</h3>
    <p className="mt-1 text-xs text-brand-muted">Etapa sugerida: {suggested ? GESTION_ETAPAS.find((item) => item.id === suggested)?.label : "sin fecha comercial verificable"}. Es una propuesta, no una gestión ejecutada. A+30 AL DIA y A&lt;25 POR VENCER se seleccionan manualmente; no modifican el estado comercial de la columna E.</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Etapa
        <select aria-label="Etapa SOP" className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2" value={etapa} onChange={(e) => chooseStage(e.target.value as GestionEtapa)}>
          {GESTION_ETAPAS.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.action}</option>)}
        </select>
      </label>
      <div className="text-sm"><span className="font-semibold">Acción:</span> {stage.action}<br /><span className="font-semibold">Canal:</span> {stage.channel}</div>
    </div>
    {etapa === "D0" && releaseAlert ? <p className="mt-2 text-sm text-status-warning" role="alert">Alerta de revisión en Cola Operacional: verificar pago, identidad y estado real del panel. No suspende el servicio.</p> : null}
    <label className="mt-3 block text-sm">Mensaje editable {hasMessage ? "" : "· sin texto aprobado para esta etapa"}
      <textarea aria-label="Mensaje editable" className="mt-1 w-full rounded-lg border border-brand-border bg-white p-3" rows={4} value={mensaje} disabled={!!stageBlock} onChange={(e) => { setMensaje(e.target.value); changed(); }} placeholder="Revisa el guion y los datos antes de contactar" />
    </label>
    <button type="button" className="rounded-lg border border-brand-border px-3 py-1 text-xs disabled:opacity-50" disabled={!mensaje.trim() || !!stageBlock} onClick={() => navigator.clipboard.writeText(mensaje)}>Copiar mensaje</button>
    <p className="mt-1 text-xs text-brand-muted">Copiar no equivale a enviar. El texto editado se copia; F registra etapa, resultado y observación, no el contenido del mensaje.</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">Resultado de gestión
        <select aria-label="Resultado de gestión" className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2" value={estado} onChange={(e) => { setEstado(e.target.value as GestionEstado | ""); changed(); }}>
          <option value="">Selecciona resultado</option>
          {GESTION_ESTADOS.map((item) => <option key={item} value={item}>{GESTION_ETIQUETAS[item]}</option>)}
        </select>
      </label>
      <label className="text-sm">Observación de esta gestión (F; W no se modifica)
        <input aria-label="Observación del asesor" className="mt-1 w-full rounded-lg border border-brand-border px-3 py-2" value={observacion} onChange={(e) => { setObservacion(e.target.value); changed(); }} placeholder="Detalle breve, sin credenciales" />
      </label>
    </div>
    {panelGate ? <div className="mt-3 space-y-2 rounded-lg border border-brand-border p-3 text-sm">
      <p>S0 exige evidencia de liberación real; S+2 exige comprobar que sigue liberada y sin pago confirmado. No se ejecuta ninguna acción en el panel desde aquí.</p>
      <input aria-label="Referencia de evidencia del panel" className="w-full rounded-lg border border-brand-border px-3 py-2" value={evidenciaPanel} onChange={(e) => { setEvidenciaPanel(e.target.value); changed(); }} placeholder="Referencia verificable de evidencia del panel" />
      <label className="flex gap-2"><input type="checkbox" checked={panelConfirmado} onChange={(e) => { setPanelConfirmado(e.target.checked); changed(); }} />Comprobé personalmente el estado real en el panel indicado.</label>
    </div> : null}
    <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={ejecutada} onChange={(e) => { setEjecutada(e.target.checked); changed(); }} />Confirmo que realicé la gestión seleccionada y que el resultado es fiel.</label>
    {blocked || stageBlock ? <p className="mt-2 text-sm text-status-warning" role="note">BLOQUEADO: {blocked ?? stageBlock}</p> : null}
    {detail.length > 220 ? <p className="mt-2 text-sm text-status-warning">Reduce la observación o la referencia del panel a 220 caracteres totales.</p> : null}
    <button className="mt-3 rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={!canSubmit} type="submit">{pending ? "Guardando…" : "Confirmar y guardar gestión"}</button>
    {result ? <p className={`mt-2 text-sm ${result.ok ? "text-status-success" : "text-status-error"}`} role="status">{result.message}</p> : null}
    {saved ? <p className="mt-1 text-xs text-brand-muted">Recarga la ficha para obtener una huella nueva antes de registrar otra gestión.</p> : null}
  </form>;
}
