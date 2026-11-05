# JUM-OI-OPS-TIVI-001 - Contexto Maestro de TiviPlay

**Versión:** 0.2 (nació como 0.1 con corte 2026-09-02)  
**Estado:** DRAFT — IN REVIEW  
**Nota de versión 0.2:** §5.4 consolida el contrato lógico del ciclo según S0 v0.3 vigente  
**Fecha de corte:** 2026-10-24  
**Módulo:** Operaciones  
**Submódulo:** TiviPlay  
**Decisión gobernante:** DEC-2026-09-02-010; contrato operativo vigente: S0 v0.3 (`TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md`, DEC-2026-10-24-018)

## Regla de lectura y evidencia

Este documento organiza evidencia existente. No reemplaza Google Drive, Google Sheets ni los documentos fuente. Cada afirmación operacional se clasifica con uno de estos estados:

| Estado | Significado |
| --- | --- |
| `VALIDADO` | Existe evidencia documental o técnica localizada y vigente para el alcance declarado. |
| `PENDIENTE DE VALIDACIÓN` | Existe referencia o evidencia parcial, pero falta confirmar vigencia, ownership, operación real o alcance. |
| `CONTRADICTORIO` | Dos o más evidencias presentan estados, ubicaciones o reglas incompatibles. |
| `NO DOCUMENTADO` | No se encontró evidencia suficiente dentro del alcance revisado. |

Una implementación de lectura, un fixture o una vista no certifican que el proceso operacional representado se ejecute de extremo a extremo.

## 1. Identificación del submódulo

| Elemento | Definición | Estado | Evidencia |
| --- | --- | --- | --- |
| Sistema | `JUMOCOL Operations Intelligence` | `VALIDADO` | DEC-2026-09-02-010 |
| Nombre operativo abreviado | `JUMOCOL OS` | `VALIDADO` | DEC-2026-09-02-010 |
| Repositorio canónico | `JUMOCOL_SYSTEM_OS` | `VALIDADO` | DEC-2026-09-02-010 |
| Módulo | Operaciones | `VALIDADO` | DEC-2026-09-02-010 |
| Submódulo | TiviPlay | `VALIDADO` | DEC-2026-09-02-010 |
| Función en la evolución del sistema | Primer laboratorio y caso de uso real | `VALIDADO` | DEC-2026-09-02-010 |
| Owner formal del submódulo | No confirmado | `NO DOCUMENTADO` | RESPONSIBILITY_MATRIX.md y GAP_ANALYSIS_v0.1.md |

## 2. Propósito

`VALIDADO` — Consolidar el contexto documental conocido de TiviPlay para que las fuentes, procesos, entidades, reglas, controles, implementaciones y brechas puedan revisarse sin reconstruirlos desde conversaciones informales.

`VALIDADO` — El Markdown organiza contexto; `JUMOCOL Operations Intelligence` lo visualiza y controla dentro de su alcance. Ninguno sustituye automáticamente las fuentes oficiales iniciales en Google Drive y Google Sheets.

`PENDIENTE DE VALIDACIÓN` — Este borrador no se convierte en estándar operacional aprobado hasta completar revisión humana de fuentes, owners, reglas y contradicciones.

## 3. Alcance

| Dominio incluido | Alcance documental | Estado |
| --- | --- | --- |
| Contexto general | Identidad, propósito, decisiones, límites y fuentes | `VALIDADO` |
| Clientes y suscripciones | Entidades, atributos documentados y relaciones pendientes | `PENDIENTE DE VALIDACIÓN` |
| Ventas y activaciones | Fuentes observadas y dependencia con pagos/facturación | `PENDIENTE DE VALIDACIÓN` |
| Pagos y conciliación | Contrato, reglas, métricas e implementación de lectura | `VALIDADO` para el dashboard; E2E `PENDIENTE DE VALIDACIÓN` |
| Renovaciones, vencimientos y cartera | Campos y señales presentes en fuentes observadas | `PENDIENTE DE VALIDACIÓN` |
| Servicio al cliente y soporte | Campos de gestión y referencias documentales dispersas | `PENDIENTE DE VALIDACIÓN` |
| Calidad, retención y campañas | Políticas, protocolos y vista de marketing localizados | `PENDIENTE DE VALIDACIÓN` |
| Reportes, indicadores y proyecciones | Métricas documentadas del dashboard y campos operativos observados | Parcialmente `VALIDADO` |

## 4. Fuera de alcance

- `VALIDADO` — Implementar MCP, integraciones, skills, hooks, subagentes, plugins o automatizaciones.
- `VALIDADO` — Crear una base de datos, un CRM, una fuente paralela o un Write Model.
- `VALIDADO` — Escribir, corregir o agregar filas en Google Sheets.
- `VALIDADO` — Modificar código, fixtures o componentes visuales.
- `VALIDADO` — Incluir credenciales, tokens, datos personales o registros individuales de clientes.
- `VALIDADO` — Declarar vigentes políticas, responsables, fórmulas o procesos cuya evidencia requiera confirmación.
- `VALIDADO` — Certificar resultados financieros u operativos a partir de este Markdown.

## 5. Modelo operativo general

### 5.1 Frontera entre fuente, lectura y visualización

`VALIDADO` — La arquitectura gobernante separa las fuentes oficiales de la capa de lectura y de la intranet:

```text
Google Drive / Google Sheets
            ↓
Fuentes oficiales iniciales
            ↓
Read Model / adaptadores autorizados
            ↓
JUMOCOL Operations Intelligence
            ↓
Visualización / control / auditoría / proyección
```

`VALIDADO` — El snapshot Excel local usado por el dashboard de pagos es un adaptador privado de lectura. No reemplaza el Google Sheet autorizado.

### 5.2 Ciclo corporativo de cliente

`VALIDADO` — `JUM_OPS_STD_CLIENT_001` define para JUMOCOL el ciclo general:

```text
Lead
→ Diagnóstico
→ Cotización
→ Aceptación
→ Pago confirmado
→ Handoff
→ Proyecto
→ Onboarding
→ Ejecución
→ QA
→ Entrega
→ Cierre / Soporte
```

`PENDIENTE DE VALIDACIÓN` — No existe evidencia suficiente para afirmar que TiviPlay ejecuta actualmente todo este ciclo con los mismos estados, gates y contratos.

### 5.3 Corte funcional actualmente implementado

`VALIDADO` — El dashboard de pagos implementa una lectura local de este corte:

```text
Fuente de gestión de pagos
→ Adaptador server-side de solo lectura
→ Normalización por periodo, cliente seudonimizado y moneda
→ Conciliación exacta
→ Métricas y controles de calidad
→ Visualización y exportación saneada
```

`PENDIENTE DE VALIDACIÓN` — El flujo completo `Payment → Credit → Service → Reconciliation` no está certificado E2E.

### 5.4 Contrato lógico del ciclo TiviPlay (S0 v0.3)

Fuente de las reglas: contrato S0 v0.3. Esta sección solo las ordena y no crea reglas nuevas. Estados según S0: `IMPLEMENTADO`, `PARCIAL`, `NO IMPLEMENTADO`, `BLOQUEADO`, `REQUIERE DECISIÓN`, `VALIDADO`, más `REQUIERE EVIDENCIA` para datos aún no observados.

```text
1. ORIGEN
   VENTAS [mes]  → eventos: Cliente nuevo | Referido | Reconexión   (estructura viva de octubre: REQUIERE EVIDENCIA)
   BASE GENERAL  → universo recurrente; F.PRÓXIMO PAGO lo incorpora a PAGOS [MES]

2. TIPO DE CICLO          (no reemplaza AL DIA / POR VENCER / VENCIDO)
   ALTA        ← Cliente nuevo / Referido
   RECURRENTE  ← BASE GENERAL por F.PRÓXIMO PAGO
   RECONEXIÓN  ← Reconexión de cliente histórico o existente    (gate: REQUIERE DECISIÓN)

3. IDENTIDAD
   Capa financiera: CLIENTE_KEY + TC → ENLAZADO (FILA_BASE) | SIN BASE | REQUIERE DECISIÓN
   ALTA sin fila en BASE → ALTA PENDIENTE (no es fallo de enlace)
   Ambigüedad → Back Office; pagador ≠ titular → REQUIERE DECISIÓN

4. GATE FINANCIERO        (solo Dirección/JM)
   comprobante → PENDIENTE CONFIRMACION → CONFIRMADO JM | REQUIERE REVISIÓN
   GATE_FINANCIERO VALIDADO = CONFIRMADO JM + ENLAZADO + COINCIDE PLAN + PROPUESTA CALCULADA
   Tarifa ≠ plan / cambio de plan → REQUIERE DECISIÓN (la excepción no avanza)

5. ALTA / ACTUALIZACIÓN / RECONEXIÓN en BASE GENERAL
   ALTA        → crear solo con Gate S0-A (TC=1, datos completos, identidad, sin duplicidad, confirmación)
   RECURRENTE  → actualizar fechas comerciales      (responsable/escritura: REQUIERE DECISIÓN; no automatizado)
   RECONEXIÓN  → EXISTENTE → ACTUALIZAR / REACTIVAR (provisional; no es alta nueva)

6. SERVICIO
   tarea de renovación autorizada por S0 §7.1:
     Caso A = CONFIRMADO JM + ENLAZADO + FILA_BASE del USUARIO
     Caso B = TC=1 + F.PRÓXIMO PAGO > fecha del crédito + dentro de la cobertura de PLAN ACTIVO (+k)
   requisito previo: USUARIO único en BASE y panel coherente; si no → REQUIERE REVISIÓN

7. CONTROL P1/P2/P3
   G = día del crédito · ejecutado ⇔ CREDITO > 0 · H = nueva F.VENCIMIENTO leída del panel · COMPRA excluida

8. BASE GENERAL
   CONFIRMADO JM + crédito ejecutado + F.VENCIMIENTO posterior al período = HABILITADO PARA ACTUALIZAR BASE
   HABILITADO ≠ ACTUALIZADO · precedencia si CONTROL y BASE difieren: REQUIERE DECISIÓN

9. ESTADO COMERCIAL
   F.PRÓXIMO PAGO → T → AL DIA (>5) / POR VENCER (1–5) / VENCIDO (≤0)   (regla aprobada 28/10/2026, DEC-2026-10-28-020)
   no pago ≠ baja · BAJA solo demostrada (criterio: REQUIERE DECISIÓN)
   disposición física de vencidos en BASE: REQUIERE EVIDENCIA

10. SIGUIENTE CICLO
   BASE GENERAL consolidada → corte gobernado → F.PRÓXIMO PAGO → PAGOS [MES+1]
   (diseño documentado; reproducibilidad PARCIAL)
```

Separaciones obligatorias: `ORIGEN COMERCIAL ≠ ESTADO DEL CICLO` · `ESTADO ≠ CONFIRMACIÓN FINANCIERA` · `CONFIRMADO JM ≠ ALTA AUTOMÁTICA` · `CONFIRMADO JM ≠ SERVICIO RENOVADO` · `F.PRÓXIMO PAGO ≠ F.VENCIMIENTO` · `F.VENCIMIENTO ≠ CRÉDITO AUTORIZADO` · `CONTROL ≠ BASE GENERAL ACTUALIZADA` · `HABILITADO PARA ACTUALIZAR BASE ≠ BASE ACTUALIZADA` · `VENCIDO ≠ BAJA`.

Estado por tramo al 24/10/2026, sin PII; la tabla de casos está en S0 §10:

| Tramo | Estado |
| --- | --- |
| `PENDIENTE CONFIRMACION → CONFIRMADO JM` (Zelle, PayPal, Transferencia) | `VALIDADO` (6 casos reales) |
| Camino financiero enlazado hasta `PROPUESTA CALCULADA` | `VALIDADO` |
| Excepciones de identidad/tarifa no forzadas por `CONFIRMADO JM` | `VALIDADO` |
| Hoja de medio de pago → `PAGOS [MES]` | `PARCIAL`; causa del caso no reflejado: `REQUIERE EVIDENCIA` |
| Servicio → CONTROL → F.VENCIMIENTO → BASE GENERAL actualizada | `NO IMPLEMENTADO` como evidencia (no observado) |
| Siguiente ciclo reproducible | `PARCIAL` |

### 5.5 Contrato canónico de BASE GENERAL

Aprobado por Dirección el 28/10/2026 (DEC-2026-10-28-020; totales y normalización física DEC-2026-10-28-021). La hoja viva cumple este contrato desde la normalización del 28/10/2026 (estructura y conteos al final de esta sección).

**Propósito.** BASE GENERAL (libro `GESTION_DIA_PAGOS_2026_TIVIPLAY`) es la fuente estructurada de la operación TiviPlay: una ficha por cliente/servicio con identidad (`USUARIO`, `PANEL`), ciclo comercial (`F.ULTIMO PAGO`, `F. PRÓXIMO PAGO`, `T`, `ESTADO`) y ciclo técnico (`F.VENCIMIENTO`). Título en la fila 1, encabezados en la fila 2.

**Fechas.** `F. PRÓXIMO PAGO` gobierna el ciclo comercial (cobro, `T`, `ESTADO`, orden de secciones, entrada a `PAGOS [MES]`). `F.VENCIMIENTO` gobierna el ciclo técnico del servicio (lo que muestra el panel; se actualiza desde CONTROL). Nunca se sustituyen entre sí ni se usa `F.VENCIMIENTO` para ordenar.

**Semáforo comercial (3 estados, únicos).** `T = F. PRÓXIMO PAGO − hoy` (columna S). `ESTADO` (columna E, fórmula por fila) = `Al dia` si `T > 5`, `Por vencer` si `1 ≤ T ≤ 5`, `Vencido` si `T ≤ 0`. El color de toda la fila (A:AP) lo gobierna E por formato condicional; no se pinta a mano. `ESTADO ≠ confirmación financiera`.

**VENCIDO ≠ BAJA ≠ DESACTIVADO ≠ INACTIVO TÉCNICO.** `Vencido` es solo estado comercial. La baja requiere criterio aprobado (REQUIERE DECISIÓN, §18), la desactivación es un acto operativo registrado y el estado técnico solo se demuestra con el panel. Ningún consumidor (hoja, motor o intranet) rotula Vencido como «desactivado».

**Seis secciones (pertenencia y orden)**

| # | Sección | Pertenencia | Orden |
| --- | --- | --- | --- |
| S1 | CLIENTES ACTIVOS TIVIPLAY · AL DIA / POR VENCER | Fichas TiviPlay del corte con `ESTADO ∈ {Al dia, Por vencer}` | `F. PRÓXIMO PAGO` ascendente (más próximo primero) |
| S2 | TOTAL TIVIPLAY | Universo TiviPlay completo: Al dia + Por vencer + Vencido + altas válidas del mes (S1 + S5 + S6). **No se rotula «activos»** | — |
| S3 | TOTAL MIRA+ | Solo registros identificados como Mira+ en su bloque; no se infiere | — |
| S4 | TOTAL GENERAL | `TOTAL TIVIPLAY + TOTAL MIRA+`, sin doble conteo | — |
| S5 | ALTAS / REACTIVACIONES DEL MES EN CURSO | Altas del mes operacional vigente. `ALTA DEL MES ≠ REACTIVACIÓN DEMOSTRADA`: no se infiere reactivación | Orden de registro |
| S6 | CLIENTES VENCIDOS | Fichas TiviPlay del corte con `ESTADO = Vencido` | Vencimiento comercial (`F. PRÓXIMO PAGO`) más reciente primero |

Disposición física: los bloques de fichas (S1, S5, S6) van antes de las filas de consolidación porque S2 suma los tres; S3 y S4 cierran la zona operativa.

**Consolidados (fórmulas por `ESTADO`, no por posición).** Como `ESTADO` es dinámico, los totales se calculan sobre los rangos de S1, S5 y S6 por la columna E, no por la sección donde está la fila:

| Fila | Indicador | Fórmula (columna A = TC; igual en J/K) |
| --- | --- | --- |
| Total S6 | TOTAL SECCIÓN CLIENTES VENCIDOS | `SUM(A_S6)` |
| S2 | TOTAL TIVIPLAY | `SUM(A_S1, A_S5, A_S6)` |
| — | ACTIVOS TIVIPLAY (AL DIA + POR VENCER) | `SUMIFS(A, E, "<>Vencido")` sobre S1, S5, S6 |
| — | VENCIDOS TIVIPLAY (ESTADO = VENCIDO) | `SUMIFS(A, E, "Vencido")` sobre S1, S5, S6 |
| S3 | TOTAL MIRA+ | `SUM(A_Mira)` |
| S4 | TOTAL GENERAL (TIVIPLAY + MIRA+) | `TOTAL TIVIPLAY + TOTAL MIRA+` |

Invariantes: `ACTIVOS + VENCIDOS = TOTAL TIVIPLAY`; `TOTAL TIVIPLAY ≠ ACTIVOS`; `VENCIDOS − TOTAL SECCIÓN VENCIDOS` = vencidos que están en S5 (altas del mes que ya vencieron) o que vencieron después de la normalización: diferencia temporal del mes, documentada, no oculta. Los totales suman `TC` (columna A); las fichas con `TC = 0` (cuentas sin cobro) cuentan como fila pero no en el total.

**Ciclo mensual.** Las secciones son una fotografía física a la fecha de normalización; `ESTADO` es vivo. Al cierre mensual ejecutado: S5 → S1/S6 según `ESTADO`, re-orden de S1 y S6 y nueva S5 vacía para el mes siguiente, según el contrato S0. Entre cierres, una ficha que cambia de estado no se mueve: los consolidados por `ESTADO` ya la cuentan bien. El corte de BASE alimenta `PAGOS [MES+1]` por `F. PRÓXIMO PAGO` (§5.4 paso 10).

**Relación BASE ↔ PAGOS.** Las hojas de medio (ZELLE/PAYPAL/TRANSF del mes) enlazan cada pago con su ficha por `CLIENTE_KEY + TC` → `COINCIDENCIAS_BASE`, `ESTADO_ENLACE` y `FILA_BASE`. `PAGOS [MES]` toma de BASE las fichas cuyo `F. PRÓXIMO PAGO` cae en el mes (corte) y conserva `ORIGEN BASE` («BASE GENERAL!n») solo como evidencia histórica del corte.

**Estrategia anti-posicional (definitiva).**
- La posición de fila no es identidad. Identidad comercial: `CLIENTE_KEY + TC` (y `USUARIO` como llave operacional); identidad técnica: `PANEL + LINE_ID`. Nunca solo el nombre; nunca se inventa `LINE_ID`.
- `FILA_BASE` es un puntero **calculado**: en las hojas de octubre `INDEX(FILTER(ROW(BASE!A), BASE!AF = CLIENTE_KEY, BASE!A = TC), 1)`; en las de septiembre (y ZELLE (OCT) desde la fila 1001) `MATCH(CLIENTE_KEY, BASE!AF$3:AF$n, 0) + 2`. Ambos se recalculan al mover filas. Regla: el rango del `MATCH` debe empezar en la fila 3 porque el `+2` es su desplazamiento; insertar filas justo en la fila 3 desplaza el inicio y rompe el puntero (incidente del 28/10/2026, corregido el mismo día).
- Las fórmulas de pago leen `W`, `Y`, `Z`, `H` con `INDEX(…, FILA_BASE)`: siguen a la ficha porque `FILA_BASE` la sigue.
- Las fichas deben permanecer dentro del rango buscado (hoy filas 3–1223; el rango se amplía solo con inserciones internas).
- `ORIGEN BASE` («BASE GENERAL!n» en `PAGOS [MES]`, `PRELIMINAR`, `FLUJO 743 *`) es texto estático del corte: evidencia, no identidad; ningún consumidor (fórmula, motor o intranet) lo usa para localizar fichas. 64 de 96 punteros de PAGOS OCTUBRE ya estaban desalineados antes de normalizar. No se reescriben.
- La intranet y la conciliación localizan por `USUARIO`/llave y calculan la fila en vivo; no persisten posiciones.
- Toda reordenación futura: ensayo en copia, una operación de orden por llamada con relectura, y verificación de `FILA_BASE` (llave en la fila apuntada = `CLIENTE_KEY`, TC = 1, sin llaves duplicadas).

**Relación BASE GENERAL ↔ intranet.** La intranet lee BASE en solo lectura, recorre todas las secciones por `TC`/`ESTADO` (independiente de la posición) y salta las filas de consolidación. Matriz al 28/10/2026 tras normalizar:

| Indicador | Fuente | Regla | Resultado BASE | Resultado intranet | Conciliación |
| --- | --- | --- | --- | --- | --- |
| Activos | BASE E/A | BASE: `ACTIVOS TIVIPLAY` (S1+S5+S6, TC, ESTADO ≠ Vencido). Intranet: TC=1, ESTADO activo, actividad ≥ 2026-06-01, todas las secciones | 731 | 735 | 731 + 3 Mira+ al día + 1 ficha Al dia en historial DESACTIVADOS (REQUIERE DECISIÓN) = 735. Definición declarada en la evidencia del KPI |
| Vencidos | BASE E/A | BASE: `VENCIDOS TIVIPLAY`. Intranet: «Clientes vencidos», TC=1, ESTADO=Vencido, actividad ≥ 2026-06-01, todas las secciones | 92 | 208 | La intranet suma además 1 Mira+, fichas Vencido de secciones DESACTIVADOS y RESELLER NC y excluye fichas sin actividad desde junio. Rotulado «vencidos», nunca «desactivados» |
| Conciliación · Activos/Inactivos/Excepción | Snapshots de panel | Estado técnico (`F.VENCIMIENTO`) | — | 713 / 1203 / 60 | Universo y semántica técnica; no comparable con ESTADO |
| Dashboard pagos (Excel) · Por vencer | ESTADO | Misma regla > 5 / 1–5 / ≤ 0 | — | instantánea | Alineado |

Los KPI de la intranet no dependen de la posición de las filas: la normalización no cambia sus valores.

**Estructura viva normalizada (28/10/2026).**

| Filas | Sección | Contenido | Conteo al normalizar |
| --- | --- | --- | --- |
| 1–2 | — | Título + encabezados | — |
| 3 | S1 (título) | CLIENTES ACTIVOS TIVIPLAY · AL DIA / POR VENCER | — |
| 4–727 | S1 | Fichas ordenadas por `F. PRÓXIMO PAGO` ascendente | 724 filas: 717 Al dia, 7 Por vencer; Σ TC 701 |
| 728 | S5 (título) | ALTAS / REACTIVACIONES DEL MES EN CURSO · OCTUBRE 2026 | — |
| 729–760 | S5 | Altas de octubre en orden de registro | 32: 29 Al dia, 1 Por vencer, 2 Vencido; Σ TC 32 |
| 761 | S6 (título) | CLIENTES VENCIDOS · más reciente primero | — |
| 762–858 | S6 | Fichas Vencido, `F. PRÓXIMO PAGO` descendente | 97 Vencido; Σ TC 90 |
| 859 | — | TOTAL SECCIÓN CLIENTES VENCIDOS | 90 |
| 860 | S2 | TOTAL TIVIPLAY (AL DIA + POR VENCER + VENCIDO + ALTAS DEL MES) | 823 |
| 861 | — | ACTIVOS TIVIPLAY (AL DIA + POR VENCER) | 731 |
| 862 | — | VENCIDOS TIVIPLAY (ESTADO = VENCIDO) | 92 (= 90 de S6 + 2 de S5) |
| 863–868 | S3 | CLIENTES DE MIRA+ (4: 3 Al dia, 1 Vencido) + TOTAL MIRA + | 4 |
| 869 | S4 | TOTAL GENERAL (TIVIPLAY + MIRA+) | 827 = 823 + 4 |
| 870 | — | Separador «SEPTIEMBRE» (trasladado desde el interior de S1) | — |
| 871–873 | Fuera de contrato | VENTAS SEPTIEMBRE EN EXCEPCIÓN (1) + total, fuera del total general | sin cambios |
| 874 → | Fuera de contrato | DESACTIVADOS por mes (historial) y RESELLER NC | sin cambios (desplazados +3 filas) |

**Estado del gate:** `VALIDADO — ESTRUCTURA BASE GENERAL + CONSOLIDADOS` (aceptado por Dirección el 28/10/2026). Cierre técnico de residuos el mismo día (DEC-2026-10-28-022):
- Ficha de S1 con `F. PRÓXIMO PAGO` en texto: el texto venía de las columnas fuente `AH`/`AI` (fechas escritas como texto en celdas de fecha). Se normalizó solo el tipo (misma fecha, dd-mm-yy) y se restauraron las fórmulas estándar de `E` y `T`, que estaban como valores fijos. La ficha quedó en su posición de S1 por `F. PRÓXIMO PAGO`.
- Regla visual `CONFIRMADO JM`: misma condición (`W = CONFIRMADO JM` y `ESTADO ∈ {Al dia, Por vencer}`), ahora sobre `A3:AM` por contenido (no por filas fijas), con prioridad detrás de las reglas de texto de `E` y delante de las de fila: la celda `E` conserva su semáforo y el resto de la fila se resalta.
- `REQUIERE DECISIÓN` (no se movieron ni modificaron): (a) la ficha «Al dia» del historial DESACTIVADOS muestra Al dia solo porque su celda `T` contiene un texto en lugar de la fórmula; su `F. PRÓXIMO PAGO` es anterior a hoy, así que su estado vigente no se demuestra. (b) La ficha de S6 sin `F. PRÓXIMO PAGO` es la cuenta duplicada (TC = 0) de un cliente cuya cuenta activa es otra ficha; ninguna fuente fecha esta ficha y se mantiene al final de S6.

## 6. Mapa de procesos

| Proceso | Evidencia disponible | Estado |
| --- | --- | --- |
| Marketing y campañas | Existe una ruta de TiviPlay Marketing basada exclusivamente en fixtures | `PENDIENTE DE VALIDACIÓN` |
| Captación y seguimiento comercial | `VENTAS 2026 (Tiviplay)` documenta prospectos, ventas y seguimiento | `PENDIENTE DE VALIDACIÓN` por vigencia y contrato E2E |
| Venta, activación y reactivación | Tipos de ciclo ALTA y RECONEXIÓN y `ALTA PENDIENTE` definidos en S0 v0.3 (§5.4); gate de RECONEXIÓN y estructura viva de ventas de octubre abiertos | `PENDIENTE DE VALIDACIÓN` |
| Facturación mensual | El dashboard reconoce familias de facturación y elegibilidad | `VALIDADO` para lectura analítica |
| Registro de pagos | El dashboard reconoce movimientos por método, fecha, moneda y evidencia | `VALIDADO` para lectura analítica |
| Conciliación | Emparejamiento exacto por cliente normalizado y periodo | `VALIDADO` para la implementación actual |
| Renovaciones y vencimientos | Fuentes observadas contienen fechas de vencimiento y próximo pago | `PENDIENTE DE VALIDACIÓN` |
| Cartera y pendientes | Existen campos de pendientes y saldo derivado; no se encontró proceso canónico de cartera | `PENDIENTE DE VALIDACIÓN` |
| Créditos de servicio | Existen controles documentados por panel | `VALIDADO` para lectura; operación real `PENDIENTE DE VALIDACIÓN` |
| Servicio al cliente y soporte | Gestión operativa registra casos y seguimiento; no existe SOP canónico consolidado en el repositorio | `PENDIENTE DE VALIDACIÓN` |
| Calidad y retención | Existen políticas, manuales y protocolos referenciados, con vigencia no confirmada | `PENDIENTE DE VALIDACIÓN` |
| Reporte y cierre operativo | `TIVIPLAY_FORMATO_GESTION_OPERATIVA` contiene gestión, apertura, cierre y resúmenes | `PENDIENTE DE VALIDACIÓN` por actualidad |
| Proyección | La intranet está definida como capa de proyección; no se encontró modelo predictivo aprobado | `NO DOCUMENTADO` |

## 7. Entidades principales y relaciones

### 7.1 Entidades documentadas

| Entidad | Evidencia de atributos | Estado |
| --- | --- | --- |
| Cliente | Identificador seudonimizado, estado, plan y periodo en el modelo de pagos | `VALIDADO` en dashboard |
| Suscripción o servicio | Plan, pantallas, panel, vencimiento y próximo pago | `VALIDADO` como atributos; contrato canónico `PENDIENTE DE VALIDACIÓN` |
| Lead o prospecto | Origen, gestión, estado y seguimiento en fuentes de ventas | `PENDIENTE DE VALIDACIÓN` |
| Venta o activación | Concepto, asesor/rol comercial, plan, valor, fecha y método en fuente observada | `PENDIENTE DE VALIDACIÓN` |
| Obligación de facturación | Cliente, periodo, moneda, elegibilidad y valor esperado | `VALIDADO` en modelo del dashboard |
| Pago | Método, monto, moneda, fecha, confirmación, conciliación y evidencia | `VALIDADO` en modelo del dashboard |
| Crédito de servicio | Panel, crédito, recarga, origen y fecha cuando existe | `VALIDADO` en modelo del dashboard |
| Caso de soporte | Cliente gestionado, caso resuelto, seguimiento y observación en fuente observada | `PENDIENTE DE VALIDACIÓN` |
| Campaña o actividad de marketing | Fuente, objetivo, canal, estado y próxima acción en fixture | `PENDIENTE DE VALIDACIÓN`; no es registro operacional |

### 7.2 Relaciones

| Relación | Estado | Observación |
| --- | --- | --- |
| Cliente → Suscripción | `PENDIENTE DE VALIDACIÓN` | No se documentó un ID canónico compartido entre todas las fuentes. |
| Lead → Venta | `PENDIENTE DE VALIDACIÓN` | Existe información comercial, pero falta contrato de transición. |
| Venta → Pago | `PENDIENTE DE VALIDACIÓN` | GAP_ANALYSIS reporta que la relación exacta no está formalizada. |
| Suscripción → Facturación mensual | `VALIDADO` para el modelo de lectura | Se organiza por cliente seudonimizado, periodo y moneda. |
| Pago → Facturación | `VALIDADO` para conciliación exacta | Coincidencias múltiples requieren revisión. |
| Pago → Crédito → Servicio | `PENDIENTE DE VALIDACIÓN` | `FLOW-TIVI-001` permanece `IN VALIDATION`. |
| Cliente → Soporte / Retención | `PENDIENTE DE VALIDACIÓN` | Existen señales en fuentes, no un contrato canónico. |

## 8. Inventario de fuentes oficiales

| Fuente | Tipo y función | Vigencia observada | Estado |
| --- | --- | --- | --- |
| Google Drive | Repositorio oficial inicial de documentos y archivos operativos | Decisión vigente al 2026-09-02 | `VALIDADO` como frontera oficial |
| Google Sheets | Fuentes tabulares oficiales iniciales | Decisión vigente al 2026-09-02 | `VALIDADO` como frontera oficial |
| `GESTION_DIA_PAGOS_2026_TIVIPLAY` | Google Sheet autorizado de facturación, pagos y controles de créditos | Evidencia documentada al 2026-08-30 | `VALIDADO` para dashboard de pagos |
| Snapshot privado de `GESTION_DIA_PAGOS_2026_TIVIPLAY` | Exportación Excel local de solo lectura | Verificado para el runtime del dashboard | `VALIDADO` como adaptador; no es fuente sustituta |
| `VENTAS 2026 (Tiviplay)` | Google Sheet de ventas, activaciones, renovaciones, pagos y seguimiento. Origen de eventos ALTA y RECONEXIÓN (S0 v0.3) | Usado como evidencia el 24/10/2026; estructura y semántica de las hojas de octubre no documentadas | `PENDIENTE DE VALIDACIÓN` actual |
| `TIVIPLAY_FORMATO_GESTION_OPERATIVA` | Google Sheet de gestión diaria, apertura, cierre y resúmenes | Última observación documental 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| `Horario_TiviPlay_Junio2026_v3_FINAL_APROBADO` | Archivo de horario para junio de 2026 | Fuente aprobada para ese periodo | `VALIDADO` histórico; no vigente para septiembre |
| Política de incentivos y condiciones para comisionar | Documentos referenciados en Drive/local | Fechas y versiones diferentes | `CONTRADICTORIO` en vigencia |
| Manuales, instructivos y protocolos de cobro/retención | Documentos referenciados por SOURCE_AUDIT | Cobertura histórica, sin versión canónica confirmada | `PENDIENTE DE VALIDACIÓN` |

## 9. Reglas operativas

| Regla | Ámbito | Estado | Evidencia |
| --- | --- | --- | --- |
| Un pago reportado o comprobante no equivale a pago confirmado | Estándar corporativo | `VALIDADO` | DEC-008 y JUM_OPS_STD_CLIENT_001 |
| No hay Handoff sin pago confirmado | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay proyecto/ejecución sin Handoff completo | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay producción sin Onboarding completo | Estándar corporativo | `VALIDADO` | DEC-008 |
| No hay entrega sin QA aprobado | Estándar corporativo | `VALIDADO` | DEC-008 |
| El estándar corporativo se aplica sin adaptación a toda operación TiviPlay | TiviPlay | `NO DOCUMENTADO` | Falta validación del modelo operativo específico |
| Las monedas permanecen separadas y no se convierten automáticamente | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Los duplicados probables no suman recaudo confirmado | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| La conciliación usa coincidencia exacta normalizada; no usa fuzzy matching | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Coincidencias múltiples pasan a revisión | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Créditos de servicio no se interpretan como dinero | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Datos personales se seudonimizan o enmascaran en la vista | Dashboard de pagos | `VALIDADO` | TIVIPLAY_PAYMENTS_DASHBOARD.md |
| Reglas actuales de comisión, retención y reactivación | TiviPlay | `PENDIENTE DE VALIDACIÓN` | Versiones históricas y dispersas |

## 10. Roles, responsables y ownership

| Rol o responsabilidad requerida | Evidencia | Estado |
| --- | --- | --- |
| Owner formal del submódulo TiviPlay | No localizado | `NO DOCUMENTADO` |
| Owner de la fuente de ventas | No confirmado documentalmente | `PENDIENTE DE VALIDACIÓN` |
| Owner de gestión operativa | No confirmado formalmente | `PENDIENTE DE VALIDACIÓN` |
| Validador financiero de pagos | S0 asigna `CONFIRMADO JM` exclusivamente a Dirección (JM) | `VALIDADO` como rol; ejecutado en 6 casos reales el 24/10/2026 |
| Responsable de conciliación y excepciones | Función necesaria en el dashboard, sin owner formal | `PENDIENTE DE VALIDACIÓN` |
| Operaciones | Receptor corporativo posterior al Handoff | `VALIDADO` como rol general; asignación TiviPlay pendiente |
| QA / aprobación de entrega | Requerido por el estándar corporativo | `VALIDADO` como gate; owner TiviPlay pendiente |
| Soporte / retención | Evidencia de actividad y protocolos históricos | `PENDIENTE DE VALIDACIÓN` |
| Aprobador de modificaciones sensibles | Revisión humana obligatoria, identidad no formalizada | `PENDIENTE DE VALIDACIÓN` |

No se registran nombres personales en este contexto maestro hasta que exista ownership formal, vigente y autorizado.

## 11. Indicadores y fórmulas conocidas

| Indicador | Fórmula o definición documental | Estado |
| --- | --- | --- |
| Recaudo confirmado | Suma por moneda de pagos con evidencia válida y criterios de confirmación del método | `VALIDADO` |
| Recaudo esperado | Suma por moneda de facturación elegible; excluye desactivados y gratuidades con evidencia | `VALIDADO` |
| Saldo pendiente | `max(0, recaudo_esperado - recaudo_confirmado)` por moneda | `VALIDADO` |
| Porcentaje de recaudo | `recaudo_confirmado / recaudo_esperado × 100` por moneda | `VALIDADO` |
| Número de pagos | Grupos únicos de pago confirmado; un movimiento multimoneda cuenta una vez | `VALIDADO` |
| Clientes únicos | Identificadores seudonimizados únicos con pago confirmado | `VALIDADO` |
| Ticket promedio | `recaudo_confirmado / grupos_de_pago` por moneda | `VALIDADO` |
| Tasa de comisión de método | `comision / valor_base_disponible` | `VALIDADO` para el método documentado |
| Conciliación | `pagos_con_una_coincidencia_mensual_exacta / pagos_candidatos` | `VALIDADO` |
| Créditos consumidos | Suma del campo de crédito en hojas de control; no representa dinero | `VALIDADO` |
| Cumplimiento diario | `promedio_recaudo_por_dia_activo / meta_central` | `VALIDADO` como fórmula; meta vigente no se incorpora |
| Tasa de contacto | Campo observado en gestión operativa; fórmula no localizada | `NO DOCUMENTADO` |
| Tasa de conversión | Campo observado en gestión operativa; fórmula no localizada | `NO DOCUMENTADO` |
| Retención, churn o cartera por antigüedad | No se encontró fórmula canónica | `NO DOCUMENTADO` |
| Proyección de recaudo o demanda | No se encontró modelo aprobado | `NO DOCUMENTADO` |

Las cifras operativas no se reproducen en este documento; deben consultarse en la fuente autorizada y según el corte aplicable.

## 12. Controles y aprobaciones humanas

| Control | Estado | Evidencia o pendiente |
| --- | --- | --- |
| Validación financiera antes de `payment_confirmed` | `VALIDADO` | DEC-008 y estándar operacional |
| Revisión de coincidencias múltiples o ambiguas | `VALIDADO` | Dashboard de pagos |
| Revisión de cobertura incompleta de una familia de fuente | `VALIDADO` | Dashboard de pagos no estima contenido ausente |
| Aprobación humana para modificaciones sensibles | `VALIDADO` | DEC-010 |
| Aprobación de Handoff, Onboarding y QA | `VALIDADO` como estándar general | Aplicación TiviPlay pendiente |
| Aprobación de actualización de una fuente local | `PENDIENTE DE VALIDACIÓN` | Existe procedimiento técnico; falta owner formal |
| Aprobación de reglas de comisión, calidad y retención | `PENDIENTE DE VALIDACIÓN` | Vigencia documental contradictoria o incompleta |
| Autorización de futuras escrituras | `NO DOCUMENTADO` | La escritura actual está prohibida |

## 13. Estado de flujos e implementaciones existentes

| Flujo o capacidad | Estado | Evidencia y límite |
| --- | --- | --- |
| Dashboard `/operaciones/tiviplay/pagos` | `VALIDADO` como implementación funcional de lectura | Ruta, adaptador, modelo, documentación y typecheck; no certifica operación E2E |
| `FLOW-TIVI-001` | `PENDIENTE DE VALIDACIÓN` con estado técnico `IN VALIDATION` | Flujo completo y suite de pruebas no certificados |
| TiviPlay Marketing | `PENDIENTE DE VALIDACIÓN` | Vista implementada con fixtures; no es fuente de verdad |
| `FLOW-LEAD-001` | `VALIDADO` para el flujo corporativo documentado | No demuestra adquisición o conversión específica de TiviPlay |
| Estados y gates del ciclo de cliente | `VALIDADO` como estándar y representación conceptual | Proyectos y handoffs reales no documentados |
| Read Model de leads | `VALIDADO` para Landing Page | Alcance TiviPlay no documentado |
| Write Model | `NO DOCUMENTADO` como capacidad activa | Permanece planeado y no autorizado |
| Captura WhatsApp o correo inbound para TiviPlay | `NO DOCUMENTADO` | No hay integración autorizada |
| Automatizaciones o agentes de TiviPlay | `NO DOCUMENTADO` | No implementados ni autorizados |

**Estado activo al 2026-10-23 — iteración S3 cerrada (`FREEZE FUNCIONAL S3`).** Fuente detallada: `08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md`. NEXT ACTION: `AUDITORÍA INDEPENDIENTE GROK`; después, prueba real CONFIRMADO JM → habilitación → servicio → match → BASE GENERAL → intranet (no es desarrollo).

| Flujo o capacidad (S3) | Estado | Evidencia y límite |
| --- | --- | --- |
| Intranet con login y roles ADMIN/OPERADOR | `VALIDADO` | Solo red local; 1 ADMIN y 3 OPERADOR activos |
| HOY (motor mensual + cola diaria) | `VALIDADO` en conteos | HOY = Runtime (73/66/7); drift de firma abierto |
| Créditos P1/P2/P3 y KPI | `VALIDADO` como Dirección | Paridad 767/618/149 el 23/10; vista OPERADOR pendiente de evidencia |
| Habilitación financiera S0 y match H ↔ BASE GENERAL | `IMPLEMENTADO` | Sin caso real observado |
| Manuales y procesos, Guía rápida v1.2, 8 accesos rápidos, AT&T | `VALIDADO` | Guía v1.2 publicada a OPERADOR por SHA-256 |
| Launcher local | `VALIDADO` | Depende del equipo de Dirección encendido |

## 14. Restricciones técnicas y operativas

- `VALIDADO` — No escribir en Google Sheets desde la intranet en el alcance actual.
- `VALIDADO` — Mantener credenciales, archivos privados y PII fuera del navegador y del repositorio público.
- `VALIDADO` — No mezclar monedas ni inferir conversiones.
- `VALIDADO` — No utilizar matching difuso para atribuir pagos a clientes.
- `VALIDADO` — No presentar valores `null`, ceros o colecciones vacías como ausencia certificada de actividad externa.
- `VALIDADO` — No presentar fixtures como registros operacionales.
- `VALIDADO` — No crear agentes, hooks, plugins o automatizaciones antes de validar contexto, owners, entradas, salidas y excepciones.
- `VALIDADO` — No exponer la intranet con datos reales antes de autenticación y permisos aprobados.
- `PENDIENTE DE VALIDACIÓN` — Política de retención, acceso y revisión de información sensible de TiviPlay.

## 15. Decisiones vigentes

| Decisión | Aplicación al contexto | Estado |
| --- | --- | --- |
| DEC-2026-09-02-010 | Nomenclatura, calendario, TiviPlay como laboratorio, fuentes iniciales y revisión humana | `VALIDADO` |
| DEC-2026-08-26-008 | Estándar corporativo del ciclo de cliente y gates mínimos | `VALIDADO` |
| DEC-2026-08-26-004 | Vista de TiviPlay Marketing basada en fixtures | `VALIDADO` con límite explícito |
| DEC-2026-08-26-002 | Capa de aplicación canónica de la intranet | `VALIDADO` |
| DEC-2026-10-24-018 | S0 v0.3 reconocido como contrato vigente para consolidación documental | `VALIDADO` como decisión documental |
| DEC-2026-08-27-009 | Command Center técnico y fuente canónica JUM-OI-TECH-001 | `VALIDADO` |
| DEC-2026-10-22-014 a DEC-2026-10-23-017 | URL por panel en configuración privada; regla de créditos G/COMPRA/J; publicación de la guía v1.2 y AT&T; cierre S3 y próxima prueba | `VALIDADO` como decisión de Dirección |

## 16. Glosario

| Término | Definición | Estado |
| --- | --- | --- |
| Fuente oficial | Google Drive o Google Sheets autorizado que conserva la evidencia operacional inicial | `VALIDADO` |
| Snapshot local | Exportación privada usada por un adaptador de lectura; no reemplaza la fuente oficial | `VALIDADO` |
| Read Model | Lectura y transformación controlada sin mutar la fuente | `VALIDADO` |
| Write Model | Capa futura de comandos, validación, persistencia y auditoría | `NO DOCUMENTADO` como capacidad activa |
| Fixture | Dato local de demostración o representación visual, no evidencia operacional | `VALIDADO` |
| Pago reportado | Registro o comprobante pendiente de validación financiera | `VALIDADO` |
| Pago confirmado | Pago que cumple el procedimiento de validación aplicable | `VALIDADO` como concepto; procedimiento TiviPlay pendiente |
| Conciliación | Relación entre pago candidato y facturación mensual mediante reglas exactas | `VALIDADO` para dashboard |
| Crédito | Unidad de control de servicio; no se interpreta como moneda | `VALIDADO` |
| E2E | Flujo comprobado de extremo a extremo con evidencia reproducible | `VALIDADO` |
| Owner | Responsable formal de una fuente, proceso, decisión o aprobación | `VALIDADO` como concepto; asignaciones pendientes |

## 17. Mapa de los seis componentes futuros

| Componente | Función futura | Estado al 2026-09-02 | Límite actual |
| --- | --- | --- | --- |
| Contexto | Consolidar fuentes, procesos, reglas, ownership y brechas | `DRAFT — IN REVIEW` | Este documento es el único artefacto creado en esta fase |
| Integraciones / MCP | Acceso gobernado a fuentes autorizadas | `NO DOCUMENTADO` | No crear ni implementar todavía |
| Skills | Procedimientos reutilizables basados en reglas validadas | `NO DOCUMENTADO` | No crear antes de aprobar procesos y salidas |
| Hooks | Disparadores controlados de eventos o validaciones | `NO DOCUMENTADO` | No crear antes de contratos e idempotencia |
| Subagentes | Roles especializados con fuentes y permisos acotados | `NO DOCUMENTADO` | No crear antes de ownership y gates humanos |
| Plugin | Empaquetado futuro de capacidades aprobadas | `NO DOCUMENTADO` | No crear antes de estabilización y validación del laboratorio |

El orden futuro no implica autorización de implementación. Contexto debe aprobarse antes de evaluar los otros cinco componentes.

## 18. Brechas, contradicciones y pendientes de validación

| Hallazgo | Estado | Acción requerida |
| --- | --- | --- |
| No existe owner formal documentado para TiviPlay y sus fuentes | `NO DOCUMENTADO` | Confirmar owner, custodio y aprobador por proceso |
| `FLOW-TIVI-001` está `IN VALIDATION`, pero la representación visual puede conservar el estado anterior `PLANNED` | `CONTRADICTORIO` | Alinear código solo en una tarea autorizada posterior |
| Vitest no produjo un cierre exitoso y concluyente en la verificación del 2026-09-02 | `PENDIENTE DE VALIDACIÓN` | Diagnosticar y repetir pruebas sin elevar el flujo a `VALIDATED` |
| `01_CONTEXT/SOURCE_INVENTORY.md` permanece sin fuentes registradas mientras SOURCE_AUDIT sí identifica fuentes | `CONTRADICTORIO` | Definir si el inventario general debe actualizarse después de aprobar este contexto |
| Ventas y gestión operativa tienen última observación documental de junio de 2026 | `PENDIENTE DE VALIDACIÓN` | Confirmar vigencia y estructura al corte septiembre |
| El horario identificado es oficial para junio, no para septiembre | `PENDIENTE DE VALIDACIÓN` | Localizar la fuente oficial del periodo actual |
| Relación Venta → Pago → Comisión no formalizada | `NO DOCUMENTADO` | Definir contrato de salida y fuente canónica por transición |
| Cliente, suscripción, venta, pago, crédito y soporte no comparten IDs canónicos documentados | `NO DOCUMENTADO` | Validar identidad y relaciones antes de integrar fuentes |
| Políticas de incentivos y condiciones para comisionar tienen versiones y ubicaciones distintas | `CONTRADICTORIO` | Determinar versión canónica y aprobación vigente |
| Manuales de cobro, retención y soporte están referenciados, pero no tienen versión canónica confirmada en el repositorio | `PENDIENTE DE VALIDACIÓN` | Inventariar y validar sin duplicar fuentes |
| Fórmulas de contacto, conversión, retención, churn y proyección no están consolidadas | `NO DOCUMENTADO` | Validar definición, campos, periodo y owner |
| No existe política canónica de acceso y retención de datos TiviPlay en este repositorio | `NO DOCUMENTADO` | Definir governance antes de ampliar integraciones |
| Marketing TiviPlay se representa con fixtures | `PENDIENTE DE VALIDACIÓN` | No tratar la vista como ejecución o medición real |
| Causa de la diferencia de propagación hoja de medio → `PAGOS [MES]` (caso ZEL-2, 24/10) | `REQUIERE EVIDENCIA` | Diagnóstico por fila; no atribuir al motor ni corregir en silencio |
| Causa del `SIN BASE` de un cliente existente en ruta de reconexión (caso ZEL-1) | `REQUIERE EVIDENCIA` | Contrastar llave `CLIENTE_KEY + TC` con la fila de BASE |
| Estructura viva y semántica de las hojas de ventas y pendientes de octubre | `REQUIERE EVIDENCIA` | Documentar antes de usarlas como contrato |
| Disposición física de vencidos en BASE GENERAL | `VALIDADO` (§5.5, 28/10/2026) | S6 «CLIENTES VENCIDOS» normalizada; re-orden en cada cierre mensual |
| Caso real completo hasta CONTROL y BASE GENERAL actualizada | `REQUIERE EVIDENCIA` | Observar sin automatizar |
| Gate definitivo de RECONEXIÓN | `REQUIERE DECISIÓN` | Dirección |
| Criterio operacional de BAJA | `REQUIERE DECISIÓN` | Dirección |
| Responsable y escritura de las actualizaciones de BASE GENERAL | `REQUIERE DECISIÓN` | Dirección |
| Precedencia de fechas técnicas si CONTROL y BASE GENERAL difieren | `REQUIERE DECISIÓN` | Dirección |
| Pagador distinto del titular cuando afecte identidad | `REQUIERE DECISIÓN` | Dirección |
| Estructura viva de BASE GENERAL vs contrato de 6 secciones (§5.5) | `VALIDADO` (28/10/2026, DEC-2026-10-28-021) | Dependencias `FILA_BASE` auditadas y verificadas tras mover filas; `ORIGEN BASE` es evidencia estática |
| Alcance de TOTAL TIVIPLAY y definición de TOTAL GENERAL | `DECIDIDO` (DEC-2026-10-28-021) | TOTAL TIVIPLAY = universo (activos + vencidos + altas del mes); TOTAL GENERAL = TIVIPLAY + MIRA+ |
| Secciones históricas fuera del contrato (ventas en excepción, DESACTIVADOS por mes, RESELLER NC) y sus totales con rangos desplazados | `REQUIERE DECISIÓN` | Decidir si se archivan, se incorporan al contrato o se corrigen |
| Ficha `Al dia` dentro del historial DESACTIVADOS de BASE GENERAL | `REQUIERE DECISIÓN` | No reincorporada: su celda `T` contiene texto y `F. PRÓXIMO PAGO` es anterior a hoy; definir el contenido correcto de `T`/`REFERIDO` antes de reclasificar |
| Ficha de S6 sin `F. PRÓXIMO PAGO` (cuenta duplicada TC = 0 de un cliente activo) | `REQUIERE DECISIÓN` | Decidir si se marca como duplicado/baja; no se infiere fecha |
| Dos pagos de ZELLE (SEPT) enlazados a fichas TC = 0 | `NO CRÍTICO` (gate financiero, DEC-2026-10-28-023) | Vencen en 2027; el ADD-ON con TC = 0 es la representación habitual; queda pendiente la identidad compartida de la venta en excepción |
| Gate financiero octubre: pagos de octubre sin reflejo en `F. PRÓXIMO PAGO` y ventas sin ficha | `BLOQUEADO` (NO APTO, DEC-2026-10-28-023) | 4 bloqueadores P0 en CHECKPOINT_S5, sección «Gate financiero final» |
| Fichas 45 y 48 con bloque de fórmulas ajeno en `W:AF` (la regla visual `CONFIRMADO JM` depende de él) | `REQUIERE DECISIÓN` | Restaurar las fórmulas de sistema y definir si la regla visual debe leer `AL` (confirmación) |

## 19. Tabla de evidencias y referencias

| Elemento | Evidencia | Ruta o fuente | Fecha | Estado |
| --- | --- | --- | --- | --- |
| Nomenclatura y prioridad TiviPlay | Decisión formal de continuidad | `00_GOVERNANCE/DECISIONS/DEC-2026-09-02-010_OPERATIONAL_CONTINUITY_SEP_DEC_2026.md` | 2026-09-02 | `VALIDADO` |
| Registro de DEC-010 | Entrada única en Decision Log | `00_GOVERNANCE/DECISIONS/DECISION_LOG.md` | 2026-09-02 | `VALIDADO` |
| Estándar del ciclo de cliente | Decisión de adopción | `00_GOVERNANCE/DECISIONS/DEC-2026-08-26-008_CLIENT_OPERATIONAL_STANDARD.md` | 2026-08-26 | `VALIDADO` |
| Definición funcional del ciclo | Estándar v1.0 | `03_AREAS/01_OPERACION/JUM_OPS_STD_CLIENT_001_Handoff_Onboarding_Ejecucion_Entrega.md` | 2026-08-26 | `VALIDADO` |
| Modelo futuro de persistencia | Propuesta no implementada | `03_AREAS/01_OPERACION/JUM_OPS_MODEL_CLIENT_001_Persistencia_Estructurada_Multicanal.md` | 2026-08-26 | `PENDIENTE DE VALIDACIÓN` |
| TiviPlay Marketing | Decisión de vista con fixtures | `00_GOVERNANCE/DECISIONS/DEC-2026-08-26-004_TIVIPLAY_MARKETING_WORKFLOW.md` | 2026-08-26 | `VALIDADO` con límite |
| Arquitectura y flujos técnicos | Snapshot técnico canónico v1.1 | `03_AREAS/06_TECNOLOGIA_IA/JUM-OI-TECH-001_TECNOLOGIA_IA.md` | 2026-09-02 | `VALIDADO` |
| Dashboard de pagos | Contrato, fuente, reglas, métricas y privacidad | `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/docs/TIVIPLAY_PAYMENTS_DASHBOARD.md` | 2026-08-30 | `VALIDADO` para lectura |
| Estado de la aplicación | README de la intranet | `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/README.md` | 2026-08-30 | `VALIDADO` documentalmente |
| Fuentes TiviPlay observadas | Auditoría de Drive, fuentes locales y correo sin trasladar PII | `SOURCE_AUDIT_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Dependencias entre procesos | Mapa de fuentes y entregas entre áreas | `DEPENDENCY_MAP_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Brechas y contradicciones | Análisis documental inicial | `GAP_ANALYSIS_v0.1.md` | 2026-06-12 | `PENDIENTE DE VALIDACIÓN` actual |
| Ownership general | Matriz con Operación pendiente | `00_GOVERNANCE/RESPONSIBILITY_MATRIX.md` | 2026-06-12 | `NO DOCUMENTADO` para TiviPlay |
| Contrato operativo S0 v0.3 | Contrato vigente con Casos A/B, tipo de ciclo y evidencia del 24/10 | `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md` | 2026-10-24 | `VALIDADO` como contrato; operación `PARCIAL` |
| Muestra real CONFIRMADO JM | 6 casos seudonimizados (ZEL/PAY/TRF), S0 §10 | Fuentes vivas de Dirección; sin PII en el repositorio | 2026-10-24 | Ver §5.4 |
| Cierre iteración S3 | Estado funcional, backlog y riesgos | `08_RUNTIME/CHECKPOINT_S3_FREEZE_FUNCIONAL_TIVIPLAY_2026-10-23.md` | 2026-10-23 | `VALIDADO` como registro |

## Riesgos

- Aprobar este borrador sin contrastar las fuentes oficiales actuales puede consolidar información histórica como vigente.
- Integrar fuentes antes de resolver IDs, ownership y controles puede crear una segunda fuente de verdad.
- Tratar reglas históricas de incentivos, retención o reactivación como vigentes puede afectar decisiones operativas y financieras.
- Confundir el dashboard funcional con el flujo E2E completo puede elevar una capacidad por encima de la evidencia.
- Exponer fuentes o vistas sin autenticación y permisos puede revelar información sensible.

## Evolución futura

1. Ejecutar revisión humana del inventario de fuentes, owners, reglas y brechas.
2. Confirmar fuentes vigentes de ventas, gestión operativa, horarios, soporte, calidad y retención al corte septiembre de 2026.
3. Definir identidades canónicas y relaciones mínimas sin crear una nueva base de datos.
4. Resolver las contradicciones documentales antes de cambiar estados técnicos.
5. Aprobar este documento antes de evaluar artefactos independientes de Integraciones/MCP, Skills, Hooks, Subagentes o Plugin.


---

## Anexo de continuidad — Mapa de fuentes y gestión operativa (2026-11-05)

**Estado del anexo:** VALIDADO como **inventario estructural** contra metadatos y encabezados de Google Sheets conectados; **PARCIAL** para funcionamiento extremo a extremo y sincronización bidireccional.  
**Corte documental:** 2026-11-05, Bogotá. No reescribe el contrato S0 v0.3 ni el corte histórico de 2026-10-24 de este documento.  
**Objetivo:** preservar en el documento maestro el mapa **ya existente**, sin crear otro CRM, tabla, fichero, app, módulo, conector o manual paralelo.  
**Alcance de esta actualización:** solo documentación; no se modificaron datos, fórmulas, permisos, scripts ni configuración productiva.  
**Evidencia de implementación de la intranet:** rama remota \`work/tiviplay-ficha-integral-20261104\` observada en el repositorio hasta \`4aa2bc16\`; existen entregas locales posteriores reportadas por Claude Code que **no se confirman como publicadas** en esta actualización.

### A. Inventario de las tres fuentes conectadas

| Libro real | ID Google Sheets | Hojas / ownership funcional | Estado comprobado |
| --- | --- | --- | --- |
| **VENTAS 2026 (Tiviplay)** | \`1y1yZSxHCz3HhfikgHNvhgKhU7rFCG9U8HH90QeTN6TQ\` | \`VENTAS_NOVIEMBRE\`, \`PENDIENTES NOVIEMBRE\`, \`VENTAS_OCTUBRE\` y meses anteriores; altas, ventas y reactivaciones | VALIDADO: archivo y pestañas presentes. La aplicación del gate venta → BASE sigue PARCIAL. |
| **GESTION_DIA_PAGOS_2026_TIVIPLAY** | \`1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4\` | \`BASE GENERAL\`; \`PAGOS NOVIEMBRE 2026\`; \`ZELLE (NOV)\`, \`PAYPAL (NOV)\`, \`TRANSF (NOV)\`; \`CONTROL (NOV) P1/P2/P3\`; hojas de octubre y meses anteriores | VALIDADO: estructura observable. Sincronización transversal y permisos de escritura por flujo: PARCIAL. |
| **TIVIPLAY_FORMATO_GESTION_OPERATIVA** | \`1vB0MfxOW4tyWIDgb6cbkxbeZrDfzCKsC7enNrtmR9ww\` | \`GESTION_CLIENTE\`, \`GESTION_DIARIA\`, \`APERTURA_OPERACION\`, \`CIERRE_OPERACION\`, \`ASIGNACION_BASES_6M\`, \`CONEXIONES_FUENTE\`, dashboards, \`GOBIERNO_DATOS\` y consultas | VALIDADO: estructura y encabezados. No equiparar con una integración transaccional terminada. |

**Relación documental:** \`CONEXIONES_FUENTE\` de Gestión Operativa refiere explícitamente a los libros de pagos y ventas. La existencia de enlaces **no prueba** que las fórmulas \`IMPORTRANGE\`, dashboards o escrituras funcionen íntegramente hoy. El mismo libro registra su transición como \`MAESTRO OPERATIVO ÚNICO\` en \`GOBIERNO_DATOS\`; esto es **aspiración documentada**, no autorización para reemplazar hoy a \`BASE GENERAL\` como fuente vigente de identidad/ciclo.

### B. Mapa de entidades, capas y relaciones

\`\`\`text
VENTAS 2026 (origen comercial)
    └─[validación de alta/reconexión y pago]─> BASE GENERAL (cliente + USUARIO + PANEL)
          ├─ PAGOS [MES] + ZELLE/PAYPAL/TRANSF = capa financiera
          │    └─ F. PRÓXIMO PAGO = fecha del ciclo comercial
          ├─ CONTROL (MES) P1/P2/P3 = capa de servicio
          │    └─ F.VENCIMIENTO = fecha técnica; CREDITO = evidencia de CONTROL
          └─ motor de CASOS (CASE_ID) / EVENTOS (EVENT_ID) = seguimiento transversal
               └─ hoja existente GESTION_CLIENTE = candidata a bitácora de eventos
                    ├─ GESTION_DIARIA (resultados por asesor/turno)
                    ├─ APERTURA_OPERACION + CIERRE_OPERACION
                    ├─ ASIGNACION_BASES_6M (responsables, bloques)
                    └─ dashboards, resumen, calidad y auditoría

JUMOCOL OS / Atención / Cola Operacional / Apertura / Cierre
    = interfaz de consulta y captura controlada, NO segunda fuente de verdad
\`\`\`

**Identidad y cardinalidad:** \`BASE GENERAL\` es referencia maestra actual; el \`USUARIO\` debe localizar una ficha inequívoca o producir excepción. Un cliente puede tener **varios casos**; un caso puede tener **varios eventos**. La fila física no es una identidad permanente. Ningún evento de cobro prueba por sí mismo pago, crédito ni estado del panel.

### C. Reutilización exacta de las hojas ya existentes de Gestión Operativa

| Hoja | Encabezados / funciones observadas | Rol de integración deseado | Brecha |
| --- | --- | --- | --- |
| \`GESTION_CLIENTE\` | Fila 3: \`ID_GESTION\`, \`FECHA_GESTION\`, \`MES\`, \`CLAVE_CLIENTE\`, \`USUARIO\`, \`PANEL_CANONICO\`, \`CLIENTE\`, \`TIPO_BASE\`, \`BLOQUE_ID\`, \`ASESOR\`, \`TIPO_GESTION\`, \`RESULTADO\`, montos, próxima acción, \`EVIDENCIA_URL\`, \`ESTADO_AUDITORIA\`, conciliadores y \`OBSERVACIONES\` | **Candidata prioritaria** a registro único de eventos; evaluar \`ID_GESTION ↔ EVENT_ID\`, \`CASE_ID\` asociado y preservación de datos históricos | PARCIAL: el encabezado no incluye \`CASE_ID\`; ninguna escritura desde el motor de casos está demostrada. No crear \`GESTIONES_EVENTOS\` duplicada sin decisión. |
| \`GESTION_DIARIA\` | Fila 1: fecha, asesor, inicio/fin, clientes gestionados/contactados, pagos confirmados, USD, reactivaciones, referidos, casos resueltos, seguimientos, tasas y observaciones | Consolidación diaria **derivada** de eventos, turnos y finanzas verificadas; datos manuales separados de los calculados | PARCIAL: no hay reconciliación E2E de métricas y eventos. |
| \`APERTURA_OPERACION\` | Fila 1: fecha, marca, clientes a facturar, recaudo proyectado, pendientes, meta de mes, **créditos iniciales P1/P3 TiviPlay y P2/P3 Mira+**, observaciones | Apertura desde intranet: visualizar proyección, registrar/confirmar inventario inicial con fecha, asesor y evidencia | PARCIAL: todavía no hay guardado comprobado desde intranet. |
| \`CIERRE_OPERACION\` | Fila 1: fecha, marca, recaudo/facturación, renovados, pendientes, pagos, acumulados y créditos iniciales/finales/comprados por panel | Cierre desde dashboard con recálculo de totales y registro de inventarios/evidencia del asesor | PARCIAL: cierre desde intranet no comprobado; no confundir foto/manual con saldo real del panel. |
| \`ASIGNACION_BASES_6M\` | Bloques, periodo, tipo de base, fuente, asesor, metas, cobertura, resultados, estado | Vincular turno, campaña, asesor y eventos al bloque asignado | PARCIAL: cruces aún por validar. |
| \`CONEXIONES_FUENTE\`, \`CONFIGURACION\`, \`DASHBOARD_OPERATIVO\` | Enlaces a libros externos y parámetro de mes observado como **octubre de 2026** | Insumos y visualizaciones existentes, **no** fuentes independientes de pagos/identidad | REQUIERE VALIDACIÓN: periodo mostrado y enlaces/fórmulas frente al mes operativo real. |
| \`GOBIERNO_DATOS\` | Declara Gestión Operativa como maestro *futuro* y Pagos como fuente transitoria activa | Referencia de migración propuesta y responsables | REQUIERE DECISIÓN: no migrar ownership silenciosamente. |

**Evidencia del equipo (capturas de WhatsApp aportadas por Dirección):** hoy comparte resumen diario y capturas de inventario de créditos P1/P2/P3. Son **reportes manuales fechados**, no lecturas de inventario vivo; la intranet debe permitir captura/confirmación de apertura y cierre con trazabilidad y distinguir \`VALOR_REPORTADO\` de \`VALOR_VERIFICADO\`.

### D. Contrato de campos vigentes en pagos y separación de responsabilidades

| Hoja | Campo | Regla |
| --- | --- | --- |
| \`BASE GENERAL\` | E = \`ESTADO\`; F = \`OBSERVACIONES GESTION\`; W = \`OBSERVACIONES ASESOR\` | E comercial es calculado; F gestión, W comentario libre. No actualizar E por registrar una llamada. |
| \`BASE GENERAL\` | N = \`USUARIO\`; P = \`PANEL\`; Q = \`F.VENCIMIENTO\`; R = \`F.ULTIMO PAGO\`; S = \`F. PRÓXIMO PAGO\`; AH = \`CLIENTE_KEY\` | Resolver **por encabezado**, no por índice fijo. Datos técnicos y comerciales separados. |
| \`PAGOS NOVIEMBRE 2026\` | E = \`ESTADO\`; F = \`OBSERVACIONES GESTION\`; W = \`OBSERVACIONES ASESOR\`; X = \`CONFIRMACION\`; R = \`F. PRÓXIMO PAGO\` | X es confirmación financiera, no resultado de gestión. F sigue teniendo contenido histórico. |
| \`ZELLE/PAYPAL/TRANSF (NOV)\` | Estado financiero y conciliación por ciclo/identidad | \`COMPROBANTE_RECIBIDO\` ≠ \`CONFIRMADO JM\`; solo el gate financiero autoriza actualizar el ciclo. |
| \`CONTROL (NOV) P1/P2/P3\` | E = \`USUARIO\`; H = \`FECHA\`; I = \`F.VENCIMIENTO\`; J = \`ORIGEN\`; K = \`CREDITO\` | Regla por encabezados. Leer historial no autoriza nuevo crédito. Hojas de octubre tienen posiciones distintas. |

**Contrato de interacción deseado (aún NO IMPLEMENTADO E2E):**
\`Etapa SOP → opción/desplegable o botón → mensaje/acción del asesor → resultado confirmado → EVENT_ID único → GESTION_CLIENTE → proyección en F del mes/BASE → indicadores del turno → auditoría\`.

- En el manual de cobranza existente, la etapa empieza D−5 y atraviesa recordatorio, llamada, imagen, datos de pago por método, alerta y retención. Reutilizar los scripts del Markdown vigente: no duplicarlos en la interfaz.
- Un selector de Google Sheets o un botón de intranet requiere **la misma semántica**, control de permisos, identidad verificada, idempotencia y relectura de la escritura. Cambiar un chip por sí solo **no registra** un evento.
- **F como estado seleccionable** y **F como historial textual** son representaciones incompatibles si se sobrescriben. Resolver explícitamente la proyección \`último estado\` vs. \`eventos completos\` en \`GESTION_CLIENTE\`, preservando lo ya escrito antes de modificar F.
- \`GESTION_CLIENTE\` ya tiene \`ID_GESTION\`, pero el motor P1 define \`CASE_ID\` y \`EVENT_ID\`; comprobar correspondencia en vez de crear nuevos identificadores inconexos. El modelo P1 en \`casos-model.ts\` es **puro, sin persistencia**. La escritura existente \`gestion-write.ts\` está protegida por \`TIVIPLAY_GESTION_WRITE\` y contempla **solo F mensual**; no demuestra sincronización en dos libros.
- Para soporte técnico: diagnóstico, acción, resultado, seguimiento, escalamiento y evidencia deberán reflejarse como eventos del caso, diferenciados de las confirmaciones de pago y ejecuciones de CONTROL.

### E. Roles, agentes y método de entrega

**Agentes de Claude Code ya presentes, sin crear otros:** \`.claude/agents/tiviplay-datos.md\`, \`.claude/agents/tiviplay-atencion.md\`, \`.claude/agents/tiviplay-verificacion.md\`.

- **Datos:** adapters de fuentes, lectura por encabezados, contrato de identidad, pruebas de persistencia. Sin contraseñas ni escrituras no autorizadas.
- **Atención:** reutilizar \`ATENDER\`, Cola Operacional y dashboard para selectores, apertura/cierre y vistas del cliente, sin construir otro módulo.
- **Verificación:** pruebas de regresión y paridad en hojas de ensayo, evidencia antes/después, roles ADMIN/OPERADOR y trazabilidad del evento.
- **Dirección:** aprueba reglas operativas, confirma pagos por el flujo autorizado, resuelve ambigüedades y habilita cambios de producción por gates.

**Secuencia controlada de futuras integraciones — no se adelanta aquí:**

1. **GATE MAPA (este anexo):** inventario de fuentes, tabs, entidades y responsabilidades, sin alterar producción. VALIDADO **documentalmente**.
2. **GATE CASOS/EVENTOS:** contrastar \`casos-model.ts\` con \`GESTION_CLIENTE\` y decidir reutilización de \`ID_GESTION\`, enlace \`CASE_ID\`, estados y campos faltantes. REQUIERE DECISIÓN de contrato, no crear otra hoja por defecto.
3. **GATE ESCRITURA ENSAYO:** caso + dos eventos + cierre verificado; registrar exactamente una vez, preservar histórico, comprobar relectura y que un comprobante no confirme pago. NO IMPLEMENTADO E2E.
4. **GATE ATENCIÓN:** botón/desplegable → evento → lectura inmediata comprobada en intranet y fuente; permisos por rol, sin doble registro. NO IMPLEMENTADO E2E.
5. **GATE APERTURA/CIERRE:** captura de inventarios y eventos reales, indicadores derivados y conciliación de resultados de jornada; no contar reportes de WhatsApp como inventario técnico verificado. NO IMPLEMENTADO E2E.

**CHECKPOINT:** mapa documental consolidado sobre la estructura real existente. No se crearon nuevas hojas ni sistemas. El siguiente trabajo va en el chat de \`Motor de Casos, Eventos y Gestión Operativa\`, sin mezclarlo con el gate activo de conciliación técnica y Panel 3. **NEXT ACTION:** verificar si \`GESTION_CLIENTE\` puede servir íntegramente como bitácora de eventos P1; definir contrato de \`CASE_ID\` y \`ID_GESTION\` antes de la primera escritura de ensayo.
