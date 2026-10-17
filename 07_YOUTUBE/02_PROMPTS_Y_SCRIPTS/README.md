# 02 — PROMPTS Y SCRIPTS

**Carpeta:** `07_YOUTUBE/02_PROMPTS_Y_SCRIPTS/` | **Estado:** ACTIVO desde 2026-10-17

Prompts versionados que consumen los agentes Nivel 1 y 2. Regla: ningún agente genera contenido sin un prompt versionado de esta carpeta. Todo cambio pasa por diff (ver PROMPT_DIFF_V1), no por reescritura.

## Índice

| Archivo | Consumidor | Tokens máx entrada | Qué genera |
|---|---|---|---|
| `PROMPT_LARGO_V1.md` | Nivel 2 | <2.500 | Guion largo 12–20 min |
| `PROMPT_SHORT_V1.md` | Nivel 1 + 2 | <800 | 4 Shorts por largo |
| `PROMPT_DIFF_V1.md` | Nivel 2 | <1.200 | Diff de prompt desde telemetría |

## Presupuesto de tokens por ciclo (1 largo + 4 Shorts + 0-1 diff)

- Largo: ~2.500 (prompt) + ~3.000 (salida) = 5.500
- 4 Shorts: 4 × (~800 + ~400) = 4.800
- Diff (si aplica): ~1.200 + ~300 = 1.500
- **Total por ciclo:** ~11.800 tokens. Con 6 ciclos al mes: ~71.000 tokens.

## Regla de evolución

Cuando PROMPT_DIFF_V1 produce una diff aceptada, el orquestador crea `PROMPT_LARGO_V1.1.md` (o el equivalente) con la diff aplicada y actualiza este índice. El prompt viejo no se borra: queda como historial.

---
*Fin del README de 02_PROMPTS_Y_SCRIPTS*