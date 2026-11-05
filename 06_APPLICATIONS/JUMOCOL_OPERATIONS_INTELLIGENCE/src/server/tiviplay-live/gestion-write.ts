import "server-only";

import { GoogleAuth } from "google-auth-library";
import { getGoogleSheetsLeadConfig } from "@/server/leads/google-sheets/config";
import { commitGestion, type GestionCommitStatus } from "@/server/tiviplay-live/gestion-core";
import { GESTION_WRITE_SCOPE, gestionCell, gestionHeadersValid, gestionNovemberHeadersValid } from "@/server/tiviplay-live/gestion-sheets";
import { invalidateTiviplayRuntimeCache } from "@/server/tiviplay-live/runtime-source";
import { getTiviplayWorkday } from "@/server/tiviplay-live/workday";
import { getSheetsAccessToken, getTiviplaySpreadsheetId, batchReadRanges, quoteSheet } from "@/server/tiviplay-live/sheets-client";
import { snapshotFile } from "@/server/tiviplay-live/sheets-snapshot";
import { headerKey } from "@/server/tiviplay-live/sheet-columns";
import { GESTION_F_ETIQUETAS, etapaRegistradaEnDetalle, gestionEntry, isGestionEstado, mentionsSecret, type GestionEstado } from "@/server/tiviplay-live/gestion-model";
import type { Identity } from "@/server/auth/store";

type Status = "SAVED" | "DUPLICATE" | "DISABLED" | "BAD_INPUT" | "NO_LIVE_SOURCE" | "CLIENT_MISMATCH" | "CONFLICT" | "WRITE_DENIED" | "UNVERIFIED" | "ERROR";
export type GestionWriteResult = { status: Status; message: string; entry?: string };

const same = (a: unknown, b: unknown) => headerKey(a) === headerKey(b);

/** Localiza una sola ficha vigente de BASE GENERAL por USUARIO, nunca por fila histórica. */
async function findBaseGestionRow(spreadsheetId: string, token: string, username: string): Promise<number | null> {
  const sheet = quoteSheet("BASE GENERAL");
  const [headers, tc, users] = await batchReadRanges(spreadsheetId, token, [
    `${sheet}!A2:N2`, `${sheet}!A4:A`, `${sheet}!N4:N`,
  ]);
  const header = (headers?.[0] ?? []).map(headerKey);
  if (header[0] !== "TC" || header[5] !== "OBSERVACIONES GESTION" || header[13] !== "USUARIO") return null;
  const matches: number[] = [];
  for (let i = 0; i < users.length; i++) {
    if (String(users[i]?.[0] ?? "").trim() && same(users[i]?.[0], username)) matches.push(i + 4);
  }
  // TC=0 y duplicados también bloquean la actualización hasta que Dirección identifique la ficha.
  if (matches.length !== 1 || String(tc[matches[0] - 4]?.[0] ?? "") !== "1") return null;
  return matches[0];
}

function safeBaseF(current: string) {
  const value = current.trim();
  return !value || Object.values(GESTION_F_ETIQUETAS).includes(value);
}


// Serializa las escrituras de esta instancia por celda; los cambios externos los detecta commitGestion.
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
    scopes: [GESTION_WRITE_SCOPE],
  });
  const token = await (await auth.getClient()).getAccessToken();
  if (!token?.token) throw new Error("Sin permiso de escritura.");
  return token.token;
}

/** La escritura sigue apagada hasta pasar la prueba en hoja de ensayo. */
export function gestionWriteEnabled() {
  return process.env.TIVIPLAY_GESTION_WRITE === "1";
}

const MESSAGES: Record<Exclude<GestionCommitStatus, "SAVED" | "DUPLICATE">, { status: Status; message: string }> = {
  CONFLICT: { status: "CONFLICT", message: "Otra persona actualizó las observaciones. Recarga la ficha y vuelve a confirmar." },
  FORMULA: { status: "CLIENT_MISMATCH", message: "La celda contiene una fórmula. No se escribió nada." },
  TOO_LONG: { status: "ERROR", message: "Observaciones demasiado extensas. Se requiere consolidación sin perder el historial." },
  WRITE_DENIED: { status: "WRITE_DENIED", message: "La cuenta de servicio puede leer, pero no tiene permiso para escribir OBSERVACIONES." },
  WRITE_FAILED: { status: "ERROR", message: "Google Sheets rechazó la actualización. Consulta la hoja antes de reintentar." },
  UNVERIFIED: { status: "UNVERIFIED", message: "No se pudo confirmar por relectura. Revisa la celda antes de repetir." },
};

/**
 * Integración del resultado confirmado: el evento idempotente se conserva en F de PAGOS [MES]
 * y su última ETAPA SOP se proyecta en BASE GENERAL!F. Nunca escribe W, pagos, CONTROL ni créditos.
 * No hay transacción entre dos celdas: el requestId permite reintentar la proyección sin repetir el evento.
 */
export async function saveGestionInObservaciones(
  actor: Identity,
  input: { clientId: string; estado: string; detalle: string; requestId: string; expectedHash: string },
): Promise<GestionWriteResult> {
  if (!gestionWriteEnabled()) return { status: "DISABLED", message: "El registro de gestión sigue deshabilitado hasta validar la escritura en hoja de ensayo." };
  if (!/^[a-f0-9]{16}$/.test(input.clientId) || !isGestionEstado(input.estado) ||
      !/^[a-f0-9-]{36}$/.test(input.requestId) || !/^[a-f0-9]{16}$/.test(input.expectedHash) ||
      input.detalle.length > 500 || mentionsSecret(input.detalle) ||
      (input.estado === "COMPROMISO_PAGO" && input.detalle.trim().length < 5)) {
    return { status: "BAD_INPUT", message: "Verifica el resultado y el detalle. No incluyas contraseñas." };
  }
  const etapa = etapaRegistradaEnDetalle(input.detalle);
  if (!etapa) return { status: "BAD_INPUT", message: "La acción debe incluir una etapa SOP válida." };
  if (snapshotFile()) return { status: "NO_LIVE_SOURCE", message: "La captura local es de solo lectura." };

  try {
    const data = await getTiviplayWorkday();
    if (!data.ok || data.source.mode !== "LIVE" || !data.workday.carteraSheet)
      return { status: "NO_LIVE_SOURCE", message: "No se dispone de la cartera vigente en vivo." };

    const sheet = data.workday.carteraSheet;
    const matches = data.directory.filter((e) => e.id === input.clientId);
    if (matches.length !== 1)
      return { status: "CLIENT_MISMATCH", message: "Cliente inexistente o ambiguo. Vuelve a buscar." };
    const client = matches[0];
    if (!client.user || data.directory.filter((e) => same(e.user, client.user)).length !== 1)
      return { status: "CLIENT_MISMATCH", message: "El usuario está repetido o vacío. La identidad requiere validación." };

    const prefix = sheet + "!";
    if (!client.source.startsWith(prefix))
      return { status: "CLIENT_MISMATCH", message: "El cliente no tiene una fila verificable en la cartera del mes." };
    const row = Number(client.source.slice(prefix.length));
    if (!Number.isSafeInteger(row) || row < 4 || row > 4000)
      return { status: "CLIENT_MISMATCH", message: "Fila de cartera inválida." };

    return await withCellLock(client.source, async () => {
      const id = getTiviplaySpreadsheetId();
      const readToken = await getSheetsAccessToken();
      const sh = quoteSheet(sheet);
      const [headerRows, tcRows, names, users] = await batchReadRanges(id, readToken, [
        `${sh}!A3:AN3`, `${sh}!A${row}`, `${sh}!B${row}`, `${sh}!M${row}`,
      ]);
      const headers = (headerRows?.[0] ?? []).map(headerKey);
      if (!gestionHeadersValid(headers) || (sheet === "PAGOS NOVIEMBRE 2026" && !gestionNovemberHeadersValid(headers)) ||
          String(tcRows?.[0]?.[0] ?? "") !== "1" ||
          !same(names?.[0]?.[0], client.name) || !same(users?.[0]?.[0], client.user)) {
        return { status: "CLIENT_MISMATCH", message: "La fila o los encabezados cambiaron. No se escribió ninguna celda." };
      }

      // Preflight: no tocar la cartera si BASE no tiene un único USUARIO o F contiene texto ajeno al SOP.
      const baseRow = await findBaseGestionRow(id, readToken, client.user);
      if (!baseRow) return { status: "CLIENT_MISMATCH", message: "BASE GENERAL no tiene una única ficha TC=1 para este usuario. No se escribió nada." };
      const writeToken = await getSheetsWriteToken();
      const base = gestionCell(id, "BASE GENERAL", baseRow, writeToken);
      const previousBase = await base.read();
      if (previousBase.startsWith("=") || !safeBaseF(previousBase))
        return { status: "CONFLICT", message: "BASE GENERAL!F contiene un valor histórico o de otra categoría. No se reemplazó; revisar antes de registrar." };

      const { read, write } = gestionCell(id, sheet, row, writeToken);
      const record = gestionEntry(input.estado as GestionEstado, actor.name, input.detalle, input.requestId);
      const status = await commitGestion({ record, requestId: input.requestId, expectedHash: input.expectedHash, read, write });
      if (status !== "SAVED" && status !== "DUPLICATE") return MESSAGES[status];

      // En un reintento de un evento antiguo, no retroceder F si ya hay gestiones posteriores.
      const monthlyAfter = await read();
      const lastMarkerAt = monthlyAfter.lastIndexOf("[JOS:");
      const marker = `[JOS:${input.requestId}]`;
      if (lastMarkerAt < 0 || !monthlyAfter.slice(lastMarkerAt).includes(marker)) {
        invalidateTiviplayRuntimeCache();
        return { status: "DUPLICATE", message: "Evento ya guardado; existen gestiones posteriores. BASE F no se retrocede." };
      }

      const label = GESTION_F_ETIQUETAS[etapa];
      const baseNow = await base.read();
      if (baseNow.startsWith("=") || !safeBaseF(baseNow)) {
        invalidateTiviplayRuntimeCache();
        return { status: "UNVERIFIED", message: "El evento quedó registrado en PAGOS, pero BASE F cambió. Requiere revisión; no se sobrescribió." };
      }
      if (baseNow !== label) {
        const http = await base.write(label);
        if (http < 200 || http >= 300) {
          invalidateTiviplayRuntimeCache();
          return { status: "UNVERIFIED", message: "Evento guardado en PAGOS; falla al actualizar BASE F. Reintenta con el mismo identificador." };
        }
      }
      const verified = await base.read();
      invalidateTiviplayRuntimeCache();
      if (verified !== label) return { status: "UNVERIFIED", message: "Evento registrado, pero BASE F no coincide tras la relectura." };
      return { status: status === "SAVED" ? "SAVED" : "DUPLICATE",
        message: status === "SAVED" ? "Gestión y etapa F de BASE GENERAL guardadas y releídas." : "Evento ya registrado; etapa F verificada.",
        entry: record };

    });
  } catch {
    return { status: "ERROR", message: "No fue posible comprobar la escritura. Verifica la celda antes de repetir." };
  }
}
