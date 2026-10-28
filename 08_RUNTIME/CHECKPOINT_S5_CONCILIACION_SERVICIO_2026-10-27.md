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
