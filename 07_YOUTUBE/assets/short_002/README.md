# Short #2 — Montaje (Claude)

**Fuentes:** `SHORT_PRODUCTION_CONTRACT.md`, `SHORT_002_WORK_ORDER.md`, `CHECKPOINT_SHORT_002_2026-10-18.md`, `ASSET_DELIVERY_STATUS.md`
**Estado:** pipeline listo y probado; **`SHORT_002_FINAL.mp4` pendiente de los 3 insumos oficiales.**

## Insumos que faltan (carpeta `source/`)

| Archivo | Origen | Cómo obtenerlo |
|---|---|---|
| `voz.mp3` | ElevenLabs, generación `JXhmveCwg80lfS8KCR7T` (~15,09 s, voz `TsKSGPuG26FpNj0JzQBq`) | Exportar desde la interfaz, o `ELEVENLABS_API_KEY=... python scripts/recuperar_voz.py`. No generar otra toma. |
| `EVIDENCIA.png` | [Drive](https://drive.google.com/file/d/1s-qPjVHQYNUFUX9zUoWp3cdmIgB_3LuJ/view) | Descargar sin modificar. |
| `mixkit-pressing-a-secret-code-2845.wav` | [Drive](https://drive.google.com/file/d/1SSzIzkXpc3GMH3c7_ak14JBd5GZULq5d/view) | Descargar sin modificar. |

La sesión de Claude en la nube no puede llegar a ElevenLabs ni a Drive (red restringida), por eso no los descargó.

## Generar el final

```
python scripts/montar.py          # exige los 3 insumos -> SHORT_002_FINAL.mp4 + qa/QA_REPORT.md
python scripts/montar.py --preview  # sin insumos -> SHORT_002_PREVIEW.mp4 con marcadores
```

Requisitos: Python 3 con Pillow, `ffmpeg`/`ffprobe` en el PATH, fuente Inter instalada (para subtítulos).

## Qué hace `montar.py`

1. Detecta las 4 pausas más largas de `voz.mp3` y corta las escenas ahí: sincronía con la duración real, sin tiempos fijos.
2. Une las 5 escenas de `cards/` con transiciones de 0,25 s.
3. Quema subtítulos centrados (blanco cálido, ≤5 palabras por línea) sobre la zona de interfaz de Shorts.
4. Cierra con `EVIDENCIA.png` original centrado sobre negro (escalado sin deformar) y la firma Mixkit al terminar la voz.
5. Exporta 1080×1920, 30 fps, H.264 + AAC 48 kHz, y escribe `qa/QA_REPORT.md` con medidas ffprobe, hashes de insumos y fotogramas.

## Archivos

- `guion.json` — guion del Work Order, un segmento por escena (texto sin cambios; "Fuente → Código → Evidencia" se lee como "Fuente, código, evidencia").
- `cards/` — escenas en negro #000000 y blanco cálido #F6F4F1; cian solo en el diagrama y el código. Regenerar con `python scripts/render_cards.py`.
- `scripts/montar.py`, `scripts/render_cards.py`, `scripts/recuperar_voz.py`.
- `SHORT_002_PREVIEW.mp4` + `qa/` — borrador sin insumos oficiales. No publicar.

## Pendientes fuera de este pipeline

- Coherencia con el Short #1: Claude no pudo ver las capturas (están en Drive). Revisar `qa/` contra ellas.
- La cifra "4 horas → 12 minutos" necesita fuente o marcarse como ejemplo (ver `SHORT_002_CONNECTORS_READINESS_2026-10-18.md`, sección 7).
- Publicación: fuera del alcance de Claude.
