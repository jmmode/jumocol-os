# Taxonomía inicial de casos — TiviPlay

## Canal de entrada

`atencion-cliente`: clasificar la solicitud, recuperar contexto previo, elegir siguiente acción y registrar resultado.

| Código | Dominio | Intención típica | Salida operativa |
|---|---|---|---|
| SOP-INST | Soporte técnico | Instalar aplicación | Guía por dispositivo y captura útil |
| SOP-ACC | Soporte técnico | Ingresar, playlist o credenciales | Configuración del panel confirmado |
| SOP-SEN | Soporte técnico | Señal, congelamiento o canal | Aislar alcance, red y dispositivo |
| SOP-COMP | Soporte técnico | Compatibilidad del equipo | Alternativa compatible verificada |
| VEN-INF | Ventas | Solicitar planes y precios | Cotización con tarifario aprobado |
| VEN-ACT | Ventas | Activación o prueba | Gestión según política vigente |
| COB-COMP | Cobros | Envía comprobante de pago | Remitir a verificación y gestionar actualización inmediata |
| COB-REN | Cobros | Renovación y vencimiento | Gestión de renovación con tarifa aprobada |
| RET-INC | Retención | Inconformidad o cancelación | Comprender motivo y proponer solución verificable |
| CONT-SOL | Contenido | Canal, película o episodio | Registrar contenido exacto y verificar |

## Estados sugeridos para fichas documentales

`recibido` · `clasificado` · `en-gestion` · `pendiente-cliente` · `escalado` · `resuelto-confirmado` · `cerrado-sin-confirmacion`.

Son categorías **documentales propuestas**, no estados implementados en CRM.

## Gobierno

Cada protocolo debe incluir responsable, versión, fecha, aprobación y restricciones. No inferir valores de tarifas ni servidores a partir de otros clientes.
