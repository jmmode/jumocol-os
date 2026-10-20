# JUM-OI-OPS-TIVI-001 - Contexto Maestro de TiviPlay

**Versión:** 0.1  
**Estado:** DRAFT — IN REVIEW  
**Fecha de corte:** 2026-09-02  
**Módulo:** Operaciones  
**Submódulo:** TiviPlay  
**Decisión gobernante:** DEC-2026-09-02-010

## Regla de lectura y evidencia

Este documento organiza evidencia existente. No reemplaza Google Drive, Google Sheets ni los documentos fuente. Cada afirmación operacional se clasifica con uno de estos estados:

| Estado | Significado |
| --- | --- |
| `VALIDADO` | Existe evidencia documental o técnica localizada y vigente para el alcance declarado. |
| `PENDIENTE DE VALIDACIÓN` | Existe referencia o evidencia parcial, pero falta confirmar vigencia, ownership, operación real o alcance. |
| `CONTRADICTORIO` | Dos o más evidencias presentan estados, ubicaciones o reglas incompatibles. |
| `NO DOCUMENTADO` | No se encontró evidencia suficiente dentro del alcance revisado. |

Una implementación de lectura, un fixture o una vista no certifican que el proceso operacional representado se ejecute de extremo a extremo.

## 1. Identificación del submódulo

| Elemento | Definición | Estado | Evidencia |
| --- | --- | --- | --- |
| Sistema | `JUMOCOL Operations Intelligence` | `VALIDADO` | DEC-2026-09-02-010 |
| Nombre operativo abreviado | `JUMOCOL OS` | `VALIDADO` | DEC-2026-09-02-010 |
| Repositorio canónico | `JUMOCOL_SYSTEM_OS` | `VALIDADO` | DEC-2026-09-02-010 |
| Módulo | Operaciones | `VALIDADO` | DEC-2026-09-02-010 |
| Submódulo | TiviPlay | `VALIDADO` | DEC-2026-09-02-010 |
| Función en la evolución del sistema | Primer laboratorio y caso de uso real | `VALIDADO` | DEC-2026-09-02-010 |
| Owner formal del submódulo | No confirmado | `NO DOCUMENTADO` | RESPONSIBILITY_MATRIX.md y GAP_ANALYSIS_v0.1.md |

## 2. Propósito

`VALIDADO` — Consolidar el contexto documental conocido de TiviPlay para que las fuentes, procesos, entidades, reglas, controles, implementaciones y brechas puedan revisarse sin reconstruirlos desde conversaciones informales.

`VALIDADO` — El Markdown organiza contexto; `JUMOCOL Operations Intelligence` lo visualiza y controla dentro de su alcance. Ninguno sustituye automáticamente las fuentes oficiales iniciales en Google Drive y Google Sheets.

`PENDIENTE DE VALIDACIÓN` — Este borrador no se convierte en estándar operacional aprobado hasta completar revisión humana de fuentes, owners, reglas y contradicciones.

## 3. Alcance

| Dominio incluido | Alcance documental | Estado |
| --- | --- | --- |
| Contexto general | Identidad, propósito, decisiones, límites y fuentes | `VALIDADO` |
| Clientes y suscripciones | Entidades, atributos documentados y relaciones pendientes | `PENDIENTE DE VALIDACIÓN` |
| Ventas y activaciones | Fuentes observadas y dependencia con pagos/facturación | `PENDIENTE DE VALIDACIÓN` |
| Pagos y conciliación | Contrato, reglas, métricas e implementación de lectura | `VALIDADO` para el dashboard; E2E `PENDIENTE DE VALIDACIÓN` |
| Renovaciones, vencimientos y cartera | Campos y señales presentes en fuentes observadas | `PENDIENTE DE VALIDACIÓN` |
| Servicio al cliente y soporte | Campos de gestión y referencias documentales dispersas | `PENDIENTE DE VALIDACIÓN` |
| Calidad, retención y campañas | Políticas, protocolos y vista de marketing localizados | `PENDIENTE DE VALIDACIÓN` |
| Reportes, indicadores y proyecciones | Métricas documentadas del dashboard y campos operativos observados | Parcialmente `VALIDADO` |

## 4. Fuera de alcance

- `VALIDADO` — Implementar MCP, integraciones, skills, hooks, subagentes, plugins o automatizaciones.
- `VALIDADO` — Crear una base de datos, un CRM, una fuente paralela o un Write Model.
- `VALIDADO` — Escribir, corregir o agregar filas en Google Sheets.
- `VALIDADO` — Modificar código, fixtures o componentes visuales.
- `VALIDADO` — Incluir credenciales, tokens, datos personales o registros individuales de clientes.
- `VALIDADO` — Declarar vigentes políticas, responsables, fórmulas o procesos cuya evidencia requiera confirmación.
- `VALIDADO` — Certificar resultados financieros u operativos a partir de este Markdown.

## 5. Modelo operativo general

### 5.1 Frontera entre fuente, lectura y visualización

`VALIDADO` — La arquitectura gobernante separa las fuentes oficiales de la capa de lectura y de la intranet:

```text
Google Drive / Google Sheets
            ↓
Fuentes oficiales iniciales
            ↓
Read Model / adaptadores autorizados
            ↓
JUMOCOL Operations Intelligence
            ↓
Visualización / control / auditoría / proyección
```

`VALIDADO` — El snapshot Excel local usado por el dashboard de pagos es un adaptador privado de lectura. No reemplaza el Google Sheet autorizado.

### 5.2 Ciclo corporativo de cliente

`VALIDADO` — `JUM_OPS_STD_CLIENT_001` define para JUMOCOL el ciclo general:

```text
Lead
→ Diagnóstico
→ Cotización
→ Aceptación
→ Pago confirmado
→ Handoff
→ Proyecto
→ Onboarding
→ Ejecución
→ QA
→ Entrega
→ Cierre / Soporte
```

`PENDIENTE DE VALIDACIÓN` — No existe evidencia suficiente para afirmar que TiviPlay ejecuta actualmente todo este ciclo con los mismos estados, gates y contratos.

### 5.3 Corte funcional actualmente implementado

`VALIDADO` — El dashboard de pagos implementa una lectura local de este corte:

```text
Fuente de gestión de pagos
→ Adaptador server-side de solo lectura
→ Normalización por periodo, cliente seudonimizado y moneda
→ Conciliación exacta
→ Métricas y controles de calidad
→ Visualización y exportación saneada
```

`PENDIENTE DE VALIDACIÓN` — El flujo completo `Payment → Credit → Service → Reconciliation` no está certificado E2E.

## 6. Mapa de procesos

| Proceso | Evidencia disponible | Estado |
| --- | --- | --- |
| Marketing y campañas | Existe una ruta de TiviPlay Marketing basada exclusivamente en fixtures | `PENDIENTE DE VALIDACIÓN` |
| Captación y seguimiento comercial | `VENTAS 2026 (Tiviplay)` documenta prospectos, ventas y seguimiento | `PENDIENTE DE VALIDACIÓN` por vigencia y contrato E2E |
| Venta, activación y reactivación | La fuente de ventas contiene conceptos, estados, planes y fechas; reglas históricas están dispersas | `PENDIENTE DE VALIDACIÓN` |
| Facturación mensual | El dashboard reconoce familias de facturación y elegibilidad | `VALIDADO` para lectura analítica |
| Registro de pagos | El dashboard reconoce movimientos por método, fecha, moneda y evidencia | `VALIDADO` para lectura analítica |
| Conciliación | Emparejamiento exacto por cliente normalizado y periodo | `VALIDADO` para la implementación actual |
| Renovaciones y vencimientos | Fuentes observadas contienen fechas de vencimiento y próximo pago | `PENDIENTE DE VALIDACIÓN` |
| Cartera y pendientes | Existen campos de pendientes y saldo derivado; no se encontró proceso canónico de cartera | `PENDIENTE DE VALIDACIÓN` |
| Créditos de servicio | Existen controles documentados por panel | `VALIDADO` para lectura; operación real `PENDIENTE DE VALIDACIÓN` |
| Servicio al cliente y soporte | Gestión operativa registra casos y seguimiento; no existe SOP canónico consolidado en el repositorio | `PENDIENTE DE VALIDACIÓN` |
| Calidad y retención | Existen políticas, manuales y protocolos referenciados, con vigencia no confirmada | `PENDIENTE DE VALIDACIÓN` |
| Reporte y cierre operativo | `TIVIPLAY_FORMATO_GESTION_OPERATIVA` contiene gestión, apertura, cierre y resúmenes | `PENDIENTE DE VALIDACIÓN` por actualidad |
| Proyección | La intranet está definida como capa de proyección; no se encontró modelo predictivo aprobado | `NO DOCUMENTADO` |

## 7. Entidades principales y relaciones

### 7.1 Entidades documentadas

| Entidad | Evidencia de atributos | Estado |
| --- | --- | --- |
| Cliente | Identificador seudonimizado, estado, plan y periodo en el modelo de pagos | `VALIDADO` en dashboard |
| Suscripción o servicio | Plan, pantallas, panel, vencimiento y próximo pago | `VALIDADO` como atributos; contrato canónico `PENDIENTE DE VALIDACIÓN` |
| Lead o prospecto | Origen, gestión, estado y seguimiento en fuentes de ventas | `PENDIENTE DE VALIDACIÓN` |
| Venta o activación | Concepto, asesor/rol comercial, plan, valor, fecha y método en fuente observada | `PENDIENTE DE VALIDACIÓN` |
| Obligación de facturación | Cliente, periodo, moneda, elegibilidad y valor esperado | `VALIDADO` en modelo del dashboard |
| Pago | Método, monto, moneda, fecha, confirmación, conciliación y evidencia | `VALIDADO` en modelo del dashboard |
| Crédito de servicio | Panel, crédito, recarga, origen y fecha cuando existe | `VALIDADO` en modelo del dashboard |
| Caso de soporte | Cliente gestionado, caso resuelto, seguimiento y observación en fuente observada | `PENDIENTE DE VALIDACIÓN` |
| Campaña o actividad de marketing | Fuente, objetivo, canal, estado y próxima acción en fixture | `PENDIENTE DE VALIDACIÓN`; no es registro operacional |

### 7.2 Relaciones

| Relación | Estado | Observación |
| --- | --- | --- |
| Cliente → Suscripción | `PENDIENTE DE VALIDACIÓN` | No se documentó un ID canónico compartido entre todas las fuentes. |
| Lead → Venta | `PENDIENTE DE VALIDACIÓN` | Existe información comercial, pero falta contrato de transición. |
| Venta → Pago | `PENDIENTE DE VALIDACIÓN` | GAP_ANALYSIS reporta que la relación exacta no está formalizada. |
| Suscripción → Facturación mensual | `VALIDADO` para el modelo de lectura | Se organiza por cliente seudonimizado, periodo y moneda. |
| Pago → Facturación | `VALIDADO` para conciliación exacta | Coincidencias múltiples requieren revisión. |
| Pago → Crédito → Servicio | `PENDIENTE DE VALIDACIÓN` | `FLOW-TIVI-001` permanece `IN VALIDATION`. |
| Cliente → Soporte / Retención | `PENDIENTE DE VALIDACIÓN` | Existen señales en fuentes, no un contrato canónico. |

## 8. Inventario de fuentes oficiales

| Fuente | Tipo y función | Vigencia observada | Estado |
| --- | --- | --- | --- |
| Google Drive | Repositorio oficial inicial de documentos y archivos operativos | Decisión vigente al 2026-09-02 | `VALIDADO` como frontera oficial |
| Google Sheets | Fuentes tabulares oficiales iniciales | Decisión vigente al 2026-09-02 | `VALIDADO` como frontera oficial |
| `GESTION_DIA_PAGOS_2026_TIVIPLAY` | Google Sheet autorizado de facturación, pagos y controles de créditos | Evidencia documentada al 2026-08-30 | `VALIDADO` para dashboard de pagos |
| Snapshot privado de `GESTION_DIA_PAGOS_2026_TIVIPLAY` | Exportación Excel local de solo lectura | Verificado para el runtime del dashboard | `VALIDADO` como adaptador; no es fuente sustituta |
| `VENTAS 2026 (Tiviplay)` | Google Sheet de ventas, activaciones, renovaciones, pagos y seguimiento | Última observación documental 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| `TIVIPLAY_FORMATO_GESTION_OPERATIVA` | Google Sheet de gestión diaria, apertura, cierre y resúmenes | Última observación documental 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| `Horario_TiviPlay_Junio2026_v3_FINAL_APROBADO` | Archivo de horario para junio de 2026 | Fuente aprobada para ese periodo | `VALIDADO` histórico; no vigente para septiembre |
| Política de incentivos y condiciones para comisionar | Documentos referenciados en Drive/local | Fechas y versiones diferentes | `CONTRADICTORIO` en vigencia |
| Manuales, instructivos y protocolos de cobro/retención | Documentos referenciados por SOURCE_AUDIT | Cobertura histórica, sin versión canónica confirmada | `PENDIENTE DE VALIDACIÓN` |

## 9. Reglas operativas

| Regla | Ámbito | Estado | Evidencia |
| --- | --- | --- | --- |
| Un pago reportado o comprobante no equivale a pago confirmado | Estándar corporativo | `VALIDADO` | DEC-008 y JUM_OPS_STD_CLIENT_001 |
| No hay Handoff sin pago confirmado | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay proyecto/ejecución sin Handoff completo | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay producción sin Onboarding completo | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay entrega sin QA aprobado | Estándar corporativo | `VALIDADO` | DEC-008 |
| El estándar corporativo se aplica sin adaptación a toda operación TiviPlay | TiviPlay | `NO DOCUMENTADO` | Falta validación del modelo operativo específico |
| Las monedas permanecen separadas y no se convierten automáticamente | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Los duplicados probables no suman recaudo confirmado | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| La conciliación usa coincidencia exacta normalizada; no usa fuzzy matching | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Coincidencias múltiples pasan a revisión | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Créditos de servicio no se interpretan como dinero | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Datos personales se seudonimizan o enmascaran en la vista | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Reglas actuales de comisión, retención y reactivación | TiviPlay | `PENDIENTE DE VALIDACIÓN` | Versiones históricas y dispersas |

## 10. Roles, responsables y ownership

| Rol o responsabilidad requerida | Evidencia | Estado |
| --- | --- | --- |
| Owner formal del submódulo TiviPlay | No localizado | `NO DOCUMENTADO` |
| Owner de la fuente de ventas | No confirmado documentalmente | `PENDIENTE DE VALIDACIÓN` |
| Owner de gestión operativa | No confirmado formalmente | `PENDIENTE DE VALIDACIÓN` |
| Validador financiero de pagos | Requerido por el estándar, sin persona/rol formal confirmado para TiviPlay | `PENDIENTE DE VALIDACIÓN` |
| Responsable de conciliación y excepciones | Función necesaria en el dashboard, sin owner formal | `PENDIENTE DE VALIDACIÓN` |
| Operaciones | Receptor corporativo posterior al Handoff | `VALIDADO` como rol general; asignación TiviPlay pendiente |
| QA / aprobación de entrega | Requerido por el estándar corporativo | `VALIDADO` como gate; owner TiviPlay pendiente |
| Soporte / retención | Evidencia de actividad y protocolos históricos | `PENDIENTE DE VALIDACIÓN` |
| Aprobador de modificaciones sensibles | Revisión humana obligatoria, identidad no formalizada | `PENDIENTE DE VALIDACIÓN` |

No se registran nombres personales en este contexto maestro hasta que exista ownership formal, vigente y autorizado.

## 11. Indicadores y fórmulas conocidas

| Indicador | Fórmula o definición documental | Estado |
| --- | --- | --- |
| Recaudo confirmado | Suma por moneda de pagos con evidencia válida y criterios de confirmación del método | `VALIDADO` |
| Recaudo esperado | Suma por moneda de facturación elegible; excluye desactivados y gratuidades con evidencia | `VALIDADO` |
| Saldo pendiente | `max(0, recaudo_esperado - recaudo_confirmado)` por moneda | `VALIDADO` |
| Porcentaje de recaudo | `recaudo_confirmado / recaudo_esperado × 100` por moneda | `VALIDADO` |
| Número de pagos | Grupos únicos de pago confirmado; un movimiento multimoneda cuenta una vez | `VALIDADO` |
| Clientes únicos | Identificadores seudonimizados únicos con pago confirmado | `VALIDADO` |
| Ticket promedio | `recaudo_confirmado / grupos_de_pago` por moneda | `VALIDADO` |
| Tasa de comisión de método | `comision / valor_base_disponible` | `VALIDADO` para el método documentado |
| Conciliación | `pagos_con_una_coincidencia_mensual_exacta / pagos_candidatos` | `VALIDADO` |
| Créditos consumidos | Suma del campo de crédito en hojas de control; no representa dinero | `VALIDADO` |
| Cumplimiento diario | `promedio_recaudo_por_dia_activo / meta_central` | `VALIDADO` como fórmula; meta vigente no se incorpora |
| Tasa de contacto | Campo observado en gestión operativa; fórmula no localizada | `NO DOCUMENTADO` |
| Tasa de conversión | Campo observado en gestión operativa; fórmula no localizada | `NO DOCUMENTADO` |
| Retención, churn o cartera por antigüedad | No se encontró fórmula canónica | `NO DOCUMENTADO` |
| Proyección de recaudo o demanda | No se encontró modelo aprobado | `NO DOCUMENTADO` |

Las cifras operativas no se reproducen en este documento; deben consultarse en la fuente autorizada y según el corte aplicable.

## 12. Controles y aprobaciones humanas

| Control | Estado | Evidencia o pendiente |
| --- | --- | --- |
| Validación financiera antes de `payment_confirmed` | `VALIDADO` | DEC-008 y estándar operacional |
| Revisión de coincidencias múltiples o ambiguas | `VALIDADO` | Dashboard de pagos |
| Revisión de cobertura incompleta de una familia de fuente | `VALIDADO` | Dashboard de pagos no estima contenido ausente |
| Aprobación humana para modificaciones sensibles | `VALIDADO` | DEC-010 |
| Aprobación de Handoff, Onboarding y QA | `VALIDADO` como estándar general | Aplicación TiviPlay pendiente |
| Aprobación de actualización de una fuente local | `PENDIENTE DE VALIDACIÓN` | Existe procedimiento técnico; falta owner formal |
| Aprobación de reglas de comisión, calidad y retención | `PENDIENTE DE VALIDACIÓN` | Vigencia documental contradictoria o incompleta |
| Autorización de futuras escrituras | `NO DOCUMENTADO` | La escritura actual está prohibida |

## 13. Estado de flujos e implementaciones existentes

| Flujo o capacidad | Estado | Evidencia y límite |
| --- | --- | --- |
| Dashboard `/operaciones/tiviplay/pagos` | `VALIDADO` como implementación funcional de lectura | Ruta, adaptador, modelo, documentación y typecheck; no certifica operación E2E |
| `FLOW-TIVI-001` | `PENDIENTE DE VALIDACIÓN` con estado técnico `IN VALIDATION` | Flujo completo y suite de pruebas no certificados |
| TiviPlay Marketing | `PENDIENTE DE VALIDACIÓN` | Vista implementada con fixtures; no es fuente de verdad |
| `FLOW-LEAD-001` | `VALIDADO` para el flujo corporativo documentado | No demuestra adquisición o conversión específica de TiviPlay |
| Estados y gates del ciclo de cliente | `VALIDADO` como estándar y representación conceptual | Proyectos y handoffs reales no documentados |
| Read Model de leads | `VALIDADO` para Landing Page | Alcance TiviPlay no documentado |
| Write Model | `NO DOCUMENTADO` como capacidad activa | Permanece planeado y no autorizado |
| Captura WhatsApp o correo inbound para TiviPlay | `NO DOCUMENTADO` | No hay integración autorizada |
| Automatizaciones o agentes de TiviPlay | `NO DOCUMENTADO` | No implementados ni autorizados |

## 14. Restricciones técnicas y operativas

- `VALIDADO` — No escribir en Google Sheets desde la intranet en el alcance actual.
- `VALIDADO` — Mantener credenciales, archivos privados y PII fuera del navegador y del repositorio público.
- `VALIDADO` — No mezclar monedas ni inferir conversiones.
- `VALIDADO` — No utilizar matching difuso para atribuir pagos a clientes.
- `VALIDADO` — No presentar valores `null`, ceros o colecciones vacías como ausencia certificada de actividad externa.
- `VALIDADO` — No presentar fixtures como registros operacionales.
- `VALIDADO` — No crear agentes, hooks, plugins o automatizaciones antes de validar contexto, owners, entradas, salidas y excepciones.
- `VALIDADO` — No exponer la intranet con datos reales antes de autenticación y permisos aprobados.
- `PENDIENTE DE VALIDACIÓN` — Política de retención, acceso y revisión de información sensible de TiviPlay.

## 15. Decisiones vigentes

| Decisión | Aplicación al contexto | Estado |
| --- | --- | --- |
| DEC-2026-09-02-010 | Nomenclatura, calendario, TiviPlay como laboratorio, fuentes iniciales y revisión humana | `VALIDADO` |
| DEC-2026-08-26-008 | Estándar corporativo del ciclo de cliente y gates mínimos | `VALIDADO` |
| DEC-2026-08-26-004 | Vista de TiviPlay Marketing basada en fixtures | `VALIDADO` con límite explícito |
| DEC-2026-08-26-002 | Capa de aplicación canónica de la intranet | `VALIDADO` |
| DEC-2026-08-27-009 | Command Center técnico y fuente canónica JUM-OI-TECH-001 | `VALIDADO` |

## 16. Glosario

| Término | Definición | Estado |
| --- | --- | --- |
| Fuente oficial | Google Drive o Google Sheets autorizado que conserva la evidencia operacional inicial | `VALIDADO` |
| Snapshot local | Exportación privada usada por un adaptador de lectura; no reemplaza la fuente oficial | `VALIDADO` |
| Read Model | Lectura y transformación controlada sin mutar la fuente | `VALIDADO` |
| Write Model | Capa futura de comandos, validación, persistencia y auditoría | `NO DOCUMENTADO` como capacidad activa |
| Fixture | Dato local de demostración o representación visual, no evidencia operacional | `VALIDADO` |
| Pago reportado | Registro o comprobante pendiente de validación financiera | `VALIDADO` |
| Pago confirmado | Pago que cumple el procedimiento de validación aplicable | `VALIDADO` como concepto; procedimiento TiviPlay pendiente |
| Conciliación | Relación entre pago candidato y facturación mensual mediante reglas exactas | `VALIDADO` para dashboard |
| Crédito | Unidad de control de servicio; no se interpreta como moneda | `VALIDADO` |
| E2E | Flujo comprobado de extremo a extremo con evidencia reproducible | `VALIDADO` |
| Owner | Responsable formal de una fuente, proceso, decisión o aprobación | `VALIDADO` como concepto; asignaciones pendientes |

## 17. Mapa de los seis componentes futuros

| Componente | Función futura | Estado al 2026-09-02 | Límite actual |
| --- | --- | --- | --- |
| Contexto | Consolidar fuentes, procesos, reglas, ownership y brechas | `DRAFT — IN REVIEW` | Este documento es el único artefacto creado en esta fase |
| Integraciones / MCP | Acceso gobernado a fuentes autorizadas | `NO DOCUMENTADO` | No crear ni implementar todavía |
| Skills | Procedimientos reutilizables basados en reglas validadas | `NO DOCUMENTADO` | No crear antes de aprobar procesos y salidas |
| Hooks | Disparadores controlados de eventos o validaciones | `NO DOCUMENTADO` | No crear antes de contratos e idempotencia |
| Subagentes | Roles especializados con fuentes y permisos acotados | `NO DOCUMENTADO` | No crear antes de ownership y gates humanos |
| Plugin | Empaquetado futuro de capacidades aprobadas | `NO DOCUMENTADO` | No crear antes de estabilización y validación del laboratorio |

El orden futuro no implica autorización de implementación. Contexto debe aprobarse antes de evaluar los otros cinco componentes.

## 18. Brechas, contradicciones y pendientes de validación

| Hallazgo | Estado | Acción requerida |
| --- | --- | --- |
| No existe owner formal documentado para TiviPlay y sus fuentes | `NO DOCUMENTADO` | Confirmar owner, custodio y aprobador por proceso |
| `FLOW-TIVI-001` está `IN VALIDATION`, pero la representación visual puede conservar el estado anterior `PLANNED` | `CONTRADICTORIO` | Alinear código solo en una tarea autorizada posterior |
| Vitest no produjo un cierre exitoso y concluyente en la verificación del 2026-09-02 | `PENDIENTE DE VALIDACIÓN` | Diagnosticar y repetir pruebas sin elevar el flujo a `VALIDATED` |
| `01_CONTEXT/SOURCE_INVENTORY.md` permanece sin fuentes registradas mientras SOURCE_AUDIT sí identifica fuentes | `CONTRADICTORIO` | Definir si el inventario general debe actualizarse después de aprobar este contexto |
| Ventas y gestión operativa tienen última observación documental de junio de 2026 | `PENDIENTE DE VALIDACIÓN` | Confirmar vigencia y estructura al corte septiembre |
| El horario identificado es oficial para junio, no para septiembre | `PENDIENTE DE VALIDACIÓN` | Localizar la fuente oficial del periodo actual |
| Relación Venta → Pago → Comisión no formalizada | `NO DOCUMENTADO` | Definir contrato de salida y fuente canónica por transición |
| Cliente, suscripción, venta, pago, crédito y soporte no comparten IDs canónicos documentados | `NO DOCUMENTADO` | Validar identidad y relaciones antes de integrar fuentes |
| Políticas de incentivos y condiciones para comisionar tienen versiones y ubicaciones distintas | `CONTRADICTORIO` | Determinar versión canónica y aprobación vigente |
| Manuales de cobro, retención y soporte están referenciados, pero no tienen versión canónica confirmada en el repositorio | `PENDIENTE DE VALIDACIÓN` | Inventariar y validar sin duplicar fuentes |
| Fórmulas de contacto, conversión, retención, churn y proyección no están consolidadas | `NO DOCUMENTADO` | Validar definición, campos, periodo y owner |
| No existe política canónica de acceso y retención de datos TiviPlay en este repositorio | `NO DOCUMENTADO` | Definir governance antes de ampliar integraciones |
| Marketing TiviPlay se representa con fixtures | `PENDIENTE DE VALIDACIÓN` | No tratar la vista como ejecución o medición real |

## 19. Tabla de evidencias y referencias

| Elemento | Evidencia | Ruta o fuente | Fecha | Estado |
| --- | --- | --- | --- | --- |
| Nomenclatura y prioridad TiviPlay | Decisión formal de continuidad | `00_GOVERNANCE/DECISIONS/DEC-2026-09-02-010_OPERATIONAL_CONTINUITY_SEP_DEC_2026.md` | 2026-09-02 | `VALIDADO` |
| Registro de DEC-010 | Entrada única en Decision Log | `00_GOVERNANCE/DECISIONS/DECISION_LOG.md` | 2026-09-02 | `VALIDADO` |
| Estándar del ciclo de cliente | Decisión de adopción | `00_GOVERNANCE/DECISIONS/DEC-2026-08-26-008_CLIENT_OPERATIONAL_STANDARD.md` | 2026-08-26 | `VALIDADO` |
| Definición funcional del ciclo | Estándar v1.0 | `03_AREAS/01_OPERACION/JUM_OPS_STD_CLIENT_001_Handoff_Onboarding_Ejecucion_Entrega.md` | 2026-08-26 | `VALIDADO` |
| Modelo futuro de persistencia | Propuesta no implementada | `03_AREAS/01_OPERACION/JUM_OPS_MODEL_CLIENT_001_Persistencia_Estructurada_Multicanal.md` | 2026-08-26 | `PENDIENTE DE VALIDACIÓN` |
| TiviPlay Marketing | Decisión de vista con fixtures | `00_GOVERNANCE/DECISIONS/DEC-2026-08-26-004_TIVIPLAY_MARKETING_WORKFLOW.md` | 2026-08-26 | `VALIDADO` con límite |
| Arquitectura y flujos técnicos | Snapshot técnico canónico v1.1 | `03_AREAS/06_TECNOLOGIA_IA/JUM-OI-TECH-001_TECNOLOGIA_IA.md` | 2026-09-02 | `VALIDADO` |
| Dashboard de pagos | Contrato, fuente, reglas, métricas y privacidad | `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/docs/TIVIPLAY_PAYMENTS_DASHBOARD.md` | 2026-08-30 | `VALIDADO` para lectura |
| Estado de la aplicación | README de la intranet | `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/README.md` | 2026-08-30 | `VALIDADO` documentalmente |
| Fuentes TiviPlay observadas | Auditoría de Drive, fuentes locales y correo sin trasladar PII | `SOURCE_AUDIT_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Dependencias entre procesos | Mapa de fuentes y entregas entre áreas | `DEPENDENCY_MAP_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Brechas y contradicciones | Análisis documental inicial | `GAP_ANALYSIS_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Ownership general | Matriz con Operación pendiente | `00_GOVERNANCE/RESPONSIBILITY_MATRIX.md` | 2026-06-12 | `NO DOCUMENTADO` para TiviPlay |

## Riesgos

- Aprobar este borrador sin contrastar las fuentes oficiales actuales puede consolidar información histórica como vigente.
- Integrar fuentes antes de resolver IDs, ownership y controles puede crear una segunda fuente de verdad.
- Tratar reglas históricas de incentivos, retención o reactivación como vigentes puede afectar decisiones operativas y financieras.
- Confundir el dashboard funcional con el flujo E2E completo puede elevar una capacidad por encima de la evidencia.
- Exponer fuentes o vistas sin autenticación y permisos puede revelar información sensible.

## Evolución futura

1. Ejecutar revisión humana del inventario de fuentes, owners, reglas y brechas.
2. Confirmar fuentes vigentes de ventas, gestión operativa, horarios, soporte, calidad y retención al corte septiembre de 2026.
3. Definir identidades canónicas y relaciones mínimas sin crear una nueva base de datos.
4. Resolver las contradicciones documentales antes de cambiar estados técnicos.
5. Aprobar este documento antes de evaluar artefactos independientes de Integraciones/MCP, Skills, Hooks, Subagentes o Plugin.
