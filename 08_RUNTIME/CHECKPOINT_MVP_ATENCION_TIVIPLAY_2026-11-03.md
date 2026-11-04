# CHECKPOINT — MVP ATENCIÓN TIVIPLAY

**Fecha:** 2026-11-03
**Rama:** `claude/project-thread-ffn0r3`, creada desde `origin/wo-tivi-hoy-creditos-001` (`c917e28`)
**Estado:** IMPLEMENTADO. Sin desplegar y sin publicar para operadores.

## ACTIVE CONTEXT

La intranet tiene dos vistas nuevas para operadores: `/operaciones/tiviplay/atencion` y `/operaciones/tiviplay/turno`. Las fichas viven en `03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_FICHAS_ATENCION_V1.md` y usan la publicación existente: un operador las ve solo cuando ADMIN publica esa versión exacta.

## DECISION LOG

- Una sola fuente: Markdown canónico en la allowlist. No hay base de casos ni contenido duplicado en código.
- `VALIDADO` en una ficha significa texto literal de la Guía rápida publicada. No certifica el proceso E2E.
- Referidos, reactivación y cambio de panel quedan `REQUIERE DECISIÓN`, con mensaje neutro.
- El código de Downloader, las URL y los enlaces siguen solo en la Guía rápida; las fichas remiten a ella.
- Nivel A del paquete de WhatsApp no se leyó ni se copió.

## BACKLOG

| Tema | Estado | Responsable |
|---|---|---|
| Revisar y publicar las fichas | REQUIERE DECISIÓN | DIRECCIÓN |
| Actualizar `JUMOCOL_HOY` (entorno de operadores) a esta rama | REQUIERE DECISIÓN | DIRECCIÓN |
| Tarifa, promoción de referidos, reactivación (D13), política de retención | REQUIERE DECISIÓN | DIRECCIÓN |
| Almacén de credenciales para operadores | REQUIERE DECISIÓN | DIRECCIÓN |
| Registro de casos y resultados | NO IMPLEMENTADO | SISTEMA, tras decisión |
| `readBaseLive` lee hasta la columna AP por posición | PARCIAL | SISTEMA |
| Pruebas de `quick-access` y `drive-links` fallan con CRLF en Windows | PARCIAL | SISTEMA |

## EVIDENCIAS

- `tsc`, `next build` y 18 de 18 comprobaciones E2E locales, con base de identidad temporal fuera del repositorio.
- Vitest: las únicas fallas son las dos pruebas de CRLF, sobre la Guía rápida, que esta rama no modifica.
- Barrido del HTML servido al operador en las 24 fichas: sin contraseñas, correos, enlaces históricos ni referencias `WA-xxx`.

## NEXT ACTION

Dirección revisa las fichas y autoriza actualizar `JUMOCOL_HOY`; después publica la versión en Manuales y procesos.

## ACTUALIZACIÓN 2026-11-04 — MVP operacional (rama `work/tiviplay-mvp-operacional-20261104`)

- Implementado: apertura en `/turno` (cartera, cola diaria, carriles, USD/COP, créditos por panel), búsqueda por nombre/teléfono/usuario (POST de solo lectura), clasificación A/B/C trazable sobre las 24 fichas y respuesta copiable personalizada solo con datos confirmados.
- P0 corregido: el lector excluye CONTRASEÑA por encabezado. Desde el 01/11 está en BASE GENERAL!O (ID en M). PAGOS NOV la tiene en N y CONTROL en F.
- Runtime ahora lee el contrato de cartera de noviembre (CLASIFICACION_BORRADOR + ESTADO_COBRO).
- Evidencia: typecheck, build y 187 tests pasan. E2E Playwright 22/22 (ADMIN/OPERADOR). QA independiente: todo PASS salvo un rótulo ambiguo, ya corregido. La fuente fue una CAPTURA LOCAL parcial (PAGOS NOV, BASE 1–100, CONTROL NOV P1/P2). No hubo lectura viva con cuenta de servicio, así que no se declara VALIDADO.
- REQUIERE DECISIÓN (Dirección): en CONTROL (NOV) P3 la columna rotulada USUARIO contiene contraseñas. Hay que corregir la hoja antes de leerla. Las fichas siguen sin publicar.

## NEXT ACTION (2026-11-04)

En JUMOCOL_HOY: definir `TIVIPLAY_SPREADSHEET_ID` con la cuenta de servicio y sin `TIVIPLAY_SHEETS_SNAPSHOT_FILE`, y luego abrir `/operaciones/tiviplay/turno` para validar con datos vivos. Dirección corrige CONTROL (NOV) P3!E y publica las fichas.
