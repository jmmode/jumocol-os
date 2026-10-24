# TIVIPLAY --- CONTRATO OPERATIVO S0

**Versión vigente:** 0.3 --- consolidada el 24 de octubre de 2026\
**Versión de origen:** 0.2 --- 28 de septiembre de 2026 (este archivo
nació como v0.2 y conserva su nombre para preservar continuidad)\
**Estado:** VIGENTE --- S0 v0.3 reconocido por Dirección (JM) como
contrato vigente para consolidación documental el 24/10/2026
(DEC-2026-10-24-018). Diseño A--F aprobado y sin rediseño; validación
operacional PARCIAL.\
**Gate activo:** S0 --- Baseline y Backlog

> **Qué agrega v0.3 sobre v0.2:** terminología `CONFIRMADO JM`
> (§2), separaciones obligatorias (§2), tipo de ciclo y `ALTA PENDIENTE`
> (§3), ruta provisional de RECONEXIÓN (§3), habilitación financiera de
> la tarea de servicio, Casos A/B (§7.1), y evidencia del 24/10/2026
> (§10). La autorización es exclusivamente documental: no autoriza
> cambios de código, motor, fórmulas, Google Sheets, despliegues ni
> automatizaciones.

## 1. Arquitectura operacional vigente

Desde septiembre de 2026, `GESTION_GENERAL (TIVIPLAY)` queda fuera del
flujo operacional activo y se conserva como referencia histórica.

Flujo vigente:

`VENTAS 2026 (Tiviplay)` → `GESTION_DIA_PAGOS_2026_TIVIPLAY` →
`TIVIPLAY_FORMATO_GESTION_OPERATIVA`

Roles:

-   `VENTAS_SEPTIEMBRE`: origen comercial de altas, referidos y
    reactivaciones. (v0.3: el mismo rol aplica a la hoja de ventas de
    cada mes. La estructura viva y la semántica exacta de las hojas de
    octubre ---ventas del mes y pendientes del mes--- son REQUIERE
    EVIDENCIA; ninguna posición de columna es contrato.)
-   `BASE GENERAL`: universo operacional recurrente.
-   `PAGOS [MES]`: cartera mensual.
-   `ZELLE / PAYPAL / TRANSF`: evidencia y validación financiera.
-   `CONTROL P1/P2/P3`: evidencia de renovación técnica.
-   `APERTURA_OPERACION / CIERRE_OPERACION`: continuidad diaria.
-   `DASHBOARD_360`: ciclos, metas, recaudo, cumplimiento e incentivos.

## 2. Reglas transversales

### Estado temporal

`F.PRÓXIMO PAGO` gobierna la cuenta regresiva `T`:

-   `T >= 30` → AL DIA
-   `T 1–29` → POR VENCER
-   `T <= 0` → VENCIDO

`ESTADO` no equivale a confirmación financiera. Un cliente puede estar
`AL DIA` y simultáneamente `PENDIENTE CONFIRMACIÓN`.

### Fechas

-   `F.PRÓXIMO PAGO`: gobierna cobro y ciclo comercial.
-   `F.VENCIMIENTO`: gobierna renovación técnica del servicio.

### Confirmación financiera

El asesor puede recibir comprobantes y registrar
`PENDIENTE CONFIRMACIÓN`.

Solo Julián puede validar el ingreso real y convertirlo en
`PAGO CONFIRMADO`.

v0.3: en las hojas de medio de pago y en `PAGOS [MES]` ese estado se
registra como `CONFIRMADO JM`. `PAGO CONFIRMADO` y `CONFIRMADO JM` son
el mismo concepto. Solo Dirección (JM) lo asigna.

### Separaciones obligatorias (v0.3)

-   `ORIGEN COMERCIAL ≠ ESTADO DEL CICLO`
-   `ESTADO ≠ CONFIRMACIÓN FINANCIERA`
-   `CONFIRMADO JM ≠ ALTA AUTOMÁTICA`
-   `CONFIRMADO JM ≠ SERVICIO RENOVADO`
-   `F.PRÓXIMO PAGO ≠ F.VENCIMIENTO`
-   `F.VENCIMIENTO ≠ CRÉDITO AUTORIZADO`
-   `CONTROL ≠ BASE GENERAL ACTUALIZADA`
-   `HABILITADO PARA ACTUALIZAR BASE ≠ BASE ACTUALIZADA`
-   `VENCIDO ≠ BAJA` (no pago no equivale automáticamente a baja; el
    criterio de BAJA es REQUIERE DECISIÓN)

------------------------------------------------------------------------

# 3. S0-A --- VENTA → BASE GENERAL

## Contrato aprobado

Una venta válida requiere:

-   `TC=1`;
-   pago `CONFIRMADO` por Julián;
-   datos completos y correctos;
-   identidad validada;
-   ausencia de duplicidad ambigua.

Campos mínimos:

**Comercial:** cliente, teléfono, correo, plan, pantallas, valor,
método, F.ULTIMO PAGO y F.PRÓXIMO PAGO.\
**Servicio:** usuario, contraseña, panel, F.VENCIMIENTO y dispositivo
cuando aplique.

Una fila incompleta no clasifica como venta válida ni genera comisión.

Identidad/duplicados:

`USUARIO + CLIENTE + TELÉFONO/CORREO + PANEL`

Resultado:

-   NUEVO → crear.
-   EXISTENTE → actualizar.
-   AMBIGUO/DUPLICADO → Back Office.

Estado actual: incorporación principalmente al final del mes; función
históricamente de Back Office, ejecutada en 2026 principalmente por
Julián y durante un periodo por Jorge.

Objetivo:

`venta válida → Julián confirma ingreso → validación automática → alta/actualización automática en BASE GENERAL → excepción a Back Office`

### Gate S0-A

`TC=1 + datos completos + CONFIRMADO + identidad válida + paridad + trazabilidad = transición cerrada`

### Tipo de ciclo (v0.3)

Todo evento se clasifica en un tipo de ciclo antes de evaluar
identidad. El tipo no reemplaza `AL DIA / POR VENCER / VENCIDO`.

| Tipo | Origen | Ruta | Estado del gate |
|---|---|---|---|
| ALTA | Venta: Cliente nuevo / Referido | Gate S0-A → crear en `BASE GENERAL` | Diseño vigente (S0-A) |
| RECURRENTE | `BASE GENERAL` por `F.PRÓXIMO PAGO` | S0-B → S0-F | Diseño vigente |
| RECONEXIÓN | Venta: Reconexión (cliente histórico o existente) | Provisional: `EXISTENTE → ACTUALIZAR / REACTIVAR`; no es alta nueva | REQUIERE DECISIÓN (detalle del gate) |

**`ALTA PENDIENTE`.** Una venta de tipo ALTA registrada cuyo cliente
todavía no está en `BASE GENERAL` es `ALTA PENDIENTE`, no un error de
enlace. `SIN BASE` en la capa financiera de un evento ALTA no se
interpreta automáticamente como anomalía. La creación en `BASE GENERAL`
sigue exigiendo todos los requisitos del Gate S0-A. `CONFIRMADO JM`
no produce el alta automáticamente.

------------------------------------------------------------------------

# 4. S0-B --- BASE GENERAL → PAGOS DEL MES

`F.PRÓXIMO PAGO` gobierna la inclusión comercial.

Antes de incorporar se clasifica el ciclo:

-   FACTURAR
-   MES GRATIS / REFERIDO
-   DESACTIVADO
-   PENDIENTE DE PAGO
-   PLAN / ACUERDO ESPECIAL
-   EXCEPCIÓN

Esta clasificación no reemplaza `AL DIA / POR VENCER / VENCIDO`.

Al cierre del mes anterior:

1.  tomar corte gobernado de BASE GENERAL;
2.  aplicar reglas;
3.  generar `PAGOS [MES+1]`;
4.  preservar universo inicial;
5.  registrar movimientos posteriores al corte.

Back Office/sistema valida universo, fechas, planes, duplicados, campos
y excepciones. Julián interviene solo en decisiones críticas.

Evidencia del corte:

`fecha/hora + universo + incluidos + excluidos + excepciones + valor esperado + ejecutor + validaciones`

### Incentivos

`DASHBOARD_360` debe derivarse del mismo dato operacional.

Solo suma al cumplimiento:

`PAGO CONFIRMADO por Julián + cliente + fecha + valor + moneda + ciclo correctamente atribuidos`

Ambigüedad → `REQUIERE REVISIÓN`.

### Gate S0-B

`corte reproducible + clasificación + PAGOS [MES] consistente + conteos + valor esperado + excepciones + ciclos/metas = transición cerrada`

------------------------------------------------------------------------

# 5. S0-C --- PAGOS DEL MES → GESTIÓN DEL ASESOR

## Asignación

Objetivo: asignación diaria automática usando:

`F.PRÓXIMO PAGO + T + ESTADO + pendientes + excepciones + carga`

Cada cliente tiene un responsable inequívoco.

## Workflow de cobro

El Manual de Cobro define la secuencia:

-   Día -5: WhatsApp + beneficio.
-   Día -4: llamada.
-   Día -3: imagen.
-   Día -2: link/datos de pago.
-   Día -1: alerta.
-   Día 0: retención.

La convención exacta de `T` debe verificarse antes de implementar.

## Registro de gestión

Cada interacción genera evento independiente:

`cliente + asesor + fecha/hora + etapa/T + canal + acción + resultado + próxima acción + evidencia`

`PAGOS [MES]` conserva el estado consolidado.

## Catálogo objetivo octubre

-   NO CONTESTA
-   PENDIENTE PAGO
-   COMPROMISO DE PAGO
-   COMPROBANTE RECIBIDO
-   PENDIENTE CONFIRMACIÓN
-   PAGO CONFIRMADO
-   NO RENUEVA
-   CAMBIO DE PLAN
-   REFERIDO / MES GRATIS
-   REQUIERE SOPORTE
-   REQUIERE BACK OFFICE
-   EXCEPCIÓN

El asesor puede registrar `PENDIENTE CONFIRMACIÓN`. `PAGO CONFIRMADO`
solo puede provenir de Julián.

Cada resultado dispara siguiente acción.

Debe distinguirse gestión proactiva de pago iniciado espontáneamente por
el cliente.

### Gate S0-C

Cada interacción se cierra individualmente; el caso sigue abierto hasta
estado terminal, transferencia de responsable o próxima acción
programada.

------------------------------------------------------------------------

# 6. S0-D --- GESTIÓN → PAGO → EVIDENCIA

Entrada a validación:

`comprobante + cliente + método + valor + fecha + ciclo → PENDIENTE CONFIRMACIÓN`

El comprobante debe quedar vinculado al registro y no depender
exclusivamente de WhatsApp.

Julián valida en la fuente financiera:

-   ingreso real;
-   cliente/asociación;
-   método;
-   valor;
-   fecha.

Coincide → `PAGO CONFIRMADO`.\
No coincide → `REQUIERE REVISIÓN`.

Diferencias:

-   PAGO PARCIAL
-   PAGO SUPERIOR
-   COMISIÓN DEL MEDIO
-   DIFERENCIA DE MONEDA
-   VALOR NO IDENTIFICADO

Toda diferencia dispara:

`alerta → verificación → corrección → revalidación`

Ownership:

-   dato comercial/comprobante → asesor;
-   base → Back Office;
-   validación financiera → Julián;
-   origen incierto → REQUIERE DECISIÓN.

`PAGO CONFIRMADO` dispara la tarea de servicio; no cierra todavía el
cliente.

### Gate S0-D

`evidencia vinculada + identidad + método + valor + fecha + ingreso verificado + CONFIRMADO + actor/timestamp + diferencias resueltas + tarea de servicio = etapa cerrada`

------------------------------------------------------------------------

# 7. S0-E --- PAGO CONFIRMADO → SERVICIO → ACTUALIZACIÓN

Actualmente el asesor ejecuta la renovación técnica diariamente,
normalmente un día antes de `F.VENCIMIENTO`.

Objetivo:

`F.VENCIMIENTO - 1 → tarea automática de servicio`

La tarea puede generarse por fecha, pero solo se autoriza con:

`PAGO CONFIRMADO`

o excepción aprobada: mes gratis, promoción, extensión u otra regla
autorizada.

Después de renovar debe registrarse:

`cliente + usuario + panel + recarga/plan + créditos + fecha/hora + F.VENCIMIENTO anterior + nueva F.VENCIMIENTO + ejecutor + resultado`

Las hojas `CONTROL P1/P2/P3` son evidencia operacional de las
renovaciones.

## 7.1 Habilitación financiera de la tarea de servicio --- Casos A/B (v0.3)

`NECESIDAD TÉCNICA + HABILITACIÓN FINANCIERA + IDENTIDAD INEQUÍVOCA = CRÉDITO EJECUTABLE`

**Identidad inequívoca (previa a ambos casos):** el `USUARIO` de la
fila de CONTROL aparece exactamente una vez en `BASE GENERAL` y el
panel de esa fila no contradice el panel registrado en `BASE GENERAL`.
Si no se cumple, o si `BASE GENERAL` o las hojas de pago no pueden
leerse: `REQUIERE REVISIÓN`.

**Caso A --- confirmación financiera:**
`CONFIRMADO JM` en la hoja de medio de pago, con
`ESTADO_ENLACE = ENLAZADO` y `FILA_BASE` = la fila de `BASE GENERAL`
de ese `USUARIO`.

**Caso B --- cobertura activa:**
`TC=1` en `BASE GENERAL` + `F.PRÓXIMO PAGO` posterior a la fecha del
crédito + `F.PRÓXIMO PAGO` dentro de la cobertura de `PLAN ACTIVO`
(meses del plan más la bonificación registrada `+k`, contados desde la
fecha del crédito). Cubre planes multimes y bonificaciones. Si
`PLAN ACTIVO` no es interpretable, o `F.PRÓXIMO PAGO` excede la
cobertura: `REQUIERE REVISIÓN`.

Sin Caso A ni Caso B: `NO HABILITADO`. Los Casos A/B habilitan la
tarea de servicio; no prueban la renovación ni actualizan
`BASE GENERAL`. Los demás gates de S0-E siguen aplicando.

Trazabilidad: el texto original de §7.1 no estaba versionado en este
repositorio antes del 24/10/2026. Esta sección transcribe la regla tal
como ya la aplica la capa operacional de lectura (Bloque Créditos de
HOY, commit `3733130`), sin reinterpretarla ni ampliarla.

La nueva `F.VENCIMIENTO` debe actualizar `BASE GENERAL`.

## Auditoría de fin de período

Descargar archivos reales de los paneles y cruzar:

`PANEL P1 ↔ CONTROL P1`\
`PANEL P2 ↔ CONTROL P2`\
`PANEL P3 ↔ CONTROL P3`

y luego contrastar contra `BASE GENERAL`.

Capas de evidencia:

-   Panel = estado técnico real.
-   CONTROL = ejecución del equipo.
-   BASE GENERAL = estado operacional consolidado.

Diferencias generan excepción; no sobrescritura silenciosa.

Ownership:

-   CONTROL/ejecución → asesor.
-   BASE GENERAL → Back Office.
-   Panel/técnico → asesor/soporte.
-   origen incierto → REQUIERE DECISIÓN.

### Gate S0-E

Cierre diario:

`pago autorizado + renovación + CONTROL + F.VENCIMIENTO actualizada + trazabilidad + sin excepción pendiente`

Certificación periódica:

`export panel + cruce Panel/CONTROL/BASE GENERAL + diferencias corregidas + revalidación = VALIDADO`

------------------------------------------------------------------------

# 8. S0-F --- OPERACIÓN → CIERRE → SIGUIENTE CICLO

## Cierre diario

Objetivo aprobado: `CIERRE_OPERACION` debe ser resultado calculado y
reproducible de la operación, no una segunda digitación manual.

Estado actual: PARCIAL.

Pendiente S0: auditar cada campo como:

-   AUTOMÁTICO/FÓRMULA
-   MANUAL
-   SIN FUENTE
-   FÓRMULA INCORRECTA/INCOMPLETA

Gate diario:

`datos completos + fuentes identificadas + controles superados + diferencias explicadas + pendientes registrados + responsable + snapshot`

## Continuidad

`CIERRE Día N → APERTURA Día N+1`

Deben heredarse automáticamente:

-   créditos finales → créditos iniciales;
-   pendientes;
-   excepciones;
-   compromisos;
-   contexto del ciclo.

## Pendientes

Estado actual: escritos manualmente.

Objetivo: cola operacional persistente:

`cliente + tipo + estado + responsable + prioridad + próxima acción + fecha + evidencia`

El sistema debe presentar activamente el pendiente al responsable.

Escalamiento:

`responsable → alerta por SLA → siguiente nivel → Julián cuando corresponda`

## Cierre mensual

Antes del siguiente ciclo:

`pagos/excepciones conciliados → altas incorporadas → servicio revisado → pendientes preservados → cierre validado → BASE GENERAL consolidada`

Después se generan dos salidas:

1.  **corte/backup inmutable del período**, para auditoría posterior;
2.  **PAGOS \[MES+1\]**, generado desde la BASE GENERAL gobernada.

El backup debe permitir auditar el período sin depender del estado
futuro de la base viva.

Indicadores e incentivos deben quedar calculados antes del cierre.

### Gate S0-F

`conciliaciones + altas + servicio + pendientes + cierre operacional + BASE GENERAL consolidada + backup/corte + indicadores/incentivos + excepciones residuales + PAGOS [MES+1] + checkpoint = CICLO VALIDADO`

------------------------------------------------------------------------

# 9. Flujo E2E aprobado

``` text
VENTAS
  ↓
VENTA VÁLIDA
  ↓
CONFIRMACIÓN FINANCIERA JULIÁN
  ↓
BASE GENERAL
  ↓
CORTE MENSUAL
  ↓
PAGOS [MES]
  ↓
ASIGNACIÓN / WORKFLOW DE COBRO
  ↓
GESTIÓN ESTRUCTURADA
  ↓
COMPROBANTE
  ↓
PENDIENTE CONFIRMACIÓN
  ↓
VALIDACIÓN JULIÁN
  ↓
PAGO CONFIRMADO
  ↓
TAREA DE SERVICIO
  ↓
CONTROL P1/P2/P3
  ↓
F.VENCIMIENTO / BASE GENERAL
  ↓
CIERRE DIARIO
  ↓
APERTURA SIGUIENTE
  ↓
CIERRE MENSUAL
  ├──→ BACKUP / CORTE AUDITABLE
  └──→ PAGOS [MES+1]
```

------------------------------------------------------------------------

# 10. Estado de S0

## Diseño

**A--F: APROBADO POR DIRECCIÓN.**

Esto no significa que la operación actual esté validada.

## Validación pendiente

Ahora debe contrastarse cada transición contra evidencia real y
clasificarse:

-   IMPLEMENTADO
-   PARCIAL
-   NO IMPLEMENTADO
-   BLOQUEADO
-   REQUIERE DECISIÓN
-   VALIDADO

## Evidencia operacional v0.3 --- 24/10/2026

Muestra real de seis casos, seudonimizada por método (`ZEL`, `PAY`,
`TRF`) y muestra (`-1`, `-2`). No se registran nombres, contactos,
importes ni otros datos personales.

| Caso | Observado | Clasificación |
|---|---|---|
| ZEL-1 | `CONFIRMADO JM`. Existe en `BASE GENERAL`, pero la capa financiera lo marcó `SIN BASE` / `PENDIENTE ENLACE`. En ventas del mes su origen es Reconexión | Ruta RECONEXIÓN; causa del no enlace REQUIERE EVIDENCIA |
| PAY-1 | `CONFIRMADO JM` reflejado en `PAGOS OCTUBRE 2026`; detenido por `SIN COINCIDENCIA TARIFA`, `CAMBIO PLAN`, `REQUIERE DECISIÓN` | Excepción no forzada (correcto) |
| TRF-1 | `CONFIRMADO JM`. En ventas del mes: Cliente nuevo, `REGISTRADA` | Posible `ALTA PENDIENTE` |
| ZEL-2 | `CONFIRMADO JM → ENLAZADO → COINCIDE PLAN → VALIDADO → PROPUESTA CALCULADA`; **no** reflejado en `PAGOS OCTUBRE 2026` | Diferencia de propagación: REQUIERE EVIDENCIA; no se atribuye al motor |
| PAY-2 | `CONFIRMADO JM → ENLAZADO → COINCIDE PLAN → VALIDADO → PROPUESTA CALCULADA`; reflejado en `PAGOS OCTUBRE 2026`. Sin cambio de plan | Camino financiero positivo |
| TRF-2 | `CONFIRMADO JM`. En ventas del mes: Referido, `REGISTRADA` | Posible `ALTA PENDIENTE` |

| Transición | Estado |
|---|---|
| `PENDIENTE CONFIRMACION → CONFIRMADO JM` en Zelle, PayPal y Transferencia | VALIDADO (6 casos reales) |
| `CONFIRMADO JM → ENLAZADO → COINCIDE PLAN → VALIDADO → PROPUESTA CALCULADA` en casos enlazados | VALIDADO |
| Excepciones de identidad/tarifa no avanzan solo por `CONFIRMADO JM` | VALIDADO |
| Hoja de medio de pago → `PAGOS OCTUBRE 2026` | PARCIAL (positivo en PayPal; un caso Zelle no reflejado) |
| `CONFIRMADO JM → servicio → CONTROL → F.VENCIMIENTO → BASE GENERAL actualizada` | NO IMPLEMENTADO COMO EVIDENCIA (no observado) |
| `BASE GENERAL consolidada → corte → F.PRÓXIMO PAGO → PAGOS [MES+1]` | Diseño documentado; reproducibilidad PARCIAL |

Brechas abiertas de v0.3 (no se resuelven por supuesto):

-   REQUIERE EVIDENCIA: causa de la diferencia de propagación (ZEL-2);
    causa del no enlace (ZEL-1); organización física de vencidos en
    `BASE GENERAL`; estructura viva de las hojas de ventas y pendientes
    de octubre; un caso real completo hasta CONTROL y `BASE GENERAL`.
-   REQUIERE DECISIÓN: gate definitivo de RECONEXIÓN; criterio de
    BAJA; responsable y escritura de las actualizaciones de
    `BASE GENERAL`; precedencia de fechas técnicas cuando CONTROL y
    `BASE GENERAL` difieren; pagador distinto del titular cuando afecte
    identidad.

## Próxima acción exacta (v0.2, 28/09/2026 --- histórica)

Comenzar **VALIDACIÓN S0-A** con casos reales de septiembre:

`VENTAS_SEPTIEMBRE → pago confirmado → datos completos → BASE GENERAL`

No abrir S1 ni implementar automatizaciones hasta obtener el baseline de
evidencia y backlog de S0.

------------------------------------------------------------------------

# CHECKPOINT

**Qué cambió:** se completó el diseño operacional S0-A a S0-F.\
**Qué quedó aprobado:** reglas, gates, ownership, excepciones,
trazabilidad, continuidad y cierre mensual.\
**Qué falta:** demostrar qué partes funcionan realmente hoy.\
**Gate activo:** S0.\
**Next Action:** validar S0-A con evidencia real y convertir diferencias
en backlog P0/P1/P2.

# CHECKPOINT v0.3 --- 24/10/2026

**Qué cambió:** Dirección (JM) reconoció S0 v0.3 como contrato vigente
para consolidación documental. Se versionaron §7.1 (Casos A/B), tipo de
ciclo, `ALTA PENDIENTE`, ruta provisional de RECONEXIÓN y separaciones
obligatorias.\
**Qué quedó validado:** `CONFIRMADO JM` en los tres métodos y el camino
financiero enlazado hasta `PROPUESTA CALCULADA`.\
**Qué falta:** propagación universal hacia `PAGOS [MES]`, un caso real
de servicio hasta `BASE GENERAL` y las decisiones abiertas de §10.\
**Gate activo:** S0.\
**Next Action:** definida por Dirección; esta consolidación no autoriza
cambios de implementación.
