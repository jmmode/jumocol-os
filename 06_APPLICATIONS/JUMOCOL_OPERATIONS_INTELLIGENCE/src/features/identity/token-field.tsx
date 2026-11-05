"use client";
import { useRef, useState } from "react";
/** One-time activation code: readable and copyable by the ADMIN who issued it; never persisted or logged. */
export function TokenField({ token, label }: { token: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy(input: HTMLInputElement | null) {
    try { await navigator.clipboard.writeText(token); }
    catch { input?.select(); document.execCommand("copy"); }
    setCopied(true); setTimeout(() => setCopied(false), 3000);
  }
  const field = useRef<HTMLInputElement>(null);
  return <div className="block text-sm">
    <span>Código privado ({token.length} caracteres). Copiar y entregar al titular; no guardarlo en reportes.</span>
    <div className="mt-2 flex gap-2">
      <input ref={field} readOnly type="text" aria-label={label} value={token}
        className="w-full border p-2 font-mono text-xs" onFocus={e => e.target.select()}
        autoComplete="off" spellCheck={false} />
      <button type="button" onClick={() => copy(field.current)} className="rounded-lg border px-3 py-2">{copied ? "Copiado ✓" : "Copiar"}</button>
    </div>
  </div>;
}
