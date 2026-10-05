# DEC-2026-08-26-005 - Funnel Comercial de Landing Page

> **Estado:** Vigente como decisión de origen. Complementada por `DEC-2026-08-26-008`, que añade Handoff como etapa explícita y formaliza los gates `payment_confirmed` y `handoff_complete`.

## Objetivo

Formalizar la primera vista operativa del producto `Landing Page Profesional` dentro de `JUMOCOL Operations Intelligence`.

## Propósito

Hacer visible el recorrido comercial desde la captación del lead hasta el handoff operacional, sin convertir la intranet en CRM ni presentar clientes, resultados o conversiones inexistentes.

## Alcance

La decisión autoriza:

- Crear la ruta `/marketing-comercial/landing-page`.
- Habilitar su navegación desde el bloque `Landing Page` del Command Center.
- Extender el provider de fixtures y su contrato con un snapshot comercial específico.
- Representar las etapas Nuevo lead, Contactado, Diagnóstico, Información recibida, Propuesta, Negociación, Ganado, Pago y Onboarding.
- Preparar un modelo tipado de oportunidad sin cargar registros ficticios.
- Mostrar canales, métricas sin conexión, backlog y el handoff hacia Operaciones / Clientes Web.

La decisión no autoriza:

- Crear un CRM, base de datos o fuente paralela.
- Capturar o persistir formularios.
- Conectar Google Ads, Meta, WhatsApp, Drive, Sheets, CRM u otras API.
- Implementar autenticación, agentes, automatizaciones o despliegue.
- Crear el módulo completo de Clientes Web.

## Principios

- Los fixtures permanecen fuera de los componentes visuales.
- La ruta lee el snapshot desde un Server Component y el provider vigente.
- Los conteos por etapa se derivan de la colección de oportunidades; no se incrustan en la interfaz.
- La colección permanece vacía hasta disponer de una fuente autorizada.
- El valor de conversión permanece pendiente cuando no existe base de cálculo.
- Estados y limitaciones se expresan con texto y color.

## Governance

### Ruta y ownership de datos

La ruta implementada es:

`06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src/app/(intranet)/marketing-comercial/landing-page/page.tsx`

El contrato de lectura se amplía en `src/server/data/contracts.ts` con `marketingCommercial.getLandingPageSnapshot()`. La implementación vigente continúa siendo exclusivamente `fixtures` y no persiste datos.

### Clasificación de evidencia

| Clasificación | Contenido | Tratamiento |
| --- | --- | --- |
| `HECHO_REPORTADO` | Producto, precio desde US$350, objetivo, estado activo, Google Ads como prioridad prevista y conversión principal | Se registran en el fixture local |
| `DEFINICION_OPERATIVA` | Propósito, entrada, avance y próxima acción de las nueve etapas | Se modelan como contrato de proceso para revisión futura |
| `INFORMACION_NO_DISPONIBLE` | Oportunidades, clientes, métricas reales, conversión, atribución y conexión CRM | Se representan con colección vacía, cero o pendiente según corresponda |

### Contrato de oportunidad futura

Cada oportunidad queda preparada para contener:

- `id`.
- `company`.
- `contact`.
- `phone`.
- `email`.
- `product`.
- `value`.
- `currency`.
- `origin`.
- `responsible`.
- `stage`.
- `createdAt`.
- `nextAction`.
- `nextActionDate`.
- `notes`.
- `paymentStatus`.

Los nombres internos siguen convenciones TypeScript en inglés y las etiquetas visibles permanecen en español.

### Frontera operacional

El pago confirmado cierra la responsabilidad comercial principal. El handoff abre la responsabilidad de `Operaciones`, con destino futuro `Clientes Web` y resultado esperado `Entrega y Soporte`.

La secuencia conceptual es:

`Lead → Venta → Pago → Handoff → Proyecto de cliente`

La ruta futura `/operaciones/clientes-web` queda documentada como punto de extensión, pero no se implementa en esta decisión.

## Riesgos

- El fixture no debe convertirse en registro operativo ni fuente de verdad.
- Un conteo cero significa ausencia de datos conectados, no ausencia certificada de actividad comercial externa.
- La etapa `Ganado` y la confirmación de pago requieren reglas y evidencias antes de operar con datos reales.
- La atribución de canales y el cálculo de conversión no deben inferirse sin una fuente autorizada.
- El handoff necesita ownership, campos obligatorios y criterios de aceptación antes de automatizarse.

## Evolución futura

1. Aprobar el formulario de diagnóstico y la información mínima del cliente.
2. Definir una propuesta estándar y el contrato formal de handoff.
3. Seleccionar la fuente autorizada de oportunidades sin duplicar datos.
4. Implementar Clientes Web como módulo independiente cuando su alcance sea aprobado.
5. Conectar canales y calcular métricas solo después de definir identidad, permisos y reglas de atribución.
