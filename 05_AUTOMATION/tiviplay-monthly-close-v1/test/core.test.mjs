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

test("monthly close emits structured preview and invalid-date exception", () => {
  const rows = [
    ["", "TIVIPLAY"],
    ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","OBSERVACIONES","PLAN ACTIVO","PANTALLAS","CELULAR","USD","COP","MÉTODO DE PAGO","USUARIO","CONTRASEÑA","PANEL","F.VENCIMIENTO","F.ULTIMO PAGO","F. PRÓXIMO PAGO","T","REFERIDO","DISPOSITIVOS","TIPO_SERVICIO"],
    ["1","Cliente A","100","a@example.com","Al dia","","PLAN 1 MES","1","0","15","0","ZELLE","user-a","pw","P1","2026-10-31","01-09-26","04-10-26","0","","TV","PLAN PRINCIPAL"],
    ["1","Cliente B","200","b@example.com","Al dia","","PLAN 1 MES","1","0","15","0","ZELLE","user-b","pw","P2","2026-10-31","01-09-26","04-027","0","","TV","PLAN PRINCIPAL"]
  ];

  const result = buildMonthlyClose(rows, "2026-10");
  assert.equal(result.total, 1);
  assert.equal(result.preview.length, 1);
  assert.equal(result.preview[0].classification, "FACTURAR_CANDIDATO");
  assert.equal(result.preview[0].origin, "BASE GENERAL!3");
  assert.equal(result.exceptions.length, 1);
  assert.equal(result.exceptions[0].type, "INVALID_NEXT_PAYMENT_DATE");
  assert.equal(result.exceptions[0].rawValue, "04-027");
});

test("ambiguous business signals are routed to review instead of silently excluded", () => {
  const rows = [
    ["", "TIVIPLAY"],
    ["TC","CLIENTE","TELEFONO","CORREO","ESTADO","OBSERVACIONES","PLAN ACTIVO","PANTALLAS","CELULAR","USD","COP","MÉTODO DE PAGO","USUARIO","CONTRASEÑA","PANEL","F.VENCIMIENTO","F.ULTIMO PAGO","F. PRÓXIMO PAGO","T","REFERIDO","DISPOSITIVOS","TIPO_SERVICIO"],
    ["1","Cliente A","100","a@example.com","Por vencer","Cliente dice NO VA RENOVAR","PLAN 1 MES","1","0","15","0","ZELLE","user-a","pw","P1","2026-10-31","01-09-26","04-10-26","0","","TV","PLAN PRINCIPAL"],
    ["1","Cliente B","200","b@example.com","Por vencer","","PLAN 1 MES","1","0","15","0","ZELLE","user-b","pw","P2","2026-10-31","01-09-26","05-10-26","0","Pendiente mes gratis por referido","TV","PLAN PRINCIPAL"],
    ["1","Cliente C","300","c@example.com","Por vencer","","PLAN 1 MES","1","0","15","0","ZELLE","user-c","pw","P3","2026-10-31","01-09-26","12-10-26","0","","TV","PLAN PRINCIPAL"]
  ];

  const result = buildMonthlyClose(rows, "2026-10");
  assert.equal(result.total, 3);
  assert.equal(result.classificationCounts.REQUIERE_REVISION, 2);
  assert.equal(result.classificationCounts.FACTURAR_CANDIDATO, 1);
  assert.equal(result.reviewReasonCounts.POSSIBLE_NO_RENEWAL, 1);
  assert.equal(result.reviewReasonCounts.POSSIBLE_FREE_MONTH, 1);
});
