# SHORT #2 — DIAGNÓSTICO DE CONECTORES Y PLAN DE CIERRE

**Fecha:** 2026-10-18  
**Estado:** INFORME DE PREPRODUCCIÓN — NO ES MP4 FINAL  
**Responsable:** ChatGPT / Celeste  
**Repositorio:** `jmmode/jumocol-os`

## 1. Fuentes verificadas
- `07_YOUTUBE/SHORT_PRODUCTION_CONTRACT.md` — vigente en `main`.
- `07_YOUTUBE/SHORT_002_WORK_ORDER.md` — versión vigente, método multiagente.
- `07_YOUTUBE/CHECKPOINT_SHORT_002_2026-10-18.md` — incluye avance de Claude.
- `07_YOUTUBE/assets/short_002/ASSET_DELIVERY_STATUS.md` — enlaces permanentes de activos.
- PR #1: https://github.com/jmmode/jumocol-os/pull/1 — rama `claude/short-002-assets` (**no fusionada en main**).

## 2. Inventario real de herramientas y conectores en esta sesión
| Herramienta | Disponibilidad | Hecho verificado | Uso recomendado |
|---|---|---|---|
| GitHub | CONECTADO / FUNCIONAL | Lectura de archivos privados y árbol de rama Claude, escritura documental previa | Control de versiones, contrato, revisión y entregables |
| Google Drive | CONECTADO / FUNCIONAL | Archivos masters almacenados y listados en `07_YOUTUBE_CONTENT_SYSTEM` | Mantener assets pesados en Drive |
| ElevenLabs | CONECTADO / FUNCIONAL | Generación `JXhmveCwg80lfS8KCR7T` terminada, ~15.093 s, Voice ID oficial | Recuperar esta toma SIN regenerar |
| Python / FFmpeg | DISPONIBLE en runtime de producción; pipeline de Claude en PR | Existe `scripts/montar.py` y `scripts/render_cards.py`, pero no se ha verificado versión final bajo contrato | Render determinístico y QA |
| Clipchamp | Sin conector de control confirmado | Work Order lo menciona; no hay proyecto original editable verificado | Opcional para revisión humana; no forzar dependencia |
| HeyGen y Artlist | Herramientas disponibles, sin uso verificado en Short #2 | No sustituyen voice ID de ElevenLabs sin decisión | Evitar costo y deriva creativa |
| Grok / OpenClaw | Agentes externos al runtime actual | Documentados en Work Order; no confirmada conexión máquina-a-máquina | Delegar solo tareas verificables con responsables |
| Publicación YouTube/TikTok/X | Sin permiso operativo comprobado en este ciclo | Canales identificados y Short #1 publicado | Entrega final para responsable autorizado, sin declarar publicación |

## 3. Activos oficiales
- Logo original `EVIDENCIA.png`: https://drive.google.com/file/d/1s-qPjVHQYNUFUX9zUoWp3cdmIgB_3LuJ/view
- Efecto cierre `mixkit-pressing-a-secret-code-2845.wav`: https://drive.google.com/file/d/1SSzIzkXpc3GMH3c7_ak14JBd5GZULq5d/view
- Carpeta master audio: https://drive.google.com/drive/folders/1AMX90fL4mnHZIuAqZMlbnVnbJ0Vi5umw
- Primera toma Short #2 (nuevo audio, NO es master #1): https://elevenlabs.io/app/flows/agfb3cHnooatwzVq8p1z
  - voice_id `TsKSGPuG26FpNj0JzQBq`; session `QjAbc3A2Zne7FKA3DKFd`; generación `JXhmveCwg80lfS8KCR7T`; ~15.093 s.
  - Estado: generada; aún **sin enlace permanente verificado** en Drive/GitHub para el MP3.
- Capturas referencia Short #1: `07_YOUTUBE/assets/short_002/ASSET_DELIVERY_STATUS.md` con enlaces Drive 3/9/15/22/29 s.
- Short #1 publicación: https://www.youtube.com/shorts/M16sEaAag8A (archivo original facilitado en conversación).

## 4. Hallazgos críticos de integración
1. **El bloqueo no es ausencia de conector ElevenLabs.** Ya está conectado y la toma está completa. Falta transferir el MP3 generado al espacio consumible por render.
2. **El código de Claude es punto de partida, no entrega final.** PR #1 tiene `scripts/montar.py`, `scripts/render_cards.py`, `scripts/voz_elevenlabs.py` y tarjetas iniciales no conformes; no fusionar ni usar esas tarjetas sin corregir.
3. **No usar el MP3 del Short #1 como narración del #2.** Tampoco crear una nueva voz o usar HeyGen/Artlist para reemplazar ElevenLabs.
4. **No afirmar cumplimiento si faltan QA audiovisual, evidencia de cifras o `SHORT_002_FINAL.mp4` comprobado.**
5. La fuente de identidad es el contrato de `main`. Fichas `BRAND/IDENTIDAD_VISUAL.md` y `BRAND/IDENTIDAD_SONORA.md` todavía están en rama `docs/ai-entrypoint-multimodel-2026-10-17`.

## 5. Flujo optimizado — un ejecutor de montaje, sin ciclos redundantes
**Paso A — Preparar insumos:** recuperar exactamente MP3 generado; descargar logo original y cierre WAV desde Drive. Guardar hashes y duración de cada insumo.
**Paso B — Montaje:** sobre código de Claude o FFmpeg, recrear escenas basadas en Short #1; no reutilizar las tarjetas azul/verde del PR. Ajustar timeline a duración real del MP3; conservar cierre con firma Mixkit; subtítulos/títulos centrados dentro zona segura.
**Paso C — QA determinístico:** verificar dimensiones 1080×1920, 30 fps, canales/sonido, logo PNG sin recomponer, colores #000000/#F6F4F1, narración y subtítulos, cierre, ausencia de música inventada. Revisar legibilidad con capturas de frames.
**Paso D — Entrega:** guardar `SHORT_002_FINAL.mp4` más reporte técnico en `07_YOUTUBE/assets/short_002/` o Drive con enlace persistente; solo después asignar a publicación humana/agente con acceso.

## 6. Prompt maestro recomendado para ejecutar (copiar al agente montador)
> Eres ejecutor técnico del Short #2 de Evidencia Lab. Lee obligatoriamente `07_YOUTUBE/SHORT_PRODUCTION_CONTRACT.md`, `07_YOUTUBE/SHORT_002_WORK_ORDER.md`, el checkpoint y el PR #1 de Claude. No solicites nuevo guion ni regeneres voz. Recupera la toma exitosa ElevenLabs generación `JXhmveCwg80lfS8KCR7T` del flow `agfb3cHnooatwzVq8p1z`, Voice ID `TsKSGPuG26FpNj0JzQBq`; almacena el MP3 como master del Short #2. Recupera de Drive el logo EVIDENCIA.png original y el efecto mixkit-pressing-a-secret-code-2845.wav. Aplica solo la identidad #000000/#F6F4F1; azul/cian únicamente en diagramas; no reutilices tarjetas azul/verde del PR. Usa el Short #1 publicado y sus capturas como referencia maestra de composición y ritmo. Ejecuta montaje determinístico Python/FFmpeg reutilizando y corrigiendo el código del PR #1; exporta `SHORT_002_FINAL.mp4` 1080×1920, 30 fps, títulos/subtítulos centrados en zona segura, locución sincronizada y firma de cierre. Entrega MP4, enlace estable, inventario de insumos, evidencia de QA y bloqueos reales. No publiques ni marques COMPLETADO si no están verificadas todas las condiciones. No realices nuevas generaciones de voz ni contrates herramientas.

## 7. Criterio de terminación
**PENDIENTE** hasta que exista MP4 final descargable, audio/visuales validado y revisión de afirmaciones `4 horas → 12 minutos` respaldada por fuente o indicada como ejemplo de demostración, evitando publicar afirmaciones no verificadas.
