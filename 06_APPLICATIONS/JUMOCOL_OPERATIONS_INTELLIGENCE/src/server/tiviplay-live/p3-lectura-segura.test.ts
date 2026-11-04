import { describe, expect, it } from "vitest";

import { observeBlockedPanel, projectCreditosHoy, type CreditosHoyInput } from "./creditos-hoy-projection";
import { buildClientHistory, technicalDue } from "./client-history-model";

const BASE = [
  ["BASE GENERAL"],
  ["TC", "CLIENTE", "USUARIO", "F. PRÓXIMO PAGO", "PANEL"],
  ["1", "Cliente A", "UNICO1", "02-12-26", "PANEL 3"],
  ["1", "Cliente B", "OTROPANEL", "03-12-26", "PANEL 1"],
  ["1", "Cliente C", "DUP", "04-12-26", "PANEL 3"],
  ["1", "Cliente D", "DUP", "05-12-26", "PANEL 3"],
];
const CONTROL = [
  ["CONTROL NOVIEMBRE PANEL 3"],
  ["TC", "ASESOR", "RECARGA", "USUARIO", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO"],
  ["1", "MANUELA", "1 MES", "UNICO1", "04-11-26", "2026-12-04\n10:00", "FACTURACION", "1"],
  ["1", "MANUELA", "1 MES", "OTROPANEL", "", "", "FACTURACION", "0"],
  ["1", "MANUELA", "1 MES", "DUP", "04-11-26", "", "FACTURACION", "1"],
  ["1", "MANUELA", "1 MES", "SINBASE", "", "", "FACTURACION", "0"],
  ["15", "COMPRA CREDITOS", "", "", "", "", "COMPRA", "0"],
];

describe("CONTROL Panel 3: lectura sin desbloquear ejecuciones", () => {
  it("clasifica identidad única, ambiguos, sin BASE y panel contradictorio", () => {
    expect(observeBlockedPanel("P3", CONTROL, BASE)).toEqual({
      records: 4,
      recordedCredits: 2,
      noCredit: 2,
      matchedUnique: 2,
      noBase: 1,
      ambiguousBase: 1,
      otherPanel: 1,
    });
  });

  it("publica métricas informativas sin habilitar tareas ni sumar créditos otorgables", () => {
    const input: CreditosHoyInput = {
      today: "2026-11-04",
      targetMonth: "2026-11",
      controls: {
        P1: { sheet: null, rows: null },
        P2: { sheet: null, rows: null },
        P3: { sheet: "CONTROL (NOV) P3", rows: CONTROL },
      },
      blockedPanels: ["P3"],
      base: BASE,
      payments: [],
    };
    const result = projectCreditosHoy(input);
    const p3 = result.panels.find((p) => p.panel === "P3");
    expect(p3?.status).toBe("REQUIERE_DECISION");
    expect(p3?.kpi).toBeNull();
    expect(p3?.tasks).toHaveLength(0);
    expect(p3?.pending).toHaveLength(0);
    expect(p3?.observed?.records).toBe(4);
    expect(result.totals.HABILITADO).toBe(0);
    expect(result.kpi.otorgados).toBe(0); // Observaciones no son crédito habilitado.
  });

  it("muestra ejecuciones de P3 por usuario y vencimientos como evidencia, no como autorización", () => {
    const history = buildClientHistory([
      { title: "CONTROL (NOV) P3", kind: "CONTROL", rows: [
        { __row: "3", USUARIO: "UNICO1", FECHA: "04-11-26", "F.VENCIMIENTO": "2026-12-04\n10:00", CREDITO: "1" },
      ] },
    ], { user: "UNICO1", clientKey: null, baseRow: 3 });
    expect(history.renewals).toHaveLength(1);
    expect(history.renewals[0].source).toBe("CONTROL (NOV) P3!3");
    expect(history.controlDue).toBe("2026-12-04");
    expect(technicalDue({ panel: "PANEL 3M", due: "2026-12-04", userRepeated: false, controlDue: history.controlDue }))
      .toMatchObject({ status: "REQUIERE VALIDACIÓN", date: "2026-12-04" });
    expect(technicalDue({ panel: "PANEL 3M", due: "2026-12-04", userRepeated: true, controlDue: history.controlDue }))
      .toMatchObject({ status: "REQUIERE VALIDACIÓN", date: null });
  });

  it("sin BASE no inventa cifras de coincidencia", () => {
    expect(observeBlockedPanel("P3", CONTROL, null)).toBeNull();
  });
});
