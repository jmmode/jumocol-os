import { describe, expect, it } from "vitest";

import {
  calculateClientStatus,
  monthFromText,
  normalizeCurrency,
  normalizeAdvisor,
  normalizeOrigin,
  normalizePanel,
  normalizePlan,
  normalizePaymentMethod,
  parseExcelDate,
  parseLocalizedAmount,
  sanitizeObservation,
} from "@/features/tiviplay-payments/normalization";

describe("normalización TiviPlay", () => {
  it("detecta meses con espacios, paréntesis y guiones bajos", () => {
    expect(monthFromText("PAGOS_FEBRERO")).toBe(2);
    expect(monthFromText("ZELLE (ENE)")).toBe(1);
    expect(monthFromText("PAGOS AGOSTO")).toBe(8);
  });

  it("normaliza fechas Excel y fechas de texto españolas", () => {
    expect(parseExcelDate(46023)).toBe("2026-01-01");
    expect(parseExcelDate("31/01/2026")).toBe("2026-01-31");
    expect(parseExcelDate("2026-02-02")).toBe("2026-02-02");
    expect(parseExcelDate("31/02/2026")).toBeNull();
  });

  it("normaliza montos locales sin mezclar monedas", () => {
    expect(parseLocalizedAmount("$ 1.234,56")).toBe(1234.56);
    expect(parseLocalizedAmount("4,655,750 COP")).toBe(4655750);
    expect(normalizeCurrency("dólares USD")).toBe("USD");
    expect(normalizeCurrency("pesos colombianos")).toBe("COP");
    expect(normalizeCurrency("CAD")).toBe("CAD");
  });

  it("normaliza alias de métodos de pago", () => {
    expect(normalizePaymentMethod(" western_u / bancolombia ")).toBe("Western Union / Bancolombia");
    expect(normalizePaymentMethod("PAY PAL")).toBe("PayPal");
    expect(normalizePaymentMethod("ZELLE ")).toBe("Zelle");
    expect(normalizePaymentMethod("INGRESO POR SEMANA")).toBe("Sin identificar");
    expect(normalizePaymentMethod("255400")).toBe("Sin identificar");
  });

  it("descarta etiquetas estructurales sin inferir dimensiones", () => {
    expect(normalizeAdvisor("Cancelar link pago por Zelle")).toBe("Sin identificar");
    expect(normalizeAdvisor("Jorge")).toBe("Jorge");
    expect(normalizePanel(new Date("2026-04-22T00:00:00Z"))).toBe("Sin identificar");
    expect(normalizePanel("PANEL 3")).toBe("Panel 3");
    expect(normalizePlan("TRANSACCIONES")).toBe("Sin identificar");
    expect(normalizePlan("Plan 6 meses")).toBe("Plan 6 meses");
    expect(normalizeOrigin("Links creados")).toBe("Sin identificar");
    expect(normalizeOrigin("PROMOCION")).toBe("Promoción");
  });

  it("calcula estados de vencimiento y conserva pendiente/desactivado", () => {
    expect(calculateClientStatus("2026-03-10", "2026-02-02", "", false)).toBe("Al día");
    // Regla aprobada 28/10/2026: > 5 Al día · 1–5 Por vencer · ≤ 0 Vencido.
    expect(calculateClientStatus("2026-02-20", "2026-02-02", "", false)).toBe("Al día");
    expect(calculateClientStatus("2026-02-08", "2026-02-02", "", false)).toBe("Al día");
    expect(calculateClientStatus("2026-02-07", "2026-02-02", "", false)).toBe("Por vencer");
    expect(calculateClientStatus("2026-02-03", "2026-02-02", "", false)).toBe("Por vencer");
    expect(calculateClientStatus("2026-02-02", "2026-02-02", "", false)).toBe("Vencido");
    expect(calculateClientStatus("2026-01-31", "2026-02-02", "", false)).toBe("Vencido");
    expect(calculateClientStatus("2026-01-31", "2026-02-02", "", true)).toBe("Al día");
    expect(calculateClientStatus(null, "2026-02-02", "pendiente de pago")).toBe("Pendiente de pago");
    expect(calculateClientStatus(null, "2026-02-02", "desactivado")).toBe("Desactivado");
  });

  it("sanea enlaces, teléfonos, correos y claves en observaciones", () => {
    const sanitized = sanitizeObservation("Correo ana@example.com tel +57 300 123 4567 https://example.com clave: secreta");
    expect(sanitized).not.toContain("ana@example.com");
    expect(sanitized).not.toContain("300 123 4567");
    expect(sanitized).not.toContain("https://");
    expect(sanitized).not.toContain("secreta");
  });
});
