import type { Role } from "./store";

const operatorPages = new Set([
  "/operaciones/tiviplay", "/operaciones/tiviplay/hoy", "/operaciones/tiviplay/contexto", "/operaciones/tiviplay/runtime",
  "/operaciones/tiviplay/manuales", "/operaciones/tiviplay/conciliacion", "/operaciones/tiviplay/atencion", "/operaciones/tiviplay/turno", "/acceso-denegado",
]);
export function allowed(role: Role, pathname: string, method = "GET") {
  if (role === "ADMIN") return true;
  if (method === "POST") return pathname === "/api/auth/logout" || pathname === "/api/operations/tiviplay/conciliacion/task"
    // Búsqueda de clientes: lectura, POST solo para que la consulta no viaje en la URL.
    || pathname === "/api/operations/tiviplay/clientes/buscar"
    || pathname === "/api/operations/tiviplay/clientes/credencial";
  if (method !== "GET" && method !== "HEAD") return false;
  return operatorPages.has(pathname) || /^\/operaciones\/tiviplay\/manuales\/[a-z0-9-]+$/.test(pathname)
    || pathname === "/api/operations/tiviplay/runtime" || pathname === "/api/operations/tiviplay/monthly-close";
}
