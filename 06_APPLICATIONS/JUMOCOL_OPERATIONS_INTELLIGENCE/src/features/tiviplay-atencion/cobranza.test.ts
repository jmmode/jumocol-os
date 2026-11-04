import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { cobranzaStage, parseCobranza } from "./cobranza";

const doc = readFileSync(path.resolve(process.cwd(), "../../03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_MENSAJES_COBRO_V1.md"), "utf8");
const today = "2026-11-10";
const stage = (next: string, method = "ZELLE") => cobranzaStage(next, today, method)?.key ?? null;

describe("etapas del manual de cobro", () => {
  it("elige la etapa por F. PRÓXIMO PAGO", () => {
    expect(stage("2026-11-30")).toBeNull();
    expect(stage("2026-11-15")).toBe("D-5");
    expect(stage("2026-11-12")).toBe("D-2 ZELLE");
    expect(stage("2026-11-12", "PayPal")).toBe("D-2 PAYPAL");
    expect(stage("2026-11-12", "Transferencia")).toBe("D-2 TRANSFERENCIA");
    expect(stage("2026-11-11")).toBe("D-1");
    expect(stage("2026-11-10")).toBe("D0");
    expect(stage("2026-11-01")).toBe("D+");
  });

  it("sin método confirmado no envía datos de pago", () => {
    expect(stage("2026-11-12", "")).toBe("D-5");
  });

  it("el documento trae un mensaje por etapa, sin datos de pago ni promociones", () => {
    const messages = parseCobranza(doc);
    expect(Object.keys(messages).sort()).toEqual(["D+", "D-1", "D-2 PAYPAL", "D-2 TRANSFERENCIA", "D-2 ZELLE", "D-5", "D0"].sort());
    for (const text of Object.values(messages)) {
      expect(text).not.toMatch(/GRATIS|Bancolombia|Jumocol Llc|Luis|paypal\.com|@|\d{6,}/i);
      expect(text).toMatch(/\[(NOMBRE|ASESOR)\]/);
    }
    for (const key of ["D-2 ZELLE", "D-2 PAYPAL", "D-2 TRANSFERENCIA"]) expect(messages[key]).toContain("[DATOS_PAGO]");
  });
});
