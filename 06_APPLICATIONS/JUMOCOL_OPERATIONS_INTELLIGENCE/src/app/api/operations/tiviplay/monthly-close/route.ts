import { NextResponse } from "next/server";

import { getTiviplayMonthlyCloseLive } from "@/server/tiviplay-live/monthly-close";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetMonth =
    url.searchParams.get("month") ??
    process.env.TIVIPLAY_TARGET_MONTH ??
    new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
    return NextResponse.json(
      { status: "REQUIERE_DECISION", error: "month must use YYYY-MM" },
      { status: 400 },
    );
  }

  try {
    const data = await getTiviplayMonthlyCloseLive(targetMonth);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "BLOQUEADO",
        error: error instanceof Error ? error.message : "Unknown live-read error",
      },
      { status: 500 },
    );
  }
}
