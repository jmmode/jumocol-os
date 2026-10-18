"""Renderiza las tarjetas 1080x1920 del Short #2 (plantilla Evidencia Lab).

Uso: python render_cards.py [--font-dir DIR]
Salida: ../cards/*.png
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BG = (11, 15, 20)
FG = (240, 244, 248)
MUTED = (140, 152, 166)
ACCENT = (46, 204, 140)
WARN = (240, 96, 80)
PANEL = (24, 31, 40)

OUT = Path(__file__).resolve().parent.parent / "cards"


def load_fonts(font_dir):
    candidates = {
        "bold": ["Inter-Bold.otf", "Inter-Bold.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"],
        "regular": ["Inter-Regular.otf", "Inter-Regular.ttf", "arial.ttf", "DejaVuSans.ttf"],
        "mono": ["DejaVuSansMono.ttf", "consola.ttf", "cour.ttf"],
    }
    dirs = [Path(d) for d in ([font_dir] if font_dir else [])] + [
        Path("/usr/share/fonts/opentype/inter"),
        Path("/usr/share/fonts/truetype/dejavu"),
        Path("C:/Windows/Fonts"),
    ]
    found = {}
    for key, names in candidates.items():
        for d in dirs:
            hit = next((d / n for n in names if (d / n).exists()), None)
            if hit:
                found[key] = str(hit)
                break
        if key not in found:
            raise SystemExit(f"No encontré fuente '{key}'. Usa --font-dir.")
    return lambda kind, size: ImageFont.truetype(found[kind], size)


def centered(draw, y, text, font, fill):
    w = draw.textlength(text, font=font)
    draw.text(((W - w) / 2, y), text, font=font, fill=fill)


def base(font, step):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # Marca superior y barra de progreso (5 pasos)
    centered(d, 120, "EVIDENCIA LAB", font("bold", 40), ACCENT)
    seg = (W - 160) / 5
    for i in range(5):
        x0 = 80 + i * seg + 6
        d.rounded_rectangle([x0, 200, x0 + seg - 12, 210], 5, fill=ACCENT if i <= step else PANEL)
    centered(d, H - 170, "Fuente → Código → Evidencia", font("regular", 38), MUTED)
    return img, d


def card_hook(font):
    img, d = base(font, 0)
    centered(d, 520, "4 HORAS", font("bold", 200), WARN)
    centered(d, 760, "por ciclo", font("regular", 64), MUTED)
    for i, line in enumerate(["copiando y pegando", "datos entre hojas"]):
        centered(d, 1000 + i * 100, line, font("bold", 76), FG)
    # Hojas apiladas
    for i in range(3):
        x, y = 330 + i * 40, 1300 + i * 40
        d.rounded_rectangle([x, y, x + 340, y + 220], 18, fill=PANEL, outline=MUTED, width=3)
        for r in range(4):
            d.line([x + 30, y + 50 + r * 40, x + 310, y + 50 + r * 40], fill=MUTED, width=3)
    return img


def card_medicion(font):
    img, d = base(font, 1)
    centered(d, 560, "Medimos el", font("bold", 96), FG)
    centered(d, 680, "tiempo real", font("bold", 96), ACCENT)
    centered(d, 900, "y lo convertimos", font("bold", 96), FG)
    centered(d, 1020, "en código", font("bold", 96), ACCENT)
    d.rounded_rectangle([190, 1250, 890, 1520], 24, fill=PANEL)
    code = ["def ciclo(fuente):", "    datos = leer(fuente)", "    return evidencia(datos)"]
    for i, line in enumerate(code):
        d.text((240, 1290 + i * 70), line, font=font("mono", 42), fill=ACCENT if i == 0 else FG)
    return img


def card_flujo(font):
    img, d = base(font, 2)
    for i, (label, color) in enumerate([("FUENTE", FG), ("CÓDIGO", ACCENT), ("EVIDENCIA", FG)]):
        y = 480 + i * 400
        d.rounded_rectangle([170, y, 910, y + 220], 32, fill=PANEL, outline=color, width=6)
        f = font("bold", 92)
        tw = d.textlength(label, font=f)
        d.text(((W - tw) / 2, y + 58), label, font=f, fill=color)
        if i < 2:
            cx = W / 2
            d.line([cx, y + 240, cx, y + 360], fill=ACCENT, width=10)
            d.polygon([(cx - 36, y + 340), (cx + 36, y + 340), (cx, y + 385)], fill=ACCENT)
    return img


def card_resultado(font):
    img, d = base(font, 3)
    centered(d, 470, "4 h", font("bold", 120), MUTED)
    d.line([400, 562, 680, 562], fill=WARN, width=12)
    centered(d, 640, "↓", font("bold", 110), ACCENT)
    centered(d, 800, "12 min", font("bold", 230), ACCENT)
    for i, line in enumerate(["de intervención humana", "por ciclo"]):
        centered(d, 1120 + i * 90, line, font("regular", 66), FG)
    centered(d, 1400, "Un proceso.", font("bold", 80), FG)
    return img


def card_cta(font):
    img, d = base(font, 4)
    for i, line in enumerate(["¿Quieres ver", "cómo se", "construye?"]):
        centered(d, 560 + i * 130, line, font("bold", 110), FG)
    d.rounded_rectangle([240, 1080, 840, 1240], 80, fill=ACCENT)
    centered(d, 1118, "SÍGUENOS", font("bold", 80), BG)
    centered(d, 1340, "@EVIDENCIALAB", font("bold", 60), ACCENT)
    centered(d, 1430, "YouTube · TikTok · X", font("regular", 46), MUTED)
    return img


CARDS = {
    "01_hook": card_hook,
    "02_medicion": card_medicion,
    "03_flujo": card_flujo,
    "04_resultado": card_resultado,
    "05_cta": card_cta,
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--font-dir")
    args = ap.parse_args()
    font = load_fonts(args.font_dir)
    OUT.mkdir(exist_ok=True)
    for name, fn in CARDS.items():
        fn(font).save(OUT / f"{name}.png", optimize=True)
        print(f"ok {name}.png")


if __name__ == "__main__":
    main()
