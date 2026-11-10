# TIVIPLAY — CHECKPOINT BASE GENERAL · FÓRMULAS VALIDADO

**Fecha:** 2026-11-10  
**Área primaria:** 02 · TIVIPLAY | Finanzas y Servicio  
**Dependencias:** 00 · Gobierno y Continuidad / 04 · Plataforma y Equipo  
**Fuente viva:** Google Sheet `GESTION_DIA_PAGOS_2026_TIVIPLAY`  
**Spreadsheet ID:** `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`  
**Hoja:** `BASE GENERAL`  
**Estado del gate:** **VALIDADO — motor noviembre implementado y prueba E2E aprobada**  
**Tipo de evidencia:** lectura directa de la hoja viva + confirmación manual de Dirección para la excepción documentada de fila 737.

---

## 1. Objetivo

Certificar la propagación de las fórmulas operacionales de `BASE GENERAL` antes de avanzar a la siguiente hoja del libro.

La validación se ejecutó sobre filas reales de cliente identificadas por:

`TC ∈ {0,1} + CLIENTE no vacío`

Universo auditado al 2026-11-10:

- filas reales de cliente: **1.612**
- primera fila: **4**
- última fila efectiva: **1693**
- filas estructurales/totales: excluidas del universo de propagación
- criterio: fórmula presente en todas las filas contractualmente calculadas, salvo excepción manual explícita documentada

---

## 2. Resultado de propagación

| Columna | Función | Resultado |
|---|---|---|
| E | ESTADO | VALIDADO — 0 faltantes |
| Q | F.VENCIMIENTO | VALIDADO — 0 faltantes |
| R | F.ULTIMO PAGO | VALIDADO — 0 faltantes; excepción manual R737 |
| S | F. PRÓXIMO PAGO | VALIDADO — 0 faltantes; excepción manual S737 |
| T | Días faltantes para cobrar | VALIDADO — 0 faltantes |
| Y | Clasificación catálogo | VALIDADO — 0 faltantes |
| Z | Código normalizado | VALIDADO — 0 faltantes |
| AA | Plan normalizado | VALIDADO — 0 faltantes |
| AB | Meses/unidades del plan | VALIDADO — 0 faltantes |
| AC | Fecha de ciclo reconstruida | VALIDADO — 0 faltantes |
| AD | Desviación último pago vs ciclo | VALIDADO — 0 faltantes |
| AE | Clasificación desviación | VALIDADO — 0 faltantes |
| AF | Próxima fecha teórica por plan | VALIDADO — 0 faltantes |
| AG | Desviación próximo pago | VALIDADO — 0 faltantes |
| AL | Créditos observados en CONTROL OCT | VALIDADO — 0 faltantes |
| AM | F.VENCIMIENTO observada en CONTROL OCT | VALIDADO — 0 faltantes |
| AN | Confirmación financiera octubre | VALIDADO — 0 faltantes |
| AO | Fecha último pago confirmado octubre | VALIDADO — 0 faltantes |
| AP | Próximo pago derivado del origen confirmado | VALIDADO — 0 faltantes |
| AQ | Estado de habilitación para actualizar BASE | VALIDADO — 0 faltantes |

---

## 3. Contrato de fórmulas

En las expresiones siguientes, `{r}` representa el número de fila real del cliente.

### E — ESTADO

```gs
=IF(T{r}>5,"Al dia",IF(AND(T{r}>=1,T{r}<=5),"Por vencer","Vencido"))
```

### Q — F.VENCIMIENTO

```gs
=IF(B{r}="",AI{r},IF(AND(AN{r}="CONFIRMADO JM",AL{r}>=1,AM{r}<>""),MAX(IF(ISNUMBER(AI{r}),AI{r},0),AM{r}),AI{r}))
```

### R — F.ULTIMO PAGO

Patrón estándar:

```gs
=IF(B{r}="",AJ{r},IF(AND(AN{r}="CONFIRMADO JM",ISNUMBER(AO{r})),IF(ISNUMBER(AJ{r}),MAX(AJ{r},AO{r}),AO{r}),AJ{r}))
```

### S — F. PRÓXIMO PAGO

Patrón estándar:

```gs
=IF(B{r}="",AK{r},IF(AND(AN{r}="CONFIRMADO JM",ISNUMBER(AP{r})),IF(ISNUMBER(AK{r}),MAX(AK{r},AP{r}),AP{r}),AK{r}))
```

### T — DÍAS FALTANTES PARA COBRAR

```gs
=S{r}-TODAY()
```

### Y — CLASIFICACIÓN DE PLAN

```gs
=IF(G{r}="","",IF(REGEXMATCH(UPPER(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," ")))),"^(VENTAS .*EXCEPCI|DESACTIVADOS |REACTIVACIONES |TOTAL |⬇|⬆)"),"IGNORAR ESTRUCTURA",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:E,2,FALSE),IF(COUNTIF(CATALOGO_PLANES!B:B,TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))))>0,"PLAN PRINCIPAL",IF(COUNTIF(CATALOGO_ADDONS!B:B,TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))))>0,"ADD-ON","REQUIERE DECISIÓN")))))
```

### Z — CÓDIGO NORMALIZADO

```gs
=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:D,4,FALSE),IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))
```

### AA — PLAN NORMALIZADO

```gs
=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:C,3,FALSE),IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))
```

### AB — MESES / UNIDADES DEL PLAN

```gs
=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!E:E,MATCH(Z{r},CATALOGO_PLANES!A:A,0)),INDEX(CATALOGO_ADDONS!C:C,MATCH(Z{r},CATALOGO_ADDONS!A:A,0))))
```

### AC — FECHA DE CICLO RECONSTRUIDA

```gs
=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN",R{r}="",S{r}="",AB{r}=""),"",IFERROR(EDATE(S{r},-AB{r}),""))
```

### AD — DESVIACIÓN ÚLTIMO PAGO VS CICLO

```gs
=IF(AC{r}="","",IFERROR(R{r}-AC{r},""))
```

### AE — CLASIFICACIÓN DE DESVIACIÓN

```gs
=IF(AND(AC{r}<>"",AD{r}=""),"FECHA ULTIMO PAGO INVALIDA",IF(AD{r}="","",IF(AD{r}=0,"PAGO EN FECHA DE CICLO",IF(AD{r}>0,"PAGO POSTERIOR AL CICLO","PAGO ANTERIOR AL CICLO"))))
```

### AF — PRÓXIMA FECHA TEÓRICA POR PLAN

```gs
=IF(OR(R{r}="",AB{r}=""),"",IFERROR(EDATE(R{r},AB{r}),""))
```

### AG — DESVIACIÓN PRÓXIMO PAGO

```gs
=IF(AND(S{r}<>"",R{r}<>"",AF{r}=""),"FECHA ULTIMO PAGO INVALIDA",IF(OR(S{r}="",AF{r}=""),"",IFERROR(S{r}-AF{r},"")))
```

### AL — CRÉDITOS OBSERVADOS EN CONTROL OCT

```gs
=IF(N{r}="","",IFERROR(MAX(FILTER({'CONTROL (OCT) P1'!J:J;'CONTROL (OCT) P2'!J:J;'CONTROL (OCT) P3'!J:J},{'CONTROL (OCT) P1'!D:D;'CONTROL (OCT) P2'!D:D;'CONTROL (OCT) P3'!D:D}=N{r})),0))
```

### AM — F.VENCIMIENTO OBSERVADA EN CONTROL OCT

```gs
=IF(OR(N{r}="",AL{r}<1),"",IFERROR(MAX(FILTER({'CONTROL (OCT) P1'!H:H;'CONTROL (OCT) P2'!H:H;'CONTROL (OCT) P3'!H:H},{'CONTROL (OCT) P1'!D:D;'CONTROL (OCT) P2'!D:D;'CONTROL (OCT) P3'!D:D}=N{r},{'CONTROL (OCT) P1'!J:J;'CONTROL (OCT) P2'!J:J;'CONTROL (OCT) P3'!J:J}>=1)),""))
```

### AN — CONFIRMACIÓN FINANCIERA OCTUBRE

```gs
=IF(N{r}="","",IF(COUNTIFS('PAGOS OCTUBRE 2026'!M:M,N{r},'PAGOS OCTUBRE 2026'!W:W,"CONFIRMADO JM")>0,"CONFIRMADO JM",""))
```

### AO — FECHA ÚLTIMO PAGO CONFIRMADO OCTUBRE

```gs
=IF(AN{r}<>"CONFIRMADO JM","",IFERROR(MAX(FILTER('PAGOS OCTUBRE 2026'!AB:AB,'PAGOS OCTUBRE 2026'!M:M=N{r},'PAGOS OCTUBRE 2026'!W:W="CONFIRMADO JM")),""))
```

### AP — PRÓXIMO PAGO DERIVADO DEL ORIGEN CONFIRMADO

```gs
=IF(AN{r}<>"CONFIRMADO JM","",IFERROR(LET(pr,MAX(FILTER(ROW('PAGOS OCTUBRE 2026'!M:M),'PAGOS OCTUBRE 2026'!M:M=N{r},'PAGOS OCTUBRE 2026'!W:W="CONFIRMADO JM")),src,INDEX('PAGOS OCTUBRE 2026'!Z:Z,pr),fr,INDEX('PAGOS OCTUBRE 2026'!AA:AA,pr),IF(src="ZELLE",INDEX('ZELLE (OCT)'!V:V,fr),IF(src="PAYPAL",INDEX('PAYPAL (OCT)'!AA:AA,fr),IF(src="TRANSFERENCIA",INDEX('TRANSF (OCT)'!Y:Y,fr),"")))),""))
```

### AQ — HABILITACIÓN PARA ACTUALIZAR BASE

```gs
=IF(B{r}="","",IF(AN{r}<>"CONFIRMADO JM","SIN PAGO CONFIRMADO",IF(AL{r}<1,"PENDIENTE DE CRÉDITO",IF(AM{r}="","PENDIENTE F.VENCIMIENTO","HABILITADO PARA ACTUALIZAR BASE"))))
```

---

## 4. Arquitectura del motor GESTION_DIA_PAGOS

Este checkpoint no describe una hoja aislada. `BASE GENERAL` es una pieza del motor operacional definido por el archivo estructural `ESTRUCTURA_GESTION_DIA_PAGOS` (Spreadsheet ID `1tmlOnHACnw5bM0g-vWwecdfeU9U7ETmeE8fwHI3P7uA`).

La estructura observada del motor es:

| Componente estructural | Rol dentro del motor | Relación principal |
|---|---|---|
| `BASE GENERAL` | Estado maestro operativo/comercial del cliente | identidad, plan, fechas, estado y habilitación |
| `PAGOS_MES` | Cartera mensual derivada del corte de BASE GENERAL | clientes con F.PRÓXIMO PAGO dentro del período |
| `ZELLE_MES` | Registro de pagos por Zelle | pago → validación → enlace |
| `PAYPAL_MES` | Registro de pagos por PayPal | pago → validación → enlace |
| `TRANSFERENCIAS` | Registro de transferencias/otros medios | pago → validación → enlace |
| `CONTROL (NOV) P1` | Evidencia de ejecución técnica Panel 1 | usuario → recarga/crédito → F.VENCIMIENTO |
| `CONTROL (NOV) P2` | Evidencia de ejecución técnica Panel 2 | usuario → recarga/crédito → F.VENCIMIENTO |
| `CONTROL (NOV) P3` | Evidencia de ejecución técnica Panel 3 | usuario → recarga/crédito → F.VENCIMIENTO |

Flujo conceptual:

`BASE GENERAL → PAGOS_MES → FUENTE DE PAGO → CONFIRMACIÓN → CONTROL DE PANEL → ACTUALIZACIÓN BASE GENERAL`

Separaciones obligatorias del motor:

- `PAGO REGISTRADO ≠ PAGO CONFIRMADO`
- `PAGO CONFIRMADO ≠ SERVICIO RENOVADO`
- `SERVICIO RENOVADO ≠ BASE GENERAL ACTUALIZADA`
- `FILA FÍSICA ≠ IDENTIDAD DEL CLIENTE`

### 4.1 Naturaleza dinámica de las filas

Las referencias de fila (`737`, `1503`, etc.) son **coordenadas temporales de auditoría**, no identificadores persistentes.

Las filas pueden desplazarse por:

- ingreso de nuevos clientes;
- inserciones o eliminación de filas;
- reordenamientos por fecha o estado;
- cortes mensuales;
- reconstrucciones del flujo;
- movimientos entre bloques operativos.

Por tanto:

1. ningún componente del motor debe depender de que un cliente permanezca en una fila específica;
2. los checkpoints pueden citar una fila como evidencia temporal, pero deben registrar también la identidad operacional asociada;
3. las automatizaciones futuras deben localizar registros mediante claves de negocio/identidad y contratos de columnas, no por número de fila fijo;
4. `FILA_BASE` u `ORIGEN BASE`, cuando se utilicen como trazabilidad, representan una referencia de ejecución/corte y deben revalidarse contra identidad antes de una escritura;
5. cualquier fórmula o script que use `ROW()` debe entenderse como vínculo contextual dentro del corte actual, no como identificador canónico del cliente.

### 4.2 Claves y contratos de identidad

El motor debe resolver un cliente mediante identidad inequívoca. En el diseño vigente, los campos relevantes incluyen:

- `USUARIO` como identificador operacional principal en cruces con CONTROL;
- `ID`, cuando exista;
- `CLIENTE`, `TELEFONO` y `CORREO` como atributos de contraste;
- `PANEL` para desambiguación técnica;
- `ORIGEN BASE` / referencia de enlace como trazabilidad del corte;
- `CONFIRMACION = CONFIRMADO JM` como autorización financiera, no como identidad.

Una coincidencia por fila física sin validación de identidad no satisface el contrato del motor.

### 4.3 Estructura versus runtime

`ESTRUCTURA_GESTION_DIA_PAGOS` define la **forma canónica** esperada del motor.

`GESTION_DIA_PAGOS_2026_TIVIPLAY` es el **runtime vivo**.

Por tanto:

`ESTRUCTURA ≠ RUNTIME ≠ EVIDENCIA`

El archivo estructural se usa para entender nombres, roles, columnas y relaciones. El runtime vivo debe leerse para validar estado, fórmulas, datos y excepciones reales.


---

## 5. Prueba E2E — José Orozco

Caso utilizado para validar el motor de noviembre de extremo a extremo.

Identidad operacional observada en el corte del 2026-11-10:

- cliente: José Orozco;
- coordenada temporal en BASE GENERAL: fila 737;
- usuario técnico: `Jose10021`;
- fuente financiera: `ZELLE (NOV)`, fila 4;
- pago: USD 70;
- confirmación: `CONFIRMADO JM`;
- enlace: `ENLAZADO`.

### 5.1 Cambio de plan resuelto

El tarifario vigente identificó USD 70 como:

- `PLAN PRINCIPAL`;
- `PLAN 6 MESES`;
- 1 pantalla.

Se actualizó el contrato comercial del cliente en BASE GENERAL:

- `G737 = PLAN 6 MESES`;
- `H737 = 1`.

Resultado en `ZELLE (NOV)`:

- `VALIDACION_TARIFA = COINCIDE PLAN`;
- `ESTADO_PROPUESTA = VALIDADO`;
- `TIPO_CAMBIO = SIN CAMBIO`;
- `GATE_CAMBIO_PLAN = VALIDADO`.

### 5.2 Puente mensual NOV implementado

Las columnas auxiliares `AL:AQ` de BASE GENERAL fueron migradas de referencias rígidas de OCT a NOV y propagadas hasta la fila 2545.

Contrato implementado:

- `AL`: crédito observado en `CONTROL (NOV) P1/P2/P3`, cruzando por `USUARIO`;
- `AM`: nueva F.VENCIMIENTO técnica tomada de columna H de CONTROL NOV cuando `CREDITO >= 1`;
- `AN`: `CONFIRMADO JM` únicamente cuando una fuente NOV está enlazada y validada;
- `AO`: fecha de último pago propuesta desde la fuente financiera NOV validada;
- `AP`: próxima fecha de pago propuesta desde la fuente financiera NOV validada;
- `AQ`: estado de habilitación para actualizar BASE.

Fuentes admitidas por el puente financiero:

- `ZELLE (NOV)`;
- `PAYPAL (NOV)`;
- `TRANSF (NOV)`.

El enlace usa `FILA_BASE = ROW()` como coordenada contextual del corte, pero las hojas financieras recalculan FILA_BASE mediante identidad normalizada y TC; por tanto, la fila no se trata como identidad canónica.

### 5.3 Hallazgo de CONTROL NOV

La estructura visible de CONTROL NOV presenta encabezados `FECHA` y `F.VENCIMIENTO`, pero la evidencia operacional muestra que:

- columna H contiene la **nueva fecha técnica de vencimiento**;
- columna I contiene la **fecha/hora de ejecución**.

Caso José Orozco en `CONTROL (NOV) P3`:

- usuario: `Jose10021`;
- crédito: 1;
- H = `2026-12-03`;
- I = `2026-11-03 20:10:18`.

Por esta evidencia, `AM` fue corregida para leer columna H.

### 5.4 Resultado final E2E

BASE GENERAL después de la implementación:

- `Q737 = 2026-12-03`;
- `R737 = 2026-11-01`;
- `S737 = 2027-05-01`;
- `T737 = 172`;
- `E737 = Al dia`;
- `AN737 = CONFIRMADO JM`;
- `AQ737 = HABILITADO PARA ACTUALIZAR BASE`.

Interpretación del motor:

`pago confirmado + identidad enlazada + tarifa validada + ejecución técnica observada = BASE GENERAL actualizada por fórmula`

La diferencia entre `Q` y `S` es intencional:

- `Q / F.VENCIMIENTO` = horizonte técnico de servicio;
- `S / F.PRÓXIMO PAGO` = horizonte comercial de cobertura.

Para un plan multimes, el servicio puede renovarse técnicamente por períodos parciales mientras la cobertura comercial permanece pagada por más meses.

---

## 5.5 Verificación global post-implementación

Después de activar el puente NOV se volvió a auditar `AL:AQ` sobre las 1.612 filas reales de cliente:

- `AL`: 0 fórmulas faltantes;
- `AM`: 0 fórmulas faltantes;
- `AN`: 0 fórmulas faltantes;
- `AO`: 0 fórmulas faltantes;
- `AP`: 0 fórmulas faltantes;
- `AQ`: 0 fórmulas faltantes.

Se detectaron 15 coordenadas temporales con `CREDITO >= 1` en CONTROL NOV pero sin fecha técnica utilizable en columna H:

`197, 262, 270, 335, 405, 411, 440, 607, 673, 680, 703, 710, 714, 716, 890`.

Clasificación:

- motor/fórmulas: **VALIDADO**;
- caso E2E José Orozco: **VALIDADO**;
- esos 15 registros: **REQUIERE DECISIÓN / dato operativo incompleto**.

Las coordenadas son evidencia temporal y no identificadores persistentes.

---

## 6. Evidencia del cierre

Lectura directa de la hoja viva realizada el 2026-11-10:

- `AB`: 0 faltantes
- `AL`: 0 faltantes
- `AM`: 0 faltantes
- `AN`: 0 faltantes
- `AO`: 0 faltantes
- `AP`: 0 faltantes
- `AQ`: 0 faltantes
- pasada global en `E, Q:T, Y:AG, AL:AQ`: sin huecos de fórmula en el universo contractual.
- caso E2E José Orozco: `VALIDADO` en ZELLE NOV, BASE GENERAL actualizada por fórmula y CONTROL NOV reconocido correctamente.

---

## 7. Definition of Done

El gate `BASE GENERAL · propagación de fórmulas` se considera satisfecho cuando:

1. las filas reales de cliente están identificadas de forma determinística;
2. todas las columnas calculadas del contrato tienen propagación completa;
3. las excepciones manuales están identificadas y aprobadas explícitamente;
4. las fórmulas canónicas quedan documentadas en GitHub;
5. existe evidencia de lectura de la hoja viva;
6. no se modifica otra hoja antes de registrar este checkpoint.

**Resultado de propagación:** **VALIDADO**  
**Resultado de integridad funcional total:** **VALIDADO** — caso E2E José Orozco ejecutado correctamente contra ZELLE (NOV) + CONTROL (NOV) + BASE GENERAL.

---

## 8. CHECKPOINT

**ACTIVE CONTEXT**  
BASE GENERAL de TiviPlay auditada y documentada antes de avanzar al siguiente tab.

**EVIDENCIAS**  
1.612 filas reales de cliente auditadas; propagación íntegra en columnas contractuales. La fila temporal 737 ya tiene fórmulas completas; queda una anomalía funcional por ausencia de fuentes históricas en AJ/AK y resultado derivado en T/E.

**DECISION LOG**  
Las filas físicas son coordenadas temporales, no identidad. El caso temporal 737 demostró que el motor debe resolver identidad, tarifa, fuente financiera y CONTROL antes de actualizar BASE GENERAL.

**BLOQUEOS**  
Ninguno para cerrar el gate de propagación. Ninguno para este gate. La brecha funcional observada en la fila temporal 737 fue resuelta mediante el puente NOV y la validación del cambio de plan.

**NEXT ACTION**  
Abrir la auditoría de `PAGOS NOVIEMBRE 2026` usando el motor NOV ya implementado y el caso José Orozco como evidencia E2E de referencia.

---

## 9. Regla de continuidad

`DOCUMENTACIÓN ≠ ESTADO ACTUAL ≠ DATO VIVO ≠ EVIDENCIA`

Este archivo documenta el estado validado al **2026-11-10**. Antes de futuras escrituras o automatizaciones debe volver a verificarse la hoja viva.
