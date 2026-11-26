import { describe, expect, it } from "vitest";

import { classifyMultipanel, findReleasedRow, parseReleasedRanges, projectReconciliation, RELEASED_COLUMNS, releasedSheetRow, releasedSheetTsv, residualTaskId, validateDecision, type Panel, type ReconCase, type ReconDataset } from "./conciliacion-model";

// Regresión de la regla de vigencia: EXISTENCIA MULTIPANEL ≠ ACTIVIDAD MULTIPANEL. Datos sintéticos.
const CUT = "2026-10-27";
const VIGENTE = "2026-11-20";
const VENCIDA = "2026-05-01";
const ID: Record<Panel, string> = { P1: "910001", P2: "910002", P3: "910003" };

function multipanel(exp: Partial<Record<Panel, string>>, proposal: Panel | null = null): ReconCase {
  const panels = Object.keys(exp) as Panel[];
  return {
    id: "MP:SINTETICO", kind: "MULTIPANEL", username: "SINTETICO", baseRows: [9], title: "t", contradiction: "c", evidence: [], fingerprint: "fp", active: true,
    lines: panels.map((p, i) => ({ panel: p, row: i + 1, lineId: ID[p], expiration: exp[p]!, lastConnection: null })),
    options: panels.map((p) => ({ id: `KEEP_${p}`, label: `CONSERVAR ${p}`, keep: p, effect: "e", baseUpdates: [{ row: 9, field: "PANEL" as const, from: "x", to: `PANEL ${p[1]}` }] })),
    proposal: proposal ? `KEEP_${proposal}` : null,
  };
}
function project(c: ReconCase) {
  const dataset: ReconDataset = { cut: CUT, generatedAt: "2026-10-27T12:00:00Z", cases: [c], tasks: [], services: [{ username: "SINTETICO", state: "EXCEPCION", panel: null, expiration: null, baseRow: 9 }] };
  return projectReconciliation(dataset, [], []);
}
const releases = (r: ReturnType<typeof project>) => r.tasks.filter((t) => t.kind === "LIBERAR").map((t) => `${t.releasePanel}:${t.line?.lineId}`);
const gerencia = (r: ReturnType<typeof project>) => r.cases.filter((c) => c.status === "PENDIENTE").length;

describe("Motor multipanel: regla de vigencia contra el corte", () => {
  it("PATRÓN VALIDADO: P1 vencido + P3 vigente → P3 canónico, P1 residual, cero decisión de Gerencia, tarea LIBERAR P1", () => {
    const c = multipanel({ P1: VENCIDA, P3: VIGENTE }, "P1"); // aun con una propuesta contraria, manda la vigencia
    const r = project(c);
    expect(classifyMultipanel(c, CUT)).toMatchObject({ mode: "UNICA_VIGENTE", keep: "P3" });
    expect(gerencia(r)).toBe(0);
    expect(r.cases[0]).toMatchObject({ status: "AUTOMATICO", chosen: { keep: "P3" } });
    expect(r.cases[0].decision?.by).toMatch(/SISTEMA/);
    expect(releases(r)).toEqual([`P1:${ID.P1}`]);
    const task = r.tasks.find((t) => t.kind === "LIBERAR")!;
    expect(task).toMatchObject({ id: residualTaskId("MP:SINTETICO", c.lines[0]), title: "LIBERAR PANEL 1 — SINTETICO", username: "SINTETICO", keepPanel: "P3", releasePanel: "P1" });
    expect(r.baseSync).toEqual([expect.objectContaining({ row: 9, field: "PANEL", to: "PANEL 3" })]);
    expect(r.services).toMatchObject({ ACTIVO: 1, EXCEPCION: 0 });
    expect(validateDecision(c, "KEEP_P1", "fp", null, null, null, false, CUT)).toMatch(/regla de vigencia/);
  });

  it("P1 vigente + P3 vencido → P1 canónico, LIBERAR P3, sin Gerencia", () => {
    const r = project(multipanel({ P1: VIGENTE, P3: VENCIDA }));
    expect(gerencia(r)).toBe(0);
    expect(r.cases[0].chosen?.keep).toBe("P1");
    expect(releases(r)).toEqual([`P3:${ID.P3}`]);
  });

  it("P1 y P3 vigentes → Gerencia, con solo los dos paneles vigentes como CONSERVAR y sin tareas", () => {
    const r = project(multipanel({ P1: VIGENTE, P3: "2026-11-05" }, "P3"));
    expect(gerencia(r)).toBe(1);
    expect(r.cases[0].options.map((o) => o.id)).toEqual(["KEEP_P1", "KEEP_P3"]);
    expect(r.cases[0].proposal).toBe("KEEP_P3");
    expect(releases(r)).toEqual([]);
  });

  it("P1 y P3 vencidos: con evidencia BASE/CONTROL se resuelve sin Gerencia; sin evidencia queda como ambigüedad real", () => {
    const withEvidence = project(multipanel({ P1: VENCIDA, P3: "2026-09-01" }, "P3"));
    expect(gerencia(withEvidence)).toBe(0);
    expect(withEvidence.cases[0]).toMatchObject({ mode: "TODAS_VENCIDAS_EVIDENCIA", chosen: { keep: "P3" } });
    expect(releases(withEvidence)).toEqual([`P1:${ID.P1}`]);
    expect(withEvidence.services).toMatchObject({ INACTIVO: 1, EXCEPCION: 0 });
    const ambiguous = project(multipanel({ P1: VENCIDA, P3: "2026-09-01" }));
    expect(gerencia(ambiguous)).toBe(1);
    expect(ambiguous.cases[0].mode).toBe("TODAS_VENCIDAS_AMBIGUO");
  });

  it("tres paneles con uno solo vigente → ese panel canónico y dos LIBERAR", () => {
    const r = project(multipanel({ P1: VENCIDA, P2: VIGENTE, P3: "2026-08-14" }));
    expect(gerencia(r)).toBe(0);
    expect(r.cases[0].chosen?.keep).toBe("P2");
    expect(releases(r).sort()).toEqual([`P1:${ID.P1}`, `P3:${ID.P3}`]);
  });

  it("tres paneles con dos vigentes → Gerencia solo entre los vigentes; la línea vencida no es opción CONSERVAR", () => {
    const c = multipanel({ P1: VIGENTE, P2: VENCIDA, P3: "2026-11-01" });
    const r = project(c);
    expect(gerencia(r)).toBe(1);
    expect(r.cases[0].options.map((o) => o.keep)).toEqual(["P1", "P3"]);
    expect(validateDecision(c, "KEEP_P2", "fp", null, null, null, false, CUT)).toMatch(/vigente/);
    expect(validateDecision(c, "KEEP_P3", "fp", null, null, null, false, CUT)).toBeNull();
    // Tras decidir P3: se liberan P1 (vigente descartada) y P2 (vencida).
    const decided = projectReconciliation({ cut: CUT, generatedAt: "x", cases: [c], tasks: [], services: [] }, [{ id: 1, caseId: c.id, fingerprint: "fp", option: "KEEP_P3", by: "julian", at: "t", supersedes: null, reason: null }], []);
    expect(releases(decided).sort()).toEqual([`P1:${ID.P1}`, `P2:${ID.P2}`]);
  });
});

describe("USUARIOS LIBERADOS · contrato A..H (datos sintéticos)", () => {
  const task = { kind: "LIBERAR" as const, username: "SINTETICO9", line: { panel: "P3" as const, row: 19, lineId: "900777", expiration: "2026-11-21", lastConnection: null } };

  it("1 · la fila preparada sigue el orden A..H; D (CONTRASEÑA) y H (OBSERVACIONES) vacías; ESTADO = DISPONIBLE", () => {
    const row = releasedSheetRow(task, "Jorge Asesor")!;
    expect(row).toEqual({ lineId: "900777", advisor: "Jorge", username: "SINTETICO9", password: "", panel: "PANEL 3", date: "2026-11-21", status: "DISPONIBLE", observations: "" });
    expect(releasedSheetTsv(row).split("\t")).toEqual(["900777", "Jorge", "SINTETICO9", "", "PANEL 3", "2026-11-21", "DISPONIBLE", ""]);
    expect(RELEASED_COLUMNS).toEqual(["A LINE_ID", "B ASESOR", "C USUARIO", "D CONTRASEÑA", "E PANEL", "F F.VENCIMIENTO", "G ESTADO", "H OBSERVACIONES"]);
    expect(releasedSheetRow(task, "Dirección")?.advisor).toBe("");
    expect(releasedSheetRow({ kind: "CREDENCIAL", username: "X" }, "Jorge")).toBeNull();
  });

  it("2/3/6 · LINE_ID se toma de A; H y D no se leen ni participan", () => {
    // El lector solo entrega A, C y E:G (fila 1 título, fila 2 encabezados).
    const a = [["USUARIOS LIBERADOS"], ["LINE_ID"], [""], ["900777"]];
    const c = [[], ["USUARIO"], ["SINTETICO8"], ["SINTETICO9"]];
    const efg = [[], ["PANEL", "F.VENCIMIENTO", "ESTADO"], ["PANEL 3", "2026-10-23", "VENCIDO"], ["PANEL 3", "2026-11-21", "DISPONIBLE"]];
    const rows = parseReleasedRanges(a, c, efg);
    expect(rows.map((r) => [r.row, r.lineId, r.username, r.status])).toEqual([[2, "LINE_ID", "USUARIO", "ESTADO"], [3, "", "SINTETICO8", "VENCIDO"], [4, "900777", "SINTETICO9", "DISPONIBLE"]]);
    for (const r of rows) expect(Object.keys(r).sort()).toEqual(["date", "lineId", "panel", "row", "status", "username"]);
    // Una nota en OBSERVACIONES nunca llega al modelo: no puede usarse como LINE_ID.
    expect(rows.some((r) => r.lineId === "Liberado venta 900777")).toBe(false);
  });

  it("5 · registro nuevo con LINE_ID: se reconoce por PANEL + LINE_ID", () => {
    const rows = [{ row: 12, lineId: "900777", username: "OTRO-USUARIO", panel: "PANEL 3", date: "2026-11-30", status: "DISPONIBLE" }];
    expect(findReleasedRow(rows, task)?.row).toBe(12);
    expect(findReleasedRow([{ ...rows[0], panel: "PANEL 1" }], task)).toBeNull();
    // Mismo USUARIO pero otro LINE_ID: no es esta línea.
    expect(findReleasedRow([{ ...rows[0], username: "SINTETICO9", lineId: "900888" }], task)).toBeNull();
  });

  it("4 · histórico sin LINE_ID: fallback USUARIO + PANEL; ambigüedad se desempata por fecha o no se elige", () => {
    const legacy = { row: 9, lineId: "", username: "sintetico9", panel: "PANEL 3", date: "2026-11-21", status: "DISPONIBLE" };
    expect(findReleasedRow([legacy], task)?.row).toBe(9);
    expect(findReleasedRow([{ ...legacy, date: "2026-11-30" }], task)?.row).toBe(9);
    const older = { ...legacy, row: 5, date: "2026-09-01", status: "VENCIDO" };
    expect(findReleasedRow([older, legacy], task)?.row).toBe(9);
    expect(findReleasedRow([older, { ...older, row: 6 }], task)).toBeNull();
    expect(findReleasedRow([{ ...legacy, panel: "PANEL 1" }], task)).toBeNull();
    expect(findReleasedRow(null, task)).toBeNull();
  });
});
