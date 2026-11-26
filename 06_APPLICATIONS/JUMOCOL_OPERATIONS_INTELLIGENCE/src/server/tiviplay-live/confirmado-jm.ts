import "server-only";

import { selectRuntimeSheets, type PaymentMethod } from "@/server/tiviplay-live/runtime-read-model";
import { batchReadSheets, getSheetsAccessToken, getTiviplaySpreadsheetId, readSheetMetadata } from "@/server/tiviplay-live/sheets-client";

import { buildPendingConfirmations, type PendingSource } from "./confirmado-jm-projection";

export type { PendingConfirmation, PendingSource } from "./confirmado-jm-projection";

const LABEL: Record<PaymentMethod, PendingSource["source"]> = { ZELLE: "ZELLE", PAYPAL: "PAYPAL", TRANSFERENCIA: "TRANSF" };

/**
 * Bloque 3 de HOY (solo Dirección): pagos en `PENDIENTE CONFIRMACION` de las hojas
 * ZELLE / PAYPAL / TRANSF del mes objetivo. Lectura READ-ONLY con el cliente compartido
 * (scope spreadsheets.readonly); no escribe, no guarda y no toca monthly-close-v1.
 * Cada fuente se lee por separado: si una falla, esa fuente queda en REQUIERE_REVISION.
 */
export async function getPendingConfirmadoJm(targetMonth: string, today: string): Promise<PendingSource[]> {
  const sources: PendingSource["source"][] = ["ZELLE", "PAYPAL", "TRANSF"];
  let spreadsheetId: string;
  let token: string;
  let titles: Partial<Record<PendingSource["source"], string>> = {};
  try {
    spreadsheetId = getTiviplaySpreadsheetId();
    token = await getSheetsAccessToken();
    const meta = await readSheetMetadata(spreadsheetId, token);
    for (const role of selectRuntimeSheets(meta.sheets, today).included) {
      if (role.role === "PAGO" && role.month === targetMonth) titles = { ...titles, [LABEL[role.method]]: role.title };
    }
  } catch {
    return sources.map((source) => ({ source, sheet: null, status: "REQUIERE_REVISION", reason: "no fue posible leer el libro", items: [] }));
  }

  return Promise.all(
    sources.map(async (source): Promise<PendingSource> => {
      const sheet = titles[source];
      if (!sheet) return { source, sheet: null, status: "REQUIERE_REVISION", reason: `no existe la hoja del mes ${targetMonth}`, items: [] };
      try {
        const values = await batchReadSheets(spreadsheetId, token, [sheet]);
        return buildPendingConfirmations(source, sheet, values[sheet] ?? []);
      } catch {
        return { source, sheet, status: "REQUIERE_REVISION", reason: "lectura fallida", items: [] };
      }
    }),
  );
}
