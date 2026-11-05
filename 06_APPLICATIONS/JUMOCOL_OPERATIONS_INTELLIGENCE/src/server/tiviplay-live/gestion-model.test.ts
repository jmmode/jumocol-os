import { describe, expect, it } from "vitest";
import { appendGestion, bloqueoEtapa, cleanGestionDetail, etapaSugerida, GESTION_ETAPAS, gestionEntry, isGestionEstado } from "./gestion-model";

describe("registro de gestión (columna F)", () => {
  it("mantiene un catálogo único de nueve etapas distintas de los resultados", () => {
    expect(GESTION_ETAPAS.map((s) => s.id)).toEqual(["D-5", "D-4", "D-3", "D-2", "D-1", "D0", "S0", "S+2", "S+5"]);
    expect(GESTION_ETAPAS.find((s) => s.id === "D0")?.template).toBeNull();
    expect(GESTION_ETAPAS.find((s) => s.id === "S+5")?.template).toBeNull();
  });
  it("sugiere D−5 y D0 desde vencimiento comercial, nunca supone suspensión", () => {
    expect(etapaSugerida("2026-11-10", "2026-11-05")).toBe("D-5");
    expect(etapaSugerida("2026-11-05", "2026-11-05")).toBe("D0");
    expect(etapaSugerida("2026-11-03", "2026-11-05")).toBe("D0");
    expect(etapaSugerida("2026-11-20", "2026-11-05")).toBeNull();
  });
  it("solo propone S0, S+2 y S+5 a partir de una fecha S0 recibida", () => {
    expect(etapaSugerida("2026-11-01", "2026-11-05")).toBe("D0");
    expect(etapaSugerida("2026-11-01", "2026-11-05", "2026-11-05")).toBe("S0");
    expect(etapaSugerida("2026-11-01", "2026-11-07", "2026-11-05")).toBe("S+2");
    expect(etapaSugerida("2026-11-01", "2026-11-10", "2026-11-05")).toBe("S+5");
  });
  it("D0 y S+5 no registran gestión; S0 y S+2 exigen sus gates", () => {
    const ready = { releaseAlert: true, paymentConfirmed: false, panel: "PANEL 1", s0Date: "2026-11-05", hasMessage: true };
    expect(bloqueoEtapa("D-5", ready)).toBeNull();
    expect(bloqueoEtapa("D0", ready)).toMatch(/solo genera una alerta/);
    expect(bloqueoEtapa("S0", { ...ready, releaseAlert: false })).toMatch(/requiere revisión/);
    expect(bloqueoEtapa("S0", { ...ready, panel: "PANEL 3" })).toMatch(/requiere revisión/);
    expect(bloqueoEtapa("S0", ready)).toBeNull();
    expect(bloqueoEtapa("S+2", { ...ready, s0Date: null })).toMatch(/No hay S0/);
    expect(bloqueoEtapa("S+2", { ...ready, paymentConfirmed: true })).toMatch(/pago confirmado/);
    expect(bloqueoEtapa("S+2", ready)).toBeNull();
    expect(bloqueoEtapa("S+5", ready)).toMatch(/pendientes de aprobación/);
  });
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
