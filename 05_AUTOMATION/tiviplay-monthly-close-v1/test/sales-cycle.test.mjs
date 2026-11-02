import test from "node:test";
import assert from "node:assert/strict";
import { buildSalesCycle, parsePlan, addMonths, toSerial, paymentSheetFor } from "../src/sales-cycle.mjs";

const CATALOG = [
  { months: 1, screens: 1, usd: 15 },
  { months: 2, screens: 1, usd: 25 },
  { months: 6, screens: 1, usd: 70 },
  { months: 6, screens: 2, usd: 82 },
  { months: 12, screens: 2, usd: 150 },
  { months: 12, screens: 3, usd: 180 },
];

const SALES_H = ["TC", "CONCEPTO", "ORIGEN", "ASESOR", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP", "MÉTODO DE PAGO", "F.ULTIMO PAGO", "F.PRÓXIMO PAGO", "DISPOSITIVO", "CONFIRMACION"];
const sale = ({ tc = "1", concept = "Referido", origin = "", user, panel = "PANEL 3", plan, screens, usd, method = "ZELLE", last, next = "" }) =>
  [tc, concept, origin, "Asesor", "Nombre Privado", "300", "x@example.com", "REGISTRADA", "", user, "secreto-no-leer", panel, "", plan, screens, "", usd, "", method, last, next, "", ""];

const ZELLE_H = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "ESTADO_ENLACE"];
const zelle = (usd, date, origin, conf = "CONFIRMADO JM", fila = "", link = "SIN BASE") => ["1", "Nombre Privado", `$${usd}`, date, "Asesor", origin, "", conf, "NOMBRE PRIVADO", fila ? "1" : "0", fila, link];
const PAYPAL_H = ["TC", "CLIENTE", "", "FACTURA ENVIADA", "COMISION", "MONTO RECIBIDO", "FECHA DE RECIBIDO", "Link", "FECHA DE CREACION", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE", "ESTADO_ENLACE"];
const paypal = (usd, date, origin) => ["1", "Nombre Privado", "", "74", "4", String(usd), date, "", date, "Asesor", origin, "", "CONFIRMADO JM", "", "0", "", ""];
const TRANSF_H = ["TC", "CLIENTE", "VALOR EN PESOS", "USD", "CAD", "MEDIO DE PAGO", "FECHA", "ASESOR", "ORIGEN", "OBSERVACIÓN", "CONFIRMACION", "CLIENTE_KEY", "COINCIDENCIAS_BASE", "FILA_BASE"];
const transf = (usd, date, origin) => ["1", "Nombre Privado", "", String(usd), "0", "NEQUI", date, "Asesor", origin, "", "CONFIRMADO JM", "", "0", ""];
const CTL_H = ["TC", "ASESOR", "RECARGA", "USUARIO", "CONTRASEÑA", "PANEL", "FECHA", "F.VENCIMIENTO", "ORIGEN", "CREDITO"];
const ctl = (user, date, origin = "Venta", credit = "1") => ["1", "ASESOR", "1 MES", user, "secreto-no-leer", "panel", `${date} 10:00:00`, "", origin, credit];
const BASE_H = ["TC", "CLIENTE", "ESTADO", "PLAN ACTIVO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F. PRÓXIMO PAGO", "CLIENTE_KEY"];
const baseRow = (tc, user, next, key = "OTRO") => [tc, "Nombre", "Al dia", "PLAN 12 MESES", "", user, "secreto-no-leer", "PANEL 1", next, key];

function fixture() {
  const salesRows = [
    ["", "", "", "", "", "VENTAS OCTUBRE"],
    SALES_H,
    sale({ user: "u-paypal12", plan: "PLAN 6 MESES", screens: "1", usd: "70.00", method: "PAYPAL", last: "24-10-26", next: "24-04-27" }), // 3
    sale({ concept: "Cliente nuevo", origin: "MIRA+", user: "u-mira", panel: "PANEL 2", plan: "PLAN 1 MES", screens: "1", usd: "10.00", method: "NEQUI", last: "09-10-26" }), // 4
    sale({ user: "u-homonimo", plan: "PLAN 6 MESES", screens: "1", usd: "70.00", last: "08-10-26", next: "08-04-27" }), // 5
    sale({ user: "u-bono", plan: "PLAN 12 MESES+2", screens: "3", usd: "180.00", last: "27-10-26", next: "27-12-27" }), // 6
    sale({ user: "u-tarifa", plan: "PLAN 12 MESES", screens: "3", usd: "110.00", last: "29-10-26", next: "29-10-27" }), // 7
    sale({ concept: "Reactivación", user: "u-react", plan: "PLAN 12 MESES", screens: "3", usd: "70.00", last: "25-10-26", next: "25-10-27" }), // 8
    sale({ concept: "Reactivación", user: "u-react-sin", plan: "PLAN 12 MESES", screens: "3", usd: "70.00", method: "NEQUI", last: "17-10-26", next: "17-10-27" }), // 9
    sale({ user: "u-fecha", plan: "PLAN 1 MES", screens: "1", usd: "15.00", last: "14-10-26", next: "14-12-26" }), // 10
    sale({ user: "u-sincontrol", plan: "PLAN 1 MES", screens: "1", usd: "15.00", last: "25-10-26" }), // 11
    sale({ concept: "Reactivación", user: "u-existente", plan: "PLAN 2 MES", screens: "1", usd: "25.00", last: "26-10-26", next: "26-12-26" }), // 12
    sale({ tc: "0", concept: "FREE", user: "u-free", plan: "PLAN 1 MES", screens: "1", usd: "15.00" }), // 13
    sale({ user: "u-transf8", plan: "PLAN 2 MESES", screens: "1", usd: "25.00", method: "NEQUI", last: "10-10-26", next: "10-12-26" }), // 14
    ["17", "TOTAL VENTAS CONFIRMADAS"],
  ];
  const payments = {
    ZELLE: [[], ["", "ZELLE OCTUBRE"], ZELLE_H,
      zelle(70, "08-10-26", "FACTURACIÓN", "CONFIRMADO JM", "6", "ENLAZADO"), // 4
      zelle(70, "08-10-26", "VENTA", "CONFIRMADO JM", "5", "ENLAZADO"), // 5 → homónimo (BASE!5 tiene otro USUARIO)
      zelle(180, "27-10-26", "VENTA"), // 6
      zelle(110, "29-10-26", "VENTA"), // 7
      zelle(70, "25-10-26", "FACTURACIÓN"), // 8 → u-react
      zelle(70, "25-10-26", "RECONEXIÓN", "CONFIRMADO JM", "6", "ENLAZADO"), // 9 → otra ficha
      zelle(15, "14-10-26", "VENTA"), // 10
      zelle(15, "14-10-26", "FACTURACIÓN", "CONFIRMADO JM", "6", "ENLAZADO"), // 11
      zelle(15, "25-10-26", "VENTA"), // 12
      zelle(25, "26-10-26", "RECONEXIÓN", "CONFIRMADO JM", "7", "ENLAZADO"), // 13
      zelle(40, "30-10-26", "VENTA"), // 14: VENTA confirmada sin fila en VENTAS
    ],
    PAYPAL: [["", "PAYPAL OCTUBRE"], PAYPAL_H, paypal(70, "24-10-26", "FACTURACIÓN")],
    TRANSF: [["", "TRANSFERENCIAS OCTUBRE"], TRANSF_H, transf(10, "09-10-26", "VENTA"), transf(70, "17-10-26", "FACTURACIÓN"), transf(25, "10-10-26", "FACTURACIÓN")],
  };
  const control = {
    P3: [["", "CONTROL"], CTL_H, ctl("u-paypal12", "2026-10-25"), ctl("u-homonimo", "2026-10-08"), ctl("u-bono", "2026-10-27"), ctl("u-tarifa", "2026-10-29"), ctl("u-react-sin", "2026-10-17"), ctl("u-fecha", "2026-10-14"), ctl("u-transf8", "2026-10-13", "Facturación")],
    P2: [["", "CONTROL"], CTL_H, ctl("u-mira", "2026-10-09")],
  };
  const baseRows = [
    ["", ""],
    BASE_H,
    baseRow("1", "u-a", "01-12-26"), // 3
    baseRow("1", "u-b", "01-12-26"), // 4
    baseRow("1", "u-otro-368", "01-03-27"), // 5 (homónimo)
    baseRow("1", "u-c", "15-11-26"), // 6
    baseRow("1", "u-existente", "26-12-26"), // 7
    baseRow("1", "u-react", "25-11-27"), // 8 ficha nueva creada para la reactivación
    ["⬇️", "DESACTIVADOS"], // 9
    baseRow("0", "u-react", "16-04-25"), // 10 histórica (misma cuenta)
  ];
  return { salesRows, payments, control, baseRows };
}

const byRow = (res, row) => res.results.find((r) => r.salesRow === row);

test("plan y duración salen de VENTAS: PAYPAL 70 con 6M·1p es catálogo, no promo 12M", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8 });
  const r = byRow(res, 3);
  assert.equal(r.classification, "ALTA");
  assert.equal(r.payment.ref, "PAYPAL!3");
  assert.deepEqual(r.plan, { months: 6, bonus: 0, screens: 1, label: "PLAN 6 MESES" });
  assert.equal(r.tariff.promo, null);
  assert.equal(r.tariff.catalogUsd, 70);
  assert.equal(r.dates.nextFromPayment, "2027-04-24");
  assert.equal(r.dates.nextFromActivation, "2027-04-25");
  assert.equal(r.status, "AUTORIZABLE_TRAS_D1");
  assert.equal(r.evidence.originMismatch, "FACTURACIÓN");
});

test("con D1 ratificado (pago + catálogo) el alta queda autorizable con seriales exactos", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" });
  const r = byRow(res, 14);
  assert.equal(r.status, "AUTORIZABLE");
  assert.equal(r.payment.ref, "TRANSF!5");
  assert.equal(r.proposal.AI, toSerial("2026-10-10"));
  assert.equal(r.proposal.AJ, toSerial("2026-12-10"));
  assert.equal(r.proposal.N, "<USUARIO de VENTAS>");
  const act = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "ACTIVACION" });
  assert.equal(byRow(act, 14).proposal.AI, toSerial("2026-10-13"));
});

test("MIRA+ queda fuera del universo TIVIPLAY y el FREE (TC=0) se excluye", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8 });
  assert.equal(byRow(res, 4).classification, "MIRA_PLUS");
  assert.equal(byRow(res, 4).payment.ref, "TRANSF!3");
  assert.equal(byRow(res, 13).status, "EXCLUIDO");
  assert.equal(byRow(res, 15), undefined); // fila de totales del tablero
});

test("se prefiere el pago con origen VENTA y se marca el homónimo enlazado por nombre", () => {
  const r = byRow(buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8 }), 5);
  assert.equal(r.payment.ref, "ZELLE!5");
  assert.ok(r.blockers.some((b) => b.code === "HOMONIMO_POSIBLE"));
  assert.equal(r.status, "REQUIERE_REVISION_BO");
});

test("bono y tarifa fuera de catálogo requieren decisión de Dirección", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" });
  assert.deepEqual(byRow(res, 6).blockers.map((b) => b.code), ["BONO_SIN_RATIFICAR"]);
  assert.equal(byRow(res, 6).dates.nextFromPayment, "2027-12-27");
  assert.equal(byRow(res, 6).status, "REQUIERE_DECISION");
  assert.deepEqual(byRow(res, 7).blockers.map((b) => b.code), ["TARIFA_FUERA_DE_CATALOGO"]);
});

test("una ficha ya vigente con el mismo USUARIO no genera alta; si hay histórica, pide decisión", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8 });
  const r = byRow(res, 8);
  assert.equal(r.payment.ref, "ZELLE!8"); // descarta ZELLE!9 enlazado a otra ficha
  assert.equal(r.classification, "YA_EN_BASE");
  assert.deepEqual(r.evidence.baseRows, [8]);
  assert.deepEqual(r.evidence.historicRows, [10]);
  assert.ok(r.blockers.some((b) => b.code === "FICHA_HISTORICA_MISMO_USUARIO"));
  assert.equal(byRow(res, 12).status, "SIN_ACCION_ALTA");
});

test("promo anual por reactivación exige ficha histórica e inactividad > 30 días", () => {
  const r = byRow(buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" }), 9);
  assert.equal(r.classification, "REACTIVACION");
  assert.equal(r.tariff.promo, "PROMO_ANUAL_70");
  const codes = r.blockers.map((b) => b.code);
  assert.ok(codes.includes("FICHA_HISTORICA_NO_LOCALIZADA"));
  assert.ok(codes.includes("ELEGIBILIDAD_PROMO_NO_DEMOSTRADA"));
});

test("discrepancia de fecha en VENTAS y falta de crédito en CONTROL van a BO; nada se corrige", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" });
  const f = byRow(res, 10);
  assert.ok(f.blockers.some((b) => b.code === "FECHA_VENTAS_DISCREPA"));
  assert.equal(f.dates.nextFromPayment, "2026-11-14");
  assert.equal(f.dates.ventasNext, "2026-12-14");
  assert.ok(byRow(res, 11).blockers.some((b) => b.code === "SIN_CREDITO_EN_CONTROL"));
});

test("una activación en CONTROL a semanas del pago es incoherente y va a BO", () => {
  const fx = fixture();
  fx.control.P3.push(ctl("u-sincontrol", "2026-11-25"));
  const r = byRow(buildSalesCycle(fx, { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" }), 11);
  assert.ok(r.blockers.some((b) => b.code === "FECHA_CONTROL_INCOHERENTE"));
  assert.ok(!r.blockers.some((b) => b.code === "SIN_CREDITO_EN_CONTROL"));
});

test("aprobaciones explícitas levantan solo el bloqueo nombrado", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO", approved: { "ZELLE!6": ["BONO_SIN_RATIFICAR"] } });
  assert.equal(byRow(res, 6).status, "AUTORIZABLE");
  assert.equal(byRow(res, 7).status, "REQUIERE_DECISION");
});

test("pagos VENTA confirmados sin fila en VENTAS se reportan", () => {
  const res = buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8 });
  assert.deepEqual(res.unmatchedConfirmedVentas, ["ZELLE!14"]);
});

test("la salida nunca contiene CONTRASEÑA ni datos personales", () => {
  const out = JSON.stringify(buildSalesCycle(fixture(), { catalog: CATALOG, operativeMaxRow: 8, anchor: "PAGO" }));
  for (const leak of ["secreto-no-leer", "Nombre Privado", "NOMBRE PRIVADO", "x@example.com", "u-paypal12"]) {
    assert.equal(out.includes(leak), false, leak);
  }
});

test("utilidades", () => {
  assert.deepEqual(parsePlan("PLAN 12 MESES+1"), { months: 12, bonus: 1 });
  assert.deepEqual(parsePlan("PLAN 1 MES "), { months: 1, bonus: 0 });
  assert.equal(addMonths("2026-10-31", 1), "2026-11-30");
  assert.equal(toSerial("2026-10-14"), 46309);
  assert.equal(paymentSheetFor("NEQUI"), "TRANSF");
});
