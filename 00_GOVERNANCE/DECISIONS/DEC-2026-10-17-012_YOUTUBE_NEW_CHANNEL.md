# DEC-2026-10-17-012 — Nuevo canal de YouTube para monetización

**Fecha:** 2026-10-17
**Estado:** Vigente
**Aprobador:** Julián Montealegre
**Contexto:** Conversación nocturna 01:29–01:40 ART, 17 octubre 2026

---

## Decisión

Crear un **canal nuevo de YouTube** dedicado a monetización con el sistema de agentes YCS (07_YOUTUBE). El canal existente **Music relax** (julianmontealegre7@gmail.com) queda **excluido** del proyecto de monetización.

## Motivo

1. Music relax tiene 2 suscriptores, 9 horas calificadas, 0 subidas en 90 días y 0 vistas de Shorts. No califica para YPP ni para el nivel de 500 suscriptores (mínimo 3.000 horas).
2. El nombre "Music relax" contradice el nicho decidido (IA aplicada + finanzas personales en español). El nombre es la primera señal de nicho que YouTube indexa.
3. Un canal nuevo arranca limpio: nombre alineado, cero lastre de contenido genérico, y el orquestador opera desde el día uno sin diluir la señal.
4. Music relax no pierde nada: no está en YPP, no tiene audiencia ni ingresos. Se pausa o se deja inactivo.

## Consecuencias

- **Umbral aplicable:** el de solicitante nuevo. Desde el 1 de febrero de 2027 se duplica (8.000 horas o 20M vistas de Shorts). Meta: calificar **antes del 31 de enero de 2027** con el umbral viejo (1.000 suscriptores + 4.000 horas, o 10M vistas de Shorts en 90 días).
- **Conexión Analytics API:** OAuth con la cuenta dueña primaria del canal nuevo. No se puede autorizar con otra cuenta (error 403).
- **GitHub es la fuente canónica** del sistema YCS. Las carpetas de Drive (07_YOUTUBE_CONTENT_SYSTEM) quedan como espejo humano de solo lectura; no se duplica contenido.
- **README de 07_YOUTUBE sincronizado** con el árbol real de archivos (01_AGENT_EXECUTION_PACKAGE, 02_CALENDARIO_30_DIAS, 02_PROMPTS_Y_SCRIPTS, 06_ORQUESTADOR).
- El calendario de 30 días se ajusta: se elimina toda referencia a mudanza/Pereira (corregido 2026-10-17). El Short del lunes 9 pasa a "Operar desde Colombia con clientes en EE.UU.: la ventaja que nadie explota".

## Nombre del canal

Pendiente de validación con telemetría. Candidatos a probar con el primer Short:
- (definir tras primer ensayo)

## Riesgos

- Canal nuevo = cero historial de confianza del algoritmo. Los primeros 20–30 Shorts son fase de calibración con revisión humana obligatoria.
- Si el primer Short no engancha, el sistema archiva con razón documentada (PROMPT DIFF V1) en lugar de insistir.

## Referencias

- `07_YOUTUBE/README.md` (canónico, sincronizado 2026-10-17)
- `07_YOUTUBE/01_AGENT_EXECUTION_PACKAGE.md`
- `07_YOUTUBE/02_CALENDARIO_30_DIAS.md`
- Capturas de elegibilidad de Music relax (2026-10-17): 2 suscriptores, 9h, 0 subidas, 0 Shorts, 0 infracciones.
