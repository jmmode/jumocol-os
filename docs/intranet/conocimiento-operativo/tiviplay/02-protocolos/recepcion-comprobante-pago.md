# Protocolo: recepción de comprobantes de pago

- **Servicio:** TiviPlay
- **Fecha de aprobación operativa:** 2026-11-14
- **Tipo:** COB-COMP
- **Estado:** aprobado, según instrucción operativa
- **Responsable de ejecución:** asesor que recibe el comprobante

## Disparador

El cliente envía una imagen o comprobante de pago de su suscripción.

## Mensaje aprobado (ejemplo)

> Muy buenos días, señora Olga. Le saluda Juan del equipo de TiviPlay. 💙
>
> Muchas gracias por enviarnos su comprobante de pago por **15 USD**.
>
> Su comprobante será enviado al departamento de verificación. **Ahora mismo procederemos a actualizar su suscripción.**
>
> Agradecemos su confianza en TiviPlay y estamos atentos a cualquier inquietud.

## Reglas

1. Saludar al comienzo, sin repetir presentación si ya existe saludo en la conversación.
2. Personalizar nombre, asesor, horario, valor y moneda **solo con datos comprobados**.
3. Enviar el comprobante al departamento de verificación como gestión interna.
4. Proceder **inmediatamente** con la gestión de actualización de suscripción; no decir al cliente «una vez validado».
5. No afirmar que ya quedó actualizada si todavía no existe confirmación.
6. Notificar solo si surge alguna novedad de verificación.
7. **No incluir mensajes de referidos, meses gratis ni cierres publicitarios adicionales.**

## Plantilla

> [Saludo], [tratamiento y nombre]. Le saluda [asesor] del equipo de TiviPlay. 💙
>
> Muchas gracias por enviarnos su comprobante de pago por **[valor y moneda]**.
>
> Su comprobante será enviado al departamento de verificación. **Ahora mismo procederemos a actualizar su suscripción.**
>
> Agradecemos su confianza en TiviPlay y estamos atentos a cualquier inquietud.

## Secuencia interna

Comprobante recibido → lectura de valor → mensaje al cliente → envío a verificación → gestión inmediata de actualización → aviso solo ante novedades.
