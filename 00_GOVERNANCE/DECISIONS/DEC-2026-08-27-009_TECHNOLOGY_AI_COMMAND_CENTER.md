# DEC-2026-08-27-009 - Command Center de Tecnología e Inteligencia Artificial

## Objetivo

Formalizar `Tecnología & Inteligencia Artificial` como punto central de documentación, observabilidad conceptual y continuidad de la arquitectura de JUMOCOL Operations Intelligence.

## Propósito

Permitir que un ingeniero autorizado comprenda el estado técnico del sistema sin abrir primero el código y sin convertir objetivos futuros, integraciones parciales o agentes planeados en capacidades supuestamente implementadas.

## Alcance

La decisión autoriza:

- Reemplazar la vista base de `/tecnologia-ia` por un Command Center técnico.
- Representar stack, arquitectura por capas, mapa funcional, integraciones, flujos E2E, decisiones, evolución IA y roadmap.
- Extender `OperationsDataProvider` con un snapshot técnico local, tipado y no sensible.
- Persistir `JUM-OI-TECH-001` como documento técnico canónico.
- Registrar `FLOW-LEAD-001` como `VALIDATED — 2026-08-26` según el checkpoint aprobado.
- Mantener WhatsApp E2E, GA4/GTM y trazabilidad completa de conversiones como `IN VALIDATION`.

La decisión no autoriza:

- Crear agentes, orchestrator, chatbot o automatizaciones.
- Implementar Write Model, comandos operacionales o escrituras desde la intranet.
- Exponer Operations Intelligence como aplicación pública.
- Mostrar credenciales, tokens, variables `.env`, PII o datos de clientes.
- Modificar, importar o acoplar el código de `JUMOCOL_COM`.
- Añadir una dependencia gráfica para los diagramas.

## Principios

- Operations Intelligence no es un CRM.
- Los estados técnicos se limitan a `VALIDATED`, `ACTIVE`, `IN VALIDATION`, `PLANNED`, `BLOCKED` y `DEPRECATED`.
- Google Sheets es una fuente operacional MVP detrás de contratos reemplazables.
- Read Model y Write Model permanecen separados.
- La UI consume contratos y no conoce credenciales ni detalles físicos de las fuentes.
- La arquitectura objetivo de agentes se presenta como `TARGET ARCHITECTURE — NOT IMPLEMENTED`.
- La documentación precede la automatización.

## Governance

### Fuente canónica

La documentación técnica consolidada vive en:

`03_AREAS/06_TECNOLOGIA_IA/JUM-OI-TECH-001_TECNOLOGIA_IA.md`

La interfaz asociada vive exclusivamente en:

`06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/`

### Clasificación de la iteración

| Elemento | Estado |
| --- | --- |
| Página `/tecnologia-ia` | Implementada como Command Center técnico |
| Snapshot técnico | Fixture documental local, sin secretos |
| Read Model Google Sheets | `IMPLEMENTADO / MVP` |
| Write Model | `PLANNED` |
| `FLOW-LEAD-001` | `VALIDATED — 2026-08-26` |
| WhatsApp inbound E2E | `IN VALIDATION` |
| Operations Intelligence público | No implementado |
| AI Orchestrator y agentes | `TARGET ARCHITECTURE — NOT IMPLEMENTED` |

## Riesgos

- Confundir metadata documentada con observabilidad en tiempo real.
- Cambiar el estado de una integración sin evidencia nueva.
- Duplicar decisiones entre UI, Governance y documentos técnicos sin mantener su fuente canónica.
- Interpretar registros QA como oportunidades comerciales externas.
- Exponer la intranet sin autenticación, RBAC y staging protegido.

## Evolución futura

1. Definir contratos de datos definitivos e IDs canónicos.
2. Implementar `12_CATALOGS` y Audit Log únicamente después de aprobación.
3. Diseñar el Write Model con comandos, validación, idempotencia y permisos.
4. Validar WhatsApp inbound E2E antes de marcarlo `VALIDATED`.
5. Implementar autenticación, RBAC y staging antes de un deployment independiente.
