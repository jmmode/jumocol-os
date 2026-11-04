import "server-only";

import { getTiviplayWorkday } from "@/server/tiviplay-live/workday";
import { batchReadRanges, getSheetsAccessToken, getTiviplaySpreadsheetId, quoteSheet } from "@/server/tiviplay-live/sheets-client";
import { snapshotFile } from "@/server/tiviplay-live/sheets-snapshot";
import { columnLetter, headerKey } from "@/server/tiviplay-live/sheet-columns";

/**
 * Lectura puntual de una credencial de SERVICIO; nunca de contraseñas administrativas.
 * Separada de la lectura general, que DEBE seguir excluyendo CONTRASEÑA.
 * No hay cache, logs ni persistencia. La operación solo se usa desde el endpoint autenticado.
 */
export type CredentialResult =
  | { ok: true; password: string; panel: string }
  | { ok: false; reason: "SOURCE_UNAVAILABLE" | "NOT_FOUND" | "AMBIGUOUS" | "SOURCE_MISMATCH" | "NO_CREDENTIAL" };

const same = (a: unknown, b: unknown) => headerKey(a) === headerKey(b);
const singleIndex = (row: unknown[], names: string[]) => {
  const positions = row.flatMap((v, i) => names.some((n) => same(v, n)) ? [i] : []);
  return positions.length === 1 ? positions[0] : -1;
};

export async function readServiceCredentialForClient(clientId: string): Promise<CredentialResult> {
  // Las capturas de respaldo se usan para probar flujos, jamás para revelar credenciales.
  if (snapshotFile()) return { ok: false, reason: "SOURCE_UNAVAILABLE" };
  if (!/^[a-f0-9]{16}$/.test(clientId)) return { ok: false, reason: "NOT_FOUND" };

  const work = await getTiviplayWorkday();
  if (!work.ok) return { ok: false, reason: "SOURCE_UNAVAILABLE" };
  const matching = work.directory.filter((e) => e.id === clientId && e.baseRow != null && !!e.user && !!e.name);
  if (matching.length !== 1) return { ok: false, reason: matching.length ? "AMBIGUOUS" : "NOT_FOUND" };
  const customer = matching[0];
  const rowNumber = customer.baseRow!;
  if (!Number.isSafeInteger(rowNumber) || rowNumber < 3 || rowNumber > 10000) return { ok: false, reason: "SOURCE_MISMATCH" };

  // No se usa CONTROL P3 para resolver identidad: su columna USUARIO fue reportada inconsistente.
  // BASE GENERAL es la fuente de la credencial solicitada y se confirma fila, nombre y usuario.
  try {
    const book = getTiviplaySpreadsheetId();
    const token = await getSheetsAccessToken();
    const sheet = quoteSheet("BASE GENERAL");
    // Solo leer títulos y encabezados; nunca leer una fila de contraseña para descubrir el esquema.
    const [head] = await batchReadRanges(book, token, [`${sheet}!A1:AQ2`]);
    const candidates = (head ?? []).filter((row) =>
      row.some((v) => same(v, "USUARIO")) && row.some((v) => same(v, "CLIENTE")));
    if (candidates.length !== 1) return { ok: false, reason: "SOURCE_MISMATCH" };
    const header = candidates[0];
    const nameCol = singleIndex(header, ["CLIENTE"]);
    const userCol = singleIndex(header, ["USUARIO"]);
    const panelCol = singleIndex(header, ["PANEL"]);
    const passCol = singleIndex(header, ["CONTRASEÑA", "PASSWORD"]);
    if ([nameCol, userCol, panelCol, passCol].some((i) => i < 0)) return { ok: false, reason: "SOURCE_MISMATCH" };
    if (new Set([nameCol, userCol, panelCol, passCol]).size !== 4) return { ok: false, reason: "SOURCE_MISMATCH" };
    const ranges = [nameCol, userCol, panelCol, passCol]
      .map((col) => `${sheet}!${columnLetter(col)}${rowNumber}:${columnLetter(col)}${rowNumber}`);
    const [names, users, panels, passwords] = await batchReadRanges(book, token, ranges);
    const name = String(names?.[0]?.[0] ?? "");
    const user = String(users?.[0]?.[0] ?? "");
    const panel = String(panels?.[0]?.[0] ?? "");
    const password = String(passwords?.[0]?.[0] ?? "");
    if (!name || !user || !same(name, customer.name) || !same(user, customer.user) || !same(panel, customer.panel))
      return { ok: false, reason: "SOURCE_MISMATCH" };
    if (!password) return { ok: false, reason: "NO_CREDENTIAL" };
    return { ok: true, password, panel };
  } catch {
    // No incluir mensajes de error originales: pueden incorporar rangos o datos de fuentes privadas.
    return { ok: false, reason: "SOURCE_UNAVAILABLE" };
  }
}
