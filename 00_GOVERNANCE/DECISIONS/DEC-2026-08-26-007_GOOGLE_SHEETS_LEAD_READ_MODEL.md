# DEC-2026-08-26-007 - Modelo de lectura de leads desde Google Sheets

## Objetivo

Autorizar la primera integración de datos comerciales reales en `JUMOCOL Operations Intelligence` mediante lectura controlada de la fuente `JUMOCOL_LEADS_PILOTO_V0_6`.

## Propósito

Sustituir el pipeline vacío de Landing Page por una vista operativa basada en la fuente autorizada, sin crear una base paralela, modificar Google Sheets ni exponer credenciales o datos personales innecesarios.

## Alcance

La decisión autoriza:

- Leer la pestaña `LEADS` del spreadsheet autorizado mediante Google Sheets API.
- Usar una cuenta de servicio con permiso `Viewer` y alcance OAuth `spreadsheets.readonly`.
- Crear el contrato server-side `LeadRepository` con `listLeads()`, `getLeadById()` y `getLeadSummary()`.
- Mapear las columnas existentes a un dominio canónico sin modificar la Sheet.
- Mostrar en `/marketing-comercial/landing-page` datos reales y métricas derivables de la fuente.
- Mantener fixtures para áreas y módulos que todavía no tienen fuentes autorizadas.

La decisión no autoriza:

- Crear, editar o eliminar filas en Google Sheets.
- Copiar el JSON de credencial al repositorio.
- Exponer secretos mediante `NEXT_PUBLIC_`, respuestas al navegador o logs.
- Implementar CRM, Google Ads, Meta, WhatsApp, automatizaciones, agentes o despliegue.
- Calcular propuestas, ventas, recaudo, conversión a venta o CAC sin evidencia suficiente.

## Principios

- Google Sheets continúa siendo la fuente autorizada; la intranet es una capa de lectura.
- La UI depende del contrato de dominio y no conoce autenticación, rangos ni detalles de Google APIs.
- El repositorio y la configuración sensible se ejecutan exclusivamente server-side.
- Los encabezados de `LEADS!A:X` constituyen un contrato de entrada validado antes del mapeo.
- Teléfono, correo, necesidad, mensaje y consentimiento permanecen disponibles en el dominio, pero no se serializan a la vista actual.
- Los errores externos se convierten en mensajes sanitizados y no imprimen respuestas completas de Google.

## Governance

### Fuente y acceso

| Elemento | Decisión |
| --- | --- |
| Spreadsheet | `JUMOCOL_LEADS_PILOTO_V0_6` |
| Pestaña | `LEADS` |
| Rango de lectura | `A:X` |
| Permiso | Viewer |
| Alcance OAuth | `https://www.googleapis.com/auth/spreadsheets.readonly` |
| Credencial local | Fuera de `JUMOCOL_SYSTEM_OS` |
| Persistencia propia | No autorizada |

### Contrato de estado

El mapeo aprobado inicialmente es:

| Estado de fuente | Estado canónico | Etapa visual |
| --- | --- | --- |
| `NUEVO` | `NEW_LEAD` | `new-lead` |
| Otro o vacío | `UNKNOWN` | `unknown` |

Un estado futuro no se convierte por similitud ni inferencia. Permanece como desconocido hasta aprobar un mapeo explícito.

### Métricas

La fuente permite calcular total de leads, leads nuevos, leads provenientes de website, leads por producto, leads con UTM, leads con owner y leads con próxima acción.

Propuestas, ventas, recaudo, conversión a venta y CAC permanecen como `INFORMACION_NO_DISPONIBLE` porque `LEADS` no contiene evidencia suficiente para calcularlos.

## Riesgos

- Un cambio no coordinado en los encabezados puede romper el contrato de lectura.
- El acceso local depende de mantener la cuenta de servicio activa y la Sheet compartida como Viewer.
- La ruta todavía no tiene autenticación de usuario; la aplicación debe permanecer en entorno local.
- La presencia de un lead no acredita contacto, propuesta, venta, pago ni recaudo.
- Un estado nuevo requiere decisión de mapeo antes de incorporarse al funnel.

## Evolución futura

1. Definir ownership y reglas de actualización antes de autorizar cualquier escritura.
2. Incorporar autenticación y permisos de usuario antes de exponer la intranet fuera del entorno local.
3. Formalizar estados adicionales solo cuando aparezcan en la fuente y exista evidencia operacional.
4. Conectar otras métricas únicamente desde fuentes autorizadas, sin duplicar información.
5. Evaluar un CRM después de aprobar identidad, procesos, contratos de salida y trazabilidad.
