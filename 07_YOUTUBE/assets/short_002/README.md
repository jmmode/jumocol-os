# Short #2 — Montaje (Claude, orden de producción V2)

**Fuentes:** `SHORT_PRODUCTION_CONTRACT.md`, `SHORT_002_WORK_ORDER.md`, `CHECKPOINT_SHORT_002_2026-10-18.md`, `ASSET_DELIVERY_STATUS.md`, orden de producción V2 (2026-10-18)
**Estado:** pipeline listo y probado. Logo y firma ya están en `source/` (extraídos del ZIP que subió Dirección). **`SHORT_002_FINAL.mp4` pendiente solo de `voz.mp3`.**

## Insumos (carpeta `source/`)

| Archivo | Origen | Cómo obtenerlo |
|---|---|---|
| `voz.mp3` | ElevenLabs, generación `JXhmveCwg80lfS8KCR7T` (~15,09 s, voz `TsKSGPuG26FpNj0JzQBq`) | **FALTA.** Exportar desde el [flow](https://elevenlabs.io/app/flows/agfb3cHnooatwzVq8p1z), o `ELEVENLABS_API_KEY=... python scripts/recuperar_voz.py`. No generar otra toma. |
| `EVIDENCIA.png` | [Drive](https://drive.google.com/file/d/1s-qPjVHQYNUFUX9zUoWp3cdmIgB_3LuJ/view) | Presente (2000×2000 RGBA, sha e0a08c130fc41824). |
| `mixkit-pressing-a-secret-code-2845.wav` | [Drive](https://drive.google.com/file/d/1SSzIzkXpc3GMH3c7_ak14JBd5GZULq5d/view) | Presente (1,02 s, 44,1 kHz estéreo, sha f30754a75ef15021). |

Ni Claude (red de la nube) ni Celeste (conectores sin descarga binaria) pueden mover `voz.mp3`: hace falta subirlo a mano a `source/` en la rama `claude/short-002-assets` (sirve también dentro de un ZIP).

## Generar el final

```
python scripts/montar.py            # exige los 3 insumos -> SHORT_002_FINAL.mp4 + qa/QA_REPORT.md
python scripts/montar.py --preview  # sin insumos -> SHORT_002_PREVIEW.mp4 con marcadores
```

Requisitos: Python 3 con Pillow, `ffmpeg`/`ffprobe` en el PATH, fuente Inter (o Arial en Windows).

## Cómo está construido

- **Timeline de 32 s** según la guía V2: Problema 0–5, Medición 5–11, Transformación 11–17, Evidencia 17–23, CTA 23–28, Cierre 28–32.
- **Voz sin alterar:** se corta en sus 4 pausas reales y cada frase se coloca en su escena. No se cambia velocidad ni tono; los intervalos sin voz los cubre la animación.
- **Escenas animadas** (`scripts/escenas.py`, Pillow, 30 fps): copiado entre hojas, barras de medición que suman el ciclo, código que se escribe, flujo Fuente → Código → Evidencia sincronizado con cada palabra, contador 240 → 12 min con barra proporcional, botón SÍGUENOS en la palabra "síguenos", logo con fundido.
- **Paleta:** negro #000000 y blanco cálido #F6F4F1; cian solo en código, diagrama y visualizaciones. Zoom lento (≤3 %) y transiciones de 0,3 s.
- **Subtítulos** centrados por la tinta real del texto, ≤5 palabras, en la franja 1330 px.
- **Cierre:** `EVIDENCIA.png` original (solo escala uniforme y opacidad) y firma Mixkit 0,3 s después de que termina la última frase.
- **QA automático** (`qa/QA_REPORT.md`): los 13 puntos de la orden V2, pico de audio, paleta, recursos con hash y capturas por escena.

## Archivos

- `guion.json` — guion del Work Order, un segmento por escena.
- `scripts/montar.py`, `scripts/escenas.py`, `scripts/recuperar_voz.py`.
- `SHORT_002_PREVIEW.mp4` + `qa/` — borrador sin insumos oficiales. No publicar.

## Pendientes fuera de este pipeline

- Coherencia con el Short #1 (QA punto 11): sus capturas están en Drive; revisar `qa/` contra ellas.
- «4 horas → 12 minutos» (QA punto 13): no hay medición en el repositorio. Riesgo editorial hasta respaldarlo o presentarlo como ejemplo.
- Publicación: fuera del alcance de Claude.
