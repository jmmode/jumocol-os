import { NextResponse } from "next/server";
import { requireApi } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { getReconciliation, isApplied, readBaseLive } from "@/server/tiviplay-live/conciliacion";

/**
 * Cola de sincronización hacia BASE GENERAL: cambios que exigen las decisiones registradas.
 * La intranet lee Sheets con credencial de solo lectura; estos cambios los aplica y valida por relectura
 * el proceso de Back Office/sistema autorizado. Solo Dirección.
 */
export async function GET(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  const data = getReconciliation();
  audit(access.user.id, "tiviplay-recon-base-sync", "read", data ? "SUCCESS" : "UNAVAILABLE");
  if (!data) return NextResponse.json({ error: "Dataset de conciliación no disponible." }, { status: 503 });
  const live = await readBaseLive();
  const items = data.baseSync.map((s) => ({ ...s, applied: isApplied(s, live) }));
  return NextResponse.json({ cut: data.cut, verifiedAgainstLive: live != null, pending: items.filter((s) => !s.applied), applied: items.filter((s) => s.applied) }, { headers: { "Cache-Control": "no-store" } });
}
