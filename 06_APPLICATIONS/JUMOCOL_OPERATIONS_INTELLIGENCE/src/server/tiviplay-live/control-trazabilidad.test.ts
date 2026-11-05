import { describe, expect, it } from "vitest";

import { buildClientHistory, technicalDue, type HistoryTab } from "./client-history-model";
import { columnKey, resolveTabColumns } from "./client-history";
import { projectCreditosHoy } from "./creditos-hoy-projection";

// Datos sintéticos que reproducen los casos de Patricia Franco y Sofía Aparicio.
const TODAY = "2026-11-04";
const OCT = ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO", "60", "OBSERVACIÓN"];
const NOV = ["TC", "ASESOR", "RECARGA", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO", "311", "OBSERVACIÓN"];
const tabs: HistoryTab[] = [
  { title: "CONTROL (OCT) P3", kind: "CONTROL", rows: [
    { __row: "61", USUARIO: "CASO_A", FECHA: "2026-10-03\n14:01:13", "F.VENCIMIENTO": "2026-11-03", CREDITO: "1" },
    { __row: "169", USUARIO: "CASO_B", FECHA: "2026-10-07\n13:43:33", "F.VENCIMIENTO": "2026-11-07", CREDITO: "1" },
    { __row: "200", USUARIO: "DOBLE", FECHA: "2026-10-09", "F.VENCIMIENTO": "2026-11-09", CREDITO: "1" },
    { __row: "201", USUARIO: "doble", FECHA: "2026-10-09", "F.VENCIMIENTO": "2026-11-09", CREDITO: "1" },
  ] },
  { title: "CONTROL (NOV) P3", kind: "CONTROL", rows: [
    { __row: "56", USUARIO: "CASO_A", FECHA: "2026-12-03", "F.VENCIMIENTO": "2026-11-03\n14:01:13", CREDITO: "1" },
    { __row: "161", USUARIO: "CASO_B", FECHA: "", "F.VENCIMIENTO": "2026-11-07\n13:43:33", CREDITO: "" },
    { __row: "170", USUARIO: "PAGADO", FECHA: "02-11-2026", "F.VENCIMIENTO": "2026-12-02", CREDITO: "1" },
  ] },
];
const history = (user: string) => buildClientHistory(tabs, { user, clientKey: null, baseRow: null }, TODAY);
const byRow = (user: string, row: string) => history(user).control.find((r) => r.row === row);

describe("trazabilidad técnica por cliente", () => {
  it("caso Patricia: FECHA futura con crédito no prueba ejecución", () => {
    expect(byRow("CASO_A", "56")).toMatchObject({ month: "2026-11", sheet: "CONTROL (NOV) P3", date: "2026-12-03", due: "2026-11-03", credit: "1", status: "REQUIERE REVISIÓN" });
    expect(history("CASO_A").renewals.map((r) => r.source)).toEqual(["CONTROL (OCT) P3!61"]);
    expect(history("CASO_A").controlDue).toBe("2026-11-03");
  });

  it("caso Sofía: octubre registrado en su fila real y noviembre programado sin crédito", () => {
    expect(byRow("CASO_B", "169")).toMatchObject({ month: "2026-10", date: "2026-10-07", due: "2026-11-07", status: "REGISTRADO" });
    expect(byRow("CASO_B", "161")).toMatchObject({ month: "2026-11", date: null, status: "PROGRAMADO", credit: "" });
  });

  it("cliente con crédito registrado en noviembre", () => {
    expect(byRow("PAGADO", "170")).toMatchObject({ date: "2026-11-02", status: "REGISTRADO" });
  });

  it("identidad duplicada queda en revisión y no prueba vencimiento", () => {
    const h = history("DOBLE");
    expect(h.control.map((r) => r.status)).toEqual(["REQUIERE REVISIÓN", "REQUIERE REVISIÓN"]);
    expect(h.controlDue).toBeNull();
  });

  it("sin registro no inventa filas", () => {
    expect(history("NADIE").control).toEqual([]);
  });

  it("un vencimiento P3 nunca queda validado", () => {
    expect(technicalDue({ panel: "PANEL 3M", due: "2026-11-07", userRepeated: false, controlDue: "2026-11-07" }).status).toBe("REQUIERE VALIDACIÓN");
  });

  it("FECHA de CONTROL llega con su nombre; las hojas de pago la unifican", () => {
    expect(columnKey("CONTROL", "FECHA")).toBe("FECHA");
    expect(columnKey("PAGO", "FECHA")).toBe("__date");
    expect(columnKey("PAGO", "FECHA DE RECIBIDO")).toBe("__date");
  });

  it("ubica columnas por encabezado en octubre y noviembre, sin tocar CONTRASEÑA", () => {
    const plan = { title: "CONTROL", kind: "CONTROL" as const, wanted: ["USUARIO", "FECHA", "F.VENCIMIENTO", "CREDITO"], required: ["TC", "USUARIO"] };
    const letters = (header: string[]) => resolveTabColumns(plan, [["CONTROL VENCIMIENTOS"], header]).map((c) => c.range.match(/!([A-Z]+)3/)?.[1]);
    expect(letters(OCT)).toEqual(["D", "G", "H", "J"]);
    expect(letters(NOV)).toEqual(["E", "H", "I", "K"]);
  });
});

describe("lectura de CONTROL separada de la autorización", () => {
  const sheet = (panel: string) => [["CONTROL VENCIMIENTOS"], NOV,
    ["1", "ASESOR", "1 MES", "1", `USR${panel}`, "x", "panel", "2026-11-04", "2026-12-04", "FACTURACION", "1", "", ""],
    ["1", "ASESOR", "1 MES", "2", `SIN${panel}`, "x", "panel", "2026-11-04", "", "", "", "", ""]];
  const base = [["CONTROL"], ["TC", "CLIENTE", "USUARIO", "PANEL", "F.VENCIMIENTO", "F. PRÓXIMO PAGO", "PLAN ACTIVO"],
    ...["P1", "P2", "P3"].flatMap((p) => [["1", `A${p}`, `USR${p}`, p, "2026-12-04", "2026-12-20", "1 MES"], ["1", `B${p}`, `SIN${p}`, p, "2026-11-04", "2026-12-20", "1 MES"]])];
  const project = (blockedPanels: ("P1" | "P2" | "P3")[]) => projectCreditosHoy({
    today: TODAY, targetMonth: "2026-11", base, payments: [], blockedPanels,
    controls: { P1: { sheet: "CONTROL (NOV) P1", rows: sheet("P1") }, P2: { sheet: "CONTROL (NOV) P2", rows: sheet("P2") }, P3: { sheet: "CONTROL (NOV) P3", rows: sheet("P3") } },
  });

  it("P1, P2 y P3 procesan el mismo contrato", () => {
    const panels = project(["P3"]).panels;
    expect(panels.map((p) => p.status)).toEqual(["OK", "OK", "OK"]);
    expect(panels.map((p) => p.kpi?.programados)).toEqual([2, 2, 2]);
    expect(panels.map((p) => p.kpi?.otorgados)).toEqual([1, 1, 1]);
  });

  it("el panel retenido no entrega créditos habilitados ni decisiones", () => {
    const open = project([]).panels[2];
    const held = project(["P3"]).panels[2];
    expect(held.grantBlocked).toBe(true);
    expect(open.grantBlocked).toBeUndefined();
    expect([...held.tasks, ...held.pending].filter((t) => t.state === "HABILITADO" || t.basis || t.exception)).toEqual([]);
    expect(held.cycles.filter((c) => c.basis || c.exception)).toEqual([]);
    expect(held.observed?.records).toBe(2);
  });
});
