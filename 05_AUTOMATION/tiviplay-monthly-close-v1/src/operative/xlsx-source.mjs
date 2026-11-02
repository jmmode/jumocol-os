// Lectura de un corte congelado en XLSX (copia de trabajo). Nunca escribe en el archivo de origen.
// Devuelve las filas como texto formateado, igual que la API de Sheets (FORMATTED_VALUE).

import fs from "node:fs";
import crypto from "node:crypto";
import XLSX from "xlsx";
import { locatePaymentColumns, normalizePayments } from "../draft/payments.mjs";

const canon = (v) => String(v ?? "").trim().toLocaleUpperCase("es").replace(/\s+/g, " ");

export function fileSha256(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

export function openWorkbook(path) {
  return XLSX.read(fs.readFileSync(path), { cellDates: false, cellNF: true, cellText: true });
}

/** Filas de una hoja como texto formateado (raw:false) o valores crudos (raw:true). */
export function sheetRows(wb, name, { raw = false } = {}) {
  const ws = wb.Sheets[name];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw, defval: "", blankrows: true });
}

export function findSheet(wb, wanted) {
  const w = canon(wanted);
  return wb.SheetNames.find((n) => canon(n) === w) ?? null;
}

/** Hojas de pagos del mes: misma normalización que sheets-io (solo columnas permitidas por encabezado). */
export function readPaymentsFromWorkbook(wb, sheetNames) {
  const payments = [];
  const missing = [];
  for (const wanted of sheetNames) {
    const name = findSheet(wb, wanted);
    if (!name) {
      missing.push(wanted);
      continue;
    }
    const rows = sheetRows(wb, name);
    let located;
    try {
      located = locatePaymentColumns(rows.slice(0, 10));
    } catch (error) {
      missing.push(`${wanted} (${error.message})`);
      continue;
    }
    const rowsByField = {};
    for (const [field, index] of Object.entries(located.columns)) rowsByField[field] = rows.map((r) => [r[index] ?? ""]);
    payments.push(...normalizePayments(wanted, { headerRow: located.headerRow, rowsByField }));
  }
  return { payments, missing };
}

/** Hojas del export de paneles (todas), como valores crudos. */
export function panelSheets(path) {
  const wb = openWorkbook(path);
  return wb.SheetNames.map((name) => ({ name, rows: sheetRows(wb, name, { raw: true }) }));
}
