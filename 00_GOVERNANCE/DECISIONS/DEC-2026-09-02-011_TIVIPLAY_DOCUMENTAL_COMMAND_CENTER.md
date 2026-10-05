# DEC-2026-09-02-011 - Estructura documental y Command Center de TiviPlay

## Objetivo

Autorizar la estructura documental digital de los seis componentes del blueprint de TiviPlay y su visualización read-only dentro de JUMOCOL Operations Intelligence.

## Propósito

Mantener una única fuente canónica para el contexto de TiviPlay, ofrecer acceso navegable a su estado real y preparar puntos de evolución sin presentar integraciones o automatizaciones futuras como capacidades implementadas.

## Alcance

La decisión autoriza:

- Organizar `03_AREAS/01_OPERACION/TIVIPLAY/` como manifiesto del submódulo y seis componentes separados.
- Reubicar sin alterar `JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md` dentro de `01_CONTEXTO/`.
- Crear scaffolds exclusivamente documentales para Integraciones/MCP, Skills, Hooks, Subagentes y Plugin.
- Crear `/operaciones/tiviplay` como Command Center del submódulo.
- Crear `/operaciones/tiviplay/contexto` como visor server-side y read-only del Markdown canónico.
- Incorporar una allowlist cerrada y un renderer Markdown mínimo que no habilita HTML crudo.
- Mantener `/operaciones/tiviplay/pagos` como capacidad operacional separada.

La decisión no autoriza:

- Configurar MCP o integraciones.
- Crear skills ejecutables, hooks, automatizaciones o subagentes.
- Crear, instalar o publicar un plugin.
- Escribir sobre Google Drive, Google Sheets, el snapshot Excel u otra fuente.
- Crear una base de datos, un Write Model o una fuente paralela.
- Desplegar públicamente la intranet.
- Elevar el Contexto Maestro a aprobado.
- Cambiar `FLOW-TIVI-001` de `IN VALIDATION` a `VALIDATED`.

## Principios

- El Markdown canónico es la única fuente documental del visor.
- Google Drive y Google Sheets permanecen como fuentes oficiales iniciales.
- El Document Repository solo acepta identificadores registrados; no recibe rutas del usuario.
- La lectura ocurre en servidor y no expone rutas físicas ni el sistema de archivos al navegador.
- Los cinco componentes futuros se identifican expresamente como no implementados.
- Las modificaciones sensibles conservan revisión y aprobación humana.

## Governance

| Elemento | Estado autorizado |
| --- | --- |
| Contexto Maestro | `DRAFT — IN REVIEW` |
| Visor de contexto | Read-only local |
| Integraciones/MCP | `SCAFFOLD — NOT IMPLEMENTED` |
| Skills | `SCAFFOLD — NOT IMPLEMENTED` |
| Hooks | `SCAFFOLD — NOT IMPLEMENTED` |
| Subagentes | `TARGET ARCHITECTURE — NOT IMPLEMENTED` |
| Plugin | `FUTURE PACKAGE — NOT IMPLEMENTED` |
| `FLOW-TIVI-001` | `IN VALIDATION` |

## Riesgos

- Confundir scaffolds documentales con capacidades ejecutables.
- Tratar el visor como sustituto de Google Drive o Google Sheets.
- Exponer el repositorio documental sin autenticación en un despliegue público futuro.
- Desalinear la vista si la ruta canónica cambia sin actualizar la allowlist y la trazabilidad de build.
- Interpretar el dashboard de pagos como validación del flujo TiviPlay E2E completo.

## Evolución futura

1. Someter el Contexto Maestro a revisión humana.
2. Resolver ownership, fuentes vigentes, reglas contradictorias e IDs canónicos.
3. Mantener los cinco scaffolds sin ejecución hasta una decisión formal posterior.
4. Definir autenticación y permisos antes de cualquier despliegue independiente.

