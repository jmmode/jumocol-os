import test from "node:test";
import assert from "node:assert/strict";
import { buildMonthlyClose, normalizeCutoffDate } from "../src/core.mjs";

// Datos ficticios con los encabezados de BASE GENERAL.
const HEADER = ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","OBSERVACIONES","PLAN ACTIVO","PANTALLAS","CELULAR","USD","COP","MÉTODO DE PAGO","USUARIO","CONTRASEÑA","PANEL","F.VENCIMIENTO","F.ULTIMO PAGO","F. PRÓXIMO PAGO","T","REFERIDO"];
const row = (tc, user, next, obs = "", last = "") =>
  [tc, `Cliente ${user}`, "300", `${user}@example.test`, "", obs, "PLAN 1 MES", "1", "0", "15", "0", "ZELLE", user, "pw", "P1", "", last, next, "", ""];

const ROWS = [
  ["", "TIVIPLAY"],
  HEADER,
  row("1", "oct-a", "2026-10-04"),
  row("1", "oct-b", "2026-10-30", "pdte mes gratis"),
  row("1", "sep-a", "2026-09-15", "", "2026-08-15"),
  row("1", "sep-b", "2026-09-02", "USUARIO LIBERADO, desactivado, no renueva"),
  row("1", "jul-a", "2026-07-20", "migración panel"),
  row("1", "old-a", "2025-04-11", "cuenta unificada"),
  row("0", "tc0-past", "2026-08-01"),
  row("0", "tc0-oct", "2026-10-10"),
  row("1", "nov-a", "2026-11-05"),
  row("1", "empty-fpp", ""),
  row("1", "bad-fpp", "04-027"),
];

test("selector mensual sin regresión: solo TC=1 con F. PRÓXIMO PAGO en el mes", () => {
  const r = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  assert.deepEqual(r.preview.map((p) => p.username), ["oct-a", "oct-b"]);
  assert.equal(r.preview[1].classification, "REQUIERE_REVISION");
  // La firma histórica del ciclo mensual no depende de la fecha de corte ni de la cartera.
  assert.equal(r.signature, buildMonthlyClose(ROWS, "2026-10").signature);
});

test("fecha de corte explícita y reproducible; nunca la fecha de ejecución", () => {
  const a = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  const b = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  assert.equal(a.cutoffDate, "2026-09-30");
  assert.equal(a.outputSignature, b.outputSignature);
  assert.equal(a.carteraVencida.find((c) => c.origin === "BASE GENERAL!5").daysPastDue, 15);
  assert.notEqual(buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-10-05" }).outputSignature, a.outputSignature);
  assert.equal(buildMonthlyClose(ROWS, "2026-10").cutoffDate, null);
  assert.equal(buildMonthlyClose(ROWS, "2026-10").carteraVencida[0].daysPastDue, null);
  assert.throws(() => normalizeCutoffDate("30/09/2026"), /YYYY-MM-DD/);
});

test("cartera separada del ciclo, sin duplicación y agrupada del mes más reciente al más antiguo", () => {
  const r = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  const cartera = r.carteraVencida.map((c) => c.sourceRow);
  const monthly = r.preview.map((p) => p.sourceRow);
  assert.equal(cartera.filter((x) => monthly.includes(x)).length, 0);
  assert.deepEqual(r.carteraByMonth, [
    { month: "2026-09", count: 2 },
    { month: "2026-07", count: 1 },
    { month: "2025-04", count: 1 },
  ]);
  assert.deepEqual(r.carteraVencida.map((c) => c.dueMonth), ["2026-09", "2026-09", "2026-07", "2025-04"]);
  assert.ok(r.carteraVencida.every((c) => c.origin === `BASE GENERAL!${c.sourceRow}`));
  // Sin PII en la salida de cartera.
  assert.doesNotMatch(JSON.stringify(r.carteraVencida), /Cliente|example\.test|pw/);
});

test("TC=0 queda fuera del ciclo mensual y de la cartera", () => {
  const r = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  const rows = [...r.preview.map((p) => p.sourceRow), ...r.carteraVencida.map((c) => c.sourceRow)];
  assert.ok(!rows.includes(9) && !rows.includes(10));
  assert.equal(rows.length, 6);
});

test("F. PRÓXIMO PAGO vacía o inválida queda visible como excepción", () => {
  const r = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  assert.deepEqual(
    r.exceptions.map((e) => [e.sourceRow, e.type, e.cause]),
    [
      [12, "INVALID_NEXT_PAYMENT_DATE", "EMPTY_NEXT_PAYMENT_DATE"],
      [13, "INVALID_NEXT_PAYMENT_DATE", "UNPARSEABLE_NEXT_PAYMENT_DATE"],
    ],
  );
});

test("las señales clasifican pero no eliminan fichas de cartera", () => {
  const r = buildMonthlyClose(ROWS, "2026-10", { cutoffDate: "2026-09-30" });
  assert.equal(r.carteraVencida.length, 4);
  const byRow = Object.fromEntries(r.carteraVencida.map((c) => [c.sourceRow, c]));
  assert.deepEqual(byRow[6].signals, ["USUARIO_LIBERADO", "DESACTIVADO", "NO_RENUEVA"]);
  assert.equal(byRow[6].classification, "REQUIERE_REVISION");
  assert.deepEqual(byRow[7].signals, ["MIGRACION"]);
  assert.deepEqual(byRow[8].signals, ["CUENTA_UNIFICADA"]);
  assert.equal(byRow[5].classification, "CARTERA_VENCIDA");
  assert.equal(byRow[5].lastPaymentDate, "2026-08-15");
  assert.deepEqual(r.carteraSignalCounts, { USUARIO_LIBERADO: 1, DESACTIVADO: 1, NO_RENUEVA: 1, MIGRACION: 1, CUENTA_UNIFICADA: 1 });
});
