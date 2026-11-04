import { describe, expect, it } from "vitest";

import {
  abrirCaso, cambiarEstado, casosDeCliente, cerrarCaso, EVENTO_RESULTADOS, historialCaso, LIBRO_VACIO, RESULTADOS_RESOLUTIVOS, registrarEvento, verificarCliente,
  type Asesor, type CasoResult, type ClienteVerificado, type LibroCasos,
} from "./casos-model";

const asesor: Asesor = { id: "asesor1", name: "Asesor Ficticio", role: "OPERADOR" };
const direccion: Asesor = { id: "dir1", name: "Direccion Ficticia", role: "ADMIN" };
const cliente: ClienteVerificado = { baseRow: 40, usuario: "FICTICIO001", nombre: "Cliente Ficticio" };
const now = new Date("2026-11-04T18:30:00Z");
const evidencia = { fuente: "ZELLE (NOV)", referencia: "ZELLE (NOV)!12 CONFIRMADO JM" };

function ok<T>(result: CasoResult<T>) {
  if (!result.ok) throw new Error(result.error);
  return result;
}
const abrir = (libro: LibroCasos = LIBRO_VACIO, caseId = "CASO-0001", tipo: "COBRANZA" | "SOPORTE_TECNICO" = "COBRANZA") =>
  ok(abrirCaso(libro, { caseId, cliente, tipo, responsable: "Asesor Ficticio", proximaAccion: "Enviar recordatorio", now })).libro;
const evento = (libro: LibroCasos, eventId: string, resultado: (typeof EVENTO_RESULTADOS)[number], extra: { evidencia?: typeof evidencia; asesor?: Asesor; observacion?: string; accion?: string; caseId?: string } = {}) => registrarEvento(libro, {
  eventId, caseId: extra.caseId ?? "CASO-0001", asesor: extra.asesor ?? asesor, etapa: "CONTACTO", accion: extra.accion ?? "Mensaje por WhatsApp", resultado, observacion: extra.observacion, evidencia: extra.evidencia, now,
});
/** Caso con pago confirmado por Dirección y estado RESUELTO, listo para cerrar. */
function resuelto() {
  let libro = ok(evento(abrir(), "EVT-0001", "COMPROBANTE_RECIBIDO")).libro;
  libro = ok(cambiarEstado(libro, { eventId: "EVT-0002", caseId: "CASO-0001", estado: "EN_GESTION", asesor, now })).libro;
  libro = ok(evento(libro, "EVT-0003", "CONFIRMADO_JM_VERIFICADO", { asesor: direccion, evidencia })).libro;
  return ok(cambiarEstado(libro, { eventId: "EVT-0004", caseId: "CASO-0001", estado: "RESUELTO", asesor: direccion, now })).libro;
}

describe("casos", () => {
  it("1. crea un caso con cliente verificado, en hora de Bogotá", () => {
    const [caso] = abrir().casos;
    expect(caso).toMatchObject({ caseId: "CASO-0001", tipo: "COBRANZA", estado: "ABIERTO", responsable: "Asesor Ficticio", abiertoEn: "2026-11-04 13:30", cerradoEn: null, resolucion: null });
  });

  it("identifica por USUARIO único en BASE GENERAL, nunca por nombre", () => {
    const filas = [{ baseRow: 3, user: "U1", name: "Mismo Nombre" }, { baseRow: 4, user: "U2", name: "Mismo Nombre" }, { baseRow: 5, user: "U3", name: "A" }, { baseRow: 6, user: "u3", name: "B" }];
    expect(verificarCliente(filas, "U1")).toEqual({ baseRow: 3, usuario: "U1", nombre: "Mismo Nombre" });
    expect(verificarCliente(filas, "Mismo Nombre")).toBeNull();
    expect(verificarCliente(filas, "U3")).toBeNull();
    expect(verificarCliente(filas, "")).toBeNull();
    expect(abrirCaso(LIBRO_VACIO, { caseId: "CASO-0001", cliente: verificarCliente(filas, "U3"), tipo: "OTRO", responsable: "A", proximaAccion: "" })).toEqual({ ok: false, error: "CLIENTE_NO_VERIFICADO" });
  });

  it("2. registra dos eventos en un caso y conserva el historial", () => {
    const uno = ok(evento(abrir(), "EVT-0001", "MENSAJE_ENVIADO")).libro;
    const dos = ok(evento(uno, "EVT-0002", "SIN_RESPUESTA", { observacion: "Sin lectura" })).libro;
    expect(historialCaso(dos, "CASO-0001").map((e) => [e.eventId, e.resultado, e.fecha, e.asesor])).toEqual([
      ["EVT-0001", "MENSAJE_ENVIADO", "2026-11-04 13:30", "Asesor Ficticio"],
      ["EVT-0002", "SIN_RESPUESTA", "2026-11-04 13:30", "Asesor Ficticio"],
    ]);
    expect(historialCaso(uno, "CASO-0001")).toHaveLength(1);
  });

  it("3. actualiza el estado y deja constancia en el historial", () => {
    const { libro, valor } = ok(cambiarEstado(abrir(), { eventId: "EVT-0001", caseId: "CASO-0001", estado: "ESPERANDO_CLIENTE", asesor, proximaAccion: "Llamar mañana", now }));
    expect(valor).toMatchObject({ estado: "ESPERANDO_CLIENTE", proximaAccion: "Llamar mañana" });
    expect(historialCaso(libro, "CASO-0001")[0]).toMatchObject({ accion: "ABIERTO -> ESPERANDO_CLIENTE", resultado: "ESTADO_ACTUALIZADO" });
    expect(cambiarEstado(abrir(), { eventId: "EVT-0001", caseId: "CASO-0001", estado: "RESUELTO", asesor })).toEqual({ ok: false, error: "TRANSICION_INVALIDA" });
  });

  it("4. cierra con evidencia y una resolución verificable", () => {
    const { libro, valor } = ok(cerrarCaso(resuelto(), { eventId: "EVT-0005", caseId: "CASO-0001", asesor: direccion, detalle: "Pago confirmado por Dirección", evidencia, now }));
    expect(valor).toMatchObject({ estado: "CERRADO", cerradoEn: "2026-11-04 13:30", resolucion: { eventId: "EVT-0003", resultado: "CONFIRMADO_JM_VERIFICADO" } });
    expect(historialCaso(libro, "CASO-0001").map((e) => e.resultado)).toEqual(["COMPROBANTE_RECIBIDO", "ESTADO_ACTUALIZADO", "CONFIRMADO_JM_VERIFICADO", "ESTADO_ACTUALIZADO", "CASO_CERRADO"]);
    expect(evento(libro, "EVT-0006", "MENSAJE_ENVIADO")).toEqual({ ok: false, error: "CASO_CERRADO" });
    expect(cambiarEstado(libro, { eventId: "EVT-0006", caseId: "CASO-0001", estado: "EN_GESTION", asesor })).toEqual({ ok: false, error: "CASO_CERRADO" });
  });

  it("5. rechaza duplicados y un EVENT_ID usado en otra acción", () => {
    const libro = ok(evento(abrir(), "EVT-0001", "MENSAJE_ENVIADO")).libro;
    expect(evento(libro, "EVT-0001", "MENSAJE_ENVIADO")).toEqual({ ok: false, error: "EVENTO_DUPLICADO" });
    expect(evento(libro, "EVT-0001", "SIN_RESPUESTA")).toEqual({ ok: false, error: "EVENT_ID_REUTILIZADO" });
    expect(evento(abrir(libro, "CASO-0002"), "EVT-0001", "MENSAJE_ENVIADO", { caseId: "CASO-0002" })).toEqual({ ok: false, error: "EVENT_ID_REUTILIZADO" });
    expect(abrirCaso(libro, { caseId: "CASO-0001", cliente, tipo: "OTRO", responsable: "A", proximaAccion: "" })).toEqual({ ok: false, error: "CASE_ID_DUPLICADO" });
    expect(historialCaso(libro, "CASO-0001")).toHaveLength(1);
  });

  it("6. bloquea cierres sin evidencia o sin resolución", () => {
    const base = { eventId: "EVT-0009", caseId: "CASO-0001", asesor: direccion, detalle: "Cierre" };
    expect(cerrarCaso(resuelto(), { ...base, evidencia: null })).toEqual({ ok: false, error: "SIN_EVIDENCIA" });
    expect(cerrarCaso(resuelto(), { ...base, evidencia: { fuente: " ", referencia: " " } })).toEqual({ ok: false, error: "SIN_EVIDENCIA" });
    expect(cerrarCaso(resuelto(), { ...base, detalle: "  ", evidencia })).toEqual({ ok: false, error: "SIN_RESOLUCION_VERIFICABLE" });
    expect(cerrarCaso(abrir(), { ...base, evidencia })).toEqual({ ok: false, error: "SIN_RESOLUCION_VERIFICABLE" });
    expect(cambiarEstado(resuelto(), { eventId: "EVT-0009", caseId: "CASO-0001", estado: "CERRADO", asesor: direccion })).toEqual({ ok: false, error: "TRANSICION_INVALIDA" });
  });

  it("7. un cliente puede tener dos casos independientes", () => {
    const libro = ok(evento(abrir(abrir(), "CASO-0002", "SOPORTE_TECNICO"), "EVT-0001", "MENSAJE_ENVIADO", { caseId: "CASO-0002" })).libro;
    expect(casosDeCliente(libro, "ficticio001").map((c) => [c.caseId, c.tipo])).toEqual([["CASO-0001", "COBRANZA"], ["CASO-0002", "SOPORTE_TECNICO"]]);
    expect(historialCaso(libro, "CASO-0001")).toEqual([]);
    expect(historialCaso(libro, "CASO-0002")).toHaveLength(1);
  });

  it("8. no toca las capas financiera ni técnica", () => {
    const ficha = Object.freeze({ tc: "1", estado: "Por vencer", observaciones: "nota", confirmacion: "", cliente_key: "X", usd: 15, panel: "PANEL 1", credito: 0, vencimiento: "2026-12-01" });
    const copia = JSON.stringify(ficha);
    const libro = ok(cerrarCaso(resuelto(), { eventId: "EVT-0005", caseId: "CASO-0001", asesor: direccion, detalle: "Fin", evidencia })).libro;
    expect(JSON.stringify(ficha)).toBe(copia);
    expect(Object.keys(libro.casos[0].cliente).sort()).toEqual(["baseRow", "nombre", "usuario"]);
    expect(Object.keys(libro.casos[0])).not.toEqual(expect.arrayContaining(["pago", "credito", "panel", "vencimiento"]));
    expect(Object.keys(libro.eventos[0])).not.toEqual(expect.arrayContaining(["pago", "credito", "panel", "vencimiento"]));
  });
});

describe("reglas de negocio", () => {
  it("enviar un mensaje no cierra ni cambia el caso", () => {
    const libro = ok(evento(ok(cambiarEstado(abrir(), { eventId: "EVT-0001", caseId: "CASO-0001", estado: "EN_GESTION", asesor })).libro, "EVT-0002", "MENSAJE_ENVIADO")).libro;
    expect(libro.casos[0]).toMatchObject({ estado: "EN_GESTION", cerradoEn: null, resolucion: null });
  });

  it("COMPROBANTE_RECIBIDO no equivale a CONFIRMADO JM", () => {
    const libro = ok(cambiarEstado(ok(evento(abrir(), "EVT-0001", "COMPROBANTE_RECIBIDO", { evidencia })).libro, { eventId: "EVT-0002", caseId: "CASO-0001", estado: "EN_GESTION", asesor })).libro;
    expect(RESULTADOS_RESOLUTIVOS).not.toContain("COMPROBANTE_RECIBIDO");
    expect(cambiarEstado(libro, { eventId: "EVT-0003", caseId: "CASO-0001", estado: "RESUELTO", asesor })).toEqual({ ok: false, error: "SIN_RESOLUCION_VERIFICABLE" });
  });

  it("solo Dirección registra CONFIRMADO JM y siempre con evidencia", () => {
    expect(evento(abrir(), "EVT-0001", "CONFIRMADO_JM_VERIFICADO", { evidencia })).toEqual({ ok: false, error: "CONFIRMACION_NO_AUTORIZADA" });
    expect(evento(abrir(), "EVT-0001", "CONFIRMADO_JM_VERIFICADO", { asesor: direccion })).toEqual({ ok: false, error: "SIN_EVIDENCIA" });
  });

  it("una alerta de liberación no suspende el servicio", () => {
    const libro = ok(evento(abrir(), "EVT-0001", "ALERTA_LIBERACION")).libro;
    expect(libro.casos[0].estado).toBe("ABIERTO");
    expect(RESULTADOS_RESOLUTIVOS).not.toContain("ALERTA_LIBERACION");
    expect(EVENTO_RESULTADOS.filter((r) => /SUSPEND/.test(r))).toEqual([]);
  });

  it("el historial no se altera y rechaza credenciales", () => {
    const antes = abrir();
    const foto = JSON.stringify(antes);
    ok(evento(antes, "EVT-0001", "MENSAJE_ENVIADO"));
    expect(JSON.stringify(antes)).toBe(foto);
    expect(evento(antes, "EVT-0001", "MENSAJE_ENVIADO", { observacion: "contraseña 1234" })).toEqual({ ok: false, error: "TEXTO_SENSIBLE" });
  });

  it("demostración: caso ficticio con dos eventos y cierre", () => {
    let libro = abrir();
    libro = ok(evento(libro, "EVT-1001", "MENSAJE_ENVIADO")).libro;
    libro = ok(evento(libro, "EVT-1002", "COMPROBANTE_RECIBIDO", { evidencia: { fuente: "WhatsApp", referencia: "Comprobante ficticio 1" } })).libro;
    libro = ok(cambiarEstado(libro, { eventId: "EVT-1003", caseId: "CASO-0001", estado: "EN_GESTION", asesor, now })).libro;
    libro = ok(evento(libro, "EVT-1004", "CONFIRMADO_JM_VERIFICADO", { asesor: direccion, evidencia })).libro;
    libro = ok(cambiarEstado(libro, { eventId: "EVT-1005", caseId: "CASO-0001", estado: "RESUELTO", asesor: direccion, now })).libro;
    libro = ok(cerrarCaso(libro, { eventId: "EVT-1006", caseId: "CASO-0001", asesor: direccion, detalle: "Pago verificado en la fuente", evidencia, now })).libro;
    if (process.env.CASOS_DEMO) console.log(JSON.stringify({ caso: libro.casos[0], eventos: libro.eventos.map((e) => [e.eventId, e.resultado, e.asesor]) }, null, 1));
    expect(libro.casos[0].estado).toBe("CERRADO");
    expect(historialCaso(libro, "CASO-0001")).toHaveLength(6);
  });
});
