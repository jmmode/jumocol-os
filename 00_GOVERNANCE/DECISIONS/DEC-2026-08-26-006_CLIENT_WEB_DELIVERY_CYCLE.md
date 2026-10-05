# DEC-2026-08-26-006 - Ciclo de Entrega de Clientes Web

> **Estado:** Vigente como decisión de origen. Complementada por `DEC-2026-08-26-008`, que incorpora Proyecto, Cierre / Soporte, estados canónicos, gates y contratos Payment/Handoff alineados con `JUM_OPS_STD_CLIENT_001`.

## Objetivo

Formalizar `Clientes Web` como módulo operacional de `JUMOCOL Operations Intelligence` para conectar una venta cerrada con producción, publicación, entrega y soporte.

## Propósito

Definir la frontera entre Marketing & Comercial y Operaciones, preparar el contrato de handoff y hacer visible el ciclo completo de entrega sin crear un CRM, una fuente operacional paralela ni registros ficticios.

## Alcance

La decisión autoriza:

- Crear la ruta `/operaciones/clientes-web`.
- Activar el acceso desde el área `/operaciones`.
- Conectar el handoff de `/marketing-comercial/landing-page` directamente con Clientes Web.
- Representar trece etapas desde Venta cerrada hasta Soporte.
- Preparar checklists de onboarding, fases de proyecto, alertas y criterios del documento de entrega.
- Definir los contratos `ClientWebDeliverySnapshot`, `ClientWebProject` y `CommercialToOperationsHandoff`.
- Extender el provider de fixtures con un namespace `operations`.

La decisión no autoriza:

- Crear una base de datos, CRM o fuente adicional.
- Registrar clientes, proyectos, transferencias, pagos o métricas ficticias.
- Implementar formularios persistentes, eventos, notificaciones o automatizaciones.
- Conectar Google Sheets, Drive, WhatsApp, Vercel u otras API.
- Modificar o depender de `JUMOCOL_COM`.
- Desplegar la aplicación.

## Principios

- Marketing & Comercial conserva ownership hasta el pago confirmado.
- El handoff transfiere contexto; no ejecuta automáticamente operaciones.
- Operaciones / Clientes Web inicia ownership desde onboarding aceptado.
- Los fixtures describen estructura visual, no actividad operacional.
- Las colecciones `projects.records` y `handoffContract.records` permanecen vacías.
- Los estados de cada checklist permanecen `null` mientras no exista un proyecto real.
- Los conteos en cero significan ausencia de datos conectados, no una certificación externa.

## Governance

### Ruta y ownership de datos

La ruta implementada es:

`06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src/app/(intranet)/operaciones/clientes-web/page.tsx`

El contrato de lectura se amplía en `src/server/data/contracts.ts` con `operations.getClientWebDeliverySnapshot()`. La implementación vigente continúa siendo exclusivamente `fixtures` y no persiste datos.

### Clasificación de evidencia

| Clasificación | Contenido | Tratamiento |
| --- | --- | --- |
| `HECHO_REPORTADO` | Producto inicial, objetivo, ciclo solicitado, separación de responsabilidades, requisitos, fases, KPIs, alertas y campos de entrega | Se representan en contrato y fixture local |
| `DEFINICION_OPERATIVA` | Propósito, entrada, actividad, salida, owner y siguiente acción de las trece etapas | Se documentan como diseño sujeto a validación operacional |
| `INFORMACION_NO_DISPONIBLE` | Clientes, proyectos, responsables reales, fechas, avance, bloqueos, alertas activas, tiempos y handoffs ejecutados | Se conservan en colecciones vacías o valores nulos |

### Frontera entre áreas

La secuencia gobernada es:

`Marketing & Comercial → Landing Page → Pago → Handoff → Onboarding → Operaciones → Clientes Web`

Marketing & Comercial gestiona Lead, Diagnóstico, Propuesta, Negociación, Ganado y Pago. El handoff transfiere información comercial, producto, alcance, precio, condiciones, datos disponibles y responsable comercial. Operaciones / Clientes Web gestiona Onboarding, Producción, Entrega y Soporte.

### Contrato de handoff

`CommercialToOperationsHandoff` queda preparado para:

- `opportunityId`.
- `clientName`.
- `companyName`.
- `product`.
- `commercialValue`.
- `currency`.
- `paymentStatus`.
- `scope`.
- `commercialOwner`.
- `clientContact`.
- `notes`.
- `evidenceReferences`.
- `handoffDate`.

El contrato no tiene eventos, persistencia ni registros vigentes.

### Criterio conceptual de entrega

Un proyecto puede considerarse entregado cuando quedan registrados producto, URL, dominio, publicación, servicios, correos, accesos, repositorio, analítica, mantenimiento, soporte, garantías, responsable y aceptación del cliente. La presente decisión solo fija el contrato; no genera documentos.

## Riesgos

- El fixture puede confundirse con un sistema de gestión si no se conserva la divulgación visible.
- El pago confirmado y la aceptación del cliente necesitan evidencias y reglas formales antes de operar.
- El handoff requiere campos obligatorios, ownership y criterio de aceptación aún no aprobados.
- Los estados y tiempos no deben calcularse hasta definir una fuente de verdad y reglas de transición.
- Los accesos, DNS y dominios son información sensible que requerirá control de permisos antes de persistirse.

## Evolución futura

1. Aprobar owner operacional, SLA y criterio formal de aceptación del handoff.
2. Definir campos obligatorios por producto web.
3. Seleccionar una única fuente operacional autorizada.
4. Diseñar permisos para accesos e infraestructura sensible.
5. Incorporar alertas y métricas solo cuando existan fechas, estados y reglas verificables.
6. Automatizar transferencias únicamente después de validar excepciones y aprobaciones humanas.
