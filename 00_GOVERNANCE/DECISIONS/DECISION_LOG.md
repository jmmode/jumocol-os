# Decision Log

## Objetivo

Mantener un indice auditable de decisiones estructurales de `JUMOCOL_SYSTEM_OS`.

## Proposito

Evitar que cambios de arquitectura documental queden como hechos implicitos sin trazabilidad.

## Alcance

Registra decisiones sobre estructura, responsabilidades, governance, contexto, runtime, memoria, validacion y automatizacion.

## Principios

- Una decision debe tener fecha, motivo y consecuencia.
- Una preferencia no confirmada no es una decision.
- Un hallazgo de auditoria no es decision hasta que se aprueba una respuesta.

## Governance

| ID | Fecha | Decision | Estado | Documento |
| --- | --- | --- | --- | --- |
| DEC-2026-06-12-001 | 2026-06-12 | Crear estructura documental inicial v0.1 acotada a governance, contexto, runtime, areas, validacion, automatizacion y fuentes externas. | Vigente | `DEC-2026-06-12-001_INITIAL_STRUCTURE.md` |
| DEC-2026-08-26-002 | 2026-08-26 | Crear `06_APPLICATIONS/` y alojar la intranet canonica en `JUMOCOL_OPERATIONS_INTELLIGENCE`, separada de `JUMOCOL_COM`. | Vigente | `DEC-2026-08-26-002_APPLICATION_LAYER.md` |
| DEC-2026-08-26-003 | 2026-08-26 | Integrar la identidad visual oficial mediante un activo local inmutable y tokens corporativos, sin dependencia de runtime con `JUMOCOL_COM`. | Vigente | `DEC-2026-08-26-003_CORPORATE_VISUAL_IDENTITY.md` |
| DEC-2026-08-26-004 | 2026-08-26 | Implementar el workflow diario de TiviPlay Marketing mediante contratos y fixtures de solo lectura, sin persistencia ni automatización. | Vigente | `DEC-2026-08-26-004_TIVIPLAY_MARKETING_WORKFLOW.md` |
| DEC-2026-08-26-005 | 2026-08-26 | Implementar el funnel comercial de Landing Page, su pipeline vacío y el handoff Pago → Onboarding mediante contratos y fixtures de solo lectura. | Vigente; complementada por DEC-008 | `DEC-2026-08-26-005_LANDING_PAGE_COMMERCIAL_FUNNEL.md` |
| DEC-2026-08-26-006 | 2026-08-26 | Activar Clientes Web dentro de Operaciones con ciclo de entrega, checklists y contrato de handoff, sin proyectos reales, persistencia ni automatización. | Vigente; complementada por DEC-008 | `DEC-2026-08-26-006_CLIENT_WEB_DELIVERY_CYCLE.md` |
| DEC-2026-08-26-007 | 2026-08-26 | Conectar Landing Page con la fuente autorizada de leads mediante un repositorio Google Sheets server-side y de solo lectura. | Vigente | `DEC-2026-08-26-007_GOOGLE_SHEETS_LEAD_READ_MODEL.md` |
| DEC-2026-08-26-008 | 2026-08-26 | Adoptar `JUM_OPS_STD_CLIENT_001` v1.0, formalizar estados y gates del ciclo de cliente y documentar persistencia estructurada y captura multicanal como siguiente milestone no implementado. | Vigente | `DEC-2026-08-26-008_CLIENT_OPERATIONAL_STANDARD.md` |
| DEC-2026-08-27-009 | 2026-08-27 | Consolidar `/tecnologia-ia` como Command Center técnico y persistir `JUM-OI-TECH-001` sin implementar agentes, Write Model ni deployment público. | Vigente | `DEC-2026-08-27-009_TECHNOLOGY_AI_COMMAND_CENTER.md` |
| DEC-2026-09-02-010 | 2026-09-02 | Formalizar la nomenclatura de la intranet, la continuidad septiembre-diciembre de 2026, TiviPlay como primer laboratorio, las fuentes oficiales iniciales y los limites de automatizacion con revision humana. | Vigente | `DEC-2026-09-02-010_OPERATIONAL_CONTINUITY_SEP_DEC_2026.md` |
| DEC-2026-09-02-011 | 2026-09-02 | Autorizar la estructura documental de los seis componentes de TiviPlay y las rutas read-only `/operaciones/tiviplay` y `/operaciones/tiviplay/contexto`, sin implementar los cinco componentes futuros. | Vigente | `DEC-2026-09-02-011_TIVIPLAY_DOCUMENTAL_COMMAND_CENTER.md` |
| DEC-2026-10-17-012 | 2026-10-17 | Crear canal nuevo de YouTube para monetización con YCS; Music relax excluido; GitHub como fuente canónica; README de 07_YOUTUBE sincronizado con árbol real. | Vigente | `DEC-2026-10-17-012_YOUTUBE_NEW_CHANNEL.md` |

| DEC-2026-10-19-013 | 2026-10-19 | Adoptar GOV-MA-001 como protocolo común para ideas y colaboración IA: ChatGPT propone, modelos revisan independientemente, ChatGPT consolida, Dirección aprueba, GitHub recibe plan/Work Orders/cronograma y evidencia. Se corrige el actor OpenClaw (no nombre anterior). La aprobación del protocolo no aprueba proyectos ni despliegues. | Vigente — estándar documental; ejecución por validar | [PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md](../PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md) |
| DEC-2026-10-22-014 | 2026-10-22 | TiviPlay — URL de configuración por panel: son OPERACIONAL COMPARTIBLE, pero viven solo en configuración privada local (`data/private/panel-endpoints.json`), nunca en Git; los dominios ambiguos quedan REQUIERE EVIDENCIA · NO USAR. Downloader `2865004` = VALIDADO COMO REFERENCIA OPERACIONAL, sin publicar IP ni afirmar propiedad del servidor. Directorio único de accesos en Administración; acceso directo del lanzador en Descargas; red sin cambios. | Vigente | [CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md](../../08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md) §2 |
| DEC-2026-10-23-015 | 2026-10-23 | TiviPlay — Créditos: la fecha calendario de G gobierna el día del crédito en P1/P2/P3; se excluye I = COMPRA; hoy = Σ A; la ejecución se determina por CREDITO (J) > 0 y H por sí solo no prueba ejecución; H es el nuevo vencimiento que se cruza con BASE GENERAL F.VENCIMIENTO. Se autorizó corregir solo las fórmulas «Créditos por otorgar HOY» en Sheets, sin tocar datos de G ni las otras fórmulas. | Vigente | [CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md](../../08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md) §2 |
| DEC-2026-10-23-016 | 2026-10-23 | TiviPlay — Guía rápida de turno v1.2 (SHA-256 `1946fc7a…65efc7`, commit `5cae7b8`) publicada a OPERADOR; la autorización cubre solo esa versión exacta. AT&T ActiveArmor se documenta solo para casos con evidencia de bloqueo, con advertencia de seguridad y sin DNS/VPN como primera solución. | Vigente | [CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md](../../08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md) §1 |
| DEC-2026-10-23-017 | 2026-10-23 | Cierre formal de la iteración TiviPlay S3: FREEZE FUNCIONAL; siguiente paso, auditoría independiente (Grok); luego prueba real CONFIRMADO JM → habilitación → servicio → match → BASE GENERAL → intranet, sin automatizar. Noviembre reproducible es el objetivo operacional crítico. PRIME/UX y despliegue cloud quedan registrados y no autorizados. | Vigente | [CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md](../../08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md) §5–§7 |

## Riesgos

- No actualizar este log cuando se creen nuevas estructuras.
- Registrar decisiones sin documento de soporte.
- Mezclar decisiones aprobadas con propuestas.

## Evolucion futura

Agregar estado de revision, aprobador y fecha de reemplazo cuando exista un flujo formal de aprobacion.
