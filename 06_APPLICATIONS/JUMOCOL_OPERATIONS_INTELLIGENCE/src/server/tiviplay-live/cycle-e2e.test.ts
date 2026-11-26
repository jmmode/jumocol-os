import { describe, expect, it } from "vitest";

import { projectCreditosHoy, type CreditosHoyInput, type CycleDecision } from "./creditos-hoy-projection";

// Casos de aceptación E2E (27/10/2026) reproducidos con la forma de las hojas, sin datos de clientes ni de paneles:
// usuarios seudónimos; columnas, formatos de fecha y valores de estado tal como aparecen en el libro.
const CTL_H = ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO", "60", "OBSERVACIÓN"];
const ctl = (tc: string, advisor: string, recharge: string, user: string, g: string, h: string, origin: string, credit: string, obs = "") =>
  [tc, advisor, recharge, user, "OCULTO", "panel", g, h, origin, credit, "49", obs];
const BASE_H = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO"];
const b = (user: string, plan: string, panel: string, due: string, last: string, next: string) => ["1", "Cliente", "", "", "", "", plan, "1", "", "", "", "", user, "OCULTO", panel, due, last, next];
// Hojas de medio de pago: columnas de enlace y tarifa calculadas por la hoja.
const PAY_H = ["TC", "Cliente", "Monto", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "TIPO_SERVICIO", "PLAN_CANONICO", "DURACION_MESES", "PANTALLAS", "ESTADO_ENLACE", "MONEDA_PAGO", "VALOR_PAGO", "MESES_TARIFA_2026", "VALIDACION_TARIFA"];
const pay = (fila: string, plan: string, tarifa: string, moneda = "USD", valor = "15", conf = "CONFIRMADO JM") =>
  ["1", "Cliente", valor, "07-10-26", "Jorge", "FACTURACIÓN", "", conf, "CLIENTE", "1", fila, "PLAN PRINCIPAL", plan, "1", "1", "ENLAZADO", moneda, valor, "1", tarifa];

const TODAY = "2026-10-27";

function input(over: { base?: unknown[][]; decisions?: CycleDecision[]; extraControl?: unknown[][] } = {}): CreditosHoyInput {
  const base = over.base ?? [[" ", "GESTION"], BASE_H,
    b("CASO_A", "PLAN 1 MES", "PANEL 3", "2026-11-09", "07-10-26", "08-11-26"), // fila 3 · pago PayPal + crédito + BASE propagada
    b("CASO_PEND", "PLAN 3 MESES", "PANEL 3M", "2026-10-28", "10-10-26", "10-01-27"), // fila 4 · pago Zelle, crédito programado
    b("CASO_B", "PLAN 3 MESES+1", "Panel 3M", "2026-10-26", "05-09-26", "15-01-27"), // fila 5 · cobertura previa, sin pago del mes
    b("CASO_EXC", "PLAN 1 MES", "Panel 3M", "2026-10-18", "24-10-26", "24-10-26"), // fila 6 · LIBERADO sin crédito + pago COP
    b("SOLO_JM", "PLAN 1 MES", "PANEL 3", "2026-10-30", "20-10-26", "20-11-26"), // fila 7 · CONFIRMADO JM sin crédito
    b("TARIFA", "PLAN 1 MES", "PANEL 3", "2026-11-15", "15-10-26", "15-10-26"), // fila 8 · crédito + BASE, pago con tarifa sin validar
  ];
  return {
    today: TODAY,
    targetMonth: "2026-10",
    controls: {
      P1: { sheet: "CONTROL (OCT) P1", rows: [["P1"], CTL_H] },
      P2: { sheet: "CONTROL (OCT) P2", rows: [["P2"], CTL_H] },
      P3: { sheet: "CONTROL (OCT) P3", rows: [["CONTROL VENCIMIENTO OCTUBRE PANEL 3"], CTL_H,
        ctl("1", "JORGE", "LIBERADO", "CASO_EXC", "2026-10-03\n12:29:09", "2026-11-03", "Promoción", "0"), // fila 3
        ctl("1", "HEIDY", "1 MES", "CASO_A", "2026-10-09\n14:16:52", "2026-11-09", "Facturación", "1"), // fila 4
        ctl("1", "JORGE", "1 MES", "TARIFA", "2026-10-15\n10:00:00", "2026-11-15", "Facturación", "1"), // fila 5
        ctl("1", "MANUELA", "1 MES", "CASO_B", "2026-10-26\n08:54:02", "2026-11-26", "FACTURACION", "1"), // fila 6
        ctl("1", "", "", "CASO_PEND", "2026-10-28\n17:32:43", "", "", ""), // fila 7
        ctl("1", "", "", "SOLO_JM", "2026-10-30\n10:00:00", "", "", ""), // fila 8
        ...(over.extraControl ?? []),
      ] },
    },
    base,
    payments: [
      { sheet: "PAYPAL (OCT)", rows: [[" ", "PAYPAL"], PAY_H, pay("3", "PLAN 1 MES", "COINCIDE PLAN")] },
      { sheet: "ZELLE (OCT)", rows: [[], [" ", "ZELLE"], PAY_H, pay("4", "PLAN 3 MESES", "COINCIDE PLAN", "USD", "48"), pay("7", "PLAN 1 MES", "COINCIDE PLAN")] },
      { sheet: "TRANSF (OCT)", rows: [[" ", "TRANSF"], PAY_H, pay("6", "PLAN 1 MES", "MONEDA NO USD", "COP", "39900"), pay("8", "PLAN 1 MES", "TARIFA ≠ PLAN", "USD", "12")] },
    ],
    decisions: over.decisions,
  };
}

const cycle = (out: ReturnType<typeof projectCreditosHoy>, user: string) => out.cycle.items.filter((i) => i.user === user);
const one = (out: ReturnType<typeof projectCreditosHoy>, user: string) => { const c = cycle(out, user); expect(c).toHaveLength(1); return c[0]; };
const decide = (subject: string, fingerprint: string, action: CycleDecision["action"], value: string | null = null): CycleDecision => ({ subject, fingerprint, action, value, by: "julian", at: "2026-10-27T10:00:00Z" });

describe("Cierre E2E del ciclo · semáforo VERDE / AMARILLO · excepciones accionables", () => {
  const out = projectCreditosHoy(input());

  it("Caso A completo (pago confirmado + crédito + H en CONTROL + H en BASE) → VERDE", () => {
    expect(one(out, "CASO_A")).toMatchObject({ color: "VERDE", step: "CERRADO", basis: "A", newDue: "2026-11-09" });
  });

  it("pago confirmado con crédito pendiente → AMARILLO (crédito por ejecutar)", () => {
    expect(one(out, "CASO_PEND")).toMatchObject({ color: "AMARILLO", step: "CREDITO", basis: "A", owner: "Asesor" });
    expect(one(out, "CASO_PEND").cause).toMatch(/programado para 2026-10-28/);
  });

  it("Caso B (cobertura previa vigente, sin pago del mes) habilita; cierra VERDE solo cuando BASE tiene la nueva H", () => {
    expect(one(out, "CASO_B")).toMatchObject({ color: "AMARILLO", step: "BASE", basis: "B", owner: "Back Office" });
    expect(one(out, "CASO_B").cause).toMatch(/Llevar 2026-11-26 a BASE GENERAL \(fila 5\)/);
    const base = input().base!.map((r) => (r as string[])[12] === "CASO_B" ? b("CASO_B", "PLAN 3 MESES+1", "Panel 3M", "2026-11-26", "05-09-26", "15-01-27") : r);
    expect(one(projectCreditosHoy(input({ base })), "CASO_B")).toMatchObject({ color: "VERDE", basis: "B" });
  });

  it("CONFIRMADO JM por sí solo nunca produce VERDE", () => {
    expect(one(out, "SOLO_JM")).toMatchObject({ color: "AMARILLO", step: "CREDITO", basis: "A" });
    for (const it of out.cycle.items.filter((i) => i.color === "VERDE")) {
      expect(it.credit ?? 0).toBeGreaterThan(0);
      expect(it.baseSync?.state).toBe("ACTUALIZADA");
      expect(it.exception).toBeNull();
    }
  });

  it("inconsistencia real (LIBERADO con H y CREDITO 0) → tarjeta con causa exacta, evidencia, propuesta y 3 acciones", () => {
    const c = one(out, "CASO_EXC");
    expect(c).toMatchObject({ color: "AMARILLO", step: "DIRECCION", owner: "Dirección" });
    expect(c.exception).toMatchObject({ kind: "EXTENSION", subject: "EXTENSION:P3:3:CASO_EXC" });
    expect(c.exception!.title).toMatch(/LIBERADO \(Promoción\) registra nuevo vencimiento 2026-11-03 con CREDITO 0/);
    expect(c.exception!.evidence.join(" ")).toMatch(/TC 1 · RECARGA LIBERADO · ORIGEN Promoción · CREDITO 0/);
    expect(c.exception!.proposal).toMatch(/Aprobar la extensión como excepción/);
    expect(c.exception!.correct!.options.map((o) => o.value)).toEqual(["FALTA_CREDITO", "NO_ES_SERVICIO"]);
    expect(out.cycle.exceptions.map((e) => e.subject)).toContain("EXTENSION:P3:3:CASO_EXC");
    // En la cola diaria (pendiente de días anteriores) tampoco aparece como «dar crédito».
    const task = out.panels[2].pending.find((t) => t.user === "CASO_EXC")!;
    expect(task).toMatchObject({ state: "REQUIERE_REVISION" });
    expect(task.exception?.kind).toBe("EXTENSION");
  });

  it("una decisión ejecutada reevalúa el motor: CONFIRMAR · CORREGIR · RECHAZAR", () => {
    const ex = one(out, "CASO_EXC").exception!;
    const confirmed = projectCreditosHoy(input({ decisions: [decide(ex.subject, ex.fingerprint, "CONFIRMAR")] }));
    expect(one(confirmed, "CASO_EXC")).toMatchObject({ color: "AMARILLO", step: "BASE", basis: "E", exception: null });
    expect(one(confirmed, "CASO_EXC").cause).toMatch(/Llevar 2026-11-03 a BASE GENERAL \(fila 6\)/);
    expect(confirmed.panels[2].pending.find((t) => t.user === "CASO_EXC")).toMatchObject({ state: "EJECUTADO", basis: "E" });
    expect(confirmed.cycle.exceptions.some((e) => e.subject === ex.subject)).toBe(false);

    const rejected = projectCreditosHoy(input({ decisions: [decide(ex.subject, ex.fingerprint, "RECHAZAR")] }));
    expect(one(rejected, "CASO_EXC")).toMatchObject({ color: "AMARILLO", step: "CREDITO" });
    expect(rejected.panels[2].pending.find((t) => t.user === "CASO_EXC")).toMatchObject({ state: "NO_HABILITADO" });

    const excluded = projectCreditosHoy(input({ decisions: [decide(ex.subject, ex.fingerprint, "CORREGIR", "NO_ES_SERVICIO")] }));
    expect(cycle(excluded, "CASO_EXC")).toEqual([]);
    expect(excluded.panels[2].pending.find((t) => t.user === "CASO_EXC")).toBeUndefined();

    const missingCredit = projectCreditosHoy(input({ decisions: [decide(ex.subject, ex.fingerprint, "CORREGIR", "FALTA_CREDITO")] }));
    expect(one(missingCredit, "CASO_EXC")).toMatchObject({ color: "AMARILLO", step: "CREDITO", basis: "B" });

    // Si la evidencia de la hoja cambia, la decisión deja de aplicar y la tarjeta vuelve.
    const stale = projectCreditosHoy(input({ decisions: [decide(ex.subject, "OTRA|EVIDENCIA", "CONFIRMAR")] }));
    expect(one(stale, "CASO_EXC").step).toBe("DIRECCION");
  });

  it("pago confirmado con tarifa sin validar y sin cobertura previa → tarjeta TARIFA; CONFIRMAR la cierra en VERDE", () => {
    const c = one(out, "TARIFA");
    expect(c).toMatchObject({ color: "AMARILLO", step: "DIRECCION" });
    expect(c.exception).toMatchObject({ kind: "TARIFA", subject: "TARIFA:TRANSF (OCT):4" });
    expect(c.exception!.correct!.options.map((o) => o.value)).toContain("PLAN 1 MES");
    const ok = projectCreditosHoy(input({ decisions: [decide(c.exception!.subject, c.exception!.fingerprint, "CONFIRMAR")] }));
    expect(one(ok, "TARIFA")).toMatchObject({ color: "VERDE", basis: "A" });
    const planChange = projectCreditosHoy(input({ decisions: [decide(c.exception!.subject, c.exception!.fingerprint, "CORREGIR", "PLAN 3 MESES")] }));
    expect(one(planChange, "TARIFA")).toMatchObject({ color: "AMARILLO", step: "PLAN", owner: "Back Office" });
  });

  it("panel contradictorio y USUARIO repetido: propuesta concreta y CORREGIR con opciones válidas", () => {
    const base = [...input().base!, b("DOBLE", "PLAN 1 MES", "PANEL 1", "", "", "20-11-26"), b("DOBLE", "PLAN 1 MES", "PANEL 3", "", "", "20-11-26"), b("OTROPANEL", "PLAN 1 MES", "PANEL 1", "", "", "20-11-26")];
    const extra = [ctl("1", "", "", "DOBLE", "2026-10-27\n09:00", "", "", ""), ctl("1", "", "", "OTROPANEL", "2026-10-27\n10:00", "", "", "")];
    const o = projectCreditosHoy(input({ base, extraControl: extra }));
    const dup = one(o, "DOBLE").exception!;
    expect(dup).toMatchObject({ kind: "DUPLICADO", proposal: "Usar la fila 10 (única registrada en P3)." });
    expect(dup.correct!.options.map((x) => x.value)).toEqual(["9", "10"]);
    const pnl = one(o, "OTROPANEL").exception!;
    expect(pnl.kind).toBe("PANEL");
    const solved = projectCreditosHoy(input({ base, extraControl: extra, decisions: [decide(dup.subject, dup.fingerprint, "CONFIRMAR"), decide(pnl.subject, pnl.fingerprint, "CORREGIR", "P1")] }));
    expect(one(solved, "DOBLE")).toMatchObject({ step: "CREDITO", basis: "B" });
    expect(solved.panels[2].tasks.find((t) => t.user === "OTROPANEL")).toMatchObject({ state: "NO_HABILITADO" });
    expect(solved.panels[2].tasks.find((t) => t.user === "OTROPANEL")!.reason).toMatch(/registrar y ejecutar el crédito en CONTROL P1/);
  });

  it("no crea ciclos fuera de CONTROL ni expone la columna de contraseña", () => {
    expect(out.cycle.items.every((i) => i.panel === "P3")).toBe(true);
    expect(out.cycle.items).toHaveLength(6);
    expect(JSON.stringify(out)).not.toMatch(/OCULTO|CONTRASE/);
  });
});
