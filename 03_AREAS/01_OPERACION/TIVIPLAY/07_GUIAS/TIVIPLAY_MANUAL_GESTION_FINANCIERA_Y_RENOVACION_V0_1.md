# Manual operativo — Gestión financiera y renovación de servicio TiviPlay

**Versión:** 0.1
**Estado:** PROPUESTO — PENDIENTE DE APROBACIÓN DE DIRECCIÓN
**Fecha de corte:** 2026-10-20
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · Pagos y renovación
**Decisión gobernante:** TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2 (S0-C, S0-D, S0-E)

> Este manual describe el trabajo del asesor sobre las hojas vivas tal como existen al 20/10/2026, ciclo de octubre. Cada hoja, columna y valor permitido se verificó en la hoja real (ver la sección 12). Donde la hoja no permite cumplir una regla, el manual lo marca como **REQUIERE DECISIÓN** y no inventa un procedimiento. La auditoría bancaria con extractos queda fuera de alcance.

## 1. Propósito

Que el asesor sepa **qué hacer, dónde hacerlo, qué registrar y cómo saber que terminó** cuando un cliente paga y su servicio debe renovarse.

## 2. Regla de oro del ciclo

Para un cliente cuya **F.VENCIMIENTO cae en el mes en curso**, el ciclo solo está completo cuando se cumplen las tres condiciones:

| # | Condición | Dónde se ve | Quién la produce |
|---|---|---|---|
| 1 | **PAGO CONFIRMADO**: `CONFIRMACION = CONFIRMADO JM` | Hoja del medio de pago (ZELLE / PAYPAL / TRANSF) | Solo Dirección (JM) |
| 2 | **Renovación registrada**: una fila del mismo `USUARIO` con `CREDITO` ≥ 1 | `CONTROL (OCT) P1`, `P2` o `P3`, según el panel | Asesor |
| 3 | **F.VENCIMIENTO resultante posterior al mes en curso** | Panel técnico del cliente | Asesor la verifica |

Solo con las tres se habilita la actualización de `BASE GENERAL`, que hace Back Office.

Mantenga siempre separados estos cinco estados. Ninguno implica el siguiente:

1. **Pago reportado:** el cliente envió el comprobante.
2. **Pago confirmado:** JM verificó el ingreso real.
3. **Renovación técnica:** se asignó el crédito en el panel.
4. **Validación de servicio:** la nueva F.VENCIMIENTO es correcta.
5. **Actualización de Base General:** Back Office la registró.

## 3. Alcance

**Incluye:**
- Registrar el pago recibido en la hoja de su medio.
- Seguir el estado financiero en `PAGOS OCTUBRE 2026`.
- Registrar la renovación en `CONTROL (OCT) P1/P2/P3`.
- Verificar el servicio.
- Escalar las excepciones.

**No incluye:**
- Confirmar pagos: es exclusivo de JM.
- Conciliar contra extractos bancarios.
- Editar `BASE GENERAL`: es de Back Office.
- Altas de clientes nuevos (S0-A).

## 4. Fuentes que usa el asesor

Todas están en el libro de Google Sheets **`GESTION_DIA_PAGOS_2026_TIVIPLAY`**. Cada mes se crean pestañas nuevas; en octubre son estas:

| Hoja | Para qué | Qué hace el asesor |
|---|---|---|
| `PAGOS OCTUBRE 2026` | Cartera del mes: corte de BASE GENERAL del 30/09 y semanas 1 a 5 | Consulta. Solo escribe notas en `OBSERVACIONES` |
| `ZELLE (OCT)` | Pagos por Zelle (USD) | Registra el pago |
| `PAYPAL (OCT)` | Pagos por PayPal (USD) | Registra el pago |
| `TRANSF (OCT)` | Transferencias: Bancolombia, Nequi, Davivienda, Western U | Registra el pago |
| `CONTROL (OCT) P1` | Renovaciones del panel 1 (`colombia77DM`) | Registra la renovación |
| `CONTROL (OCT) P2` | Renovaciones del panel 2 (`Med3lli454`) | Registra la renovación |
| `CONTROL (OCT) P3` | Renovaciones del panel 3 (`colombia78DM`) | Registra la renovación |
| `BASE GENERAL` | Universo operacional consolidado | **No edita.** Solo consulta el nombre exacto del cliente y su panel |

> Use siempre las pestañas del mes en curso. Las de meses anteriores, como `ZELLE (SEPT)` o `CONTROL (SEPT) P2`, son históricas.

## 5. Prerrequisitos

- Tener acceso de edición al libro `GESTION_DIA_PAGOS_2026_TIVIPLAY`.
- Que su nombre esté en las listas desplegables de `Asesor` / `ASESOR` de las hojas que va a usar. Hoy no lo está para todos: ver la decisión D3.
- Tener acceso al panel técnico del cliente para asignar el crédito y verificar la fecha.
- Tener el comprobante del cliente.

## 6. CAPA FINANCIERA — Registrar un pago recibido

### 6.1 Elegir la hoja

| Medio del pago | Hoja | Fila de encabezados | Primera fila de datos |
|---|---|---|---|
| Zelle | `ZELLE (OCT)` | 3 | 4 |
| PayPal | `PAYPAL (OCT)` | 2 | 3 |
| Bancolombia, Nequi, Davivienda o Western U | `TRANSF (OCT)` | 2 | 3 |

### 6.2 Columnas que alimenta el asesor

Escriba **solo** en estas columnas. A partir de `CLIENTE_KEY` todas las columnas son fórmulas. La mayoría tiene la protección "SISTEMA · columnas calculadas · no editar manualmente" (desde `CLIENTE_KEY` en ZELLE; desde la columna siguiente en PAYPAL y TRANSF), pero aunque una columna no esté protegida, no la edite.

**`ZELLE (OCT)`, columnas A a H:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | El mismo TC que el cliente tiene en BASE GENERAL. En la operación observada es `1` | Número |
| B | `Cliente` | El nombre **exactamente igual** a la columna `CLIENTE` de BASE GENERAL | Texto |
| C | `Monto Recibido` | El valor recibido | Número (USD) |
| D | `Fecha` | La fecha del pago | Fecha |
| E | `Asesor` | Su nombre | `Jorge`, `Heidy`, `Julian` |
| F | `Origen` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| G | `Observación` | Notas del caso, sin datos bancarios | Texto libre |
| H | `CONFIRMACION` | Siempre `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

**`PAYPAL (OCT)`, columnas A a M:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | Igual que en Zelle | Número |
| B | `CLIENTE` | El nombre exacto de BASE GENERAL | Texto |
| C | `CORREO` | El correo de la factura | Texto |
| D | `FACTURA ENVIADA` | El valor facturado | Número |
| E | `COMISION PAYPAL` | La comisión del medio | Número |
| F | `MONTO RECIBIDO` | El valor neto recibido | Número (USD) |
| G | `FECHA DE RECIBIDO` | La fecha del pago | Fecha |
| H | `Link de confirmación` | El enlace de la factura PayPal | URL |
| I | `FECHA DE CREACION` | La fecha de creación de la factura | Fecha |
| J | `ASESOR` | Su nombre | `Jorge`, `Julian`, `Heidy` |
| K | `ORIGEN` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| L | `OBSERVACIÓN` | Notas del caso | Texto libre |
| M | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

**`TRANSF (OCT)`, columnas A a K:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | Igual que en Zelle | Número |
| B | `CLIENTE` | El nombre exacto de BASE GENERAL | Texto |
| C | `VALOR EN PESOS` | El valor, **solo si pagó en COP** | Número |
| D | `USD` | El valor, **solo si pagó en USD** | Número |
| E | `CAD` | El valor, **solo si pagó en CAD** | Número |
| F | `MEDIO DE PAGO` | El banco o medio | `BANCOLOMBIA`, `NEQUI`, `DAVIVIENDA`, `WESTERN U` |
| G | `FECHA` | La fecha del pago | Fecha válida |
| H | `ASESOR` | Su nombre | `Jorge`, `Danna`, `Julian`, `Juan`, `Heidy` |
| I | `ORIGEN` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| J | `OBSERVACIÓN` | Notas del caso | Texto libre |
| K | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

> **TRANSF: llene una sola columna de moneda.** La hoja deduce la moneda con este orden: si `USD` tiene valor, toma USD; si no, CAD; si no, COP. Si llena dos columnas, la moneda queda mal.

### 6.3 Por qué el nombre del cliente debe ser exacto

La hoja calcula `CLIENTE_KEY` como el nombre en mayúsculas y sin espacios sobrantes. Luego lo busca en la columna `CLIENTE_KEY` de BASE GENERAL **junto con el mismo `TC`**. El resultado queda en `ESTADO_ENLACE`:

| `ESTADO_ENLACE` | Significa | Acción |
|---|---|---|
| `ENLAZADO` | Encontró exactamente un cliente | Continúe |
| `SIN BASE` | No encontró el nombre o el TC no coincide | Corrija el nombre o el TC copiándolos de BASE GENERAL. Si sigue igual, escale (E1) |
| `REQUIERE DECISIÓN` | Hay más de un cliente con ese nombre y TC | No intente resolverlo. Escale (E2) |

**Ejemplo ficticio:**

| TC | Cliente | Monto Recibido | Fecha | Asesor | Origen | Observación | CONFIRMACION |
|---|---|---|---|---|---|---|---|
| 1 | Cliente Ejemplo Uno | 25 | 15/10/2026 | Jorge | FACTURACIÓN | Comprobante recibido por WhatsApp | PENDIENTE CONFIRMACION |

### 6.4 La columna CONFIRMACION

| Valor | Quién lo pone | Significado |
|---|---|---|
| `PENDIENTE CONFIRMACION` | **Asesor** | Registró el pago con su comprobante |
| `CONFIRMADO JM` | **Solo JM** | JM verificó el ingreso real en la fuente financiera |
| `REQUIERE REVISIÓN` | JM | El pago no coincide en valor, fecha, cliente o medio |
| `SIN PAGO` | REQUIERE DECISIÓN (D5) | El valor existe en la lista, pero su uso por el asesor no está definido |

> **El asesor nunca selecciona `CONFIRMADO JM`, aunque la lista se lo permita.** La hoja no lo bloquea técnicamente: la columna no está protegida (riesgo R1). Es una regla de gobierno, no de la herramienta.

### 6.5 Qué calcula la hoja sola (no editar)

Una vez registrado el pago, las columnas automáticas muestran:

| Campo | Qué indica |
|---|---|
| `PLAN_CANONICO`, `DURACION_MESES`, `PANTALLAS` | El plan del cliente según BASE GENERAL |
| `MONEDA_PAGO`, `VALOR_PAGO` | La moneda y el valor tomados de su registro |
| `VALIDACION_TARIFA` | `COINCIDE PLAN`, `TARIFA ≠ PLAN`, `SIN COINCIDENCIA TARIFA`, `PENDIENTE ENLACE`, `ADD-ON / TARIFA SEPARADA` o `MONEDA NO USD` (solo en TRANSF) |
| `PROP_F_ULTIMO`, `PROP_F_PROXIMO`, `PROP_T`, `PROP_ESTADO` | Fechas propuestas. **Solo aparecen** con `CONFIRMADO JM` + `ENLAZADO` + `COINCIDE PLAN` |
| `ESTADO_PROPUESTA` | `VALIDADO` o `REQUIERE DECISIÓN` |
| `MOTIVO_PROPUESTA` | Por qué falta: `PENDIENTE CONFIRMADO JM`, `PENDIENTE ENLACE`, `PENDIENTE VALIDACIÓN TARIFA`, `SIN DURACIÓN` o `PROPUESTA CALCULADA` |
| `GATE_CAMBIO_PLAN` | `VALIDADO`, `REQUIERE DECISIÓN` o `PARCIAL` |

> `PROP_F_PROXIMO` es una **propuesta** para la F.PRÓXIMO PAGO, que es la fecha comercial. No es la F.VENCIMIENTO, que es la fecha técnica.

### 6.6 Seguimiento en PAGOS OCTUBRE 2026

La cartera del mes (encabezados en la fila 3, filas agrupadas por `SEMANA 1` a `SEMANA 5`) se cruza sola con las tres hojas de medio de pago:

| Columna | Qué ve el asesor |
|---|---|
| `ESTADO` | `Al dia`, `Por vencer` o `Vencido`, calculado a partir de `T` |
| `T` | Días hasta la F.PRÓXIMO PAGO: `T ≥ 30` es Al día, `1–29` es Por vencer, `≤ 0` es Vencido |
| `COINCIDENCIAS_FINANCIERAS` | Cuántos pagos del mes se encontraron para el cliente |
| `FUENTE_FINANCIERA` | `ZELLE`, `PAYPAL`, `TRANSFERENCIA` o `REQUIERE DECISIÓN` |
| `CONFIRMACION_FINANCIERA` | `SIN PAGO`, `PENDIENTE CONFIRMACION`, `CONFIRMADO JM` o `REQUIERE DECISIÓN` |
| `ESTADO_FINANCIERO` | `SIN PAGO`, `PENDIENTE CONFIRMACIÓN`, `PARCIAL`, `VALIDADO` o `REQUIERE DECISIÓN` |
| `GATE_FINANCIERO` y `MOTIVO_GATE_FINANCIERO` | El resultado de la capa financiera y su motivo |

**La capa financiera está completa cuando `GATE_FINANCIERO = VALIDADO`**, cuyo motivo es "PAGO CONFIRMADO + FECHA + TARIFA + PROPUESTA CALCULADA".

En `PAGOS OCTUBRE 2026` el asesor **solo escribe en `OBSERVACIONES`**. Las columnas `ESTADO`, `T` y de `CONFIRMACION` a `MOTIVO_GATE_FINANCIERO` son fórmulas y **no tienen protección** (riesgo R2): no las sobrescriba.

### 6.7 Fin de la responsabilidad financiera del asesor

Su parte termina cuando el pago quedó registrado con `CONFIRMACION = PENDIENTE CONFIRMACION` y `ESTADO_ENLACE = ENLAZADO`, o cuando escaló la excepción. Desde ahí, la confirmación es de JM.

## 7. CAPA DE SERVICIO — Registrar la renovación

### 7.1 Elegir la hoja CONTROL según el panel

| Panel | Hoja | Nombre del panel en la hoja |
|---|---|---|
| Panel 1 | `CONTROL (OCT) P1` | `colombia77DM` |
| Panel 2 | `CONTROL (OCT) P2` | `Med3lli454` |
| Panel 3 | `CONTROL (OCT) P3` | `colombia78DM` |

> La columna `PANEL` de `PAGOS OCTUBRE 2026` usa otros nombres: `PANEL 1`, `PANEL 2`, `PANEL 3`, `PANEL 3M`, `Canada1996`, `Reseller`, `NO CREADO`. Para `PANEL 3M`, `Canada1996` y `Reseller` la hoja CONTROL correspondiente **no está definida**: ver la decisión D4.

### 7.2 Cuándo renovar

Según el contrato S0-E, la renovación **solo se autoriza** con PAGO CONFIRMADO (`CONFIRMADO JM`) o con una excepción aprobada (mes gratis, promoción, extensión u otra regla autorizada). Antes de renovar, confirme en `PAGOS OCTUBRE 2026` que `CONFIRMACION_FINANCIERA = CONFIRMADO JM` o que existe la excepción aprobada.

### 7.3 Columnas que alimenta el asesor

Encabezados en la fila 2; una fila por cada renovación, de la fila 3 en adelante.

| Col. | Campo | Qué escribir | Valores |
|---|---|---|---|
| A | `TC` | El TC del registro | Observado: `1` para recarga asignada, `0` para `SIN ASIGNAR` |
| B | `ASESOR` | Su nombre | P1: `JULIAN`, `JORGE`, `HEIDY`, `MANUELA` · P2: `JULIAN`, `JORGE`, `DANNA`, `Juan` · P3: `JULIAN`, `JORGE`, `HEIDY` |
| C | `RECARGA` | La duración asignada | Texto sin lista. Observado: `1 MES`, `SIN ASIGNAR` |
| D | `USUARIO` | El usuario del cliente en el panel | Igual que la columna `USUARIO` de PAGOS / BASE |
| E | `CONTRASEÑA` | Ver el riesgo R3 | — |
| F | `PANEL` | El nombre del panel | `colombia77DM` / `Med3lli454` / `colombia78DM` |
| G | `FECHA` | La fecha y hora de la recarga | Observado: `AAAA-MM-DD hh:mm:ss` |
| H | `ORIGEN` | El motivo (se pueden marcar varios) | `Facturación`, `Promoción`, `Venta`, `Resell`, `Sin Pagar`, `COMPRA`, `Reseller`, `Reconexión`, `Inactivo`, `sin pagar`, `CORTESIA` |
| I | `CREDITO` | Los créditos consumidos | Número. Observado: `1` en recarga, `0` en `SIN ASIGNAR` |
| J | (saldo) | **No editar** | Fórmula: saldo anterior − `CREDITO`. El encabezado de J es el saldo inicial |
| K | `OBSERVACIÓN` | Notas. Observado: `CLIENTE EN P1` | Texto libre |

**Ejemplo ficticio:**

| TC | ASESOR | RECARGA | USUARIO | CONTRASEÑA | PANEL | FECHA | ORIGEN | CREDITO | (saldo) | OBSERVACIÓN |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | JORGE | 1 MES | usuario-ejemplo | — | colombia78DM | 2026-10-15 09:30:00 | Facturación | 1 | (automático) | |

### 7.4 Validar F.VENCIMIENTO

1. En el panel técnico, después de la recarga, lea la nueva fecha de vencimiento del usuario.
2. Verifique que es **posterior al mes en curso** y coherente con la `RECARGA` asignada.
3. **Brecha:** las hojas `CONTROL (OCT)` **no tienen columna para F.VENCIMIENTO**, ni la anterior ni la nueva, aunque el contrato S0-E la exige. Hasta que Dirección decida dónde se registra (D1), **no declare el ciclo cerrado** solo porque existe la fila en CONTROL.

### 7.5 Evidencia de renovación

El servicio se considera renovado con estas tres piezas:
- Una fila en la hoja `CONTROL (OCT)` del panel correcto, con el `USUARIO` del cliente y `CREDITO` ≥ 1.
- El saldo de créditos actualizado en la columna J.
- La nueva F.VENCIMIENTO verificada en el panel.

La evidencia de esta última pieza todavía no tiene campo: ver D1.

## 8. Cruce de las dos capas (match)

Hoy **ninguna fórmula cruza** la capa financiera con la de servicio. El campo común entre las dos hojas es `USUARIO`, junto con el panel:
- `PAGOS OCTUBRE 2026`, columnas `USUARIO` y `PANEL`.
- `CONTROL (OCT) Px`, columnas `USUARIO` y `PANEL`.

El método de cruce propuesto es el de la tabla siguiente. Queda pendiente de aprobación (D7).

| Capa financiera | Capa de servicio | Resultado |
|---|---|---|
| `CONFIRMADO JM` (o `GATE_FINANCIERO = VALIDADO`) | Fila en CONTROL con `CREDITO` ≥ 1 y F.VENCIMIENTO posterior al mes | **Ciclo listo.** Back Office puede actualizar BASE GENERAL |
| `CONFIRMADO JM` | Sin fila en CONTROL | Renovar (sección 7) |
| `PENDIENTE CONFIRMACION` | Fila en CONTROL | **Excepción E6:** se renovó sin confirmación. Escalar |
| `SIN PAGO` | Fila en CONTROL con origen `Promoción` o `CORTESIA` | Debe existir una excepción aprobada. Si no la hay, E6 |
| Cualquiera | `USUARIO` en otra hoja de panel (p. ej. `CLIENTE EN P1`) | Escalar (E7) |

## 9. Errores frecuentes

| Error | Consecuencia | Prevención |
|---|---|---|
| Escribir el nombre del cliente distinto a BASE GENERAL | `SIN BASE`: el pago no llega a PAGOS del mes | Copie el nombre desde BASE GENERAL |
| Llenar dos monedas en TRANSF | La moneda y el valor quedan mal | Llene una sola columna |
| Elegir `CONFIRMADO JM` | Se falsifica la firma financiera de Dirección | Nunca. Solo `PENDIENTE CONFIRMACION` |
| Escribir sobre columnas calculadas | Se rompe la fórmula de toda la fila | Escriba solo en las columnas de las secciones 6.2 y 7.3 |
| Registrar la recarga en la hoja de otro panel | El match falla y el saldo de créditos queda mal | Revise la tabla de la sección 7.1 |
| Usar la pestaña de un mes anterior | El pago no aparece en el ciclo | Use siempre las pestañas `(OCT)` del mes en curso |
| Renovar antes de `CONFIRMADO JM` sin excepción aprobada | Contradice el contrato S0-E | Revise la sección 7.2 |

## 10. Excepciones y escalamiento

El escalamiento sigue el contrato S0-F: responsable → alerta por SLA → siguiente nivel → Julián cuando corresponda. Los destinatarios aplican el ownership de S0-D y S0-E: base → Back Office; validación financiera → Julián; panel técnico → asesor o soporte. Cada fila es una propuesta hasta que Dirección apruebe el manual.

| ID | Situación | A quién | Qué entregar |
|---|---|---|---|
| E1 | `ESTADO_ENLACE = SIN BASE` después de corregir el nombre | Back Office | Hoja, fila y nombre usado |
| E2 | `ESTADO_ENLACE = REQUIERE DECISIÓN` (cliente duplicado) | Back Office | Hoja y fila |
| E3 | `VALIDACION_TARIFA` = `TARIFA ≠ PLAN`, `SIN COINCIDENCIA TARIFA` o `MONEDA NO USD` | Dirección | Valor, plan y moneda |
| E4 | Diferencias del contrato S0-D: pago parcial, pago superior, comisión del medio, diferencia de moneda, valor no identificado | Dirección | Comprobante vinculado y diferencia |
| E5 | `COINCIDENCIAS_FINANCIERAS` > 1 (varios pagos del mismo cliente) | Dirección | Filas de cada medio |
| E6 | Renovación registrada sin `CONFIRMADO JM` ni excepción aprobada | Dirección | Fila de CONTROL |
| E7 | El usuario aparece en un panel distinto al de BASE GENERAL | Soporte / Back Office | Ambos paneles |
| E8 | El saldo de créditos (columna J) llega a 0 o menos | Dirección | Hoja CONTROL y saldo |
| E9 | La F.VENCIMIENTO del panel no coincide con la recarga | Soporte | Usuario y fecha leída |
| E10 | Su nombre no está en la lista de `Asesor` / `ASESOR` | Dirección | Hoja afectada |

## 11. Checklist de cierre por cliente

- [ ] Pago registrado en la hoja de su medio, con `CONFIRMACION = PENDIENTE CONFIRMACION`.
- [ ] `ESTADO_ENLACE = ENLAZADO`.
- [ ] JM marcó `CONFIRMADO JM`, o existe una excepción aprobada.
- [ ] Renovación registrada en la hoja `CONTROL (OCT)` del panel correcto, con `CREDITO` ≥ 1.
- [ ] Nueva F.VENCIMIENTO verificada en el panel, posterior al mes en curso.
- [ ] Excepciones escaladas con su ID (sección 10).
- [ ] No se editaron columnas calculadas ni `BASE GENERAL`.

**Definition of Done del caso:** `GATE_FINANCIERO = VALIDADO` en `PAGOS OCTUBRE 2026` **+** una fila de renovación en `CONTROL (OCT) Px` **+** F.VENCIMIENTO posterior al mes en curso verificada. Con eso, Back Office puede actualizar BASE GENERAL.

## 12. Evidencia: origen de cada campo y regla

Verificado el 2026-10-20 en `GESTION_DIA_PAGOS_2026_TIVIPLAY`. Solo se leyeron encabezados, listas de validación, fórmulas y protecciones; no se copiaron datos de clientes.

| Elemento del manual | Fuente verificada |
|---|---|
| Nombres de hojas del mes | Listado de pestañas del libro |
| Columnas de ZELLE, PAYPAL y TRANSF | Fila de encabezados de cada hoja (3, 2 y 2) |
| Listas de `Asesor`, `Origen`, `CONFIRMACION` y `MEDIO DE PAGO` | Validación de datos de la primera fila de datos |
| `CLIENTE_KEY`, enlace con BASE, `ESTADO_ENLACE`, moneda, tarifa y propuestas | Fórmulas de las columnas calculadas |
| Columnas calculadas protegidas | Rangos protegidos "SISTEMA · columnas calculadas", solo con advertencia |
| `CONFIRMACION` y PAGOS OCTUBRE sin protección | Ausencia de rangos protegidos en esas columnas y hoja |
| Columnas de CONTROL P1/P2/P3, nombre de cada panel y saldo J | Encabezados, título de la fila 1 y fórmula `=J2-I3` |
| Listas de `ASESOR` y `ORIGEN` en CONTROL | Validación de datos (estricta en `ASESOR`) |
| Columnas y gates de `PAGOS OCTUBRE 2026` | Encabezados (fila 3) y fórmulas de `ESTADO`, `T` y de `CONFIRMACION` a `MOTIVO_GATE_FINANCIERO` |
| Regla de los tres requisitos (sección 2) | Instrucción de Dirección del 20/10/2026 |
| Renovar solo con PAGO CONFIRMADO o excepción, y ownership | Contrato S0 v0.2: S0-C, S0-D, S0-E |
| "Observado: …" | Valores vistos en filas de octubre; no son listas cerradas |

## 13. Decisiones pendientes (REQUIERE DECISIÓN)

| ID | Decisión | Por qué bloquea |
|---|---|---|
| D1 | Dónde se registran la F.VENCIMIENTO anterior y la nueva | CONTROL no tiene la columna; S0-E y la regla del ciclo la exigen |
| D2 | Quién actualiza la F.VENCIMIENTO en BASE GENERAL y cuándo | S0 asigna BASE a Back Office, pero no hay un procedimiento ejecutable documentado |
| D3 | Completar las listas de asesor: `MANUELA` falta en CONTROL P2 y P3 y en ZELLE, PAYPAL y TRANSF; `HEIDY` falta en CONTROL P2 | En CONTROL la validación es estricta: no pueden registrarse |
| D4 | A qué hoja CONTROL corresponden `PANEL 3M`, `Canada1996` y `Reseller` | Sin esto, el match por panel falla |
| D5 | Si el asesor usa `SIN PAGO` en `CONFIRMACION` | El valor existe en la lista, pero no tiene regla |
| D6 | Si se permite renovar con origen `Sin Pagar`, `Promoción` o `CORTESIA` sin `CONFIRMADO JM` | La lista lo permite; S0-E exige pago confirmado o excepción aprobada |
| D7 | Aprobar el cruce entre capas por `USUARIO` + panel (sección 8), o definir otro | No hay una fórmula ni un campo de enlace entre PAGOS y CONTROL |

## 14. Riesgos detectados

| ID | Riesgo | Mitigación propuesta (no aplicada) |
|---|---|---|
| R1 | `CONFIRMACION` no está protegida: cualquier editor puede elegir `CONFIRMADO JM` | Proteger la columna para que solo JM la edite, o dejar a los asesores solo `PENDIENTE CONFIRMACION` |
| R2 | Las columnas calculadas de `PAGOS OCTUBRE 2026` no están protegidas | Rango protegido como en las hojas de medios |
| R3 | `CONTROL (OCT) Px` y `PAGOS/BASE` guardan contraseñas de panel en texto plano | Decidir si el registro de renovación necesita la contraseña |
| R4 | Diferencias de escritura: `PENDIENTE CONFIRMACION` (lista) frente a `PENDIENTE CONFIRMACIÓN` (fórmula de PAGOS); `Reseller`/`Resell` y `Sin Pagar`/`sin pagar` en ORIGEN | Normalizar las listas |
