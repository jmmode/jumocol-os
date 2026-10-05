# TIVIPLAY_MONTHLY_CLOSE_V1 — Live Read Reproducibility Evidence

**Fecha:** 2026-10-05  
**Modo:** solo lectura  
**Fuente viva:** `GESTION_DIA_PAGOS_2026_TIVIPLAY`  
**Hoja de corte:** `PAGOS OCTUBRE 2026 - PRELIMINAR`

## Resultado reproducible

Se ejecutaron dos lecturas consecutivas sobre la misma fuente viva y el mismo segmento del corte mensual.

Regla del segmento evaluado:

- filas de datos: 5–112;
- fila 113: total del corte;
- filas 114–166: cartera vencida anterior, excluida del universo mensual.

### RUN 1

- Total: **99**
- Semana 1: **13**
- Semana 2: **30**
- Semana 3: **27**
- Semana 4: **16**
- Semana 5: **13**

### RUN 2

- Total: **99**
- Semana 1: **13**
- Semana 2: **30**
- Semana 3: **27**
- Semana 4: **16**
- Semana 5: **13**

### Comparación

`RUN 1 == RUN 2`: **VALIDADO**

La firma lógica de los registros leídos fue idéntica entre ambas ejecuciones.

## Hallazgo operativo

La hoja viva `BASE GENERAL` ya ha cambiado después del corte del 30/09; por ello no puede usarse sola para reconstruir retrospectivamente el universo original de 99 registros. El proceso mensual requiere conservar un corte inmutable o una salida preliminar gobernada antes de que la base viva continúe mutando.

## Estado

**LECTURA VIVA REPETIBLE: VALIDADO**

## NEXT ACTION

Implementar el motor determinístico que:

1. lea `BASE GENERAL` en la fecha de corte;
2. seleccione `F. PRÓXIMO PAGO` del mes objetivo;
3. separe cartera vencida anterior;
4. produzca el preview mensual;
5. compare contra el corte esperado;
6. falle si cambia el mismo input o aparecen duplicados;
7. no escriba en producción hasta superar validación.
