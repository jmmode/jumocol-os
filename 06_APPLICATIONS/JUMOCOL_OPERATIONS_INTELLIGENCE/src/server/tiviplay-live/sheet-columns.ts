// Utilidades puras para leer hojas por ENCABEZADO y nunca por posición.
// Las hojas operativas reciben columnas nuevas (p. ej. ID en BASE GENERAL!M el 01/11/2026):
// cualquier índice fijo termina apuntando a otra columna, incluida CONTRASEÑA.

const fold = (v: unknown) =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

/** Encabezados que nunca se solicitan ni se devuelven. */
export function isSensitiveHeader(header: unknown) {
  const h = fold(header);
  return h === "CONTRASENA" || h === "PASSWORD" || h === "CLAVE";
}

export const headerKey = fold;

/** A=0 → "A", 26 → "AA". */
export function columnLetter(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** Primera fila (dentro de `rows`) que contiene todos los encabezados requeridos. -1 si no existe. */
export function findHeaderRow(rows: unknown[][], required: string[]) {
  const req = required.map(fold);
  return rows.findIndex((r) => {
    const cells = (r ?? []).map(fold);
    return req.every((h) => cells.includes(h));
  });
}

/**
 * Resuelve encabezados → letra de columna. Un encabezado sensible nunca se resuelve.
 * Si un nombre aparece dos veces, se toma la primera aparición.
 */
export function resolveColumns(header: unknown[], wanted: readonly string[]) {
  const cells = (header ?? []).map(fold);
  const out: Record<string, string | null> = {};
  for (const name of wanted) {
    if (isSensitiveHeader(name)) throw new Error(`Columna sensible solicitada: ${name}`);
    const i = cells.indexOf(fold(name));
    out[name] = i < 0 ? null : columnLetter(i);
  }
  return out;
}

/**
 * Defensa en profundidad para lecturas de hoja completa ya existentes: vacía cualquier columna cuyo encabezado
 * (en las primeras filas) sea sensible. Conserva la forma de la matriz para no desplazar índices.
 */
export function scrubSensitiveColumns(rows: unknown[][], headerScan = 6): unknown[][] {
  const sensitive = new Set<number>();
  const headerRows = new Set<number>();
  rows.slice(0, headerScan).forEach((r, ri) => (r ?? []).forEach((cell, i) => {
    if (isSensitiveHeader(cell)) { sensitive.add(i); headerRows.add(ri); }
  }));
  if (!sensitive.size) return rows;
  return rows.map((r, ri) => {
    if (!Array.isArray(r) || headerRows.has(ri)) return r; // la fila de encabezados se conserva
    return r.map((cell, i) => (sensitive.has(i) ? "" : cell));
  });
}


/**
 * BASE GENERAL (2026-11): F corresponde a gestión estructurada, W a observación libre.
 * La inserción de W desplaza CUMPLEAÑOS a X y CLIENTE_KEY a AH.
 * Valida el mapa sin consultar ni exponer columnas sensibles; los lectores usan nombres.
 */
export function baseGeneralGestionHeadersValid(header: readonly unknown[]) {
  const h = header.map(headerKey);
  return h[0] === "TC" &&
    h[1] === "CLIENTE" &&
    h[5] === "OBSERVACIONES GESTION" &&
    h[12] === "ID" &&
    h[13] === "USUARIO" &&
    h[22] === "OBSERVACIONES ASESOR" &&
    h[23] === "CUMPLEANOS" &&
    h[33] === "CLIENTE_KEY";
}
