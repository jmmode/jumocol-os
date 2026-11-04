import { describe, expect, it } from "vitest";

import { addMonths, planMonths, projectAvailableCredits, projectCreditosHoy, type CreditosHoyInput } from "./creditos-hoy-projection";

// Datos sintéticos con la forma real de CONTROL: título en fila 1, encabezado en fila 2, contraseña en E,
// datos y, debajo, el bloque resumen «⬅️ …» (que nunca es una cuenta). Sin datos de clientes reales.
const H = ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO", "60", "OBSERVACIÓN"];
/** tc=A, g=G, h=H, origin=I, credit=J, obs=L */
const r = (user: string, g: string, { tc = "1", h = "", origin = "", credit = "", obs = "" } = {}) =>
  [tc, "HEIDY", "1 MES", user, "SECRETO-NO-MOSTRAR", "panel", g, h, origin, credit, "9", obs];
const done = (user: string, g: string, h: string) => r(user, g, { h, origin: "Facturación", credit: "1" });
const compra = (qty: string) => [qty, "COMPRA CRÉDITOS PANEL", "", "", "", "", "", "", "COMPRA", "0", "999"];
const summary = (p: number, o: number, f: number, hoy: number) => [[String(p), "⬅️ Creditos por otorgar OCTUBRE"], [String(o), "⬅️ Creditos otorgados en OCTUBRE"], [String(f), "⬅️ faltan por otorgar OCTUBRE"], [String(hoy), "⬅️ Créditos por otorgar HOY"]];
const ctl = (title: string, rows: unknown[][], tail: unknown[][] = []) => [[title], H, ...rows, ...tail];

const BASE_H = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO"];
const b = (user: string, panel: string, plan: string, next: string, due = "") => ["1", "Cliente", "", "", "", "", plan, "1", "", "", "", "", user, "x", panel, due, "", next];
const PAY_H = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "TIPO_SERVICIO", "PLAN_CANONICO", "DURACION_MESES", "PANTALLAS", "ESTADO_ENLACE"];
const pay = (conf: string, fila: string, link = "ENLAZADO") => ["1", "Cliente", "15", "20-10-26", "JORGE", "", "", conf, "", "1", fila, "", "", "", "", link];

const TODAY = "2026-10-22";

function input(overrides: Partial<CreditosHoyInput> = {}): CreditosHoyInput {
  const base = [[" ", "BASE"], BASE_H,
    b("USRA", "PANEL 3", "PLAN 1 MES", "01-11-26"), // fila 3 · caso A
    b("USRB", "PANEL 3M", "PLAN 3 MESES+1", "10-01-27"), // fila 4 · caso B
    b("USRC", "PANEL 3", "PLAN 1 MES", "15-03-27"), // fila 5 · cobertura excede plan
    b("USRD", "PANEL 3", "PLAN 1 MES", "20-10-26"), // fila 6 · sin pago ni cobertura
    b("USRE", "PANEL 1", "PLAN 1 MES", "01-12-26"), // fila 7 · contradicción de panel
    b("DUP", "PANEL 3", "PLAN 1 MES", "01-12-26"), b("DUP", "PANEL 3", "PLAN 1 MES", "01-12-26"), // filas 8-9 · repetido
    b("EJ3", "PANEL 3", "PLAN 1 MES", "22-11-26", "2026-11-22"), // fila 10 · BASE ya tiene H
    b("EJ2", "PANEL 2", "PLAN 1 MES", "22-11-26", "2026-10-22"), // fila 11 · BASE pendiente
  ];
  return {
    today: TODAY,
    targetMonth: "2026-10",
    controls: {
      // P1 real: FECHA en noviembre aunque la hoja es de octubre; COMPRA en medio de los datos.
      P1: { sheet: "CONTROL (OCT) P1", rows: ctl("P1", [done("X1", "2026-11-22\n20:16:13", "2026-11-22"), compra("130"), r("X2", "2026-11-23\n01:39:44")], summary(2, 1, 1, 0)) },
      P2: { sheet: "CONTROL (OCT) P2", rows: ctl("P2", [done("EJ2", "2026-10-22\n15:02:34", "2026-11-22"), r("FUT", "2026-10-29\n13:19:46")], summary(2, 1, 1, 0)) },
      P3: {
        sheet: "CONTROL (OCT) P3",
        rows: ctl("P3", [
          done("AYER", "2026-10-21\n20:31:04", "2026-11-21"), // fila 3 · anterior ejecutado
          r("OLVIDO", "2026-10-20\n10:00"), // fila 4 · anterior pendiente
          r("DEUDA", "2026-10-19\n10:00", { origin: "sin pagar", credit: "0" }), // fila 5 · anterior sin pagar
          done("EJ3", "2026-10-22\n08:44:38", "2026-11-22"), // fila 6
          r("MOV", "2026-10-22\n09:05:55", { credit: "0", obs: "PANEL 1" }), // fila 7
          r("USRA", "2026-10-22\n10:00:00", { h: "2026-11-22" }), // fila 8 · H anticipada
          r("USRB", "2026-10-22\n11:00:00"),
          r("USRC", "2026-10-22\n12:00:00"),
          r("USRD", "2026-10-22\n13:00:00"),
          r("USRE", "2026-10-22\n14:00:00"),
          r("NOEXISTE", "2026-10-22\n15:00:00"),
          r("DUP", "2026-10-22\n16:00:00"),
          r("MAL", "2026-10-22\n17:00:00", { h: "2026-10-01", origin: "Facturación", credit: "1" }),
          r("SP", "2026-10-22\n18:00:00", { origin: "Sin Pagar", credit: "0" }),
          r("PROMO", "2026-10-22\n19:00:00", { tc: "0", h: "2026-11-22", origin: "Promoción", credit: "0" }),
          compra("251"),
          r("FUTURO", "2026-10-23\n08:22:08", { h: "2026-11-23" }),
        ], summary(15, 3, 12, 0)),
      },
    },
    base,
    payments: [{ sheet: "ZELLE (OCT)", rows: [[], ["", "ZELLE"], PAY_H, pay("CONFIRMADO JM", "3"), pay("PENDIENTE CONFIRMACION", "6"), pay("CONFIRMADO JM", "6", "SIN ENLACE")] }],
    ...overrides,
  };
}

const all = (out: ReturnType<typeof projectCreditosHoy>) => out.panels.flatMap((p) => [...p.tasks, ...p.pending]);
const byUser = (out: ReturnType<typeof projectCreditosHoy>, user: string) => all(out).find((t) => t.user === user)!;
const panel = (out: ReturnType<typeof projectCreditosHoy>, id: string) => out.panels.find((p) => p.panel === id)!;

describe("Créditos TiviPlay (CONTROL P1/P2/P3 · KPI · cola de hoy · S0 v0.3 §7.1)", () => {
  const out = projectCreditosHoy(input());

  it("reproduces the sheet KPI formulas: Σ A and Σ J excluding COMPRA, data range ends at the summary block", () => {
    expect(panel(out, "P3").kpi).toEqual({ programados: 15, otorgados: 3, faltantes: 12, hoy: 11, avance: 20 });
    expect(panel(out, "P3").sheetKpi).toEqual({ programados: 15, otorgados: 3, faltantes: 12, hoy: 0 });
    expect(panel(out, "P3").dataRange).toEqual({ first: 3, last: 19 });
    expect(panel(out, "P1").kpi).toMatchObject({ programados: 2, otorgados: 1, faltantes: 1, hoy: 0 });
    expect(out.kpi).toMatchObject({ programados: 19, otorgados: 5, faltantes: 14, hoy: 12 });
  });

  it("COMPRA moves inventory only: never programmed, granted, missing, today or a client row", () => {
    const withoutCompra = projectCreditosHoy(input({ controls: { ...input().controls, P1: { sheet: "CONTROL (OCT) P1", rows: ctl("P1", [done("X1", "2026-11-22\n20:16:13", "2026-11-22"), r("X2", "2026-11-23\n01:39:44")], summary(2, 1, 1, 0)) } } }));
    expect(panel(out, "P1").kpi).toEqual(panel(withoutCompra, "P1").kpi);
    expect(all(out).some((t) => /COMPRA/.test(t.origin))).toBe(false);
    const compraToday = projectCreditosHoy(input({ controls: { ...input().controls, P2: { sheet: "CONTROL (OCT) P2", rows: ctl("P2", [[...compra("50").slice(0, 6), "2026-10-22\n10:00", "", "COMPRA", "0", "50"]]) } } }));
    expect(panel(compraToday, "P2").kpi).toMatchObject({ programados: 0, otorgados: 0, hoy: 0 });
    expect(panel(compraToday, "P2").tasks).toEqual([]);
  });

  it("builds today's queue from G = today, by header (G/H letters reported), excluding COMPRA and other days", () => {
    expect(panel(out, "P3").columns).toEqual({ date: "G", due: "H" });
    expect(panel(out, "P3").tasks.map((t) => t.user)).toEqual(["EJ3", "MOV", "USRA", "USRB", "USRC", "USRD", "USRE", "NOEXISTE", "DUP", "MAL", "SP", "PROMO"]);
    expect(panel(out, "P2").tasks.map((t) => t.user)).toEqual(["EJ2"]);
    expect(byUser(out, "EJ3")).toMatchObject({ row: 6, reference: "CONTROL (OCT) P3!G6", creditTime: "08:44", tc: 1, credit: 1, advisor: "HEIDY", recharge: "1 MES" });
  });

  it("executed = J (CREDITO) registered; H alone (anticipated) is not execution", () => {
    expect(byUser(out, "EJ3")).toMatchObject({ state: "EJECUTADO", newDue: "2026-11-22" });
    expect(byUser(out, "USRA").state).toBe("HABILITADO");
    expect(byUser(out, "USRA").reason).toMatch(/H anticipada \(2026-11-22\) sin CREDITO/);
    expect(byUser(out, "USRA").baseSync).toBeNull();
    expect(byUser(out, "PROMO")).toMatchObject({ state: "EJECUTADO" });
    expect(byUser(out, "PROMO").reason).toMatch(/sin consumo de crédito/);
    expect(byUser(out, "MAL").state).toBe("REQUIERE_REVISION");
  });

  it("SIN PAGAR is its own operational state, today and in previous days", () => {
    expect(byUser(out, "SP")).toMatchObject({ state: "SIN_PAGAR" });
    expect(panel(out, "P3").pending.map((t) => [t.user, t.state])).toEqual([["OLVIDO", "REQUIERE_REVISION"], ["DEUDA", "SIN_PAGAR"]]);
  });

  it("applies S0 §7.1 (cases A/B) and sends identity, panel and coverage contradictions to review", () => {
    expect(byUser(out, "USRA")).toMatchObject({ basis: "A" });
    expect(byUser(out, "USRB")).toMatchObject({ state: "HABILITADO", basis: "B" });
    expect(byUser(out, "USRD")).toMatchObject({ state: "NO_HABILITADO" });
    expect(byUser(out, "MOV").reason).toMatch(/Panel 1/);
    expect(byUser(out, "USRC").reason).toMatch(/excede la cobertura/);
    expect(byUser(out, "USRE").reason).toMatch(/BASE GENERAL \(fila 7\) indica Panel 1/);
    expect(byUser(out, "NOEXISTE").reason).toMatch(/no existe/);
    expect(byUser(out, "DUP").reason).toMatch(/2 veces/);
  });

  it("keeps the H ↔ BASE GENERAL F.VENCIMIENTO match for executed credits", () => {
    expect(byUser(out, "EJ3").baseSync).toMatchObject({ state: "ACTUALIZADA", baseDue: "2026-11-22" });
    expect(byUser(out, "EJ2").baseSync).toMatchObject({ state: "PENDIENTE", baseDue: "2026-10-22" });
    expect(byUser(out, "EJ2").baseSync!.detail).toMatch(/Llevar 2026-11-22 a BASE GENERAL \(fila 11\)/);
    expect(byUser(out, "PROMO").baseSync!.state).toBe("SIN_VERIFICAR");
    expect(byUser(projectCreditosHoy(input({ base: null })), "EJ3").baseSync!.state).toBe("SIN_VERIFICAR");
  });

  it("applies the same G rule to P1 and only warns about its dates", () => {
    expect(panel(out, "P1")).toMatchObject({ status: "OK", tasks: [] });
    expect(panel(out, "P1").warning).toMatch(/2026-11-22 a 2026-11-23.*G = hoy/);
    expect(panel(out, "P3").warning).toBeNull();
  });

  it("totals by state and never carries the password column", () => {
    expect(out.totals).toEqual({ HABILITADO: 2, NO_HABILITADO: 1, SIN_PAGAR: 1, REQUIERE_REVISION: 6, EJECUTADO: 3, total: 13 });
    expect(JSON.stringify(out)).not.toMatch(/SECRETO-NO-MOSTRAR|CONTRASE/);
  });

  it("without BASE GENERAL or payments nothing pending is decided; read errors block every panel", () => {
    const noFinance = projectCreditosHoy(input({ base: null }));
    expect(byUser(noFinance, "USRB").state).toBe("REQUIERE_REVISION");
    expect(byUser(noFinance, "EJ3").state).toBe("EJECUTADO");
    const failed = projectCreditosHoy(input({ readError: "No fue posible leer el libro de Google Sheets." }));
    expect(failed.panels.every((p) => p.status === "REQUIERE_REVISION" && p.kpi === null)).toBe(true);
  });

  it("resolves the month generically and parses plan duration with bonus", () => {
    const nov = projectCreditosHoy(input({ targetMonth: "2026-11", today: "2026-11-22", controls: { P1: { sheet: null, rows: null }, P2: { sheet: null, rows: null }, P3: { sheet: null, rows: null } } }));
    expect(nov.panels.every((p) => /2026-11/.test(p.reason!))).toBe(true);
    expect(planMonths("PLAN 3 MESES+1")).toBe(4);
    expect(planMonths("PLAN 12 MESES + 2")).toBe(14);
    expect(planMonths("SIN ASIGNAR")).toBeNull();
    expect(addMonths("2026-10-31", 1)).toBe("2026-11-30");
  });
});

describe("Créditos disponibles (USUARIOS LIBERADOS · ESTADO = DISPONIBLE) — datos sintéticos", () => {
  // Filas tal como las entrega el lector: [A LINE_ID, C USUARIO, E PANEL, F F.VENCIMIENTO, G ESTADO]. D (CONTRASEÑA) nunca se lee.
  const sheet = [
    ["USUARIOS LIBERADOS"],
    ["LINE_ID", "USUARIO", "PANEL", "F.VENCIMIENTO", "ESTADO"],
    ["", "SINT-VENCIDO", "PANEL 3", "2026-10-23", "VENCIDO"],
    ["", "SINT-USADO", "PANEL 3", "2026-11-01", "Liberado venta SINT-X"],
    ["900111", "SINT-DISP-1", "PANEL 3", "2026-11-21", "DISPONIBLE"],
    ["", "\tSINT-DISP-2 ", "panel 1", "2026-11-08", " disponible "],
  ];

  it("muestra solo ESTADO = DISPONIBLE, con LINE_ID cuando existe, USUARIO, PANEL y F.VENCIMIENTO", () => {
    const list = projectAvailableCredits(sheet)!;
    expect(list).toEqual([
      { row: 6, lineId: null, user: "SINT-DISP-2", panel: "PANEL 1", due: "2026-11-08" },
      { row: 5, lineId: "900111", user: "SINT-DISP-1", panel: "PANEL 3", due: "2026-11-21" },
    ]);
    expect(list.some((a) => a.user === "SINT-VENCIDO" || a.user === "SINT-USADO")).toBe(false);
  });

  it("no expone CONTRASEÑA: el registro solo tiene LINE_ID, USUARIO, PANEL y F.VENCIMIENTO (+ fila)", () => {
    for (const a of projectAvailableCredits(sheet)!) expect(Object.keys(a).sort()).toEqual(["due", "lineId", "panel", "row", "user"]);
  });

  it("cuando la hoja deja de decir DISPONIBLE, la siguiente lectura ya no lo muestra", () => {
    const next = sheet.map((r) => (r[1] === "SINT-DISP-1" ? [...r.slice(0, 4), "Liberado venta SINT-Y"] : r));
    expect(projectAvailableCredits(next)!.map((a) => a.user)).toEqual(["SINT-DISP-2"]);
  });

  it("lectura fallida o encabezados distintos → null (REQUIERE_REVISION), sin inventario inventado", () => {
    expect(projectAvailableCredits(null)).toBeNull();
    expect(projectAvailableCredits([["ASESOR", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA"], ["", "X", "PANEL 1", "2026-11-01", "DISPONIBLE"]])).toBeNull();
  });

  it("la cola de créditos no cambia al agregar el inventario", () => {
    const withInventory = projectCreditosHoy(input({ released: sheet }));
    const { available, ...queue } = withInventory;
    const { available: none, ...baseline } = projectCreditosHoy(input());
    expect(queue).toEqual(baseline);
    expect(none).toBeNull();
    expect(available).toHaveLength(2);
  });
});

describe("identidad verificable por panel (CONTROL con columnas desplazadas)", () => {
  it("bloquea el panel cuando los usuarios de BASE están en RECARGA y USUARIO trae otros valores, sin proyectar esos valores", () => {
    const shifted = (user: string, i: number) => ["1", "MANUELA", user, `PW-SHIFT-${i}`, "x", "panel", "2026-10-22", "2026-11-22", "Facturación", "1", "9", ""];
    const base = input().base!;
    const users = ["USRA", "USRB", "USRC", "USRD", "USRE", "EJ3"];
    const result = projectCreditosHoy(input({ base, controls: { ...input().controls, P3: { sheet: "CONTROL (OCT) P3", rows: ctl("P3", users.map(shifted)) } } }));
    const p3 = result.panels.find((p) => p.panel === "P3")!;
    expect(p3.status).toBe("REQUIERE_DECISION");
    expect(p3.reason).toMatch(/columnas desplazadas/);
    expect(p3.tasks).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("PW-SHIFT");
  });
});
