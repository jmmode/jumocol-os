"""Renderiza las escenas 1080x1920 del Short #2 según SHORT_PRODUCTION_CONTRACT.md.

Paleta: negro #000000 y blanco cálido #F6F4F1; cian solo en diagramas e interfaces.
El logotipo NO se dibuja aquí: montar.py inserta el EVIDENCIA.png original en el cierre.
Las escenas dejan libre la franja 1250-1450 px para los subtítulos y la zona
inferior para la interfaz de Shorts/TikTok.

Uso: python render_cards.py [--font-dir DIR]
Salida: ../cards/*.png
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BLACK = (0, 0, 0)
WHITE = (246, 244, 241)          # #F6F4F1
DIM = (246, 244, 241, 90)        # blanco cálido atenuado (solo detalles)
CYAN = (56, 210, 230)            # acento solo para diagramas / código
PANEL = (22, 22, 22)

OUT = Path(__file__).resolve().parent.parent / "cards"


def load_fonts(font_dir):
    candidates = {
        "black": ["Inter-Black.otf", "Inter-ExtraBold.otf", "Inter-Bold.otf", "ariblk.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"],
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


def base(step):
    img = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(img, "RGBA")
    # Progreso discreto de 5 pasos, centrado y dentro de la zona segura superior
    seg, gap, top = 120, 16, 250
    x = (W - (5 * seg + 4 * gap)) / 2
    for i in range(5):
        d.rounded_rectangle([x, top, x + seg, top + 8], 4, fill=WHITE if i <= step else (246, 244, 241, 50))
        x += seg + gap
    return img, d


def card_hook(font):
    img, d = base(0)
    centered(d, 420, "4 HORAS", font("black", 210), WHITE)
    centered(d, 660, "por ciclo", font("regular", 64), DIM)
    for i, line in enumerate(["copiando y pegando", "datos entre hojas"]):
        centered(d, 850 + i * 95, line, font("bold", 76), WHITE)
    return img


def card_medicion(font):
    img, d = base(1)
    for i, line in enumerate(["Medimos el tiempo real", "y lo convertimos", "en código"]):
        centered(d, 400 + i * 105, line, font("bold", 80), WHITE)
    # Interfaz de código: único lugar con acento cian
    d.rounded_rectangle([170, 800, 910, 1080], 24, fill=PANEL, outline=(246, 244, 241, 60), width=2)
    code = ["def ciclo(fuente):", "    datos = leer(fuente)", "    return evidencia(datos)"]
    for i, line in enumerate(code):
        d.text((215, 845 + i * 70), line, font=font("mono", 42), fill=CYAN if i == 0 else WHITE)
    return img


def card_flujo(font):
    img, d = base(2)
    for i, label in enumerate(["FUENTE", "CÓDIGO", "EVIDENCIA"]):
        y = 360 + i * 290
        d.rounded_rectangle([200, y, 880, y + 170], 28, outline=CYAN if i == 1 else WHITE, width=5)
        f = font("bold", 80)
        tw = d.textlength(label, font=f)
        d.text(((W - tw) / 2, y + 40), label, font=f, fill=WHITE)
        if i < 2:
            cx = W / 2
            d.line([cx, y + 185, cx, y + 255], fill=CYAN, width=8)
            d.polygon([(cx - 26, y + 245), (cx + 26, y + 245), (cx, y + 280)], fill=CYAN)
    return img


def card_resultado(font):
    img, d = base(3)
    centered(d, 380, "4 h", font("bold", 120), DIM)
    d.line([420, 468, 660, 468], fill=WHITE, width=8)
    centered(d, 560, "12 min", font("black", 220), WHITE)
    for i, line in enumerate(["de intervención humana", "por ciclo"]):
        centered(d, 860 + i * 85, line, font("regular", 64), WHITE)
    return img


def card_cta(font):
    img, d = base(4)
    for i, line in enumerate(["¿Quieres ver", "cómo se", "construye?"]):
        centered(d, 400 + i * 125, line, font("black", 104), WHITE)
    d.rounded_rectangle([270, 860, 810, 1000], 70, fill=WHITE)
    centered(d, 892, "SÍGUENOS", font("black", 70), BLACK)
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
