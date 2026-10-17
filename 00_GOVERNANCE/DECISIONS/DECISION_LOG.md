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

## Riesgos

- No actualizar este log cuando se creen nuevas estructuras.
- Registrar decisiones sin documento de soporte.
- Mezclar decisiones aprobadas con propuestas.

## Evolucion futura

Agregar estado de revision, aprobador y fecha de reemplazo cuando exista un flujo formal de aprobacion.
