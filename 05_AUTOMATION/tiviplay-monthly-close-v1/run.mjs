import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildMonthlyClose,
  compareRuns,
  validateOracle,
} from "./src/core.mjs";
import { buildEvidence, findLeaks, renderMarkdown, toPrivateCsv } from "./src/evidence.mjs";
import { readSheetValues } from "./src/google-sheets.mjs";

const spreadsheetId = process.env.TIVIPLAY_SPREADSHEET_ID;
const sheetName = process.env.TIVIPLAY_SOURCE_SHEET ?? "BASE GENERAL";
const targetMonth = process.env.TIVIPLAY_TARGET_MONTH;
// Fecha de corte explícita (YYYY-MM-DD). Sin ella no se calculan días de mora de cartera.
const cutoffDate = process.env.TIVIPLAY_CUTOFF_DATE || null;
const sourceRange = process.env.TIVIPLAY_SOURCE_RANGE ?? "A1:W5000";
// Salidas privadas (snapshot y preview con datos de clientes): solo si se piden explícitamente.
const persistSnapshot = (process.env.TIVIPLAY_PERSIST_SNAPSHOT ?? "false").toLowerCase() === "true";

const expectedCount = process.env.TIVIPLAY_EXPECTED_COUNT
  ? Number(process.env.TIVIPLAY_EXPECTED_COUNT)
  : null;

const expectedWeeks = process.env.TIVIPLAY_EXPECTED_WEEKS
  ? process.env.TIVIPLAY_EXPECTED_WEEKS.split(",").map(Number)
  : null;

if (!spreadsheetId || !targetMonth) {
  console.error("Missing required env vars: TIVIPLAY_SPREADSHEET_ID and TIVIPLAY_TARGET_MONTH");
  process.exit(2);
}

if (expectedWeeks && expectedWeeks.length !== 5) {
  console.error("TIVIPLAY_EXPECTED_WEEKS must have exactly 5 comma-separated integers");
  process.exit(2);
}

const snapshot1 = await readSheetValues({
  spreadsheetId,
  sheetName,
  range: sourceRange,
});

const sourceHash1 = hashRows(snapshot1);

// Pure determinism: same captured input, executed twice.
const run1 = buildMonthlyClose(snapshot1, targetMonth, { cutoffDate });
const run2 = buildMonthlyClose(snapshot1, targetMonth, { cutoffDate });
const repeatability = compareRuns(run1, run2);

// Live drift check: did the source mutate during the execution window?
const snapshot2 = await readSheetValues({
  spreadsheetId,
  sheetName,
  range: sourceRange,
});
const sourceHash2 = hashRows(snapshot2);
const sourceStableDuringRun = sourceHash1 === sourceHash2;

const oracleProvided = expectedCount != null || expectedWeeks != null;
const oracle = validateOracle(run1, expectedCount, expectedWeeks);

const technicalValid =
  repeatability.identical &&
  repeatability.sameCount &&
  repeatability.sameWeeks &&
  run1.duplicates.length === 0 &&
  sourceStableDuringRun;

const status = !technicalValid
  ? "PARCIAL"
  : oracleProvided
    ? (oracle.valid ? "VALIDADO" : "PARCIAL")
    : "VALIDADO_TECNICO";

const generatedAt = new Date().toISOString();

const evidence = buildEvidence({
  generatedAt,
  source: {
    spreadsheetIdHash: maskId(spreadsheetId),
    sheetName,
    range: sourceRange,
    hashAtRead1: sourceHash1,
    hashAtRead2: sourceHash2,
    stableDuringRun: sourceStableDuringRun,
  },
  targetMonth,
  run1,
  run2,
  repeatability,
  oracle: {
    provided: oracleProvided,
    ...oracle,
  },
  status,
});

const evidenceJson = JSON.stringify(evidence, null, 2) + "\n";
const evidenceMd = renderMarkdown(evidence);
if (findLeaks(evidenceJson + evidenceMd, run1.preview) > 0) {
  console.error("Evidencia bloqueada: contiene datos del preview. No se escribió ningún archivo.");
  process.exit(2);
}

const evidenceDir = path.resolve("evidence");
await fs.mkdir(evidenceDir, { recursive: true });

const jsonPath = path.join(evidenceDir, `monthly-close-${targetMonth}.json`);
const mdPath = path.join(evidenceDir, `monthly-close-${targetMonth}.md`);

await fs.writeFile(jsonPath, evidenceJson, "utf8");
await fs.writeFile(mdPath, evidenceMd, "utf8");

let snapshotPath = null;
if (persistSnapshot) {
  const snapshotDir = path.resolve(
    "..",
    "..",
    "06_APPLICATIONS",
    "JUMOCOL_OPERATIONS_INTELLIGENCE",
    "data",
    "private",
    "tiviplay-monthly-close-v1",
    "snapshots"
  );
  await fs.mkdir(snapshotDir, { recursive: true });
  const stamp = generatedAt.replace(/[:.]/g, "-");
  snapshotPath = path.join(
    snapshotDir,
    `${targetMonth}__${safeFileName(sheetName)}__${stamp}.json`
  );
  await fs.writeFile(
    snapshotPath,
    JSON.stringify({
      generatedAt,
      spreadsheetIdHash: maskId(spreadsheetId),
      sheetName,
      range: sourceRange,
      sourceHash: sourceHash1,
      rows: snapshot1,
    }) + "\n",
    "utf8"
  );

  const privateRunDir = path.dirname(snapshotPath);
  const previewJsonPath = path.join(privateRunDir, `${targetMonth}__preview.json`);
  const previewCsvPath = path.join(privateRunDir, `${targetMonth}__preview.csv`);
  const exceptionsPath = path.join(privateRunDir, `${targetMonth}__exceptions.json`);

  await fs.writeFile(
    previewJsonPath,
    JSON.stringify({ generatedAt, targetMonth, rows: run1.preview }, null, 2) + "\n",
    "utf8"
  );
  await fs.writeFile(previewCsvPath, toPrivateCsv(run1.preview), "utf8");
  await fs.writeFile(
    exceptionsPath,
    JSON.stringify({ generatedAt, targetMonth, exceptions: run1.exceptions }, null, 2) + "\n",
    "utf8"
  );

  evidence.privateOutputs = {
    snapshot: snapshotPath,
    previewJson: previewJsonPath,
    previewCsv: previewCsvPath,
    exceptions: exceptionsPath,
  };
}

console.log("\nTIVIPLAY_MONTHLY_CLOSE_V1");
console.log(`Source: ${sheetName}`);
console.log(`Target month: ${targetMonth}`);
console.log(`RUN 1: ${run1.total} | weeks ${run1.weeks.join("/")}`);
console.log(`RUN 2: ${run2.total} | weeks ${run2.weeks.join("/")}`);
console.log(`Repeatable: ${repeatability.identical ? "YES" : "NO"}`);
console.log(`Source stable during run: ${sourceStableDuringRun ? "YES" : "NO"}`);
console.log(`Duplicates: ${run1.duplicates.length}`);
console.log(`Exceptions: ${run1.exceptions.length}`);
console.log(`Cutoff date: ${run1.cutoffDate ?? "NO SUMINISTRADA"}`);
console.log(`Cartera vencida: ${run1.carteraVencida.length} | ${run1.carteraByMonth.map((m) => `${m.month}:${m.count}`).join(" ")}`);
console.log(`Output signature: ${run1.outputSignature}`);
console.log(`Classifications: ${JSON.stringify(run1.classificationCounts)}`);
console.log(`Review reasons: ${JSON.stringify(run1.reviewReasonCounts)}`);
console.log(`Oracle: ${oracleProvided ? (oracle.valid ? "MATCH" : "DIFFERENCE") : "NOT PROVIDED"}`);
console.log(`STATUS: ${status}`);
console.log(`Evidence: ${mdPath}`);
if (snapshotPath) {
  console.log(`Private snapshot: ${snapshotPath}`);
  console.log(`Private preview JSON: ${evidence.privateOutputs.previewJson}`);
  console.log(`Private preview CSV: ${evidence.privateOutputs.previewCsv}`);
  console.log(`Private exceptions: ${evidence.privateOutputs.exceptions}`);
}

process.exit(status === "PARCIAL" ? 1 : 0);

function hashRows(rows) {
  return crypto.createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

function maskId(id) {
  if (id.length <= 8) return "***";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function safeFileName(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]+/g, "_");
}
