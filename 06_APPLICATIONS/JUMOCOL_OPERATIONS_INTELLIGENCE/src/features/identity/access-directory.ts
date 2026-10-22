// JUMOCOL OS — Accesos. Directorio para Dirección con rutas REALES de la app (verificadas por prueba contra src/app).
// Sin contraseñas, tokens ni credenciales: solo rutas relativas y el origen canónico vigente (JUMOCOL_APP_ORIGIN).

export type AccessAudience = "Todos" | "Dirección (ADMIN)" | "Operador";
export type AccessEntry = { label: string; path: string; audience: AccessAudience; purpose: string };

export const ACCESS_DIRECTORY: ReadonlyArray<AccessEntry> = [
  { label: "Ingreso (login)", path: "/login", audience: "Todos", purpose: "Única pantalla de ingreso para Dirección y operadores. Tras ingresar, ADMIN llega a la intranet principal y OPERADOR a TiviPlay." },
  { label: "Activar contraseña", path: "/activar", audience: "Todos", purpose: "El titular define su contraseña con el enlace de activación que genera Dirección en Usuarios." },
  { label: "Intranet principal", path: "/", audience: "Dirección (ADMIN)", purpose: "Visión general y todas las áreas." },
  { label: "Administración · Usuarios", path: "/administracion/usuarios", audience: "Dirección (ADMIN)", purpose: "Crear operadores, activar, restablecer o desactivar accesos." },
  { label: "Administración · Auditoría", path: "/administracion/auditoria", audience: "Dirección (ADMIN)", purpose: "Registro de ingresos y acciones." },
  { label: "Administración · Biblioteca", path: "/administracion/biblioteca", audience: "Dirección (ADMIN)", purpose: "Revisión del inventario documental." },
  { label: "Operador · TiviPlay", path: "/operaciones/tiviplay", audience: "Operador", purpose: "Pantalla de llegada del operador." },
  { label: "Operador · HOY", path: "/operaciones/tiviplay/hoy", audience: "Operador", purpose: "Lista de clientes a gestionar en el día." },
  { label: "Operador · Manuales y procesos", path: "/operaciones/tiviplay/manuales", audience: "Operador", purpose: "Manuales publicados, guía rápida de turno y búsqueda." },
];

export type RemoteAccessStatus = { label: string; status: string; detail: string };

/** Estado del acceso remoto privado según la configuración vigente del equipo de Dirección (no se infiere de la red). */
export const PRIVATE_REMOTE_ACCESS: RemoteAccessStatus = {
  label: "Acceso privado remoto (Tailscale / MagicDNS)",
  status: "NO VIGENTE",
  detail: "Tailscale Serve se retiró el 21/10/2026 por decisión de Dirección. Los operadores ingresan por la red local. Funnel no se usa: la intranet no está publicada en Internet.",
};

/** Origen canónico vigente; null si no está configurado (entonces solo se muestran rutas relativas). */
export function canonicalOrigin(value = process.env.JUMOCOL_APP_ORIGIN): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}
