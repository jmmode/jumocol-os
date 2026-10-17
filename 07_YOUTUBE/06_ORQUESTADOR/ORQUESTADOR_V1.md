# 06 — ORQUESTADOR YouTube Content System

**Versión:** 1.0 | **Fecha:** 2026-10-17 | **Estado:** ACTIVO
**Ubicación:** `07_YOUTUBE/06_ORQUESTADOR/`
**Referencia:** AEP v2.0, secuencia de 8 pasos

El orquestador es el único ejecutable del sistema. Todo lo demás — prompts, calendario, métricas — son datos que él consume. Si no hay orquestador, no hay sistema: hay documentos.

## Arquitectura

```
[FUENTES] → [NIVEL 2: guion] → [NIVEL 1: shorts + metadatos] → [PUBLICACIÓN] → [TELEMETRÍA 48h] → [DIFF]
```

Cada flecha es una función. Cada función tiene entrada tipada, salida tipada y un código de error propio.

## Estados de una publicación

| Estado | Quién lo setea | Condición |
|---|---|---|
| `FUENTE_PENDIENTE` | orquestador | al crear el ciclo |
| `GUION_GENERADO` | Nivel 2 | guion pasa Definition of Done |
| `SHORTS_GENERADOS` | Nivel 1 | 4 shorts con hooks distintos |
| `PUBLICADO` | Nivel 1 | checklist de publicación OK |
| `TELEMETRIA_CAPTURADA` | Nivel 1 | vistas/CTR/retención a 48h |
| `DIFF_APLICADA` | Nivel 2 | diff versionada o `SIN_DESVIACION` |
| `ARCHIVADO` | Nivel 1 | Short <1.000 vistas o flag humano |

## Función 1: `cargar_fuente(tema)`

Lee `05_FUENTES_Y_MATERIAL_RAW/`, extrae 3–5 claims con evidencia, inyecta el bloque `<FUENTE>` del PROMPT_LARGO_V1.

- Error: `FUENTE_INCOMPLETA` si faltan CLAIM_1–3 o EVIDENCIA.
- Error: `FUENTE_NO_ENCONTRADA` si el tema no tiene material.

## Función 2: `generar_guion(fuente)`

Llama al modelo con PROMPT_LARGO_V1 + bloque FUENTE.

- Valida: 1.700–3.000 palabras, todo claim con evidencia o [HIPÓTESIS], sin Pereira, sin datos de terceros, 1 CTA.
- Si falla: reintenta 1 vez con el error como contexto. Si falla de nuevo: `GUION_INVALIDO`, humano.
- Éxito: estado `GUION_GENERADO`, guarda en `03_CALENDARIO_Y_TEMAS/GUIONES/`.

## Función 3: `derivar_shorts(guion)`

Genera 4 Shorts con PROMPT_SHORT_V1. Categorías de hook obligatorias: numérico, contradicción, pregunta, historia.

- Error: `SHORTS_INCOMPLETOS` si <4 o categorías duplicadas.
- Guarda en `03_CALENDARIO_Y_TEMAS/SHORTS/`.

## Función 4: `generar_metadatos(guion, shorts)`

Determinístico. Título ≤60 chars, descripción con timestamps, tags, capítulos, thumbnail text. Sin LLM.

- Error: `METADATOS_INVALIDOS` si el título pasa de 60.

## Función 5: `publicar(metadatos)`

Checklist previo: 2FA activo, AdSense vinculado, sin strikes, sin Pereira en el texto.
- Publica largo + 4 Shorts.
- Escribe en `04_METRICAS_Y_EVIDENCIA/LOG_PUBLICACIONES.md` con PUBLICACION_ID.

## Función 6: `capturar_telemetria(publicacion_id)`

Pull vía YouTube Analytics API a 48h.

- Campos: vistas, CTR, retención 30s, baseline.
- Calcula DESVIACION.
- Si >40% de caída: `HUMANO_REQUERIDO: true`.
- Si ≤20%: `SIN_DESVIACION`.
- Estado: `TELEMETRIA_CAPTURADA`.

## Función 7: `generar_diff(telemetria, prompt_actual)`

Ejecuta PROMPT_DIFF_V1 solo si DESVIACION >20%.

- Valida: RAZÓN con número, IMPACTO como [HIPÓTESIS], ANTES/DESPUÉS exactos.
- Aplica diff → crea `PROMPT_LARGO_V1.N.md` versionado.
- Actualiza índice de `02_PROMPTS_Y_SCRIPTS/README.md`.

## Función 8: `cerrar_ciclo(publicacion_id)`

Decide acción por umbrales del AEP sección 7:

| Señal | Acción |
|---|---|
| Short ≥10.000 vistas | encolar 3 variantes del hook en 72h |
| Short <1.000 vistas | archivar con razón |
| CTR largo ≥6% | subir frecuencia |
| CTR largo <3% | iterar hook |
| Caída >40% | flag humano |

## Loop diario (automatización)

1. `capturar_telemetria` para todo lo publicado hace 48h sin telemetría.
2. `generar_diff` donde aplique.
3. `cerrar_ciclo` y encolar acciones.
4. Generar 1 Short candidato del tema del día si hay cupo.
5. Notificar resumen diario a Julián (Gmail o app).

## Loop semanal

1. Revisar watch time acumulado vs meta de 500h.
2. Si algún Short cruzó 10.000 vistas: priorizar ese formato.
3. Ajustar calendario de `03_CALENDARIO_Y_TEMAS/`.
4. Checkpoint: ¿el sistema mejoró el prompt esta semana? Si no, es señal de que la telemetría no está alimentando el diff.

## Errores globales

| Código | Significado | Acción |
|---|---|---|
| `FUENTE_INCOMPLETA` | falta claim o evidencia | no generar, log |
| `FUENTE_NO_ENCONTRADA` | tema sin material | sugerir tema alterno |
| `GUION_INVALIDO` | falló 2 veces | humano |
| `SHORTS_INCOMPLETOS` | <4 o categorías duplicadas | reintentar 1 vez |
| `METADATOS_INVALIDOS` | título >60 chars | recortar determinístico |
| `HUMANO_REQUERIDO` | caída >40% | notificación inmediata |

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-17 | Creación. 8 funciones, 7 estados, loops diario y semanal, códigos de error. |

---
*Fin del orquestador v1.0*