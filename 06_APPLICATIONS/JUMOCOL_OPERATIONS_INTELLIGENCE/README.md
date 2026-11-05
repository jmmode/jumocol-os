# JUMOCOL Operations Intelligence

## Objetivo

Proveer la intranet operacional navegable de `JUMOCOL_SYSTEM_OS`.

## Proposito

Presentar areas, modulos, indicadores y proximas acciones en una interfaz comun sin reemplazar las fuentes autorizadas ni mezclar la intranet con la web publica `JUMOCOL_COM`.

## Alcance

El MVP incluye:

- Shell responsive de intranet.
- Navegacion por cinco areas funcionales.
- Vistas base para Operaciones, Finanzas y contabilidad, y Personas y contratacion.
- Command Center de Tecnología e inteligencia artificial con stack, arquitectura, integraciones, flujos E2E, decisiones, arquitectura IA y roadmap.
- Command Center de Marketing y comercial.
- Workflow diario de TiviPlay Marketing con runtime, backlog y niveles de automatización documentados.
- Funnel comercial de Landing Page con diez etapas, leads reales de Google Sheets, métricas respaldadas por fuente, backlog y handoff operacional gobernado por `payment_confirmed`.
- Ciclo operacional de Clientes Web con catorce etapas, veinte estados canónicos, cinco gates, onboarding, fases, contratos Payment/Handoff, criterios de entrega y pipeline sin proyectos ficticios.
- Gestión de pagos TiviPlay con lectura local del Excel autorizado, normalización, conciliación exacta, KPIs, filtros cruzados, auditoría y exportación saneada.
- Command Center de TiviPlay con los seis componentes del blueprint, Contexto como única capacidad habilitada y cinco scaffolds identificados como no implementados.
- Visor server-side y read-only del Contexto Maestro canónico, con allowlist cerrada, tabla de contenido, estados de evidencia y aviso de borrador.
- Próximo milestone `Formularios Operacionales + Persistencia Estructurada` documentado, sin formularios ni escrituras implementadas.
- Fixtures visuales para módulos sin fuente autorizada, repositorio de leads Google Sheets de solo lectura y adaptador Excel TiviPlay de solo lectura.
- Identidad corporativa oficial aplicada al shell, cabecera móvil, portada y Command Center.

No incluye autenticacion, agentes, automatizaciones, persistencia propia, escritura sobre fuentes ni despliegue.

## Principios

- Server Components por defecto.
- Componentes cliente solo cuando la interaccion lo requiere.
- Navegacion y catalogos centralizados.
- Datos de demostracion identificados de forma visible.
- Futuros proveedores de datos aislados del lado servidor.
- Credenciales de Google Sheets limitadas al servidor y excluidas de Git.
- UI desacoplada mediante el contrato `LeadRepository`.
- Dominio canónico del ciclo de cliente separado de los detalles de persistencia y de los estados visuales de cada feature.
- Ninguna dependencia de `tmp/JUMOCOL_COM`.
- Activos de marca servidos únicamente desde `public/brand/`.

## Repositorio documental TiviPlay

- `src/server/documents/document-repository.ts` acepta únicamente identificadores registrados en una allowlist; no recibe rutas del navegador.
- La ruta física se resuelve de forma relativa al repositorio y nunca se serializa al cliente.
- `/operaciones/tiviplay/contexto` se fuerza a renderizado dinámico para releer el Markdown canónico en cada solicitud local.
- `next.config.ts` incluye el documento permitido en el trazado de salida para una futura etapa de empaquetado.
- No había renderer Markdown instalado. Se implementó un renderer mínimo en React para encabezados, párrafos, listas, tablas, citas y bloques de código; no usa `dangerouslySetInnerHTML` ni habilita HTML crudo.
- La fuente visible permanece `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md`.

## Identidad corporativa

- `src/config/brand.ts` centraliza el activo y la jerarquía `JUMOCOL / Operations Intelligence / Sistema Operativo Empresarial`.
- `src/app/globals.css` centraliza los tokens corporativos y de estado.
- `src/components/brand/brand-lockup.tsx` encapsula el uso responsive del logotipo con `next/image`.
- `public/brand/jumocol-logo-primary.png` es una copia íntegra del logotipo horizontal oficial; no se transforma ni se carga desde una ruta externa en ejecución.

## Governance

La aplicación está autorizada por `DEC-2026-08-26-002_APPLICATION_LAYER.md`, su identidad visual por `DEC-2026-08-26-003_CORPORATE_VISUAL_IDENTITY.md`, sus módulos operativos por las decisiones `DEC-2026-08-26-004`, `DEC-2026-08-26-005` y `DEC-2026-08-26-006`, la lectura real de leads por `DEC-2026-08-26-007_GOOGLE_SHEETS_LEAD_READ_MODEL.md`, el estándar del ciclo de cliente por `DEC-2026-08-26-008_CLIENT_OPERATIONAL_STANDARD.md`, el Command Center técnico por `DEC-2026-08-27-009_TECHNOLOGY_AI_COMMAND_CENTER.md` y el Command Center documental de TiviPlay por `DEC-2026-09-02-011_TIVIPLAY_DOCUMENTAL_COMMAND_CENTER.md`.

Comandos locales:

```powershell
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

## Acceso directo de Windows

- Acceso directo: `JUMOCOL OS` en el escritorio del usuario.
- Script de inicio: `scripts/windows/Start-JUMOCOL-OS.ps1`.
- URL local estable: `http://localhost:3000`.
- Comando vigente del proyecto: `pnpm dev`.

El iniciador resuelve la carpeta del proyecto a partir de su propia ubicación, comprueba Node.js y las dependencias, evita duplicar el servidor cuando JUMOCOL OS ya responde en el puerto `3000`, espera la disponibilidad de la aplicación y abre el navegador predeterminado. Si el puerto pertenece a otra aplicación, se detiene con un mensaje explícito.

Con las dependencias instaladas, el acceso directo ejecuta el binario local de Next.js que respalda `pnpm dev`; así no depende de una instalación global de `pnpm`. Si faltan dependencias, intenta restaurarlas con `pnpm` o Corepack y conserva `pnpm-lock.yaml` mediante `--frozen-lockfile`.

Para cerrar la intranet, cerrar la ventana `JUMOCOL OS - Servidor local` o presionar `Ctrl+C` dentro de ella. Para reiniciarla, cerrar esa ventana, esperar a que se libere el puerto `3000` y volver a abrir el acceso directo.

Si el proyecto cambia de ubicación, ejecutar desde la nueva ruta:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\Install-JUMOCOL-OS-Shortcut.ps1
```

Esto actualiza el acceso directo con la nueva ruta absoluta sin modificar la aplicación.

Ruta principal del primer modulo:

- `/marketing-comercial`
- `/marketing-comercial/tiviplay`
- `/marketing-comercial/landing-page`
- `/operaciones/clientes-web`
- `/operaciones/tiviplay`
- `/operaciones/tiviplay/contexto`
- `/operaciones/tiviplay/pagos`
- `/tecnologia-ia`

## Riesgos

- Los fixtures de los módulos no conectados no representan resultados reales y no deben usarse para decisiones.
- La presencia de un lead en Google Sheets no acredita contacto, propuesta, venta, pago ni recaudo.
- Un cambio de encabezados en `LEADS` requiere actualizar y validar el contrato de entrada.
- La aplicacion no debe exponerse fuera del entorno local antes de implementar autenticacion y permisos.
- Las futuras integraciones requieren contratos, ownership y fuentes autorizadas.

## Evolucion futura

1. Implementar autenticacion y control de acceso.
2. Persistir `JUM-SYS-001` como especificacion gobernada.
3. Incorporar proveedores de lectura autorizados.
4. Profundizar cada area y modulo sin duplicar fuentes.
5. Agregar agentes y automatizaciones solo despues de validar entradas, salidas y excepciones.
6. Implementar formularios y persistencia estructurada solo después de aprobar contratos, owners, permisos y auditoría.
