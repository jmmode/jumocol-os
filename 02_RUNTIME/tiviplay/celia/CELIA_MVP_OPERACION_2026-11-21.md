# CELIA — Plan operativo MVP y bitácora de integración
Fecha: 2026-11-21
Proyecto: TiviPlay Latino / JUMOCOL OS
Estado: prototipo funcional en pruebas, NO lanzamiento público.

## Evidencia verificada
- Agente ElevenLabs: CELIA | TiviPlay Latino | Prototipo. Tool `tiviplay_consultar_cliente` conectada.
- n8n: workflow `TIVIPLAY_CONSULTAR_CLIENTE` publicado. Secuencia Webhook POST (Header Auth) → Google Sheets Get Row(s) → Edit Fields → Respond to Webhook.
- Archivo: GESTION_DIA_PAGOS_2026_TIVIPLAY; hoja BASE GENERAL. Consulta exacta por CLIENTE; encabezados fila 1 y primera fila de datos 3 (estructura observada 2026-11-21).
- Conversación de prueba: llamada ElevenLabs a `tiviplay_consultar_cliente` marcada Succeeded; respondió plan, pantallas, método y fecha.
- Herramienta únicamente consulta por nombre exacto, devuelve subconjunto comercial. No modifica ni registra nada.

## Problemas observados
1. Prompt inicial afirmaba que no existía acceso a n8n: desactualizado. Se corrigió directamente en ElevenLabs el 2026-11-21.
2. Falta conocimiento operativo sobre instalación, compatibilidad, soporte, precios y pagos vigentes; el agente deriva demasiado.
3. No existe herramienta de credenciales técnicas ni catálogo panel→URL.
4. No existe herramienta de registro/seguimiento de solicitudes.
5. No hay fuentes de EPG/parrilla en tiempo real; prohibido inventar horarios.
6. Ante errores de búsqueda o nombres ambiguos no hay fallback por teléfono/correo.

## Prioridades de implementación
P0: Probar nuevo prompt con escenarios reales de Fire Stick, caché/datos, pagos y venta.
P1: Base de conocimiento versionada: instalaciones Fire Stick, Android/iOS, Samsung/LG, IPTV Smarters; flujos soporte; datos públicos; métodos de pago y precios CONFIRMADOS con fechas/moneda.
P1: Endpoint `consultar_cliente` con identificadores nombre/teléfono/correo, coincidencias y diferenciación de identidad.
P1: Herramienta separada `consultar_acceso_tecnico`: consulta usuario, clave, panel y URL en función del registro; respuesta controlada, sin almacenar secretos en GitHub.
P1: Herramienta `registrar_solicitud`: categoría, cliente, dispositivo, alcance, información faltante, estado, responsable. No afirmar que se registró si no existe confirmación de backend.
P2: WhatsApp de pruebas con número independiente, habilitando el canal compatible de ElevenLabs y revisando restricciones de traspaso humano antes de uso real.
P2: Pruebas de punta a punta y criterios de salida.

## Matriz de intenciones y respuesta esperada
| Intención | Acción de Celia | Fuente requerida | Éxito |
|---|---|---|---|
| Consulta plan/pantallas/vencimiento | Buscar registro y responder | BASE GENERAL | Datos coinciden, sin inventar |
| Intermitencias | Diagnóstico dispositivos/canales/series; limpiar caché; reinicio; seguimiento | Manual soporte | Una pregunta útil a la vez |
| Borrar datos Fire Stick | Advertir que borra sesión; recuperar acceso antes de borrar | Manual + herramienta técnica | Reingreso comprobado |
| Nuevo Fire Stick | Downloader código autorizado, instalar, abrir, entrar con credenciales | Manual instalación + herramienta técnica | Menú canales/series/películas visible |
| iPhone/Android | Instrucciones específicas por sistema | Manual de instalación verificado | Inicio exitoso |
| Usuario/contraseña/URL | Consultar panel correcto y entregar según canal autorizado | Fuente técnica restringida | Datos correctos |
| Pago/comprobante | Agradecer, gestionar registro si hay herramienta; no afirmar validación | Facturación / registro | Estado confirmado |
| Planes/promociones | Cotizar solo catálogo vigente y aprobado | Catálogo comercial | Moneda, pantallas, vigencia |
| Agregar pantalla | Identificar plan, cotizar o registrar solicitud | Catálogo + tickets | Siguiente acción concreta |
| Solicitar película/serie | Capturar título exacto/año/temporada y registrar | Tickets | Identificador de ticket |
| Guía y horarios | Consultar EPG actualizado si existe; no inventar | EPG | Canal, fecha y hora confirmados |

## Operación y seguridad mínimas
- Usar número de pruebas, sin clientes reales hasta validar mecanismos adecuados de consulta/entrega de credenciales y registro.
- La búsqueda por nombre NO verifica al titular; no entregar contraseñas por simple afirmación de identidad.
- No guardar tokens de webhook, contraseñas, comprobantes o datos personales en GitHub ni en capturas.
- Rotar secretos expuestos y utilizarlos como credenciales, no variables en prompt.
- Separar consulta comercial y técnica; restringir respuestas por intención.
- Registrar errores y casos inconclusos para revisión de asesores.

## Variables pendientes de confirmar en fuentes aprobadas
- Tarifas vigentes por país/moneda/pantallas.
- Promociones oficialmente autorizadas y fechas. No reutilizar promociones históricas vencidas.
- Datos de pago/medios autorizados.
- Tabla panel→URL y credenciales por cuenta.
- Enlaces de instalación iOS/Android/Samsung/LG vigentes.
- Políticas de escalamiento humano y WhatsApp Business.
