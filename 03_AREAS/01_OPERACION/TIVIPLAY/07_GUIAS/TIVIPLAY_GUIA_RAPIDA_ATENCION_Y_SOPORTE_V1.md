# Guía rápida de turno — Mensajes, scripts y configuración

**Versión:** 1.2
**Estado:** PENDIENTE DE VALIDACIÓN — PROPUESTA PARA PUBLICACIÓN POR DIRECCIÓN
**Fecha de corte:** 2026-10-23
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · Manuales y procesos
**Decisión gobernante:** Contrato S0 v0.3 (`PENDIENTE CONFIRMACION ≠ CONFIRMADO JM`) y feedback de operadores (Jorge, Heidi, Manuela) del 22/10/2026. La versión 1.1 muestra las URL por panel desde la configuración local de la intranet y valida el código de Downloader (decisiones de Dirección del 22/10/2026). La versión 1.2 documenta el procedimiento AT&T ActiveArmor (sección 7) con el procedimiento de Jorge y capturas aportadas por Dirección el 23/10/2026. Consolida, sin reemplazar sus originales, el Texto de apoyo (2023), el Guion cliente nuevo (11/2025), el Documento 5 (instalaciones), el Documento 6 (servicio técnico) y LINKS DE DESCARGA.

> **Cómo usar esta guía:** busca en Manuales y procesos lo que necesitas («se cayó el panel», «recibí comprobante», «Downloader», «Panel 2»…) y abre la sección que aparece. Cada mensaje tiene un botón **Copiar**. Reemplaza lo que está entre corchetes, por ejemplo `[NOMBRE]`, antes de enviarlo.

## 1. Regla de pagos (léela antes de usar cualquier script)

- Puedes decir: **comprobante recibido**, **pago recibido para validación**, **pendiente de confirmación**, **estamos verificando el pago**.
- Nunca digas que el pago está confirmado, aprobado o exitoso. Eso solo ocurre cuando Dirección marca `CONFIRMADO JM`.
- Registrar `PENDIENTE CONFIRMACION` en la hoja del medio de pago no confirma nada. `PENDIENTE CONFIRMACION ≠ CONFIRMADO JM`.
- El mensaje histórico «Confirmamos que su pago ha sido exitoso» del Texto de apoyo (2023) **ya no se usa**. Usa los scripts de la sección 3.
- El registro paso a paso del pago está en el manual **Lista de octubre (HOY)**; esta guía solo cubre qué decirle al cliente.

## 2. Plantillas de incidencias del servicio

Búsquedas frecuentes: se cayó el panel, caída, sin señal, no carga, intermitencia, se congela, actualización de canales, actualización de películas, movies, series, seguimiento, servicio normalizado.

Usa estas plantillas solo cuando Dirección o el responsable técnico haya informado la novedad. No expliques causas técnicas que no te hayan confirmado y no prometas horas de solución.

### 2.1 Caída de panel

```mensaje
Hola [NOMBRE], te saluda [ASESOR] de TiviPlay. Te informamos que en este momento presentamos una novedad general en el servicio que afecta la señal. Nuestro equipo técnico ya está trabajando para restablecerlo lo antes posible. Te avisaremos por este medio apenas el servicio esté normalizado. Gracias por tu paciencia.
```

### 2.2 Intermitencia general

```mensaje
Hola [NOMBRE], te saluda [ASESOR] de TiviPlay. Estamos presentando intermitencia general en algunos canales. No es un problema de tu equipo ni de tu cuenta, así que no es necesario reinstalar la aplicación. Nuestro equipo técnico ya está trabajando en ello y te informaremos cuando se normalice.
```

### 2.3 Actualización de canales

```mensaje
Hola [NOMBRE]. Te informamos que estamos realizando una actualización de canales. Durante este proceso algunos canales pueden cambiar de carpeta o no estar disponibles por unos minutos. Para ver la lista actualizada, cierra la aplicación y vuelve a abrirla; si usas XCIPTV o Smarters, selecciona la opción de actualizar (UPDATE). Cualquier duda, aquí estamos.
```

### 2.4 Actualización de películas y series (movies/series)

```mensaje
Hola [NOMBRE]. Estamos actualizando el catálogo de películas y series. Mientras termina el proceso, algunos títulos pueden no aparecer o tardar en cargar. Al finalizar, cierra y vuelve a abrir la aplicación (o usa la opción UPDATE) para ver el contenido nuevo.
```

### 2.5 Seguimiento de la incidencia

```mensaje
Hola [NOMBRE], te escribe [ASESOR] de TiviPlay para darte seguimiento. Nuestro equipo técnico continúa trabajando en la novedad del servicio. Aún no está normalizado; te avisaremos apenas quede resuelto. Gracias por tu comprensión.
```

### 2.6 Servicio normalizado

```mensaje
Hola [NOMBRE]. Te informamos que el servicio ya se encuentra normalizado. Si todavía ves algún canal sin señal, cierra la aplicación y vuelve a abrirla. Si el problema continúa, escríbenos por aquí y con gusto te ayudamos. ¡Gracias por tu paciencia!
```

### 2.7 Cuándo escalar

| Situación | Acción |
| --- | --- |
| Varios clientes reportan lo mismo en pocos minutos | Avisa a Dirección / responsable técnico antes de responder con una plantilla general. |
| Un solo cliente sin señal | Sigue el Documento 6 (servicio técnico): reinicio, speedtest, actualización de la app. |
| Un canal o serie específica no funciona | Registra canal y hora y escala; no prometas fecha de corrección. |
| Nadie ha confirmado la novedad | No uses las plantillas 2.1–2.6; verifica primero. |

## 3. Scripts de atención

Búsquedas frecuentes: saludo, bienvenida, recepción inicial, mensaje de espera, un momento, estoy verificando, recibí comprobante, comprobante, pago pendiente, validación de pago, despedida, cierre de gestión.

### 3.1 Recepción inicial

```mensaje
¡Hola! Bienvenido(a) a TiviPlay, te saluda [ASESOR]. ¿Con quién tengo el gusto y en qué te puedo ayudar hoy?
```

### 3.2 Mensaje de espera mientras verificas

```mensaje
Gracias por la información, [NOMBRE]. Voy a verificarlo con el área encargada; dame unos minutos, por favor, y en un momento vuelvo contigo.
```

Si la verificación tarda más de lo previsto, vuelve al chat antes de que el cliente pregunte:

```mensaje
[NOMBRE], sigo verificando tu caso. Gracias por esperar; en cuanto tenga respuesta te escribo por aquí.
```

Si el chat pasa de 15 minutos sin solución, ofrece una llamada (Documento 7, funciones por turno).

### 3.3 Recepción de comprobante

```mensaje
Gracias, [NOMBRE]. Recibimos tu comprobante y quedó registrado para validación. Te avisaremos por este medio cuando el pago sea confirmado.
```

Después de enviarlo: registra el pago con `PENDIENTE CONFIRMACION` en la hoja del medio de pago (manual **Lista de octubre (HOY)**). No digas que el pago está confirmado.

### 3.4 Pago pendiente de validación (el cliente pregunta)

```mensaje
Hola [NOMBRE]. Tu pago está recibido y pendiente de confirmación. Estamos verificándolo y te avisaremos por aquí apenas quede confirmado. Gracias por tu paciencia.
```

Si el cliente insiste o el pago lleva demasiado tiempo pendiente, escala a Dirección. No asignes créditos por tu cuenta: solo a clientes al día o con pago confirmado (Documento 7).

### 3.5 Cierre de gestión

```mensaje
Fue un gusto atenderte, [NOMBRE]. ¿Hay algo más en lo que te pueda ayudar? Recuerda que nuestro horario es de lunes a sábado de 8:00 a. m. a 9:00 p. m. y domingos de 8:00 a. m. a 5:00 p. m. (hora Colombia). ¡Que disfrutes TiviPlay!
```

Antes de cerrar, comprueba:

1. La solicitud del cliente quedó resuelta o escalada con responsable.
2. Si hubo pago reportado, quedó registrado con `PENDIENTE CONFIRMACION` y el cliente sabe que falta la confirmación.
3. No le dijiste al cliente que su pago está confirmado.
4. Si quedó algo pendiente, lo registraste en la planilla de pendientes con fecha y hora.

Horario de atención tomado de la Guía de Bienvenida 2025: Dirección debe confirmar que sigue vigente.

## 4. Reproductores y configuración por dispositivo

Búsquedas frecuentes: reproductor, aplicación, app, XCIPTV, Smarters, Smarters Lite, Smarters Pro, NET IPTV, Fire Stick, Android, iPhone, Apple TV, Samsung, LG, Windows, link de descarga, URL servidor.

| Dispositivo | Reproductor | Cómo se instala | Datos que pide |
| --- | --- | --- | --- |
| Fire Stick | App TiviPlay (método actual, validado por Dirección) | Downloader → código `2865004` (sección 6) | REQUIERE EVIDENCIA: campos de acceso de la app TiviPlay |
| Fire Stick | XCIPTV | Downloader → `bit.ly/xciptvapk7` | URL, usuario, contraseña |
| Fire Stick | IPTV Smarters (segunda opción) | Downloader → `troypoint.com/smarters` | Xtream Codes API: Any name, username, password, URL |
| Celular o tablet Android | XCIPTV | Navegador → `bit.ly/xciptvapk7` | URL, usuario, contraseña |
| TV Android / Chromecast | XCIPTV | Downloader → `bit.ly/xciptvapk7` | URL, usuario, contraseña |
| iPhone / iPad | IPTV Smarters Lite | App Store | Xtream Code: Any name, username, password, URL |
| Apple TV | IPTV Smarters Lite | App Store | Any name, username, password, URL |
| PC Windows | IPTV Smarters | [iptvsmarters.com](https://www.iptvsmarters.com/) → Download Windows App | Any name, username, password, URL |
| TV Samsung | IPTV Smarters Pro | Tienda APPS | Any name, username, password, URL |
| TV Samsung | NET IPTV (versión paga) | Tienda APPS | Código en pantalla: enviar foto a Back Office para activación |
| TV LG | IPTV Smarters Pro | LG Content Store | Any name, username, password, URL |

Recomendaciones (Documento 6): internet de al menos 50 Mbps, preferir red Wi-Fi de 5 GHz, al menos 500 MB libres en el Fire Stick. Ante pausas: reiniciar el equipo, borrar caché de la app, hacer speedtest y actualizar la lista (UPDATE).

NET IPTV: después de 7 días la app pide un permiso del desarrollador (7 EUR cada 2 años, según el Documento 5). Dirección debe confirmar si el valor sigue vigente antes de informarlo.

El usuario y la contraseña de cada cliente los entrega Back Office por el canal autorizado. **Nunca** los copies en esta biblioteca, en grupos ni en documentos compartidos.

## 5. URL de configuración por panel

Búsquedas frecuentes: Panel 1, Panel 2, Panel 3, URL servidor, URL de configuración, host, DNS del reproductor, servidor caído, cambiar URL.

**Ruta de consulta:** `PANEL` → URL de configuración → reproductor / dispositivo → procedimiento.

1. Confirma con Back Office a qué panel pertenece la línea del cliente.
2. Copia una URL marcada **VALIDADO** de ese panel, completa: con `http://` o `https://` y con el puerto.
3. Escríbela en el campo **URL** del reproductor: XCIPTV (campo URL) o Smarters / Smarters Lite / Smarters Pro (Iniciar sesión con Xtream Codes API → campo URL). Pasos por dispositivo en la sección 4; Fire Stick en la sección 6.
4. Si el cliente no conecta, prueba la siguiente URL **VALIDADO** del mismo panel. No mezcles URL de paneles distintos.
5. Nunca uses una URL marcada **REQUIERE EVIDENCIA**: su escritura no está confirmada.
6. Usuario y contraseña del cliente: los entrega Back Office. Nunca los escribas en esta guía ni en grupos.

Las URL vigentes se muestran desde la configuración local de la intranet, que mantiene Dirección a partir de su evidencia (pizarra operacional). Si una URL cambia, Dirección actualiza esa configuración; esta guía no se modifica.

### 5.1 Panel 1

```endpoints 1
```

### 5.2 Panel 2

```endpoints 2
```

### 5.3 Panel 3

```endpoints 3
```

### 5.4 Qué no es una URL de configuración

- La dirección de **inicio de sesión del panel de revendedor** (la que usa Back Office para crear o renovar líneas) **no** es la URL del cliente. Es un acceso administrativo `RESTRINGIDO`: nunca se envía a un cliente ni se publica aquí.
- Las URL de configuración son `OPERACIONAL COMPARTIBLE`: solo indican el servidor al que se conecta el reproductor y no dan acceso administrativo.

## 6. Fire Stick → Downloader → código TiviPlay

Búsquedas frecuentes: Fire Stick, Fire TV, Amazon, Downloader, código, 2865004, instalar TiviPlay, modo desarrollador.

**Paso 1 — Activar modo desarrollador (obligatorio)**

1. En el menú de inicio, entra a Configuración ⚙️ → Mi Fire TV → Acerca de (About).
2. Ubícate sobre «Fire TV Stick» y presiona OK varias veces hasta que aparezca «Ya eres desarrollador».
3. Regresa una vez y entra a Opciones para desarrolladores.
4. Activa en ON: Depuración ADB y Apps de origen desconocido.

**Paso 2 — Instalar Downloader**

1. Presiona Home (casita) → Buscar 🔎 → escribe DOWNLOADER.
2. Selecciona Obtener o Instalar, luego Abrir y acepta los términos.

**Paso 3 — Instalar la app TiviPlay con el código**

1. En Downloader, ubícate en el campo donde dice GO y presiona OK para abrir el teclado.
2. Escribe el código:

```mensaje
2865004
```

3. Selecciona GO, espera la descarga y selecciona Install → Abrir.
4. Si Downloader pide permisos, entra a Configuración y habilítalos.

**Paso 4 — Configurar el servicio:** REQUIERE EVIDENCIA. Dirección debe documentar qué datos pide la app TiviPlay. Mientras tanto, usa los datos que entregue Back Office.

**Alternativas documentadas (si el código no funciona):** XCIPTV con `bit.ly/xciptvapk7` o IPTV Smarters con `troypoint.com/smarters`, siguiendo los mismos pasos 1 y 2.

Estado del código `2865004`: **VALIDADO COMO REFERENCIA OPERACIONAL** (evidencia fotográfica de Dirección, 22/10/2026). Propiedad o control del servidor al que redirige el código: **REQUIERE EVIDENCIA**. No informes al cliente a quién pertenece ese servidor.

## 7. AT&T ActiveArmor bloquea el inicio de sesión

Búsquedas frecuentes: AT&T, ActiveArmor, Smart Home Manager, Privacy Threat Blocked, Allow Access, Security exceptions, error de inicio de sesión, no deja entrar, bloqueo.

**Cuándo aplica:** el cliente usa servicios AT&T (Wi-Fi residencial AT&T o una conexión protegida por AT&T ActiveArmor) y presenta un error de inicio de sesión en la aplicación. Aplica **únicamente cuando existe evidencia de un bloqueo de ActiveArmor** (una alerta o un evento de bloqueo que coincide con la hora del intento). No lo uses como explicación automática de cualquier error de inicio de sesión.

> **Advertencia de seguridad:** ActiveArmor puede bloquear esta conexión porque detecta información de autenticación transmitida sin cifrar. Permitir la excepción reduce esa protección específicamente para ese acceso. El cliente debe decidir si desea autorizarlo. No afirmes que la conexión es segura ni que «no pasa nada».

**Opción 1 — Permitir desde la notificación de bloqueo**

1. Pide al cliente que reproduzca el problema intentando ingresar nuevamente desde la aplicación.
2. Que revise las notificaciones del teléfono.
3. Que busque una alerta de AT&T ActiveArmor (o del ecosistema AT&T) sobre una página o conexión bloqueada. En la evidencia aparece como `Privacy Threat Blocked`.
4. Que abra la alerta.
5. Que revise que la hora del bloqueo coincida con su intento de inicio de sesión.
6. Que revise el detalle del evento bloqueado.
7. Si reconoce que el evento corresponde al acceso que acaba de intentar, que use la opción para permitir el acceso (`Allow Access`) o agregarlo a `Security exceptions`. El nombre exacto puede variar según la versión de la aplicación.
8. Que confirme que ActiveArmor indica que el acceso quedó permitido. En la evidencia aparece `This website has been allowed`.
9. Que vuelva a la aplicación TiviPlay o al reproductor que usa.
10. Que intente nuevamente el inicio de sesión.

**Opción 2 — AT&T Smart Home Manager** (principalmente cuando el problema ocurre conectado al Wi-Fi residencial administrado por AT&T)

1. Abrir la aplicación AT&T Smart Home Manager.
2. Entrar a la sección de mensajes, actividad o seguridad de la red. Según la versión puede aparecer como Message Center, Network, Security u otra sección equivalente.
3. Buscar el evento de bloqueo reciente que coincida con la hora en que falló el inicio de sesión.
4. Abrir el evento.
5. Verificar que se trate del bloqueo producido durante el intento que acaba de realizar.
6. Si corresponde a ese acceso, usar la opción disponible para permitirlo o agregarlo a las excepciones.
7. Confirmar que el evento o sitio aparezca permitido dentro de las excepciones de seguridad, cuando la aplicación lo muestre.
8. Regresar a la aplicación TiviPlay o al reproductor.
9. Intentar nuevamente el inicio de sesión.

**Mensaje para el cliente**

```mensaje
Si estás conectado a una red AT&T, revisa si ActiveArmor generó una alerta de bloqueo justo cuando intentaste ingresar. Abre esa alerta y verifica si corresponde al acceso que acabas de realizar. Si deseas autorizarlo, ActiveArmor puede darte la opción de permitir ese acceso o agregarlo a las excepciones de seguridad. Después intenta ingresar nuevamente. Ten presente que ActiveArmor puede mostrar una advertencia de seguridad antes de permitir la excepción.
```

**Qué no hacer**

- No envíes al cliente la URL completa que muestra el bloqueo, ni usuarios, contraseñas o datos de acceso. Si el cliente comparte una captura del bloqueo, no la reenvíes ni copies su contenido: la URL bloqueada puede incluir sus datos de acceso.
- No pidas al cliente desactivar completamente ActiveArmor ni las protecciones generales de su red.
- No uses VPN ni cambios de DNS como primera solución.
- La acción se limita a la excepción específica identificada durante el intento del cliente.

**Cuándo escalar:** si no aparece ninguna alerta o evento de bloqueo, o si después de permitir el acceso el inicio de sesión sigue fallando, escala el caso a Dirección con: operador de internet, dispositivo, app y hora.

## 8. Información que todavía requiere evidencia

| Tema | Estado | Qué falta | Qué hacer mientras tanto |
| --- | --- | --- | --- |
| Nombres exactos de los menús de AT&T Smart Home Manager (sección 7, opción 2) | REQUIERE EVIDENCIA | Captura de la aplicación | Buscar la sección equivalente de mensajes, actividad o seguridad; no inventar nombres de menú. |
| Dominios de lectura dudosa en la pizarra (por panel, sección 5) | REQUIERE EVIDENCIA | Confirmación carácter por carácter de Dirección | Usar solo las URL VALIDADO del mismo panel. |
| Propiedad del servidor de descarga del código 2865004 | REQUIERE EVIDENCIA | Confirmación de Dirección | Usar el código; no afirmar a quién pertenece el servidor. |
| Campos de acceso de la app TiviPlay (Fire Stick) | REQUIERE EVIDENCIA | Captura o instructivo de la pantalla de ingreso | Usar los datos que entrega Back Office. |
| Horario de atención y valor de NET IPTV | PENDIENTE DE VALIDACIÓN | Confirmación de Dirección | Usar el horario de la Guía 2025 hasta que Dirección indique otro. |

## 9. Fuentes y clasificación

| Fuente | Uso en esta guía | Clasificación |
| --- | --- | --- |
| Texto de apoyo TiviPlay Latino (2023) | Tono, espera, horario y despedida | OPERACIONAL COMPARTIBLE, salvo la plantilla «Confirmación de pagos», que contradice S0 y fue reemplazada |
| Guion cliente nuevo (11/2025) | Dispositivos compatibles | OPERACIONAL COMPARTIBLE |
| Documento 5 · Instructivo de instalaciones (28/02/2026) | Pasos de instalación y enlaces de descarga | OPERACIONAL COMPARTIBLE |
| Documento 6 · Servicio técnico (28/02/2026) | Recomendaciones y pausas | OPERACIONAL COMPARTIBLE |
| Documento 7 · Funciones por turno (28/02/2026) | Llamada a los 15 minutos; créditos solo con pago confirmado | OPERACIONAL COMPARTIBLE |
| LINKS DE DESCARGA | Enlaces de XCIPTV, Smarters y Windows | OPERACIONAL COMPARTIBLE |
| Contrato S0 v0.3 | Regla de pagos | Fuente canónica (gobierno interno) |
| Procedimiento AT&T ActiveArmor de Jorge y 3 capturas aportadas por Dirección (23/10/2026) | Sección 7 | OPERACIONAL COMPARTIBLE; las capturas no se incorporan porque contienen datos de acceso de un cliente |
| INSTALACIONES ESCRITAS | No se usa: contiene servidor y usuario reales | RESTRINGIDO |
| Documento 4 · Inventario de paneles y resellers | No se usa: contiene accesos administrativos | RESTRINGIDO |
| Manual de cobro (PDF) | No se usa: contiene datos bancarios | RESTRINGIDO |
