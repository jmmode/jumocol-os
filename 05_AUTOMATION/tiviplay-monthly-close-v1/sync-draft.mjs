// Sincronización controlada de la hoja BORRADOR del mes (ver README § Sincronización del borrador).
// Por defecto es un ensayo (dry-run): lee, calcula, compara y NO escribe.
// Escribir exige las tres condiciones: --apply, TIVIPLAY_DRAFT_WRITE_ENABLED=true y --confirm-sheet "<título exacto>".
import fs from "node:fs/promises";
import path from "node:path";

import { draftTarget } from "./src/draft/contract.mjs";
import { READ_SCOPE, WRITE_SCOPE, createSheetsIo, googleTokenProvider } from "./src/draft/sheets-io.mjs";
import { syncDraft } from "./src/draft/sync.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const spreadsheetId = process.env.TIVIPLAY_SPREADSHEET_ID;
const targetMonth = option("--month") ?? process.env.TIVIPLAY_TARGET_MONTH;
const cutoffDate = option("--cutoff") ?? process.env.TIVIPLAY_CUTOFF_DATE;

if (!spreadsheetId || !targetMonth || !cutoffDate) {
  console.error("Uso: TIVIPLAY_SPREADSHEET_ID=... node sync-draft.mjs --month YYYY-MM --cutoff YYYY-MM-DD [--apply --confirm-sheet \"<título>\"]");
  process.exit(2);
}

const target = draftTarget(targetMonth);
const wantsApply = flag("--apply");
const writeEnabled = (process.env.TIVIPLAY_DRAFT_WRITE_ENABLED ?? "false").toLowerCase() === "true";
if (wantsApply && (!writeEnabled || option("--confirm-sheet") !== target.title)) {
  console.error(`Escritura rechazada: requiere TIVIPLAY_DRAFT_WRITE_ENABLED=true y --confirm-sheet "${target.title}"`);
  process.exit(3);
}

const decisionsFile = option("--decisions") ?? path.join(import.meta.dirname, "decisions", `${targetMonth}.json`);
const decisions = JSON.parse(await fs.readFile(decisionsFile, "utf8"));
if (decisions.targetMonth !== targetMonth) {
  console.error(`El archivo de decisiones es de ${decisions.targetMonth}, no de ${targetMonth}`);
  process.exit(2);
}

const io = createSheetsIo({
  spreadsheetId,
  targetMonth,
  readToken: googleTokenProvider(READ_SCOPE),
  writeToken: wantsApply ? googleTokenProvider(WRITE_SCOPE) : null,
});

const report = await syncDraft({ io, targetMonth, cutoffDate, decisions, apply: wantsApply });

// El reporte no contiene CLIENTE, USUARIO, teléfonos, correos ni contraseñas (diff enmascarado).
const outDir = path.join(import.meta.dirname, "evidence", "draft-sync");
await fs.mkdir(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = path.join(outDir, `${targetMonth}_${stamp}_${report.status}.json`);
await fs.writeFile(file, JSON.stringify(report, null, 2));

const s = report.summary;
console.log(`STATUS: ${report.status} (${report.mode})`);
if (s) {
  console.log(`Universo ${s.universe} · semanas ${s.weeks.join("/")} · FACTURABLE ${s.classes.FACTURABLE} · REVISIÓN ${s.classes.REQUIERE_REVISION} · BLOQUEADO ${s.classes.BLOQUEADO} · PAGADO SIN PROPAGAR ${s.classes.PAGADO_SIN_PROPAGAR}`);
}
if (report.diff) {
  console.log(`Diff: +${report.diff.added.length} −${report.diff.removed.length} ~${report.diff.modified.length} · cambios de clase ${report.diff.classChanges.length}`);
}
console.log(`Reporte: ${file}`);
process.exit(["ACTUALIZADO", "NO_CHANGES", "PLAN"].includes(report.status) ? 0 : 1);
