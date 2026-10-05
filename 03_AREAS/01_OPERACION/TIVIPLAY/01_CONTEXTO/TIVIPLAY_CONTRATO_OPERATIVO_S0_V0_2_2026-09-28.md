# TIVIPLAY --- CONTRATO OPERATIVO S0

**Versión:** 0.2\
**Fecha:** 28 de septiembre de 2026\
**Estado:** PARCIAL --- diseño A--F aprobado; validación con evidencia
real pendiente\
**Gate activo:** S0 --- Baseline y Backlog

## 1. Arquitectura operacional vigente

Desde septiembre de 2026, `GESTION_GENERAL (TIVIPLAY)` queda fuera del
flujo operacional activo y se conserva como referencia histórica.

Flujo vigente:

`VENTAS 2026 (Tiviplay)` → `GESTION_DIA_PAGOS_2026_TIVIPLAY` →
`TIVIPLAY_FORMATO_GESTION_OPERATIVA`

Roles:

-   `VENTAS_SEPTIEMBRE`: origen comercial de altas, referidos y
    reactivaciones.
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

## Próxima acción exacta

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