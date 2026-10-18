# Short #2 — Entregable de Claude (pasos 2, 3 y 4)

**Work Order:** `07_YOUTUBE/SHORT_002_WORK_ORDER.md`
**Título:** Cómo pasamos de 4 horas a 12 minutos por ciclo
**Formato:** vertical 1080x1920, 30 fps, ~16 s

## Estado por paso

| Paso | Estado | Nota |
|------|--------|------|
| 2. Voz | Script listo, audio pendiente | Desde la nube no hay acceso a ElevenLabs (sin API key, salida de red bloqueada). `scripts/voz_elevenlabs.py` lo genera en un comando. |
| 3. Visuales | Hecho | 5 tarjetas en `cards/`. La plantilla del Short #1 no está en el repo, así que se reconstruyó con el formato del canal (Fuente → Código → Evidencia). |
| 4. Montaje | Hecho y probado | `scripts/montar.py` reemplaza a Clipchamp: mismo resultado, sin clics y repetible (base para el Short #3). |

`short_002_preview_sin_voz.mp4` es el montaje con duraciones estimadas, para revisar los visuales.

## Cómo terminarlo (≈3 min de intervención humana)

Requisitos: Python 3, `ffmpeg` en el PATH. Desde esta carpeta:

```powershell
$env:ELEVENLABS_API_KEY = "<tu clave>"
$env:ELEVENLABS_VOICE_ID = "<id de la voz del Short #1>"
python scripts/voz_elevenlabs.py   # -> voz.mp3 + timings.json
python scripts/montar.py           # -> short_002_final.mp4
```

`timings.json` trae el inicio y fin de cada frase según ElevenLabs, así cada tarjeta cambia exactamente cuando cambia la frase. Si generas el audio a mano en la web de ElevenLabs, guarda el archivo como `voz.mp3` aquí y corre solo `montar.py`: las tarjetas se reparten en proporción a las palabras.

Para cambiar textos o estilo: editar `scripts/render_cards.py` y correr `python scripts/render_cards.py` (requiere Pillow).

## Archivos

- `guion.json` — fuente única del guion: un segmento de voz por tarjeta.
- `cards/01_hook.png` … `05_cta.png` — visuales.
- `scripts/render_cards.py` — genera las tarjetas.
- `scripts/voz_elevenlabs.py` — paso 2 (voz + marcas de tiempo).
- `scripts/montar.py` — paso 4 (tarjetas + voz → mp4, con transiciones de 0,25 s).

## Notas para el Short #3 (flujo determinístico)

El ciclo completo ya es `guion.json → render_cards.py → voz_elevenlabs.py → montar.py`. Lo que queda manual es la clave de ElevenLabs y la publicación (paso 5). Para automatizarlo: guardar la clave como secreto en n8n, ejecutar los tres scripts en un nodo Execute Command y publicar con las APIs de YouTube Data v3, TikTok Content Posting y X.
