"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CopyableMessage } from "@/components/documents/copyable-message";

const ITEMS = [
  { id: "conversaciones", label: "Revisar conversaciones pendientes", detail: "Mensajes del día actual y del anterior en WhatsApp Business.", href: null, source: null },
  { id: "urgentes", label: "Identificar solicitudes urgentes", detail: "Falla general, cliente sin servicio o pago por validar. Clasifícalas en Atención.", href: "/operaciones/tiviplay/atencion", source: "Abrir Atención" },
  { id: "pagos", label: "Consultar pagos y vencimientos", detail: "Solo en fuentes autorizadas. No uses listas anteriores.", href: "/operaciones/tiviplay/hoy", source: "Abrir HOY" },
  { id: "activaciones", label: "Verificar activaciones y renovaciones pendientes", detail: "Créditos de hoy y tareas de conciliación.", href: "/operaciones/tiviplay/conciliacion", source: "Abrir Conciliación" },
  { id: "tecnico", label: "Revisar reportes técnicos y escalamiento", detail: "Planilla de pendientes y fichas de soporte técnico.", href: "/operaciones/tiviplay/atencion#categoria-C", source: "Abrir soporte técnico" },
  { id: "responsable", label: "Identificar responsable y próxima acción", detail: "Completa los campos de abajo.", href: null, source: null },
  { id: "entrega", label: "Preparar entrega de turno", detail: "Copia el resumen y envíalo por el canal del equipo.", href: null, source: null },
] as const;

type Saved = { done: string[]; owner: string; next: string; pending: string };
const EMPTY: Saved = { done: [], owner: "", next: "", pending: "" };

/** Estado solo de este navegador y de este día, para no perder el avance al recargar. No es un registro oficial. */
function read(key: string): Saved {
  try {
    return { ...EMPTY, ...JSON.parse(window.localStorage.getItem(key) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

export function ShiftChecklist({ today }: { today: string }) {
  const key = `tiviplay-turno-${today}`;
  const [state, setState] = useState<Saved>(EMPTY);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = read(key);
    loaded.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage no existe durante el render del servidor.
    setState(saved);
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try { window.localStorage.setItem(key, JSON.stringify(state)); } catch { /* Sin almacenamiento el checklist sigue funcionando. */ }
  }, [key, state]);

  const toggle = (id: string) => setState(s => ({ ...s, done: s.done.includes(id) ? s.done.filter(x => x !== id) : [...s.done, id] }));
  const field = (name: "owner" | "next" | "pending") => ({ value: state[name], onChange: (e: { target: { value: string } }) => setState(s => ({ ...s, [name]: e.target.value })) });
  const handoff = [
    `Entrega de turno TiviPlay · ${today}`,
    `Checklist: ${state.done.length} de ${ITEMS.length}`,
    `Responsable: ${state.owner.trim() || "[RESPONSABLE]"}`,
    `Próxima acción: ${state.next.trim() || "[PRÓXIMA ACCIÓN]"}`,
    `Pendientes: ${state.pending.trim() || "[PENDIENTES]"}`,
  ].join("\n");

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm font-semibold" role="status">{state.done.length} de {ITEMS.length} puntos revisados · {today}</p>
      <ul className="space-y-3">
        {ITEMS.map(item => <li className="rounded-2xl border border-brand-border bg-brand-background p-4" key={item.id}>
          <label className="flex items-start gap-3">
            <input checked={state.done.includes(item.id)} className="mt-1 size-4" onChange={() => toggle(item.id)} type="checkbox" />
            <span><span className="text-sm font-semibold">{item.label}</span><span className="block text-xs leading-5 text-brand-muted">{item.detail}</span></span>
          </label>
          {item.href ? <Link className="ml-7 mt-2 inline-block text-xs font-semibold text-brand-primary underline" href={item.href}>{item.source}</Link> : null}
        </li>)}
      </ul>

      <section aria-labelledby="entrega" className="rounded-2xl border border-brand-border bg-brand-background p-5">
        <h2 className="text-lg font-semibold" id="entrega">Entrega de turno</h2>
        <p className="mt-1 text-xs leading-5 text-brand-muted">Se guarda solo en este navegador durante el día. No es un registro oficial. Usa referencias como la fila de origen, no teléfonos, pagos ni datos de acceso.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Responsable<input className="mt-1 w-full rounded-lg border p-3 font-normal" maxLength={80} {...field("owner")} /></label>
          <label className="text-sm font-semibold">Próxima acción<input className="mt-1 w-full rounded-lg border p-3 font-normal" maxLength={160} {...field("next")} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Pendientes<textarea className="mt-1 w-full rounded-lg border p-3 font-normal" maxLength={600} rows={3} {...field("pending")} /></label>
        </div>
        <CopyableMessage text={handoff} />
      </section>
    </div>
  );
}
