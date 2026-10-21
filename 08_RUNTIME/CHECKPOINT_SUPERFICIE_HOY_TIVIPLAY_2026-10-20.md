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

## GATE 4 — VALIDACIÓN VIVA · 2026-10-20 20:55 (America/Bogota) · commit `fdd5bc1`

**Estado: BLOQUEADO — no se pudo leer BASE GENERAL viva desde la sesión del agente. No se fabricaron resultados.**

| Ruta | Resultado |
|---|---|
| Shell en el equipo de Dirección (`desktop-k9t0ts8`) | `Workspace unavailable`: la VM local no arrancó. |
| Contenedor del agente → `oauth2.googleapis.com` / `sheets.googleapis.com` | `connect_rejected` por el proxy de egreso: Google no está permitido en esta sesión. |
| Código HOY en la copia local de Dirección | La carpeta local no tiene `operaciones/tiviplay/hoy` y ejecuta el estado de `wo-tivi-doc-001`. HOY solo existe en la rama `wo-tivi-hoy-001`. |
| Credenciales | `.env.local` existe en la copia local. No se leyó, no se copió y no salió del equipo. |

Bloques 1, 2 y drift Runtime↔motor: **sin medir**, por falta de lectura viva. Bloque 3: BLOQUEADO por diseño, sin cambios.

Seguridad, revalidada sin datos vivos:
- `security.test.ts` + `hoy-projection.test.ts`: 41/41.
- E2E previo: el anónimo va a `/login`, OPERADOR recibe 200 en GET y la página no hace solicitudes que no sean GET.
- Cliente de Sheets: solo lectura.
- Diff del PR #3: no contiene `.env`, `sqlite`, `data/private` ni snapshots. Los únicos teléfonos son los ficticios del fixture (`300000000x`).

**NEXT ACTION:** en el equipo de Dirección, en una carpeta aparte con `git worktree add` (no toca la copia de trabajo), levantar `wo-tivi-hoy-001` con el `.env.local` existente y abrir `/operaciones/tiviplay/hoy?semana=todas` en el navegador integrado, para que el agente lea los conteos.

## GATE 4 — CORRIDA VIVA · 2026-10-20 21:21 (America/Bogota) · worktree `JUMOCOL_HOY` @ `716df0d`

**Estado: VALIDADO.** Esta corrida reemplaza al bloqueo anterior.

**Ejecución:**
- Worktree aislado en el equipo de Dirección. `.env.local` y la base de identidad se copiaron dentro del mismo equipo a `JUMOCOL_HOY` (ignorados por Git); `JUMOCOL_SYSTEM_OS` no se modificó.
- Build y start de producción en `127.0.0.1:3001`.
- Sesión ADMIN iniciada por Dirección. Lectura en el navegador; los conteos se calcularon en la página, sin extraer PII.

| Verificación | HOY (motor `core.mjs`) | Runtime (`buildReadModel`) | Resultado |
|---|---|---|---|
| Universo del mes 2026-10 | 73 | 73 | Coincide |
| FACTURAR_CANDIDATO | 66 (66 filas de origen únicas, 0 mal formadas, todas en 2026-10) | 66 | Coincide |
| REQUIERE_REVISION | 7 (5 mes gratis, 1 no renovación, 1 excepción explícita) | 7 (5 / 1 / 1) | Coincide |
| Fechas inválidas | 0 | 0 | Coincide |
| Duplicados | 0 | 0 | Coincide |
| Estado | VALIDADO_TECNICO | VALIDADO_TECNICO | Coincide |
| Estabilidad de la fuente | Estable | Estable (hash `e36078fa6f73` en ambas lecturas) | OK |
| Firma del resultado | `a8d5fb7268ab…` | `67cb434c7324…` | **Diverge** |

- Semanas de los candidatos: S1–S5 = 6 / 17 / 16 / 15 / 12. Universo del Runtime: 7 / 17 / 17 / 17 / 15. La diferencia por semana suma 7 y corresponde a las revisiones.
- Huella de la lista de candidatos (SHA-256 de origen|cliente|teléfono, 12 caracteres): `753457b6b394`.
- Campos vacíos en candidatos: teléfono 1, cliente 0, plan 0, método 0.
- Responsable en las 7 excepciones: `REQUIERE DECISIÓN`.
- Bloque 3: `BLOQUEADO — monthly-close-v1 no expone actualmente pendientes de Confirmado JM`.

**Drift: RIESGO DE DRIFT CONFIRMADO.** Hoy afecta solo la firma, no los conteos.
- Un candidato tiene espacios repetidos en un campo de identidad (teléfono).
- `buildReadModel` junta esos espacios en `canon` y `core.mjs` no. Por eso el `identityHash` de esa fila, y con él la firma, difiere.
- Los conteos y el estado coinciden porque ese dato no genera duplicados en esta corrida.
- La autoridad es `monthly-close-v1`: HOY coincide con el motor. No es falla de HOY.

**Seguridad:**
- Anónimo: página → redirección a `/login`; API → 401; POST a `/hoy` → redirección, sin ejecución.
- El único formulario de la página es el POST de cierre de sesión (`/api/auth/logout`).
- Solicitudes del navegador: solo GET (prefetch RSC y `monthly-close`).
- Cliente de Sheets con scope de solo lectura. No hubo escritura en Sheets.
- OPERADOR con GET: no se probó en vivo porque no hay sesión de operador disponible; está cubierto por `security.test.ts` y por el E2E del 20/10.
- Este checkpoint no contiene nombres ni teléfonos.

**NEXT ACTION:** Dirección decide el merge (PR #2 → main y después PR #3).
