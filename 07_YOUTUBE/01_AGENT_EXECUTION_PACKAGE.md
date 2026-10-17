# 01 — AGENT EXECUTION PACKAGE (AEP) — YouTube Content System

**Versión:** 2.0 | **Fecha:** 2026-10-17 | **Estado:** ACTIVO
**Autor de diseño:** Grok (SpaceXAI) bajo dirección de Julián Montealegre
**Hereda patrón de:** JUMOCOL OS / TiviPlay Runtime Operativo (checkpoint 2026-10-09)
**Ubicación canónica:** GitHub `jmmode/jumocol-os` → `07_YOUTUBE/` | Espejo: Drive → `7_YouTube_Content_System/01_AGENT_EXECUTION_PACKAGE/`
**Cambio v2.0:** Rediseño con mentalidad first-principles (Musk): telemetría primero, contenido segundo. El humano sale del loop de validación por evidencia, no por fe.

---

## 1. PROPÓSITO

Definir el contrato de salida del sistema de contenido de YouTube: qué entra, qué se genera, qué se valida, qué se publica y qué se mide. Cualquier agente debe poder ejecutar este paquete sin historial y producir entregables auditables.

Regla madre: *descubrir una vez, documentar una vez, codificar lo determinístico, enseñar al agente, validar con evidencia, reutilizar muchas veces.*

Principio rector v2: **el video no es el activo — el dato de por qué funcionó o falló es el activo.** Todo el sistema se diseña alrededor de capturar ese dato más rápido que la competencia.

## 2. NICHO Y POSICIONAMIENTO

- **Nicho:** Inteligencia artificial aplicada + finanzas personales, en español (Colombia, México, España, Argentina como mercados primarios).
- **Diferenciador:** Documentación del stack real del operador (TiviPlay, Life OS, agentes, automatización). Faceless: pantalla + voz sintética + datos reales.
- **Contenido PROHIBIDO:** mudanza a Pereira, reubicación cancelada, datos sensibles de terceros, claims no verificables.

## 3. UMERALES DE MONETIZACIÓN (vigentes al 2026-10-17)

| Ruta | Requisito | Ventana |
|---|---|---|
| Larga (Partner Program) | 1.000 suscriptores + 4.000 h watch time | 12 meses |
| Corta (Shorts) | 10.000.000 vistas Shorts | 90 días |
| Nivel inferior | 500 suscriptores + 3 subidas/90 días + 3.000 h o 3M vistas Shorts | membresías, Super Thanks, Super Chat |

**Alerta crítica:** umbrales duplicados para solicitantes nuevos desde el 1 de febrero de 2027. Meta: monetizar antes del 31 de enero de 2027.

Reparto: 55% largo, 45% Shorts.

## 4. JERARQUÍA DE AGENTES

1. **Nivel 1 — Determinístico:** subtítulos, recortes, metadatos, scheduling, pull de métricas vía YouTube Analytics API. Sin LLM.
2. **Nivel 2 — Operativo:** guiones, hooks, adaptación cross-platform. Consume prompts versionados de `02_PROMPTS_Y_SCRIPTS/`.
3. **Nivel 3 — Alta capacidad:** solo excepciones (pivote, crisis, análisis de competencia).

## 5. SECUENCIA DE PRODUCCIÓN (un ciclo = 1 largo + 4 Shorts)

1. **FUENTE:** Nivel 2 lee `05_FUENTES_Y_MATERIAL_RAW/` y extrae 3–5 claims verificables con evidencia adjunta.
2. **GUION:** Nivel 2 genera el largo (12–20 min) con `PROMPT_LARGO_V1`. Estructura: hook 0–30s, contexto, 3 bloques de valor, evidencia, CTA.
3. **VALIDACIÓN:** Semana 1, revisión humana obligatoria (calibración del sistema, no del contenido). Desde semana 2, el loop cierra solo: si el Short supera el umbral de la sección 7, se duplica el formato automáticamente; si no, se archiva con razón documentada. Intervención humana solo ante anomalía (caída >40% vs baseline o flag de política).
4. **DERIVACIÓN:** Nivel 1 genera 4 Shorts con hooks distintos vía `PROMPT_SHORT_V1`.
5. **METADATOS:** Nivel 1, sin LLM.
6. **PUBLICACIÓN:** checklist de `04_METRICAS_Y_EVIDENCIA/`.
7. **MEDICIÓN (telemetría):** 48h post-publicación, Nivel 1 jala vistas, CTR, retención vía YouTube Analytics API y escribe en `04_METRICAS_Y_EVIDENCIA/LOG_PUBLICACIONES.md`.
8. **APRENDIZAJE:** Nivel 2 compara el resultado contra el baseline y propone la diff del prompt (qué hook, qué estructura, qué claim rindió). La diff se versiona; el prompt no se reescribe a mano.

## 6. VALIDACIONES (Definition of Done)

- [ ] El guion cita ≥1 fuente real del ecosistema con evidencia
- [ ] Ningún claim sin evidencia o marcado como hipótesis
- [ ] Largo entre 12 y 20 minutos
- [ ] 4 Shorts con hooks distintos
- [ ] Metadatos completos (título ≤60 chars, descripción con timestamps)
- [ ] Sin Pereira/reubicación, sin datos de terceros
- [ ] Registrado en LOG_PUBLICACIONES.md
- [ ] **Telemetría capturada:** el registro incluye al menos vistas, CTR y retención a 48h
- [ ] **Diff de prompt versionada** si el resultado se desvía >20% del baseline

## 7. MÉTRICAS Y UMBRALES DE AUTO-DECISIÓN

| Señal | Umbral | Acción automática |
|---|---|---|
| Short 48h | ≥10.000 vistas | Duplicar formato: 3 variantes del mismo hook en 72h |
| Short 48h | <1.000 vistas | Archivar con razón; no reintentar el ángulo 30 días |
| Largo CTR | ≥6% | Mantener estructura; subir frecuencia |
| Largo CTR | <3% | Iterar hook; congelar el resto |
| Retención Short 30s | <40% | Matar el hook; probar el segundo derivado |
| Caída vs baseline | >40% | Flag humano inmediato |

Baseline inicial: promedio de las primeras 10 publicaciones (calibración).

## 8. MÉTRICAS OBJETIVO (30 días)

- 6 largos + 24 Shorts
- ≥1 Short con 10.000+ vistas
- Watch time ≥500 h
- CTR largo ≥6%, retención Short 30s ≥50%

## 9. PRÓXIMOS PASOS

1. `02_PROMPTS_Y_SCRIPTS/`: PROMPT_LARGO_V1, PROMPT_SHORT_V1, PROMPT_DIFF_V1 (genera diffs de prompt desde telemetría).
2. `03_CALENDARIO_Y_TEMAS/`: espejo del calendario GitHub.
3. `04_METRICAS_Y_EVIDENCIA/LOG_PUBLICACIONES.md` + schema de telemetría.
4. Automatización diaria: pull de métricas + 1 Short candidato.
5. Vincular YouTube + AdSense + 2FA antes del día 3.
6. **Conectar YouTube Analytics API al Nivel 1** (cierra el loop de aprendizaje sin humano).
7. Definir el criterio de salida del loop: cuándo el sistema se considera "autónomo" (propuesta: 20 publicaciones con diff de prompt aplicada y mejora medible).

## 10. CONTROL DE VERSIONES

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-17 | Creación. Contrato inicial. |
| 2.0 | 2026-10-17 | Telemetría primero. Validación humana → auto-decisión por umbrales. Diff de prompt versionada. YouTube Analytics API como paso 6. Criterio de autonomía. |

---
*Fin del Agent Execution Package v2.0*