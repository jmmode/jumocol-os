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

## Evidencia nueva: PANEL corte 01/11/2026 y regla de crédito
Fuente: Drive carpeta PANELES, archivos PANELES_CORTE 27_10_26.xlsx y PANELES_CORTE 01_11_26.xlsx. Evidencia de snapshots, NO estado en tiempo real.
- Carlos Gallón: usuario PL1000321, PANEL colombia78DM, vencimiento técnico 29/10 en corte 27/10 → 30/11 en corte 01/11. Comercial próximo cobro 24/11. Cuenta técnica vigente al corte. No solicitar liberar crédito.
- Gustavo Sepúlveda: PL556845, PANEL colombia78DM, vencimiento técnico 05/11 en ambos cortes; comercial 24/11. Técnico vigente al 01/11 pero insuficiente para cubrir ciclo comercial; BO panel verifica continuidad/extensión antes del 05/11, SIN solicitar liberación de una cuenta ya vencida.
- Julio Correa: Julio100251, PANEL colombia78DM, vencimiento técnico 17/11 (corte 01/11) frente a comercial 17/10/2027. En BASE GENERAL Q763 se corrigió fecha técnica a 17/11/2026 manteniendo R/S comerciales intactas; ajuste puntual del snapshot, pendiente reemplazar por sincronización automática con fuente técnica.

Regla: cruces por usuario exacto/ID técnico y panel; excluir contraseñas. A fecha de corte, cuenta vencida no requiere llamada de liberación de crédito; encontrar asociación válida y cuenta vigente, si existe. Cuenta vigente no demuestra cobertura del período comercial completo; fechas de cobro y de panel se auditan por separado. No reasignar cuentas ni liberar créditos sin fuente autorizada. Próxima acción técnica: integrar snapshots versionados del panel al motor en solo lectura y detectar brechas comerciales/técnicas con responsables BO.
