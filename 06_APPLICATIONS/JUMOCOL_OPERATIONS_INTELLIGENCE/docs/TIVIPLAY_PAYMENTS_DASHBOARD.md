# TiviPlay — Gestión de pagos

## Objetivo

Documentar el contrato operativo, la fuente, las reglas y el procedimiento de actualización del dashboard `/operaciones/tiviplay/pagos`.

## Propósito

Convertir el libro autorizado de gestión de pagos en una lectura analítica auditable sin alterar el Excel, mezclar monedas ni exponer PII o credenciales al navegador.

## Alcance

- Fuente operativa autorizada: Google Sheet `GESTION_DIA_PAGOS_2026_TIVIPLAY`.
- Snapshot local privado de solo lectura para el runtime: `data/private/tiviplay/GESTION_DIA_PAGOS_2026_TIVIPLAY.xlsx`.
- Adaptador desacoplado y ejecutado solo en servidor.
- Facturación mensual, pagos Zelle/PayPal/transferencias y controles de créditos.
- Conciliación exacta por cliente normalizado y periodo.
- KPIs, filtros cruzados, conclusiones determinísticas, auditoría y CSV saneado.
- Comparación ejecutiva primaria de junio, julio y agosto de 2026.
- Sin escritura sobre Excel, Google Sheets, base de datos o API externa.

## Evidencia de la fuente

- Documento autorizado: `GESTION_DIA_PAGOS_2026_TIVIPLAY`.
- ID de Drive: `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`.
- Última actualización observada en Drive durante la auditoría: `2026-08-30T21:48:44.194Z`.
- Exportación local verificada: 6.299.344 bytes.
- SHA-256 del snapshot local: `92454FCFE03C94CC0D18FCE47F06C37115841D01272B7F41D32007138623DB0B`.
- Hojas: 54.
- Cobertura primaria comprobada: junio, julio y agosto de 2026.
- No se combinaron libros parciales ni se modificó el Google Sheet.

### Causa raíz corregida

El archivo privado anterior era un snapshot de 2.670.116 bytes, actualizado el 2 de febrero de 2026, con SHA-256 `F651D069185B936D6ABA7145AA357031BC98CDAA7CB3A736FB18F58DF2855903` y solo 16 hojas. Por eso el dashboard no podía presentar junio–agosto. Fue sustituido de forma controlada por una exportación de lectura del documento autorizado; no se crearon métricas mock ni se unieron fuentes distintas.

### Cobertura de familias junio–agosto

| Mes | PAGOS | ZELLE | PAYPAL | TRANSF | CONTROL P1 | CONTROL P2 | CONTROL P3 | Estado |
|---|---|---|---|---|---|---|---|---|
| Junio 2026 | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completo |
| Julio 2026 | Sí | Sí | Sí | Sí | Sí | No | Sí | Parcial |
| Agosto 2026 | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Completo |

La ausencia de `CONTROL P2` en julio se presenta como cobertura parcial. No invalida PAGOS ni las demás familias y no se estima contenido ausente.

Familias reconocidas de forma tolerante:

- `BASE GENERAL`.
- `PAGOS` + mes escrito completo o abreviado.
- `ZELLE` + mes.
- `PAYPAL` + mes.
- `TRANSF` / transferencias + mes.
- `CONTROL` + mes + panel.

`MIGRACION` y hojas no clasificables se auditan, pero no alimentan métricas financieras primarias.

## Modelo normalizado

### Facturación

Una fila por combinación de cliente seudonimizado, periodo y moneda. Conserva estado, plan, pantallas, método esperado, panel, vencimiento, próximo pago, elegibilidad y evidencia de mes gratis.

### Pagos

Una fila por moneda positiva de cada movimiento. Conserva método, asesor, origen, tipo venta/facturación, conciliación, confirmación, comisión PayPal y trazabilidad hoja/fila. Una transferencia con más de una moneda se separa y se marca como incidencia; no se convierte.

### Créditos

Registros de controles de Panel 1, 2 y 3 con créditos, recarga, asesor, origen y fecha cuando existe.

## Diccionario de métricas

| Métrica | Definición |
|---|---|
| Recaudo confirmado | Suma por moneda de pagos con cliente, monto positivo, fecha y evidencia válida. Zelle exige `CONFIRMADO`; PayPal exige monto y fecha de recibido; transferencias exigen registro fechado. Duplicados probables no suman. |
| Recaudo esperado | Suma por moneda de facturación mensual elegible. Excluye desactivados y meses gratis con evidencia explícita. |
| Saldo pendiente | `max(0, esperado - confirmado)`, por moneda. |
| Porcentaje de recaudo | `confirmado / esperado × 100`, por moneda. |
| Número de pagos | Grupos únicos de pago confirmado; una fila multimoneda cuenta una sola vez. |
| Clientes únicos | Identificadores seudonimizados únicos con pago confirmado. |
| Ticket promedio | Recaudo confirmado dividido por grupos de pago, por moneda. |
| Estado del cliente | Estado calculado respecto a la fecha de referencia de la fuente y próximo pago. |
| Comisión PayPal | Comisión asociada únicamente a pagos PayPal confirmados. |
| Tasa PayPal | Comisión / valor facturado o bruto disponible. |
| Conciliación | Pagos con una única fila mensual candidata exacta / pagos candidatos. |
| Créditos consumidos | Suma de `CREDITO` en hojas `CONTROL`, sin interpretarla como dinero. |
| Cumplimiento diario | Promedio de recaudo USD por día activo / meta central `USD 500`. |

## Reglas de normalización

- Se eliminan espacios exteriores y se unifican separadores internos.
- Las búsquedas ignoran mayúsculas y tildes; el contrato visual conserva etiquetas legibles.
- Fechas admiten valores Excel, objetos fecha y textos `dd/mm/aaaa` o ISO.
- Montos admiten punto o coma decimal y separadores de miles.
- USD, COP y CAD permanecen separados.
- Métodos, paneles, asesores, orígenes, planes y estados se normalizan mediante funciones centrales.
- Clientes se comparan por token exacto normalizado; no existe fuzzy matching.
- Coincidencias múltiples quedan en `Requiere revisión`.
- Datos personales se sustituyen por una etiqueta estable `Cliente •XXXX`.
- Observaciones enmascaran correos, teléfonos, enlaces y valores con apariencia de clave.

## Línea base independiente junio–agosto

Una segunda lectura del snapshot, independiente del adaptador de la aplicación, produjo estos totales. Las pruebas de integración los usan como controles de regresión:

| Mes | Esperado USD | Confirmado USD | Confirmado COP | Confirmado CAD | Comisión PayPal USD | Pagos | Créditos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Junio | 5.200,00 | 3.192,00 | 2.423.896 | 0 | 98,09 | 61 | 563 |
| Julio | 10.561,00 | 3.304,00 | 4.857.689 | 0 | 76,39 | 42 | 775 |
| Agosto | 10.905,00 | 7.928,00 | 1.515.711 | 0 | 95,38 | 120 | 766 |

- Julio contiene filas Zelle sin evidencia explícita `CONFIRMADO`; se procesan para auditoría, pero no se suman al recaudo confirmado.
- COP puede superar el esperado del mes; no se limita el porcentaje ni se convierte a USD.
- La diferencia entre esperado y recibido es real en la estructura disponible: los medios contienen movimientos que no siempre tienen una única fila en `PAGOS` del mismo mes.

## Governance y privacidad

- El Excel vive bajo `data/private/`, está excluido de Git y nunca se sirve desde `public/`.
- El adaptador está marcado `server-only`.
- El contrato serializable no contiene teléfono, correo, usuario, contraseña ni enlaces de confirmación.
- La firma de caché combina ruta, tamaño, fecha de modificación y SHA-256. Un cambio físico del archivo invalida el snapshot aunque conserve el mismo nombre.
- El endpoint de recarga relee físicamente el mismo snapshot local, recalcula la huella y renueva la caché en memoria.
- No se registran filas, nombres ni credenciales en logs.

## Actualización de la fuente

1. Cerrar Excel si mantiene bloqueado el archivo.
2. Exportar el documento autorizado sin editarlo y sustituir el archivo en `data/private/tiviplay/` conservando el nombre, o configurar `TIVIPLAY_PAYMENTS_WORKBOOK_PATH` con una ruta local autorizada.
3. No colocar el archivo en `public/` ni retirarlo de `.gitignore`.
4. Abrir el dashboard y usar `Recargar fuente`.
5. Revisar cobertura, auditoría, totales por moneda y conciliación.
6. Ejecutar `pnpm test`, `pnpm lint`, `pnpm typecheck` y `pnpm build` antes de aceptar una nueva estructura.

## Riesgos

- El snapshot local no se sincroniza en tiempo real con Google Sheets; puede quedar desactualizado hasta la siguiente exportación autorizada.
- Julio no contiene `CONTROL P2`; sus créditos de Panel 2 son `INFORMACION_NO_DISPONIBLE`, no cero confirmado.
- Las filas Zelle sin confirmación explícita no suman recaudo, aun cuando contengan cliente, fecha o monto.
- La ausencia de identificadores canónicos obliga a conciliar por cliente normalizado y mes.
- Estados, fechas y fórmulas dependen de valores cacheados en el libro; una edición sin recálculo de Excel puede dejar resultados desactualizados.
- La aplicación local aún no tiene autenticación; por eso los clientes se seudonimizan aun dentro de la intranet.
- No hay geografía explícita confiable; no se genera un mapa ni se infiere país desde teléfonos.

## Evolución futura

El adaptador puede reemplazarse por Google Sheets, base de datos o API siempre que el nuevo proveedor produzca el mismo `TiviplayPaymentsSnapshot`, preserve las reglas de evidencia y mantenga el límite server-side de información sensible.
