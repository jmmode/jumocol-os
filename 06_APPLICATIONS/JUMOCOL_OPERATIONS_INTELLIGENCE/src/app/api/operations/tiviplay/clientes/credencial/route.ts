import { NextResponse } from "next/server";

import { requireApi, trustedOrigin } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { readServiceCredentialForClient } from "@/server/tiviplay-live/client-credential";

/**
 * Consulta explícita y autorizada de credencial de SERVICIO para un cliente seleccionado.
 * No permite GET, no expone búsquedas ni contraseñas en URL, cache o auditoría.
 */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });

  let id: string | undefined;
  try {
    const body = (await request.json()) as { clientId?: unknown };
    id = typeof body.clientId === "string" ? body.clientId : undefined;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!id || !/^[a-f0-9]{16}$/.test(id))
    return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });

  const result = await readServiceCredentialForClient(id);
  audit(access.user.id, "tiviplay-credential", "reveal-service-credential", result.ok ? "SUCCESS" : result.reason);
  const headers = { "Cache-Control": "no-store, private", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" };
  if (!result.ok) {
    const unavailable = result.reason === "SOURCE_UNAVAILABLE";
    return NextResponse.json({
      error: unavailable ? "BLOQUEADO: fuente viva de credenciales no disponible." :
        result.reason === "SOURCE_MISMATCH" || result.reason === "AMBIGUOUS" ?
        "BLOQUEADO: no se pudo verificar la correspondencia exacta entre cliente, usuario y panel." :
        result.reason === "NO_CREDENTIAL" ? "No hay contraseña de servicio registrada para esta ficha." :
        "Cliente no encontrado en BASE GENERAL.",
    }, { status: unavailable ? 503 : 409, headers });
  }
  return NextResponse.json({ password: result.password, panel: result.panel }, { headers });
}
