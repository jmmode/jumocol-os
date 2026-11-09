import { CARTERA_MASKED_COLUMNS, ID_COL, MANAGED_COLUMNS, MASKED_COLUMNS, META_SIGNATURE_COL, columnLetter } from "./contract.mjs";

const cell = (value) => (value == null ? "" : String(value));
// Fichas del universo: identidad estable por USUARIO técnico normalizado (BU<hash>).
// Fallback BB<fila> solo para identidad vacía/ambigua, que queda bloqueada.
export const isUniverseId = (id) => /^[A-Z0-9]+-B(?:U[0-9A-F]{12}|B\d+)$/i.test(id);

// Columnas cuyo cambio se reporta por tipo (el resto se agrupa como OTRO).
const KIND_BY_COLUMN = new Map([
  [17, "FECHA"], // R F. PRÓXIMO PAGO
  [22, "CONFIRMACION"], [31, "CONFIRMACION"], // W, AF
  [25, "PAGO"], [26, "PAGO"], [27, "PAGO"], [28, "PAGO"], [29, "PAGO"],
  [32, "SEMANA"], [33, "CLASIFICACION"], [34, "DECISION"], [35, "DECISION"], [36, "DECISION"],
]);

/** Indexa filas por su ID (AL o, en secciones, columna A). Filas sin ID (blancos, títulos) no participan. */
export function indexById(values, prefix) {
  const map = new Map();
  (values ?? []).forEach((row, i) => {
    const id = cell(row?.[ID_COL]) || (cell(row?.[0]).startsWith(`${prefix}-`) ? cell(row[0]) : "");
    if (id) map.set(id, { index: i, row: row ?? [] });
  });
  return map;
}

/**
 * Diff por ID_BORRADOR entre la hoja actual y la nueva. Nunca imprime CLIENTE ni USUARIO:
 * solo indica que cambiaron. Ignora la celda de firma (cambia siempre que cambia el contenido).
 */
export function diffDraft(currentValues, nextValues, prefix) {
  const before = indexById(currentValues, prefix);
  const after = indexById(nextValues, prefix);
  const added = [];
  const removed = [];
  const modified = [];
  for (const id of after.keys()) if (!before.has(id)) added.push(id);
  for (const id of before.keys()) if (!after.has(id)) removed.push(id);
  for (const [id, b] of before) {
    const a = after.get(id);
    if (!a) continue;
    // Solo columnas del motor (A..AL): las del equipo no son cambios de la fuente.
    const width = Math.min(MANAGED_COLUMNS, Math.max(b.row.length, a.row.length));
    const changes = [];
    for (let c = 0; c < width; c++) {
      if (id.endsWith("-META") && c === META_SIGNATURE_COL) continue;
      const x = cell(b.row[c]);
      const y = cell(a.row[c]);
      if (x === y) continue;
      const masked = (isUniverseId(id) && MASKED_COLUMNS.has(c)) || (id.includes("-CV") && CARTERA_MASKED_COLUMNS.has(c));
      changes.push({
        column: columnLetter(c),
        kind: isUniverseId(id) ? KIND_BY_COLUMN.get(c) ?? "OTRO" : "SECCION",
        before: masked ? "[dato protegido]" : x,
        after: masked ? "[dato protegido]" : y,
      });
    }
    if (changes.length) modified.push({ id, changes });
  }
  const classChanges = modified
    .filter((m) => isUniverseId(m.id))
    .flatMap((m) => m.changes.filter((c) => c.kind === "CLASIFICACION").map((c) => ({ id: m.id, before: c.before, after: c.after })));
  const byKind = {};
  for (const m of modified) for (const c of m.changes) byKind[c.kind] = (byKind[c.kind] ?? 0) + 1;
  return {
    added: added.sort(),
    removed: removed.sort(),
    modified,
    classChanges,
    byKind,
    unchanged: added.length === 0 && removed.length === 0 && modified.length === 0,
  };
}
