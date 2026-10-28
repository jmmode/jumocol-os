import { describe, expect, it } from "vitest";

import { classifyMultipanel, projectReconciliation, residualTaskId, validateDecision, type Panel, type ReconCase, type ReconDataset } from "./conciliacion-model";

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
