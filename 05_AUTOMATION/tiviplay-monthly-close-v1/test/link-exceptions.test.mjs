import test from "node:test";
import assert from "node:assert/strict";
import { projectLinkExceptions } from "../src/link-exceptions.mjs";

const base = [
  ["BASE"],
  ["TC","CLIENTE","TELEFONO","CORREO","USUARIO","PANEL","F.ULTIMO PAGO","F. PRÓXIMO PAGO"],
  ["1","Existente","100","e@example.com","USER1","PANEL 1","01-09-26","01-10-26"],
  ["1","Duplicado A","200","d@example.com","DUP","PANEL 1","",""],
  ["1","Duplicado B","201","d2@example.com","DUP","PANEL 3","",""]
];
const cartera = [
  ["PAGOS"],
  ["TC","CLIENTE","FUENTE_FINANCIERA","FILA_FUENTE","USUARIO","CORREO","TELEFONO","PANEL","PLAN ACTIVO","F.ULTIMO PAGO","F. PRÓXIMO PAGO"],
  ["1","Existente","ZELLE","3","USER1","e@example.com","100","PANEL 1","PLAN 1 MES","01-10-26","01-11-26"],
  ["1","Ambiguo","ZELLE","4","DUP","","","PANEL 1","PLAN 1 MES","01-10-26","01-11-26"]
];
const zelle = [
  ["ZELLE"],
  ["TC","CLIENTE","MONTO RECIBIDO","FECHA","ORIGEN","CONFIRMACION","COINCIDENCIAS_BASE"],
  ["1","Existente","15","01-10-26","FACTURACIÓN","CONFIRMADO JM","0"],
  ["1","Ambiguo","15","01-10-26","FACTURACIÓN","CONFIRMADO JM","2"],
  ["1","Nuevo","15","02-10-26","VENTA","CONFIRMADO JM","0"],
  ["1","Mira","10","03-10-26","VENTA","CONFIRMADO JM","0"]
];
const paypal = [
  ["PAYPAL"],
  ["TC","CLIENTE","CORREO","MONTO RECIBIDO","FECHA DE RECIBIDO","ORIGEN","CONFIRMACION","COINCIDENCIAS_BASE"],
  ["1","Sin Formula","sf@example.com","15","04-10-26","FACTURACIÓN","CONFIRMADO JM",""]
];
const transf = [["TRANSF"],["TC","CLIENTE","FECHA","ORIGEN","CONFIRMACION","COINCIDENCIAS_BASE"]];
const sales = [
  ["VENTAS"],
  ["TC","CONCEPTO","ORIGEN","CLIENTE","TELEFONO","CORREO","USUARIO","PANEL","PLAN ACTIVO","MÉTODO DE PAGO","F.ULTIMO PAGO","F.PRÓXIMO PAGO"],
  ["1","Referido","Campaña","Nuevo","300","n@example.com","NEW","PANEL 3","PLAN 1 MES","ZELLE","02-10-26","02-11-26"],
  ["1","Cliente nuevo","MIRA+","Mira","400","m@example.com","MIRA","PANEL 2","PLAN 1 MES","ZELLE","03-10-26","03-11-26"]
];

const input = {
  paymentSources: [
    { sheet: "ZELLE (OCT)", code: "ZELLE", rows: zelle },
    { sheet: "PAYPAL (OCT)", code: "PAYPAL", rows: paypal },
    { sheet: "TRANSF (OCT)", code: "TRANSF", rows: transf },
  ],
  carteraRows: cartera,
  baseRows: base,
  salesRows: sales,
  missingFormulaRefs: ["PAYPAL (OCT)!3"],
};

test("projects confirmed linking exceptions without name-only selection", () => {
  const result = projectLinkExceptions(input);
  assert.equal(result.count, 5);
  assert.equal(result.duplicates.length, 0);
  assert.equal(result.items.find((x) => x.client === "Existente").action, "ACTUALIZACION");
  assert.equal(result.items.find((x) => x.client === "Ambiguo").action, "REQUIERE_DECISION");
  assert.equal(result.items.find((x) => x.client === "Nuevo").action, "ALTA");
  assert.equal(result.items.find((x) => x.client === "Mira").action, "EXCLUSION");
  assert.match(result.items.find((x) => x.client === "Sin Formula").reason, /sin fórmulas originales/i);
});

test("same cut is idempotent", () => {
  const a = projectLinkExceptions(input);
  const b = projectLinkExceptions(input);
  assert.deepEqual(a, b);
});
