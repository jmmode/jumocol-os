import "server-only";

import { loadDataset } from "@/server/tiviplay-live/conciliacion";
import { selectRuntimeSheets } from "@/server/tiviplay-live/runtime-read-model";
import { getSheetsAccessToken, getTiviplaySpreadsheetId, readColumnsByHeader, readSheetMetadata, sheetUrl } from "@/server/tiviplay-live/sheets-client";

import { COBROS_COLUMNS, COBROS_REQUIRED, crossCredits, parseCobros, parsePreface, type Cobros, type CreditCross, type SourceInfo } from "./avance-model";

export type { Cobros, CobroRow, CreditCross, SourceInfo } from "./avance-model";

/** Enlace al libro operativo aunque la lectura falle (vista de solo lectura con fuente verificada). */
export function workbookUrl(gid: number | null = null) {
  try {
    return sheetUrl(getTiviplaySpreadsheetId(), gid);
  } catch {
    return null;
  }
}

/**
 * Área 1 · Cobros del mes: planilla PAGOS <MES> <AÑO> (rol CARTERA del selector de Runtime), leída por encabezado
 * y solo con las columnas de COBROS_COLUMNS. Nunca CONTRASEÑA, CORREO ni OBSERVACIONES.
 */
export async function readCobros(targetMonth: string, today: string): Promise<Cobros> {
  const label = "Planilla de cobros del mes";
  let url = workbookUrl();
  try {
    const spreadsheetId = getTiviplaySpreadsheetId();
    const token = await getSheetsAccessToken();
    const meta = await readSheetMetadata(spreadsheetId, token);
    const role = selectRuntimeSheets(meta.sheets, today).included.find((r) => r.role === "CARTERA" && r.month === targetMonth);
    if (!role) {
      return { source: { label, sheet: null, url, cut: null, status: "NO_INTEGRADA", validation: "REQUIERE REVISIÓN", detail: `No existe la hoja PAGOS de ${targetMonth} en el libro.` }, title: null, banner: null, signature: null, rows: [] };
    }
    url = sheetUrl(spreadsheetId, meta.sheets.find((s) => s.title === role.title)?.gid ?? null);
    const { firstRow, columns, preface } = await readColumnsByHeader(spreadsheetId, token, role.title, COBROS_REQUIRED, COBROS_COLUMNS, "AZ", 6);
    const head = parsePreface(preface);
    const provisional = !head.signature || /REQUIERE|PROVISIONAL|BORRADOR/i.test(head.signature);
    return {
      source: {
        label, sheet: role.title, url, cut: head.cut, status: "LEIDA",
        validation: provisional ? "PROVISIONAL · firma requiere revalidación" : "FIRMADA",
      },
      title: head.title, banner: head.banner, signature: head.signature,
      rows: parseCobros(firstRow, columns),
    };
  } catch {
    return { source: { label, sheet: null, url, cut: null, status: "ERROR", validation: "SIN VERIFICAR", detail: "No fue posible leer la planilla desde este servidor." }, title: null, banner: null, signature: null, rows: [] };
  }
}

/**
 * Área 2 · Cruce con el último corte de paneles. El corte vive en data/private (fuera de Git) y solo existe en el
 * equipo de Dirección; si no está, la vista lo declara NO INTEGRADA y no inventa estados.
 */
export function readPanelCut(cobros: Cobros, today: string): { source: SourceInfo; cross: CreditCross[] | null } {
  const dataset = loadDataset();
  if (!dataset) {
    return { source: { label: "Último corte de paneles", sheet: null, url: null, cut: null, status: "NO_INTEGRADA", validation: "SIN CORTE EN ESTE SERVIDOR", detail: "El corte de paneles (conciliación de servicio) no está disponible en este servidor." }, cross: null };
  }
  return {
    source: { label: "Último corte de paneles", sheet: "Conciliación de servicio", url: "/operaciones/tiviplay/conciliacion", cut: dataset.cut, status: "LEIDA", validation: "CORTE CONGELADO" },
    cross: cobros.rows.length ? crossCredits(cobros.rows, dataset.services, today) : [],
  };
}
