import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  buildMonthlyClose,
  compareRuns,
  validateOracle,
} from "./src/core.mjs";
import { readSheetValues } from "./src/google-sheets.mjs";

const spreadsheetId = process.env.TIVIPLAY_SPREADSHEET_ID;
const sheetName = process.env.TIVIPLAY_SOURCE_SHEET ?? "BASE GENERAL";
const targetMonth = process.env.TIVIPLAY_TARGET_MONTH;
const sourceRange = process.env.TIVIPLAY_SOURCE_RANGE ?? "A1:W5000";
const persistSnapshot = (process.env.TIVIPLAY_PERSIST_SNAPSHOT ?? "true").toLowerCase() !== "false";

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
const run1 = buildMonthlyClose(snapshot1, targetMonth);
const run2 = buildMonthlyClose(snapshot1, targetMonth);
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

const evidence = {
  generatedAt,
  mode: "READ_ONLY_LIVE_WITH_LOCAL_SNAPSHOT",
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
};

const evidenceDir = path.resolve("evidence");
await fs.mkdir(evidenceDir, { recursive: true });

const jsonPath = path.join(evidenceDir, `monthly-close-${targetMonth}.json`);
const mdPath = path.join(evidenceDir, `monthly-close-${targetMonth}.md`);

await fs.writeFile(jsonPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");
await fs.writeFile(mdPath, renderMarkdown(evidence), "utf8");

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
console.log(`Oracle: ${oracleProvided ? (oracle.valid ? "MATCH" : "DIFFERENCE") : "NOT PROVIDED"}`);
console.log(`STATUS: ${status}`);
console.log(`Evidence: ${mdPath}`);
if (snapshotPath) console.log(`Private snapshot: ${snapshotPath}`);

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

function renderMarkdown(e) {
  const errors = e.oracle.errors.length
    ? e.oracle.errors.map((x) => `- ${x}`).join("\n")
    : "- Ninguna";

  return `# TIVIPLAY_MONTHLY_CLOSE_V1 — Evidencia de ejecución

**Generado:** ${e.generatedAt}  
**Modo:** ${e.mode}  
**Hoja fuente:** \`${e.source.sheetName}\`  
**Mes objetivo:** \`${e.targetMonth}\`  
**Estado:** **${e.status}**

## Resultado

| Métrica | RUN 1 | RUN 2 |
|---|---:|---:|
| Total | ${e.run1.total} | ${e.run2.total} |
| Semana 1 | ${e.run1.weeks[0]} | ${e.run2.weeks[0]} |
| Semana 2 | ${e.run1.weeks[1]} | ${e.run2.weeks[1]} |
| Semana 3 | ${e.run1.weeks[2]} | ${e.run2.weeks[2]} |
| Semana 4 | ${e.run1.weeks[3]} | ${e.run2.weeks[3]} |
| Semana 5 | ${e.run1.weeks[4]} | ${e.run2.weeks[4]} |

## Determinismo

- Firma RUN 1: \`${e.run1.signature}\`
- Firma RUN 2: \`${e.run2.signature}\`
- Misma entrada → mismo resultado: **${e.repeatability.identical ? "SÍ" : "NO"}**
- Fuente estable durante la ventana de ejecución: **${e.source.stableDuringRun ? "SÍ" : "NO"}**
- Hash lectura 1: \`${e.source.hashAtRead1}\`
- Hash lectura 2: \`${e.source.hashAtRead2}\`
- Duplicados detectados: **${e.run1.duplicates.length}**
- Excepciones de fecha: **${e.run1.exceptions.length}**

## Oracle

**Suministrado:** ${e.oracle.provided ? "SÍ" : "NO"}

${errors}

**Resultado oracle:** ${e.oracle.provided ? (e.oracle.valid ? "MATCH" : "DIFFERENCE") : "NO APLICA"}

## Criterio

- `VALIDADO`: determinismo técnico + fuente estable + cero duplicados + oracle suministrado y coincidente.
- `VALIDADO_TECNICO`: determinismo técnico + fuente estable + cero duplicados, sin oracle de negocio.
- `PARCIAL`: falla alguna condición técnica o el oracle suministrado no coincide.
`;
}
