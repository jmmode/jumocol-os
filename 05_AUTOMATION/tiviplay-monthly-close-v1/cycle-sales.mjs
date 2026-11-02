// Ciclo comercial del mes (solo lectura): VENTAS × pagos CONFIRMADO JM × CONTROL × BASE GENERAL.
// Uso en vivo:   TIVIPLAY_SPREADSHEET_ID=… TIVIPLAY_SALES_SPREADSHEET_ID=… TIVIPLAY_MONTH_TAG=OCT \
//                TIVIPLAY_SALES_SHEET=VENTAS_OCTUBRE [TIVIPLAY_D1_ANCHOR=PAGO] node cycle-sales.mjs
// Uso offline:   node cycle-sales.mjs --snapshot <archivo.json>   (mismas claves que buildSalesCycle)
// Nunca escribe en Sheets. readSheetValues omite las columnas con encabezado CONTRASEÑA.
import fs from "node:fs/promises";
import path from "node:path";
import { readSheetValues } from "./src/google-sheets.mjs";
import { buildSalesCycle } from "./src/sales-cycle.mjs";

const args = process.argv.slice(2);
const snapshotPath = args[args.indexOf("--snapshot") + 1];
const anchor = process.env.TIVIPLAY_D1_ANCHOR || null; // D1: requiere ratificación de Dirección

async function readCatalog(spreadsheetId) {
  const rows = await readSheetValues({ spreadsheetId, sheetName: "CATALOGO_TARIFAS_VIGENTE", range: "A1:I200" });
  return rows.slice(1)
    .filter((r) => r[1] === "PLAN PRINCIPAL" && r[4] === "USD" && r[6] === "VALIDADO")
    .map((r) => ({ months: Number(r[2]), screens: Number(r[3]), usd: Number(r[5]) }));
}

async function loadLive() {
  const book = process.env.TIVIPLAY_SPREADSHEET_ID;
  const salesBook = process.env.TIVIPLAY_SALES_SPREADSHEET_ID;
  const tag = process.env.TIVIPLAY_MONTH_TAG ?? "OCT";
  const salesSheet = process.env.TIVIPLAY_SALES_SHEET ?? "VENTAS_OCTUBRE";
  if (!book || !salesBook) throw new Error("Faltan TIVIPLAY_SPREADSHEET_ID o TIVIPLAY_SALES_SPREADSHEET_ID");
  const read = (spreadsheetId, sheetName, range) => readSheetValues({ spreadsheetId, sheetName, range });
  const [salesRows, zelle, paypal, transf, p1, p2, p3, baseRows, catalog] = await Promise.all([
    read(salesBook, salesSheet, "A1:W400"),
    read(book, `ZELLE (${tag})`, "A1:AD1200"),
    read(book, `PAYPAL (${tag})`, "A1:AI1100"),
    read(book, `TRANSF (${tag})`, "A1:AG1100"),
    read(book, `CONTROL (${tag}) P1`, "A1:L1200"),
    read(book, `CONTROL (${tag}) P2`, "A1:L1200"),
    read(book, `CONTROL (${tag}) P3`, "A1:L1200"),
    read(book, "BASE GENERAL", "A1:AQ3000"),
    readCatalog(book),
  ]);
  return { salesRows, payments: { ZELLE: zelle, PAYPAL: paypal, TRANSF: transf }, control: { P1: p1, P2: p2, P3: p3 }, baseRows, catalog };
}

const input = snapshotPath ? JSON.parse(await fs.readFile(snapshotPath, "utf8")) : await loadLive();
const operativeMaxRow = Number(process.env.TIVIPLAY_BASE_OPERATIVE_MAX_ROW ?? input.operativeMaxRow ?? 869);
const result = buildSalesCycle(input, { catalog: input.catalog, anchor, operativeMaxRow, approved: input.approved ?? {} });

const outDir = path.resolve("..", "..", "06_APPLICATIONS", "JUMOCOL_OPERATIONS_INTELLIGENCE", "data", "private", "tiviplay-monthly-close-v1", "sales-cycle");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "sales-cycle-latest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), anchor, operativeMaxRow, ...result }, null, 2) + "\n", "utf8");

console.log("\nTIVIPLAY_SALES_CYCLE");
console.log(`D1 anchor: ${anchor ?? "SIN RATIFICAR"}`);
for (const [k, v] of Object.entries(result.summary).sort()) console.log(`${k}: ${v}`);
for (const r of result.results.filter((x) => !["EXCLUIDO", "SIN_ACCION_ALTA", "FUERA_TIVIPLAY"].includes(x.status))) {
  console.log(`- VENTAS!${r.salesRow} ${r.payment?.ref ?? "SIN PAGO"} ${r.classification} ${r.status} ${r.blockers.map((b) => b.code).join(",")}`);
}
if (result.unmatchedConfirmedVentas.length) console.log(`Pagos VENTA sin fila en VENTAS: ${result.unmatchedConfirmedVentas.join(", ")}`);
