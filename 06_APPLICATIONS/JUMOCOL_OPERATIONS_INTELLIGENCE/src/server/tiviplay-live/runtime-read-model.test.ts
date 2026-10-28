import fs from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildRuntimeReadModel,
  normalizePanel,
  normalizePayments,
  parseAmount,
  parseDate,
  selectRuntimeSheets,
} from "@/server/tiviplay-live/runtime-read-model";

const TODAY = "2026-10-09";

describe("TIVIPLAY_RUNTIME_DATE_SCOPE_V1 · selección de hojas", () => {
  const sheets = [
    "BASE GENERAL", "PAGOS OCTUBRE 2026", "PAGOS OCTUBRE 2026 - PRELIMINAR", "ZELLE (OCT)", "PAYPAL (OCT)", "TRANSF (OCT)",
    "CONTROL (OCT) P1", "CONTROL (OCT) P2", "CONTROL (OCT) P3", "PAGOS SEPTIEMBRE", "ZELLE (SEPT)", "CONTROL ( SEPT) P1",
    "PAGOS JUNIO", "ZELLE (JUNIO)", "PAGOS MAYO", "ZELLE (MAYO)", "CONTROL (MAYO) P1", "PAGOS_ABRIL", " ZELLE (MAR)",
    "CONTROL MARZ (P3)", "CONTROL (ENE) P2", "RESUMEN SEPTIEMBRE", "CONTROL OPERATIVO SEPTIEMBRE", "ACTIVOS (MAYO) P1",
    "CATALOGO_PLANES", "FLUJO 743 EVENTOS", "PAGOS NOVIEMBRE",
  ].map((title) => ({ title }));
  const selection = selectRuntimeSheets([...sheets, { title: "RESP_PAGOS_SEPT_20260924", hidden: true }], TODAY);
  const included = selection.included.map((r) => r.title);

  it("incluye junio → mes en curso", () => {
    expect(included).toEqual(expect.arrayContaining([
      "BASE GENERAL", "PAGOS OCTUBRE 2026", "ZELLE (OCT)", "PAYPAL (OCT)", "TRANSF (OCT)", "CONTROL (OCT) P1",
      "CONTROL (OCT) P2", "CONTROL (OCT) P3", "PAGOS SEPTIEMBRE", "ZELLE (SEPT)", "CONTROL ( SEPT) P1", "PAGOS JUNIO", "ZELLE (JUNIO)",
    ]));
  });

  it("no procesa enero–mayo, meses futuros, respaldos ni derivadas", () => {
    for (const t of ["PAGOS MAYO", "ZELLE (MAYO)", "CONTROL (MAYO) P1", "PAGOS_ABRIL", " ZELLE (MAR)", "CONTROL MARZ (P3)", "CONTROL (ENE) P2",
      "PAGOS OCTUBRE 2026 - PRELIMINAR", "RESUMEN SEPTIEMBRE", "CONTROL OPERATIVO SEPTIEMBRE", "ACTIVOS (MAYO) P1", "CATALOGO_PLANES",
      "FLUJO 743 EVENTOS", "RESP_PAGOS_SEPT_20260924", "PAGOS NOVIEMBRE"]) {
      expect(included).not.toContain(t);
      expect(selection.excluded.map((e) => e.title)).toContain(t);
    }
  });
});

describe("parsers", () => {
  it("fechas del libro", () => {
    expect(parseDate("01-10-26")).toBe("2026-10-01");
    expect(parseDate("2026-10-01\n18:54:47")).toBe("2026-10-01");
    expect(parseDate("7/11/2026")).toBe("2026-11-07");
    expect(parseDate("PAGO CONFIRMADO")).toBeNull();
  });
  it("montos", () => {
    expect(parseAmount("$234,150.0")).toBe(234150);
    expect(parseAmount(" $32,900")).toBe(32900);
    expect(parseAmount("$82")).toBe(82);
    expect(parseAmount("10,5")).toBe(10.5);
    expect(parseAmount("-")).toBeNull();
  });
});

describe("normalización de pagos", () => {
  it("Zelle: confirma solo CONFIRMADO; pendiente y revisión van aparte", () => {
    const rows = [[], ["", "ZELLE OCTUBRE"], ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION"],
      ["1", "Ana", "$25", "01-10-26", "Jorge", "FACTURACIÓN", "", "CONFIRMADO JM"],
      ["1", "Luis", "$15", "02-10-26", "Heidy", "FACTURACIÓN", "", "PENDIENTE CONFIRMACION"],
      ["1", "Eva", "$82", "03-10-26", "Jorge", "FACTURACIÓN", "", "REQUIERE REVISIÓN"],
      ["0", "Baja", "$10", "03-10-26", "Jorge", "", "", "CONFIRMADO JM"]];
    const { payments } = normalizePayments("ZELLE (OCT)", "2026-10", "ZELLE", rows);
    expect(payments.map((p) => [p.client, p.amount, p.confirmation, p.row])).toEqual([
      ["Ana", 25, "CONFIRMADO", 4], ["Luis", 15, "PENDIENTE", 5], ["Eva", 82, "REVISION", 6],
    ]);
  });

  it("PayPal sin fecha de recibido = factura abierta, no recaudo", () => {
    const rows = [[" ", "PAYPAL"], ["TC", "CLIENTE", "CORREO", "FACTURA ENVIADA", "COMISION", "MONTO RECIBIDO", "FECHA DE RECIBIDO", "Link", "FECHA DE CREACION", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION"],
      ["1", "Rob", "x", "74.00", "4.00", "70.00", "07-10-26", "", "07-10-26", "Jorge", "", "", "CONFIRMADO JM"],
      ["1", "Nef", "x", "16.52", "1.52", "15.00", "", "", "05-10-26", "", "", "No continuar"]];
    const out = normalizePayments("PAYPAL (OCT)", "2026-10", "PAYPAL", rows);
    expect(out.payments).toHaveLength(1);
    expect(out.payments[0].amount).toBe(70);
    expect(out.openInvoices).toEqual([expect.objectContaining({ client: "Nef", amount: 15, created: "2026-10-05" })]);
  });

  it("Transferencias: USD si existe, si no COP; nunca suma ambas", () => {
    const rows = [[" ", "TRANSF"], ["TC", "CLIENTE", "VALOR EN PESOS", "USD", "CAD", "MEDIO DE PAGO", "FECHA", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION"],
      ["1", "Peter", "$234,150.0", "70.00", "0.00", "DAVIVIENDA", "02-10-26", "Heidy", "", "", "CONFIRMADO JM"],
      ["1", "Fer", "$32,900", "", "0.00", "BANCOLOMBIA", "05-10-26", "Heidy", "", "", "CONFIRMADO JM"]];
    const { payments } = normalizePayments("TRANSF (OCT)", "2026-10", "TRANSFERENCIA", rows);
    expect(payments.map((p) => [p.currency, p.amount, p.channel])).toEqual([["USD", 70, "DAVIVIENDA"], ["COP", 32900, "BANCOLOMBIA"]]);
  });
});

describe("paneles", () => {
  it("consumo por CREDITO, saldo, compra y diferencia contra saldo", () => {
    const rows = [["CONTROL P3"], ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "ORIGEN", "CREDITO", "3", "OBS"],
      ["1", "JORGE", "1 MES", "u1", "secret", "p", "2026-10-01\n08:00", "Facturación", "1", "2"],
      ["1", "JORGE", "LIBERADO", "u2", "secret", "p", "2026-10-01\n09:00", "Promoción", "0", "2"],
      ["1", "JORGE", "1 MES", "u3", "secret", "p", "2026-10-01\n10:00", "Facturación", "1", "1"],
      ["", "", "COMPRA CRÉDITOS", "", "", "", "", "COMPRA", "0", "100"],
      ["1", "HEIDY", "1 MES", "u4", "secret", "p", "2026-10-02\n10:00", "Facturación", "1", "97"],
      ["", "", "", "u5", "secret", "p", "2026-10-09\n10:00"],
      ["", "", "", "u6", "secret", "p", "2026-10-20\n10:00"]];
    const p = normalizePanel("CONTROL (OCT) P3", "P3", rows, TODAY);
    expect(p).toMatchObject({ openingBalance: 3, creditsByField: 3, creditsByBalance: 5, difference: 2, currentBalance: 97, released: 1, scheduledPending: 2, scheduledToday: 1 });
    expect(p.purchases).toEqual([{ row: 6, previousBalance: 1, newBalance: 100 }]);
    expect(JSON.stringify(p)).not.toContain("secret");
  });
});

describe("read model integrado", () => {
  const base = [[" ", "GESTION"], ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T"],
    ["1", "Ana", "555", "a@x", "Al dia", "", "PLAN 1 MES", "1", "0", "25", "-", "ZELLE", "u", "pw", "PANEL 3", "", "01-10-26", "01-11-26"],
    ["1", "Luis", "555", "l@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "u", "pw", "PANEL 3", "", "02-09-26", "02-10-26"],
    ["1", "Vieja", "555", "v@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "u", "pw", "PANEL 3", "", "02-01-26", "02-02-26"],
    ["0", "Baja", "555", "b@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "u", "pw", "PANEL 3", "", "02-09-26", "02-10-26"],
    ["1", "Falso", "555", "f@x", "Al dia", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "u", "pw", "PANEL 3", "", "08-07-26", "08-08-26", "Texto pegado"],
    ["", "CLIENTES VENCIDOS · ESTADO = VENCIDO"],
    ["1", "TOTAL MIRA +", "", "", "", "", "", "", "", "70", "", "", "", "", "", "", "01-10-26", "01-11-26"],
    ["1", "ACTIVOS TIVIPLAY (AL DIA + POR VENCER)", "", "", "Al dia", "", "", "", "", "25", "", "", "", "", "", "", "01-10-26", "01-11-26"]];
  const cartera = [["", "PAGOS OCTUBRE"], ["", "nota"], ["TC", "CLIENTE", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "USD", "COP", "MÉTODO DE PAGO", "PANEL", "F. PRÓXIMO PAGO", "FUENTE_FINANCIERA", "FILA_FUENTE", "FECHA_PAGO", "MONEDA_PAGO", "VALOR_PAGO", "ESTADO_FINANCIERO", "MOTIVO_GATE_FINANCIERO"],
    ["", "SEMANA 1"],
    ["1", "Ana", "Al dia", "", "PLAN 1 MES", "25", "-", "ZELLE", "PANEL 3", "01-10-26", "ZELLE", "4", "01-10-26", "USD", "25", "VALIDADO", ""],
    ["1", "Luis", "Vencido", "05/10(J) No renovará", "PLAN 1 MES", "15", "-", "ZELLE", "PANEL 3", "02-10-26", "", "", "", "", "", "SIN PAGO", ""],
    ["2", "TOTAL VENCIMIENTOS OCTUBRE · NO META"]];
  const zelle = [[], ["", "ZELLE"], ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION"],
    ["1", "Ana", "$25", "09-10-26", "Jorge", "FACTURACIÓN", "", "CONFIRMADO JM"]];
  const zelleMay = [[], ["", "ZELLE"], ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION"],
    ["1", "Ana", "$999", "09-05-26", "Jorge", "", "", "CONFIRMADO JM"]];

  const model = buildRuntimeReadModel({
    sheets: [{ title: "BASE GENERAL" }, { title: "PAGOS OCTUBRE 2026" }, { title: "ZELLE (OCT)" }, { title: "ZELLE (MAYO)" }],
    values: { "BASE GENERAL": base, "PAGOS OCTUBRE 2026": cartera, "ZELLE (OCT)": zelle, "ZELLE (MAYO)": zelleMay },
    today: TODAY,
  });

  it("recaudo y cartera del mes", () => {
    expect(model.management.collectedToday.value.USD).toBe(25);
    expect(model.management.collectedMonth.value.USD).toBe(25);
    expect(model.management.pendingToCollect.value.USD).toBe(15);
    expect(model.management.coverage.value).toEqual({ paid: 1, total: 2, pct: 50 });
    expect(model.operations.overdue).toBe(1);
    expect(model.operations.items.find((i) => i.client === "Luis")?.nextAction).toBe("Decidir: cliente reporta no renovación");
    expect(model.operations.items.find((i) => i.client === "Ana")?.advisor).toBe("JORGE");
  });

  it("enero–mayo no entra al runtime", () => {
    expect(model.management.monthly.value.map((m) => m.month)).toEqual(["2026-10"]);
    expect(model.clientIndex.map((c) => c.name)).not.toContain("Vieja");
  });

  it("clientes activos/desactivados y ficha sin datos sensibles", () => {
    expect(model.clients).toMatchObject({ inScope: 3, active: 1, inactive: 1, excludedTc0: 1 });
    expect(model.clients.errors.map((e) => e.type)).toContain("ESTADO_NO_DEMOSTRADO");
    const luis = model.clientIndex.find((c) => c.name === "Luis");
    expect(luis?.balance.USD).toBe(15);
    expect(JSON.stringify(model.clientIndex)).not.toMatch(/555|@x|"pw"/);
  });

  it("meta del día y costo de panel quedan en REQUIERE DECISIÓN", () => {
    expect(model.management.dailyTarget.evidence.status).toBe("REQUIERE_DECISION");
    expect(model.decisions.join(" ")).toMatch(/Costo por panel/);
  });
});

// Regresión contra snapshot real del libro (opcional, fuera del repositorio).
const SNAPSHOT = process.env.TIVIPLAY_RUNTIME_SNAPSHOT;
describe.skipIf(!SNAPSHOT || !fs.existsSync(SNAPSHOT))("snapshot real GESTION_DIA_PAGOS_2026_TIVIPLAY", () => {
  it("reproduce los consolidados validados el 2026-10-09", () => {
    const { sheets, values } = JSON.parse(fs.readFileSync(SNAPSHOT as string, "utf8"));
    const m = buildRuntimeReadModel({ sheets, values, today: TODAY });
    expect(m.payments.totals.ZELLE.confirmed.USD).toBe(1619);
    expect(m.payments.totals.PAYPAL.confirmed.USD).toBe(125);
    expect(m.payments.totals.TRANSFERENCIA.confirmed).toMatchObject({ USD: 91, COP: 32900 });
    expect(m.panels.P1).toMatchObject({ creditsByField: 34, currentBalance: 50 });
    expect(m.panels.P2).toMatchObject({ creditsByField: 3, currentBalance: 40 });
    expect(m.panels.P3).toMatchObject({ creditsByField: 229, currentBalance: 79, difference: 2 });
    expect(m.management.monthly.value[0].month).toBe("2026-06");
  });
});
