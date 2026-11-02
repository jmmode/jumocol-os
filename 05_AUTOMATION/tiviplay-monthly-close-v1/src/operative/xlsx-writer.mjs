// Escritura del archivo operativo (XLSX) con el diseño de PAGOS OCTUBRE 2026:
// título y total mensual azul marino, resumen crema, encabezado marino con texto blanco,
// banda de semana azul, total semanal lila, fichas en blanco (Roboto 12).
// Las hojas de excepciones van en un archivo aparte: la hoja del asesor no las contiene.

import ExcelJS from "exceljs";
import { COL, OPERATIVE_HEADERS, ROW_KIND } from "./contract.mjs";

const FILL = {
  NAVY: "FF0F2D4F",
  CREAM: "FFFFEFC6",
  WEEK: "FF2160A3",
  LILA: "FFDBEDF9",
  WHITE: "FFFFFFFF",
};
// Anchos de octubre (px → caracteres aprox. /7), reordenados según el contrato A..U.
const WIDTHS_PX = [100, 260, 187, 245, 100, 460, 244, 100, 100, 125, 125, 150, 153, 151, 141, 100, 120, 110, 140, 60, 110];
const DATE_COLS = new Set([COL["F.VENCIMIENTO"], COL["F.ULTIMO PAGO"], COL["F. PRÓXIMO PAGO"]]);
const FIXED_FILE_DATE = new Date(Date.UTC(2026, 0, 1)); // metadatos fijos: el archivo no depende de la hora de ejecución

const toDate = (iso) => {
  const m = typeof iso === "string" && iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
};

function styleRow(row, fill, { bold = false, white = false, size = 12, width = OPERATIVE_HEADERS.length } = {}) {
  for (let c = 1; c <= width; c++) {
    const cell = row.getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    cell.font = { name: "Roboto", size, bold, color: { argb: white ? "FFFFFFFF" : "FF000000" } };
  }
}

/** Escribe la planilla operativa. `title` es el nombre de la pestaña (p. ej. «PAGOS NOVIEMBRE 2026»). */
export async function writeOperativeXlsx(path, { title, rows, properties = {} }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "tiviplay-monthly-close-v1";
  wb.created = FIXED_FILE_DATE;
  wb.modified = FIXED_FILE_DATE;
  wb.title = title;
  wb.subject = properties.subject ?? "";
  wb.description = properties.description ?? "";
  const ws = wb.addWorksheet(title, { properties: { tabColor: { argb: "FF34A853" } }, views: [{ state: "frozen", ySplit: 3 }] });
  ws.columns = WIDTHS_PX.map((px) => ({ width: Math.round(px / 7) }));

  for (const r of rows) {
    const values = r.values.map((v, i) => {
      if (r.kind === ROW_KIND.FICHA && DATE_COLS.has(i)) return toDate(v) ?? v;
      return v === "" ? null : v;
    });
    const row = ws.addRow(values);
    row.height = 21;
    switch (r.kind) {
      case ROW_KIND.TITLE: styleRow(row, FILL.NAVY, { bold: true, white: true }); break;
      case ROW_KIND.SUMMARY: styleRow(row, FILL.CREAM, { bold: true }); break;
      case ROW_KIND.HEADER: styleRow(row, FILL.NAVY, { bold: true, white: true }); break;
      case ROW_KIND.WEEK: styleRow(row, FILL.WEEK, { bold: true, white: true }); break;
      case ROW_KIND.WEEK_TOTAL: styleRow(row, FILL.LILA, { bold: true }); break;
      case ROW_KIND.TOTAL: styleRow(row, FILL.NAVY, { bold: true, white: true }); break;
      default: {
        styleRow(row, FILL.WHITE);
        row.getCell(COL.TC + 1).alignment = { horizontal: "center" };
        for (const i of DATE_COLS) row.getCell(i + 1).numFmt = "dd/mm/yyyy";
        row.getCell(COL.USD + 1).numFmt = "#,##0.00";
        row.getCell(COL.COP + 1).numFmt = "#,##0";
      }
    }
    if (r.kind === ROW_KIND.WEEK_TOTAL || r.kind === ROW_KIND.TOTAL) {
      row.getCell(COL.USD + 1).numFmt = "#,##0.00";
      row.getCell(COL.COP + 1).numFmt = "#,##0";
    }
  }
  // Estado (E) con el mismo semáforo de octubre.
  const last = rows.length;
  ws.addConditionalFormatting({
    ref: `E4:E${last}`,
    rules: [
      { type: "containsText", operator: "containsText", text: "Vencido", priority: 1, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFF4C7C3" } } } },
      { type: "containsText", operator: "containsText", text: "Por vencer", priority: 2, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFFCE8B2" } } } },
      { type: "containsText", operator: "containsText", text: "Al dia", priority: 3, style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: "FFB7E1CD" } } } },
    ],
  });
  await wb.xlsx.writeFile(path);
}

/** Archivo de excepciones (sin contraseñas): una hoja con identificador, fila, problema, evidencia, responsable y acción. */
export async function writeExceptionsXlsx(path, { exceptions, title = "EXCEPCIONES" }) {
  const wb = new ExcelJS.Workbook();
  wb.created = FIXED_FILE_DATE;
  wb.modified = FIXED_FILE_DATE;
  const ws = wb.addWorksheet(title, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "IDENTIFICADOR", key: "id", width: 22 },
    { header: "FILA ORIGEN (BASE GENERAL)", key: "baseRow", width: 14 },
    { header: "CÓDIGO", key: "code", width: 30 },
    { header: "PROBLEMA", key: "problem", width: 60 },
    { header: "EVIDENCIA", key: "evidence", width: 90 },
    { header: "RESPONSABLE", key: "owner", width: 30 },
    { header: "ACCIÓN EXACTA", key: "action", width: 90 },
  ];
  for (const e of exceptions) ws.addRow(e);
  styleRow(ws.getRow(1), FILL.NAVY, { bold: true, white: true, width: 7 });
  await wb.xlsx.writeFile(path);
}
