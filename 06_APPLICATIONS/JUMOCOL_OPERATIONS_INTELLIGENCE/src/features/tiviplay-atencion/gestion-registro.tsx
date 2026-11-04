"use client";
import { useRef, useState } from "react";
import { GESTION_ESTADOS, GESTION_ETIQUETAS, type GestionEstado } from "@/server/tiviplay-live/gestion-model";

export function GestionRegistro({ clientId, expectedHash, blocked }: { clientId: string; expectedHash: string | null; blocked: string | null }) {
  const [estado, setEstado] = useState<GestionEstado>("MENSAJE_ENVIADO");
  const [detalle, setDetalle] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const requestId = useRef<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    // Una misma acción conserva su ID al reintentar tras un fallo de red.
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/operations/tiviplay/clientes/gestion", {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, estado, detalle, requestId: requestId.current, expectedHash }),
      });
      const payload = (await response.json()) as { status?: string; message?: string };
      if (response.ok) {
        setResult({ ok: true, message: payload.message ?? "Gestión registrada." });
        setDetalle("");
        requestId.current = null;
      } else {
        setResult({ ok: false, message: payload.message ?? "No se registró la gestión." });
      }
    } catch {
      setResult({ ok: false, message: "Sin respuesta del servidor. Verifica la hoja antes de reintentar." });
    } finally { setPending(false); }
  }

  return <form onSubmit={submit} className="mt-4 border-t border-brand-border pt-3">
    <h3 className="text-sm font-semibold">Confirmar resultado y guardar gestión</h3>
    <p className="mt-1 text-xs text-brand-muted">Copiar no equivale a enviar. Registra el resultado solo después de contactar al cliente. Comprobante recibido no confirma el pago: eso lo valida Dirección.</p>
    <div className="mt-2 flex flex-wrap gap-2">
      <select aria-label="Resultado de gestión" className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm" value={estado} onChange={(e) => { setEstado(e.target.value as GestionEstado); requestId.current = null; setResult(null); }}>
        {GESTION_ESTADOS.map((s) => <option key={s} value={s}>{GESTION_ETIQUETAS[s]}</option>)}
      </select>
      <input aria-label="Detalle de gestión" className="min-w-[180px] flex-1 rounded-lg border border-brand-border px-3 py-2 text-sm" type="text" value={detalle}
        maxLength={220} onChange={(e) => { setDetalle(e.target.value); requestId.current = null; setResult(null); }}
        placeholder={estado === "COMPROMISO_PAGO" ? "Fecha acordada y observación (obligatorio)" : "Detalle breve, opcional; no incluyas contraseñas"} />
      <button className="rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        disabled={pending || !!blocked || (estado === "COMPROMISO_PAGO" && detalle.trim().length < 5)} type="submit">
        {pending ? "Guardando…" : "Confirmar y guardar gestión"}
      </button>
    </div>
    {blocked ? <p className="mt-2 text-sm text-status-warning" role="note">BLOQUEADO: {blocked}</p> : null}
    {result ? <p className={`mt-2 text-sm ${result.ok ? "text-status-success" : "text-status-error"}`} role="status">{result.message}</p> : null}
  </form>;
}
