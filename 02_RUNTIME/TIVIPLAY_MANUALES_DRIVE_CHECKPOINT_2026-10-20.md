# TiviPlay — Manuales y procesos — Checkpoint WO-TIVI-DOC-001
**Fecha:** 2026-10-20 · **WO:** WO-TIVI-DOC-001 (autorizado por Dirección) · **Rama:** `wo-tivi-doc-001` · **Ejecutor:** Claude · **Estado:** IMPLEMENTADO — pendiente prueba humana con rol OPERADOR

## Qué se hizo
- Se consolidó en rama el código de la intranet que solo existía en el equipo local (identidad, biblioteca gobernada, runtime) sin `.env.local`, `data/private`, `node_modules` ni `.next`; escaneo de secretos/PII sin hallazgos.
- `/operaciones/tiviplay/manuales` (ruta existente, reutilizada): botón **Abrir original en Drive** en lista y visor, con aviso de permisos de Google.
- Las presentaciones de instalación (PPTX, no legibles en el visor) pasan a ser entradas **solo-enlace** publicables por ADMIN con el mismo control de hash + estándar 7/7.
- Mapa `DRIVE_ORIGINALS` en `curation.ts`: 22 correspondencias por nombre entre la carpeta Drive `CAMPAÑA TIVIPLAY` (inventario 2026-10-20: 31 archivos, 3 subcarpetas) y la copia LIFE-OS. Ningún documento RESTRINGIDO recibe enlace.
- Corrección previa necesaria para compilar: ruta de `outputFileTracingIncludes` en `next.config.ts`.

## Evidencia
- `pnpm test`: 84 OK / 11 omitidos (requieren LIFE-OS local), incluye 3 pruebas nuevas `drive-links.test.ts`.
- `pnpm typecheck` OK · `pnpm build` OK · eslint OK en archivos modificados.
- NO VALIDADO: prueba humana con rol OPERADOR en el equipo de Dirección; correspondencia de contenido Drive ↔ copia local (solo por nombre).

## Excluidos para todos
`CUENTAS AMAZON para (Fire stick)`, `3)Dispositivos-Mapa explicativo` (Doc y PDF), `INSTALACIONES ESCRITAS TIVIPLAY`, `Incentivos OP Diciembre.pdf`, `Política de Incentivos TIVIPLAY`.

## REQUIERE DECISIÓN / BACKLOG
- Cobros: `INSTRUCTIVO DE COBRO` y `PROTOCOLOS DE RETENCION` se contradicen (descuentos); el Manual de cobro tiene datos bancarios. No hay documento de cobros publicable.
- Solo en Drive, sin copia local: `1) PRESENTACIÓN TIVIPLAY`, `Información general del Servicio TIVIPLAY 2024.pdf`.
- Documentos 5/6/7 (feb-2026) no están en la carpeta Drive: visibles en el visor, sin enlace.
- Página `capacitacion` existe en `main` pero no en el equipo local: no se tocó.

## NEXT ACTION
Dirección publica desde `/operaciones/tiviplay/manuales/<id>` (rol ADMIN) un recurso por área — instalación, servicio técnico, atención, capacitación — y Manuela verifica con su cuenta que los ve y abre el original en Drive.
