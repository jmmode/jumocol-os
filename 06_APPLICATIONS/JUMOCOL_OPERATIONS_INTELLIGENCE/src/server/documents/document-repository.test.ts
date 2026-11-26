import { describe, expect, it } from "vitest";

import { readCanonicalDocument } from "@/server/documents/document-repository";

describe("Document Repository", () => {
  it("reads the allowlisted TiviPlay context without exposing a physical path", async () => {
    const document = await readCanonicalDocument("tiviplay-context");

    expect(document.identifier).toBe("JUM-OI-OPS-TIVI-001");
    expect(document.status).toBe("DRAFT — IN REVIEW");
    expect(document.sourceReference).toBe(
      "03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md",
    );
    expect(document.sourceReference).not.toMatch(/^[A-Za-z]:/);
    expect(document.headings.some((heading) => heading.label.includes("Tabla de evidencias"))).toBe(true);
  });
});

