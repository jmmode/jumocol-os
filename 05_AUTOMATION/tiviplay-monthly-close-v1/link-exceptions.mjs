import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { readSheetValues } from "./src/google-sheets.mjs";
import { projectLinkExceptions } from "./src/link-exceptions.mjs";

const PAYMENTS_ID = process.env.TIVIPLAY_SPREADSHEET_ID;
const SALES_ID = process.env.TIVIPLAY_SALES_SPREADSHEET_ID || "1y1yZSxHCz3HhfikgHNvhgKhU7rFCG9U8HH90QeTN6TQ";

const cfg = {
  cartera: process.env.TIVIPLAY_LINK_CARTERA_SHEET || "PAGOS OCTUBRE 2026",
  zelle: process.env.TIVIPLAY_LINK_ZELLE_SHEET || "ZELLE (OCT)",
  paypal: process.env.TIVIPLAY_LINK_PAYPAL_SHEET || "PAYPAL (OCT)",
  transf: process.env.TIVIPLAY_LINK_TRANSF_SHEET || "TRANSF (OCT)",
  sales: process.env.TIVIPLAY_LINK_SALES_SHEET || "VENTAS_OCTUBRE",
  base: "BASE GENERAL",
};

if (!PAYMENTS_ID) throw new Error("Missing TIVIPLAY_SPREADSHEET_ID");

const [baseRows, carteraRows, zelleRows, paypalRows, transfRows, salesRows] = await Promise.all([
  readSheetValues({ spreadsheetId: PAYMENTS_ID, sheetName: cfg.base, range: "A1:AJ5000" }),
  readSheetValues({ spreadsheetId: PAYMENTS_ID, sheetName: cfg.cartera, range: "A1:AJ5000" }),
  readSheetValues({ spreadsheetId: PAYMENTS_ID, sheetName: cfg.zelle, range: "A1:R5000" }),
  readSheetValues({ spreadsheetId: PAYMENTS_ID, sheetName: cfg.paypal, range: "A1:R5000" }),
  readSheetValues({ spreadsheetId: PAYMENTS_ID, sheetName: cfg.transf, range: "A1:R5000" }),
  readSheetValues({ spreadsheetId: SALES_ID, sheetName: cfg.sales, range: "A1:W5000" }),
]);

const input = {
  paymentSources: [
    { sheet: cfg.zelle, code: "ZELLE", rows: zelleRows },
    { sheet: cfg.paypal, code: "PAYPAL", rows: paypalRows },
    { sheet: cfg.transf, code: "TRANSF", rows: transfRows },
  ],
  carteraRows,
  baseRows,
  salesRows,
  missingFormulaRefs: [`${cfg.paypal}!11`, `${cfg.paypal}!12`],
};

const run1 = projectLinkExceptions(input);
const run2 = projectLinkExceptions(input);
const stable = JSON.stringify(run1) === JSON.stringify(run2);
const inputSignature = crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
const resultSignature = crypto.createHash("sha256").update(JSON.stringify(run1)).digest("hex");

const payload = {
  generatedAt: new Date().toISOString(),
  readOnly: true,
  sheets: cfg,
  inputSignature,
  resultSignature,
  stable,
  duplicates: run1.duplicates,
  result: run1,
};

const defaultPrivate = path.resolve(process.cwd(), "../../06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/data/private/tiviplay-link-exceptions");
const outDir = path.resolve(process.env.TIVIPLAY_PRIVATE_OUTPUT_DIR || defaultPrivate);
await fs.mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `link-exceptions-${inputSignature.slice(0, 12)}.json`);
await fs.writeFile(outFile, JSON.stringify(payload, null, 2), "utf8");

console.log(`Exceptions: ${run1.count}`);
console.log(`Actions: ${JSON.stringify(run1.byAction)}`);
console.log(`Duplicates: ${run1.duplicates.length}`);
console.log(`Same-cut repeatable: ${stable ? "YES" : "NO"}`);
console.log(`Input signature: ${inputSignature}`);
console.log(`Result signature: ${resultSignature}`);
console.log(`Private output: ${outFile}`);
