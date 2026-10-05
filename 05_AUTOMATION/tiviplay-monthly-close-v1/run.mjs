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

const runOnce = async () => {
  const rows = await readSheetValues({ spreadsheetId, sheetName, range: sourceRange });
  return buildMonthlyClose(rows, targetMonth);
};

const run1 = await runOnce();
const run2 = await runOnce();
const repeatability = compareRuns(run1, run2);
const oracle = validateOracle(run1, expectedCount, expectedWeeks);

const status =
  repeatability.identical &&
  repeatability.sameCount &&
  repeatability.sameWeeks &&
  run1.duplicates.length === 0 &&
  oracle.valid
    ? "VALIDADO"
    : "PARCIAL";

const evidence = {
  generatedAt: new Date().toISOString(),
  mode: "READ_ONLY",
  source: {
    spreadsheetIdHash: maskId(spreadsheetId),
    sheetName,
    range: sourceRange,
  },
  targetMonth,
  run1,
  run2,
  repeatability,
  oracle,
  status,
};

const outDir = path.resolve("evidence");
await fs.mkdir(outDir, { recursive: true });

const jsonPath = path.join(outDir, `monthly-close-${targetMonth}.json`);
const mdPath = path.join(outDir, `monthly-close-${targetMonth}.md`);

await fs.writeFile(jsonPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");
await fs.writeFile(mdPath, renderMarkdown(evidence), "utf8");

console.log("\nTIVIPLAY_MONTHLY_CLOSE_V1");
console.log(`Source: ${sheetName}`);
console.log(`Target month: ${targetMonth}`);
console.log(`RUN 1: ${run1.total} | weeks ${run1.weeks.join("/")}`);
console.log(`RUN 2: ${run2.total} | weeks ${run2.weeks.join("/")}`);
console.log(`Repeatable: ${repeatability.identical ? "YES" : "NO"}`);
console.log(`Duplicates: ${run1.duplicates.length}`);
console.log(`Exceptions: ${run1.exceptions.length}`);
console.log(`Oracle: ${oracle.valid ? "MATCH" : "DIFFERENCE"}`);
console.log(`STATUS: ${status}`);
console.log(`Evidence: ${mdPath}`);

process.exit(status === "VALIDADO" ? 0 : 1);

function maskId(id) {
  if (id.length <= 8) return "***";
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
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

## Repeatability

- Firma RUN 1: \`${e.run1.signature}\`
- Firma RUN 2: \`${e.run2.signature}\`
- Idénticas: **${e.repeatability.identical ? "SÍ" : "NO"}**
- Duplicados detectados: **${e.run1.duplicates.length}**
- Excepciones de fecha: **${e.run1.exceptions.length}**

## Oracle

${errors}

**Resultado oracle:** ${e.oracle.valid ? "MATCH" : "DIFFERENCE"}

## Criterio

La ejecución queda VALIDADA únicamente cuando las dos lecturas producen la misma firma, conteo y distribución semanal, no existen duplicados y el oracle esperado coincide cuando fue suministrado.
`;
}
