# CHECKPOINT — WO SUPERFICIE HOY TIVIPLAY

**Fecha:** 2026-10-20 (America/Bogota)
**Commit base solicitado:** `c9e6246e`
**Base efectiva:** `wo-tivi-doc-001` (intranet con login, roles, vitest y eslint) + merge de `c9e6246e`
**Rama:** `wo-tivi-hoy-001`
**Estado:** IMPLEMENTADO — validación con datos reales pendiente en el equipo de Dirección

## Por qué cambió la base

`c9e6246e` (main) contiene una intranet sin autenticación, sin tests y sin lint. La intranet que usa el equipo (login, OPERADOR/ADMIN, auditoría) vive en `wo-tivi-doc-001`. Publicar nombres y teléfonos de clientes en una página sin login no es aceptable, así que la página se montó sobre esa intranet y se fusionó `c9e6246e` (solo agrega `NEXT_ACTION_HOY_TIVIPLAY_2026-10-20.md`).

## Qué se construyó

`/operaciones/tiviplay/hoy`. Cadena: `motor core.mjs (sin cambios) → getTiviplayHoyLive (read model ampliado) → projectHoy (solo selección de campos) → página`.

| Bloque | Fuente | Resultado |
|---|---|---|
| 1 · Clientes por contactar | `preview[]` con `classification = FACTURAR_CANDIDATO` | Semana, F. próximo pago, cliente, teléfono, plan, método de pago, origen `BASE GENERAL!fila`. Filtro por la semana actual del propio motor (`weekBucket`) o todo el mes. No se muestra la última gestión porque el motor no la expone. |
| 2 · Excepciones | `exceptions[]`, `duplicates[]`, `preview[]` con `REQUIERE_REVISION` | Tipo, filas, detalle y salida literal del motor. Responsable: `REQUIERE DECISIÓN`, porque no hay responsable gobernado. |
| 3 · Confirmado JM | — | `BLOQUEADO — monthly-close-v1 no expone actualmente pendientes de Confirmado JM` |

## Validación

- vitest: 94 aprobados, 11 omitidos (antes: 86). Se agregaron 8 tests en `hoy-projection.test.ts` y 2 aserciones de política.
- tsc: OK.
- eslint: sin hallazgos en los archivos tocados. Los 3 hallazgos previos de `tiviplay/dashboard/` siguen igual (fuera de alcance).
- next build: OK, con la ruta `ƒ /operaciones/tiviplay/hoy`.
- Motor (`node --test`): 7/7, sin cambios.
- Navegador (Playwright 1.56 + Chromium del entorno, BD de identidad de prueba aislada):
  - un usuario anónimo se redirige a `/login`;
  - OPERADOR y ADMIN reciben 200 y ven el enlace HOY y los 3 bloques;
  - la página no hace solicitudes que no sean GET;
  - sin credenciales de Google la página muestra BLOQUEADO.

## CAPABILITIES USED

| Capacidad | Origen | Versión | Función | Evidencia |
|---|---|---|---|---|
| Motor `buildMonthlyClose`, `weekBucket` | `05_AUTOMATION/tiviplay-monthly-close-v1/src/core.mjs` | rama `wo-tivi-hoy-001` | Clasificación y semana operativa | Importado vía alias `@motor/…/core` en `monthly-close.ts` y `hoy/page.tsx` |
| `sheets-client` (readonly) | intranet | ídem | Lectura de BASE GENERAL | `readBaseGeneral()` reutilizado |
| Auth (`requirePage`, `policy`, `audit`) | intranet | ídem | Acceso por rol y auditoría | `/operaciones/tiviplay/hoy` en `operatorPages` |
| `PageHeader`, `SectionCard`, `TiviplayNavigation` | intranet | ídem | UI | Importados en `hoy/page.tsx` |
| vitest | intranet | 4.1.x | Tests | 94 aprobados |
| TypeScript `tsc` | intranet | 5.9.3 | Typecheck | OK |
| eslint + eslint-config-next | intranet | 9.39.5 / 16.3.1 | Lint | Sin hallazgos nuevos |
| Next.js build (Turbopack) | intranet | 16.3.1 | Build | OK |
| Playwright + Chromium | entorno de ejecución (no repo) | 1.56.0 | E2E de la superficie | Script y capturas fuera de Git |

No se invocó ninguna skill del entorno: las candidatas (frontend-design, testing-strategy, google-workspace) no aportaban algo que el repo no tuviera. No se agregaron dependencias.

## Límites

- En este entorno no hay credenciales de Google. Que los candidatos reales salgan sin reclasificación se demostró con el motor real sobre filas ficticias; falta la corrida con BASE GENERAL viva.
- `monthly-close.ts` conserva su `buildReadModel` previo (agregados del Runtime). No se tocó; la duplicación de lógica es anterior a esta WO.

## NEXT ACTION

En el equipo de Dirección, con `.env.local` vigente, ejecutar `pnpm build && pnpm start`, abrir `/operaciones/tiviplay/hoy?semana=todas` y comparar: los conteos de Bloque 1 y Bloque 2 deben ser iguales a «Facturar candidato» y a «Requiere revisión + duplicados + errores de datos» del Runtime del mismo mes.

Registrar en este checkpoint:
- fecha y hora;
- minutos de Dirección antes y después.
