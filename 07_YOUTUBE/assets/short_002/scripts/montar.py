"""Pasos 3 y 4 — Une tarjetas + voz en el .mp4 vertical final (1080x1920, 30 fps).

Uso:
  python montar.py                 # usa ../voz.mp3 y ../timings.json si existen
  python montar.py --preview       # sin voz: video mudo con duraciones estimadas
Requiere ffmpeg en el PATH.
Salida: ../short_002_final.mp4 (o ../short_002_preview_sin_voz.mp4)
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FADE = 0.25   # transición entre tarjetas
TAIL = 0.8    # la última tarjeta se queda tras terminar la voz
WPS = 2.6     # palabras por segundo para estimar sin audio


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def durations(guion, audio, preview):
    segs = guion["segmentos"]
    timings_path = ROOT / "timings.json"
    if not preview and timings_path.exists():
        t = json.loads(timings_path.read_text(encoding="utf-8"))
        # Corte de tarjeta a mitad del silencio entre segmentos
        cuts = [0.0] + [(a["fin"] + b["inicio"]) / 2 for a, b in zip(t, t[1:])] + [t[-1]["fin"] + TAIL]
        return [b - a for a, b in zip(cuts, cuts[1:])]
    words = [len(s["voz"].split()) for s in segs]
    total = probe(audio) + TAIL if (audio and not preview) else sum(words) / WPS + TAIL
    return [total * w / sum(words) for w in words]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    args = ap.parse_args()

    guion = json.loads((ROOT / "guion.json").read_text(encoding="utf-8"))
    audio = ROOT / "voz.mp3"
    if not args.preview and not audio.exists():
        raise SystemExit("No existe voz.mp3. Corre voz_elevenlabs.py o usa --preview.")
    durs = durations(guion, audio if audio.exists() else None, args.preview)

    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
    for seg, d in zip(guion["segmentos"], durs):
        # Cada tarjeta dura un poco más para cubrir la transición
        cmd += ["-loop", "1", "-framerate", "30", "-t", f"{d + FADE:.3f}", "-i", str(ROOT / "cards" / f"{seg['card']}.png")]
    if not args.preview:
        cmd += ["-i", str(audio)]

    n = len(durs)
    filters = [f"[{i}:v]format=yuv420p,setsar=1[v{i}]" for i in range(n)]
    last, offset = "v0", 0.0
    for i in range(1, n):
        offset += durs[i - 1]
        filters.append(f"[{last}][v{i}]xfade=transition=fade:duration={FADE}:offset={offset - FADE / 2:.3f}[x{i}]")
        last = f"x{i}"
    cmd += ["-filter_complex", ";".join(filters), "-map", f"[{last}]"]
    if not args.preview:
        cmd += ["-map", f"{n}:a", "-c:a", "aac", "-b:a", "192k"]
    total = sum(durs)
    out = ROOT / ("short_002_preview_sin_voz.mp4" if args.preview else "short_002_final.mp4")
    cmd += ["-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-r", "30", "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print(f"ok {out.name} ({total:.1f}s)")


if __name__ == "__main__":
    main()
