# TIVIPLAY · Regla financiera invariable: pago anticipado y ancla de ciclo
**ID:** RF-CICLO-001 · **Versión:** 1.0 · **Fecha:** 2026-11-21  
**Área:** 02 Finanzas y Servicio / 04 Plataforma y Equipo  
**Decisión:** DECIDIDO por Dirección; especificación DOCUMENTADA. Implementación n8n: PARCIAL, pendiente de prueba y aprobación de escrituras.  
**Fuente base:** `docs/tiviplay/CONTRATO_TECNICO_CICLO_CLIENTE_NOV2026_MVP_V1_1.md` (caso de prueba C10: «pago anticipado ... respeta fecha base»).  
**Destino técnico:** `TIVIPLAY_MOTOR_PAGOS_V1_DRY_RUN`, `CONCILIACION_FINANCIERA`, posterior motor de escritura.

## 1. Regla de negocio obligatoria

El **pago anticipado no desplaza hacia atrás el día contractual de cobro**. El motor conserva el ancla de vencimiento del ciclo y añade el período comercial autorizado. **No calcula el próximo vencimiento a partir del día en que entró el dinero**, salvo que exista una decisión comercial expresa de reajuste de ciclo, documentada y aprobada por responsable.

Tres conceptos independientes:

1. `paid_at` / `F.ULTIMO PAGO`: fecha REAL de recepción del ingreso confirmado `CONFIRMADO JM`; registrar exactamente la fecha financiera acreditada.
2. `cycle_due_at`: vencimiento financiero del ciclo previo que efectivamente se está renovando; fecha ancla, respaldada por historial/estado anterior confiable.
3. `next_due_at` / `F. PRÓXIMO PAGO`: fecha contractual resultante de añadir a `cycle_due_at` los `effective_months` aprobados (plan + beneficios autorizados), conservando día de ciclo cuando es válido según calendario. El cálculo para fin de mes debe tener convención explícita y pruebas.

**Fórmula funcional, no una fórmula para copiar en Sheets:** `next_due_at = add_calendar_months(cycle_due_at, effective_months)`. Nunca `next_due_at = add_calendar_months(paid_at, effective_months)` por defecto.

El crédito técnico del panel, `F.VENCIMIENTO`, no es la fecha financiera y no se cambia mediante esta regla.

## 2. Ejemplo de prueba: Marco Campos/Javier (PAYPAL)

- Cuenta de servicio identificada por `LP1000290` (no por fila física); evento PAYPAL confirmado, recibido el 05-11-2026, neto USD 15, plan de un mes.
- Según ejecución de conciliación n8n reportada el 21/11, PAGOS NOVIEMBRE registraba **08-11-2026** como vencimiento anterior y BASE GENERAL **08-12-2026** como próximo pago, con último pago aún en **07-10-2026**. Estos valores son **snapshot reportado de una ejecución**, no estado vivo garantizado.
- **Si el día 08 está confirmado como ciclo contractual y no hay doble aplicación:** último pago = **05-11-2026**; próximo pago = **08-12-2026**. Cobrar antes NO reduce tres días de ciclo.
- Que BASE GENERAL ya tenga 08-12-2026 puede implicar que se adelantó la fecha de vencimiento antes de registrar el ingreso. NO extender otra vez a 08-01-2027 sin confirmar si ese mismo evento ya fue contabilizado.
- En n8n, clasificar `ALREADY_APPLIED` solo con evidencia de evento ya aplicado en ambos destinos; `PARTIAL_SYNC` si la escritura faltante es verificable y segura; `REQUIERE DECISIÓN` si falta evidencia del ancla, del movimiento o de unicidad. La regla de ciclo está DECIDIDA: una decisión humana pendiente en Marco se refiere a la evidencia/duplicidad, **no** a volver a elegir opción A/B.

## 3. Condiciones de ejecución del motor

- Exigir identidad única de `service_account_id`, ID de evento financiero estable y confirmación real `CONFIRMADO JM`. Revisar moneda, monto neto, plan, meses y posibles beneficios; si hay pagador de varias cuentas, exigir asignación a beneficiario.
- Para renovación ordinaria, anclar al ciclo financiero vigente **antes de aplicar el evento**. Evitar recalcular desde una fecha ya extendida: una reejecución no puede añadir otro mes por el mismo ingreso.
- Mantener sello de `source_event_id` + cuenta beneficiaria + período aplicado en registro de aplicación durable, para reintentos idempotentes. Las filas de Sheets son localizadores transitorios, no identidades.
- Pago tardío, múltiples períodos vencidos, cambio de plan, reconexión, cambio del ancla contractual o falta de historial son **variantes de negocio** a definir contra sus contratos. No tratarlas silenciosamente como renovación ordinaria anticipada; escalar solo la ambigüedad real.
- Si hay un desfase entre el cálculo y BASE, verificar historial y evento aplicado antes de escribir. Enviar al asesor solo cuando falte una decisión o evidencia, no para escoger la fórmula estándar.
- Leer de nuevo ambos destinos después de actualizar; registrar evidencia, responsable, valores antes/después, período y clave del evento.

## 4. Casos de regresión

| Caso | Ancla ciclo anterior | Fecha de pago | Meses autorizados | Próximo pago esperado |
|---|---|---|---:|---|
| Anticipado ordinario (Marco) | 08-11-2026 | 05-11-2026 | 1 | 08-12-2026 |
| En fecha | 08-11-2026 | 08-11-2026 | 1 | 08-12-2026 |
| Anticipado, tres meses | 08-11-2026 | 01-11-2026 | 3 | 08-02-2027 |
| Beneficio comercial aprobado | 08-11-2026 | 05-11-2026 | 3 + 1 | 08-03-2027 |
| Repetición del mismo movimiento | 08-11-2026 | 05-11-2026 | 1 | 08-12-2026 (NO_OP; no duplica) |
| Ancla no demostrada | desconocida | 05-11-2026 | 1 | REQUIERE DECISIÓN de evidencia, no de regla |

Todos los ejemplos son expectativas de prueba, NO escrituras realizadas.

## 5. Work Order para `CONCILIACION_FINANCIERA`

1. Introducir `RF-CICLO-001` como contrato determinístico con `paid_at`, `cycle_due_at`, `effective_months`, `next_due_at`.
2. Desacoplar recepción financiera de día de ciclo y de vigencia técnica.
3. Eliminar la alternativa automática «próximo pago = fecha PAYPAL + meses» cuando hay ancla contractual validada.
4. Ejecutar casos de regresión en DRY_RUN, incluyendo Marco y replay idéntico; reportar evidencia de ancla y señal de evento ya acreditado.
5. No habilitar Update Row hasta verificar doble aplicación e integridad del historial.

## 6. Continuidad

**ACTIVE CONTEXT:** la regla de ancla por ciclo existe en la documentación del contrato; queda ahora explícita para el motor n8n.  
**DECISION LOG:** D-FIN-001 = conservar ciclo contractual en pagos anticipados, fecha real para último pago.  
**EVIDENCIA:** contrato v1.1 C10 + resultados reportados de n8n para Marco (ejecuciones 40/41); falta lectura de origen/ID de aplicación en tiempo real antes de escritura.  
**CHECKPOINT:** decisión DOCUMENTADA, motor n8n PARCIAL.  
**NEXT ACTION:** aplicar la regla al nodo `CONCILIACION_FINANCIERA`, probar con Marco y reejecución; autorizar escritura solo tras gate de unicidad.
