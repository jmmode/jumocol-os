"""
orquestador_short.py — Esqueleto para generación determinística de Shorts (Evidencia Lab)
Especificación: 07_YOUTUBE/SHORT_003_AUTOMATION_SPEC.md
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


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


def generar_guion_corto(entrada: ShortInput) -> str:
    """
    Única llamada LLM del flujo.
    Prompt fijo y acotado. Meta: < 800 tokens totales por Short.
    """
    # TODO: implementar llamada real (OpenAI / Anthropic / Grok) con prompt:
    # "Reescribe estas 4 frases en estilo Evidencia Lab, máximo 80 palabras, sin inventar datos."
    frases_base = [
        entrada.tema,
        entrada.claim,
        f"Resultado: {entrada.numero_clave}",
        entrada.cta,
    ]
    return "\n".join(frases_base)  # placeholder hasta integrar LLM


def generar_voz(texto: str, output_path: Path) -> Path:
    """Genera audio con ElevenLabs (voz Linda Gomez)."""
    # TODO: llamar API ElevenLabs y guardar MP3
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(f"# placeholder voz para: {texto[:80]}", encoding="utf-8")
    return output_path


def render_visuales(guion: str, numero_clave: str, output_dir: Path) -> Path:
    """Genera visuales con plantilla fija (MoviePy / FFmpeg / HTML)."""
    # TODO: implementar plantilla parametrizada (escenas fijas)
    output_dir.mkdir(parents=True, exist_ok=True)
    marker = output_dir / "visuales.txt"
    marker.write_text(f"visuales para: {numero_clave}\n{guion}", encoding="utf-8")
    return marker


def montar_mp4(voz: Path, visuales: Path, output_path: Path) -> Path:
    """Monta el MP4 final con FFmpeg (logo + firma)."""
    # TODO: comando FFmpeg real
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("# placeholder MP4", encoding="utf-8")
    return output_path


def validar(mp4: Path) -> dict[str, Any]:
    """Checks técnicos automáticos."""
    # TODO: ffprobe + validación de paleta / zona segura
    return {
        "archivo": str(mp4),
        "duracion_ok": True,
        "resolucion_ok": True,
        "paleta_ok": True,
        "tokens_estimados": 0,
    }


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
