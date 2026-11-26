# CHECKPOINT — CIERRE FORMAL DE ITERACIÓN TIVIPLAY S3 · FREEZE FUNCIONAL

**Fecha:** 2026-10-23 (America/Bogota)
**Rama:** `wo-tivi-hoy-creditos-001` (sin merge a `main`)
**Entorno en uso:** worktree `JUMOCOL_HOY` en el equipo de Dirección (`desktop-k9t0ts8`), servidor local `127.0.0.1:3001` con proxy LAN `https://192.168.0.4:3443`
**Estado:** `FREEZE FUNCIONAL S3` — no se inician nuevas funcionalidades
**NEXT ACTION:** `AUDITORÍA INDEPENDIENTE GROK`

Regla de lectura: `VALIDADO` = comprobado en la intranet real o con datos vivos. `IMPLEMENTADO` = construido y probado con tests, sin prueba operacional real completa. `PENDIENTE DE EVIDENCIA` / `REQUIERE EVIDENCIA` = falta una prueba o un dato real.

## 1. Publicación OPERADOR — Guía rápida de turno v1.2

| Campo | Valor |
|---|---|
| Documento | `tiviplay-guia-rapida-turno` · `03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_GUIA_RAPIDA_ATENCION_Y_SOPORTE_V1.md` |
| Versión | 1.2 (fecha de corte 2026-10-23), commit `5cae7b8` |
| SHA-256 publicado | `1946fc7a40b81a4c55e84e6c470f829f73443289a5968901820a7bbd1c65efc7` (coincide con el archivo en `5cae7b8`) |
| Roles autorizados | ADMIN (siempre) y OPERADOR (Heidi, Jorge, Manuela; activos, sin cambios de usuario ni contraseña) |
| Mecanismo | Control de publicación existente de la biblioteca (ADMIN, estándar operativo 7/7) |
| Publicado por | `julian` (ADMIN) · 2026-10-24T03:34:26Z (22:34 Bogotá, 23/10) |
| Alcance de la autorización | Solo esta versión exacta. Un cambio en el archivo cambia el SHA-256 y retira la lectura de operadores hasta una nueva publicación. |
| Evidencia | Inventario documental: «VIGENTE Y APTO PARA OPERADOR». Manuales y procesos: 8/8 accesos rápidos enlazados, 0 deshabilitados, sin aviso de «no publicado». Regla `libraryEntry`: un rol no ADMIN lee el documento cuando la aprobación coincide con el SHA-256 vigente. |
| Estado | `VALIDADO` para Dirección. Lectura como OPERADOR: `VALIDADO` por regla y estado de publicación; **no se hizo un ingreso real como operador** (requeriría sus contraseñas). |

## 2. Estado funcional consolidado

| Capacidad | Estado | Evidencia y límite |
|---|---|---|
| Acceso intranet (login, roles ADMIN/OPERADOR, auditoría) | `VALIDADO` | Login único `/login`; OPERADOR llega a TiviPlay; 4 usuarios activos (1 ADMIN, 3 OPERADOR). Solo red local; sin exposición pública. |
| HOY (`/operaciones/tiviplay/hoy`) | `VALIDADO` en conteos | GATE 4 (20/10): universo 73, FACTURAR_CANDIDATO 66, REQUIERE_REVISION 7, iguales a Runtime. Firma del resultado **diverge** entre motor y Runtime (drift sin resolver). |
| Motor mensual `monthly-close-v1` | `VALIDADO` técnico | 7/7 tests del motor; mismos conteos que Runtime. No se modificó en S3. |
| Cola diaria (HOY Bloque 1 — clientes por contactar) | `VALIDADO` como lectura | Lista de candidatos por semana desde el motor. No registra gestiones; la última gestión no se expone. |
| Pendientes de Confirmado JM (HOY Bloque 3) | `IMPLEMENTADO` | Lectura solo para Dirección de ZELLE/PAYPAL/TRANSF; fuente ilegible → REQUIERE_REVISION. Sin escritura ni botón de confirmación. |
| Créditos P1/P2/P3 (HOY Bloque 4) | `VALIDADO` como Dirección | Regla G única: fecha calendario de G = hoy, I ≠ COMPRA, Σ A. Ejecución = CREDITO (J) > 0. Vista OPERADOR: **PENDIENTE DE EVIDENCIA** (sin ingreso real como operador). |
| KPI de créditos | `VALIDADO` | Paridad en vivo 23/10: P1 120/100/20, P2 8/8/0, P3 639/510/129, total 767/618/149. Sin valores fijos en el código. «Hoy» de Sheets corregido con autorización (P3 = 15 ese día). |
| Exclusión COMPRA | `VALIDADO` | I = COMPRA excluido de programados, otorgados y «hoy», en la intranet y en las fórmulas de Sheets. |
| Habilitación financiera S0 (§7.1, casos A/B) | `IMPLEMENTADO` · **PENDIENTE DE EVIDENCIA** | Estados HABILITADO / NO_HABILITADO / SIN_PAGAR / REQUIERE_REVISION / EJECUTADO. No se ha observado un caso real que pase de PENDIENTE CONFIRMACIÓN a CONFIRMADO JM y luego a habilitación. |
| Match servicio ↔ BASE GENERAL (H ↔ F.VENCIMIENTO) | `IMPLEMENTADO` · **PENDIENTE DE EVIDENCIA** | Estados de sincronización ACTUALIZADA / PENDIENTE / SIN_VERIFICAR. La convergencia con datos reales es el objeto de la próxima prueba (sección 5). |
| Runtime | `VALIDADO` en conteos | Coincide con HOY; drift de firma abierto. No se modificó en S3. |
| Manuales y procesos | `VALIDADO` | Biblioteca con publicación por SHA-256; búsqueda por contenido («Dónde aparece»); botones Copiar; manual de octubre operativo. |
| Guía rápida v1.2 | `VALIDADO` y publicada a OPERADOR | Sección 1. |
| 8 accesos rápidos | `VALIDADO` | Abren 2.1, 3.2, 3.3, 3.5, 6, 4, 5 y 7 por ancla directa; 2 tests; móvil 390 px sin desplazamiento horizontal. |
| Procedimiento AT&T ActiveArmor | `VALIDADO` como documento | Procedimiento de Jorge + 3 capturas de Dirección; aplica solo con evidencia de bloqueo; advertencia de seguridad; capturas no incorporadas. Nombres exactos de menús de Smart Home Manager: REQUIERE EVIDENCIA. |
| URL de configuración por panel | `VALIDADO` | Se leen de `data/private/panel-endpoints.json`, fuera de Git (`git grep` = 0). Dominios ambiguos: REQUIERE EVIDENCIA · NO USAR. |
| Permisos Dirección / OPERADOR | `VALIDADO` por tests y regla | El operador solo lee documentos publicados; Bloque 3 no se dispara para OPERADOR. Falta ingreso real como operador para cerrar la prueba de extremo a extremo. |
| Launcher local (acceso directo «JUMOCOL OS» en Descargas) | `VALIDADO` | Lanzador v3b: corrida directa y por acceso directo, con logs `lanzador.log` y `hoy-validacion.log`. Depende de que el equipo de Dirección esté encendido. |

## 3. Implementado, validado y publicado en la iteración (commits en `wo-tivi-hoy-creditos-001`)

- `fdd5bc1` / `92ed490` — superficie HOY y GATE 4 (HOY = Runtime en conteos).
- `a94986e` / `91c127d` — manual operativo Lista de octubre (publicado a OPERADOR).
- `264a008` — HOY Bloque 3, pendientes de Confirmado JM (solo Dirección).
- `ad23647` — Manuales y procesos: guía rápida, búsqueda por contenido y Copiar.
- `5fd715f` — directorio JUMOCOL OS — Accesos; Downloader 2865004 validado como referencia.
- `6751439` — lector de configuración privada de URL por panel; guía v1.1 sin valores en Git.
- `7c2d745` / `3733130` / `a9253ca` / `c6e37e4` — Créditos de hoy y KPI por panel; tabla legible en celular.
- `4cce845` — búsqueda rápida con ancla directa.
- `5cae7b8` — guía v1.2 con AT&T ActiveArmor (publicada a OPERADOR).
- Fuera de Git: corrección autorizada de las fórmulas «Créditos por otorgar HOY» en Sheets (P1 A135, P2 A16, P3 A691).

## 4. Backlog

### Deuda operacional
- Habilitación S0 en un caso real (PENDIENTE DE EVIDENCIA).
- 24 pendientes históricos de Confirmado JM: tratarlos como backlog, no como operación del día.
- G con fechas de noviembre en CONTROL P1: la regla G se aplica igual; la intranet solo muestra una advertencia. Corregir la hoja, si corresponde, es decisión de Dirección.
- Teléfono vacío en 1 candidato de HOY.
- Responsable formal de las 7 excepciones de HOY: REQUIERE DECISIÓN.

### Deuda técnica
- Drift de firma entre el motor (`core.mjs`) y Runtime (`buildReadModel`) con conteos iguales.
- La rama `wo-tivi-hoy-creditos-001` no está fusionada a `main`; producción local corre desde el worktree `JUMOCOL_HOY` y la copia `JUMOCOL_SYSTEM_OS` va atrás.
- No hay prueba automatizada de extremo a extremo con sesión OPERADOR contra datos vivos.
- En el equipo de Dirección no hay shell confiable para el agente; el despliegue de archivos se hace por copia puntual.

### Evidencia pendiente
- Ingreso real como OPERADOR: Créditos, guía v1.2 y 8 accesos. Un perfil «Julián — Operador QA» queda a evaluar en la auditoría; no se ha creado.
- Prueba real CONFIRMADO JM → habilitación → servicio → match → BASE GENERAL → intranet (sección 5).
- Dominios ambiguos de P1 y P3 (confirmación carácter por carácter).
- Propiedad del servidor del código 2865004.
- Campos de ingreso de la app TiviPlay en Fire Stick.
- Nombres de menús de AT&T Smart Home Manager.
- Horario de atención y valor de NET IPTV vigentes.

### Automatización futura (no autorizada)
- Preparación reproducible de noviembre desde el motor (sección 6).
- Registro de gestiones de la cola diaria.
- Cualquier escritura en Sheets desde la intranet sigue prohibida en el alcance actual.

### UX / visual futuro (no autorizada)
- Jerarquía visual de HOY y Manuales; simplificación para el operador (sección 7).

## 5. Próxima prueba operacional (NO es desarrollo)

Dirección realizará confirmaciones reales `PENDIENTE CONFIRMACIÓN` → `CONFIRMADO JM` por cada método de pago correspondiente. Después se observará:

`CONFIRMADO JM → HABILITACIÓN FINANCIERA → CAPA DE SERVICIO → MATCH → BASE GENERAL → JUMOCOL OS`

Objetivo: comprobar con datos reales que la capa financiera y la de servicio convergen y que el resultado queda en BASE GENERAL y luego en la intranet. Durante la prueba no se automatiza ni se modifica el resultado; solo se observa y se registra la evidencia.

## 6. Objetivo operacional crítico — noviembre

Antes del cierre de octubre debe poder determinarse de forma reproducible, sin reconstruir el proceso a mano:

- universo de clientes a gestionar en noviembre;
- recaudo/cartera de noviembre;
- reglas aplicables;
- fechas de próximo pago;
- renovaciones;
- créditos por otorgar P1/P2/P3;
- excepciones;
- casos que requieren revisión.

## 7. PRIME / UX / CLOUD — registrado, no ejecutar

- **PRIME / UX:** solo después de validar el ciclo operacional real. Revisar interfaz y jerarquía visual, simplificar la operación, reutilizar Skills, componentes o repositorios cuando hayan demostrado valor, y no reconstruir la aplicación.
- **CLOUD:** la operación sigue local. Se evalúa solo cuando el motor de noviembre esté claro, las fuentes de verdad estabilizadas, los permisos definidos, la seguridad auditada, el flujo probado y se sepa qué componentes necesitan realmente disponibilidad remota. No migrar solo porque sea técnicamente posible.

## 8. Retroalimentación técnica de Claude (iteración S3)

### Funcionó bien
- Reutilizar el motor y Runtime existentes (HOY como capa de lectura, sin reescribir `core.mjs`) y validar por paridad de conteos en vivo.
- Publicación documental atada a SHA-256 exacto: la autorización no se hereda a versiones futuras.
- Configuración privada para datos sensibles (endpoints) con un reader y marcadores en el documento, en vez de forzar los valores en Git.
- Tests que leen el documento real (guía) y fallan si cambia un título o reaparece un dato sensible.
- WO con «no modificar», estados permitidos y formato de entrega fijo: redujo el alcance y evitó mezclar trabajos.

### Funcionó mal / generó retrabajo
- Supuestos sobre las hojas: G como texto con hora, fechas de noviembre en P1 y H prellenado antes de la ejecución obligaron a rehacer la regla de créditos y la fórmula de Sheets.
- El lanzador falló por detalles de Windows: acceso directo generado sin WScript, «LISTENING» frente a «ESCUCHANDO» y un log bloqueado.
- Copias de archivos al equipo que quedaron obsoletas por caché, y la falta de shell en el equipo, hicieron más lenta cada validación.
- La búsqueda rápida se construyó como búsqueda de texto y no como enlace directo; además se validó como Dirección sin revisar qué veía el operador. Por eso el fallo de publicación no se detectó a tiempo.
- Instrucciones de Dirección llegaron truncadas en dos ocasiones; hubo que detenerse y pedir el resto.

### Riesgos actuales
- Nada se ha probado con un ingreso real como OPERADOR.
- S0 y el match con BASE GENERAL no tienen un caso real observado.
- La disponibilidad depende de un solo equipo encendido y de su IP de red local.
- Rama sin merge y copia principal desfasada.
- Drift de firma motor ↔ Runtime.
- Las hojas vivas pueden cambiar de estructura sin aviso; la lectura depende de encabezados.

### Qué NO debemos repetir
- Validar solo con la cuenta ADMIN una función pensada para operadores.
- Asumir el tipo de dato o la semántica de una columna sin leer la hoja viva primero.
- Intentar guardar datos operacionales sensibles en Git y luego tener que deshacerlo.
- Declarar un entregable de Windows como listo sin ejecutarlo en el equipo real.
- Continuar con instrucciones incompletas en lugar de pedir el resto.

### Qué conservar
- Readers de solo lectura (`sheets-client`, proyecciones `*-projection.ts` con tests), «fuente ilegible → REQUIERE_REVISION, nunca 0».
- `section-search.ts` (anclas y búsqueda), bloques ```mensaje con Copiar y ```endpoints N alimentados por la configuración privada.
- Publicación por SHA-256 con estándar 7/7.
- Patrón de config privada en `data/private/` + `git grep` = 0 como control.
- Formato de checkpoint con evidencia, estados permitidos y NEXT ACTION; GOV-MA-001 para revisión independiente.

## 9. Riesgos abiertos

1. Sin prueba real con OPERADOR.
2. S0 / match / BASE GENERAL sin caso real.
3. Drift de firma motor ↔ Runtime.
4. Rama sin merge; copia principal desfasada.
5. Un solo equipo y una IP local como punto único de falla.
6. Preparación de noviembre todavía no reproducible.
7. Dependencia de la estructura de las hojas vivas.

## 10. NEXT ACTION

`AUDITORÍA INDEPENDIENTE GROK` — revisión independiente, según GOV-MA-001, sobre este checkpoint y la rama `wo-tivi-hoy-creditos-001`. Claude no la inicia. Después de la auditoría: prueba operacional real (sección 5).
