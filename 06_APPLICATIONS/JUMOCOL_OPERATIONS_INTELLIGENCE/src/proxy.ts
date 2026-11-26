import { NextResponse, type NextRequest } from "next/server";
import { allowed } from "./server/auth/policy";
import { audit, COOKIE, session } from "./server/auth/store";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = ["/login", "/activar", "/api/auth/login", "/api/auth/activate"].includes(path);
  const user = session(request.cookies.get(COOKIE)?.value);
  let response: NextResponse;
  if (isPublic) response = NextResponse.next();
  else if (!user) response = path.startsWith("/api/")
    ? NextResponse.json({ error: "Autenticación requerida." }, { status: 401 })
    : NextResponse.redirect(new URL("/login", request.url));
  else if (user.role === "OPERADOR" && ["/", "/operaciones"].includes(path))
    response = NextResponse.redirect(new URL("/operaciones/tiviplay", request.url));
  else if (!allowed(user.role, path, request.method)) {
    audit(user.id, "protected-route", "access", "DENIED");
    response = path.startsWith("/api/") ? NextResponse.json({ error: "Acceso denegado." }, { status: 403 })
      : NextResponse.redirect(new URL("/acceso-denegado", request.url));
  } else response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico).*)"] };
