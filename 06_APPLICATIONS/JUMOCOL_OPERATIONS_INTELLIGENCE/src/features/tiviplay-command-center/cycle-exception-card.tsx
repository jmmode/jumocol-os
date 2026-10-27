"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CycleException, DecisionAction } from "@/server/tiviplay-live/creditos-hoy-projection";

/** Tarjeta de excepción para Dirección: qué impide continuar + evidencia + propuesta, y solo tres acciones. */
export function CycleExceptionCard({ ex, kindLabel }: { ex: CycleException; kindLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const [value, setValue] = useState(ex.correct?.options[0]?.value ?? "");

  async function decide(action: DecisionAction) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/tiviplay/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: ex.subject, fingerprint: ex.fingerprint, action, ...(action === "CORREGIR" ? { value } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) setMessage(result.error ?? "No se pudo guardar la decisión.");
      else { setMessage("Decisión guardada. Reevaluando…"); router.refresh(); }
    } catch {
      setMessage("No se pudo conectar.");
    } finally {
      setBusy(false);
    }
  }

  const button = "rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-[0.06em] disabled:opacity-40";
  return (
    <li className="rounded-xl border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-3 text-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-status-warning">{kindLabel}</p>
      <p className="mt-1 font-semibold text-brand-text">{ex.title}</p>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-brand-muted">{ex.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
      <p className="mt-2 text-xs"><strong>Propuesta:</strong> {ex.proposal ?? "sin propuesta automática: indique el dato con CORREGIR o rechace."}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={`${button} border-brand-green/50 text-status-success`} disabled={busy || !ex.proposal} onClick={() => decide("CONFIRMAR")} type="button">Confirmar</button>
        <button className={`${button} border-brand-border`} disabled={busy || !ex.correct} onClick={() => setCorrecting((v) => !v)} type="button">Corregir</button>
        <button className={`${button} border-brand-red/40 text-status-error`} disabled={busy} onClick={() => decide("RECHAZAR")} title={ex.reject} type="button">Rechazar</button>
      </div>
      {correcting && ex.correct ? (
        <div className="mt-2 flex flex-wrap items-end gap-2 text-xs">
          <label className="flex min-w-0 flex-col gap-1">{ex.correct.label}
            <select className="max-w-full rounded-lg border px-2 py-1" onChange={(e) => setValue(e.target.value)} value={value}>
              {ex.correct.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <button className={`${button} border-brand-border`} disabled={busy || !value} onClick={() => decide("CORREGIR")} type="button">Guardar y reevaluar</button>
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-brand-muted">Rechazar: {ex.reject} · {ex.references.join(" · ")}</p>
      {message ? <p aria-live="polite" className="mt-1 text-xs font-semibold">{message}</p> : null}
    </li>
  );
}
