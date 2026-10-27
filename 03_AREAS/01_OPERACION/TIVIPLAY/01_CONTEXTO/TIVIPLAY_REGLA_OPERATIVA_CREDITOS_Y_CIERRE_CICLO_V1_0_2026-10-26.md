# TIVIPLAY — REGLA OPERATIVA DE CRÉDITOS Y CIERRE DE CICLO

**Versión:** 1.0  
**Fecha:** 2026-10-26  
**Estado documental:** VALIDADO POR DIRECCIÓN  
**Ámbito:** TiviPlay — CONTROL P1/P2/P3, habilitación financiera, intranet y BASE GENERAL  
**Owner de decisión:** Dirección (JM)  
**Contrato relacionado:** S0 v0.3  
**Principio:** CONTROL gobierna cuándo actuar; la cobertura financiera gobierna si se puede actuar; el asesor ejecuta; BASE GENERAL recibe el resultado.

---

## 1. Objetivo

Cerrar la regla operacional que gobierna la renovación técnica de clientes TiviPlay y su relación con:

- `CONTROL (MES) P1`;
- `CONTROL (MES) P2`;
- `CONTROL (MES) P3`;
- `PAGOS [MES]`;
- hojas financieras Zelle / PayPal / Transferencia;
- `BASE GENERAL`;
- intranet operacional.

Esta regla evita confundir pago, cobertura financiera, tarea técnica, crédito ejecutado y actualización de BASE GENERAL.

---

## 2. Regla canónica

`CONTROL` es la agenda técnica de renovaciones.

Las hojas `CONTROL P1/P2/P3` están organizadas por fecha dentro del mes. El asesor trabaja sobre el horizonte operativo correspondiente y normalmente ejecuta el crédito un día antes del vencimiento técnico.

La existencia de una fila en CONTROL no significa que el cliente haya pagado durante el mes actual ni que el crédito ya haya sido ejecutado.

Separaciones obligatorias:

`CONTROL PROGRAMADO ≠ CRÉDITO EJECUTADO`

`PAGO DEL MES ≠ ÚNICA FORMA DE HABILITACIÓN FINANCIERA`

`HABILITADO PARA CRÉDITO ≠ CRÉDITO EJECUTADO`

`CRÉDITO EJECUTADO ≠ BASE GENERAL ACTUALIZADA`

`F.PRÓXIMO PAGO ≠ F.VENCIMIENTO`

`CONFIRMADO JM ≠ CICLO CERRADO`

`AMARILLO = CICLO ABIERTO`

`VERDE = CICLO E2E CERRADO Y VALIDADO`

---

## 3. Flujo operacional

1. El cliente aparece en `CONTROL P1/P2/P3` según su agenda técnica.
2. El sistema identifica al cliente por `USUARIO` y lo cruza con `BASE GENERAL`.
3. El sistema determina su habilitación financiera mediante Caso A o Caso B.
4. La intranet presenta al asesor el estado financiero de forma directa.
5. Si está habilitado, el asesor ingresa al panel correspondiente y ejecuta el crédito real.
6. El asesor registra en CONTROL la evidencia de ejecución, incluyendo `CREDITO` y el nuevo `F.VENCIMIENTO`.
7. El sistema detecta la evidencia técnica.
8. El sistema actualiza `F.VENCIMIENTO` en `BASE GENERAL`.
9. El ciclo técnico del cliente queda `VALIDADO`.

Flujo resumido:

`CONTROL → MATCH USUARIO/BASE → HABILITACIÓN FINANCIERA → INTRANET → EJECUCIÓN ASESOR → CREDITO + F.VENCIMIENTO EN CONTROL → BASE GENERAL → VALIDADO`

---

## 4. Habilitación financiera

Existen dos caminos válidos.

### 4.1 Caso A — Pago del ciclo actual

Aplica cuando existe un pago correspondiente al ciclo actual.

Condiciones mínimas:

- identidad inequívoca;
- pago enlazado;
- confirmación financiera `CONFIRMADO JM`;
- coherencia del plan/tarifa o excepción resuelta.

Resultado:

`HABILITADO PARA CRÉDITO`

La confirmación financiera sigue siendo exclusiva de Dirección (JM).

### 4.2 Caso B — Cobertura previamente pagada

Aplica cuando el cliente ya pagó una cobertura multimes, semestral, anual o equivalente y por ello no necesariamente aparece en la hoja de pagos del mes actual.

Condiciones canónicas S0 v0.3:

- `TC=1`;
- identidad inequívoca;
- `F.PRÓXIMO PAGO` posterior a la fecha del crédito;
- coherencia con `PLAN ACTIVO`, incluyendo cobertura multimes / +k aplicable.

Resultado:

`HABILITADO PARA CRÉDITO`

En este caso NO se exige una transacción en `PAGOS [MES]`.

Ejemplo: un cliente con plan anual puede aparecer cada mes en CONTROL para la ejecución técnica correspondiente aunque su siguiente cobro financiero sea varios meses después.

---

## 5. Estado esperado en intranet

La intranet debe eliminar la búsqueda manual que hoy realiza el asesor copiando `USUARIO` desde CONTROL hacia BASE GENERAL.

Para cada tarea técnica debe presentar como mínimo:

- cliente / usuario;
- panel;
- fecha de atención;
- estado de cobertura;
- motivo de habilitación cuando sea necesario para auditoría;
- estado de ejecución técnica.

Estados operativos mínimos:

### AL DÍA / HABILITADO PARA CRÉDITO

El cliente cumple Caso A o Caso B.

Acción del asesor:

`OTORGAR CRÉDITO`

### PENDIENTE DE PAGO

No existe confirmación financiera aplicable y la cobertura vigente no alcanza la fecha técnica.

Acción:

No otorgar crédito; continuar flujo de cobro/escalamiento.

### REQUIERE DECISIÓN

La identidad, cobertura, plan, panel o evidencia presenta una ambigüedad que impide determinar la habilitación sin intervención humana.

Acción:

Escalar; no automatizar.

---

## 6. Ejecución técnica y evidencia

El crédito solo se considera ejecutado cuando existe evidencia real en CONTROL.

Evidencia mínima:

- `USUARIO` identificado;
- `CREDITO >= 1` cuando aplique;
- nuevo `F.VENCIMIENTO`;
- panel/CONTROL correspondiente.

Una fila programada con `TC=1` pero sin `CREDITO` y sin nuevo `F.VENCIMIENTO` es una tarea pendiente, no una renovación ejecutada.

Por tanto:

`TC=1 + SIN CREDITO/F.VENCIMIENTO → PENDIENTE DE CRÉDITO`

No se debe inventar ni proyectar un crédito como ejecutado.

---

## 7. Cierre automático del ciclo

Cuando el asesor ejecuta el crédito y registra la evidencia en CONTROL:

`HABILITACIÓN FINANCIERA VÁLIDA + CREDITO EJECUTADO + F.VENCIMIENTO REGISTRADO`

habilita:

`CONTROL → BASE GENERAL.F.VENCIMIENTO`

La actualización de BASE GENERAL concluye el ciclo técnico de ese cliente.

Estado final:

`VALIDADO`

### 7.1 Semáforo canónico de cierre

El color de la fila en `BASE GENERAL` representa el estado integral del ciclo y no una etapa aislada.

**AMARILLO — CICLO ABIERTO:** el cliente permanece amarillo mientras exista cualquier acción pendiente del ciclo, incluyendo pago/confirmación financiera, crédito técnico o propagación del nuevo vencimiento hacia BASE GENERAL. Un `CONFIRMADO JM` por sí solo no cambia el ciclo a verde.

**VERDE — CICLO CERRADO:** la fila puede pasar a verde únicamente cuando se cumpla el gate E2E completo: habilitación financiera válida por Caso A o Caso B + crédito real ejecutado + nuevo `F.VENCIMIENTO` registrado en CONTROL + nuevo `F.VENCIMIENTO` reflejado en BASE GENERAL + ausencia de excepción pendiente.

Por tanto:

`CONFIRMADO JM + CRÉDITO PENDIENTE → AMARILLO`

`PAGO/COBERTURA VALIDADA + CRÉDITO EJECUTADO + F.VENCIMIENTO CONTROL + BASE ACTUALIZADA + SIN EXCEPCIÓN → VERDE`

El semáforo es evidencia visual del cierre operacional E2E; no debe derivarse únicamente del estado financiero ni de `ESTADO = Al dia`.

La actualización automática nunca debe sustituir la ejecución real del crédito ni fabricar evidencia.

---

## 8. Responsabilidades

### Dirección (JM)

- confirma pagos cuando aplica Caso A;
- decide excepciones financieras;
- audita indicadores y excepciones;
- no debe intervenir en la ejecución rutinaria de créditos.

### Asesor / Operación

- consulta la cola de créditos;
- verifica en intranet el estado de habilitación;
- ejecuta el crédito real en el panel;
- registra `CREDITO` y `F.VENCIMIENTO` en CONTROL;
- escala únicamente excepciones.

### Sistema / Intranet

- cruza CONTROL con BASE GENERAL y evidencia financiera;
- evalúa Caso A y Caso B;
- presenta el estado de habilitación;
- no ejecuta créditos ficticios;
- detecta la evidencia registrada en CONTROL;
- actualiza BASE GENERAL cuando el gate técnico está satisfecho;
- cierra el match/ciclo.

---

## 9. Definition of Done del ciclo individual

Un ciclo de renovación queda `VALIDADO` únicamente cuando:

- [x] la tarea técnica está identificada en CONTROL;
- [x] la identidad es inequívoca;
- [x] existe habilitación financiera por Caso A o Caso B;
- [x] el asesor ejecutó el crédito real;
- [x] CONTROL registra `CREDITO` y nuevo `F.VENCIMIENTO`;
- [x] BASE GENERAL refleja el nuevo `F.VENCIMIENTO`;
- [x] no existe excepción pendiente para ese ciclo;
- [x] el semáforo de BASE GENERAL puede representar el ciclo como `VERDE`.

Si falta ejecución técnica:

`PENDIENTE DE CRÉDITO`

Si falta cobertura:

`PENDIENTE DE PAGO`

Si existe ambigüedad:

`REQUIERE DECISIÓN`

---

## 10. Evidencia de validación 2026-10-26

Durante la validación operacional del 26/10/2026 se comprobó con casos reales que:

- Zelle, PayPal y Transferencia pueden propagar `CONFIRMADO JM` hacia `PAGOS OCTUBRE 2026`;
- cuando CONTROL contiene crédito ejecutado y nuevo `F.VENCIMIENTO`, BASE GENERAL puede recibir la actualización;
- cuando existe pago confirmado pero CONTROL no contiene crédito ejecutado, el cliente debe permanecer `PENDIENTE DE CRÉDITO`;
- un registro programado en CONTROL no debe interpretarse por sí solo como crédito ejecutado;
- el formato histórico de BASE GENERAL contiene reglas visuales parciales que no representan por sí mismas el cierre E2E; el semáforo canónico queda definido por el gate integral de este documento.

La Dirección confirmó adicionalmente que clientes con cobertura previamente pagada —por ejemplo anual— pueden requerir créditos técnicos durante meses en los que no tienen una transacción en `PAGOS [MES]`. Su habilitación debe resolverse mediante Caso B.

---

## 11. Decisión cerrada

A partir de esta versión, la lógica canónica es:

> CONTROL gobierna la agenda técnica. La habilitación financiera puede provenir del pago confirmado del ciclo actual (Caso A) o de cobertura previamente pagada vigente (Caso B). La intranet informa al asesor si puede otorgar el crédito. El asesor ejecuta el crédito y registra la evidencia en CONTROL. Solo entonces el sistema actualiza BASE GENERAL y concluye el ciclo. Mientras el ciclo esté abierto, su semáforo es AMARILLO; únicamente un ciclo E2E completamente cerrado y sin excepción puede representarse en VERDE.

**Estado:** `VALIDADO`

Cualquier automatización posterior debe respetar esta regla y no automatizar ambigüedades.
