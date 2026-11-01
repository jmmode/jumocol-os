# CHECKPOINT DE RECEPCIÓN — Operaciones TIVIPLAY

**Fecha:** 2026-10-29 (verificación en vivo ~21:30 UTC) · **Modo:** solo lectura. No se modificaron Sheets, código, ramas ni producción. El motor mensual no se ejecutó.
**Fuente de la transferencia:** `JUMOCOL_OS_CLAUDE_TRANSFERENCIA_2026-10-29.md` (proyecto).
**Regla:** DOCUMENTACIÓN ≠ ESTADO ACTUAL ≠ DATO VIVO ≠ EVIDENCIA. Este archivo no contiene nombres, correos ni contraseñas; se identifican filas por número de hoja.

---

## OBJETIVO
Recibir la transferencia, reconocer el último checkpoint verificable, confirmar accesos y preparar el P0-1 sin ejecutar cambios.

## 1. Último checkpoint verificable

| Elemento | Documentado (índice) | Verificado ahora | Estado |
| --- | --- | --- | --- |
| Checkpoint vigente | `CHECKPOINT_S5 § Gate financiero final octubre 2026` (28/10) | El archivo existe en la rama y la sección dice `NO APTO PARA MOTOR MENSUAL` (DEC-2026-10-28-023) | VALIDADO |
| Gate financiero | NO APTO | Se mantiene NO APTO: los P0 siguen abiertos (ver §4) | BLOQUEADO |
| Gate BASE GENERAL | VALIDADO (28/10) | No re-verificado en esta recepción (no era necesario para P0-1) | VALIDADO (documental) |
| Motor mensual | No ejecutado | No ejecutado | — |

## 2. Repositorio, rama y commit de continuidad

| Campo | Valor verificado |
| --- | --- |
| Repo | `jmmode/jumocol-os` (acceso de lectura, clon superficial) |
| Rama de continuidad | `wo-tivi-hoy-creditos-001` |
| Commit HEAD | `c917e28` (2026-10-28 18:45 -0500) — coincide con el índice |
| Relación con `main` | `main` = `b967693` (Merge PR #4, S0 v0.3, 21/10). La rama va 49 commits por delante y 2 por detrás (`c14035d`, `b967693`). **No fusionada.** |
| Documentos canónicos (§3 del índice) | Los 9 archivos existen en `c917e28`. DEC-2026-10-28-020…023 presentes en el Decision Log. |

**Observación:** el índice dice que S0 v0.3 está vigente (DEC-2026-10-24-018), pero en la rama solo está el archivo `..._S0_V0_2_2026-09-28.md`; el texto de S0 v0.3 está en `main` (PR #4) y no en la rama. REQUIERE DECISIÓN antes de cualquier merge (no ahora).

## 3. Evidencias y herramientas: accesibles vs. brechas

| Recurso | Acceso desde este hilo | Estado |
| --- | --- | --- |
| Libro `GESTION_DIA_PAGOS_2026_TIVIPLAY` (`1bOgUMr…di-4`) | Lectura OK (BASE GENERAL, PAGOS OCT, ZELLE/PAYPAL/TRANSF OCT, CONTROL OCT P1–P3 presentes; sin hojas `ZZ_*`) | IMPLEMENTADO |
| Repo y docs (§2) | Lectura OK | IMPLEMENTADO |
| Motor `tiviplay-monthly-close-v1` | Código disponible; no ejecutado (gate NO APTO) | BLOQUEADO por gate |
| Libro VENTAS 2026 · USUARIOS LIBERADOS | No consultado (no necesario para P0-1) | — |
| Intranet (`data/private`, decisiones guardadas) | No accesible desde aquí: está en el equipo de Dirección | Brecha |
| Logs `despliegue-*.log`, respaldos `backup-identidad-*` | En el equipo de Dirección (`Downloads\jumocol-update\`); no accesibles desde aquí | Brecha (conservar allí) |
| `CONCILIACION_SERVICIO_…xlsx`, `conciliacion-servicio-v2.json`, `LOG_ESCRITURA_BASE_…csv`, `AUDITORIA_PANEL3_…xlsx` | Estaban en el contenedor de la sesión anterior; no están en el proyecto | Brecha (no recuperables desde aquí) |
| Volcados `/tmp/claude-0/*` de la sesión anterior | Perdidos (contenedor efímero); la metodología está en el checkpoint | Brecha aceptada |
| Pruebas `vitest` de la app | No re-ejecutadas en esta recepción | — |
| Conectores GitHub/Slack/Notion del plugin *engineering* | Fallaron por proxy (403). El MCP GitHub principal y `git` funcionan. | Sin impacto |

## 4. Dato vivo: ZELLE (OCT) a 29/10 (relectura)

Resumen de la columna `CONFIRMACION` (H), filas 4–107:

- **PENDIENTE CONFIRMACION: 9 filas** → 68, 78, 101, 102, 103, 104, 105, 106, 107.
- **REQUIERE REVISIÓN: 3 filas** → 15, 23, 41.
- PAYPAL (OCT): 12 cobros, todos CONFIRMADO JM. TRANSF (OCT): 15, todos CONFIRMADO JM.

**Diferencia con el índice:** el índice registró (16:20 COT) «filas 101 y 102 + 2 pagos nuevos». Ahora hay **5 filas pendientes después de la 102** (103–107, fechas 27–29/10). El universo de noviembre sigue moviéndose; hay que congelar un corte antes de la simulación.

**Diferencia de numeración P0:** el checkpoint S5 y el índice ordenan los P0 distinto (en S5, ZELLE 101/102 es el P0-3; en el índice es el P0-1). Este documento sigue el orden del índice.

## 5. Preparación del P0-1 (sin ejecutar)

### 5.1 DIRECCIÓN — confirmar o rechazar (`CONFIRMADO JM` nunca se automatiza)

| Fila ZELLE (OCT) | Fecha | Monto | Origen | Enlace a BASE | Tarifa | Qué decide Dirección |
| --- | --- | --- | --- | --- | --- | --- |
| 101 | 27/10 | $70 | FACTURACIÓN | Ficha 23 (única) | Coincide plan 6M+1 | Confirmar / rechazar |
| 102 | 27/10 | $15 | FACTURACIÓN | Ficha 765 (única) | Coincide plan 1M | Confirmar / rechazar |
| 103 | 27/10 | $70 | RECONEXIÓN | 2 fichas candidatas, sin enlace | — | Confirmar / rechazar |
| 104 | 27/10 | $180 | VENTA | Sin enlace | — | Confirmar / rechazar |
| 105 | 28/10 | $70 | FACTURACIÓN | Ficha 776 (única) | Coincide plan 6M+2 | Confirmar / rechazar |
| 106 | 28/10 | $10 | FACTURACIÓN | Ficha 784 (única) | **Sin coincidencia** (ficha con plan 12M, 3 pantallas) | Confirmar / rechazar **y** decidir tarifa |
| 107 | 29/10 | $110 | VENTA | Sin ficha (TC = 0) | — | Confirmar / rechazar |
| 68 | 16/10 | $25 | FACTURACIÓN | — | — | Confirmar / rechazar (anterior al corte) |
| 78 | 19/10 | $30 | VENTA | — | — | Confirmar / rechazar (anterior al corte) |
| 15, 23, 41 | — | — | — | — | — | REQUIERE REVISIÓN: indicar si salen del universo o se confirman |

Además, decisión de corte: **fecha/hora de congelamiento** del universo de octubre para la simulación (propuesta: 31/10 23:59 COT).

### 5.2 EQUIPO (back office) — solo después de la decisión de Dirección

- Fila 103 confirmada → elegir la ficha correcta entre las 2 candidatas.
- Filas 104 y 107 confirmadas → alta de ficha en BASE (mismo tratamiento que P0-3).
- Fichas 23, 765, 776, 784 → propagar `F. PRÓXIMO PAGO` si la fórmula no lo hace.

### 5.3 SISTEMA — verificaciones de solo lectura (las ejecuta la IA)

1. Releer `H` de ZELLE/PAYPAL/TRANSF (OCT): 0 filas `PENDIENTE CONFIRMACION` dentro del corte.
2. Para cada confirmada: `ESTADO_ENLACE = ENLAZADO`, `COINCIDENCIAS_BASE = 1` y `CLIENTE_KEY` igual a la llave de la ficha en `FILA_BASE`.
3. Traza `PROP_F_PROXIMO` (pago) → `F. PRÓXIMO PAGO` (BASE): igual o posterior.
4. Rechazadas: fuera del universo y sin propagación a BASE.
5. Cerrados P0-2 y P0-3: repetir la simulación en memoria `buildMonthlyClose` para 2026-11 (base: 100 candidatos, 0 duplicados, 0 fechas inválidas) y documentar la diferencia.
6. Solo con todo lo anterior en verde se propone a Dirección pasar a `APTO PARA MOTOR MENSUAL`.

## ESTADO
Recepción: VALIDADO. Gate financiero: **NO APTO PARA MOTOR MENSUAL** (BLOQUEADO por P0-1, P0-2, P0-3).

## NEXT ACTION
Dirección responde la tabla 5.1 (9 pagos pendientes + 3 en revisión + fecha de corte). Con esa respuesta, la IA ejecuta las verificaciones 5.3 (1–4) en solo lectura y pasa a preparar P0-2.

---

## 6. FICHA DE DECISIÓN P0-1: 12 pagos ZELLE (OCT) (relectura 29/10/2026, ~21:45 UTC)

**Fuentes leídas (solo lectura):** ZELLE (OCT) A:Z, BASE GENERAL (columnas E:H, J:M, O:AN, sin leer C, D, I ni N/CONTRASEÑA), ZELLE (SEPT) y CATALOGO_TARIFAS_VIGENTE.
**Privacidad:** se aplica la restricción heredada (sin PII en el proyecto). El cliente aparece con iniciales y el USUARIO con sus últimos 4 caracteres. La identidad completa está en la ficha BASE indicada.

**Evidencia financiera: en ninguno de los 12 casos hay comprobación bancaria accesible.** Lo que existe es el registro del asesor en Sheets: fecha, monto, origen y, a veces, el nombre del pagador. Para confirmar cualquiera de ellos falta el mismo soporte: **un movimiento Zelle en el extracto de la cuenta receptora** (fecha, monto exacto, nombre del remitente y número de confirmación). Ese extracto solo lo tiene Dirección. Cuando quien paga es un tercero, además hace falta la relación pagador → cliente.

### 6.1 Tabla

| Fila · fecha | Cliente / USUARIO | Valor | Tipo | Confirmación actual | Enlace BASE e identidad | Tarifa registrada / esperada | Inconsistencia o riesgo | Recomendación | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **101** · 27/10 | R.D. / …1913 | USD 70 | Facturación | PENDIENTE | Ficha 23, una sola coincidencia, llave idéntica. Al día; F. PRÓX 08-11-26 | 70 / 70 (6M+1, 1 pant.) ✓ | CONTROL OCT ya tiene el crédito ejecutado (vence 18-11-26) **antes** de la confirmación | **Confirmar** si el extracto lo respalda | Dirección → BO propaga F. PRÓX |
| **102** · 27/10 | S.B. / …727S | USD 15 | Facturación | PENDIENTE | Ficha 765, única. Vencido; F. PRÓX 26-10-26. Pago de sept. confirmado (ZELLE SEPT!137) | 15 / 15 (1M) ✓ | Sin el pago confirmado, queda fuera de noviembre | **Confirmar** si el extracto lo respalda | Dirección → BO propaga y gestiona el crédito |
| **103** · 27/10 | N.C. / …1036 | USD 70 | Reconexión | PENDIENTE | 2 fichas con la misma llave: **760** (vencida, en la sección operativa) y otra en DESACTIVADOS AGO 2026 | 70 / **180** (catálogo 12M, 3 pant.). La ficha tiene USD 70 y el seguimiento del 27/10 dice «promo 70 USD año» | La tarifa promocional no está en el catálogo vigente. Enlace sin resolver | **Investigar → Dirección decide la tarifa** promo (¿cuántas pantallas?) y después confirma | Dirección (tarifa) → BO enlaza con la 760 |
| **104** · 27/10 | F.R. / sin usuario | USD 180 | Venta | PENDIENTE | Sin CLIENTE_KEY ni ficha (no existe en BASE) | 180 = catálogo 12M, 3 pant. (deducido, no registrado) | Venta sin alta; sin plan ni pantallas registrados | **Confirmar** si el extracto lo respalda | Dirección → BO da de alta la ficha |
| **105** · 28/10 | M.P. / …5462 | USD 70 | Facturación | PENDIENTE | Ficha 776, única. Vencido desde el 19-10-26; sin crédito en CONTROL OCT | 70 / 70 (6M+2, 1 pant.) ✓ | Servicio vencido 9 días | **Confirmar** si el extracto lo respalda | Dirección → BO crédito + propagación |
| **106** · 28/10 | O.S. / …0490 | USD 10 | Facturación | PENDIENTE | Ficha 784, única por nombre. Vencido el 15-10-26; nota: «vuelve en diciembre». El pagador es un tercero con otro nombre | 10 / **180** (12M, 3 pant.). USD 10 no existe en el catálogo (mínimo 15) | Probable atribución errónea o concepto distinto (abono o pantalla). El nombre del pagador se parece al de una ficha desactivada en ago. 2026. **CONTROL OCT muestra un crédito ejecutado** (vence 04-11-26) sin un pago que lo cubra | **Investigar.** No confirmar como renovación | BO (aclarar con la asesora) → Dirección |
| **107** · 29/10 | A.R. / sin usuario | USD 110 | Venta | PENDIENTE | TC = 0, sin ficha en BASE. Paga una empresa | 110 / sin equivalente (6M·3 pant. = 105; 12M·1 = 130) | El plan vendido no está identificado; el pagador es una persona jurídica | **Investigar → Dirección decide la tarifa** y después confirma | BO (plan vendido) → Dirección |
| **68** · 16/10 | S.R. / …6917 | USD 25 | Facturación | PENDIENTE | Ficha 146, única. BASE ya muestra F. ÚLT 16-10 y F. PRÓX 16-12-26 | 25 / 25 (2M) ✓. Secuencia coherente con SEPT (USD 15, 14/09, confirmado) | **BASE propagó el pago sin CONFIRMADO JM** | **Confirmar** si el extracto lo respalda. Si se rechaza, revertir la fecha | Dirección → BO |
| **78** · 19/10 | M.R. / sin usuario | USD 30 | Venta | PENDIENTE | Sin ficha. Observación «ZELLE JM - MIRA+»: servicio MIRA+, no TIVIPLAY | Fuera del catálogo TIVIPLAY | Debe salir del universo TIVIPLAY; no está en la sección MIRA+ | **Confirmar como MIRA+** si el extracto lo respalda | Dirección (clasificación) → BO da de alta en MIRA+ |
| **15** · 03/10 | M.D. / …0106 | USD 82 | Facturación | REQUIERE REVISIÓN | Ficha 536, única. La observación dice que pagó un tercero (familiar) el **25/09**. No está en ZELLE (SEPT): no hay doble registro | 82 / 82 (6M+1, 2 pant.) ✓ | El pago es de septiembre y está registrado en octubre. BASE ya tiene F. PRÓX 02-06-27 (el anclaje al pago daría 25-04-27: 38 días de diferencia) | **Confirmar** si el extracto de **septiembre** lo respalda. La fecha la valida BO con la regla Caso A/B | Dirección → BO |
| **23** · 05/10 | N.B. / …0797 | USD 15 | Facturación | REQUIERE REVISIÓN | 2 fichas con **el mismo USUARIO**: **739** (al día, F. ÚLT 05-10, F. PRÓX 05-11-26, ya refleja este pago) y **811** (vencida; F. PRÓX 30-09-26) | 15 / 15 (1M) ✓ | Ficha duplicada (USUARIO repetido, categoría D). BASE se adelantó a la confirmación | **Confirmar** si el extracto lo respalda. Enlazar con la 739 | Dirección → BO enlaza; la 811 va a depuración |
| **41** · 08/10 | C.M. / …9139 | USD 70 | **Venta** | REQUIERE REVISIÓN | Enlazado con la ficha 368 **solo por el nombre**. La 368 es 12M, 3 pant., USD 180, pagada hasta el 01-03-27 por **Bancolombia** | 70 / 180 → no coincide | Un pago «VENTA» enlazado con un cliente que ya pagó el año: probable **enlace erróneo**. Hay otra ficha con un nombre parecido. Probablemente es una venta nueva (70 = 6M, 1 pant.) sin ficha | **Investigar.** No confirmar contra la 368 | BO (verificar con el asesor) → Dirección |

### 6.2 Decisiones mínimas de DIRECCIÓN

1. **Formalizar la fecha de corte:** 31/10/2026 a las 23:59 COT.
2. **Cotejar el extracto bancario** de los 12 movimientos (fecha, monto, remitente, n.º de confirmación). Es el único soporte que falta y solo lo tiene Dirección.
3. **Confirmar en bloque, si el extracto coincide,** los 7 casos con tarifa y enlace coherentes: 101, 102, 105, 68, 15 (extracto de sept.), 23 y 104.
4. **Decidir 2 tarifas:** 103 (promo de USD 70/año: ¿cuántas pantallas?) y 107 (qué plan corresponde a USD 110).
5. **Clasificar 78 como MIRA+**, fuera del universo TIVIPLAY.
6. **Esperar la investigación de BO** antes de decidir 106 y 41. No se confirman todavía.

### 6.3 Verificaciones operacionales de BACK OFFICE (no requieren a Dirección)

- 106 y 41: averiguar con el asesor el concepto real y el cliente correcto.
- 107: identificar el plan y las pantallas vendidas.
- Enlaces: 23 → ficha 739; 103 → ficha 760 (no la desactivada).
- Altas después de la confirmación: 104 y 107 (TIVIPLAY); 78 (sección MIRA+).
- Ficha 811: duplicado de USUARIO con la 739 → depuración (sin borrar la evidencia).
- Créditos ejecutados sin confirmación: ficha 23 (101) y ficha 784 (106). Hay que conciliarlos con CONTROL OCT.
- BASE adelantada a la confirmación: fichas 146 (68), 739 (23) y 536 (15). Si Dirección rechaza alguno, hay que revertirlo.

### 6.4 SISTEMA (después de las decisiones, en solo lectura)
Repetir §5.3: releer `H`, comprobar los enlaces y la llave, trazar `PROP_F_PROXIMO` → `F. PRÓXIMO PAGO`, y simular noviembre cuando P0-2 y P0-3 estén cerrados.

**ESTADO:** P0-1 sigue BLOQUEADO (REQUIERE DECISIÓN). Gate: **NO APTO PARA MOTOR MENSUAL**.

---

## 7. AUDITORÍA FUNCIONAL DEL MOTOR `tiviplay-monthly-close-v1` (29/10/2026, solo lectura)

**Código auditado:** rama `wo-tivi-hoy-creditos-001` @ `c917e28` (`run.mjs`, `src/core.mjs`, `src/google-sheets.mjs`, `src/reconcile-sales.mjs`, README). También se revisaron la rama `wo-tivi-motor-s0b-001` @ `3c5ba3c`, que no está integrada, y el consumidor de la intranet (`src/server/tiviplay-live/monthly-close.ts`).
**Pruebas unitarias** (`node --test`, sin red ni escrituras): continuidad 7/7 OK; S0-B 13/13 OK (copiada al scratchpad). Repositorio sin cambios.

### 7.1 Evidencia histórica de la generación de PAGOS OCTUBRE 2026

| Hecho | Fuente | Estado |
| --- | --- | --- |
| `PAGOS OCTUBRE 2026` se construyó **a mano** el 30/09: 99 fichas, semanas 13/30/27/16/13, USD 4.090,50 + COP 375.730 nominales | `TIVIPLAY_CIERRE_CICLO_Y_REPETIBILIDAD_2026-09-30` (S0-B: PARCIAL); `PLAN_OPERATIVO_MER_2026-10-19_AL_25.md` l.30 | VALIDADO (documental) |
| **El motor no generó esa hoja.** La usa como *oracle* de replay sobre `PAGOS OCTUBRE 2026 - PRELIMINAR` | README; PLAN_OPERATIVO l.170 | — |
| Replay contra el oracle de 99 (19/10): **BLOQUEADO antes de leer datos** (`ERR_OSSL_UNSUPPORTED` al firmar el JWT) | PLAN_OPERATIVO l.368 | BLOQUEADO |
| En el repo no hay evidencia posterior de `Oracle: MATCH` (99 / 13-30-27-16-13). El «resultado esperado» del README es una expectativa, no una evidencia | búsqueda en `08_RUNTIME`, `00_GOVERNANCE`, `03_AREAS` | NO IMPLEMENTADO (como prueba) |
| 20/10: corrida viva del motor en la intranet (mes 2026-10, BASE viva): universo de 73, `VALIDADO_TECNICO`, 0 duplicados. **La firma diverge** entre `core.mjs` y `buildReadModel` | `CHECKPOINT_SUPERFICIE_HOY_TIVIPLAY_2026-10-20.md` GATE 4 | PARCIAL |
| 28/10: simulación en memoria para 2026-11 sobre BASE del 28/10: 100 candidatos, 9/27/20/30/14, 0 duplicados, 0 fechas inválidas. Los volcados se perdieron (contenedor efímero) | CHECKPOINT_S5 § Gate financiero | VALIDADO (documental, no reproducible) |

### 7.2 Capacidades (rama de continuidad)

| Capacidad | Estado | Evidencia en el código |
| --- | --- | --- |
| Simulación con corte provisional | **PARCIAL** | `buildMonthlyClose` es pura (solo `node:crypto`) y selecciona `TC = 1` + `F. PRÓXIMO PAGO` del mes. **No tiene fecha de corte**: el «corte» es el momento de la lectura. El corte explícito (`TIVIPLAY_CUTOFF_DATE`) solo existe en la rama S0-B, que no está integrada |
| Clasificación de pagos confirmados y pendientes | **NO IMPLEMENTADO** | El motor solo lee BASE GENERAL. No lee ZELLE, PAYPAL ni TRANSF, ni la columna `CONFIRMACION`. El checkpoint del 20/10 dice «monthly-close-v1 no expone pendientes de Confirmado JM» |
| Aislamiento de excepciones por registro | **PARCIAL** | Por fila: fecha inválida, duplicado por identidad y `REQUIERE_REVISION` por texto (mes gratis, no renueva, excepción). **Una ficha TC = 1 con `F. PRÓXIMO PAGO` vacía desaparece sin avisar** (corregido solo en S0-B). Sin excepciones de tarifa, enlace o USUARIO repetido |
| Procesamiento de registros válidos | **PARCIAL** | Genera `FACTURAR_CANDIDATO` como preview privado (JSON/CSV). Según el propio README, no aplica las reglas S0-B. No procesa pagos ni fechas |
| Reejecución sin duplicados | **IMPLEMENTADO** (solo lectura y cálculo) | Dos corridas sobre el mismo input → firma idéntica. Dos lecturas → control de *drift*. No aplica a escrituras, porque no las hay |
| Actualización incremental | **NO IMPLEMENTADO** | Recalcula todo en cada corrida. No guarda estado ni delta respecto del corte anterior |
| Escritura controlada y recuperación ante fallos | **NO IMPLEMENTADO** | Scope `spreadsheets.readonly`. No existe ruta de escritura, *dry-run diff* ni *rollback* |
| Generación definitiva del período siguiente | **NO IMPLEMENTADO** | Nunca crea `PAGOS [MES]`. Octubre se hizo a mano |

**Hallazgo P0 de gobierno de datos (motor):** `core.mjs` lee la columna `CONTRASEÑA` (`cols.contrasena`) y la copia en `preview[].password`. `run.mjs` escribe `run1` y `run2` completos (con el preview: cliente, teléfono, correo y contraseña) en `evidence/monthly-close-YYYY-MM.json`. **`evidence/` no está ignorado por Git** (`git check-ignore` no lo cubre; solo `data/private/` lo está). Esto contradice el README («la evidencia evita nombres») y la regla «la contraseña nunca se lee». Ya se había señalado el riesgo en `PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md` l.130. **`run.mjs` no debe ejecutarse tal como está.**

### 7.3 Simulación en memoria con la instantánea del 29/10: NO EJECUTADA

**Por qué:**
1. **Este hilo no tiene credenciales de Google** (`gcloud`: sin cuentas, sin variables de entorno). El motor no puede leer nada desde aquí, lo cual es seguro, pero tampoco puede ejecutarse.
2. **`run.mjs` no es una ruta sin escrituras.** Escribe archivos locales (`evidence/`, *snapshot*, preview) que contienen la contraseña y PII.
3. La función pura `buildMonthlyClose` se podría ejecutar en memoria, pero necesita una instantánea **de máquina** de BASE A:W. La única lectura disponible es el conector de este hilo, cuya salida habría que transcribir a mano (unas 2.500 filas). Eso no sirve como evidencia de una instantánea fechada. Además, el core extraería la columna de contraseña.

**Ruta segura disponible (sin código nuevo):** con sesión ADMIN, Dirección consulta en la intranet ya desplegada (`c917e28`) `GET /api/operations/tiviplay/monthly-close?month=2026-11`. Usa scope `spreadsheets.readonly`, calcula en memoria y devuelve **solo el resumen** (total, semanas, revisiones, duplicados, excepciones y firmas), sin preview ni contraseña. Limitación: usa `buildReadModel` (lógica duplicada del core, con riesgo de *drift* de firma ya documentado). Sirve para comparar total y semanas contra 100 / 9-27-20-30-14, no para certificar el motor.

### 7.4 Matriz RESTRICCIÓN → CAUSA → ALTERNATIVAS → RESPONSABLE → IMPACTO

**A. Capacidad de SIMULACIÓN** (hoy: PARCIAL)

| Restricción | Causa | Alternativas | Responsable | Impacto |
| --- | --- | --- | --- | --- |
| A1. Sin fecha de corte explícita | El corte explícito está en `wo-tivi-motor-s0b-001` (`3c5ba3c`, 13/13 tests), sin integrar | (a) Integrar S0-B mediante PR revisado; (b) mientras tanto, tomar la lectura en el corte formal (31/10 23:59) y registrar el hash | Dirección autoriza; Sistema prepara el PR | Sin esto, la simulación no se puede reproducir para un corte |
| A2. Fichas con F. PRÓX vacía se omiten sin avisar | Lógica de la rama de continuidad | Igual que A1 (S0-B lo corrige) | Sistema | Universo subestimado sin alerta (p. ej., la ficha S5 sin fecha) |
| A3. Dos implementaciones de la selección | La intranet reimplementa `buildReadModel` en lugar de usar solo el core | Que la intranet use el core como única fuente | Sistema | Firmas divergentes: la evidencia de una implementación no certifica la otra |
| A4. No hay entorno de ejecución verificable fuera del equipo de Dirección | Credenciales solo en el equipo de Dirección | Endpoint de la intranet (solo lectura) o SA de solo lectura local con el core en memoria | Dirección | Cada simulación depende de una sesión de Dirección |
| A5. **La evidencia guarda contraseña y PII y puede subirse a Git** | `core.mjs` lee `CONTRASEÑA`; `run.mjs` serializa el preview; `evidence/` no está en `.gitignore` | Excluir la columna en el core, sacar el preview de la evidencia y añadir `evidence/` a `.gitignore` (cambio mínimo) | Sistema propone; Dirección autoriza | **Bloquea toda ejecución de `run.mjs`** |

**B. Capacidad de PROCESAMIENTO PARCIAL SEGURO** (hoy: NO IMPLEMENTADO)

| Restricción | Causa | Alternativas | Responsable | Impacto |
| --- | --- | --- | --- | --- |
| B1. No distingue pagos confirmados de pendientes | El motor no lee las hojas de pago ni `CONFIRMACION` | Leer `ZELLE/PAYPAL/TRANSF (OCT)` H, K, P, T, V (ya calculados por fórmula) o reutilizar `confirmado-jm.ts` de la intranet | Sistema | Los 12 pagos de la §6 mueven el universo sin que el motor lo sepa |
| B2. Excepciones financieras no aisladas | Solo hay reglas de fecha, duplicado y texto | Consumir `VALIDACION_TARIFA`, `ESTADO_ENLACE` y `COINCIDENCIAS_BASE` como excepciones por fila | Sistema | Casos 41, 103, 106 y 107 no se separan de forma automática |
| B3. Sin estado por registro ni actualización incremental | Diseño de recálculo total y sin persistencia | Registro privado por `sourceRow + hash` en `data/private` (procesado / en espera / excluido) | Dirección decide el diseño; Sistema implementa | No se puede procesar el subconjunto válido y dejar el resto en espera |
| B4. La cartera vencida no está separada | Solo existe en S0-B | Integrar S0-B (A1) | Sistema | Los vencidos del mes anterior no se ven en la simulación |
| B5. `CONFIRMADO JM` no puede automatizarse | Regla de gobierno (§11 de la transferencia) | Ninguna: el motor solo **consume** la confirmación de Dirección | Dirección | Límite de diseño, no un defecto |

**C. Capacidad de CIERRE MENSUAL DEFINITIVO** (hoy: NO IMPLEMENTADO)

| Restricción | Causa | Alternativas | Responsable | Impacto |
| --- | --- | --- | --- | --- |
| C1. No hay escritura ni generación de `PAGOS [MES]` | Scope de solo lectura por diseño | (a) Cierre manual asistido: preview privado → el equipo copia (como en octubre); (b) escritura en una copia, verificación y promoción autorizada | Dirección autoriza; Equipo ejecuta | El cierre sigue siendo manual |
| C2. Sin recuperación ante fallos | No hay backup, *diff* ni *rollback* en el código | Protocolo vigente: ensayo en copia, una operación por llamada, relectura y verificación de `FILA_BASE` | Equipo + Sistema | Riesgo operativo en cualquier escritura |
| C3. El oracle histórico no se reprodujo con evidencia | Replay bloqueado (`ERR_OSSL`, 19/10); octubre se hizo a mano | Replay sobre `PAGOS OCTUBRE 2026 - PRELIMINAR` por el endpoint o con una SA de solo lectura, comparando fila por fila | Sistema + Dirección | No hay prueba de que el motor reproduzca una salida definitiva |
| C4. Gate NO APTO | P0-1, P0-2 y P0-3 abiertos | Cerrar los P0 (§5–§6) | Dirección + BO | Bloquea C por política, aunque A y B estuvieran listos |

### 7.5 ESTADO
- **A. Simulación:** PARCIAL (determinista y en memoria; sin corte explícito ni protección de la contraseña).
- **B. Procesamiento parcial seguro:** NO IMPLEMENTADO.
- **C. Cierre mensual definitivo:** NO IMPLEMENTADO (manual).
- Gate: **NO APTO PARA MOTOR MENSUAL**. No se declara ninguna aptitud.

### 7.6 NEXT ACTION
1. **Dirección:** autorizar (o no) un PR mínimo que corrija A5 (contraseña y PII en la evidencia, `.gitignore`) e integre S0-B (A1, A2, B4). Ninguno se aplica sin autorización.
2. **Dirección:** ejecutar el endpoint de la intranet para `2026-11` y compartir solo el resumen (total, semanas, duplicados, excepciones). El Sistema lo compara con los 100 / 9-27-20-30-14.
3. Mientras tanto, la vía operativa de noviembre sigue siendo la **manual asistida**, igual que en octubre.

---

## 8. IMPLEMENTACIÓN: motor seguro + S0-B (29/10/2026)

**PR:** https://github.com/jmmode/jumocol-os/pull/5 · rama `wo-tivi-motor-seguro-001` → base `wo-tivi-hoy-creditos-001`. Commits: `9872735` (S0-B, cherry-pick de `3c5ba3c`) y `b75da36` (seguridad). **Sin fusionar.** Sin escrituras en Sheets ni despliegue.

| Corrección | Estado | Evidencia |
| --- | --- | --- |
| La columna CONTRASEÑA no se solicita a la API (encabezado primero; `batchGet` A:M + O:W) | IMPLEMENTADO | Prueba con `fetch` simulado: ningún rango incluye N |
| `core.mjs` sin `password` + `redactSensitiveColumns` | IMPLEMENTADO | Prueba con un valor centinela: no aparece en la salida |
| Evidencia JSON/MD sin preview y guardia anti-fuga (exit 2) | IMPLEMENTADO | Pruebas + smoke E2E: escaneo limpio de consola, JSON y MD |
| `evidence/` en `.gitignore`; snapshot y preview privados opt-in | IMPLEMENTADO | `git check-ignore` OK |
| Consola de `reconcile-sales` sin nombres | IMPLEMENTADO | diff |
| Clave privada normalizada (causa probable de `ERR_OSSL` del 19/10) | IMPLEMENTADO (sin probar con la clave real) | Prueba unitaria |
| S0-B integrado (corte explícito, cartera vencida, F. PRÓX vacía → excepción) | IMPLEMENTADO | 13 pruebas S0-B dentro de las 22/22 |
| Script del 19/10 adaptado: `scripts/ejecutar-solo-lectura.ps1` | IMPLEMENTADO (no probado en Windows) | Reutiliza: copia privada, `npm test` como compuerta, dos corridas, copia de reportes |
| Oracle 99 · 13/30/27/16/13 | **Sintético: VALIDADO**. **Real: BLOQUEADO** (no hay credenciales en este entorno) | `safety.test.mjs` |
| Lectura viva de BASE GENERAL | **BLOQUEADO** (no hay credenciales en este entorno) | — |

**Pruebas:** motor `node --test` 22/22; intranet `vitest` 162 OK / 11 omitidas (sin regresión); `tsc --noEmit` limpio.

**Antecedente del 19/10:** el script borraba el JSON porque contenía contraseña y PII. Con la corrección ya no hace falta borrarlo: se conservan el MD y el JSON sanitizados. Nunca hubo una ejecución exitosa con datos reales.

**ESTADO:** A. Simulación → IMPLEMENTADO en código, pendiente de evidencia con datos reales. B y C → sin cambios (NO IMPLEMENTADO). Gate **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION (Dirección, en su equipo):**
1. Revisar el PR #5 y hacer checkout de `wo-tivi-motor-seguro-001` en `C:\Users\USUARIO\Documents\JUMOCOL_SYSTEM_OS` (sin merge).
2. Ejecutar `05_AUTOMATION\tiviplay-monthly-close-v1\scripts\ejecutar-solo-lectura.ps1 -LiveMonth 2026-11 -CutoffDate 2026-10-31`.
3. Compartir solo los reportes de `reportes_sanitizados` (o las líneas RUN, Repeatable, Duplicates, Exceptions, Cartera, Oracle, STATUS y Exitcode). El Sistema compara: oracle 99 · 13/30/27/16/13 y noviembre frente a 100 · 9/27/20/30/14.

---

## 9. BORRADOR OPERATIVO PAGOS NOVIEMBRE 2026 (29/10/2026, solo lectura)

**OBJETIVO:** generar el borrador real de PAGOS NOVIEMBRE 2026 con el motor existente y BASE GENERAL viva, con un corte provisional el 2026-10-29.
**Artefacto:** `/mnt/project-files/recepcion/PAGOS_NOVIEMBRE_2026_BORRADOR.xlsx` (privado, fuera del repositorio). Hojas: LEEME, PAGOS NOVIEMBRE 2026 (estructura de octubre por semanas), FACTURABLES, REQUIERE_REVISION, BLOQUEADOS, CARTERA_VENCIDA, EXCLUIDOS, VALIDACION y DIFERENCIAS.
**No se hizo:** escribir en Sheets, crear PAGOS NOVIEMBRE en el libro, fusionar el PR #5 ni desplegar.

### 9.1 Cómo se generó (evidencia)
- **Lectura:** BASE GENERAL filas 2–1000 por el conector, en bloques sin C, D, I ni N. La columna F. PRÓX de los bloques coincide con una lectura independiente de R3:R1000: **0 diferencias**.
- **Motor:** `buildMonthlyClose(rows,"2026-11",{cutoffDate:"2026-10-29"})` del commit `b75da36` (PR #5), en memoria, ejecutado 2 veces.
  - Pruebas: 22/22.
  - Repetible: `outputSignature 02ab3382…` idéntica en las dos corridas.
  - `signature 3524c56e…`.
- **Capa del borrador sobre el motor:**
  - Bloqueos P0: 21, 23, 739.
  - USD 0.
  - Tarifa frente a CATALOGO_TARIFAS_VIGENTE.
  - Señales de baja que el motor no detecta: 62, 65, 88.
  - MIRA+: 865.
  - USUARIO repetido entre secciones.

### 9.2 Resultado
| Bloque | Conteo | Estado |
| --- | --- | --- |
| Universo noviembre (motor) | **100** · semanas **9/27/20/30/14** · 0 duplicados | VALIDADO |
| FACTURABLE sin excepción | **63** (4/13/13/24/9) | VALIDADO (sujeto a P0) |
| REQUIERE_REVISION (BO) | **29**: mes gratis 11, no renovación 7, tarifa ≠ catálogo 10 (algunas fichas tienen varias causas), USUARIO repetido 3 (731, 741, 745), MIRA+ 1 | REQUIERE DECISIÓN |
| BLOQUEADO dentro del universo | **8**: 21 (P0-2 tarifa), 23 (P0-1 ZELLE 101), 739 (identidad + ZELLE 23), y 27, 32, 33, 53, 75 (USD 0) | BLOQUEADO |
| Bloqueados fuera del universo | Ficha 760 (F. PRÓX vacía + ZELLE 103) · cartera P0: 5, 765, 770, 771, 776, 784, 786, 802 · 8 pagos sin ficha: ZELLE 64, 95, 104, 107, 41, 78 · PAYPAL 8 · TRANSF 6 | BLOQUEADO |
| Cartera vencida (separada) | **96**: OCT 51, SEP 43, JUL 2. Incluye 4 fichas «por vencer» al corte (filas 4–7), 9 P0 y 11 posibles duplicados de USUARIO | PARCIAL (las señales de las filas 762–857 se evaluaron solo sobre ESTADO) |
| Excluidos con causa | **116**: 106 fichas TC=1 en secciones DESACTIVADOS/EXCEPCIÓN, 1 fila de total (873) y 9 fichas TC=0 | VALIDADO |

### 9.3 Diferencias
- **Frente a la simulación del 28/10:** misma cifra y misma distribución (100 · 9/27/20/30/14). No se puede comparar fila a fila porque los volcados se perdieron; desde ahora queda registrada la firma.
- **Frente a octubre** (99 · 13/30/27/16/13, construido a mano): +1 ficha. La carga se concentra en S4 (+14); S1 baja 4 y S3 baja 7.

### 9.4 Brechas del motor encontradas (no corregidas: fuera del alcance de esta tarea)
1. Cuenta como cartera las fichas TC=1 de las secciones DESACTIVADOS (106 fichas). El borrador las excluye.
2. Las filas de total con un 1 en TC producen una excepción falsa (fila 873).
3. No detecta «cancela el plan», «otro operador» ni «no continúa».
4. La detección de duplicados funciona solo dentro del mes: no ve un USUARIO repetido en la cartera.
5. No valida la tarifa.

### 9.5 Privacidad
- El XLSX deja vacías TELEFONO, CORREO, OBSERVACIONES, CELULAR, CONTRASEÑA, REFERIDO y DISPOSITIVOS.
- Escaneo automático: 0 correos y 0 teléfonos.
- Identificadores mínimos que se conservan: FILA_BASE, CLIENTE y USUARIO.
- **Incidente:** una lectura de PAGOS OCTUBRE 2026 A1:AF6 (para obtener la estructura) devolvió la columna CONTRASEÑA de 2 filas de datos dentro del contexto de la IA.
  - No se transcribió ni se persistió en ningún archivo.
  - A partir de ahí, de esa hoja solo se leyeron las columnas A y V.
  - Recomendación: rotar esas 2 credenciales si Dirección lo considera necesario.

**ESTADO:** borrador IMPLEMENTADO (PARCIAL para publicación). Gate **NO APTO PARA MOTOR MENSUAL** (P0-1, P0-2 y P0-3 abiertos).

**NEXT ACTION:**
1. Dirección: decisiones de §6.2 y tarifas de P0-2. Además, decidir qué hacer con las 5 fichas con USD 0.
2. Back office: revisar las 29 fichas de REQUIERE_REVISION y depurar las fichas duplicadas de la cartera (811, 812, 813, 820, …).
3. Sistema: con el corte formal del 31/10 23:59 COT, volver a leer y regenerar el borrador, comparar la firma y los cambios fila a fila, y preparar la publicación de PAGOS NOVIEMBRE 2026 solo con la autorización explícita de Dirección.

## 10. BORRADOR NOVIEMBRE 2026 EN GOOGLE SHEETS (29/10/2026)

**OBJETIVO:** sustituir el XLSX del §9 por una hoja nativa actualizable. Autorización de Julian: crear/actualizar SOLO la hoja BORRADOR.

**ESTADO:** IMPLEMENTADO (hoja creada, escrita y releída). Sincronización: NO IMPLEMENTADO. Gate: NO APTO PARA MOTOR MENSUAL.

- **URL:** https://docs.google.com/spreadsheets/d/1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4/edit#gid=1270065975
- Libro GESTION_DIA_PAGOS_2026_TIVIPLAY, hoja "PAGOS NOVIEMBRE 2026 - BORRADOR", gid 1270065975.
- Se verificó antes de crear (get_spreadsheet, 85 hojas) que la hoja no existía.
- Sin cambios en BASE GENERAL, PAGOS OCTUBRE, CONTROL, confirmaciones JM ni paneles.

**Estructura:**
- A..AF son los encabezados de PAGOS OCT. Se dejaron vacías C, D, F, I, N, T y U (PII o CONTRASEÑA: la columna N no se leyó).
- AG SEMANA, AH CLASIFICACION_BORRADOR, AI CATEGORIA, AJ CAUSA/ACCIÓN, AK RESPONSABLE, AL ID_BORRADOR.
- Correspondencia con BASE en la columna V (`BASE GENERAL!<fila>`) y en el ID `NOV26-B<fila>`.

**Recalculo, corte 29/10:**
- BASE se releyó: 0 cambios.
- Motor: 100 fichas. Distribución semanal S1–S5: 9 / 27 / 20 / 30 / 14. 0 duplicados. Dos corridas idénticas (outputSignature 02ab3382…).

**Clasificación nueva (reemplaza 63/29/8):**

| Clase | Fichas | Detalle |
|---|---|---|
| FACTURABLE | 68 | S1–S5: 4 / 16 / 14 / 25 / 9 |
| REQUIERE_REVISION | 29 | |
| BLOQUEADO | 2 | 21: tarifa P0-2. 739: identidad + ZELLE 23 |
| PAGADO_SIN_PROPAGAR | 1 | 23: ZELLE 101 confirmado, BASE sigue en 08/11 |

- Cartera: 96. Excluidos: 116. Pagos confirmados pendientes de propagar o enlazar: 36.

**Diff vs XLSX §9:**
- 27, 32, 33, 53 y 75 pasan de BLOQUEADO a FACTURABLE. Pagan en COP, no USD 0: fue un error del XLSX.
- 23 pasa de BLOQUEADO a PAGADO_SIN_PROPAGAR.
- 765 entrará en S5 (27/11) cuando BO propague ZELLE 102.
- 776, 796 y 762 están pagadas y saldrán de cartera.
- Desfases de ancla entre BASE y la propuesta: 16 y 28 (S2→S1), 41 (S3→S2).

**Confirmaciones que cambiaron de estado:**
- Pasan a CONFIRMADO JM: ZELLE 101, 102, 103, 105, 106 (tarifa difiere en $10), 107, 78, 15 y 41.
- Siguen pendientes: ZELLE 68 y 104 (PENDIENTE), y ZELLE 23 (REQUIERE REVISIÓN). PAYPAL 35, 36 y 37 siguen sin confirmar.

**Evidencia de escritura:**
- 4 bloques (A1:AL60, A61:AL125, A126:AL250, A251:AL404), 404 filas × 38 columnas.
- Releídos R4:V123, AG4:AL123 y A124:B600: coinciden y no hay nada después de la fila 404.

**Idempotencia:**
- El builder es determinista: dos ejecuciones dieron archivos idénticos (sha 05e0a039001c92bd).
- Se reescribió A4:AL6 con la salida de la 2ª corrida (114 celdas). La relectura de AL1:AL600 dio 118 IDs en el mismo orden, sin filas nuevas.
- Total: 377 IDs únicos (118 en AL y 259 en A), 0 duplicados.
- La escritura es sobre rango fijo, nunca un append.

**Sincronización: NO IMPLEMENTADO.**
- Mecanismo mínimo propuesto: un job del motor con escritura limitada por allowlist a este título de hoja.
- Pasos del job: leer BASE (sin la columna N) y las confirmaciones, recalcular, limpiar A1:AL600 y reescribir con los ID_BORRADOR y la firma de la fila 2.
- No hay hoy credencial de escritura: sheets-client.ts usa `spreadsheets.readonly`.

**Intranet:**
- Reutilizar `MonthlyExecutiveComparison` (`src/features/tiviplay-payments/monthly-executive-comparison.tsx`) en `tiviplay-payments-dashboard.tsx:158`.
- Añadir una lectura de `'PAGOS NOVIEMBRE 2026 - BORRADOR'!A:AL` en `/api/operations/tiviplay/monthly-close`.
- **Hallazgo de seguridad:** `monthly-close.ts` lee BASE GENERAL A:W, lo que incluye la columna N CONTRASEÑA. Hay que acotar el rango.

**NEXT ACTION:**
- DIRECCIÓN: confirmar ZELLE 68/104/23 y PAYPAL 35–37; resolver la tarifa de la ficha 21 y la identidad de la 739.
- BO: propagar los pagos confirmados a F.PROX de BASE.
- SISTEMA: tras la autorización de Julian, PR del job de escritura con allowlist y acotar monthly-close.ts.
- El gate sigue NO APTO.

## 11. SINCRONIZACIÓN CONTROLADA DEL BORRADOR (30/10/2026)

**OBJETIVO:** sincronizar fuentes → motor → hoja BORRADOR → vista gerencial de la intranet.

**ESTADO:**
- PR: IMPLEMENTADO, con PR #6 abierto, sin fusionar ni desplegar: https://github.com/jmmode/jumocol-os/pull/6
- Rama: `wo-tivi-sync-borrador-001`, apilada sobre PR #5.
- Sincronización en producción: NO ACTIVADA (requiere autorización y una credencial de escritura).
- Gate: NO APTO.

**Qué se implementó:**

1. **CONTRASEÑA:**
   - `sheets-client.batchReadSheets` ya no solicita nunca `BASE GENERAL!N`.
   - Esto corrige el cierre mensual y, además, HOY, Runtime, conciliación y créditos, que también leían la columna N.
2. **sync-draft (motor):**
   - Funciona en modo ensayo por defecto.
   - Para escribir exige tres llaves: `--apply`, `TIVIPLAY_DRAFT_WRITE_ENABLED=true` y `--confirm-sheet`.
   - Allowlist de una sola hoja, escritura RAW en el rango fijo A1:AL600.
   - Firma en AK2 y corte en AJ2.
   - Si la firma no cambia, termina en NO_CHANGES sin escribir.
   - Si alguien editó la hoja entre la lectura y la escritura, aborta por conflicto.
   - Tras escribir relee; si no coincide, restaura los valores previos.
3. **Detección de cambios:**
   - Diff por ID_BORRADOR, clasificado como CONFIRMACION, PAGO, FECHA, SEMANA, CLASIFICACION o DECISION.
   - PII enmascarada.
   - Aislamiento por ficha.
   - Decisiones versionadas en `decisions/2026-11.json`, con las filas 21, 739, 760, 762, 802 y 811.
4. **Intranet:**
   - DraftPanel en Runtime → Cierre mensual, solo para ADMIN.
   - Lee A, J:K y AG:AL en solo lectura, sin CLIENTE ni USUARIO.

**Evidencia:**
- Motor: 32/32 tests.
- Intranet: 167 tests pasan; tsc, eslint y next build OK.
- Pruebas sintéticas:
  - Confirmación nueva: solo la ficha confirmada cambia de clase.
  - Corrección de fecha: solo esa ficha cambia de semana.
  - Segunda ejecución: NO_CHANGES, sin escrituras.
- Con datos reales (local, sin escribir) el builder reproduce 100 · 68/29/2/1 · 4/16/14/25/9 · cartera 96 · excluidos 116 · 36 pagos pendientes, con 0 cambios de clase frente a la hoja publicada.
- El primer `--apply` solo normalizaría textos:
  - 24 fechas de pago pasan a ISO;
  - 11 textos de causa;
  - los IDs PG incluyen el mes.

**Permisos mínimos:**
- Intranet: sigue en readonly.
- Escritura: cuenta de servicio dedicada con scope `spreadsheets`, Editor del libro, y todas las hojas salvo BORRADOR protegidas sin esa cuenta.

**Recuperación:**
- Restauración automática si la relectura falla.
- Historial de versiones de Google Sheets.
- Recalcular con el mismo corte reproduce la misma firma.
- Desactivación con la variable `TIVIPLAY_DRAFT_WRITE_ENABLED=false`.

**Plan de activación:** cada paso requiere autorización de Julian.

1. Revisar y fusionar PR #5 y PR #6. Vercel publica el preview automático de la rama.
2. Crear la cuenta de servicio de escritura y proteger las hojas no-BORRADOR.
3. Ensayo en el equipo de Julian: `node sync-draft.mjs --month 2026-11 --cutoff 2026-10-31`. Revisar el diff.
4. Primer `--apply` con corte 31/10 y relectura.
5. Programar la ejecución (por ejemplo, diaria) solo después de 3 ensayos estables.

**NEXT ACTION:**
- DIRECCIÓN: ZELLE 68/104/23 y PAYPAL 35–37.
- Julian: revisar PR #6 y decidir la cuenta de escritura.

## 12. HOJA DE COBROS NOVIEMBRE USABLE AL 31/10 (30/10/2026)

**OBJETIVO:** el 31/10 el equipo debe tener una hoja de cobros de noviembre usable, con cobertura completa contra BASE, excepciones separadas y un responsable por fila. Esta sección también recoge la alineación S4 (A–E).

**ESTADO:** IMPLEMENTADO (hoja). El gate sigue en **NO APTO PARA MOTOR MENSUAL**.

**Hoja:** «PAGOS NOVIEMBRE 2026 - BORRADOR» (gid 1270065975), regenerada el 30/10 a las ~02:40 UTC.
- Ocupa 331 filas en el rango A1:AP331. Se verificó por fórmula que A332:AP600 está vacío.
- Corte 2026-10-29. Firma `6ad4bcc6ce82…`.
- Se escribió solo en esta hoja. Para verificar se usaron fórmulas temporales en A590:A598 de la misma hoja, que después se limpiaron.

### Cuadre con BASE (dato vivo, relectura 30/10 02:15 UTC)

**Fichas TC=1 operativas (filas 3–869): 827.** Se reparten así:

| Grupo | Fichas |
|---|---|
| Universo del motor | 100 |
| Cartera (antes de mover) | 96 |
| Sin fecha de próximo pago | 1 (la 760, bloqueada) |
| Vencen después de noviembre | 630 |

La cartera pierde una ficha: la 765 tiene pago confirmado (ZELLE 102), su próximo vencimiento es el 2026-11-27 y por eso entra al universo, en la semana S5. Resultado: **universo 101** y **cartera 95**.

**Excluidas:**
- 703 fichas TC=1 en secciones históricas (filas 870–2533), agregadas en 8 filas EXH, una por sección y con su conteo.
- 30 fichas TC=0 operativas, listadas una por una en EX.

En total, cada ficha TC=1 queda identificada o justificada.

### Composición de la hoja

**Universo (101 fichas):**
- Clasificación: FACTURABLE 68, REVISIÓN 30, BLOQUEADO 2, PAGADO SIN PROPAGAR 1.
- Fichas por semana: 9 / 27 / 20 / 30 / 15.
- Facturables por semana: 4 / 16 / 14 / 25 / 9.

**Columnas del equipo, AM:AP** (ESTADO_COBRO, FECHA_GESTION, GESTIONADO_POR, NOTA_EQUIPO):
- Se conservan por ID_BORRADOR al regenerar.
- ESTADO_COBRO inicial: PENDIENTE 68, EN REVISIÓN 30, BLOQUEADO 3, NO COBRAR · YA PAGÓ 4, PENDIENTE (CARTERA) 92.

**Otras secciones:**
- Cartera vencida separada (95 filas). Cada fila tiene RESPONSABLE y subestado: vencida, por vencer, bloqueo de tarifa, pagado sin propagar o posible duplicado.
- Pagos pendientes (35), ajustes, bloqueados (760), excluidos, procedimiento (PR1–PR6) y validación.

### Criterios de cierre 31/10

| | Criterio | Estado | Evidencia |
|---|---|---|---|
| A | 100% de las fichas elegibles identificadas o justificadas | VALIDADO | Cuadre de la sección anterior; fila «Cuadre con BASE» = OK |
| B | 100% de las cobrables con semana | VALIDADO | 0 filas del universo sin SEMANA; 765 → S5 |
| C | 100% de las excepciones con responsable | VALIDADO | 0 filas sin RESPONSABLE (universo, cartera, pagos, bloqueados) |
| D | Cero cobros duplicados sin resolver | PARCIAL | 305 IDs únicos, 0 duplicados en la hoja. Siguen marcadas sin resolver (RESPONSABLE BO → DIRECCIÓN): fichas con USUARIO repetido 731↔813, 739↔811, 741↔820, 745↔812, 750↔824, 810↔848, 831↔832, 840↔841, 733↔852; y PAYPAL 36 como posible doble registro de 762 |
| E | Hoja accesible y usable | VALIDADO | Relectura con el número de celdas por fila idéntico al generado (331/331) y 4.618 celdas; encabezado fijo |
| F | Procedimiento para movimientos posteriores al corte | IMPLEMENTADO (manual) | Filas NOV26-PR1…PR6 dentro de la hoja; la automatización no está activada |

### Cambios desde §10

- La ficha 765 pasa de cartera al universo, en S5.
- ZELLE (OCT) 23 y 68 ahora figuran como CONFIRMADO JM.
  - El 68 está enlazado a la ficha 146, con PROP 2026-12-16; fuera de noviembre.
  - El 23 tiene 2 coincidencias en BASE y sigue en revisión.
- Se agregan las columnas del equipo y los 6 pasos del procedimiento.
- La sección de cartera incorpora la columna RESPONSABLE.

### Alineación S4

**A. Idempotencia:**
- La firma es repetible: el mismo corte recalcula la misma firma.
- Los IDs son únicos y no hay duplicados.
- La relectura coincide fila a fila.
- Tests: motor 34/34. Incluye estos casos nuevos:
  - Cartera con pago confirmado entra a su semana.
  - Las columnas del equipo se conservan aunque la ficha cambie de semana.
  - Si solo cambian las columnas del equipo, el resultado es NO_CHANGES.
- Commit `900d860` en PR #6.

**B. Seguridad (CONTRASEÑA):**
- PR #7 (`wo-tivi-seguridad-contrasena-001`, commit 376bff3): `batchReadSheets` nunca solicita `BASE GENERAL!N` y lee en tramos A:M y O:fin.
- Pruebas: vitest 164 pasan; tsc y eslint OK.
- Sin fusionar y sin desplegar.

**C. P0 residuales con responsable.** Coordinación únicamente; nada se resolvió por inferencia.

DIRECCIÓN:
- Confirmar ZELLE 104 (USD 180).
- Confirmar PAYPAL 35–37.
- Tarifa de la ficha 21 (P0-2).
- Identidad 739/811.
- Tarifa promo 70/año de la 760.
- Tarifas de cartera bloqueadas: 5, 770, 771, 778, 781, 784, 786, 864.

BO:
- Enlazar los pagos con 2–3 coincidencias (ZELLE 13, 21, 23, 24, 30, 31, 32, 58, 65, 103; PAYPAL 5).
- Dar de alta las fichas sin BASE (ZELLE, PAYPAL y TRANSF marcados «Alta de ficha»).
- Propagar a BASE los pagos confirmados de 762, 765, 776 y 796.
- Revisar los USUARIO repetidos.

**D. PRs (sin fusionar ni desplegar):**
- #5 (motor seguro).
- #6 (sync-draft + panel; ahora `900d860`).
- #7 (CONTRASEÑA en el endpoint de cierre).
- Todos con seguimiento.

**E. Única próxima acción hacia la operación autónoma:** que Julian revise y fusione #5, #6 y #7 y autorice la cuenta de servicio de escritura. Sin eso, cada regeneración sigue dependiendo de una escritura asistida.

**BLOQUEO:** escritura automática sin cuenta de servicio y P0 financieros abiertos (DIRECCIÓN).

**NEXT ACTION:**
- EQUIPO: gestionar desde el 31/10 con las columnas AM:AP.
- DIRECCIÓN: confirmaciones y tarifas de la lista C.
- Julian: PR #5, #6 y #7.

---

## 13. EJECUCIÓN 01: CONCILIACIÓN OCTUBRE → BASE GENERAL (01/11/2026, dry-run)

**OBJETIVO:** clasificar todos los movimientos `CONFIRMADO JM` de octubre y preparar el lote exacto para BASE GENERAL. Esta sección no escribe nada en BASE.

**Corte de lectura (dato vivo):** 01/11/2026, entre las 16:45 y las 17:15 UTC.
- Fuentes: ZELLE (OCT) filas 4–114; PAYPAL (OCT) filas 3–37; TRANSF (OCT) filas 3–17.
- BASE GENERAL: filas 3–1300, columnas A, E:H, J:N, P:AQ. **No se leyeron** B, C, D, I, O (CONTRASEÑA), U ni W.
- También se leyeron PAGOS OCTUBRE 2026 (A, M, V:AI) y CATALOGO_TARIFAS_VIGENTE.
- Los conteos históricos no se reutilizaron: todo se recalculó con este corte.

### A. CONFIRMADO JM de octubre

| Fuente | CONFIRMADO JM | Otras filas |
| --- | --- | --- |
| ZELLE (OCT) | 111 | 0 (las 111 filas registradas están confirmadas; ya no hay PENDIENTE ni REQUIERE REVISIÓN) |
| PAYPAL (OCT) | 13 | 22 sin confirmar (filas 35–37 y vacías) |
| TRANSF (OCT) | 15 | 0 |
| **Total** | **139** | |

### B. Clasificación (gate de conciliación)

| Categoría | ZELLE | PAYPAL | TRANSF | Total |
| --- | --- | --- | --- | --- |
| APLICADO A BASE | 0 | 0 | 0 | 0 |
| YA APLICADO / SIN CAMBIO | 74 | 7 | 9 | 90 |
| PENDIENTE DE ACTUALIZACIÓN | 8 | 1 | 0 | 9 |
| PENDIENTE DE ALTA | 6 | 1 | 1 | 8 |
| REQUIERE REVISIÓN | 23 | 4 | 5 | 32 |

De los YA APLICADO, **23** reflejan en BASE una tarifa que no está en el catálogo, sobre todo la promo 12M a USD 70. Siguen YA APLICADO, pero Dirección debe ratificar esa tarifa (ver D). Ningún confirmado queda sin clasificar: 139 de 139.

**Mecanismo verificado:** en BASE, `F.ULTIMO PAGO` (R), `F. PRÓXIMO PAGO` (S) y `F.VENCIMIENTO` (Q) son **fórmulas**:
- R = `MAX(AI; AN)` y S = `MAX(AJ; AO)` cuando `AM = CONFIRMADO JM`.
- `AM` solo se llena si la ficha está en PAGOS OCTUBRE 2026 con `W = CONFIRMADO JM`, cruzando por `USUARIO`.
- Las fichas que no están en PAGOS OCT (cobros fuera del corte de octubre o vencidas) no reciben el pago por fórmula.
- La única entrada manual que no destruye fórmulas es AI/AJ (`BASE_ULT_PAGO_ANT` / `BASE_PROX_PAGO_ANT`). El lote escribe ahí y no toca R, S, E ni T.

### C. Lote exacto propuesto (9 fichas · 18 celdas · solo AI y AJ)

Regla: AI = MAX(F.ÚLT actual; PROP_F_ULTIMO) y AJ = MAX(F.PRÓX actual; PROP_F_PROXIMO). Es la misma lógica MAX de las fórmulas R/S y nunca retrocede una fecha. Todas cumplen el gate S0 completo: `CONFIRMADO JM` + `ENLAZADO` (1 coincidencia, `FILA_BASE`) + `COINCIDE PLAN` + `PROPUESTA CALCULADA`.

| # | Origen | Ficha (sección) | Plan | USD · fecha | AI antes → después | AJ antes → después (opción A: pago) | AJ opción B: ciclo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZELLE (OCT)!80 | 796 (S6) | PLAN 12 MESES+2 | 180 · 20-10-26 | 07-10-25 → **20-10-26** | 07-10-26 → **20-12-27** | = A |
| 2 | ZELLE (OCT)!93 | 76 (S1) | PLAN 1 MES | 21 · 24-10-26 | 19-09-26 → **24-10-26** | 27-10-26 → **24-11-26** | 27-11-26 |
| 3 | ZELLE (OCT)!101 | 23 (S1) | PLAN 6 MESES+1 | 70 · 27-10-26 | 08-05-26 → **27-10-26** | 08-11-26 → **27-05-27** | 08-06-27 |
| 4 | ZELLE (OCT)!102 | 765 (S6) | PLAN 1 MES | 15 · 27-10-26 | 26-09-26 → **27-10-26** | 26-10-26 → **27-11-26** | = A |
| 5 | ZELLE (OCT)!105 | 776 (S6) | PLAN 6 MESES+2 | 70 · 28-10-26 | 19-02-26 → **28-10-26** | 19-10-26 → **28-06-27** | = A |
| 6 | ZELLE (OCT)!108 | 11 (S1) | PLAN 3 MESES | 40 · 30-10-26 | 03-08-26 → **30-10-26** | 03-11-26 → **30-01-27** | 03-02-27 |
| 7 | ZELLE (OCT)!109 | 30 (S1) | PLAN 3 MESES+1 | 48 · 30-10-26 | 30-08-26 → **30-10-26** | 09-11-26 → **28-02-27** | 09-03-27 |
| 8 | ZELLE (OCT)!111 | 792 (S6) | PLAN 3 MESES+1 | 55 · 31-10-26 | 10-06-26 → **31-10-26** | 10-10-26 → **28-02-27** | = A |
| 9 | PAYPAL (OCT)!14 | 762 (S6) | PLAN 1 MES + 1 | 15 · 28-10-26 | 21-08-26 → **28-10-26** | 28-10-26 → **28-12-26** | = A |

- **REQUIERE DECISIÓN (anclaje):** en 4 fichas (76, 23, 11, 30) el cliente pagó antes de su `F. PRÓXIMO PAGO`. La opción A ancla al pago, que es lo que hacen la propuesta de la hoja y la fórmula. La opción B ancla al ciclo y no hace perder días al cliente. Hay precedente manual de B: en la ficha 536, BO extendió por ciclo. Ninguna regla escrita decide entre A y B.
- **Control de duplicados:** ninguna ficha recibe más de un movimiento. Ningún movimiento aparece en dos fuentes. Ninguna de las 9 fichas tiene `AM = CONFIRMADO JM`, así que no hay doble propagación por fórmula. Las 9 tienen `USUARIO` único fuera de las marcas `DUPLICADO DEPURADO`.
- **Ejecución (después de la aprobación):**
  1. Releer AI, AJ y N de cada fila. Si `USUARIO` o AI/AJ cambiaron desde este corte, abortar esa fila.
  2. Escribir 18 valores con fecha serial y `valueInputOption` RAW, en una sola `batchUpdate`.
  3. Releer R, S, E y T.
  4. Re-ejecutar el clasificador: las 9 deben pasar a YA APLICADO y el segundo pase debe dar 0 cambios (idempotencia).
- **Recuperación:** restaurar los valores *antes* de la tabla (están guardados también como seriales en el lote del hilo) o usar el historial de versiones de Sheets. No se tocan fórmulas, formato ni datos del equipo.

### D. Excepciones (Back Office / Dirección)

| Movimiento | Ficha | Causa | Responsable |
| --- | --- | --- | --- |
| ZELLE (OCT)!10 · FACTU · USD 50.0 · 01-10-26 | 721 | Abono «restante pago de año 150» sobre la ficha 721 (12M+2/3 pant./USD 150; el catálogo de 3 pant. dice 180). BASE ya extendida a 01-02-28 desde el pago del 25-09. Validar la tarifa total y si el abono completa ese pago. | Dirección (tarifa) → BO |
| ZELLE (OCT)!25 · FACTU · USD 30.0 · 05-10-26 | — | Observación «Reembolso RESELLER»: no es cobro de servicio a un cliente; sin ficha. | BO → Dirección |
| ZELLE (OCT)!34 · FACTU · USD 24.0 · 07-10-26 | 192 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 24.0 vs ficha PLAN 3 MESES+1/1 pant./USD 40. BASE: F.ÚLT 30-08-26, F.PRÓX 30-12-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!35 · VENTA · USD 70.0 · 07-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: MIRA+ (obs. «MIRA+ PAGO AL ZELLE JM»). Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!41 · VENTA · USD 70.0 · 08-10-26 | 368 | VENTA enlazada por nombre a ficha 368 (12M/180 pagada hasta 01-03-27 por otro medio). Probable enlace erróneo; venta nueva sin ficha. | BO (asesor) |
| ZELLE (OCT)!46 · FACTU · USD 15.0 · 09-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| ZELLE (OCT)!48 · FACTU · USD 70.0 · 10-10-26 | 864 | Ficha 864 (sección MIRA+): USD 70 por 12M/3 pant.; F.ÚLT actualizada pero F.PRÓX 13-10-26 no avanzó. | Dirección (tarifa MIRA+) |
| ZELLE (OCT)!63 · FACTU · USD 15.0 · 14-10-26 | 786 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 15.0 vs ficha PLAN 1 MES/2 pant./USD 15. BASE: F.ÚLT 14-10-26, F.PRÓX 14-10-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!64 · VENTA · USD 15.0 · 14-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY. Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!66 · FACTU · USD 150.0 · 15-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| ZELLE (OCT)!67 · VENTA · USD 70.0 · 15-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY. Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!70 · FACTU · USD 150.0 · 17-10-26 | 778 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 150.0 vs ficha PLAN 12 MESES/3 pant./USD 180. BASE: F.ÚLT 17-10-26, F.PRÓX 19-10-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!75 · FACTU · USD 130.0 · 17-10-26 | 21 | Ficha 21: USD 130 por 12M/2 pant. (catálogo 150). F.PRÓX 07-11-26 no avanzó. Tarifa ficha 21 pendiente de Dirección. | Dirección (tarifa) |
| ZELLE (OCT)!78 · VENTA · USD 30.0 · 19-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: MIRA+ (obs. «ZELLE JM - MIRA+»). Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!81 · FACTU · USD 48.0 · 20-10-26 | 781 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 48.0 vs ficha PLAN 3 MESES/3 pant./USD 48. BASE: F.ÚLT 20-10-26, F.PRÓX 17-10-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!87 · FACTU · USD 150.0 · 22-10-26 | 111 | Ficha 111: COINCIDE PLAN pero sin propuesta de fechas (PROP vacíos); F.PRÓX 04-12-26 no refleja 12 meses. | SISTEMA/BO |
| ZELLE (OCT)!88 · FACTU · USD 10.0 · 22-10-26 | 5 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 10.0 vs ficha PLAN 1 MES/1 pant./USD 10. BASE: F.ÚLT 22-10-26, F.PRÓX 30-10-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!89 · FACTU · USD 15.0 · 22-10-26 | 35 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 15.0 vs ficha PLAN 1 MES/3 pant./USD 15. BASE: F.ÚLT 23-09-26, F.PRÓX 10-11-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!94 · RECON · USD 15.0 · 25-10-26 | 270 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 15.0 vs ficha PLAN 6 MESES+1/2 pant./USD 82.00. BASE: F.ÚLT 15-06-26, F.PRÓX 25-01-27 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!95 · VENTA · USD 15.0 · 25-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY. Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!96 · FACTU · USD 70.0 · 25-10-26 | — | Ficha 756 (enlace inferido): F.ULTIMO PAGO 25-11-25 incoherente con pago 25-10-26 y F.PRÓX 25-11-27; probable error de digitación. Llave del pago ≠ titular. | BO |
| ZELLE (OCT)!103 · RECON · USD 70.0 · 27-10-26 | — | Reconexión USD 70 «promo año»: 2 fichas (760 S5 sin fechas, 909 DESACT). Tarifa promo no está en catálogo. | Dirección (tarifa) → BO (enlace 760) |
| ZELLE (OCT)!104 · VENTA · USD 180.0 · 27-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY (USD 180 = 12M/3 pant. deducido; sin USUARIO). Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| ZELLE (OCT)!106 · FACTU · USD 10.0 · 28-10-26 | 1106 | USD 10 enlazado ahora a ficha 1106 (DESACTIVADOS FEBRERO, 6M/70). Valor fuera de catálogo; pagador tercero. | BO → Dirección |
| ZELLE (OCT)!107 · VENTA · USD 110.0 · 29-10-26 | — | VENTA USD 110 sin ficha; plan no identificado (no existe en catálogo); paga persona jurídica. | BO (plan) → Dirección (tarifa) |
| ZELLE (OCT)!110 · RECON · USD 70.0 · 30-10-26 | 1087 | Reconexión USD 70 enlazada a ficha 1087 (DESACTIVADOS FEBRERO, 12M/3 pant.). Requiere reactivar/trasladar la ficha y ratificar promo 12M·70. | Dirección (tarifa) → BO (reactivación) |
| ZELLE (OCT)!112 · FACTU · USD 5.0 · 31-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| ZELLE (OCT)!113 · FACTU · USD 270.0 · 31-10-26 | 133 | Tarifa no validada (SIN COINCIDENCIA TARIFA): USD 270.0 vs ficha PLAN 12 MESES/6 pant./USD 270. BASE: F.ÚLT 11-10-25, F.PRÓX 11-12-26 (no avanzó). | Dirección (tarifa) → BO |
| ZELLE (OCT)!114 · FACTU · USD 15.0 · 31-10-26 | 766 | Tarifa no validada (TARIFA ≠ PLAN): USD 15.0 vs ficha PLAN 3 MESES +1/1 pant./USD 40. BASE: F.ÚLT 26-06-26, F.PRÓX 26-10-26 (no avanzó). | Dirección (tarifa) → BO |
| PAYPAL (OCT)!5 · FACTU · USD 15.0 · 10-10-26 | — | Ficha 802: observación «cliente informará cuando retorne»; F.PRÓX (06-10-26) anterior a F.ÚLT (10-10-26). Servicio en pausa; decisión 802 en decisions/2026-11.json. | BO → Dirección |
| PAYPAL (OCT)!7 · FACTU · USD 70.0 · 13-10-26 | — | Ficha 750 (S5): USD 70 contra 12M/3 pant. (catálogo 180; hoja propone 6M/1 pant.). F.PRÓX no avanzó. 824 marcada DUP. | Dirección (tarifa) |
| PAYPAL (OCT)!8 · VENTA · USD 15.0 · 16-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY. Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| PAYPAL (OCT)!12 · FACTU · USD 70.0 · 24-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| PAYPAL (OCT)!15 · FACTU · USD 105.0 · 01-11-26 | 8 | Pago recibido 01-11-26 (después del corte propuesto 31/10 23:59 COT); factura creada 28-10. Propuesta lista: ficha 8 AI=01-11-26, AJ=01-05-27. | Dirección (corte) |
| TRANSF (OCT)!6 · VENTA · USD 10.0 · 09-10-26 | — | **ALTA** · VENTA confirmada sin ficha. Destino: TIVIPLAY. Falta USUARIO, PANEL, plan y pantallas (Gate S0-A); CONFIRMADO JM no autoriza crear la cuenta. | BO (datos de alta) → validación SISTEMA |
| TRANSF (OCT)!8 · FACTU · USD 25.0 · 10-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| TRANSF (OCT)!10 · FACTU · USD 15.0 · 14-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| TRANSF (OCT)!12 · FACTU · USD 70.0 · 17-10-26 | — | FACTURACIÓN/RECONEXIÓN confirmada sin ficha identificable en BASE (0 coincidencias por llave, apellido o fecha). | BO (identidad) |
| TRANSF (OCT)!15 · FACTU · USD COP · 22-10-26 | 771 | Tarifa no validada (MONEDA NO USD): pago en COP vs ficha PLAN 1 MES/1 pant./USD 0. BASE: F.ÚLT 22-10-26, F.PRÓX 24-10-26 (no avanzó). | Dirección (tarifa) → BO |
| TRANSF (OCT)!17 · FACTU · USD COP · 24-10-26 | 770 | Tarifa no validada (MONEDA NO USD): pago en COP vs ficha PLAN 1 MES/3 pant./USD $0. BASE: F.ÚLT 24-10-26, F.PRÓX 24-10-26 (no avanzó). | Dirección (tarifa) → BO |

**Ratificación de tarifa (YA APLICADO; una sola decisión de Dirección):** 23 movimientos con la tarifa reflejada en BASE pero fuera de catálogo.
- 12M/3 pant. a USD 70 (promo): ZELLE!6→639, ZELLE!14→729, ZELLE!20→734, ZELLE!24→735, ZELLE!26→736, ZELLE!27→738, ZELLE!37→742, ZELLE!39→744, ZELLE!40→743, ZELLE!43→748, ZELLE!51→746, ZELLE!53→747, ZELLE!58→749, ZELLE!83→759, ZELLE!98→758, PAYPAL!3→641.
- Otros: ZELLE!28→17 (PLAN  1 MES, USD 10.0), ZELLE!30→740 (PLAN 1 MES, USD 10.0), ZELLE!31→741 (PLAN 1 MES, USD 10.0), PAYPAL!9→754 (PLAN 3 MESES+1, USD 40.0), PAYPAL!10→587 (ADD 9 MESES, USD 50.0), PAYPAL!11→755 (PLAN 1 MES, USD 10.0), TRANSF!4→27 (PLAN 1 MES, USD COP).

**Pendientes de Dirección: estado vivo**
- **ZELLE 104:** ya está CONFIRMADO JM. Pasa a PENDIENTE DE ALTA (BO).
- **PAYPAL 35–37:** no son pagos dobles.
  - 36 y 37 repiten el mismo enlace de factura PayPal que las filas confirmadas 14 y 15 (re-registros, sin confirmación).
  - 35 es una factura que el cliente pidió no continuar.
  - Las tres están fuera del universo. BO debe limpiarlas o marcarlas.
- **Ficha 21:** sigue en REQUIERE REVISIÓN (USD 130 por 12M/2 pant.; el catálogo dice 150).
- **739↔811:** resuelto en BASE. La 811 tiene la marca DUPLICADO DEPURADO (27/10) y la 739 refleja el pago de ZELLE 23. Dirección solo debe ratificarlo.
- **PAYPAL 15:** recibido el 01/11, después del corte propuesto. Depende de la decisión formal del corte (31/10 23:59 COT).

### E. Mapeo maestro
El diccionario de columnas con el campo `ID` (M), sus reglas y el impacto en los lectores está en `CONTEXTO_MAESTRO §5.5`: rama `wo-tivi-mapeo-id-001` @ `e60afb7`, PR #8 (base `wo-tivi-hoy-creditos-001`). Hechos clave:
- `ID` está vacío en las 1 255 fichas.
- USUARIO pasó a N y CONTRASEÑA a O.
- Las fórmulas del libro se ajustaron solas.
- **P0 de seguridad:** `conciliacion.ts › readBaseLive` lee O (CONTRASEÑA) como `panel`.
- El `SENSITIVE_COLUMNS=["N"]` de PR #7 ahora excluiría USUARIO y devolvería CONTRASEÑA.

### F. Evidencia de pruebas, duplicados y seguridad
- **Reproducible:** el clasificador es un script determinista sobre las lecturas del corte. Dos ejecuciones dan 139 = 90 YA APLICADO (23 de ellos con tarifa por ratificar) + 9 pendientes de actualización + 8 altas + 32 en revisión.
- **Validación cruzada:** PAGOS OCTUBRE 2026 tiene 104 filas con `W = CONFIRMADO JM` y BASE `AM` marca 109 fichas. De los movimientos con `AM` lleno, 6 quedaron en revisión (786, 778, 781, 5, 771, 770): con tarifa no validada la hoja no genera `PROP_F_PROXIMO` (AO), así que R tomó el pago pero S no avanzó.
- **Duplicados:** la identidad no se resolvió solo por el nombre. 12 enlaces inferidos se resolvieron así:
  - 9 por la marca DUPLICADO DEPURADO del 27/10.
  - 3 por nombre + fecha + valor, verificados contra el catálogo (BO debe ratificarlos).
  - El USUARIO de la ficha 820 está duplicado sin marca: se depura.
- **Seguridad:** no se solicitó O (CONTRASEÑA) en ninguna lectura de BASE (se verificó por `assert` en el cargador). Las columnas B, C, D, I, U y W se excluyeron. Este documento no contiene nombres, teléfonos, correos ni USUARIO.

### G. ESTADO y NEXT ACTION
- **ESTADO:** conciliación PARCIAL.
  - 139 de 139 clasificados.
  - 0 aplicados por esta ejecución (el lote está pendiente de autorización).
  - 32 en revisión y 8 altas pendientes afectan el cierre financiero.
  - Gate: **NO APTO PARA MOTOR MENSUAL** (sin cambio).
- **BLOQUEO / DECISIÓN (Dirección):**
  1. Aprobar el lote C con el anclaje A o B.
  2. Ratificar la promo 12M·70 y las tarifas fuera de catálogo.
  3. Decidir las tarifas 103, 107, 21, 750 y 778.
  4. Formalizar el corte (PAYPAL 15).
- **NEXT ACTION:**
  - SISTEMA: tras la aprobación, ejecutar el lote, releer y verificar la idempotencia.
  - BO: altas (8) e identidad (7 facturaciones sin ficha).
  - Julian: abrir una ejecución aparte para el P0 de `readBaseLive` / PR #7.

### 13.1 Lote final con anclaje al ciclo (opción B, elegida por Dirección el 01/11 a las 17:04 UTC): validado, sin escribir

**Relectura previa a la escritura** (01/11, ~17:08 UTC) de las 9 fichas y sus pagos de origen:
- `USUARIO` (N) es el mismo que en el dry-run.
- AI y AJ tienen el mismo valor y son `numberValue` fijos (no fórmulas).
- `AM` sigue vacío, así que no hay propagación por fórmula ni doble aplicación.
- R y S siguen sin cambios.
- Los pagos de origen siguen en `CONFIRMADO JM`, con el mismo monto, fecha, `FILA_BASE` y plan canónico.
- **0 conflictos** con modificaciones posteriores al dry-run.

**Celdas de entrada:** AI (`BASE_ULT_PAGO_ANT`) y AJ (`BASE_PROX_PAGO_ANT`) son las únicas celdas de fecha sin fórmula que alimentan R = MAX(AI; AN) y S = MAX(AJ; AO). Con `AM` vacío, R = AI y S = AJ. Q (F.VENCIMIENTO, técnico), E, T y las fórmulas no se tocan.

| # | Pago de origen | Ficha | Plan (duración) | AI (F.ÚLT): antes → nuevo | AJ (F.PRÓX): antes → nuevo | Regla |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ZELLE (OCT)!80 · USD 180 · 20-10-26 | 796 | PLAN 12 MESES+2 (14 m) | 07-10-25 → **20-10-26** | 07-10-26 → **20-12-27** | pago vencido (13 d): fecha de pago + duración |
| 2 | ZELLE (OCT)!93 · USD 21 · 24-10-26 | 76 | PLAN 1 MES (1 m) | 19-09-26 → **24-10-26** | 27-10-26 → **27-11-26** | B ciclo (pagó 3 d antes) |
| 3 | ZELLE (OCT)!101 · USD 70 · 27-10-26 | 23 | PLAN 6 MESES+1 (7 m) | 08-05-26 → **27-10-26** | 08-11-26 → **08-06-27** | B ciclo (pagó 12 d antes) |
| 4 | ZELLE (OCT)!102 · USD 15 · 27-10-26 | 765 | PLAN 1 MES (1 m) | 26-09-26 → **27-10-26** | 26-10-26 → **27-11-26** | pago vencido (1 d): fecha de pago + duración |
| 5 | ZELLE (OCT)!105 · USD 70 · 28-10-26 | 776 | PLAN 6 MESES+2 (8 m) | 19-02-26 → **28-10-26** | 19-10-26 → **28-06-27** | pago vencido (9 d): fecha de pago + duración |
| 6 | ZELLE (OCT)!108 · USD 40 · 30-10-26 | 11 | PLAN 3 MESES (3 m) | 03-08-26 → **30-10-26** | 03-11-26 → **03-02-27** | B ciclo (pagó 4 d antes) |
| 7 | ZELLE (OCT)!109 · USD 48 · 30-10-26 | 30 | PLAN 3 MESES+1 (4 m) | 30-08-26 → **30-10-26** | 09-11-26 → **09-03-27** | B ciclo (pagó 10 d antes) |
| 8 | ZELLE (OCT)!111 · USD 55 · 31-10-26 | 792 | PLAN 3 MESES+1 (4 m) | 10-06-26 → **31-10-26** | 10-10-26 → **28-02-27** | pago vencido (21 d): fecha de pago + duración |
| 9 | PAYPAL (OCT)!14 · USD 15 · 28-10-26 | 762 | PLAN 1 MES + 1 (2 m) | 21-08-26 → **28-10-26** | 28-10-26 → **28-12-26** | pago en la fecha (= ciclo) |

**Validación individual de las renovaciones anticipadas:**

| Ficha | F. comercial vigente | Duración pagada | Tarifa contra catálogo | Resultado B | Días pagados perdidos | Cobertura sin respaldo |
| --- | --- | --- | --- | --- | --- | --- |
| 76 | 27-10-26 | 1 m (1M, 2 pant.) | USD 21 = TVP26_006 ✓ | 27-11-26 | 0 (con A se perdían 3) | 0: exactamente 1 mes desde la fecha vigente |
| 23 | 08-11-26 | 7 m (6M+1, 1 pant.) | USD 70 = TVP26_004 + 1 mes del plan ✓ | 08-06-27 | 0 (con A se perdían 12) | 0: el «+1» lo da el plan canónico (DURACION_MESES = 7), igual que la propuesta de la hoja |
| 11 | 03-11-26 | 3 m (3M, 1 pant.) | USD 40 = TVP26_003 ✓ | 03-02-27 | 0 (con A se perdían 4) | 0 |
| 30 | 09-11-26 | 4 m (3M+1, 2 pant.) | USD 48 = TVP26_008 + 1 mes del plan ✓ | 09-03-27 | 0 (con A se perdían 10) | 0 |

Observaciones (no bloquean):
- La ficha 23 ya tenía un crédito ejecutado en CONTROL (F.VENC técnica 18-11-26). Esa es la capa de servicio, separada, y Q no se toca.
- En la ficha 30, la F.PRÓX vigente (09-11-26) es anterior a F.ÚLT + 4 m del ciclo previo (30-12-26). Se respeta la fecha vigente: no se inventa cobertura. Si el ciclo anterior quedó corto, BO lo revisa aparte.
- La 792 (pagó el 31-10) llega al 28-02-27 porque febrero no tiene día 31.

**Valores a escribir** (seriales de Sheets, RAW; rango `AI{fila}:AJ{fila}`):
`796:[46315,46741] · 76:[46319,46353] · 23:[46322,46546] · 765:[46322,46353] · 776:[46323,46566] · 11:[46325,46421] · 30:[46325,46455] · 792:[46326,46446] · 762:[46323,46384]`  
**Reversión exacta:** `796:[45937,46302] · 76:[46284,46322] · 23:[46150,46334] · 765:[46291,46321] · 776:[46072,46314] · 11:[46237,46329] · 30:[46264,46335] · 792:[46183,46305] · 762:[46255,46323]`

**Ejecución autorizable:**
1. Releer N, AI y AJ de cada fila. Si alguna difiere de esta tabla, se omite esa fila.
2. Escribir 9 rangos AI:AJ.
3. Releer AI, AJ, R, S, E y T.
4. Re-ejecutar el clasificador: los 9 movimientos deben pasar a YA APLICADO.
5. Segundo pase: 0 filas por escribir (idempotencia).

**ESTADO:** lote VALIDADO, sin escribir. **BLOQUEO:** falta la autorización explícita de escritura de Dirección.

### 13.2 Ejecución del lote autorizado (01/11/2026, 17:39–17:50 UTC)

**Autorización:** Julian, 17:38 UTC, en el hilo: 9 fichas, solo AI/AJ, máximo 18 celdas, anclaje al ciclo para 76, 23, 11 y 30.

**Antes de escribir:** se releyó cada ficha. En las 9 coincidieron N (USUARIO), AI y AJ (valores fijos) con §13.1, y `AM` seguía vacío.

**Respaldo de las duraciones:** en las 9 fichas, el PLAN ACTIVO de BASE coincide con el plan canónico del pago, y el valor base coincide con el catálogo. Los meses «+k» vienen del plan de la ficha (S0: cobertura de PLAN ACTIVO +k):
- 796: 12M+2, 3 pant., USD 180 = TVP26_015.
- 762: 1M+1, 1 pant., USD 15 = TVP26_001.
- 792: 3M+1, 3 pant., USD 55 = TVP26_013.

**Escritura:** 9 llamadas `values.update` sobre `AI{n}:AJ{n}`. **18 celdas** en total, todas con éxito. Ninguna ficha se excluyó y no hubo errores, conflictos ni restauraciones.

| Ficha | AI (F.ÚLT) | AJ (F.PRÓX) | E después | T después |
| --- | --- | --- | --- | --- |
| 796 | 07-10-25 → 20-10-26 | 07-10-26 → 20-12-27 | Al dia | 414 |
| 76 | 19-09-26 → 24-10-26 | 27-10-26 → 27-11-26 | Al dia | 26 |
| 23 | 08-05-26 → 27-10-26 | 08-11-26 → 08-06-27 | Al dia | 219 |
| 765 | 26-09-26 → 27-10-26 | 26-10-26 → 27-11-26 | Al dia | 26 |
| 776 | 19-02-26 → 28-10-26 | 19-10-26 → 28-06-27 | Al dia | 239 |
| 11 | 03-08-26 → 30-10-26 | 03-11-26 → 03-02-27 | Al dia | 94 |
| 30 | 30-08-26 → 30-10-26 | 09-11-26 → 09-03-27 | Al dia | 128 |
| 792 | 10-06-26 → 31-10-26 | 10-10-26 → 28-02-27 | Al dia | 119 |
| 762 | 21-08-26 → 28-10-26 | 28-10-26 → 28-12-26 | Al dia | 57 |

**Relectura posterior:** R = AI y S = AJ en las 9 fichas. Se comparó BASE completa (E:N sin I, P:AJ y AK:AP; O no se leyó) entre el dry-run y después de escribir:
- Solo cambiaron las 9 filas del lote. Además de AI/AJ, cambiaron sus fórmulas dependientes: R, S, T, E y las auxiliares AB:AF.
- Fuera del lote solo se recalcularon 3 filas de totales por fórmula: 861, 862 y 1250, en sus columnas J/K.
- Q (F.VENCIMIENTO), AM:AP (confirmaciones y sincronización) y las demás fichas no cambiaron.

**Segunda conciliación (idempotencia):** se releyeron las fuentes y BASE y se volvió a ejecutar el clasificador. Resultado:
- Los 9 movimientos pasaron a YA APLICADO.
- **0 filas pendientes de escritura.**
- 0 cambios de clase en los otros 130 movimientos.

**Nueva clasificación de los 139 confirmados**

| Categoría | ZELLE | PAYPAL | TRANSF | Total |
| --- | --- | --- | --- | --- |
| YA APLICADO / SIN CAMBIO | 82 | 8 | 9 | 99 (9 aplicados hoy; 23 con tarifa por ratificar) |
| PENDIENTE DE ACTUALIZACIÓN | 0 | 0 | 0 | 0 |
| PENDIENTE DE ALTA | 6 | 1 | 1 | 8 |
| REQUIERE REVISIÓN | 23 | 4 | 5 | 32 |

**Reversión exacta (si hiciera falta):** `796:[45937,46302] · 76:[46284,46322] · 23:[46150,46334] · 765:[46291,46321] · 776:[46072,46314] · 11:[46237,46329] · 30:[46264,46335] · 792:[46183,46305] · 762:[46255,46323]` en `AI:AJ`.

**ESTADO:** lote APLICADO y VALIDADO (relectura + idempotencia). Conciliación de octubre PARCIAL: quedan 40 excepciones (32 en revisión y 8 altas), detalladas en §13 D, y las 23 ratificaciones de tarifa. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:**
- DIRECCIÓN: ratificar la promo 12M·70 y las demás tarifas fuera de catálogo; decidir las tarifas de 21, 103, 107, 750 y 778; formalizar el corte (PAYPAL 15).
- BO: 8 altas, 7 facturaciones sin ficha y los casos 96, 41, 106, 110 y P5.
- SISTEMA: aplicar los lotes que salgan de esas decisiones con el mismo procedimiento.
- Julian: abrir una ejecución aparte para el P0 de la intranet (`readBaseLive`, PR #7). PR #8 sigue sin fusionar.

## 14. S0-A: 8 ALTAS CONFIRMADO JM PENDIENTES (01/11/2026, dry-run, sin escrituras)

**Fuentes releídas en vivo (01/11):** ZELLE (OCT) A3:AD120, PAYPAL (OCT) A:B y D:AI, TRANSF (OCT) A2:AG25; BASE GENERAL completa en columnas seguras (A, E:N, P:AQ; encabezados de la fila 2 verificados: M=ID, N=USUARIO, P=PANEL; O nunca leída); CONTROL (OCT) P1/P2/P3 solo A:D y F:L (usuario, panel, fecha, origen, crédito). Cruce por CLIENTE_KEY, tokens de nombre y observación (pagador), y por USUARIO del panel contra N de las 1 255 fichas (activos, altas OCT, vencidos, MIRA+ y desactivados).

**Hallazgo estructural:** la sección S5 «altas OCT» (filas 729–760) está llena; no hay filas libres. Toda alta exige insertar filas, lo que desplaza +1 por alta todas las filas ≥ destino (S6, totales, MIRA+, desactivados). Las fórmulas del libro se ajustan solas; las referencias por número de fila en este checkpoint y en lectores por posición no.

### 14.1 Las 8 operaciones (sin PII)

| Mov. | Origen | USD | Fecha | Evidencia de cuenta (panel) | Ficha en BASE | Tarifa | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ZELLE!64 | VENTA | 15 | 14-10 | P3!357 · Venta · 14-10 · misma asesora · usuario no existe en BASE | No | 1M·1p = 15 (única) | **ALTA INEQUÍVOCA** |
| ZELLE!104 | VENTA | 180 | 27-10 | P3!648 · origen «FACTURACION» · 27-10 · misma asesora | No | 12M·3p = 180 (única) | REQUIERE REVISIÓN: bono +0 o +2 (otras fichas de 180 llevan «12M+2») y origen discrepante |
| ZELLE!35 | VENTA MIRA+ | 70 | 07-10 | P2!5 (PANEL 2, MIRA+) · Venta · 06-10 · mismo asesor | No | MIRA+ fuera de catálogo | REQUIERE REVISIÓN: plan y pantallas MIRA+ |
| ZELLE!78 | VENTA MIRA+ | 30 | 19-10 | P2!9 (PANEL 2) · Venta · 11-10 (8 días antes del pago) | No | MIRA+ fuera de catálogo | REQUIERE REVISIÓN: plan MIRA+ y fecha de inicio |
| ZELLE!67 | VENTA | 70 | 15-10 | Ninguna cuenta nueva del asesor ±3 días | No (el pagador es titular de la ficha 222, activa hasta 09-01-27) | 6M·1p o promo 12M·70 | REQUIERE REVISIÓN: sin cuenta, plan ambiguo, relación con 222 |
| ZELLE!95 | VENTA | 15 | 25-10 | Ninguna (el candidato por nombre pertenece a la ficha 578) | No | 1M·1p | REQUIERE REVISIÓN: sin cuenta en panel |
| PAYPAL!8 | VENTA | 15 | 16-10 | Ninguna (el único «Venta» de P1 ese día es la ficha 187, mal rotulado) | No | 1M·1p | REQUIERE REVISIÓN: sin cuenta en panel |
| TRANSF!6 | VENTA NEQUI | 10 | 09-10 | P3!223 · Venta · 08-10 · otro asesor | No | 10 fuera de catálogo (promo 10 sin ratificar) | REQUIERE REVISIÓN: tarifa y asesor |

Resultado: **1 ALTA INEQUÍVOCA, 7 REQUIEREN REVISIÓN.** Ninguna duplica una ficha existente (0 coincidencias por llave, nombre ni usuario; los tres positivos por tokens fueron descartados al inspeccionarlos: fichas 222, 401 y 690).

### 14.2 Solape con las 7 facturaciones sin ficha

Ningún movimiento está en ambos grupos (nombres, montos y fechas distintos). Pero la relectura reclasifica las 7:

| Mov. | USD | Hallazgo | Nueva clasificación |
| --- | --- | --- | --- |
| ZELLE!46 | 15 | Su usuario es la ficha 48; pago ya aplicado (AM=CONFIRMADO JM, R=09-10). ~~CLIENTE contiene «CONFIRMADO JM»~~ [corregido en §14.5: es CLIENTE_KEY (AG48) con una fórmula ajena] | YA APLICADO + incidencia de integridad |
| TRANSF!10 | 15 | Su usuario es la ficha 45; pago ya aplicado (R=14-10, S=14-11). ~~CLIENTE contiene «CONFIRMADO JM»~~ [corregido en §14.5: es CLIENTE_KEY (AG45)] | YA APLICADO + incidencia de integridad |
| ZELLE!66 | 150 | Cuenta nueva P3!377 (15-10), no existe en BASE | Alta candidata · 12M·2p · REQUIERE REVISIÓN (origen dice facturación) |
| TRANSF!8 | 25 | Cuenta nueva P3!334 (13-10, 3 días después), no existe en BASE | Alta candidata · 2M·1p · REQUIERE REVISIÓN |
| TRANSF!12 | 70 | Cuenta nueva P3!413 (17-10), no existe en BASE | Alta candidata · REQUIERE REVISIÓN (70 ambiguo) |
| PAYPAL!12 | 70 | Cuenta nueva P3!610 con origen VENTA (25-10); la fila de PAYPAL no tiene fórmulas auxiliares | Alta candidata · REQUIERE REVISIÓN (70 ambiguo) |
| ZELLE!112 | 5 | Sin cuenta; 5 USD no es tarifa | REQUIERE REVISIÓN (posible ajuste o diferencia) |

Las dos únicas fichas de BASE cuyo CLIENTE_KEY no es un nombre son 45 y 48 (ambas «CONFIRMADO JM»). Eso explica por qué sus pagos figuraban «SIN BASE». También: ZELLE!107 (VENTA 110, en las 32) tiene cuenta nueva P3!687 con origen VENTA (29-10).

### 14.3 Lote autorizable (1 alta inequívoca)

**Operación 1, estructura:** insertar 1 fila en BASE GENERAL antes de la fila 760, dentro de S5, heredando el formato de la 759. La fila nueva es la **760**; la antigua 760 pasa a 761 y todo lo inferior sube +1 (S6 763–859, totales 860–863, MIRA+ 865–868, desactivados desde 875). Los rangos de totales (`A729:A760`, `J729:J760`, `K729:K760`) se amplían solos a `:761`.

**Operación 2, valores de la fila 760** (las letras son de encabezado, verificadas el 01/11):

| Col. | Valor |
| --- | --- |
| A TC | 1 |
| B CLIENTE | copia literal (con TRIM) de `ZELLE (OCT)!B64` en el momento de ejecutar; no se reproduce aquí |
| C, D, I, O, U, W | vacías (las completa el equipo; O nunca se escribe ni se lee) |
| E | `=IF(T760>5,"Al dia",IF(AND(T760>=1,T760<=5),"Por vencer","Vencido"))` |
| F | `ALTA OCT 2026 · VENTA ZELLE (OCT)!64 · 14/10/2026 · USD 15 · CONFIRMADO JM · cuenta CONTROL (OCT) P3!357 · S0-A 01/11/2026` |
| G / H | `PLAN 1 MES` / 1 |
| J / K / L | 15 / `-` / `ZELLE` |
| M ID | vacío (no hay ID de panel en las fuentes; permitido por §5.5) |
| N USUARIO | usuario de CONTROL (OCT) P3!D357 (copia literal) |
| P PANEL | `PANEL 3` (rótulo más usado para colombia78DM en S5: 11 de 18; en toda BASE conviven «PANEL 3» 314 y «PANEL 3M/Panel 3M» 334, a normalizar por BO) |
| Q, R, S, T | fórmulas de la 759 con referencia a la 760 |
| X:AG | fórmulas de la 759 con referencia a la 760 |
| AH / AI / AJ | 46340 (14-11-26) / 46309 (14-10-26) / 46340 (14-11-26) |
| AK:AP | fórmulas de la 759 con referencia a la 760 |
| AQ | vacía |

**Resultado esperado tras escribir:** R=14-10-26, S=14-11-26, T=13, E=«Al dia», X=«PLAN PRINCIPAL», AK=1, AL=14-11-26. AM queda vacía y AP queda «SIN PAGO CONFIRMADO», porque AM solo lee PAGOS OCTUBRE 2026 (generado al corte del 30/09); es un límite conocido y no cambia R/S. En ZELLE (OCT) la fila 64 pasa sola a ENLAZADO con FILA_BASE=760.

**Respaldo privado:** instantánea de las filas 755–762 y 858–875 (columnas seguras) en el scratchpad de la sesión, `s0a/pre_insert_snapshot.json`, más el revisionId previo del libro (`APfK_pD0…`) para restaurar desde el historial de versiones.

**Reversión exacta:** eliminar la fila 760 (una operación). Devuelve filas, totales y referencias al estado actual.

**Validación posterior:** releer 755–765 y 858–870; diff completo de BASE con todo desplazado +1 y sin otros cambios; comprobar ZELLE!64; segundo pase de conciliación con 0 pendientes nuevos.

### 14.4 Excepciones (decisión de Dirección o BO)

- **Dirección:** promo 12M·70 (ZELLE!67, TRANSF!12, PAYPAL!12), tarifa 10 (TRANSF!6), tarifario MIRA+ (ZELLE!35, ZELLE!78), regla del bono «+2» en 12M·180 (ZELLE!104).
- **BO:** cuentas de panel inexistentes (ZELLE!67, ZELLE!95, PAYPAL!8); confirmar que P3!377, P3!334, P3!413, P3!610 y P3!687 son altas y no fichas perdidas; 5 USD (ZELLE!112); restaurar CLIENTE_KEY en las fichas 45 y 48 (2 celdas en AG; ver §14.5).
- **Incidencia de lectura:** al sondear encabezados, una lectura `CONTROL (OCT) P1/P2/P3!A1:Z3` devolvió la columna CONTRASEÑA de una fila por hoja. No se guardó, no se reporta y las lecturas siguientes excluyeron la columna E.

**ESTADO:** S0-A PARCIAL. 1 alta lista para autorizar, 7 en revisión, 2 facturaciones reclasificadas como ya aplicadas, 0 escrituras. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:** Dirección autoriza o rechaza el lote 14.3 (1 inserción y 1 fila). Con las decisiones de 14.4, cada alta en revisión se prepara con el mismo formato.

### 14.5 Consolidación del lote de altas (01/11/2026, dry-run; Dirección eligió «una sola inserción», 18:38 UTC)

**Fichas 45 y 48: corrección del diagnóstico.** CLIENTE (B45, B48) contiene los nombres correctos, iguales a los de TRANSF!10 y ZELLE!46. Lo dañado es **CLIENTE_KEY (AG45, AG48)**: en lugar de la fórmula estándar `=IF(Bn="","",UPPER(TRIM(CLEAN(SUBSTITUTE(Bn,CHAR(160)," ")))))` tienen una fórmula ajena (`=IF(Yn="","",IF(Zn=0,"SIN PAGO",…INDEX('ZELLE (OCT)'!H:H,ABn)…))`), copiada de una columna auxiliar de confirmación, que devuelve «CONFIRMADO JM». Son las únicas 2 de las 1 220 celdas AG con datos que se apartan de la estándar (1 215 estándar y 3 vacías estructurales).
- Enlace del pago: correcto por USUARIO. PAGOS OCTUBRE 2026!83 (USUARIO de la ficha 45) apunta a TRANSFERENCIA fila 10, 14-10-26, CONFIRMADO JM. PAGOS OCTUBRE 2026!111 (USUARIO de la ficha 48) apunta a ZELLE fila 46, 09-10-26. AM/AN de las fichas: CONFIRMADO JM, 14-10 y 09-10.
- Efecto del daño: como la llave no coincide, ZELLE!46 y TRANSF!10 quedan «SIN BASE», sus columnas PROP_* salen vacías y AO45/AO48 también. Las fechas vigentes salen de AJ: S45=14-11-26 (pago 14-10 + 1M) y S48=15-11-26 (renovación anticipada anclada al ciclo 15-10 + 1M). Ambas son coherentes y no se pierden días.
- **Reparación propuesta (lote R, 2 celdas, no estructural):** restaurar la fórmula estándar en AG45 y AG48. Efecto previsto: ZELLE!46 → FILA_BASE 48 y TRANSF!10 → FILA_BASE 45 (ENLAZADO); AO toma pago + 1M (09-11 y 14-11), y S=MAX(AJ,AO) no cambia (15-11 y 14-11). Reversión: volver a pegar la fórmula ajena, que queda guardada en el respaldo privado.

**Las 4 facturaciones con cuenta nueva.** Ningún nombre ni usuario aparece en ZELLE/TRANSF/PAYPAL de agosto y septiembre, en CONTROL (SEPT) P1/P2/P3, en los medios de pago de noviembre ni en BASE (incluidos los desactivados). Los usuarios pertenecen a la serie creada en octubre. Lectura más probable: son **ventas nuevas rotuladas como FACTURACIÓN**, no fichas perdidas. Ninguna es inequívoca todavía:

| Mov. | USD | Cuenta | Tarifa | Falta |
| --- | --- | --- | --- | --- |
| ZELLE!66 | 150 | P3!377, 15-10, mismo asesor | 12M·2p (única) | Dirección: bono +0 o +2. BO: confirmar que es venta |
| TRANSF!8 | 25 | P3!334, 13-10 (3 días después del pago) | 2M·1p (única) | Dirección: anclar el alta al pago (10-10) o a la activación (13-10). BO: confirmar venta |
| TRANSF!12 | 70 | P3!413, 17-10 | 6M·1p o promo 12M·70 | Dirección: promo 70. BO: confirmar venta |
| PAYPAL!12 | 70 | P3!610, origen VENTA, 25-10 | 6M·1p o promo 12M·70 | Dirección: promo 70 y anclaje (activación un día después) |

**Altas inequívocas adicionales: ninguna.** El lote autorizable sigue teniendo solo ZELLE!64. Otras 6 están precalculadas y entran en cuanto se tome la decisión indicada.

**Universo de altas TIVIPLAY: causa, responsable y dato faltante**

| Orden (fecha de pago) | Mov. | Estado | Responsable | Dato faltante | Valores precalculados (G · H · J · L · N · AI → AJ) |
| --- | --- | --- | --- | --- | --- |
| 1 | TRANSF!6 · 09-10 · 10 | B | Dirección + BO | Tarifa 10 (promo 1M); la cuenta P3!223 es del 08-10 y la creó otro asesor | PLAN 1 MES · 1 · 10 · NEQUI · P3!D223 · 46304 → 46335 |
| 2 | TRANSF!8 · 10-10 · 25 | B | Dirección + BO | Anclaje pago o activación; origen | PLAN 2 MESES · 1 · 25 · NEQUI · P3!D334 · 46305 → 46366 (pago) o 46308 → 46369 (activación) |
| 3 | **ZELLE!64 · 14-10 · 15** | **A** | — | — | PLAN 1 MES · 1 · 15 · ZELLE · P3!D357 · 46309 → 46340 |
| 4 | ZELLE!66 · 15-10 · 150 | B | Dirección + BO | Bono; origen | PLAN 12 MESES · 2 · 150 · ZELLE · P3!D377 · 46310 → 46675 (+0) o 46736 (+2) |
| 5 | TRANSF!12 · 17-10 · 70 | B | Dirección + BO | Promo 70; origen | 6M·1p: PLAN 6 MESES · 1 · 70 · NEQUI · P3!D413 · 46312 → 46494; promo: PLAN 12 MESES · 3 · … → 46677 |
| 6 | PAYPAL!12 · 24-10 · 70 | B | Dirección | Promo 70; anclaje | 6M·1p: … · PAYPAL · P3!D610 · 46319 → 46501; promo 12M·3p → 46684 (o +1 día si se ancla a la activación) |
| 7 | ZELLE!104 · 27-10 · 180 | B | Dirección | Bono; origen del panel | PLAN 12 MESES · 3 · 180 · ZELLE · P3!D648 · 46322 → 46687 (+0) o 46748 (+2) |
| — | ZELLE!67 · 15-10 · 70 | C | BO | No hay cuenta en el panel (¿se activó el servicio?); USUARIO; plan; relación con el pagador (ficha 222) | — |
| — | ZELLE!95 · 25-10 · 15 | C | BO | No hay cuenta en el panel; USUARIO | — |
| — | PAYPAL!8 · 16-10 · 15 | C | BO | No hay cuenta en el panel; USUARIO | — |
| — | ZELLE!107 · 29-10 · 110 | C | Dirección + BO | Cuenta P3!687 (VENTA); 110 no es tarifa: plan y pantallas | — |
| — | ZELLE!112 · 31-10 · 5 | C | BO | Sin cuenta; 5 no es tarifa (¿ajuste, diferencia o abono?) | — (posiblemente no es alta) |

A = autorizable; B = precalculada, a la espera de una decisión; C = falta un dato de BO. Las decisiones pendientes de ZELLE!104, TRANSF!6 y la operación de 5 USD se conservan tal cual.

**MIRA+ (fuera del universo TIVIPLAY).** ZELLE!35 (70, cuenta P2!5) y ZELLE!78 (30, cuenta P2!9, creada 8 días antes del pago) quedan en un lote aparte, destinado a la sección MIRA+, hasta que se validen su contrato y catálogo. No se insertan junto con TIVIPLAY.

**Lote consolidado (forma de ejecución, para cuando se autorice):**
1. Comprobaciones previas por alta: la fila de origen sigue en CONFIRMADO JM con el mismo monto, fecha y origen; B de origen no está vacío; `COUNTIF(BASE!AG:AG, llave)=0`; el USUARIO del panel no aparece en BASE!N; la fila del panel existe y su fecha es la del pago ±3 días. Además: S5 sigue terminando en la fila 760 y la 761 está vacía, y el número de filas de la hoja no cambió desde el dry-run. Si una comprobación falla, esa alta sale del lote y las demás siguen.
2. **Una sola** inserción de K filas antes de la 760 (K = altas aprobadas), heredando el formato de la 759. Las filas 760…759+K se asignan por fecha de pago, en el orden de la tabla.
3. Escribir en cada fila los valores de §14.3 con su columna correspondiente; las fórmulas E, Q:T, X:AG y AK:AP se copian de la 759 con la fila ajustada. C, D, I, M, O, U, W y AQ quedan vacías.
4. Lote R (AG45, AG48) en la misma ventana; no depende de la inserción.
5. Respaldo: instantánea privada de las filas 755–762 y 858–875 más el revisionId previo. Reversión: borrar las filas 760…759+K (una operación) y restaurar AG45/AG48.

**Impacto sobre referencias y fórmulas (inserción de K filas antes de la 760):**
- Totales: `A/J/K729:760` pasan solos a `:760+K`, porque la inserción cae dentro del rango; sus filas (859–862) bajan a 859+K…
- FILA_BASE en ZELLE/PAYPAL/TRANSF (OCT): el rango `AG$4:AG$1223` se amplía a `1223+K` y los valores se recalculan. Las filas de origen ya enlazadas en filas ≥760 muestran el número nuevo, y las altas nuevas pasan a ENLAZADO con COINCIDENCIAS=1 si la llave es idéntica (B se copia con TRIM desde el origen).
- CLIENTE_KEY: fórmula estándar en cada fila nueva; no hay duplicados porque la comprobación 1 exige 0 coincidencias previas.
- Origen del pago: AM/AN/AO buscan en PAGOS OCTUBRE 2026 por USUARIO y no dependen del número de fila. Las altas nuevas no figuran ahí (corte del 30/09), así que su R/S sale de AI/AJ y AP muestra «SIN PAGO CONFIRMADO», que es lo esperado.
- PAGOS OCTUBRE 2026!V («ORIGEN BASE») es texto histórico del corte (p. ej., «BASE GENERAL!689») y ya no coincide con las filas actuales; la inserción no lo empeora.
- **No se ajusta solo:** las referencias por número de fila en este checkpoint (§13.2: las fichas 762, 765, 776, 792 y 796 pasan a +K; también la 760 del caso 103); la columna FILA_BASE de «PAGOS NOVIEMBRE 2026 - BORRADOR», que habrá que regenerar después de la inserción (no ahora); y los lectores por posición de la intranet (P0 aparte).

**ESTADO:** consolidación PARCIAL. 1 alta autorizable (A), 6 precalculadas a la espera de decisión (B), 5 en manos de BO (C), 2 de MIRA+ aparte y 1 lote de reparación no estructural (R) listo. 0 escrituras. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:**
- Dirección: (1) promo 12M·70 o 6M·1p (TRANSF!12, PAYPAL!12); (2) regla del bono en 12M (ZELLE!66, ZELLE!104); (3) anclaje del alta al pago o a la activación (TRANSF!8, PAYPAL!12); (4) tarifa 10 (TRANSF!6); (5) autorizar el lote R.
- BO: confirmar que las 4 «facturaciones» son ventas; dar el USUARIO o confirmar la activación de ZELLE!67, ZELLE!95 y PAYPAL!8; identificar ZELLE!107 y ZELLE!112; validar el contrato y el catálogo MIRA+.
- Sistema: con esas respuestas, recalcular K, repetir las comprobaciones y pedir la autorización específica de la inserción única.

### 14.6 Aplicación de las decisiones de Dirección del 01/11 (21:15 UTC): promo 12M·70 y reactivación USD 10 (dry-run)

**Relectura en vivo (01/11, ~21:20 UTC):** ZELLE/PAYPAL/TRANSF (OCT) completas y BASE en columnas seguras. Cambio detectado: **PAYPAL!15 (USD 105, recibido el 01/11) ya no tiene CONFIRMADO JM**, así que el universo de octubre baja de 139 a **138 confirmados**. Los demás 138 mantienen confirmación, monto y fecha.

**Criterio aplicado (lectura explícita):**
- *Decisión 1.* «Registro que permite verificar la promoción» = la ficha de BASE enlazada registra `PLAN 12 MESES` (sin «+k») con USD 70, y el pago confirmado es de USD 70 (y, cuando existe, una observación de promo). Pantallas: solo las registradas en la ficha. Como la referencia de la promo es «12 meses, 70 USD, 3 pantallas» (ficha 758), una ficha con otro número de pantallas no se da por promo. No se extiende a pagos sin ficha ni a fichas con bono no documentado. Si se leyera «ventas» en sentido estricto (solo origen VENTA), ningún caso calificaría: las únicas ventas de 70 son ZELLE!67 (sin ficha), ZELLE!41 (mal enlazada) y ZELLE!35 (MIRA+).
- *Decisión 2.* «Reactivación» = la ficha estaba vencida o desactivada antes del pago (o la observación lo dice). Ningún pago de USD 10 trae origen «RECONEXIÓN». Los de clientes al día que renuevan a 10 (fichas 5, 17, 740, 741 y 755) no son reactivaciones: el 5 ya pagó 10 en septiembre (ZELLE (SEPT)!53).

**Excepciones tarifarias reclasificadas: 19** (18 por la Decisión 1 y 1 por la Decisión 2)

| Grupo | Movimientos → ficha | Estado nuevo | Acción |
| --- | --- | --- | --- |
| D1 ya aplicadas (14) | ZELLE!6→639, !14→729, !20→734, !24→735, !26→736, !27→738, !37→742, !39→744, !40→743, !43→748, !51→746, !53→747, !83→759; PAYPAL!3→641 | YA APLICADO · TARIFA VALIDADA POR DIRECCIÓN | Solo la observación (fechas ya correctas: pago + 12M, o ciclo en la 735) |
| D1 con actualización (1) | PAYPAL!7 → 750 (824 = DUPLICADO DEPURADO) | PENDIENTE DE ACTUALIZACIÓN · autorizable | Observación + AI/AJ: el pago del 13-10 llegó con la ficha vencida (F.PRÓX 24-09-26) → regla de Dirección del 01/11: pago + duración = 13-10-27. La F de la ficha documenta «se le ofreció promoción» |
| D1 tarifa resuelta, bloqueada por otra causa (3) | ZELLE!96 → 756 | REQUIERE REVISIÓN | Identidad inferida, sin confirmar; F.ÚLT 25-11-25 (año probablemente errado). La F documenta «12 meses x70 + 1 pantalla + 1 mes gratis» |
| | ZELLE!103 → 760 / 909 | REQUIERE REVISIÓN | Dos fichas con la misma llave; la 760 no tiene fechas. La F confirma «promo 70 USD». BO debe confirmar la 760 |
| | ZELLE!110 → 1087 | REQUIERE REVISIÓN | Ficha en DESACTIVADOS FEB: hay que reactivarla o trasladarla |
| D2 tarifa resuelta, bloqueada (1) | ZELLE!106 → 1106 | REQUIERE REVISIÓN | Reactivación clara (vencida desde 19-02-26) y ficha enlazada (1 coincidencia), pero está en DESACTIVADOS, paga un tercero y no hay respaldo de duración ni de fecha. No se escribe nada |

**Siguen como excepción (no cumplen las decisiones):**
- 749 (ZELLE!58): 12M·70 con **4 pantallas**, no documentado en la promo.
- 758 (ZELLE!98): ficha con 2 pantallas, pero la observación dice «promo 12 meses 70 USD 3 pantallas» → pantallas.
- USD 10 de clientes al día: ZELLE!28→17, !30→740, !31→741, !88→5 y PAYPAL!11→755 (este con enlace inferido). Son renovaciones o retención, no reactivaciones (la 741 tiene «MSG retención» el 29/09).
- TRANSF!6 (VENTA de 10, cliente nuevo): no es reactivación.
- ZELLE!67, TRANSF!12, PAYPAL!12 (70 sin ficha): no hay registro que verifique la promo ni las pantallas.
- ZELLE!41: identidad. MIRA+ (ZELLE!35, ZELLE!48→864): fuera del universo TIVIPLAY.
- Sin relación con estas decisiones: PAYPAL!9→754, PAYPAL!10→587 y TRANSF!4 (COP).
- De las 23 «tarifas por ratificar» de §13 quedan ~~8~~ **9** [corregido en §14.7: faltaba la 749]: 749, 758, las cuatro de 10, 754, 587 y TRANSF!4.

**Lote K de altas:** sin cambios. **Autorizable: 1 (ZELLE!64).** Ninguna decisión desbloquea otra alta. TRANSF!12 y PAYPAL!12 necesitan evidencia de venta en promo y pantallas; TRANSF!6 no es reactivación. El bono de +2 (ZELLE!66, ZELLE!104) y el anclaje del alta (TRANSF!8, PAYPAL!12) siguen pendientes.

**Diff autorizable, lote D (17 celdas, sin inserciones):**

| Ficha | Celda | Antes | Después |
| --- | --- | --- | --- |
| 639, 729, 734, 735, 736, 738, 742, 744, 743, 748, 746, 747, 759, 641, 750 (15) | F (OBSERVACIONES) | texto actual (respaldo íntegro privado) | `PROMOCIÓN — 12 MESES / USD 70 — EXCEPCIÓN COMERCIAL AUTORIZADA POR DIRECCIÓN // ` + texto actual, sin alterarlo |
| 750 | AI | 45924 (24-09-25) | 46308 (13-10-26) |
| 750 | AJ | 46289 (24-09-26) | 46673 (13-10-27) |

- Efecto esperado: en las 15 fichas solo cambia F. En la 750, R=13-10-26 (sin cambio), S=13-10-27, E=«Al dia», T≈346. No se tocan fórmulas, G/H/J, AM:AQ, el catálogo ni los contratos.
- Comprobaciones antes de escribir: releer N y F de cada fila; F debe coincidir con el respaldo (si un miembro la cambió, se antepone la nota al texto nuevo y se informa). AI/AJ de la 750 deben seguir en 45924/46289, y PAYPAL!7 debe seguir en CONFIRMADO JM.
- Respaldo privado: `s0a/d12/d12_backup_private.json` (F íntegra de las 16 fichas evaluadas y el revisionId).
- Reversión: restaurar F desde el respaldo (15 celdas) y la 750 a AI 45924 / AJ 46289.
- Lote R (AG45/AG48, §14.5): sigue listo y se puede autorizar en la misma ventana.

**ESTADO:** decisiones aplicadas en dry-run. 19 excepciones reclasificadas, 15 fichas autorizables (lote D) y 4 reclasificadas pero bloqueadas por identidad, fechas o servicio. Altas autorizables: 1. 0 escrituras. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:** Julian autoriza (o no) el lote D (17 celdas) y, si lo desea, el lote R (2 celdas). La inserción de altas sigue esperando las decisiones de bono y anclaje y las respuestas de BO (§14.5).

### 14.7 Ejecución de los lotes D y R (01/11/2026, 22:06–22:20 UTC; autorizada por Julian a las 22:05)

**Antes de escribir:** releí las 19 celdas y sus dependencias. Las 15 F coincidían carácter por carácter con el respaldo del dry-run. En la 750: AI=45924 y AJ=46289, N igual al de la 824 (DUPLICADO DEPURADO), Q=13-11-26. PAYPAL!7 seguía en CONFIRMADO JM con USD 70 del 13-10-26. AG45 y AG48 seguían con la fórmula ajena, y B45/B48 no estaban vacías. El revisionId del libro había cambiado por ediciones de otros, pero ninguna afectaba a estas celdas, así que no hubo conflicto. Respaldo privado: `s0a/d12/d12_backup_private.json`, `s0a/d12/pre_exec_F.json` y `s0a/lotR_backup.json` (fórmulas anteriores de AG). Una lectura de dependencias trajo de paso I750 (CELULAR, valor «0»); no se guarda.

**Escritura (19 celdas, solo las autorizadas):** F de 639, 641, 729, 734, 735, 736, 738, 742, 743, 744, 746, 747, 748, 750 y 759; AI750=46308 y AJ750=46673; fórmula canónica de CLIENTE_KEY en AG45 y AG48. La escritura de F742:F744 falló una vez («service unavailable»). Releí: no se había aplicado y seguía con el valor original. La reintenté una sola vez y quedó bien. No se insertaron filas, no se tocó ZELLE!64, CONTROL, la intranet ni ningún PR.

**Verificación (relectura completa de BASE y de las tres hojas de origen):**
- F: 15/15 iguales a `PROMOCIÓN — 12 MESES / USD 70 — EXCEPCIÓN COMERCIAL AUTORIZADA POR DIRECCIÓN // ` + texto histórico, intacto.
- 750: R=13-10-26, **S=13-10-27**, E=«Al dia», T=346; **Q (F.VENCIMIENTO) = 13-11-26, sin cambio**; AM=CONFIRMADO JM, AP=HABILITADO.
- AG45/AG48: devuelven la llave del nombre. ZELLE!46 → FILA_BASE 48 y TRANSF!10 → FILA_BASE 45, ambas ENLAZADO con 1 coincidencia. R/S de 45 y 48 sin cambio (14-10/14-11 y 09-10/15-11).
- Diff de BASE completo (antes 21:20 / después 22:20, columnas seguras): 27 cambios. 15 F, 4 en la 750 (AI, AJ, S, E), X45 y X48 (consecuencia de AG; ver hallazgo) y 6 totales por fórmula (861 y 862 en A/J: la 750 pasa de vencida a al día; 1250 J/K). Ningún otro cambio.

**Hallazgo al restaurar AG (no corregido, fuera de alcance):** en las fichas 45 y 48, el bloque **X:AF (9 celdas por fila, 18 en total)** tampoco es el canónico. Es un bloque de ayuda de conciliación de un diseño anterior (X=llave, Y=llave, Z=coincidencias, AA=fuente, AB=fila de origen, AC=fecha, AD=moneda, AE=valor, AF=validación). Son las únicas 2 filas de 1 217 con esa desviación; E, Q:T, AG y AK:AP son canónicas en todas. Efecto: ZELLE!46 y TRANSF!10 ya enlazan, pero leen de BASE un plan basura y muestran VALIDACIÓN «REQUIERE REVISION», sin PROP y con AO vacío. Las fechas de BASE no se afectan (S sale de AJ y es correcta). **Lote R2 propuesto (18 celdas):** copiar las fórmulas canónicas X:AF de la fila 44 a las filas 45 y 48. Efecto previsto: COINCIDE PLAN (1M·1p·15), PROP = pago + 1M y S sin cambio (MAX con AJ). Reversión: fórmulas anteriores guardadas.
- Otros desvíos estructurales vistos en el mismo barrido (sin tocar): fichas con valor manual en lugar de fórmula en Q (342, 367, 525, 652, 727, 760, 1067), R (760, 1067) y S (699, 760, 1066, 1067).

**Segunda conciliación / idempotencia:** volver a aplicar D y R produce **0 cambios** (las 15 F ya empiezan con la nota, AI/AJ de la 750 ya están en su valor y AG45/AG48 ya son canónicas). Para los lotes aplicados quedan 0 pendientes.

**Universo vigente de CONFIRMADO JM: 138** (PAYPAL!15 dejó de estar confirmado)

| Estado | ZELLE | PAYPAL | TRANSF | Total |
| --- | --- | --- | --- | --- |
| YA APLICADO | 84 | 9 | 9 | **102** (9 con tarifa por ratificar) |
| PENDIENTE DE ACTUALIZACIÓN | 0 | 0 | 0 | 0 |
| PENDIENTE DE ALTA | 6 | 1 | 1 | 8 |
| REQUIERE REVISIÓN | 21 | 3 | 4 | 28 |

Movimientos respecto de §13.2 (139: 99/0/8/32): PAYPAL!15 sale del universo; PAYPAL!7 (750) pasa a YA APLICADO hoy; ZELLE!46 y TRANSF!10 pasan a YA APLICADO (enlace reparado por R, pendiente R2 para la columna auxiliar); 14 fichas de 12M·70 quedan con la tarifa validada por Dirección.

**Excepciones residuales:**
- Tarifa por ratificar (9): 749 (4 pantallas), 758 (pantallas), los cuatro de 10 de clientes al día (17, 740, 741, 755), 754, 587 y TRANSF!4 (COP).
- Revisión (28): incluye 756, 760/909, 1087 y 1106 (tarifa resuelta; bloqueadas por identidad, fechas o servicio), las 4 altas candidatas con cuenta nueva, ZELLE!107, ZELLE!112, ZELLE!41, MIRA+ 864 y el resto de §13 D.
- Altas (8): K autorizable = 1 (ZELLE!64), sin aplicar por instrucción.

**ESTADO:** lotes D y R APLICADOS y VALIDADOS (19/19 celdas, relectura e idempotencia). Conciliación de octubre PARCIAL. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:**
- Julian: autorizar o no el lote R2 (18 celdas X:AF en 45 y 48, sin cambio de fechas).
- Dirección: regla del bono +2 y del anclaje de altas; tarifas de 749, 758 y los 10 de clientes al día.
- BO: identidad de 756, 760/909 y 1087; cuentas faltantes de las altas; Q/R/S manuales en las fichas listadas.

### 14.8 Precisión de política promocional (Dirección, 01/11/2026 22:41 UTC): regla documentada y revisión de las 19 excepciones (solo lectura, 0 escrituras)

**Dónde queda la regla:** no existe en el proyecto un documento independiente de reglas comerciales o promociones. Las decisiones de Dirección sobre tarifas están en §14.6, así que la regla se consolida aquí. No se tocaron el contrato operativo S0, el manual financiero ni el CONTEXTO MAESTRO. **La pieza comercial citada por Dirección no está en el proyecto**: las fechas de campaña de la promoción anual y las pantallas de la mensual quedan pendientes de esa pieza.

#### Regla comercial vigente: PROMOCIONES EXCEPCIONALES TIVIPLAY v1 (01/11/2026)

| Atributo | PROMO ANUAL | PROMO MENSUAL (reactivación) |
| --- | --- | --- |
| Importe | USD 70 | USD 10 |
| Plan | PLAN 12 MESES (sin «+k») | 1 mes |
| Duración | 12 meses | 1 mes |
| Pantallas / dispositivos | 3 (según la pieza) | No indicado → pendiente de la pieza |
| Fecha de campaña | No indicada → pendiente de la pieza | Vigente hasta el 31/10/2026 (pago ≤ 31/10/2026) |
| Elegibilidad | Recuperar clientes con **más de 30 días de inactividad** | Reactivar clientes con **más de 30 días de inactividad** |
| Nota en OBSERVACIONES (F) | `PROMOCIÓN — 12 MESES / USD 70 — EXCEPCIÓN COMERCIAL AUTORIZADA POR DIRECCIÓN` | `PROMOCIÓN — REACTIVACIÓN USD 10 — EXCEPCIÓN COMERCIAL AUTORIZADA POR DIRECCIÓN` |

Reglas de aplicación:
1. Las promociones **no reemplazan el catálogo general** (no se toca VALOR_CANONICO ni X:AF).
2. **Inactividad > 30 días** = días entre el último vencimiento de servicio demostrado (F.PRÓX anterior al pago, vencimiento de CONTROL o última cobertura pagada) y la fecha del pago. Si no hay fecha anterior demostrable, la elegibilidad es **NO DEMOSTRADA** (no se presume). El origen «RECONEXIÓN» es un indicio, no una prueba.
3. **No se aplica por coincidencia de importe.** Un pago de 70 o de 10 sin ficha, sin plan/pantallas verificables o sin elegibilidad no es promoción.
4. **CONFIRMADO JM con decisión de Dirección ya registrada:** se preserva la decisión comercial (tarifa validada). La elegibilidad histórica se clasifica aparte: CONFORME, NO CONFORME o NO DEMOSTRADA. No se revierte nada por esa clasificación.
5. Bonificaciones (+1 pantalla, +1 mes, +2) no forman parte de ninguna de las dos promociones; requieren decisión aparte.
6. La conciliación de octubre, los créditos de panel y la integración de intranet siguen separados: esta regla no crea créditos ni cambia contratos de panel.

#### Revisión de las 19 excepciones (evidencia: BASE en vivo 22:20, ZELLE/PAYPAL/TRANSF OCT, CONTROL OCT P1/P2/P3 por USUARIO, CONTROL SEPT por USUARIO, pagos de AGO/SEPT por llave; sin PII ni CONTRASEÑA)

Las 19 cumplen importe, plan y duración. Las 15 del lote D y las 4 bloqueadas tienen 3 pantallas en H, salvo la 1106 (H=1, promo mensual).

| # | Movimiento → ficha | Origen | Evidencia de actividad previa | Inactividad > 30 d | Clasificación |
| --- | --- | --- | --- | --- | --- |
| 1 | ZELLE!6 → 639 | FACTURACIÓN | F: «PAGA 17 SEPT», gestión de cobro 15–21/09; en CONTROL SEPT P3 | ~14 días (17-09 → 01-10) | **NO CONFORME** · decisión de Dirección preservada |
| 2 | ZELLE!24 → 735 | FACTURACIÓN | F: «Notificación pago HOY» 17/09; en CONTROL SEPT P3; renovación anclada al ciclo (17-10-27) | ~18 días (17-09 → 05-10) | **NO CONFORME** · preservada |
| 3 | PAYPAL!7 → 750 | FACTURACIÓN | F.PRÓX anterior 24-09-26 (respaldo D); gestión de cobro en septiembre; en CONTROL SEPT P3 | 19 días (24-09 → 13-10) | **NO CONFORME** · preservada |
| 4 | ZELLE!27 → 738 | FACTURACIÓN | En CONTROL SEPT P1 (cuenta activa en septiembre) | No demostrada (indicio de actividad < 30 d) | **NO DEMOSTRADA** · preservada |
| 5 | ZELLE!39 → 744 | FACTURACIÓN | En CONTROL SEPT P3; CONTROL OCT P3 «sin pagar» 03-10 | No demostrada (indicio de actividad < 30 d) | **NO DEMOSTRADA** · preservada |
| 6 | PAYPAL!3 → 641 | FACTURACIÓN | En CONTROL SEPT P3 | No demostrada (indicio de actividad < 30 d) | **NO DEMOSTRADA** · preservada |
| 7–11 | ZELLE!14→729, !40→743, !51→746, !53→747, !83→759 | FACTURACIÓN | Ficha nueva en S5; sin ficha previa por llave/USUARIO, sin pagos AGO/SEPT, no está en CONTROL SEPT | No demostrada (sin fecha anterior) | **NO DEMOSTRADA** · preservada |
| 12–15 | ZELLE!20→734, !26→736, !37→742, !43→748 | RECONEXIÓN | Ficha nueva en S5; sin historial previo localizable | No demostrada (indicio: origen RECONEXIÓN) | **NO DEMOSTRADA (con indicio)** · preservada |
| 16 | ZELLE!103 → 760/909 | RECONEXIÓN | 909: PLAN 6 MESES vencido, F.PRÓX 22-08-26; F 760: «OUT oferta 70 USD año» (01/09) y «envío imagen promo 70 USD» (27/10) | **66 días** (22-08 → 27-10) | **CONFORME** · sigue bloqueada por identidad 760/909 (BO) |
| 17 | ZELLE!110 → 1087 | RECONEXIÓN | F.PRÓX 01-02-26, ficha en DESACTIVADOS FEB | **271 días** | **CONFORME** · bloqueada (reactivar/trasladar ficha) |
| 18 | ZELLE!96 → 756 | FACTURACIÓN | Identidad inferida; posible ficha previa 1372 (TC0, vencida 16-04-25); F: «12 meses x70 **más 1 pantalla y 1 mes gratis**» | Plausible pero no demostrada (identidad sin confirmar) | **PENDIENTE DE EVIDENCIA** · además la bonificación +1 pantalla/+1 mes no está en la promo |
| 19 | ZELLE!106 → 1106 (USD 10) | FACTURACIÓN | F.PRÓX 19-02-26, ficha en DESACTIVADOS; pago 28-10 (dentro de vigencia ≤ 31/10) | **251 días** | **CONFORME** a la promo mensual · bloqueada (DESACTIVADOS, paga un tercero). Duración ahora definida: 1 mes → PROP F.PRÓX = 28-11-26, sin escribir |

**Resumen:** CONFORMES 3 (760/909, 1087, 1106; las tres bloqueadas por identidad o servicio). NO CONFORMES 3 (639, 735, 750: renovaciones con menos de 20 días de atraso). NO DEMOSTRADAS 12 (3 con indicio de actividad en septiembre, 5 sin historial, 4 con origen RECONEXIÓN). PENDIENTE DE EVIDENCIA 1 (756).

**Fuera de las 19, efecto de la regla:**
- USD 10 de clientes al día (17, 740, 741, 755 y ZELLE!88→5): **no elegibles** a la promo mensual (sin inactividad > 30 d). Siguen como tarifa por ratificar; si Dirección los mantiene, es una decisión de retención, no esta promoción.
- TRANSF!6 (venta de 10, cliente nuevo): no elegible (no es reactivación).
- 749 (4 pantallas): no conforme en pantallas (la promo son 3). 758 (H=2, observación «3 pantallas»): conforme a la pieza si BO corrige H; queda en BO.
- ZELLE!67, TRANSF!12, PAYPAL!12 (70 sin ficha): no se aplica por coincidencia de importe.
- MIRA+ (ZELLE!35, ZELLE!48): fuera del universo TIVIPLAY.

#### Impacto concreto sobre el lote D (aplicado 22:06–22:20)

- **No se revierte nada.** Las 15 fichas tienen CONFIRMADO JM y decisión de Dirección (regla 4). La nota de F registra la promoción aplicada y conserva el historial; no afirma elegibilidad, así que sigue siendo exacta.
- **750:** la fecha (S=13-10-27, pago + 12 meses por pago vencido) no depende de la elegibilidad. Sin cambios.
- **Clasificación de elegibilidad:** queda en este checkpoint, no en BASE. Si Dirección quiere verla en la ficha, el lote opcional **D2** serían 15 celdas F con un sufijo `· ELEGIBILIDAD >30D: NO CONFORME / NO DEMOSTRADA`. **No propuesto para ejecutar** sin autorización específica.
- Los 9 de «tarifa por ratificar» no cambian de número; cambia su motivo (los 10 de clientes al día quedan explícitamente no elegibles).

**ESTADO:** regla IMPLEMENTADA en documentación. Revisión de elegibilidad PARCIAL (12 NO DEMOSTRADAS por falta de fecha anterior). 0 escrituras en BASE. Gate: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION:**
- Julian: aportar la pieza comercial (fecha de campaña de la promo anual y pantallas de la mensual); decidir si quiere el lote D2 (etiqueta de elegibilidad en F) o mantenerla solo en el checkpoint; lote R2 sigue pendiente.
- BO: fecha del último vencimiento antes del pago para las 9 fichas nuevas de S5 (729, 734, 736, 742, 743, 746, 747, 748, 759), o confirmar que eran clientes nuevos; identidad de 756 (¿es la 1372?), 760/909 y 1087.
- Dirección: tratamiento de la bonificación de 756 y de los USD 10 de clientes al día (retención).

## 15. CIERRE DEL CICLO OCTUBRE → BASE GENERAL → NOVIEMBRE · ITERACIÓN 1 (01/11/2026 23:25–00:30 UTC, diagnóstico sin escrituras en Sheets)

**Encargo:** Julian, 01/11 23:24 UTC (gates 1–5 + gobierno GitHub). Esta iteración: leer, calcular, comparar y preparar lotes. **0 escrituras en Sheets, 0 inserciones, 0 merges, 0 despliegues.** Lo único escrito es este checkpoint y su copia saneada en GitHub (PR #8).

**Fuentes leídas (solo columnas necesarias):**
- VENTAS 2026 (Tiviplay) · VENTAS_OCTUBRE: A:D, H, J, L:O, Q:U, W (más E en memoria para descartar homónimos; no se persiste). **K = CONTRASEÑA: no se leyó.** VENTAS_NOVIEMBRE: misma selección.
- GESTION_DIA_PAGOS: ZELLE/PAYPAL/TRANSF (OCT) completas en bloques de datos; BASE GENERAL A, E:N, P:T, X:AA, AG:AQ (sin O); PAGOS NOVIEMBRE 2026 A, R, V, AG:AP; metadatos y formato de PAGOS OCTUBRE / NOVIEMBRE.
- Incidente de lectura: la muestra de formato de PAGOS OCTUBRE 2026 (filas 1–6) trajo de paso C, D y **N (CONTRASEÑA) de 2 filas**. No se copió a ningún archivo ni informe; el volcado temporal se eliminó. Hallazgo de seguridad derivado: **PAGOS OCTUBRE 2026!N contiene contraseñas en claro** (la hoja de noviembre las deja vacías a propósito).

### 15.1 GitHub (estado verificado, nada fusionado)
- `main` @ `b967693` (merge PR #4, 22/10). Rama de continuidad `wo-tivi-hoy-creditos-001` @ `c917e28`.
- PR abiertos: #5 motor seguro (`b75da36`), #6 sync borrador (`900d860`, apilado sobre #5), #7 fix CONTRASEÑA (`376bff3`, **no fusionar**: excluye la letra N, que ahora es USUARIO, y dejaría pasar O), #8 diccionario (`wo-tivi-mapeo-id-001`, documental). #1–#3 ajenos a este ciclo.
- El checkpoint de recepción no estaba versionado: se publica saneado en `08_RUNTIME/` dentro del PR #8 (documental, sin código).

### 15.2 GATE 1 — Fuentes y conciliación de octubre
- **Encabezados confirmados** (Dirección): clasificación de VENTA en ZELLE!F `Origen`, PAYPAL!K `ORIGEN`, TRANSF!I `ORIGEN`. CONFIRMACION en H / M / K; FILA_BASE en K / P / N.
- **Cambios desde §14.7 (22:20):** revisionId del libro de pagos idéntico; 0 cambios en las hojas de medio; en BASE solo la fila de totales 1250 (J/K, volátil). Universo vivo = **138 CONFIRMADO JM** (Z111 · P12 · T15), PAYPAL!15 sigue sin confirmar. No se repitió la conciliación de lo ya validado.
- **VENTAS_OCTUBRE** (fuente comercial, leída por primera vez en este ciclo): 18 filas = 17 TC=1 + 1 FREE (TC=0). La columna W `CONFIRMACION` está vacía en todas: la confirmación vive solo en las hojas de medio (regla B). VENTAS_NOVIEMBRE: 1 venta del 01/11 (noviembre); **ninguna venta de octubre registrada en noviembre**.
- **Correspondencia VENTAS ↔ pagos (por fecha + monto + USUARIO de VENTAS contra BASE!N y CONTROL OCT):** las 16 ventas TC=1 con monto tienen su pago CONFIRMADO JM; la 17.ª (VENTAS!20, reactivación sin monto) corresponde a la ficha 792, ya aplicada en §13.2. Los 10 pagos con origen VENTA tienen su fila en VENTAS. **6 pagos rotulados FACTURACIÓN/RECONEXIÓN son ventas según VENTAS** (TRANSF!8, ZELLE!66, TRANSF!12, PAYPAL!12, ZELLE!96, ZELLE!97).

**Lo que VENTAS resuelve (cambios de clasificación):**

| Pago | VENTAS | Antes (§14.5–14.8) | Ahora |
| --- | --- | --- | --- |
| TRANSF!6 · 10 | !5 · Cliente nuevo **MIRA+** · PANEL 2 · CONTROL P2!7 | Alta TIVIPLAY B (tarifa 10) | **MIRA+** (fuera del universo TIVIPLAY). La cuenta P3!223 que se le atribuía es de otra venta |
| ZELLE!41 · 70 | !4 · Referido · 6M·1p · CONTROL P3!223 (08-10) | Revisión (identidad) | **Alta** · tarifa de catálogo 6M·1p. Homónimo exacto de la ficha 368 (otro USUARIO, 12M al día) → BO: ¿segunda línea o persona distinta? |
| PAYPAL!12 · 70 | !13 · Referido · **6M·1p** · P3!610 | B (promo 70 o 6M) | **Alta de catálogo 6M·1p** (no es promo) |
| TRANSF!8 · 25 | !6 · Referido · 2M·1p · F.PRÓX 10-12-26 | B (anclaje) | **Alta**; VENTAS ancla al pago (10-10) |
| ZELLE!66 · 150 | !8 · Referido · **12M+1 · 4p** | B (bono) | Alta con bono +1 mes y +2 pantallas sobre catálogo 12M·2p → Dirección |
| ZELLE!67 · 70 | !9 · Referido · **6M+1 · 2p** · P3!471 (19-10) | C (sin cuenta) | Cuenta identificada; bono +1 mes y +1 pantalla sobre 6M·1p → Dirección |
| ZELLE!104 · 180 | !18 · **12M+2 · 3p** | B (bono) | Bono +2 registrado comercialmente → Dirección ratifica |
| ZELLE!107 · 110 | !19 · 12M · 3p · P3!687 | C | Cuenta identificada; 110 no es tarifa → Dirección |
| TRANSF!12 · 70 | !11 · **Reactivación · BASE INACTIVOS** · 12M·3p | B (promo 70) | Reactivación: promo anual candidata; BO localiza la ficha histórica (no está en BASE por nombre ni USUARIO) |
| ZELLE!95 · 15 / PAYPAL!8 · 15 | !15 / !10 · 1M·1p · USUARIO en VENTAS | C (sin cuenta) | Cuenta identificada, **sin crédito en CONTROL OCT** → BO confirma activación |
| ZELLE!96 → 756 | !16 · **Reactivación** · 12M+1 · 3p | Pendiente de evidencia (§14.8) | **Identidad confirmada por USUARIO**: es el mismo de la ficha histórica 1372 (TC=0, vencida 16-04-25) → inactividad > 30 d **demostrada** (promo anual CONFORME); queda el bono +1 y la duplicidad 756/1372 |
| ZELLE!64 · 15 | !7 · 1M·1p · F.PRÓX **14-12-26** | A | Sigue lista, con discrepancia: VENTAS registra 2 meses para un plan de 1 mes (catálogo → 14-11-26). No se infiere |

**Universo vivo de octubre (138):**

| Estado | Total | Cambio vs §14.7 |
| --- | --- | --- |
| YA APLICADO | **102** | = |
| PENDIENTE DE ALTA TIVIPLAY (ventas de octubre sin ficha) | **11** | +3 (8 → 11): entran ZELLE!41, ZELLE!66, ZELLE!107, TRANSF!8, TRANSF!12, PAYPAL!12; salen a MIRA+ ZELLE!35, ZELLE!78, TRANSF!6 |
| MIRA+ (ventas, lote aparte) | **3** | nuevo grupo |
| REQUIERE REVISIÓN | **22** | −6 |

Renovaciones/reactivaciones: 102 aplicadas por USUARIO; reactivaciones con ficha histórica: 756↔1372 (USUARIO idéntico), 760↔909, 1087 y 1106 (DESACTIVADOS), TRANSF!12 (histórica por localizar).

### 15.3 GATE 2 — BASE GENERAL, secciones, altas e ID
- **Secciones** (encabezados en B, no leídos por PII; límites por estructura y totales): S1–S4 activos (3–727), **S5 ALTAS OCTUBRE 729–760: 32 fichas, llena** (761 vacía), S6 762–857 (97 fichas), totales 859–862 (90 / 823 / 731 / 92), MIRA+ 864–867 (4), total general 869 = **827** (= 731 + 92 + 4, cuadra), DESACTIVADOS y excepciones desde 871/874 hasta ~1400.
- **Fichas TC 0/1 en la hoja: 1 341** · ESTADO: Al dia 747, Vencido 577, Por vencer 15, `#VALUE!` 1 (ficha 699, TC=0, F.PRÓX manual vacía), vacío 1 (873, fila de total con TC=1).
- **ID (M): 0 de 1 341 fichas pobladas.** No hay correspondencia ID ↔ panel posible todavía; la identidad técnica sigue siendo USUARIO + PANEL.
- **USUARIO repetido: 81 valores** (incluye los marcados DUPLICADO DEPURADO en AQ: 77 marcas). 756↔1372 es nuevo: misma cuenta reactivada con ficha nueva.
- **Anomalía estructural:** A1250 (fila de totales de una sección histórica) devuelve un número absurdo (~2,6e86): suma una columna que no es TC. J/K1250 cambian con el tiempo (volátiles). No afecta S1–S6 ni al motor (TC = «1» exacto).
- **Desvíos ya conocidos (sin tocar):** Q/R/S manuales en 342, 367, 525, 652, 699, 727, 760, 1066, 1067; X:AF ajeno en 45/48.
- **Lote R2 (sigue vigente, re-verificado en vivo):** X45:AF45 y X48:AF48 contienen nombre/método en lugar del catálogo; ZELLE!46 y TRANSF!10 siguen ENLAZADO pero «REQUIERE REVISION» sin PROP. Acción propuesta sin cambios: copiar X:AF canónico de la fila 44 (18 celdas). No mueve fechas.

**Lote único propuesto: altas de octubre + consolidación (NO ejecutado).**

| Fase | Contenido | Condición |
| --- | --- | --- |
| 0 · R2 | 18 fórmulas X:AF en 45/48 | Autorización R2 |
| 1 · Inserción | Una sola inserción de **K filas antes de la 760** (S5), con fórmulas copiadas de la 759 | K = altas aprobadas |
| 1a · listas con una regla | ZELLE!64 (1M·1p·15 · AI 46309 → AJ 46340), TRANSF!8 (2M·1p·25 · 46305 → 46366), PAYPAL!12 (6M·1p·70 · 46319 → 46501) | Dirección confirma **fecha de alta = fecha de pago + duración de catálogo** (coincide con VENTAS) y que el 14-12 de VENTAS!7 no es un bono |
| 1b · con decisión tarifaria | ZELLE!66, ZELLE!67, ZELLE!104, ZELLE!107, TRANSF!12 | Dirección: bonos/tarifa (D2) y promo de reactivación (D3) |
| 1c · con dato de BO | ZELLE!41 (homónimo 368), ZELLE!95 y PAYPAL!8 (sin crédito en CONTROL) | BO |
| 2 · Consolidación | Al cerrar el ciclo, las 32 + K altas de S5 pasan a CLIENTES AL DÍA (S1, orden por F.PRÓX ascendente, DEC-2026-10-28-021) conservando mes/origen de venta, referencia del pago, CONFIRMADO JM, USUARIO, PANEL, plan, pantallas y fechas en F | Autorización expresa de traslado (D5) |

Datos por fila nueva: TC 1, B (copiado del pago, con TRIM), G/H/J/L de VENTAS validado, N = USUARIO de VENTAS, P = PANEL de VENTAS, AH = F.VENC de CONTROL, AI/AJ según la regla aprobada, F = `ALTA OCT 2026 · VENTAS_OCTUBRE!r · <HOJA>!fila · CONFIRMADO JM`. M (ID) vacío hasta que BO lo aporte. Comprobaciones previas, respaldo, diff y reversión: las de §14.5 (una sola inserción; reversión = borrar las K filas). **Conflicto conocido:** cada inserción desplaza FILA_BASE y las filas ≥ 760 citadas en este checkpoint; la hoja de noviembre se regenera después, no antes.

### 15.4 GATE 3 — Motor noviembre (solo lectura)
- Código: `05_AUTOMATION/tiviplay-monthly-close-v1` del PR #5 (`b75da36`), en memoria. **Tests 22/22.** Entrada: BASE filas 1–869 por encabezado, CLIENTE sustituido por CLIENTE_KEY, sin O.
- **Corte explícito 2026-11-01.** Dos corridas: `outputSignature e0b368b972bf…` idéntica (repetible); `signature 01657d9aedde…`.
- **Resultado:** universo **98** · semanas **8 / 25 / 20 / 29 / 16** · FACTURAR_CANDIDATO 91 · REQUIERE_REVISION 7 (mes gratis 2, no renovación 4, excepción explícita 1) · **0 duplicados** · 1 excepción (760, F.PRÓX vacía) · cartera **90** (OCT 46, SEP 42, JUL 2).
- **Comparación fila a fila con «PAGOS NOVIEMBRE 2026» (corte 29/10, 101 · 9/27/20/30/15):** 98 coinciden; **solo en la hoja: 11, 23 y 30** (renovaron y se aplicaron el 01/11 en §13.2: F.PRÓX 2027, salen del universo con razón); **solo en el motor: 0**; **cambio de semana: 76** (24-11 → 27-11, anclaje al ciclo de §13.1; S4 → S5). Cartera: 90 en el motor frente a 92 «PENDIENTE (CARTERA)» en la hoja (la 750 y otras pagaron después del corte).
- **Omisiones estructurales:** las altas de octubre aún sin ficha no pueden estar en el universo. Con la regla 1a, ZELLE!64 (14-11), y si BO confirma, ZELLE!95 (25-11) y PAYPAL!8 (16-11) **vencen en noviembre** y faltan hoy en la hoja.
- **Columnas del equipo AM:AP:** AM con valores iniciales (PENDIENTE 68, EN REVISIÓN 30, BLOQUEADO 3, YA PAGÓ 4, CARTERA 92); **AN:AP sin ninguna gestión registrada** → regenerar no borra trabajo del equipo; la regla de conservar por ID_BORRADOR sigue vigente.
- **Cambio detectado en la hoja:** la pestaña gid 1270065975 ya se llama «PAGOS NOVIEMBRE 2026» (sin «- BORRADOR»), pero su título interno sigue diciendo «BORRADOR · CORTE 2026-10-29». Hay que alinear nombre y contenido en la regeneración.
- **Estado:** motor **DISPONIBLE** para simular noviembre; **no definitivo** hasta insertar las altas (fase 1) y regenerar con corte nuevo.

### 15.5 GATE 4 — Equivalencia PAGOS OCTUBRE 2026 ↔ PAGOS NOVIEMBRE 2026

| Elemento | OCTUBRE | NOVIEMBRE | Juicio |
| --- | --- | --- | --- |
| Encabezados A:AF | 32 columnas | 32 idénticas en nombre y orden | Equivalente |
| Columnas extra | AG:AL estado financiero y PROP_* (hasta 131 col.) | AG:AL semana, clasificación, causa, responsable, ID; AM:AP equipo | Mejora justificada |
| Bloques por semana | «SEMANA 1 · 01–04 …» | Igual (S1–S5 + totales) | Equivalente |
| Filas fijas / columnas fijas | 3 / 0 | 3 / 2 | Mejora |
| Color de encabezado | Azul oscuro (fila 3) | Blanco (4 celdas amarillas) | **No equivalente** |
| Formato condicional / bandas | 4 / 9 | 0 / 0 | **No equivalente** |
| Anchos de columna | 28 personalizados | Todos por defecto | **No equivalente** |
| Validación de datos | G (PLAN), L (MÉTODO), O (PANEL) con lista | Ninguna | **No equivalente** |
| Formato número | TC/USD `#,##0`, COP `[$ $]#,##0` | Sin formato numérico en J/K | **No equivalente** |
| Fechas | Mezcla `yyyy-mm-dd` / `dd-mm-yy` (como BASE) | Igual mezcla | Equivalente (heredado) |
| Filtros / protecciones | Ninguno | Ninguno | Equivalente (ambos sin protección) |
| PII / secreto | C, D, I y **N (CONTRASEÑA) pobladas** | C, D, F, I, N, T, U vacías a propósito | Noviembre es más seguro; octubre expone contraseñas |

Diff de presentación propuesto (no aplicado, requiere aprobación): copiar a noviembre el formato de encabezado, anchos, bandas, formatos condicionales, formato numérico J/K y las 3 validaciones de octubre, sin tocar datos ni AM:AP.

### 15.6 GATE 5 — Intranet (preparación, sin código)
- Leer BASE y la hoja del mes **por encabezado** (diccionario §5.5 del CONTEXTO MAESTRO), excluyendo por nombre «CONTRASEÑA» en BASE, VENTAS (K), CONTROL (E) y PAGOS (N).
- Bloqueos de código ya documentados: `readBaseLive` por índices (lee O como panel, P0); PR #7 (excluye N); rangos del motor `A1:W5000` y del sync `A1:Z1500` cortos.
- Consumo previsto: la intranet muestra el resultado del motor (firma + corte) y la hoja del mes; no recalcula reglas. Permisos por rol: lectura para equipo, escritura solo AM:AP. Nada se despliega ni se fusiona hasta cerrar gates 2–3.

### 15.7 Bloqueos (solo los que impiden el siguiente paso)
1. **Regla de fecha de alta** (pago vs activación) sin confirmar → impide insertar las 3 altas listas.
2. **R2 sin autorizar** → ZELLE!46 y TRANSF!10 siguen en revisión (no bloquea la inserción).
3. Para el motor definitivo: la inserción de altas (fase 1) debe ocurrir antes de regenerar noviembre.

### 15.8 Decisiones para Dirección
- **D1 · Fecha de alta:** (a) fecha de pago + duración de catálogo, como registra VENTAS (recomendada) · (b) fecha de activación en CONTROL (+1 a +3 días).
- **D2 · Ventas con bono o tarifa fuera de catálogo** (ZELLE!66 150 → 12M+1·4p; ZELLE!67 70 → 6M+1·2p; ZELLE!104 180 → 12M+2·3p; ZELLE!107 110 → 12M·3p; 756 bono +1): (a) ratificar lo registrado en VENTAS caso por caso · (b) aplicar catálogo y tratar el bono como excepción aparte.
- **D3 · TRANSF!12** (reactivación BASE INACTIVOS 12M·3p·70): aplicar promo anual cuando BO identifique la ficha histórica (recomendada) · tratar como alta nueva.
- **D4 · 756 / 1372** (misma cuenta): conservar la 756 vigente y marcar la 1372 como histórica con referencia (recomendada) · trasladar la 1372 y borrar la 756.
- **D5 · Consolidación S5 → S1:** en la misma ventana que la inserción · después de regenerar noviembre (recomendada, menos movimiento de FILA_BASE durante el cobro).
- **D6 · Seguridad:** vaciar PAGOS OCTUBRE 2026!N (contraseñas) con respaldo privado.

**ESTADO:** Gate 1 VALIDADO (138 · 102/11/3/22). Gate 2 PARCIAL (estructura verificada; lote preparado; R2 y altas sin autorizar). Gate 3 DISPONIBLE, no definitivo. Gate 4 PARCIAL (funcional sí, visual no). Gate 5 PREPARADO. Gate global: **NO APTO PARA MOTOR MENSUAL**.

**NEXT ACTION (única):** Dirección confirma D1 (fecha de alta = pago + catálogo) para autorizar la inserción única de las 3 altas listas (ZELLE!64, TRANSF!8, PAYPAL!12) junto con R2.
