# TiviPlay · Selector SOP de cobranza · checkpoint de integración

**Estado:** PARCIAL · ensayo de catálogo y validación de Sheets; sin habilitación productiva  
**Fecha:** 2026-11-05 (America/Bogota)  
**Repositorio:** `jmmode/jumocol-os`  
**Rama:** `codex/tiviplay-sop-selector-20261105`  
**Base remota verificada:** `work/tiviplay-ficha-integral-20261104` @ `4aa2bc16c00b7f1b7d2f2390196ed914c80f83c6`  
**Fuente de reglas:** `07_GUIAS/TIVIPLAY_MANUAL_COBROS_SOP_V0_3_AUDITORIA_2026-11-04.md`.

## Objetivo

Incorporar las etapas SOP en la ficha ATENDER sin sustituir el registro de gestión existente ni afectar la ejecución paralela de Conciliación.

## Propósito

El asesor ve una etapa sugerida por F. PRÓXIMO PAGO, la acción, un texto editable, el resultado y una confirmación explícita. La fecha sugiere; solo un resultado confirmado y releído constituye gestión registrada.

## Alcance

- Catálogo único tipado en `gestion-model.ts`: D−5, D−4, D−3, D−2, D−1, D0, S0, S+2, S+5. `A+30` y `A−25` quedan como etiquetas sin umbral.
- Cuatro resultados existentes separados de la etapa: `MENSAJE_ENVIADO`, `SIN_RESPUESTA`, `COMPROMISO_PAGO`, `COMPROBANTE_RECIBIDO`.
- El formulario existente registra etapa, canal y observación en el detalle del evento de F. La observación de W permanece independiente y no se escribe.
- D0 solo presenta revisión y alerta de Cola Operacional cuando esta existe. S0 requiere declaración del asesor y referencia de evidencia del panel. S+2 requiere S0 previo registrado, ausencia de pago confirmado del ciclo y nueva comprobación declarada del panel. S+5 queda como candidatura sin mensaje ni guardado.
- No se cambian umbrales comerciales, pagos, créditos, X, BASE GENERAL, Conciliación, el contrato de `GESTION_CLIENTE` ni `gestion-write.ts`. `TIVIPLAY_GESTION_WRITE` permanece sin activar en esta rama.

## Principios

El copy editado se puede copiar, pero no se considera enviado por esa acción. Se conserva `requestId` para reintentos. La interfaz acepta éxito únicamente para `SAVED` o `DUPLICATE` del endpoint existente, que comprueba F por relectura. Tras éxito, exige recargar la ficha antes de otra gestión porque la huella anterior queda obsoleta. No se trasladan secretos, datos de clientes ni observaciones reales al repositorio.

## Governance y evidencia

| Control | Evidencia | Estado |
| --- | --- | --- |
| Validación original | `BASE GENERAL!F4`: Opción 1, Opción 2, D−3: imagen. `PAGOS NOVIEMBRE 2026!F5`: lista provisional D−5 a S+2. En F20/F100 no se observó validación. | VERIFICADO, 2026-11-05 |
| Ensayo separado | Libro nativo sintético `1KjjK4fZwVd8a6GLMG5PA9UYs_ceyR2bUkmRQ3h00qHQ`, distinto del productivo `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`. Validación `ONE_OF_LIST` estricta con nueve etapas en `BASE GENERAL!F4:F20` y `PAGOS NOVIEMBRE 2026!F5:F20`; selección D−5/S0 releída. El histórico sintético en F3/F4 se conservó literalmente. | VERIFICADO por API; revisión visual no disponible por sesión de navegador sin autenticar |
| Código | Typecheck, ESLint acotado y pruebas de catálogo, D−5, D0, S0, S+2, S+5, parser y guardado idempotente. | VERIFICADO localmente |
| Datos productivos | Solo lectura de metadatos y celdas F acotadas. Ninguna actualización de la hoja productiva ni del puerto 3002. Diff restringido a Atención, catálogo, pruebas y este checkpoint. | VERIFICADO por alcance de herramientas y diff |
| Guardado real por asesor | Writer existente apagado; no se ejecutó prueba autenticada de navegador contra hoja de ensayo. | PARCIAL |

## Riesgos

1. Un desplegable directamente en F puede reemplazar el texto libre histórico o impedir los eventos append-only. El ensayo solo usa celdas nuevas; no se propone aplicar la regla estricta a F productiva.
2. Una referencia introducida por el asesor no verifica por sí sola el panel. La confirmación S0 de servicio y la continuidad en S+2 requieren revisión operacional independiente; este selector no ejecuta ni certifica liberación.
3. El endpoint actual persiste un solo F mensual. El doble registro mensual/BASE, la observación W y el contrato `GESTION_CLIENTE` siguen en su gate separado.
4. La lista de Sheets y el catálogo TypeScript se alinearon en este ensayo, pero aún no existe publicación automática del catálogo ni captura fiable de selecciones manuales.

## Integración Sheets → evento persistente (pendiente)

La selección manual debe producir un evento solo después de capturar de forma fiable identidad del cliente 1:1, hoja/fila/celda, usuario editor, fecha Bogotá, etapa, resultado y `EVENT_ID`. Un disparador de edición simple no basta como contrato durable para pegados masivos, reintentos, fallos de red o edición concurrente. El diseño pendiente requiere un registro append-only separado, idempotencia por `EVENT_ID`, control de versiones/huella, permisos mínimos, auditoría, relectura y reparación explícita de fallos parciales. No se debe interpretar una etiqueta escrita en F como gestión ejecutada ni activar sincronización bidireccional sin ese mecanismo. **Estado: PARCIAL.**

## Evolución futura / NEXT ACTION

Validar con Dirección la vigencia del beneficio D−5, el recurso D−3 y la campaña S+5; probar la ficha con roles ADMIN/OPERADOR y fuente sintética autenticada; definir captura durable de Sheets y el gate separado de `GESTION_CLIENTE`; efectuar revisión cruzada antes de integrar o habilitar escritura. No fusionar ni desplegar esta rama por este checkpoint.
