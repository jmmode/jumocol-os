"""Montaje del Short #2: escenas + locución oficial + subtítulos + logo + firma de cierre.

Insumos oficiales (carpeta ../source/, ver ASSET_DELIVERY_STATUS.md):
  voz.mp3                                   toma ElevenLabs JXhmveCwg80lfS8KCR7T
  EVIDENCIA.png                             logotipo original, sin modificar
  mixkit-pressing-a-secret-code-2845.wav    firma sonora de cierre

Uso:
  python montar.py             # final: exige los 3 insumos -> ../SHORT_002_FINAL.mp4
  python montar.py --preview   # sin insumos: marcadores visibles -> ../SHORT_002_PREVIEW.mp4
Requiere ffmpeg/ffprobe en el PATH. Tras exportar escribe ../qa/QA_REPORT.md y fotogramas.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "source"
VOZ = SOURCE / "voz.mp3"
LOGO = SOURCE / "EVIDENCIA.png"
SFX = SOURCE / "mixkit-pressing-a-secret-code-2845.wav"

W, H, FPS = 1080, 1920, 30
FADE = 0.25      # transición entre escenas
CIERRE = 1.8     # duración de la escena de logo + firma sonora
WPS = 2.6        # palabras por segundo, solo para estimar sin audio
SUB_WORDS = 5    # máximo de palabras por subtítulo
SUB_FONT = "Inter"


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def probe_duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)])
    return float(out.stdout.strip())


def silences(path):
    """Silencios internos de la locución como (inicio, fin)."""
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=noise=-35dB:d=0.18", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(starts, ends))


def segment_bounds(segs, voz_path, preview):
    """Inicio y fin hablado de cada segmento del guion, en segundos."""
    timings_path = ROOT / "timings.json"
    if timings_path.exists() and not preview:
        t = json.loads(timings_path.read_text(encoding="utf-8"))
        return [(x["inicio"], x["fin"]) for x in t], "timings.json"

    words = [len(s["voz"].split()) for s in segs]
    if voz_path is None:
        total, cursor, out = sum(words) / WPS, 0.0, []
        for w in words:
            d = total * w / sum(words)
            out.append((cursor, cursor + d))
            cursor += d
        return out, "estimación por palabras (sin audio)"

    dur = probe_duration(voz_path)
    sil = silences(voz_path)
    lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
    internal = [s for s in sil if s[0] > lead + 0.05 and s[1] < tail - 0.05]
    needed = len(segs) - 1
    if len(internal) >= needed:
        # Las pausas más largas separan los segmentos del guion
        gaps = sorted(sorted(internal, key=lambda s: s[1] - s[0], reverse=True)[:needed])
        starts = [lead] + [g[1] for g in gaps]
        ends = [g[0] for g in gaps] + [tail]
        return list(zip(starts, ends)), f"pausas detectadas en la locución ({len(internal)} silencios)"
    # Respaldo: reparto proporcional a las palabras sobre la duración hablada
    out, cursor = [], lead
    for w in words:
        d = (tail - lead) * w / sum(words)
        out.append((cursor, cursor + d))
        cursor += d
    return out, "reparto proporcional (no se detectaron suficientes pausas)"


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def write_subtitles(segs, bounds, path):
    # Blanco cálido #F6F4F1 en formato ASS (&HAABBGGRR), centrado sobre la zona de interfaz
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV",
        f"Style: Sub,{SUB_FONT},66,&H00F1F4F6,&H00000000,&H00000000,1,1,3,0,2,90,90,500", "",
        "[Events]", "Format: Layer, Start, End, Style, Text",
    ]
    for seg, (a, b) in zip(segs, bounds):
        words = seg["voz"].split()
        chunks = [words[i:i + SUB_WORDS] for i in range(0, len(words), SUB_WORDS)]
        # Evita un último fragmento de una sola palabra
        if len(chunks) > 1 and len(chunks[-1]) == 1:
            chunks[-2] += chunks.pop()
        t = a
        for c in chunks:
            d = (b - a) * len(c) / len(words)
            lines.append(f"Dialogue: 0,{ass_time(t)},{ass_time(t + d)},Sub,{' '.join(c)}")
            t += d
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def end_card(logo_path, out_path):
    """Escena de cierre: EVIDENCIA.png original centrado sobre negro, escalado sin deformar."""
    card = Image.new("RGB", (W, H), (0, 0, 0))
    if logo_path:
        logo = Image.open(logo_path).convert("RGBA")
        scale = min(860 / logo.width, 860 / logo.height)
        logo = logo.resize((round(logo.width * scale), round(logo.height * scale)), Image.LANCZOS)
        card.paste(logo, ((W - logo.width) // 2, (H - logo.height) // 2 - 120), logo)
    else:
        d = ImageDraw.Draw(card)
        d.rectangle([140, 700, 940, 1000], outline=(255, 60, 60), width=6)
        f = ImageFont.load_default(size=56)
        for i, txt in enumerate(["FALTA EVIDENCIA.png", "(marcador de preview)"]):
            tw = d.textlength(txt, font=f)
            d.text(((W - tw) / 2, 790 + i * 80), txt, font=f, fill=(255, 60, 60))
    card.save(out_path)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def qa(out, inputs, timing_source, bounds, total):
    qa_dir = ROOT / "qa"
    qa_dir.mkdir(exist_ok=True)
    info = json.loads(run(["ffprobe", "-v", "error", "-show_entries",
                           "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration",
                           "-of", "json", str(out)]).stdout)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    frames = []
    for i, (s, e) in enumerate(bounds):
        t = (s + e) / 2
        name = f"frame_{i + 1:02d}_{t:05.2f}s.png"
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(out), "-frames:v", "1", str(qa_dir / name)])
        frames.append(name)
    t_end = total - CIERRE / 2
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t_end:.2f}", "-i", str(out), "-frames:v", "1", str(qa_dir / "frame_cierre.png")])
    frames.append("frame_cierre.png")

    ok = lambda c: "OK" if c else "FALLA"
    rows = [
        ("Resolución 1080×1920", f"{v['width']}×{v['height']}", ok((v["width"], v["height"]) == (W, H))),
        ("30 fps", f"{num / den:g} fps", ok(num / den == FPS)),
        ("Pista de audio", f"{a['codec_name']} {a['sample_rate']} Hz, {a['channels']} canales" if a else "sin audio", ok(a)),
        ("Duración", f"{float(info['format']['duration']):.2f} s", "OK"),
        ("Sincronía escenas/subtítulos", timing_source, "REVISAR" if "estimación" in timing_source else "OK"),
    ]
    md = ["# QA técnico — " + out.name, "",
          "Generado por `scripts/montar.py`. Medido con ffprobe sobre el archivo exportado.", "",
          "| Requisito | Medido | Resultado |", "|---|---|---|"]
    md += [f"| {r} | {m} | {s} |" for r, m, s in rows]
    md += ["", "## Insumos", "", "| Archivo | Estado | SHA-256 (16) |", "|---|---|---|"]
    md += [f"| `{p.name}` | {'presente' if p.exists() else '**FALTA**'} | {sha256(p) if p.exists() else '-'} |" for p in inputs]
    md += ["", "## Segmentos", "", "| # | Inicio | Fin |", "|---|---|---|"]
    md += [f"| {i + 1} | {s:.2f} s | {e:.2f} s |" for i, (s, e) in enumerate(bounds)]
    md += ["", "## Fotogramas para revisión visual", ""] + [f"- `qa/{f}`" for f in frames]
    md += ["", "Paleta, logo sin alteraciones, legibilidad y coherencia con el Short #1 se validan mirando estos fotogramas y el MP4."]
    (qa_dir / "QA_REPORT.md").write_text("\n".join(md) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    args = ap.parse_args()

    inputs = [VOZ, LOGO, SFX]
    missing = [p.name for p in inputs if not p.exists()]
    if missing and not args.preview:
        raise SystemExit("Faltan insumos oficiales en source/: " + ", ".join(missing) + ". Usa --preview para un borrador.")

    guion = json.loads((ROOT / "guion.json").read_text(encoding="utf-8"))
    segs = guion["segmentos"]
    voz = VOZ if VOZ.exists() else None
    bounds, timing_source = segment_bounds(segs, voz, args.preview and voz is None)
    voice_end = probe_duration(voz) if voz else bounds[-1][1] + 0.3

    # Cada escena empieza a mitad de la pausa anterior; la de cierre empieza al terminar la voz
    cuts = [0.0] + [(bounds[i][1] + bounds[i + 1][0]) / 2 for i in range(len(bounds) - 1)] + [voice_end]
    durs = [b - a for a, b in zip(cuts, cuts[1:])] + [CIERRE]
    total = sum(durs)

    build = ROOT / "build"
    build.mkdir(exist_ok=True)
    end_card(LOGO if LOGO.exists() else None, build / "06_cierre.png")
    write_subtitles(segs, bounds, build / "subtitulos.ass")
    images = [ROOT / "cards" / f"{s['card']}.png" for s in segs] + [build / "06_cierre.png"]

    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"]
    for img, d in zip(images, durs):
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d + FADE:.3f}", "-i", str(img)]
    n = len(images)
    audio_inputs = []
    if voz:
        cmd += ["-i", str(voz)]
        audio_inputs.append(n)
    if SFX.exists():
        cmd += ["-i", str(SFX)]
        audio_inputs.append(n + len(audio_inputs))

    filters = [f"[{i}:v]scale={W}:{H},format=yuv420p,setsar=1[v{i}]" for i in range(n)]
    last, offset = "v0", 0.0
    for i in range(1, n):
        offset += durs[i - 1]
        filters.append(f"[{last}][v{i}]xfade=transition=fade:duration={FADE}:offset={offset - FADE / 2:.3f}[x{i}]")
        last = f"x{i}"
    # Ruta relativa: libass en Windows no acepta bien rutas absolutas con ':'
    filters.append(f"[{last}]subtitles=subtitulos.ass[vout]")

    if audio_inputs:
        parts, labels = [], []
        if voz:
            parts.append(f"[{audio_inputs[0]}:a]aresample=48000,aformat=channel_layouts=stereo[voz]")
            labels.append("[voz]")
        if SFX.exists():
            ms = int(voice_end * 1000)
            parts.append(f"[{audio_inputs[-1]}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[sfx]")
            labels.append("[sfx]")
        if len(labels) == 2:
            parts.append("[voz][sfx]amix=inputs=2:duration=longest:normalize=0[amix]")
        else:
            parts.append(f"{labels[0]}anull[amix]")
        parts.append(f"[amix]apad,atrim=0:{total:.3f}[aout]")
        filters += parts
    else:
        cmd += ["-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
        filters.append(f"[{n}:a]anull[aout]")

    out = ROOT / ("SHORT_002_PREVIEW.mp4" if missing or args.preview else "SHORT_002_FINAL.mp4")
    cmd += ["-filter_complex", ";".join(filters), "-map", "[vout]", "-map", "[aout]",
            "-t", f"{total:.3f}", "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True, cwd=build)
    qa(out, inputs, timing_source, bounds, total)
    print(f"ok {out.name} ({total:.2f}s) | sincronía: {timing_source}")
    if missing:
        print("PREVIEW: faltan " + ", ".join(missing) + ". No es el entregable final.")


if __name__ == "__main__":
    main()
