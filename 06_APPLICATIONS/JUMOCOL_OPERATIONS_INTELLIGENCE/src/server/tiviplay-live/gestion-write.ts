import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleSheetsLeadConfig } from "@/server/leads/google-sheets/config";
import { getRuntimeValuesCached, getTiviplayRuntimeLive } from "@/server/tiviplay-live/runtime-source";
import { getTiviplayWorkday } from "@/server/tiviplay-live/workday";
import { getSheetsAccessToken, getTiviplaySpreadsheetId, batchReadRanges, quoteSheet } from "@/server/tiviplay-live/sheets-client";
import { snapshotFile } from "@/server/tiviplay-live/sheets-snapshot";
import { headerKey } from "@/server/tiviplay-live/sheet-columns";
import { appendGestion, gestionEntry, isGestionEstado } from "@/server/tiviplay-live/gestion-model";
import type { Identity } from "@/server/auth/store";

type Status = "SAVED" | "DUPLICATE" | "BAD_INPUT" | "NO_LIVE_SOURCE" | "CLIENT_MISMATCH" | "CONFLICT" | "WRITE_DENIED" | "ERROR";
export type GestionWriteResult = { status: Status; message: string; entry?: string };

const WRITE_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const same = (a: unknown, b: unknown) => headerKey(a) === headerKey(b);

// Serializa las escrituras en esta instancia para minimizar colisiones entre asesores.
// La comparación previa protege cambios hechos manualmente desde la última lectura del Runtime.
const locks = new Map<string, Promise<void>>();
async function withCellLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  locks.set(key, current);
  await prev;
  try { return await fn(); }
  finally {
    release();
    if (locks.get(key) === current) locks.delete(key);
  }
}

async function getSheetsWriteToken() {
  const cfg = getGoogleSheetsLeadConfig();
  const auth = new GoogleAuth({
    credentials: { client_email: cfg.clientEmail, private_key: cfg.privateKey },
    scopes: [WRITE_SCOPE],
  });
  const token = await (await auth.getClient()).getAccessToken();
  if (!token?.token) throw new Error("Sin permiso de escritura.");
  return token.token;
}

/**
 * ÚNICA operación de mutación permitida en este módulo:
 * escribir PAGOS [MES ACTUAL]!F{fila} con valueInputOption RAW.
 * NUNCA modifica otras columnas, comprobantes, conciliación ni créditos.
 */
export async function saveGestionInObservaciones(
  actor: Identity,
  input: { clientId: string; estado: string; detalle: string; requestId: string },
): Promise<GestionWriteResult> {
  if (!/^[a-f0-9]{16}$/.test(input.clientId) || !isGestionEstado(input.estado) ||
      !/^[a-f0-9-]{36}$/.test(input.requestId) ||
      input.detalle.length > 500 ||
      (input.estado === "COMPROMISO_PAGO" && input.detalle.trim().length < 5)) {
    return { status: "BAD_INPUT", message: "Verifica el cliente, estado o detalle de la gestión." };
  }
  if (snapshotFile()) return { status: "NO_LIVE_SOURCE", message: "La captura local es de solo lectura." };

  return withCellLock(input.clientId, async () => {
    try {
      // Refresca únicamente si el caché fue invalidado por una escritura anterior.
      const data = await getTiviplayWorkday();
      if (!data.ok || data.source.mode !== "LIVE" || !data.workday.carteraSheet)
        return { status: "NO_LIVE_SOURCE", message: "No se dispone de la cartera vigente en vivo." };

      const sheet = data.workday.carteraSheet;
      const matches = data.directory.filter((e) => e.id === input.clientId);
      if (matches.length !== 1)
        return { status: "CLIENT_MISMATCH", message: "Cliente inexistente o ambiguo. Vuelve a buscar." };
      const client = matches[0];

      // Solo gestiones asociadas a la hoja de cartera del mes (no BASE GENERAL ni paneles).
      const queueMatches = data.workday.queue.filter((q) => q.id === client.id);
      const location = queueMatches.length === 1 ? queueMatches[0].source : client.source;
      const prefix = sheet + "!";
      if (!location.startsWith(prefix))
        return { status: "CLIENT_MISMATCH", message: "El cliente no tiene una fila verificable en la cartera del mes." };
      const row = Number(location.slice(prefix.length));
      if (!Number.isSafeInteger(row) || row < 4 || row > 4000)
        return { status: "CLIENT_MISMATCH", message: "Fila de cartera inválida." };

      const id = getTiviplaySpreadsheetId();
      const readToken = await getSheetsAccessToken();
      const sh = quoteSheet(sheet);
      const [headerRows, tcRows, names, users, observations] = await batchReadRanges(id, readToken, [
        `${sh}!A3:M3`, `${sh}!A${row}`, `${sh}!B${row}`, `${sh}!M${row}`, `${sh}!F${row}`,
      ]);
      const headers = (headerRows?.[0] ?? []).map(headerKey);
      if (headers[0] !== "TC" || headers[1] !== "CLIENTE" || headers[5] !== "OBSERVACIONES" || headers[12] !== "USUARIO" ||
          String(tcRows?.[0]?.[0] ?? "") !== "1" ||
          !same(names?.[0]?.[0], client.name) || !same(users?.[0]?.[0], client.user)) {
        return { status: "CLIENT_MISMATCH", message: "La fila o los encabezados cambiaron. No se escribió ninguna celda." };
      }

      const current = String(observations?.[0]?.[0] ?? "");
      // Idempotencia: una reconexión no duplica la misma operación.
      if (current.includes(`[JOS:${input.requestId}]`))
        return { status: "DUPLICATE", message: "La gestión ya estaba registrada." };

      const cached = getRuntimeValuesCached()?.[sheet]?.[row - 1];
      const expected = String(cached?.[5] ?? "");
      if (!cached || current.trimEnd() !== expected.trimEnd())
        return { status: "CONFLICT", message: "Las observaciones fueron editadas desde la última lectura. Actualiza la página y vuelve a confirmar." };

      const record = gestionEntry(input.estado, actor.name, input.detalle, input.requestId);
      const next = appendGestion(current, record);
      if (next.length > 45000)
        return { status: "ERROR", message: "Observaciones demasiado extensas. Se requiere consolidación sin perder el historial." };

      // Token distinto del de lectura. El alcance de escritura no se concede al resto del motor.
      const writeToken = await getSheetsWriteToken();
      const range = `${sh}!F${row}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
      const response = await fetch(url, {
        method: "PUT", cache: "no-store",
        headers: { Authorization: `Bearer ${writeToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ range, majorDimension: "ROWS", values: [[next]] }),
      });
      if (response.status === 401 || response.status === 403)
        return { status: "WRITE_DENIED", message: "La cuenta de servicio puede leer, pero no tiene permiso para escribir OBSERVACIONES." };
      if (!response.ok)
        return { status: "ERROR", message: "Google Sheets no confirmó la actualización. Consulta la hoja antes de reintentar." };

      // Descartar caché para que siguiente atención lea la observación actualizada.
      await getTiviplayRuntimeLive({ force: true });
      return { status: "SAVED", message: "Gestión guardada en OBSERVACIONES de la cartera vigente.", entry: record };
    } catch {
      return { status: "ERROR", message: "No fue posible comprobar la escritura. Verifica la celda antes de repetir." };
    }
  });
}
