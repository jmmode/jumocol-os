// Contrato de la PLANILLA OPERATIVA del asesor (PAGOS <MES>).
//
// Comparación con PAGOS OCTUBRE 2026 (fila 3, A..AM):
//   A..P iguales a octubre (TC … F.VENCIMIENTO).
//   Q  octubre: F.ULTIMO PAGO      → ahora DISPOSITIVOS (pedido de Dirección, 01/11/2026).
//   R  octubre: F. PRÓXIMO PAGO    → ahora F.ULTIMO PAGO  (se desplaza una columna, no se pierde).
//   S  octubre: T                  → ahora F. PRÓXIMO PAGO.
//   T  octubre: REFERIDO           → ahora T. REFERIDO sale de la hoja del asesor (no es dato de gestión).
//   U  octubre: DISPOSITIVOS       → ahora ID (identificador técnico del panel; vacío si no es inequívoco).
//   V..AM de octubre (ORIGEN BASE, CONFIRMACION, columnas financieras, gate, propuestas): fuera de la hoja.
//
// La hoja solo tiene título, resumen, encabezado, bloques semanales con su total y el total mensual.
// CONFIRMADO JM no existe en esta hoja: la confirmación vive en las hojas de pagos y solo la escribe Dirección.

export const OPERATIVE_HEADERS = Object.freeze([
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "DISPOSITIVOS", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "ID",
]);

export const OPERATIVE_WIDTH = OPERATIVE_HEADERS.length; // 21 → A..U
export const COL = Object.freeze(Object.fromEntries(OPERATIVE_HEADERS.map((h, i) => [h, i])));
export const PASSWORD_COL = COL["CONTRASEÑA"]; // N
export const DEVICES_COL = COL["DISPOSITIVOS"]; // Q
export const ID_COL = COL.ID; // U

// Comparación explícita con octubre, verificada por prueba (test/operative.test.mjs).
export const OCTOBER_HEADERS_A_U = Object.freeze([
  "TC", "CLIENTE", "TELEFONO", "CORREO", "ESTADO", "OBSERVACIONES", "PLAN ACTIVO", "PANTALLAS", "CELULAR", "USD", "COP",
  "MÉTODO DE PAGO", "USUARIO", "CONTRASEÑA", "PANEL", "F.VENCIMIENTO", "F.ULTIMO PAGO", "F. PRÓXIMO PAGO", "T", "REFERIDO", "DISPOSITIVOS",
]);

// Fichas del universo que NO van a la hoja del asesor (pasan a excepciones con responsable).
export const OUT_OF_SHEET_CLASSES = Object.freeze(new Set(["PAGADO_SIN_PROPAGAR", "BLOQUEADO"]));

export const ROW_KIND = Object.freeze({ TITLE: "TITLE", SUMMARY: "SUMMARY", HEADER: "HEADER", WEEK: "WEEK", FICHA: "FICHA", WEEK_TOTAL: "WEEK_TOTAL", TOTAL: "TOTAL" });
