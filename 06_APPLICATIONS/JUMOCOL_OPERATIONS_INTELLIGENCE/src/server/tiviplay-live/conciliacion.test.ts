import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { db, type Identity } from "@/server/auth/store";
import { listReconDecisions, getReconciliation, isApplied, normalizeSheetDate, recordReconDecision, recordTaskEvent } from "./conciliacion";
import { residualTaskId, type ReconDataset } from "./conciliacion-model";

// Datos sintéticos: ningún cliente, usuario ni línea real.
const admin: Identity = { id: "julian", name: "Dirección", role: "ADMIN" };
const advisor: Identity = { id: "jorge", name: "Asesor", role: "OPERADOR" };
const p1 = { panel: "P1" as const, row: 10, lineId: "900001", expiration: "2026-05-01", lastConnection: null };
const p3 = { panel: "P3" as const, row: 20, lineId: "900003", expiration: "2026-11-20", lastConnection: null };

const dataset: ReconDataset = {
  cut: "2026-10-27",
  generatedAt: "2026-10-27T00:00:00Z",
  cases: [{
    id: "MP:SINTETICO1", kind: "MULTIPANEL", username: "SINTETICO1", baseRows: [5], title: "Servicio en varios paneles",
    contradiction: "En P1 y P3", evidence: ["sintético"], lines: [p1, p3], proposal: "KEEP_P3", fingerprint: "fp1", active: true,
    options: [
      { id: "KEEP_P1", label: "CONSERVAR PANEL 1", keep: "P1", effect: "x", baseUpdates: [{ row: 5, field: "PANEL", from: "PANEL 3", to: "PANEL 1" }] },
      { id: "KEEP_P3", label: "CONSERVAR PANEL 3", keep: "P3", effect: "x", baseUpdates: [{ row: 5, field: "F.VENCIMIENTO", from: "2026-10-20", to: "2026-11-20" }] },
    ],
  }, {
    id: "FE:SINTETICO2", kind: "FECHA", username: "SINTETICO2", baseRows: [6], title: "F.VENC", contradiction: "BASE adelantada", evidence: [], lines: [p3],
    proposal: null, fingerprint: "fp2", active: true,
    options: [
      { id: "OTORGAR", label: "Otorgar", effect: "x", baseUpdates: [], tasks: [{ kind: "APLICAR_CREDITO", instruction: "Extender", evidence: "decisión" }] },
      { id: "IGUALAR", label: "Igualar", effect: "x", baseUpdates: [{ row: 6, field: "F.VENCIMIENTO", from: "2026-12-01", to: "2026-11-20" }] },
    ],
  }],
  tasks: [{ id: "ALTA:SINTETICO3:P3", kind: "REGISTRAR_BASE", username: "SINTETICO3", title: "REGISTRAR", instruction: "crear fila", evidence: "línea activa" }],
  services: [
    { username: "SINTETICO1", state: "EXCEPCION", panel: null, expiration: null, baseRow: 5 },
    { username: "SINTETICO2", state: "EXCEPCION", panel: null, expiration: null, baseRow: 6 },
    { username: "SINTETICO4", state: "ACTIVO", panel: "P3", expiration: "2026-11-01", baseRow: 7 },
  ],
};

beforeAll(() => {
  process.env.JUMOCOL_AUTH_DB = path.join(mkdtempSync(path.join(tmpdir(), "jumocol-recon-")), "identity.sqlite");
});

describe("Conciliación de servicio: decisión → BASE → LIBERAR → DISPONIBLE", () => {
  it("multipanel: solo Gerencia decide, la decisión se bloquea y genera la tarea LIBERAR del residual", () => {
    const before = getReconciliation(dataset)!;
    expect(before.cases[0].status).toBe("PENDIENTE");
    expect(before.tasks.map((t) => t.id)).toEqual(["ALTA:SINTETICO3:P3"]);
    expect(before.services).toMatchObject({ ACTIVO: 1, EXCEPCION: 2, INACTIVO: 0, total: 3 });

    expect(() => recordReconDecision(advisor, { caseId: "MP:SINTETICO1", option: "KEEP_P3", fingerprint: "fp1" }, dataset)).toThrow(/Dirección/);
    expect(() => recordReconDecision(admin, { caseId: "MP:SINTETICO1", option: "KEEP_P2", fingerprint: "fp1" }, dataset)).toThrow(/Opción/);
    expect(() => recordReconDecision(admin, { caseId: "MP:SINTETICO1", option: "KEEP_P3", fingerprint: "otro" }, dataset)).toThrow(/cambió/);
    recordReconDecision(admin, { caseId: "MP:SINTETICO1", option: "KEEP_P3", fingerprint: "fp1" }, dataset);
    expect(() => recordReconDecision(admin, { caseId: "MP:SINTETICO1", option: "KEEP_P1", fingerprint: "fp1" }, dataset)).toThrow(/bloqueada/);

    const after = getReconciliation(dataset)!;
    const c = after.cases[0];
    expect(c.status).toBe("DECIDIDO");
    expect(c.chosen?.keep).toBe("P3");
    const release = after.tasks.find((t) => t.kind === "LIBERAR")!;
    expect(release).toMatchObject({ id: residualTaskId(c.id, p1), keepPanel: "P3", releasePanel: "P1", title: "LIBERAR PANEL 1 — SINTETICO1" });
    expect(after.baseSync).toEqual([expect.objectContaining({ row: 5, field: "F.VENCIMIENTO", to: "2026-11-20", username: "SINTETICO1" })]);
  });

  it("Asesor: NO SE PUEDE exige motivo y deja la tarea abierta; EJECUTADO la cierra, la línea queda DISPONIBLE y el servicio se consolida", () => {
    const id = residualTaskId("MP:SINTETICO1", p1);
    expect(() => recordTaskEvent(advisor, { taskId: id, action: "NO_SE_PUEDE" }, dataset)).toThrow(/motivo/);
    recordTaskEvent(advisor, { taskId: id, action: "NO_SE_PUEDE", note: "Panel sin acceso" }, dataset);
    expect(getReconciliation(dataset)!.tasks.find((t) => t.id === id)?.status).toBe("NO_SE_PUEDE");
    recordTaskEvent(advisor, { taskId: id, action: "EJECUTADO" }, dataset);
    expect(() => recordTaskEvent(advisor, { taskId: id, action: "EJECUTADO" }, dataset)).toThrow(/cerrada/);
    const state = getReconciliation(dataset)!;
    expect(state.available).toEqual([expect.objectContaining({ username: "SINTETICO1", by: "jorge", line: p1 })]);
    expect(state.cases[0].status).toBe("CONSOLIDADO");
    expect(state.services).toMatchObject({ ACTIVO: 2, EXCEPCION: 1 });
    // Tras liberar ya no se puede corregir la decisión.
    const current = listReconDecisions().find((d) => d.caseId === "MP:SINTETICO1")!;
    expect(() => recordReconDecision(admin, { caseId: "MP:SINTETICO1", option: "KEEP_P1", fingerprint: "fp1", supersedes: String(current.id), reason: "error de lectura" }, dataset)).toThrow(/liberó/);
  });

  it("corrección trazable: exige referencia a la decisión vigente y motivo; conserva el historial", () => {
    recordReconDecision(admin, { caseId: "FE:SINTETICO2", option: "IGUALAR", fingerprint: "fp2" }, dataset);
    const first = listReconDecisions().find((d) => d.caseId === "FE:SINTETICO2")!;
    expect(() => recordReconDecision(admin, { caseId: "FE:SINTETICO2", option: "OTORGAR", fingerprint: "fp2", supersedes: String(first.id) }, dataset)).toThrow(/motivo/);
    recordReconDecision(admin, { caseId: "FE:SINTETICO2", option: "OTORGAR", fingerprint: "fp2", supersedes: String(first.id), reason: "Plan pagado por adelantado" }, dataset);
    const view = getReconciliation(dataset)!.cases.find((c) => c.id === "FE:SINTETICO2")!;
    expect(view.history.map((h) => h.option)).toEqual(["IGUALAR", "OTORGAR"]);
    expect(view.chosen?.id).toBe("OTORGAR");
    expect(getReconciliation(dataset)!.tasks.some((t) => t.kind === "APLICAR_CREDITO" && t.caseId === "FE:SINTETICO2")).toBe(true);
    expect(() => db().exec("DELETE FROM tiviplay_recon_decisions")).toThrow(/append-only/);
    expect(() => db().exec("UPDATE tiviplay_recon_task_events SET action='EJECUTADO'")).toThrow(/append-only/);
  });

  it("la cola BASE se valida por relectura de la fuente, no por intención", () => {
    expect(normalizeSheetDate("2026-11-20")).toBe("2026-11-20");
    expect(normalizeSheetDate("20-11-26")).toBe("2026-11-20");
    expect(normalizeSheetDate("20/11/2026")).toBe("2026-11-20");
    const live = new Map([[5, { client: "Cliente sintético", panel: "PANEL 3", due: "2026-11-20" }]]);
    expect(isApplied({ row: 5, field: "F.VENCIMIENTO", to: "2026-11-20" }, live)).toBe(true);
    expect(isApplied({ row: 5, field: "PANEL", to: "PANEL 1" }, live)).toBe(false);
    expect(isApplied({ row: 5, field: "PANEL", to: "PANEL 3" }, null)).toBe(false);
  });
});
