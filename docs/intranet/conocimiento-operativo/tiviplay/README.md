# TiviPlay | Base documental de atención y operaciones

Estado: estructura inicial de documentación (14-11-2026).
Alcance: **solo archivos Markdown; no se crea módulo, interfaz, API, base de datos ni automatización de la intranet**.

## Arquitectura de atención

**Atención al cliente es la puerta de entrada única.** Desde ella se identifica la intención y se deriva hacia:
- Soporte técnico: instalación, acceso, reproducción y fallas.
- Ventas: información, planes, activación y conversión.
- Cobros y renovaciones: recaudo, recepción de comprobantes, verificación interna y actualización.
- Retención: continuidad, inconformidades y seguimiento, de forma transversal.

## Estructura documental

- `00-gobierno/`: reglas, taxonomía, estados y convenciones.
- `01-casos/`: fichas de casos anonimizadas, reproducibles y clasificadas.
- `02-protocolos/`: procedimientos autorizados y mensajes aprobados.
- `03-conocimiento/`: diagnóstico, criterios de decisión y preguntas frecuentes (por desarrollar).
- `04-evaluacion-agente/`: futuros ejemplos de entrenamiento, pruebas y criterios de calidad (por desarrollar).

## Flujo documental

Mensaje o captura → clasificación → identificación de intención → protocolo vigente → acción verificable → resultado → ficha de caso anonimizada → revisión/aprobación → reutilización.

## Reglas

1. Separar siempre **hecho observado**, **acción sugerida** y **resultado confirmado**.
2. No almacenar contraseñas, tokens, datos de pago completos, teléfonos ni información personal en GitHub.
3. Evitar prometer verificaciones, pagos, actualizaciones, relanzamientos o soluciones no confirmados.
4. Solo los protocolos aprobados pueden guiar respuestas comerciales y operativas.
5. En esta etapa no se entrena ni implementa ningún agente: se prepara conocimiento verificable.
6. No se altera la aplicación de intranet existente; esta carpeta es documentación versionada.

## Primera referencia formalizada

`02-protocolos/recepcion-comprobante-pago.md`: recepción de pagos y actualización inmediata de suscripción.
