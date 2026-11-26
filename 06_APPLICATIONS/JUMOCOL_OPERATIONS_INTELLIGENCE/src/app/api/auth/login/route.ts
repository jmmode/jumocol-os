import { NextResponse } from "next/server";
import { cookieOptions, trustedOrigin } from "@/server/auth/access";
import { readInput } from "@/server/auth/http";
import { COOKIE, login } from "@/server/auth/store";
export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado o sin configurar." }, { status: 403 });
  try {
    const options = cookieOptions();
    const input = await readInput(request);
    const result = await login(input.id ?? "", input.password ?? "");
    if (!result) return NextResponse.json({ error: "Acceso no disponible. Verifique las credenciales o espere 15 minutos." }, { status: 401 });
    const response = NextResponse.json({ destination: result.user.role === "ADMIN" ? "/" : "/operaciones/tiviplay" });
    response.cookies.set(COOKIE, result.token, options);
    return response;
  } catch { return NextResponse.json({ error: "No fue posible iniciar sesión. Revise la configuración local." }, { status: 400 }); }
}
