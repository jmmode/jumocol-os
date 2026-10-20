import "server-only";

import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { discoverLifeosDocuments, readSourceMarkdown } from "./lifeos-discovery";
import { extractHeadings, extractMetadata, extractTitle, type DocumentHeading } from "./markdown-metadata";

export type { DocumentHeading };
export type StaticDocumentId = "tiviplay-context" | "tiviplay-s0-contract" | "tiviplay-s0-baseline" | "tiviplay-cycle-close" | "tiviplay-operations-guide";
// Static canonical IDs plus IDs discovered (read-only) in LIFE-OS; every ID is resolved against an allowlist.
export type DocumentId = string;

export type CanonicalDocument = {
  id: DocumentId;
  title: string;
  identifier: string;
  version: string;
  status: string;
  cutoffDate: string;
  module: string;
  submodule: string;
  owner: string | null;
  governingDecision: string;
  sourceReference: string;
  sha256: string;
  markdown: string;
  headings: readonly DocumentHeading[];
};

const DOCUMENT_ALLOWLIST: Readonly<Record<StaticDocumentId, { relativePath: string }>> = {
  "tiviplay-s0-contract": { relativePath: "03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md" },
  "tiviplay-s0-baseline": { relativePath: "03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_PROCESO_OPERATIVO_ACTUAL_BASELINE_S0_2026-09-28.md" },
  "tiviplay-cycle-close": { relativePath: "03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CIERRE_CICLO_Y_REPETIBILIDAD_2026-09-30.md" },

  "tiviplay-operations-guide": { relativePath: "03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_GUIA_MODULO_OPERACIONES_V0_1.md" },

  "tiviplay-context": {
    relativePath:
      "03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md",
  },
};

async function locateAllowedDocument(relativePath: string): Promise<string> {
  const candidateRoots = [path.resolve(process.cwd(), "../.."), process.cwd()];

  for (const candidateRoot of candidateRoots) {
    const resolvedRoot = path.resolve(/* turbopackIgnore: true */ candidateRoot);
    const candidate = path.resolve(/* turbopackIgnore: true */ resolvedRoot, relativePath);

    if (!candidate.startsWith(`${resolvedRoot}${path.sep}`)) continue;

    try {
      const [physicalRoot, physicalDocument] = await Promise.all([
        realpath(/* turbopackIgnore: true */ resolvedRoot),
        realpath(/* turbopackIgnore: true */ candidate),
      ]);
      if (!physicalDocument.startsWith(`${physicalRoot}${path.sep}`)) continue;
      return physicalDocument;
    } catch {
      // Try the next fixed repository layout. No user-controlled path is accepted.
    }
  }

  throw new Error("El documento canónico permitido no está disponible.");
}

async function resolveSource(id: DocumentId): Promise<{ physicalPath: string; sourceReference: string; title?: string } | null> {
  if (Object.hasOwn(DOCUMENT_ALLOWLIST, id)) {
    const { relativePath } = DOCUMENT_ALLOWLIST[id as StaticDocumentId];
    return { physicalPath: await locateAllowedDocument(relativePath), sourceReference: relativePath };
  }
  const discovery = discoverLifeosDocuments();
  const found = discovery.documents.find((document) => document.id === id);
  if (!found) return null;
  // Re-validate the physical location at read time: the file must still live under the authorized root.
  const [physicalRoot, physicalDocument] = await Promise.all([
    realpath(/* turbopackIgnore: true */ discovery.root),
    realpath(/* turbopackIgnore: true */ found.physicalPath),
  ]);
  if (!physicalDocument.startsWith(`${physicalRoot}${path.sep}`)) return null;
  return { physicalPath: physicalDocument, sourceReference: found.sourceReference, title: found.title };
}

export async function readCanonicalDocument(id: DocumentId): Promise<CanonicalDocument> {
  const source = typeof id === "string" ? await resolveSource(id) : null;
  if (!source) throw new Error("Documento no permitido.");
  const markdown = source.physicalPath.toLowerCase().endsWith(".docx")
    ? readSourceMarkdown(source.physicalPath)
    : await readFile(/* turbopackIgnore: true */ source.physicalPath, "utf8");
  const title = source.title ?? extractTitle(markdown, "Documento canónico");
  const owner = extractMetadata(markdown, "Responsable", "Propietario", "Owner", "Autor");

  return {
    id,
    title,
    identifier: title.split(" - ")[0]?.trim() ?? "NO DOCUMENTADO",
    version: extractMetadata(markdown, "Versión", "Version"),
    status: extractMetadata(markdown, "Estado", "Status"),
    cutoffDate: extractMetadata(markdown, "Fecha de corte"),
    module: extractMetadata(markdown, "Módulo"),
    submodule: extractMetadata(markdown, "Submódulo"),
    owner: owner === "NO DOCUMENTADO" ? null : owner,
    governingDecision: extractMetadata(markdown, "Decisión gobernante"),
    sourceReference: source.sourceReference,
    sha256: createHash("sha256").update(markdown).digest("hex").toUpperCase(),
    markdown,
    headings: extractHeadings(markdown),
  };
}
