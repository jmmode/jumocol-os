# TIVIPLAY_BASE_GENERAL_CONTRATO_FORMULAS_V1

**Área:** 04 · Plataforma y Equipo  
**Gate:** P0 · Integridad y propagación universal de fórmulas  
**Fecha:** 2026-11-09  
**Estado del contrato:** IMPLEMENTADO documentalmente · validación E2E pendiente  
**Hoja objetivo:** `BASE GENERAL`  
**Libro operacional:** `GESTION_DIA_PAGOS_2026_TIVIPLAY`  
**Estructura de referencia:** `ESTRUCTURA_GESTION_DIA_PAGOS`

## 1. Alcance

Este contrato gobierna exclusivamente la integridad estructural y de fórmulas de `BASE GENERAL`.

Durante esta iteración las hojas de ventas, pagos, Zelle, PayPal, transferencias y CONTROL son **fuentes de lectura y dependencias**. No se escriben ni se modifican.

No se autoriza inferir fechas, confirmaciones JM, tarifas ni decisiones comerciales.

## 2. Regla de cobertura

La validación debe recorrer **todas las filas pobladas y aplicables**, clasificándolas antes de intervenir como:

- cliente operativo;
- venta nueva incorporada;
- reactivación;
- vencido;
- desactivado;
- registro histórico;
- fila estructural / encabezado / subtotal;
- excepción legítima.

Una prueba por muestra no satisface el gate.

## 3. Identidad

La identidad técnica debe priorizar `USUARIO` normalizado y, cuando exista, `ID`, `PANEL` y evidencia comercial.

Reglas obligatorias:

- no seleccionar registros únicamente por nombre;
- normalizar prefijos históricos como `VENCIO/`, `VENCIDO/`, `LIBERADO/` y variantes aprobadas;
- una coincidencia única permite resolución determinística;
- cero o múltiples coincidencias deben quedar bloqueadas para revisión;
- ningún número físico de fila es identidad permanente.

## 4. Contrato de columnas observado

### 4.1 Campos manuales / protegidos

En filas de cliente, se preservan salvo autorización expresa:

`A TC`, `B CLIENTE`, `C TELEFONO`, `D CORREO`, `F OBSERVACIONES GESTION`, `G PLAN ACTIVO`, `H PANTALLAS`, `I CELULAR`, `J USD`, `K COP`, `L MÉTODO DE PAGO`, `M ID`, `N USUARIO`, `O CONTRASEÑA`, `P PANEL`, `U REFERIDO`, `V DISPOSITIVOS`, `W OBSERVACIONES ASESOR`, `X CUMPLEAÑOS`.

Las validaciones de datos observadas en producción incluyen al menos F, G, L y P. Deben conservarse al propagar fórmulas o formatos.

### 4.2 Fórmulas canónicas para filas de cliente

Las siguientes fórmulas fueron observadas tanto en la estructura de referencia como en filas operativas actuales. `{r}` representa la fila destino.

- **E · ESTADO**
  `=IF(T{r}>5,"Al dia",IF(AND(T{r}>=1,T{r}<=5),"Por vencer","Vencido"))`

- **Q · F.VENCIMIENTO**
  `=IF(B{r}="",AI{r},IF(AND(AN{r}="CONFIRMADO JM",AL{r}>=1,AM{r}<>""),MAX(IF(ISNUMBER(AI{r}),AI{r},0),AM{r}),AI{r}))`

- **R · F.ULTIMO PAGO**
  `=IF(B{r}="",AJ{r},IF(AND(AN{r}="CONFIRMADO JM",ISNUMBER(AO{r})),IF(ISNUMBER(AJ{r}),MAX(AJ{r},AO{r}),AO{r}),AJ{r}))`

- **S · F. PRÓXIMO PAGO**
  `=IF(B{r}="",AK{r},IF(AND(AN{r}="CONFIRMADO JM",ISNUMBER(AP{r})),IF(ISNUMBER(AK{r}),MAX(AK{r},AP{r}),AP{r}),AK{r}))`

- **T · DÍAS**
  `=S{r}-TODAY()`

- **Y · TIPO ESTRUCTURAL**
  `=IF(G{r}="","",IF(REGEXMATCH(UPPER(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," ")))),"^(VENTAS .*EXCEPCI|DESACTIVADOS |REACTIVACIONES |TOTAL |⬇|⬆)"),"IGNORAR ESTRUCTURA",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:E,2,FALSE),IF(COUNTIF(CATALOGO_PLANES!B:B,TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))))>0,"PLAN PRINCIPAL",IF(COUNTIF(CATALOGO_ADDONS!B:B,TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))))>0,"ADD-ON","REQUIERE DECISIÓN")))))`

- **Z · CÓDIGO PLAN**
  `=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:D,4,FALSE),IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!A:A,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))`

- **AA · PLAN CANÓNICO**
  `=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IFERROR(VLOOKUP(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),EQUIVALENCIAS_CATALOGO!A:C,3,FALSE),IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_PLANES!B:B,0)),INDEX(CATALOGO_ADDONS!B:B,MATCH(TRIM(CLEAN(SUBSTITUTE(G{r},CHAR(160)," "))),CATALOGO_ADDONS!B:B,0)))))`

- **AB · DURACIÓN**
  `=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN"),"",IF(Y{r}="PLAN PRINCIPAL",INDEX(CATALOGO_PLANES!E:E,MATCH(Z{r},CATALOGO_PLANES!A:A,0)),INDEX(CATALOGO_ADDONS!C:C,MATCH(Z{r},CATALOGO_ADDONS!A:A,0))))`

- **AC · FECHA BASE DERIVADA**
  `=IF(OR(Y{r}="",Y{r}="IGNORAR ESTRUCTURA",Y{r}="REQUIERE DECISIÓN",R{r}="",S{r}="",AB{r}=""),"",IFERROR(EDATE(S{r},-AB{r}),""))`

- **AD · DELTA ÚLTIMO PAGO**
  `=IF(AC{r}="","",IFERROR(R{r}-AC{r},""))`

- **AE · CLASIFICACIÓN DELTA**
  `=IF(AND(AC{r}<>"",AD{r}=""),"FECHA ULTIMO PAGO INVALIDA",IF(AD{r}="","",IF(AD{r}=0,"PAGO EN FECHA DE CICLO",IF(AD{r}>0,"PAGO POSTERIOR AL CICLO","PAGO ANTERIOR AL CICLO"))))`

- **AF · PRÓXIMO PAGO DERIVADO**
  `=IF(OR(R{r}="",AB{r}=""),"",IFERROR(EDATE(R{r},AB{r}),""))`

- **AG · DELTA PRÓXIMO PAGO**
  `=IF(AND(S{r}<>"",R{r}<>"",AF{r}=""),"FECHA ULTIMO PAGO INVALIDA",IF(OR(S{r}="",AF{r}=""),"",IFERROR(S{r}-AF{r},"")))`

- **AH · NOMBRE NORMALIZADO**
  `=IF(B{r}="","",UPPER(TRIM(CLEAN(SUBSTITUTE(B{r},CHAR(160)," ")))))`

- **AL · CRÉDITOS/CONTROL**
  Consulta CONTROL por `USUARIO`; debe resolver la evidencia de servicio sin escribir en CONTROL.

- **AM · FECHA CONTROL**
  Consulta la última fecha válida de CONTROL para el mismo `USUARIO` cuando existe crédito/ejecución.

- **AN · CONFIRMACIÓN JM**
  Debe reflejar `CONFIRMADO JM` únicamente cuando exista en la fuente de pagos correspondiente.

- **AO · FECHA FINANCIERA CONFIRMADA**
  Debe derivarse de PAGOS para el mismo `USUARIO` confirmado.

- **AP · PRÓXIMO PAGO FINANCIERO**
  Debe derivarse de la fila fuente financiera enlazada por PAGOS, respetando ZELLE/PAYPAL/TRANSFERENCIA y sin inferir fechas.

### 4.3 AI:AK

`AI`, `AJ` y `AK` funcionan como valores base/históricos de respaldo para Q/R/S. Son datos protegidos: el motor no debe reemplazarlos por inferencia ni por una fórmula nueva sin una regla aprobada específica.

## 5. Filas estructurales

Encabezados, subtotales, separadores y rótulos no se tratan como clientes.

El motor debe detectarlos por estructura y contenido, no por un rango fijo de filas. Ninguna propagación puede escribir fórmulas de cliente sobre estas filas.

## 6. Recuperación de referencias

Cuando una fórmula o referencia financiera falte o esté desplazada:

1. normalizar identidad técnica;
2. buscar coincidencia única en la fuente;
3. verificar estado financiero aplicable;
4. verificar coherencia de panel/ID cuando exista;
5. emitir propuesta determinística;
6. escribir solo si la regla está aprobada y la identidad es única;
7. registrar evidencia antes/después.

Los casos ambiguos no bloquean el lote completo.

## 7. Protección de valores

Toda ejecución debe preservar:

- confirmaciones JM existentes;
- observaciones y gestiones del equipo;
- credenciales;
- fechas manuales legítimas;
- valores comerciales;
- filas estructurales;
- datos de otras hojas.

## 8. Idempotencia

Con un mismo corte de fuentes:

- primera ejecución puede producir correcciones;
- segunda ejecución debe producir `NO_CHANGES` para las correcciones ya aplicadas;
- no debe duplicar fórmulas, altas, referencias ni gestiones.

## 9. Evidencia obligatoria

Cada corrida debe producir, sin PII innecesaria:

- corte de lectura;
- total de filas examinadas;
- filas aplicables;
- filas estructurales;
- fórmulas correctas;
- fórmulas faltantes;
- fórmulas incorrectas;
- correcciones propuestas/aplicadas;
- referencias financieras verificadas;
- excepciones automáticas resueltas;
- excepciones pendientes y responsable;
- hash/firma o mecanismo equivalente para comparar dos ejecuciones;
- verificación de cero cambios en hojas fuera de BASE GENERAL.

## 10. Definition of Done

El gate solo puede marcarse `VALIDADO` cuando se demuestre cobertura completa de todas las filas pobladas y aplicables, fórmulas y formatos correctos, referencias financieras inequívocas, preservación de campos protegidos, idempotencia y evidencia reproducible.

Mientras no exista una corrida completa sobre copia de prueba y verificación posterior, el estado máximo es `PARCIAL`.
