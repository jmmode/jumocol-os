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

---

# Continuación 20/10 — Motor operacional TiviPlay (capa financiera → servicio → gate)
**Estado del gate operacional:** PARCIAL. La estructura existe, pero no hay un recorrido E2E real.

## Reinspección de las hojas vivas (`GESTION_DIA_PAGOS_2026_TIVIPLAY`, 20/10)
- **D1 — IMPLEMENTADO (estructura) / PARCIAL (uso).** `F.VENCIMIENTO` está en la columna H de `CONTROL (OCT)` P1/P2/P3, con formato `yyyy-mm-dd` y sin validación de fecha. El saldo se ajustó a `=K2-J3`. Solo 2 filas diligenciadas.
- **D3 — PARCIAL.**
  - CONTROL P1/P2/P3 tienen la lista estricta `JULIAN, JORGE, HEIDI, MANUELA`; ZELLE tiene `JORGE, HEIDI, JULIAN, MANUELA`.
  - PAYPAL (`Jorge, Julian, Heidy`) y TRANSF (`Jorge, Danna, Julian, Juan, Heidy`) no incluyen a Manuela y escriben "Heidy".
  - En CONTROL P3, la validación está en la fila 600 pero no en la 700.
- **R1 — VIGENTE, P0.** CONFIRMACION no tiene protección en ZELLE H, PAYPAL M ni TRANSF K. Las protecciones existentes son solo de advertencia y cubren columnas calculadas.
  - Control mínimo propuesto: protección real con Dirección como única editora; el asesor deja la columna vacía.
  - No requiere cambiar fórmulas, porque la cartera ya muestra una CONFIRMACION vacía como `PENDIENTE CONFIRMACION`.
- **E2E:** ningún caso cumple `CONFIRMADO JM + CONTROL + F.VENCIMIENTO` posterior al período.
  - La única renovación con fecha (P1, fila 3; BASE GENERAL, fila 478) es un plan multimes sin pago de octubre.
  - Su fecha no es posterior al 31/10, y BASE GENERAL tiene otra.
  - No se fabricó ni se modificó ningún dato.
- **Cruce entre capas:** la cadena determinística es `FILA_BASE → BASE.USUARIO/PANEL → CONTROL.USUARIO`. No es inequívoca: hay usuarios repetidos, espacios y tabulaciones, varias filas por usuario, cruces entre paneles y planes multimes. Queda como REQUIERE DECISIÓN (D7, D8).
- **R2 — MATERIALIZADO:** filas de `PAGOS OCTUBRE 2026` con texto escrito sobre las columnas calculadas.

## Cambios
- Manual v0.2 (mismo archivo) y plantilla actualizada (secciones 13–15).
- Prueba nueva de la estructura del manual.
- `pnpm test`: 86 OK.

## BACKLOG (sin desarrollar)
- D2: procedimiento de actualización de BASE GENERAL.
- D4: hoja CONTROL para PANEL 3M, Canada1996 y Reseller.
- D5: uso de `SIN PAGO`.
- D6: renovar con `Sin Pagar`, `Promoción` o `CORTESIA`.
- D7: llave de cruce entre capas.
- D8: gate financiero de los planes multimes.
- D9: filas precargadas de CONTROL.
- D10: fecha que prevalece entre CONTROL y BASE.
- R2: fórmulas de PAGOS sin protección.
- R3: contraseñas en texto plano.
- R4: escrituras distintas en las listas.
- R5: cobertura de validación en P3.
- R6: validación de fecha en F.VENCIMIENTO.
- **Motor auditor financiero** (independiente): operación de septiembre ↔ extractos reales de los medios de pago. No iniciado.
- **Motor auditor de servicio** (independiente): CONTROL P1/P2/P3 de septiembre ↔ exportaciones Excel de los paneles. No iniciado.

## NEXT ACTION
Dirección aplica el control mínimo de R1 (proteger CONFIRMACION). Después, en la próxima renovación real con `CONFIRMADO JM`, el asesor registra `F.VENCIMIENTO` leída del panel. Ese caso será el primer recorrido E2E del gate.
