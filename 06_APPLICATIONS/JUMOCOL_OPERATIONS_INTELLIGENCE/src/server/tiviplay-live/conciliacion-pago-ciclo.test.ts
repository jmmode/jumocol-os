import { describe, expect, it } from "vitest";

import { buildRuntimeReadModel } from "./runtime-read-model";
import { buildClientDirectory, buildWorkday } from "./workday-model";

// Regresión sintética del defecto de noviembre: pago Zelle CONFIRMADO JM sin enlace formal,
// cartera con referencias de octubre y BASE en Vencido. Nombres y usuarios ficticios.
const BASE = ["TC", "CLIENTE", "ESTADO", "USUARIO", "PANEL", "F. PRÓXIMO PAGO"];
const CARTERA = ["TC", "CLIENTE", "ESTADO", "PLAN ACTIVO", "USD", "MÉTODO DE PAGO", "USUARIO", "F. PRÓXIMO PAGO", "ORIGEN BASE", "FUENTE_FINANCIERA", "FILA_FUENTE", "CLASIFICACION_BORRADOR", "ESTADO_COBRO"];
const ZELLE = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "COINCIDENCIAS_BASE", "FILA_BASE", "ESTADO_ENLACE"];
const row = (header: string[], fields: Record<string, string>) => header.map((h) => fields[h] ?? "");

type Options = { amount?: string; method?: string; paid?: string; due?: string; confirmation?: string; link?: Record<string, string>; duplicate?: boolean; plan?: string };

function scenario(options: Options = {}) {
  const name = "Clienta Ficticia";
  const due = options.due ?? "02-11-26";
  const base = [["", "BASE GENERAL"], BASE, [""], row(BASE, { TC: "1", CLIENTE: name, ESTADO: "Vencido", USUARIO: "FICT001", PANEL: "PANEL 1", "F. PRÓXIMO PAGO": due }),
    ...(options.duplicate ? [row(BASE, { TC: "1", CLIENTE: name, USUARIO: "FICT002" })] : [])];
  const cartera = [["", "PAGOS NOVIEMBRE 2026"], [""], CARTERA, [""], row(CARTERA, {
    TC: "1", CLIENTE: name, ESTADO: "Vencido", "PLAN ACTIVO": options.plan ?? "1 MES", USD: "15", "MÉTODO DE PAGO": options.method ?? "ZELLE", USUARIO: "FICT001",
    "F. PRÓXIMO PAGO": due, "ORIGEN BASE": "BASE GENERAL!4", FUENTE_FINANCIERA: "ZELLE (OCT)", FILA_FUENTE: "9", CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE",
  })];
  const zelle = [[], ["", "ZELLE NOVIEMBRE"], ZELLE, row(ZELLE, {
    TC: "1", Cliente: name, "Monto Recibido": options.amount ?? "$15", Fecha: options.paid ?? "02-11-26", Asesor: "Asesor", CONFIRMACION: options.confirmation ?? "CONFIRMADO JM", ...options.link,
  })];
  const values = { "BASE GENERAL": base, "PAGOS NOVIEMBRE 2026": cartera, "ZELLE (NOV)": zelle };
  const model = buildRuntimeReadModel({ values, sheets: Object.keys(values).map((title) => ({ title })), today: "2026-11-04" });
  return { model, workday: buildWorkday({ model, directory: buildClientDirectory(values, ["BASE GENERAL", "PAGOS NOVIEMBRE 2026"]), credits: null }) };
}
const formal = { ESTADO_ENLACE: "ENLAZADO", COINCIDENCIAS_BASE: "1", FILA_BASE: "4" };

describe("pago confirmado frente a cartera desactualizada", () => {
  it("sin enlace formal: sale de la cobranza, queda en conciliación y no propone sincronizar", () => {
    const { model, workday } = scenario();
    expect(workday.queue).toEqual([]);
    expect(workday.reconciliation).toHaveLength(1);
    expect(workday.reconciliation[0]).toMatchObject({ paymentLink: "CANDIDATO", syncProposal: null, confirmedMethodReference: "ZELLE (NOV)!4", releaseAlert: null });
    expect(workday.toCollectToday.USD).toBe(0);
    expect(workday.counts.VENCIDO).toBe(0);
    expect(workday.lanes.COBRAR.count).toBe(0);
    expect(model.operations.items[0].state).toBe("SIN_PAGO"); // La fuente financiera no se transforma.
  });

  it("con enlace formal: propone estado y fechas sin aplicarlos", () => {
    const { model, workday } = scenario({ link: formal });
    expect(workday.reconciliation[0]).toMatchObject({ paymentLink: "VALIDADO", syncProposal: { collectionStatus: "PAGADO", lastPayment: "2026-11-02", nextPayment: "2026-12-02" } });
    expect(model.operations.items[0].collectionStatus).toBe("PENDIENTE");
  });

  it("calcula el plan con bonificación y no adivina un plan ilegible", () => {
    expect(scenario({ link: formal, plan: "3 MESES + 1" }).workday.reconciliation[0].syncProposal?.nextPayment).toBe("2027-03-02");
    expect(scenario({ link: formal, plan: "PROMO" }).workday.reconciliation[0].syncProposal?.nextPayment).toBeNull();
  });

  it.each<[string, Options]>([
    ["importe distinto", { amount: "$20" }],
    ["método distinto", { method: "PAYPAL" }],
    ["identidad ambigua", { duplicate: true }],
    ["pago fuera del ciclo", { paid: "20-11-26", due: "02-11-26" }],
    ["pago antes de la ventana", { paid: "02-11-26", due: "28-11-26" }],
    ["enlace a otra ficha", { link: { ...formal, FILA_BASE: "99" } }],
    ["sin CONFIRMADO JM", { confirmation: "PENDIENTE CONFIRMACION" }],
  ])("%s: no detiene la cobranza", (_, options) => {
    const { workday } = scenario(options);
    expect(workday.reconciliation).toEqual([]);
    expect(workday.queue.concat().length + workday.later).toBe(1);
  });
});
