# JUMOCOL OS · Contrato técnico auditable del ciclo de cliente TIVIPLAY — NOV 2026

> **Versión:** 1.1 · **Corte:** 2026-11-19 · **Estado:** VALIDADO para piloto Harry Quintero (ciclo comercial-financiero); PARCIAL para universalización.
> **Repositorio:** `jmmode/jumocol-os` · **Área:** 04 Plataforma y Equipo (dependencias: 00 Gobierno; 01 Cobranza; 02 Finanzas; 03 Comercial).
> **Fuente de verdad operativa:** [GESTION_DIA_PAGOS_2026_TIVIPLAY](https://docs.google.com/spreadsheets/d/1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4/edit) · ID `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4` · locale `es_MX` · timezone `America/Bogota`.

## 0. Alcance, integridad y convenciones

- Se documentan **cinco hojas completas a nivel de estructura de columnas**, y las **fórmulas realmente leídas en filas de referencia** de cada hoja. Los bloques de código son transcripciones literales del valor `userEnteredValue.formulaValue`, no propuestas nuevas.
- No es un volcado de cada celda de las 2545/1016/1006 filas; no sería prudente publicar datos personales, credenciales ni datos bancarios de clientes en GitHub. Para cada hoja se incluyen todas las columnas físicas hasta el límite de interés, incluso campos vacíos, con clasificación `FÓRMULA`, `ENTRADA`, `VACÍO` y `SIN ENCABEZADO`.
- Una fila representativa **no demuestra** que todas las filas tengan la misma fórmula. El despliegue masivo se bloquea hasta muestreo de 10 casos y auditoría de diferencias.
- Los campos con cabecera `CONTRASEÑA`, teléfono, correo, enlace de factura y observaciones personales quedan mapeados **solo por su cabecera**, sin valores. Las fórmulas pueden contener nombres/rangos de hojas y no deben exponerse fuera de repositorio controlado.
- `VALIDADO` implica evidencia de un caso; `IMPLEMENTADO` implica fórmula presente; `NO IMPLEMENTADO` significa que aún no existe gate universal comprobado. No confundir documentación con estado vivo.

## 1. Localizadores exactos de hojas y casos

| Hoja exacta | sheetId | Fila cabecera | Fila modelo | Columnas físicas inspeccionadas |
|---|---:|---:|---:|---|
| `BASE GENERAL` | 1013112049 | 2 | 771 | A:EC |
| `PAGOS NOVIEMBRE 2026` | 1270065975 | 2 | 5 | A:AQ |
| `ZELLE (NOV)` | 380788924 | 3 | 14 | A:AD |
| `PAYPAL (NOV)` | 1791695120 | 2 | 3 | A:AI |
| `TRANSF (NOV)` | 1561939911 | 2 | 5 | A:AG |
| `PAGOS NOVIEMBRE 2026` (validaciones) | 1270065975 | 123 | 124 | A:Q |

**Caso de referencia:** `ZELLE (NOV)!14` → `PAGOS NOVIEMBRE 2026!5` y `!124` → `BASE GENERAL!771`. Movimiento `ZELLE-NOV-14`; plan base `TVP26_010` a USD 150, 12 meses + 3 meses de bonificación, 3 TV, 1 celular.
**Estado validado:** confirmación JM y comercial; último pago `2026-11-04`; próximo pago `2028-02-04`; `Al dia`. La vigencia técnica `BASE GENERAL!Q771` es independiente.

## 2. Contrato de estados, responsables y gates

| Condición origen | Acción permitida | Evidencia requerida | ¿Repliega datos maestros? |
|---|---|---|---|
| `SIN PAGO` | Mantener fotografía histórica mensual | Sin nuevo pago | No |
| `VALIDACION COMERCIAL` | Crear entrada en bloque comercial y revisar tarifa | Movimiento identificable, enlace, precio, código y configuración | No |
| `PENDIENTE CONFIRMACION` | Julián revisa el recaudo | Configuración validada por asesor si fue excepción | No |
| `CONFIRMADO JM` | Autorizar pago registrado | Julián + movimiento enlazado; si hubo excepción, `K=VALIDADO` y `Q=CONFIRMADO` | Sí, solo con gate completo |

**Importante:** en el piloto el registro de validación comercial está acoplado a `CONFIRMADO JM`; por tanto, las transiciones indicadas son el **contrato objetivo**, no una demostración de implementación universal (brecha P0-01).

## 3. Inventario físico de todas las columnas

### 3.1 · BASE GENERAL
Maestro / contrato de cliente. El dato Q (vencimiento técnico) es diferente a S (próximo cobro).

| Columna | Encabezado en hoja | Fila de referencia | Tipo observado | Valor técnico de ejemplo (no PII) |
|---|---|---:|---|---|
| `A` | TC | 771 | ENTRADA NÚMERO | [reservado] |
| `B` | CLIENTE | 771 | ENTRADA TEXTO | [reservado] |
| `C` | TELEFONO | 771 | ENTRADA TEXTO | [reservado] |
| `D` | CORREO | 771 | ENTRADA TEXTO | [reservado] |
| `E` | ESTADO | 771 | FÓRMULA | Al dia |
| `F` | OBSERVACIONES GESTION | 771 | ENTRADA TEXTO | [reservado] |
| `G` | PLAN ACTIVO | 771 | ENTRADA TEXTO | PLAN 12 MESES+3 |
| `H` | PANTALLAS | 771 | ENTRADA NÚMERO | 3 |
| `I` | CELULAR | 771 | ENTRADA NÚMERO | 1 |
| `J` | USD | 771 | ENTRADA NÚMERO | 150 |
| `K` | COP | 771 | ENTRADA TEXTO | - |
| `L` | MÉTODO DE PAGO | 771 | ENTRADA TEXTO | ZELLE |
| `M` | ID | 771 | VACÍO |  |
| `N` | USUARIO | 771 | ENTRADA TEXTO | [reservado] |
| `O` | CONTRASEÑA | 771 | ENTRADA NÚMERO | [reservado] |
| `P` | PANEL | 771 | ENTRADA TEXTO | PANEL 3 |
| `Q` | F.VENCIMIENTO | 771 | FÓRMULA | 2026-12-04 |
| `R` | F.ULTIMO PAGO | 771 | FÓRMULA | 04-11-26 |
| `S` | F. PRÓXIMO PAGO | 771 | FÓRMULA | 04-02-28 |
| `T` | T | 771 | FÓRMULA | 442 |
| `U` | REFERIDO | 771 | ENTRADA TEXTO | 16/10(J) Se activa Jairon Andres Muñoz pdt… |
| `V` | DISPOSITIVOS | 771 | ENTRADA TEXTO | [reservado] |
| `W` | OBSERVACIONES ASESOR | 771 | ENTRADA TEXTO | [reservado] |
| `X` | CUMPLEAÑOS  | 771 | VACÍO |  |
| `Y` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | PLAN PRINCIPAL |
| `Z` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | PLN_12_B3 |
| `AA` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | PLAN 12 MESES + 3 |
| `AB` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 15 |
| `AC` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 04-11-26 |
| `AD` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 0 |
| `AE` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | PAGO EN FECHA DE CICLO |
| `AF` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 04-02-28 |
| `AG` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 0 |
| `AH` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | HARRY QUINTERO |
| `AI` | _(sin encabezado en fila 2)_ | 771 | ENTRADA NÚMERO | 04-11-26 |
| `AJ` | _(sin encabezado en fila 2)_ | 771 | ENTRADA NÚMERO | 02-11-25 |
| `AK` | _(sin encabezado en fila 2)_ | 771 | ENTRADA NÚMERO | 02-11-26 |
| `AL` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 1 |
| `AM` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 04-12-26 |
| `AN` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | CONFIRMADO JM |
| `AO` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 04-11-26 |
| `AP` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | 04-02-28 |
| `AQ` | _(sin encabezado en fila 2)_ | 771 | FÓRMULA | HABILITADO PARA ACTUALIZAR BASE |
| `AR` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AS` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AT` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AU` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AV` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AW` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AX` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AY` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `AZ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BA` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BB` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BC` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BD` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BE` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BF` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BG` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BH` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BI` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BJ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BK` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BL` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BM` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BN` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BO` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BP` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BQ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BR` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BS` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BT` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BU` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BV` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BW` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BX` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BY` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `BZ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CA` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CB` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CC` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CD` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CE` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CF` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CG` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CH` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CI` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CJ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CK` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CL` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CM` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CN` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CO` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CP` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CQ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CR` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CS` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CT` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CU` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CV` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CW` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CX` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CY` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `CZ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DA` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DB` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DC` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DD` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DE` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DF` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DG` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DH` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DI` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DJ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DK` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DL` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DM` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DN` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DO` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DP` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DQ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DR` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DS` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DT` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DU` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DV` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DW` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DX` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DY` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `DZ` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `EA` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `EB` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |
| `EC` | _(sin encabezado en fila 2)_ | 771 | VACÍO |  |

### 3.2 · PAGOS NOVIEMBRE 2026
Fotografía de apertura y gestión mensual. Subsección comercial en fila 123-124.

| Columna | Encabezado en hoja | Fila de referencia | Tipo observado | Valor técnico de ejemplo (no PII) |
|---|---|---:|---|---|
| `A` | TC | 5 | ENTRADA NÚMERO | 1 |
| `B` | CLIENTE | 5 | ENTRADA TEXTO | [reservado] |
| `C` | TELEFONO | 5 | ENTRADA TEXTO | [reservado] |
| `D` | CORREO | 5 | ENTRADA TEXTO | [reservado] |
| `E` | ESTADO | 5 | FÓRMULA | Al dia |
| `F` | OBSERVACIONES GESTION | 5 | ENTRADA TEXTO | [reservado] |
| `G` | PLAN ACTIVO | 5 | FÓRMULA | PLAN 12 MESES+3 |
| `H` | PANTALLAS | 5 | FÓRMULA | 3 |
| `I` | CELULAR | 5 | FÓRMULA | 1 |
| `J` | USD | 5 | ENTRADA NÚMERO | 150 |
| `K` | COP | 5 | ENTRADA TEXTO | - |
| `L` | MÉTODO DE PAGO | 5 | ENTRADA TEXTO | ZELLE |
| `M` | USUARIO | 5 | ENTRADA TEXTO | [reservado] |
| `N` | CONTRASEÑA | 5 | VACÍO | [reservado] |
| `O` | PANEL | 5 | ENTRADA TEXTO | PANEL 1 |
| `P` | F.VENCIMIENTO | 5 | ENTRADA NÚMERO | 2026-11-04 |
| `Q` | F.ULTIMO PAGO | 5 | FÓRMULA | 04-11-26 |
| `R` | F. PRÓXIMO PAGO | 5 | FÓRMULA | 4/2/2028 |
| `S` | T | 5 | FÓRMULA | 442 |
| `T` | REFERIDO | 5 | VACÍO |  |
| `U` | DISPOSITIVOS | 5 | VACÍO | [reservado] |
| `V` | OBSERVACIONES ASESOR | 5 | ENTRADA TEXTO | [reservado] |
| `W` | CONFIRMACION | 5 | FÓRMULA | CONFIRMADO JM |
| `X` | ORIGEN BASE | 5 | ENTRADA TEXTO | BASE GENERAL!771 |
| `Y` | CLIENTE_KEY_PAGO | 5 | FÓRMULA | [reservado] |
| `Z` | COINCIDENCIAS_FINANCIERAS | 5 | FÓRMULA | 1 |
| `AA` | FUENTE_FINANCIERA | 5 | FÓRMULA | ZELLE (NOV) |
| `AB` | FILA_FUENTE | 5 | FÓRMULA | 14 |
| `AC` | FECHA_PAGO | 5 | FÓRMULA | 04-11-26 |
| `AD` | MONEDA_PAGO | 5 | FÓRMULA | USD |
| `AE` | VALOR_PAGO | 5 | FÓRMULA | 150.00 |
| `AF` | VALIDACION_TARIFA | 5 | FÓRMULA | VALIDADO COMERCIAL |
| `AG` | CONFIRMACION_FINANCIERA | 5 | FÓRMULA | CONFIRMADO JM |
| `AH` | SEMANA | 5 | ENTRADA NÚMERO | 1 |
| `AI` | CLASIFICACION_BORRADOR | 5 | ENTRADA TEXTO | FACTURABLE |
| `AJ` | CATEGORIA | 5 | VACÍO |  |
| `AK` | CAUSA / ACCIÓN | 5 | VACÍO |  |
| `AL` | RESPONSABLE | 5 | ENTRADA TEXTO | EQUIPO COBROS |
| `AM` | ID_BORRADOR | 5 | ENTRADA TEXTO | [reservado] |
| `AN` | ESTADO_COBRO | 5 | ENTRADA TEXTO | EN REVISIÓN |
| `AO` | FECHA_GESTION | 5 | VACÍO |  |
| `AP` | GESTIONADO_POR | 5 | VACÍO | [reservado] |
| `AQ` | NOTA_EQUIPO | 5 | VACÍO |  |

### 3.3 · ZELLE (NOV)
Método de pago ZELLE, enlace base, propuestas y validación tarifaria.

| Columna | Encabezado en hoja | Fila de referencia | Tipo observado | Valor técnico de ejemplo (no PII) |
|---|---|---:|---|---|
| `A` | TC | 14 | ENTRADA NÚMERO | 1 |
| `B` | Cliente | 14 | ENTRADA TEXTO | [reservado] |
| `C` | Monto Recibido | 14 | ENTRADA NÚMERO | $150 |
| `D` | Fecha | 14 | ENTRADA NÚMERO | 04-11-26 |
| `E` | Asesor | 14 | ENTRADA TEXTO | JORGE |
| `F` | Origen | 14 | ENTRADA TEXTO | FACTURACIÓN |
| `G` | Observación | 14 | VACÍO |  |
| `H` | CONFIRMACION | 14 | ENTRADA TEXTO | CONFIRMADO JM |
| `I` | CLIENTE_KEY | 14 | FÓRMULA | [reservado] |
| `J` | COINCIDENCIAS_BASE | 14 | FÓRMULA | 1 |
| `K` | FILA_BASE | 14 | FÓRMULA | 771 |
| `L` | TIPO_SERVICIO | 14 | FÓRMULA | PLAN PRINCIPAL |
| `M` | PLAN_CANONICO | 14 | FÓRMULA | PLAN 12 MESES + 3 |
| `N` | DURACION_MESES | 14 | FÓRMULA | 15 |
| `O` | PANTALLAS | 14 | FÓRMULA | 3 |
| `P` | ESTADO_ENLACE | 14 | FÓRMULA | ENLAZADO |
| `Q` | MONEDA_PAGO | 14 | FÓRMULA | USD |
| `R` | VALOR_PAGO | 14 | FÓRMULA | 150 |
| `S` | MESES_TARIFA_2026 | 14 | FÓRMULA |  |
| `T` | VALIDACION_TARIFA | 14 | FÓRMULA | SIN COINCIDENCIA TARIFA |
| `U` | PROP_F_ULTIMO | 14 | FÓRMULA |  |
| `V` | PROP_F_PROXIMO | 14 | FÓRMULA |  |
| `W` | PROP_T | 14 | FÓRMULA |  |
| `X` | PROP_ESTADO | 14 | FÓRMULA |  |
| `Y` | ESTADO_PROPUESTA | 14 | FÓRMULA | REQUIERE DECISIÓN |
| `Z` | MOTIVO_PROPUESTA | 14 | FÓRMULA | PENDIENTE VALIDACIÓN TARIFA |
| `AA` | TARIFA_MESES_OBJETIVO | 14 | FÓRMULA | 12 |
| `AB` | TARIFA_PANTALLAS_OBJETIVO | 14 | FÓRMULA | 2 |
| `AC` | TIPO_CAMBIO | 14 | FÓRMULA | CAMBIO PLAN |
| `AD` | GATE_CAMBIO_PLAN | 14 | FÓRMULA | REQUIERE DECISIÓN |

### 3.4 · PAYPAL (NOV)
Método de pago PAYPAL: el campo recibido es importe neto; contiene factura/comisión y propuesta de cobro.

| Columna | Encabezado en hoja | Fila de referencia | Tipo observado | Valor técnico de ejemplo (no PII) |
|---|---|---:|---|---|
| `A` | TC | 3 | ENTRADA NÚMERO | 1 |
| `B` | CLIENTE | 3 | ENTRADA TEXTO | [reservado] |
| `C` | CORREO | 3 | ENTRADA TEXTO | [reservado] |
| `D` | FACTURA ENVIADA | 3 | ENTRADA TEXTO | [reservado] |
| `E` | "COMISION  PAYPAL" | 3 | ENTRADA TEXTO | 6,31 |
| `F` | MONTO RECIBIDO | 3 | ENTRADA NÚMERO | 105 |
| `G` | FECHA DE RECIBIDO | 3 | ENTRADA NÚMERO | 01-11-26 |
| `H` | Link de confirmación | 3 | ENTRADA TEXTO | [reservado] |
| `I` | FECHA DE CREACION | 3 | ENTRADA NÚMERO | 28-10-26 |
| `J` | ASESOR | 3 | ENTRADA TEXTO | Manuela |
| `K` | ORIGEN | 3 | ENTRADA TEXTO | RECONEXIÓN |
| `L` | OBSERVACIÓN | 3 | VACÍO |  |
| `M` | CONFIRMACION | 3 | ENTRADA TEXTO | CONFIRMADO JM |
| `N` | CLIENTE_KEY | 3 | FÓRMULA | [reservado] |
| `O` | COINCIDENCIAS_BASE | 3 | FÓRMULA | 1 |
| `P` | FILA_BASE | 3 | FÓRMULA | 770 |
| `Q` | TIPO_SERVICIO | 3 | FÓRMULA | PLAN PRINCIPAL |
| `R` | PLAN_CANONICO | 3 | FÓRMULA | PLAN 6 MESES |
| `S` | DURACION_MESES | 3 | FÓRMULA | 6 |
| `T` | PANTALLAS | 3 | FÓRMULA | 3 |
| `U` | ESTADO_ENLACE | 3 | FÓRMULA | ENLAZADO |
| `V` | MONEDA_PAGO | 3 | FÓRMULA | USD |
| `W` | VALOR_PAGO | 3 | FÓRMULA | 105 |
| `X` | MESES_TARIFA_2026 | 3 | FÓRMULA | 6 |
| `Y` | VALIDACION_TARIFA | 3 | FÓRMULA | COINCIDE PLAN |
| `Z` | PROP_F_ULTIMO | 3 | FÓRMULA | 01-11-26 |
| `AA` | PROP_F_PROXIMO | 3 | FÓRMULA | 1/5/2027 |
| `AB` | PROP_T | 3 | FÓRMULA | 163 |
| `AC` | PROP_ESTADO | 3 | FÓRMULA | Al dia |
| `AD` | ESTADO_PROPUESTA | 3 | FÓRMULA | VALIDADO |
| `AE` | MOTIVO_PROPUESTA | 3 | FÓRMULA | PROPUESTA CALCULADA |
| `AF` | TARIFA_MESES_OBJETIVO | 3 | FÓRMULA | 6 |
| `AG` | TARIFA_PANTALLAS_OBJETIVO | 3 | FÓRMULA | 3 |
| `AH` | TIPO_CAMBIO | 3 | FÓRMULA | SIN CAMBIO |
| `AI` | GATE_CAMBIO_PLAN | 3 | FÓRMULA | VALIDADO |

### 3.5 · TRANSF (NOV)
Transferencias y medios locales: distinguir USD/CAD/COP, enlazado y conversión.

| Columna | Encabezado en hoja | Fila de referencia | Tipo observado | Valor técnico de ejemplo (no PII) |
|---|---|---:|---|---|
| `A` | TC | 5 | ENTRADA NÚMERO | 1 |
| `B` | CLIENTE | 5 | ENTRADA TEXTO | [reservado] |
| `C` | VALOR EN PESOS | 5 | ENTRADA NÚMERO | $93,000 |
| `D` | USD | 5 | ENTRADA NÚMERO | 30.00 |
| `E` | CAD | 5 | ENTRADA NÚMERO | 0 |
| `F` | MEDIO DE PAGO | 5 | ENTRADA TEXTO | [reservado] |
| `G` | FECHA | 5 | ENTRADA NÚMERO | 05-11-26 |
| `H` | ASESOR | 5 | ENTRADA TEXTO | Jorge |
| `I` | ORIGEN | 5 | ENTRADA TEXTO | FACTURACIÓN |
| `J` | OBSERVACIÓN | 5 | ENTRADA TEXTO | Nequi |
| `K` | CONFIRMACION | 5 | ENTRADA TEXTO | CONFIRMADO JM |
| `L` | CLIENTE_KEY | 5 | FÓRMULA | [reservado] |
| `M` | COINCIDENCIAS_BASE | 5 | FÓRMULA | 2 |
| `N` | FILA_BASE | 5 | FÓRMULA |  |
| `O` | TIPO_SERVICIO | 5 | FÓRMULA |  |
| `P` | PLAN_CANONICO | 5 | FÓRMULA |  |
| `Q` | DURACION_MESES | 5 | FÓRMULA |  |
| `R` | PANTALLAS | 5 | FÓRMULA |  |
| `S` | ESTADO_ENLACE | 5 | FÓRMULA | REQUIERE DECISIÓN |
| `T` | MONEDA_PAGO | 5 | FÓRMULA | USD |
| `U` | VALOR_PAGO | 5 | FÓRMULA | 30 |
| `V` | MESES_TARIFA_2026 | 5 | FÓRMULA |  |
| `W` | VALIDACION_TARIFA | 5 | FÓRMULA | PENDIENTE ENLACE |
| `X` | PROP_F_ULTIMO | 5 | FÓRMULA |  |
| `Y` | PROP_F_PROXIMO | 5 | FÓRMULA |  |
| `Z` | PROP_T | 5 | FÓRMULA |  |
| `AA` | PROP_ESTADO | 5 | FÓRMULA |  |
| `AB` | ESTADO_PROPUESTA | 5 | FÓRMULA | REQUIERE DECISIÓN |
| `AC` | MOTIVO_PROPUESTA | 5 | FÓRMULA | PENDIENTE ENLACE |
| `AD` | TARIFA_MESES_OBJETIVO | 5 | FÓRMULA | 2 |
| `AE` | TARIFA_PANTALLAS_OBJETIVO | 5 | FÓRMULA | 2 |
| `AF` | TIPO_CAMBIO | 5 | FÓRMULA | PENDIENTE ENLACE |
| `AG` | GATE_CAMBIO_PLAN | 5 | FÓRMULA | PARCIAL |

### 3.6 · Bloque VALIDACIONES COMERCIALES — `PAGOS NOVIEMBRE 2026!A123:Q124`

| Columna | Encabezado | Fila Harry | Tipo | Resultado |
|---|---|---:|---|---|
| `A` | ID MOVIMIENTO | 124 | FÓRMULA | ZELLE-NOV-14 |
| `B` | CLIENTE | 124 | FÓRMULA | [cliente del piloto] |
| `C` | FUENTE | 124 | FÓRMULA | ZELLE (NOV) |
| `D` | FILA ORIGEN | 124 | FÓRMULA | 14 |
| `E` | VALOR USD | 124 | FÓRMULA | 150 |
| `F` | PLAN ACTUAL | 124 | FÓRMULA | PLAN 12 MESES + 3 |
| `G` | OFERTAS COMPATIBLES | 124 | FÓRMULA | TVP26_010 · 12 meses base / 2 pantallas |
| `H` | PLAN SELECCIONADO | 124 | ENTRADA | TVP26_010 |
| `I` | MESES | 124 | FÓRMULA | 15 |
| `J` | PANTALLAS | 124 | FÓRMULA | 3 |
| `K` | ESTADO VALIDACIÓN | 124 | FÓRMULA | VALIDADO |
| `L` | RESPONSABLE | 124 | ENTRADA | JULIAN |
| `M` | MESES GRATIS | 124 | ENTRADA | 3 |
| `N` | PANTALLAS EXTRA | 124 | ENTRADA | 1 |
| `O` | CELULAR | 124 | ENTRADA | 1 |
| `P` | CONFIGURACIÓN FINAL | 124 | FÓRMULA | 15 MESES \| 3 PANTALLAS TV \| 1 CELULAR |
| `Q` | CONFIRMACIÓN ASESOR | 124 | ENTRADA | CONFIRMADO |

## 4. Inventario literal de fórmulas verificadas

**Modo de lectura:** cada bloque = fórmula realmente guardada en la celda indicada. No copiar entre métodos ni arrastrar referencias absolutas. No se incluyen valores de cliente ni contraseñas.
### 4.1 · BASE GENERAL (fila 771)

#### `BASE GENERAL!E771`
```gs
=IF(T771>5,"Al dia",IF(AND(T771>=1,T771<=5),"Por vencer","Vencido"))
```

#### `BASE GENERAL!Q771`
```gs
=IF(B771="",AI771,IF(AND(AN771="CONFIRMADO JM",AL771>=1,AM771<>""),MAX(IF(ISNUMBER(AI771),AI771,0),AM771),AI771))
```

#### `BASE GENERAL!R771`
```gs
=IF(B771="",AJ771,IF(AND(AN771="CONFIRMADO JM",ISNUMBER(AO771)),IF(ISNUMBER(AJ771),MAX(AJ771,AO771),AO771),AJ771))
```

#### `BASE GENERAL!S771`
```gs
=IF(B771="",AK771,IF(AND(AN771="CONFIRMADO JM",ISNUMBER(AP771)),IF(ISNUMBER(AK771),MAX(AK771,AP771),AP771),AK771))
```

#### `BASE GENERAL!T771`
```gs
=S771-TODAY()
```

#### `BASE GENERAL!Y771`
```gs
=IF(G771="","",IF(REGEXMATCH(UPPER(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," ")))),"^(VENTAS .*EXCEPCI|DESACTIVADOS |REACTIVACIONES |TOTAL |⬇|⬆)"),"IGNORAR ESTRUCTURA",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:E,2,FALSE),IF(COUNTIF(CATALOGO_PLANES!B:B,TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))))>0,"PLAN PRINCIPAL",IF(COUNTIF(CATALOGO_ADDONS!B:B,TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))))>0,"ADD-ON","REQUIERE DECISIÓN")))))
```

#### `BASE GENERAL!Z771`
```gs
=IF(OR(Y771="",Y771="IGNORAR ESTRUCTURA",Y771="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:D,4,FALSE),IF(Y771="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))
```

#### `BASE GENERAL!AA771`
```gs
=IF(OR(Y771="",Y771="IGNORAR ESTRUCTURA",Y771="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:C,3,FALSE),IF(Y771="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G771,CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))
```

#### `BASE GENERAL!AB771`
```gs
=IF(OR(Y771="",Y771="IGNORAR ESTRUCTURA",Y771="REQUIERE DECISIÓN"),"",IF(Y771="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!E:E,MATCH(Z771,CATALOGO_PLANES!A:A,0)),INDEX(CATALOGO_ADDONS!C:C,MATCH(Z771,CATALOGO_ADDONS!A:A,0))))
```

#### `BASE GENERAL!AC771`
```gs
=IF(OR(Y771="",Y771="IGNORAR ESTRUCTURA",Y771="REQUIERE DECISIÓN",R771="",S771="",AB771=""),"",IFERROR(EDATE(S771,-AB771),""))
```

#### `BASE GENERAL!AD771`
```gs
=IF(AC771="","",IFERROR(R771-AC771,""))
```

#### `BASE GENERAL!AE771`
```gs
=IF(AND(AC771<>"",AD771=""),"FECHA ULTIMO PAGO INVALIDA",IF(AD771="","",IF(AD771=0,"PAGO EN FECHA DE CICLO",IF(AD771>0,"PAGO POSTERIOR AL CICLO","PAGO ANTERIOR AL CICLO"))))
```

#### `BASE GENERAL!AF771`
```gs
=IF(OR(R771="",AB771=""),"",IFERROR(EDATE(R771,AB771),""))
```

#### `BASE GENERAL!AG771`
```gs
=IF(AND(S771<>"",R771<>"",AF771=""),"FECHA ULTIMO PAGO INVALIDA",IF(OR(S771="",AF771=""),"",IFERROR(S771-AF771,"")))
```

#### `BASE GENERAL!AH771`
```gs
=IF(B771="","",UPPER(TRIM(CLEAN(SUBSTITUTE(B771,CHAR(160)," ")))))
```

#### `BASE GENERAL!AL771`
```gs
=IF(N771="","",IFERROR(MAX(FILTER({'CONTROL (NOV) P1'!K:K;'CONTROL (NOV) P2'!K:K;'CONTROL (NOV) P3'!L:L},{'CONTROL (NOV) P1'!E:E;'CONTROL (NOV) P2'!E:E;'CONTROL (NOV) P3'!E:E}=N771)),0))
```

#### `BASE GENERAL!AM771`
```gs
=IF(OR(N771="",AL771<1),"",IFERROR(MAX(FILTER({'CONTROL (NOV) P1'!H:H;'CONTROL (NOV) P2'!H:H;'CONTROL (NOV) P3'!H:H},{'CONTROL (NOV) P1'!E:E;'CONTROL (NOV) P2'!E:E;'CONTROL (NOV) P3'!E:E}=N771,{'CONTROL (NOV) P1'!K:K;'CONTROL (NOV) P2'!K:K;'CONTROL (NOV) P3'!L:L}>=1)),""))
```

#### `BASE GENERAL!AN771`
```gs
=IF(AND($B771='PAGOS NOVIEMBRE 2026'!$B$5,$N771='PAGOS NOVIEMBRE 2026'!$M$5,$AH771='PAGOS NOVIEMBRE 2026'!$Y$5,'PAGOS NOVIEMBRE 2026'!$X$5="BASE GENERAL!771",'PAGOS NOVIEMBRE 2026'!$W$5="CONFIRMADO JM",'PAGOS NOVIEMBRE 2026'!$AF$5="VALIDADO COMERCIAL",'PAGOS NOVIEMBRE 2026'!$AA$5="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$AB$5=14,'PAGOS NOVIEMBRE 2026'!$AE$5=150,'PAGOS NOVIEMBRE 2026'!$Q$124="CONFIRMADO",'PAGOS NOVIEMBRE 2026'!$K$124="VALIDADO",'PAGOS NOVIEMBRE 2026'!$C$124="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$D$124=14,'PAGOS NOVIEMBRE 2026'!$E$124='PAGOS NOVIEMBRE 2026'!$AE$5,'PAGOS NOVIEMBRE 2026'!$G$5=$G771,'PAGOS NOVIEMBRE 2026'!$H$5=$H771,'PAGOS NOVIEMBRE 2026'!$I$5=$I771,ISNUMBER('PAGOS NOVIEMBRE 2026'!$Q$5),ISNUMBER('PAGOS NOVIEMBRE 2026'!$R$5),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=ROW()),"CONFIRMADO JM",IF(B771="","",IF(SUM(COUNTIFS('ZELLE (NOV)'!K:K,ROW(),'ZELLE (NOV)'!H:H,"CONFIRMADO JM",'ZELLE (NOV)'!P:P,"ENLAZADO",'ZELLE (NOV)'!Y:Y,"VALIDADO",'ZELLE (NOV)'!AD:AD,"VALIDADO"),COUNTIFS('PAYPAL (NOV)'!P:P,ROW(),'PAYPAL (NOV)'!M:M,"CONFIRMADO JM",'PAYPAL (NOV)'!U:U,"ENLAZADO",'PAYPAL (NOV)'!AD:AD,"VALIDADO",'PAYPAL (NOV)'!AI:AI,"VALIDADO"),COUNTIFS('TRANSF (NOV)'!N:N,ROW(),'TRANSF (NOV)'!K:K,"CONFIRMADO JM",'TRANSF (NOV)'!S:S,"ENLAZADO",'TRANSF (NOV)'!AB:AB,"VALIDADO",'TRANSF (NOV)'!AG:AG,"VALIDADO"))>0,"CONFIRMADO JM","")))
```

#### `BASE GENERAL!AO771`
```gs
=IF(AND($B771='PAGOS NOVIEMBRE 2026'!$B$5,$N771='PAGOS NOVIEMBRE 2026'!$M$5,$AH771='PAGOS NOVIEMBRE 2026'!$Y$5,'PAGOS NOVIEMBRE 2026'!$X$5="BASE GENERAL!771",'PAGOS NOVIEMBRE 2026'!$W$5="CONFIRMADO JM",'PAGOS NOVIEMBRE 2026'!$AF$5="VALIDADO COMERCIAL",'PAGOS NOVIEMBRE 2026'!$AA$5="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$AB$5=14,'PAGOS NOVIEMBRE 2026'!$AE$5=150,'PAGOS NOVIEMBRE 2026'!$Q$124="CONFIRMADO",'PAGOS NOVIEMBRE 2026'!$K$124="VALIDADO",'PAGOS NOVIEMBRE 2026'!$C$124="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$D$124=14,'PAGOS NOVIEMBRE 2026'!$E$124='PAGOS NOVIEMBRE 2026'!$AE$5,'PAGOS NOVIEMBRE 2026'!$G$5=$G771,'PAGOS NOVIEMBRE 2026'!$H$5=$H771,'PAGOS NOVIEMBRE 2026'!$I$5=$I771,ISNUMBER('PAGOS NOVIEMBRE 2026'!$Q$5),ISNUMBER('PAGOS NOVIEMBRE 2026'!$R$5),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=ROW()),'PAGOS NOVIEMBRE 2026'!$Q$5,IF(AN771<>"CONFIRMADO JM","",LET(z,IFERROR(MAX(FILTER('ZELLE (NOV)'!U:U,'ZELLE (NOV)'!K:K=ROW(),'ZELLE (NOV)'!H:H="CONFIRMADO JM",'ZELLE (NOV)'!P:P="ENLAZADO",'ZELLE (NOV)'!Y:Y="VALIDADO",'ZELLE (NOV)'!AD:AD="VALIDADO")),0),p,IFERROR(MAX(FILTER('PAYPAL (NOV)'!Z:Z,'PAYPAL (NOV)'!P:P=ROW(),'PAYPAL (NOV)'!M:M="CONFIRMADO JM",'PAYPAL (NOV)'!U:U="ENLAZADO",'PAYPAL (NOV)'!AD:AD="VALIDADO",'PAYPAL (NOV)'!AI:AI="VALIDADO")),0),t,IFERROR(MAX(FILTER('TRANSF (NOV)'!X:X,'TRANSF (NOV)'!N:N=ROW(),'TRANSF (NOV)'!K:K="CONFIRMADO JM",'TRANSF (NOV)'!S:S="ENLAZADO",'TRANSF (NOV)'!AB:AB="VALIDADO",'TRANSF (NOV)'!AG:AG="VALIDADO")),0),m,MAX(z,p,t),IF(m=0,"",m))))
```

#### `BASE GENERAL!AP771`
```gs
=IF(AND($B771='PAGOS NOVIEMBRE 2026'!$B$5,$N771='PAGOS NOVIEMBRE 2026'!$M$5,$AH771='PAGOS NOVIEMBRE 2026'!$Y$5,'PAGOS NOVIEMBRE 2026'!$X$5="BASE GENERAL!771",'PAGOS NOVIEMBRE 2026'!$W$5="CONFIRMADO JM",'PAGOS NOVIEMBRE 2026'!$AF$5="VALIDADO COMERCIAL",'PAGOS NOVIEMBRE 2026'!$AA$5="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$AB$5=14,'PAGOS NOVIEMBRE 2026'!$AE$5=150,'PAGOS NOVIEMBRE 2026'!$Q$124="CONFIRMADO",'PAGOS NOVIEMBRE 2026'!$K$124="VALIDADO",'PAGOS NOVIEMBRE 2026'!$C$124="ZELLE (NOV)",'PAGOS NOVIEMBRE 2026'!$D$124=14,'PAGOS NOVIEMBRE 2026'!$E$124='PAGOS NOVIEMBRE 2026'!$AE$5,'PAGOS NOVIEMBRE 2026'!$G$5=$G771,'PAGOS NOVIEMBRE 2026'!$H$5=$H771,'PAGOS NOVIEMBRE 2026'!$I$5=$I771,ISNUMBER('PAGOS NOVIEMBRE 2026'!$Q$5),ISNUMBER('PAGOS NOVIEMBRE 2026'!$R$5),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=ROW()),'PAGOS NOVIEMBRE 2026'!$R$5,IF(AN771<>"CONFIRMADO JM","",LET(z,IFERROR(MAX(FILTER('ZELLE (NOV)'!V:V,'ZELLE (NOV)'!K:K=ROW(),'ZELLE (NOV)'!H:H="CONFIRMADO JM",'ZELLE (NOV)'!P:P="ENLAZADO",'ZELLE (NOV)'!Y:Y="VALIDADO",'ZELLE (NOV)'!AD:AD="VALIDADO")),0),p,IFERROR(MAX(FILTER('PAYPAL (NOV)'!AA:AA,'PAYPAL (NOV)'!P:P=ROW(),'PAYPAL (NOV)'!M:M="CONFIRMADO JM",'PAYPAL (NOV)'!U:U="ENLAZADO",'PAYPAL (NOV)'!AD:AD="VALIDADO",'PAYPAL (NOV)'!AI:AI="VALIDADO")),0),t,IFERROR(MAX(FILTER('TRANSF (NOV)'!Y:Y,'TRANSF (NOV)'!N:N=ROW(),'TRANSF (NOV)'!K:K="CONFIRMADO JM",'TRANSF (NOV)'!S:S="ENLAZADO",'TRANSF (NOV)'!AB:AB="VALIDADO",'TRANSF (NOV)'!AG:AG="VALIDADO")),0),m,MAX(z,p,t),IF(m=0,"",m))))
```

#### `BASE GENERAL!AQ771`
```gs
=IF(B771="","",IF(AN771<>"CONFIRMADO JM","SIN PAGO CONFIRMADO",IF(AL771<1,"PENDIENTE DE CRÉDITO",IF(AM771="","PENDIENTE F.VENCIMIENTO","HABILITADO PARA ACTUALIZAR BASE"))))
```

**Fórmulas localizadas en esta fila:** 21.

### 4.2 · PAGOS NOVIEMBRE 2026 (fila 5)

#### `PAGOS NOVIEMBRE 2026!E5`
```gs
=IF(ISNUMBER(R5),IF(R5-TODAY()>5,"Al dia",IF(R5-TODAY()>=1,"Por vencer","Vencido")),"")
```

#### `PAGOS NOVIEMBRE 2026!G5`
```gs
=IF(AND($W5="CONFIRMADO JM",$Q$124="CONFIRMADO",$K$124="VALIDADO",$C$124=$AA5,$D$124=$AB5,$E$124=$AE5,$B$124=$B5,$A$124="ZELLE-NOV-"&$AB5,$X5="BASE GENERAL!771",$I$124>0,$J$124>0,ISNUMBER($O$124),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=771),"PLAN "&INDEX(CATALOGO_TARIFAS_VIGENTE!$C$2:$C$100,MATCH($H$124,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0))&" MESES+"&$M$124,"PLAN 12 MESES")
```

#### `PAGOS NOVIEMBRE 2026!H5`
```gs
=IF(AND($W5="CONFIRMADO JM",$Q$124="CONFIRMADO",$K$124="VALIDADO",$C$124=$AA5,$D$124=$AB5,$E$124=$AE5,$B$124=$B5,$A$124="ZELLE-NOV-"&$AB5,$X5="BASE GENERAL!771",$I$124>0,$J$124>0,ISNUMBER($O$124),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=771),$J$124,3)
```

#### `PAGOS NOVIEMBRE 2026!I5`
```gs
=IF(AND($W5="CONFIRMADO JM",$Q$124="CONFIRMADO",$K$124="VALIDADO",$C$124=$AA5,$D$124=$AB5,$E$124=$AE5,$B$124=$B5,$A$124="ZELLE-NOV-"&$AB5,$X5="BASE GENERAL!771",$I$124>0,$J$124>0,ISNUMBER($O$124),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=771),$O$124,1)
```

#### `PAGOS NOVIEMBRE 2026!Q5`
```gs
=IF(AND(W5="CONFIRMADO JM",Q124="CONFIRMADO",K124="VALIDADO",C124=AA5,D124=AB5,E124=AE5,B124=B5,'ZELLE (NOV)'!K14=771,ISNUMBER(AC5)),AC5,'BASE GENERAL'!AJ771)
```

#### `PAGOS NOVIEMBRE 2026!R5`
```gs
=IF(AND(W5="CONFIRMADO JM",Q124="CONFIRMADO",K124="VALIDADO",C124=AA5,D124=AB5,E124=AE5,B124=B5,ISNUMBER(Q5),ISNUMBER(I124),I124>0),EDATE(Q5,I124),'BASE GENERAL'!AK771)
```

#### `PAGOS NOVIEMBRE 2026!S5`
```gs
=R5-TODAY()
```

#### `PAGOS NOVIEMBRE 2026!W5`
```gs
=IF(AND($B5='BASE GENERAL'!$B$771,$M5='BASE GENERAL'!$N$771,$X5="BASE GENERAL!771",'ZELLE (NOV)'!$K$14=771,'ZELLE (NOV)'!$J$14=1,'ZELLE (NOV)'!$P$14="ENLAZADO",'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$I$14='BASE GENERAL'!$AH$771),"CONFIRMADO JM","")
```

#### `PAGOS NOVIEMBRE 2026!Y5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$I$14,"")
```

#### `PAGOS NOVIEMBRE 2026!Z5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$J$14,"")
```

#### `PAGOS NOVIEMBRE 2026!AA5`
```gs
=IF($W5="CONFIRMADO JM","ZELLE (NOV)","")
```

#### `PAGOS NOVIEMBRE 2026!AB5`
```gs
=IF($W5="CONFIRMADO JM",14,"")
```

#### `PAGOS NOVIEMBRE 2026!AC5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$D$14,"")
```

#### `PAGOS NOVIEMBRE 2026!AD5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$Q$14,"")
```

#### `PAGOS NOVIEMBRE 2026!AE5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$R$14,"")
```

#### `PAGOS NOVIEMBRE 2026!AF5`
```gs
=IF(AND($W5="CONFIRMADO JM",$Q$124="CONFIRMADO",$K$124="VALIDADO",$C$124=$AA5,$D$124=$AB5,$E$124=$AE5,$B$124=$B5,$A$124="ZELLE-NOV-"&$AB5,$X5="BASE GENERAL!771",$I$124>0,$J$124>0,ISNUMBER($O$124),'ZELLE (NOV)'!$H$14="CONFIRMADO JM",'ZELLE (NOV)'!$K$14=771),"VALIDADO COMERCIAL",IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$T$14,""))
```

#### `PAGOS NOVIEMBRE 2026!AG5`
```gs
=IF($W5="CONFIRMADO JM",'ZELLE (NOV)'!$H$14,"")
```

**Fórmulas localizadas en esta fila:** 17.

### 4.3 · ZELLE (NOV) (fila 14)

#### `ZELLE (NOV)!I14`
```gs
=IF(B14="","",UPPER(TRIM(CLEAN(SUBSTITUTE(B14,CHAR(160)," ")))))
```

#### `ZELLE (NOV)!J14`
```gs
=IF(I14="","",COUNTIFS('BASE GENERAL'!AH$4:AH$2545,I14,'BASE GENERAL'!A$4:A$2545,A14))
```

#### `ZELLE (NOV)!K14`
```gs
=IF(J14=1,INDEX(FILTER(ROW('BASE GENERAL'!A$4:A$2545),'BASE GENERAL'!AH$4:AH$2545=I14,'BASE GENERAL'!A$4:A$2545=A14),1),"")
```

#### `ZELLE (NOV)!L14`
```gs
=IF(K14="","",INDEX('BASE GENERAL'!Y:Y,K14))
```

#### `ZELLE (NOV)!M14`
```gs
=IF(K14="","",INDEX('BASE GENERAL'!AA:AA,K14))
```

#### `ZELLE (NOV)!N14`
```gs
=IF(K14="","",INDEX('BASE GENERAL'!AB:AB,K14))
```

#### `ZELLE (NOV)!O14`
```gs
=IF(K14="","",INDEX('BASE GENERAL'!H:H,K14))
```

#### `ZELLE (NOV)!P14`
```gs
=IF(B14="","",IF(J14=1,"ENLAZADO",IF(J14=0,"SIN BASE","REQUIERE DECISIÓN")))
```

#### `ZELLE (NOV)!Q14`
```gs
=IF(B14="","","USD")
```

#### `ZELLE (NOV)!R14`
```gs
=IF(B14="","",IFERROR(VALUE(REGEXREPLACE(TO_TEXT(C14),"[^0-9.-]","")),""))
```

#### `ZELLE (NOV)!S14`
```gs
=IF(OR(P14<>"ENLAZADO",Q14<>"USD",R14=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!D$2:D$26=O14,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=R14),1),""))
```

#### `ZELLE (NOV)!T14`
```gs
=IF(B14="","",IF(L14="ADD-ON","ADD-ON / TARIFA SEPARADA",IF(P14<>"ENLAZADO","PENDIENTE ENLACE",IF(S14="","SIN COINCIDENCIA TARIFA",IFERROR(IF(VALUE(REGEXEXTRACT(M14,"[0-9]+"))=S14,"COINCIDE PLAN","TARIFA ≠ PLAN"),"REQUIERE REVISION")))))
```

#### `ZELLE (NOV)!U14`
```gs
=IF(AND(H14="CONFIRMADO JM",P14="ENLAZADO",T14="COINCIDE PLAN",ISNUMBER(D14)),D14,"")
```

#### `ZELLE (NOV)!V14`
```gs
=IF(U14="","",EDATE(U14,N14))
```

#### `ZELLE (NOV)!W14`
```gs
=IF(V14="","",V14-TODAY())
```

#### `ZELLE (NOV)!X14`
```gs
=IF(W14="","",IF(W14>=30,"Al dia",IF(W14>=1,"Por vencer","Vencido")))
```

#### `ZELLE (NOV)!Y14`
```gs
=IF(B14="","",IF(AND(H14="CONFIRMADO JM",P14="ENLAZADO",T14="COINCIDE PLAN",U14<>"",V14<>""),"VALIDADO","REQUIERE DECISIÓN"))
```

#### `ZELLE (NOV)!Z14`
```gs
=IF(B14="","",IF(H14<>"CONFIRMADO JM","PENDIENTE CONFIRMADO JM",IF(P14<>"ENLAZADO","PENDIENTE ENLACE",IF(T14<>"COINCIDE PLAN","PENDIENTE VALIDACIÓN TARIFA",IF(N14="","SIN DURACIÓN","PROPUESTA CALCULADA")))))
```

#### `ZELLE (NOV)!AA14`
```gs
=IF(OR(B14="",Q14<>"USD",R14=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=R14),1),""))
```

#### `ZELLE (NOV)!AB14`
```gs
=IF(OR(B14="",Q14<>"USD",R14=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!D$2:D$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=R14),1),""))
```

#### `ZELLE (NOV)!AC14`
```gs
=IF(B14="","",IF(P14<>"ENLAZADO","PENDIENTE ENLACE",IF(L14="ADD-ON","ADD-ON",IF(OR(AA14="",AB14=""),"REQUIERE DECISIÓN",IF(AND(IFERROR(VALUE(REGEXEXTRACT(M14,"[0-9]+")),0)=AA14,O14=AB14),"SIN CAMBIO","CAMBIO PLAN")))))
```

#### `ZELLE (NOV)!AD14`
```gs
=IF(B14="","",IF(AC14="CAMBIO PLAN","REQUIERE DECISIÓN",IF(AC14="SIN CAMBIO","VALIDADO",IF(AC14="ADD-ON","REQUIERE DECISIÓN","PARCIAL"))))
```

**Fórmulas localizadas en esta fila:** 22.

### 4.4 · PAYPAL (NOV) (fila 3)

#### `PAYPAL (NOV)!N3`
```gs
=IF(B3="","",UPPER(TRIM(CLEAN(SUBSTITUTE(B3,CHAR(160)," ")))))
```

#### `PAYPAL (NOV)!O3`
```gs
=IF(N3="","",COUNTIFS('BASE GENERAL'!AH$4:AH$2545,N3,'BASE GENERAL'!A$4:A$2545,A3))
```

#### `PAYPAL (NOV)!P3`
```gs
=IF(O3=1,INDEX(FILTER(ROW('BASE GENERAL'!A$4:A$2545),'BASE GENERAL'!AH$4:AH$2545=N3,'BASE GENERAL'!A$4:A$2545=A3),1),"")
```

#### `PAYPAL (NOV)!Q3`
```gs
=IF(P3="","",INDEX('BASE GENERAL'!Y:Y,P3))
```

#### `PAYPAL (NOV)!R3`
```gs
=IF(P3="","",INDEX('BASE GENERAL'!AA:AA,P3))
```

#### `PAYPAL (NOV)!S3`
```gs
=IF(P3="","",INDEX('BASE GENERAL'!AB:AB,P3))
```

#### `PAYPAL (NOV)!T3`
```gs
=IF(P3="","",INDEX('BASE GENERAL'!H:H,P3))
```

#### `PAYPAL (NOV)!U3`
```gs
=IF(B3="","",IF(O3=1,"ENLAZADO",IF(O3=0,"SIN BASE","REQUIERE DECISIÓN")))
```

#### `PAYPAL (NOV)!V3`
```gs
=IF(B3="","","USD")
```

#### `PAYPAL (NOV)!W3`
```gs
=IF(B3="","",IFERROR(VALUE(REGEXREPLACE(TO_TEXT(F3),"[^0-9.-]","")),""))
```

#### `PAYPAL (NOV)!X3`
```gs
=IF(OR(U3<>"ENLAZADO",V3<>"USD",W3=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!D$2:D$26=T3,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=W3),1),""))
```

#### `PAYPAL (NOV)!Y3`
```gs
=IF(B3="","",IF(Q3="ADD-ON","ADD-ON / TARIFA SEPARADA",IF(U3<>"ENLAZADO","PENDIENTE ENLACE",IF(X3="","SIN COINCIDENCIA TARIFA",IFERROR(IF(VALUE(REGEXEXTRACT(R3,"[0-9]+"))=X3,"COINCIDE PLAN","TARIFA ≠ PLAN"),"REQUIERE REVISION")))))
```

#### `PAYPAL (NOV)!Z3`
```gs
=IF(AND(M3="CONFIRMADO JM",U3="ENLAZADO",Y3="COINCIDE PLAN",ISNUMBER(G3)),G3,"")
```

#### `PAYPAL (NOV)!AA3`
```gs
=IF(Z3="","",EDATE(Z3,S3))
```

#### `PAYPAL (NOV)!AB3`
```gs
=IF(AA3="","",AA3-TODAY())
```

#### `PAYPAL (NOV)!AC3`
```gs
=IF(AB3="","",IF(AB3>=30,"Al dia",IF(AB3>=1,"Por vencer","Vencido")))
```

#### `PAYPAL (NOV)!AD3`
```gs
=IF(B3="","",IF(AND(M3="CONFIRMADO JM",U3="ENLAZADO",Y3="COINCIDE PLAN",Z3<>"",AA3<>""),"VALIDADO","REQUIERE DECISIÓN"))
```

#### `PAYPAL (NOV)!AE3`
```gs
=IF(B3="","",IF(M3<>"CONFIRMADO JM","PENDIENTE CONFIRMADO JM",IF(U3<>"ENLAZADO","PENDIENTE ENLACE",IF(Y3<>"COINCIDE PLAN","PENDIENTE VALIDACIÓN TARIFA",IF(S3="","SIN DURACIÓN","PROPUESTA CALCULADA")))))
```

#### `PAYPAL (NOV)!AF3`
```gs
=IF(OR(B3="",V3<>"USD",W3=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=W3),1),""))
```

#### `PAYPAL (NOV)!AG3`
```gs
=IF(OR(B3="",V3<>"USD",W3=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!D$2:D$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=W3),1),""))
```

#### `PAYPAL (NOV)!AH3`
```gs
=IF(B3="","",IF(U3<>"ENLAZADO","PENDIENTE ENLACE",IF(Q3="ADD-ON","ADD-ON",IF(OR(AF3="",AG3=""),"REQUIERE DECISIÓN",IF(AND(IFERROR(VALUE(REGEXEXTRACT(R3,"[0-9]+")),0)=AF3,T3=AG3),"SIN CAMBIO","CAMBIO PLAN")))))
```

#### `PAYPAL (NOV)!AI3`
```gs
=IF(B3="","",IF(AH3="CAMBIO PLAN","REQUIERE DECISIÓN",IF(AH3="SIN CAMBIO","VALIDADO",IF(AH3="ADD-ON","REQUIERE DECISIÓN","PARCIAL"))))
```

**Fórmulas localizadas en esta fila:** 22.

### 4.5 · TRANSF (NOV) (fila 5)

#### `TRANSF (NOV)!L5`
```gs
=IF(B5="","",UPPER(TRIM(CLEAN(SUBSTITUTE(B5,CHAR(160)," ")))))
```

#### `TRANSF (NOV)!M5`
```gs
=IF(L5="","",COUNTIFS('BASE GENERAL'!AH$4:AH$2545,L5,'BASE GENERAL'!A$4:A$2545,A5))
```

#### `TRANSF (NOV)!N5`
```gs
=IF(M5=1,INDEX(FILTER(ROW('BASE GENERAL'!A$4:A$2545),'BASE GENERAL'!AH$4:AH$2545=L5,'BASE GENERAL'!A$4:A$2545=A5),1),"")
```

#### `TRANSF (NOV)!O5`
```gs
=IF(N5="","",INDEX('BASE GENERAL'!Y:Y,N5))
```

#### `TRANSF (NOV)!P5`
```gs
=IF(N5="","",INDEX('BASE GENERAL'!AA:AA,N5))
```

#### `TRANSF (NOV)!Q5`
```gs
=IF(N5="","",INDEX('BASE GENERAL'!AB:AB,N5))
```

#### `TRANSF (NOV)!R5`
```gs
=IF(N5="","",INDEX('BASE GENERAL'!H:H,N5))
```

#### `TRANSF (NOV)!S5`
```gs
=IF(B5="","",IF(M5=1,"ENLAZADO",IF(M5=0,"SIN BASE","REQUIERE DECISIÓN")))
```

#### `TRANSF (NOV)!T5`
```gs
=IF(B5="","",IF(IFERROR(VALUE(REGEXREPLACE(TO_TEXT(D5),"[^0-9.-]","")),0)<>0,"USD",IF(IFERROR(VALUE(REGEXREPLACE(TO_TEXT(E5),"[^0-9.-]","")),0)<>0,"CAD",IF(IFERROR(VALUE(REGEXREPLACE(TO_TEXT(C5),"[^0-9.-]","")),0)<>0,"COP",""))))
```

#### `TRANSF (NOV)!U5`
```gs
=IF(B5="","",IF(T5="USD",IFERROR(VALUE(REGEXREPLACE(TO_TEXT(D5),"[^0-9.-]","")),""),IF(T5="CAD",IFERROR(VALUE(REGEXREPLACE(TO_TEXT(E5),"[^0-9.-]","")),""),IF(T5="COP",IFERROR(VALUE(REGEXREPLACE(TO_TEXT(C5),"[^0-9.-]","")),""),""))))
```

#### `TRANSF (NOV)!V5`
```gs
=IF(OR(S5<>"ENLAZADO",T5<>"USD",U5=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!D$2:D$26=R5,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=U5),1),""))
```

#### `TRANSF (NOV)!W5`
```gs
=IF(B5="","",IF(O5="ADD-ON","ADD-ON / TARIFA SEPARADA",IF(S5<>"ENLAZADO","PENDIENTE ENLACE",IF(T5<>"USD","MONEDA NO USD",IF(V5="","SIN COINCIDENCIA TARIFA",IFERROR(IF(VALUE(REGEXEXTRACT(P5,"[0-9]+"))=V5,"COINCIDE PLAN","TARIFA ≠ PLAN"),"REQUIERE REVISION"))))))
```

#### `TRANSF (NOV)!X5`
```gs
=IF(AND(K5="CONFIRMADO JM",S5="ENLAZADO",W5="COINCIDE PLAN",ISNUMBER(G5)),G5,"")
```

#### `TRANSF (NOV)!Y5`
```gs
=IF(X5="","",EDATE(X5,Q5))
```

#### `TRANSF (NOV)!Z5`
```gs
=IF(Y5="","",Y5-TODAY())
```

#### `TRANSF (NOV)!AA5`
```gs
=IF(Z5="","",IF(Z5>=30,"Al dia",IF(Z5>=1,"Por vencer","Vencido")))
```

#### `TRANSF (NOV)!AB5`
```gs
=IF(B5="","",IF(AND(K5="CONFIRMADO JM",S5="ENLAZADO",W5="COINCIDE PLAN",X5<>"",Y5<>""),"VALIDADO","REQUIERE DECISIÓN"))
```

#### `TRANSF (NOV)!AC5`
```gs
=IF(B5="","",IF(K5<>"CONFIRMADO JM","PENDIENTE CONFIRMADO JM",IF(S5<>"ENLAZADO","PENDIENTE ENLACE",IF(W5<>"COINCIDE PLAN","PENDIENTE VALIDACIÓN TARIFA",IF(Q5="","SIN DURACIÓN","PROPUESTA CALCULADA")))))
```

#### `TRANSF (NOV)!AD5`
```gs
=IF(OR(B5="",T5<>"USD",U5=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!C$2:C$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=U5),1),""))
```

#### `TRANSF (NOV)!AE5`
```gs
=IF(OR(B5="",T5<>"USD",U5=""),"",IFERROR(INDEX(FILTER(CATALOGO_TARIFAS_VIGENTE!D$2:D$26,CATALOGO_TARIFAS_VIGENTE!F$2:F$26=U5),1),""))
```

#### `TRANSF (NOV)!AF5`
```gs
=IF(B5="","",IF(S5<>"ENLAZADO","PENDIENTE ENLACE",IF(O5="ADD-ON","ADD-ON",IF(OR(AD5="",AE5=""),"REQUIERE DECISIÓN",IF(AND(IFERROR(VALUE(REGEXEXTRACT(P5,"[0-9]+")),0)=AD5,R5=AE5),"SIN CAMBIO","CAMBIO PLAN")))))
```

#### `TRANSF (NOV)!AG5`
```gs
=IF(B5="","",IF(AF5="CAMBIO PLAN","REQUIERE DECISIÓN",IF(AF5="SIN CAMBIO","VALIDADO",IF(AF5="ADD-ON","REQUIERE DECISIÓN","PARCIAL"))))
```

**Fórmulas localizadas en esta fila:** 22.

### 4.6 · Bloque comercial de Harry (fila 124)

#### `PAGOS NOVIEMBRE 2026!A124`
```gs
=IF(OR(C124="",D124=""),"", "ZELLE-NOV-"&D124)
```

#### `PAGOS NOVIEMBRE 2026!B124`
```gs
=IF(D124="","",INDEX('ZELLE (NOV)'!B:B,D124))
```

#### `PAGOS NOVIEMBRE 2026!C124`
```gs
=IF($W$5="CONFIRMADO JM",$AA$5,"")
```

#### `PAGOS NOVIEMBRE 2026!D124`
```gs
=IF(C124="","",$AB$5)
```

#### `PAGOS NOVIEMBRE 2026!E124`
```gs
=IF(D124="","",INDEX('ZELLE (NOV)'!R:R,D124))
```

#### `PAGOS NOVIEMBRE 2026!F124`
```gs
=IF(D124="","",IFERROR(INDEX('BASE GENERAL'!AA:AA,INDEX('ZELLE (NOV)'!K:K,D124)),""))
```

#### `PAGOS NOVIEMBRE 2026!G124`
```gs
=IF(E124="","",IFERROR(TEXTJOIN(" | ",TRUE,FILTER(CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100&" · "&CATALOGO_TARIFAS_VIGENTE!$C$2:$C$100&" meses base / "&CATALOGO_TARIFAS_VIGENTE!$D$2:$D$100&" pantallas",CATALOGO_TARIFAS_VIGENTE!$F$2:$F$100=E124,CATALOGO_TARIFAS_VIGENTE!$E$2:$E$100="USD",CATALOGO_TARIFAS_VIGENTE!$G$2:$G$100="VALIDADO")),"SIN TARIFA COMPATIBLE"))
```

#### `PAGOS NOVIEMBRE 2026!I124`
```gs
=IF(OR(H124="",H124="PENDIENTE",M124=""),"",IFERROR(IF(INDEX(CATALOGO_TARIFAS_VIGENTE!$K$2:$K$100,MATCH(H124,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0))="",INDEX(CATALOGO_TARIFAS_VIGENTE!$C$2:$C$100,MATCH(H124,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0)),INDEX(CATALOGO_TARIFAS_VIGENTE!$K$2:$K$100,MATCH(H124,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0)))+M124,""))
```

#### `PAGOS NOVIEMBRE 2026!J124`
```gs
=IF(OR(H124="",H124="PENDIENTE",N124=""),"",IFERROR(INDEX(CATALOGO_TARIFAS_VIGENTE!$D$2:$D$100,MATCH(H124,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0))+N124,""))
```

#### `PAGOS NOVIEMBRE 2026!K124`
```gs
=IF(OR(H124="",H124="PENDIENTE",M124="",N124="",L124=""),"REQUIERE DECISIÓN",IFERROR(LET(
codigo,H124,
fila,MATCH(codigo,CATALOGO_TARIFAS_VIGENTE!$A$2:$A$100,0),
precio,INDEX(CATALOGO_TARIFAS_VIGENTE!$F$2:$F$100,fila),
moneda,INDEX(CATALOGO_TARIFAS_VIGENTE!$E$2:$E$100,fila),
estado,INDEX(CATALOGO_TARIFAS_VIGENTE!$G$2:$G$100,fila),
nombreOrigen,INDEX('ZELLE (NOV)'!$B:$B,D124),
fechaOrigen,INDEX('ZELLE (NOV)'!$D:$D,D124),
montoOrigen,INDEX('ZELLE (NOV)'!$R:$R,D124),
confirmacion,INDEX('ZELLE (NOV)'!$H:$H,D124),
enlace,INDEX('ZELLE (NOV)'!$P:$P,D124),
vigencia,IF(LEFT(codigo,9)="TVP26_BF_",AND(fechaOrigen>=DATE(2026,11,16),fechaOrigen<=DATE(2026,11,30)),codigo<>"TVP26_PROMO_001"),
IF(AND(
A124="ZELLE-NOV-"&D124,
C124="ZELLE (NOV)",
UPPER(TRIM(B124))=UPPER(TRIM(nombreOrigen)),
E124=montoOrigen,
precio=E124,
moneda="USD",
estado="VALIDADO",
confirmacion="CONFIRMADO JM",
enlace="ENLAZADO",
vigencia,
I124>0,
J124>0
),"VALIDADO","REQUIERE DECISIÓN")
),"REQUIERE DECISIÓN"))
```

#### `PAGOS NOVIEMBRE 2026!P124`
```gs
=IF(OR(I124="",J124="",O124=""),"",I124&" MESES | "&J124&" PANTALLAS TV | "&O124&" CELULAR")
```

**Fórmulas comerciales extraídas:** 11.

## 5. Mapeo de entradas y salidas por método

| Dato | ZELLE | PAYPAL | TRANSF | Destino/uso |
|---|---|---|---|---|
| Confirmación | H | M | K | Gate financiero JM |
| Identidad normalizada | I | N | L | Enlace único a BASE GENERAL |
| Coincidencias | J | O | M | Debe ser 1 |
| Fila BASE | K | P | N | No depender de nombre |
| Estado de enlace | P | U | S | `ENLAZADO` |
| Moneda | Q | V | T | Conciliación moneda |
| Valor normalizado | R | W | U | Conciliación monto |
| Validación tarifaria | T | Y | W | Puede requerir comercial |
| Fecha último pago propuesta | U | Z | X | Origen de fecha |
| Próximo vencimiento propuesto | V | AA | Y | Duración aprobada |
| Gate de propuesta | Y / AD | AD / AI | AB / AG | Distinto de confirmación JM |

**Advertencia:** columnas PAYPAL y TRANSF anteriores proceden de las cabeceras leídas; comprobar en la muestra que las fórmulas de normalización respeten comisiones y monedas. No se equipara `CONFIRMADO JM` a `COINCIDE PLAN`.

## 6. Contrato maestro — actualización observada

| Campo | PAGOS NOVIEMBRE | BASE GENERAL | Función |
|---|---|---|---|
| Plan | G5 | G771 | Duración base + meses gratuitos; la equivalencia en maestro alimenta Y:AB |
| Pantallas TV | H5 | H771 | TV, sin incluir celulares |
| Celulares | I5 | I771 | Independientes de TV |
| Último pago | Q5 / AC5 | AO771 → R771 | Pago confirmado |
| Próximo pago | R5 | AP771 → S771 | Meses comerciales autorizados |
| Días | S5 | T771 | Fecha próxima − TODAY() |
| Estado | E5 | E771 | Al dia / Por vencer / Vencido |
| Confirmación JM | W5, AG5 | AN771 | Recaudo |
| Resolución tarifa | AF5 | gate en AN:AP | `VALIDADO COMERCIAL`, no reescribe discrepancia de método |
| Vencimiento de crédito | P5 | Q771 | Proveniente de controles operativos, NO igual a próximo pago |

## 7. Dependencias, circularidad, lectura y seguridad

- `PAGOS!Q5/R5` contienen referencias de fallback a `BASE GENERAL!AJ771/AK771` (snapshot previo), evitando referenciar R771/S771 y una circularidad posterior.
- `BASE GENERAL!AN771:AP771` del piloto poseen condiciones hardcoded de fuente ZELLE, fila 14, tarifa/importe y filas 5/124/771; son evidencia del piloto, **NO** fórmula universal.
- En el piloto, G771/H771/I771 conservan los valores previamente existentes y no se modificaron durante la última propagación; la coincidencia no prueba que los cambios de plan o dispositivos diferentes lleguen correctamente al maestro.
- El campo `BASE GENERAL!Q771` está condicionado por controles de crédito, no por el próximo cobro S771. Su diferencia implica verificación técnica separada.
- Fórmulas `TODAY()` son dinámicas: resultados numéricos de días dependen del día de consulta.
- Los estados comerciales tienen datos editables M/N/O/Q; se requiere bloquear o versionar una aprobación para evitar cambios retrospectivos.
- Validación de estados en origen: el contenido exacto del desplegable debe auditarse en cada método antes de imponer la transición; no escribir `CONFIRMADO JM` automáticamente.

## 8. Brechas priorizadas antes de propagación masiva

| ID | Prioridad | Hallazgo | Estado |
|---|---|---|---|
| P0-01 | P0 | `C124` depende de W5 ya confirmado; excepciones en `VALIDACION COMERCIAL` no llegan automáticamente antes de JM | NO IMPLEMENTADO |
| P0-02 | P0 | `K124` exige `CONFIRMADO JM`; acopla validación comercial y financiera en orden contrario al contrato | NO IMPLEMENTADO |
| P0-03 | P0 | Reglas hardcoded a filas 5/14/124/771 impiden arrastre seguro | NO IMPLEMENTADO |
| P0-04 | P0 | Gate AN771 exige igualdad de plan y dispositivos con maestro anterior; puede bloquear un cambio de plan genuino | NO IMPLEMENTADO |
| P1-01 | P1 | Fallback G5/H5/I5 es literal, no snapshot de apertura para cada cliente | PARCIAL |
| P1-02 | P1 | Tarifa ZELLE T14 conserva discrepancia aún resuelta por AF5; la resolución debe incluir ID comercial auditable | PARCIAL |
| P1-03 | P1 | PAYPAL y TRANSF no están validados end-to-end con doble confirmación y comerciales | NO IMPLEMENTADO |
| P1-04 | P1 | Vencimiento técnico vs financiero diferente, requiere evidencia de crédito en control operativo | PARCIAL |
| P1-05 | P1 | Validación universal con múltiples movimientos/cambio moneda/ambigüedad/duplicados no probada | NO IMPLEMENTADO |
| P1-06 | P1 | No hay sello inmutable de aprobación con responsable, timestamp y snapshot | PARCIAL |

## 9. Plan de prueba antes de universalización: 10 casos, sin ejecutar aún

| Caso | Fuente | Tipo de evento buscado | Gate principal |
|---|---|---|---|
| C01 | ZELLE | Harry Quintero: piloto ya validado | Regresión sin afectar resultado |
| C02 | ZELLE | Tarifa sin discrepancia | Confirmado JM + enlace único |
| C03 | ZELLE | `VALIDACION COMERCIAL` previa a JM | Debe aparecer en bloque comercial |
| C04 | ZELLE | Pendiente JM, sin pago confirmado | No altera maestro |
| C05 | PAYPAL | Tarifa sin discrepancia | Monto neto, vigencia, pago |
| C06 | PAYPAL | Tarifa ambigua/cambio plan | Validación comercial antes de JM |
| C07 | TRANSF | Transferencia USD con único enlace | Confirmación + repliegue |
| C08 | TRANSF | Pago COP / conversión | Moneda y tasa documentadas |
| C09 | TRANSF | Sin base o enlace ambiguo | Bloquear repliegue; escalar |
| C10 | Cualquiera | Cambio real de plan, pantallas o celular / pago anticipado | Maestro actualiza solo tras doble gate y respeta fecha base |

**Selección definitiva:** obtener casos existentes de los datos vivos; no modificar resultados de clientes distintos de Harry hasta disponer del backup y criterios individualizados. El muestreo debe cubrir caso normal, excepción, ausencia de confirmación, moneda, duplicados, cambio verdadero y vencimiento técnico.

## 10. Definition of Done de la muestra

- 10 movimientos existentes, con identificador estable y fuente probada; un enlace único por evento y cliente.
- Evidencia de valor anterior/nuevo en método, PAGOS y BASE; pruebas negativas sin repliegue ante falta de confirmación.
- Las excepciones comerciales aparecen **antes** de CONFIRMADO JM, y sólo el asesor puede marcar conformidad comercial.
- Solo Julián firma CONFIRMADO JM; ambos controles y fechas/tarifas son correctos; sin circularidad ni rotura de fórmulas existentes.
- Mapeo completo de las tres fuentes, incluido caso de moneda distinta; trazabilidad de quién confirma qué y cuándo.
- Revalidación de crédito técnico por separado, sin falso cierre financiero de panel.
- Reporte con 10 resultados, diferencias de fórmulas, incidencias P0/P1/P2 y decisión explícita de gate.

## 11. ACTIVE CONTEXT / DECISION LOG / BACKLOG / NEXT ACTION

**Decisiones:** D01 separación asesor/JM; D02 validar mes antes del maestro; D03 mantener historia y trazabilidad; D04 mantener vigencia técnica independiente; D05 piloto Harry validado financieramente.
**Active context:** noviembre 2026, MVP 1 cliente validado; documento de contrato universal en construcción con cinco hojas; 10 usuarios propuestos aún no seleccionados.
**Checkpoint:** contenido documental creado y versionado en repositorio; ninguna fórmula modificada durante esta documentación.
**Backlog P0:** P0-01/02/03/04 antes de cualquier expansión de fórmulas.
**Next action:** diseñar y verificar la alimentación universal de validaciones comerciales desde 3 orígenes en `VALIDACION COMERCIAL`, desacoplar gate comercial de JM y seleccionar muestra real de 10; ejecutar pruebas acotadas, auditar, aprobar rollout.

---
**Proveniencia:** lectura en vivo de `userEnteredValue` y `formattedValue` de los rangos específicos indicados, 19/11/2026. La documentación es evidencia de fórmulas por fila de referencia, NO auditoría exhaustiva de cada una de las miles de celdas del libro.
