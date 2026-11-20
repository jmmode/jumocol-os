# JUMOCOL OS — Checkpoint de despliegue controlado · Semana 1 / noviembre 2026

**Fecha:** 2026-11-19  
**Estado:** PARCIAL (6 filas intervenidas con fórmulas; 3 aplicaciones automáticas nuevas verificadas; 3 sin pago autorizado/enlace).  
**Contrato de referencia:** [MVP v1.1](CONTRATO_TECNICO_CICLO_CLIENTE_NOV2026_MVP_V1_1.md).  
**Fuente viva:** [GESTION_DIA_PAGOS_2026_TIVIPLAY](https://docs.google.com/spreadsheets/d/1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4/edit).  
**Scope:** `PAGOS NOVIEMBRE 2026!4:11`. El usuario confirmó que realizó backup antes de la ejecución. Este archivo no implica verificación independiente del backup.

## Operación efectuada

- Se preservaron los ciclos previamente validados de Ricardo (fila 4, PAYPAL) y Harry (fila 5, ZELLE).
- Se instalaron fórmulas nuevas en **cada fila 6:11**, columnas `G:I`, `Q:R`, `W` y `Y:AG`; **se preservó `X`**, el enlace a BASE GENERAL.
- El selector usa `L` como método primario: ZELLE -> `ZELLE (NOV)`, PAYPAL -> `PAYPAL (NOV)`, y transferencia/NEQUI/BANCOLOMBIA/DAVIVIENDA/WESTERN U -> `TRANSF (NOV)`.
- La coincidencia exige identidad normalizada en BASE GENERAL, fila única, enlace ENLAZADO, estado fuente CONFIRMADO JM, gates técnicos de fuente VALIDADO, moneda USD y monto coincidente `J`.
- `AB` obtiene fila fuente sólo si hay **exactamente un** evento que cumple todas esas condiciones. `W` confirma si AB es numérico, positivo y el nombre y la referencia de BASE son consistentes. `Y:AG` derivan de esa fila de origen y quedan vacías sin autorización.
- `G:I` recuperan el plan, pantallas y celular del maestro **sólo con W confirmado**; en otro caso preservan valores del snapshot individual de cada fila (en el piloto mediante fallback literal). `Q:R` se actualizan únicamente con la fecha aprobada y conservan fecha histórica si no existe evento compatible.
- Se uniformó el formato de fechas `PAGOS NOVIEMBRE!Q5:R9` a `dd-mm-yy` sin cambiar el valor subyacente.
- No se escribieron confirmaciones en hojas de pago; no se modificaron registros maestros. BASE GENERAL ya mostraba fechas nuevas para Patricia, Sofia y John antes de este despliegue mensual.

## Verificación posterior en Google Sheets

| Fila | Cliente | Fuente aceptada | Fila origen | Resultado en PAGOS NOVIEMBRE | Estado |
|---|---|---|---:|---|---|
| 4 | Ricardo Rodriguez | PAYPAL | 3 | 01-11-26 → 01-05-27; 3 TV; CONFIRMADO JM | VALIDADO antes del despliegue |
| 5 | Harry Quintero | ZELLE | 14 | 04-11-26 → 04-02-28; 12+3; 3 TV/1 celular | VALIDADO antes del despliegue |
| 6 | Patricia Franco | ZELLE | 5 | 02-11-26 → 02-12-26; PLAN 1 MES; 1 TV/0 celular; Al dia | VALIDADO nuevo |
| 7 | Gerlys Herrera | ZELLE | 13 | Sin repliegue; 3 coincidencias financieras, sin fila BASE única; W vacío | BLOQUEADO |
| 8 | Sofia Aparicio | ZELLE | 11 | 03-11-26 → 03-12-26; PLAN 1 MES; 1 TV/0 celular; Al dia | VALIDADO nuevo |
| 9 | Miguel Larrain | ZELLE declarado en L | No localizada | Histórico preservado; W vacío | PARCIAL |
| 10 | John Rodriguez | ZELLE | 51 | 13-11-26 → 13-01-27; PLAN 2 MESES; 1 TV/1 celular; Al dia | VALIDADO nuevo |
| 11 | Hernando Ortega | PAYPAL declarado en L | No localizada | Histórico preservado; W vacío | PARCIAL |

**Alerta de identidad:** `PAGOS!X7 = BASE GENERAL!731` pero `BASE GENERAL!B731` corresponde a Renzo Hurtado, no a Gerlys Herrera. Es una contradicción de enlace que no debe repararse por aproximación. Prohibido actualizar fechas de este registro hasta resolver identidad y duplicidades.

## Limitaciones del piloto / gate pendiente

1. Esta ejecución instala un selector parametrizado por **método y fila de cliente**, pero contiene referencias a filas específicas de BASE GENERAL y valores históricos en fallbacks; **no es aún apta para rellenar en todas las filas**.
2. PAYPAL está cubierto estructuralmente por las fórmulas y Ricardo conserva su resultado previo, pero ninguna de las filas intervenidas 6:11 con PAYPAL produjo una actualización nueva. TRANSF tampoco tuvo un caso aplicable entre las ocho. No declarar cobertura end-to-end universal de esos métodos.
3. Las ofertas comerciales excepcionales siguen dependiendo del contrato separado de la fila 124; antes del despliegue masivo se deben resolver P0-01 y P0-02 del contrato v1.1, para que `VALIDACION COMERCIAL` se atienda antes de JM.
4. Las fechas de vencimiento técnico en los paneles son distintas al próximo cobro financiero. Nunca escribir `BASE GENERAL!Q` a partir de `S` sin evidencia operacional.
5. Para pagos múltiples, movimientos en monedas distintas, reactivaciones y cambio genuino de plan se requieren pruebas negativas y un identificador estable del evento; el matching de este piloto exige USD y monto igual a J, por lo que **bloquea otros supuestos en lugar de asumir su aprobación**.
6. La muestra de diez casos y la propagación general todavía no están autorizadas por evidencia de este único segmento.

## Definition of Done de este gate

**VALIDADO:** las filas 6, 8 y 10 muestran el movimiento correcto de ZELLE en el registro mensual; Ricardo y Harry permanecen como regresiones. No se observaron errores en las celdas consultadas.  
**BLOQUEADO:** Gerlys requiere decisión de identidad.  
**PARCIAL:** Miguel y Hernando sin evento confirmado compatible; método TRANSF sin caso end-to-end en este segmento.  
**NO IMPLEMENTADO:** propagación masiva.

## ACTIVE CONTEXT y siguiente acción

- **Next action A:** identificar y resolver el enlace incorrecto de Gerlys, sin modificar su información financiera hasta seleccionar la identidad correcta.
- **Next action B:** buscar eventos válidos por todos los medios cuando `L` sea un método habitual y no exista movimiento, sin atribuir al cliente otro método por mera coincidencia.
- **Next action C:** probar dos operaciones reales de TRANSF (moneda y ambigüedad) y al menos una PAYPAL con actualización nueva; después completar la muestra de diez.
- **Gate:** resultados verificables + registro de diferencias + auditoría antes de desplegar globalmente.

**Nota documental:** el contrato v1.1 es snapshot previo. Este checkpoint describe las fórmulas agregadas y los valores validados después, sin pretender certificar todas las filas de producción.
