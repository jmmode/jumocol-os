import { describe, expect, it } from "vitest";

import { addMonths, planMonths, projectCreditosHoy, type CreditosHoyInput } from "./creditos-hoy-projection";

// Datos sintéticos con la forma real de las hojas (encabezado en la fila 2, contraseña en E). Sin datos de clientes.
const H = ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO", "60", "OBSERVACIÓN"];
const ctl = (title: string, rows: string[][]) => [[title], H, ...rows];
const r = (user: string, g: string, h = "", origin = "Facturación", credit = "1", obs = "") => ["1", "HEIDY", "1 MES", user, "SECRETO-NO-MOSTRAR", "panel", g, h, origin, credit, "9", obs];

const BASE_H = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO"];
const b = (user: string, panel: string, plan: string, next: string, tc = "1") => [tc, "Cliente", "", "", "", "", plan, "1", "", "", "", "", user, "x", panel, "", "", next];
const PAY_H = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "TIPO_SERVICIO", "PLAN_CANONICO", "DURACION_MESES", "PANTALLAS", "ESTADO_ENLACE"];
const pay = (conf: string, fila: string, link = "ENLAZADO") => ["1", "Cliente", "15", "20-10-26", "JORGE", "", "", conf, "", "1", fila, "", "", "", "", link];

const TODAY = "2026-10-22";

function input(overrides: Partial<CreditosHoyInput> = {}): CreditosHoyInput {
  const base = [[" ", "BASE"], BASE_H,
    b("USRA", "PANEL 3", "PLAN 1 MES", "01-11-26"), // fila 3 · caso A (pago confirmado enlazado)
    b("USRB", "PANEL 3M", "PLAN 3 MESES+1", "10-01-27"), // fila 4 · caso B (cubre hasta 22/02/27)
    b("USRC", "PANEL 3", "PLAN 1 MES", "15-03-27"), // fila 5 · cobertura excede plan
    b("USRD", "PANEL 3", "PLAN 1 MES", "20-10-26"), // fila 6 · sin pago ni cobertura
    b("USRE", "PANEL 1", "PLAN 1 MES", "01-12-26"), // fila 7 · contradicción de panel
    b("DUP", "PANEL 3", "PLAN 1 MES", "01-12-26"), b("DUP", "PANEL 3", "PLAN 1 MES", "01-12-26"), // repetido
  ];
  return {
    today: TODAY,
    targetMonth: "2026-10",
    controls: {
      // P1 real: todas las FECHA están en noviembre aunque la hoja es de octubre.
      P1: { sheet: "CONTROL (OCT) P1", rows: ctl("P1", [r("X1", "2026-11-22\n20:16:13", "2026-11-22"), r("X2", "2026-11-23\n01:39:44")]) },
      P2: { sheet: "CONTROL (OCT) P2", rows: ctl("P2", [r("EJ2", "2026-10-22\n15:02:34", "2026-11-22"), r("FUT", "2026-10-29\n13:19:46")]) },
      P3: {
        sheet: "CONTROL (OCT) P3",
        rows: ctl("P3", [
          r("AYER", "2026-10-21\n20:31:04", "2026-11-21"),
          r("EJ3", "2026-10-22\n08:44:38", "2026-11-22"),
          r("MOV", "2026-10-22\n09:05:55", "", "", "0", "PANEL 1"),
          r("USRA", "2026-10-22\n10:00:00"),
          r("USRB", "2026-10-22\n11:00:00"),
          r("USRC", "2026-10-22\n12:00:00"),
          r("USRD", "2026-10-22\n13:00:00", "", "Sin Pagar", "0"),
          r("USRE", "2026-10-22\n14:00:00"),
          r("NOEXISTE", "2026-10-22\n15:00:00"),
          r("DUP", "2026-10-22\n16:00:00"),
          r("MAL", "2026-10-22\n17:00:00", "2026-10-01"),
          ["", "", "", "", "", "", "", "", "COMPRA", "0", "251"],
        ]),
      },
    },
    base,
    payments: [{ sheet: "ZELLE (OCT)", rows: [[], ["", "ZELLE"], PAY_H, pay("CONFIRMADO JM", "3"), pay("PENDIENTE CONFIRMACION", "6"), pay("CONFIRMADO JM", "6", "SIN ENLACE")] }],
    ...overrides,
  };
}

const byUser = (out: ReturnType<typeof projectCreditosHoy>, user: string) => out.panels.flatMap((p) => p.tasks).find((t) => t.user === user)!;

describe("CRÉDITOS DE HOY (CONTROL P1/P2/P3, G = hoy, S0 v0.3 §7.1)", () => {
  const out = projectCreditosHoy(input());

  it("takes only G = today as the day's technical population, by header (G/H letters reported)", () => {
    const p3 = out.panels.find((p) => p.panel === "P3")!;
    expect(p3.columns).toEqual({ date: "G", due: "H" });
    expect(p3.tasks.map((t) => t.user)).toEqual(["EJ3", "MOV", "USRA", "USRB", "USRC", "USRD", "USRE", "NOEXISTE", "DUP", "MAL"]);
    expect(out.panels.find((p) => p.panel === "P2")!.tasks.map((t) => t.user)).toEqual(["EJ2"]);
    expect(p3.tasks[0]).toMatchObject({ row: 4, reference: "CONTROL (OCT) P3!G4", creditTime: "08:44", advisor: "HEIDY", recharge: "1 MES" });
  });

  it("marks H after G as EJECUTADO (not as BASE GENERAL updated)", () => {
    expect(byUser(out, "EJ3")).toMatchObject({ state: "EJECUTADO", newDue: "2026-11-22" });
    expect(byUser(out, "EJ2").state).toBe("EJECUTADO");
    expect(byUser(out, "EJ3").reason).toMatch(/BASE GENERAL se actualiza aparte/);
  });

  it("applies S0 §7.1 cases A and B and leaves the rest NO HABILITADO", () => {
    expect(byUser(out, "USRA")).toMatchObject({ state: "HABILITADO", basis: "A" });
    expect(byUser(out, "USRB")).toMatchObject({ state: "HABILITADO", basis: "B" });
    expect(byUser(out, "USRD")).toMatchObject({ state: "NO_HABILITADO", basis: null }); // PENDIENTE y SIN ENLACE no habilitan
  });

  it("sends identity, panel, coverage and source contradictions to REQUIERE_REVISION", () => {
    expect(byUser(out, "MOV").reason).toMatch(/Panel 1/);
    expect(byUser(out, "USRC").reason).toMatch(/excede la cobertura/);
    expect(byUser(out, "USRE").reason).toMatch(/contradicción de panel/);
    expect(byUser(out, "NOEXISTE").reason).toMatch(/no existe/);
    expect(byUser(out, "DUP").reason).toMatch(/2 veces/);
    expect(byUser(out, "MAL").reason).toMatch(/no es posterior/);
    for (const u of ["MOV", "USRC", "USRE", "NOEXISTE", "DUP", "MAL"]) expect(byUser(out, u).state).toBe("REQUIERE_REVISION");
  });

  it("does not show 0 for a panel whose G dates are outside the sheet month (real P1)", () => {
    const p1 = out.panels.find((p) => p.panel === "P1")!;
    expect(p1.status).toBe("REQUIERE_REVISION");
    expect(p1.reason).toMatch(/no corresponde al mes 2026-10.*2026-11-22 a 2026-11-23/);
    expect(p1.tasks).toEqual([]);
  });

  it("totals by state and never carries the password column", () => {
    expect(out.totals).toEqual({ HABILITADO: 2, NO_HABILITADO: 1, REQUIERE_REVISION: 6, EJECUTADO: 2, total: 11 });
    expect(JSON.stringify(out)).not.toMatch(/SECRETO-NO-MOSTRAR|CONTRASE/);
  });

  it("without BASE GENERAL or payment sheets nothing pending is decided", () => {
    const noFinance = projectCreditosHoy(input({ base: null }));
    expect(byUser(noFinance, "USRA").state).toBe("REQUIERE_REVISION");
    expect(byUser(noFinance, "EJ3").state).toBe("EJECUTADO");
    expect(noFinance.financeSource).toBe("REQUIERE_REVISION");
    const failed = projectCreditosHoy(input({ readError: "No fue posible leer el libro de Google Sheets." }));
    expect(failed.panels.every((p) => p.status === "REQUIERE_REVISION" && p.tasks.length === 0)).toBe(true);
  });

  it("resolves the month generically (no October hardcode) and reports missing sheets", () => {
    const nov = projectCreditosHoy(input({ targetMonth: "2026-11", today: "2026-11-22", controls: { P1: { sheet: null, rows: null }, P2: { sheet: null, rows: null }, P3: { sheet: null, rows: null } } }));
    expect(nov.panels.every((p) => p.status === "REQUIERE_REVISION" && /2026-11/.test(p.reason!))).toBe(true);
  });

  it("parses plan duration including registered bonus", () => {
    expect(planMonths("PLAN 3 MESES+1")).toBe(4);
    expect(planMonths("PLAN 12 MESES + 2")).toBe(14);
    expect(planMonths("PLAN 1 MES")).toBe(1);
    expect(planMonths("SIN ASIGNAR")).toBeNull();
    expect(addMonths("2026-10-31", 1)).toBe("2026-11-30");
  });
});
