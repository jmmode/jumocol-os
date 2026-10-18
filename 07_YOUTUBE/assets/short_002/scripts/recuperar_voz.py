"""Descarga la locución oficial YA GENERADA del Short #2 desde el historial de ElevenLabs.

No genera voz nueva: solo baja el audio de la generación existente.

Requiere: ELEVENLABS_API_KEY (cuenta donde está la toma).
Uso: python recuperar_voz.py [HISTORY_ITEM_ID]
     (por defecto JXhmveCwg80lfS8KCR7T, según ASSET_DELIVERY_STATUS.md)
Salida: ../source/voz.mp3

Si el ID no corresponde a un elemento del historial (los IDs de Flows pueden diferir),
exportar el MP3 desde la interfaz de ElevenLabs y guardarlo como source/voz.mp3.
"""
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

VOICE_ID = "TsKSGPuG26FpNj0JzQBq"
DEFAULT_ITEM = "JXhmveCwg80lfS8KCR7T"
OUT = Path(__file__).resolve().parent.parent / "source" / "voz.mp3"


def main():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        raise SystemExit("Falta ELEVENLABS_API_KEY.")
    item = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ITEM
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/history/{item}/audio", headers={"xi-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            audio = r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ElevenLabs respondió {e.code} para {item}. Exporta el MP3 desde la interfaz.")
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_bytes(audio)
    print(f"ok {OUT} ({len(audio) / 1024:.0f} KB). Verifica que la voz sea {VOICE_ID} y dure ~15,09 s.")


if __name__ == "__main__":
    main()
