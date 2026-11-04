// Fichas de atención TiviPlay. Puro: sin E/S, usable en servidor y en pruebas.
// La fuente es el Markdown canónico publicado por ADMIN: aquí solo se interpreta, no se guarda contenido.
import { matchesTerms, queryTerms } from "@/components/documents/section-search";

export const FICHAS_DOCUMENT_ID = "tiviplay-fichas-atencion";

export const ATENCION_CATEGORIES = [
  { key: "A", label: "Financiera", hint: "Cobros, comprobantes, confirmación de pagos, compromisos, facturación y excepciones." },
  { key: "B", label: "Servicio", hint: "Ventas, renovaciones, reactivaciones, activaciones, cambio de plan, referidos y contenido." },
  { key: "C", label: "Soporte técnico", hint: "Instalación, conectividad, acceso, vencimiento, canales, panel y escalamiento." },
] as const;
export type AtencionCategory = (typeof ATENCION_CATEGORIES)[number]["key"];

export type Ficha = {
  id: string;
  title: string;
  category: AtencionCategory;
  categoryLabel: string;
  motive: string;
  validation: string;
  keywords: string;
  reclassify: string[];
  /** Cuerpo Markdown sin la metadata: lo presenta MarkdownDocument, con su botón Copiar. */
  body: string;
};

const HEADING = /^## ([ABC]\d{1,2}) · (.+)$/;
const META = /^- \*\*([^*]+):\*\* (.*)$/;

/** Una ficha empieza en «## A1 · Título» y termina en la siguiente; lo demás del documento no es ficha. */
export function parseFichas(markdown: string): Ficha[] {
  const fichas: Ficha[] = [];
  let lines: string[] | null = null;
  const close = (id: string, title: string, block: string[]) => {
    const meta = new Map<string, string>();
    const body = block.filter(line => {
      const match = line.match(META);
      if (!match) return true;
      meta.set(match[1], match[2].trim());
      return false;
    });
    fichas.push({
      id, title, category: id[0] as AtencionCategory,
      categoryLabel: meta.get("Categoría") ?? "NO DOCUMENTADO",
      motive: meta.get("Motivo") ?? "NO DOCUMENTADO",
      validation: meta.get("Estado de validación") ?? "NO DOCUMENTADO",
      keywords: meta.get("Palabras clave") ?? "",
      reclassify: (meta.get("Reclasificar a") ?? "").split(",").map(x => x.trim()).filter(Boolean),
      body: body.join("\n").trim(),
    });
  };
  let current: { id: string; title: string } | null = null;
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(HEADING);
    if (heading || /^## /.test(line)) {
      if (current && lines) close(current.id, current.title, lines);
      current = heading ? { id: heading[1], title: heading[2].trim() } : null;
      lines = heading ? [] : null;
      continue;
    }
    lines?.push(line);
  }
  if (current && lines) close(current.id, current.title, lines);
  return fichas;
}

/** Todos los términos deben aparecer; las palabras clave y el título pesan más que el cuerpo. */
export function searchFichas(fichas: readonly Ficha[], query: string): Ficha[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const strong = (f: Ficha) => `${f.title}\n${f.motive}\n${f.keywords}`;
  return fichas
    .filter(f => matchesTerms(`${strong(f)}\n${f.body}`, terms))
    .sort((a, b) => Number(matchesTerms(strong(b), terms)) - Number(matchesTerms(strong(a), terms)));
}
