# Fichas de atención TiviPlay — Clasificación, procedimiento y script

**Versión:** 1.1
**Estado:** PENDIENTE DE VALIDACIÓN — PROPUESTA PARA PUBLICACIÓN POR DIRECCIÓN
**Fecha de corte:** 2026-11-04
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · Atención
**Decisión gobernante:** Instrucción de Dirección del 03/11/2026 (MVP operacional TiviPlay), contrato S0 v0.3 y regla operativa de créditos v1.0. Reúne la Guía rápida de turno v1.2, la Lista de octubre (HOY), los Documentos 5, 6 y 7, y el paquete de auditoría de WhatsApp del 03/11/2026 (solo nivel B, sin datos de clientes).

> **Cómo leer el estado de cada ficha:** `VALIDADO` significa que el texto copiable sale literal de la Guía rápida publicada por Dirección. `PENDIENTE DE VALIDACIÓN` significa que el texto se redactó desde documentos o desde el uso observado y Dirección aún no lo aprobó. `REQUIERE DECISIÓN` significa que falta una definición de Dirección: la ficha trae solo un mensaje neutro, sin oferta ni promesa. Ningún estado certifica el proceso de punta a punta.

## Reglas para todas las fichas

- Una sola instrucción por mensaje. Espera la respuesta del cliente antes de enviar la siguiente.
- Reemplaza lo que está entre corchetes, por ejemplo `[NOMBRE]`, antes de enviar.
- Si el diagnóstico muestra otra causa, reclasifica. La clasificación inicial no es definitiva.
- Una falla de canal no es un vencimiento del cliente, y un vencimiento no se deduce del síntoma: se consulta en HOY o en Runtime.
- Nunca digas que un pago está confirmado: eso solo ocurre con `CONFIRMADO JM`.
- Nunca escribas usuarios ni contraseñas en esta biblioteca, en grupos ni en documentos. Los entrega Back Office por el canal autorizado.
- Promociones, tarifas, códigos de instalación y enlaces solo se informan si están vigentes en un manual publicado.

## A1 · Cobro o recordatorio de vencimiento

- **Categoría:** A. FINANCIERA
- **Motivo:** Cobros
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** cobro, cobrar, recordatorio, vence, vencimiento, próximo pago, factura vencida, cartera, debe
- **Reclasificar a:** A2, A4, A6, B2

### Preguntas de diagnóstico

- ¿El cliente aparece en HOY para gestión?
- ¿Cuál es su fecha de próximo pago y su plan en HOY?
- ¿Ya reportó un pago?

### Procedimiento

1. Abre HOY y ubica al cliente en la lista de clientes por contactar.
2. Confirma plan y fecha de próximo pago con lo que muestra HOY.
3. Envía el recordatorio.
4. Si reporta pago, pasa a la ficha A2.
5. Si promete una fecha, pasa a la ficha A4.

### Respuesta copiable

```mensaje
Hola [NOMBRE], te saluda [ASESOR] de TiviPlay. Te recordamos que tu plan vence el [FECHA]. ¿Deseas renovarlo? Si ya realizaste el pago, envíanos el comprobante por aquí.
```

### Condiciones y advertencias

- Gestiona solo a los clientes que muestra HOY. Si no aparece, usa la ficha A6.
- No envíes datos de pago que no estén en un manual publicado.

### Escalamiento

- Cliente sin teléfono en HOY o caso marcado `REQUIERE_REVISION`: escala a Dirección y no lo resuelvas suponiendo reglas.

### Referencia documental

- Lista de octubre (HOY), secciones 1, 3 y 7. Documento 7, turno AM.

## A2 · Comprobante recibido

- **Categoría:** A. FINANCIERA
- **Motivo:** Comprobantes
- **Estado de validación:** VALIDADO
- **Palabras clave:** comprobante, recibí comprobante, pagó, ya pagué, captura de pago, zelle, paypal, transferencia, nequi, daviplata, soporte de pago
- **Reclasificar a:** A3, A5, A6

### Preguntas de diagnóstico

- ¿El comprobante trae valor y fecha legibles?
- ¿El cliente aparece en HOY?
- ¿El valor coincide con su plan?

### Procedimiento

1. Copia valor y fecha exactos del comprobante.
2. Envía el mensaje de recepción.
3. Registra el pago en la hoja de su medio con `PENDIENTE CONFIRMACION`, como indica la Lista de octubre (HOY), sección 4.
4. Tu parte termina ahí. La confirmación es de Dirección.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. Recibimos tu comprobante y quedó registrado para validación. Te avisaremos por este medio cuando el pago sea confirmado.
```

### Condiciones y advertencias

- `PENDIENTE CONFIRMACION ≠ CONFIRMADO JM`. No digas que el pago está confirmado, aprobado o exitoso.
- No asignes créditos por haber recibido un comprobante.

### Escalamiento

- Valor distinto, otro plan o cliente que no aparece en HOY: ficha A6.

### Referencia documental

- Guía rápida de turno, secciones 1 y 3.3. Lista de octubre (HOY), sección 4.

## A3 · Cliente pregunta si su pago ya quedó confirmado

- **Categoría:** A. FINANCIERA
- **Motivo:** Confirmación de pagos
- **Estado de validación:** VALIDADO
- **Palabras clave:** confirmación de pago, confirmar pago, ya quedó, pago pendiente, validación de pago, ya me confirmaron, verificar pago
- **Reclasificar a:** A2, A6, C6

### Preguntas de diagnóstico

- ¿Hay comprobante registrado con `PENDIENTE CONFIRMACION`?
- ¿Desde cuándo está pendiente?
- ¿El servicio está funcionando o el cliente reporta que se detuvo?

### Procedimiento

1. Busca el registro del pago en la hoja de su medio.
2. Si no existe, pide el comprobante y pasa a la ficha A2.
3. Si existe, envía el mensaje de abajo.
4. Si el cliente insiste o lleva demasiado tiempo pendiente, escala.

### Respuesta copiable

```mensaje
Hola [NOMBRE]. Tu pago está recibido y pendiente de confirmación. Estamos verificándolo y te avisaremos por aquí apenas quede confirmado. Gracias por tu paciencia.
```

### Condiciones y advertencias

- La confirmación financiera corresponde solo a Dirección.
- No asignes créditos por tu cuenta: solo a clientes al día o con pago confirmado.

### Escalamiento

- Cliente insistente o pago pendiente por demasiado tiempo: Dirección.

### Referencia documental

- Guía rápida de turno, sección 3.4. Documento 7.

## A4 · Compromiso de pago

- **Categoría:** A. FINANCIERA
- **Motivo:** Compromisos
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** compromiso, promete pagar, pago mañana, pagaré, quincena, espérame, plazo, prórroga
- **Reclasificar a:** A1, A2, A6

### Preguntas de diagnóstico

- ¿Qué fecha exacta propone el cliente?
- ¿El servicio sigue vigente en esa fecha?

### Procedimiento

1. Pide una fecha concreta.
2. Envía el mensaje de abajo.
3. Registra fecha y hora del compromiso en la planilla de pendientes.
4. Retoma al cliente en la fecha acordada.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. Dejo anotado que realizarás tu pago el [FECHA]. Cuando lo hagas, envíanos el comprobante por aquí para registrarlo.
```

### Condiciones y advertencias

- Un compromiso no habilita crédito ni renovación.
- No ofrezcas plazos, descuentos ni prórrogas: la política de retención sigue pendiente de decisión.

### Escalamiento

- Cliente pide plazo, descuento o continuidad sin pago: Dirección.

### Referencia documental

- Documento 7, gestión de clientes y planilla de pendientes. Curaduría de Protocolos de retención e Instructivo de cobro (contradictorios entre sí).

## A5 · Facturación o solicitud de factura

- **Categoría:** A. FINANCIERA
- **Motivo:** Facturación
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** factura, facturación, cuenta de cobro, recibo, enviar factura
- **Reclasificar a:** A1, A2, A6

### Preguntas de diagnóstico

- ¿El cliente pide una factura nueva o no recibió la anterior?
- ¿A qué mes corresponde?

### Procedimiento

1. Verifica en HOY plan y fecha de próximo pago.
2. Prepara la factura con el formato vigente de tu turno.
3. Envíala por el mismo chat.

### Respuesta copiable

```mensaje
Hola [NOMBRE]. Tu factura de TiviPlay ya está disponible. Si tienes alguna duda sobre el valor o la fecha, escríbenos por aquí.
```

### Condiciones y advertencias

- Adjunta la factura al mensaje. No uses enlaces históricos ni los de un chat anterior.
- Las facturas se envían un día antes del vencimiento.

### Escalamiento

- Valor, plan o periodo que no coincide: ficha A6.

### Referencia documental

- Documento 7, turno AM. Paquete WhatsApp 03/11/2026, script «Factura disponible» (uso observado, no certificado).

## A6 · Excepción financiera

- **Categoría:** A. FINANCIERA
- **Motivo:** Excepciones financieras
- **Estado de validación:** VALIDADO
- **Palabras clave:** excepción, valor distinto, pago incompleto, pagó otro plan, sin base, no aparece en hoy, requiere decisión, requiere revisión, duplicado, devolución
- **Reclasificar a:** A2, A3, B2

### Preguntas de diagnóstico

- ¿Qué no coincide: valor, plan, nombre o fecha?
- ¿`ESTADO_ENLACE` muestra `SIN BASE` o `REQUIERE DECISIÓN`?
- ¿El cliente aparece en HOY?

### Procedimiento

1. Envía el mensaje de espera.
2. No corrijas la hoja suponiendo la regla.
3. Identifica el caso en la Lista de octubre (HOY), sección 7 (E1 a E6).
4. Escala con el origen `BASE GENERAL!fila`, sin copiar datos personales.

### Respuesta copiable

```mensaje
Gracias por la información, [NOMBRE]. Voy a verificarlo con el área encargada; dame unos minutos, por favor, y en un momento vuelvo contigo.
```

### Condiciones y advertencias

- Los casos `REQUIERE_REVISION` no se resuelven suponiendo reglas.
- Las devoluciones y los ajustes de valor no los decide el operador.

### Escalamiento

- Siempre a Dirección.

### Referencia documental

- Lista de octubre (HOY), secciones 6 y 7. Guía rápida de turno, sección 3.2.

## B1 · Venta nueva o información del servicio

- **Categoría:** B. SERVICIO
- **Motivo:** Ventas
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** venta, cliente nuevo, información, precio, planes, cuánto vale, prueba gratis, quiero el servicio, prospecto
- **Reclasificar a:** B4, B6

### Preguntas de diagnóstico

- ¿Qué dispositivo usará?
- ¿Cuántas pantallas necesita?
- ¿Cómo conoció TiviPlay? ¿Lo refirió alguien?

### Procedimiento

1. Saluda y pregunta el dispositivo.
2. Consulta tarifas y pruebas en el guion publicado para operadores.
3. Si no hay guion publicado, pide la tarifa vigente a Dirección antes de responder.

### Respuesta copiable

```mensaje
¡Hola! Bienvenido(a) a TiviPlay, te saluda [ASESOR]. ¿Con quién tengo el gusto y en qué dispositivo te gustaría ver el servicio?
```

### Condiciones y advertencias

- No informes tarifas, pruebas ni promociones tomadas de chats antiguos.
- La tarifa y la prueba gratuita del guion 2025 siguen pendientes de confirmación.

### Escalamiento

- Tarifa o promoción sin manual publicado: Dirección.

### Referencia documental

- Guía rápida de turno, sección 3.1. Guion cliente nuevo (11/2025, pendiente de validación).

## B2 · Renovación

- **Categoría:** B. SERVICIO
- **Motivo:** Renovaciones
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** renovación, renovar, renovar plan, seguir con el servicio, otro mes, pagar mes, crédito, control
- **Reclasificar a:** A1, A2, A6, B5

### Preguntas de diagnóstico

- ¿Qué plan quiere renovar?
- ¿Ya pagó o va a pagar?
- ¿La fecha de vencimiento está próxima o ya pasó?

### Procedimiento

1. Consulta plan y fecha en HOY.
2. Si ya pagó, usa la ficha A2.
3. Si no ha pagado, envía el mensaje de abajo.
4. El crédito se ejecuta desde la agenda CONTROL y solo cuando HOY lo muestra habilitado.

### Respuesta copiable

```mensaje
Con gusto, [NOMBRE]. Tu plan actual es [PLAN] y vence el [FECHA]. Cuando realices el pago, envíanos el comprobante por aquí para registrarlo.
```

### Condiciones y advertencias

- `HABILITADO PARA CRÉDITO ≠ CRÉDITO EJECUTADO`.
- `CRÉDITO EJECUTADO ≠ BASE GENERAL ACTUALIZADA`.
- Un comprobante no habilita crédito. Solo clientes al día o con pago confirmado.

### Escalamiento

- Cliente sin pago confirmado que pide crédito, o agenda que no coincide: Dirección.

### Referencia documental

- Regla operativa de créditos y cierre de ciclo v1.0. Contrato S0 v0.3, sección 7.1. Documento 7.

## B3 · Reactivación

- **Categoría:** B. SERVICIO
- **Motivo:** Reactivaciones
- **Estado de validación:** REQUIERE DECISIÓN
- **Palabras clave:** reactivación, reactivar, volver, cliente antiguo, regresar, desactivado, reconexión, retomar servicio
- **Reclasificar a:** B1, B2, B4

### Preguntas de diagnóstico

- ¿El cliente existe en Runtime?
- ¿Cuándo tuvo servicio por última vez?
- ¿Sigue usando el mismo dispositivo?

### Procedimiento

1. Busca al cliente en Runtime.
2. Si no aparece, trátalo como venta nueva (ficha B1).
3. Si aparece, no crees un registro nuevo: escala para actualizar o reactivar.

### Respuesta copiable

```mensaje
Hola [NOMBRE], qué gusto saludarte. Voy a revisar tu caso para decirte cómo retomar el servicio; dame unos minutos, por favor.
```

### Condiciones y advertencias

- La reconexión de un cliente existente sigue en decisión (D13). No prometas condiciones ni fecha.

### Escalamiento

- Toda reactivación de cliente existente: Dirección.

### Referencia documental

- Manual de gestión financiera, decisión D13. Contrato S0 v0.3.

## B4 · Activación de un cliente

- **Categoría:** B. SERVICIO
- **Motivo:** Activaciones
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** activación, activar, entrega de acceso, instalación nueva, cliente nuevo instalar, primera instalación
- **Reclasificar a:** B1, C1, C5

### Preguntas de diagnóstico

- ¿Qué dispositivo y qué app usará?
- ¿La activación ya está autorizada?
- ¿Back Office ya entregó el acceso?

### Procedimiento

1. Verifica que la activación esté autorizada. Un comprobante sin confirmar no alcanza.
2. Pide a Back Office el acceso por el canal autorizado.
3. Sigue los pasos por dispositivo de la Guía rápida, sección 4 (Fire Stick: sección 6).
4. Pide al cliente que confirme que el servicio abre.

### Respuesta copiable

```mensaje
Hola [NOMBRE]. Cuando termines, entra a la aplicación y cuéntame si ya puedes ver el servicio.
```

### Condiciones y advertencias

- No pegues usuario ni contraseña en esta ficha ni en grupos.
- El código de instalación y las URL se toman solo de la Guía rápida publicada.

### Escalamiento

- Activación sin autorización o sin acceso de Back Office: Dirección.

### Referencia documental

- Guía rápida de turno, secciones 4, 5 y 6. Documento 5. Paquete WhatsApp 03/11/2026, «Confirmación de que el servicio abre».

## B5 · Cambio de plan o de pantallas

- **Categoría:** B. SERVICIO
- **Motivo:** Cambio de plan
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** cambio de plan, cambiar plan, más pantallas, menos pantallas, otra pantalla, subir plan, bajar plan
- **Reclasificar a:** A6, B2

### Preguntas de diagnóstico

- ¿Qué plan tiene hoy según HOY o Runtime?
- ¿Qué plan quiere?
- ¿Desde qué fecha?

### Procedimiento

1. Registra el plan actual y el solicitado.
2. Envía el mensaje de espera.
3. Escala: el cambio de plan afecta valor y crédito.

### Respuesta copiable

```mensaje
Claro, [NOMBRE]. Voy a revisar el cambio que me pides y en un momento te confirmo cómo quedaría tu plan.
```

### Condiciones y advertencias

- No cambies valor ni plan en las hojas por tu cuenta.
- Si el cliente ya pagó otro valor, usa la ficha A6.

### Escalamiento

- Siempre a Dirección o al responsable de facturación.

### Referencia documental

- Lista de octubre (HOY), caso E3. Paquete WhatsApp 03/11/2026, casos «Renovación y cambio de pantallas».

## B6 · Solicitud de referido

- **Categoría:** B. SERVICIO
- **Motivo:** Referidos
- **Estado de validación:** REQUIERE DECISIÓN
- **Palabras clave:** referido, referir, recomendé, amigo, mes gratis, refiere y gana, beneficio por referido
- **Reclasificar a:** B1

### Preguntas de diagnóstico

- ¿El servicio de quien refiere está activo?
- ¿La persona referida ya escribió?
- ¿Qué plan tomó la persona referida?

### Procedimiento

1. Registra quién refiere y a quién.
2. Atiende a la persona referida con la ficha B1.
3. Envía el mensaje neutro de abajo.
4. Escala para confirmar si aplica un beneficio.

### Respuesta copiable

```mensaje
Gracias por recomendarnos, [NOMBRE]. Voy a revisar tu referido con el área encargada y te cuento por aquí cómo quedó.
```

### Condiciones y advertencias

- La promoción de referidos no está revalidada para noviembre de 2026. No prometas beneficio, condiciones ni fechas.
- El texto histórico de esta promoción no se usa hasta que Dirección publique la versión vigente.

### Escalamiento

- Todo referido que espere un beneficio: Dirección.

### Referencia documental

- Paquete WhatsApp 03/11/2026, script «Refiere y gana» (histórico) y sección 12 de la propuesta de integración.

## B7 · Solicitud de contenido

- **Categoría:** B. SERVICIO
- **Motivo:** Solicitudes de contenido
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** contenido, película, serie, canal nuevo, agregar canal, programación, partido, evento, catálogo
- **Reclasificar a:** C7, C8

### Preguntas de diagnóstico

- ¿Qué título, canal o evento busca?
- ¿Lo veía antes? Si lo veía y dejó de funcionar, es soporte (ficha C7).

### Procedimiento

1. Registra el título o canal exacto.
2. Si la app no muestra contenido reciente, pide actualizar (UPDATE).
3. Envía el mensaje y registra la solicitud en pendientes.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. Tomo nota de tu solicitud de [CONTENIDO] y la paso al equipo encargado. Cualquier novedad te la cuento por aquí.
```

### Condiciones y advertencias

- No confirmes que un título o canal estará disponible.
- El catálogo actual no está documentado en esta ficha.

### Escalamiento

- Solicitudes repetidas de un mismo contenido: responsable técnico.

### Referencia documental

- Documento 6, sección 1.1. Paquete WhatsApp 03/11/2026, casos «Consulta de programación o contenido».

## B8 · Fuera de horario

- **Categoría:** B. SERVICIO
- **Motivo:** Fuera de horario
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** fuera de horario, noche, cerrado, horario, atención, domingo, festivo
- **Reclasificar a:** A2, C2, C8

### Preguntas de diagnóstico

- ¿El cliente ya dijo el motivo?

### Procedimiento

1. Envía el aviso.
2. Al retomar el turno, atiende el mensaje y clasifícalo.

### Respuesta copiable

```mensaje
Hola, gracias por escribir a TiviPlay. En este momento estamos fuera de horario. Déjanos tu motivo y te responderemos al retomar la atención.
```

### Condiciones y advertencias

- El export histórico no deja la hora en que el equipo retoma: no prometas una hora.
- El horario publicado en la Guía rápida sigue pendiente de confirmación.

### Escalamiento

- Falla general reportada por varios clientes: ficha C8.

### Referencia documental

- Paquete WhatsApp 03/11/2026, script «Fuera de horario». Guía rápida de turno, sección 3.5.

## C1 · La aplicación se eliminó o no está instalada

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Aplicación eliminada o no instalada
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** eliminó la aplicación, borró la app, se borró, desinstaló, no aparece la app, instalar de nuevo, reinstalar, cliente eliminó
- **Reclasificar a:** C3, C5, C6

### Preguntas de diagnóstico

- ¿En qué dispositivo la tenía?
- ¿Qué aplicación usaba?
- ¿Tiene a mano su usuario y contraseña?

### Procedimiento

1. Pregunta el dispositivo y la aplicación.
2. Abre la Guía rápida, sección 4, y sigue la fila de ese dispositivo (Fire Stick: sección 6).
3. Pide a Back Office los datos de acceso por el canal autorizado si el cliente no los tiene.
4. Cuando termine, pide confirmar que abre.

### Respuesta copiable

```mensaje
Hola [NOMBRE], te ayudo a instalarla de nuevo. ¿En qué dispositivo la tenías? Por ejemplo: Fire Stick, celular, TV Samsung o TV LG.
```

### Condiciones y advertencias

- Una instrucción por mensaje.
- Toma el código y los enlaces solo de la Guía rápida publicada.
- Si la app pide usuario y contraseña, no los pidas ni los repitas en grupos.

### Escalamiento

- Dispositivo no listado o instalación que falla dos veces: responsable técnico.

### Referencia documental

- Guía rápida de turno, secciones 4, 5 y 6. Documento 5.

## C2 · Cliente sin conexión o con pausas

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Problemas de conectividad
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** sin conexión, no tiene conexión, sin internet, wifi, internet, se congela, pausas, lento, buffer, intermitencia, se corta
- **Reclasificar a:** C3, C7, C8

### Preguntas de diagnóstico

- ¿Pasa en todos los canales o en uno?
- ¿Otras aplicaciones del mismo dispositivo tienen internet?
- ¿Otros clientes están reportando lo mismo?

### Procedimiento

1. Confirma si otras aplicaciones tienen internet.
2. Pide desconectar de la toma corriente televisor, caja o Fire Stick y router.
3. Espera unos 5 minutos y que conecte todo de nuevo.
4. Si sigue, pide un speedtest. Se recomiendan al menos 50 Mbps y red de 5 GHz.

### Respuesta copiable

```mensaje
Hola [NOMBRE]. Vamos a revisar tu conexión. Por favor desconecta de la toma corriente el televisor, el dispositivo y el router, espera 5 minutos y conéctalos de nuevo. Cuando termines, cuéntame si ya funciona.
```

### Condiciones y advertencias

- No culpes al internet del cliente sin diagnóstico.
- Si varios clientes reportan lo mismo, usa la ficha C8.

### Escalamiento

- Sigue fallando con buena velocidad: ficha C10.

### Referencia documental

- Documento 6, secciones 1.4, 5.4 y 6.1. Guía rápida de turno, secciones 2.7 y 4.

## C3 · La aplicación no abre

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Aplicación que no abre
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** no abre, no entra, se cierra sola, se queda en el logo, pantalla negra, se traba, no carga la app, almacenamiento
- **Reclasificar a:** C1, C2, C4, C5, C6

### Preguntas de diagnóstico

- ¿Qué aparece en pantalla?
- ¿Muestra un mensaje de error? Pide una foto sin datos de acceso.
- ¿Pasa desde cuándo?

### Procedimiento

1. Pide cerrar la app y reiniciar el dispositivo.
2. Si sigue, usa la ficha C4 (caché y datos).
3. En Fire Stick con aviso de almacenamiento, libera espacio: mínimo 500 MB.
4. Si se queda en el logo, revisa adaptador de corriente y puerto HDMI.
5. Si el mensaje habla de vencimiento, usa la ficha C6.

### Respuesta copiable

```mensaje
Hola [NOMBRE]. Por favor cierra la aplicación, reinicia el dispositivo y vuelve a abrirla. Si sigue igual, envíame una foto de lo que aparece en pantalla.
```

### Condiciones y advertencias

- No pidas restaurar de fábrica como primer paso.
- Si la foto muestra usuario, contraseña o URL, no la reenvíes.

### Escalamiento

- Persiste tras reinicio y caché, o posible falla física del dispositivo: ficha C10.

### Referencia documental

- Documento 6, secciones 5.1, 5.3, 5.6 y 5.7.

## C4 · Borrar caché y datos

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Caché y datos
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** caché, cache, borrar datos, limpiar app, datos de la aplicación, memoria
- **Reclasificar a:** C3, C5

### Preguntas de diagnóstico

- ¿Tiene a mano su usuario y contraseña? Borrar datos puede cerrar la sesión.
- ¿Qué dispositivo y app usa?

### Procedimiento

1. Pide salir de la aplicación.
2. Pide entrar a Configuración, Aplicaciones, Administrar aplicaciones instaladas.
3. Pide ubicar la app en uso y seleccionar Borrar caché.
4. Prueba la app. Solo si sigue fallando, pide Borrar datos.

### Respuesta copiable

```mensaje
[NOMBRE], sal de la aplicación y entra a Configuración > Aplicaciones > Administrar aplicaciones instaladas. Busca tu aplicación y selecciona Borrar caché. Avísame cuando termines.
```

### Condiciones y advertencias

- Los pasos corresponden a Fire Stick. En otro dispositivo, los nombres del menú pueden cambiar.
- Borrar datos puede pedir de nuevo el acceso: confirma primero con Back Office.

### Escalamiento

- Sigue fallando: ficha C10.

### Referencia documental

- Documento 6, sección 5.3.

## C5 · Credenciales o acceso

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Credenciales o acceso
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** usuario, contraseña, clave, acceso, no deja entrar, olvidé, inicio de sesión, error de login, datos de acceso, AT&T, ActiveArmor
- **Reclasificar a:** C4, C6, C9

### Preguntas de diagnóstico

- ¿La app muestra un error de usuario o contraseña?
- ¿Cambió de dispositivo o de red?
- ¿Tiene internet AT&T y le apareció una alerta de bloqueo?

### Procedimiento

1. Identifica al cliente en Runtime.
2. Solicita el acceso a Back Office por el canal autorizado.
3. Si hay evidencia de bloqueo AT&T ActiveArmor, sigue la Guía rápida, sección 7.
4. Pide confirmar que entró.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. Voy a revisar tus datos de acceso con el área encargada; dame unos minutos, por favor. Te escribo por aquí.
```

### Condiciones y advertencias

- Esta ficha no muestra ni guarda contraseñas.
- Una contraseña citada en un chat antiguo no se reutiliza.
- Dirección aún no define el almacén de credenciales para operadores.

### Escalamiento

- Back Office no puede resolverlo: Dirección.

### Referencia documental

- Guía rápida de turno, secciones 4, 5 y 7. Paquete WhatsApp 03/11/2026, regla de credenciales.

## C6 · Mensaje de servicio expirado, crédito o suscripción vencida

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Crédito o suscripción vencida
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** expirado, expiró, mensaje de servicio expirado, vencido, suscripción vencida, cuenta vencida, sin crédito, crédito vencido, subscription expired, account expired
- **Reclasificar a:** A2, A3, B2, C5, C9

### Preguntas de diagnóstico

- ¿Qué dice exactamente el mensaje? Pide una foto sin datos de acceso.
- ¿Qué fecha de vencimiento muestra HOY o Runtime?
- ¿Reportó un pago reciente?

### Procedimiento

1. Consulta la fecha en HOY o Runtime.
2. Si está vencido y no hay pago, pasa a la ficha B2.
3. Si reportó pago, pasa a la ficha A3.
4. Si la fecha sigue vigente, no es un vencimiento del cliente: escala a Back Office para revisar la línea.

### Respuesta copiable

```mensaje
Gracias por avisarnos, [NOMBRE]. Voy a verificar el estado de tu servicio y en un momento te confirmo qué aparece.
```

### Condiciones y advertencias

- No digas que el cliente está vencido antes de verificar la fecha.
- No asignes créditos desde esta ficha.

### Escalamiento

- Fecha vigente con mensaje de expirado: Back Office y Dirección.

### Referencia documental

- Regla operativa de créditos v1.0. Documento 7. Runtime Operativo.

## C7 · Un canal específico no funciona

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Error de canal específico
- **Estado de validación:** PENDIENTE DE VALIDACIÓN
- **Palabras clave:** canal específico, un canal, canal no funciona, canal sin señal, sin audio, no suena, canal caído, un solo canal
- **Reclasificar a:** C2, C8, B7

### Preguntas de diagnóstico

- ¿Cuál es el nombre exacto del canal?
- ¿La falla es intermitencia, sin señal o sin audio?
- ¿Desde qué hora ocurre?
- ¿Los demás canales funcionan?

### Procedimiento

1. Pide nombre del canal y tipo de falla.
2. Pide cerrar y abrir la app, y actualizar (UPDATE).
3. Si solo falta audio en XCIPTV, usa Restablecer Volumen en Settings.
4. Registra canal y hora, y escala para monitoreo técnico.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. ¿Me confirmas el nombre exacto del canal y si se queda sin señal, se corta o no tiene audio? Con eso lo reviso con el equipo técnico.
```

### Condiciones y advertencias

- Una falla de canal no es vencimiento del cliente: no lo trates como cobro.
- No prometas fecha de corrección.

### Escalamiento

- Registra canal, hora y tipo de falla: monitoreo técnico.

### Referencia documental

- Documento 6, secciones 1.3 y 6.2. Guía rápida de turno, sección 2.7.

## C8 · Falla general de canales

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Fallas generales de canales
- **Estado de validación:** VALIDADO
- **Palabras clave:** falla general, se cayó, caída, todos los canales, varios clientes, panel caído, no sirve nada, sin señal general
- **Reclasificar a:** C2, C7

### Preguntas de diagnóstico

- ¿Varios clientes reportan lo mismo en pocos minutos?
- ¿Dirección o el responsable técnico ya informó la novedad?

### Procedimiento

1. Si varios clientes reportan lo mismo, avisa a Dirección o al responsable técnico antes de responder.
2. Solo con la novedad confirmada, usa el mensaje de abajo.
3. Da seguimiento con las plantillas 2.5 y 2.6 de la Guía rápida.

### Respuesta copiable

```mensaje
Hola [NOMBRE], te saluda [ASESOR] de TiviPlay. Estamos presentando intermitencia general en algunos canales. No es un problema de tu equipo ni de tu cuenta, así que no es necesario reinstalar la aplicación. Nuestro equipo técnico ya está trabajando en ello y te informaremos cuando se normalice.
```

### Condiciones y advertencias

- Sin confirmación de la novedad, no uses este mensaje.
- No expliques causas técnicas ni prometas horas de solución.

### Escalamiento

- Novedad sin confirmar: Dirección o responsable técnico.

### Referencia documental

- Guía rápida de turno, secciones 2.2, 2.5, 2.6 y 2.7.

## C9 · Cambio de servidor o de panel

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Cambio de servidor o panel
- **Estado de validación:** REQUIERE DECISIÓN
- **Palabras clave:** cambio de servidor, cambio de panel, servidor caído, cambiar URL, panel 1, panel 2, panel 3, migrar línea
- **Reclasificar a:** C5, C10

### Preguntas de diagnóstico

- ¿A qué panel pertenece la línea? Confírmalo con Back Office.
- ¿Quién autorizó el cambio?
- ¿Qué app y dispositivo usa el cliente?

### Procedimiento

1. Confirma el panel con Back Office.
2. Si solo falla una URL, sigue la Guía rápida, sección 5: otra URL `VALIDADO` del mismo panel.
3. Mover una línea a otro panel requiere autorización.

### Respuesta copiable

```mensaje
Gracias, [NOMBRE]. Voy a revisar tu línea con el área encargada y te confirmo los pasos. Por favor no cambies nada en la aplicación todavía.
```

### Condiciones y advertencias

- No mezcles URL de paneles distintos.
- La dirección de inicio de sesión del panel de revendedor nunca se envía a un cliente.
- El chat histórico no deja un procedimiento de panel usable.

### Escalamiento

- Todo cambio de panel: Dirección.

### Referencia documental

- Guía rápida de turno, sección 5. Paquete WhatsApp 03/11/2026, sección de procedimientos, punto 6.

## C10 · Escalamiento técnico

- **Categoría:** C. SOPORTE TÉCNICO
- **Motivo:** Escalamiento técnico
- **Estado de validación:** VALIDADO
- **Palabras clave:** escalar, escalamiento, no se resolvió, sigue fallando, técnico, soporte, llamada, más de 15 minutos
- **Reclasificar a:** C2, C7, C8

### Preguntas de diagnóstico

- ¿Qué pasos ya hizo el cliente?
- ¿Cuál es el dispositivo, la app, el operador de internet y la hora?
- ¿El chat ya pasa de 15 minutos?

### Procedimiento

1. Envía el mensaje de espera.
2. Reúne dispositivo, app, síntoma, hora y pasos ya realizados.
3. Escala sin copiar credenciales ni capturas con datos de acceso.
4. Si el chat pasa de 15 minutos sin solución, ofrece una llamada.

### Respuesta copiable

```mensaje
[NOMBRE], sigo verificando tu caso. Gracias por esperar; en cuanto tenga respuesta te escribo por aquí.
```

### Condiciones y advertencias

- Registra lo pendiente en la planilla con fecha y hora.
- No cierres el caso sin responsable.

### Escalamiento

- Responsable técnico. Si no responde, Dirección.

### Referencia documental

- Guía rápida de turno, secciones 3.2 y 3.5. Documento 7.

## COBRO D-5 · Recordatorio

Etapa del Manual de cobro. La promoción de referido y la de recarga extendida quedan fuera hasta que Dirección las valide.

```mensaje
Hola [NOMBRE], te saluda [ASESOR] de *TIVIPLAY*.
📅 Recuerda que *tu recarga vence pronto*: tu próximo pago es el [FECHA].
Si ya realizaste el pago, envíanos el comprobante por aquí.
```

## COBRO D-2 ZELLE · Datos de pago

```mensaje
¡Saludos, [NOMBRE]! *TIVIPLAY te desea un excelente día* ☀️
📅 Tu próximo pago es el [FECHA]. Para que sigas disfrutando del servicio sin interrupciones, estos son nuestros datos de *ZELLE*:
[DATOS_PAGO]
Recarga: [VALOR]
🙌 ¡Gracias por seguir confiando en TIVIPLAY!
— [ASESOR]
```

## COBRO D-2 PAYPAL · Datos de pago

```mensaje
¡Saludos, [NOMBRE]! *TIVIPLAY te desea un excelente día* ☀️
📅 Tu próximo pago es el [FECHA]. Para mantener tu servicio activo sin interrupciones, te invitamos a realizar tu pago.
💳 Pago vía PayPal: [DATOS_PAGO]
Recarga: [VALOR]
🙌 ¡Gracias por seguir confiando en TIVIPLAY!
— [ASESOR]
```

## COBRO D-2 TRANSFERENCIA · Datos de pago

```mensaje
¡Saludos, [NOMBRE]! *TIVIPLAY te desea un excelente día* ☀️
📅 Tu próximo pago es el [FECHA]. Para mantener tu servicio activo sin interrupciones, te invitamos a realizar tu pago.
[DATOS_PAGO]
Recarga: [VALOR]
🙌 ¡Gracias por seguir confiando en TIVIPLAY!
— [ASESOR]
```

## COBRO D-1 · Alerta de suspensión

```mensaje
¡Buen día!
⚠️ Atención [NOMBRE]:
Tu servicio de *TIVIPLAY* será suspendido automáticamente por pago pendiente.
Para la continuidad de tu señal, realiza tu pago hoy mismo. Si necesitas asistencia, estamos aquí para ayudarte. ¡Contáctanos!
— [ASESOR]
```

## COBRO D0 · Retención 1

```mensaje
¡Hola [NOMBRE]!
Te saluda [ASESOR] de *TIVIPLAY*.
Queremos informarte que tu servicio ha sido suspendido 🚫.
*No te preocupes*, puedes reactivarlo hoy mismo sin cargos adicionales 🥳
Solo necesitas realizar el pago y estaremos encantados de tenerte de vuelta.
Si tienes alguna duda, estamos a tu disposición.
```

## COBRO D+ · Retención 2

```mensaje
¡Hola [NOMBRE]!
*En TIVIPLAY no te hemos olvidado*.
¿Sabías que tu usuario es único? Por eso, siempre podrás activar tu servicio recargando en cualquier momento 📲
Estamos aquí, listos para ofrecerte el mejor servicio cuando decidas regresar 😊.
Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
— [ASESOR]
```
