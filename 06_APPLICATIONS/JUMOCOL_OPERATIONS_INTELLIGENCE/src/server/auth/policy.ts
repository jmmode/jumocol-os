import type { Role } from "./store";

const operatorPages = new Set([
  "/operaciones/tiviplay", "/operaciones/tiviplay/contexto", "/operaciones/tiviplay/runtime",
  "/operaciones/tiviplay/manuales", "/acceso-denegado",
]);
export function allowed(role: Role, pathname: string, method = "GET") {
  if (role === "ADMIN") return true;
  if (method === "POST") return pathname === "/api/auth/logout";
  if (method !== "GET" && method !== "HEAD") return false;
  return operatorPages.has(pathname) || /^\/operaciones\/tiviplay\/manuales\/[a-z0-9-]+$/.test(pathname)
    || pathname === "/api/operations/tiviplay/runtime" || pathname === "/api/operations/tiviplay/monthly-close";
}
