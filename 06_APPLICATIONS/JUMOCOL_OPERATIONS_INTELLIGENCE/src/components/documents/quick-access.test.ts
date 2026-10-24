import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveQuickAccess } from "./quick-access";

const GUIDE = path.resolve(__dirname, "../../../../../03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_GUIA_RAPIDA_ATENCION_Y_SOPORTE_V1.md");

describe("Búsqueda rápida → sección exacta de la Guía rápida de turno", () => {
  const md = readFileSync(GUIDE, "utf8");
  const quick = resolveQuickAccess(md);

  it("resolves all 8 quick accesses to a real section anchor", () => {
    expect(quick.map((q) => [q.label, q.heading])).toEqual([
      ["Se cayó el panel", "2.1 Caída de panel"],
      ["Mensaje de espera", "3.2 Mensaje de espera mientras verificas"],
      ["Recibí comprobante", "3.3 Recepción de comprobante"],
      ["Cierre de gestión", "3.5 Cierre de gestión"],
      ["Downloader", "6. Fire Stick → Downloader → código TiviPlay"],
      ["Smarters", "4. Reproductores y configuración por dispositivo"],
      ["URL servidor", "5. URL de configuración por panel"],
      ["AT&T", "7. Información que todavía requiere evidencia"],
    ]);
    expect(quick[0].href).toBe("/operaciones/tiviplay/manuales/tiviplay-guia-rapida-turno#2-1-caida-de-panel");
  });

  it("each destination section carries the expected usable content", () => {
    const section = (heading: string) => { const i = md.indexOf(heading); return md.slice(i, md.indexOf("\n## ", i + 4) > 0 ? md.indexOf("\n## ", i + 4) : undefined); };
    expect(section("### 2.1 Caída de panel")).toMatch(/```mensaje/);
    expect(md.slice(md.indexOf("### 2.1"), md.indexOf("## 3."))).toMatch(/2\.5 Seguimiento[\s\S]*2\.6 Servicio normalizado[\s\S]*2\.7 Cuándo escalar/);
    expect(section("### 3.3 Recepción de comprobante")).toMatch(/registrado para validación/);
    const receipt = section("### 3.3 Recepción de comprobante").match(/```mensaje\n([\s\S]*?)```/)![1];
    expect(receipt).toMatch(/Recibimos tu comprobante/);
    expect(receipt).not.toMatch(/pago (ha sido |está )?(confirmado|exitoso)/i);
    expect(section("## 6. Fire Stick")).toMatch(/```mensaje\n2865004\n```/);
    expect(section("## 6. Fire Stick")).toMatch(/VALIDADO COMO REFERENCIA OPERACIONAL/);
    expect(section("## 5. URL de configuración")).toMatch(/```endpoints 1[\s\S]*```endpoints 2[\s\S]*```endpoints 3/);
    expect(section("## 7. Información")).toMatch(/AT&T[^\n]*REQUIERE EVIDENCIA[^\n]*Escalar el caso a Dirección/);
  });

  it("gives no link when the guide is not visible for the role (publication is never bypassed)", () => {
    expect(resolveQuickAccess(null).every((q) => q.href === null)).toBe(true);
  });
});
