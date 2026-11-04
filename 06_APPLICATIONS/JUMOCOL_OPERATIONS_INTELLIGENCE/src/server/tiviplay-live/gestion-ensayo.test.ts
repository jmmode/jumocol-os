// Prueba contra la hoja de ensayo con datos ficticios. Solo corre con TIVIPLAY_GESTION_ENSAYO_ID.
import { randomUUID } from "node:crypto";

import { GoogleAuth } from "google-auth-library";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { commitGestion, observationsHash } from "./gestion-core";
import { GESTION_ESTADOS, gestionEntry } from "./gestion-model";
import { GESTION_WRITE_SCOPE, gestionCell, gestionHeadersValid } from "./gestion-sheets";

const ENSAYO = process.env.TIVIPLAY_GESTION_ENSAYO_ID ?? "";
const REAL = process.env.TIVIPLAY_GESTION_LIBRO_REAL ?? "";
const SHEET = "Hoja 1";
const API = `https://sheets.googleapis.com/v4/spreadsheets/${ENSAYO}/values`;

async function token(scope: string) {
  const key = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").split(/\r?\n/).filter((l) => l.trim()).join("\n");
  const auth = new GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL, private_key: key }, scopes: [scope] });
  return (await (await auth.getClient()).getAccessToken()).token ?? "";
}
const rowValues = async (bearer: string, row: number) => {
  const r = await fetch(`${API}/${encodeURIComponent(`'${SHEET}'!A${row}:M${row}`)}`, { headers: { Authorization: `Bearer ${bearer}` } });
  return ((await r.json()) as { values?: string[][] }).values?.[0] ?? [];
};
const save = async (cell: ReturnType<typeof gestionCell>, estado: (typeof GESTION_ESTADOS)[number], detail: string, requestId = randomUUID(), expectedHash?: string | null) => commitGestion({
  record: gestionEntry(estado, "Asesor Ensayo", detail, requestId), requestId,
  expectedHash: expectedHash === undefined ? observationsHash(await cell.read()) : expectedHash, read: cell.read, write: cell.write,
});

describe.runIf(ENSAYO)("registro de gestión en hoja de ensayo", () => {
  let write = "";
  let readOnly = "";
  const cell = (row: number) => gestionCell(ENSAYO, SHEET, row, write);
  vi.setConfig({ testTimeout: 60_000 });

  beforeAll(async () => {
    if (!REAL || ENSAYO === REAL) throw new Error("La prueba solo corre contra un libro distinto del real.");
    write = await token(GESTION_WRITE_SCOPE);
    readOnly = await token("https://www.googleapis.com/auth/spreadsheets.readonly");
  });

  it("reconoce el encabezado real en la fila 3", async () => {
    expect(gestionHeadersValid((await rowValues(readOnly, 3)).map((h) => h.toUpperCase()))).toBe(true);
    expect((await rowValues(readOnly, 3))[5]).toBe("OBSERVACIONES GESTION");
  });

  it.each(GESTION_ESTADOS.map((estado, i) => [estado, i + 4] as const))("%s conserva lo anterior y se confirma por relectura", async (estado, row) => {
    const before = await rowValues(readOnly, row);
    const previous = await cell(row).read();
    expect(await save(cell(row), estado, `detalle ${estado}`)).toBe("SAVED");
    const after = await cell(row).read();
    expect(after.startsWith(previous)).toBe(true);
    expect(after).toContain(`| ${estado} | detalle ${estado} [JOS:`);
    const now = await rowValues(readOnly, row);
    expect(now.filter((_, i) => i !== 5)).toEqual(before.filter((_, i) => i !== 5));
  });

  it("un reintento no duplica la gestión", async () => {
    const id = randomUUID();
    expect(await save(cell(8), "MENSAJE_ENVIADO", "primer envío", id)).toBe("SAVED");
    const stored = await cell(8).read();
    expect(await save(cell(8), "MENSAJE_ENVIADO", "primer envío", id, null)).toBe("DUPLICATE");
    expect(await cell(8).read()).toBe(stored);
  });

  it("bloquea si otra persona editó después de abrir la ficha", async () => {
    const c = cell(8);
    const seen = observationsHash(await c.read());
    const edited = `${await c.read()}\nedición manual ficticia ${randomUUID()}`;
    expect(await c.write(edited)).toBe(200);
    expect(await save(c, "SIN_RESPUESTA", "no debe entrar", randomUUID(), seen)).toBe("CONFLICT");
    expect(await c.read()).toBe(edited);
  });

  it("no declara éxito si otra escritura se cruza", async () => {
    const c = cell(8);
    const crossed = { read: c.read, write: async (next: string) => { await c.write(next); return c.write(`${next}\nescritura cruzada ficticia`); } };
    expect(await save(crossed as ReturnType<typeof gestionCell>, "SIN_RESPUESTA", "cruce")).toBe("UNVERIFIED");
  });

  it("guarda texto literal, nunca una fórmula", async () => {
    expect(await save(cell(5), "MENSAJE_ENVIADO", "=1+1")).toBe("SAVED");
    expect(await cell(5).read()).toContain("| =1+1 [JOS:");
  });

  it("el acceso de lectura no puede escribir", async () => {
    const before = await cell(5).read();
    expect(await gestionCell(ENSAYO, SHEET, 5, readOnly).write("no debe entrar")).toBe(403);
    expect(await cell(5).read()).toBe(before);
  });
});
