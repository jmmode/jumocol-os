"""Paso 2 — Genera la voz del Short #2 en ElevenLabs con marcas de tiempo.

Requiere variables de entorno:
  ELEVENLABS_API_KEY   clave de la cuenta
  ELEVENLABS_VOICE_ID  voz del canal (la misma del Short #1)
Opcional:
  ELEVENLABS_MODEL     por defecto eleven_multilingual_v2

Uso: python voz_elevenlabs.py
Salida: ../voz.mp3 y ../timings.json (inicio/fin de cada segmento, para el montaje)
"""
import base64
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    key = os.environ.get("ELEVENLABS_API_KEY")
    voice = os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice:
        raise SystemExit("Faltan ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID.")
    guion = json.loads((ROOT / "guion.json").read_text(encoding="utf-8"))

    # Texto completo y rango de caracteres de cada segmento
    text, ranges = "", []
    for seg in guion["segmentos"]:
        if text:
            text += " "
        ranges.append((len(text), len(text) + len(seg["voz"])))
        text += seg["voz"]

    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps",
        data=json.dumps({
            "text": text,
            "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.load(r)

    (ROOT / "voz.mp3").write_bytes(base64.b64decode(data["audio_base64"]))
    al = data["alignment"]
    starts, ends = al["character_start_times_seconds"], al["character_end_times_seconds"]
    timings = [
        {"card": seg["card"], "inicio": starts[a], "fin": ends[b - 1]}
        for seg, (a, b) in zip(guion["segmentos"], ranges)
    ]
    (ROOT / "timings.json").write_text(json.dumps(timings, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"ok voz.mp3 ({ends[-1]:.1f}s) y timings.json")


if __name__ == "__main__":
    main()
