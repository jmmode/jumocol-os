import { describe, expect, it } from "vitest";
import { buildRuntimeReadModel } from "./runtime-read-model";
import { buildClientDirectory, buildWorkday } from "./workday-model";

// Caso sintético equivalente al contrato vivo de noviembre: una confirmación JM de Zelle
// no debe transformar la cartera ni el servicio, pero sí impedir un segundo cobro normal.
const BASE = ["TC", "CLIENTE", "ESTADO", "USUARIO", "PANEL", "F. PRÓXIMO PAGO"];
const CARTERA = ["TC", "CLIENTE", "ESTADO", "OBSERVACIONES GESTION", "USD", "MÉTODO DE PAGO",
  "USUARIO", "F. PRÓXIMO PAGO", "ORIGEN BASE", "CLASIFICACION_BORRADOR", "ESTADO_COBRO"];
const ZELLE = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION"];
const makeRow = (header: string[], fields: Record<string, string>) => header.map((h) => fields[h] ?? "");

function scenario(options: { confirmation?: string; amount?: string; method?: string; duplicateBase?: boolean; name?: string } = {}) {
  const name = options.name ?? "Cliente Ejemplo";
  const base = [
    ["", "BASE GENERAL"], BASE, [""],
    makeRow(BASE, { TC: "1", CLIENTE: name, ESTADO: "Vencido", USUARIO: "USUARIO01", PANEL: "PANEL 1", "F. PRÓXIMO PAGO": "02-11-26" }),
    ...(options.duplicateBase ? [makeRow(BASE, { TC: "1", CLIENTE: name, USUARIO: "USUARIO02" })] : []),
  ];
  const cartera = [
    ["", "PAGOS NOVIEMBRE 2026"], [""], CARTERA, [""],
    makeRow(CARTERA, { TC: "1", CLIENTE: name, ESTADO: "Por vencer",
      "OBSERVACIONES GESTION": "02/11 mensaje anterior\n2026-11-04 14:00 | Jorge | SIN_RESPUESTA [JOS:1234]",
      USD: "15", "MÉTODO DE PAGO": options.method ?? "ZELLE", USUARIO: "USUARIO01",
      "F. PRÓXIMO PAGO": "02-11-26", "ORIGEN BASE": "BASE GENERAL!4",
      CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE" }),
  ];
  const zelle = [
    [], ["", "ZELLE NOVIEMBRE"], ZELLE,
    makeRow(ZELLE, { TC: "1", Cliente: name, "Monto Recibido": options.amount ?? "$15",
      Fecha: "02-11-26", Asesor: "Jorge", CONFIRMACION: options.confirmation ?? "CONFIRMADO JM" }),
  ];
  const values = { "BASE GENERAL": base, "PAGOS NOVIEMBRE 2026": cartera, "ZELLE (NOV)": zelle };
  const sheets = Object.keys(values).map((title) => ({ title }));
  const model = buildRuntimeReadModel({ values, sheets, today: "2026-11-04" });
  const directory = buildClientDirectory(values, ["BASE GENERAL", "PAGOS NOVIEMBRE 2026"]);
  return { model, workday: buildWorkday({ model, directory, credits: null }) };
}

describe("conciliación de pagos CONFIRMADO JM frente a cartera", () => {
  it("separa pago confirmado y cartera desactualizada sin ofrecer otro cobro", () => {
    const { model, workday } = scenario();
    expect(model.payments.month).toHaveLength(1);
    expect(model.payments.month[0].confirmation).toBe("CONFIRMADO");
    expect(model.operations.items[0].state).toBe("SIN_PAGO"); // Nunca mutar la fuente financiera.
    expect(workday.queue).toEqual([]);
    expect(workday.reconciliation[0].nextAction).toContain("NO COBRAR");
    expect(workday.reconciliation[0].nextAction).toContain("ZELLE (NOV)!4");
    expect(workday.reconciliation[0].suggestedFicha).toBe("A3");
    expect(workday.toCollectToday.USD).toBe(0);
    expect(workday.exceptions.some((x) => x.type === "PAGO_CONFIRMADO_NO_SINCRONIZADO")).toBe(true);
    expect(model.operations.items[0].note).toContain("SIN_RESPUESTA");
  });

  it("no suprime un cobro si no existe CONFIRMADO JM", () => {
    const { workday } = scenario({ confirmation: "PENDIENTE CONFIRMACION" });
    expect(workday.queue[0].lane).toBe("COBRAR");
    expect(workday.toCollectToday.USD).toBe(15);
  });

  it("no cruza valores, métodos ni identidades ambiguas", () => {
    for (const scenarioOptions of [{ amount: "$20" }, { method: "PAYPAL" }, { duplicateBase: true }]) {
      const { workday } = scenario(scenarioOptions);
      expect(workday.queue[0].lane).toBe("COBRAR");
      expect(workday.toCollectToday.USD).toBe(15);
    }
  });
});
