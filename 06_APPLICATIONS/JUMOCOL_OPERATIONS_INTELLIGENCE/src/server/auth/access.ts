import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { allowed } from "./policy";
import { audit, COOKIE, session } from "./store";

export async function currentUser() { return session((await cookies()).get(COOKIE)?.value); }
export async function requirePage(pathname: string) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!allowed(user.role, pathname)) { audit(user.id, pathname, "access", "DENIED"); redirect("/acceso-denegado"); }
  audit(user.id, pathname, "page-read", "AUTHORIZED");
  return user;
}
export async function requireApi(request: Request) {
  const user = await currentUser();
  const pathname = new URL(request.url).pathname;
  if (!user) return { response: NextResponse.json({ error: "Autenticación requerida." }, { status: 401 }) };
  if (!allowed(user.role, pathname, request.method)) {
    audit(user.id, pathname, "access", "DENIED");
    return { response: NextResponse.json({ error: "Acceso denegado." }, { status: 403 }) };
  }
  return { user };
}

export function trustedOrigin(request: Request) {
  const expected = process.env.JUMOCOL_APP_ORIGIN;
  if (!expected) return false;
  const origin = request.headers.get("origin");
  return origin === new URL(expected).origin;
}

export function cookieOptions() {
  const origin = new URL(process.env.JUMOCOL_APP_ORIGIN ?? "http://127.0.0.1:3000");
  if (origin.protocol !== "https:" && !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname))
    throw new Error("Se requiere HTTPS para acceso por red.");
  return { httpOnly: true, secure: origin.protocol === "https:", sameSite: "strict" as const, path: "/", maxAge: 8 * 60 * 60 };
}
