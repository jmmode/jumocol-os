import "server-only";

import { DRAFT_SHEETS, projectDraft, type TiviplayDraftLive } from "@/server/tiviplay-live/draft-read-model";
import { batchReadRanges, getSheetsAccessToken, getTiviplaySpreadsheetId, quoteSheet } from "@/server/tiviplay-live/sheets-client";

/** Lectura read-only de la hoja BORRADOR del mes. null si el mes no tiene borrador registrado. */
export async function getTiviplayDraftLive(targetMonth: string): Promise<TiviplayDraftLive | null> {
  const contract = DRAFT_SHEETS[targetMonth];
  if (!contract) return null;
  const sheet = quoteSheet(contract.title);
  const token = await getSheetsAccessToken();
  const [a, jk, agal] = await batchReadRanges(getTiviplaySpreadsheetId(), token, [
    `${sheet}!A1:A600`,
    `${sheet}!J1:K600`,
    `${sheet}!AG1:AL600`,
  ]);
  return projectDraft(targetMonth, { a, jk, agal });
}
