# DEC-2026-08-26-008 - Estándar operacional del ciclo de cliente

## Objetivo

Adoptar `JUM_OPS_STD_CLIENT_001` versión 1.0 como estándar operacional base del ciclo de cliente de JUMOCOL y alinear su representación conceptual en `JUMOCOL Operations Intelligence`.

## Propósito

Establecer una frontera verificable entre Comercial y Operaciones, definir gates mínimos y preparar el sistema para persistencia estructurada e integraciones futuras sin crear un CRM, una fuente de datos paralela o un motor de workflow prematuro.

## Alcance

La decisión autoriza:

- Incorporar el estándar sin alterar su contenido funcional en `03_AREAS/01_OPERACION/`.
- Mantener separados los dominios Lead, Sale, Payment, Handoff, Project, Onboarding, Production, QA, Delivery y Support.
- Añadir identificadores canónicos de estado, gates y eventos candidatos al dominio de la intranet.
- Alinear el funnel de Landing Page para que `payment_confirmed` habilite Handoff y `handoff_complete` habilite Proyecto / Onboarding.
- Ampliar `Clientes Web` como vista conceptual del ciclo posterior a la venta, sin registros ficticios.
- Documentar el próximo milestone `Formularios Operacionales + Persistencia Estructurada` y su propuesta multicanal.

La decisión no autoriza:

- Formularios operacionales ni escrituras desde la intranet.
- Crear pestañas, filas o un nuevo Workbook en Google Sheets.
- Implementar WhatsApp API, correo entrante, CRM, webhooks nuevos, bus de eventos o automatizaciones.
- Modificar `JUMOCOL_COM` o desplegar cambios.

## Principios

- `payment_reported` o un comprobante no equivalen a `payment_confirmed`.
- No hay Handoff sin `payment_confirmed`.
- No hay proyecto ni ejecución sin `handoff_complete`.
- No hay producción sin `onboarding_complete`.
- No hay entrega sin `qa_approved`.
- No hay cierre sin evidencia de entrega.
- Cada etapa debe tener owner y cada cambio crítico debe ser auditable.
- Una ampliación de alcance debe convertirse en change request, evolutivo o nuevo requerimiento.
- Google Sheets es un adaptador de persistencia, no el dominio del sistema.

## Governance

### Fuente normativa

El estándar adoptado se conserva en:

`03_AREAS/01_OPERACION/JUM_OPS_STD_CLIENT_001_Handoff_Onboarding_Ejecucion_Entrega.md`

Su versión continúa siendo `1.0`. La frase `Código sugerido` se conserva porque forma parte del documento fuente; la presente decisión formaliza `JUM_OPS_STD_CLIENT_001` como código vigente dentro del repositorio.

### Separación de capas

```text
Operations Intelligence
        ↓
Canonical JUMOCOL Domain
        ↓
Repository / Integration Layer
        ↓
Google Sheets u otro adaptador autorizado
```

`LeadRepository` y `GoogleSheetsLeadRepository` permanecen sin cambios. La lectura vigente de Landing Page sigue siendo server-side y read-only. Los estados y contratos nuevos son una representación conceptual independiente de la persistencia.

### Clasificación de la iteración

| Elemento | Estado |
| --- | --- |
| Estándar operacional | Aprobado y persistido |
| Estados canónicos y gates | Representados en dominio y UI |
| Proyectos / handoffs reales | `INFORMACION_NO_DISPONIBLE` |
| Formularios y persistencia estructurada | `PROPUESTA_NO_IMPLEMENTADA` |
| Captura WhatsApp / correo | `PROPUESTA_NO_IMPLEMENTADA` |
| Escritura en Google Sheets | No autorizada |
| Deploy | No autorizado |

## Riesgos

- Confundir una visualización conceptual con un registro operacional ejecutado.
- Marcar un pago como confirmado sin validación financiera independiente.
- Habilitar producción con onboarding incompleto o sin owner.
- Acoplar futuros formularios a columnas físicas de Google Sheets en lugar del dominio canónico.
- Capturar clics de WhatsApp como si fueran mensajes recibidos.
- Almacenar credenciales de clientes o secretos en campos abiertos.

## Evolución futura

1. Aprobar contratos de salida, ownership y validaciones de cada formulario.
2. Diseñar el Workbook propuesto y crear pestañas únicamente con autorización explícita.
3. Implementar repositorios de escritura idempotentes detrás de contratos de dominio.
4. Implementar captura multicanal separando clic, mensaje recibido y correo recibido.
5. Evaluar adaptadores Odoo, HubSpot, Salesforce, Zoho, APIs de clientes u otras bases sin reescribir la lógica operacional.
