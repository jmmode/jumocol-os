import { describe, expect, it } from "vitest";
import { projectReconciliation, type ReconCase, type ReconDataset, type ReconDecision } from "./conciliacion-model";

const TODAY = "2026-11-04";
const caseFor = (dates: [string, string]): ReconCase => ({
  id: "MP:TEST", kind: "MULTIPANEL", username: "USER-TEST", baseRows: [11],
  title: "Historial multipanel", contradiction: "P1/P3", evidence: [], fingerprint: "fp", active: true,
  lines: [
    { panel: "P1", lineId: "LINE-P1", row: 29, expiration: dates[0], lastConnection: null },
    { panel: "P3", lineId: "LINE-P3", row: 37, expiration: dates[1], lastConnection: null },
  ],
  options: [
    { id: "KEEP_P1", label: "P1", keep: "P1", effect: "m", baseUpdates: [{ row: 11, field: "PANEL", from: "PANEL 3", to: "PANEL 1" }] },
    { id: "KEEP_P3", label: "P3", keep: "P3", effect: "m", baseUpdates: [{ row: 11, field: "PANEL", from: "PANEL 1", to: "PANEL 3" }] },
  ],
  proposal: "KEEP_P3",
});
const dataset = (c: ReconCase): ReconDataset => ({
  cut: "2026-10-27", generatedAt: "2026-10-27T00:00:00Z",
  cases: [c], tasks: [], services: [{ username: "USER-TEST", state: "EXCEPCION", panel: null, expiration: null, baseRow: 11 }],
});
const releaseTasks = (r: ReturnType<typeof projectReconciliation>) => r.tasks.filter((t) => t.kind === "LIBERAR" && t.status !== "EJECUTADO");

describe("conciliación: líneas históricas no son tareas de liberación", () => {
  it("P1 vencida y P3 vigente: conserva P3, ningún LIBERAR, BASE solo propuesta", () => {
    const r = projectReconciliation(dataset(caseFor(["2026-09-28", "2026-12-10"])), [], [], TODAY);
    expect(r.cases[0].mode).toBe("UNICA_VIGENTE");
    expect(r.cases[0].chosen?.keep).toBe("P3");
    expect(releaseTasks(r)).toHaveLength(0);
    expect(r.cases[0].lines).toHaveLength(2);
    expect(r.baseSync).toEqual([expect.objectContaining({ field: "PANEL", to: "PANEL 3" })]);
  });

  it("dos líneas vigentes: revisión humana; después solo LIBERAR segunda línea vigente", () => {
    const data = dataset(caseFor(["2026-11-30", "2026-12-10"]));
    const pending = projectReconciliation(data, [], [], TODAY);
    expect(pending.cases[0].mode).toBe("VARIAS_VIGENTES");
    expect(pending.cases[0].status).toBe("PENDIENTE");
    const choices: ReconDecision[] = [{ id: 1, caseId: "MP:TEST", fingerprint: "fp", option: "KEEP_P3",
      by: "ADMIN", at: "2026-11-04T14:00:00Z", supersedes: null, reason: null }];
    const decided = projectReconciliation(data, choices, [], TODAY);
    expect(releaseTasks(decided).map((t) => t.releasePanel)).toEqual(["P1"]);
  });

  it("ambas líneas vencidas: historial sin LIBERAR ni propuesta de cambio de panel en BASE", () => {
    const r = projectReconciliation(dataset(caseFor(["2026-09-28", "2026-10-25"])), [], [], TODAY);
    expect(releaseTasks(r)).toHaveLength(0);
    expect(r.baseSync).toHaveLength(0);
    expect(r.services.INACTIVO).toBe(1);
  });

  it("tareas históricas ya precargadas no generan tráfico; eventos ejecutados se preservan", () => {
    const c = caseFor(["2026-09-28", "2026-12-10"]);
    const stale = { ...dataset(c), tasks: [{
      id: "LIBERAR:ANTIGUA", kind: "LIBERAR" as const, username: "USER-TEST",
      title: "Liberación histórica", instruction: "antigua", evidence: "corte anterior",
      line: c.lines[0], releasePanel: "P1" as const,
    }] };
    const fresh = projectReconciliation(stale, [], [], TODAY);
    expect(releaseTasks(fresh)).toHaveLength(0);
    const done = projectReconciliation(stale, [], [{
      id: 1, taskId: "LIBERAR:ANTIGUA", action: "EJECUTADO", by: "ASESOR",
      at: "2026-10-27T10:00:00Z", note: "Verificado en panel",
    }], TODAY);
    expect(done.tasks.find(t => t.id === "LIBERAR:ANTIGUA")?.status).toBe("EJECUTADO");
  });
});
