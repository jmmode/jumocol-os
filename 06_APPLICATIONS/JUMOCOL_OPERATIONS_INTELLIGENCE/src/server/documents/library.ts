import "server-only";
import { createHash } from "node:crypto";
import path from "node:path";
import { audit, db, listUsers, type Identity } from "@/server/auth/store";
import { readCanonicalDocument, type CanonicalDocument, type DocumentId } from "./document-repository";
import { CATALOG_STATUS_LABEL, OPERATIONAL_STANDARD_KEYS, type CatalogStatus } from "./curation";
import { discoverLifeosDocuments, type DocumentCategory, type Disposition, type SkippedFile } from "./lifeos-discovery";
import { slugify } from "./markdown-metadata";

type CatalogItem = {
  id: DocumentId;
  category: DocumentCategory;
  owner: string | null;
  origin: "JUMOCOL_SYSTEM_OS" | "LIFE-OS";
  disposition: Disposition;
  restriction: string | null;
  catalogStatus: CatalogStatus;
  catalogReason: string;
  proposedCurrent: boolean;
  /** Original en Google Drive; null cuando no hay correspondencia verificada o el documento es restringido. */
  driveUrl: string | null;
  /** Recurso que el visor no puede leer (p. ej. PPTX): se consulta solo en su original de Drive. */
  linkOnly?: { title: string; relativePath: string };
};
const GOVERNANCE = "Documento de gobierno interno de JUMOCOL OS (contexto, contrato o baseline); no es un manual de operador.";
const STATIC_CATALOG: ReadonlyArray<CatalogItem> = [
  { id: "tiviplay-guia-rapida-turno", category: "Servicio al cliente", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Guía rápida de turno (22/10/2026): plantillas de incidencias, scripts de atención alineados con S0, reproductores por dispositivo, Fire Stick con Downloader y faltantes que requieren evidencia (URL por panel, AT&T). Consolida textos históricos sin credenciales; Dirección debe confirmar el código 2865004 antes de publicarla.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-fichas-atencion", category: "Servicio al cliente", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Fichas de atención por categoría (03/11/2026): diagnóstico, procedimiento, script copiable y escalamiento, sin credenciales ni promociones históricas. Alimentan la vista Atención; Dirección las publica para operadores.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-mensajes-cobro", category: "Cobros y facturación", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Mensajes por etapa del Manual de cobro (04/11/2026), sin datos de pago ni promociones. Alimentan la ficha ATENDER; Dirección los publica para operadores.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-manual-lista-octubre-hoy", category: "Cobros y facturación", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Instrucción corta aprobada por Dirección (20/10/2026) para usar la página HOY esta semana. Los operadores la ven cuando ADMIN publica esta versión en Biblioteca.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-manual-financiero-renovacion", category: "Cobros y facturación", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Manual piloto v0.2 (20/10/2026, segunda inspección) verificado contra las hojas vivas de octubre. Gate operacional PARCIAL sin recorrido E2E real; decisiones D2–D10 pendientes antes de publicarlo.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-operations-guide", category: "Formación inicial", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "PENDIENTE_VALIDACION", catalogReason: "Mini guía del módulo Operaciones elaborada desde el código (13/10/2026). Requiere revisión de Dirección antes de publicarse.", proposedCurrent: true, driveUrl: null },
  { id: "tiviplay-context", category: "Formación inicial", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "RESTRINGIDO", catalogReason: GOVERNANCE, proposedCurrent: false, driveUrl: null },
  { id: "tiviplay-s0-contract", category: "Cobros y facturación", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "RESTRINGIDO", catalogReason: GOVERNANCE, proposedCurrent: false, driveUrl: null },
  { id: "tiviplay-s0-baseline", category: "Back Office", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "RESTRINGIDO", catalogReason: GOVERNANCE, proposedCurrent: false, driveUrl: null },
  { id: "tiviplay-cycle-close", category: "Back Office", owner: null, origin: "JUMOCOL_SYSTEM_OS", disposition: "vigente", restriction: null, catalogStatus: "RESTRINGIDO", catalogReason: GOVERNANCE, proposedCurrent: false, driveUrl: null },
];
const CATALOG: CatalogItem[] = [...STATIC_CATALOG];
// Live view: static canonical documents + read-only LIFE-OS discovery (refreshed at most every 60 s).
export const DOCUMENT_CATALOG: ReadonlyArray<CatalogItem> = CATALOG;

function refreshCatalog() {
  const discovered = discoverLifeosDocuments().documents.map((doc): CatalogItem => ({
    id: doc.id, category: doc.category, owner: doc.owner, origin: "LIFE-OS", disposition: doc.disposition, restriction: doc.restriction,
    catalogStatus: doc.catalogStatus, catalogReason: doc.catalogReason, proposedCurrent: doc.proposedCurrent, driveUrl: doc.driveUrl,
  }));
  const links = discoverLifeosDocuments().skipped.filter(linkEligible).map((file): CatalogItem => ({
    id: linkId(file.relativePath), category: file.section!, owner: null, origin: "LIFE-OS", disposition: "vigente", restriction: null,
    catalogStatus: "PENDIENTE_VALIDACION", catalogReason: file.catalogReason ?? "Recurso enlazado a su original de Drive.", proposedCurrent: false,
    driveUrl: file.driveUrl, linkOnly: { title: path.basename(file.relativePath, path.extname(file.relativePath)), relativePath: file.relativePath },
  }));
  CATALOG.splice(0, CATALOG.length, ...STATIC_CATALOG, ...discovered, ...links);
  return CATALOG;
}

/** Archivo no legible en el visor que sí puede ofrecerse como enlace a su original: curado, con sección y Drive verificado. */
export function linkEligible(file: SkippedFile) {
  return !!file.driveUrl && !!file.section && file.catalogStatus === "PENDIENTE_VALIDACION";
}
const linkId = (relativePath: string) =>
  `lo-enlace-${slugify(path.basename(relativePath, path.extname(relativePath))).slice(0, 40) || "recurso"}-${createHash("sha1").update(relativePath).digest("hex").slice(0, 6)}`;

/** Ficha sintética de un recurso solo-enlace. Su "versión" publicable es el par ruta + enlace: si cambia, la publicación se invalida. */
function linkDocument(item: CatalogItem & { linkOnly: NonNullable<CatalogItem["linkOnly"]> }): CanonicalDocument {
  const format = path.extname(item.linkOnly.relativePath).slice(1).toUpperCase() || "ARCHIVO";
  return {
    id: item.id, title: item.linkOnly.title, identifier: item.id, version: "NO DOCUMENTADO", status: "ENLACE A ORIGINAL",
    cutoffDate: "NO DOCUMENTADO", module: "Operaciones", submodule: "TiviPlay", owner: null, governingDecision: "WO-TIVI-DOC-001",
    sourceReference: `Google Drive · LIFE-OS/TIVIPLAY_OPERATION_SYSTEM/${item.linkOnly.relativePath}`,
    sha256: createHash("sha256").update(`${item.linkOnly.relativePath}\n${item.driveUrl}`).digest("hex").toUpperCase(),
    markdown: `# ${item.linkOnly.title}\n\nRecurso en formato ${format}. Se consulta en su original de Google Drive con el botón **Abrir original en Drive**.\n`,
    headings: [],
  };
}

type Publication = { sha256: string; approved_by: string; approved_at: string; evidence: string };
export function documentId(value: string): DocumentId | null {
  if (typeof value !== "string" || !/^[a-z0-9-]{1,80}$/.test(value)) return null;
  return refreshCatalog().find(x => x.id === value)?.id ?? null;
}

/** Reason that prevents publication to operators, or null when an ADMIN may authorize it. */
function publicationBlock(definition: CatalogItem, status: string) {
  if (definition.catalogStatus !== "PENDIENTE_VALIDACION") return `${CATALOG_STATUS_LABEL[definition.catalogStatus]}: ${definition.catalogReason}`;
  if (/DRAFT|BORRADOR|HIST[OÓ]RICO|RESTRINGIDO|CONFIDENCIAL|OBSOLET|DEROGAD/i.test(status)) return `estado documental: ${status}`;
  if (definition.disposition === "duplicado") return "copia idéntica de otro documento";
  if (definition.disposition === "version-superada") return "existe una versión más reciente";
  return definition.restriction;
}

/** Explicit security restriction: content that may expose credentials is not rendered for anyone, ADMIN included. */
export function readingBlocked(item: Pick<CatalogItem, "restriction">) {
  return item.restriction?.startsWith("posible credencial") ?? false;
}

export async function libraryEntry(id: DocumentId, actor: Identity) {
  const definition = (CATALOG.find(x => x.id === id) ? CATALOG : refreshCatalog()).find(x => x.id === id);
  if (!definition || readingBlocked(definition)) return null;
  const document = definition.linkOnly ? linkDocument({ ...definition, linkOnly: definition.linkOnly }) : await readCanonicalDocument(id);
  const approval = db().prepare("SELECT * FROM publications WHERE document_id=?").get(id) as Publication | undefined;
  const blockedReason = publicationBlock(definition, document.status);
  const draft = blockedReason !== null;
  const published = !!approval && approval.sha256 === document.sha256 && !draft;
  if (actor.role !== "ADMIN" && !published) return null;
  const catalogLabel = published ? CATALOG_STATUS_LABEL.VIGENTE_APTO : CATALOG_STATUS_LABEL[definition.catalogStatus];
  return { ...definition, owner: definition.owner ?? document.owner, document, published, approval: approval ?? null, draft, blockedReason, catalogLabel };
}

export async function libraryInventory(actor: Identity) {
  const entries = await Promise.all(refreshCatalog().map(async item => {
    if (readingBlocked(item)) return actor.role === "ADMIN" ? { ...item, unavailable: true as const } : null;
    try { return await libraryEntry(item.id, actor); }
    catch { return actor.role === "ADMIN" ? { ...item, unavailable: true as const } : null; }
  }));
  // Operators only ever receive current, published versions; ADMIN sees everything pending decision.
  return entries.filter(x => x !== null);
}

/** `checklist`: keys of OPERATIONAL_STANDARD the ADMIN confirmed; all 7 are required to publish (not to revoke). */
export async function publishDocument(actor: Identity, id: DocumentId, sha256: string, evidence: string, revoke = false, checklist: readonly string[] = []) {
  listUsers(actor); // Revalidate live ADMIN authority, including deactivation.
  const entry = await libraryEntry(id, actor);
  if (!entry || entry.document.sha256 !== sha256) throw new Error("La fuente cambió. Revise la versión actual.");
  if (!revoke && (entry.draft || evidence.trim().length < 12 || evidence.length > 300)) throw new Error(entry.blockedReason ? `No publicable: ${entry.blockedReason}.` : "Se requiere documento revisado y referencia de aprobación (12–300 caracteres).");
  const missing = OPERATIONAL_STANDARD_KEYS.filter(key => !checklist.includes(key));
  if (!revoke && missing.length) throw new Error(`El manual debe cubrir los 7 elementos operativos. Falta confirmar: ${missing.join(", ")}.`);
  const database = db();
  database.exec("BEGIN IMMEDIATE");
  try {
    listUsers(actor);
    if (revoke) database.prepare("DELETE FROM publications WHERE document_id=?").run(id);
    else database.prepare("INSERT INTO publications VALUES(?,?,?,?,?) ON CONFLICT(document_id) DO UPDATE SET sha256=excluded.sha256,approved_by=excluded.approved_by,approved_at=excluded.approved_at,evidence=excluded.evidence")
      .run(id, sha256, actor.id, new Date().toISOString(), `${evidence.trim()} · Estándar operativo 7/7 confirmado`);
    audit(actor.id, `document:${id}`, revoke ? "revoke" : "publish", "SUCCESS");
    database.exec("COMMIT");
  } catch (error) { database.exec("ROLLBACK"); throw error; }
}
