// Curaduría documental TiviPlay (revisión 2026-10-13). Solo metadatos: los originales de LIFE-OS no se copian ni se modifican.
// "VIGENTE Y APTO PARA OPERADOR" no se asigna aquí: solo existe cuando ADMIN publica una versión exacta con evidencia.

export const LIBRARY_SECTIONS = [
  "Servicio al cliente", "Cobros y facturación", "Servicio técnico", "Ventas", "Back Office", "Formación inicial",
] as const;
export type LibrarySection = (typeof LIBRARY_SECTIONS)[number];

export type CatalogStatus = "PENDIENTE_VALIDACION" | "HISTORICO" | "RESTRINGIDO" | "DUPLICADO_CONTRADICTORIO";
export const CATALOG_STATUS_LABEL: Readonly<Record<CatalogStatus | "VIGENTE_APTO", string>> = {
  VIGENTE_APTO: "VIGENTE Y APTO PARA OPERADOR",
  PENDIENTE_VALIDACION: "PENDIENTE DE VALIDACIÓN",
  HISTORICO: "HISTÓRICO / OBSOLETO",
  RESTRINGIDO: "RESTRINGIDO / ADMINISTRATIVO",
  DUPLICADO_CONTRADICTORIO: "DUPLICADO / CONTRADICTORIO",
};

export type Curation = { section: LibrarySection; status: CatalogStatus; reason: string; proposedCurrent?: boolean };

const P = (section: LibrarySection, reason: string, proposedCurrent = false): Curation => ({ section, status: "PENDIENTE_VALIDACION", reason, proposedCurrent });
const H = (section: LibrarySection, reason: string): Curation => ({ section, status: "HISTORICO", reason });
const R = (section: LibrarySection, reason: string): Curation => ({ section, status: "RESTRINGIDO", reason });
const D = (section: LibrarySection, reason: string): Curation => ({ section, status: "DUPLICADO_CONTRADICTORIO", reason });

const INSTALL_DECK = "Presentación de instalación: formato no legible en el visor; el Documento 5 cubre las instalaciones en texto. Validar vigencia de la app y del enlace.";
const PII_SHEET = "Copia local de planilla con datos de clientes o pagos. La fuente operativa es Google Sheets vía Runtime.";

/** Clave: ruta relativa a TIVIPLAY_OPERATION_SYSTEM, con "/". */
export const LIFEOS_CURATION: Readonly<Record<string, Curation>> = {
  // 05 · Operación y turnos
  "05_OPERACION_Y_TURNOS/Documento_7_Funciones_por_Turno_TIVIPLAY.docx": P("Servicio al cliente", "Versión más reciente (28/02/2026) de funciones por turno. No menciona Base Operativa ni Runtime; confirmar horario de recepción de líneas PM (2:00 PM) y planilla de pendientes vigente.", true),
  "05_OPERACION_Y_TURNOS/FUNCIONES POR TURNOS TIVIPLAY.pdf": H("Servicio al cliente", "Versión de diciembre de 2024 reemplazada por el Documento 7. Contradice el horario PM (3:40 PM frente a 2:00 PM)."),
  "05_OPERACION_Y_TURNOS/GUIÓN (Información del servicio) Cliente nuevo.docx": P("Ventas", "Guion de venta a cliente nuevo (11/2025). Confirmar tarifa vigente (15 USD + 6 USD por pantalla) y prueba gratuita.", true),
  "05_OPERACION_Y_TURNOS/TEXTO DE APOYO TIVIPLAY LATINO.docx": P("Servicio al cliente", "Textos de apoyo de chat (2023). Contenido genérico coherente con la Guía 2025; confirmar horarios y medios de pago actuales.", true),
  "05_OPERACION_Y_TURNOS/PROCESO_REACTIVACION_CLIENTES_TVPLAY.md": H("Ventas", "La lista de reactivación se construye desde la Base General, retirada del flujo actual. Las reglas (90 días, cuenta como venta) deben trasladarse a la Base Operativa antes de publicarse."),
  "05_OPERACION_Y_TURNOS/Mapa operaciones.png": H("Formación inicial", "Mapa genérico que incluye ciberseguridad y alquiler de dispositivos; no describe la operación actual de TiviPlay."),
  // 03 · Ventas y facturación
  "03_VENTAS_Y_FACTURACION/📆 MANUAL DE COBRO – TIVIPLAY.pdf": R("Cobros y facturación", "Plantillas de cobro con datos de pago de la empresa y cuenta bancaria personal. Requiere versión sin datos bancarios para operadores."),
  "03_VENTAS_Y_FACTURACION/APERTURA_MARZO_2026.pdf": R("Cobros y facturación", "Listado de clientes con teléfonos, correos y usuarios de servicio."),
  "03_VENTAS_Y_FACTURACION/FORMATO COMPROMISO VENTAS.docx": R("Ventas", "Compromiso individual de metas de un asesor."),
  "03_VENTAS_Y_FACTURACION/Formato_Compromiso_Ventas_Reestructurado.docx": R("Ventas", "Compromiso individual de metas de un asesor."),
  "03_VENTAS_Y_FACTURACION/FORMATO GESTION DIARIA FACTURACION (1).pdf": H("Back Office", "Formato de control diario de 2025 basado en la base de facturación mensual anterior. Confirmar si sigue en uso."),
  "03_VENTAS_Y_FACTURACION/FORMATO GESTION DIARIA VENTAS (1).pdf": H("Ventas", "Formato de control diario de ventas de 2025. Confirmar si sigue en uso."),
  "03_VENTAS_Y_FACTURACION/INSTRUCTIVO DE COBRO.docx": D("Cobros y facturación", "Instructivo de 2024: sus descuentos de retención (30 %) difieren de los Protocolos de retención (10 % → 30 %) y describe la planilla anterior."),
  "03_VENTAS_Y_FACTURACION/PROTOCOLOS DE RETENCION.docx": D("Cobros y facturación", "Protocolo de 2023 con política de descuentos distinta al Instructivo de cobro. Requiere decisión sobre la política vigente."),
  "03_VENTAS_Y_FACTURACION/Manual_Planillas_TIVIPLAY, colores .docx": H("Back Office", "Describe planillas 2025 y la Base General; estructura reemplazada por la Base Operativa y las capas financiera/servicio."),
  "03_VENTAS_Y_FACTURACION/FUENTE_GESTION_DIA_PAGOS_2026_TIVIPLAY.xlsx": R("Back Office", PII_SHEET),
  "03_VENTAS_Y_FACTURACION/GESTION_DIA_PAGOS_2026_TIVIPLAY (8).xlsx": R("Back Office", PII_SHEET),
  "03_VENTAS_Y_FACTURACION/PAGOS_01_02_JUNIO).xlsx": R("Back Office", PII_SHEET),
  "03_VENTAS_Y_FACTURACION/PLANILLA_PAGOS_JUNIO_2026.xlsx": R("Back Office", PII_SHEET),
  "03_VENTAS_Y_FACTURACION/VENTAS_MAYO_JUNIO_2026.xlsx": R("Ventas", PII_SHEET),
  // 06 · Calidad y auditoría
  "06_CALIDAD_Y_AUDITORIA/CRM_AUDITORIA_FUNCIONAL_v1.0.docx": D("Back Office", "Versión anterior de la especificación v1.1."),
  "06_CALIDAD_Y_AUDITORIA/CRM_AUDITORIA_FUNCIONAL_v1.1.docx": R("Back Office", "Especificación técnica del CRM (desarrollo y auditoría); no es manual de operador."),
  "06_CALIDAD_Y_AUDITORIA/Matriz de Calidad  2025.xlsx": R("Back Office", "Planilla de evaluación de calidad 2025; contenido no revisado a nivel de fila."),
  "06_CALIDAD_Y_AUDITORIA/Modelo de auditoría de llamadas Jumocol.pdf": P("Formación inicial", "Criterios con los que se audita la atención. Útil para formación; está en PDF (no legible en el visor) y debe confirmarse su vigencia 2026."),
  // 10 · Formación y capacitación
  "10_FORMACION_Y_CAPACITACION/Guía de Bienvenida – TIVIPLAY 2025.docx": P("Formación inicial", "Guía de bienvenida 2025: servicio, dispositivos, tarifas y medios de pago. Confirmar tarifas y medios vigentes en 2026.", true),
  "10_FORMACION_Y_CAPACITACION/Documento_5_Instructivo_Instalaciones_TIVIPLAY.docx": P("Servicio técnico", "Instructivo de instalaciones más reciente (28/02/2026), sin credenciales. Reemplaza Instalaciones escritas.", true),
  "10_FORMACION_Y_CAPACITACION/INSTALACIONES ESCRITAS TIVIPLAY.docx": R("Servicio técnico", "Contiene URL de servidor y usuario reales; contenido reemplazado por el Documento 5."),
  "10_FORMACION_Y_CAPACITACION/2) PROCESO DE CAPACITACIÓN.docx": H("Formación inicial", "Temario basado en planillas 2025 (Ventas, Pagos, Control diario 2025)."),
  "10_FORMACION_Y_CAPACITACION/3)Dispositivos-Mapa explicativo.docx": R("Servicio técnico", "Contiene URLs de lista y credenciales de ejemplo reales."),
  "10_FORMACION_Y_CAPACITACION/3)Dispositivos-Mapa explicativo.pdf": R("Servicio técnico", "Contiene URLs de lista y credenciales de ejemplo reales."),
  "10_FORMACION_Y_CAPACITACION/Cronograma_de_Integracion_Jorge_Call_Center_Actualizado (1).docx": R("Formación inicial", "Plan de integración individual de un colaborador."),
  "10_FORMACION_Y_CAPACITACION/MODELO DE CAPACITACIÓN - COORDINADOR DE OPERACIONES.docx": H("Formación inicial", "Corresponde a El Protector (monitoreo GPS), no a TiviPlay."),
  "10_FORMACION_Y_CAPACITACION/MODELO DE CAPACITACIÓN - DIRECTOR GENERAL.docx": H("Formación inicial", "Corresponde a El Protector (ejecutivo de ventas GPS), no a TiviPlay."),
  "10_FORMACION_Y_CAPACITACION/Trabajo en equipo.mp4": P("Formación inicial", "Video no revisado; formato no legible en el visor."),
  "10_FORMACION_Y_CAPACITACION/1) INSTALACIÓN CELULAR-TABLET ANDROID (XCIPTV).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/2) INSTALACIÓN CELULAR-TABLET ANDROID (SMARTERS) (Segunda opción).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/3) INSTALACIÓN FIRE SCTIK (XCIPTV).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/4) INSTALACIÓN FIRE SCTIK (SMARTERS) (Segunda opción).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/5) INSTALACIÓN IPAD-IPHONE (SMARTERS).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/6) INSTALACIÓN IPAD-IPHONE (GSE SMART IPTV) (Segunda opción paga).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/7) INSTALACIÓN TV SAMSUNG  (SMARTERS).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/8) INSTALACIÓN TV SAMSUNG NET IPTV (Segunda opción paga).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/9) INSTALACIÓN TV  LG (SMARTERS).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/10) INSTALACIÓN TV LG (SMART IPTV).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/11) INSTALACIÓN PC WINDOWS (SMARTERS).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/12) INSTALACIÓN TV ANDROID-CHROMECAST (XCIPTV).pptx": P("Servicio técnico", INSTALL_DECK),
  "10_FORMACION_Y_CAPACITACION/13) INSTALACIÓN CAJA ANDROID (SMARTERS).pptx": P("Servicio técnico", INSTALL_DECK),
  // 12 · Back Office
  "12_BACK_OFFICE/Documento_6_Instructivo de servicio tècnico_TIVIPLAY.docx": P("Servicio técnico", "Instructivo de servicio técnico más reciente (28/02/2026). Reemplaza el documento Servicio técnico.", true),
  "12_BACK_OFFICE/SERVICIO TÉCNICO.docx": D("Servicio técnico", "Versión anterior (12/2025) del instructivo; contenido reemplazado por el Documento 6."),
  "12_BACK_OFFICE/LINKS DE DESCARGA.docx": D("Servicio técnico", "Enlaces de 2024 ya incluidos en el Documento 5."),
  "12_BACK_OFFICE/CUENTAS AMAZON para (Fire stick).docx": R("Back Office", "Contiene cuentas y credenciales."),
  "12_BACK_OFFICE/Documento_1_Inventario_Correos_TIVIPLAY.docx": R("Back Office", "Inventario de correos con credenciales."),
  "12_BACK_OFFICE/Documento_3_Inventario_Cuentas_Amazon_TIVIPLAY.docx": R("Back Office", "Inventario de cuentas con credenciales."),
  "12_BACK_OFFICE/Documento_4_Inventario_Paneles_y_Resellers_TIVIPLAY.docx": R("Back Office", "Inventario de paneles y resellers con accesos."),
  "12_BACK_OFFICE/JUMOCOL_OS_TIVIPLAY_Procesos_Automatizacion_v1_2026-09-24.md": R("Back Office", "Documento técnico de automatización y gobierno interno."),
  "12_BACK_OFFICE/MANUAL_ELABORACION_PLANILLA_FACTURACION_MENSUAL_TIVIPLAY_V2_0.md": R("Back Office", "Manual Back Office clasificado como uso interno confidencial (capa de pagos y cierre)."),
  "12_BACK_OFFICE/PROTOCOLO_CIERRE_FASE_C_Y_PLANILLA_JULIO_AGOSTO_JORGE_GOMEZ_V1_1_2026-07 (1).md": R("Back Office", "Acuerdo operativo individual con bonificación."),
};

export function curationFor(relativePath: string): Curation | null {
  if (relativePath.startsWith("10_FORMACION_Y_CAPACITACION/HISTORICO_2022/")) return H("Servicio técnico", "Material 2022 (aplicación OTT y versiones duplicadas). No describe la operación actual.");
  if (/\.zip$/i.test(relativePath)) return D("Back Office", "Archivo comprimido que duplica una carpeta.");
  return LIFEOS_CURATION[relativePath.normalize("NFC")] ?? LIFEOS_CURATION[relativePath.normalize("NFD")] ?? null;
}

/** Estándar de manual operativo: un documento solo se publica si ADMIN confirma que cubre los 7 elementos. */
export const OPERATIONAL_STANDARD = [
  { key: "actividad", label: "Qué actividad realiza el asesor" },
  { key: "cuando", label: "Cuándo debe realizarla" },
  { key: "modulo", label: "En qué módulo o planilla trabaja" },
  { key: "informacion", label: "Qué información debe consultar" },
  { key: "accion", label: "Qué acción debe ejecutar" },
  { key: "evidencia", label: "Qué evidencia debe registrar" },
  { key: "escalamiento", label: "Cuándo debe escalar una excepción" },
] as const;
export const OPERATIONAL_STANDARD_KEYS: readonly string[] = OPERATIONAL_STANDARD.map(item => item.key);

// Originales en Google Drive (carpeta CAMPAÑA TIVIPLAY 1b2GbuslpQYQPjFQKj60bwgqk7mqJ9dcM), inventario leído el 2026-10-20.
// Correspondencia por nombre de archivo con la copia LIFE-OS; solo IDs públicos de Drive, nunca contenido. Permisos: los de Google.
const DRIVE_ORIGINALS: Readonly<Record<string, string>> = {
  "10_FORMACION_Y_CAPACITACION/Guía de Bienvenida – TIVIPLAY 2025.docx": "https://docs.google.com/document/d/19nsMvhrqKSCAiOiHg1m9B1W-M5TKAHFEPcDLQgL0mFc/view",
  "10_FORMACION_Y_CAPACITACION/2) PROCESO DE CAPACITACIÓN.docx": "https://docs.google.com/document/d/15N_uyP486GPE40RziJrOVf3z0jJkT-2ZHDJh6Ejgsfw/view",
  "05_OPERACION_Y_TURNOS/GUIÓN (Información del servicio) Cliente nuevo.docx": "https://drive.google.com/file/d/1iKqZqifZUyZ2VXb1Bnhc0I8NEsCnQHpw/view",
  "05_OPERACION_Y_TURNOS/TEXTO DE APOYO TIVIPLAY LATINO.docx": "https://drive.google.com/file/d/1uPJzV3ifD3STmdVgAU8sbaVWjh_TUXHp/view",
  "05_OPERACION_Y_TURNOS/FUNCIONES POR TURNOS TIVIPLAY.pdf": "https://drive.google.com/file/d/1nmcvG2tHSNK1IvNnqtcOJvFWTNF05Tg4/view",
  "03_VENTAS_Y_FACTURACION/INSTRUCTIVO DE COBRO.docx": "https://drive.google.com/file/d/1ufFwPUAK3AjQXZIiUFrJv_kMXwCPd8gs/view",
  "03_VENTAS_Y_FACTURACION/PROTOCOLOS DE RETENCION.docx": "https://drive.google.com/file/d/14ZdZ5f8rQlql24z24Lh3Ds4D9aKp0PW-/view",
  "12_BACK_OFFICE/SERVICIO TÉCNICO.docx": "https://drive.google.com/file/d/1wBiSCZzjPZTFBJNKGOf1sa1-fnpobDeD/view",
  "12_BACK_OFFICE/LINKS DE DESCARGA.docx": "https://drive.google.com/file/d/1g5qvJREpyEzERpahvy0srvOuvD2T8XNC/view",
  "10_FORMACION_Y_CAPACITACION/1) INSTALACIÓN CELULAR-TABLET ANDROID (XCIPTV).pptx": "https://drive.google.com/file/d/1l0MWsoPEIZXNh3j9JIbOML3sjIfEAA04/view",
  "10_FORMACION_Y_CAPACITACION/2) INSTALACIÓN CELULAR-TABLET ANDROID (SMARTERS) (Segunda opción).pptx": "https://drive.google.com/file/d/14JZiI6ug75mPkbNwh4G8TtIe1tdFJo-h/view",
  "10_FORMACION_Y_CAPACITACION/3) INSTALACIÓN FIRE SCTIK (XCIPTV).pptx": "https://drive.google.com/file/d/1s9xOvq64T4dKgeTEUgsruw-uxKINH1BJ/view",
  "10_FORMACION_Y_CAPACITACION/4) INSTALACIÓN FIRE SCTIK (SMARTERS) (Segunda opción).pptx": "https://drive.google.com/file/d/1k9madLmlQppXVjXAA9CzKgdsImTYtjlp/view",
  "10_FORMACION_Y_CAPACITACION/5) INSTALACIÓN IPAD-IPHONE (SMARTERS).pptx": "https://drive.google.com/file/d/15ZVKT0R4DqNlfZxlcioc6KPxyTqZERUH/view",
  "10_FORMACION_Y_CAPACITACION/6) INSTALACIÓN IPAD-IPHONE (GSE SMART IPTV) (Segunda opción paga).pptx": "https://drive.google.com/file/d/1fNja2bchLKRIdlzOQ9NNqlBpzHef3l5N/view",
  "10_FORMACION_Y_CAPACITACION/7) INSTALACIÓN TV SAMSUNG  (SMARTERS).pptx": "https://drive.google.com/file/d/1DnL5AO9yqyVGMjULzHREZB9b9NwEK2L1/view",
  "10_FORMACION_Y_CAPACITACION/8) INSTALACIÓN TV SAMSUNG NET IPTV (Segunda opción paga).pptx": "https://drive.google.com/file/d/1qdESmrGZtg2BCrRBBvyLBzVy8l_nGJ8M/view",
  "10_FORMACION_Y_CAPACITACION/9) INSTALACIÓN TV  LG (SMARTERS).pptx": "https://drive.google.com/file/d/1Nxz0AKAUBx0V7DFDceqa673o77-PRn2e/view",
  "10_FORMACION_Y_CAPACITACION/10) INSTALACIÓN TV LG (SMART IPTV).pptx": "https://drive.google.com/file/d/1jZvxp_aAbbuQaCUyS04F8OpPkIyHJ2ig/view",
  "10_FORMACION_Y_CAPACITACION/11) INSTALACIÓN PC WINDOWS (SMARTERS).pptx": "https://drive.google.com/file/d/12FI537tZIV4N2PD0x1NVvtn5WQ_YZVY4/view",
  "10_FORMACION_Y_CAPACITACION/12) INSTALACIÓN TV ANDROID-CHROMECAST (XCIPTV).pptx": "https://drive.google.com/file/d/1DcvOVvuSJW-wNqD3XAiMtBIDVuQfASfk/view",
  "10_FORMACION_Y_CAPACITACION/13) INSTALACIÓN CAJA ANDROID (SMARTERS).pptx": "https://drive.google.com/file/d/13l4KKZgy0T3eahfPXDXhSAuMPcOscrVn/view",
};
// Excluidos deliberadamente (restringidos, sin enlace para nadie): CUENTAS AMAZON para (Fire stick), 3)Dispositivos-Mapa (Doc y PDF),
// INSTALACIONES ESCRITAS, Incentivos OP Diciembre.pdf, Política de Incentivos.
// Solo en Drive, sin copia LIFE-OS (pendientes de decisión, no publicados): 1) PRESENTACIÓN TIVIPLAY.pptx, Información general del Servicio TIVIPLAY 2024.pdf.

const DRIVE_URL = /^https:\/\/(drive|docs)\.google\.com\/(file|document|presentation|spreadsheets)\/d\/[A-Za-z0-9_-]{20,}\/view$/;
/** Enlace al original en Google Drive (WO-TIVI-DOC-001). Nunca para documentos restringidos; Google aplica sus propios permisos. */
export function driveUrlFor(relativePath: string): string | null {
  const key = relativePath.normalize("NFC");
  const url = DRIVE_ORIGINALS[key] ?? DRIVE_ORIGINALS[relativePath.normalize("NFD")] ?? null;
  if (!url || !DRIVE_URL.test(url) || curationFor(relativePath)?.status === "RESTRINGIDO") return null;
  return url;
}
export const DRIVE_ORIGINAL_PATHS: readonly string[] = Object.keys(DRIVE_ORIGINALS);
