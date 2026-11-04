import { describe, expect, it } from "vitest";

import { buildRuntimeReadModel } from "./runtime-read-model";
import { buildClientDirectory, buildWorkday } from "./workday-model";
import { baseGeneralGestionHeadersValid } from "./sheet-columns";

// Contrato de BASE GENERAL!A2:AR2, comprobado en vivo el 2026-11-04.
// Las filas son sintéticas; nunca se consulta ni escribe un cliente real en estos tests.
const BASE_HEADER = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO",
  "OBSERVACIONES GESTION", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "ID", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO",
  "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO", "DISPOSITIVOS",
  "OBSERVACIONES ASESOR", "CUMPLEAÑOS ", "TIPO_SERVICIO", "CODIGO_CANONICO",
  "VALOR_CANONICO", "DURACION_MESES", "CICLO_ANTERIOR_TEORICO",
  "DESFASE_PAGO_DIAS", "RELACION_PAGO_CICLO", "F_PROXIMO_SI_ANCLARA_PAGO",
  "DIF_DIAS_CICLO_VS_PAGO", "CLIENTE_KEY", "BASE_VENCIMIENTO_ANT",
  "BASE_ULT_PAGO_ANT", "BASE_PROX_PAGO_ANT", "CREDITO_CONTROL_OCT",
  "VENCIMIENTO_CONTROL_OCT", "CONFIRMACION_OCT", "FECHA_PAGO_OCT",
  "PROX_PAGO_PROP_OCT", "ESTADO_SYNC_OCT", "CONCILIACION_SERVICIO_27OCT",
];
const MONTH_HEADER = [
  "TC", "CLIENTE", "ESTADO", "OBSERVACIONES GESTION", "USD", "MÉTODO DE PAGO",
  "USUARIO", "F. PRÓXIMO PAGO", "ORIGEN BASE", "OBSERVACIONES ASESOR",
  "CONFIRMACION", "CLASIFICACION_BORRADOR", "ESTADO_COBRO",
];
const record = (h: string[], f: Record<string, string>) => h.map((k) => f[k] ?? "");

describe("BASE GENERAL: contrato de gestión F y observación libre W", () => {
  it("valida las posiciones originales y desplazadas y rechaza un mapeo anterior", () => {
    expect(BASE_HEADER).toHaveLength(44);
    expect(baseGeneralGestionHeadersValid(BASE_HEADER)).toBe(true);
    const old = [...BASE_HEADER];
    old[22] = "CUMPLEAÑOS ";
    old[33] = "BASE_VENCIMIENTO_ANT";
    expect(baseGeneralGestionHeadersValid(old)).toBe(false);
    const badF = [...BASE_HEADER]; badF[5] = "OBSERVACIONES";
    expect(baseGeneralGestionHeadersValid(badF)).toBe(false);
  });

  it("lee F y W de BASE por encabezado y mantiene independientes las observaciones mensuales", () => {
    const base = [
      ["", "BASE GENERAL"], BASE_HEADER, [""],
      record(BASE_HEADER, {
        TC: "1", CLIENTE: "Persona de Ensayo", ESTADO: "Por vencer", USUARIO: "PRUEBA1",
        "F. PRÓXIMO PAGO": "05-11-26", "F.ULTIMO PAGO": "05-10-26", T: "1",
        "OBSERVACIONES GESTION": "Registro heredado, no estructurado",
        "OBSERVACIONES ASESOR": "Comentario libre de BASE",
        CLIENTE_KEY: "PERSONA DE ENSAYO", "MÉTODO DE PAGO": "ZELLE", USD: "15",
      }),
    ];
    const cartera = [
      ["", "PAGOS NOVIEMBRE 2026"], [""], MONTH_HEADER, [""],
      record(MONTH_HEADER, {
        TC: "1", CLIENTE: "Persona de Ensayo", ESTADO: "Por vencer", USUARIO: "PRUEBA1",
        "F. PRÓXIMO PAGO": "05-11-26", USD: "15", "MÉTODO DE PAGO": "ZELLE",
        "ORIGEN BASE": "BASE GENERAL!4",
        "OBSERVACIONES GESTION": "04/11 · Mensaje enviado",
        "OBSERVACIONES ASESOR": "Comentario libre del mes",
        CONFIRMACION: "PENDIENTE CONFIRMACIÓN", CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE",
      }),
    ];
    const values = { "BASE GENERAL": base, "PAGOS NOVIEMBRE 2026": cartera };
    const sheets = Object.keys(values).map((title) => ({ title }));
    const model = buildRuntimeReadModel({ values, sheets, today: "2026-11-04" });
    const client = model.clientIndex.find((x) => x.name === "Persona de Ensayo");
    expect(client?.gestionObservation).toBe("Registro heredado, no estructurado");
    expect(client?.advisorObservation).toBe("Comentario libre de BASE");
    const directory = buildClientDirectory(values, ["BASE GENERAL", "PAGOS NOVIEMBRE 2026"]);
    expect(directory).toHaveLength(1);
    expect(directory[0].baseGestionObservation).toBe("Registro heredado, no estructurado");
    expect(directory[0].baseAdvisorObservation).toBe("Comentario libre de BASE");
    const workday = buildWorkday({ model, directory, credits: null });
    const item = workday.queue[0];
    expect(item.gestionObservation).toBe("04/11 · Mensaje enviado");
    expect(item.advisorObservation).toBe("Comentario libre del mes");
    expect(item.paymentConfirmation).toBe("PENDIENTE CONFIRMACIÓN");
    expect(item.collectionStatus).toBe("PENDIENTE");
    expect(item.nextAction).toBe("Cobro programado");
  });
});
