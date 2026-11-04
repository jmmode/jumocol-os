import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { saveGestionInObservaciones } from "@/server/tiviplay-live/gestion-write";

/**
 * POST autenticado y auditado. Solo registra observaciones; no confirma pagos ni créditos.
 * La fila, hoja, nombre y usuario se resuelven exclusivamente en el servidor.
 */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request))
    return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  let body: { clientId?: unknown; estado?: unknown; detalle?: unknown; requestId?: unknown };
  try { body = (await request.json()) as typeof body; }
  catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }

  const result = await saveGestionInObservaciones(access.user, {
    clientId: typeof body.clientId === "string" ? body.clientId : "",
    estado: typeof body.estado === "string" ? body.estado : "",
    detalle: typeof body.detalle === "string" ? body.detalle : "",
    requestId: typeof body.requestId === "string" ? body.requestId : "",
  });
  audit(access.user.id, "tiviplay-gestion", "observaciones-append", result.status);
  const status = result.status === "SAVED" || result.status === "DUPLICATE" ? 200 :
    result.status === "BAD_INPUT" ? 400 : result.status === "CLIENT_MISMATCH" || result.status === "CONFLICT" ? 409 :
    result.status === "WRITE_DENIED" ? 403 : 503;
  return NextResponse.json(result, { status, headers: { "Cache-Control": "private, no-store" } });
}
