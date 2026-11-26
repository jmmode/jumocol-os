"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TokenField } from "./token-field";
export function CreateOperatorForm() {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setToken(null); setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, action: "create" }) });
      const result = await response.json(); setMessage(result.error ?? result.message); setToken(result.token ?? null);
      if (response.ok) { form.reset(); router.refresh(); }
    } catch { setMessage("No se pudo conectar."); } finally { setBusy(false); }
  }
  return <section className="my-6 rounded-xl border p-5">
    <h2 className="font-bold">Crear operador</h2>
    <p className="my-2 text-sm">Rol fijo OPERADOR. La cuenta queda inactiva hasta que el titular define su contraseña en /activar con el código de un solo uso.</p>
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="block text-sm">Usuario<input name="id" required minLength={3} maxLength={32} pattern="[a-z][a-z0-9._\-]{2,31}" autoComplete="off" className="mt-1 block rounded-lg border p-2" placeholder="nombre.apellido" /></label>
      <label className="block text-sm">Nombre visible<input name="name" required minLength={2} maxLength={60} autoComplete="off" className="mt-1 block rounded-lg border p-2" /></label>
      <button disabled={busy} className="rounded-lg border px-4 py-2 disabled:opacity-50">{busy ? "Creando…" : "Crear y emitir activación"}</button>
    </form>
    <p aria-live="polite" className="mt-3 text-sm">{message}</p>
    {token ? <TokenField token={token} label="Código de activación del nuevo operador" /> : null}
  </section>;
}
