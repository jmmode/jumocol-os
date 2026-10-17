#!/usr/bin/env python3
"""YouTube Content System — Orquestador v1.0
Implementa ORQUESTADOR_V1.md. Cada función: entrada tipada, salida tipada, código de error.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import re


class Estado(Enum):
    FUENTE_PENDIENTE = "FUENTE_PENDIENTE"
    GUION_GENERADO = "GUION_GENERADO"
    SHORTS_GENERADOS = "SHORTS_GENERADOS"
    PUBLICADO = "PUBLICADO"
    TELEMETRIA_CAPTURADA = "TELEMETRIA_CAPTURADA"
    DIFF_APLICADA = "DIFF_APLICADA"
    ARCHIVADO = "ARCHIVADO"


class ErrorCode(Enum):
    FUENTE_INCOMPLETA = "FUENTE_INCOMPLETA"
    FUENTE_NO_ENCONTRADA = "FUENTE_NO_ENCONTRADA"
    GUION_INVALIDO = "GUION_INVALIDO"
    SHORTS_INCOMPLETOS = "SHORTS_INCOMPLETOS"
    METADATOS_INVALIDOS = "METADATOS_INVALIDOS"
    HUMANO_REQUERIDO = "HUMANO_REQUERIDO"
    SIN_DESVIACION = "SIN_DESVIACION"


@dataclass
class Claim:
    texto: str
    evidencia: str


@dataclass
class Fuente:
    tema: str
    claims: list[Claim]
    tono: str = "técnico-directo"
    duracion_objetivo: int = 15

    def valida(self) -> Optional[ErrorCode]:
        if len(self.claims) < 3:
            return ErrorCode.FUENTE_INCOMPLETA
        if any(not c.evidencia for c in self.claims[:3]):
            return ErrorCode.FUENTE_INCOMPLETA
        return None


@dataclass
class Guion:
    largo_id: str
    texto: str
    palabras: int = 0
    estado: Estado = Estado.GUION_GENERADO


@dataclass
class Short:
    short_id: str
    largo_id: str
    hook_categoria: str  # numerico | contradiccion | pregunta | historia
    texto: str
    visual: str


@dataclass
class Telemetria:
    publicacion_id: str
    tipo: str
    prompt_version: str
    hook_categoria: str
    vistas_48h: int
    ctr: float
    retencion_30s: float
    baseline_vistas: int
    baseline_ctr: float
    baseline_retencion: float

    @property
    def desviacion_vistas(self) -> float:
        if self.baseline_vistas == 0:
            return 0.0
        return (self.vistas_48h - self.baseline_vistas) / self.baseline_vistas


@dataclass
class Publicacion:
    publicacion_id: str
    largo: Guion
    shorts: list[Short]
    estado: Estado = Estado.FUENTE_PENDIENTE
    telemetria: list[Telemetria] = field(default_factory=list)
    error: Optional[ErrorCode] = None
    humano_requerido: bool = False


CATEGORIAS_HOOK = ("numerico", "contradiccion", "pregunta", "historia")


def cargar_fuente(tema: str, material_raw: dict[str, str]) -> tuple[Optional[Fuente], Optional[ErrorCode]]:
    """Función 1. Extrae claims con evidencia del material raw."""
    if tema not in material_raw:
        return None, ErrorCode.FUENTE_NO_ENCONTRADA
    texto = material_raw[tema]
    claims = []
    for m in re.finditer(r"CLAIM_\d+:\s*(.+?)\s*\|\s*EVIDENCIA:\s*(.+)", texto):
        claims.append(Claim(texto=m.group(1).strip(), evidencia=m.group(2).strip()))
    tono_m = re.search(r"TONO:\s*(.+)", texto)
    dur_m = re.search(r"DURACION_OBJETIVO:\s*(\d+)", texto)
    fuente = Fuente(
        tema=tema,
        claims=claims,
        tono=tono_m.group(1).strip() if tono_m else "técnico-directo",
        duracion_objetivo=int(dur_m.group(1)) if dur_m else 15,
    )
    return fuente, fuente.valida()


def generar_guion(fuente: Fuente, modelo_fn) -> tuple[Optional[Guion], Optional[ErrorCode]]:
    """Función 2. Genera guion; reintenta 1 vez con el error como contexto."""
    for intento in range(2):
        texto = modelo_fn(fuente, contexto_error=None if intento == 0 else "GUION_INVALIDO")
        palabras = len(texto.split())
        ok_palabras = 1700 <= palabras <= 3000
        ok_evidencia = all(
            (f"[HIPÓTESIS]" in p) or any(c.evidencia[:20] in p for c in fuente.claims)
            for p in texto.split("\n\n") if p.strip()
        )
        ok_prohibido = "Pereira" not in texto and "reubicación" not in texto.lower()
        ok_cta = texto.lower().count("cta") == 1 or bool(re.search(r"\[\d{2}:\d{2}\]\s*CTA", texto))
        if ok_palabras and ok_evidencia and ok_prohibido and ok_cta:
            return Guion(largo_id=f"L{fuente.tema[:8].upper()}", texto=texto, palabras=palabras), None
    return None, ErrorCode.GUION_INVALIDO


def derivar_shorts(guion: Guion, modelo_fn) -> tuple[list[Short], Optional[ErrorCode]]:
    """Función 3. 4 Shorts, categorías de hook obligatorias y distintas."""
    shorts = modelo_fn(guion)
    if len(shorts) < 4:
        return [], ErrorCode.SHORTS_INCOMPLETOS
    cats = [s.hook_categoria for s in shorts[:4]]
    if len(set(cats)) < 4 or any(c not in CATEGORIAS_HOOK for c in cats):
        return [], ErrorCode.SHORTS_INCOMPLETOS
    return shorts[:4], None


def generar_metadatos(guion: Guion, shorts: list[Short]) -> tuple[dict, Optional[ErrorCode]]:
    """Función 4. Determinístico: título ≤60 chars."""
    primera_linea = guion.texto.split("\n")[0]
    titulo = re.sub(r"^\[\d{2}:\d{2}\]\s*HOOK\s*[\u2014\-]\s*", "", primera_linea).strip()
    if len(titulo) > 60:
        titulo = titulo[:57] + "..."
    return {"titulo": titulo, "largo_id": guion.largo_id, "shorts": [s.short_id for s in shorts]}, None


def publicar(metadatos: dict, checklist_ok: bool) -> tuple[bool, Optional[ErrorCode]]:
    """Función 5. Publica solo si el checklist pasa."""
    if not checklist_ok:
        return False, ErrorCode.HUMANO_REQUERIDO
    return True, None


def capturar_telemetria(pub: Publicacion, datos: dict) -> None:
    """Función 6. Pull de métricas; setea flag humano si caída >40%."""
    t = Telemetria(
        publicacion_id=pub.publicacion_id,
        tipo=datos["tipo"],
        prompt_version=datos["prompt_version"],
        hook_categoria=datos.get("hook_categoria", ""),
        vistas_48h=datos["vistas_48h"],
        ctr=datos["ctr"],
        retencion_30s=datos["retencion_30s"],
        baseline_vistas=datos["baseline_vistas"],
        baseline_ctr=datos["baseline_ctr"],
        baseline_retencion=datos["baseline_retencion"],
    )
    pub.telemetria.append(t)
    pub.estado = Estado.TELEMETRIA_CAPTURADA
    if t.desviacion_vistas < -0.40:
        pub.humano_requerido = True
        pub.error = ErrorCode.HUMANO_REQUERIDO


def generar_diff(telemetria: Telemetria, prompt_actual: str, modelo_fn) -> tuple[Optional[str], Optional[ErrorCode]]:
    """Función 7. Diff solo si desviación >20%."""
    if abs(telemetria.desviacion_vistas) <= 0.20:
        return None, ErrorCode.SIN_DESVIACION
    diff = modelo_fn(telemetria, prompt_actual)
    if "HUMANO_REQUERIDO: true" in diff.lower() and telemetria.desviacion_vistas < -0.40:
        return diff, ErrorCode.HUMANO_REQUERIDO
    return diff, None


def cerrar_ciclo(pub: Publicacion) -> list[str]:
    """Función 8. Decide acciones por umbrales del AEP sección 7."""
    acciones = []
    for t in pub.telemetria:
        if t.tipo.startswith("short") and t.vistas_48h >= 10000:
            acciones.append(f"ENCOLAR_3_VARIANTES:{t.hook_categoria}")
        elif t.tipo.startswith("short") and t.vistas_48h < 1000:
            acciones.append(f"ARCHIVAR:{t.short_id}:vistas_bajas")
        if t.tipo == "largo" and t.ctr >= 6.0:
            acciones.append("SUBIR_FRECUENCIA")
        elif t.tipo == "largo" and t.ctr < 3.0:
            acciones.append("ITERAR_HOOK")
    if pub.humano_requerido:
        acciones.append("NOTIFICAR_HUMANO")
    return acciones


# —— ciclo completo de demostración ——
if __name__ == "__main__":
    material = {
        "agentes-que-auditan-pagos": (
            "TEMA: Agentes que auditan pagos\n"
            "CLAIM_1: El 90% de errores de recaudo son de categorización | EVIDENCIA: TiviPlay runtime 76 registros\n"
            "CLAIM_2: Un CRM sin auditoría es un diario | EVIDENCIA: JUMOCOL OS capa finanzas\n"
            "CLAIM_3: La automatización del recaudo recupera 15% en 30 días | EVIDENCIA: experimento Shopify\n"
            "TONO: técnico-directo\nDURACION_OBJETIVO: 15"
        )
    }

    def modelo_guion(f, contexto_error=None):
        return (
            "[00:00] HOOK — Noventa por ciento. No es el monto. Es la categoría.\n\n"
            "[00:30] CONTEXTO — Por qué esto importa ahora.\n\n"
            "[02:00] BLOQUE 1 — El 90% de errores de recaudo son de categorización. "
            "Evidencia: TiviPlay runtime, 76 registros. [HIPÓTESIS] escala a cualquier operación.\n\n"
            "[06:00] BLOQUE 2 — Un CRM sin auditoría es un diario. Evidencia: JUMOCOL OS.\n\n"
            "[10:00] BLOQUE 3 — Automatizar el recaudo recupera 15% en 30 días. "
            "Evidencia: experimento Shopify. [HIPÓTESIS].\n\n"
            "[14:00] EVIDENCIA CIERRE — Qué es verificable y qué es hipótesis.\n\n"
            "[16:00] CTA — Audita tu recaudo esta semana."
        )

    def modelo_shorts(g):
        return [
            Short("S1", g.largo_id, "numerico", "Noventa por ciento.", "tabla resaltada"),
            Short("S2", g.largo_id, "contradiccion", "Tu CRM miente.", "pantalla CRM"),
            Short("S3", g.largo_id, "pregunta", "¿Quién audita tu auditor?", "ojo en gráfico"),
            Short("S4", g.largo_id, "historia", "Un pago se perdió en 2019.", "archivo"),
        ]

    fuente, err = cargar_fuente("agentes-que-auditan-pagos", material)
    assert err is None, err
    guion, err = generar_guion(fuente, modelo_guion)
    assert err is None, err
    shorts, err = derivar_shorts(guion, modelo_shorts)
    assert err is None, err
    meta, err = generar_metadatos(guion, shorts)
    assert err is None and len(meta["titulo"]) <= 60, meta
    ok, err = publicar(meta, checklist_ok=True)
    assert ok and err is None
    pub = Publicacion(publicacion_id="P001", largo=guion, shorts=shorts, estado=Estado.PUBLICADO)
    capturar_telemetria(pub, {
        "tipo": "largo", "prompt_version": "PROMPT_LARGO_V1", "hook_categoria": "",
        "vistas_48h": 1200, "ctr": 7.0, "retencion_30s": 0.0,
        "baseline_vistas": 1000, "baseline_ctr": 5.0, "baseline_retencion": 0.0,
    })
    capturar_telemetria(pub, {
        "tipo": "short_01", "prompt_version": "PROMPT_SHORT_V1", "hook_categoria": "numerico",
        "vistas_48h": 12000, "ctr": 8.0, "retencion_30s": 0.55,
        "baseline_vistas": 4000, "baseline_ctr": 5.0, "baseline_retencion": 0.45,
    })
    acciones = cerrar_ciclo(pub)
    assert "SUBIR_FRECUENCIA" in acciones
    assert any(a.startswith("ENCOLAR_3_VARIANTES") for a in acciones)
    print("ORQUESTADOR OK —", acciones)