# TIVIPLAY — CHECKPOINT BASE GENERAL · FÓRMULAS VALIDADO

**Fecha:** 2026-11-10  
**Área primaria:** 02 · TIVIPLAY | Finanzas y Servicio  
**Dependencias:** 00 · Gobierno y Continuidad / 04 · Plataforma y Equipo  
**Fuente viva:** Google Sheet `GESTION_DIA_PAGOS_2026_TIVIPLAY`  
**Spreadsheet ID:** `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`  
**Hoja:** `BASE GENERAL`  
**Estado del gate:** **VALIDADO**  
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

## 4. Excepción explícita — fila 737

Dirección confirmó manualmente la fila 737 el 2026-11-10.

En la evidencia viva:

- `R737` es valor fijo, no fórmula.
- `S737` es valor fijo, no fórmula.
- `AJ737` y `AK737` no contienen respaldo histórico.
- `Q737`, `T737`, `Y737:AG737` y `AL737:AQ737` sí contienen sus fórmulas correspondientes.

Por decisión explícita de Dirección, `R737/S737` se registran como **excepción manual validada** y no como hueco de propagación. No se reemplazan automáticamente.

Esta excepción no autoriza nuevas excepciones silenciosas. Cualquier nueva fila sin fórmula en una columna calculada debe clasificarse `REQUIERE DECISIÓN` antes de ser aceptada.

---

## 5. Evidencia del cierre

Lectura directa de la hoja viva realizada el 2026-11-10:

- `AB`: 0 faltantes
- `AL`: 0 faltantes
- `AM`: 0 faltantes
- `AN`: 0 faltantes
- `AO`: 0 faltantes
- `AP`: 0 faltantes
- `AQ`: 0 faltantes
- pasada global en `E, Q:T, Y:AG, AL:AQ`: sin huecos de fórmula en el universo contractual, salvo la excepción manual `R737/S737` documentada arriba.

---

## 6. Definition of Done

El gate `BASE GENERAL · propagación de fórmulas` se considera satisfecho cuando:

1. las filas reales de cliente están identificadas de forma determinística;
2. todas las columnas calculadas del contrato tienen propagación completa;
3. las excepciones manuales están identificadas y aprobadas explícitamente;
4. las fórmulas canónicas quedan documentadas en GitHub;
5. existe evidencia de lectura de la hoja viva;
6. no se modifica otra hoja antes de registrar este checkpoint.

**Resultado:** **VALIDADO**

---

## 7. CHECKPOINT

**ACTIVE CONTEXT**  
BASE GENERAL de TiviPlay auditada y documentada antes de avanzar al siguiente tab.

**EVIDENCIAS**  
1.612 filas reales de cliente auditadas; fórmula íntegra en columnas contractuales; excepción R737/S737 confirmada manualmente por Dirección.

**DECISION LOG**  
La fila 737 mantiene R/S como valores manuales explícitos. No se infiere ni reemplaza fórmula de manera automática.

**BLOQUEOS**  
Ninguno para cerrar este gate de propagación.

**NEXT ACTION**  
Abrir auditoría de la siguiente hoja únicamente después de este checkpoint: `PAGOS NOVIEMBRE 2026`.

---

## 8. Regla de continuidad

`DOCUMENTACIÓN ≠ ESTADO ACTUAL ≠ DATO VIVO ≠ EVIDENCIA`

Este archivo documenta el estado validado al **2026-11-10**. Antes de futuras escrituras o automatizaciones debe volver a verificarse la hoja viva.
