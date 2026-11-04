import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ATENCION_CATEGORIES, parseFichas, searchFichas } from "./fichas";

const source = readFileSync(path.resolve(process.cwd(), "../../03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_FICHAS_ATENCION_V1.md"), "utf8");
const fichas = parseFichas(source);
const byId = new Map(fichas.map(f => [f.id, f]));
const STATES = ["VALIDADO", "PENDIENTE DE VALIDACIÓN", "REQUIERE DECISIÓN"];
const scripts = (body: string) => [...body.matchAll(/```mensaje\r?\n([\s\S]*?)```/g)].map(m => m[1]);

describe("fichas de atención", () => {
  it("cubre las tres categorías y todos los motivos pedidos", () => {
    expect(ATENCION_CATEGORIES.map(c => fichas.filter(f => f.category === c.key).length)).toEqual([6, 8, 10]);
    for (const motive of ["Cobros", "Comprobantes", "Confirmación de pagos", "Compromisos", "Facturación", "Excepciones financieras",
      "Ventas", "Renovaciones", "Reactivaciones", "Activaciones", "Cambio de plan", "Referidos", "Solicitudes de contenido",
      "Aplicación eliminada o no instalada", "Problemas de conectividad", "Aplicación que no abre", "Caché y datos", "Credenciales o acceso",
      "Crédito o suscripción vencida", "Error de canal específico", "Fallas generales de canales", "Cambio de servidor o panel", "Escalamiento técnico"])
      expect(fichas.some(f => f.motive === motive), motive).toBe(true);
  });

  it("cada ficha trae los elementos del estándar, un solo script y reclasificación válida", () => {
    for (const f of fichas) {
      for (const section of ["Preguntas de diagnóstico", "Procedimiento", "Respuesta copiable", "Condiciones y advertencias", "Escalamiento", "Referencia documental"])
        expect(f.body, `${f.id}: ${section}`).toContain(`### ${section}`);
      expect(STATES, f.id).toContain(f.validation);
      expect(scripts(f.body), f.id).toHaveLength(1);
      expect(f.reclassify.length, f.id).toBeGreaterThan(0);
      for (const target of f.reclassify) expect(byId.has(target), `${f.id} → ${target}`).toBe(true);
      expect(f.body).not.toMatch(/\*\*Categoría:/);
    }
  });

  it("la búsqueda lleva cada solicitud a su ficha", () => {
    const cases: [string, string][] = [
      ["cliente eliminó la aplicación", "C1"], ["sin conexión", "C2"], ["mensaje de servicio expirado", "C6"], ["canal específico", "C7"],
      ["comprobante", "A2"], ["renovación", "B2"], ["referido", "B6"],
    ];
    for (const [query, id] of cases)
      expect(searchFichas(fichas, query)[0]?.id, query).toBe(id);
    expect(searchFichas(fichas, "   ")).toEqual([]);
  });

  it("una falla de canal no se trata como vencimiento y el expirado exige verificar la fecha", () => {
    expect(byId.get("C7")?.body).toContain("no es vencimiento del cliente");
    expect(byId.get("C6")?.body).toContain("No digas que el cliente está vencido antes de verificar la fecha");
    expect(byId.get("C6")?.reclassify).toEqual(expect.arrayContaining(["B2", "A3"]));
  });

  it("ningún script confirma pagos ni promete promociones", () => {
    for (const f of fichas) for (const script of scripts(f.body)) {
      expect(script, f.id).not.toMatch(/pago (ha sido |fue |est[aá] )?(exitoso|aprobado)|(pago|se) (ya )?(qued[oó] )?confirm(ado|amos)\b(?! cuando)/i);
      expect(script, f.id).not.toMatch(/mes gratis|gratis|\$|USD|descuento/i);
    }
    expect(byId.get("B6")?.validation).toBe("REQUIERE DECISIÓN");
  });

  it("el documento no contiene secretos, contactos, enlaces ni códigos históricos", () => {
    expect(source).not.toMatch(/https?:\/\/|bit\.ly|troypoint|www\./i);
    expect(source).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    expect(source).not.toMatch(/\b2865004\b|\+?\d{2,4}[ -]\d{3}[ -]\d{4}|\b\d{7,}\b/);
    expect(source).not.toMatch(/(contrase[nñ]a|password|clave|token|usuario)[ \t]*[:=][ \t]*\S{3,}/i);
    expect(source).not.toMatch(/WA-\d{3}/);
  });
});
