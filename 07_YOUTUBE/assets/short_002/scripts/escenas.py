"""Escenas animadas del Short #2 (Pillow, 1080x1920).

Cada escena es una función (t, ctx) -> Image, con t en segundos locales a la escena.
Paleta del contrato: negro #000000 y blanco cálido #F6F4F1; cian solo en
diagramas, código y visualizaciones. El logotipo solo se usa como PNG original.
Franja 1250-1450 px reservada a subtítulos; contenido principal entre 300 y 1200 px.
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BLACK = (0, 0, 0)
WHITE = (246, 244, 241)
CYAN = (56, 210, 230)
GRID = (60, 60, 58)
PANEL = (20, 20, 20)

FONT_DIRS = [Path("/usr/share/fonts/opentype/inter"), Path("/usr/share/fonts/truetype/dejavu"), Path("C:/Windows/Fonts")]
FONT_FILES = {
    "black": ["Inter-Black.otf", "Inter-ExtraBold.otf", "ariblk.ttf", "DejaVuSans-Bold.ttf"],
    "bold": ["Inter-Bold.otf", "arialbd.ttf", "DejaVuSans-Bold.ttf"],
    "regular": ["Inter-Regular.otf", "arial.ttf", "DejaVuSans.ttf"],
    "mono": ["DejaVuSansMono.ttf", "consola.ttf", "cour.ttf"],
}
_fonts = {}


def font(kind, size):
    key = (kind, size)
    if key not in _fonts:
        for d in FONT_DIRS:
            hit = next((d / n for n in FONT_FILES[kind] if (d / n).exists()), None)
            if hit:
                _fonts[key] = ImageFont.truetype(str(hit), size)
                break
        else:
            raise SystemExit(f"No encontré fuente '{kind}'.")
    return _fonts[key]


# --- utilidades de animación -------------------------------------------------

def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, start, dur):
    return clamp((t - start) / dur) if dur > 0 else float(t >= start)


def ease_out(x):
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    return 3 * x * x - 2 * x * x * x


def ease_back(x):
    c = 1.70158
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def mix(c, a):
    """Color c con opacidad a sobre negro (sin canal alfa: más rápido y exacto)."""
    return tuple(round(v * a) for v in c)


def text_c(d, y, text, f, color, a=1.0, dy=0):
    # Centrado por la tinta real del texto, no por su avance tipográfico
    x0, _, x1, _ = d.textbbox((0, 0), text, font=f)
    d.text(((W - (x1 - x0)) / 2 - x0, y + dy), text, font=f, fill=mix(color, a))


def canvas():
    img = Image.new("RGB", (W, H), BLACK)
    return img, ImageDraw.Draw(img)


def progress(d, step):
    seg, gap, top = 120, 16, 230
    x = (W - (5 * seg + 4 * gap)) / 2
    for i in range(5):
        d.rounded_rectangle([x, top, x + seg, top + 8], 4, fill=WHITE if i <= step else mix(WHITE, 0.2))
        x += seg + gap


def reveal(t, start, dur=0.45):
    """Opacidad y desplazamiento vertical para una entrada suave."""
    p = ease_out(prog(t, start, dur))
    return p, (1 - p) * 40


# --- escenas -----------------------------------------------------------------

def problema(t, ctx):
    """Tareas manuales: copiar celdas de una hoja a otra, una y otra vez."""
    img, d = canvas()
    progress(d, 0)
    a, dy = reveal(t, 0.0)
    text_c(d, 320, "4 HORAS", font("black", 200), WHITE, a, dy)
    a2, dy2 = reveal(t, 0.35)
    text_c(d, 560, "copiando y pegando entre hojas", font("regular", 52), WHITE, a2 * 0.75, dy2)

    sheets_a = ease_out(prog(t, 0.5, 0.5))
    rows, row_h, top = 7, 62, 720
    boxes = [(110, "Hoja A"), (590, "Hoja B")]
    for x0, label in boxes:
        d.text((x0, top - 52), label, font=font("bold", 34), fill=mix(WHITE, 0.6 * sheets_a))
        for r in range(rows + 1):
            d.line([x0, top + r * row_h, x0 + 380, top + r * row_h], fill=mix(GRID, sheets_a), width=2)
        for c in range(4):
            d.line([x0 + c * 126.6, top, x0 + c * 126.6, top + rows * row_h], fill=mix(GRID, sheets_a), width=2)
        # contenido de la hoja de origen
        if x0 == 110:
            for r in range(rows):
                for c in range(3):
                    w = 50 + (r * 37 + c * 23) % 50
                    d.rounded_rectangle([x0 + 18 + c * 126.6, top + 24 + r * row_h, x0 + 18 + c * 126.6 + w, top + 38 + r * row_h], 4,
                                        fill=mix(WHITE, 0.45 * sheets_a))

    # ciclo de copiado: cada fila viaja de A a B
    cycle, t0 = 0.55, 0.9
    k = int((t - t0) // cycle) if t >= t0 else -1
    for r in range(min(k, rows)):
        for c in range(3):
            w = 50 + (r * 37 + c * 23) % 50
            d.rounded_rectangle([608 + c * 126.6, top + 24 + r * row_h, 608 + c * 126.6 + w, top + 38 + r * row_h], 4, fill=mix(WHITE, 0.45))
    if 0 <= k < rows:
        p = ease_in_out(clamp(((t - t0) % cycle) / (cycle * 0.8)))
        y = top + k * row_h
        d.rectangle([110, y, 490, y + row_h], outline=WHITE, width=4)
        gx = 110 + p * 480
        d.rounded_rectangle([gx, y + 6, gx + 380, y + row_h - 6], 8, fill=mix(WHITE, 0.18), outline=mix(WHITE, 0.6), width=2)
    return img


def medicion(t, ctx):
    """Medición del proceso: barras de tiempo por tarea que suman el ciclo."""
    img, d = canvas()
    progress(d, 1)
    a, dy = reveal(t, 0.0)
    text_c(d, 320, "Medimos el tiempo real", font("bold", 78), WHITE, a, dy)

    tasks = [("Descargar", 0.30), ("Copiar y pegar", 0.42), ("Validar", 0.18), ("Reportar", 0.10)]
    top, gap = 500, 115
    x_bar, max_w = 480, 480
    for i, (label, share) in enumerate(tasks):
        st = 0.4 + i * 0.28
        p = ease_out(prog(t, st, 0.7))
        y = top + i * gap
        d.text((110, y + 4), label, font=font("regular", 44), fill=mix(WHITE, 0.85 * prog(t, st, 0.3)))
        d.rounded_rectangle([x_bar, y + 8, x_bar + max_w, y + 52], 10, fill=mix(GRID, 0.6 * prog(t, st, 0.3)))
        if p > 0:
            d.rounded_rectangle([x_bar, y + 8, x_bar + max(20, max_w * share / 0.42 * p), y + 52], 10, fill=CYAN)
    # total medido
    ta = prog(t, 1.9, 0.4)
    d.line([110, top + 4 * gap + 10, 970, top + 4 * gap + 10], fill=mix(WHITE, 0.4 * ta), width=2)
    text_c(d, top + 4 * gap + 30, "= 4 h por ciclo", font("bold", 56), WHITE, ta)

    # barrido de lectura sobre las barras: el plano sigue vivo tras la medición
    if t > 1.9:
        ph = ((t - 1.9) % 1.6) / 1.6
        sy = top - 10 + ph * (4 * gap)
        d.line([x_bar, sy, x_bar + max_w, sy], fill=mix(WHITE, 0.5 * math.sin(math.pi * ph)), width=3)
    # "lo convertimos en código" sincronizado con la segunda mitad de la frase
    cut = ctx["voice_mid"]
    ca, cdy = reveal(t, cut)
    d.rounded_rectangle([200, 1090, 880, 1190], 50, outline=mix(CYAN, ca), width=4)
    text_c(d, 1110, "→ código", font("bold", 56), WHITE, ca, cdy * 0.3)
    return img


CODE = [
    ("def ciclo(fuente):", CYAN),
    ("    datos = leer(fuente)", WHITE),
    ("    limpio = validar(datos)", WHITE),
    ("    return evidencia(limpio)", WHITE),
]


def transformacion(t, ctx):
    """Código que se escribe y flujo Fuente → Código → Evidencia sincronizado con la voz."""
    img, d = canvas()
    progress(d, 2)
    # panel de código con escritura progresiva
    pa = prog(t, 0.0, 0.3)
    d.rounded_rectangle([110, 300, 970, 600], 22, fill=mix(PANEL, pa), outline=mix(WHITE, 0.25 * pa), width=2)
    for i, c in enumerate([CYAN, WHITE, WHITE]):
        d.ellipse([140 + i * 34, 322, 160 + i * 34, 342], fill=mix(GRID if i else CYAN, pa))
    chars = int(max(0.0, t - 0.25) * 42)
    y = 372
    for line, color in CODE:
        shown = line[:max(0, chars)]
        chars -= len(line)
        d.text((150, y), shown, font=font("mono", 38), fill=color)
        if 0 < len(shown) < len(line):
            cw = d.textlength(shown, font=font("mono", 38))
            d.rectangle([150 + cw + 4, y + 4, 150 + cw + 22, y + 44], fill=WHITE)
        y += 52

    # cajas del flujo, cada una aparece con su palabra
    labels = ["FUENTE", "CÓDIGO", "EVIDENCIA"]
    word_t = ctx["word_times"]
    box_y = [680, 870, 1060]
    for i, label in enumerate(labels):
        p = ease_back(prog(t, word_t[i], 0.35))
        if p <= 0:
            continue
        a = clamp(p)
        w, h = 560 * (0.85 + 0.15 * p), 120 * (0.85 + 0.15 * p)
        cx, cy = W / 2, box_y[i] + 60
        active = i == 1
        d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 26,
                            outline=mix(CYAN if active else WHITE, a), width=5)
        text_c(d, cy - 34, label, font("bold", 60), WHITE, a)
        if i < 2:
            ap = ease_out(prog(t, word_t[i] + 0.2, 0.3))
            y0, y1 = box_y[i] + 125, box_y[i] + 125 + 60 * ap
            d.line([cx, y0, cx, y1], fill=CYAN, width=6)
            if ap >= 1:
                d.polygon([(cx - 18, y1 - 14), (cx + 18, y1 - 14), (cx, y1 + 6)], fill=CYAN)
    # pulso de datos recorriendo el flujo una vez armado
    if t > word_t[2] + 0.5:
        ph = ((t - word_t[2] - 0.5) % 1.4) / 1.4
        py = 740 + ph * 380
        d.ellipse([W / 2 - 300 - 12, py - 12, W / 2 - 300 + 12, py + 12], fill=CYAN)
        d.line([W / 2 - 300, 740, W / 2 - 300, 1120], fill=mix(CYAN, 0.25), width=2)
    return img


def evidencia(t, ctx):
    """Resultado: el contador baja de 240 a 12 minutos y la barra se reduce."""
    img, d = canvas()
    progress(d, 3)
    a, dy = reveal(t, 0.0)
    text_c(d, 320, "Un proceso.", font("bold", 76), WHITE, a, dy)

    p = ease_in_out(prog(t, ctx["count_start"], 1.6))
    minutes = round(240 - (240 - 12) * p)
    old_a = prog(t, 0.4, 0.3)
    text_c(d, 450, "antes: 4 h", font("regular", 50), WHITE, 0.6 * old_a)
    if p > 0:
        sw = d.textlength("antes: 4 h", font=font("regular", 50))
        d.line([(W - sw) / 2, 482, (W - sw) / 2 + sw * ease_out(clamp(p * 1.6)), 482], fill=WHITE, width=5)

    na = prog(t, 0.5, 0.3)
    text_c(d, 560, f"{minutes} min", font("black", 210), WHITE, na)
    # barra proporcional al tiempo humano (visualización: cian permitido)
    bx, bw = 140, 800
    d.rounded_rectangle([bx, 860, bx + bw, 900], 20, fill=mix(GRID, 0.6 * na))
    d.rounded_rectangle([bx, 860, bx + max(40, bw * minutes / 240), 900], 20, fill=mix(CYAN, na))
    # pulso al final de la barra: mantiene vivo el plano mientras la cifra se asienta
    if p >= 1:
        ph = ((t - ctx["count_start"] - 1.6) % 1.2) / 1.2
        ex = bx + max(40, bw * minutes / 240)
        r = 14 + 46 * ph
        d.ellipse([ex - r, 880 - r, ex + r, 880 + r], outline=mix(CYAN, 1 - ph), width=4)
    la = prog(t, ctx["count_start"] + 1.2, 0.4)
    text_c(d, 960, "de intervención humana", font("regular", 58), WHITE, la)
    text_c(d, 1035, "por ciclo", font("regular", 58), WHITE, la)
    return img


def cta(t, ctx):
    img, d = canvas()
    progress(d, 4)
    for i, line in enumerate(["¿Quieres ver", "cómo se", "construye?"]):
        a, dy = reveal(t, 0.1 + i * 0.18)
        text_c(d, 360 + i * 125, line, font("black", 104), WHITE, a, dy)
    p = ease_back(prog(t, ctx["follow_t"], 0.45))
    if p > 0:
        pulse = 1 + 0.025 * math.sin(max(0.0, t - ctx["follow_t"] - 0.45) * 5)
        s = p * pulse
        w, h = 540 * s, 140 * s
        cx, cy = W / 2, 930
        d.rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 70 * s, fill=WHITE)
        f = font("black", max(10, int(70 * s)))
        tw = d.textlength("SÍGUENOS", font=f)
        d.text((cx - tw / 2, cy - 44 * s), "SÍGUENOS", font=f, fill=BLACK)
    return img


def cierre(t, ctx):
    """Logotipo original sobre negro. Solo escala uniforme y opacidad: sin alterar el PNG."""
    img = Image.new("RGB", (W, H), BLACK)
    logo = ctx["logo"]
    if logo is None:
        d = ImageDraw.Draw(img)
        d.rectangle([140, 740, 940, 1040], outline=(255, 60, 60), width=6)
        text_c(d, 840, "FALTA EVIDENCIA.png", font("bold", 56), (255, 60, 60))
        return img
    a = ease_out(prog(t, 0.0, 0.6))
    s = 0.96 + 0.04 * ease_out(prog(t, 0.0, 1.6))
    lw, lh = round(logo.width * s), round(logo.height * s)
    scaled = logo.resize((lw, lh), Image.LANCZOS)
    if a < 1:
        alpha = scaled.getchannel("A").point(lambda v: int(v * a))
        scaled.putalpha(alpha)
    img.paste(scaled, ((W - lw) // 2, (H - lh) // 2 - 80), scaled)
    return img


SCENES = [problema, medicion, transformacion, evidencia, cta, cierre]


def subtitle(img, text, a):
    if not text or a <= 0:
        return img
    d = ImageDraw.Draw(img)
    f = font("bold", 62)
    x0, _, x1, _ = d.textbbox((0, 0), text, font=f)
    x, y = (W - (x1 - x0)) / 2 - x0, 1330
    # contorno negro para legibilidad sobre cualquier fondo de la escena
    for ox, oy in ((-3, 0), (3, 0), (0, -3), (0, 3)):
        d.text((x + ox, y + oy), text, font=f, fill=BLACK)
    d.text((x, y), text, font=f, fill=mix(WHITE, a))
    return img
