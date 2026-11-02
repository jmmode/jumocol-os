import { describe, expect, it } from "vitest";

import { baseLiveRows, BASE_LIVE_COLUMNS } from "./conciliacion";
import { crossCredits, dateDifferences, isBackOffice, parseCobros, parsePreface, reviewCases, summarize, COBROS_COLUMNS } from "./avance-model";
import { columnLetter, findHeaderRow, resolveColumns, scrubSensitiveColumns } from "./sheet-columns";

// Encabezados reales de BASE GENERAL (fila 2) tras la inserción de ID en M el 01/11/2026.
const BASE_HEADER = ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO"];

describe("lectura por encabezado (P0 readBaseLive)", () => {
  it("resuelve USUARIO=N y PANEL=P en el esquema vigente y nunca la CONTRASEÑA", () => {
    const letters = resolveColumns(BASE_HEADER, ["USUARIO", "PANEL", "F.VENCIMIENTO"]);
    expect(letters).toEqual({ USUARIO: "N", PANEL: "P", "F.VENCIMIENTO": "Q" });
    expect(() => resolveColumns(BASE_HEADER, ["CONTRASEÑA"])).toThrow(/sensible/);
    expect(BASE_LIVE_COLUMNS).not.toContain("CONTRASEÑA");
    expect(COBROS_COLUMNS.some((c) => /CONTRASE|CORREO|OBSERVACIONES/.test(c))).toBe(false);
  });

  it("localiza la fila de encabezados y calcula letras más allá de Z", () => {
    expect(findHeaderRow([["banner"], BASE_HEADER], ["USUARIO", "PANEL"])).toBe(1);
    expect(findHeaderRow([["x"]], ["USUARIO"])).toBe(-1);
    expect(columnLetter(0)).toBe("A");
    expect(columnLetter(25)).toBe("Z");
    expect(columnLetter(42)).toBe("AQ");
  });

  it("proyecta filas absolutas de BASE GENERAL desde columnas", () => {
    const rows = baseLiveRows(3, { CLIENTE: ["Ana"], USUARIO: ["ab c1"], PANEL: ["PANEL 1"], "F.VENCIMIENTO": ["04-11-26"], CONCILIACION_SERVICIO_27OCT: ["DUPLICADO DEPURADO x"] });
    expect(rows.get(3)).toEqual({ client: "Ana", username: "ABC1", panel: "PANEL 1", due: "2026-11-04", duplicate: true });
  });

  it("vacía las columnas CONTRASEÑA en lecturas completas sin desplazar índices", () => {
    const rows = [["CONTROL"], ["TC", "USUARIO", "CONTRASEÑA", "PANEL"], ["1", "u1", "secreto", "P1"]];
    const out = scrubSensitiveColumns(rows);
    expect(out[1]).toEqual(rows[1]);
    expect(out[2]).toEqual(["1", "u1", "", "P1"]);
    expect(JSON.stringify(out)).not.toContain("secreto");
  });
});

const cols = (rows: Array<Record<string, string>>) => {
  const out: Record<string, string[]> = {};
  for (const name of COBROS_COLUMNS) out[name] = rows.map((r) => r[name] ?? "");
  return out;
};

const PLANILLA = cols([
  { CLIENTE: "SEMANA 1 · 01–04 NOV", ID_BORRADOR: "NOV26-S1" },
  { CLIENTE: "Ana", USUARIO: "ana1", "F. PRÓXIMO PAGO": "01-11-26", "F.VENCIMIENTO": "2026-11-18", SEMANA: "1", USD: "15", CLASIFICACION_BORRADOR: "FACTURABLE", CONFIRMACION_FINANCIERA: "CONFIRMADO JM", FECHA_PAGO: "02-10-26", ESTADO_COBRO: "PENDIENTE" },
  { CLIENTE: "Beto", USUARIO: "beto", "F. PRÓXIMO PAGO": "02-11-26", "F.VENCIMIENTO": "2026-11-04", SEMANA: "1", CLASIFICACION_BORRADOR: "REQUIERE_REVISION", CATEGORIA: "IDENTIDAD", RESPONSABLE: "BO (verificar) → DIRECCIÓN", FECHA_GESTION: "02-11-26" },
  { CLIENTE: "Ceci", USUARIO: "ceci", "F. PRÓXIMO PAGO": "03-11-26", SEMANA: "1", CLASIFICACION_BORRADOR: "FACTURABLE" },
  { CLIENTE: "Dani", USUARIO: "", "F. PRÓXIMO PAGO": "04-11-26", SEMANA: "1", CLASIFICACION_BORRADOR: "BLOQUEADO", RESPONSABLE: "DIRECCIÓN" },
  { CLIENTE: "TOTAL" },
]);

describe("avance del mes", () => {
  const rows = parseCobros(4, PLANILLA);

  it("toma solo fichas (sin separadores ni totales) con su fila absoluta", () => {
    expect(rows.map((r) => r.client)).toEqual(["Ana", "Beto", "Ceci", "Dani"]);
    expect(rows[0]).toMatchObject({ row: 5, week: "S1", nextDue: "2026-11-01", value: "USD 15", lastPaymentMonth: "2026-10" });
  });

  it("lee corte y firma declarados por la planilla", () => {
    expect(parsePreface([["", "PAGOS NOVIEMBRE 2026 · CORTE"], ["", "… · 100 fichas · …", "corte:2026-11-01", "firma: REQUIERE REVALIDACIÓN"]])).toEqual({
      cut: "2026-11-01", signature: "REQUIERE REVALIDACIÓN", title: "PAGOS NOVIEMBRE 2026 · CORTE", banner: "… · 100 fichas · …",
    });
  });

  it("clasifica vigente/vencida solo con el panel y deja lo dudoso como diferencia", () => {
    const cross = crossCredits(rows, [
      { username: "ANA1", state: "ACTIVO", panel: "P3", expiration: "2026-11-20", baseRow: 8 },
      { username: "beto", state: "INACTIVO", panel: "P1", expiration: "2026-10-30", baseRow: 9 },
      { username: "ceci", state: "ACTIVO", panel: "P1", expiration: "2026-11-10", baseRow: 10 },
      { username: "ceci", state: "ACTIVO", panel: "P2", expiration: "2026-11-12", baseRow: 10 },
    ], "2026-11-02");
    expect(cross.map((c) => c.state)).toEqual(["VIGENTE", "VENCIDA", "DIFERENCIA", "DIFERENCIA"]);
    expect(cross[1].reason).toMatch(/no implica liberación/);
    expect(cross.some((c) => /LIBERAD/i.test(c.reason))).toBe(false);
    expect(dateDifferences(cross).map((d) => d.client)).toEqual(["Ana", "Beto"]);
  });

  it("no cuenta pagos de octubre como del mes y separa casos de Back Office", () => {
    const s = summarize(rows, null, "2026-11");
    expect(s).toMatchObject({ fichas: 4, facturables: 2, enRevision: 1, bloqueadas: 1, gestionadas: 1, pagoMesAnterior: 1, vigentes: null });
    const cases = reviewCases(rows);
    expect(cases.map((c) => c.client)).toEqual(["Beto", "Dani"]);
    expect(cases.filter((c) => isBackOffice(c.owner)).map((c) => c.client)).toEqual(["Beto"]);
  });
});
