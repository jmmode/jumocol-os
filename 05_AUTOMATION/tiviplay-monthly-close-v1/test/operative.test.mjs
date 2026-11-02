import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import XLSX from "xlsx";

import { buildMonthlyClose } from "../src/core.mjs";
import { buildDraft, detectSections } from "../src/draft/builder.mjs";
import { COL, OCTOBER_HEADERS_A_U, OPERATIVE_HEADERS, PASSWORD_COL, ROW_KIND } from "../src/operative/contract.mjs";
import { readPanelAccounts, reconcilePanelIds, parsePanelDate } from "../src/operative/panel-ids.mjs";
import { renderOperative } from "../src/operative/render.mjs";
import { extractSecrets } from "../src/operative/secrets.mjs";

// Datos 100 % ficticios con el esquema ACTUAL de BASE GENERAL (ID en M, USUARIO en N, CONTRASEÑA en O).
const PW = "PW-SENTINEL-91";
const HEADER = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO",
  "DISPOSITIVOS", "CUMPLEAÑOS ", "TIPO_SERVICIO", "CODIGO_CANONICO",
];
const ficha = (n, next, { tc = "1", usd = "15", cop = "", id = "", user = `usr-${n}`, status = "Al dia", devices = `TV BOX ${n}` } = {}) => [
  tc, `Cliente Ficticio ${n}`, `555000${n}`, `f${n}@example.test`, status, "", "PLAN 1 MES", "1", "", usd, cop, "ZELLE",
  id, user, `${PW}-${n}`, "PANEL A", "", "01-10-26", next, "1", "", devices, "", "PLAN PRINCIPAL", "PLN_01",
];
function baseRows() {
  return [
    ["", "BASE GENERAL · FICTICIA"],
    HEADER,
    ficha(3, "02-11-26", { id: "1003" }),
    ficha(4, "06-11-26"),
    ficha(5, "13-11-26"),
    ficha(6, "24-10-26", { status: "Vencido", cop: "45000", usd: "" }), // renovación COP confirmada 24/10 → 24/11
    ficha(7, "17-11-26"), // pagó reactivación en octubre: próximo 17/10/2027 → fuera del mes
    ficha(8, "20-11-26", { user: "usr-dup" }),
    ficha(9, "21-11-26", { user: "usr-dup" }),
    ["", "MIRA+"],
    ficha(11, "10-11-26"),
    ["827", "TOTAL GENERAL (TIVIPLAY + MIRA+)"],
    ["", "DESACTIVADOS SEPTIEMBRE 2026"],
    ficha(14, "05-11-26"),
  ];
}
const pay = (over) => ({
  source: "ZELLE (OCT)", row: 4, confirmation: "CONFIRMADO JM", matches: "1", baseRow: 4, amount: "15", amountCop: "",
  currency: "USD", paymentDate: "2026-10-06", link: "ENLAZADO", tariffCheck: "COINCIDE PLAN", proposedNext: "", proposalState: "",
  ...over,
});
const PAYMENTS = [
  pay({ source: "TRANSF (OCT)", row: 9, baseRow: 6, amount: "45000", currency: "COP", paymentDate: "2026-10-24", proposedNext: "2026-11-24" }),
  pay({ row: 12, baseRow: 7, paymentDate: "2026-10-17", proposedNext: "2027-10-17" }),
  pay({ row: 13, baseRow: 5, confirmation: "", paymentDate: "2026-10-30" }),
];
const PANEL_SHEETS = [{
  name: "PANEL A",
  rows: [["#", "Id", "Username", "Password", "Owner", "Expiration"],
    [1, 1003, "usr-3", "x", "resA", "2026-12-01 10:00:00"],
    [2, 1004, "usr-4", "x", "resA", "2026-11-03 10:00:00"],
    [3, 2005, "usr-5", "x", "resA", "2026-12-15"], [4, 2105, "usr-5", "x", "resB", "2026-10-01"],
    [5, 1006, "usr-6", "x", "resA", "2026-12-24"], [6, 1008, "usr-dup", "x", "resA", "2026-12-24"]],
}];

function run({ secrets = false } = {}) {
  const rows = baseRows();
  const close = buildMonthlyClose(rows, "2026-11", { cutoffDate: "2026-11-01" });
  const draft = buildDraft({ baseRows: rows, close, payments: PAYMENTS, decisions: {}, cutoffDate: "2026-11-01" });
  const { B, headerIndex } = draft.model;
  const sections = detectSections(rows, headerIndex, B);
  const sectionOf = (n) => sections.get(n) ?? { label: "" };
  const records = [3, 4, 5, 6, 7, 8, 9, 11].map((n) => ({ n, user: rows[n - 1][B.user], panel: rows[n - 1][B.panel], id: rows[n - 1][B.id] }));
  const panel = reconcilePanelIds(records, readPanelAccounts(PANEL_SHEETS).accounts);
  return { draft, panel, sheet: renderOperative({ model: draft.model, panel: panel.byRow, secrets: secrets ? extractSecrets(rows) : null, sectionOf }) };
}
const fichaRows = (sheet) => sheet.rows.filter((r) => r.kind === ROW_KIND.FICHA);

test("contrato: Q = DISPOSITIVOS, N = CONTRASEÑA, U = ID; la diferencia con octubre es explícita y sin columnas V+", () => {
  assert.equal(OPERATIVE_HEADERS.length, 21);
  assert.equal(OPERATIVE_HEADERS[16], "DISPOSITIVOS");
  assert.equal(OPERATIVE_HEADERS[13], "CONTRASEÑA");
  assert.equal(OPERATIVE_HEADERS[20], "ID");
  const changed = OPERATIVE_HEADERS.map((h, i) => (h !== OCTOBER_HEADERS_A_U[i] ? `${String.fromCharCode(65 + i)}:${OCTOBER_HEADERS_A_U[i]}→${h}` : null)).filter(Boolean);
  assert.deepEqual(changed, ["Q:F.ULTIMO PAGO→DISPOSITIVOS", "R:F. PRÓXIMO PAGO→F.ULTIMO PAGO", "S:T→F. PRÓXIMO PAGO", "T:REFERIDO→T", "U:DISPOSITIVOS→ID"]);
  for (const h of ["F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "DISPOSITIVOS"]) assert.ok(OPERATIVE_HEADERS.includes(h), `${h} no se pierde`);
});

test("builder lee BASE por encabezado: con ID en M, USUARIO y PANEL salen de sus columnas reales", () => {
  const { sheet } = run();
  const f3 = fichaRows(sheet).find((r) => r.baseRow === 3);
  assert.equal(f3.values[COL.USUARIO], "usr-3");
  assert.equal(f3.values[COL.PANEL], "PANEL A");
  assert.equal(f3.values[COL.DISPOSITIVOS], "TV BOX 3");
  assert.equal(f3.values[COL.ID], "1003");
});

test("hoja del asesor: solo bloques semanales y total; sin CONFIRMADO JM; ya pagados y MIRA+ fuera", () => {
  const { sheet } = run();
  const kinds = new Set(sheet.rows.map((r) => r.kind));
  assert.deepEqual([...kinds].sort(), ["FICHA", "HEADER", "SUMMARY", "TITLE", "TOTAL", "WEEK", "WEEK_TOTAL"]);
  assert.equal(sheet.rows.at(-1).kind, ROW_KIND.TOTAL);
  assert.doesNotMatch(JSON.stringify(sheet.rows), /CONFIRMADO/);
  const inSheet = fichaRows(sheet).map((r) => r.baseRow).sort((a, b) => a - b);
  assert.ok(!inSheet.includes(7), "pagó en octubre con próximo 2027: no se cobra en noviembre");
  assert.ok(!inSheet.includes(11), "MIRA+ no entra a TIVIPLAY");
  assert.ok(!inSheet.includes(14), "secciones históricas fuera");
  assert.ok(sheet.exceptions.some((e) => e.baseRow === 7 && e.code === "PAGADO_SIN_PROPAGAR"));
  assert.ok(sheet.exceptions.some((e) => e.baseRow === 11 && e.code === "MIRA_PLUS"));
  assert.equal(sheet.summary.weeks.reduce((a, b) => a + b, 0), sheet.summary.fichas);
});

test("pago COP CONFIRMADO JM de octubre mueve la ficha a su fecha comercial de noviembre", () => {
  const { sheet } = run();
  const f6 = fichaRows(sheet).find((r) => r.baseRow === 6);
  assert.ok(f6, "la renovación confirmada en COP entra al mes");
  assert.equal(f6.values[COL["F. PRÓXIMO PAGO"]], "2026-11-24");
  assert.equal(f6.values[COL["F.ULTIMO PAGO"]], "2026-10-24");
  assert.equal(f6.values[COL.ESTADO], "Por vencer");
});

test("conciliación ID: 1:1 asigna; múltiples cuentas o USUARIO repetido no eligen y quedan como excepción", () => {
  const { panel, sheet } = run();
  assert.equal(panel.byRow.get(4).id, "1004");
  assert.equal(panel.byRow.get(5).reason, "MULTIPLES_IDS_PANEL");
  assert.equal(panel.byRow.get(8).reason, "DUPLICADO_USUARIO_BASE");
  const f5 = fichaRows(sheet).find((r) => r.baseRow === 5);
  assert.equal(f5.values[COL.ID], "");
  assert.ok(sheet.exceptions.some((e) => e.baseRow === 5 && e.code === "MULTIPLES_IDS_PANEL" && e.owner === "BACK OFFICE"));
  // Fecha técnica antes de la comercial: no pedir crédito sin verificar cuenta vigente.
  assert.ok(sheet.exceptions.some((e) => e.baseRow === 4 && e.code === "FECHA_TECNICA_ANTES_DE_COMERCIAL"));
  assert.equal(parsePanelDate(46350), "2026-11-24");
});

test("contraseñas: solo con secrets, de la misma fila y USUARIO; nunca en firma ni excepciones", () => {
  const plain = run().sheet;
  const full = run({ secrets: true }).sheet;
  assert.ok(fichaRows(plain).every((r) => r.values[PASSWORD_COL] === ""));
  for (const r of fichaRows(full)) assert.equal(r.values[PASSWORD_COL], `${PW}-${r.baseRow}`);
  assert.equal(plain.signature, full.signature, "la firma ignora CONTRASEÑA");
  assert.doesNotMatch(JSON.stringify(full.exceptions) + JSON.stringify(full.summary), new RegExp(PW));
  assert.equal(full.summary.passwords.mismatched, 0);
});

test("determinismo: misma entrada, misma firma y mismas excepciones", () => {
  const a = run({ secrets: true }).sheet;
  const b = run({ secrets: true }).sheet;
  assert.equal(a.signature, b.signature);
  assert.deepEqual(a.exceptions, b.exceptions);
});

test("extremo a extremo: generate-month.mjs sobre XLSX ficticios, dos ejecuciones idénticas y origen intacto", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tivi-gen-"));
  const corte = path.join(dir, "corte.xlsx");
  const paneles = path.join(dir, "paneles.xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(baseRows()), "BASE GENERAL");
  const ph = ["FECHA", "MONTO RECIBIDO", "CONFIRMACION", "COINCIDENCIAS_BASE", "FILA_BASE", "ESTADO_ENLACE", "MONEDA_PAGO", "VALIDACION_TARIFA", "PROP_F_PROXIMO"];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["ZELLE"], ph, ["", "", "", "", "", "", "", "", ""], ["17-10-26", "15", "CONFIRMADO JM", "1", "7", "ENLAZADO", "USD", "COINCIDE", "17-10-27"]]), "ZELLE (OCT)");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["TRANSF"], ph, ["24-10-26", "45000", "CONFIRMADO JM", "1", "6", "ENLAZADO", "COP", "", "24-11-26"]]), "TRANSF (OCT)");
  XLSX.writeFile(wb, corte);
  const pw = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pw, XLSX.utils.aoa_to_sheet(PANEL_SHEETS[0].rows), "PANEL A");
  XLSX.writeFile(pw, paneles);
  const before = fs.readFileSync(corte);
  const runCli = (out) => execFileSync(process.execPath, ["generate-month.mjs", "--corte", corte, "--paneles", paneles, "--month", "2026-11", "--cutoff", "2026-11-01", "--out", out], {
    cwd: path.resolve(import.meta.dirname, ".."), env: { ...process.env, TIVIPLAY_INCLUDE_PASSWORDS: "YES" }, encoding: "utf8",
  });
  const o1 = runCli(path.join(dir, "out1"));
  const o2 = runCli(path.join(dir, "out2"));
  const sig = (o) => o.match(/Firma corrida 1: (\w+)/)[1];
  assert.equal(sig(o1), sig(o2));
  assert.match(o1, /STATUS: OK/);
  assert.doesNotMatch(o1 + o2, new RegExp(PW), "la consola nunca muestra contraseñas");
  assert.ok(before.equals(fs.readFileSync(corte)), "el corte de origen no cambia");
  const ev = JSON.parse(fs.readFileSync(path.join(dir, "out1", "EVIDENCIA_EJECUCION_2026-11_corte-2026-11-01.json"), "utf8"));
  assert.doesNotMatch(JSON.stringify(ev), new RegExp(PW));
  const out = XLSX.readFile(path.join(dir, "out1", "PAGOS_NOVIEMBRE_2026_MOTOR_2026-11-01_CON_CONTRASENAS.xlsx"));
  const rows = XLSX.utils.sheet_to_json(out.Sheets["PAGOS NOVIEMBRE 2026"], { header: 1, defval: "" });
  assert.deepEqual(rows[2], OPERATIVE_HEADERS);
  assert.ok(rows.every((r) => r.length <= 21), "nada desde V hacia la derecha");
});
