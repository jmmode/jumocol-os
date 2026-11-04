/** Estados de GESTIÓN, nunca estados de conciliación o de servicio. */
export const GESTION_ESTADOS = [
  "MENSAJE_ENVIADO",
  "SIN_RESPUESTA",
  "COMPROMISO_PAGO",
  "COMPROBANTE_RECIBIDO",
] as const;
export type GestionEstado = (typeof GESTION_ESTADOS)[number];

export const GESTION_ETIQUETAS: Record<GestionEstado, string> = {
  MENSAJE_ENVIADO: "Mensaje enviado",
  SIN_RESPUESTA: "Sin respuesta",
  COMPROMISO_PAGO: "Compromiso de pago",
  COMPROBANTE_RECIBIDO: "Comprobante recibido",
};

export function isGestionEstado(value: unknown): value is GestionEstado {
  return typeof value === "string" && GESTION_ESTADOS.includes(value as GestionEstado);
}

/** El detalle va a una hoja compartida: nunca debe llevar credenciales. */
export function mentionsSecret(input: string) {
  return /contrase[nñ]a|password|clave\s*[:=]/i.test(input);
}

export function cleanGestionDetail(input: string) {
  return input.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 220);
}

export function gestionEntry(
  estado: GestionEstado,
  asesor: string,
  detalle: string,
  requestId: string,
  now = new Date(),
) {
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(now);
  const safeActor = cleanGestionDetail(asesor).slice(0, 70) || "ASESOR AUTENTICADO";
  const safeDetail = cleanGestionDetail(detalle);
  return `${stamp} | ${safeActor} | ${estado}${safeDetail ? ` | ${safeDetail}` : ""} [JOS:${requestId}]`;
}

/** Append-only: respeta todo el historial libre que ya utiliza el equipo. */
export function appendGestion(previous: string, entry: string) {
  return previous ? `${previous.replace(/\s+$/, "")}\n${entry}` : entry;
}

export type GestionRegistrada = { at: string; actor: string; estado: GestionEstado; detail: string };

/** Solo las líneas escritas por JUMOCOL OS: el texto libre del equipo no se interpreta. */
export function parseGestiones(cell: string): GestionRegistrada[] {
  return cell.split(/\r?\n/).flatMap((line) => {
    const m = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \| (.+?) \| ([A-Z_]+)(?: \| (.*?))? \[JOS:[a-f0-9-]{36}\]$/);
    return m && isGestionEstado(m[3]) ? [{ at: m[1], actor: m[2], estado: m[3], detail: m[4] ?? "" }] : [];
  });
}
