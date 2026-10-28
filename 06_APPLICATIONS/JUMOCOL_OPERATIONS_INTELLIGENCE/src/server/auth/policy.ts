import type { Role } from "./store";

const operatorPages = new Set([
  "/operaciones/tiviplay", "/operaciones/tiviplay/hoy", "/operaciones/tiviplay/contexto", "/operaciones/tiviplay/runtime",
  "/operaciones/tiviplay/manuales", "/operaciones/tiviplay/conciliacion", "/acceso-denegado",
]);
export function allowed(role: Role, pathname: string, method = "GET") {
  if (role === "ADMIN") return true;
  if (method === "POST") return pathname === "/api/auth/logout" || pathname === "/api/operations/tiviplay/conciliacion/task";
  if (method !== "GET" && method !== "HEAD") return false;
  return operatorPages.has(pathname) || /^\/operaciones\/tiviplay\/manuales\/[a-z0-9-]+$/.test(pathname)
    || pathname === "/api/operations/tiviplay/runtime" || pathname === "/api/operations/tiviplay/monthly-close";
}
