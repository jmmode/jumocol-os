import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { audit } from "@/server/auth/store";
import { recordCycleDecision } from "@/server/tiviplay-live/cycle-decisions";

/** Dirección decide una excepción del ciclo TiviPlay (CONFIRMAR · CORREGIR · RECHAZAR). Nunca escribe en Google Sheets. */
export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    recordCycleDecision(access.user, await readInput(request));
    return NextResponse.json({ status: "REEVALUAR" });
  } catch (error) {
    audit(access.user.id, "tiviplay-decision", "decide", "DENIED");
    return NextResponse.json({ error: error instanceof Error ? error.message : "Decisión no disponible." }, { status: 400 });
  }
}
