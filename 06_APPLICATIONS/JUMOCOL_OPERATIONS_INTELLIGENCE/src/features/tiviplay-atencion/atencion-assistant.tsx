"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

import { classifyMessage } from "@/features/tiviplay-atencion/classify";
import type { Ficha } from "@/features/tiviplay-atencion/fichas";

type Match = { id: string; by: string; name: string; phone: string; user: string; status: string; plan: string; panel: string; nextPayment: string | null };

const ROUTE = "/operaciones/tiviplay/atencion";
const chip = "rounded-full border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-primary-dark hover:border-brand-primary";
const href = (cliente: string | null, ficha?: string, anchor = "ficha") => {
  const p = new URLSearchParams();
  if (cliente) p.set("cliente", cliente);
  if (ficha) p.set("ficha", ficha);
  return `${ROUTE}?${p.toString()}#${anchor}`;
};

/** Búsqueda por nombre, teléfono o usuario. La consulta va en el cuerpo de un POST: no queda en la URL ni en el historial. */
export function ClientSearch({ selectedFicha }: { selectedFicha: string | null }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; matches: Match[]; message: string }>({ status: "idle", matches: [], message: "" });
  async function search(event: React.FormEvent) {
    event.preventDefault();
    setState({ status: "loading", matches: [], message: "" });
    try {
      const res = await fetch("/api/operations/tiviplay/clientes/buscar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query }), cache: "no-store" });
      const data = (await res.json()) as { matches?: Match[]; error?: string };
      if (!res.ok) setState({ status: "error", matches: [], message: data.error ?? "No disponible." });
      else setState({ status: "done", matches: data.matches ?? [], message: "" });
    } catch {
      setState({ status: "error", matches: [], message: "BLOQUEADO: no fue posible consultar el servidor." });
    }
  }
  return <div>
    <form className="mt-3 flex flex-wrap gap-3" onSubmit={search} autoComplete="off">
      <input aria-label="Buscar cliente" className="w-full rounded-lg border p-3 sm:w-auto sm:min-w-[320px] sm:flex-1" maxLength={80} minLength={3} name="cliente-busqueda" onChange={(e) => setQuery(e.target.value)} placeholder="Nombre, teléfono o usuario" required type="search" value={query} />
      <button className="rounded-lg bg-brand-primary-dark px-4 py-3 text-sm font-semibold text-white" disabled={state.status === "loading"}>{state.status === "loading" ? "Buscando…" : "Buscar cliente"}</button>
    </form>
    <div className="mt-3" role="status" aria-live="polite">
      {state.status === "error" ? <p className="text-sm text-status-error">{state.message}</p> : null}
      {state.status === "done" && !state.matches.length ? <p className="text-sm text-brand-muted">Sin coincidencias. No lo agregues al flujo: usa la ficha A6 (financiera) o B1 (venta nueva).</p> : null}
      {state.matches.length > 1 ? <p className="text-sm font-semibold text-status-warning">{state.matches.length} coincidencias: confirma con el cliente cuál es antes de atender.</p> : null}
      <ul className="mt-2 grid gap-2 md:grid-cols-2">
        {state.matches.map((m) => <li className="rounded-xl border border-brand-border bg-white p-3 text-sm" key={m.id}>
          <p className="font-semibold">{m.name} <span className="ml-1 text-[10px] font-black uppercase text-brand-muted">por {m.by.toLowerCase()}</span></p>
          <p className="text-xs text-brand-graphite">{m.phone || "Sin teléfono"} · usuario {m.user || "—"}</p>
          <p className="text-xs text-brand-muted">{m.plan || "Plan sin dato"} · {m.panel || "panel sin dato"} · {m.status || "sin estado"} · próximo pago {m.nextPayment ?? "POR VALIDAR"}</p>
          <Link className="mt-2 inline-block rounded-lg border border-brand-primary-dark px-3 py-1.5 text-xs font-bold text-brand-primary-dark" href={href(m.id, selectedFicha ?? undefined, "cliente")} prefetch={false}>ATENDER</Link>
        </li>)}
      </ul>
    </div>
  </div>;
}

/** Clasificación del mensaje en el navegador: el texto del cliente no se envía ni se guarda. */
export function MessageClassifier({ fichas, clienteId }: { fichas: Ficha[]; clienteId: string | null }) {
  const [text, setText] = useState("");
  const result = useMemo(() => (text.trim().length >= 3 ? classifyMessage(fichas, text) : null), [fichas, text]);
  return <div>
    <textarea aria-label="Mensaje del cliente" className="mt-3 w-full rounded-lg border p-3 text-sm" maxLength={600} onChange={(e) => setText(e.target.value)} placeholder="Pega o resume lo que dice el cliente. Ej.: se me borró la app del Firestick" rows={3} value={text} />
    {result ? <div className="mt-2" role="status" aria-live="polite">
      {result.suggestions.length === 0 ? <p className="text-sm text-brand-muted">Sin regla aplicable. Clasifica con los cajones A/B/C de abajo.</p> : <>
        <p className="text-sm">{result.ambiguous ? "Varias causas posibles: elige la que confirme el diagnóstico." : "Ficha sugerida:"}{result.category ? ` Categoría ${result.category}.` : ""}</p>
        <ul className="mt-2 space-y-2">{result.suggestions.map((s) => <li className="flex flex-wrap items-center gap-2" key={s.ficha.id}>
          <Link className={chip} href={`${href(clienteId, s.ficha.id, "ficha").replace("#ficha", "")}&proc=1#ficha`} prefetch={false}>{s.ficha.id} · {s.ficha.title}</Link>
          <span className="text-xs text-brand-muted">Regla: {s.rules.join(" · ")}</span>
        </li>)}</ul>
      </>}
    </div> : null}
  </div>;
}
