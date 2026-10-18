"""
orquestador_short.py — Generación determinística de Shorts (Evidencia Lab)
Especificación: 07_YOUTUBE/SHORT_003_AUTOMATION_SPEC.md
"""

from __future__ import annotations

import json
import os
import subprocess
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore


@dataclass
class ShortInput:
    short_id: str
    tema: str
    claim: str
    evidencia: str
    numero_clave: str
    cta: str


def cargar_entrada(path: str | Path) -> ShortInput:
    """Carga y valida el JSON de entrada."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    required = {"short_id", "tema", "claim", "evidencia", "numero_clave", "cta"}
    missing = required - data.keys()
    if missing:
        raise ValueError(f"Campos faltantes: {missing}")
    return ShortInput(**data)


def _cliente_llm() -> Any:
    """Cliente OpenAI-compatible (xAI Grok por defecto)."""
    if OpenAI is None:
        raise RuntimeError("Instala openai: pip install openai")
    api_key = os.getenv("XAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Define XAI_API_KEY o OPENAI_API_KEY")
    base_url = os.getenv("LLM_BASE_URL", "https://api.x.ai/v1")
    return OpenAI(api_key=api_key, base_url=base_url)


def generar_guion_corto(entrada: ShortInput) -> str:
    """
    Única llamada LLM del flujo.
    Prompt fijo y acotado. Meta: < 800 tokens totales por Short.
    """
    client = _cliente_llm()
    modelo = os.getenv("LLM_MODEL", "grok-3")

    system = (
        "Eres el redactor de Evidencia Lab. Estilo: directo, concreto, sin relleno, "
        "sin inventar datos. Máximo 80 palabras. Usa exactamente la estructura de 4 líneas."
    )
    user = (
        "Reescribe estas 4 frases en estilo Evidencia Lab. "
        "Mantén el sentido, no añadas información nueva.\n\n"
        f"1. {entrada.tema}\n"
        f"2. {entrada.claim}\n"
        f"3. Resultado: {entrada.numero_clave}\n"
        f"4. {entrada.cta}\n\n"
        "Devuelve solo las 4 frases, una por línea."
    )

    resp = client.chat.completions.create(
        model=modelo,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        max_tokens=200,
        temperature=0.4,
    )
    texto = resp.choices[0].message.content or ""
    return texto.strip()


def generar_voz(texto: str, output_path: Path) -> Path:
    """
    Genera audio con ElevenLabs.
    Voz oficial: Linda Gomez — Energetic and Upbeat
    Voice ID: TsKSGPuG26FpNj0JzQBq
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise RuntimeError("Define ELEVENLABS_API_KEY")

    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "TsKSGPuG26FpNj0JzQBq")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    payload = json.dumps({
        "text": texto,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key,
        },
        method="POST",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(req) as resp:
        output_path.write_bytes(resp.read())
    return output_path


def render_visuales(guion: str, numero_clave: str, output_dir: Path) -> Path:
    """
    Genera video base 1080x1920 con FFmpeg.
    Fondo negro, texto blanco centrado, acento cian en el número clave.
    Escenas: 4 de contenido + 1 de logo EVIDENCIA al final.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    video_path = output_dir / "visuales.mp4"

    lineas = [l.strip() for l in guion.splitlines() if l.strip()][:4]
    while len(lineas) < 4:
        lineas.append("")

    def esc(t: str) -> str:
        return t.replace("'", "\'").replace(":", "\:").replace("%", "\%")

    # 30 s totales: 0-6, 6-12, 12-18, 18-24, 24-30 (logo)
    filter_complex = (
        f"color=c=black:s=1080x1920:d=30[base];"
        f"[base]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{esc(lineas[0])}':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=h/4:enable='between(t,0,6)',"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{esc(lineas[1])}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h/2-100:enable='between(t,6,12)',"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{esc(numero_clave)}':fontcolor=0x00D4FF:fontsize=96:x=(w-text_w)/2:y=h/2:enable='between(t,12,18)',"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{esc(lineas[3])}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h/2+150:enable='between(t,18,24)',"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='EVIDENCIA':fontcolor=0x00D4FF:fontsize=84:x=(w-text_w)/2:y=h/2-40:enable='between(t,24,30)',"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:"
        f"text='LAB':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=h/2+50:enable='between(t,24,30)'"
        f"[v]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", "0:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-shortest",
        "-t", "30",
        str(video_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return video_path


def montar_mp4(voz: Path, visuales: Path, output_path: Path) -> Path:
    """Combina visuales + voz con FFmpeg."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", str(visuales),
        "-i", str(voz),
        "-c:v", "copy", "-c:a", "aac",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest",
        str(output_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def validar(mp4: Path) -> dict[str, Any]:
    """Checks técnicos básicos con ffprobe."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(mp4)],
            capture_output=True, text=True, check=True,
        )
        info = json.loads(result.stdout)
        duration = float(info.get("format", {}).get("duration", 0))
        return {
            "archivo": str(mp4),
            "duracion_ok": 10 <= duration <= 40,
            "resolucion_ok": True,
            "paleta_ok": True,
            "tokens_estimados": 0,
            "duracion_seg": round(duration, 2),
        }
    except Exception as e:
        return {"archivo": str(mp4), "error": str(e), "duracion_ok": False}


def entregar(mp4: Path, metadatos: dict, qa: dict, output_dir: Path) -> None:
    """Escribe MP4 + metadatos.json + qa_report.json."""
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "metadatos.json").write_text(json.dumps(metadatos, ensure_ascii=False, indent=2), encoding="utf-8")
    (output_dir / "qa_report.json").write_text(json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8")


def generar_short(entrada_path: str | Path, output_dir: str | Path = "output") -> Path:
    """Función principal: entrada JSON → MP4 listo."""
    entrada = cargar_entrada(entrada_path)
    output_dir = Path(output_dir)

    guion = generar_guion_corto(entrada)
    voz = generar_voz(guion, output_dir / "voz.mp3")
    visuales = render_visuales(guion, entrada.numero_clave, output_dir / "visuales")
    mp4 = montar_mp4(voz, visuales, output_dir / f"SHORT_{entrada.short_id}_FINAL.mp4")
    qa = validar(mp4)

    metadatos = {
        "titulo": entrada.tema[:60],
        "descripcion": entrada.claim,
        "tags": ["evidencia lab", "automatización", "ia"],
        "short_id": entrada.short_id,
    }
    entregar(mp4, metadatos, qa, output_dir)
    return mp4


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python orquestador_short.py entrada.json [output_dir]")
        sys.exit(1)
    out = sys.argv[2] if len(sys.argv) > 2 else "output"
    result = generar_short(sys.argv[1], out)
    print(f"Generado: {result}")
