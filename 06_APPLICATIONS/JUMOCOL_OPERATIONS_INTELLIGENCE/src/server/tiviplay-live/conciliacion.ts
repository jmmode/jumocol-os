import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import { audit, db, type Identity } from "@/server/auth/store";
import { bogotaToday } from "@/server/tiviplay-live/runtime-source";
import { resolveColumns } from "@/server/tiviplay-live/sheet-columns";
import {
  parseReleasedRanges, projectReconciliation, RELEASED_SHEET, validateDecision,
  type ReconDataset, type ReleasedRow, type ReconDecision, type TaskAction, type TaskEvent,
} from "@/server/tiviplay-live/conciliacion-model";

// Dataset del corte: datos operativos de clientes → solo en data/private (ignorado por Git).
export function datasetPath() {
  return process.env.TIVIPLAY_CONCILIACION_FILE ?? path.resolve(process.cwd(), "data/private/tiviplay/conciliacion-servicio.json");
}

export function loadDataset(): ReconDataset | null {
  try {
    const parsed = JSON.parse(readFileSync(/*turbopackIgnore: true*/ datasetPath(), "utf8")) as ReconDataset;
    if (!parsed || !Array.isArray(parsed.cases) || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.services)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function tables() {
  const database = db();
  database.exec(`
    CREATE TABLE IF NOT EXISTS tiviplay_recon_decisions(id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id TEXT NOT NULL, case_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL, option TEXT NOT NULL, supersedes INTEGER REFERENCES tiviplay_recon_decisions(id), reason TEXT);
    CREATE TABLE IF NOT EXISTS tiviplay_recon_task_events(id INTEGER PRIMARY KEY, at TEXT NOT NULL, user_id TEXT NOT NULL, task_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('EJECUTADO','NO_SE_PUEDE')), note TEXT);
    CREATE INDEX IF NOT EXISTS tiviplay_recon_decisions_case ON tiviplay_recon_decisions(case_id, id);
    CREATE INDEX IF NOT EXISTS tiviplay_recon_task_events_task ON tiviplay_recon_task_events(task_id, id);
    CREATE TRIGGER IF NOT EXISTS tiviplay_recon_decisions_no_update BEFORE UPDATE ON tiviplay_recon_decisions BEGIN SELECT RAISE(ABORT,'Decisions are append-only'); END;
    CREATE TRIGGER IF NOT EXISTS tiviplay_recon_decisions_no_delete BEFORE DELETE ON tiviplay_recon_decisions BEGIN SELECT RAISE(ABORT,'Decisions are append-only'); END;
    CREATE TRIGGER IF NOT EXISTS tiviplay_recon_events_no_update BEFORE UPDATE ON tiviplay_recon_task_events BEGIN SELECT RAISE(ABORT,'Task events are append-only'); END;
    CREATE TRIGGER IF NOT EXISTS tiviplay_recon_events_no_delete BEFORE DELETE ON tiviplay_recon_task_events BEGIN SELECT RAISE(ABORT,'Task events are append-only'); END;
  `);
  return database;
}

export function listReconDecisions(): ReconDecision[] {
  const rows = tables().prepare("SELECT id, at, user_id, case_id, fingerprint, option, supersedes, reason FROM tiviplay_recon_decisions ORDER BY id").all() as Array<Record<string, string | number | null>>;
  return rows.map((r) => ({ id: Number(r.id), at: String(r.at), by: String(r.user_id), caseId: String(r.case_id), fingerprint: String(r.fingerprint), option: String(r.option), supersedes: r.supersedes == null ? null : Number(r.supersedes), reason: r.reason == null ? null : String(r.reason) }));
}

export function listTaskEvents(): TaskEvent[] {
  const rows = tables().prepare("SELECT id, at, user_id, task_id, action, note FROM tiviplay_recon_task_events ORDER BY id").all() as Array<Record<string, string | number | null>>;
  return rows.map((r) => ({ id: Number(r.id), at: String(r.at), by: String(r.user_id), taskId: String(r.task_id), action: r.action as TaskAction, note: r.note == null ? null : String(r.note) }));
}

export function getReconciliation(dataset: ReconDataset | null = loadDataset()) {
  if (!dataset) return null;
  return projectReconciliation(dataset, listReconDecisions(), listTaskEvents(), bogotaToday());
}

/** Gerencia elige la opción de un caso. Queda bloqueada; cambiarla exige una corrección trazable. */
export function recordReconDecision(actor: Identity, input: Record<string, string>, dataset: ReconDataset | null = loadDataset()) {
  if (actor.role !== "ADMIN") throw new Error("Solo Dirección decide excepciones de conciliación.");
  if (!dataset) throw new Error("Dataset de conciliación no disponible.");
  const caseId = (input.caseId ?? "").trim();
  const option = (input.option ?? "").trim();
  const fingerprint = input.fingerprint ?? "";
  const supersedes = input.supersedes ? Number(input.supersedes) : null;
  const reason = (input.reason ?? "").trim() || null;
  if (reason && reason.length > 300) throw new Error("Motivo demasiado largo.");
  const projection = projectReconciliation(dataset, listReconDecisions(), listTaskEvents(), bogotaToday());
  const view = projection.cases.find((c) => c.id === caseId);
  const executed = view ? view.residualTasks.some((id) => projection.tasks.find((t) => t.id === id)?.status === "EJECUTADO") : false;
  const error = validateDecision(dataset.cases.find((c) => c.id === caseId), option, fingerprint, view?.decision ?? null, supersedes, reason, executed, bogotaToday());
  if (error) throw new Error(error);
  tables().prepare("INSERT INTO tiviplay_recon_decisions(at,user_id,case_id,fingerprint,option,supersedes,reason) VALUES(?,?,?,?,?,?,?)")
    .run(new Date().toISOString(), actor.id, caseId, fingerprint, option, supersedes, reason);
  audit(actor.id, `tiviplay-recon-decision:${caseId}`, option, "SUCCESS");
}

/** El Asesor reporta la ejecución (EJECUTADO) o el impedimento (NO SE PUEDE, con motivo) de una tarea. */
export function recordTaskEvent(actor: Identity, input: Record<string, string>, dataset: ReconDataset | null = loadDataset()) {
  if (!dataset) throw new Error("Dataset de conciliación no disponible.");
  const taskId = (input.taskId ?? "").trim();
  const action = input.action as TaskAction;
  const note = (input.note ?? "").trim() || null;
  if (action !== "EJECUTADO" && action !== "NO_SE_PUEDE") throw new Error("Acción inválida.");
  if (action === "NO_SE_PUEDE" && (!note || note.length < 5)) throw new Error("NO SE PUEDE exige el motivo.");
  if (note && note.length > 300) throw new Error("Nota demasiado larga.");
  const projection = projectReconciliation(dataset, listReconDecisions(), listTaskEvents(), bogotaToday());
  const task = projection.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Tarea inexistente o aún no generada.");
  if (task.status === "EJECUTADO") throw new Error("La tarea ya está cerrada.");
  tables().prepare("INSERT INTO tiviplay_recon_task_events(at,user_id,task_id,action,note) VALUES(?,?,?,?,?)")
    .run(new Date().toISOString(), actor.id, taskId, action, note);
  audit(actor.id, `tiviplay-recon-task:${taskId}`, action, "SUCCESS");
}

export type BaseLiveRow = { client: string; username: string; panel: string; due: string | null; duplicate?: boolean };

/** Normaliza fechas formateadas de Sheets (yyyy-mm-dd, dd-mm-yy, dd/mm/yyyy) a yyyy-mm-dd. */
export function normalizeSheetDate(value: string): string | null {
  const v = value.trim();
  let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

/**
 * Lectura viva (solo lectura) de BASE GENERAL: cliente, PANEL y F.VENCIMIENTO por fila.
 * Sirve para mostrar el cliente y para validar por relectura la cola de sincronización. Las demás columnas no se usan.
 */
export async function readBaseLive(): Promise<Map<number, BaseLiveRow> | null> {
  try {
    const { batchReadRanges, getSheetsAccessToken, getTiviplaySpreadsheetId, quoteSheet } = await import("@/server/tiviplay-live/sheets-client");
    const token = await getSheetsAccessToken();
    const id = getTiviplaySpreadsheetId();
    const base = quoteSheet("BASE GENERAL");
    // Contrato de encabezados, nunca índices fijos. NO leer las columnas CONTRASEÑA ni otras credenciales.
    const [headerRows] = await batchReadRanges(id, token, [`${base}!A2:AR2`]);
    const names = ["CLIENTE", "USUARIO", "PANEL", "F.VENCIMIENTO", "CONCILIACION_SERVICIO_27OCT"] as const;
    const cols = resolveColumns(headerRows?.[0] ?? [], names);
    if (names.slice(0, 4).some((name) => !cols[name])) return null;
    const [clients, usernames, panels, technicalDue, reconciliationNotes] = await batchReadRanges(
      id, token, names.map((name) => cols[name] ? `${base}!${cols[name]}3:${cols[name]}3000` : `${base}!A3:A3`),
    );
    const out = new Map<number, BaseLiveRow>();
    const count = Math.max(clients?.length ?? 0, usernames?.length ?? 0, panels?.length ?? 0, technicalDue?.length ?? 0);
    for (let i = 0; i < count; i++) {
      const client = String(clients?.[i]?.[0] ?? "").trim();
      if (!client) continue;
      const marker = cols.CONCILIACION_SERVICIO_27OCT ? String(reconciliationNotes?.[i]?.[0] ?? "") : "";
      out.set(i + 3, {
        client,
        username: normUser(String(usernames?.[i]?.[0] ?? "")),
        panel: String(panels?.[i]?.[0] ?? "").trim(),
        due: normalizeSheetDate(String(technicalDue?.[i]?.[0] ?? "")),
        duplicate: marker.toUpperCase().startsWith("DUPLICADO DEPURADO"),
      });
    }
    return out;
  } catch {
    return null;
  }
}

const normUser = (v: string) => v.normalize("NFKC").replace(/\s+/g, "").toUpperCase();

/**
 * Fila viva de un USUARIO. BASE GENERAL recibe inserciones del equipo: el número de fila del corte es solo una pista.
 * Se usa la fila de la pista si aún es de ese USUARIO; si no, la única fila no marcada como duplicado con ese USUARIO.
 */
export function locateRow(live: Map<number, BaseLiveRow> | null, username: string, hint?: number) {
  if (!live) return null;
  const u = normUser(username);
  // La pista del snapshot no resuelve una identidad duplicada: primero exigir unicidad en BASE viva.
  const rows = [...live.entries()].filter(([, r]) => r.username === u && !r.duplicate).map(([n]) => n);
  if (rows.length !== 1) return null;
  if (hint && rows[0] === hint) return hint;
  return rows[0];
}

/** ¿El cambio exigido ya está en la fuente? (verificado por relectura, localizando la fila por USUARIO, no por intención). */
export function isApplied(update: { row: number; field: string; to: string; username?: string }, live: Map<number, BaseLiveRow> | null) {
  const n = update.username ? locateRow(live, update.username, update.row) : update.row;
  const row = n ? live?.get(n) : undefined;
  if (!row) return false;
  if (update.field === "PANEL") return row.panel.toUpperCase() === update.to.toUpperCase();
  if (update.field === "F.VENCIMIENTO") return row.due === update.to;
  return false;
}

/**
 * Lectura viva (solo lectura) de la hoja existente USUARIOS LIBERADOS (libro VENTAS 2026).
 * Solo se piden A (LINE_ID), C (USUARIO) y E:G (PANEL, F.VENCIMIENTO, ESTADO): nunca B, D (CONTRASEÑA) ni H (OBSERVACIONES).
 */
export async function readReleasedLive(): Promise<ReleasedRow[] | null> {
  try {
    const { batchReadRanges, getSheetsAccessToken, getTiviplaySalesSpreadsheetId, quoteSheet } = await import("@/server/tiviplay-live/sheets-client");
    const sheet = quoteSheet(RELEASED_SHEET);
    const token = await getSheetsAccessToken();
    const [a, c, efg] = await batchReadRanges(getTiviplaySalesSpreadsheetId(), token, [`${sheet}!A1:A3000`, `${sheet}!C1:C3000`, `${sheet}!E1:G3000`]);
    return parseReleasedRanges(a, c, efg, normalizeSheetDate);
  } catch {
    return null;
  }
}
