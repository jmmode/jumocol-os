import { describe, expect, it } from "vitest";

import { buildRuntimeReadModel } from "./runtime-read-model";
import { buildClientDirectory, buildWorkday, calculateReleaseAlert } from "./workday-model";
import { gestionHeadersValid, gestionNovemberHeadersValid } from "./gestion-sheets";

/** Contrato A:AQ verificado en el libro de noviembre de 2026. Solo datos sintéticos. */
const H = [
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO",
  "OBSERVACIONES GESTION", "PLAN ACTIVO", "PANTALLAS", "CELULAR",
  "USD", "COP", "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL",
  "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T",
  "REFERIDO", "DISPOSITIVOS", "ORIGEN BASE", "OBSERVACIONES ASESOR",
  "CONFIRMACION", "CLIENTE_KEY_PAGO", "COINCIDENCIAS_FINANCIERAS",
  "FUENTE_FINANCIERA", "FILA_FUENTE", "FECHA_PAGO", "MONEDA_PAGO",
  "VALOR_PAGO", "VALIDACION_TARIFA", "CONFIRMACION_FINANCIERA",
  "SEMANA", "CLASIFICACION_BORRADOR", "CATEGORIA", "CAUSA / ACCIÓN",
  "RESPONSABLE", "ID_BORRADOR", "ESTADO_COBRO", "FECHA_GESTION",
  "GESTIONADO_POR", "NOTA_EQUIPO",
];
const BH = ["TC", "CLIENTE", "USUARIO", "ESTADO", "PANEL", "F. PRÓXIMO PAGO"];
const ZH = ["TC", "Cliente", "Monto Recibido", "Fecha", "Asesor", "Origen", "Observación", "CONFIRMACION"];
const row = (header: string[], fields: Record<string, string>) => header.map((h) => fields[h] ?? "");

function scenario(withCurrentConfirmedPayment: boolean, advisorNote = "Consulta técnica pendiente") {
  const base = [
    ["", "BASE GENERAL"], BH, [""],
    row(BH, { TC: "1", CLIENTE: "Cliente Ficticio", USUARIO: "IDCLIENTE-001", ESTADO: "Vencido",
      PANEL: "PANEL 1", "F. PRÓXIMO PAGO": "02-11-26" }),
  ];
  const cartera = [
    ["", "PAGOS NOVIEMBRE 2026"], [""], H,
    row(H, {
      TC: "1", CLIENTE: "Cliente Ficticio", ESTADO: "Por vencer",
      "OBSERVACIONES GESTION": "04/11 · Jorge · RETENCION 2 · MENSAJE_ENVIADO",
      "OBSERVACIONES ASESOR": advisorNote,
      CONFIRMACION: "CONFIRMADO JM", // Esta X puede contener información arrastrada del ciclo anterior.
      CONFIRMACION_FINANCIERA: "CONFIRMADO JM",
      FUENTE_FINANCIERA: "ZELLE (OCT)", FILA_FUENTE: "12", FECHA_PAGO: "02-10-26",
      USD: "15", "MÉTODO DE PAGO": "ZELLE", USUARIO: "IDCLIENTE-001",
      "F. PRÓXIMO PAGO": "02-11-26", "ORIGEN BASE": "BASE GENERAL!4",
      CLASIFICACION_BORRADOR: "FACTURABLE", ESTADO_COBRO: "PENDIENTE",
    }),
  ];
  const zelle = [
    [], ["", "ZELLE NOVIEMBRE"], ZH,
    ...(withCurrentConfirmedPayment ? [row(ZH, {
      TC: "1", Cliente: "Cliente Ficticio", "Monto Recibido": "$15",
      Fecha: "02-11-26", Asesor: "Jorge", CONFIRMACION: "CONFIRMADO JM",
    })] : []),
  ];
  const values = {
    "BASE GENERAL": base, "PAGOS NOVIEMBRE 2026": cartera, "ZELLE (NOV)": zelle,
  };
  const sheets = Object.keys(values).map((title) => ({ title }));
  const model = buildRuntimeReadModel({ today: "2026-11-04", sheets, values });
  const directory = buildClientDirectory(values, ["BASE GENERAL", "PAGOS NOVIEMBRE 2026"]);
  return { model, workday: buildWorkday({ model, directory, credits: null }) };
}

describe("contrato de columnas TiviPlay noviembre 2026", () => {
  it("exige F, W, X, AG y AN exactamente antes de cualquier escritura de gestión", () => {
    expect(H).toHaveLength(43);
    expect(gestionHeadersValid(H)).toBe(true);
    expect(gestionNovemberHeadersValid(H)).toBe(true);
    for (const [index, wrong] of [[5, "OBSERVACIONES ASESOR"], [22, "CONFIRMACION"], [23, "OBSERVACIONES ASESOR"], [32, "CONFIRMACION"], [39, "CONFIRMACION"]] as const) {
      const swapped = [...H]; swapped[index] = wrong;
      expect(gestionNovemberHeadersValid(swapped)).toBe(false);
    }
  });

  it("distingue F estructurada, W libre, X, AG y AN sin mezclar los ciclos", () => {
    const { model, workday } = scenario(false, "NO RENOVAR (texto libre, no es acción financiera)");
    const it = model.operations.items[0];
    expect(it.gestionObservation).toContain("RETENCION 2");
    expect(it.advisorObservation).toContain("NO RENOVAR");
    expect(it.paymentConfirmation).toBe("CONFIRMADO JM");
    expect(it.priorCycleConfirmation).toBe("CONFIRMADO JM");
    expect(it.collectionStatus).toBe("PENDIENTE");
    expect(it.paymentSource).toBe("ZELLE (OCT)!12");
    expect(it.state).toBe("SIN_PAGO"); // X + AG no acreditan noviembre por sí solos.
    expect(workday.queue[0].paymentConfirmation).toBe("CONFIRMADO JM");
    expect(workday.queue[0].advisorObservation).toContain("NO RENOVAR");
    expect(workday.queue[0].confirmedMethodReference).toBeNull();
    expect(workday.queue[0].reason).not.toContain("POSIBLE NO RENOVACIÓN"); // W no altera reglas de F.
  });

  it("si hay CONFIRMADO JM en método de noviembre, detiene cobro normal sin reescribir X ni BASE", () => {
    const { model, workday } = scenario(true);
    expect(model.payments.month[0].confirmation).toBe("CONFIRMADO");
    expect(model.operations.items[0].state).toBe("SIN_PAGO"); // Persistencia sin escritura.
    expect(workday.queue[0].lane).toBe("VERIFICAR");
    expect(workday.queue[0].nextAction).toContain("NO COBRAR");
    expect(workday.queue[0].confirmedMethodReference).toBe("ZELLE (NOV)!4");
    expect(workday.toCollectToday.USD).toBe(0);
  });
  it("D0 y vencidos generan alerta para el asesor sin simular liberación", () => {
    const { model, workday } = scenario(false);
    expect(workday.releaseAlerts).toBe(1);
    expect(workday.queue[0].releaseAlert?.type).toBe("ALERTA_LIBERACION_LINEA");
    expect(workday.queue[0].releaseAlert?.owner).toBe("ASESOR_QUE_ATIENDE");
    expect(workday.queue[0].releaseAlert?.state).toBe("PENDIENTE_VERIFICACION_FINANCIERA"); // X histórico exige revisar ciclo.

    const synthetic = { ...model.operations.items[0], paymentConfirmation: "", priorCycleConfirmation: "" };
    const now = calculateReleaseAlert(synthetic, "2026-11-04", [], null, true);
    expect(now?.state).toBe("PENDIENTE_VERIFICAR_LIBERACION");
    expect(now?.daysOverdue).toBe(2);
    expect(calculateReleaseAlert(synthetic, "2026-11-01", [], null, true)).toBeNull(); // antes de D0 no alerta.
    expect(calculateReleaseAlert(synthetic, "2026-11-04", [], null, false)?.state).toBe("PENDIENTE_VERIFICACION_FINANCIERA");
  });

  it("un pago JM confirmado del mismo ciclo no genera alerta de liberación", () => {
    const { model, workday } = scenario(true);
    expect(model.payments.month).toHaveLength(1);
    expect(workday.releaseAlerts).toBe(0);
    expect(workday.queue[0].releaseAlert).toBeNull();
    expect(workday.queue[0].lane).toBe("VERIFICAR"); // Todavía falta conciliar cartera, nunca liberar.
  });

});
