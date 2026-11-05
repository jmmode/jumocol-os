import { requirePage } from "@/server/auth/access";
import { audit, auditRows } from "@/server/auth/store";
export default async function AuditPage() {
  const actor = await requirePage("/administracion/auditoria");
  audit(actor.id, "audit", "read", "SUCCESS");
  const rows = auditRows(actor);
  return <div><h1 className="text-2xl font-semibold">Auditoría persistente</h1><p className="my-4">Últimos 250 eventos. Fechas UTC; no se registran contraseñas, códigos ni búsquedas de clientes.</p><div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{["Fecha UTC", "Usuario", "Entidad", "Acción", "Resultado"].map(x => <th key={x} className="p-2">{x}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={String(row.id)} className="border-t">{[row.at, row.user_id ?? "No identificado", row.entity, row.action, row.result].map((x, i) => <td className="p-2" key={i}>{String(x)}</td>)}</tr>)}</tbody></table></div></div>;
}
