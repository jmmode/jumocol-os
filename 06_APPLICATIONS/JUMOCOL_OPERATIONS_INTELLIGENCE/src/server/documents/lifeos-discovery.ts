// Read-only discovery of the TiviPlay manuals kept in LIFE-OS. Originals are never written.
// No "server-only" import so the local report script can reuse it; it is never imported by client code.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { CATALOG_STATUS_LABEL, LIBRARY_SECTIONS, curationFor, driveUrlFor, type CatalogStatus, type LibrarySection } from "./curation";
import { docxToMarkdown } from "./docx-text";
import { extractMetadata, extractTitle, slugify } from "./markdown-metadata";

export const DOCUMENT_CATEGORIES = LIBRARY_SECTIONS;
export type DocumentCategory = LibrarySection;

export const DEFAULT_LIFEOS_ROOT = "D:\\LIFE_OPERATING_SYSTEM (LIFE-OS)\\TIVIPLAY_OPERATION_SYSTEM";
const FOLDERS: Readonly<Record<string, DocumentCategory>> = {
  "10_FORMACION_Y_CAPACITACION": "Formación inicial",
  "12_BACK_OFFICE": "Back Office",
  "03_VENTAS_Y_FACTURACION": "Ventas",
  "05_OPERACION_Y_TURNOS": "Servicio al cliente",
  "06_CALIDAD_Y_AUDITORIA": "Back Office",
};
const READABLE = new Set([".md", ".markdown", ".txt", ".docx"]);
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_FILES = 600;
const MAX_DEPTH = 5;
// Order matters: the first rule that matches the file name or title wins.
const KEYWORDS: ReadonlyArray<[DocumentCategory, RegExp]> = [
  ["Cobros y facturación", /cobr|cartera|recaudo|mora|pagos?\b|renovaci|vencimient|recordatorio/],
  ["Servicio técnico", /soporte|t[eé]cnic|falla|incidencia|instalaci|configuraci|dispositivo|aplicaci[oó]n|\bapp\b|router|se[nñ]al|buffer|reinici/],
  ["Ventas", /venta|factur|plan(es)?\b|precio|tarifa|cotizaci|prospect|comercial|activaci[oó]n de cliente|alta de cliente/],
  ["Servicio al cliente", /servicio al cliente|atenci[oó]n|pqr|queja|reclamo|whatsapp|chat|guion|script|turno/],
  ["Back Office", /back ?office|conciliaci|registro|base de datos|inventario|cierre|auditor|calidad|control/],
  ["Formación inicial", /formaci[oó]n|capacitaci|inducci|onboarding|glosario|curso|entrenamiento/],
];
const RESTRICTED_STATUS = /CONFIDENCIAL|RESTRINGIDO|PRIVADO|SOLO\s+(ADMIN|DIRECCI)|USO\s+INTERNO\s+DE\s+DIRECCI/i;
// Same-line "label: value" only, so empty form fields ("Contraseña:" followed by a new line) are not flagged.
const CREDENTIAL = /(contrase[nñ]a|password|passwd|clave|token|api[_ -]?key|secret)[ \t]*[:=][ \t]*\S{4,}/i;

export type Disposition = "vigente" | "version-superada" | "duplicado";
export type DiscoveredDocument = {
  id: string;
  relativePath: string;
  sourceReference: string;
  physicalPath: string;
  folder: string;
  category: DocumentCategory;
  classifiedBy: "contenido" | "carpeta";
  title: string;
  version: string;
  status: string;
  owner: string | null;
  sha256: string;
  modifiedAt: number;
  lineage: string;
  disposition: Disposition;
  restriction: string | null;
  catalogStatus: CatalogStatus;
  catalogReason: string;
  proposedCurrent: boolean;
  curated: boolean;
  driveUrl: string | null;
};
export type SkippedFile = { relativePath: string; reason: string; section: DocumentCategory | null; catalogStatus: CatalogStatus | null; catalogReason: string | null; driveUrl: string | null };
export type DiscoveryResult = {
  root: string;
  available: boolean;
  documents: DiscoveredDocument[];
  skipped: SkippedFile[];
};
export { CATALOG_STATUS_LABEL };

/** Reads an authorized source as Markdown (DOCX is converted in memory; the original is never written). */
export function readSourceMarkdown(physicalPath: string): string {
  return path.extname(physicalPath).toLowerCase() === ".docx"
    ? docxToMarkdown(readFileSync(/* turbopackIgnore: true */ physicalPath))
    : readFileSync(/* turbopackIgnore: true */ physicalPath, "utf8");
}
const skippedEntry = (relativePath: string, reason: string): SkippedFile => {
  const curation = curationFor(relativePath);
  return { relativePath, reason, section: curation?.section ?? null, catalogStatus: curation?.status ?? null, catalogReason: curation?.reason ?? null, driveUrl: driveUrlFor(relativePath) };
};

export function lifeosRoot() {
  const configured = process.env.TIVIPLAY_DOCS_ROOT;
  return configured === undefined ? DEFAULT_LIFEOS_ROOT : configured.trim();
}

function versionTuple(text: string): number[] {
  const match = text.match(/v?(\d+(?:[._]\d+){0,3})/i);
  return match ? match[1].split(/[._]/).map(Number) : [];
}
function compareTuple(a: number[], b: number[]) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0);
  return 0;
}
function fileVersion(base: string) { return versionTuple(base.match(/(?:^|[_\s-])v\d+(?:[._]\d+)*/i)?.[0] ?? ""); }
function fileDate(base: string) { return base.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ""; }
function lineageOf(base: string) {
  return slugify(base
    .replace(/(?:^|[_\s-])v\d+(?:[._]\d+)*/gi, " ")
    .replace(/\d{4}-\d{2}-\d{2}/g, " ")
    .replace(/(?:^|[_\s-])(final|copia|copy|borrador|draft|nuevo|actualizado|old|antiguo)(?=$|[_\s-])/gi, " ")
    .replace(/\(\d+\)/g, " "));
}
function classify(folder: string, haystack: string): [DocumentCategory, "contenido" | "carpeta"] {
  const text = haystack.normalize("NFC").toLowerCase();
  for (const [category, rule] of KEYWORDS) if (rule.test(text)) return [category, "contenido"];
  return [FOLDERS[folder], "carpeta"];
}

function walk(directory: string, root: string, depth: number, out: string[], skipped: DiscoveryResult["skipped"]) {
  if (depth > MAX_DEPTH || out.length >= MAX_FILES) return;
  let names: string[];
  try { names = readdirSync(/* turbopackIgnore: true */ directory); } catch { return; }
  for (const name of names.sort()) {
    if (name.startsWith(".") || name.startsWith("~$")) continue;
    const full = path.join(directory, name);
    let info;
    try { info = statSync(/* turbopackIgnore: true */ full); } catch { continue; }
    if (info.isDirectory()) walk(full, root, depth + 1, out, skipped);
    else if (info.isFile()) {
      const relativePath = path.relative(root, full).split(path.sep).join("/");
      if (!READABLE.has(path.extname(name).toLowerCase())) skipped.push(skippedEntry(relativePath, `formato ${path.extname(name).toLowerCase() || "sin extensión"} no legible en el visor`));
      else if (info.size > MAX_BYTES) skipped.push(skippedEntry(relativePath, "excede 12 MB"));
      else out.push(full);
    }
  }
}

let cache: { key: string; at: number; result: DiscoveryResult } | undefined;

export function discoverLifeosDocuments(options: { fresh?: boolean } = {}): DiscoveryResult {
  const root = lifeosRoot();
  if (!options.fresh && cache && cache.key === root && Date.now() - cache.at < 60_000) return cache.result;
  const result: DiscoveryResult = { root, available: false, documents: [], skipped: [] };
  let physicalRoot = "";
  try { physicalRoot = root ? realpathSync(/* turbopackIgnore: true */ root) : ""; } catch { physicalRoot = ""; }
  if (physicalRoot) {
    result.available = true;
    for (const folder of Object.keys(FOLDERS)) {
      const files: string[] = [];
      walk(path.join(physicalRoot, folder), physicalRoot, 0, files, result.skipped);
      for (const file of files) {
        let physical: string;
        try { physical = realpathSync(/* turbopackIgnore: true */ file); } catch { continue; }
        if (!physical.startsWith(`${physicalRoot}${path.sep}`)) { result.skipped.push(skippedEntry(path.basename(file), "enlace fuera de la raíz autorizada")); continue; }
        const relativePath = path.relative(physicalRoot, physical).split(path.sep).join("/");
        let markdown: string;
        try { markdown = readSourceMarkdown(physical); } catch { result.skipped.push(skippedEntry(relativePath, "no se pudo leer el contenido")); continue; }
        const base = path.basename(physical, path.extname(physical));
        const isDocx = path.extname(physical).toLowerCase() === ".docx";
        const title = isDocx ? base.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim() : extractTitle(markdown, base.replace(/[_]+/g, " "));
        const status = extractMetadata(markdown, "Estado", "Status");
        const version = extractMetadata(markdown, "Versión", "Version");
        const ownerValue = extractMetadata(markdown, "Responsable", "Propietario", "Owner", "Autor");
        const curation = curationFor(relativePath);
        const [autoCategory, autoBy] = classify(folder, `${base} ${title}`);
        const head = markdown.split(/\r?\n/).slice(0, 40).join("\n");
        const restriction = CREDENTIAL.test(markdown) || /(contiene|con)\s[^.]*(credenciales|accesos)/i.test(curation?.reason ?? "") ? "posible credencial en el texto"
          : RESTRICTED_STATUS.test(status) || RESTRICTED_STATUS.test(head) ? "marcado como restringido o confidencial" : null;
        result.documents.push({
          id: `lo-${slugify(base).slice(0, 48) || "documento"}-${createHash("sha1").update(relativePath).digest("hex").slice(0, 6)}`,
          relativePath, sourceReference: `LIFE-OS/TIVIPLAY_OPERATION_SYSTEM/${relativePath}`, physicalPath: physical, folder,
          category: curation?.section ?? autoCategory, classifiedBy: curation ? "contenido" : autoBy, title, version, status,
          owner: ownerValue === "NO DOCUMENTADO" ? null : ownerValue,
          sha256: createHash("sha256").update(markdown).digest("hex").toUpperCase(),
          modifiedAt: statSync(/* turbopackIgnore: true */ physical).mtimeMs,
          lineage: lineageOf(base) || slugify(base), disposition: "vigente", restriction,
          catalogStatus: curation?.status ?? (restriction ? "RESTRINGIDO" : "PENDIENTE_VALIDACION"),
          catalogReason: curation?.reason ?? (restriction ? `Detección automática: ${restriction}.` : "Sin curaduría: revisión documental pendiente."),
          proposedCurrent: curation?.proposedCurrent ?? false,
          curated: !!curation,
          driveUrl: driveUrlFor(relativePath),
        });
      }
    }
  }
  resolveVersions(result.documents);
  cache = { key: root, at: Date.now(), result };
  return result;
}

function rank(doc: DiscoveredDocument) {
  const base = path.basename(doc.relativePath);
  const tuple = doc.version !== "NO DOCUMENTADO" ? versionTuple(doc.version) : fileVersion(base);
  return { tuple, date: fileDate(base), mtime: doc.modifiedAt };
}
function newerFirst(a: DiscoveredDocument, b: DiscoveredDocument) {
  const x = rank(a), y = rank(b);
  return compareTuple(y.tuple, x.tuple) || y.date.localeCompare(x.date) || y.mtime - x.mtime || a.relativePath.length - b.relativePath.length;
}

function resolveVersions(documents: DiscoveredDocument[]) {
  // 1. Identical content: keep one copy.
  const byHash = new Map<string, DiscoveredDocument[]>();
  for (const doc of documents) byHash.set(doc.sha256, [...(byHash.get(doc.sha256) ?? []), doc]);
  for (const group of byHash.values()) group.sort(newerFirst).slice(1).forEach(doc => { doc.disposition = "duplicado"; });
  // 2. Same document family: only the newest version stays current.
  const byLineage = new Map<string, DiscoveredDocument[]>();
  for (const doc of documents.filter(d => d.disposition !== "duplicado")) byLineage.set(doc.lineage, [...(byLineage.get(doc.lineage) ?? []), doc]);
  for (const group of byLineage.values()) {
    group.sort(newerFirst);
    group.slice(1).forEach(doc => { doc.disposition = "version-superada"; });
    // 3. Contradiction: same declared version, different content -> human decision.
    if (group.length > 1 && compareTuple(rank(group[0]).tuple, rank(group[1]).tuple) === 0 && rank(group[0]).tuple.length)
      for (const doc of group.slice(0, 2)) doc.restriction ??= "conflicto: misma versión declarada con contenido distinto";
  }
}
