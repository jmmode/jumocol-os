# TIVIPLAY — Reglas del circuito comercial y cierre mensual

**Versión:** 1.0 · **Fecha:** 2026-11-01 · **Origen:** decisiones explícitas de Dirección en sesión de cierre OCT→NOV.
**Aplicación:** JUMOCOL OS / TIVIPLAY. **Estado:** reglas de fuentes y ciclo VALIDADO por Dirección; ejecución técnica y escrituras pendientes de validación.
**Propósito:** evitar escalamientos sobre información ya definida y garantizar el flujo comercial, financiero y operacional sin duplicados.

## 1. Función de cada fuente

| Fuente | Responsabilidad | Regla |
|---|---|---|
| `VENTAS 2026 TV PLAY`, pestaña mensual | **Registro maestro de la venta y condiciones comerciales vendidas** | Identifica operación, plan, duración y demás atributos registrados. Preservar historial. |
| `GESTION_DIA_PAGOS_2026_TIVIPLAY`, `ZELLE (MES)`, `PAYPAL (MES)`, `TRANSF (MES)` | **Registro financiero del pago** | El asesor registra y clasifica el movimiento; Dirección verifica y marca `CONFIRMADO JM`. |
| `BASE GENERAL` (en el libro de pagos) | **Ficha operacional vigente** | Alta, renovación o reactivación únicamente con pago confirmado y datos de identidad/servicio suficientes. |
| `CONTROL (MES) P1/P2/P3` | **Evidencia de cuenta y cobertura técnica** | Aporta usuario, panel, ID cuando exista y activación/créditos; nunca sustituye la fecha comercial sin regla expresa. |
| `PAGOS NOVIEMBRE 2026` | **Universo de gestión del mes** | Se deriva de BASE vigente, conserva notas del equipo y justifica excluidos/excepciones. |
| Intranet JUMOCOL OS | **Consulta, gestión y supervisión** | Debe leer el mismo estado validado de las fuentes anteriores, sin nueva fuente de verdad divergente. |

## 2. Clasificación de venta y confirmación

- `ZELLE (OCT)`: columna **F** clasifica `VENTA`.
- `PAYPAL (OCT)`: columna **K** clasifica `VENTA`.
- `TRANSF (OCT)`: columna **I** clasifica `VENTA`.
- Verificar encabezados y equivalencia para cada mes; no codificar letras sin validación del esquema.
- `CONFIRMADO JM` es exclusivamente decisión de Dirección. Ni el motor ni la coincidencia entre registros equivalen a confirmación financiera.
- **Cruce obligatorio**: venta mensual + movimiento financiero + `CONFIRMADO JM` + identidad/cuenta en CONTROL o BASE, con evidencia trazable.

## 3. Regla de prioridad para resolver planes y tarifas

1. En operaciones identificadas como **VENTA**, el **plan y duración vendidos se toman del registro correspondiente en `VENTAS 2026 TV PLAY`**; no se infieren a partir del importe cobrado.
2. Los medios de pago determinan el **importe efectivamente registrado y estado de confirmación**, no la duración del contrato.
3. CONTROL verifica la **cuenta técnica**; la activación puede diferir de la fecha comercial y se conserva por separado.
4. Si hay discrepancia material entre fuentes, clasificar `REQUIERE REVISIÓN` con la discrepancia precisa; no inventar un plan ni modificar fechas por inferencia.
5. Las promociones de reactivación (USD 70/12 meses/3 dispositivos y USD 10/1 mes para clientes >30 días inactivos) **no se aplican automáticamente por coincidencia de importe**. Las excepciones históricas autorizadas por Dirección se preservan y documentan separadamente de elegibilidad.

### Caso de referencia que fija la regla: PAYPAL (OCT)!12

- Tipo: **VENTA**.
- Importe PayPal: **USD 70**.
- `VENTAS OCTUBRE`, columna **N**: **plan de 6 meses**, según lectura aportada por Dirección.
- Por tanto **no clasificar como promoción de 12 meses por USD 70** solamente por el precio.
- Identificar la fila exacta de VENTAS y verificar pantallas, identidad, confirmación vigente y cuenta antes de preparar la inserción; no reinterpretar la duración por el precio.

## 4. Altas, renovaciones, reactivaciones y secciones de BASE

- **Venta nueva confirmada:** incorporar exactamente una ficha a la sección **ALTAS DEL MES DE LA VENTA**. Una venta de octubre confirmada o procesada en noviembre se identifica como **alta de octubre**.
- **Renovación:** actualizar ficha existente y preservar el ciclo cuando el pago sea anticipado, de acuerdo con la decisión ya aprobada; no crear alta duplicada.
- **Reactivación:** localizar ficha histórica (incluidos DESACTIVADOS), resolver identidad y reactivar/trasladar según sección vigente, sin crear duplicado ni borrar historial.
- **Consolidación mensual:** trasladar las altas válidas de ALTAS DEL MES a **CLIENTES AL DÍA** con trazabilidad a venta, pago y `CONFIRMADO JM`, preservando identidad/ID, fechas y estado; no copiar la ficha como duplicado.
- BASE debe representar el **estado operacional vigente**; VENTAS conserva el **historial comercial**.
- Reutilizar las secciones existentes. Validar sus límites, fórmulas, totales, desplazamientos y referencias físicas antes de insertar/trasladar filas.

## 5. Identidad y fechas

- Mapeo confirmado BASE: **M=ID; N=USUARIO; O=CONTRASEÑA; P=PANEL**. ID de cuenta debe venir de evidencia de panel/control; nunca inventar IDs. Falta poblar donde corresponda.
- No leer ni persistir **CONTRASEÑA**, tampoco en snapshots, previews, logs ni GitHub. Lectores y PR antiguos con offsets fijos quedan sujetos a corrección.
- Diferenciar fecha de **venta, pago, confirmación, activación, F. PRÓXIMO PAGO comercial y F.VENCIMIENTO técnico**.
- Para **altas nuevas**, preparar el cálculo inicial desde fecha de pago + duración **documentada en VENTAS** como alternativa D1; cuando exista diferencia con activación CONTROL, mostrar ambas fechas y el efecto antes de ejecutar. **D1 requiere ratificación explícita de Dirección antes de una escritura que dependa de ese anclaje.**
- Para renovaciones anticipadas, respetar el anclaje al ciclo ya aprobado. No modificar créditos de panel por derivación financiera.

## 6. Gate para correr noviembre y validar el diseño

1. Reconciliar todos los `CONFIRMADO JM` del corte OCT: aplicados / altas / revisión / fuera de TIVIPLAY, con evidencia y responsable.
2. Validar BASE y sus secciones: fichas únicas, mapeo ID/USUARIO/PANEL, fórmulas y separación MIRA+; preparar inserciones y traslados como lote único reversible, sin escritura no autorizada.
3. Ejecutar **motor seguro en solo lectura**, con corte explícito e idempotencia; comparar su universo por ficha con BASE y con la hoja actual de NOVIEMBRE. Documentar diferencias causadas por altas y pagos nuevos.
4. Mantener `AM:AP` (gestión del equipo) por identificador estable en cualquier regeneración; no borrar avances.
5. Verificar **equivalencia visual y funcional** de NOVIEMBRE frente a OCTUBRE: secciones, encabezados, orden, semanas, formatos, filtros, congelados, validaciones y protección; permitir columnas adicionales justificadas.
6. Integrar intranet solo tras validar mapeos y fuentes; no fusionar PR de seguridad desactualizados por desplazamiento N/O.

## 7. Estado, decisiones y control de cambios

- **Histórico del checkpoint §15 (01/11/2026):** 138 `CONFIRMADO JM` = 102 aplicados + 11 altas TIVIPLAY + 3 MIRA+ + 22 revisión. Simulación NOV con corte 01/11: 98 fichas; **no asumir que es el cierre definitivo**.
- **Pendientes con decisión específica:** D1 anclaje de altas; D2–D5 condiciones de bonos/promociones, reactivación y consolidación; D6 eliminación de contraseñas expuestas solo con plan seguro y respaldo. No sustituir estas decisiones por conjeturas.
- **GitHub:** registrar esta regla en documento canónico/Decision Log y actualizar checkpoint. Preferir commit/PR documental mínimo en rama existente; no crear documento duplicado si ya hay ubicación canónica. No fusionar/desplegar sin aprobación.
- **Autorización:** un commit documental no autoriza escribir Sheets ni publicar motor. Toda escritura requiere lote exacto, diff, relectura, respaldo, rollback y autorización de Dirección.

**NEXT ACTION:** Claude incorpora estas reglas al repositorio, actualiza el mapeo y las pruebas del motor donde proceda, cruza las 11 altas con VENTAS y presenta únicamente las decisiones irresueltas y el lote exacto autorizable. Prioridad: cerrar OCT→BASE y validar NOV antes de la intranet.
