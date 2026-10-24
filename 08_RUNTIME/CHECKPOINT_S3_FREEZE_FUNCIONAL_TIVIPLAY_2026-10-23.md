# CHECKPOINT — S3 · FREEZE FUNCIONAL DE LA ITERACIÓN (TiviPlay)

**Fecha:** 2026-10-23 (America/Bogota)
**Rama:** `wo-tivi-hoy-creditos-001`
**Commit de contenido publicado:** `5cae7b8` (Guía rápida de turno v1.2)
**Estado:** VALIDADO · FREEZE FUNCIONAL DE LA ITERACIÓN

## Publicación de la Guía rápida de turno v1.2 para OPERADOR

| Campo | Valor |
|---|---|
| Documento | `tiviplay-guia-rapida-turno` · `03_AREAS/01_OPERACION/TIVIPLAY/07_GUIAS/TIVIPLAY_GUIA_RAPIDA_ATENCION_Y_SOPORTE_V1.md` |
| Versión | 1.2 (fecha de corte 2026-10-23) |
| SHA-256 publicado | `1946fc7a40b81a4c55e84e6c470f829f73443289a5968901820a7bbd1c65efc7` |
| SHA-256 del archivo en `5cae7b8` | `1946fc7a40b81a4c55e84e6c470f829f73443289a5968901820a7bbd1c65efc7` (coincide) |
| Mecanismo | Control de publicación existente (ADMIN, estándar operativo 7/7) |
| Publicado por | `julian` (ADMIN) · 2026-10-24T03:34:26Z (22:34 America/Bogota del 23/10) |
| Referencia registrada | SHA-256 + «Estándar operativo 7/7 confirmado» |
| Autorización de Dirección | Solo esta versión exacta; no cubre versiones futuras. Cualquier cambio del archivo cambia el SHA-256 y retira la lectura de operadores hasta una nueva publicación. |

## Evidencia (intranet real, sesión de Dirección, 23/10/2026 ~23:10)

- Inventario documental: la guía figura como «VIGENTE Y APTO PARA OPERADOR». Documentos publicados para operadores: Guía rápida de turno, Documento 7 Funciones por Turno, Manual operativo — Lista de octubre.
- Manuales y procesos: los 8 accesos de Búsqueda rápida están enlazados (0 deshabilitados) y desaparece el aviso «los operadores aún no ven estos accesos».
- Destinos de los 8 accesos: 2.1, 3.2, 3.3, 3.5, 6, 4, 5 y 7 (AT&T ActiveArmor), validados en la WO-TIVI-S3-CONSOLIDACION.
- Usuarios: Heidi, Jorge y Manuela con rol OPERADOR, activos y con credenciales definidas. No se modificaron usuarios ni contraseñas.
- Regla de acceso (`libraryEntry`): todo rol distinto de ADMIN lee el documento cuando existe aprobación con el SHA-256 vigente. Por eso los tres operadores tienen la guía disponible.
- No se hizo un ingreso como operador: requeriría sus contraseñas. Queda como verificación de la auditoría (perfil «Julián — Operador QA», a evaluar).

## Alcance congelado (sin nuevas funcionalidades hasta la auditoría)

HOY · Créditos de hoy (regla G, match H ↔ BASE GENERAL) · Manuales y procesos con Búsqueda rápida · Guía rápida v1.2 · URL por panel desde configuración privada (fuera de Git) · Downloader 2865004 · Directorio de accesos · Lanzador JUMOCOL OS.

Pendientes que pasan a la auditoría:
- Validación de Créditos con una cuenta OPERADOR.
- Habilitación S0 en un caso real pendiente (PENDIENTE DE EVIDENCIA).
- Backlog de 24 pendientes históricos.
- Menús exactos de AT&T Smart Home Manager (REQUIERE EVIDENCIA).

## NEXT ACTION

`EJECUTAR AUDITORÍA DE CONSOLIDACIÓN S3`
