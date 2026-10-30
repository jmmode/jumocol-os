import crypto from "node:crypto";

import { buildMonthlyClose } from "../core.mjs";
import { DRAFT_MAX_ROWS, TEAM_COLUMNS, assertAllowedDraftTitle, draftTarget } from "./contract.mjs";
import { buildDraft, contentSignature, fullSignature, storedSignature } from "./builder.mjs";
import { diffDraft, indexById } from "./diff.mjs";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * Conserva las columnas del equipo (AM:AP) por ID_BORRADOR: si la fila ya existía y el equipo
 * escribió algo, su valor gana sobre el valor inicial. Filas nuevas reciben el valor inicial del motor.
 */
export function mergeTeamColumns(current, values, prefix) {
  const before = indexById(current, prefix);
  return values.map((row) => {
    const id = String(row[37] ?? "") || (String(row[0] ?? "").startsWith(`${prefix}-`) ? String(row[0]) : "");
    const prev = id ? before.get(id)?.row : null;
    if (!prev || !TEAM_COLUMNS.some((c) => String(prev[c] ?? "") !== "")) return row;
    const copy = [...row];
    for (const c of TEAM_COLUMNS) copy[c] = prev[c] ?? "";
    return copy;
  });
}

/**
 * Sincronización controlada fuente → motor → hoja BORRADOR.
 *
 * `io` se inyecta (Google Sheets en producción, memoria en pruebas):
 *   readSources(): { baseRows, payments, missingSheets }  (solo lectura)
 *   readDraft(title): valores actuales o null si la hoja no existe
 *   writeDraft(title, values): sobrescribe A1:AL<n> y limpia el resto del rango fijo
 *
 * Garantías:
 *  - nunca crea hojas ni escribe fuera de la hoja BORRADOR del mes;
 *  - fuente leída dos veces: si cambia durante la lectura, no se escribe;
 *  - cálculo ejecutado dos veces: si difiere, no se escribe;
 *  - firma igual a la publicada → NO_CHANGES sin escritura (idempotencia);
 *  - concurrencia optimista: si la hoja cambió entre el diff y la escritura, se aborta;
 *  - relectura posterior: si no coincide, se restauran los valores previos.
 */
export async function syncDraft({ io, targetMonth, cutoffDate, decisions = {}, apply = false }) {
  const target = draftTarget(targetMonth);
  const title = assertAllowedDraftTitle(target.title);
  const report = { targetMonth, cutoffDate, title, mode: apply ? "apply" : "dry-run", status: null, steps: [] };
  const step = (name, detail = {}) => report.steps.push({ name, ...detail });

  const s1 = await io.readSources();
  const s2 = await io.readSources();
  const h1 = sha256(JSON.stringify(s1));
  const h2 = sha256(JSON.stringify(s2));
  step("lectura-fuentes", { stable: h1 === h2, missingSheets: s1.missingSheets ?? [], payments: s1.payments.length });
  if (h1 !== h2) return { ...report, status: "BLOQUEADO_FUENTE_INESTABLE" };

  const build = () => {
    const close = buildMonthlyClose(s1.baseRows, targetMonth, { cutoffDate });
    return { close, draft: buildDraft({ baseRows: s1.baseRows, close, payments: s1.payments, decisions, cutoffDate }) };
  };
  const run1 = build();
  const run2 = build();
  step("calculo", { repeatable: run1.draft.signature === run2.draft.signature, signature: run1.draft.signature, summary: run1.draft.summary });
  if (run1.draft.signature !== run2.draft.signature) return { ...report, status: "BLOQUEADO_NO_DETERMINISTA" };
  const { draft } = run1;
  report.summary = draft.summary;
  report.signature = draft.signature;
  if (draft.values.length > DRAFT_MAX_ROWS) return { ...report, status: "BLOQUEADO_EXCEDE_RANGO" };

  const current = await io.readDraft(title);
  if (current == null) return { ...report, status: "BLOQUEADO_HOJA_NO_EXISTE" };
  const currentSignature = contentSignature(current);
  const currentFull = fullSignature(current);
  const values = mergeTeamColumns(current, draft.values, target.prefix);
  report.previousSignature = storedSignature(current);
  report.diff = diffDraft(current, draft.values, target.prefix);
  step("diff", { added: report.diff.added.length, removed: report.diff.removed.length, modified: report.diff.modified.length, byKind: report.diff.byKind });

  if (currentSignature === draft.signature && report.previousSignature === draft.signature) {
    return { ...report, status: "NO_CHANGES", written: false };
  }
  if (!apply) return { ...report, status: "PLAN", written: false };

  const recheck = await io.readDraft(title);
  if (fullSignature(recheck ?? []) !== currentFull) {
    return { ...report, status: "BLOQUEADO_CONFLICTO", written: false };
  }

  await io.writeDraft(title, values);
  const readback = await io.readDraft(title);
  const readbackSignature = contentSignature(readback ?? []);
  const teamPreserved = fullSignature(readback ?? []) === fullSignature(values);
  step("relectura", { signature: readbackSignature, matches: readbackSignature === draft.signature, teamPreserved });
  if (readbackSignature === draft.signature && storedSignature(readback) === draft.signature && teamPreserved) {
    return { ...report, status: "ACTUALIZADO", written: true };
  }

  // Recuperación automática: se reponen los valores previos y se verifica la reposición.
  await io.writeDraft(title, current);
  const restored = await io.readDraft(title);
  const ok = fullSignature(restored ?? []) === currentFull;
  step("restauracion", { ok });
  return { ...report, status: ok ? "RESTAURADO" : "FALLO_RESTAURACION", written: true };
}
