# EVIDENCIA LAB — IDENTIDAD SONORA V0.1
Fecha: 2026-10-18
Estado: REFERENCIAS MAESTRAS IDENTIFICADAS; integración de binarios en Drive y automatización pendientes.

## Voz canónica (ElevenLabs)
- Proveedor: ElevenLabs — https://elevenlabs.io/app/speech-synthesis/text-to-speech
- Voice ID proporcionado por Dirección: `TsKSGPuG26FpNj0JzQBq`
- Nombre identificado en el archivo recibido: `Linda Gomez - Energetic and Upbeat` (metadato de nombre, no verificación independiente de identidad en plataforma).
- Archivo de referencia: `ElevenLabs_2026-10-18T03_30_34_Linda Gomez - Energetic and Upbeat_pvc_s50_m2.mp3`
- Medición archivo: 18.338 s; 44.1 kHz; mono. No se han verificado ajustes exactos de stability, similarity, style, speed o modelo; NO inventarlos. 
- Contenido pronunciado en referencia: «La mayoría de los negocios siguen dependiendo de personas para tareas que un sistema ya puede resolver. Nosotros medimos cuánto tiempo se pierde en procesos manuales y lo convertimos en código determinístico. Tres procesos. Menos de quince minutos de intervención humana por semana. Si quieres ver cómo se construye, síguenos.»
- Criterio: conservar voice_id y replicar parámetros una vez recuperados desde ElevenLabs; no sustituir por otra voz sin decisión.

## Firma sonora / efecto
- Fuente de archivo original aportado: `mixkit-pressing-a-secret-code-2845.wav`.
- Medición: 1.020 s; 44.1 kHz; estéreo.
- Rol propuesto por Dirección: efecto de cierre oficial. Confirmar ubicación exacta comparando con el master exportado del Short #1.
- No asumir licencia de redistribución ni atribución: verificar condiciones de Mixkit y conservar referencia del archivo original.

## Lineamientos provisionales
1. Voz narrativa consistente vía Voice ID `TsKSGPuG26FpNj0JzQBq`.
2. Música/efectos de fondo solo cuando estén identificados y autorizados; no inventar pistas.
3. Preservar el efecto de cierre sin variar velocidad ni tono; la colocación temporal exacta se medirá sobre el video maestro.
4. Exportar shorts en 1080 × 1920, 30 fps, con niveles de audio verificables.
5. Cualquier agente deberá consultar `07_YOUTUBE/BRAND/IDENTIDAD_VISUAL.md` y este documento antes de generar un nuevo video.

## Almacenamiento y trazabilidad
- Este MD es la especificación técnica canónica; todavía está en rama `docs/ai-entrypoint-multimodel-2026-10-17`, no en main.
- Drive: `07_YOUTUBE_CONTENT_SYSTEM/` conserva un espejo humano.
- Los dos audios originales se recibieron como archivos de conversación; los dos masters están cargados y verificados mediante listado de Drive el 2026-10-18.
- No afirmar que ElevenLabs o Clipchamp estén conectados mediante API hasta comprobarlo.

## Faltantes para V1
- Parámetros precisos de síntesis de ElevenLabs.
- Identificación y autorización de la música de fondo si existe.
- Mapeo temporal exacto del efecto final comparado con el MP4 del Short #1.
- Enlaces verificables de los masters en Drive y derechos de uso.

## Masters verificados en Google Drive (2026-10-18)
Carpeta: https://drive.google.com/drive/folders/1AMX90fL4mnHZIuAqZMlbnVnbJ0Vi5umw
- [Voz ElevenLabs Linda Gomez MP3](https://drive.google.com/file/d/1lC4yMejZ20rPtA-xtzBwUcpRIkmXT1K7/view) — 310344 bytes.
- [Efecto cierre Mixkit WAV](https://drive.google.com/file/d/1SSzIzkXpc3GMH3c7_ak14JBd5GZULq5d/view) — 179988 bytes.
Los archivos fueron subidos sin edición y se verificó su existencia y tamaño en Drive. No se ha verificado aún hash SHA256 remoto.
