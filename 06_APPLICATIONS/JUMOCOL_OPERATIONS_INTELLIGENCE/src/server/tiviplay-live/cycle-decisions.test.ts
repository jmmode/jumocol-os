import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { db, type Identity } from "@/server/auth/store";
import { listCycleDecisions, recordCycleDecision } from "./cycle-decisions";

const admin: Identity = { id: "julian", name: "Dirección", role: "ADMIN" };
const operator: Identity = { id: "jorge", name: "Operador", role: "OPERADOR" };

beforeAll(() => {
  process.env.JUMOCOL_AUTH_DB = path.join(mkdtempSync(path.join(tmpdir(), "jumocol-decisions-")), "identity.sqlite");
});

describe("Decisiones de Dirección sobre excepciones del ciclo", () => {
  it("solo Dirección decide; CORREGIR exige el dato; el historial es append-only y la última decisión es la vigente", () => {
    const subject = "EXTENSION:P3:50:PL0000000";
    expect(() => recordCycleDecision(operator, { subject, fingerprint: "fp", action: "CONFIRMAR" })).toThrow(/Dirección/);
    expect(() => recordCycleDecision(admin, { subject: "OTRA:x", fingerprint: "fp", action: "CONFIRMAR" })).toThrow(/inválida/);
    expect(() => recordCycleDecision(admin, { subject, fingerprint: "fp", action: "BORRAR" })).toThrow(/inválida/);
    expect(() => recordCycleDecision(admin, { subject, fingerprint: "fp", action: "CORREGIR" })).toThrow(/dato/);
    recordCycleDecision(admin, { subject, fingerprint: "fp", action: "RECHAZAR" });
    recordCycleDecision(admin, { subject, fingerprint: "fp", action: "CORREGIR", value: "NO_ES_SERVICIO" });
    const all = listCycleDecisions();
    expect(all.map((d) => [d.action, d.value, d.by])).toEqual([["RECHAZAR", null, "julian"], ["CORREGIR", "NO_ES_SERVICIO", "julian"]]);
    expect(() => db().exec("DELETE FROM tiviplay_decisions")).toThrow(/append-only/);
    const auditRows = db().prepare("SELECT action FROM audit WHERE entity LIKE 'tiviplay-decision:%'").all() as Array<{ action: string }>;
    expect(auditRows.map((r) => r.action)).toEqual(["RECHAZAR", "CORREGIR"]);
  });
});
