import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireApi, trustedOrigin } from "@/server/auth/access";
import { COOKIE, logout } from "@/server/auth/store";
export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  const access = await requireApi(request);
  if (access.response) return access.response;
  logout((await cookies()).get(COOKIE)?.value);
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
