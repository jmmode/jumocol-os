"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { OPERATIONAL_STANDARD } from "@/server/documents/curation";
export function PublicationControl({ id, sha256, draft, published }: { id: string; sha256: string; draft: boolean; published: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    const evidence = String(form.get("evidence") ?? "");
    const checklist = form.getAll("standard").map(String).join(",");
    try {
      const response = await fetch("/api/admin/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, sha256, evidence, checklist, action: published ? "revoke" : "publish" }) });
      const result = await response.json(); setMessage(result.error ?? "Publicación actualizada."); router.refresh();
    } catch { setMessage("No se pudo conectar."); } finally { setBusy(false); }
  }
  if (draft) return <p className="mt-3">El estado de la fuente o su clasificación impide publicarla. Revise el inventario documental antes de autorizar operadores.</p>;
  return <form onSubmit={submit} className="mt-3 space-y-3">{!published ? <>
    <label className="block">Referencia de aprobación de lectura para operadores<input name="evidence" className="mt-2 block w-full border p-2" required minLength={12} maxLength={300} placeholder="Identificador de decisión o acta; sin datos sensibles" /></label>
    <fieldset className="rounded-lg border p-3 text-sm"><legend className="px-1 font-semibold">Estándar del manual operativo (los 7 elementos son obligatorios)</legend>
      {OPERATIONAL_STANDARD.map(item => <label key={item.key} className="mt-1 block"><input type="checkbox" name="standard" value={item.key} required /> {item.label}</label>)}
    </fieldset>
    <label className="block text-sm"><input type="checkbox" required /> Confirmo vigencia, alcance operativo y autorización de esta versión exacta.</label>
  </> : null}<button disabled={busy} className="rounded-lg border px-4 py-2">{published ? "Retirar publicación" : "Autorizar lectura para operadores"}</button><p aria-live="polite">{message}</p></form>;
}
