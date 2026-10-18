# QA_REPORT — SHORT_002_PREVIEW.mp4

Generado por `scripts/montar.py`. Valores medidos sobre el MP4 exportado (ffprobe, ffmpeg, Pillow).

> **PREVIEW, no entregable.** Faltan en `source/`: voz.mp3.

| # | Requisito | Medido | Resultado |
|---|---|---|---|
| 1 | Duración 30–34 s | 32.00 s | OK |
| 2 | Resolución 1080×1920 | 1080×1920 | OK |
| 3 | 30 fps | 30 fps | OK |
| 4 | Audio y video reproducibles | h264 + aac 48000 Hz; decodificación sin errores | OK |
| 5 | Voz original ElevenLabs | FALTA voz.mp3 (preview con voz estimada) | PENDIENTE |
| 6 | Efecto de cierre oficial | sha f30754a75ef15021, entra en 28.30 s | OK |
| 7 | Logotipo original | EVIDENCIA.png sha e0a08c130fc41824; solo escala uniforme y opacidad | OK |
| 8 | Títulos centrados | desvío máx. 4 px entre márgenes | OK |
| 9 | Zona segura y legibilidad | contenido entre x 60–1020, y 200–1500 | OK |
| 10 | Subtítulos sincronizados | estimación por caracteres (preview sin voz) | PENDIENTE |
| 11 | Continuidad con Short #1 | capturas del Short #1 en Drive, no accesibles para Claude | PENDIENTE (manual) |
| 12 | Sin silencios vacíos ni congelamientos | imagen quieta máx. 0.00 s (t=0.0); pausa máx. entre frases 4.83 s cubierta por animación | OK |
| 13 | Afirmación «4 horas → 12 minutos» | sin fuente de medición en el repositorio | RIESGO EDITORIAL |

Pico de audio: -1.0 dBFS (sin clipping)

Paleta (fracción de píxeles saturados fuera de cian): problema 0.00%, medicion 0.00%, transformacion 0.00%, evidencia 0.02%, cta 0.00%, cierre 0.00% → OK

## Recursos utilizados

| Archivo | Estado | SHA-256 (16) |
|---|---|---|
| `source/voz.mp3` | **FALTA** | - |
| `source/EVIDENCIA.png` | presente | e0a08c130fc41824 |
| `source/mixkit-pressing-a-secret-code-2845.wav` | presente | f30754a75ef15021 |

## Timeline

| Escena | Inicio | Voz en timeline |
|---|---|---|
| problema | 0.00 s | 0.30–3.90 s |
| medicion | 5.00 s | 5.40–8.47 s |
| transformacion | 11.00 s | 13.30–14.66 s |
| evidencia | 17.00 s | 17.40–20.42 s |
| cta | 23.00 s | 23.40–25.64 s |
| cierre | 28.00 s | firma 28.30 s |

## Capturas

- `qa/escena_1_problema_04.25s.png`
- `qa/escena_2_medicion_10.10s.png`
- `qa/escena_3_transformacion_16.10s.png`
- `qa/escena_4_evidencia_22.10s.png`
- `qa/escena_5_cta_27.25s.png`
- `qa/escena_6_cierre_30.00s.png`

## Pendientes

- Subir `source/voz.mp3`.
- Comparar capturas con el Short #1 (punto 11).
- Respaldar «4 horas → 12 minutos» con la medición real o presentarlo como ejemplo antes de publicar (punto 13).
- Escuchar el MP4 completo: pronunciación, pausas y entrada de la firma (punto 5).
