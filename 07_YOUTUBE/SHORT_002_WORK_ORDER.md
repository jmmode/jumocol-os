# Work Order — Short #2 | Evidencia Lab

**Fecha:** 2026-10-18  
**Estado:** Listo para ejecución  
**Canal:** Evidencia Lab  
**Objetivo del ciclo:** Mapear el proceso con múltiples agentes para automatizarlo en el Short #3.

---

## Enfoque de producción (3 fases)

| Short | Método | Propósito |
|-------|--------|----------|
| **#1** | Manual (metodología Elon Musk) | Prototipo. Validar mensaje, formato y flujo. |
| **#2** | Multi-agente (Grok + Celeste + Claude + OpenClaw) | Mapear y documentar el proceso completo usando todas las herramientas e integraciones disponibles. |
| **#3** | Automatización determinística (Python + n8n + OpenClaw) | Mínima intervención humana. El proceso ya está mapeado. |

Este Work Order corresponde a la **fase 2**.

---

## Tarea

Generar el Short #2 con la misma estructura del primero, reduciendo intervención humana y documentando cada paso.

## Guion (listo)

**Título:** Cómo pasamos de 4 horas a 12 minutos por ciclo

**Texto para voz:**

La mayoría de los equipos sigue copiando y pegando datos entre hojas.

Nosotros medimos el tiempo real y lo convertimos en código.

Fuente → Código → Evidencia.

Un proceso. Doce minutos de intervención humana por ciclo.

Si quieres ver cómo se construye, síguenos.

---

## Responsables

| Paso | Agente | Acción | Entregable |
|------|--------|--------|------------|
| 1. Guion | Grok | Generado (este documento) | Texto arriba |
| 2. Voz | Celeste / Claude | Generar audio en ElevenLabs con el texto | Archivo .mp3 |
| 3. Visuales | Celeste / Claude | Reutilizar plantilla del Short #1 en Clipchamp | Proyecto listo |
| 4. Montaje | Celeste / Claude | Unir audio + visuales | .mp4 final |
| 5. Publicación | Humano o agente con acceso | Subir a YouTube, TikTok y X | Enlaces |

## Instrucciones para agentes

1. Leer este archivo y el contrato de producción (`SHORT_PRODUCTION_CONTRACT.md`).
2. Ejecutar solo la fila que te corresponde.
3. Dejar el entregable en la carpeta `07_YOUTUBE/assets/short_002/` o reportar el enlace.
4. Documentar cualquier fricción o paso manual residual.
5. No pedir confirmación al humano si el paso está definido.

## Criterio de éxito

- Short publicado en las 3 plataformas.
- Tiempo de intervención humana < 15 minutos.
- Proceso completamente mapeado y documentado para convertirlo en código en el Short #3.

## Siguiente

Al terminar, crear `SHORT_003_AUTOMATION_SPEC.md` con el flujo determinístico (Python + n8n / OpenClaw).
