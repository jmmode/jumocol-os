import { NextResponse } from "next/server";
import { cookieOptions, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { activate } from "@/server/auth/store";
export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  try {
    cookieOptions();
    const input = await readInput(request);
    if ((input.password?.length ?? 0) < 14 || (input.password?.length ?? 0) > 128) return NextResponse.json({ error: "Use entre 14 y 128 caracteres." }, { status: 400 });
    if (!await activate(input.token ?? "", input.password)) return NextResponse.json({ error: "Activación no disponible o vencida." }, { status: 400 });
    return NextResponse.json({ destination: "/login" });
  } catch { return NextResponse.json({ error: "No se pudo activar la cuenta." }, { status: 400 }); }
}
