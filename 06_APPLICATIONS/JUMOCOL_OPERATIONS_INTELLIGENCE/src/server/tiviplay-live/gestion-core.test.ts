import { describe, expect, it, vi } from "vitest";

import { commitGestion, observationsHash } from "./gestion-core";
import { gestionEntry, parseGestiones } from "./gestion-model";

const rid = "11111111-2222-3333-4444-555555555555";
const record = gestionEntry("COMPROBANTE_RECIBIDO", "Asesor", "Zelle", rid, new Date("2026-11-04T18:00:00Z"));

function cell(initial: string) {
  const store = { value: initial, writes: 0 };
  return { store, read: async () => store.value, write: async (next: string) => { store.writes++; store.value = next; return 200; } };
}

describe("registro de gestión", () => {
  it("conserva el historial y confirma por relectura", async () => {
    const c = cell("nota anterior");
    const status = await commitGestion({ record, requestId: rid, expectedHash: observationsHash("nota anterior"), read: c.read, write: c.write });
    expect(status).toBe("SAVED");
    expect(c.store.value.startsWith("nota anterior\n")).toBe(true);
    expect(c.store.value).toContain(`[JOS:${rid}]`);
    expect(c.store.value).toContain("2026-11-04 13:00");
    expect(c.store.value).not.toMatch(/PAGO_CONFIRMADO|CONFIRMADO JM/);
  });

  it("es idempotente ante un reintento", async () => {
    const c = cell(`nota\n${record}`);
    expect(await commitGestion({ record, requestId: rid, expectedHash: null, read: c.read, write: c.write })).toBe("DUPLICATE");
    expect(c.store.writes).toBe(0);
  });

  it("bloquea si la celda cambió desde que se abrió la ficha", async () => {
    const c = cell("editada por otro asesor");
    expect(await commitGestion({ record, requestId: rid, expectedHash: observationsHash("nota vieja"), read: c.read, write: c.write })).toBe("CONFLICT");
    expect(c.store.writes).toBe(0);
  });

  it("no declara éxito si otra escritura se cruzó", async () => {
    const c = cell("nota");
    const write = async (next: string) => { c.store.value = `${next}\notra escritura`; return 200; };
    expect(await commitGestion({ record, requestId: rid, expectedHash: null, read: c.read, write })).toBe("UNVERIFIED");
  });

  it("informa falta de permiso y errores de API sin declarar éxito", async () => {
    const c = cell("");
    expect(await commitGestion({ record, requestId: rid, expectedHash: null, read: c.read, write: async () => 403 })).toBe("WRITE_DENIED");
    expect(await commitGestion({ record, requestId: rid, expectedHash: null, read: c.read, write: async () => 500 })).toBe("WRITE_FAILED");
  });

  it("no sobrescribe una fórmula", async () => {
    const write = vi.fn(async () => 200);
    expect(await commitGestion({ record, requestId: rid, expectedHash: null, read: async () => "=A1", write })).toBe("FORMULA");
    expect(write).not.toHaveBeenCalled();
  });

  it("lee del historial solo gestiones reconocibles", () => {
    expect(parseGestiones(`texto libre\n${record}`)).toEqual([{ at: "2026-11-04 13:00", actor: "Asesor", estado: "COMPROBANTE_RECIBIDO", detail: "Zelle" }]);
    expect(parseGestiones("")).toEqual([]);
  });
});
