/** Estados de GESTIÓN, nunca estados de conciliación o de servicio. */
export const GESTION_ESTADOS = [
  "MENSAJE_ENVIADO",
  "SIN_RESPUESTA",
  "COMPROMISO_PAGO",
  "COMPROBANTE_RECIBIDO",
] as const;
export type GestionEstado = (typeof GESTION_ESTADOS)[number];

/** Catálogo SOP v0.3. La etapa es una sugerencia; solo un resultado confirmado es gestión. */
export const GESTION_ETAPAS = [
  { id: "A+30", label: "A+30 AL DIA", action: "Registrar situación comercial al día (clasificación manual)", channel: "Registro", template: null },
  { id: "A<25", label: "A<25 POR VENCER", action: "Registrar situación comercial por vencer (clasificación manual)", channel: "Registro", template: null },
  { id: "D-5", label: "D−5", action: "Recordatorio y beneficio vigente", channel: "WhatsApp", template: "D-5" },
  { id: "D-4", label: "D−4", action: "Llamada de refuerzo; guion pendiente", channel: "Llamada", template: null },
  { id: "D-3", label: "D−3", action: "Imagen del beneficio; recurso autorizado pendiente", channel: "WhatsApp", template: null },
  { id: "D-2", label: "D−2", action: "Datos de pago del método verificado", channel: "WhatsApp o llamada", template: "D-2" },
  { id: "D-1", label: "D−1", action: "Aviso de suspensión; no desactivar", channel: "WhatsApp o llamada", template: "D-1" },
  { id: "D0", label: "D0", action: "Verificar ciclo y generar alerta de revisión cuando corresponda", channel: "Validación", template: null },
  { id: "S0", label: "S0", action: "Retención 1 solo tras liberación real comprobada en panel", channel: "WhatsApp o llamada", template: "D0" },
  { id: "S+2", label: "S+2", action: "Retención 2 si continúa liberado y sin pago confirmado", channel: "WhatsApp", template: "D+" },
  { id: "S+5", label: "S+5", action: "Candidato a promoción; oferta y elegibilidad pendientes", channel: "Revisión", template: null },
] as const;
export type GestionEtapa = (typeof GESTION_ETAPAS)[number]["id"];

/** Contrato único del menú F de BASE GENERAL: etapa confirmada, nunca etapa sugerida. */
export const GESTION_F_ETIQUETAS: Record<GestionEtapa, string> = {
  "A+30": "A+30 AL DIA",
  "A<25": "A<25 POR VENCER",
  "D-5": "D−5: recordatorio",
  "D-4": "D−4: llamada",
  "D-3": "D−3: imagen",
  "D-2": "D−2: datos de pago",
  "D-1": "D−1: alerta de suspensión",
  D0: "D0: verificar pago",
  S0: "S0: liberación confirmada / retención 1",
  "S+2": "S+2: retención 2",
  "S+5": "S+5: candidato promocional",
};

/** El servidor nunca confía en una etapa enviada suelta: la extrae del evento SOP. */
export function etapaRegistradaEnDetalle(detail: string): GestionEtapa | null {
  const match = /^SOP:(A\+30|A<25|D-[1-5]|D0|S0|S\+2|S\+5);/.exec(detail);
  const stage = match?.[1] as GestionEtapa | undefined;
  return stage && Object.prototype.hasOwnProperty.call(GESTION_F_ETIQUETAS, stage) ? stage : null;
}


/** A+30 y A<25 son etiquetas manuales: NO alteran el cálculo vigente de ESTADO en BASE GENERAL!E. */

export function etapaSugerida(nextPayment: string | null, today: string, s0Date?: string | null): GestionEtapa | null {
  const day = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(`${value}T00:00:00Z`) : NaN;
  const now = day(today);
  if (!Number.isFinite(now)) return null;
  if (s0Date) {
    const elapsed = Math.round((now - day(s0Date)) / 86_400_000);
    if (elapsed >= 5) return "S+5";
    if (elapsed >= 2) return "S+2";
    if (elapsed >= 0) return "S0";
  }
  if (!nextPayment) return null;
  const until = Math.round((day(nextPayment) - now) / 86_400_000);
  return until >= 0 && until <= 5 ? (`D-${until}` === "D-0" ? "D0" : `D-${until}`) as GestionEtapa : until < 0 ? "D0" : null;
}

/** Gates de la interfaz. No ejecutan acciones técnicas ni certifican el panel. */
export function bloqueoEtapa(etapa: GestionEtapa, input: {
  releaseAlert: boolean; paymentConfirmed: boolean; panel: string;
  s0Date: string | null; hasMessage: boolean;
}): string | null {
  // D0 sí permite registrar la verificación de pago; NO acredita suspensión ni liberación técnica.
  if (etapa === "S+5") return "La oferta y elegibilidad promocional siguen pendientes de aprobación.";
  if (etapa === "S0" && (!input.releaseAlert || input.paymentConfirmed || /PANEL\s*3/i.test(input.panel)))
    return "La liberación requiere revisión del ciclo y del panel; esta ficha no habilita una acción técnica.";
  if (etapa === "S+2" && (!input.s0Date || input.paymentConfirmed))
    return "No hay S0 previo comprobable o existe pago confirmado del ciclo.";
  if (etapa === "D-3" && !input.hasMessage) return "No hay imagen autorizada publicada para esta etapa.";
  if (etapa === "D-2" && !input.hasMessage) return "El método o los datos de pago no están verificados.";
  return null;
}

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

/** Fecha y hora de Bogotá en el formato de las gestiones. */
export function bogotaStamp(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(now);
}

export function gestionEntry(
  estado: GestionEstado,
  asesor: string,
  detalle: string,
  requestId: string,
  now = new Date(),
) {
  const stamp = bogotaStamp(now);
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
