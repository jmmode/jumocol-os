import { describe, expect, it } from "vitest";

import { projectDraft } from "@/server/tiviplay-live/draft-read-model";

// Rangos A, J:K y AG:AL con la forma que escribe sync-draft (datos ficticios).
const agal = [
  [],
  ["", "", "", "corte:2026-10-29", "firma:abc123", "NOV26-META"],
  ["SEMANA", "CLASIFICACION_BORRADOR", "CATEGORIA", "CAUSA / ACCIÓN", "RESPONSABLE", "ID_BORRADOR"],
  ["", "", "", "", "", "NOV26-S1"],
  [1, "FACTURABLE", "", "", "SISTEMA", "NOV26-B3"],
  [1, "REQUIERE_REVISION", "MES GRATIS", "Motor: posible mes gratis pendiente", "BO", "NOV26-B4"],
  [2, "PAGADO_SIN_PROPAGAR", "CONCILIACIÓN", "ZELLE (OCT) 9 USD 70 CONFIRMADO JM", "BO: propagar", "NOV26-B7"],
  [5, "FACTURABLE", "", "", "SISTEMA", "NOV26-B8"],
  [],
  ["", "", "", "", "", "NOV26-SEC-AJ"],
  [],
  [],
  ["", "", "", "", "", "NOV26-SEC-CV"],
  [],
];
const a = agal.map((_, i) => [i === 10 ? "NOV26-AJ7" : i === 11 ? "NOV26-PG-ZELLE23" : i === 13 ? "NOV26-CV9" : ""]);
const jk = agal.map((_, i) => (i === 4 ? ["15", ""] : i === 5 ? ["$25", ""] : i === 7 ? ["0", "39.900"] : []));

describe("projectDraft", () => {
  it("resume clases, semanas, importes y secciones sin datos personales", () => {
    const d = projectDraft("2026-11", { a, jk, agal });
    expect(d.cutoffDate).toBe("2026-10-29");
    expect(d.signature).toBe("abc123");
    expect(d.universe).toBe(4);
    expect(d.weeks).toEqual([2, 1, 0, 0, 1]);
    expect(d.facturableWeeks).toEqual([1, 0, 0, 0, 1]);
    expect(d.classes.FACTURABLE).toEqual({ count: 2, usd: 15, cop: 39900 });
    expect(d.classes.REQUIERE_REVISION.usd).toBe(25);
    expect(d.sections).toEqual({ ajustes: 1, pagosPendientes: 1, bloqueadosFuera: 0, cartera: 1, excluidos: 0 });
    expect(d.attention.map((x) => x.id)).toEqual(["NOV26-B7"]);
    expect(d.issues).toEqual([]);
  });

  it("marca la hoja sin firma y los IDs duplicados", () => {
    const tampered = agal.map((r) => [...r]);
    tampered[1][4] = "";
    tampered[7][5] = "NOV26-B3";
    const d = projectDraft("2026-11", { a, jk, agal: tampered });
    expect(d.signature).toBeNull();
    expect(d.issues.some((x) => x.includes("firma"))).toBe(true);
    expect(d.issues).toContain("ID duplicado NOV26-B3");
  });

  it("rechaza meses sin hoja BORRADOR registrada", () => {
    expect(() => projectDraft("2026-12", { a, jk, agal })).toThrow();
  });
});
