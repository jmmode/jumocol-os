import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildMonthlyClose } from "@motor/tiviplay-monthly-close-v1/core";

import { OWNER_NOT_GOVERNED, projectHoy } from "./hoy-projection";
import { getTiviplayHoyLive } from "./monthly-close";

// Datos 100 % ficticios con la forma de encabezados de BASE GENERAL.
// Incluye una columna CONFIRMACION para demostrar que el motor no la expone.
const HEADER = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN", "PANTALLAS", "CELULAR", "USD", "COP",
  "METODO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "REFERIDO", "CONFIRMACION",
];
const row = (tc: string, client: string, phone: string, estado: string, obs: string, user: string, panel: string, next: string, confirm = "") =>
  [tc, client, phone, `${user}@example.test`, estado, obs, "PLAN X", "1", "", "10", "", "ZELLE", user, "secreto-ficticio", panel, "", "", next, "", confirm];

const ROWS: unknown[][] = [
  ["", "TIVIPLAY"],
  HEADER,
  row("1", "Cliente Alfa", "3000000001", "ACTIVO", "", "u-alfa", "P1", "20-10-26", "PENDIENTE CONFIRMACION"),
  row("1", "Cliente Beta", "3000000002", "ACTIVO", "pdte mes gratis", "u-beta", "P2", "05-10-26", "CONFIRMADO JM"),
  row("1", "Cliente Gamma", "3000000003", "NO RENUEVA", "", "u-gamma", "P3", "28-10-26"),
  row("1", "Cliente Delta", "3000000004", "ACTIVO", "", "u-delta", "P1", "02-10-26"),
  row("1", "Cliente Delta", "3000000004", "ACTIVO", "", "u-delta", "P1", "15-10-26"),
  row("1", "Cliente Épsilon", "3000000005", "ACTIVO", "", "u-eps", "P2", "fecha rara"),
  row("0", "Cliente Inactivo", "3000000006", "ACTIVO", "", "u-ina", "P2", "10-10-26"),
  row("1", "Cliente Noviembre", "3000000007", "ACTIVO", "", "u-nov", "P2", "03-11-26"),
];

const meta = { generatedAt: "2026-10-20T00:00:00.000Z", stableDuringRead: true };

describe("HOY · proyección de monthly-close-v1", () => {
  const close = buildMonthlyClose(ROWS, "2026-10");
  const hoy = projectHoy(close, meta);

  it("1 · proyecta exactamente los FACTURAR_CANDIDATO del motor, sin reclasificar", () => {
    const motorCandidates = close.preview.filter((r) => r.classification === "FACTURAR_CANDIDATO").map((r) => r.sourceRow).sort();
    expect(hoy.contacts.map((c) => c.sourceRow).sort()).toEqual(motorCandidates);
    expect(hoy.contacts).toHaveLength(close.classificationCounts.FACTURAR_CANDIDATO ?? 0);
    for (const c of hoy.contacts) {
      const source = close.preview.find((r) => r.sourceRow === c.sourceRow)!;
      expect(c).toMatchObject({ origin: source.origin, week: source.week, client: source.client, phone: source.phone, nextPaymentDate: source.nextPaymentDate });
    }
  });

  it("2 · preserva todas las excepciones y revisiones del motor, con responsable REQUIERE DECISIÓN", () => {
    const review = close.preview.filter((r) => r.classification === "REQUIERE_REVISION");
    expect(hoy.exceptions).toHaveLength(close.exceptions.length + close.duplicates.length + review.length);
    expect(hoy.exceptions.filter((e) => e.kind === "INVALID_NEXT_PAYMENT_DATE").map((e) => e.rows)).toEqual(close.exceptions.map((e) => [e.sourceRow]));
    expect(hoy.exceptions.filter((e) => e.kind === "DUPLICADO").map((e) => e.rows)).toEqual(close.duplicates.map((d) => d.sourceRows));
    expect(hoy.exceptions.filter((e) => e.kind === "REQUIERE_REVISION").map((e) => e.rows[0])).toEqual(review.map((r) => r.sourceRow));
    expect(hoy.exceptions.every((e) => e.owner === OWNER_NOT_GOVERNED)).toBe(true);
    // Fixture: 1 fecha inválida, 1 duplicado (Delta), 2 revisiones (mes gratis, no renueva).
    expect(hoy.exceptions.map((e) => e.kind).sort()).toEqual(["DUPLICADO", "INVALID_NEXT_PAYMENT_DATE", "REQUIERE_REVISION", "REQUIERE_REVISION"]);
  });

  it("no expone credenciales ni correo del motor en la superficie", () => {
    const serialized = JSON.stringify(hoy);
    for (const forbidden of ["secreto-ficticio", "@example.test", '"password"', '"username"', '"email"']) expect(serialized).not.toContain(forbidden);
  });

  it("5 · Confirmado JM no se inventa: el motor no expone CONFIRMACION aunque la fuente la tenga", () => {
    expect(JSON.stringify(close)).not.toMatch(/CONFIRMACION|CONFIRMADO JM/);
    expect(hoy.confirmadoJm).toEqual({ state: "BLOQUEADO", reason: "monthly-close-v1 no expone actualmente pendientes de Confirmado JM" });
  });

  it("estado PARCIAL cuando la fuente cambió o hay duplicados (regla existente del read model)", () => {
    expect(hoy.status).toBe("PARCIAL"); // fixture con duplicado
    const clean = buildMonthlyClose(ROWS.filter((_, i) => i !== 6), "2026-10");
    expect(projectHoy(clean, meta).status).toBe("VALIDADO_TECNICO");
    expect(projectHoy(clean, { ...meta, stableDuringRead: false }).status).toBe("PARCIAL");
  });
});

describe("HOY · fuente bloqueada y cero escritura", () => {
  const saved = process.env.TIVIPLAY_SPREADSHEET_ID;
  afterEach(() => {
    if (saved === undefined) delete process.env.TIVIPLAY_SPREADSHEET_ID;
    else process.env.TIVIPLAY_SPREADSHEET_ID = saved;
  });

  it("4 · sin fuente configurada la lectura falla (la página muestra BLOQUEADO, no datos)", async () => {
    delete process.env.TIVIPLAY_SPREADSHEET_ID;
    await expect(getTiviplayHoyLive("2026-10")).rejects.toThrow(/TIVIPLAY_SPREADSHEET_ID/);
  });

  const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf8");

  it("3 · la cadena HOY solo usa el cliente read-only (scope readonly, sin métodos de escritura)", () => {
    const client = read("./sheets-client.ts");
    expect(client).toContain("auth/spreadsheets.readonly");
    expect(client).not.toMatch(/method:\s*["'](POST|PUT|PATCH|DELETE)|:batchUpdate|:append|values:update/);
    for (const f of ["./hoy-projection.ts", "./monthly-close.ts", "../../app/(intranet)/operaciones/tiviplay/hoy/page.tsx"])
      expect(read(f)).not.toMatch(/fetch\(|method:\s*["'](POST|PUT|PATCH)|batchUpdate|values:update|:append/);
  });

  it("6 · la lógica del motor no se duplica en la proyección ni en la UI", () => {
    const sources = [read("./hoy-projection.ts"), read("../../app/(intranet)/operaciones/tiviplay/hoy/page.tsx")].join("\n");
    // Señales de clasificación/selección propias del motor (core.mjs) que no deben reaparecer.
    expect(sources).not.toMatch(/MES\\s\+GRATIS|NO\\s\+RENUEV|EXCEPCI\[|parseOperationalDate|F\. PRÓXIMO PAGO"\]|monthBounds|identityKey/);
    expect(read("./monthly-close.ts")).toContain('from "@motor/tiviplay-monthly-close-v1/core"');
  });
});
