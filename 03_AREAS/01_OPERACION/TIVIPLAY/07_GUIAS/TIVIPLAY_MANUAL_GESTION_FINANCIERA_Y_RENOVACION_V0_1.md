# Manual operativo — Gestión financiera y renovación de servicio TiviPlay

**Versión:** 0.2
**Estado:** PROPUESTO — PENDIENTE DE APROBACIÓN DE DIRECCIÓN
**Fecha de corte:** 2026-10-20 (segunda inspección, después de los cambios de Dirección en CONTROL)
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · Pagos y renovación
**Decisión gobernante:** TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2 (S0-C, S0-D, S0-E) + regla de gate operacional aprobada por Dirección el 20/10/2026

> Este manual describe el trabajo del asesor sobre las hojas vivas de octubre tal como existen al 20/10/2026. Cada hoja, columna y valor permitido se verificó en la hoja real (sección 12). Donde la hoja no permite cumplir una regla, el manual lo marca como **REQUIERE DECISIÓN** y no inventa un procedimiento.
>
> **Operación ≠ auditoría.** Este manual cubre la operación. La conciliación contra extractos bancarios y el cruce con las exportaciones de los paneles son motores de auditoría independientes, fuera de su alcance.

## 1. Propósito

Que el asesor sepa **qué hacer, dónde hacerlo, qué registrar y cómo saber que terminó** cuando un cliente paga y su servicio debe renovarse.

## 2. Gate operacional (regla aprobada)

```text
CONFIRMADO JM
+ RENOVACIÓN REGISTRADA EN EL CONTROL CORRESPONDIENTE
+ F.VENCIMIENTO VÁLIDA Y POSTERIOR AL PERÍODO RENOVADO
= HABILITADO PARA ACTUALIZAR BASE GENERAL
```

| # | Condición | Dónde se ve | Quién la produce |
|---|---|---|---|
| 1 | **Gate financiero:** `CONFIRMACION = CONFIRMADO JM` | Hoja del medio de pago (ZELLE / PAYPAL / TRANSF) y `PAGOS OCTUBRE 2026` | **Solo Dirección (JM)** |
| 2 | **Renovación registrada:** una fila del cliente con `CREDITO` ≥ 1 | `CONTROL (OCT) P1`, `P2` o `P3` | Asesor |
| 3 | **F.VENCIMIENTO** válida y posterior al período renovado | Columna `F.VENCIMIENTO` (H) de la misma fila de CONTROL | Asesor la registra, leída del panel |

Mantenga siempre separados estos estados:
- **Pago reportado o comprobante recibido ≠ `CONFIRMADO JM`.**
- **`CONFIRMADO JM` (pago confirmado) ≠ ciclo completado.**
- **Habilitado para actualizar BASE GENERAL ≠ BASE GENERAL actualizada.** La actualización la hace Back Office (D2) y no forma parte de este manual.

## 3. Alcance

**Incluye:**
- Registrar el pago recibido en la hoja de su medio.
- Seguir el estado financiero en `PAGOS OCTUBRE 2026`.
- Registrar la renovación y su `F.VENCIMIENTO` en CONTROL.
- Determinar si el caso está habilitado, pendiente o en excepción.

**No incluye:**
- Confirmar pagos: exclusivo de JM.
- Editar `BASE GENERAL`.
- Auditoría bancaria y auditoría de paneles.
- Altas de clientes nuevos (S0-A).

## 4. Fuentes que usa el asesor

Libro de Google Sheets **`GESTION_DIA_PAGOS_2026_TIVIPLAY`**, pestañas del mes en curso:

| Hoja | Para qué | Qué hace el asesor |
|---|---|---|
| `PAGOS OCTUBRE 2026` | Cartera del mes: corte de BASE GENERAL del 30/09 | Consulta. Solo escribe en `OBSERVACIONES` |
| `ZELLE (OCT)` | Pagos por Zelle (USD) | Registra el pago |
| `PAYPAL (OCT)` | Pagos por PayPal (USD) | Registra el pago |
| `TRANSF (OCT)` | Bancolombia, Nequi, Davivienda, Western U | Registra el pago |
| `CONTROL (OCT) P1` | Renovaciones del panel `colombia77DM` | Registra la renovación y su F.VENCIMIENTO |
| `CONTROL (OCT) P2` | Renovaciones del panel `Med3lli454` | Registra la renovación y su F.VENCIMIENTO |
| `CONTROL (OCT) P3` | Renovaciones del panel `colombia78DM` | Registra la renovación y su F.VENCIMIENTO |
| `BASE GENERAL` | Universo operacional consolidado | **No edita.** Consulta el nombre exacto del cliente, el `USUARIO` y el `PANEL` |

> Las pestañas de meses anteriores, como `ZELLE (SEPT)` o `CONTROL (SEPT) P2`, son históricas.

## 5. Prerrequisitos

- Acceso de edición al libro.
- Su nombre en la lista de asesor de cada hoja que use (sección 6.2 y 7.3). Hoy **Manuela** puede registrar en CONTROL P1/P2/P3 y en ZELLE, pero **no en PAYPAL ni en TRANSF** (D3).
- Acceso al panel técnico del cliente, para asignar el crédito y leer la nueva fecha de vencimiento.
- El comprobante del cliente.

## 6. CAPA FINANCIERA — Registrar un pago recibido

### 6.1 Elegir la hoja

| Medio | Hoja | Fila de encabezados | Primera fila de datos |
|---|---|---|---|
| Zelle | `ZELLE (OCT)` | 3 | 4 |
| PayPal | `PAYPAL (OCT)` | 2 | 3 |
| Bancolombia, Nequi, Davivienda o Western U | `TRANSF (OCT)` | 2 | 3 |

### 6.2 Columnas que alimenta el asesor

Escriba **solo** en estas columnas. Las siguientes son fórmulas: no las edite aunque no estén protegidas.

**`ZELLE (OCT)`, columnas A a H:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | El mismo TC que el cliente tiene en BASE GENERAL. Observado: `1` | Número |
| B | `Cliente` | El nombre **exactamente igual** a `CLIENTE` de BASE GENERAL | Texto |
| C | `Monto Recibido` | El valor recibido | Número (USD) |
| D | `Fecha` | La fecha del pago | Fecha |
| E | `Asesor` | Su nombre | `JORGE`, `HEIDI`, `JULIAN`, `MANUELA` (estricta) |
| F | `Origen` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` (estricta) |
| G | `Observación` | Notas del caso, sin datos bancarios | Texto libre |
| H | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

**`PAYPAL (OCT)`, columnas A a M:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | Igual que en ZELLE | Número |
| B | `CLIENTE` | El nombre exacto de BASE GENERAL | Texto |
| C | `CORREO` | El correo de la factura | Texto |
| D | `FACTURA ENVIADA` | El valor facturado | Número |
| E | `COMISION PAYPAL` | La comisión del medio | Número |
| F | `MONTO RECIBIDO` | El valor neto recibido | Número (USD) |
| G | `FECHA DE RECIBIDO` | La fecha del pago | Fecha |
| H | `Link de confirmación` | El enlace de la factura | URL |
| I | `FECHA DE CREACION` | La fecha de creación de la factura | Fecha |
| J | `ASESOR` | Su nombre | `Jorge`, `Julian`, `Heidy` (estricta) |
| K | `ORIGEN` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| L | `OBSERVACIÓN` | Notas del caso | Texto libre |
| M | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

**`TRANSF (OCT)`, columnas A a K:**

| Col. | Campo | Qué escribir | Valores permitidos |
|---|---|---|---|
| A | `TC` | Igual que en ZELLE | Número |
| B | `CLIENTE` | El nombre exacto de BASE GENERAL | Texto |
| C | `VALOR EN PESOS` | El valor, **solo si pagó en COP** | Número |
| D | `USD` | El valor, **solo si pagó en USD** | Número |
| E | `CAD` | El valor, **solo si pagó en CAD** | Número |
| F | `MEDIO DE PAGO` | El banco o medio | `BANCOLOMBIA`, `NEQUI`, `DAVIVIENDA`, `WESTERN U` |
| G | `FECHA` | La fecha del pago | Fecha válida |
| H | `ASESOR` | Su nombre | `Jorge`, `Danna`, `Julian`, `Juan`, `Heidy` (estricta) |
| I | `ORIGEN` | El tipo de gestión | `FACTURACIÓN`, `VENTA`, `RECONEXIÓN` |
| J | `OBSERVACIÓN` | Notas del caso | Texto libre |
| K | `CONFIRMACION` | `PENDIENTE CONFIRMACION` | Ver la sección 6.4 |

> **TRANSF: llene una sola columna de moneda.** La hoja la deduce en este orden: USD, luego CAD, luego COP.

### 6.3 Por qué el nombre del cliente debe ser exacto

La hoja calcula `CLIENTE_KEY` (el nombre en mayúsculas y sin espacios sobrantes) y lo busca en `CLIENTE_KEY` de BASE GENERAL **junto con el mismo `TC`**. El resultado queda en `ESTADO_ENLACE` y en `FILA_BASE`:

| `ESTADO_ENLACE` | Significa | Acción |
|---|---|---|
| `ENLAZADO` | Exactamente un cliente. `FILA_BASE` indica su fila en BASE GENERAL | Continúe |
| `SIN BASE` | No encontró nombre más TC | Copie el nombre y el TC desde BASE GENERAL. Si sigue igual, escale E1 |
| `REQUIERE DECISIÓN` | Más de un cliente con ese nombre y TC; `FILA_BASE` queda vacía | No lo resuelva. Escale E2 |

### 6.4 La columna CONFIRMACION — qué NO puede confirmar el asesor

| Valor | Quién lo pone | Significado |
|---|---|---|
| `PENDIENTE CONFIRMACION` | **Asesor** | Registró el pago con su comprobante |
| `CONFIRMADO JM` | **Solo JM** | JM verificó el ingreso real |
| `REQUIERE REVISIÓN` | JM | El pago no coincide en valor, fecha, cliente o medio |
| `SIN PAGO` | REQUIERE DECISIÓN (D5) | Está en la lista, pero no tiene regla de uso |

> **El asesor nunca selecciona `CONFIRMADO JM` ni `REQUIERE REVISIÓN`.** Al 20/10 la hoja **no lo impide**: la columna CONFIRMACION no tiene protección (riesgo **R1, P0**).

### 6.5 Qué calcula la hoja sola (no editar)

| Campo | Qué indica |
|---|---|
| `PLAN_CANONICO`, `DURACION_MESES`, `PANTALLAS` | El plan según BASE GENERAL |
| `MONEDA_PAGO`, `VALOR_PAGO` | La moneda y el valor tomados del registro |
| `VALIDACION_TARIFA` | `COINCIDE PLAN`, `TARIFA ≠ PLAN`, `SIN COINCIDENCIA TARIFA`, `PENDIENTE ENLACE`, `ADD-ON / TARIFA SEPARADA` o `MONEDA NO USD` |
| `PROP_F_ULTIMO`, `PROP_F_PROXIMO`, `PROP_T`, `PROP_ESTADO` | Propuestas de fecha **comercial**. Solo aparecen con `CONFIRMADO JM` + `ENLAZADO` + `COINCIDE PLAN` |
| `ESTADO_PROPUESTA`, `MOTIVO_PROPUESTA`, `GATE_CAMBIO_PLAN` | Estado de la propuesta y su motivo |

> `PROP_F_PROXIMO` es una propuesta para la **F.PRÓXIMO PAGO**, la fecha comercial. **No es la F.VENCIMIENTO**, que es la fecha técnica.

### 6.6 Seguimiento en PAGOS OCTUBRE 2026

| Columna | Qué ve el asesor |
|---|---|
| `ESTADO` / `T` | `Al dia` si `T ≥ 30`; `Por vencer` si `1–29`; `Vencido` si `≤ 0`. `T` son los días hasta la F.PRÓXIMO PAGO |
| `COINCIDENCIAS_FINANCIERAS`, `FUENTE_FINANCIERA`, `FILA_FUENTE` | Qué pago del mes se encontró y en qué hoja y fila |
| `CONFIRMACION_FINANCIERA` | `SIN PAGO`, `PENDIENTE CONFIRMACION`, `CONFIRMADO JM`, `REQUIERE REVISIÓN` o `REQUIERE DECISIÓN` |
| `GATE_FINANCIERO`, `MOTIVO_GATE_FINANCIERO` | `VALIDADO` = "PAGO CONFIRMADO + FECHA + TARIFA + PROPUESTA CALCULADA" |

> **Si `CONFIRMACION` está vacía, la cartera la muestra como `PENDIENTE CONFIRMACION`**: así lo hace la fórmula de `CONFIRMACION_FINANCIERA`. En `PAGOS OCTUBRE 2026` escriba solo en `OBSERVACIONES`. Al 20/10 hay filas en las que las columnas calculadas se sobrescribieron con texto (riesgo R2): repórtelas, no las copie.

### 6.7 Fin de la responsabilidad financiera del asesor

Su parte termina cuando el pago quedó registrado con `PENDIENTE CONFIRMACION` y `ESTADO_ENLACE = ENLAZADO`, o cuando escaló la excepción. Desde ahí, la confirmación es de JM.

## 7. CAPA DE SERVICIO — Registrar la renovación en CONTROL

### 7.1 Elegir la hoja CONTROL

| Panel | Hoja | Nombre del panel (columna F) |
|---|---|---|
| Panel 1 | `CONTROL (OCT) P1` | `colombia77DM` |
| Panel 2 | `CONTROL (OCT) P2` | `Med3lli454` |
| Panel 3 | `CONTROL (OCT) P3` | `colombia78DM` |

> En BASE GENERAL y en PAGOS, la columna `PANEL` usa `PANEL 1`, `PANEL 2`, `PANEL 3`, `PANEL 3M` / `Panel 3M`, entre otros. Se observaron clientes con `PANEL 3` y con `PANEL 3M` registrados en `CONTROL (OCT) P3`, pero la correspondencia **no está aprobada** (D4). Si no tiene claro el panel, escale E7.

### 7.2 Cuándo renovar

Según S0-E, solo con `CONFIRMADO JM` o con una excepción aprobada (mes gratis, promoción, extensión u otra regla autorizada). Antes de renovar, verifique `CONFIRMACION_FINANCIERA = CONFIRMADO JM` o la excepción aprobada.

### 7.3 Columnas que alimenta el asesor

Las tres hojas tienen la misma estructura: encabezados en la fila 2, una fila por evento desde la fila 3.

| Col. | Campo | Qué escribir | Valores |
|---|---|---|---|
| A | `TC` | El TC del registro | Observado: `1` en recarga, `0` en `SIN ASIGNAR` |
| B | `ASESOR` | Su nombre | `JULIAN`, `JORGE`, `HEIDI`, `MANUELA` (estricta, igual en P1/P2/P3) |
| C | `RECARGA` | La duración asignada | Sin lista. Observado: `1 MES`, `2 MESES`, `SIN ASIGNAR`, `LIBERADO` |
| D | `USUARIO` | El usuario del cliente en el panel, sin espacios ni tabulaciones | Igual que `USUARIO` de BASE GENERAL |
| E | `CONTRASEÑA` | Riesgo R3 | — |
| F | `PANEL` | El nombre del panel | `colombia77DM` / `Med3lli454` / `colombia78DM` |
| G | `FECHA` | La fecha y hora del evento | Observado: `AAAA-MM-DD hh:mm:ss` |
| H | **`F.VENCIMIENTO`** | **La nueva fecha de vencimiento que muestra el panel después de la recarga** | Formato fecha `yyyy-mm-dd`. Sin regla de validación de fecha (R6) |
| I | `ORIGEN` | El motivo (se pueden marcar varios) | `Facturación`, `Promoción`, `Venta`, `Resell`, `Sin Pagar`, `COMPRA`, `Reseller`, `Reconexión`, `Inactivo`, `sin pagar`, `CORTESIA` |
| J | `CREDITO` | Los créditos consumidos | Observado: `1` (o `2` en `2 MESES`), `0` sin recarga |
| K | (saldo) | **No editar** | Fórmula `=K2-J3`: saldo anterior − `CREDITO` |
| L | `OBSERVACIÓN` | Notas. Observado: `CLIENTE EN P1` | Texto libre |

> **Filas precargadas:** al 20/10 hay filas con `USUARIO`, `PANEL` y `FECHA` posteriores a hoy, pero sin `TC`, `ASESOR` ni `CREDITO`. Su significado y quién las genera **no está documentado** (D9). No las tome como renovaciones hechas.

### 7.4 Cuándo y cómo registrar F.VENCIMIENTO

1. **Cuándo:** inmediatamente después de asignar el crédito en el panel, en la **misma fila** de la recarga.
2. **Qué representa:** la nueva fecha de vencimiento técnico que muestra el panel como resultado de **esa** recarga.
3. **De dónde sale:** **solo del panel.** No la copie de BASE GENERAL ni de PAGOS, no la calcule y no la estime.
4. **Validez:** debe ser una fecha real y **posterior al período renovado**. En la hoja `CONTROL (OCT)`, eso es posterior al **31/10/2026**.
5. **Sin recarga** (`SIN ASIGNAR`, `CREDITO` = 0): deje `F.VENCIMIENTO` vacía.
6. **No complete fechas en filas antiguas** si no tiene la lectura del panel de ese momento.

**Ejemplo ficticio:**

| TC | ASESOR | RECARGA | USUARIO | CONTRASEÑA | PANEL | FECHA | F.VENCIMIENTO | ORIGEN | CREDITO | (saldo) | OBSERVACIÓN |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | MANUELA | 1 MES | usuario-ejemplo | — | colombia78DM | 2026-10-25 09:30:00 | 2026-11-25 | Facturación | 1 | (automático) | |

## 8. Cruce entre capas: cómo se relacionan el pago y la renovación

No existe una fórmula que cruce las capas. La única cadena **determinística** con los campos actuales es:

```text
Hoja del medio (ESTADO_ENLACE = ENLAZADO)
  → FILA_BASE (fila exacta en BASE GENERAL)
  → BASE GENERAL: USUARIO (col. M) + PANEL (col. O)
  → CONTROL (OCT) del panel: fila(s) con el mismo USUARIO (col. D)
```

Es inequívoca **solo si** se cumplen tres cosas:
1. `ESTADO_ENLACE = ENLAZADO`.
2. Ese `USUARIO` aparece **una sola vez** en BASE GENERAL.
3. Hay **una sola** fila de recarga (`CREDITO` ≥ 1) de ese USUARIO en el CONTROL del panel en el período.

**Casos ambiguos observados en las hojas vivas (REQUIERE DECISIÓN, D7):**

| Caso | Evidencia al 20/10 |
|---|---|
| `USUARIO` repetido en BASE GENERAL | Varios usuarios aparecen en 2 o 3 filas |
| Espacios, tabulaciones o saltos de línea en `USUARIO` | Presentes en BASE GENERAL y en CONTROL P2/P3 |
| Varias filas del mismo USUARIO en un CONTROL | Por ejemplo, `LIBERADO` y `1 MES` del mismo usuario en P3 |
| USUARIO en un CONTROL distinto al panel de BASE | Observado entre P1 y P3, y nota `CLIENTE EN P1` en P2 |
| Planes de varios meses | Clientes con F.PRÓXIMO PAGO en 2027 renuevan mes a mes en CONTROL sin pago en octubre: no está definido qué `CONFIRMADO JM` respalda esa renovación (D8) |

Ante cualquiera de estos casos, **el asesor no elige una fila: escala** (E2, E7 o E11).

### 8.1 Estado del caso

| Capa financiera | Capa de servicio | Estado del caso |
|---|---|---|
| `CONFIRMADO JM` | Fila con `CREDITO` ≥ 1 y `F.VENCIMIENTO` posterior al período | **HABILITADO PARA ACTUALIZAR BASE GENERAL** |
| `CONFIRMADO JM` | Sin fila en CONTROL | Pendiente de servicio: renovar (sección 7) |
| `CONFIRMADO JM` | Fila con `CREDITO` ≥ 1 y `F.VENCIMIENTO` vacía | Pendiente de servicio: registrar la fecha (7.4) |
| `CONFIRMADO JM` | `F.VENCIMIENTO` ≤ 31/10/2026 | **Excepción E9**: no habilita |
| `PENDIENTE CONFIRMACION` o vacía | Cualquiera | **Pendiente financiero**: no habilita |
| `PENDIENTE CONFIRMACION` | Fila con `CREDITO` ≥ 1 | **Excepción E6**: se renovó sin confirmación |
| `REQUIERE REVISIÓN` / `SIN PAGO` | Fila con origen `Promoción`, `CORTESIA` o `Sin Pagar` | Requiere excepción aprobada (D6). Si no la hay, E6 |
| Cualquier caso ambiguo de la sección 8 | — | **REQUIERE DECISIÓN**: escalar |

## 9. Errores frecuentes

| Error | Consecuencia | Prevención |
|---|---|---|
| Nombre del cliente distinto a BASE GENERAL | `SIN BASE` | Copiar el nombre desde BASE GENERAL |
| Dos monedas en TRANSF | Moneda y valor incorrectos | Una sola columna |
| Elegir `CONFIRMADO JM` | Falsifica la validación de Dirección | Nunca |
| Escribir sobre columnas calculadas | Se rompe el gate de la fila | Solo las columnas de 6.2 y 7.3 |
| Copiar `F.VENCIMIENTO` de BASE GENERAL | La evidencia de servicio queda falsa | Leerla del panel |
| Registrar `F.VENCIMIENTO` sin recarga | Habilita un caso sin renovación | Dejarla vacía si `CREDITO` = 0 |
| Recarga en la hoja de otro panel | El cruce falla y el saldo queda mal | Revisar 7.1; si hay duda, E7 |
| Espacios o tabulaciones en `USUARIO` | El cruce falla | Escribir el usuario limpio |
| Usar una pestaña de un mes anterior | El caso no aparece en el ciclo | Pestañas `(OCT)` |

## 10. Excepciones y escalamiento

Escalamiento según S0-F: responsable → alerta por SLA → siguiente nivel → Julián. Ownership según S0-D y S0-E: base → Back Office; validación financiera → Julián; panel → asesor o soporte. Cada fila es una propuesta hasta que Dirección apruebe el manual.

| ID | Situación | A quién | Qué entregar |
|---|---|---|---|
| E1 | `ESTADO_ENLACE = SIN BASE` después de corregir | Back Office | Hoja, fila y nombre usado |
| E2 | `ESTADO_ENLACE = REQUIERE DECISIÓN`, o USUARIO repetido en BASE GENERAL | Back Office | Hoja y filas |
| E3 | `VALIDACION_TARIFA` distinta de `COINCIDE PLAN` | Dirección | Valor, plan y moneda |
| E4 | Diferencias S0-D: parcial, superior, comisión, moneda, no identificado | Dirección | Comprobante y diferencia |
| E5 | `COINCIDENCIAS_FINANCIERAS` > 1 | Dirección | Filas de cada medio |
| E6 | Renovación sin `CONFIRMADO JM` ni excepción aprobada | Dirección | Fila de CONTROL |
| E7 | USUARIO en un panel distinto al de BASE, o panel sin hoja CONTROL | Soporte / Back Office | Ambos paneles |
| E8 | Saldo de créditos (columna K) en 0 o menos | Dirección | Hoja y saldo |
| E9 | `F.VENCIMIENTO` del panel no posterior al período o incoherente con la recarga | Soporte | Fila de CONTROL y fecha leída |
| E10 | Su nombre no está en la lista de asesor | Dirección | Hoja afectada |
| E11 | Plan de varios meses renovado sin pago del mes (D8) | Dirección | Fila de CONTROL y fila de BASE GENERAL |
| E12 | Columnas calculadas de PAGOS sobrescritas | Dirección | Fila de PAGOS |

## 11. Checklist de cierre por cliente

- [ ] Pago registrado con `PENDIENTE CONFIRMACION` y `ESTADO_ENLACE = ENLAZADO`.
- [ ] JM marcó `CONFIRMADO JM`, o existe una excepción aprobada.
- [ ] Recarga registrada en el CONTROL del panel correcto, con `CREDITO` ≥ 1.
- [ ] `F.VENCIMIENTO` registrada en la misma fila, leída del panel y posterior al período renovado.
- [ ] El cruce entre capas es inequívoco (sección 8); si no, escalado.
- [ ] Excepciones escaladas con su ID.
- [ ] No se editaron columnas calculadas ni `BASE GENERAL`.

**Definition of Done del caso:** se cumplen las tres condiciones de la sección 2 y el caso queda **HABILITADO PARA ACTUALIZAR BASE GENERAL**. La actualización de BASE GENERAL es un paso posterior y separado (D2).

## 12. Evidencia: origen de cada campo y regla

Inspecciones del 2026-10-20 en `GESTION_DIA_PAGOS_2026_TIVIPLAY`: encabezados, validaciones, formatos, fórmulas y protecciones. En la segunda inspección se leyeron además columnas operativas para buscar un caso E2E, sin contraseñas, y sin copiar nombres ni usuarios a este documento.

| Elemento del manual | Fuente verificada |
|---|---|
| Hojas del mes | Listado de pestañas |
| Columnas de ZELLE, PAYPAL y TRANSF | Encabezados (filas 3, 2 y 2) |
| Listas de asesor, origen, CONFIRMACION y medio | Validación de datos (estricta) de la primera fila de datos; ZELLE actualizada a `JORGE`, `HEIDI`, `JULIAN`, `MANUELA` |
| `CLIENTE_KEY`, `FILA_BASE`, `ESTADO_ENLACE`, moneda, tarifa y propuestas | Fórmulas de las columnas calculadas |
| CONFIRMACION vacía = `PENDIENTE CONFIRMACION` | Fórmula de `CONFIRMACION_FINANCIERA` en PAGOS OCTUBRE 2026 |
| Protecciones | Solo columnas calculadas de medios, en modo advertencia; CONFIRMACION, PAGOS y CONTROL sin protección |
| `F.VENCIMIENTO` en CONTROL | Encabezado de H2 en P1/P2/P3; formato `yyyy-mm-dd`; sin regla de validación |
| Lista de `ASESOR` en CONTROL | Validación estricta igual en P1/P2/P3; presente al menos en las filas 130 (P1), 12 (P2) y 600 (P3), ausente en la 700 de P3 |
| Saldo de créditos | Fórmula `=K2-J3` en K3 de P1/P2/P3 |
| Cadena del cruce (sección 8) | `FILA_BASE` de los medios + `USUARIO`/`PANEL` de BASE + `USUARIO` de CONTROL |
| Casos ambiguos (sección 8) | Valores observados en BASE GENERAL y CONTROL (OCT) |
| Regla del gate (sección 2) | Instrucción de Dirección del 20/10/2026 |
| Renovar solo con pago confirmado o excepción, y ownership | Contrato S0 v0.2 |
| "Observado: …" | Valores vistos en octubre; no son listas cerradas |

## 13. Estado del gate operacional y evidencia E2E

**Estado: PARCIAL.** La estructura existe, pero no hay un recorrido real completo.

- Al 20/10, en las tres hojas CONTROL solo **2 filas** tienen `F.VENCIMIENTO` diligenciada.
- **P2, fila 3:** es un registro `SIN ASIGNAR` con `CREDITO` 0. No es una renovación.
- **P1, fila 3:** recarga `1 MES` con `CREDITO` 1, pero no cumple el gate:
  - su cliente (BASE GENERAL, fila 478) no figura en la cartera `PAGOS OCTUBRE 2026`, porque es un plan multimes con F.PRÓXIMO PAGO en 2027 (D8). Tampoco aparece como `FILA_BASE` de ningún pago enlazado de octubre; los pagos con varias coincidencias dejan `FILA_BASE` vacía y no permiten descartarlo por completo;
  - la `F.VENCIMIENTO` registrada no es posterior al 31/10/2026 (E9);
  - BASE GENERAL tiene otra fecha (D10).
- **No existe todavía** un caso `CONFIRMADO JM` + CONTROL + `F.VENCIMIENTO` posterior al período. No se fabricó ninguno.

## 14. Decisiones pendientes y estado de brechas

| ID | Tema | Estado |
|---|---|---|
| D1 | `F.VENCIMIENTO` en CONTROL | **IMPLEMENTADO** (columna H en P1/P2/P3, formato fecha). **PARCIAL** en uso: 2 filas diligenciadas, ninguna que cierre el gate |
| D2 | Procedimiento de actualización de BASE GENERAL | REQUIERE DECISIÓN (backlog) |
| D3 | Listas de asesor | **PARCIAL**: CONTROL P1/P2/P3 y ZELLE incluyen `JORGE`, `HEIDI`, `MANUELA`; PAYPAL y TRANSF no incluyen a Manuela y escriben `Heidy` |
| D4 | Hoja CONTROL para `PANEL 3M`, `Canada1996` y `Reseller` | REQUIERE DECISIÓN (backlog) |
| D5 | Uso de `SIN PAGO` | REQUIERE DECISIÓN (backlog) |
| D6 | Renovar con `Sin Pagar`, `Promoción` o `CORTESIA` | REQUIERE DECISIÓN (backlog) |
| D7 | Llave de cruce definitiva entre capas | REQUIERE DECISIÓN: la cadena de la sección 8 no es inequívoca en los casos observados |
| D8 | Gate financiero de planes multimes en renovaciones mensuales | REQUIERE DECISIÓN (nueva, por evidencia real) |
| D9 | Significado de las filas precargadas de CONTROL | REQUIERE DECISIÓN (nueva) |
| D10 | Qué fecha prevalece si `F.VENCIMIENTO` de CONTROL y la de BASE difieren | REQUIERE DECISIÓN. Según S0-E, el panel es el estado técnico real; su verificación es del motor auditor de servicio |

## 15. Riesgos detectados

| ID | Riesgo | Estado | Mitigación propuesta (no aplicada) |
|---|---|---|---|
| R1 | **P0.** CONFIRMACION sin protección en ZELLE (H), PAYPAL (M) y TRANSF (K) | Vigente | Ver el control mínimo abajo |
| R2 | Columnas calculadas de PAGOS sin protección | **Materializado**: hay filas de PAGOS OCTUBRE 2026 con texto escrito en las columnas calculadas | Backlog |
| R3 | Contraseñas de panel en texto plano en CONTROL, PAGOS y BASE | Vigente | Backlog |
| R4 | Escrituras distintas: `HEIDI`/`Heidy`/`HEIDY`, `PENDIENTE CONFIRMACION`/`CONFIRMACIÓN`, `Sin Pagar`/`sin pagar`, `Reseller`/`Resell` | Vigente | Normalizar las listas |
| R5 | Validación de CONTROL P3 ausente en filas finales (fila 700) | Nuevo | Extender la validación a toda la columna |
| R6 | `F.VENCIMIENTO` sin regla "fecha válida": acepta texto | Nuevo | Agregar validación de fecha |

**Control mínimo propuesto para R1, sin rediseñar la hoja:**
1. **Proteger la columna** CONFIRMACION de cada hoja de medio (ZELLE `H4:H`, PAYPAL `M3:M`, TRANSF `K3:K`) con protección real, no "solo advertencia", y como única editora la cuenta de Dirección.
2. **Asesor → pendiente:** deja CONFIRMACION **vacía**. La fórmula de PAGOS ya la muestra como `PENDIENTE CONFIRMACION`, y la hoja de medio como `PENDIENTE CONFIRMADO JM`. No hay que cambiar fórmulas.
3. **Dirección → `CONFIRMADO JM`** o `REQUIERE REVISIÓN`.

Requiere la autorización de Dirección para aplicarse. Cuando se aplique, la instrucción de 6.2 y 6.4 cambia de "escriba `PENDIENTE CONFIRMACION`" a "deje vacía".
