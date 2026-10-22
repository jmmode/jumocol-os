import { describe, expect, it } from "vitest";
import { documentSections, matchesTerms, queryTerms, searchSections } from "./section-search";

const MD = `# Título

Intro.

## 2. Plantillas de incidencias

Búsquedas frecuentes: se cayó el panel, actualización de canales.

### 2.3 Actualización de canales

\`\`\`mensaje
# no es un título
Cierra la aplicación y vuelve a abrirla.
\`\`\`

## 3. Scripts

### 3.3 Recepción de comprobante

Recibimos tu comprobante y quedó registrado para validación.

## 5. URL por panel

| Panel 2 | REQUIERE EVIDENCIA |

## Repetido

## Repetido
`;

describe("section search", () => {
  it("drops stopwords and keeps numbers", () => {
    expect(queryTerms("se cayó el panel")).toEqual(["cayo", "panel"]);
    expect(queryTerms("Panel 2")).toEqual(["panel", "2"]);
  });
  it("matches accent-insensitively at word starts and whole numbers only", () => {
    expect(matchesTerms("Recibimos tu comprobante", queryTerms("recibí comprobante"))).toBe(true);
    expect(matchesTerms("Panel 12", queryTerms("Panel 2"))).toBe(false);
    expect(matchesTerms("Panel 2", queryTerms("panel 2"))).toBe(true);
  });
  it("uses the same anchors as the renderer and ignores # inside code fences", () => {
    expect(documentSections(MD).map(s => s.anchor)).toEqual(["2-plantillas-de-incidencias", "2-3-actualizacion-de-canales", "3-scripts", "3-3-recepcion-de-comprobante", "5-url-por-panel", "repetido", "repetido-2"]);
  });
  it("returns the sections with every term and a snippet", () => {
    expect(searchSections(MD, "se cayó el panel").map(s => s.anchor)).toEqual(["2-plantillas-de-incidencias"]);
    expect(searchSections(MD, "actualización canales").map(s => s.anchor)).toEqual(["2-plantillas-de-incidencias", "2-3-actualizacion-de-canales"]);
    const [hit] = searchSections(MD, "recibí comprobante");
    expect(hit.anchor).toBe("3-3-recepcion-de-comprobante");
    expect(hit.snippet).toMatch(/Recibimos tu comprobante/);
    expect(searchSections(MD, "Panel 2").map(s => s.anchor)).toEqual(["5-url-por-panel"]);
    expect(searchSections(MD, "")).toEqual([]);
  });
});
