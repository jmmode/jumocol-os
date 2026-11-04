import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const entry = { id: "aaaaaaaaaaaaaaaa", name: "Ana Prueba", user: "ANA01", panel: "PANEL 3", baseRow: 4 };
const ranges: string[] = [];
let cells: Record<string, string> = {};
let snapshot: string | null = null;

vi.mock("@/server/tiviplay-live/workday", () => ({ getTiviplayWorkday: async () => ({ ok: true, directory: [entry], workday: {} }) }));
vi.mock("@/server/tiviplay-live/sheets-snapshot", () => ({ snapshotFile: () => snapshot }));
vi.mock("@/server/tiviplay-live/sheets-client", () => ({
  getTiviplaySpreadsheetId: () => "book",
  getSheetsAccessToken: async () => "token",
  quoteSheet: (t: string) => `'${t}'`,
  batchReadRanges: async (_b: string, _t: string, rs: string[]) => {
    ranges.push(...rs);
    return rs.map((r) => (r.endsWith("A1:AQ2")
      ? [["", "BASE GENERAL"], ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL"]]
      : [[cells[r.split("!")[1].split(":")[0]] ?? ""]]));
  },
}));

import { readServiceCredentialForClient } from "@/server/tiviplay-live/client-credential";

beforeEach(() => { ranges.length = 0; snapshot = null; cells = { B4: "Ana Prueba", N4: "ANA01", O4: "PW-OK", P4: "PANEL 3" }; });
afterEach(() => vi.clearAllMocks());

describe("credencial de servicio · lectura puntual y exacta", () => {
  it("lee solo encabezados y las 4 celdas de la fila del cliente (CONTRASEÑA en O tras insertar ID)", async () => {
    expect(await readServiceCredentialForClient(entry.id)).toEqual({ ok: true, password: "PW-OK", panel: "PANEL 3" });
    expect(ranges).toEqual(["'BASE GENERAL'!A1:AQ2", "'BASE GENERAL'!B4:B4", "'BASE GENERAL'!N4:N4", "'BASE GENERAL'!P4:P4", "'BASE GENERAL'!O4:O4"]);
  });
  it("bloquea si la fila ya no corresponde al cliente, usuario o panel seleccionados", async () => {
    cells.N4 = "OTRO";
    expect(await readServiceCredentialForClient(entry.id)).toEqual({ ok: false, reason: "SOURCE_MISMATCH" });
    cells.N4 = "ANA01"; cells.P4 = "PANEL 1";
    expect(await readServiceCredentialForClient(entry.id)).toEqual({ ok: false, reason: "SOURCE_MISMATCH" });
  });
  it("nunca revela desde una captura local ni para identificadores inválidos o desconocidos", async () => {
    snapshot = "x.json";
    expect(await readServiceCredentialForClient(entry.id)).toEqual({ ok: false, reason: "SOURCE_UNAVAILABLE" });
    snapshot = null;
    expect(await readServiceCredentialForClient("../etc")).toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(await readServiceCredentialForClient("bbbbbbbbbbbbbbbb")).toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(ranges).toEqual([]);
  });
});
