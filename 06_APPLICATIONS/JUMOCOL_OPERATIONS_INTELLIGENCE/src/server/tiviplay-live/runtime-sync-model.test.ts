import { describe, expect, it } from "vitest";

import { buildSyncModel, estadoPorT, selectSalesSheets } from "@/server/tiviplay-live/runtime-sync-model";

const TODAY = "2026-10-09";

const BASE = [
  [" ", "GESTION"],
  ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "CLIENTE_KEY"],
  ["1", "Ana Ruiz", "1", "a@x", "Por vencer", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "ANA1", "pw", "PANEL 1", "2026-10-02", "02-09-26", "02-10-26", "-7", "ANA RUIZ"],
  ["1", "Beto Paz", "1", "b@x", "Por vencer", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "BETO1", "pw", "PANEL 3", "2026-10-03", "03-10-26", "05-11-26", "27", "BETO PAZ"],
  ["1", "Ciro Dup", "1", "c@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "DUP1", "pw", "PANEL 3", "", "01-06-26", "01-07-26", "-90", "CIRO DUP"],
  ["1", "Ciro Dup 2", "1", "c@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "DUP1", "pw", "PANEL 3", "", "01-06-26", "01-07-26", "-90", "CIRO DUP 2"],
  ["1", "Dora Vieja", "1", "d@x", "Vencido", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "DORA1", "pw", "PANEL 1", "", "01-03-26", "01-04-26", "-180", "DORA VIEJA"],
  ["1", "Pago Sin Control", "1", "psc@x", "Por vencer", "", "PLAN 1 MES", "1", "0", "15", "-", "ZELLE", "PSC1", "pw", "PANEL 2", "2026-10-15", "09-10-26", "09-11-26", "31", "PAGO SIN CONTROL"],
];
const CARTERA = [
  ["", "PAGOS OCTUBRE 2026"], ["", "nota"],
  ["TC", "CLIENTE", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "PANEL", "F. PRÓXIMO PAGO", "FUENTE_FINANCIERA", "FILA_FUENTE", "ESTADO_FINANCIERO", "MOTIVO_GATE_FINANCIERO"],
  ["1", "Ana Ruiz", "Por vencer", "", "PLAN 1 MES", "15", "-", "ZELLE", "ANA1", "PANEL 1", "02-10-26", "ZELLE", "4", "VALIDADO", ""],
  ["1", "Beto Paz", "Por vencer", "", "PLAN 1 MES", "15", "-", "ZELLE", "BETO1", "PANEL 3", "03-10-26", "ZELLE", "5", "VALIDADO", ""],
  ["1", "Hoy Cobro", "Por vencer", "", "PLAN 1 MES", "15", "-", "ZELLE", "HOY1", "PANEL 1", "09-10-26", "", "", "SIN PAGO", ""],
  ["1", "Ya Vencido", "Vencido", "", "PLAN 1 MES", "15", "-", "ZELLE", "VEN1", "PANEL 1", "05-10-26", "", "", "SIN PAGO", ""],
  ["1", "No Renueva", "Vencido", "07/10(J) No renovará", "PLAN 1 MES", "15", "-", "ZELLE", "NOR1", "PANEL 1", "05-10-26", "", "", "SIN PAGO", ""],
];
const ZELLE = [
  [], ["", "ZELLE OCTUBRE"],
  ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "MONEDA_PAGO", "VALOR_PAGO", "PROP_F_ULTIMO", "PROP_F_PROXIMO", "PROP_T", "PROP_ESTADO", "ESTADO_PROPUESTA", "TIPO_CAMBIO"],
  ["1", "Ana Ruiz", "$15", "02-10-26", "Jorge", "FACTURACIÓN", "", "CONFIRMADO JM", "ANA RUIZ", "1", "3", "USD", "15", "02-10-26", "2/11/2026", "24", "Por vencer", "VALIDADO", "SIN CAMBIO"],
  ["1", "Beto Paz", "$15", "03-10-26", "Heidy", "FACTURACIÓN", "", "CONFIRMADO JM", "BETO PAZ", "1", "4", "USD", "15", "03-10-26", "3/11/2026", "25", "Por vencer", "VALIDADO", "SIN CAMBIO"],
  ["1", "Nuevo Cliente", "$70", "07-10-26", "Jorge", "VENTA", "", "CONFIRMADO JM", "NUEVO CLIENTE", "0", "", "USD", "70", "", "", "", "", "REQUIERE DECISIÓN", "PENDIENTE ENLACE"],
  ["1", "Pend Venta", "$10", "08-10-26", "Heidy", "VENTA", "", "PENDIENTE CONFIRMACION", "PEND VENTA", "0", "", "USD", "10"],
  ["1", "Pago Sin Control", "$15", "09-10-26", "Jorge", "FACTURACIÓN", "", "CONFIRMADO JM", "PAGO SIN CONTROL", "1", "8", "USD", "15", "09-10-26", "09-11-2026", "31", "Al dia", "VALIDADO", "SIN CAMBIO"],
];
const P = (title: string, rows: unknown[][]) => [[title], ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "ORIGEN", "CREDITO", "10", "OBSERVACIÓN"], ...rows];
const P1 = P("P1", [
  ["1", "JORGE", "1 MES", "ANA1", "s", "x", "2026-10-02\n10:00", "Facturación", "1", "9"],
  ["1", "JORGE", "LIBERADO", "LIB1", "s", "x", "2026-10-03\n10:00", "Promoción", "0", "9"],
  ["", "", "", "HOY1", "s", "x", "2026-10-09\n10:00"],
  ["", "", "", "FUT1", "s", "x", "2026-10-20\n10:00"],
]);
const P2 = P("P2", [["1", "JORGE", "1 MES", "\tNEW1", "s", "x", "2026-10-07\n10:00", "Venta", "1", "9"]]);
const P3 = P("P3", [
  ["1", "HEIDY", "1 MES", "BETO1", "s", "x", "2026-10-03\n10:00", "Facturación", "1", "7"],
]);
const VENTAS = [
  ["", "VENTAS OCTUBRE"],
  ["TC", "CONCEPTO", "ORIGEN", "ASESOR", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "F.ULTIMO PAGO", "F.PRÓXIMO PAGO", "DISPOSITIVO", "CONFIRMACION"],
  ["1", "Cliente nuevo", "MIRA+", "Jorge", "Nuevo Cliente", "+1", "n@x", "REGISTRADA", "", "\tNEW1", "pw", "PANEL 2", "2026-10-07", "PLAN 12 MESES", "3", "0", "70.00", " $0", "ZELLE", "07-10-26", "07-10-27", "Fire", ""],
  ["1", "Cliente nuevo", "MIRA+", "Heidi", "Pend Venta", "+1", "p@x", "REGISTRADA", "", "PEN1", "pw", "PANEL 2", "2026-11-09", "PLAN 1 MES", "1", "0", "10.00", "", "NEQUI", "09-10-26", "09-11-26", "Tv", ""],
  ["1", "Reactivación", "X", "Jorge", "Sin Base", "+1", "s@x", "", "", "NOEXISTE", "pw", "PANEL 1", "2026-10-10", "PLAN 1 MES", "1", "0", "15", "", "ZELLE", "08-10-26", "08-11-26", "Tv", "CONFIRMADO JM"],
  ["1", "Referido", "X", "Jorge", "Ciro Dup", "+1", "c@x", "", "", "DUP1", "pw", "PANEL 3", "2026-10-10", "PLAN 1 MES", "1", "0", "15", "", "ZELLE", "08-10-26", "08-11-26", "Tv", "CONFIRMADO JM"],
  ["1", "FREE", "DEMO", "Manuela", "Demo User", "3", "d@x", "", "", "DEMO1", "pw", "PANEL 1", "2026-10-10", "PLAN 1 MES", "", "", "15.00", "", "NEQUI"],
];
const VENTAS_MAYO = [["", "VENTAS MAYO"], VENTAS[1], ["1", "Cliente nuevo", "X", "Jorge", "Mayo Cliente", "+1", "m@x", "", "", "MAY1", "pw", "PANEL 1", "2026-05-10", "PLAN 1 MES", "1", "0", "15", "", "ZELLE", "10-05-26", "10-06-26", "Tv", "CONFIRMADO JM"]];

const model = buildSyncModel({
  sheets: ["BASE GENERAL", "PAGOS OCTUBRE 2026", "ZELLE (OCT)", "CONTROL (OCT) P1", "CONTROL (OCT) P2", "CONTROL (OCT) P3"].map((title) => ({ title })),
  values: { "BASE GENERAL": BASE, "PAGOS OCTUBRE 2026": CARTERA, "ZELLE (OCT)": ZELLE, "CONTROL (OCT) P1": P1, "CONTROL (OCT) P2": P2, "CONTROL (OCT) P3": P3 },
  salesSheets: [{ title: "VENTAS_OCTUBRE" }, { title: "(5) VENTAS_MAYO" }, { title: "PENDIENTES OCTUBRE" }],
  salesValues: { VENTAS_OCTUBRE: VENTAS, "(5) VENTAS_MAYO": VENTAS_MAYO },
  today: TODAY,
});
const fin = (c: string) => model.financial.find((f) => f.client === c);
const sale = (c: string) => model.sales.find((s) => s.client === c);
const svc = (u: string) => model.service.find((s) => s.usuario === u);
const sync = (c: string) => model.sync.find((s) => s.client === c);

describe("VENTAS (jun → hoy)", () => {
  it("excluye enero–mayo y hojas que no son ventas", () => {
    const sel = selectSalesSheets([{ title: "VENTAS_OCTUBRE" }, { title: "(5) VENTAS_MAYO" }, { title: "PENDIENTES OCTUBRE" }, { title: "(6) VENTAS_JUNIO" }], TODAY);
    expect(sel.included.map((x) => x.title)).toEqual(["VENTAS_OCTUBRE", "(6) VENTAS_JUNIO"]);
    expect(model.sales.map((s) => s.client)).not.toContain("Mayo Cliente");
  });
  it("clasifica venta nueva, pendiente, reactivación sin base, duplicidad y no-venta", () => {
    expect(sale("Nuevo Cliente")).toMatchObject({ type: "VENTA_NUEVA", confirmation: "CONFIRMADO_JM", gate: "LISTO_PARA_CONTINUAR", usuario: "NEW1" });
    expect(sale("Pend Venta")).toMatchObject({ gate: "PENDIENTE_CONFIRMACION" });
    expect(sale("Sin Base")).toMatchObject({ type: "REQUIERE_DECISION", gate: "REQUIERE_DECISION" });
    expect(sale("Ciro Dup")).toMatchObject({ gate: "DUPLICIDAD" });
    expect(sale("Demo User")).toMatchObject({ type: "REQUIERE_DECISION" });
  });
});

describe("Cola financiera", () => {
  it("estados desde cartera + hojas de pago", () => {
    expect(fin("Ana Ruiz")?.state).toBe("CONFIRMADO_JM");
    expect(fin("Ana Ruiz")?.advisor).toBe("JORGE");
    expect(fin("Hoy Cobro")?.state).toBe("COBRO_HOY");
    expect(fin("Ya Vencido")?.state).toBe("VENCIDO");
    expect(fin("No Renueva")?.state).toBe("REQUIERE_DECISION");
    expect(fin("Pend Venta")?.state).toBe("PENDIENTE_CONFIRMACION_JM");
  });
});

describe("Cola de servicio", () => {
  it("hoy, aplicado+pagado = validado, liberado = decisión, programado", () => {
    expect(svc("HOY1")?.state).toBe("SERVICIO_HOY");
    expect(svc("ANA1")?.state).toBe("SERVICIO_VALIDADO");
    expect(svc("LIB1")?.state).toBe("REQUIERE_DECISION");
    expect(svc("FUT1")?.state).toBe("PROGRAMADO");
    expect(svc("BETO1")?.state).toBe("INCONSISTENCIA_CREDITOS"); // CREDITO 1 pero saldo 10 → 7
    expect(JSON.stringify(model.service)).not.toContain('"s"');
  });
  it("crea tarea virtual para CONFIRMADO JM sin fila CONTROL y panel inequívoco", () => {
    expect(svc("PSC1")).toMatchObject({ id: "TASK:ZELLE!8", panel: "P2", state: "CREDITO_PENDIENTE", row: 0 });
    expect(svc("PSC1")?.nextAction).toMatch(/CREDITO \+ F.VENCIMIENTO/);
  });
});

describe("Match → BASE GENERAL (preview, solo lectura)", () => {
  it("alta nueva lista con campos a crear", () => {
    const x = sync("Nuevo Cliente");
    expect(x).toMatchObject({ action: "ALTA_NUEVA", state: "LISTO_PARA_BASE", baseRow: null });
    expect(x?.changes.map((c) => c.field)).toEqual(expect.arrayContaining(["CLIENTE", "USUARIO", "F.ULTIMO PAGO", "F.PRÓXIMO PAGO", "ESTADO", "TC"]));
    expect(x?.changes.find((c) => c.field === "ESTADO")?.to).toBe(estadoPorT("2027-10-07", TODAY).estado);
    expect(x?.changes.find((c) => c.field === "CONTRASEÑA")?.to).toBe("(dato de la venta)");
  });
  it("renovación: propuesta vs BASE, conflicto bloquea", () => {
    expect(sync("Ana Ruiz")).toMatchObject({ action: "RENOVACION", state: "LISTO_PARA_BASE" });
    expect(sync("Ana Ruiz")?.changes).toEqual(expect.arrayContaining([{ field: "F.ULTIMO PAGO", from: "02-09-26", to: "02-10-26" }, { field: "F.PRÓXIMO PAGO", from: "02-10-26", to: "02-11-26" }]));
    // Beto: BASE ya tiene F.ULTIMO 03-10-26 pero F.PRÓXIMO distinto, y servicio inconsistente
    expect(sync("Beto Paz")?.state).toBe("BLOQUEADO");
    expect(sync("Beto Paz")?.blockers.join(" ")).toMatch(/Conflicto|Servicio/);
  });
  it("pendiente JM nunca queda listo; contadores provienen del modelo", () => {
    expect(sync("Pend Venta")?.state).toBe("BLOQUEADO");
    expect(model.counts.listoParaBase).toBe(model.sync.filter((s) => s.state === "LISTO_PARA_BASE").length);
    expect(model.readOnly).toBe(true);
  });
});
