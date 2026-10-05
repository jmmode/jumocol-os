# DEC-2026-09-02-010 - Continuidad Operacional Septiembre-Diciembre 2026

## Objetivo

Formalizar la nomenclatura, la secuencia de trabajo y los limites de evolucion de `JUMOCOL Operations Intelligence` para el periodo septiembre-diciembre de 2026.

## Proposito

Concentrar el desarrollo en un caso operacional real, mantener fuentes oficiales existentes y evitar que agentes, integraciones o automatizaciones se implementen antes de validar contexto, procesos, ownership, evidencia y aprobaciones humanas.

## Alcance

La decision confirma:

- `JUMOCOL Operations Intelligence` como nombre formal de la intranet.
- `JUMOCOL OS` como nombre operativo abreviado.
- Septiembre de 2026 para el modulo Operaciones, comenzando con TiviPlay.
- Octubre de 2026 para el nucleo financiero, administrativo y de talento humano.
- Noviembre de 2026 para estabilizacion, documentacion, capacitacion y empaquetado.
- Diciembre de 2026 como inicio de fase operativa, con seguimiento y evaluacion de escalabilidad.
- TiviPlay como primer laboratorio y caso de uso real.
- Google Drive y Google Sheets como fuentes oficiales iniciales.
- La intranet como capa de visualizacion, control, auditoria y proyeccion, no como sustituto automatico de las fuentes.
- El contexto y modelo operativo de TiviPlay como prioridad anterior a multiples agentes, hooks, plugins o automatizaciones.
- Revision y aprobacion humana para modificaciones sensibles.

La decision no autoriza:

- Crear MCP, skills, hooks, subagentes, plugins o una arquitectura paralela.
- Implementar nuevas automatizaciones, escrituras o integraciones.
- Sustituir Google Drive o Google Sheets como fuentes oficiales.
- Modificar codigo de la aplicacion.
- Exponer credenciales, datos personales o cifras operativas innecesarias.
- Presentar fixtures, arquitectura objetivo o componentes visuales como capacidades operativas reales.

## Principios

- Contextualizar y modelar antes de automatizar.
- Validar un laboratorio real antes de replicar la arquitectura.
- Mantener separadas fuente oficial, Read Model, visualizacion y futura escritura.
- Diferenciar implementacion funcional, validacion tecnica y operacion real.
- Conservar gates de revision humana en cambios sensibles.
- Registrar como pendiente todo estado que no tenga evidencia suficiente.

## Governance

### Nomenclatura

| Nombre | Uso confirmado |
| --- | --- |
| `JUMOCOL Operations Intelligence` | Nombre formal de la intranet |
| `JUMOCOL OS` | Nombre operativo abreviado |
| `JUMOCOL_SYSTEM_OS` | Repositorio canonico documental y tecnico |

### Secuencia septiembre-diciembre de 2026

| Periodo | Foco | Resultado esperado |
| --- | --- | --- |
| Septiembre | Operaciones, comenzando con TiviPlay | Contexto persistente, modelo operativo, fuentes, controles y brechas definidos |
| Octubre | Nucleo financiero, administrativo y talento humano | Dependencias y contratos de salida documentados antes de integraciones |
| Noviembre | Estabilizacion, documentacion, capacitacion y empaquetado | Sistema verificable, transferible y preparado para operacion |
| Diciembre | Fase operativa | Seguimiento, evaluacion de resultados y analisis de escalabilidad |

### TiviPlay como laboratorio

El dashboard `/operaciones/tiviplay/pagos` tiene una implementacion funcional documentada de solo lectura. Existe ruta, adaptador server-side, fuente local privada autorizada, normalizacion, conciliacion, filtros, auditoria y recarga controlada. La verificacion del 2026-09-02 confirmo typecheck correcto.

`FLOW-TIVI-001` cambia documentalmente de `PLANNED` a `IN VALIDATION`. Este estado no certifica el flujo completo `Payment -> Credit -> Service -> Reconciliation`: la ejecucion de Vitest inicio, pero termino con codigo 1 sin diagnostico concluyente en esta revision. La operacion E2E, ownership y aprobacion de resultados permanecen pendientes de evidencia.

### Frontera de fuentes y aplicacion

```text
Google Drive / Google Sheets
            ↓
Fuentes oficiales iniciales
            ↓
Read Model / adaptadores autorizados
            ↓
JUMOCOL Operations Intelligence
            ↓
Visualizacion / control / auditoria / proyeccion
```

La intranet no reemplaza las fuentes oficiales ni autoriza escrituras por esta decision.

## Riesgos

- Confundir el dashboard implementado con un proceso E2E completamente validado.
- Tratar datos derivados o fixtures como evidencia operacional oficial.
- Expandir agentes o automatizaciones antes de definir owners, excepciones y contratos.
- Interpretar el calendario como autorizacion automatica para implementar integraciones o modificar fuentes.
- Ejecutar cambios sensibles sin revision humana.

## Evolucion futura

1. Completar el contexto y modelo operativo de TiviPlay.
2. Validar `FLOW-TIVI-001` con evidencia reproducible y aprobacion humana antes de marcarlo `VALIDATED`.
3. Documentar contratos y dependencias del nucleo de octubre sin crear fuentes paralelas.
4. Preparar estabilizacion, capacitacion y empaquetado en noviembre.
5. Iniciar diciembre con seguimiento operativo y criterios explicitos de escalabilidad.
