import Link from "next/link";
import { CopyableMessage } from "@/components/documents/copyable-message";
import { ACCESS_DIRECTORY, PRIVATE_REMOTE_ACCESS, canonicalOrigin } from "./access-directory";

/** JUMOCOL OS — Accesos. Solo se renderiza en páginas de ADMIN; no contiene credenciales. */
export function AccessDirectoryPanel() {
  const origin = canonicalOrigin();
  return <section id="accesos" className="my-6 scroll-mt-28 rounded-2xl border p-5">
    <h2 className="text-xl font-semibold">JUMOCOL OS — Accesos</h2>
    <p className="mt-2 text-sm">Para iniciar la intranet en el equipo de Dirección usa el acceso directo <strong>JUMOCOL OS</strong> del escritorio. Comparte con los operadores solo la dirección de red local y la ruta de ingreso; las contraseñas nunca se envían por aquí.</p>
    {origin ? <div className="mt-4"><p className="text-sm font-semibold">Dirección vigente en la red local (Dirección y operadores)</p><p className="text-xs text-brand-muted">Es la dirección con la que se inició este servidor; depende de la IP actual del equipo de Dirección. Si esa IP cambia, el acceso directo JUMOCOL OS la detecta al iniciar y aquí aparece la nueva. Comparte siempre la que se muestra aquí.</p><CopyableMessage text={origin} /></div>
      : <p className="mt-4 text-sm">Dirección de red local: NO CONFIGURADA en este servidor. Se muestran solo rutas relativas.</p>}
    <div className="mt-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-brand-primary-dark text-white"><tr><th className="px-4 py-2">Acceso</th><th className="px-4 py-2">Ruta</th><th className="px-4 py-2">Para</th><th className="px-4 py-2">Propósito</th></tr></thead>
        <tbody className="divide-y">{ACCESS_DIRECTORY.map(entry => <tr key={entry.path} className="align-top">
          <td className="px-4 py-2 font-semibold">{entry.label}</td>
          <td className="px-4 py-2"><Link className="font-mono text-brand-primary underline" href={entry.path}>{entry.path}</Link></td>
          <td className="px-4 py-2">{entry.audience}</td>
          <td className="px-4 py-2">{entry.purpose}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-4 text-sm"><strong>{PRIVATE_REMOTE_ACCESS.label}:</strong> {PRIVATE_REMOTE_ACCESS.status}. {PRIVATE_REMOTE_ACCESS.detail}</p>
  </section>;
}
