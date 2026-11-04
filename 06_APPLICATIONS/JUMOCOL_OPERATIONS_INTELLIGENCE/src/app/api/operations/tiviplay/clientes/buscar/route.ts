import { NextResponse } from "next/server";

import { requireApi, trustedOrigin } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { findTiviplayClients } from "@/server/tiviplay-live/workday";

/**
 * Búsqueda de clientes TiviPlay (solo lectura) por nombre, teléfono o usuario.
 * POST para que la consulta (dato personal) viaje en el cuerpo y no en la URL, el historial ni los logs.
 * La auditoría registra el uso, nunca el texto buscado. Devuelve solo campos operativos permitidos.
 */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  let query = "";
  try {
    const body = (await request.json()) as { q?: unknown };
    query = typeof body.q === "string" ? body.q.slice(0, 80) : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (query.trim().length < 3) return NextResponse.json({ error: "Escribe al menos 3 caracteres." }, { status: 400 });
  const result = await findTiviplayClients(query);
  audit(access.user.id, "tiviplay-client-search", "read", result.ok ? "SUCCESS" : "UNAVAILABLE");
  if (!result.ok) return NextResponse.json({ error: `BLOQUEADO: ${result.reason}` }, { status: 503 });
  return NextResponse.json({
    total: result.total,
    matches: result.matches.map(({ entry, by }) => ({
      id: entry.id, by, name: entry.name, phone: entry.phone, user: entry.user, status: entry.status, plan: entry.plan,
      panel: entry.panel, nextPayment: entry.nextPayment,
    })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
