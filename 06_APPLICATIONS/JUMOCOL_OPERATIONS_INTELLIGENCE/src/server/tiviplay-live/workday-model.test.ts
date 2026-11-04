import { describe, expect, it } from "vitest";

import { buildRuntimeReadModel } from "@/server/tiviplay-live/runtime-read-model";
import { buildClientDirectory, buildWorkday, personalizeScript, searchDirectory } from "@/server/tiviplay-live/workday-model";

// Datos sintéticos con el contrato real de PAGOS NOVIEMBRE 2026 (sin ESTADO_FINANCIERO; CLASIFICACION_BORRADOR + ESTADO_COBRO).
const H = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO", "DISPOSITIVOS", "ORIGEN BASE", "CONFIRMACION_FINANCIERA", "CLASIFICACION_BORRADOR", "CATEGORIA", "ESTADO_COBRO"];
const row = (o: Record<string, string>) => H.map((h) => o[h] ?? "");
const cartera = [["", "PAGOS NOVIEMBRE 2026"], [""], H, ["", "SEMANA 1"],
  row({ TC: "1", CLIENTE: "Ana Prueba", TELEFONO: "1 (305) 555-0101", USD: "15", "MÉTODO DE PAGO": "ZELLE", USUARIO: "ANA01", PANEL: "PANEL 3", "F. PRÓXIMO PAGO": "02-11-26", "ORIGEN BASE": "BASE GENERAL!4", "CONFIRMACION_FINANCIERA": "CONFIRMADO JM", CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE" }),
  row({ TC: "1", CLIENTE: "Beto Prueba", TELEFONO: "1 (305) 555-0202", COP: "$32,900", USUARIO: "BETO02", "F. PRÓXIMO PAGO": "04-11-26", "ORIGEN BASE": "BASE GENERAL!5", CLASIFICACION_BORRADOR: "REQUIERE_REVISION", CATEGORIA: "TARIFA", ESTADO_COBRO: "EN REVISIÓN" }),
  row({ TC: "1", CLIENTE: "Caro Prueba", USD: "130", USUARIO: "CARO03", "F. PRÓXIMO PAGO": "07-11-26", "ORIGEN BASE": "BASE GENERAL!6", CLASIFICACION_BORRADOR: "BLOQUEADO", CATEGORIA: "TARIFA (P0-2)", ESTADO_COBRO: "BLOQUEADO" }),
  row({ TC: "1", CLIENTE: "Dani Prueba", USD: "25", USUARIO: "DANI04", "F. PRÓXIMO PAGO": "20-11-26", "ORIGEN BASE": "BASE GENERAL!7", CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE" }),
  ["8", "TOTAL SEMANA 1"],
];
const BH = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "USD", "COP", "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F. PRÓXIMO PAGO"];
const brow = (o: Record<string, string>) => BH.map((h) => o[h] ?? "");
const base = [["", "BASE GENERAL"], BH, [""],
  brow({ TC: "1", CLIENTE: "Ana Prueba", TELEFONO: "1 (305) 555-0101", ESTADO: "Vencido", "PLAN ACTIVO": "PLAN 1 MES", USD: "15", USUARIO: "ANA01", PANEL: "PANEL 3", "F. PRÓXIMO PAGO": "02-11-26" }),
  brow({ TC: "1", CLIENTE: "Beto Prueba", TELEFONO: "1 (305) 555-0202", ESTADO: "Al dia", USUARIO: "BETO02", "F. PRÓXIMO PAGO": "04-11-26" }),
  brow({ TC: "1", CLIENTE: "Caro Prueba", ESTADO: "Al dia", USUARIO: "CARO03", "F. PRÓXIMO PAGO": "07-11-26" }),
  brow({ TC: "1", CLIENTE: "Dani Prueba", ESTADO: "Al dia", USUARIO: "DANI04", "F. PRÓXIMO PAGO": "20-11-26" }),
];
const sheets = [{ title: "BASE GENERAL" }, { title: "PAGOS NOVIEMBRE 2026" }];
const values = { "BASE GENERAL": base, "PAGOS NOVIEMBRE 2026": cartera };

describe("puesto de trabajo · contrato de cartera noviembre", () => {
  const model = buildRuntimeReadModel({ sheets, values, today: "2026-11-04" });
  const directory = buildClientDirectory(values, ["BASE GENERAL", "PAGOS NOVIEMBRE 2026"]);
  const w = buildWorkday({ model, credits: null, directory });

  it("no marca la cartera de noviembre como excepción de estructura ni toma CONFIRMACION_FINANCIERA del ciclo anterior como pago", () => {
    expect(model.operations.items.map((i) => i.state)).toEqual(["SIN_PAGO", "SIN_PAGO", "SIN_PAGO", "SIN_PAGO"]);
    expect(model.operations.exceptions).toEqual([]);
  });

  it("arma la cola del día por grupo y carril, con importes por moneda separados", () => {
    expect(w.queue.map((q) => [q.client, q.bucket, q.lane, q.suggestedFicha])).toEqual([
      ["Ana Prueba", "VENCIDO", "COBRAR", "A1"],
      ["Beto Prueba", "HOY", "VERIFICAR", "A6"],
    ]);
    // Semana operativa del motor: 01–04 termina hoy; el 07/11 cae en la semana 05–11 (resto del mes).
    expect(w.later).toBe(2);
    expect(w.lanes.BLOQUEADO.count).toBe(1);
    expect(w.toCollectToday).toEqual({ USD: 15, COP: 0, CAD: 0 });
    expect(w.lanes.VERIFICAR.amount.COP).toBe(32900);
    expect(w.credits.status).toBe("BLOQUEADO");
    expect(w.blockers.some((b) => b.startsWith("Créditos BLOQUEADO"))).toBe(true);
  });

  it("enlaza cola y directorio por la fila de BASE (teléfono y usuario) con identificador opaco", () => {
    expect(w.queue[0].phone).toBe("1 (305) 555-0101");
    expect(w.queue[0].user).toBe("ANA01");
    expect(w.queue[0].id).toMatch(/^[a-f0-9]{16}$/);
    expect(directory.find((d) => d.id === w.queue[0].id)?.name).toBe("Ana Prueba");
  });

  it("busca por usuario, teléfono y nombre; reporta coincidencias múltiples", () => {
    expect(searchDirectory(directory, "beto02").map((m) => [m.entry.name, m.by])).toEqual([["Beto Prueba", "USUARIO"]]);
    expect(searchDirectory(directory, "555-0101").map((m) => m.by)).toEqual(["TELÉFONO"]);
    expect(searchDirectory(directory, "prueba").length).toBe(4);
    expect(searchDirectory(directory, "ab")).toEqual([]);
  });

  it("el directorio nunca contiene contraseña ni correo", () => {
    const withSecret = { ...values, "BASE GENERAL": base.map((r, i) => (i > 2 ? r.map((c, j) => (BH[j] === "CONTRASEÑA" ? "PW-SENTINEL" : BH[j] === "CORREO" ? "x@y.z" : c)) : r)) };
    const json = JSON.stringify(buildClientDirectory(withSecret, ["BASE GENERAL"]));
    expect(json).not.toContain("PW-SENTINEL");
    expect(json).not.toContain("x@y.z");
  });

  it("personaliza el script solo con valores confirmados", () => {
    const r = personalizeScript("Hola [NOMBRE], te saluda [ASESOR]. Vence el [FECHA].", { NOMBRE: "Ana", ASESOR: "Jorge", FECHA: null });
    expect(r.text).toBe("Hola Ana, te saluda Jorge. Vence el [FECHA].");
    expect(r.pending).toBe(1);
  });
});
