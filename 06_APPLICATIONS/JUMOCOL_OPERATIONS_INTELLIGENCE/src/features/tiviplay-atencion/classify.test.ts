import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { classifyMessage, scriptOf } from "@/features/tiviplay-atencion/classify";
import { parseFichas } from "@/features/tiviplay-atencion/fichas";

const fichas = parseFichas(fs.readFileSync(path.resolve(__dirname, "../../../../../03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_FICHAS_ATENCION_V1.md"), "utf8"));
const ids = (text: string) => classifyMessage(fichas, text).suggestions.map((s) => s.ficha.id);

describe("clasificación A/B/C sobre las 24 fichas canónicas", () => {
  it("lee las 24 fichas y cada una tiene respuesta copiable", () => {
    expect(fichas).toHaveLength(24);
    expect(fichas.filter((f) => !scriptOf(f)).map((f) => f.id)).toEqual([]);
  });
  it.each([
    ["Se me borró la app del Firestick", "C1"],
    ["no tengo internet, se congela todo", "C2"],
    ["tengo AT&T y no carga", "C5"],
    ["me sale cuenta vencida", "C6"],
    ["el canal de ESPN sin audio", "C7"],
    ["ya pagué, te envío el comprobante", "A2"],
    ["quiero renovar otro mes", "B2"],
  ])("«%s» → %s", (text, ficha) => {
    expect(ids(text)).toContain(ficha);
  });
  it("muestra alternativas ante ambigüedad", () => {
    const r = classifyMessage(fichas, "ya pagué pero me sale suscripción vencida");
    expect(r.ambiguous).toBe(true);
    expect(r.suggestions.map((s) => s.ficha.id)).toEqual(expect.arrayContaining(["C6", "A2"]));
  });
});
