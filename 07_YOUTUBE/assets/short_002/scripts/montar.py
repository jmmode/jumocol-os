"""Montaje del Short #2 (orden de producción V2): timeline de ~32 s con escenas animadas,
locución oficial distribuida por segmentos, subtítulos, logo original y firma de cierre.

Insumos oficiales en ../source/ (ver ASSET_DELIVERY_STATUS.md):
  voz.mp3                                   toma ElevenLabs JXhmveCwg80lfS8KCR7T (no se altera velocidad ni tono)
  EVIDENCIA.png                             logotipo original
  mixkit-pressing-a-secret-code-2845.wav    firma sonora de cierre

Uso:
  python montar.py             # exige los 3 insumos -> ../SHORT_002_FINAL.mp4
  python montar.py --preview   # sin insumos: marcadores y voz estimada -> ../SHORT_002_PREVIEW.mp4
Requiere ffmpeg/ffprobe en el PATH y Pillow. Escribe ../qa/QA_REPORT.md y capturas por escena.
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

sys.path.insert(0, str(Path(__file__).resolve().parent))
import escenas  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "source"
VOZ = SOURCE / "voz.mp3"
LOGO = SOURCE / "EVIDENCIA.png"
SFX = SOURCE / "mixkit-pressing-a-secret-code-2845.wav"
FPS = 30
W, H = escenas.W, escenas.H

# Guía temporal de la orden V2: inicio de cada escena; el cierre dura CIERRE segundos
SLOTS = [0.0, 5.0, 11.0, 17.0, 23.0]
CIERRE_MIN, CIERRE = 28.0, 4.0
VOICE_OFFSET = [0.3, 0.4, 2.3, 0.4, 0.4]   # dónde arranca la voz dentro de cada escena
MIN_GAP = 0.6                               # separación mínima entre frases
SFX_DELAY = 0.3                             # firma tras el inicio del cierre
XFADE = 0.3
ZOOM = 0.03
SUB_WORDS = 5
TITLE_BANDS = [(310, 530), (310, 420), (290, 610), (310, 420), (350, 480)]
OFFICIAL_VOICE_SECONDS = 15.09


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def probe_duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]).stdout)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


# --- análisis de la voz --------------------------------------------------------

def voice_segments(segs, voz):
    """Por segmento: (clip_ini, clip_fin, habla_ini, habla_fin) en el MP3 original."""
    if voz is None:
        # Estimación para preview: duración oficial repartida por caracteres
        lead, pause = 0.1, 0.4
        speech = OFFICIAL_VOICE_SECONDS - lead - pause * (len(segs) - 1) - 0.1
        chars = [len(s["voz"]) for s in segs]
        out, t = [], lead
        for c in chars:
            d = speech * c / sum(chars)
            out.append((t, t + d, t, t + d))
            t += d + pause
        return out, "estimación por caracteres (preview sin voz)"

    dur = probe_duration(voz)
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(voz), "-af", "silencedetect=noise=-35dB:d=0.18",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    sil = list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)],
                   [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]))
    lead = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
    internal = [s for s in sil if s[0] > lead + 0.05 and s[1] < tail - 0.05]
    need = len(segs) - 1
    if len(internal) < need:
        raise SystemExit(f"Solo se detectaron {len(internal)} pausas en voz.mp3 (se necesitan {need}). Revisar la toma.")
    gaps = sorted(sorted(internal, key=lambda s: s[1] - s[0], reverse=True)[:need])
    speech = list(zip([lead] + [g[1] for g in gaps], [g[0] for g in gaps] + [tail]))
    cuts = [0.0] + [(g[0] + g[1]) / 2 for g in gaps] + [dur]
    return [(cuts[i], cuts[i + 1], *speech[i]) for i in range(len(segs))], f"pausas reales de voz.mp3 ({len(internal)} silencios)"


def char_frac(text, word_index):
    words = text.split()
    return len(" ".join(words[:word_index])) / max(1, len(text))


# --- plan temporal --------------------------------------------------------------

def plan(segs, vsegs):
    starts, placed, prev_end = [], [], -1.0
    for i, (c0, c1, s0, s1) in enumerate(vsegs):
        v_start = max(SLOTS[i] + VOICE_OFFSET[i], prev_end + MIN_GAP)
        starts.append(max(SLOTS[i], v_start - VOICE_OFFSET[i]))
        placed.append((v_start, v_start + (s1 - s0)))
        prev_end = v_start + (s1 - s0)
    cierre = max(CIERRE_MIN, prev_end + 0.8)
    starts.append(cierre)
    total = cierre + CIERRE
    return starts, placed, total


def scene_contexts(segs, starts, placed, logo):
    def local(i, word_index):
        v0, v1 = placed[i]
        return v0 - starts[i] + (v1 - v0) * char_frac(segs[i]["voz"], word_index)
    return [
        {},
        {"voice_mid": local(1, 5)},                                   # "y lo convertimos en código"
        {"word_times": [local(2, 0), local(2, 1), local(2, 2)]},      # Fuente, código, evidencia
        {"count_start": local(3, 2)},                                 # "Doce minutos..."
        {"follow_t": local(4, 6)},                                    # "síguenos"
        {"logo": logo},
    ]


def subtitle_events(segs, placed):
    events = []
    for seg, (v0, v1) in zip(segs, placed):
        words = seg["voz"].split()
        chunks = [words[i:i + SUB_WORDS] for i in range(0, len(words), SUB_WORDS)]
        if len(chunks) > 1 and len(chunks[-1]) == 1:
            chunks[-2] += chunks.pop()
        total_chars = sum(len(" ".join(c)) for c in chunks)
        t = v0
        for c in chunks:
            d = (v1 - v0) * len(" ".join(c)) / total_chars
            events.append((t, t + d, " ".join(c)))
            t += d
    return events


# --- render ---------------------------------------------------------------------

def render_video(starts, total, ctxs, events, out_video):
    n_frames = round(total * FPS)
    ff = subprocess.Popen(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "18", "-pix_fmt", "yuv420p", str(out_video)], stdin=subprocess.PIPE)
    bounds = starts + [total]
    static_run, max_static, history = 0, (0.0, 0.0), []

    def scene_frame(i, t):
        local = max(0.0, t - bounds[i])
        img = escenas.SCENES[i](local, ctxs[i])
        if i == len(starts) - 1:
            return img
        # Zoom lento y centrado (hasta 3 %) para que ningún plano quede congelado
        z = 1 + ZOOM * min(1.0, local / (bounds[i + 1] - bounds[i]))
        cw, ch = W / z, H / z
        return img.resize((W, H), Image.BILINEAR, box=((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2))

    for n in range(n_frames):
        t = n / FPS
        i = max(k for k in range(len(starts)) if bounds[k] <= t)
        frame = scene_frame(i, t)
        if i > 0 and t < bounds[i] + XFADE / 2:
            a = 0.5 + (t - bounds[i]) / XFADE
            frame = Image.blend(scene_frame(i - 1, t), frame, a)
        elif i < len(starts) - 1 and t > bounds[i + 1] - XFADE / 2:
            a = 0.5 - (bounds[i + 1] - t) / XFADE
            frame = Image.blend(frame, scene_frame(i + 1, t), a)
        sub = next((e for e in events if e[0] <= t < e[1]), None)
        if sub:
            escenas.subtitle(frame, sub[2], min(1.0, (t - sub[0]) / 0.08))
        ff.stdin.write(frame.tobytes())

        # detección de congelamientos: cambio visible respecto a 0,5 s antes (excluye el cierre)
        small = frame.resize((108, 192))
        history.append(small)
        if len(history) > FPS // 2 and i < len(starts) - 1:
            ref = history.pop(0)
            diff = max(ImageStat.Stat(ImageChops.difference(small, ref)).extrema[c][1] for c in range(3))
            static_run = static_run + 1 if diff < 8 else 0
            if (static_run + FPS // 2) / FPS > max_static[0] and static_run:
                max_static = ((static_run + FPS // 2) / FPS, t)
    ff.stdin.close()
    if ff.wait():
        raise SystemExit("ffmpeg falló al codificar el video.")
    return max_static


def render_audio(vsegs, placed, starts, total, out_audio, voz):
    if voz is None and not SFX.exists():
        run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
             "-c:a", "pcm_s16le", str(out_audio)])
        return
    cmd, filters, labels = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error"], [], []
    n_in = 0
    if voz is not None:
        # Una entrada por frase, recortada en la entrada: evita asplit/atrim, que puede no terminar
        for i, ((c0, c1, s0, _), (v0, _)) in enumerate(zip(vsegs, placed)):
            cmd += ["-ss", f"{c0:.3f}", "-t", f"{c1 - c0:.3f}", "-i", str(voz)]
            ms = max(0, int(round((v0 - (s0 - c0)) * 1000)))
            filters.append(f"[{n_in}:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=0.02,"
                           f"afade=t=out:st={max(0.0, c1 - c0 - 0.02):.3f}:d=0.02,adelay={ms}|{ms}[v{i}]")
            labels.append(f"[v{i}]")
            n_in += 1
    if SFX.exists():
        cmd += ["-i", str(SFX)]
        ms = int(round((starts[-1] + SFX_DELAY) * 1000))
        filters.append(f"[{n_in}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[sfx]")
        labels.append("[sfx]")
    filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:duration=longest:normalize=0,apad[a]")
    cmd += ["-filter_complex", ";".join(filters), "-map", "[a]", "-t", f"{total:.3f}", "-c:a", "pcm_s16le", str(out_audio)]
    subprocess.run(cmd, check=True)


# --- QA -------------------------------------------------------------------------

def bright_bbox(img, y0, y1):
    band = img.crop((0, y0, W, y1)).convert("L").point(lambda v: 255 if v > 60 else 0)
    return band.getbbox()


def off_palette_ratio(img):
    """Fracción de píxeles saturados que no son cian (la paleta base es neutra)."""
    hsv = img.resize((270, 480)).convert("HSV")
    total = bad = 0
    for h, s, v in hsv.get_flattened_data() if hasattr(hsv, 'get_flattened_data') else hsv.getdata():
        if v < 40:
            continue
        total += 1
        if s > 70 and not (120 <= h <= 145):   # cian ≈ 170-205° en escala 0-255
            bad += 1
    return bad / max(1, total)


def qa(out, inputs, timing_source, starts, placed, total, max_static, missing):
    qa_dir = ROOT / "qa"
    qa_dir.mkdir(exist_ok=True)
    for old in qa_dir.glob("*.png"):
        old.unlink()
    info = json.loads(run(["ffprobe", "-v", "error", "-show_entries",
                           "stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration",
                           "-of", "json", str(out)]).stdout)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    dur = float(info["format"]["duration"])
    decode_err = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True).stderr.strip()
    vol = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out), "-af", "volumedetect", "-vn", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    peak = re.search(r"max_volume: (-?[\d.]+) dB", vol)
    peak = float(peak.group(1)) if peak else None

    names = ["problema", "medicion", "transformacion", "evidencia", "cta", "cierre"]
    bounds = starts + [total]
    shots, centered, safe, palette = [], [], [], []
    for i, name in enumerate(names):
        t = bounds[i] + (bounds[i + 1] - bounds[i]) * (0.5 if i == 5 else 0.85)
        fn = f"escena_{i + 1}_{name}_{t:05.2f}s.png"
        run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(out), "-frames:v", "1", str(qa_dir / fn)])
        img = Image.open(qa_dir / fn).convert("RGB")
        shots.append(fn)
        # Franja completa del título de cada escena; el cierre se centra por geometría del PNG
        if i < 5:
            bb = bright_bbox(img, *TITLE_BANDS[i])
            if bb:
                centered.append((name, abs(bb[0] - (W - bb[2]))))
        full = bright_bbox(img, 0, H)
        if full:
            safe.append((name, full))
        if not (i == 5 and not LOGO.exists()):   # el marcador rojo de preview no cuenta
            palette.append((name, off_palette_ratio(img)))

    max_center = max(c for _, c in centered) if centered else 0
    safe_ok = all(b[0] >= 60 and b[2] <= W - 60 and b[1] >= 200 and b[3] <= 1500 for _, b in safe)
    pal_ok = all(r < 0.01 for _, r in palette)
    gaps = [placed[i + 1][0] - placed[i][1] for i in range(len(placed) - 1)]
    voz_dur = probe_duration(VOZ) if VOZ.exists() else None

    def st(c):
        return "OK" if c else "FALLA"

    rows = [
        ("1", "Duración 30–34 s", f"{dur:.2f} s", st(30 <= dur <= 34)),
        ("2", "Resolución 1080×1920", f"{v['width']}×{v['height']}", st((v["width"], v["height"]) == (W, H))),
        ("3", "30 fps", f"{num / den:g} fps", st(num / den == FPS)),
        ("4", "Audio y video reproducibles", (f"{v['codec_name']} + {a['codec_name']} {a['sample_rate']} Hz; decodificación "
                                              + ("sin errores" if not decode_err else "con errores")) if a else "sin audio",
         st(a and not decode_err)),
        ("5", "Voz original ElevenLabs", f"voz.mp3 {voz_dur:.2f} s, sha {sha256(VOZ)} (sin cambio de velocidad/tono)" if voz_dur
         else "FALTA voz.mp3 (preview con voz estimada)", "REVISAR OÍDO" if voz_dur else "PENDIENTE"),
        ("6", "Efecto de cierre oficial", f"sha {sha256(SFX)}, entra en {starts[-1] + SFX_DELAY:.2f} s" if SFX.exists()
         else "FALTA mixkit WAV", "OK" if SFX.exists() else "PENDIENTE"),
        ("7", "Logotipo original", f"EVIDENCIA.png sha {sha256(LOGO)}; solo escala uniforme y opacidad" if LOGO.exists()
         else "FALTA EVIDENCIA.png (marcador rojo)", "OK" if LOGO.exists() else "PENDIENTE"),
        ("8", "Títulos centrados", f"desvío máx. {max_center} px entre márgenes", st(max_center <= 16)),
        ("9", "Zona segura y legibilidad", "contenido entre x 60–1020, y 200–1500" if safe_ok else
         "contenido fuera de zona: " + ", ".join(f"{n} {b}" for n, b in safe), st(safe_ok)),
        ("10", "Subtítulos sincronizados", timing_source, "OK" if voz_dur else "PENDIENTE"),
        ("11", "Continuidad con Short #1", "capturas del Short #1 en Drive, no accesibles para Claude", "PENDIENTE (manual)"),
        ("12", "Sin silencios vacíos ni congelamientos", f"imagen quieta máx. {max_static[0]:.2f} s (t={max_static[1]:.1f}); "
         f"pausa máx. entre frases {max(gaps):.2f} s cubierta por animación", st(max_static[0] <= 1.5)),
        ("13", "Afirmación «4 horas → 12 minutos»", "sin fuente de medición en el repositorio", "RIESGO EDITORIAL"),
    ]
    md = [f"# QA_REPORT — {out.name}", "",
          "Generado por `scripts/montar.py`. Valores medidos sobre el MP4 exportado (ffprobe, ffmpeg, Pillow).", ""]
    if missing:
        md += [f"> **PREVIEW, no entregable.** Faltan en `source/`: {', '.join(missing)}.", ""]
    md += ["| # | Requisito | Medido | Resultado |", "|---|---|---|---|"]
    md += [f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} |" for r in rows]
    md += ["", f"Pico de audio: {peak:.1f} dBFS ({'sin clipping' if peak is not None and peak < -0.3 else 'REVISAR clipping'})"
           if peak is not None else "", "",
           "Paleta (fracción de píxeles saturados fuera de cian): "
           + ", ".join(f"{n} {r:.2%}" for n, r in palette) + f" → {st(pal_ok)}", "",
           "## Recursos utilizados", "", "| Archivo | Estado | SHA-256 (16) |", "|---|---|---|"]
    md += [f"| `source/{p.name}` | {'presente' if p.exists() else '**FALTA**'} | {sha256(p) if p.exists() else '-'} |" for p in inputs]
    md += ["", "## Timeline", "", "| Escena | Inicio | Voz en timeline |", "|---|---|---|"]
    for i, name in enumerate(names):
        vtxt = f"{placed[i][0]:.2f}–{placed[i][1]:.2f} s" if i < len(placed) else f"firma {starts[-1] + SFX_DELAY:.2f} s"
        md.append(f"| {name} | {starts[i]:.2f} s | {vtxt} |")
    md += ["", "## Capturas", ""] + [f"- `qa/{s}`" for s in shots]
    md += ["", "## Pendientes", ""]
    md += [f"- Subir `source/{m}`." for m in missing]
    md += ["- Comparar capturas con el Short #1 (punto 11).",
           "- Respaldar «4 horas → 12 minutos» con la medición real o presentarlo como ejemplo antes de publicar (punto 13).",
           "- Escuchar el MP4 completo: pronunciación, pausas y entrada de la firma (punto 5)."]
    (qa_dir / "QA_REPORT.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    args = ap.parse_args()
    inputs = [VOZ, LOGO, SFX]
    missing = [p.name for p in inputs if not p.exists()]
    if missing and not args.preview:
        raise SystemExit("Faltan insumos oficiales en source/: " + ", ".join(missing) + ". Usa --preview para un borrador.")

    segs = json.loads((ROOT / "guion.json").read_text(encoding="utf-8"))["segmentos"]
    voz = VOZ if VOZ.exists() else None
    vsegs, timing_source = voice_segments(segs, voz)
    starts, placed, total = plan(segs, vsegs)
    logo = Image.open(LOGO).convert("RGBA") if LOGO.exists() else None
    if logo:
        s = min(1000 / logo.width, 1000 / logo.height)
        logo = logo.resize((round(logo.width * s), round(logo.height * s)), Image.LANCZOS)
    ctxs = scene_contexts(segs, starts, placed, logo)
    events = subtitle_events(segs, placed)

    build = ROOT / "build"
    build.mkdir(exist_ok=True)
    max_static = render_video(starts, total, ctxs, events, build / "video.mp4")
    render_audio(vsegs, placed, starts, total, build / "audio.wav", voz)
    out = ROOT / ("SHORT_002_PREVIEW.mp4" if missing else "SHORT_002_FINAL.mp4")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(build / "video.mp4"), "-i", str(build / "audio.wav"),
         "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}",
         "-movflags", "+faststart", str(out)])
    rows = qa(out, inputs, timing_source, starts, placed, total, max_static, missing)
    print(f"ok {out.name} ({total:.2f}s) | {timing_source}")
    for r in rows:
        print(f"  {r[0]:>2}. {r[1]}: {r[3]}")


if __name__ == "__main__":
    main()
