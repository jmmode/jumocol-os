import { describe, expect, it } from "vitest";

import { buildClientHistory, technicalDue, type HistoryTab } from "./client-history-model";

const tabs: HistoryTab[] = [
  { title: "PAGOS NOVIEMBRE 2026", kind: "PAGOS", rows: [{ __row: "5", USUARIO: "USR1", "PLAN ACTIVO": "12 MESES", PANTALLAS: "2", USD: "180", CONFIRMACION: "CONFIRMADO JM" }, { __row: "6", USUARIO: "OTRO" }] },
  { title: "PAGOS JUNIO", kind: "PAGOS", rows: [{ __row: "7", USUARIO: "USR1" }, { __row: "8", USUARIO: "usr1" }] },
  { title: "CONTROL (NOV) P1", kind: "CONTROL", rows: [{ __row: "9", USUARIO: "USR1", FECHA: "2026-11-03", "F.VENCIMIENTO": "2026-12-04", CREDITO: "1" }] },
  { title: "CONTROL (OCT) P1", kind: "CONTROL", rows: [{ __row: "10", USUARIO: "USR1", FECHA: "2026-10-01", CREDITO: "0" }] },
  { title: "ZELLE (NOV)", kind: "PAGO", rows: [
    { __row: "11", __date: "2026-11-02", CLIENTE_KEY: "JUAN PEREZ", ESTADO_ENLACE: "ENLAZADO", COINCIDENCIAS_BASE: "1", FILA_BASE: "40", VALOR_PAGO: "15", MONEDA_PAGO: "USD", CONFIRMACION: "PENDIENTE CONFIRMACION" },
    { __row: "12", __date: "2026-11-01", CLIENTE_KEY: "JUAN PEREZ", ESTADO_ENLACE: "ENLAZADO", COINCIDENCIAS_BASE: "1", FILA_BASE: "99", VALOR_PAGO: "15", MONEDA_PAGO: "USD", CONFIRMACION: "CONFIRMADO JM" },
    { __row: "13", __date: "2026-10-01", CLIENTE_KEY: "JUAN PEREZ", ESTADO_ENLACE: "REQUIERE DECISIÓN", COINCIDENCIAS_BASE: "2", FILA_BASE: "40", VALOR_PAGO: "15", MONEDA_PAGO: "USD", CONFIRMACION: "CONFIRMADO JM" },
  ] },
];

describe("historial del cliente", () => {
  const h = buildClientHistory(tabs, { user: "USR1", clientKey: "Juan Perez", baseRow: 40 }, "2026-11-04");

  it("no acredita un pago por coincidencia de nombre", () => {
    expect(h.payments.map((p) => p.source)).toEqual(["ZELLE (NOV)!11"]);
  });
  it("separa pendientes de confirmados", () => {
    expect(h.payments[0].pending).toBe(true);
  });
  it("marca el mes ambiguo sin elegir una fila", () => {
    expect(h.ambiguousMonths).toEqual(["PAGOS JUNIO"]);
    expect(h.plans.map((p) => p.month)).toEqual(["PAGOS NOVIEMBRE 2026"]);
  });
  it("cuenta solo renovaciones con crédito", () => {
    expect(h.renewals).toHaveLength(1);
    expect(h.controlDue).toBe("2026-12-04");
  });
  it("sin clave no enlaza pagos", () => {
    expect(buildClientHistory(tabs, { user: "USR1", clientKey: null, baseRow: 40 }).payments).toEqual([]);
  });
});

describe("vencimiento técnico", () => {
  const base = { panel: "PANEL 1", due: "2026-12-01", userRepeated: false, controlDue: null };
  it("se muestra con identidad verificada", () => expect(technicalDue(base)).toMatchObject({ status: "VERIFICADO", date: "2026-12-01" }));
  it("Panel 3 informa la fecha sin validarla", () => expect(technicalDue({ ...base, panel: "PANEL 3M" })).toMatchObject({ status: "REQUIERE VALIDACIÓN", date: "2026-12-01" }));
  it("usuario repetido no muestra fecha", () => expect(technicalDue({ ...base, userRepeated: true }).date).toBeNull());
  it("explica la diferencia con CONTROL", () => expect(technicalDue({ ...base, controlDue: "2027-01-01" }).status).toBe("REQUIERE VALIDACIÓN"));
});
