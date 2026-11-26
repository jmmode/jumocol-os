# Guía del módulo Operaciones TiviPlay en JUMOCOL OS

**Versión:** 0.1
**Estado:** BORRADOR — PENDIENTE DE VALIDACIÓN
**Fecha de corte:** 2026-10-13
**Responsable:** Dirección (Julián)
**Módulo:** Operaciones
**Submódulo:** TiviPlay · Runtime Operativo y Manuales

> Elaborada a partir del código de JUMOCOL Operations Intelligence vigente al 13/10/2026. Describe lo que la intranet muestra y permite hoy; no crea procedimientos nuevos. Las reglas de negocio marcadas como REQUIERE DECISIÓN deben confirmarse antes de publicar esta guía para operadores.

## 1. Para qué sirve el módulo

- **Qué actividad realiza el asesor:** consultar su cola de trabajo del día (ventas, cobros, servicio y excepciones), buscar la ficha operativa de un cliente y leer los manuales autorizados.
- **Cuándo debe realizarla:** al iniciar cada turno y cada vez que necesite verificar el estado de un cliente antes de cobrar, aplicar un crédito o responder.
- **En qué módulo trabaja:** Operaciones → TiviPlay → Runtime Operativo (consulta) y Manuales y procesos (lectura). Las planillas de Google Sheets siguen siendo el lugar donde se registra la gestión.

## 2. Navegación

| Botón o enlace | Dónde está | Qué hace | Quién lo ve |
| --- | --- | --- | --- |
| Operaciones | Menú lateral | Abre el área de Operaciones | ADMIN; el OPERADOR entra directo a TiviPlay |
| Manuales y procesos | Barra TiviPlay | Biblioteca con categorías y búsqueda por título | ADMIN y OPERADOR (solo documentos publicados) |
| Command Center | Barra TiviPlay | Resumen de componentes TiviPlay | ADMIN y OPERADOR |
| Contexto | Barra TiviPlay | Contexto maestro (restringido mientras esté en revisión) | Según publicación |
| Runtime Operativo | Barra TiviPlay | Consulta en vivo de la operación | ADMIN y OPERADOR |
| Usuarios · Auditoría · Biblioteca | Barra superior | Administración, trazas e inventario documental | Solo ADMIN |
| Cerrar sesión | Barra superior | Termina la sesión (8 horas máximo) | Todos |

## 3. Runtime Operativo

### 3.1 Fuentes de datos

- **Libro operativo diario** (Google Sheets, configurado en el servidor): hoja `BASE GENERAL`, que cumple el rol de **Base Operativa** consolidada (fichas `TC=1`); hojas de pago `ZELLE (MES)`, `PAYPAL (MES)` y `TRANSF (MES)` (capa financiera); hojas `CONTROL (MES) P1`, `P2` y `P3` (capa de servicio, una por panel).
- **Libro VENTAS 2026 (Tiviplay):** hojas `VENTAS_<MES>` de junio al mes en curso.
- **Ventana de datos:** desde el 2026-06-01 hasta hoy. Enero–mayo no se consultan.
- **Solo lectura:** ninguna pantalla escribe en Google Sheets. Toda corrección se hace en la planilla correspondiente.
- **Privacidad:** el runtime nunca muestra teléfono, correo ni contraseñas.
- **Actualización:** caché de 60 segundos; el botón **Actualizar** fuerza una lectura nueva.

### 3.2 Pestañas

| Pestaña | Pregunta que responde | Rol |
| --- | --- | --- |
| Vista gerencial | ¿Cómo está TiviPlay hoy? (recaudo, paneles, cartera) | Solo ADMIN |
| Vista operativa | ¿Qué tiene que hacer el equipo hoy? | ADMIN y OPERADOR |
| Buscar cliente | Ficha operativa por cliente | ADMIN y OPERADOR |
| Cierre mensual | Pre-cierre por mes según F. PRÓXIMO PAGO | ADMIN y OPERADOR |

### 3.3 Vista operativa: colas de trabajo

Flujo mostrado: **VENTAS → FINANCIERO → SERVICIO → MATCH → BASE**. Cada fila trae la columna **Siguiente acción** calculada por el sistema.

- **Ventas:** venta, cliente, tipo (venta nueva, reactivación, cliente existente), confirmación, identidad y estado. Acciones posibles: validar servicio, solicitar confirmación JM, resolver duplicidad en Back Office.
- **Cobros (capa financiera):** cobrar hoy, gestionar cobro vencido, cobro programado, solicitar confirmación JM, pasar a servicio.
- **Servicio (paneles P1–P3):** aplicar crédito en el panel, verificar pago antes de renovar, esperar CONFIRMADO JM, corregir la fila del CONTROL cuando hay inconsistencia de créditos.
- **Listo para Base:** registros completos para actualizar la Base Operativa.
- **Excepciones:** capa, referencia, cliente y motivo. Se corrigen en la fuente.
- **Filtros:** por estado y por asesor (selección manual).

### 3.4 Buscar cliente

- Escriba al menos dos letras del nombre. Resultados: hasta 30 fichas.
- **Se recupera automáticamente:** estado, plan (plan canónico o plan activo), panel, método de pago, próximo pago, último pago (desde las hojas de pago o desde F.ULTIMO PAGO), saldo pendiente cuando la cartera está sin pago, responsable, observaciones y la cadena venta → financiero → servicio → base.
- **Requiere selección manual:** la búsqueda por nombre, la pestaña, los filtros de estado y asesor, y el mes del cierre.
- **No implementado:** teléfono o correo (excluidos por diseño), escritura de gestiones, asignación automática de créditos, generación automática de listas de reactivación y confirmaciones JM desde la intranet.

## 4. Qué información consultar y qué acción ejecutar

- **Información a consultar:** estado y próximo pago en la ficha, la cola correspondiente en Vista operativa y la columna Siguiente acción.
- **Acción a ejecutar:** la indicada en Siguiente acción, realizada en la planilla o panel correspondiente. El runtime no ejecuta acciones.
- **Evidencia a registrar:** la gestión se registra en la planilla de origen (observación, confirmación o fila de CONTROL). REQUIERE DECISIÓN: formato oficial de la observación para 2026.

## 5. Cuándo escalar

- Filas en **Excepciones** o estados **REQUIERE DECISIÓN**: escalar a Back Office o Dirección según el motivo mostrado.
- **INCONSISTENCIA_CREDITOS** en un panel: corregir la fila indicada o escalar a Back Office.
- **DUPLICIDAD** o identidad **AMBIGUO**: Back Office resuelve la identidad antes de continuar.
- REQUIERE DECISIÓN: matriz oficial de escalamiento (responsable y canal por tipo de caso).

## 6. Permisos

- **OPERADOR:** Command Center, Contexto (si está publicado), Runtime (sin Vista gerencial) y Manuales y procesos (solo documentos publicados). No accede a Administración, Finanzas, Pagos, Dashboard ni inventario documental; las URL directas también están bloqueadas en el servidor.
- **ADMIN:** acceso completo, publicación de manuales con evidencia y auditoría.
- Todas las lecturas de documentos y accesos denegados quedan registrados en la auditoría.

## 7. Pendientes de decisión para publicar esta guía

- Confirmar el nombre oficial de la hoja: el libro operativo la llama `BASE GENERAL`, aunque cumple el rol de Base Operativa.
- Definir la matriz de escalamiento y el formato de evidencia 2026.
- Confirmar qué planilla de pendientes usa hoy cada turno.
