# CELIA × JUMOCOL OS — Transferencia operacional y encargo de integración n8n

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Área primaria:** 04 · Plataforma y Equipo. Dependencias: 00 Gobierno, 01 Atención y Cobranza, 02 Finanzas y Servicio, 03 Comercial y Ventas.  
**Estado:** DOCUMENTADO / REQUIERE DECISIÓN para implementación de nuevas herramientas y escrituras.  
**Repositorio:** `jmmode/jumocol-os` · rama `main`.  
**Agente verificado:** `CELIA | TiviPlay Latino | Prototipo` · ElevenLabs `agent_1501m7x7hjy8escav3sta1gakbmq`.  
**Referencia de configuración inspeccionada:** versión `agtvrsn_1401m7yncqb8fp09pa62j5ry1833`, 2026-11-21.  
**Fuente de verdad operativa:** Google Sheet `GESTION_DIA_PAGOS_2026_TIVIPLAY` (ID `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`). No exportar PII ni secretos a GitHub.

## 1. Hechos comprobados, sin confundir documento con producción

### CELIA — Prototipo documentado y configuración activa

- **IMPLEMENTADO en configuración ElevenLabs:** herramienta `tiviplay_consultar_cliente`, tipo webhook POST, con cuerpo `{cliente: string}`, orientada a consulta comercial. Su configuración actual permite consulta por nombre exacto. No existe una herramienta verificada de actualización de pagos, crédito técnico o tickets.
- **DOCUMENTADO en bitácora CELIA 2026-11-21:** workflow n8n `TIVIPLAY_CONSULTAR_CLIENTE`, Webhook POST (Header Auth) → Google Sheets Get Row(s) → Edit Fields → Respond to Webhook; prueba de conversación marcada Succeeded.
- **LÍMITE:** esta auditoría no consultó el runtime interno de n8n ni validó sus credenciales o ejecuciones por separado. La bitácora registra la prueba; ElevenLabs confirma la herramienta configurada.
- El prompt vigente de CELIA declara que atiende instalación, soporte, pagos, cotización y solicitudes, pero que no tiene herramientas para ejecutar esas transacciones. No prometer registro, envío ni cambio si no hay resultado confirmado por backend.
- Cualquier tratamiento de credenciales de panel debe separarse de consulta comercial y exigir autorización e identidad validada; nunca volcar secretos en GitHub.

### Operación TIVIPLAY validada y documentada

- Modelo: `ZELLE (NOV)`, `PAYPAL (NOV)`, `TRANSF (NOV)` → `PAGOS NOVIEMBRE 2026` → `BASE GENERAL`. Estados operativos: `VALIDACION COMERCIAL`, `PENDIENTE CONFIRMACION`, `CONFIRMADO JM`.
- `CONFIRMADO JM` es la firma financiera exclusiva de Julián, no una acción que CELIA pueda emitir o simular.
- Caso de referencia **Harry Quintero**: validación comercial y financiera, registro mensual y maestro comprobados; las referencias de fila del piloto NO son una clave estable ni una fórmula de propagación universal.
- Corte documental de pagos al 20/11: 91 movimientos `CONFIRMADO JM`; 38 con validación financiera nativa coherente con BASE GENERAL; Harry validado aparte; 52 en cola de excepción; 24/55 clientes del segmento mensual reflejados. Son **estadísticas de corte documentado**, no datos vivos actuales.
- Excepciones: 24 tarifa/plan; 11 varias cuentas candidatas; 15 sin beneficiario; 1 enlace ambiguo; 1 moneda/conversión. Gerlys Herrera paga varias cuentas; no asignar un mismo movimiento a varias cuentas sin reparto evidenciado y controlado.
- Los **créditos técnicos** en paneles y la fecha `F.VENCIMIENTO` no equivalen a `F. PRÓXIMO PAGO` financiero. Una confirmación financiera puede habilitar una tarea de servicio, pero no demuestra que se concedieron créditos.

### Código y gobierno ya existentes

- `05_AUTOMATION/tiviplay-monthly-close-v1/` tiene motor determinístico **solo lectura** para corte mensual, captura gobernada, replay, detección de duplicados y evidencia. Revisar su API/reutilización; no inventar motor duplicado.
- `docs/intranet/conocimiento-operativo/tiviplay/` documenta taxonomía de casos, recepción de comprobante y reglas de atención. Es documentación inicial, no evidencia de que existan rutas ejecutables para tickets/pagos.
- `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md` contiene **versión interna v0.3 (21/10)**: separación de cobro financiero y crédito técnico, permisos, evidencia, reglas de excepciones y renovación.
- Las reglas del protocolo `00_GOVERNANCE/PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md` y `AGENTS.md` gobiernan cambios, aprobaciones, ramas, pruebas y checkpoints.

## 2. Archivos de lectura obligatoria en esta versión de GitHub

Leer estos archivos directamente, sin deducir el contenido solo por nombre:

1. `AGENTS.md` — criterios de cambio.
2. `00_GOVERNANCE/PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md` — aprobación, revisión y evidencia.
3. `02_RUNTIME/tiviplay/celia/CELIA_MVP_OPERACION_2026-11-21.md` — CELIA y workflow existente.
4. `docs/tiviplay/CONTRATO_TECNICO_CICLO_CLIENTE_NOV2026_MVP_V1_1.md` — 5 hojas, celdas/fórmulas del MVP; referencias específicas del piloto no generalizables.
5. `docs/tiviplay/CHECKPOINT_REPLIEGUE_CLASIFICACION_NOV20_2026.md` — clasificación de excepciones y resultados al corte.
6. `docs/tiviplay/CHECKPOINT_DESPLIEGUE_SEMANA1_2026-11-19.md` — fórmula de enlace y excepciones.
7. `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md` — leer encabezado v0.3, no asumir v0.2.
8. `docs/intranet/conocimiento-operativo/tiviplay/README.md`.
9. `docs/intranet/conocimiento-operativo/tiviplay/00-gobierno/taxonomia-casos.md`.
10. `docs/intranet/conocimiento-operativo/tiviplay/02-protocolos/recepcion-comprobante-pago.md`.
11. `05_AUTOMATION/tiviplay-monthly-close-v1/README.md` y luego `src/core.mjs`, `src/google-sheets.mjs`, `test/core.test.mjs` para evaluar reutilización.

**Inconsistencias que deben resolverse con evidencia**, no fusionarse: la bitácora CELIA observa encabezados/filas de consulta diferentes de otros contratos; el contrato S0 v0.3 usa denominaciones históricas de estado y umbral temporal distintos de algunas fórmulas de noviembre; la clasificación del checkpoint es estática mientras los datos vivos cambian. Hay una divergencia entre el mensaje al cliente sobre gestión inmediata de comprobante y la prohibición de confirmar actualización sin resultado real. Preservar semántica y escalamiento, no prometer ejecución inexistente.

## 3. Encargo de ingeniería para el otro proyecto (COPIAR Y EJECUTAR COMO ANÁLISIS)

> Actúa como arquitecto e implementador de CELIA/TIVIPLAY en JUMOCOL OS. Trabaja sobre el repositorio `jmmode/jumocol-os`, rama principal solo lectura en la fase inicial. Tu objetivo es aprovechar el workflow n8n existente `TIVIPLAY_CONSULTAR_CLIENTE` y ampliar gradualmente CELIA hacia un copiloto operacional con herramientas verificables.
>
> **Primero** lee completos los 11 grupos documentales enumerados en la sección 2 y confirma ruta, commit/versión, qué leíste realmente y qué no. Inspecciona la herramienta activa `tiviplay_consultar_cliente` en ElevenLabs y los nodos reales de n8n con acceso autorizado. No presupongas otros endpoints, permisos, credenciales ni conexiones.
>
> **Después** entrega un inventario **IMPLEMENTADO / PARCIAL / NO IMPLEMENTADO / BLOQUEADO / REQUIERE DECISIÓN / VALIDADO** de: (1) consulta de cliente; (2) resolución de identidad/varias cuentas; (3) consulta de estado de pago; (4) conciliación ZELLE/PAYPAL/TRANSF; (5) validación comercial por asesor; (6) aplicación a PAGOS MES y BASE GENERAL; (7) tareas de renovación técnica por panel; (8) sincronización de intranet; (9) registro de solicitudes/tickets; (10) atención/soporte por SOP.
>
> **Reutilización obligatoria:** evalúa nodos Get Row(s), Edit Fields, Webhook y Respond to Webhook ya existentes; el motor determinístico `tiviplay-monthly-close-v1`; y los contratos de noviembre. Evita crear workflows duplicados de consulta o nuevos módulos sin una necesidad operacional concreta.
>
> **Arquitectura de evento:** propone datos canónicos mínimos `event_id`, `payment_source`, `source_transaction_id`, `payer_id`, `service_account_id`, `amount`, `currency`, `paid_at`, `financial_confirmation`, `commercial_decision`, `effective_plan`, `technical_panel`, `technical_renewal_status`, `revision`, `actor`, `audit_timestamp`. Distingue identificador lógico estable de fila de Sheets; define deduplicación, idempotencia, reintentos, bloqueo por ambigüedad y un escritor autorizado por campo. No afirmes que existe una base de datos operacional nueva si no fue inspeccionada.
>
> **Regla de negocio:** una cuenta puede tener varios pagadores y un pagador varias cuentas. Ante múltiples cuentas candidatas, exponer opciones al asesor y exigir elección de `service_account_id`; jamás deducir beneficiario solo por correo, nombre o importe. Una operación financiera no puede acreditarse dos veces. Las promociones, cambios de plan y moneda requieren validación tarifaria; CELIA no confirma ingresos ni acredita dinero.
>
> **Flujo objetivo:** evento de pago → normalización → enlace de cuenta → validación tarifaria y comercial si aplica → `CONFIRMADO JM` emitido exclusivamente por actor financiero autorizado → actualización idempotente mensual y maestro → verificación de lectura posterior → tarea técnica en panel si habilitada → confirmación del asesor o API verificada → intranet actualizada → evidencia y excepción/reintento si falla.
>
> **Seguridad:** no publicar secretos, contraseñas, tokens, contactos ni comprobantes en GitHub; separar consultas comerciales de acceso técnico; validar identidad antes de devolver credenciales; exigir permisos de mínima autoridad, registros sanitizados y aprobación humana antes de habilitar escrituras productivas o paneles. La consulta actual por nombre exacto NO verifica identidad del titular.
>
> **Pruebas obligatorias:** (a) Harry Quintero: éxito financiero/comercial reproducible sin reescribir un pago; (b) Gerlys Herrera: dos beneficiarios candidatos, selección única, sin doble cargo; (c) Miguel Larrain/Larain: variante de nombre sin autoacreditación; (d) Hernando Ortega: sin pago identificable no crear transacción; (e) PAYPAL: comisión y neto; (f) TRANSF: COP, USD, NEQUI y elección de tasa aprobada; (g) cambio real de plan/dispositivos; (h) pago duplicado y reintento; (i) fecha financiera vs vencimiento técnico; (j) errores y reversión.
>
> **Entregables de esta primera iteración (sin escribir en producción):** inventario de workflows y tools reales, matriz de fuentes de verdad, contratos de entrada/salida, diagrama mínimo basado en componentes existentes, brechas P0/P1/P2, secuencia de pruebas en entorno seguro y **una única Work Order priorizada** con acceptance criteria, rollback y evidencia. Comparar el baseline de 91 movimientos al corte solo como oracle histórico; obtener dato vivo para decisiones actuales.
>
> **Gate:** no editar CELIA, no habilitar webhooks de escritura, no modificar BASE GENERAL ni paneles durante la auditoría inicial. Al finalizar, publica checkpoint y NEXT ACTION en el repositorio según AGENTS.md y presenta las decisiones que necesitan autorización de Dirección.

## 4. Propuesta de partición mínima n8n

Reutilizar la consulta actual de CELIA. Si la auditoría confirma viabilidad, evolucionar mediante **subflujos o servicios reutilizables**:
- Consulta comercial read-only (ya existente).
- Resolución de identidad/cuentas beneficiarias (propuesto).
- Clasificación/validación de pagos (propuesto).
- Aplicación financiera autorizada/idempotente (propuesto, con gate y lectura posterior).
- Preparación de renovación técnica (propuesto; no acreditación automática por defecto).
- Registro de solicitud y notificación a intranet (propuesto).

Evitar un solo workflow monolítico con accesos de lectura, pago y panel sin separación de permisos.

## 5. Definition of Done de la transferencia

- Documento publicado en ruta canónica y leído por el otro proyecto (la publicación no demuestra lectura por otro agente).
- Inventario de herramientas reales + contratos y fuentes validados con evidencias.
- Ninguna credencial ni dato sensible filtrado.
- Work Order acotada para un primer proceso de prueba, sin inventar flujos que ya existen.
- Pruebas y estados registrados por fase, sin declarar operativo el sistema de diciembre anticipadamente.

## 6. Continuidad

**ACTIVE CONTEXT:** CELIA es prototipo read-only con una herramienta de consulta; TIVIPLAY dispone de contrato financiero y cola de excepciones documentalmente comprobados.  
**CHECKPOINT:** información cruzada en GitHub y configuración ElevenLabs, con límites declarados.  
**DECISION LOG:** arquitectura n8n como motor principal — recomendación, aún sujeta a plan técnico de implementación y aprobación de escritura.  
**BACKLOG P0:** identidad única, doble autorización, idempotencia, reconciliación Sheets/maestro, protección de credenciales, evidencia post-write.  
**NEXT ACTION:** ejecutar sección 3 en el proyecto CELIA; inspeccionar workflow real y entregar Work Order única de integración con pruebas sin escrituras.
