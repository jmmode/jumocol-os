# SHORT_003_AUTOMATION_SPEC.md
**Fecha:** 2026-10-18  
**Estado:** APROBADA  
**Objetivo:** Pasar de mapeo multiagente (Short #2) a generación determinística de Shorts #3, #4 y #5 con mínima intervención humana y consumo de tokens controlado.

## 1. Contrato de entrada / salida

**Entrada (JSON canónico):**
```json
{
  "short_id": "003",
  "tema": "La regla que uso para no quemar tokens con IA",
  "claim": "Usar la inteligencia mínima necesaria: Nivel 1 código → Nivel 2 agente → Nivel 3 IA solo excepciones → Nivel 4 humano.",
  "evidencia": "Jerarquía documentada en 07_YOUTUBE/README.md y AGENTS.md",
  "numero_clave": "4 niveles",
  "cta": "Si quieres ver cómo se construye, síguenos."
}
```

**Salida esperada:**
- `SHORT_00X_FINAL.mp4` (1080×1920, 30 fps, ≤35 s)
- `metadatos.json` (título, descripción, tags)
- `qa_report.json` (duración, resolución, paleta, zona segura)
- Registro de tokens consumidos (< 800 tokens totales)

## 2. Flujo determinístico (orquestador_short.py)

1. `cargar_entrada(json)` → valida campos obligatorios.
2. `generar_guion_corto(claim)` → **1 sola llamada LLM** (~400–600 tokens). Prompt fijo: “Reescribe estas 4 frases en estilo Evidencia Lab, máximo 80 palabras, sin inventar datos”.
3. `generar_voz(texto)` → ElevenLabs API (voz ya mapeada: Linda Gomez).
4. `render_visuales(guion, numero_clave)` → plantilla parametrizada (HTML/CSS o MoviePy). Estructura fija: título grande → diagramas/barras → flujo FUENTE→CÓDIGO→EVIDENCIA → número clave → CTA.
5. `montar_mp4(voz, visuales, logo, firma)` → FFmpeg.
6. `validar()` → checks técnicos automáticos (duración, resolución, paleta #000000/#F6F4F1, zona segura).
7. `entregar()` → MP4 + metadatos listos. Humano solo escucha en fase de calibración.

## 3. Plantilla visual reutilizable (Shorts #3–#5)

- Fondo negro puro.
- Tipografía grande centrada (zona segura).
- Acentos cian solo en diagramas y barras.
- Escenas fijas: 
  1. Problema (número grande + texto)
  2. Medición / regla
  3. Código / flujo
  4. Resultado (12 min / X min)
  5. CTA + logo EVIDENCIA

## 4. Optimización de tokens

- El modelo **nunca** recibe el repositorio completo ni prompts largos.
- Solo recibe: claim + 4 frases base + instrucción de reescritura.
- Todo lo demás (timing, overlays, validación, metadatos) es código.
- Meta: < 800 tokens por Short.

## 5. Criterios de éxito (Short #3)

- MP4 generado en < 5 minutos de ejecución de código.
- Intervención humana ≤ 8 minutos (solo escucha + aprobación).
- Tokens consumidos registrados y < 800.
- Formato idéntico al Short #2 (identidad visual y sonora).

## 6. Próximos pasos de implementación

1. Validar esta especificación (Julián). — APROBADA 2026-10-18
2. Crear `07_YOUTUBE/assets/short_template/orquestador_short.py` (esqueleto).
3. Ejecutar con el JSON del Short #3.
4. Medir tokens y tiempo real.
5. Replicar para #4 y #5 con nuevos JSONs.

**Responsable de implementación:** Código determinístico + 1 llamada LLM acotada.  
**Límite de autonomía:** El sistema genera el MP4; la publicación sigue requiriendo aprobación humana en fase de calibración.
