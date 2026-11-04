import "server-only";

import { getCreditosHoy } from "@/server/tiviplay-live/creditos-hoy";
import { listCycleDecisions } from "@/server/tiviplay-live/cycle-decisions";
import { getRuntimeValuesCached, getTiviplayRuntimeLive } from "@/server/tiviplay-live/runtime-source";
import { sheetsSourceMode } from "@/server/tiviplay-live/sheets-snapshot";
import { buildClientDirectory, buildWorkday, searchDirectory, type DirectoryEntry, type SearchMatch, type Workday } from "@/server/tiviplay-live/workday-model";

export type { DirectoryEntry, QueueBucket, QueueItem, QueueLane, SearchMatch, Workday } from "@/server/tiviplay-live/workday-model";

export type WorkdayResult =
  | { ok: true; workday: Workday; directory: DirectoryEntry[]; source: ReturnType<typeof sheetsSourceMode> & { workbook: string; sheetsRead: string[]; signature: string } }
  | { ok: false; reason: string; source: ReturnType<typeof sheetsSourceMode> };

/** Jornada del día (America/Bogota). LEE → ORDENA → PRESENTA; nunca escribe. */
export async function getTiviplayWorkday(): Promise<WorkdayResult> {
  const mode = sheetsSourceMode();
  let runtime;
  try {
    runtime = await getTiviplayRuntimeLive();
  } catch (cause) {
    return { ok: false, reason: cause instanceof Error && /TIVIPLAY_SPREADSHEET_ID|GOOGLE_SHEETS/.test(cause.message) ? "Faltan credenciales o identificador del libro en el servidor." : "No fue posible leer el libro de Google Sheets.", source: mode };
  }
  const values = getRuntimeValuesCached() ?? {};
  const cartera = runtime.sources.included.find((r) => r.role === "CARTERA" && r.month === runtime.currentMonth)?.title;
  const directory = buildClientDirectory(values, ["BASE GENERAL", ...(cartera ? [cartera] : [])]);
  const [credits] = await Promise.allSettled([getCreditosHoy(runtime.currentMonth, runtime.today, listCycleDecisions())]);
  const workday = buildWorkday({
    model: runtime,
    credits: credits.status === "fulfilled" ? credits.value : null,
    creditsError: credits.status === "rejected" ? "Lectura de CONTROL fallida." : null,
    directory,
    // Una captura local nunca es el universo completo: todas las cifras quedan rotuladas PARCIAL.
    scope: mode.mode === "SNAPSHOT" ? { status: "PARCIAL", detail: mode.note } : { status: "COMPLETO", detail: `Lectura en vivo de ${runtime.source.sheetsRead.join(", ")}.` },
  });
  return { ok: true, workday, directory, source: { ...mode, workbook: runtime.source.workbook, sheetsRead: runtime.source.sheetsRead, signature: runtime.source.signature } };
}

/** Búsqueda autorizada en servidor. La consulta no se registra en logs ni en auditoría. */
export async function findTiviplayClients(query: string): Promise<{ ok: true; matches: SearchMatch[]; total: number } | { ok: false; reason: string }> {
  const result = await getTiviplayWorkday();
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true, matches: searchDirectory(result.directory, query), total: result.directory.length };
}
