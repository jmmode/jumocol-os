import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMonthlyClose,
  compareRuns,
  parseOperationalDate,
  weekBucket,
} from "../src/core.mjs";

test("parses operational date formats", () => {
  assert.equal(parseOperationalDate("2026-10-04"), "2026-10-04");
  assert.equal(parseOperationalDate("04-10-26"), "2026-10-04");
  assert.equal(parseOperationalDate("04/10/2026"), "2026-10-04");
});

test("uses the five operational week buckets", () => {
  assert.equal(weekBucket("2026-10-04"), 1);
  assert.equal(weekBucket("2026-10-05"), 2);
  assert.equal(weekBucket("2026-10-12"), 3);
  assert.equal(weekBucket("2026-10-19"), 4);
  assert.equal(weekBucket("2026-10-26"), 5);
});

test("same input produces same deterministic signature", () => {
  const rows = [
    ["", "TIVIPLAY"],
    ["TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN", "PANTALLAS", "CELULAR", "USD", "COP", "METODO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO"],
    ["1", "Cliente A", "100", "a@example.com", "", "", "", "", "", "", "", "", "user-a", "", "P1", "", "", "01-10-26"],
    ["1", "Cliente B", "200", "b@example.com", "", "", "", "", "", "", "", "", "user-b", "", "P2", "", "", "12-10-26"],
    ["1", "Cliente C", "300", "c@example.com", "", "", "", "", "", "", "", "", "user-c", "", "P3", "", "", "26-10-26"],
    ["1", "Fuera de mes", "400", "x@example.com", "", "", "", "", "", "", "", "", "user-x", "", "P1", "", "", "01-11-26"],
  ];

  const a = buildMonthlyClose(rows, "2026-10");
  const b = buildMonthlyClose(rows, "2026-10");

  assert.equal(a.total, 3);
  assert.deepEqual(a.weeks, [1, 0, 1, 0, 1]);
  assert.equal(compareRuns(a, b).identical, true);
  assert.equal(a.duplicates.length, 0);
});
