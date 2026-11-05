"use client";

import { useState } from "react";

import { CONTROL_MONTHS, type ControlRecord } from "@/server/tiviplay-live/client-history-model";

const th = "px-2 py-1 text-left text-[10px] font-bold uppercase text-brand-muted";
const td = "px-2 py-1 align-top text-xs";
const dmy = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "—");

/** Evidencia técnica del cliente por mes. Es lectura de CONTROL: no autoriza créditos. */
export function ControlMonths({ records }: { records: ControlRecord[] }) {
  const [month, setMonth] = useState<string>(CONTROL_MONTHS[0].key);
  const rows = records.filter((r) => r.month === month);
  return <div className="mt-3 rounded-xl border border-brand-border bg-brand-background p-3 text-xs">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-bold">Evidencia técnica en CONTROL</p>
      <select aria-label="Mes de CONTROL" className="rounded-lg border border-brand-border bg-white px-2 py-1" onChange={(e) => setMonth(e.target.value)} value={month}>
        {CONTROL_MONTHS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
      </select>
    </div>
    {rows.length ? <div className="mt-2 overflow-x-auto"><table className="w-full">
      <thead><tr><th className={th}>Hoja</th><th className={th}>Fila</th><th className={th}>Fecha</th><th className={th}>F. vencimiento</th><th className={th}>Crédito</th><th className={th}>Estado</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={`${r.sheet}!${r.row}`}>
        <td className={td}>{r.sheet}</td><td className={td}>{r.row}</td><td className={td}>{dmy(r.date)}</td><td className={td}>{dmy(r.due)}</td><td className={td}>{r.credit || "—"}</td>
        <td className={td}><strong>{r.status}</strong><span className="block text-brand-muted">{r.note}</span></td>
      </tr>)}</tbody>
    </table></div> : <p className="mt-2 text-brand-muted">Sin registro en CONTROL para este mes. No implica desactivación.</p>}
  </div>;
}
