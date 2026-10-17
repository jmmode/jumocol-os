# 07_YOUTUBE — Sistema de Generación de Contenido con Agentes

**Proyecto:** YouTube Content System (YCS)
**Fecha de inicio:** 2026-10-17
**Estado:** ACTIVO
**Objetivo:** Generar contenido de YouTube con agentes de IA para alcanzar monetización (1.000 suscriptores + 4.000 horas de watch time, o 10M vistas de Shorts en 90 días) antes del 31 de enero de 2027, cuando los umbrales se duplican para solicitantes nuevos.

---

## 1. CONTEXTO ESTRATÉGICO

### 1.1 Decisión de nicho

Inteligencia artificial aplicada + finanzas personales, en español, con foco en LatAm.

Razones:
- CPM alto: $10–15 USD por mil vistas en tech, $15–30 en finanzas.
- Oferta de calidad escasa en español.
- Demanda cultural en punto máximo (becas de IA en Colombia, adopción empresarial).
- Alineado con el stack real de Julián: TrendForge, agentes, automatización, TiviPlay, JUMOCOL OS.
- No requiere inventar un personaje: documenta el propio ecosistema.

### 1.2 Formato

- **Faceless:** pantalla + voz sintética + datos reales.
- **Híbrido:** Shorts diarios (suscriptores) + 1 video largo semanal de 12–20 min (horas de watch time).
- Matemática de referencia: 3 largos/semana × 12 min × 50% retención × 1.500 vistas = ~225 horas/semana. En 3 meses: 4.000+ horas.

### 1.3 Rutas de monetización

1. **YouTube Partner Program (YPP):** anuncios (55% largo / 45% Shorts).
2. **Nivel inferior (500 suscriptores):** membresías, Super Thanks, Super Chat — sin anuncios.
3. **Plataformas adyacentes:** TikTok, Instagram Reels, X — mismo contenido, distribución múltiple. YouTube no es el único canal.

### 1.4 Principio de arquitectura (heredado de JUMOCOL OS)

> El modelo razona. El documento conserva. El agente ejecuta. El código calcula. La evidencia valida. El humano decide excepciones.

Jerarquía de ejecución:
- **Nivel 1 — Código determinístico:** filtros, cálculos, validación, generación de archivos.
- **Nivel 2 — Agentes operativos:** localizar fuentes, leer reglas, ejecutar procedimientos, producir evidencia.
- **Nivel 3 — IA de alta capacidad:** solo inconsistencias, ambigüedad, excepciones.
- **Nivel 4 — Dirección:** Julián interviene en excepciones de negocio, aprobación, gobierno.

Principio rector: **usar la inteligencia mínima necesaria para cada tarea** (economía de tokens).

---

## 2. ESTRUCTURA DEL SISTEMA

```
07_YOUTUBE/
├── README.md                          ← este archivo (canónico)
├── 01_NICHO_Y_ESTRATEGIA.md           ← decisión de nicho, validación de tendencias
├── 02_CALENDARIO_30_DIAS.md           ← temas concretos Shorts + primer largo
├── 03_AGENT_EXECUTION_PACKAGE.md      ← paquete ejecutable para agentes
├── 04_SCRIPTS_Y_PROMPTS.md            ← prompts de generación de guiones
├── 05_METRICAS_Y_KPIs.md              ← suscriptores, horas, vistas, tokens consumidos
├── 06_DISTRIBUCION_MULTICANAL.md      ← TikTok, Reels, X como canales adyacentes
└── 07_EVIDENCIA/                      ← capturas, reportes, validaciones
```

---

## 3. AGENT EXECUTION PACKAGE (borrador)

### 3.1 Fuentes canónicas

- Drive: carpeta 05_CONTENIDO (JUMOCOL SYSTEM OS) — logos, sprints, videos, directorio.
- Drive: carpeta 07_YOUTUBE_CONTENT_SYSTEM (nueva, 2026-10-17).
- GitHub: jmmode/jumocol-os — decisiones de gobierno, TCRL, automatizaciones.
- Memoria personal: proyectos, empresas, avances, Life OS.

### 3.2 Reglas de negocio

1. Todo Short debe derivar de una fuente real del ecosistema (TiviPlay, agentes, Shopify, Life OS).
2. Todo largo semanal debe tener estructura: gancho (0–15s), problema, solución con datos, CTA.
3. Voz sintética: español neutro, tono directo, sin relleno.
4. No publicar sin revisión humana de Julián en las primeras 2 semanas (fase de calibración).
5. Medir tokens consumidos por pieza generada; optimizar prompts para reducir costo.

### 3.3 Secuencia de ejecución

1. Agente lee 01_NICHO_Y_ESTRATEGIA.md y 02_CALENDARIO_30_DIAS.md.
2. Agente genera guion (Nivel 2) usando 04_SCRIPTS_Y_PROMPTS.md.
3. Código valida formato, longitud, keywords (Nivel 1).
4. Agente produce evidencia (Nivel 2).
5. Escalamiento a Nivel 3 solo si hay ambigüedad.
6. Julián aprueba (Nivel 4) durante fase de calibración.
7. Publicación + registro en 05_METRICAS_Y_KPIs.md.

### 3.4 Definition of Done

- Guion generado desde fuente canónica, sin datos inventados.
- Validado por código (formato, longitud, keywords).
- Evidencia producida.
- Aprobado por Julián (fase de calibración).
- Registrado en métricas con consumo de tokens.
- Listo para publicación en YouTube + TikTok + Reels + X.

---

## 4. MÉTRICAS OBJETIVO (antes del 31/01/2027)

- 1.000 suscriptores.
- 4.000 horas de watch time (ruta larga) O 10M vistas de Shorts en 90 días.
- Consumo de tokens por pieza < umbral definido en 05_METRICAS_Y_KPIs.md.
- Intervención humana < 30 min/día en fase de calibración, < 10 min/día en fase estable.

---

## 5. PRÓXIMOS PASOS

1. Completar 01_NICHO_Y_ESTRATEGIA.md con validación de tendencias actual (octubre 2026).
2. Completar 02_CALENDARIO_30_DIAS.md con temas concretos.
3. Implementar 04_SCRIPTS_Y_PROMPTS.md con prompts optimizados para tokens.
4. Crear automatización diaria: revisión de métricas de YouTube + generación de 1 Short.
5. Evaluar stack de orquestación (LangGraph / Pydantic AI / OpenAI Agents SDK) según criterios de 14 del documento Q4.

---

**Estado:** CONTINUAR
**Siguiente fase:** Nichos validados + calendario 30 días + prompts de guion
**Horizonte:** 17 octubre 2026 → 31 enero 2027