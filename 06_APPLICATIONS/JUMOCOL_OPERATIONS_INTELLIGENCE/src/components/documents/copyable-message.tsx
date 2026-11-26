"use client";
import { useState } from "react";

function legacyCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("copy");
}

/** Mensaje o dato de uso frecuente con botón Copiar. Sin dependencias: Clipboard API y, si no está disponible o la rechaza, selección + execCommand. */
export function CopyableMessage({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
      else legacyCopy(text);
      setState("copied");
    } catch {
      setState("error");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }
  return <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface p-4" data-copyable="mensaje">
    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-brand-text">{text}</p>
    <div className="mt-3 flex items-center gap-3">
      <button type="button" onClick={copy} className="rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white" aria-label="Copiar mensaje">
        {state === "copied" ? "Copiado ✓" : "Copiar"}
      </button>
      <span role="status" aria-live="polite" className="text-xs text-brand-muted">{state === "error" ? "No se pudo copiar: selecciona el texto y cópialo manualmente." : ""}</span>
    </div>
  </div>;
}
