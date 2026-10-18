# CHECKPOINT — EVIDENCIA LAB / SHORT #2 — 2026-10-18

**Fecha:** 2026-10-18  
**Estado:** EN PROCESO — VOZ GENERADA, MONTAJE FINAL PENDIENTE  
**Responsable del checkpoint:** ChatGPT / Celeste  
**Fuente contractual:** [SHORT_PRODUCTION_CONTRACT.md](./SHORT_PRODUCTION_CONTRACT.md) y [SHORT_002_WORK_ORDER.md](./SHORT_002_WORK_ORDER.md)

## 1. Contexto del ciclo

- Short #1: prototipo manual publicado en YouTube/TikTok/X. URL de referencia: https://www.youtube.com/shorts/M16sEaAag8A
- Short #2: fase multiagente (Grok, Celeste, Claude, OpenClaw), enfocada en documentar el flujo real.
- Short #3: fase posterior de automatización determinística (Python, n8n, OpenClaw); **no confundir con una automatización ya activa**.
- Título aprobado del #2: **Cómo pasamos de 4 horas a 12 minutos por ciclo**.
- Texto fuente del guion: ver Work Order. No alterar sin registrar decisión.

## 2. Identidad audiovisual y archivos canónicos

- Contrato VIGENTE en main: `07_YOUTUBE/SHORT_PRODUCTION_CONTRACT.md`.
- Identidad visual: logo original `EVIDENCIA.png` (no recrear); negro `#000000`, blanco cálido `#F6F4F1`; acentos azules/cian solo en diagramas/interfaces; títulos centrados y zona segura.
- Audio oficial: ElevenLabs, voz **Linda Gomez — Energetic and Upbeat**, Voice ID `TsKSGPuG26FpNj0JzQBq`.
- Efecto de cierre: `mixkit-pressing-a-secret-code-2845.wav`; no sustituir.
- Masters confirmados en Drive: https://drive.google.com/drive/folders/1AMX90fL4mnHZIuAqZMlbnVnbJ0Vi5umw
  - [Referencia de voz Short #1](https://drive.google.com/file/d/1lC4yMejZ20rPtA-xtzBwUcpRIkmXT1K7/view)
  - [Efecto cierre WAV](https://drive.google.com/file/d/1SSzIzkXpc3GMH3c7_ak14JBd5GZULq5d/view)
- Fichas de identidad visual y sonora están documentadas **solo en la rama** `docs/ai-entrypoint-multimodel-2026-10-17` bajo `07_YOUTUBE/BRAND/`; no afirmar que fueron fusionadas a main.
- Espejos de fichas en Drive, carpeta `07_YOUTUBE_CONTENT_SYSTEM/`: documentos `EVIDENCIA_LAB_IDENTIDAD_VISUAL_V0_1`, `EVIDENCIA_LAB_IDENTIDAD_SONORA_V0_1`.

## 3. Entregables y acciones realizadas por Celeste

| Acción | Resultado | Evidencia |
|---|---|---|
| Leer contrato y WO de main | COMPLETADO | Rutas arriba |
| Consolidar logos, colores, guion y efecto de cierre | COMPLETADO a nivel especificación | Contrato; docs BRAND en rama |
| Premontaje visual en 1080×1920/30 fps | REALIZADO COMO BORRADOR, **no es final** | Archivo de conversación `SHORT_002_PREMONTAJE_IDENTIDAD_SIN_LOCUCION.mp4` |
| Primera síntesis de voz para Short #2 | **COMPLETADO** en ElevenLabs; 1 variación, ~15.09 segundos | Flow `agfb3cHnooatwzVq8p1z`, sesión `QjAbc3A2Zne7FKA3DKFd`, generación `JXhmveCwg80lfS8KCR7T` |
| Segundo intento de síntesis | **FALLÓ**; no hay segunda toma utilizable | Flow `jsn4VrTIfbwwBmRkxII4`, sesión `5tZXXSdd62fyoWRVotOG` |
| MP3 Short #2 guardado en Drive | **NO VERIFICADO** | La toma exitosa está disponible en ElevenLabs; aún no existe un enlace persistente de master para esta toma |
| MP4 definitivo `SHORT_002_FINAL.mp4` | **PENDIENTE** | No se ha verificado ni publicado |
| Publicación YouTube/TikTok/X | **PENDIENTE** | Corresponde a responsable de publicación |

**Toma de voz exitosa:** https://elevenlabs.io/app/flows/agfb3cHnooatwzVq8p1z  
**Nota sobre exactitud:** el texto enviado al motor usó «Fuente. Código. Evidencia.» como forma hablada de `Fuente → Código → Evidencia`, sin cambiar el mensaje, y el modelo fue `eleven_multilingual_v2`. Antes del cierre, cotejar la locución con el guion del Work Order y revisar pronunciación y pausas.

## 4. Brechas / bloqueos actuales

1. Descargar/exportar el MP3 **exitoso del Short #2** desde ElevenLabs y conservarlo en la carpeta Drive de activos de audio con URL estable. No confundirlo con el MP3 de referencia del Short #1.
2. Montar el video definitivo sobre el **Short #1 como referencia maestra**, insertando el `EVIDENCIA.png` original y el efecto de cierre ya almacenado en Drive.
3. Ajustar cronograma y subtítulos a la voz de ~15.09 s; validar sincronía, márgenes seguros y continuidad visual.
4. Verificar resolución 1080×1920, 30 fps, logo original, paleta, audio, información verificable y MP4 exportado.
5. Publicación y medición quedan fuera de las tareas realizadas por Celeste; no declarar el Work Order cerrado sin evidencia.

**Atención:** los bocetos y borradores previos no son una plantilla aprobada. No reutilizar diseños desalineados ni inventar recursos de marca.

## 5. Próxima acción para el siguiente agente

**Acción única:** recuperar el MP3 del Short #2 generado exitosamente en ElevenLabs (flow y generación arriba), guardarlo en Drive como master de Short #2 y montar el MP4 respetando el contrato. Informar enlace final y checklist de validación. No iniciar otra síntesis sin necesidad.

## 6. Estado de gobierno

Este documento es checkpoint operacional, no aprobación de publicación ni prueba de cumplimiento final. No cambies `SHORT_002_WORK_ORDER.md` a COMPLETADO hasta tener evidencia de MP4 y publicaciones.

---

## 7. Avance de Claude (2026-10-18, 07:30 UTC)

**Responsable:** Claude (pasos 2, 3 y 4 de la tabla del Work Order)
**Entregable:** [PR #1](https://github.com/jmmode/jumocol-os/pull/1), rama `claude/short-002-assets`, carpeta `07_YOUTUBE/assets/short_002/`. **No fusionado a main.**

| Elemento | Estado | Cumple contrato |
|---|---|---|
| `scripts/montar.py`: tarjetas + MP3 → MP4 1080×1920/30 fps con ffmpeg, transiciones 0,25 s | Hecho; probado con audio de prueba | Sí en formato y en sincronía con la duración real del MP3. Falta añadir logo PNG, efecto de cierre y subtítulos. |
| `scripts/voz_elevenlabs.py`: voz + marcas de tiempo por frase (`timings.json`) | Escrito, **no ejecutado** | Debe usar Voice ID `TsKSGPuG26FpNj0JzQBq`. No hace falta correrlo si se recupera la toma de Celeste: `montar.py` acepta cualquier `voz.mp3`. |
| `cards/*.png` (5 tarjetas) y `short_002_preview_sin_voz.mp4` | Hecho como borrador | **No.** Se hicieron antes de que el contrato llegara a main: usan fondo azul oscuro y acento verde, y el texto "EVIDENCIA LAB" en lugar de `EVIDENCIA.png`. No usar como final. |

**Bloqueo:** desde la sesión en la nube de Claude no se puede llegar a ElevenLabs ni a Google Drive (red restringida, sin credenciales). Por eso no puede descargar la toma `JXhmveCwg80lfS8KCR7T` ni el logo o el efecto de cierre.

**Para cerrar el montaje con el pipeline de Claude:**
1. Subir a `07_YOUTUBE/assets/short_002/` (o a la rama del PR): el MP3 exitoso como `voz.mp3`, `EVIDENCIA.png` y `mixkit-pressing-a-secret-code-2845.wav`.
2. Claude rehace las tarjetas con la paleta del contrato (#000000 / #F6F4F1, cian solo en diagramas), inserta el PNG original, añade subtítulos centrados y la firma sonora de cierre, y genera `SHORT_002_FINAL.mp4`.
3. Validar contra la checklist de la sección "Validación" del contrato antes de publicar.

**Fricción para el Short #3:** el paso manual que queda es mover audio y recursos de marca de ElevenLabs/Drive al repo. Si viven en el repo (o hay un secreto con la API de ElevenLabs), el ciclo `guion → voz → tarjetas → montaje` queda en un solo comando.
