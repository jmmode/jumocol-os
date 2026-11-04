import { afterEach, describe, expect, it, vi } from "vitest";

import { allowedSegments, batchReadSheets, sensitiveColumnsFromHeader, stitchSegments } from "@/server/tiviplay-live/sheets-client";
import { columnLetter } from "@/server/tiviplay-live/sheet-columns";

/** Encabezado vivo de BASE GENERAL al 04/11/2026: ID en M, USUARIO en N, CONTRASEÑA en O. */
const HEADER = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO", "DISPOSITIVOS", "CUMPLEAÑOS"];

/** Hoja ficticia: fila 1 título, fila 2 encabezado, filas 3+ datos. La columna CONTRASEÑA trae un centinela. */
function cell(sheet: string, c: number, r: number) {
  if (r === 1) return c === 0 ? sheet : "";
  if (r === 2) return sheet === "BASE GENERAL" ? HEADER[c] ?? "" : `H${c}`;
  return sheet === "BASE GENERAL" && HEADER[c] === "CONTRASEÑA" ? "PW-SENTINEL" : `${columnLetter(c)}${r}`;
}

function fakeBatchGet(url: string) {
  const ranges = new URL(url).searchParams.getAll("ranges");
  return {
    valueRanges: ranges.map((range) => {
      const m = range.match(/^'(.+)'!([A-Z]+)(\d+):([A-Z]+)(\d+)$/)!;
      const idx = (l: string) => [...l].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const values: string[][] = [];
      for (let r = Number(m[3]); r <= Number(m[5]); r++) {
        const row: string[] = [];
        for (let c = idx(m[2]); c <= idx(m[4]); c++) row.push(cell(m[1], c, r));
        values.push(row);
      }
      return { values };
    }),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("batchReadSheets · columnas sensibles por encabezado", () => {
  it("nunca solicita la columna CONTRASEÑA aunque cambie de posición y conserva USUARIO", async () => {
    const fetchMock = vi.fn(async (url: string) => ({ ok: true, json: async () => fakeBatchGet(url) }));
    vi.stubGlobal("fetch", fetchMock);

    const out = await batchReadSheets("sheet-id", "token", ["BASE GENERAL", "ZELLE (OCT)"], "W", 5);

    // 1.ª llamada: solo filas de encabezado. 2.ª: datos sin la columna O.
    const probe = new URL(fetchMock.mock.calls[0][0]).searchParams.getAll("ranges");
    expect(probe).toEqual(["'BASE GENERAL'!A1:W3", "'ZELLE (OCT)'!A1:W3"]);
    const ranges = new URL(fetchMock.mock.calls[1][0]).searchParams.getAll("ranges");
    expect(ranges).toEqual(["'BASE GENERAL'!A1:N5", "'BASE GENERAL'!P1:W5", "'ZELLE (OCT)'!A1:W5"]);

    const base = out["BASE GENERAL"];
    expect(JSON.stringify(base)).not.toContain("PW-SENTINEL");
    expect(base[1][13]).toBe("USUARIO");
    expect(base[2][13]).toBe("N3");
    expect(base[2][14]).toBe("");
    expect(base[2][15]).toBe("P3");
    expect(out["ZELLE (OCT)"][2][0]).toBe("A3");
  });

  it("sensitiveColumnsFromHeader detecta CONTRASEÑA/CLAVE/PASSWORD con o sin tilde", () => {
    expect(sensitiveColumnsFromHeader([["x"], ["TC", "contrasena", "Clave", "PASSWORD", "USUARIO"]])).toEqual(["B", "C", "D"]);
  });

  it("allowedSegments y stitchSegments son inversos sobre las columnas permitidas", () => {
    const segments = allowedSegments("W", ["N"]);
    expect(segments).toEqual([[0, 12], [14, 22]]);
    const rows = stitchSegments(segments, [[["a", "b"]], [["o"]]]);
    expect(rows[0].slice(0, 2)).toEqual(["a", "b"]);
    expect(rows[0][13]).toBe("");
    expect(rows[0][14]).toBe("o");
  });
});
