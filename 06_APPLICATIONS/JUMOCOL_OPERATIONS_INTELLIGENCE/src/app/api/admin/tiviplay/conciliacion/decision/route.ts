import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { audit } from "@/server/auth/store";
import { recordReconDecision } from "@/server/tiviplay-live/conciliacion";

/** Dirección decide un caso de conciliación (p. ej. qué panel conservar). Bloqueada tras guardarse; nunca escribe en Sheets. */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    recordReconDecision(access.user, await readInput(request));
    return NextResponse.json({ status: "REEVALUAR" });
  } catch (error) {
    audit(access.user.id, "tiviplay-recon-decision", "decide", "DENIED");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Decisión no disponible." }, { status: 400 });
  }
}
