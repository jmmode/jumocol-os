import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { audit } from "@/server/auth/store";
import { recordTaskEvent } from "@/server/tiviplay-live/conciliacion";

/** Asesor u operador: EJECUTADO / NO SE PUEDE sobre una tarea de la cola de conciliación. Registro append-only. */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    recordTaskEvent(access.user, await readInput(request));
    return NextResponse.json({ status: "REEVALUAR" });
  } catch (error) {
    audit(access.user.id, "tiviplay-recon-task", "report", "DENIED");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registro no disponible." }, { status: 400 });
  }
}
