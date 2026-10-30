// Contrato de la hoja BORRADOR del cierre mensual.
// Única superficie de escritura del motor: un título exacto por mes, rango fijo A1:AL<maxRows>.
// Cualquier otro título (BASE GENERAL, PAGOS <MES>, CONTROL, confirmaciones) se rechaza antes de llamar a la API.

export const DRAFT_TARGETS = Object.freeze({
  "2026-11": Object.freeze({
    title: "PAGOS NOVIEMBRE 2026 - BORRADOR",
    prefix: "NOV26",
    label: "NOVIEMBRE 2026",
    // Pagos que pueden mover el universo de noviembre: los de octubre (ya conciliados) y los del propio mes.
    paymentSheets: ["ZELLE (OCT)", "PAYPAL (OCT)", "TRANSF (OCT)", "ZELLE (NOV)", "PAYPAL (NOV)", "TRANSF (NOV)"],
  }),
});

export const DRAFT_COLUMNS = 38; // A..AL
export const DRAFT_LAST_COLUMN = "AL";
export const DRAFT_MAX_ROWS = 600;

// Encabezados de PAGOS OCTUBRE (A..AF) + columnas del borrador (AG..AL).
// C, D, F, I, N, T, U se dejan vacías a propósito (PII y CONTRASEÑA).
export const DRAFT_HEADERS = Object.freeze([
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO",
  "DISPOSITIVOS", "ORIGEN BASE", "CONFIRMACION", "CLIENTE_KEY_PAGO", "COINCIDENCIAS_FINANCIERAS", "FUENTE_FINANCIERA",
  "FILA_FUENTE", "FECHA_PAGO", "MONEDA_PAGO", "VALOR_PAGO", "VALIDACION_TARIFA", "CONFIRMACION_FINANCIERA",
  "SEMANA", "CLASIFICACION_BORRADOR", "CATEGORIA", "CAUSA / ACCIÓN", "RESPONSABLE", "ID_BORRADOR",
]);

// Celdas de metadatos (fila 2): corte, firma de contenido e id de la fila.
export const META_ROW = 2;
export const META_CUTOFF_COL = 35; // AJ
export const META_SIGNATURE_COL = 36; // AK
export const ID_COL = 37; // AL

// Columnas con datos personales: el diff nunca imprime su valor.
export const MASKED_COLUMNS = new Set([1, 12]); // B CLIENTE, M USUARIO
export const CARTERA_MASKED_COLUMNS = new Set([4, 5]); // sección cartera: E CLIENTE, F USUARIO

export function draftTarget(targetMonth) {
  const target = DRAFT_TARGETS[targetMonth];
  if (!target) throw new Error(`No hay hoja BORRADOR autorizada para ${targetMonth}`);
  return target;
}

export function assertAllowedDraftTitle(title) {
  const allowed = Object.values(DRAFT_TARGETS).map((t) => t.title);
  if (!allowed.includes(title)) {
    throw new Error(`Escritura rechazada: "${title}" no es una hoja BORRADOR autorizada`);
  }
  return title;
}

export function columnLetter(index) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
