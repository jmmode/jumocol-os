# TIVIPLAY · Manual de cobranza y ciclo de retención — SOP de integración v0.3

**Estado:** PARCIAL · FUENTE DOCX LEÍDA · REQUIERE DECISIÓN EN TRANSICIÓN Y PUBLICACIÓN  
**Corte:** 2026-11-04 (America/Bogota)  
**Fuente primaria:** archivo adjunto por Dirección, `📆 MANUAL DE COBRO – TIVIPLAY (2)(1).docx`, SHA-256 `60bfa4d37b8135adf18b030d30a0bd643dae273003d1885aa77262a0439c9916`.  
**Ubicación canónica propuesta:** `03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/`.  
**Documento actual de mensajes en la intranet:** `TIVIPLAY_MENSAJES_COBRO_V1.md` (no modificar ni publicar sin el gate).  
**Ámbito:** Operaciones → TiviPlay → Turno → ATENDER → Gestión de cobro.  
**Política de seguimiento aprobada por Dirección (04/11/2026):** modelo equilibrado, con alerta de liberación de línea dirigida al **asesor que atiende** desde la **Cola Operacional**. No existe perfil Back Office: no crearlo ni asignarle alertas. La fecha de suspensión efectivamente validada se denomina **S0**; Retención 1 en S0, Retención 2 en S+2 y candidatura a campaña promocional en S+5 (sin oferta no aprobada). La liberación real requiere evidencia del panel y registro de responsable.

> El archivo DOCX sí fue leído y auditado. La presente versión define contrato de datos y diseño operativo; **no declara implementación en 3002 ni habilita escrituras**. Se conserva el texto original y se diferencian hechos del manual, solicitudes nuevas de Dirección y propuestas técnicas.

## 1. Principio de operación

El asesor debe ver **una línea de tiempo por día**, conocer en qué etapa está el cliente, elegir una acción predeterminada, revisar/editar el mensaje, copiarlo, realizar efectivamente la comunicación y **confirmar el resultado**. Solo esa confirmación permite registrar la gestión.

**Días relativos:** `días_para_pago = fecha(F. PRÓXIMO PAGO) - hoy(Bogotá)`. Por ejemplo, `+5` en cálculo equivale a **D−5**, cinco días antes del vencimiento; `0` equivale a **D0**; `−2` equivale a **D+2**, dos días vencido. **No usar F.VENCIMIENTO técnico para calcular la etapa comercial.**

Estados de un evento de gestión **no son** estados financieros. `MENSAJE_ENVIADO` y `COMPROBANTE_RECIBIDO` nunca equivalen a `CONFIRMADO JM`.

## 2. Línea de tiempo: evidencia del DOCX y contrato de interfaz

| Etapa | Disparador por fecha | Acción ofrecida al asesor | Canal | Evidencia del DOCX | Automatización permitida |
|---|---|---|---|---|---|
| **D−5** | faltan 5 días | **Recordatorio + beneficio**. Elegir `REFERIDO` o `RECARGA_EXTENDIDA` | WhatsApp | Dos copys textuales | Sugerir y copiar; beneficio sujeto a vigencia aprobada |
| **D−4** | faltan 4 días | **Llamada de refuerzo** al beneficio enviado | Llamada | Instrucción, **sin libreto literal** | Mostrar tarea y resultado de llamada |
| **D−3** | faltan 3 días | **Imagen del beneficio** correspondiente | WhatsApp | Instrucción, **sin recurso adjunto en este DOCX** | Selección de imagen solo si existe recurso publicado |
| **D−2** | faltan 2 días | **Datos o enlace de pago**: `ZELLE`, `PAYPAL` o `TRANSFERENCIA` | WhatsApp / llamada | Tres mensajes y datos de cobro | Mostrar solo método y datos pertinentes, con monto verificado |
| **D−1** | falta 1 día | **Alerta de suspensión por pago pendiente** | WhatsApp / llamada | Texto literal de advertencia | Avisar, **no desactivar** |
| **D0** | día de pago | **Verificación del ciclo**; si no hay pago confirmado del ciclo, **generar alerta en Cola Operacional para el mismo asesor**: verificar pago, revisar elegibilidad y confirmar liberación real de línea con evidencia | Validación + alerta | El DOCX titula «Día 0: Mensaje de retención 1» y supone servicio suspendido | **No cambiar estado técnico sin comprobar panel y autorización** |
| **POST-SUSPENSIÓN** | existe desactivación verificada | **Retención 1** (texto de DOCX etiquetado D0) | WhatsApp / llamada / correo | Mensaje de reactivación | Solo después de verificación real de suspensión |
| **RETENCIÓN 2** | **S+2**, dos días después de liberación confirmada | Mensaje de usuario recuperable | WhatsApp | DOCX vuelve a titular «Día 0: Mensaje de retención 2» | Dirección aprueba S+2 como regla operacional, prevalece sobre ambigüedad histórica |
| **PROMO_REACTIVACIÓN** | **S+5**, cinco días después de liberación confirmada | Entrada como **candidato** a oferta de reactivación | WhatsApp / llamada | **Decisión de Dirección 04/11/2026; NO definida en el DOCX** | La campaña necesita beneficio, elegibilidad, vigencia y aprobación antes de contactar |

**Alertas visuales propuestas:** la etapa del día debe resaltar; las ya ejecutadas deben mostrar fecha, asesor y resultado; las vencidas sin ejecución deben aparecer como pendientes; las bloqueadas, con motivo y escalamiento. La operación real debe prevalecer sobre un simple cálculo de fecha.

**Conflictos que impiden automatismo:** el DOCX etiqueta Retención 1 y Retención 2 como «Día 0»; el texto de D−2 afirma «HOY es tu día oportuno de pago» pese a que faltan dos días; y D0 afirma que el servicio fue suspendido sin incluir una comprobación. Estos hechos deben conservarse y resolverse, no reinterpretarse silenciosamente.

## 3. Datos y mensajes existentes en el DOCX (fuente, no aprobación de vigencia)

### Beneficio D−5 · opción 1, referido

> Hola [Nombre del cliente], te saluda [Nombre del asesor] de *TIVIPLAY*.
>
> Recuerda que tu recarga vence pronto. Si hoy nos envías un referido que active el servicio, tu recarga de este mes será *GRATIS*.
>
> ¡Así de simple! Es nuestra manera de agradecerte por recomendarnos. ¿Te animas a aprovechar esta promo exclusiva?
>
> — TIVIPLAY

**Control:** «gratis» es una promesa comercial sujeta a vigencia, condiciones y aprobación. No enviar si no está autorizada.

### Beneficio D−5 · opción 2, recarga extendida

> Buen día [Nombre del cliente], te saluda [Nombre del asesor] de *TIVIPLAY*.
>
> Recuerda que tu recarga vence pronto. ¿Sabías que puedes ahorrar más si recargas por *6 meses o 1 año*? Además, obtienes beneficios adicionales.
>
> Si te interesa cambiar tu plan, escríbeme y con gusto te explico cómo hacerlo.
>
> — TIVIPLAY

**Control:** las tarifas y beneficios deben venir del catálogo vigente, no se inventan.

### D−4 · llamada

El manual instruye «Reforzar la promoción enviada el día anterior. Resolver dudas y motivar la acción». **No contiene un guion de llamada completo.** El guion es entregable pendiente de validación.

### D−3 · imagen

El manual instruye enviar la imagen del beneficio ofrecido. **El DOCX adjunto no contiene imágenes incrustadas**, por lo que el módulo debe requerir una imagen autorizada o mostrar «recurso pendiente». No simular envío.

### D−2 · datos de pago por método

| Método | Datos literalmente localizados en DOCX | Estado de uso |
|---|---|---|
| **ZELLE** | Correo: `info@jumocol.net`; a nombre de **Jumocol Llc** | Disponible en fuente, vigencia **REQUIERE VALIDACIÓN** |
| **PAYPAL** | `https://www.paypal.com/invoice/p` | Ruta genérica, **no es un enlace individual de factura**; completar enlace vigente |
| **TRANSFERENCIA** | **Bancolombia · Cuenta de ahorros 33828577331 · Julián Montealegre** | Disponible en fuente, vigencia **REQUIERE VALIDACIÓN** |
| **Conversión a COP** | «INCLUIR IMAGEN VALOR A PAGAR EN PESOS» | No está el recurso ni tasa del día; requiere herramienta/imagen aprobada |

**Texto fuente Zelle:** saludo, fecha, «HOY es tu día oportuno de pago», correo/titular, recarga, agradecimiento y firma.  
**Texto fuente PayPal:** saludo equivalente, invitación a pagar hoy, URL genérica, agradecimiento y firma.  
**Texto fuente transferencia:** saludo, cuenta Bancolombia/titular, imagen de conversión COP por aportar, agradecimiento y firma.

**Normalización propuesta pendiente de publicación:** personalizar `[NOMBRE]`, `[ASESOR]`, `[FECHA_PAGO]`, `[PLAN]`, `[VALOR]`, `[MONEDA]` y `[DATOS_PAGO]`; no dejar «Asesor Luis» ni planes ficticios embebidos. Corregir la frase «HOY es tu día oportuno» para que no confunda la fecha D−2 con vencimiento D0, pero conservarla en el DOCX histórico.

### D−1 · alerta

> Atención [Nombre del cliente]: Tu servicio de *TIVIPLAY* será suspendido automáticamente por pago pendiente.
>
> Para la continuidad de tu señal, realiza tu pago hoy mismo. Si necesitas asistencia, estamos aquí para ayudarte.

**Control:** aviso no significa que el panel ya haya suspendido el servicio.

### D0 / Retención 1, solo después de suspender

> Queremos informarte que tu servicio ha sido suspendido. Puedes reactivarlo hoy mismo sin cargos adicionales. Solo necesitas realizar el pago y estaremos encantados de tenerte de vuelta.
>
> [Link de pago / datos]

**Control:** no mostrar como «servicio suspendido» si la suspensión no fue verificada. «Sin cargos adicionales» exige autorización comercial vigente.

### Retención 2 (el DOCX la rotula también «Día 0»)

> En *TIVIPLAY* no te hemos olvidado. Tu usuario es único y siempre podrás activar tu servicio recargando en cualquier momento. Estamos listos para ofrecerte el mejor servicio cuando decidas regresar.

**Control:** definir umbral temporal y frecuencia. Evitar enviar dos mensajes distintos de retención el mismo día por ambigüedad.

## 4. Máquina de estados operacional

Esta es **una propuesta de implementación**, no prueba de estado actual:

`POR_VENCER → D5/D4/D3/D2/D1 → VENCE_HOY → [PAGO_VALIDADO | PAGO_PENDIENTE] → ALERTA_DESACTIVACION → [SUSPENSION_CONFIRMADA | SUSPENSION_NO_CONFIRMADA] → RETENCION_1 → RETENCION_2 → CAMPANA_REACTIVACION → REACTIVADO`

Invariantes:

1. Si existe **CONFIRMADO JM** para un movimiento inequívoco del **ciclo corriente**, dejar de ofrecer cobro ordinario; la hoja X por sí sola no acredita el ciclo si conserva evidencia de octubre.
2. `ALERTA_DESACTIVACION` crea una tarea para el responsable técnico, **no ejecuta cambios en paneles**.
3. `SUSPENSION_CONFIRMADA` exige evidencia verificable de la desactivación en el panel y responsable, no basta que sea D0.
4. `CAMPANA_REACTIVACION` requiere decisión humana sobre inicio, elegibilidad, descuento y vigencia.
5. `COMPROBANTE_RECIBIDO` solo abre verificación; no cambia `CONFIRMACION` a `CONFIRMADO JM`.
6. Si identidad, servicio o datos financieros son ambiguos, estado `REQUIERE VALIDACIÓN` y no suspensión ni cobro automático.
7. El bloqueo de créditos del Panel 3 permanece intacto.


## 4.1. Decisión aprobada — Cola Operacional y liberación de línea (2026-11-04)

**Decisión:** El modelo **equilibrado** queda aprobado con **asesor responsable**. No existe perfil Back Office en esta etapa de JUMOCOL OS. La tarea de revisión y confirmación es atendida por el **mismo asesor que toma ATENDER**. No asignar automáticamente a un supuesto perfil o servicio inexistente.

| Momento | Evento / estado | Responsable | Condición de salida / evidencia |
|---|---|---|---|
| **D0** y vencidos, sin pago confirmado del ciclo | **ALERTA_LIBERACION_LINEA** en **Cola Operacional** | Asesor que atiende | Revisa método, confirmación JM, identidad, ciclo y estado real del panel |
| Pago recibido sin JM, identidad ambigua o caso en revisión | **VALIDAR_PAGO_ANTES_DE_LIBERAR** | Asesor que atiende; Dirección confirma finanzas cuando corresponda | No liberar ni afirmar impago; dejar resultado documentado |
| Sin pago confirmado y elegible | **PENDIENTE_VERIFICAR_LIBERACION** | Asesor que atiende | Efectúa acción técnica **solo si dispone de permisos** y confirma evidencia del panel; de lo contrario **BLOQUEADO / REQUIERE DECISIÓN** |
| Liberación efectivamente comprobada | **LIBERACION_CONFIRMADA (S0)** | Asesor que atendió | Fecha/hora Bogotá, panel, usuario, asesor, resultado, referencia de evidencia; registrar evento único |
| **S0** | **RETENCION_1** | Asesor | Mensaje posterior a liberación verificada, confirmación de envío |
| **S+2** | **RETENCION_2** | Asesor | Solo si sigue liberada y no existe pago confirmado ni reactivación |
| **S+5** | **CANDIDATO_PROMOCION** | Asesor | Elegibilidad y promoción vigentes aprobadas antes de enviar |

**Semántica:** «liberar línea» es una **acción técnica comprobada en el panel**; «generar alerta» no libera la línea. D0 **no es** una prueba de suspensión. Una alerta calculada sin persistencia no equivale a gestión finalizada.

**Contrato de la alerta en Cola Operacional:** `tipo=ALERTA_LIBERACION_LINEA`, `clienteId`, `vencimiento`, `diasVencido`, `estado=PENDIENTE`, `responsable=ASESOR_QUE_ATIENDE`, `motivo`, `fuente`. En la ficha ATENDER deberá existir una **confirmación explícita** con `resultado`, `fechaHora`, `asesor`, `evidenciaPanel` y `EVENT_ID`. Registrar el mismo evento en las F de la hoja del mes y BASE GENERAL únicamente después de verificar la escritura y la identidad 1:1. No atribuir a una alerta temporal el estado `VALIDADO`.

**Condiciones de bloqueo:** existe CONFIRMADO JM del ciclo (no generar liberación); comprobante o confirmación financiera pendiente (revisar, no ejecutar); Panel 3/identidad ambigua (no ejecutar créditos ni liberar por inferencia); acceso al panel ausente (no declarar ejecución).

**Estado técnico de la decisión:** POLÍTICA APROBADA. Implementación de alerta visual, guardado de confirmación y persistencia de S0 deben verificarse por separado.

### Estados visibles por tarjeta del cliente

- **Etapa sugerida** por la fecha de pago: D−5, D−4, D−3, D−2, D−1, D0 o días vencidos.
- **Gestión del día**: PENDIENTE, EN EJECUCIÓN, GESTIONADA, REQUIERE REVISIÓN (estado de proceso, no campo X).
- **Estado financiero**: lectura desde hoja del medio + X de noviembre, con identificación de ciclo; PENDIENTE CONFIRMACIÓN / CONFIRMADO JM / REQUIERE REVISIÓN.
- **Estado técnico**: ACTIVO, SUSPENDIDO o NO VERIFICADO únicamente según fuente de servicio.
- **Ruta de retención/promoción**: ingresar únicamente tras cumplir condiciones documentadas.

## 5. Selector que debe consumir la intranet

Campos de una gestión en `ATENDER`:

| Campo | Tipo | Fuente / regla |
|---|---|---|
| Día del ciclo | Calculado, solo lectura | F. PRÓXIMO PAGO, horario Bogotá |
| Etapa | Propuesta predeterminada, confirmable | Matriz anterior; no seleccionar dos etapas incompatibles |
| Acción | Selector por etapa | Beneficio, llamada, imagen, datos de pago, alerta, retención |
| Método de pago | Selector condicionado | Zelle, PayPal, transferencia; desde fuente vigente |
| Mensaje | Plantilla editable antes de copiar | Copiar no equivale a enviar |
| Canal | Selector | WhatsApp, llamada, correo, imagen |
| Resultado | Selector obligatorio | `MENSAJE_ENVIADO`, `SIN_RESPUESTA`, `COMPROMISO_PAGO`, `COMPROBANTE_RECIBIDO`; ampliar por aprobación para `LLAMADA_ATENDIDA`, `IMAGEN_ENVIADA`, `ALERTA_ESCALADA` |
| Observaciones del asesor | Texto libre independiente | W |
| Confirmar y guardar | Acción explícita | Persistir solo gestión ejecutada y verificable |

Cada opción debe estar visible con el **día relativo**, el último evento ejecutado, la siguiente acción y el motivo si está bloqueada. La etapa calculada **no** es prueba de que el asesor ya la realizó.

## 6. Contrato de Google Sheets · actualizado 2026-11-04

| Fuente | Campo | Semántica |
|---|---|---|
| `PAGOS NOVIEMBRE 2026` | **F · OBSERVACIONES GESTION** | Bitácora de acciones/canal/resultado |
| `PAGOS NOVIEMBRE 2026` | **W · OBSERVACIONES ASESOR** | Notas libres independientes |
| `PAGOS NOVIEMBRE 2026` | **X · CONFIRMACION** | Estado financiero bajo control de Dirección |
| `PAGOS NOVIEMBRE 2026` | **AG · CONFIRMACION_FINANCIERA** | Evidencia financiera histórica; no implica noviembre |
| `PAGOS NOVIEMBRE 2026` | **AN · ESTADO_COBRO** | Estado de cartera, no resultado de llamada |
| `BASE GENERAL` | **F · OBSERVACIONES GESTION** | Continuidad del mismo evento de gestión |
| `BASE GENERAL` | **W · OBSERVACIONES ASESOR** | Nota libre del cliente |
| `BASE GENERAL` | **AH · CLIENTE_KEY** | Identificación de fuente, no enlace único por nombre |

**Evento canónico propuesto**:
`EVENT_ID | FECHA_HORA_BOGOTA | ASESOR | ETAPA | ACCION | CANAL | RESULTADO | METODO | DETALLE`

- El mismo `EVENT_ID` debe figurar en F de la hoja del mes y F de BASE. **Una gestión, no dos**.
- Preservar texto histórico de BASE GENERAL!F; no reinterpretarlo como evento estructurado.
- No trasladar automáticamente el texto libre W a F ni actualizar X al enviar un mensaje.
- Escribir con permisos mínimos, enlace verificable 1:1, control de cambios y relectura. La doble escritura no es atómica: registrar `PARCIAL` y permitir reparación idempotente si una hoja falla.
- El guardado en las dos hojas **no está validado extremo a extremo** ni activado en esta auditoría.

## 7. Contrato visual de la línea de tiempo

Propuesta para la ficha integral:

```text
CLIENTE · PRÓXIMO PAGO 10/11/2026 · HOY 05/11/2026 · D−5
[D−5 ● HOY] — [D−4 ○] — [D−3 ○] — [D−2 ○] — [D−1 ○] — [D0 ○]
   Recordatorio       Llamada     Imagen     Pago       Alerta    Check

ETAPA: D−5 · Elegir beneficio [REFERIDO ▼] [RECARGA_EXTENDIDA ▼]
MENSAJE: [Editar] [Copiar]
RESULTADO: [MENSAJE ENVIADO ▼] [CONFIRMAR Y GUARDAR]

Si D0 no tiene pago confirmado del ciclo:
[ALERTA EN COLA OPERACIONAL → ASESOR · VERIFICAR Y CONFIRMAR LIBERACIÓN]  (NO desactiva sola)

Si el panel evidencia suspensión:
[SUSPENDIDO VALIDADO] → [RETENCIÓN 1] → [RETENCIÓN 2] → [CAMPAÑA PROMO]
```

La representación anterior es una **especificación de interfaz**; no declara que 3002 ya la muestre.

## 8. Gate de aceptación

**A. Documentación:** decisión aprobada sobre S0, Retención 2 (S+2), entrada promocional (S+5) y asesor responsable de alerta; faltan textos promocionales y vigencia de cuentas.  
**B. Interfaz:** selector de etapa/día con copia y edición, estados separados (gestión / finanzas / servicio), registro explícito y visible.  
**C. Datos:** hoja de ensayo para verificar F y W en cartera y BASE con un `EVENT_ID`; X sin alteración por gestión comercial.  
**D. Runtime:** tres casos sintéticos: pago confirmado → sin alerta de liberación; vencido sin confirmación → alerta visible al asesor, no suspensión; liberación validada → retención S0, S+2 y campaña candidata S+5.  
**E. Despliegue:** typecheck, pruebas, build, navegador OPERADOR/ADMIN, posterior publicación autorizada. Sin datos reales en pruebas.

### Decisiones P0 que no debe inventar el motor

1. **D0 y Retención 1:** RESUELTO: generar alerta en Cola Operacional; el asesor comprueba liberación en panel, registra S0 y solo entonces permite retención 1.
2. **Retención 2:** RESUELTO: S+2, calculado desde la liberación real S0.
3. **Campaña promocional:** PARCIAL: S+5 para candidatura; beneficios y elegibilidad siguen pendientes de aprobación.
4. **Datos de pago:** validar la vigencia del correo Zelle y la cuenta de transferencia; suministrar URL PayPal de factura válida o regla de generación.
5. **Beneficio D−5 e imagen D−3:** validar promociones vigentes y recursos publicados.

**NEXT ACTION:** aprobar esas reglas puntuales; entonces ajustar `cobranzaStage()` y `TIVIPLAY_MENSAJES_COBRO_V1.md` en la misma rama y probar el selector sin habilitar aún escrituras en producción.
