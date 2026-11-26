"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
export function CredentialForm({ activation = false }: { activation?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(activation ? "/api/auth/activate" : "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) setError(result.error ?? "No fue posible completar la solicitud.");
      else window.location.assign(result.destination);
    } catch { setError("No se pudo conectar con la intranet."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto my-16 max-w-md rounded-3xl border border-brand-border bg-white p-8 shadow-lg">
    <p className="text-sm font-bold text-brand-primary">JUMOCOL OS</p>
    <h1 className="my-5 text-2xl font-semibold">{activation ? "Activar o restablecer cuenta" : "Acceso individual"}</h1>
    <form onSubmit={submit} className="space-y-5">
      <label className="block">{activation ? "Código privado de activación" : "Usuario"}
        <input className="mt-2 w-full rounded-lg border p-3" name={activation ? "token" : "id"} type={activation ? "password" : "text"} autoComplete={activation ? "off" : "username"} maxLength={64} required />
      </label>
      <label className="block">{activation ? "Contraseña nueva (14–128 caracteres)" : "Contraseña"}
        <input className="mt-2 w-full rounded-lg border p-3" name="password" type="password" autoComplete={activation ? "new-password" : "current-password"} minLength={activation ? 14 : 1} maxLength={128} required />
      </label>
      <p aria-live="polite" className="text-sm text-status-error">{error}</p>
      <button disabled={busy} className="rounded-xl bg-brand-primary-dark px-6 py-3 text-white disabled:opacity-50">{busy ? "Procesando…" : activation ? "Guardar credenciales" : "Entrar"}</button>
    </form>
    <Link className="mt-6 block text-sm underline" href={activation ? "/login" : "/activar"}>{activation ? "Volver al acceso" : "Tengo un código de activación"}</Link>
    <p className="mt-4 text-xs text-brand-muted">Si perdió acceso, solicite el restablecimiento a Dirección.</p>
  </main>;
}
