# DEC-2026-08-26-004 - Workflow Diario de TiviPlay Marketing

## Objetivo

Formalizar la primera vista operativa específica de `TiviPlay Marketing` dentro de `JUMOCOL Operations Intelligence`.

## Propósito

Hacer visible el workflow diario de marketing, su runtime reportado, las acciones pendientes y la evolución prevista de automatización sin implementar escritura, persistencia, integraciones ni agentes.

## Alcance

La decisión autoriza:

- Crear la ruta `/marketing-comercial/tiviplay`.
- Habilitar su navegación desde el bloque `TiviPlay Marketing` del Command Center.
- Extender el provider de fixtures y su contrato con un snapshot específico de TiviPlay.
- Representar las etapas Fuente, Selección, Producción, Validación, Publicación y Medición.
- Registrar como fixture la actividad reportada para el 26/08/2026.
- Mostrar el backlog actual y la evolución Manual asistido, Semiautomático, Agente supervisado y Automatizado.

La decisión no autoriza:

- Crear una base de datos o fuente paralela.
- Introducir lógica de escritura.
- Conectar WhatsApp, Meta, Google Ads, CRM u otras API.
- Implementar agentes, publicación automática, autenticación o despliegue.

## Principios

- Los fixtures permanecen fuera de los componentes visuales.
- Las lecturas se realizan desde Server Components mediante el provider existente.
- Los campos no disponibles se conservan como `null`; no se inventan resultados.
- TiviPlay se presenta como unidad dentro de la identidad superior de JUMOCOL.
- Los estados se expresan con texto y color, nunca solo con color.
- La automatización futura se documenta como dirección, no como capacidad activa.

## Governance

### Ruta y ownership de datos

La ruta implementada es:

`06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src/app/(intranet)/marketing-comercial/tiviplay/page.tsx`

El contrato de lectura se amplía en `src/server/data/contracts.ts` con `marketingCommercial.getTiviplaySnapshot()`. La implementación vigente continúa siendo exclusivamente `fixtures`.

### Clasificación de evidencia

| Clasificación | Contenido | Tratamiento |
| --- | --- | --- |
| `HECHO_REPORTADO` | Fecha, marca, tipo, objetivo, canal, estado, responsable y próxima acción suministrados por el usuario | Se registran en el fixture local |
| `INFERENCIA_OPERATIVA` | El estado `Publicado` implica que Fuente, Selección, Producción, Validación y Publicación se muestran completas | Se usa solo para el estado visual del workflow; no certifica historial detallado |
| `INFORMACION_NO_DISPONIBLE` | Campaña, asset, conversaciones, leads, ventas, recaudo y aprendizaje | Se conservan como `null` y se muestran como pendientes |

### Contrato de actividad

Cada actividad queda preparada para contener:

- `id`.
- `date`.
- `brand`.
- `campaign`.
- `source`.
- `objective`.
- `asset`.
- `channel`.
- `responsible`.
- `status`.
- `conversations`.
- `leads`.
- `sales`.
- `collections`.
- `learning`.
- `nextAction`.

Los nombres internos siguen convenciones TypeScript en inglés y las etiquetas visibles permanecen en español.

## Riesgos

- `Publicado` no demuestra por sí solo la ejecución individual de cada control de validación; la vista representa el flujo reportado, no una auditoría de evidencias.
- El fixture no debe convertirse en registro operativo ni fuente de verdad.
- La ausencia de owner individual y campaña identificada limita trazabilidad futura.
- La automatización no debe avanzar sin reglas, excepciones, aprobaciones y fuentes autorizadas.

## Evolución futura

1. Validar owner, campaña y referencia del asset para cada actividad.
2. Definir fuente autorizada de lectura antes de reemplazar el fixture.
3. Incorporar aprobación humana por etapa antes de automatizar ejecución.
4. Añadir medición atribuible solo cuando exista un contrato verificable.
