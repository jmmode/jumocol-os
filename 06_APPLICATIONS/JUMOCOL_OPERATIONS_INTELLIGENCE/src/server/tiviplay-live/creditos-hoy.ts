import "server-only";

import { selectRuntimeSheets, type PanelId } from "@/server/tiviplay-live/runtime-read-model";
import { batchReadSheets, getSheetsAccessToken, getTiviplaySpreadsheetId, readSheetMetadata } from "@/server/tiviplay-live/sheets-client";

import { projectCreditosHoy, type CreditosHoy, type CycleDecision } from "./creditos-hoy-projection";

export type { CreditosHoy, CreditTask, PanelCredits, CreditState, CycleDecision } from "./creditos-hoy-projection";

/**
 * Bloque 4 de HOY: CRÉDITOS DE HOY. LEE → CLASIFICA → PRESENTA; nunca escribe.
 * Resuelve las hojas por nombre y mes (`CONTROL (MES) P1/P2/P3`, ZELLE/PAYPAL/TRANSF del mes y BASE GENERAL)
 * con el selector de Runtime, de modo que noviembre/diciembre no requieren cambios de código.
 * Cliente compartido con scope spreadsheets.readonly. Un fallo de lectura se muestra como REQUIERE_REVISION.
 */
export async function getCreditosHoy(targetMonth: string, today: string, decisions: CycleDecision[] = []): Promise<CreditosHoy> {
  const controls: Record<PanelId, { sheet: string | null; rows: unknown[][] | null }> = {
    P1: { sheet: null, rows: null }, P2: { sheet: null, rows: null }, P3: { sheet: null, rows: null },
  };
  let base: unknown[][] | null = null;
  let payments: Array<{ sheet: string; rows: unknown[][] }> | null = null;
  let readError: string | undefined;
  try {
    const spreadsheetId = getTiviplaySpreadsheetId();
    const token = await getSheetsAccessToken();
    const meta = await readSheetMetadata(spreadsheetId, token);
    const roles = selectRuntimeSheets(meta.sheets, today).included;
    const paymentTitles: string[] = [];
    let baseTitle: string | null = null;
    for (const role of roles) {
      if (role.role === "PANEL" && role.month === targetMonth) controls[role.panel].sheet = role.title;
      if (role.role === "PAGO" && role.month === targetMonth) paymentTitles.push(role.title);
      if (role.role === "BASE") baseTitle = role.title;
    }
    const panelTitles = Object.values(controls).flatMap((c) => (c.sheet ? [c.sheet] : []));
    const [panelValues, financeValues] = await Promise.allSettled([
      batchReadSheets(spreadsheetId, token, panelTitles, "P"),
      batchReadSheets(spreadsheetId, token, [...(baseTitle ? [baseTitle] : []), ...paymentTitles], "AD"),
    ]);
    if (panelValues.status === "fulfilled") for (const c of Object.values(controls)) if (c.sheet) c.rows = panelValues.value[c.sheet] ?? [];
    if (financeValues.status === "fulfilled") {
      base = baseTitle ? financeValues.value[baseTitle] ?? null : null;
      payments = paymentTitles.map((sheet) => ({ sheet, rows: financeValues.value[sheet] ?? [] }));
    }
  } catch {
    readError = "No fue posible leer el libro de Google Sheets.";
  }
  return projectCreditosHoy({ today, targetMonth, controls, base, payments, readError, decisions });
}
