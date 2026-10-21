# Manual operativo — Lista de octubre

**Versión:** 1.1
**Estado:** APROBADO POR DIRECCIÓN — USO SEMANA 19–25 OCT 2026
**Fecha de corte:** 2026-10-21
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · HOY
**Decisión gobernante:** Instrucción operacional de Dirección del 20/10/2026 para el uso de `/operaciones/tiviplay/hoy`. La versión 1.1 detalla los campos sin cambiar las reglas aprobadas.

> **En una frase:** gestiona solo a los clientes que muestra HOY. Si un cliente reporta pago, regístralo en la hoja de su medio de pago con `PENDIENTE CONFIRMACION`. Nunca confirmes un pago: eso lo hace solo Dirección con `CONFIRMADO JM`.

## 1. Reglas aprobadas por Dirección

1. Ingresa a Intranet → Operaciones → TiviPlay → HOY.
2. Revisa únicamente los clientes mostrados para gestión de octubre.
3. Realiza la gestión correspondiente con el cliente.
4. Cuando exista reporte de pago, registra en la hoja correspondiente al método de pago la información requerida: valor, plan y estado `PENDIENTE CONFIRMACION`.
5. `PENDIENTE CONFIRMACION` no significa pago confirmado.
6. La confirmación financiera corresponde exclusivamente a Dirección mediante `CONFIRMADO JM`.
7. Si el cliente no aparece en la lista de HOY, no lo incorpores manualmente al flujo ordinario; escálalo para revisión.
8. Los casos marcados `REQUIERE_REVISION` no deben resolverse suponiendo reglas.
9. Al cierre de la semana se validará nuevamente la operación y la intervención requerida de Dirección.
10. La auditoría financiera y de servicio corresponde a un proceso separado y no debe ejecutarse desde este manual.

Las secciones siguientes explican cómo cumplir cada regla, campo por campo.

## 2. Antes de empezar

| Necesitas | Para qué |
|---|---|
| Tu usuario de la intranet (perfil OPERADOR) | Ver la página HOY |
| Acceso de edición al libro **`GESTION_DIA_PAGOS_2026_TIVIPLAY`** | Registrar pagos en `ZELLE (OCT)`, `PAYPAL (OCT)` o `TRANSF (OCT)` |
| Tu nombre en la lista `ASESOR` de la hoja que vas a usar | Sin él no puedes registrar el pago (ver 4.3) |
| El comprobante que envió el cliente | Copiar valor y fecha exactos |

## 3. Paso A — Abrir la lista de HOY (reglas 1 y 2)

Entra a **Intranet → Operaciones → TiviPlay → HOY**. La página tiene tres bloques.

### Bloque 1 · Clientes por contactar

Son los clientes que el motor de cierre seleccionó para cobrar en octubre. Arriba puedes elegir **Semana actual** o **Todo el mes**.

| Columna en HOY | Qué significa | Cómo la usas |
|---|---|---|
| `Sem.` | Semana operativa del vencimiento (S1 = 1–4, S2 = 5–11, S3 = 12–18, S4 = 19–25, S5 = 26–31) | Prioriza la semana actual y las anteriores |
| `F. próximo pago` | Fecha en que vence el pago del cliente | Es la fecha que le recuerdas al cliente |
| `Cliente` | Nombre tal como está en BASE GENERAL | **Cópialo exactamente así** cuando registres el pago (ver 4.4) |
| `Teléfono` | Número de contacto registrado | Úsalo para la gestión. Si dice `—`, escala (caso E4) |
| `Plan` | Plan activo registrado | Confírmalo con el cliente; es el plan que se va a cobrar |
| `Método de pago` | Medio habitual del cliente | Te indica en qué hoja registrar el pago (ver 4.1) |
| `Origen` | Fila de BASE GENERAL (`BASE GENERAL!fila`) | Referencia para escalar un caso sin copiar datos personales |

### Bloque 2 · Excepciones que bloquean

Lista de casos que **no** se gestionan como cobro normal: fechas no interpretables, duplicados y casos `REQUIERE_REVISION`. El responsable de todos es **REQUIERE DECISIÓN**. No los resuelvas por tu cuenta; ver la sección 6.

### Bloque 3 · Pendientes de Confirmado JM

Hoy aparece **BLOQUEADO**. Es normal: no tienes que hacer nada en este bloque.

> Si la página muestra **BLOQUEADO** en los bloques 1 y 2, la fuente no se pudo leer. No trabajes con listas anteriores: avisa a Dirección.

## 4. Paso B — Gestionar y registrar el pago (reglas 3, 4 y 5)

Haz la gestión con el cliente (recordatorio, confirmación de plan, envío de datos de pago). Cuando el cliente **reporte un pago** con comprobante, regístralo en la hoja de su medio.

### 4.1 Elegir la hoja

| El cliente pagó por | Hoja | Los datos empiezan en la fila |
|---|---|---|
| Zelle | `ZELLE (OCT)` | 4 (encabezados en la fila 3) |
| PayPal | `PAYPAL (OCT)` | 3 (encabezados en la fila 2) |
| Bancolombia, Nequi, Davivienda o Western Union | `TRANSF (OCT)` | 3 (encabezados en la fila 2) |

Usa la **primera fila vacía** debajo de los encabezados. No sobrescribas filas existentes.

### 4.2 Campos que debes llenar

Llena **solo** estas columnas. Las columnas que siguen a la derecha (`CLIENTE_KEY`, `ESTADO_ENLACE`, `PLAN_CANONICO`, `VALIDACION_TARIFA`, `PROP_…`) son fórmulas: **no las escribas ni las borres**.

**ZELLE (OCT) — columnas A a H**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | `1` (todos los clientes de HOY tienen TC = 1) | Número |
| B | `Cliente` | El nombre de la columna `Cliente` de HOY, **idéntico** | Texto |
| C | `Monto Recibido` | El valor del comprobante, en dólares | Número (USD) |
| D | `Fecha` | La fecha del pago según el comprobante | Fecha |
| E | `Asesor` | Tu nombre | `JORGE`, `HEIDI`, `JULIAN`, `MANUELA` |
| F | `Origen` | `FACTURACIÓN` para clientes de HOY | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| G | `Observación` | Plan confirmado con el cliente y notas del caso, sin datos bancarios | Texto libre |
| H | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Solo ese valor (ver 4.5) |

**PAYPAL (OCT) — columnas A a M**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | `1` | Número |
| B | `CLIENTE` | El nombre de HOY, idéntico | Texto |
| C | `CORREO` | El correo al que se envió la factura | Texto |
| D | `FACTURA ENVIADA` | El valor facturado | Número |
| E | `COMISION PAYPAL` | La comisión cobrada por PayPal | Número |
| F | `MONTO RECIBIDO` | El valor neto recibido | Número (USD) |
| G | `FECHA DE RECIBIDO` | La fecha en que llegó el pago | Fecha |
| H | `Link de confirmación` | El enlace de la factura | URL |
| I | `FECHA DE CREACION` | La fecha en que se creó la factura | Fecha |
| J | `ASESOR` | Tu nombre | `Jorge`, `Julian`, `Heidy` |
| K | `ORIGEN` | `FACTURACIÓN` | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| L | `OBSERVACIÓN` | Plan confirmado y notas del caso | Texto libre |
| M | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Solo ese valor |

**TRANSF (OCT) — columnas A a K**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | `1` | Número |
| B | `CLIENTE` | El nombre de HOY, idéntico | Texto |
| C | `VALOR EN PESOS` | El valor, **solo si pagó en pesos** | Número |
| D | `USD` | El valor, **solo si pagó en dólares** | Número |
| E | `CAD` | El valor, **solo si pagó en dólares canadienses** | Número |
| F | `MEDIO DE PAGO` | El banco o medio usado | `BANCOLOMBIA`, `NEQUI`, `DAVIVIENDA`, `WESTERN U` |
| G | `FECHA` | La fecha del pago | Fecha |
| H | `ASESOR` | Tu nombre | `Jorge`, `Danna`, `Julian`, `Juan`, `Heidy` |
| I | `ORIGEN` | `FACTURACIÓN` | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| J | `OBSERVACIÓN` | Plan confirmado y notas del caso | Texto libre |
| K | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Solo ese valor |

> **TRANSF:** llena **una sola** columna de moneda (C, D o E). Si llenas varias, la hoja toma primero USD, luego CAD y luego pesos.

### 4.3 Si tu nombre no está en la lista de ASESOR

Las listas de asesor de cada hoja son distintas. Por ejemplo, Manuela aparece en `ZELLE (OCT)`, pero no en `PAYPAL (OCT)` ni en `TRANSF (OCT)`. Si tu nombre no aparece, **no escribas otro nombre**: avisa a Dirección (caso E5).

### 4.4 Dónde va el "plan" (regla 4)

Las hojas de pago **no tienen una columna de plan para escribir**. El plan se toma automáticamente de BASE GENERAL a partir del nombre y el TC:

- Escribe el plan que confirmaste con el cliente en la columna de **Observación**.
- Revisa la columna calculada `ESTADO_ENLACE` de tu fila:

| `ESTADO_ENLACE` | Significa | Qué haces |
|---|---|---|
| `ENLAZADO` | La hoja encontró al cliente en BASE GENERAL | Listo |
| `SIN BASE` | No lo encontró con ese nombre y TC | Copia de nuevo el nombre desde HOY. Si sigue igual, escala (caso E1) |
| `REQUIERE DECISIÓN` | Hay más de un cliente con ese nombre y TC | No lo resuelvas: escala (caso E2) |

- Si el cliente pagó **otro plan o un valor diferente** al de HOY, regístralo igual, explica la diferencia en Observación y escala (caso E3). La hoja lo marcará en `VALIDACION_TARIFA`.

### 4.5 La columna CONFIRMACION (reglas 5 y 6)

| Valor | Quién lo pone | Qué significa |
|---|---|---|
| `PENDIENTE CONFIRMACION` | **Tú** | Registraste un pago reportado por el cliente. **No es un pago confirmado** |
| `CONFIRMADO JM` | **Solo Dirección** | Dirección verificó que el dinero ingresó |
| `REQUIERE REVISIÓN` | Solo Dirección | El pago no coincide en valor, fecha, cliente o medio |
| `SIN PAGO` | No lo uses | Pendiente de decisión de Dirección |

> **Nunca selecciones `CONFIRMADO JM` ni `REQUIERE REVISIÓN`**, aunque la hoja te deje hacerlo. Si te equivocas, devuelve la celda a `PENDIENTE CONFIRMACION` y avisa a Dirección.

### 4.6 Tu parte termina cuando

- La fila quedó con todos los campos de 4.2 llenos.
- `CONFIRMACION` = `PENDIENTE CONFIRMACION`.
- `ESTADO_ENLACE` = `ENLAZADO`, o el caso quedó escalado.

Desde ahí, la confirmación es de Dirección. **No modifiques `BASE GENERAL` ni `PAGOS OCTUBRE 2026`** (en esta última solo puedes escribir en `OBSERVACIONES`).

## 5. Paso C — Cliente que no aparece en HOY (regla 7)

Si un cliente escribe para pagar y **no está en el Bloque 1 de HOY**:

1. No lo agregues a ninguna lista ni a `PAGOS OCTUBRE 2026`.
2. Si ya pagó, no rechaces el pago: escala a Dirección con nombre y medio de pago (caso E6).
3. Espera la indicación de Dirección antes de seguir.

## 6. Paso D — Casos REQUIERE_REVISION y excepciones (regla 8)

Un caso aparece en el Bloque 2 cuando los datos de BASE GENERAL tienen una señal que el sistema no puede decidir solo:

| Lo que ves en HOY | Qué significa | Qué haces |
|---|---|---|
| Requiere revisión · Posible mes gratis | Las observaciones mencionan un mes gratis | No cobres ni excluyas: escala |
| Requiere revisión · Posible no renovación | El cliente habría dicho que no renueva | No lo des de baja: escala. Puede pasar a retención |
| Requiere revisión · Excepción explícita | Hay una excepción anotada | Escala |
| Dato inválido | La fecha de próximo pago no se puede leer | Escala con el `Origen` |
| Duplicado | La misma ficha aparece en varias filas | Escala con las filas indicadas |

> No supongas reglas ("seguro es mes gratis", "seguro ya pagó"). Escala con el `Origen` (`BASE GENERAL!fila`).

## 7. Cómo escalar

Escala a **Dirección** e indica siempre:

- el código del caso (E1–E6);
- el `Origen` que muestra HOY (`BASE GENERAL!fila`) o la hoja y fila del pago;
- qué viste, en una línea, **sin** datos bancarios ni contraseñas.

| Caso | Situación |
|---|---|
| E1 | `ESTADO_ENLACE` = `SIN BASE` aunque copiaste el nombre de HOY |
| E2 | `ESTADO_ENLACE` = `REQUIERE DECISIÓN` |
| E3 | El cliente pagó otro plan o un valor distinto |
| E4 | El cliente de HOY no tiene teléfono |
| E5 | Tu nombre no está en la lista `ASESOR` de la hoja |
| E6 | Cliente que no aparece en HOY quiere pagar o ya pagó |

## 8. Cierre de semana (regla 9)

Al cierre de la semana Dirección vuelve a validar la operación. Para esa revisión:

- Todo pago reportado debe estar registrado con `PENDIENTE CONFIRMACION`.
- Todo caso escalado debe tener su código y su `Origen`.
- No dejes filas a medio llenar en las hojas de pago.

## 9. Fuera de este manual (regla 10)

- Confirmar pagos (`CONFIRMADO JM`): solo Dirección.
- Auditoría financiera (cruce con extractos bancarios) y auditoría de servicio (cruce con paneles): procesos separados.
- Registrar renovaciones en `CONTROL (OCT) P1/P2/P3` y actualizar `BASE GENERAL`: están en el manual de «Gestión financiera y renovación», que no está publicado todavía.

## 10. Checklist rápido por cliente

- ☐ El cliente está en el Bloque 1 de HOY.
- ☐ Hice la gestión y confirmé el plan.
- ☐ Si reportó pago: elegí la hoja de su medio de pago.
- ☐ Llené TC, cliente (idéntico a HOY), valor, fecha, asesor, origen y observación con el plan.
- ☐ Puse `CONFIRMACION` = `PENDIENTE CONFIRMACION`.
- ☐ Verifiqué `ESTADO_ENLACE` = `ENLAZADO` o escalé el caso.

## Fuente de los campos

Las columnas, valores permitidos y fórmulas de las secciones 4.1 a 4.5 provienen de la inspección de las hojas vivas del 20/10/2026, registrada en el manual piloto «Gestión financiera y renovación» v0.2. Las columnas de HOY corresponden a la página `/operaciones/tiviplay/hoy` validada con datos vivos el 20/10/2026. Si una hoja cambia sus columnas o sus listas, este manual debe actualizarse antes de usarse.
