import { describe, expect, it } from "vitest";
import { appendGestion, cleanGestionDetail, gestionEntry, isGestionEstado } from "./gestion-model";

describe("registro de gestión (columna F)", () => {
  it("solo acepta los cuatro resultados de gestión, no aprobación financiera", () => {
    for (const s of ["MENSAJE_ENVIADO", "SIN_RESPUESTA", "COMPROMISO_PAGO", "COMPROBANTE_RECIBIDO"]) expect(isGestionEstado(s)).toBe(true);
    for (const s of ["CONFIRMADO_JM", "PAGO_CONFIRMADO", "CREDITO_OTORGADO", "SIN_GESTION", ""]) expect(isGestionEstado(s)).toBe(false);
  });
  it("preserva literalmente las observaciones previas al anexar", () => {
    const old = "02/11(J) YA PAGÓ - 01 NOVIEMBRE";
    const item = "2026-11-04 12:40 | asesor | MENSAJE_ENVIADO [JOS:abc]";
    expect(appendGestion(old, item)).toBe(old + "\n" + item);
    expect(appendGestion("", item)).toBe(item);
  });
  it("no permite introducir líneas independientes ni más de 220 caracteres en el detalle", () => {
    expect(cleanGestionDetail("Cliente\nPAGADO\t confirmado")).toBe("Cliente PAGADO confirmado");
    expect(cleanGestionDetail("x".repeat(500))).toHaveLength(220);
  });
  it("registra la hora de Bogotá y el asesor en una entrada rastreable", () => {
    const s = gestionEntry("COMPROMISO_PAGO", "Operador Prueba", "promete pagar el viernes", "a1b2c3", new Date("2026-11-04T17:00:00Z"));
    expect(s).toContain("2026-11-04 12:00 | Operador Prueba | COMPROMISO_PAGO | promete pagar el viernes");
    expect(s).toContain("[JOS:a1b2c3]");
  });
});
