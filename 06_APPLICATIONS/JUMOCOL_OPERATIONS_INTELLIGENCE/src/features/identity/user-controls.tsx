"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TokenField } from "./token-field";
export function UserControls({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function change(action: string) {
    setBusy(true); setToken(null); setMessage("");
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
      const result = await response.json(); setMessage(result.error ?? result.message); setToken(result.token ?? null); router.refresh();
    } catch { setMessage("No se pudo conectar."); } finally { setBusy(false); }
  }
  return <div className="mt-3 space-y-3">
    <div className="flex flex-wrap gap-3">{[["reset", "Emitir activación / restablecer"], ["activate", "Reactivar"], ["deactivate", "Desactivar"]].map(([action, label]) => <button disabled={busy} className="rounded-lg border px-3 py-2 disabled:opacity-50" onClick={() => change(action)} key={action}>{label}</button>)}</div>
    <p aria-live="polite" className="text-sm">{message}</p>
    {token ? <TokenField token={token} label={`Código para ${id}`} /> : null}
  </div>;
}
