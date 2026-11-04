import fs from "node:fs";

import { isSensitiveHeader } from "@/server/tiviplay-live/sheet-columns";

/**
 * Captura local de solo lectura de los libros de Google Sheets, para el puesto de trabajo sin cuenta de servicio.
 * Responde a las mismas URL que usa sheets-client (metadata y values:batchGet), de modo que el motor, los lectores y la
 * exclusión de columnas sensibles se ejercitan sin cambios. El archivo vive en `data/private/` (ignorado por Git).
 *
 * Formato: { capturedAt, spreadsheets: { [id]: { title, sheets: [{ title, hidden? }], blocks: { [sheet]: [{ range: "A1:M120", values }] } } } }
 */
export const SNAPSHOT_TOKEN = "local-snapshot";

type Block = { range: string; values: unknown[][] };
type SnapshotBook = { title: string; sheets: Array<{ title: string; hidden?: boolean }>; blocks: Record<string, Block[]> };
export type SheetsSnapshot = { capturedAt: string; note?: string; spreadsheets: Record<string, SnapshotBook> };

export function snapshotFile() {
  return process.env.TIVIPLAY_SHEETS_SNAPSHOT_FILE?.trim() || null;
}

let cache: { file: string; mtime: number; data: SheetsSnapshot } | null = null;

export function loadSnapshot(): SheetsSnapshot {
  const file = snapshotFile();
  if (!file) throw new Error("Sin captura local configurada");
  const mtime = fs.statSync(file).mtimeMs;
  if (!cache || cache.file !== file || cache.mtime !== mtime) cache = { file, mtime, data: JSON.parse(fs.readFileSync(file, "utf8")) as SheetsSnapshot };
  return cache.data;
}

/** Fuente vigente para mostrar en pantalla: nunca se presenta una captura como lectura en vivo. */
export function sheetsSourceMode(): { mode: "LIVE" } | { mode: "SNAPSHOT"; capturedAt: string } {
  if (!snapshotFile()) return { mode: "LIVE" };
  try {
    return { mode: "SNAPSHOT", capturedAt: loadSnapshot().capturedAt };
  } catch {
    return { mode: "SNAPSHOT", capturedAt: "desconocida" };
  }
}

const colIndex = (letters: string) => [...letters].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

/** "'BASE GENERAL'!A1:M3" → { sheet, c0, r0, c1, r1 } (0-based, inclusivo). */
export function parseA1(range: string) {
  const bang = range.lastIndexOf("!");
  const rawSheet = range.slice(0, bang);
  const sheet = rawSheet.startsWith("'") ? rawSheet.slice(1, -1).replace(/''/g, "'") : rawSheet;
  const m = range.slice(bang + 1).match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
  if (!m) throw new Error(`Rango no soportado: ${range}`);
  return { sheet, c0: colIndex(m[1]), r0: Number(m[2]) - 1, c1: colIndex(m[3] ?? m[1]), r1: Number(m[4] ?? m[2]) - 1 };
}

/** Recorta la captura a un rango y conserva la forma de la API (filas/celdas finales vacías se omiten). */
export function sliceSnapshot(blocks: Block[], range: string) {
  const { c0, r0, c1, r1 } = parseA1(range);
  const grid = new Map<number, Map<number, unknown>>();
  for (const block of blocks) {
    const b = parseA1(`x!${block.range}`);
    block.values.forEach((row, ri) => (row ?? []).forEach((cell, ci) => {
      const r = b.r0 + ri;
      const c = b.c0 + ci;
      if (c > b.c1 || r > b.r1) return;
      if (!grid.has(r)) grid.set(r, new Map());
      grid.get(r)!.set(c, cell);
    }));
  }
  const rows: unknown[][] = [];
  for (let r = r0; r <= r1; r++) {
    const line = grid.get(r);
    const row: unknown[] = [];
    for (let c = c0; c <= c1; c++) row.push(line?.get(c) ?? "");
    while (row.length && row[row.length - 1] === "") row.pop();
    rows.push(row);
  }
  while (rows.length && rows[rows.length - 1].length === 0) rows.pop();
  return rows;
}

/** Comprobación de la propia captura: ninguna celda bajo un encabezado sensible puede traer valor. */
export function assertSnapshotSafe(book: SnapshotBook) {
  for (const [sheet, blocks] of Object.entries(book.blocks)) {
    const head = sliceSnapshot(blocks, "A1:BZ3");
    const sensitive = new Set<number>();
    head.forEach((row) => row.forEach((cell, i) => { if (isSensitiveHeader(cell)) sensitive.add(i); }));
    if (!sensitive.size) continue;
    const all = sliceSnapshot(blocks, "A4:BZ6000");
    for (const row of all) for (const i of sensitive) if (String(row[i] ?? "").trim()) throw new Error(`Captura insegura: ${sheet} trae valores bajo CONTRASEÑA`);
  }
}

export function readSnapshotResponse(url: string): unknown {
  const u = new URL(url);
  const parts = decodeURIComponent(u.pathname).split("/");
  const valuesCall = parts[parts.length - 1] === "values:batchGet";
  const id = valuesCall ? parts[parts.length - 2] : parts[parts.length - 1];
  const book = loadSnapshot().spreadsheets[id];
  if (!book) throw new Error("Google Sheets read failed (404)");
  assertSnapshotSafe(book);
  if (!valuesCall) return { properties: { title: book.title }, sheets: book.sheets.map((s) => ({ properties: { title: s.title, hidden: !!s.hidden } })) };
  return {
    valueRanges: u.searchParams.getAll("ranges").map((range) => {
      const { sheet } = parseA1(range);
      return { range, values: sliceSnapshot(book.blocks[sheet] ?? [], range) };
    }),
  };
}
