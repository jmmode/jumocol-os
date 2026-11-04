"use client";

import { useEffect, useState } from "react";

/** Acceso controlado: la credencial llega únicamente después de una acción explícita. */
export function ServiceCredentials({ clientId, panel }: { clientId: string; panel: string }) {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSecret("");
    setMessage("");
    setVisible(false);
  }, [clientId]);

  async function reveal() {
    setBusy(true);
    setSecret("");
    setMessage("");
    try {
      const response = await fetch("/api/operations/tiviplay/clientes/credencial", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }), cache: "no-store",
      });
      const data = (await response.json()) as { password?: string; error?: string; panel?: string };
      if (!response.ok || typeof data.password !== "string") {
        setMessage(data.error ?? "Credencial no disponible.");
      } else if (data.panel !== panel) {
        setMessage("BLOQUEADO: panel distinto del registro seleccionado.");
      } else {
        setSecret(data.password);
        setVisible(false);
        setMessage("Credencial consultada desde BASE GENERAL.");
      }
    } catch {
      setMessage("No fue posible consultar la credencial.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setMessage("Contraseña copiada. Verifica el destinatario antes de enviarla.");
    } catch {
      setMessage("El navegador no permitió copiar. Utiliza Mostrar contraseña.");
    }
  }

  const button = "rounded-lg border border-brand-primary-dark px-3 py-2 text-xs font-semibold text-brand-primary-dark disabled:opacity-50";
  return <section aria-label="Credenciales de servicio" className="mt-4 rounded-xl border border-brand-border bg-white p-4">
    <h3 className="text-sm font-semibold">Credencial de servicio · {panel || "panel por validar"}</h3>
    <p className="mt-1 text-xs text-brand-muted">Acceso autorizado y auditado. Solo consulta; no modifica el servicio.</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button className={button} type="button" onClick={reveal} disabled={busy}>{busy ? "Consultando…" : "Consultar contraseña"}</button>
      {secret ? <>
        <input aria-label="Contraseña de servicio" className="min-w-0 rounded-lg border px-2 py-1.5 font-mono text-sm" readOnly type={visible ? "text" : "password"} value={secret} autoComplete="off" spellCheck={false} />
        <button className={button} type="button" onClick={() => setVisible((v) => !v)}>{visible ? "Ocultar" : "Mostrar"}</button>
        <button className={button} type="button" onClick={copy}>Copiar contraseña</button>
        <button className={button} type="button" onClick={() => { setSecret(""); setVisible(false); setMessage("Credencial oculta."); }}>Limpiar</button>
      </> : null}
    </div>
    {message ? <p className="mt-2 text-xs" role="status">{message}</p> : null}
  </section>;
}
