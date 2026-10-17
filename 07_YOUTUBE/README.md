# 07_YOUTUBE — Sistema de Generación de Contenido con Agentes

**Proyecto:** YouTube Content System (YCS)
**Fecha de inicio:** 2026-10-17
**Estado:** ACTIVO
**Objetivo:** Generar contenido de YouTube con agentes de IA para alcanzar monetización (1.000 suscriptores + 4.000 horas de watch time, o 10M vistas de Shorts en 90 días) antes del 31 de enero de 2027, cuando los umbrales se duplican para solicitantes nuevos.
**Gobierno:** DEC-2026-10-17-012

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

### 1.4 Canal

- **Canal nuevo** (nombre provisional, pendiente de validación con telemetría). Ver DEC-2026-10-17-012.
- **Music relax** (julianmontealegre7@gmail.com): excluido. 2 suscriptores, 9 horas calificadas, 0 subidas en 90 días, 0 vistas de Shorts, 0 infracciones. No califica para ningún umbral.
- Umbral aplicable: solicitante nuevo. Meta de calificación: antes del 31/01/2027.
- Conexión Analytics API: OAuth con la cuenta dueña primaria del canal nuevo.

### 1.5 Principio de arquitectura (heredado de JUMOCOL OS)

> El modelo razona. El documento conserva. El agente ejecuta. El código calcula. La evidencia valida. El humano decide excepciones.

Jerarquía de ejecución:
- **Nivel 1 — Código determinístico:** filtros, cálculos, validación, generación de archivos.
- **Nivel 2 — Agentes operativos:** localizar fuentes, leer reglas, ejecutar procedimientos, producir evidencia.
- **Nivel 3 — IA de alta capacidad:** solo inconsistencias, ambigüedad, excepciones.
- **Nivel 4 — Dirección:** Julián interviene en excepciones de negocio, aprobación, gobierno.

Principio rector: **usar la inteligencia mínima necesaria para cada tarea** (economía de tokens).

---

## 2. ESTRUCTURA REAL DEL SISTEMA

```
07_YOUTUBE/
├── README.md                              ← este archivo (canónico, sincronizado 2026-10-17)
├── 01_AGENT_EXECUTION_PACKAGE.md         ← paquete ejecutable v1.0 (telemetría primero)
├── 02_CALENDARIO_30_DIAS.md              ← 6 largos + 24 Shorts, sin referencia a Pereira
└── 02_PROMPTS_Y_SCRIPTS/
│   ├── README.md                          ← índice + presupuesto de tokens
│   ├── PROMPT_LARGO_V1.md                ← guion 12–20 min, ~11.800 tokens/ciclo
│   ├── PROMPT_SHORT_V1.md               ← 4 hooks por categoría
│   └── PROMPT_DIFF_V1.md                 ← diff de prompt desde telemetría
└── 06_ORQUESTADOR/
    ├── README.md
    ├── ORQUESTADOR_V1.md                 ← 8 funciones, 7 estados, loops diario/semanal
    └── orquestador.py                    ← implementación con dataclasses tipadas
```

GitHub (`jmmode/jumocol-os`) es la **única fuente canónica**. Las carpetas de Drive bajo 07_YOUTUBE_CONTENT_SYSTEM son espejo humano de solo lectura.

---

## 3. AGENT EXECUTION PACKAGE (v1.0)

### 3.1 Fuentes canónicas

- GitHub: jmmode/jumocol-os — 07_YOUTUBE/, 00_GOVERNANCE/DECISIONS/, 02_RUNTIME/ (checkpoint TiviPlay 2026-10-09).
- Drive: 07_YOUTUBE_CONTENT_SYSTEM (espejo).
- Memoria personal: proyectos, empresas, avances, Life OS.

### 3.2 Reglas de negocio

1. Todo Short debe derivar de una fuente real del ecosistema (TiviPlay, agentes, Shopify, Life OS).
2. Todo largo semanal debe tener estructura: gancho (0–15s), problema, solución con datos, CTA.
3. Voz sintética: español neutro, tono directo, sin relleno.
4. Fase de calibración (primeras 2 semanas): revisión humana de Julián en cada publicación. Después, umbrales automáticos (Short >10k vistas/48h → 3 variantes; <1k → archivo con razón; caída >40% vs baseline → flag humano).
5. Medir tokens consumidos por pieza generada; optimizar prompts para reducir costo.
6. El PROMPT DIFF V1 versiona cada cambio de prompt con número en la razón.

### 3.3 Secuencia de ejecución

1. Agente lee 02_CALENDARIO_30_DIAS.md y 02_PROMPTS_Y_SCRIPTS/.
2. Agente genera guion (Nivel 2) usando PROMPT_LARGO_V1 o PROMPT_SHORT_V1.
3. Código valida formato, longitud, keywords (Nivel 1) — orquestador.py.
4. Agente produce evidencia (Nivel 2).
5. Escalamiento a Nivel 3 solo si hay ambigüedad.
6. Julián aprueba (Nivel 4) durante fase de calibración; después, umbrales automáticos.
7. Publicación + pull de métricas (YouTube Analytics API, paso 6 del orquestador) + registro.
8. PROMPT DIFF V1 propone diff si la telemetría lo justifica.

### 3.4 Definition of Done

- Guion generado desde fuente canónica, sin datos inventados.
- Validado por código (formato, longitud, keywords).
- Evidencia producida.
- Aprobado por Julián (fase de calibración) o por umbral automático.
- Registrado en métricas con consumo de tokens.
- Listo para publicación en YouTube + TikTok + Reels + X.

### 3.5 Criterio de autonomía

20 publicaciones con diff de prompt aplicada y mejora medible → el sistema se considera solo.

---

## 4. MÉTRICAS OBJETIVO (antes del 31/01/2027)

- 1.000 suscriptores.
- 4.000 horas de watch time (ruta larga) O 10M vistas de Shorts en 90 días.
- Consumo de tokens por pieza < umbral definido en 02_PROMPTS_Y_SCRIPTS/README.md (~11.800 tokens/ciclo, ~71.000/mes con 6 ciclos).
- Intervención humana < 30 min/día en fase de calibración, < 10 min/día en fase estable.

---

## 5. PRÓXIMOS PASOS

1. Crear el canal nuevo en YouTube con nombre provisional.
2. Conectar YouTube Analytics API (OAuth, cuenta dueña) como paso 6 del orquestador.
3. Conectar la función 2 del orquestador al LLM real.
4. Correr el demo de orquestador.py para confirmar aserciones.
5. Publicar el primer Short de calibración y medir.

---

**Estado:** CONTINUAR
**Siguiente fase:** Canal creado + Analytics API conectada + primer Short publicado
**Horizonte:** 17 octubre 2026 → 31 enero 2027
