// Motor de casos y eventos TiviPlay. Puro: sin E/S; ninguna función toca Sheets, pagos, créditos ni paneles.
// Cada operación devuelve un libro nuevo y nunca altera el anterior: el historial solo crece.
import { bogotaStamp, cleanGestionDetail, GESTION_ESTADOS, mentionsSecret } from "@/server/tiviplay-live/gestion-model";
import { canon } from "@/server/tiviplay-live/runtime-read-model";

export const CASO_TIPOS = ["COBRANZA", "SOPORTE_TECNICO", "RENOVACION", "OTRO"] as const;
export const CASO_ESTADOS = ["ABIERTO", "EN_GESTION", "ESPERANDO_CLIENTE", "ESCALADO", "RESUELTO", "CERRADO"] as const;
export const EVENTO_ETAPAS = ["CONTACTO", "DIAGNOSTICO", "SEGUIMIENTO", "ESCALAMIENTO", "RESOLUCION", "CIERRE"] as const;
// No existe un resultado de servicio suspendido: ALERTA_LIBERACION es solo un aviso operativo.
export const EVENTO_RESULTADOS = [
  ...GESTION_ESTADOS, "ALERTA_LIBERACION", "ESCALADO", "ESTADO_ACTUALIZADO",
  "CONFIRMADO_JM_VERIFICADO", "SERVICIO_RESTABLECIDO", "SOLICITUD_ATENDIDA", "CASO_CERRADO",
] as const;
/** Únicos resultados que permiten resolver un caso. COMPROBANTE_RECIBIDO no está aquí. */
export const RESULTADOS_RESOLUTIVOS = ["CONFIRMADO_JM_VERIFICADO", "SERVICIO_RESTABLECIDO", "SOLICITUD_ATENDIDA"] as const;

export type CasoTipo = (typeof CASO_TIPOS)[number];
export type CasoEstado = (typeof CASO_ESTADOS)[number];
export type EventoEtapa = (typeof EVENTO_ETAPAS)[number];
export type EventoResultado = (typeof EVENTO_RESULTADOS)[number];

const TRANSICIONES: Readonly<Record<CasoEstado, readonly CasoEstado[]>> = {
  ABIERTO: ["EN_GESTION", "ESPERANDO_CLIENTE", "ESCALADO"],
  EN_GESTION: ["ESPERANDO_CLIENTE", "ESCALADO", "RESUELTO"],
  ESPERANDO_CLIENTE: ["EN_GESTION", "ESCALADO", "RESUELTO"],
  ESCALADO: ["EN_GESTION", "RESUELTO"],
  RESUELTO: ["EN_GESTION", "CERRADO"],
  CERRADO: [],
};

export type ClienteVerificado = { baseRow: number; usuario: string; nombre: string };
export type Asesor = { id: string; name: string; role: "ADMIN" | "OPERADOR" };
export type Evidencia = { fuente: string; referencia: string };
export type Resolucion = { eventId: string; resultado: EventoResultado; detalle: string; evidencia: Evidencia };

export type Caso = {
  caseId: string;
  cliente: ClienteVerificado;
  tipo: CasoTipo;
  estado: CasoEstado;
  responsable: string;
  abiertoEn: string;
  actualizadoEn: string;
  proximaAccion: string;
  cerradoEn: string | null;
  resolucion: Resolucion | null;
};
export type Evento = {
  eventId: string;
  caseId: string;
  fecha: string;
  asesor: string;
  etapa: EventoEtapa;
  accion: string;
  resultado: EventoResultado;
  observacion: string;
  evidencia: Evidencia | null;
};
export type LibroCasos = { readonly casos: readonly Caso[]; readonly eventos: readonly Evento[] };

export type CasoError =
  | "CLIENTE_NO_VERIFICADO" | "CASE_ID_INVALIDO" | "CASE_ID_DUPLICADO" | "CASO_INEXISTENTE" | "CASO_CERRADO"
  | "EVENT_ID_INVALIDO" | "EVENTO_DUPLICADO" | "EVENT_ID_REUTILIZADO" | "DATOS_INVALIDOS" | "TEXTO_SENSIBLE"
  | "TRANSICION_INVALIDA" | "SIN_RESOLUCION_VERIFICABLE" | "SIN_EVIDENCIA" | "CONFIRMACION_NO_AUTORIZADA";
export type CasoResult<T> = { ok: true; libro: LibroCasos; valor: T } | { ok: false; error: CasoError };

export const LIBRO_VACIO: LibroCasos = { casos: [], eventos: [] };

const ID = /^[A-Za-z0-9-]{8,64}$/;
const fail = (error: CasoError) => ({ ok: false as const, error });
const includes = <T extends string>(list: readonly T[], value: unknown): value is T => list.includes(value as T);
const sensitive = (...texts: string[]) => texts.some(mentionsSecret);
const evidenciaValida = (e: Evidencia | null | undefined): e is Evidencia => !!e && cleanGestionDetail(e.fuente).length >= 3 && cleanGestionDetail(e.referencia).length >= 3;
const limpiarEvidencia = (e: Evidencia): Evidencia => ({ fuente: cleanGestionDetail(e.fuente), referencia: cleanGestionDetail(e.referencia) });
const buscar = (libro: LibroCasos, caseId: string) => libro.casos.find((c) => c.caseId === caseId);
const reemplazar = (libro: LibroCasos, caso: Caso) => libro.casos.map((c) => (c.caseId === caso.caseId ? caso : c));

/**
 * Identidad contra BASE GENERAL: exactamente una fila con ese USUARIO.
 * El nombre no acredita identidad; un usuario repetido o vacío no se resuelve aquí.
 */
export function verificarCliente(filasBase: ReadonlyArray<{ baseRow: number | null; user: string; name: string }>, usuario: string): ClienteVerificado | null {
  if (!canon(usuario)) return null;
  const filas = filasBase.filter((f) => canon(f.user) === canon(usuario));
  const fila = filas[0];
  return filas.length === 1 && fila.baseRow ? { baseRow: fila.baseRow, usuario: fila.user, nombre: fila.name } : null;
}

export function abrirCaso(libro: LibroCasos, input: { caseId: string; cliente: ClienteVerificado | null; tipo: CasoTipo; responsable: string; proximaAccion: string; now?: Date }): CasoResult<Caso> {
  if (!input.cliente) return fail("CLIENTE_NO_VERIFICADO");
  if (!ID.test(input.caseId)) return fail("CASE_ID_INVALIDO");
  if (buscar(libro, input.caseId)) return fail("CASE_ID_DUPLICADO");
  const responsable = cleanGestionDetail(input.responsable);
  if (!includes(CASO_TIPOS, input.tipo) || !responsable) return fail("DATOS_INVALIDOS");
  if (sensitive(input.proximaAccion)) return fail("TEXTO_SENSIBLE");
  const fecha = bogotaStamp(input.now);
  const caso: Caso = {
    caseId: input.caseId, cliente: { ...input.cliente }, tipo: input.tipo, estado: "ABIERTO", responsable, abiertoEn: fecha,
    actualizadoEn: fecha, proximaAccion: cleanGestionDetail(input.proximaAccion), cerradoEn: null, resolucion: null,
  };
  return { ok: true, libro: { casos: [...libro.casos, caso], eventos: libro.eventos }, valor: caso };
}

type EventoInput = { eventId: string; caseId: string; asesor: Asesor; etapa: EventoEtapa; accion: string; resultado: EventoResultado; observacion?: string; evidencia?: Evidencia | null; now?: Date };

/** Lo que define una acción. La fecha no cuenta: un reintento llega más tarde y sigue siendo la misma acción. */
const huella = (e: Pick<Evento, "caseId" | "asesor" | "etapa" | "accion" | "resultado" | "observacion" | "evidencia">) =>
  JSON.stringify([e.caseId, e.asesor, e.etapa, e.accion, e.resultado, e.observacion, e.evidencia]);

function construirEvento(libro: LibroCasos, input: EventoInput): CasoResult<Evento> {
  const caso = buscar(libro, input.caseId);
  if (!caso) return fail("CASO_INEXISTENTE");
  if (!ID.test(input.eventId)) return fail("EVENT_ID_INVALIDO");
  const accion = cleanGestionDetail(input.accion);
  const observacion = cleanGestionDetail(input.observacion ?? "");
  if (!includes(EVENTO_ETAPAS, input.etapa) || !includes(EVENTO_RESULTADOS, input.resultado) || !accion) return fail("DATOS_INVALIDOS");
  if (sensitive(accion, observacion, input.evidencia?.fuente ?? "", input.evidencia?.referencia ?? "")) return fail("TEXTO_SENSIBLE");
  const evidencia = input.evidencia ? (evidenciaValida(input.evidencia) ? limpiarEvidencia(input.evidencia) : null) : null;
  if (input.evidencia && !evidencia) return fail("SIN_EVIDENCIA");
  const evento: Evento = { eventId: input.eventId, caseId: input.caseId, fecha: bogotaStamp(input.now), asesor: cleanGestionDetail(input.asesor.name), etapa: input.etapa, accion, resultado: input.resultado, observacion, evidencia };
  const previo = libro.eventos.find((e) => e.eventId === input.eventId);
  if (previo) return fail(huella(previo) === huella(evento) ? "EVENTO_DUPLICADO" : "EVENT_ID_REUTILIZADO");
  if (caso.estado === "CERRADO") return fail("CASO_CERRADO");
  if (input.resultado === "CONFIRMADO_JM_VERIFICADO") {
    // La confirmación financiera es de Dirección: el motor solo registra lo que ya consta en la fuente.
    if (input.asesor.role !== "ADMIN") return fail("CONFIRMACION_NO_AUTORIZADA");
    if (!evidencia) return fail("SIN_EVIDENCIA");
  }
  return { ok: true, libro, valor: evento };
}

/** Registrar un evento nunca cambia el estado del caso: enviar un mensaje no lo cierra. */
export function registrarEvento(libro: LibroCasos, input: EventoInput): CasoResult<Evento> {
  const built = construirEvento(libro, input);
  if (!built.ok) return built;
  const caso = buscar(libro, input.caseId) as Caso;
  return { ok: true, libro: { casos: reemplazar(libro, { ...caso, actualizadoEn: built.valor.fecha }), eventos: [...libro.eventos, built.valor] }, valor: built.valor };
}

/** Último resultado resolutivo con evidencia del caso. */
function eventoResolutivo(libro: LibroCasos, caseId: string) {
  return historialCaso(libro, caseId).filter((e) => includes(RESULTADOS_RESOLUTIVOS, e.resultado) && e.evidencia).at(-1) ?? null;
}

export function cambiarEstado(libro: LibroCasos, input: { eventId: string; caseId: string; estado: CasoEstado; asesor: Asesor; observacion?: string; proximaAccion?: string; responsable?: string; now?: Date }): CasoResult<Caso> {
  const caso = buscar(libro, input.caseId);
  if (!caso) return fail("CASO_INEXISTENTE");
  if (!includes(CASO_ESTADOS, input.estado)) return fail("DATOS_INVALIDOS");
  // El cierre tiene su propia operación porque exige evidencia.
  if (input.estado === "CERRADO" || !TRANSICIONES[caso.estado].includes(input.estado)) return fail(caso.estado === "CERRADO" ? "CASO_CERRADO" : "TRANSICION_INVALIDA");
  if (input.estado === "RESUELTO" && !eventoResolutivo(libro, caso.caseId)) return fail("SIN_RESOLUCION_VERIFICABLE");
  if (sensitive(input.proximaAccion ?? "")) return fail("TEXTO_SENSIBLE");
  const evento = registrarEvento(libro, {
    eventId: input.eventId, caseId: caso.caseId, asesor: input.asesor, etapa: input.estado === "ESCALADO" ? "ESCALAMIENTO" : "SEGUIMIENTO",
    accion: `${caso.estado} -> ${input.estado}`, resultado: input.estado === "ESCALADO" ? "ESCALADO" : "ESTADO_ACTUALIZADO", observacion: input.observacion, now: input.now,
  });
  if (!evento.ok) return evento;
  const actualizado: Caso = {
    ...caso, estado: input.estado, actualizadoEn: evento.valor.fecha,
    proximaAccion: input.proximaAccion === undefined ? caso.proximaAccion : cleanGestionDetail(input.proximaAccion),
    responsable: input.responsable ? cleanGestionDetail(input.responsable) : caso.responsable,
  };
  return { ok: true, libro: { casos: reemplazar(evento.libro, actualizado), eventos: evento.libro.eventos }, valor: actualizado };
}

/** CERRADO exige caso resuelto, un evento resolutivo con evidencia y evidencia propia del cierre. */
export function cerrarCaso(libro: LibroCasos, input: { eventId: string; caseId: string; asesor: Asesor; detalle: string; evidencia: Evidencia | null; now?: Date }): CasoResult<Caso> {
  const caso = buscar(libro, input.caseId);
  if (!caso) return fail("CASO_INEXISTENTE");
  if (caso.estado === "CERRADO") return fail("CASO_CERRADO");
  if (!evidenciaValida(input.evidencia)) return fail("SIN_EVIDENCIA");
  const detalle = cleanGestionDetail(input.detalle);
  const resolutivo = eventoResolutivo(libro, caso.caseId);
  if (!detalle || !resolutivo) return fail("SIN_RESOLUCION_VERIFICABLE");
  if (caso.estado !== "RESUELTO") return fail("TRANSICION_INVALIDA");
  const evento = registrarEvento(libro, { eventId: input.eventId, caseId: caso.caseId, asesor: input.asesor, etapa: "CIERRE", accion: "Cierre del caso", resultado: "CASO_CERRADO", observacion: detalle, evidencia: input.evidencia, now: input.now });
  if (!evento.ok) return evento;
  const cerrado: Caso = {
    ...caso, estado: "CERRADO", actualizadoEn: evento.valor.fecha, cerradoEn: evento.valor.fecha, proximaAccion: "",
    resolucion: { eventId: resolutivo.eventId, resultado: resolutivo.resultado, detalle, evidencia: limpiarEvidencia(input.evidencia) },
  };
  return { ok: true, libro: { casos: reemplazar(evento.libro, cerrado), eventos: evento.libro.eventos }, valor: cerrado };
}

export function historialCaso(libro: LibroCasos, caseId: string): Evento[] {
  return libro.eventos.filter((e) => e.caseId === caseId);
}

export function casosDeCliente(libro: LibroCasos, usuario: string): Caso[] {
  return libro.casos.filter((c) => canon(c.cliente.usuario) === canon(usuario));
}
