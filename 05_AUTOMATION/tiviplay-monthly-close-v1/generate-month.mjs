#!/usr/bin/env node
/**
 * Generador de la PLANILLA OPERATIVA mensual desde un corte congelado (XLSX), sin tocar el libro vivo.
 *
 *   CORTE → copia de trabajo → CONCILIACIÓN ID (PANELES) → PAGOS CONFIRMADO JM → FECHAS COMERCIALES
 *         → UNIVERSO (buildMonthlyClose) → CLASIFICACIÓN (buildDraft) → PLANILLA (renderOperative) → XLSX
 *
 * Uso:
 *   node generate-month.mjs --corte <GESTION_DIA_PAGOS…CORTE.xlsx> --paneles <PANELES_CORTE.xlsx> \
 *        --month 2026-11 --cutoff 2026-11-01 --out <carpeta privada> [--decisions decisions/2026-11.json]
 *   TIVIPLAY_INCLUDE_PASSWORDS=YES  → llena CONTRASEÑA (N) desde la misma fila de BASE GENERAL del corte.
 *   TIVIPLAY_REGRESSION_JSON=<ruta> → casos de regresión privados (no versionados).
 *
 * El cálculo corre dos veces sobre la misma copia y se exige la misma firma. La consola y la evidencia
 * nunca contienen contraseñas; la firma de la planilla se calcula con CONTRASEÑA en blanco.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { buildMonthlyClose, compareRuns, parseOperationalDate } from "./src/core.mjs";
import { buildDraft, detectSections, resolveBaseColumns } from "./src/draft/builder.mjs";
import { draftTarget } from "./src/draft/contract.mjs";
import { COL, PASSWORD_COL, ROW_KIND } from "./src/operative/contract.mjs";
import { readPanelAccounts, reconcilePanelIds } from "./src/operative/panel-ids.mjs";
import { renderOperative, operativeSignature } from "./src/operative/render.mjs";
import { countSecretLeaks, extractSecrets } from "./src/operative/secrets.mjs";
import { fileSha256, findSheet, openWorkbook, panelSheets, readPaymentsFromWorkbook, sheetRows } from "./src/operative/xlsx-source.mjs";
import { writeExceptionsXlsx, writeOperativeXlsx } from "./src/operative/xlsx-writer.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]] : acc), []));
const need = ["corte", "paneles", "month", "cutoff", "out"].filter((k) => !args[k]);
if (need.length) {
  console.error(`Faltan argumentos: ${need.map((k) => `--${k}`).join(" ")}`);
  process.exit(2);
}
const month = args.month;
const cutoffDate = args.cutoff;
const target = draftTarget(month);
const outDir = path.resolve(args.out);
fs.mkdirSync(outDir, { recursive: true });
const includePasswords = process.env.TIVIPLAY_INCLUDE_PASSWORDS === "YES";
const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");
const canon = (v) => String(v ?? "").trim().toLocaleUpperCase("es").replace(/\s+/g, " ");

/* ----------------------------------------------------- copia de trabajo */
const origin = { corte: path.resolve(args.corte), paneles: path.resolve(args.paneles) };
const originHash = { corte: fileSha256(origin.corte), paneles: fileSha256(origin.paneles) };
const workDir = path.join(outDir, "copia-trabajo");
fs.mkdirSync(workDir, { recursive: true });
const work = { corte: path.join(workDir, "corte.xlsx"), paneles: path.join(workDir, "paneles.xlsx") };
fs.copyFileSync(origin.corte, work.corte);
fs.copyFileSync(origin.paneles, work.paneles);

const decisions = args.decisions ? JSON.parse(fs.readFileSync(path.resolve(args.decisions), "utf8")) : {};

/* -------------------------------------------------------------- lectura */
function readInputs() {
  const wb = openWorkbook(work.corte);
  const baseName = findSheet(wb, "BASE GENERAL");
  if (!baseName) throw new Error("El corte no tiene la hoja BASE GENERAL");
  const rawBase = sheetRows(wb, baseName);
  const { payments, missing } = readPaymentsFromWorkbook(wb, target.paymentSheets);
  const { accounts, unreadable } = readPanelAccounts(panelSheets(work.paneles));
  return { rawBase, payments, missingPaymentSheets: missing, accounts, unreadablePanelSheets: unreadable, sheetNames: wb.SheetNames };
}

/* ---------------------------------------------------------- una corrida */
function runOnce(input) {
  const close = buildMonthlyClose(input.rawBase, month, { cutoffDate }); // redacta CONTRASEÑA internamente
  const draft = buildDraft({ baseRows: input.rawBase.map((r) => r), close, payments: input.payments, decisions, cutoffDate });
  const { B, headerIndex } = draft.model;
  const sections = detectSections(input.rawBase, headerIndex, B);
  const sectionOf = (n) => sections.get(n) ?? { label: "", historical: false };
  const records = [];
  for (let n = headerIndex + 2; n <= input.rawBase.length; n++) {
    const r = input.rawBase[n - 1] ?? [];
    const tc = String(r[B.tc] ?? "").trim();
    if ((tc === "0" || tc === "1") && !sectionOf(n).historical && String(r[B.client] ?? "").trim()) {
      records.push({ n, user: String(r[B.user] ?? "").trim(), panel: String(r[B.panel] ?? "").trim(), id: String(r[B.id] ?? "").trim() });
    }
  }
  const panel = reconcilePanelIds(records, input.accounts);
  const secrets = includePasswords ? extractSecrets(input.rawBase) : null;
  const sheet = renderOperative({ model: draft.model, panel: panel.byRow, secrets, sectionOf });
  return { close, draft, panel, sheet, secrets, sectionOf, B };
}

const input1 = readInputs();
const run1 = runOnce(input1);
const input2 = readInputs(); // segunda lectura completa de la misma copia
const run2 = runOnce(input2);

/* ------------------------------------------------------------ controles */
const fichas = run1.sheet.rows.filter((r) => r.kind === ROW_KIND.FICHA);
const sheetText = JSON.stringify(run1.sheet.rows.map((r) => r.values.filter((_, i) => i !== PASSWORD_COL)));
const fichaIds = fichas.map((r) => r.id);
const userIdPairs = fichas.map((r) => `${canon(r.values[COL.USUARIO])}|${r.values[COL.ID]}`);
const checks = {
  firmaMotorIgual: compareRuns(run1.close, run2.close),
  firmaPlanillaIgual: run1.sheet.signature === run2.sheet.signature,
  excepcionesIguales: sha(JSON.stringify(run1.sheet.exceptions)) === sha(JSON.stringify(run2.sheet.exceptions)),
  fichasDuplicadas: fichaIds.length - new Set(fichaIds).size,
  usuarioIdDuplicado: userIdPairs.filter((x) => !x.endsWith("|")).length - new Set(userIdPairs.filter((x) => !x.endsWith("|"))).size,
  confirmadoJmEnHoja: (sheetText.match(/CONFIRMADO/gi) ?? []).length,
  semanasSuman: run1.sheet.summary.weeks.reduce((a, b) => a + b, 0) === run1.sheet.summary.fichas,
  fechasDentroDelMes: fichas.every((r) => String(r.values[COL["F. PRÓXIMO PAGO"]]).slice(0, 7) === month),
  fichasSinContacto: fichas.filter((r) => !String(r.values[COL.TELEFONO]).trim() && !String(r.values[COL.CORREO]).trim()).length,
  fichasSinDispositivos: fichas.filter((r) => !String(r.values[COL.DISPOSITIVOS]).trim()).length,
  fichasSinId: fichas.filter((r) => !String(r.values[COL.ID]).trim()).length,
  contrasenas: includePasswords ? run1.sheet.summary.passwords : "NO SOLICITADAS",
  firmaSinContrasenasIgual: operativeSignature(run1.sheet.rows) === run1.sheet.signature,
};
if (includePasswords) {
  // Cada contraseña escrita debe venir de la misma fila y del mismo USUARIO.
  checks.contrasenaFilaUsuario = fichas.every((r) => {
    const s = run1.secrets.get(r.baseRow);
    return !r.values[PASSWORD_COL] || (s && canon(s.user) === canon(r.values[COL.USUARIO]) && s.secret === r.values[PASSWORD_COL]);
  });
}

/* --------------------------------------------------------- regresiones */
let regression = null;
if (process.env.TIVIPLAY_REGRESSION_JSON) {
  const cases = JSON.parse(fs.readFileSync(process.env.TIVIPLAY_REGRESSION_JSON, "utf8"));
  const { B } = run1;
  regression = cases.map((c) => {
    const rowsMatch = [];
    input1.rawBase.forEach((r, i) => {
      if (canon(r[B.client]).includes(canon(c.match))) rowsMatch.push(i + 1);
    });
    const inSheet = fichas.filter((f) => rowsMatch.includes(f.baseRow));
    const exc = run1.sheet.exceptions.filter((e) => rowsMatch.includes(Number(e.baseRow)));
    const got = { filasBase: rowsMatch, enHoja: inSheet.length > 0, proximoComercial: inSheet.map((f) => f.values[COL["F. PRÓXIMO PAGO"]]), excepciones: exc.map((e) => e.code) };
    let ok = true;
    if (c.expect.inSheet != null && got.enHoja !== c.expect.inSheet) ok = false;
    if (c.expect.next && !got.proximoComercial.includes(c.expect.next)) ok = false;
    if (c.expect.exceptionCode && !got.excepciones.some((x) => x.startsWith(c.expect.exceptionCode))) ok = false;
    return { caso: c.label, esperado: c.expect, obtenido: got, resultado: ok ? "PASA" : "FALLA" };
  });
}

/* --------------------------------------------------------------- salida */
const stamp = `${month}_corte-${cutoffDate}`;
const files = {
  planilla: path.join(outDir, `PAGOS_${target.label.replace(/ /g, "_")}_MOTOR_${cutoffDate}${includePasswords ? "_CON_CONTRASENAS" : ""}.xlsx`),
  excepciones: path.join(outDir, `EXCEPCIONES_${stamp}.xlsx`),
  excepcionesJson: path.join(outDir, `EXCEPCIONES_${stamp}.json`),
  evidencia: path.join(outDir, `EVIDENCIA_EJECUCION_${stamp}.json`),
};
await writeOperativeXlsx(files.planilla, {
  title: `PAGOS ${target.label}`,
  rows: run1.sheet.rows,
  properties: { subject: `firma:${run1.sheet.signature}`, description: `Generado por tiviplay-monthly-close-v1/generate-month.mjs · corte ${cutoffDate} · motor ${run1.close.signature.slice(0, 12)}` },
});
await writeExceptionsXlsx(files.excepciones, { exceptions: run1.sheet.exceptions });
fs.writeFileSync(files.excepcionesJson, JSON.stringify(run1.sheet.exceptions, null, 2));

const finalHash = { corte: fileSha256(origin.corte), paneles: fileSha256(origin.paneles) };
const evidence = {
  componente: "05_AUTOMATION/tiviplay-monthly-close-v1/generate-month.mjs (buildMonthlyClose → buildDraft → reconcilePanelIds → renderOperative → writeOperativeXlsx)",
  comando: `node generate-month.mjs --corte <corte> --paneles <paneles> --month ${month} --cutoff ${cutoffDate} --out <privado>${args.decisions ? ` --decisions ${args.decisions}` : ""}${includePasswords ? " (TIVIPLAY_INCLUDE_PASSWORDS=YES)" : ""}`,
  entrada: {
    corteSha256: originHash.corte, panelesSha256: originHash.paneles,
    origenSinCambios: finalHash.corte === originHash.corte && finalHash.paneles === originHash.paneles,
    hojasPagosLeidas: target.paymentSheets.filter((s) => !input1.missingPaymentSheets.some((m) => m.startsWith(s))),
    hojasPagosFaltantes: input1.missingPaymentSheets,
    pagosNormalizados: input1.payments.length,
    cuentasPanel: input1.accounts.length,
    hojasPanelIlegibles: input1.unreadablePanelSheets,
  },
  motor: { universo: run1.close.total, semanas: run1.close.weeks, duplicados: run1.close.duplicates.length, firma: run1.close.signature, carteraVencida: run1.close.carteraVencida.length, sinFecha: run1.close.exceptions.length },
  clasificacion: run1.draft.summary.classes,
  conciliacionId: run1.panel.counts,
  planilla: { ...run1.sheet.summary, firma: run1.sheet.signature, firmaCorrida2: run2.sheet.signature },
  controles: checks,
  regresiones: regression,
  decisionesAplicadas: Object.keys(decisions.rows ?? {}),
  archivos: Object.fromEntries(Object.entries(files).map(([k, f]) => [k, path.basename(f)])),
};
const evidenceText = JSON.stringify(evidence, null, 2);
if (run1.secrets) {
  const leaks = countSecretLeaks(evidenceText + fs.readFileSync(files.excepcionesJson, "utf8"), run1.secrets);
  if (leaks) throw new Error(`Fuga de contraseña en evidencia/excepciones (${leaks}). Se aborta.`);
  evidence.controles.contrasenasEnEvidencia = 0;
}
fs.writeFileSync(files.evidencia, JSON.stringify(evidence, null, 2));

const ok = checks.firmaMotorIgual && checks.firmaPlanillaIgual && checks.excepcionesIguales && checks.fichasDuplicadas === 0
  && checks.confirmadoJmEnHoja === 0 && checks.semanasSuman && checks.fechasDentroDelMes && evidence.entrada.origenSinCambios
  && (!includePasswords || (checks.contrasenaFilaUsuario && run1.sheet.summary.passwords.mismatched === 0))
  && (!regression || regression.every((r) => r.resultado === "PASA"));
console.log(`PLANILLA ${target.label}: ${run1.sheet.summary.fichas} fichas · semanas ${run1.sheet.summary.weeks.join("/")} · USD ${run1.sheet.summary.usd} · COP ${run1.sheet.summary.cop}`);
console.log(`Firma corrida 1: ${run1.sheet.signature}`);
console.log(`Firma corrida 2: ${run2.sheet.signature}`);
console.log(`Excepciones: ${run1.sheet.exceptions.length} · ${JSON.stringify(run1.sheet.summary.exceptions)}`);
console.log(`Controles: ${JSON.stringify(checks)}`);
if (regression) for (const r of regression) console.log(`Regresión ${r.caso}: ${r.resultado}`);
console.log(`STATUS: ${ok ? "OK" : "REVISAR"}`);
process.exit(ok ? 0 : 1);
