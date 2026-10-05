# DEC-2026-08-26-002 - Capa de Aplicacion para la Intranet

## Objetivo

Formalizar la creacion de una capa de aplicacion propia para `JUMOCOL_SYSTEM_OS`.

## Proposito

Permitir que el sistema documental y de gobernanza evolucione hacia una intranet navegable sin mezclar codigo de producto con governance, contexto, runtime documental, areas funcionales, automatizacion ni fuentes externas.

## Alcance

La decision autoriza:

- Crear `06_APPLICATIONS/` como frontera para aplicaciones ejecutables.
- Crear `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/` como ruta canonica de la intranet.
- Usar Next.js 16, React 19, TypeScript, Tailwind CSS, ESLint y pnpm.
- Implementar un shell navegable y cinco areas funcionales.
- Usar fixtures exclusivamente visuales, locales y no persistentes durante el MVP.
- Iniciar el modulo `Marketing y comercial` como primer Command Center.

La decision no autoriza:

- Modificar, copiar o importar codigo desde `tmp/JUMOCOL_COM`.
- Conectar Google Sheets, Drive, CRM, Meta, Google Ads, WhatsApp ni otras API.
- Implementar agentes, automatizaciones, autenticacion o persistencia.
- Desplegar la intranet.

## Principios

- La aplicacion consume contratos de datos; no se convierte en una segunda fuente de verdad.
- Las credenciales y futuros adaptadores externos permaneceran del lado servidor.
- La navegacion de la intranet no reorganiza las carpetas documentales existentes.
- Cada nueva integracion requerira fuente autorizada, ownership, alcance y validacion.
- Los fixtures del MVP deben identificarse como datos de demostracion.

## Governance

### Decision

Crear una nueva capa raiz `06_APPLICATIONS/` y alojar la intranet en:

`C:\Users\USUARIO\Documents\JUMOCOL_SYSTEM_OS\06_APPLICATIONS\JUMOCOL_OPERATIONS_INTELLIGENCE`

### Areas funcionales aprobadas

1. Operaciones.
2. Finanzas y contabilidad.
3. Personas y contratacion.
4. Marketing y comercial.
5. Tecnologia e inteligencia artificial.

### Separacion de JUMOCOL_COM

`JUMOCOL_COM` continua siendo exclusivamente la web publica. No existe dependencia de codigo, runtime, variables de entorno, datos ni despliegue entre la web publica y la intranet.

### Arquitectura de datos

La primera version utiliza fixtures no persistentes. Las futuras lecturas de fuentes autorizadas se implementaran mediante contratos y proveedores del lado servidor, sin llamadas directas desde componentes de interfaz.

## Riesgos

- El repositorio no tiene un baseline Git confirmado antes de esta implementacion.
- `JUM-SYS-001` no esta persistido localmente y debe incorporarse antes de implementar agentes o integraciones profundas.
- La ausencia temporal de autenticacion impide usar datos reales o exponer la aplicacion fuera del entorno local.
- Las areas de interfaz agregan vistas funcionales que no deben confundirse con una reorganizacion de `03_AREAS/`.

## Evolucion futura

1. Validar el MVP local con lint, build y navegacion de las cinco areas.
2. Formalizar autenticacion, roles y permisos antes de usar datos reales.
3. Persistir y versionar `JUM-SYS-001`.
4. Definir contratos de lectura para cada fuente autorizada.
5. Implementar modulos profundos de manera incremental y auditada.
