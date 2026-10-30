import { afterEach, describe, expect, it, vi } from "vitest";

import { allowedSegments, batchReadSheets, stitchSegments } from "@/server/tiviplay-live/sheets-client";

const letters = "ABCDEFGHIJKLMNOPQRSTUVW".split("");

/** Respuesta ficticia de values:batchGet: cada celda vale "<columna><fila>"; la columna N trae un centinela. */
function fakeBatchGet(url: string) {
  const ranges = new URL(url).searchParams.getAll("ranges");
  return {
    valueRanges: ranges.map((range) => {
      const m = range.match(/!([A-Z]+)1:([A-Z]+)(\d+)$/)!;
      const from = letters.indexOf(m[1]);
      const to = letters.indexOf(m[2]);
      return {
        values: [1, 2, 3].map((r) => letters.slice(from, to + 1).map((c) => (c === "N" ? "PW-SENTINEL" : `${c}${r}`))),
      };
    }),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("batchReadSheets · columnas sensibles", () => {
  it("nunca solicita BASE GENERAL!N (CONTRASEÑA) y conserva las posiciones", async () => {
    const fetchMock = vi.fn(async (url: string) => ({ ok: true, json: async () => fakeBatchGet(url) }));
    vi.stubGlobal("fetch", fetchMock);

    const out = await batchReadSheets("sheet-id", "token", ["BASE GENERAL", "ZELLE (OCT)"], "W", 3);

    const ranges = new URL(fetchMock.mock.calls[0][0]).searchParams.getAll("ranges");
    expect(ranges).toEqual(["'BASE GENERAL'!A1:M3", "'BASE GENERAL'!O1:W3", "'ZELLE (OCT)'!A1:W3"]);
    const base = out["BASE GENERAL"];
    expect(JSON.stringify(base)).not.toContain("PW-SENTINEL");
    expect(base[0][12]).toBe("M1");
    expect(base[0][13]).toBe("");
    expect(base[0][14]).toBe("O1");
    expect(base[2][22]).toBe("W3");
    // Hojas sin contrato sensible se leen como antes (una sola petición por hoja).
    expect(out["ZELLE (OCT)"][1][0]).toBe("A2");
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
