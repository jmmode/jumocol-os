import { requireApi, trustedOrigin } from "@/server/auth/access";
import { audit } from "@/server/auth/store";
import { NextResponse } from "next/server";

import { clearTiviplayPaymentsCache, loadTiviplayPaymentsSnapshot } from "@/server/tiviplay-payments/excel-source";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await requireApi(request);
  if (access.response) return access.response;
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  audit(access.user.id, "tiviplay-payments/refresh", "read", "REQUESTED");
  clearTiviplayPaymentsCache();
  const snapshot = await loadTiviplayPaymentsSnapshot({ force: true });
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
}
