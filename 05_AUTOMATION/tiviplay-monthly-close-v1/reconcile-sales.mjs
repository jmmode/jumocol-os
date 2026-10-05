import fs from "node:fs/promises";
import path from "node:path";
import { readSheetValues } from "./src/google-sheets.mjs";
import { reconcileConfirmedSalesToBase } from "./src/reconcile-sales.mjs";

const salesSpreadsheetId = process.env.TIVIPLAY_SALES_SPREADSHEET_ID;
const salesSheet = process.env.TIVIPLAY_SALES_SHEET ?? "VENTAS_SEPTIEMBRE";
const baseSpreadsheetId = process.env.TIVIPLAY_SPREADSHEET_ID;
const baseSheet = process.env.TIVIPLAY_BASE_SHEET ?? "BASE GENERAL";

if (!salesSpreadsheetId || !baseSpreadsheetId) {
  console.error("Missing TIVIPLAY_SALES_SPREADSHEET_ID or TIVIPLAY_SPREADSHEET_ID");
  process.exit(2);
}

const [salesRows, baseRows] = await Promise.all([
  readSheetValues({ spreadsheetId: salesSpreadsheetId, sheetName: salesSheet, range: "A1:W5000" }),
  readSheetValues({ spreadsheetId: baseSpreadsheetId, sheetName: baseSheet, range: "A1:W5000" }),
]);

const result = reconcileConfirmedSalesToBase(salesRows, baseRows);

const outDir = path.resolve(
  "..",
  "..",
  "06_APPLICATIONS",
  "JUMOCOL_OPERATIONS_INTELLIGENCE",
  "data",
  "private",
  "tiviplay-monthly-close-v1",
  "reconciliation"
);

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  path.join(outDir, "sales-to-base-latest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), ...result }, null, 2) + "\n",
  "utf8"
);

console.log("\nTIVIPLAY_SALES_TO_BASE");
console.log(`Sales sheet: ${salesSheet}`);
console.log(`Confirmed JM: ${result.confirmedCount}`);
console.log(`Matched in BASE GENERAL: ${result.matchedConfirmed}`);
console.log(`Exceptions: ${result.exceptions.length}`);

for (const x of result.exceptions) {
  console.log(`- row ${x.salesRow}: ${x.type} | ${x.client}`);
}

console.log(`STATUS: ${result.exceptions.length === 0 ? "VALIDADO" : "PARCIAL"}`);

process.exit(result.exceptions.length === 0 ? 0 : 1);
