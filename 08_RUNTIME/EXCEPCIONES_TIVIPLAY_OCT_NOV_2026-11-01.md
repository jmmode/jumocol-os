# TIVIPLAY — Ejecución de excepciones Oct/Nov 2026

Corte: 2026-11-01. Este registro no sustituye evidencia de panel, aprobación de promociones ni CONFIRMADO JM.

## Cambios aplicados en datos vivos

- **Carlos Gallón**: TRANSF (OCT)!17 CONFIRMADO JM. BASE GENERAL fila 773, PAGOS OCTUBRE fila 135: último pago 24/10/2026, próximo 24/11/2026 y Al dia. Añadido a PAGOS NOVIEMBRE fila 93, semana 4. Excepción de tarifa COP sigue abierta independientemente del ciclo.
- **Gustavo Sepúlveda / Andrea**: TRANSF (OCT)!15 CONFIRMADO JM. BASE fila 774, OCT fila 139: último pago 22/10/2026, renovación sobre ciclo 24/10/2026, próximo 24/11/2026 y Al dia. Añadido a NOV fila 94, semana 4. BO debe validar PANEL: fecha técnica 05/11 anterior al cobro comercial 24/11.
- **Julio Correa**: VENTAS_OCTUBRE!11 (reactivación, 12 meses, 3 pantallas), TRANSF (OCT)!12 CONFIRMADO JM. Sin coincidencia exacta por nombre, USUARIO ni teléfono en BASE; ficha operativa creada en ALTAS OCT BASE!763, sin copia de contraseña, próximo pago 17/10/2027. BO debe enlazar eventual histórico y validar promoción USD 70.
- **Carmenza González**: VENTAS_OCTUBRE!5 indica origen MIRA+; TRANSF (OCT)!6 CONFIRMADO JM; PENDIENTES OCTUBRE!46 indica MIRA+. NO insertada en BASE TIVIPLAY. BO MIRA+ debe resolver alta en su base comercial y conciliación.

## Resultado noviembre
98 → **100 fichas únicas**, semanas **8/25/20/31/16**. Cartera nominal USD 6.177 + COP 368.648. Preservadas las 98 fichas anteriores y las columnas de gestión. BASE insertó una fila en 763; corregidas las referencias de noviembre 767→768 y 867→868. Hoja de asesor sin bloques de auditoría. Firma anterior del motor invalidada: regeneración requiere código corregido.

## P0 pendientes accionables
1. BO TÉCNICO: verificar y corregir crédito de PANEL para Gustavo con evidencia.
2. BO COMERCIAL: vincular historial de Julio y validar tarifa especial, sin duplicar.
3. BO MIRA+: gestionar alta y conciliación de Carmenza en la fuente de verdad correcta.
4. TECNOLOGÍA: corregir motor para renovaciones COP confirmadas, preservar contactos y gestiones, excluir secciones de auditoría del operador y regenerar 100 fichas sin pérdida. **No regenerar con builder anterior.**
5. BO DATOS: reubicar comercialmente clientes actualizados que aún permanecen físicamente en sección VENCIDOS, mediante operación que preserve referencias.

## Estados
Implementado: fechas comerciales Carlos/Gustavo, ficha Julio, hoja noviembre 100.
Parcial: enlace histórico Julio y enrutamiento MIRA+.
Bloqueado: discrepancia técnica de panel Gustavo.
Requiere decisión: tarifa promocional de Julio, en espera de evidencia.

No se alteró CONFIRMADO JM ni se fusionó PR ni desplegó intranet.
