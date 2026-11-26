# CHECKPOINT S5 — Conciliación de servicio TiviPlay (corte 27/10/2026)

**Estado:** IMPLEMENTADO en fuente y en código. La ejecución humana de las decisiones y liberaciones sigue pendiente.
**Evidencia saneada:** este documento solo tiene conteos, sin clientes, usuarios ni credenciales. El detalle por servicio vive en `data/private/tiviplay/conciliacion-servicio.json` (fuera de Git) y en los registros entregados a Dirección.

## 1. Arquitectura vigente

```
PANELES REALES (snapshot P1/P2/P3)
→ corrección automática de datos objetivos en BASE/CONTROL (preservando fórmulas)
→ detección de excepciones
→ decisión en intranet (/operaciones/tiviplay/conciliacion, Gerencia)
→ cola de sincronización BASE (validada por relectura)
→ tarea LIBERAR [PANEL] — [USERNAME] por línea residual (cola del Asesor)
→ Asesor: EJECUTADO / NO SE PUEDE
→ línea DISPONIBLE
→ servicio consolidado
```

## 2. Escrituras ejecutadas y validadas por relectura

| Fuente | Campo | Celdas | Regla |
|---|---|---:|---|
| BASE GENERAL | `AP` `CONCILIACION_SERVICIO_27OCT` (columna nueva, solo marca) | 79 + encabezado | Duplicado con el mismo USUARIO y el mismo CLIENTE: se marca «conservar fila X». **No se borra ninguna fila.** |
| BASE GENERAL | `O` PANEL | 65 | Línea única en los paneles: se registra el panel real. |
| BASE GENERAL | F.VENCIMIENTO | 177 | Fecha de una línea única y mayor que la de BASE. Nunca retrocede. Se escribe en `AG` cuando `P` es fórmula (`P` = f(AG, CONTROL, CONFIRMADO JM)); en `P` solo donde es un valor fijo. |
| CONTROL (OCT) P1 | `L` OBSERVACIÓN | 4 | El crédito está programado en P1 para una línea que no existe allí: se anota «EJECUTAR EN PANEL 3». El crédito no se toca. |

Los multipanel no se escriben en BASE hasta que Gerencia decida (criterio de Dirección del 27/10).

Integridad verificada: las fórmulas de `P` se mantienen; 0 diferencias inesperadas en la relectura.

## 3. Excepciones en intranet (dataset privado)

- **Decisiones de Gerencia:** 428 en total.
  - 407 multipanel (347 con línea activa, 60 vencidos).
  - 6 en que el panel excede el crédito registrado.
  - 8 con F.VENC de BASE sin respaldo.
  - 7 de identidad compartida.
- **Cola del Asesor, inicial:** 44 tareas.
  - 30 altas en BASE.
  - 7 credenciales (el sistema no transcribe contraseñas).
  - 2 créditos por aplicar.
  - 5 servicios por localizar.
  - Las tareas LIBERAR se generan con cada decisión.
- **Estado operacional del corte:** 373 ACTIVO, 1.203 INACTIVO, 400 EXCEPCIÓN. Un multipanel consolidado pasa a ACTIVO.

## 4. Reglas de la intranet

- **Decisión:** la toma solo ADMIN. Queda append-only y bloqueada. Para cambiarla hay que registrar una corrección que referencie la decisión vigente e incluya el motivo. No se acepta corrección si ya se liberaron líneas.
- **Tareas:** las reporta OPERADOR o ADMIN, también append-only. NO SE PUEDE exige motivo; EJECUTADO cierra la tarea.
- **Cola BASE:** la intranet lee Sheets en solo lectura. Los cambios exigidos por las decisiones se escriben en la fuente (Back Office/sistema) y figuran como aplicados únicamente cuando la relectura viva coincide.

## 5. Requisito P0 de gobierno de datos (noviembre)

**`PANEL + LINE_ID` es la identidad técnica persistente de la línea.** USERNAME y PASSWORD son atributos mutables.

Requisitos:
- Los próximos snapshots de P1/P2/P3 deben conservar obligatoriamente el ID original de cada línea.
- El dataset de conciliación ya registra `lineId` en cada línea y en cada tarea LIBERAR.

Hallazgo: en el snapshot del corte, la «Last Connection» de P3 está congelada alrededor del 25/06/2026. No se usa como evidencia.

## NEXT ACTION

Que Gerencia resuelva en la intranet los casos multipanel activos, empezando por los que tienen propuesta del sistema. Después, el sistema aplica la cola BASE y la valida por relectura, y el Asesor ejecuta las tareas LIBERAR.

## Fase 1 — circuito operacional (27/10/2026, noche)

- **Semáforo BASE (columna E):** sin cambio. `E = Al dia (T ≥ 30) / Por vencer (1–29) / Vencido (≤ 0)` con `T = F.PRÓXIMO PAGO − hoy` es la semántica comercial documentada (S0, Contexto Maestro, manual financiero). El color lo da el formato condicional de texto `Por vencer` (ámbar). Un servicio ACTIVO con próximo pago en 25 días es POR VENCER: estado comercial, no de servicio. **Superado el 28/10/2026:** Dirección aprobó `> 5 Al dia · 1–5 Por vencer · ≤ 0 Vencido` (DEC-2026-10-28-020); las 1605 fórmulas de E se actualizaron y la fila completa se colorea por E.
- **Cola operacional:** la cola existente se agrupa por tipo de tarea (LIBERAR primero). La tarea LIBERAR muestra USERNAME, panel a liberar, LINE_ID, panel a conservar, acción exacta, resultado esperado y estado.
- **USUARIOS LIBERADOS:** se reutiliza la hoja existente del libro VENTAS 2026 (B ASESOR · C USUARIO · D CONTRASEÑA · E PANEL · F FECHA · G ESTADO; se usa H para LINE_ID). La tarea trae la fila preparada (copiar sin contraseña) y la intranet verifica por relectura si ya está registrada (PANEL + LINE_ID; sin LINE_ID, USUARIO + FECHA). La columna D nunca se lee. La línea solo es DISPONIBLE en la intranet tras EJECUTADO.

## Cierre técnico BASE GENERAL (28/10/2026)

**Estado:** `VALIDADO — ESTRUCTURA BASE GENERAL + CONSOLIDADOS` (DEC-2026-10-28-021/022; contrato en Contexto Maestro §5.5).

| Indicador | Valor al cierre |
| --- | --- |
| S1 Al dia / Por vencer | 724 fichas (717 / 7), orden `F. PRÓXIMO PAGO` ascendente sin inversiones |
| S5 Altas del mes | 32 fichas (29 Al dia, 1 Por vencer, 2 Vencido) |
| S6 Vencidos | 97 fichas, más reciente primero; la ficha sin fecha queda al final |
| TOTAL TIVIPLAY / ACTIVOS / VENCIDOS | 823 / 731 / 92 |
| TOTAL MIRA+ / TOTAL GENERAL | 4 / 827 |
| Referencias `FILA_BASE` | 251/251 con llave coincidente |
| Caso de control | Sin cambios de datos |

**Entrada del gate financiero — `HALLAZGO — AUDITORÍA FINANCIERA`:**
1. ZELLE (SEPT) fila 62 → BASE fila 872 (bloque «ventas en excepción», TC = 0): USD 82, 08/09/2026, CONFIRMADO JM, venta con identidad pendiente (usuario y correo compartidos con otra ficha).
2. ZELLE (SEPT) fila 142 → BASE fila 654 (TC = 0): USD 72, 27/09/2026, CONFIRMADO JM, servicio ADD-ON.

Ambos pagos están confirmados, pero su ficha tiene TC = 0, así que no entran en totales que suman TC. No se cambió TC ni dato financiero.

**REQUIERE DECISIÓN (no bloquea):** la ficha «Al dia» del historial DESACTIVADOS (celda `T` con texto) y la ficha duplicada TC = 0 de S6 sin `F. PRÓXIMO PAGO`.

**NEXT ACTION (cumplida 28/10/2026):** auditoría financiera final → resultado abajo.

## Gate financiero final octubre 2026 (28/10/2026)

**Resultado:** `NO APTO PARA MOTOR MENSUAL` (DEC-2026-10-28-023). El motor es técnicamente estable: la simulación en memoria para noviembre da 100 fichas, 0 duplicados y 0 fechas inválidas. Pero hay pagos de octubre que cambian ese universo y no están reflejados en `F. PRÓXIMO PAGO`.

**Universo auditado:** 130 operaciones de octubre (ZELLE 101 · PAYPAL 14 · TRANSF 15). 117 CONFIRMADO JM, 10 pendientes de confirmación o revisión y 3 facturas PayPal sin cobro. Además: PAGOS OCTUBRE 2026 (148 fichas), CONTROL (OCT) P1/P2/P3 (782 filas de ciclo) y los pagos de junio a septiembre como trazabilidad.

**Trazabilidad de los 117 confirmados:** 60 correctos (enlazados y con `F. PRÓXIMO PAGO` igual o posterior a la propuesta del pago); 47 incompletos (tarifa pendiente con fecha coherente, sin ficha enlazable o con dos fichas candidatas); 10 inconsistentes (la fecha de BASE contradice el pago confirmado).

**Bloqueadores P0 (cambian el universo de noviembre):**
1. Cinco fichas con plan de 1 mes pagado en octubre siguen con `F. PRÓXIMO PAGO` en octubre (filas BASE 5, 770, 771, 786 y 802): quedarían fuera de PAGOS NOVIEMBRE. Causa: tarifa del pago sin validar (3 en COP o con monto menor que el del plan) o el pago tiene dos fichas candidatas.
2. Una ficha (fila 21) pagó plan anual el 17/10, pero `F. PRÓXIMO PAGO` sigue en noviembre: se le cobraría.
3. Dos pagos pendientes de CONFIRMADO JM cambian la pertenencia a noviembre según la decisión (ZELLE (OCT) filas 101 y 102).
4. Cuatro ventas de octubre confirmadas, de 1 mes, sin ficha en BASE GENERAL (ZELLE (OCT) 64 y 95, PAYPAL (OCT) 8, TRANSF (OCT) 6): no entrarían en noviembre.

**Excepciones «Decisión de Dirección»:** 194 ítems / 186 excepciones, reprocesados:

| Categoría | Excepciones (ítems) | Contenido |
| --- | --- | --- |
| A · Determinístico | 99 (100) | Cobertura explicada por un pago registrado; duplicado con una sola ficha operativa o ficha ADD-ON; extensión con cobertura financiera vigente |
| B · Acción operativa | 35 (35) | Altas pendientes de BASE (18); tareas de crédito en el panel equivocado, con panel real ya fijado por la conciliación del 27/10 (17) |
| C · Dato inconsistente | 29 (35) | USUARIO a un carácter de una ficha de BASE (13); cobertura sin pago que la explique (9); reactivación o ficha duplicada (7) |
| D · Decisión real de Dirección | 23 (24) | Tarifa distinta de la del plan (6); dos fichas operativas distintas con el mismo USUARIO (12); extensión sin crédito ni cobertura (5) |

**Categorías amarillas:** Pago / cobertura 26 (16 créditos ejecutados sin habilitación financiera: riesgo de cobro, no del motor); Crédito por ejecutar 23 (19 programados a futuro, operativo); F.VENCIMIENTO en CONTROL 73 (72 de CONTROL (OCT) P1, que registra en `FECHA` la fecha de vencimiento: dato); Propagación a BASE 41 (back office; 5 están en el universo de noviembre); Plan en BASE 0. Antes y después de la corrección, los mismos valores.

**No críticos:** los dos pagos TC = 0 de septiembre vencen en abril y octubre de 2027 (sin efecto en octubre ni noviembre; el ADD-ON con TC = 0 es la representación habitual de los ADD-ON); la ficha S5 sin `F. PRÓXIMO PAGO` (el motor la omite sin reportarla); las filas 45 y 48 tienen en `W:AF` un bloque de fórmulas ajeno, del que depende la regla visual `CONFIRMADO JM` (REQUIERE DECISIÓN); el falso «Al dia» del historial ya no cuenta como activo en la intranet (735 → 734).

**NEXT ACTION:** resolver los 4 bloqueadores P0 y repetir la simulación del motor para noviembre; con universo estable → `EJECUTAR MOTOR MENSUAL → CIERRE OCTUBRE → GENERAR PAGOS NOVIEMBRE → AUDITAR RESULTADO`.
