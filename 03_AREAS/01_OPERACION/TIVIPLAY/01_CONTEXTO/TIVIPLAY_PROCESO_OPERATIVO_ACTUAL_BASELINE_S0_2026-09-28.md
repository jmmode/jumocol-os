# TIVIPLAY --- PROCESO OPERATIVO ACTUAL Y BASELINE S0

**Documento:** TIVIPLAY-S0-PROCESO-ACTUAL-001\
**Versión:** 0.1\
**Fecha:** 28 de septiembre de 2026\
**Estado:** PARCIAL --- baseline documentado; transiciones E2E
pendientes de validación\
**Objetivo:** documentar el proceso que TIVIPLAY está usando actualmente
y utilizarlo como mapa de trabajo para cerrar S0 con evidencia real.

------------------------------------------------------------------------

## 1. Decisión operacional vigente desde septiembre de 2026

Durante septiembre de 2026 se decidió **dejar de utilizar
`GESTION_GENERAL (TIVIPLAY)` como parte del flujo operacional activo**.

### Motivo

`GESTION_GENERAL (TIVIPLAY)` se utilizaba como una capa separada para
conservar información completa de clientes, especialmente teléfono y
correo, mientras `GESTION_DIA_PAGOS_2026_TIVIPLAY` operaba con una
separación parcial de esos datos.

Esa separación comenzó a generar:

-   duplicidad de bases;
-   sincronizaciones adicionales;
-   reprocesos;
-   riesgo de diferencias entre fuentes;
-   fricción para automatización futura.

### Decisión

A partir de septiembre, la operación se simplifica alrededor de:

`VENTAS 2026 (Tiviplay)`\
→ `GESTION_DIA_PAGOS_2026_TIVIPLAY`\
→ `TIVIPLAY_FORMATO_GESTION_OPERATIVA`

`GESTION_GENERAL (TIVIPLAY)` queda como **FUENTE HISTÓRICA / NO ACTIVA
EN EL FLUJO OPERACIONAL ACTUAL**.

No debe eliminarse ni reinterpretarse su historia. Simplemente deja de
considerarse una transición obligatoria del proceso vigente.

------------------------------------------------------------------------

## 2. Archivos del modelo operacional actual

### 2.1 `VENTAS 2026 (Tiviplay)`

**Función actual identificada:** puerta de entrada comercial.

Para septiembre existe la hoja:

`VENTAS_SEPTIEMBRE`

Aquí aparecen, entre otros:

-   clientes nuevos;
-   prospectos convertidos;
-   referidos;
-   reactivaciones;
-   asesor;
-   cliente;
-   teléfono;
-   correo;
-   estado;
-   usuario;
-   panel;
-   plan;
-   valor;
-   método de pago;
-   fechas.

**Rol provisional S0:** FUENTE DE ORIGEN para altas comerciales del
periodo.

------------------------------------------------------------------------

### 2.2 `GESTION_DIA_PAGOS_2026_TIVIPLAY`

**Función actual identificada:** núcleo operativo de clientes,
facturación, pagos y control mensual.

La fuente actual contiene 65 hojas y ya incluye el ciclo de septiembre.

Hojas relevantes para el proceso que estamos auditando:

-   `BASE GENERAL`
-   `PAGOS SEPTIEMBRE`
-   `ZELLE (SEPT)`
-   `PAYPAL (SEPT)`
-   `TRANSF (SEPT)`
-   `CONTROL ( SEPT) P1`
-   `CONTROL (SEPT) P2`
-   `CONTROL ( SEPT) P3`
-   `CONTROL OPERATIVO SEPTIEMBRE`
-   `RESUMEN SEPTIEMBRE`

### `BASE GENERAL`

Representa provisionalmente el **registro operacional maestro del
cliente una vez incorporado al sistema recurrente**.

La decisión de septiembre implica que esta base puede contener también
los datos de contacto necesarios para evitar mantener una segunda Base
General operacional en otro archivo.

**Rol provisional S0:** FUENTE OPERATIVA PRINCIPAL.

------------------------------------------------------------------------

### 2.3 `TIVIPLAY_FORMATO_GESTION_OPERATIVA`

El archivo contiene múltiples hojas de diseño, consulta, gestión,
gobierno y dashboards.

Sin embargo, para S0 no se debe asumir que todas representan ejecución
real.

### Uso operacional declarado actualmente

El equipo está diligenciando actualmente:

-   `APERTURA_OPERACION`
-   `CIERRE_OPERACION`

Las demás hojas existentes ---por ejemplo `GESTION_DIARIA`,
`GESTION_CLIENTE`, `ASIGNACION_BASES_6M`, dashboards y consultas--- **no
se consideran ejecución operacional actual hasta que exista evidencia de
uso real**.

**Rol provisional S0:** REGISTRO DE APERTURA Y CIERRE OPERACIONAL.

------------------------------------------------------------------------

## 3. Archivo retirado del flujo activo

### `GESTION_GENERAL (TIVIPLAY)`

El archivo existe y conserva información histórica.

El modelo anterior utilizaba:

`Base Operativa → GESTION_GENERAL → planilla siguiente`

Ese diseño está documentado en protocolos anteriores.

### Estado actual

**NO IMPLEMENTADO EN EL FLUJO VIGENTE / FUENTE HISTÓRICA**

Desde septiembre no se considera necesario trasladar la operación a
`GESTION_GENERAL` para después regresar al siguiente ciclo.

La decisión busca reducir:

`duplicidad → sincronización → reproceso → inconsistencias`

y acercar el modelo a:

`una fuente operacional gobernada → automatización futura`.

------------------------------------------------------------------------

## 4. Flujo operacional actual --- versión S0

``` text
┌───────────────────────────────┐
│ VENTAS 2026 (Tiviplay)       │
│ VENTAS_SEPTIEMBRE             │
│                               │
│ Cliente nuevo / referido /    │
│ reactivación / venta          │
└───────────────┬───────────────┘
                │
                │ TRANSICIÓN A
                │ REQUIERE VALIDACIÓN S0
                ▼
┌───────────────────────────────┐
│ GESTION_DIA_PAGOS_2026       │
│ BASE GENERAL                  │
│                               │
│ Cliente incorporado al        │
│ universo operacional          │
└───────────────┬───────────────┘
                │
                │ TRANSICIÓN B
                │ REQUIERE VALIDACIÓN S0
                ▼
┌───────────────────────────────┐
│ PAGOS DEL MES                 │
│ Ej.: PAGOS SEPTIEMBRE         │
│                               │
│ Cartera / facturación /       │
│ próxima renovación            │
└───────────────┬───────────────┘
                │
                │ Gestión humana
                │ del equipo
                ▼
┌───────────────────────────────┐
│ PAGO REPORTADO / RECIBIDO     │
│                               │
│ ZELLE / PAYPAL / TRANSF       │
└───────────────┬───────────────┘
                │
                │ TRANSICIÓN C
                │ REQUIERE VALIDACIÓN S0
                ▼
┌───────────────────────────────┐
│ SERVICIO / PANEL / CRÉDITO    │
│ P1 / P2 / P3                  │
└───────────────┬───────────────┘
                │
                │ TRANSICIÓN D
                │ REQUIERE VALIDACIÓN S0
                ▼
┌───────────────────────────────┐
│ ACTUALIZACIÓN OPERACIONAL     │
│                               │
│ estado + fechas + plan +      │
│ próximo pago + evidencia      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ APERTURA / CIERRE OPERACIÓN   │
│                               │
│ TIVIPLAY_FORMATO_             │
│ GESTION_OPERATIVA             │
└───────────────┬───────────────┘
                │
                ▼
        SIGUIENTE CICLO
```

------------------------------------------------------------------------

## 5. Dos formas de entrada al ciclo

### Cliente nuevo

``` text
VENTAS_SEPTIEMBRE
→ validación / incorporación
→ BASE GENERAL
→ ciclos futuros de renovación
```

### Cliente existente

``` text
BASE GENERAL
→ fecha próxima de pago
→ PAGOS DEL MES
→ gestión
→ pago
→ servicio
→ actualización
→ siguiente fecha de pago
```

Por tanto, `BASE GENERAL` no es necesariamente el nacimiento comercial
del cliente.

Es el punto donde el cliente pasa a formar parte del **universo
operacional recurrente**.

------------------------------------------------------------------------

## 6. Evidencia documental histórica útil

El manual histórico de facturación ya establecía una relación directa:

`PLANILLA DE VENTAS → BASE GENERAL`

para incorporar nuevos usuarios.

El protocolo de julio-agosto también asignó a Jorge la clasificación de
ventas/reactivaciones y su incorporación a la Base Operativa.

Esos documentos sirven como **guía histórica del proceso**, pero no
prueban que cada transición se esté ejecutando actualmente ni que haya
sido ejecutada completamente en julio/agosto.

S0 debe validar la realidad actual mediante casos y evidencia.

------------------------------------------------------------------------

## 7. Qué está validado hasta ahora

### VALIDADO

-   Existen `VENTAS_SEPTIEMBRE` y el registro comercial del periodo.
-   Existe `BASE GENERAL` dentro de `GESTION_DIA_PAGOS_2026_TIVIPLAY`.
-   La fuente operativa actual contiene septiembre y sus auxiliares de
    pago.
-   Existen hojas mensuales y controles por panel.
-   `TIVIPLAY_FORMATO_GESTION_OPERATIVA` contiene `APERTURA_OPERACION` y
    `CIERRE_OPERACION`.
-   Existen registros de apertura y cierre durante septiembre.
-   `GESTION_GENERAL (TIVIPLAY)` existe como archivo histórico.
-   La decisión operacional vigente desde septiembre es no utilizar
    `GESTION_GENERAL` como transición del flujo activo.

### PARCIAL / REQUIERE VALIDACIÓN

-   Cómo se decide que una fila de Ventas debe incorporarse a
    `BASE GENERAL`.
-   Quién ejecuta actualmente esa incorporación.
-   Qué campos son obligatorios en la transferencia.
-   Cómo se detectan duplicados antes del alta.
-   Qué excepciones impiden incorporar un cliente.
-   Cómo se genera actualmente `PAGOS DEL MES` desde `BASE GENERAL`.
-   Cómo se asigna diariamente la gestión a Jorge/Heidy.
-   Dónde queda evidencia individual del contacto con cada cliente.
-   Qué constituye evidencia suficiente de pago.
-   Cómo se demuestra la renovación/recarga del servicio.
-   Cómo se actualiza nuevamente `BASE GENERAL`.
-   Cómo se comprueba que apertura/cierre corresponde a los movimientos
    individuales del día.

------------------------------------------------------------------------

## 8. S0 --- estrategia de validación

S0 no debe reconstruir el sistema completo de una vez.

Se validará transición por transición.

### S0-A --- Venta → Base General

Preguntas:

1.  ¿Qué evento convierte una venta en alta?
2.  ¿Quién revisa la venta?
3.  ¿Quién incorpora el cliente?
4.  ¿Qué campos se transfieren?
5.  ¿Cómo se evita duplicidad?
6.  ¿Qué evidencia demuestra el alta?
7.  ¿Qué ocurre si faltan datos?

**Entregable:** contrato real de incorporación de cliente.

------------------------------------------------------------------------

### S0-B --- Base General → Pagos del mes

Preguntas:

1.  ¿Qué fecha gobierna la inclusión?
2.  ¿Qué estados se incluyen/excluyen?
3.  ¿Cómo se manejan planes anuales, meses gratis y excepciones?
4.  ¿Quién genera/revisa la planilla?
5.  ¿Qué evidencia demuestra que el universo mensual es completo?

**Entregable:** contrato real de generación de cartera mensual.

------------------------------------------------------------------------

### S0-C --- Pagos del mes → Gestión humana

Preguntas:

1.  ¿Cómo sabe cada asesor qué clientes gestionar?
2.  ¿Cómo se priorizan?
3.  ¿Dónde registra contacto y resultado?
4.  ¿Cómo queda una siguiente acción?
5.  ¿Cómo se entrega un turno al siguiente?

**Entregable:** contrato real de gestión diaria.

------------------------------------------------------------------------

### S0-D --- Gestión → Pago → Evidencia

Preguntas:

1.  ¿Cómo se reporta el pago?
2.  ¿Qué medio se utilizó?
3.  ¿Qué evidencia confirma el ingreso?
4.  ¿Quién valida?
5.  ¿Cómo se manejan diferencias?

**Entregable:** contrato real de validación de pago.

------------------------------------------------------------------------

### S0-E --- Pago → Servicio → Actualización

Preguntas:

1.  ¿Quién recarga/renueva?
2.  ¿Qué panel se utiliza?
3.  ¿Cómo se demuestra la recarga?
4.  ¿Qué fechas cambian?
5.  ¿Quién actualiza `BASE GENERAL`?
6.  ¿Cómo se evita actualizar dos veces?

**Entregable:** contrato real de renovación y actualización.

------------------------------------------------------------------------

### S0-F --- Operación → Cierre → Siguiente ciclo

Preguntas:

1.  ¿De dónde salen los valores de apertura/cierre?
2.  ¿Se pueden reconstruir desde movimientos individuales?
3.  ¿Quién valida el cierre?
4.  ¿Qué queda pendiente?
5.  ¿Cómo se transporta al siguiente día/mes?

**Entregable:** contrato real de cierre y continuidad.

------------------------------------------------------------------------

## 9. Gate de S0

S0 podrá considerarse VALIDADO cuando cada transición A--F tenga:

`ENTRADA → RESPONSABLE → ACCIÓN → FUENTE → SALIDA → EVIDENCIA → EXCEPCIÓN → CRITERIO DE CIERRE`

No es necesario automatizar estas transiciones durante S0.

El objetivo es que el proceso real quede inequívocamente entendido antes
de estandarizarlo, medirlo o automatizarlo.

------------------------------------------------------------------------

## 10. Próxima acción exacta

**No avanzar todavía a pagos ni a Sebastián Marmolejo.**

Abrir:

### `S0-A — VENTAS → BASE GENERAL`

Seleccionar un cliente real de `VENTAS_SEPTIEMBRE` y reconstruir
únicamente su incorporación a `BASE GENERAL`.

Resultado esperado:

`VENTA REGISTRADA → ALTA VALIDADA → CLIENTE EN BASE GENERAL`

Cuando esta transición quede probada, documentar la evidencia y abrir
S0-B.

------------------------------------------------------------------------

## 11. Fuentes utilizadas para este baseline

-   `VENTAS 2026 (Tiviplay)` --- fuente viva de ventas.
-   `GESTION_DIA_PAGOS_2026_TIVIPLAY` --- fuente operativa viva.
-   `TIVIPLAY_FORMATO_GESTION_OPERATIVA` --- apertura/cierre operacional
    y estructura auxiliar.
-   `GESTION_GENERAL (TIVIPLAY)` --- referencia histórica; retirada del
    flujo activo desde septiembre.
-   `PROTOCOLO_CIERRE_FASE_C_Y_PLANILLA_JULIO_AGOSTO_JORGE_GOMEZ_V1_1_2026-07.md`
    --- guía histórica de ejecución.
-   `Manual para la Elaboración de la Planilla de Facturación Mensual`
    --- antecedente documental del flujo ventas → Base General.

------------------------------------------------------------------------

# CHECKPOINT

**Gate activo:** S0\
**Microbloque activo:** S0-A --- VENTAS → BASE GENERAL\
**Estado:** PARCIAL\
**Siguiente acción:** seleccionar y trazar un alta real de septiembre
desde `VENTAS_SEPTIEMBRE` hasta `BASE GENERAL`.\
**No hacer todavía:** automatizar, rediseñar JUMOCOL OS, reincorporar
`GESTION_GENERAL` o abrir simultáneamente otras transiciones.
