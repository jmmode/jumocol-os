# DEC-2026-08-26-003 - Identidad Visual Corporativa de la Intranet

## Objetivo

Formalizar el uso de la identidad visual oficial de JUMOCOL SAS en `JUMOCOL Operations Intelligence`.

## Propósito

Unificar la presentación de la intranet con la marca corporativa sin crear una identidad paralela ni introducir una dependencia de ejecución con la web pública `JUMOCOL_COM`.

## Alcance

La decisión autoriza:

- Tomar como referencia visual los activos y estilos oficiales de `JUMOCOL_COM`.
- Copiar, sin transformar, el logotipo horizontal usado por la web pública a `public/brand/` de la intranet.
- Centralizar rutas de marca y jerarquía de producto en `src/config/brand.ts`.
- Centralizar colores corporativos y estados semánticos en `src/app/globals.css`.
- Aplicar la identidad al shell, la cabecera móvil, la portada y el Command Center de Marketing y Comercial.

La decisión no autoriza:

- Importar código, dependencias, configuración o runtime desde `JUMOCOL_COM`.
- Alterar, mover o sobrescribir los activos originales.
- Reconstruir, recolorear o modificar el logotipo.
- Desplegar la intranet.

## Principios

- La identidad corporativa se reutiliza; la arquitectura de las dos aplicaciones permanece separada.
- La intranet sirve sus activos únicamente desde su propio directorio `public/brand/`.
- Los colores se usan mediante tokens semánticos, no mediante valores dispersos en componentes.
- Los estados mantienen texto explícito y no dependen exclusivamente del color.
- Los acentos corporativos se emplean con moderación para conservar legibilidad.

## Governance

### Evidencia de origen

Directorio inspeccionado en modo lectura:

`D:\LIFE_OPERATING_SYSTEM (LIFE-OS)\02_ENTITIES\JUMOCOL_SAS\JUMOCOL_COM\public\brand`

Activos encontrados:

| Activo | Dimensiones | Clasificación | Decisión |
| --- | ---: | --- | --- |
| `jumocol-logo-primary.png` | 2638 x 900 px | Logotipo horizontal usado en la cabecera de `jumocol.com` | Copiar y usar |
| `jumocol-logo-horizontal.png` | 500 x 500 px | Composición cuadrada | No copiar; no es necesaria en el MVP |

El archivo copiado conserva el SHA-256 del original:

`4DA8105EA43B8C00E9B99CB3F6BB663524AD947F5C9D4BDF92BA42B9F2FC5132`

### Paleta verificada

Los valores proceden de la implementación pública inspeccionada y se mapean a tokens de la intranet:

| Token | Valor |
| --- | --- |
| `brand-background` | `#ffffff` |
| `brand-surface` | `#f3f7f9` |
| `brand-text` | `#111821` |
| `brand-muted` | `#5c6b78` |
| `brand-primary` | `#0069b5` |
| `brand-primary-dark` | `#073f68` |
| `brand-blue` | `#0069b5` |
| `brand-cyan` | `#9ed9ff` |
| `brand-green` | `#65b32e` |
| `brand-yellow` | `#f9bd16` |
| `brand-red` | `#ce1236` |
| `status-success` | `#2f7110` |
| `status-warning` | `#a66f00` |
| `status-error` | `#ce1236` |
| `status-info` | `#0069b5` |

### Jerarquía de producto

La interfaz presenta de forma consistente:

1. JUMOCOL.
2. Operations Intelligence.
3. Sistema Operativo Empresarial.

## Riesgos

- Los nombres de archivo de origen no describen con precisión su geometría; la variante seleccionada se verificó por dimensiones y por uso en la cabecera pública.
- Un futuro cambio de identidad en la web pública no se propagará automáticamente a la intranet; requerirá una actualización gobernada.
- Los activos de marca copiados deben conservar trazabilidad y no convertirse en una fuente editable alternativa.

## Evolución futura

1. Incorporar nuevas variantes solo cuando exista un caso de uso aprobado.
2. Mantener los tokens como contrato visual para nuevos módulos.
3. Añadir pruebas visuales automatizadas cuando exista una herramienta local autorizada y estable.
