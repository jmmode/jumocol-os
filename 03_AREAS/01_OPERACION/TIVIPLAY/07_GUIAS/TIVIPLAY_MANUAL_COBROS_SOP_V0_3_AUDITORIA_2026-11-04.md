# TiviPlay — Manual de cobros y retención · SOP v0.3 (auditoría de fuentes)

**Estado:** REQUIERE VALIDACIÓN · BORRADOR DOCUMENTAL · NO PUBLICAR COMO PROCEDIMIENTO VIGENTE  
**Fecha de auditoría:** 2026-11-04  
**Ámbito:** operaciones TiviPlay; puesto de atención y cobranza de JUMOCOL OS  
**Ubicación:** `03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/`  
**Documento de mensajes actualmente consumido por la aplicación:** `TIVIPLAY_MENSAJES_COBRO_V1.md`  
**Responsable de aprobación:** Dirección TiviPlay

> Este documento ordena lo que realmente se pudo verificar. **NO reemplaza aún el DOCX más reciente del usuario**, indicado únicamente como ruta local `C:\Users\USUARIO\Downloads\📆 MANUAL DE COBRO – TIVIPLAY (2).docx`, porque esa ruta no es accesible desde el entorno de auditoría. Cuando se reciba ese archivo, cotejar párrafo, tabla, imagen y cuenta de pago antes de promover la versión.

## 1. Inventario de fuentes y jerarquía

| Fuente | Versión / fecha visible | Aporta | Restricción |
|---|---|---|---|
| [Manual de cobro, Google Docs](https://docs.google.com/document/d/1fJmzWr7sQO38rpefE6TgZnITb4CLHY3YHGtcx07Oggo/edit) | modificado 2026-02-01 | D-5, D-1, D0, retención 1–4, muestras Zelle/Bancolombia, texto de retención | Es una **versión anterior**; no acredita vigencia de fechas, cuentas ni contenido en imágenes |
| `TIVIPLAY_MENSAJES_COBRO_V1.md` | fechado 2026-11-04; estado pendiente de validación | Scripts D-5, D-2 por método, D-1, D0, D+ y contrato de marcadores | Es propuesta de software, **no evidencia** de aprobación del manual |
| `src/features/tiviplay-atencion/cobranza.ts` | consultado 2026-11-04 | Calcula etapa y canal desde `F. PRÓXIMO PAGO` | Su calendario contradice al Google Doc |
| `📆 MANUAL DE COBRO – TIVIPLAY (2).docx` del usuario | **pendiente de lectura** | Fuente necesaria para aprobación final y datos de pago solicitados | Ruta de Windows no es archivo adjunto ni enlace Drive |

**Regla de precedencia por definir:** el DOCX reciente será el candidato a fuente canónica, pero no se aplican cambios silenciosos contra fuentes históricas. Registrar y resolver contradicciones con Dirección.

## 2. Mapa de fechas y contradicciones

Definición temporal: `D = fecha de F. PRÓXIMO PAGO − fecha de Bogotá`. Ejemplo: `D-5` significa cinco días **antes** del pago; `D+2` dos días **después**.

| Momento | Google Doc 2026-02 | Implementación 2026-11-04 | Estado / acción |
|---|---|---|---|
| D-5 | Recordatorio por WhatsApp con beneficio elegido por asesor | D-5: recordatorio | Coincidencia parcial; beneficio requiere reglas vigentes |
| D-4 | No aparece como etapa textual | Llamada de refuerzo | REQUIERE VALIDACIÓN documental |
| D-3 | No aparece como etapa textual | WhatsApp con imagen | REQUIERE VALIDACIÓN del recurso gráfico |
| D-2 | No aparece como envío de datos | Envío de Zelle, PayPal o transferencia | **CONFLICTO** con la fuente 2026-02 |
| D-1 | Envío de datos o enlace de pago por método | Alerta de suspensión | **CONFLICTO** que debe resolverse antes de publicar |
| D0 | Fecha de vencimiento; WhatsApp/llamada | Retención 1 (como si estuviese suspendido) | **CONFLICTO**; no afirmar suspensión sin evidencia |
| D+1 | Retención 1 de recarga vencida (notación antigua «Día -1» respecto al vencido) | Retención 2 genérica | REQUIERE VALIDACIÓN de equivalencia e inicio |
| D+2 | Retención 2; mensaje de reactivación y acuerdo de pago | Retención 2 genérica | Mensaje textual parcialmente recuperado |
| D+3 | Retención 3 | Retención 2 genérica | Faltan texto o recursos legibles |
| D+4 | Retención 4; mensaje persuasivo de reactivación | Retención 2 genérica | Faltan detalles sobre promociones vigentes |

**Gate:** no reprogramar `cobranzaStage()` hasta revisar el DOCX exacto y resolver el calendario. Esta tabla es un mapa de contradicciones, no una autorización para cambiar procesos.

## 3. Acciones operacionales por etapa (candidatas para revisión)

| Código propuesto | Etapa | Acción | Canal | Contenido esperado | Evidencia de ejecución |
|---|---|---|---|---|---|
| `REC_D5` | Antes, cinco días | Recordar próximo pago; seleccionar beneficio solo si está autorizado | WhatsApp | Mensaje personalizado, plan, fecha y beneficio verificado | Asesor confirma envío o resultado |
| `CALL_PRE` | Refuerzo | Intentar llamada | Llamada | Motivo de contacto, verificación de renovación | Contestó / no contestó / compromiso |
| `IMG_PRE` | Refuerzo | Enviar imagen publicada | WhatsApp | Imagen por plan/etapa vigente | Asesor confirma envío |
| `METHOD_PAY` | Datos de pago | Seleccionar Zelle, PayPal o transferencia según cliente | WhatsApp / llamada | Medio, titular, cuenta/enlace, monto/moneda, vencimiento | Confirmación de envío, nunca confirmación del pago |
| `DUE_D0` | Día de vencimiento | Recordatorio o llamada | WhatsApp / llamada | Texto por validar de fuente reciente | Resultado |
| `RET_1` | Vencido: primer contacto | Retención 1 | WhatsApp / llamada | Texto específico por validar | Resultado |
| `RET_2` | Vencido: segundo contacto | Retención 2 | WhatsApp / llamada | Usuario recuperable y posibilidad de reactivación | Resultado |
| `RET_3` | Vencido: tercer contacto | Retención 3 | WhatsApp / llamada | Texto específico por validar | Resultado |
| `RET_4` | Vencido: cuarto contacto | Retención 4 | WhatsApp / llamada | Invitación a reactivar; promociones solo si están vigentes | Resultado |

La asignación exacta de `CALL_PRE` e `IMG_PRE` a D-4/D-3 procede **solo de la implementación de noviembre**. No se valida como texto del Google Doc de febrero.

## 4. Scripts y referencias de pago: evidencia recuperada

### 4.1. Datos observados en el Google Doc histórico

- **Zelle:** correo `info@jumocol.net`; titular descrito como **Jumocol LLC**.
- **Transferencia Bancolombia:** cuenta de ahorros `33828577331`; titular indicado como **Julián Montealegre**.
- **PayPal:** se menciona envío de enlace, **pero el texto recuperado no incluye una URL utilizable**.
- **Transferencias:** el manual hace referencia a una «imagen del cambio del día»; el contenido gráfico no se recuperó de la extracción de texto.
- Ejemplos de precio y plan del texto antiguo: `2 meses / 2 pantallas → USD 30` y `1 mes / 1 pantalla → USD 15`; **son ejemplos históricos, no catálogo de tarifas vigentes**.

**Estado de las referencias:** REQUIERE VALIDACIÓN CON DOCX RECIENTE Y DIRECCIÓN. Se conservan para confrontar la fuente, pero no se autoriza su publicación ni reemplazar automáticamente `[DATOS_PAGO]` en producción. No se declara confidencialidad como razón para excluirlas: la restricción aquí es la **vigencia no verificada**.

### 4.2. Contrato mínimo para mensajes copiables

Variables permitidas y su origen:

| Variable | Fuente | Condición |
|---|---|---|
| `[NOMBRE]` | Ficha del cliente | Identidad seleccionada |
| `[ASESOR]` | Sesión autenticada | Obligatorio en registro |
| `[FECHA]` | `F. PRÓXIMO PAGO` | No confundir con `F.VENCIMIENTO` técnico |
| `[PLAN]` | Plan activo verificado | No inferir duración |
| `[VALOR]` | Tarifa y moneda de ficha | No usar precio ejemplo |
| `[DATOS_PAGO]` | Catálogo vigente por método aprobado por Dirección | Si falta, bloquear la entrega automática de datos y mostrar motivo |
| `[ETAPA]` | Selector de etapas publicado | Debe coincidir con versión vigente del manual |

El mensaje se presenta únicamente cuando la etapa está publicada; **Copiar ≠ Enviar**. El asesor registra el resultado explícitamente.

## 5. Contrato de registro de gestión: intranet → Sheets

| Libro/hoja | Campo | Propósito | Escritura |
|---|---|---|---|
| `PAGOS NOVIEMBRE 2026` | F — `OBSERVACIONES GESTION` | Bitácora estructurada: acción, etapa, fecha, asesor, canal y resultado | Prevista desde intranet tras confirmación del asesor |
| `PAGOS NOVIEMBRE 2026` | W — `OBSERVACIONES ASESOR` | Texto libre independiente | Prevista: editor con confirmación explícita |
| `PAGOS NOVIEMBRE 2026` | X — `CONFIRMACION` | Estado financiero | Solo flujo financiero autorizado |
| `BASE GENERAL` | F — `OBSERVACIONES GESTION` | Continuidad de la bitácora del cliente | Requiere enlace 1:1 y política de sincronización |
| `BASE GENERAL` | W — `OBSERVACIONES ASESOR` | Nota libre del cliente | Requiere autorización y fuente identificada |

**Propuesta de formato de evento** (no ejecutada):

`EVENT_ID | FECHA_HORA_BOGOTA | ASESOR | ETAPA | CANAL | ACCION | RESULTADO | DETALLE | ORIGEN`

Opciones de resultado mínimas:

- `MENSAJE_ENVIADO`
- `SIN_RESPUESTA`
- `COMPROMISO_PAGO` (fecha/compromiso documentado)
- `COMPROBANTE_RECIBIDO` (pendiente de confirmación financiera)

**Invariantes:**

1. La misma gestión debe conservar el mismo `EVENT_ID` en F de la cartera y F de BASE. No contar dos eventos.
2. Ningún texto en F/W puede convertir un pago en `CONFIRMADO JM`.
3. Solo Dirección confirma en la hoja del método correspondiente; el motor cruza identidad, importe y ciclo antes de actualizar X o BASE.
4. No sobrescribir el histórico libre existente en F de BASE; preservar, anexar o migrar con decisión explícita y sin doble conteo.
5. Una escritura en dos hojas no es una transacción atómica: si falla una, devolver `PARCIAL`, conservar evidencia y permitir reconciliación idempotente.
6. No escribir si el usuario/fila es ambiguo, el valor cambió o la celda está protegida; no declarar éxito sin relectura.

## 6. Prueba de aceptación funcional

Para un cliente ficticio en hoja de ensayo:

1. Abrir `ATENDER` y mostrar etapa correcta según el manual validado.
2. Seleccionar acción y método; copiar mensaje con datos aprobados.
3. Confirmar resultado; anotar por separado detalle libre si existe.
4. Guardar F de cartera; releer la celda y comprobar el `EVENT_ID`.
5. Sincronizar F de BASE por una identidad única; releer y verificar el mismo `EVENT_ID`.
6. W de ambas hojas se mantiene independiente; ningún estado de X cambia por registrar la gestión.
7. Una confirmación financiera hecha en Zelle/PayPal/Transferencia tiene un flujo separado y no dispara un segundo cobro.
8. Simular concurrencia y fallo parcial sin perder histórico ni duplicar gestiones.

**Estado real a esta fecha:** MODELO PARCIAL. No hay validación extremo a extremo del guardado simultáneo en F de ambas hojas ni publicación de una versión definitiva del manual.

## 7. Decisiones pendientes antes de declarar SOP vigente

- **P0 — Fuente reciente:** recibir y auditar el DOCX exacto `📆 MANUAL DE COBRO – TIVIPLAY (2).docx`, incluida cada imagen y tabla.
- **P0 — Calendario:** aprobar cuál fuente define D-2/D-1/D0 y la transición a Retenciones 1–4.
- **P0 — Referencias de pago:** verificar Zelle, URL PayPal, transferencia y vigencia de cada titular/cuenta.
- **P0 — Beneficios, imágenes y promociones:** registrar cuáles están autorizados y por qué etapa.
- **P1 — Registro:** precisar opciones de etapa/resultado y cierre de llamada, WhatsApp e imagen.
- **P1 — Sincronización:** implementar `EVENT_ID` único y propagación consistente entre F de cartera y F de BASE.
- **P1 — Publicación:** revisar `TIVIPLAY_MENSAJES_COBRO_V1.md`, ajustar el parser de mensajes y publicar como ADMIN tras pruebas.

## 8. Gate de aprobación

Este archivo es una **auditoría de transición**, no una autorización de cuentas, reglas de vencimiento ni automatización.

**NEXT ACTION:** adjuntar el DOCX reciente al chat o facilitar el enlace exacto de Google Drive. Cotejar el contenido íntegro con esta matriz; actualizar este mismo MD (no abrir otro manual), generar la versión aprobable y recién entonces integrar selector, scripts y escritura controlada en la intranet.
