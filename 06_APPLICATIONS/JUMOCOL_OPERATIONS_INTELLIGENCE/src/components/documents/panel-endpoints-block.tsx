import type { PanelEndpointsResult, PanelId } from "@/server/documents/panel-endpoints";
import { CopyableMessage } from "./copyable-message";

/** URL de configuración de un panel leídas de la configuración local. Solo las VALIDADAS se ofrecen para copiar. */
export function PanelEndpointsBlock({ panel, data }: { panel: PanelId; data?: PanelEndpointsResult }) {
  if (!data || data.state !== "OK") {
    return <p className="mt-4 rounded-xl border border-brand-yellow/45 bg-brand-yellow/10 p-4 text-sm" role="status">
      <strong>REQUIERE EVIDENCIA</strong> · {data ? data.reason : "Configuración local no disponible."} Pide la URL a Back Office o Dirección.
    </p>;
  }
  const validated = data.endpoints.filter(e => e.panel === panel && e.status === "VALIDADO");
  const pending = data.endpoints.filter(e => e.panel === panel && e.status === "REQUIERE_EVIDENCIA");
  return <div className="mt-4" data-panel-endpoints={panel}>
    {validated.length ? validated.map(e => e.status === "VALIDADO" ? <div key={e.url}>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-status-success">VALIDADO{e.note ? <span className="ml-2 font-semibold normal-case tracking-normal text-brand-graphite">{e.note}</span> : null}</p>
      <CopyableMessage text={e.url} />
    </div> : null)
      : <p className="mt-3 text-sm" role="status"><strong>REQUIERE EVIDENCIA</strong> · No hay URL validada para el Panel {panel}. Pide la URL a Back Office o Dirección.</p>}
    {pending.length ? <div className="mt-4 rounded-xl border border-brand-yellow/45 bg-brand-yellow/10 p-4 text-sm">
      <p className="font-semibold">REQUIERE EVIDENCIA · no usar</p>
      <ul className="mt-2 list-disc pl-5">{pending.map((e, i) => e.status === "REQUIERE_EVIDENCIA" ? <li key={i}>{e.label}{e.note ? ` — ${e.note}` : ""}</li> : null)}</ul>
    </div> : null}
    <p className="mt-3 text-xs text-brand-muted">Fuente: {data.source} · actualizado {data.updatedAt}.</p>
  </div>;
}
