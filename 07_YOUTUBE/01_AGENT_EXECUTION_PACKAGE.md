# 01 — AGENT EXECUTION PACKAGE (AEP) — YouTube Content System

**Versión:** 1.0 | **Fecha:** 2026-10-17 | **Estado:** ACTIVO
**Autor de diseño:** Grok (SpaceXAI) bajo dirección de Julián Montealegre
**Hereda patrón de:** JUMOCOL OS / TiviPlay Runtime Operativo (checkpoint 2026-10-09)
**Ubicación canónica:** GitHub `jmmode/jumocol-os` → `07_YOUTUBE/` | Espejo: Drive → `7_YouTube_Content_System/01_AGENT_EXECUTION_PACKAGE/`

---

## 1. PROPÓSITO

Definir el contrato de salida del sistema de contenido de YouTube: qué entra, qué se genera, qué se valida, qué se publica y qué se mide. Cualquier agente (Grok, Codex, Claude, u otro) debe poder ejecutar este paquete sin historial de conversaciones previas y producir entregables auditables.

Regla madre (heredada del documento de septiembre de JUMOCOL OS): *descubrir una vez, documentar una vez, codificar lo determinístico, enseñar al agente, validar con evidencia, reutilizar muchas veces.*

## 2. NICHO Y POSICIONAMIENTO

- **Nicho:** Inteligencia artificial aplicada + finanzas personales, en español, para audiencia hispanohablante (Colombia, México, España, Argentina como mercados primarios).
- **Diferenciador:** Documentación del stack real del operador (TiviPlay, Life OS, agentes, automatización), no teoría genérica. Faceless: pantalla + voz sintética + datos reales.
- **Por qué este nicho:** CPM alto (tech 10–15 USD/1k vistas; finanzas 15–30 USD/1k vistas en LatAm), oferta de calidad escasa en español, demanda cultural en máximo (becas de IA en Colombia anunciadas la misma semana de este documento).
- **Contenido PROHIBIDO en el paquete:** mudanza a Pereira, planes de reubicación cancelados, datos personales sensibles de terceros, claims no verificables.

## 3. UMERALES DE MONETIZACIÓN (vigentes al 2026-10-17)

| Ruta | Requisito | Ventana |
|---|---|---|
| Larga (Partner Program) | 1.000 suscriptores + 4.000 h de watch time | 12 meses |
| Corta (Shorts) | 10.000.000 vistas de Shorts | 90 días |
| Nivel inferior (sin anuncios) | 500 suscriptores + 3 subidas públicas/90 días + 3.000 h o 3M vistas Shorts | habilita membresías, Super Thanks, Super Chat |

**Alerta crítica:** desde el 1 de febrero de 2027 los umbrales para solicitantes NUEVOS se duplican (8.000 h o 20M vistas Shorts). Meta operativa: monetizar antes del 31 de enero de 2027 con el umbral viejo.

Reparto de ingresos: 55% formato largo, 45% Shorts.

## 4. JERARQUÍA DE AGENTES (heredada)

1. **Nivel 1 — Código determinístico:** todo lo repetible (subtítulos, recortes, metadatos, scheduling) se codifica, no se pide a un LLM.
2. **Nivel 2 — Agentes operativos:** generación de guiones, variación de hooks, adaptación cross-platform. Consumen prompts versionados de `02_PROMPTS_Y_SCRIPTS/`.
3. **Nivel 3 — IA de alta capacidad:** solo excepciones (crisis de reputación, decisión de pivote, análisis de competencia profundo).

## 5. SECUENCIA DE PRODUCCIÓN (un ciclo = 1 largo + 4 Shorts)

1. **FUENTE:** el agente lee `05_FUENTES_Y_MATERIAL_RAW/` (TiviPlay runtime, Life OS, análisis de tendencias, experimentos Shopify) y extrae 3–5 claims verificables.
2. **GUION:** Nivel 2 genera guion del largo (12–20 min) usando el prompt versionado `PROMPT_LARGO_V1`. Estructura obligatoria: hook (0–30s), contexto, 3 bloques de valor, evidencia, CTA.
3. **VALIDACIÓN HUMANA:** revisión obligatoria en semana 1 (calibración). Desde semana 2, muestreo del 30%.
4. **DERIVACIÓN:** Nivel 1 genera 4 Shorts del largo (hooks distintos, 30–60s) con `PROMPT_SHORT_V1`.
5. **METADATOS:** Nivel 1 produce título, descripción, tags, capítulos, thumbnail text — sin LLM.
6. **PUBLICACIÓN:** checklist de `04_METRICAS_Y_EVIDENCIA/` antes de subir.
7. **MEDICIÓN:** 48h post-publicación, el agente registra vistas, CTR, retención y decide: duplicar formato / iterar / archivar.

## 6. VALIDACIONES (Definition of Done por entregable)

- [ ] El guion cita al menos 1 fuente real del ecosistema (TiviPlay, Life OS, Shopify, etc.)
- [ ] Ningún claim sin evidencia o marcado como hipótesis
- [ ] Duración del largo entre 12 y 20 minutos
- [ ] 4 Shorts derivados con hooks distintos
- [ ] Metadatos completos (título ≤ 60 chars, descripción con timestamps)
- [ ] Sin menciones a Pereira/reubicación
- [ ] Sin datos personales de terceros
- [ ] Registrado en `04_METRICAS_Y_EVIDENCIA/LOG_PUBLICACIONES.md`

## 7. MÉTRICAS OBJETIVO (primeros 30 días)

- 6 largos + 24 Shorts publicados
- ≥ 1 Short con 10.000+ vistas (señal de formato ganador)
- Watch time acumulado ≥ 500 h (camino a 4.000)
- CTR promedio ≥ 6% en largos
- Retención 50%+ a los 30 segundos en Shorts

## 8. PRÓXIMOS PASOS

1. Completar `02_PROMPTS_Y_SCRIPTS/` con PROMPT_LARGO_V1 y PROMPT_SHORT_V1 (ahorro de tokens: contexto mínimo, ejemplos few-shot cortos).
2. Poblar `03_CALENDARIO_Y_TEMAS/` (espejo del calendario de GitHub `02_CALENDARIO_30_DIAS.md`).
3. Crear `04_METRICAS_Y_EVIDENCIA/LOG_PUBLICACIONES.md`.
4. Automatización diaria: revisión de métricas + generación de 1 Short candidato.
5. Vincular cuenta de YouTube + AdSense + 2FA antes del día 3.

## 9. CONTROL DE VERSIONES

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-17 | Creación. Contrato inicial. |

---
*Fin del Agent Execution Package v1.0*