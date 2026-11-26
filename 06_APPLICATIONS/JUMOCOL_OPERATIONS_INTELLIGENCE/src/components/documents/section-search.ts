// Búsqueda por secciones de un documento Markdown de la biblioteca. Pura: sin E/S, usable en servidor y en pruebas.
// Las anclas siguen exactamente el mismo algoritmo que MarkdownDocument para que los enlaces «#sección» lleguen al título.

export function headingSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Asigna IDs únicos en orden de aparición: «x», «x-2», «x-3»… */
export function headingIdAllocator() {
  const seen = new Map<string, number>();
  return (label: string) => {
    const base = headingSlug(label);
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    return occurrence === 0 ? base : `${base}-${occurrence + 1}`;
  };
}

/** Sin tildes ni mayúsculas: «instalacion» encuentra «INSTALACIÓN». */
export function foldText(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es");
}

const STOPWORDS = new Set(["a", "al", "de", "del", "el", "en", "la", "las", "lo", "los", "me", "mi", "o", "para", "por", "que", "se", "su", "un", "una", "y", "con", "como", "es"]);

/** Términos significativos de la consulta; se exige que todos aparezcan (al inicio de palabra; números completos). */
export function queryTerms(query: string): string[] {
  const words = foldText(query).split(/[^a-z0-9&]+/).filter(Boolean);
  const terms = words.filter(word => !STOPWORDS.has(word));
  return [...new Set(terms.length ? terms : words)];
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function termPattern(term: string): RegExp {
  return /^\d+$/.test(term) ? new RegExp(`(^|[^0-9])${term}(?![0-9])`) : new RegExp(`(^|[^a-z0-9])${escape(term)}`);
}

export function matchesTerms(text: string, terms: readonly string[]): boolean {
  if (!terms.length) return true;
  const folded = foldText(text);
  return terms.every(term => termPattern(term).test(folded));
}

export type SectionMatch = { heading: string; anchor: string; snippet: string };
type Section = { heading: string; anchor: string; lines: string[] };

/** Divide el documento en secciones por título (niveles 2–4), ignorando «#» dentro de bloques de código. */
export function documentSections(markdown: string): Section[] {
  const allocate = headingIdAllocator();
  const sections: Section[] = [];
  let current: Section | null = null;
  let inFence = false;
  let sawContent = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^```/.test(line)) { inFence = !inFence; current?.lines.push(line); sawContent = true; continue; }
    const heading = !inFence && line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const label = heading[2].trim();
      // MarkdownDocument omite el H1 inicial (es el título de la página) y no le asigna ID.
      if (heading[1].length === 1 && !sawContent) { sawContent = true; continue; }
      current = { heading: label, anchor: allocate(label), lines: [] };
      sections.push(current);
      sawContent = true;
      continue;
    }
    if (line.trim()) sawContent = true;
    current?.lines.push(line);
  }
  return sections;
}

const plain = (line: string) => line.replace(/^```\w*$/, "").replace(/^\s*(?:[-*>]|\d+\.)\s+/, "").replace(/[`*|]/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();

function snippet(section: Section, terms: readonly string[]): string {
  const lines = section.lines.map(plain).filter(Boolean);
  const best = lines.find(line => terms.some(term => termPattern(term).test(foldText(line)))) ?? lines[0] ?? "";
  return best.length > 180 ? `${best.slice(0, 177)}…` : best;
}

/** Secciones donde aparecen todos los términos (en el título de la sección o en su contenido), en orden del documento. */
export function searchSections(markdown: string, query: string, limit = 4): SectionMatch[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  return documentSections(markdown)
    // La numeración del título («2.3») no cuenta como coincidencia: «Panel 2» no debe encontrar la sección 2.
    .filter(section => matchesTerms(`${section.heading.replace(/^\d+(?:\.\d+)*\.?\s+/, "")}\n${section.lines.join("\n")}`, terms))
    .slice(0, limit)
    .map(section => ({ heading: section.heading, anchor: section.anchor, snippet: snippet(section, terms) }));
}
