# JUMOCOL_OS_GITHUB_MIGRATION_READINESS_2026-10-05.md

**Fecha:** 5 de octubre de 2026 — America/Bogota.  
**Destino solicitado:** [jmmode/jumocol-os](https://github.com/jmmode/jumocol-os).  
**Modalidad:** inspección de solo lectura. Informe materializado en Markdown por autorización expresa posterior del usuario. No se modificaron fuentes, código, configuración ni Git.  
**Resultado:** existe una base reutilizable para la migración, pero **el árbol local completo no está listo para un primer commit indiscriminado**.

## 1. Resumen ejecutivo

La estructura principal puede conservarse. No se encontró una necesidad operacional que justifique rediseñar sus capas o incorporar un framework nuevo para preparar la migración.

La separación propuesta es:

- **GitHub:** gobierno, contratos, contexto consolidado, continuidad, código revisado y referencias de evidencia.
- **Fuentes externas:** datos operativos vivos, expedientes, comprobantes, extractos, credenciales y cortes sensibles.
- **Historia:** conservar procedencia, fecha y alcance; seleccionar referencias y documentos seguros, sin importar masivamente los paquetes históricos.

Cinco hallazgos determinan la preparación:

1. **La documentación S0 del 28/09 cambia la interpretación de antecedentes anteriores.** Retira `GESTION_GENERAL` del flujo activo y documenta el contrato A–F aprobado como diseño. No demuestra su ejecución ni validación completa.
2. **El contexto principal no incorpora esa continuidad.** `ACTIVE_CONTEXT`, `CHECKPOINTS` y `DECISION_LOG` llegan al 02/09; `SOURCE_INVENTORY` continúa con una fila pendiente.
3. **La auditoría técnica del 26/09 puede reutilizarse sin repetirla.** Se compararon 164 archivos contra su manifiesto y todos conservaron el mismo SHA-256. Se excluyeron los dos archivos `.env*` de esa comparación. Esto acredita igualdad de archivos, no funcionamiento actual de servicios externos.
4. **La exclusión actual es insuficiente para toda la raíz.** Existe un `.gitignore` dentro de la aplicación, pero no en la raíz. Hay un libro de accesos, un documento contractual, capturas y material financiero fuera de su cobertura.
5. **También hay datos financieros dentro del código de pruebas.** La prueba de integración del Excel incorpora importes históricos reales. Excluir únicamente Excel y `.env` no produce un repositorio libre de datos sensibles.

**Recomendación:** preparar un primer commit documental explícito de **24 archivos**, sujeto a consolidación y revisión. Migrar después el código mediante una selección independiente que preserve sus dependencias y retire los datos reales incrustados.

No se verificaron remotamente la existencia, privacidad, contenido ni permisos del repositorio GitHub indicado.

## 2. Alcance y restricciones

### Objetivo y propósito

Determinar qué debe migrar, qué debe conservarse fuera de GitHub y qué requiere una decisión antes de convertirse en autoridad documental.

### Alcance inspeccionado

Se revisaron la estructura, los archivos relevantes y las referencias de:

- `00_GOVERNANCE`
- `01_CONTEXT`
- `02_RUNTIME`
- `03_AREAS`
- `04_VALIDATION`
- `05_AUTOMATION`
- `06_APPLICATIONS`
- `99_EXTERNAL_SOURCES`
- archivos y contenedores adicionales situados en la raíz.

La expansión a LIFE-OS se limitó a localizar los antecedentes S0 solicitados, resolver procedencia y comprobar duplicados concretos. No se recorrió el contenido completo de las auditorías históricas.

### Antecedentes prioritarios

| Antecedente | Resultado |
|---|---|
| Inventario de auditorías del 05/10 | **No localizado** en las rutas consultadas. No se afirma que no exista en otro lugar. |
| [Estado actual y transferencia del 26/09][transferencia] | Localizado y consultado como auditoría fechada. |
| [Baseline S0 del 28/09][baseline] | Localizado; versión 0.1, estado parcial. |
| [Contrato S0 del 28/09][contrato] | Localizado; versión 0.2, diseño A–F declarado aprobado, validación real pendiente. |
| Cierre/repetibilidad posterior | **No localizado** en el alcance consultado. No se presupone cierre de S0. |

### Principios y governance aplicados

- Inspección de solo lectura: sin ediciones de fuentes, movimientos, instalaciones, commits, cambios de configuración ni escrituras externas. La única escritura posterior autorizada es este informe.
- No se ejecutaron pruebas, builds ni servidores.
- No se consultaron filas vivas de Sheets, bancos o paneles.
- No se abrió el contenido del libro de accesos ni los valores de `.env.local`.
- No se clonaron ni investigaron repositorios externos.
- La clasificación es una **propuesta de migración**, no una aprobación de operación.
- Las afirmaciones históricas conservan su fecha.
- La sensibilidad prevalece sobre la conveniencia de migrar una evidencia.

### Límites de evidencia

Hubo acceso denegado al subdirectorio privado de infraestructura y al archivo global de exclusiones de Git. No se solicitaron permisos adicionales ni se amplió esa inspección.

La revisión de sensibilidad fue dirigida. **No constituye una certificación exhaustiva de ausencia de secretos o PII.**

### Referencias de ubicación usadas en la matriz

Los nombres de ubicación enlazan a rutas absolutas. La columna siguiente identifica el archivo o subconjunto concreto.

[R]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS
[G]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/00_GOVERNANCE
[GD]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/00_GOVERNANCE/DECISIONS
[GA]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/00_GOVERNANCE/AUDITS
[C]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/01_CONTEXT
[RT]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/02_RUNTIME
[A]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/03_AREAS
[O]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/03_AREAS/01_OPERACION
[T]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/03_AREAS/01_OPERACION/TIVIPLAY
[TC]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO
[TECH]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/03_AREAS/06_TECNOLOGIA_IA
[V]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/04_VALIDATION
[V2]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/04_VALIDATION/AUDITS/TIVIPLAY/CONTEXT/AUDIT_2026_09_02_CONTEXT_DISCOVERY
[V26]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/04_VALIDATION/AUDITS/TIVIPLAY/AUDIT_INTRANET_TIVIPLAY_2026_09_26_003255
[AUTO]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/05_AUTOMATION
[APPS]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/06_APPLICATIONS
[APP]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE
[SRC]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src
[EXT]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/99_EXTERNAL_SOURCES
[OUT]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/output
[TMP]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/tmp
[NET]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/JUMOCOL_NETWORK_INFRAESTRUCTURE
[S0]: <D:/LIFE_OPERATING_SYSTEM (LIFE-OS)/TIVIPLAY_OPERATION_SYSTEM/77__AUDITORIA>
[transferencia]: C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/04_VALIDATION/AUDITS/TIVIPLAY/AUDIT_INTRANET_TIVIPLAY_2026_09_26_003255/JUMOCOL_OS_ESTADO_ACTUAL_Y_TRANSFERENCIA_2026-09-26.md
[baseline]: <D:/LIFE_OPERATING_SYSTEM (LIFE-OS)/TIVIPLAY_OPERATION_SYSTEM/77__AUDITORIA/TIVIPLAY_PROCESO_OPERATIVO_ACTUAL_BASELINE_S0_2026-09-28.md>
[contrato]: <D:/LIFE_OPERATING_SYSTEM (LIFE-OS)/TIVIPLAY_OPERATION_SYSTEM/77__AUDITORIA/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md>

## 3. Arquitectura documental encontrada

| Capa | Responsabilidad observada | Evaluación para migración |
|---|---|---|
| Governance | Instrucciones, decisiones, responsabilidades y auditorías estructurales | Reutilizar. Completar el enlace con las decisiones S0 posteriores. |
| Context | Contexto activo, persistente e inventario de fuentes | Reutilizar los archivos existentes; requieren consolidación. |
| Runtime | Ciclo documental y checkpoints | Reutilizar. No representa un motor multiagente ejecutable. |
| Áreas | Estándares, propuestas, mapas funcionales y TiviPlay | Seleccionar por función y estado; no convertir scaffolds en capacidades activas. |
| Validation | Validaciones técnicas, auditorías y manifiestos | Conservar trazabilidad; separar evidencia histórica de controles actuales. |
| Automation | Reglas para automatizaciones candidatas | Conservar como límite de gobierno. |
| Applications | Intranet propia y sus dependencias técnicas | Candidata a migración posterior, tras revisión de datos y reproducibilidad. |
| External sources | Política de preservación de fuentes | Conservar política y referencias; no usar como depósito indiscriminado de datos. |
| `output`, `tmp`, infraestructura | Entregables, capturas, staging, diagnósticos y material mixto | No incorporar como bloques. |

La estructura ya separa las responsabilidades principales. Los problemas observados son de **vigencia, selección, sensibilidad y continuidad**, no de ausencia de carpetas.

Git local mantiene la rama `master`, sin `HEAD` verificable y sin archivos registrados por `git ls-files`. `git remote` no devolvió nombres de remotos. No se modificó ese estado.

## 4. Matriz de migración

**Convenciones:**

- Cada fila tiene una sola clasificación.
- **SÍ** significa inclusión propuesta después de cumplir la revisión correspondiente; no necesariamente en el primer commit.
- **NO** significa excluir ese original o componente de la migración propuesta; no eliminarlo.
- **REVISAR** requiere resolver autoridad, contenido o alcance.
- Los destinos son relativos al futuro repositorio `jumocol-os`.
- Cuando una carpeta tiene excepciones, las filas específicas prevalecen.
- Riesgos: **B** bajo observado; **M** medio; **A** alto; **ND** no determinado. Ninguno sustituye la revisión final.

| ID | Ruta actual | Archivo / carpeta | Tipo | Dominio | Propósito observado | Fecha / versión | Estado documental actual | Evidencia de vigencia | Relación con documento posterior | Clasificación propuesta | Migrar a GitHub | Destino propuesto dentro de jumocol-os | Riesgo de duplicidad | Riesgo de sensibilidad | Dependencias | Decisión humana requerida | Observaciones |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M01 | [Raíz][R] | `AGENTS.md` | Instrucciones | Gobierno | Reglas de trabajo | Sin versión explícita | Aplicable | Coincide con instrucciones de esta tarea | Sin sustitución localizada | CANÓNICO | SÍ | `AGENTS.md` | B | B | Alcance del repositorio | No adicional para conservarlo | No equivale a agente ejecutable |
| M02 | [Raíz][R] | `README.md` | Entrada | Arquitectura | Explicar sistema y capas | Contiene cortes iniciales | Mezcla arquitectura y estado antiguo | Las capas existen | S0 y transferencia aportan estado posterior | REQUIERE_DECISIÓN | REVISAR | `README.md` | M | B | Contexto actualizado | Aprobar consolidación | Dice que no había fuentes y describe un MVP anterior |
| M03 | [Governance][G] | `README.md` | Política | Gobierno | Separación de responsabilidades | Sin versión | Estructural | Correspondencia con carpetas | Sin reemplazo localizado | CANÓNICO | SÍ | Misma ruta | B | B | Decisiones | No | Conservar responsabilidad |
| M04 | [Decisiones][GD] | `DECISION_LOG.md` y DEC-001 a DEC-011 | Registro y decisiones | Gobierno | Autoridad y límites | 12/06–02/09 | Decisiones registradas; índice incompleto respecto de S0 | Archivos y referencias existentes | S0 del 28/09 complementa reglas operativas | CANÓNICO | SÍ | Misma ruta | M | M | Aprobaciones y fuentes | Registrar precedencia de S0 | No reescribir decisiones antiguas como si hubieran ocurrido después |
| M05 | [Governance][G] | `RESPONSIBILITY_MATRIX.md` | Matriz | Ownership | Registrar responsables y pendientes | Inicial | Parcial | Declara roles pendientes | S0 precisa ownership de varias etapas | REQUIERE_DECISIÓN | REVISAR | Misma ruta | M | M | Contrato S0 | Consolidar alcance y responsables | No extrapolar roles S0 a toda JUMOCOL |
| M06 | [Auditorías de gobierno][GA] | Auditorías del 12/06 y 26/08 | Evidencia | Arquitectura | Explicar creación y alineación | Fechadas | Históricas | Su fecha y alcance | Cambios posteriores documentados | HISTÓRICO | REVISAR | Misma ruta, selección segura | B | M | Decisiones asociadas | Seleccionar evidencia necesaria | No acreditan estado operativo actual |
| M07 | [Context][C] | `README.md` | Política | Contexto | Separar activo, persistente y fuentes | Sin versión | Estructural | Archivos existentes con esas funciones | Sin reemplazo localizado | CANÓNICO | SÍ | Misma ruta | B | B | Governance | No | Reutilizable |
| M08 | [Context][C] | `ACTIVE_CONTEXT.md` | Estado de trabajo | Continuidad | Recuperar foco y bloqueos | 02/09 | Desactualizado | Corte explícito | Transferencia y S0 posteriores | REQUIERE_DECISIÓN | REVISAR | Misma ruta | A | M | S0 y evidencia posterior | Consolidar estado y siguiente acción | No heredar como actuales las notas antiguas de pruebas |
| M09 | [Context][C] | `PERSISTENT_CONTEXT.md` | Hechos estables | Memoria | Conservar hechos y decisiones | Hasta 02/09 | Parcial | Referencias a decisiones | Falta incorporar frontera S0 | REQUIERE_DECISIÓN | REVISAR | Misma ruta | M | M | DEC y contrato S0 | Aprobar hechos que permanecen | Calendario planificado no demuestra cumplimiento |
| M10 | [Context][C] | `SOURCE_INVENTORY.md` | Inventario | Fuentes | Procedencia y clasificación | Sin carga efectiva | Fila pendiente | Lectura directa | Fuentes ya documentadas en antecedentes | REQUIERE_DECISIÓN | REVISAR | Misma ruta | A | B | Identificadores y custodios | Completar inventario lógico | No copiar filas de clientes |
| M11 | [Runtime][RT] | `README.md`, `OPERATING_CYCLE.md` | Política y procedimiento | Runtime documental | Ordenar ciclos y evidencia | Sin versión | Estructural | Separación explícita de funciones | Sin reemplazo localizado | CANÓNICO | SÍ | Misma ruta | B | B | Governance | No | No es scheduler |
| M12 | [Runtime][RT] | `CHECKPOINTS.md` | Registro | Continuidad | Hitos y siguientes acciones | Hasta 02/09 | Registro válido, incompleto | Entradas fechadas | S0 contiene checkpoints posteriores | CANÓNICO | SÍ | Misma ruta | M | M | Evidencia por hito | Aprobar actualización del registro | Mantener entradas antiguas fechadas |
| M13 | [Áreas][A] | READMEs funcionales, excluidas filas específicas | Guías | Áreas | Delimitar responsabilidades | Mayormente iniciales | Scaffolds y entradas | Carpetas y funciones existentes | Sin sustitución localizada | CANÓNICO | SÍ | Misma ruta, selección | M | B | Fuentes y owners | Confirmar alcance cuando se activen | No demuestran procesos implementados |
| M14 | [Áreas][A] | `RH_OPERATING_MAP.md`, `CONTABILIDAD_OPERATING_MAP.md` | Mapas | RH/Contabilidad | Entradas, salidas y pendientes | Iniciales | Pendientes de fuentes | Declaran explícitamente sus límites | Sin validación posterior localizada | CANÓNICO | SÍ | Mismas rutas | B | M | Fuentes externas | No para conservar límites | No certifican cumplimiento |
| M15 | [Operación][O] | `JUM_OPS_STD_CLIENT_001_Handoff_Onboarding_Ejecucion_Entrega.md` | Estándar | Clientes web | Estados y gates | v1.0 | Adoptado por DEC-008 | Decisión explícita | S0 es otro contrato de dominio | CANÓNICO | SÍ | Misma ruta | M | B | DEC-008 | No adicional | No sustituye automáticamente el contrato TiviPlay |
| M16 | [Operación][O] | `JUM_OPS_MODEL_CLIENT_001_Persistencia_Estructurada_Multicanal.md` | Propuesta | Persistencia | Diseño de siguiente milestone | Diseño no implementado | Propuesta | Estado explícito | Contrato S0 añade necesidades propias | REQUIERE_DECISIÓN | REVISAR | Misma ruta si se conserva como propuesta | M | M | Ownership y permisos | Conservar, revisar o diferir | No elevar a arquitectura adoptada |
| M17 | [TiviPlay][T] | `README.md` y cinco READMEs de MCP/Skills/Hooks/Subagentes/Plugin | Manifiesto y scaffolds | TiviPlay | Delimitar capacidades | DEC-011, 02/09 | Documental; no ejecutable | Estados explícitos | S0 no demuestra implementación | CANÓNICO | SÍ | Mismas rutas | M | B | DEC-010/011 | No para conservar los límites | Incorporación posterior al mínimo inicial |
| M18 | [Contexto TiviPlay][TC] | `JUM-OI-OPS-TIVI-001_CONTEXTO_MAESTRO.md` | Contexto | TiviPlay | Fuente del visor | v0.1, 02/09 | `DRAFT — IN REVIEW` | Referenciado por código y DEC-011 | Propuesta v0.2 no aplicada; S0 posterior | REQUIERE_DECISIÓN | REVISAR | Misma ruta | A | M | Visor, allowlist y S0 | Consolidar sin romper consumo técnico | Ruta canónica no significa contenido aprobado |
| M19 | [Tecnología][TECH] | `JUM-OI-TECH-001_TECNOLOGIA_IA.md` | Mapa técnico | Arquitectura | Snapshot del stack | v1.2, 02/09 | Snapshot estático cerrado | Código y manifiesto histórico | Transferencia del 26/09 aporta límites posteriores | REQUIERE_DECISIÓN | REVISAR | Misma ruta | M | M | Código y auditoría | Definir snapshot histórico o actualización | `DONE` no significa operación completa |
| M20 | [Tecnología][TECH] | `JUM-TECH-INITIATIVES_REGISTER.md` | Registro | Planificación | Separar terminado y planificado | v1.0, 27/08 | Registro acotado | Tres iniciativas explícitas | Sin cambio posterior localizado | CANÓNICO | SÍ | Misma ruta | B | B | Aprobaciones por iniciativa | No | `PLANNED` no autoriza ejecución |
| M21 | [Antecedentes S0][S0] | `TIVIPLAY_PROCESO_OPERATIVO_ACTUAL_BASELINE_S0_2026-09-28.md` | Baseline | Operación | Describir flujo declarado | v0.1, 28/09 | Parcial | Lectura directa | Complementado por contrato v0.2 | CANÓNICO | SÍ | `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/` + mismo nombre | M | M | Fuentes vivas y contrato | Formalizar traslado de autoridad documental | Conservar corte y condición parcial |
| M22 | [Antecedentes S0][S0] | `TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md` | Contrato | Operación | Reglas y gates A–F | v0.2, 28/09 | Diseño declarado aprobado; validación pendiente | Lectura directa | No se localizó versión posterior | CANÓNICO | SÍ | `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/` + mismo nombre | M | M | Baseline y evidencia por transición | Confirmar precedencia y ausencia de versión posterior | Automatismos descritos son objetivos |
| M23 | [Antecedentes S0][S0] | `MANUAL_DE_COBRO_TIVIPLAY.md` | Manual | Cobranza | Secuencia de contacto | Sin versión explícita | Referenciado por contrato | S0-C remite al manual | Convención de T pendiente | REQUIERE_DECISIÓN | REVISAR | Misma área TiviPlay si se aprueba | M | M | S0-C y promociones | Validar versión, T y beneficios | Referencia no aprueba todas sus promociones |
| M24 | [Output][OUT] | `markdown/Manual de Elaboracion de la Planilla de Facturacion Mensual (TIVIPLAY).md` | Manual | Facturación | Procedimiento de 2025 | `20250331` | Histórico | Versión interna y hash | S0 redefine reglas actuales | HISTÓRICO | NO | Referencia en inventario | A | M | S0 y manuales posteriores | Seleccionar copia de preservación | No usar como regla general actual |
| M25 | [Antecedentes S0][S0] | `Manual de Elaboración de la Planilla de Facturación Mensual (TIVIPLAY) (1) (1).md` | Copia | Facturación | Mismo manual | `20250331` | Copia idéntica | SHA-256 igual a M24 | S0 posterior | DUPLICADO | NO | Referenciar una sola copia | A | M | M24 | Ninguna eliminación propuesta | No duplicar en Git |
| M26 | [Antecedentes S0][S0] | Protocolo de cierre julio/agosto v1.1 | Protocolo | Cierre | Procedencia histórica | Julio 2026 | Histórico según baseline | S0 lo identifica como antecedente | S0 elimina la transición por Gestión General | HISTÓRICO | NO | Referencia en inventario | M | ND | Baseline S0 | Solo si se necesita una regla no resuelta | No se reabrió su auditoría |
| M27 | Ubicación no localizada | Inventario del 05/10 y cierres posteriores | Antecedentes solicitados | Continuidad | Evitar omitir trabajo posterior | No verificable | No disponibles | Búsqueda sin localización | Podrían modificar prioridades | REQUIERE_DECISIÓN | REVISAR | Por determinar | ND | ND | Ubicación o referencia | Localizar o aceptar límite documentado | No inferir contenido |
| M28 | [Validation][V] | `README.md` | Índice | Evidencia | Orientar validaciones | Referencias iniciales | Incompleto | No incorpora todos los paquetes posteriores | Auditorías 02/09 y 26/09 | REQUIERE_DECISIÓN | REVISAR | Misma ruta | M | B | Evidencias seleccionadas | Consolidar índice | Puede cumplir EVIDENCE_INDEX |
| M29 | [Validation][V] | Checklist v0.1 y seis validaciones de agosto | Evidencia | Calidad | Registrar verificaciones por hito | Junio/agosto | Histórico | Fechas y alcances explícitos | Hallazgos del 26/09 posteriores | HISTÓRICO | REVISAR | Mismas rutas, selección | M | M | Código del corte | Seleccionar lo necesario | Casillas aprobadas no certifican octubre |
| M30 | [Auditoría 02/09][V2] | `AUDIT_2026_09_02_TIVIPLAY_CONTEXT.md` | Auditoría | Contexto | Hallazgos y procedencia | 02/09 | Histórico | Paquete existente | S0 resuelve parte del marco anterior | HISTÓRICO | REVISAR | Misma ruta si supera revisión | M | M | Manifiestos y S0 | Selección y revisión de sensibilidad | No repetir discovery |
| M31 | [Auditoría 02/09][V2] | `DECISION_BRIEFS.md`, `PROPOSED_CONTEXT_V0_2.md` | Decisiones pendientes y propuesta | Gobierno | Resolver contradicciones | 02/09 | No aplicados | Estado explícito | S0 responde parcialmente a varias preguntas | REQUIERE_DECISIÓN | REVISAR | Mismas rutas como antecedentes | A | M | Contrato S0 | Identificar qué sigue abierto | No aprobar en bloque |
| M32 | [Auditoría 02/09][V2] | `SOURCE_MANIFEST.csv`, `DUPLICATE_GROUPS.csv` | Inventarios | Evidencia | Rutas, huellas y duplicados | 02/09 | Históricos | Archivos existentes | No inventario actual | SENSIBLE_NO_GIT | NO | Referencia restringida | M | A | Fuentes originales | Revisar nombres/rutas antes de derivar índice seguro | Pueden revelar identidades y expedientes |
| M33 | [Auditoría 26/09][V26] | Informe de transferencia y `VERIFICACIONES.md` | Informes | Técnica/financiera | Evidencia del corte | 26/09 | Históricos | Consultados; incluyen cifras operativas | S0 modifica interpretación operativa | SENSIBLE_NO_GIT | NO | Solo referencia o extracto seguro futuro | M | A | Manifiesto | Aprobar eventual versión sin datos financieros | La clasificación aplica al original |
| M34 | [Auditoría 26/09][V26] | `SOURCE_INTEGRITY.csv` | Manifiesto | Integridad | Huellas de 166 archivos | 26/09 | Histórico | 164 comparaciones actuales iguales | No sustituye inventario nuevo | HISTÓRICO | REVISAR | Misma ruta, tras revisión | B | M | Archivos del corte | Revisar metadatos publicables | No copiar la fuente privada asociada |
| M35 | [Antecedentes S0][S0] | Copia del informe de transferencia del 26/09 | Copia | Continuidad | Duplicar informe | 26/09 | Idéntico al original local | SHA-256 idéntico | M33 es procedencia preferida | DUPLICADO | NO | Referencia a M33 | A | A | M33 | No | Conservación local; sin segunda copia en Git |
| M36 | [Automation][AUTO] | `README.md` | Política | Automatización | Gates antes de automatizar | Sin versión | Estructural | Límites explícitos | Compatible con S0 | CANÓNICO | SÍ | Misma ruta | B | B | Fuentes, owners, contratos | No | No acredita jobs activos |
| M37 | [Applications][APPS] | `README.md` | Política | Aplicaciones | Separar intranet y web pública | DEC-002 | Estructural | Aplicación ubicada allí | Sin reemplazo localizado | CANÓNICO | SÍ | Misma ruta | B | B | DEC-002 | No | Conservar frontera |
| M38 | [Aplicación][APP] | `README.md` | Guía | Intranet | Alcance y arranque | App 0.1.0 | Parcialmente desactualizado | Código y auditoría | Falta reflejar dashboard adicional y límites S0 | REQUIERE_DECISIÓN | REVISAR | Misma ruta | M | M | Código y contrato S0 | Corregir descripción en fase autorizada | “Conciliación exacta” necesita alcance explícito |
| M39 | [Aplicación][APP] | `docs/TIVIPLAY_PAYMENTS_DASHBOARD.md` | Contrato técnico y evidencia | Pagos | Describir adaptador y métricas | Corte de agosto | Mezcla reglas y evidencia financiera | Archivo consultado | S0 define confirmación más exigente | SENSIBLE_NO_GIT | NO | Versión técnica saneada, solo en tarea futura | M | A | Adaptador y S0 | Separar contrato de datos reales | No migrar original sin revisión |
| M40 | [Código][SRC] | Código propio, salvo M41 | Código | Intranet | UI, dominio y lectores | App 0.1.0 | Implementación parcial | Archivos del manifiesto sin cambios | S0 no implementado automáticamente | CANÓNICO | REVISAR | Misma ruta | B | M | Configuración, documento, fuentes | Aprobar lote técnico y revisión | Canonizar procedencia no certifica producción |
| M41 | [Código][SRC] | `server/tiviplay-payments/__tests__/excel-source.integration.test.ts` | Prueba | Pagos | Regresión sobre Excel real | Snapshot 2026 | Dependiente de dato privado | Contiene importes reales esperados | Sin reemplazo localizado | SENSIBLE_NO_GIT | NO | Sustitución por prueba sintética futura | B | A | Excel privado | Autorizar desacoplamiento posterior | Se omite si falta el Excel |
| M42 | [Aplicación][APP] | `package.json`, lockfile, workspace y configs TS/Next/ESLint/PostCSS/Vitest | Manifiestos | Reproducibilidad | Versiones y configuración | Versiones declaradas | Reutilizables | Lectura y comparación histórica | Sin cambios verificados en manifiesto | CANÓNICO | SÍ | Mismas rutas | B | M | Código y gestor de paquetes | Revisión previa al lote técnico | Lockfile no es caché |
| M43 | [Aplicación][APP] | `AGENTS.md`, `CLAUDE.md` | Instrucciones | Agentes de desarrollo | Guía de Next y referencia compartida | Estado actual | Aplicables | `CLAUDE.md` importa `AGENTS.md` | Sin reemplazo localizado | CANÓNICO | SÍ | Mismas rutas | B | B | Documentación de Next instalada | No | No son duplicados byte a byte |
| M44 | [Aplicación][APP] | `public/brand/` y `scripts/windows/` | Activo y scripts | Ejecución local | Marca y arranque | Existentes | Implementados | Código y antecedente de auditoría | Sin reemplazo localizado | CANÓNICO | REVISAR | Mismas rutas | B | M | Windows/Node y app | Validar portabilidad cuando se migre código | No ejecutados en esta tarea |
| M45 | [Aplicación][APP] | `.env.example` | Plantilla | Configuración | Variables necesarias | Actual | Incluye ID real y modo Google Sheets | Lectura directa | Sin alternativa segura localizada | REQUIERE_DECISIÓN | REVISAR | Misma ruta tras revisión | B | M | Configuración del lector | Sustituir identificador por placeholder y decidir modo inicial | ID no equivale a contraseña |
| M46 | [Aplicación][APP] | `.env.local`, `data/private/` | Secretos/datos | Acceso y operación | Credenciales y snapshot privado | Existentes | Locales restringidos | Existencia; exclusión Git comprobada | Fuentes vivas siguen fuera | SENSIBLE_NO_GIT | NO | Ninguno | M | A | Custodia externa | Definir aprovisionamiento, no publicación | No se mostraron valores |
| M47 | [Raíz][R] y [Aplicación][APP] | `.pnpm-store`, `node_modules`, `.next`, `*.tsbuildinfo`, `next-env.d.ts` | Generados | Runtime técnico | Dependencias y derivados | Variables | Regenerables | Existencia observada | Se regeneran desde configuración | GENERADO_NO_GIT | NO | Ninguno | A | M | Manifiestos y herramientas | No | No confundir con lockfile |
| M48 | [Raíz][R] | `ACCESOS_CLAVES.xlsx` | Libro | Accesos | Posible almacenamiento de credenciales | No inspeccionado | Sensibilidad preventiva | Nombre y existencia | No aplica | SENSIBLE_NO_GIT | NO | Ninguno | ND | A | Custodio | Confirmar custodia fuera de Git | No se leyó su contenido |
| M49 | [Output][OUT] | `documents/` y capturas de pagos | Documento/capturas | RH/finanzas | Entregables con potencial dato personal o financiero | Históricos | Derivados sensibles | Archivo contractual identificado y capturas existentes | No son contratos técnicos | SENSIBLE_NO_GIT | NO | Referencia restringida si hace falta | M | A | Fuentes originales | Revisar cualquier exportación futura | Ser generado no elimina sensibilidad |
| M50 | [Output][OUT] | Presentación piloto y activos asociados | Entregable | Marketing | Propuesta de producción de contenido | Junio 2026 | Autoridad no confirmada | Archivos localizados | Sin adopción posterior localizada | REQUIERE_DECISIÓN | NO | Ninguno en primer alcance | M | ND | Iniciativa de origen | Determinar utilidad y versión | No clasificar como basura por ubicación |
| M51 | [Tmp][TMP] | Staging `jumocol_com_*` y contenedores mixtos | Copias de trabajo | Web pública | Trabajo de otro proyecto | Varias versiones | No autoridad de intranet | Nombres y frontera DEC-002 | Procedencia no consolidada | REQUIERE_DECISIÓN | NO | Fuera de `jumocol-os` | A | ND | Proyecto JUMOCOL_COM | Resolver en su proyecto | No declarar duplicidad exacta sin comparación |
| M52 | [Tmp][TMP] | Renders PDF y resultados regenerables | Derivados | Validación | Salidas temporales | Históricos | Generados | Archivos/rutas observados | No gobiernan operación | GENERADO_NO_GIT | NO | Ninguno | A | M | Fuente y procedimiento | No para excluir del commit | Si contienen datos reales, aplicar exclusión sensible |
| M53 | [Infraestructura][NET] | Documentación y paquetes no privados | Paquete mixto | Infraestructura | Diagnóstico/transferencia de red y equipos | Varios cortes | Fuera del núcleo examinado | Estructura observada | Auditoría no reabierta | REQUIERE_DECISIÓN | NO | Sin destino en primer commit | M | ND | Ownership de infraestructura | Delimitar repositorio y evidencia necesaria | No migrar como bloque |
| M54 | [Infraestructura][NET] | Configuración `.cfg` y `local-private` | Configuración/privado | Infraestructura | Estado técnico potencialmente sensible | Existentes | Contenido no validado | Archivo y acceso restringido | No aplica | SENSIBLE_NO_GIT | NO | Ninguno | ND | A | Custodia técnica | Revisión especializada si se solicita | No se superó el acceso denegado |
| M55 | [Raíz][R] | `SOURCE_AUDIT_v0.1.md`, `DEPENDENCY_MAP_v0.1.md`, `GAP_ANALYSIS_v0.1.md` | Auditorías | Fuentes/RH/finanzas | Hallazgos iniciales | v0.1, contexto junio | Históricos con información interna | Muestras consultadas | S0 y otros documentos posteriores | SENSIBLE_NO_GIT | NO | Referencia o extracto saneado futuro | M | A | Fuentes auditadas | Seleccionar información publicable | Incluyen información personal/operativa |
| M56 | [Raíz][R] | `DESTINATION_MATRIX_v1.0.md`, `STRUCTURE_NORMALIZATION_REPORT_v1.0.md`, `POST_NORMALIZATION_VALIDATION_v1.0.md` | Propuesta/evidencia | Drive | Normalización histórica de Drive | v1.0, junio | Históricos | Declaran destino Drive | Validación posterior distingue ejecución manual | HISTÓRICO | REVISAR | Conservar ubicación o solo referencia | A | M | Fuentes Drive | Confirmar necesidad y revisión | No son la matriz de migración GitHub |
| M57 | [Fuentes externas][EXT] | `README.md` | Política | Fuentes | Preservación y clasificación | Sin versión | Estructural | Regla explícita | Compatible con separación propuesta | CANÓNICO | SÍ | Misma ruta | B | B | Inventario | No | No autoriza subir datos externos |
| M58 | [Raíz][R] | `.agents/`, `.codex/` | Contenedores vacíos | Entorno | Sin contenido observado | Estado inspeccionado | Sin paquete ejecutable | Enumeración vacía | No aplica | REQUIERE_DECISIÓN | NO | Ninguno por ahora | B | B | Configuración futura | Solo cuando exista contenido con función | No crear archivos para conservar vacíos |
| M59 | Fuentes identificadas en [S0][contrato] | Sheets, bancos, paneles, expedientes y fuentes JM | Fuentes vivas | Operación | Autoridad de datos y evidencia | No refrescadas en esta tarea | Externas | Referencias documentales | Cada fuente conserva su corte | EXTERNO_REFERENCIADO | NO | Contratos y referencias en `01_CONTEXT/` | A | A | Accesos y custodios | Confirmar autoridad por dominio | Git no recibe el dato vivo |

## 5. Documentos candidatos CANÓNICOS

La canonicidad debe declararse **por función**. Un contrato puede gobernar diseño sin demostrar ejecución; un checkpoint puede ser el registro oficial y contener únicamente hitos antiguos.

### Análisis de vigencia A–G

**A:** representa operación actual. **B:** versión/evidencia posterior. **C:** reemplazo explícito. **D:** solo histórico. **E:** regla utilizada o documentalmente vigente. **F:** contradicción posterior. **G:** tratamiento.

| Documento o grupo | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| AGENTS y políticas de separación | Sí, como reglas de trabajo | No localizada | No | No | Sí | No observada | Conservar completos |
| DEC-001–011 | Por su alcance aprobado | S0 posterior | No hay sustitución global | No; contienen evidencia fechada | Sí | Algunas descripciones de estado quedaron antiguas | Conservar; registrar relaciones posteriores |
| Estándar Clientes Web v1.0 | Normativamente; ejecución no acreditada | S0 es otro dominio | No | No | Adoptado por DEC-008 | No se debe aplicar automáticamente a TiviPlay | Conservar completo con alcance |
| Baseline S0 v0.1 | Declaración al 28/09 | Contrato v0.2 | No | No | Frontera de fuentes | Parte del detalle provisional se desarrolla después | Conservar como baseline fechado |
| Contrato S0 v0.2 | Diseño; realidad aún pendiente | No localizada | No | No | Reglas y gates declarados aprobados | Contradice prácticas/semánticas anteriores | Candidato rector de diseño S0 |
| Contexto Maestro v0.1 | Parcialmente | Propuesta v0.2 y S0 | No aplicado | No | Algunas reglas de gobierno | Pruebas, estados y continuidad desalineados | Consolidar en el mismo archivo; preservar procedencia |
| ACTIVE_CONTEXT | No como corte de octubre | Transferencia y S0 | No | Su estado es anterior | Conserva límites válidos | Sí, respecto de pruebas y siguiente fase | Actualizar en fase autorizada |
| PERSISTENT_CONTEXT | Parcialmente | S0 | No | No | Decisiones estables | Faltan hechos posteriores | Consolidar, separando hechos de planes |
| CHECKPOINTS | No como último estado | Checkpoints S0 | No | Cada entrada es histórica | Reglas del registro | Incompleto, no necesariamente falso | Preservar y añadir continuidad |
| SOURCE_INVENTORY | No está poblado | Fuentes descritas en otros documentos | No | No | Regla de inventariar | Desalineación por omisión | Completar el archivo existente |
| Mapa técnico v1.2 | Snapshot, no observabilidad | Auditoría 26/09 | No | Su corte técnico sí | Límites arquitectónicos reutilizables | Omisiones y problemas posteriores | Resolver tratamiento de snapshot/actualización |
| Mapas RH y Contabilidad | Diseño inicial | No localizada | No | No | Separación de entradas/salidas | Sin evidencia de ejecución | Conservar como mapas pendientes |
| Registro de iniciativas | Como registro acotado | No localizada | No | No | `PLANNED` no autoriza | No observada | Conservar completo |
| Scaffolds TiviPlay | Sí, como límites documentales | S0 no demuestra implementación | No | No | Prohibición de automatización prematura | No observada | Conservar sin presentarlos como agentes |

El contrato S0 **no revoca automáticamente** todas las decisiones anteriores. Su precedencia propuesta se limita al proceso operativo TiviPlay y a las reglas que desarrolla expresamente.

## 6. Documentos HISTÓRICOS

Deben preservarse, aunque no necesariamente copiarse a GitHub:

- Auditorías estructurales de junio y agosto.
- Validaciones técnicas fechadas de la intranet.
- Auditoría de contexto del 02/09.
- Manual de facturación versión `20250331`.
- Protocolo de cierre julio/agosto.
- Informes de normalización de Drive.
- Manifiesto de integridad del 26/09.

Los informes que contienen datos financieros o personales mantienen su naturaleza histórica, pero reciben **SENSIBLE_NO_GIT** como clasificación de migración.

El informe de normalización bloqueada y la validación posterior de normalización manual **no deben fusionarse como si describieran la misma ejecución**. Documentan momentos y actores distintos.

No se recomienda crear una nueva carpeta histórica general. Las rutas existentes de auditoría y el inventario de fuentes pueden mantener la trazabilidad.

## 7. DUPLICADOS

Se comprobaron dos pares mediante SHA-256:

| Grupo | Archivos | Resultado | Tratamiento |
|---|---|---|---|
| D01 | Transferencia del 26/09 en JUMOCOL y copia en LIFE-OS | Hash idéntico: `95B3ECDC…99C55290` | Preferir como procedencia el paquete de auditoría JUMOCOL, junto con sus verificaciones y manifiesto |
| D02 | Manual de facturación en `output/markdown` y copia con sufijos `(1) (1)` en LIFE-OS | Hash idéntico: `490D7858…49BFD4B` | Una sola referencia de preservación; ninguna copia en el primer commit |

No se detectaron grupos byte a byte duplicados entre los Markdown de las capas principales incluidos en la comparación realizada. Esto no descarta solapamiento semántico.

Otros casos:

- `CLAUDE.md` contiene `@AGENTS.md`: es una referencia de compatibilidad, no un duplicado documental.
- Los scaffolds describen funciones diferentes.
- Los staging de la web pública no fueron declarados duplicados solo por sus nombres.

**No se propone eliminar ningún archivo.**

## 8. SENSIBLE_NO_GIT

Exclusiones concretas:

- Libro de accesos de la raíz.
- `.env.local` y cualquier credencial efectiva.
- Excel privado de pagos.
- Datos operativos y snapshots de clientes.
- Documento contractual individual en `output/documents`.
- Capturas de dashboards con datos reales.
- Importes históricos incrustados en la prueba de integración.
- Informes y verificaciones con cifras financieras reales.
- Inventarios que expongan nombres de expedientes, clientes o rutas sensibles.
- Configuraciones de infraestructura sin revisión y contenido `local-private`.

La condición de repositorio privado **no cambia la exclusión solicitada**.

La plantilla `.env.example` requiere un tratamiento distinto: no se observaron valores de clave privada, pero sí un identificador real de hoja y un modo inicial conectado a Google Sheets. Debe revisarse antes de autorizar su inclusión.

## 9. GENERADO_NO_GIT

Se identificaron como regenerables:

- `node_modules/`
- `.next/`
- `.pnpm-store/`
- `*.tsbuildinfo`
- `next-env.d.ts`
- renders temporales de PDF
- resultados temporales de pruebas o navegador
- cachés, builds y logs que produzca el runtime.

Deben conservarse los insumos de reproducción: manifiestos, lockfile, configuración y código fuente revisado.

No se clasifican automáticamente como regenerables todos los archivos de `output` o `tmp`: contienen también documentos, copias de trabajo y material cuya autoridad no fue determinada.

## 10. FUENTES EXTERNAS

### FUENTES QUE NO DEBEN MIGRAR COMO DATO A GITHUB

Las autoridades siguientes provienen de los documentos consultados. No se revalidaron permisos ni datos vivos durante esta tarea.

| Fuente | Autoridad | Ubicación documentada | Qué debe existir en GitHub |
|---|---|---|---|
| `VENTAS 2026 (Tiviplay)` | Origen comercial según S0 | Google Drive/Sheets | Identificador lógico, contrato S0-A, campos requeridos, identidad, gates y excepciones |
| `BASE GENERAL` | Universo operacional recurrente según S0 | Dentro de `GESTION_DIA_PAGOS_2026_TIVIPLAY` | Contrato de incorporación/actualización, ownership y reglas de corte |
| `PAGOS [MES]` | Cartera mensual del corte | Libro operativo vivo | Regla S0-B, universo, inclusión/exclusión y controles; sin filas reales |
| `ZELLE / PAYPAL / TRANSF` | Registro auxiliar financiero | Libro operativo vivo | Contrato de evidencia y validación; no sustituir el ingreso bancario |
| Bancos y proveedores de pago | Evidencia del ingreso real | Banco/proveedor autorizado | Requisitos de verificación, roles y referencia lógica; sin extractos ni comprobantes |
| `CONTROL P1/P2/P3` | Evidencia de ejecución del equipo | Libro operativo | Esquema, controles y relación con panel/cliente/servicio |
| Paneles P1/P2/P3 | Estado técnico real del servicio según S0 | Proveedores externos | Contrato de lectura/exportación y conciliación; sin usuarios, contraseñas o exports reales |
| `APERTURA_OPERACION / CIERRE_OPERACION` | Continuidad diaria declarada | `TIVIPLAY_FORMATO_GESTION_OPERATIVA` | Contrato S0-F, procedencia de campos y criterios de repetibilidad |
| `DASHBOARD_360` | Salida derivada prevista en S0 | Formato operativo | Definición de métricas, atribución e incentivos; no asumir ejecución comprobada |
| `GESTION_GENERAL (TIVIPLAY)` | Fuente histórica, fuera del flujo activo desde septiembre según S0 | Drive/Sheets | Referencia de retiro del flujo, periodo y procedencia |
| Leads comerciales JUMOCOL | Fuente comercial separada de TiviPlay | Google Sheets | Contrato `LeadRepository`, esquema y configuración sin secretos |
| Fuentes JM / plan financiero | Autoridad concreta pendiente de confirmar por fuente | Referencias financieras de Drive y archivos locales | Inventario lógico y contrato; no agruparlas como una sola fuente validada |
| Expedientes laborales y archivos de clientes | Custodio autorizado correspondiente | Drive o almacenamiento restringido | Política, plantillas vacías aprobadas y referencias controladas |
| Backups y cortes operativos | Evidencia inmutable del periodo | Almacenamiento restringido por definir/confirmar | Política de retención, manifiesto seguro y procedimiento; no contenido sensible |

Se mantienen las distinciones:

- Pago reportado y pago confirmado.
- Pendiente de pago y vencido.
- Evidencia de ingreso y confirmación del servicio.
- Diseño aprobado y operación validada.

## 11. Estado del runtime multiagente

| Función | Estado | Fuente existente más cercana | Brecha concreta |
|---|---|---|---|
| ACTIVE_CONTEXT | EXISTE PERO DESACTUALIZADO | [ACTIVE_CONTEXT.md](C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/01_CONTEXT/ACTIVE_CONTEXT.md) | Falta S0 y continuidad posterior al 02/09 |
| CHECKPOINT | EXISTE PERO DESACTUALIZADO | [CHECKPOINTS.md](C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/02_RUNTIME/CHECKPOINTS.md) y checkpoints S0 | Hitos posteriores dispersos |
| DECISION_LOG | REQUIERE CONSOLIDACIÓN | [DECISION_LOG.md](C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/00_GOVERNANCE/DECISIONS/DECISION_LOG.md) y contrato S0 | Precedencia y alcance de aprobaciones no enlazados |
| BACKLOG | REQUIERE CONSOLIDACIÓN | Hallazgos del 26/09, fichas DB y diferencias pendientes de S0 | No se localizó un backlog vigente único con prioridad y cierre |
| NEXT_ACTION | REQUIERE CONSOLIDACIÓN | Contrato S0 y CHECKPOINTS | S0 indica validar A; documentos anteriores mantienen otras acciones |
| EVIDENCE_INDEX | REQUIERE CONSOLIDACIÓN | [Validation README][V], manifiestos y verificaciones | No hay un índice único actualizado y filtrado por sensibilidad |
| SOURCE_INVENTORY | EXISTE PERO DESACTUALIZADO | [SOURCE_INVENTORY.md](C:/Users/USUARIO/Documents/JUMOCOL_SYSTEM_OS/01_CONTEXT/SOURCE_INVENTORY.md) | Tabla vacía |
| AGENTS | EXISTE | AGENTS raíz y de aplicación | Instrucciones disponibles; no equivalen a orquestación |
| SKILL / AGENT EXECUTION PACKAGE | NO EXISTE | Scaffolds de Skills, Subagentes y Plugin | No se localizó un paquete ejecutable en el alcance gobernado |

No hace falta crear nueve documentos nuevos. Las funciones pueden cubrirse consolidando archivos existentes y utilizando secciones de checkpoints, contexto y validación.

Las capacidades de Codex instaladas en esta sesión no son componentes desplegados de JUMOCOL OS.

## 12. Contradicciones que requieren decisión

| ID | Contraste | Interpretación respaldada | Decisión pendiente |
|---|---|---|---|
| C01 | Antecedentes incluyen transición por Gestión General; S0 la retira | S0 documenta cambio desde septiembre | Registrar precedencia y preservar flujo anterior como histórico |
| C02 | Contexto raíz al 02/09 frente a S0 del 28/09 | El contexto principal está incompleto | Consolidar autoridad y siguiente acción |
| C03 | “Vitest inconcluso” frente a checkpoint y auditoría con 22 pruebas aprobadas | Son evidencias de cortes diferentes | Actualizar el resumen; no repetir la afirmación antigua como actual |
| C04 | Lint histórico aprobado frente a fallos del 26/09 | La aprobación anterior no cubre el código posterior | Mantener los fallos como hallazgo abierto hasta nueva validación autorizada |
| C05 | README raíz habla de ausencia inicial de fuentes/MVP | Ya existen lectores y snapshot privado | Ajustar alcance y estado documental |
| C06 | Fuente viva descrita con septiembre frente a Excel local de agosto | Son universos y cortes distintos | Declarar autoridad, frescura y aprovisionamiento |
| C07 | Confirmación técnica del adaptador frente a validación financiera por Julián en S0 | El cálculo existente no implementa íntegramente S0-D | No presentar el código como motor de confirmación aprobado |
| C08 | Manuales históricos usan identidades distintas; S0 establece validación compuesta | S0 añade criterios, pero no demuestra una clave técnica durable implementada | Resolver IDs y relaciones antes de escritura |
| C09 | Fechas comercial y técnica mezcladas en antecedentes | S0 distingue `F.PRÓXIMO PAGO` y `F.VENCIMIENTO` | Conservar separación; validar implementación futura |
| C10 | Matriz global de responsabilidades pendiente frente a roles S0 definidos | La definición de dominio no formaliza todos los roles corporativos | Consolidar por alcance |
| C11 | Modelo de persistencia, scaffolds y automatismos objetivo frente a ausencia de ejecución | Diseño documentado no equivale a runtime | Mantener estado no implementado |
| C12 | Fuentes describen cierre mensual; no se localizó evidencia posterior de repetibilidad | No puede declararse ciclo validado | Localizar evidencia o conservar gate abierto |
| C13 | `.env.example` anuncia fixtures, pero selecciona lector Google Sheets | La plantilla no representa un inicio enteramente desconectado | Definir plantilla segura y reproducible |
| C14 | Migrar únicamente la aplicación frente al visor que consume un documento externo a su carpeta | Existe dependencia documental real | Preservar ruta o cambiarla en una implementación posterior explícita |

La igualdad de hashes refuerza la continuidad del corte técnico, pero no reemplaza la resolución de estas contradicciones.

## 13. Recomendaciones para `.gitignore`

**No se creó ni modificó ningún `.gitignore`.**

Se recomienda una protección en la raíz, además de revisar la existente dentro de la aplicación.

Patrones base propuestos:

```gitignore
# Secretos y credenciales
.env
.env.*
**/.env
**/.env.*
*.pem
*.key
credentials*
secrets*
**/credentials*
**/secrets*

# Dependencias y artefactos regenerables
node_modules/
.next/
.pnpm-store/
dist/
build/
out/
cache/
.cache/
coverage/
logs/
*.log
*.tsbuildinfo
next-env.d.ts

# Datos operativos locales
**/data/private/
/ACCESOS_CLAVES.xlsx
*.xlsx
*.xls
*.xlsm
*.xlsb

# Contenedores fuera del alcance inicial
/tmp/
/output/
/JUMOCOL_NETWORK_INFRAESTRUCTURE/
```

Precisiones:

1. La exclusión de Excel es conservadora. Una plantilla vacía futura requeriría revisión y una excepción exacta.
2. No añadir todavía una excepción general para `.env.example`; primero revisar cada plantilla.
3. No excluir globalmente Markdown, CSV o JSON: pueden ser contratos válidos o datos sensibles. La revisión depende de contenido y procedencia.
4. Las carpetas de exports, extractos, backups y snapshots privados deben excluirse por **rutas verificadas** cuando se incorporen nuevas ubicaciones.
5. Los informes, CSV históricos y la prueba con importes reales identificados en la matriz necesitan exclusiones específicas si permanecen en el árbol de trabajo.
6. Mantener `pnpm-lock.yaml`.
7. `.gitignore` no sanea datos incrustados en código y no retira archivos que ya estuvieran versionados.

Para el primer commit, la protección principal debe ser una **lista explícita de archivos permitidos**, no una carga de toda la raíz confiando únicamente en exclusiones.

## 14. Riesgos del primer commit

| Riesgo | Evidencia | Tratamiento |
|---|---|---|
| Incluir credenciales fuera de la app | Libro de accesos en raíz; sin ignore raíz | Exclusión explícita y revisión del conjunto exacto |
| Incluir datos financieros como código | Prueba de integración | Diferir código hasta desacoplarla del dato real |
| Canonizar documentación antigua | Contexto y checkpoints anteriores a S0 | Consolidación previa |
| Perder decisiones posteriores | Contrato S0 reside en otra raíz | Incorporación gobernada con procedencia |
| Presentar copia como autoridad | Dos duplicados comprobados | Un único documento preferido por función |
| Romper el visor | Dependencia de ruta en allowlist y tracing | Migración conjunta o cambio técnico autorizado |
| Obtener pruebas “verdes” con cobertura omitida | La integración usa `describe.runIf(existsSync(...))` | Mostrar omitidos y límites; no afirmar reproducción completa |
| Mezclar la web pública | Staging de JUMOCOL_COM en `tmp` | Excluir del repositorio de intranet |
| Incorporar infraestructura sensible | Configuraciones y carpeta privada | Fuera del primer alcance |
| Asumir configuración remota | Privacidad/permisos GitHub no verificados | Comprobación antes de cualquier publicación |
| Confundir primer commit con despliegue | Sistema parcial y fuentes externas | Declarar alcance documental y gates técnicos separados |

## 15. Oportunidades REUSE-FIRST

No se realizó discovery externo. Los candidatos mencionados aquí proceden de documentación existente; no se evalúan mantenimiento, licencia ni adecuación actual.

| Necesidad | Capacidad requerida | Ya existe internamente | Desarrollo propio justificado | Candidato externo ya documentado | Requiere discovery externo |
|---|---|---|---|---|---|
| Continuidad entre sesiones | Contexto, decisiones, checkpoints e índice | SÍ, fragmentado | NO para crear otra estructura paralela | Ninguno necesario para consolidar los archivos existentes | NO |
| Lectura de Sheets/Excel | Adaptadores y normalización | SÍ, parcial | NO para reconstruir lectores desde cero | `google-auth-library`, ExcelJS ya utilizados | NO para reutilización actual |
| Visor documental | Lectura controlada y presentación | SÍ | NO para duplicar el visor | No se localizó biblioteca candidata adoptada para reemplazarlo | NO en esta migración |
| Identidad y persistencia operacional | Eventos, estados, permisos e idempotencia | NO como capacidad ejecutable evidenciada | NO DETERMINADO | Odoo, HubSpot, Salesforce y Zoho aparecen como objetivos de integración en el mapa técnico | SÍ, posterior |
| Cola de pendientes y escalamiento | Responsables, próximas acciones y SLA | NO como runtime evidenciado | NO DETERMINADO | Ninguno específico localizado | SÍ, después de validar S0 |
| Cierre repetible y continuidad | Cálculos, corte, excepciones y respaldo | NO demostrado como proceso completo | NO DETERMINADO | Ninguno específico localizado | SÍ, tras definir contratos y fuentes |
| Orquestación de agentes | Herramientas, permisos, ejecución y gates | NO; scaffolds documentales | NO DETERMINADO | Ninguno de los frameworks citados en la solicitud se localizó en los documentos gobernados revisados | SÍ, solo si la necesidad queda validada |
| Detección de secretos/PII para migración | Inspección del conjunto permitido | NO se localizó un control automatizado propio | NO para construir un escáner propio en esta fase | Ninguno documentado localizado | SÍ, acotado antes de migrar código |
| Autenticación y permisos | Identidad y control de acceso | NO evidenciado en el corte reutilizado | NO DETERMINADO | Ninguno adoptado localizado | SÍ, antes de exposición remota |

Odoo, HubSpot, Salesforce y Zoho quedan registrados únicamente como **CANDIDATO YA IDENTIFICADO**.

OpenAI Agents SDK, LangGraph, Pydantic AI, n8n, Browser Use, agent-browser y BrowserSkill aparecen como ejemplos en la solicitud. No se encontró evidencia suficiente para presentarlos como decisiones previas de este repositorio.

## 16. Backlog mínimo de decisiones previas a migración

| ID | Prioridad | Decisión o trabajo | Criterio de cierre |
|---|---|---|---|
| B01 | P0 | Localizar inventario del 05/10 y cierres posteriores | Referencia disponible o limitación aceptada expresamente |
| B02 | P0 | Establecer precedencia del contrato S0 | Baseline, contrato y antecedentes relacionados sin afirmar validación E2E |
| B03 | P0 | Aprobar lista exacta del primer commit | Solo archivos seleccionados y revisados |
| B04 | P0 | Completar protección de secretos y datos | Ignore raíz propuesto revisado; contenido permitido inspeccionado |
| B05 | P0 | Consolidar contexto y fuentes | ACTIVE_CONTEXT, PERSISTENT_CONTEXT y SOURCE_INVENTORY coherentes |
| B06 | P0 | Integrar continuidad S0 | CHECKPOINTS y DECISION_LOG enlazan el contrato y su gate pendiente |
| B07 | P0 | Verificar repositorio remoto | Destino, privacidad, permisos y estado inicial confirmados |
| B08 | P1 | Decidir tratamiento de evidencias sensibles | Original restringido y referencias seguras; sin cifras ni PII copiadas |
| B09 | P1 | Preparar lote técnico posterior | Pruebas sintéticas, plantilla segura y dependencias documentales preservadas |
| B10 | P1 | Consolidar ownership por dominio | Roles S0 separados de responsabilidades corporativas pendientes |
| B11 | P2 | Seleccionar históricos adicionales | Inclusión justificada por continuidad, no por volumen disponible |
| B12 | P2 | Discovery reuse-first acotado | Una necesidad validada y criterios de comparación antes de elegir herramienta |

La selección de frameworks, nube o automatización no bloquea el primer commit documental.

## 17. Propuesta de alcance del PRIMER COMMIT

**Propuesta: 24 archivos para establecer gobierno y continuidad documental.**

Este commit no contendría todavía la aplicación ni se presentaría como un sistema ejecutable. Su reproducibilidad consiste en recuperar instrucciones, autoridad, estado, fuentes y siguiente acción sin depender del historial del chat.

### Lista exacta propuesta

Los siguientes son **destinos propuestos para el primer commit**. Solo este informe se ha creado por autorización posterior; los demás archivos no se crearon ni modificaron en esta tarea.

| Grupo | Archivos | Cantidad |
|---|---|---:|
| Entrada | `AGENTS.md`; `README.md` | 2 |
| Decisiones | `00_GOVERNANCE/DECISIONS/DECISION_LOG.md` y los once documentos enumerados abajo | 12 |
| Contexto | `01_CONTEXT/ACTIVE_CONTEXT.md`; `01_CONTEXT/PERSISTENT_CONTEXT.md`; `01_CONTEXT/SOURCE_INVENTORY.md` | 3 |
| Runtime | `02_RUNTIME/OPERATING_CYCLE.md`; `02_RUNTIME/CHECKPOINTS.md` | 2 |
| TiviPlay S0 | Los dos documentos S0 enumerados abajo | 2 |
| Automatización | `05_AUTOMATION/README.md` | 1 |
| Evidencia de migración | `04_VALIDATION/AUDITS/TIVIPLAY/JUMOCOL_OS_GITHUB_MIGRATION_READINESS_2026-10-05.md` | 1 |
| Exclusiones | `.gitignore` raíz, preparado en una tarea autorizada posterior | 1 |
| **Total** | | **24** |

Documentos de decisión:

```text
00_GOVERNANCE/DECISIONS/DEC-2026-06-12-001_INITIAL_STRUCTURE.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-002_APPLICATION_LAYER.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-003_CORPORATE_VISUAL_IDENTITY.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-004_TIVIPLAY_MARKETING_WORKFLOW.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-005_LANDING_PAGE_COMMERCIAL_FUNNEL.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-006_CLIENT_WEB_DELIVERY_CYCLE.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-007_GOOGLE_SHEETS_LEAD_READ_MODEL.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-26-008_CLIENT_OPERATIONAL_STANDARD.md
00_GOVERNANCE/DECISIONS/DEC-2026-08-27-009_TECHNOLOGY_AI_COMMAND_CENTER.md
00_GOVERNANCE/DECISIONS/DEC-2026-09-02-010_OPERATIONAL_CONTINUITY_SEP_DEC_2026.md
00_GOVERNANCE/DECISIONS/DEC-2026-09-02-011_TIVIPLAY_DOCUMENTAL_COMMAND_CENTER.md
```

Documentos S0:

```text
03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_PROCESO_OPERATIVO_ACTUAL_BASELINE_S0_2026-09-28.md
03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md
```

### Preparación necesaria

- Consolidar README, contexto, inventario y checkpoints antes de incluirlos.
- Registrar las relaciones con S0 en el índice de decisiones, sin inventar una nueva aprobación ni alterar retrospectivamente las decisiones originales.
- Preservar los documentos S0 con versión, fecha, procedencia y condición parcial.
- Explicar en README que la aplicación y otros documentos permanecen fuera de ese primer corte.
- Distinguir referencias externas de enlaces internos incluidos en el commit.
- Revisar íntegramente los 24 archivos antes del staging.
- Este informe ya fue guardado por autorización expresa posterior. Su inclusión en Git sigue sujeta a la revisión del primer commit.

La importación de S0 reutiliza una carpeta existente con responsabilidad de contexto. No requiere una capa nueva.

### Fuera del primer commit

Código de aplicación, datos, secretos, informes financieros originales, capturas, expedientes, staging, infraestructura, paquetes históricos completos y scaffolds que no sean necesarios para esa primera recuperación de contexto.

## 18. Definition of Done para autorizar ese primer commit

- [ ] El inventario del 05/10 y los cierres posteriores fueron localizados, o su ausencia quedó aceptada como límite.
- [ ] El contrato S0 v0.2 tiene precedencia documental definida dentro de su dominio.
- [ ] No se presenta S0, `FLOW-TIVI-001` ni la intranet como operación E2E validada.
- [ ] README, contexto activo, contexto persistente, decisiones y checkpoints son coherentes.
- [ ] SOURCE_INVENTORY identifica autoridad, ubicación lógica, corte y sensibilidad de cada fuente relevante.
- [ ] Los 24 archivos exactos fueron revisados; cualquier variación modifica explícitamente la lista.
- [ ] No hay secretos, credenciales, filas de clientes, expedientes, extractos ni importes operativos reales.
- [ ] Las referencias históricas conservan fecha y alcance.
- [ ] No se incluyen duplicados comprobados.
- [ ] `.gitignore` cubre la raíz y las exclusiones específicas necesarias.
- [ ] Los enlaces internos resuelven dentro del conjunto incluido; las referencias externas están identificadas.
- [ ] El destino remoto, su privacidad, permisos y estado inicial están verificados.
- [ ] Se revisó el contenido exacto preparado para commit, sin incorporar directorios completos por defecto.
- [ ] Un lector nuevo puede identificar autoridad, gate abierto, bloqueos y siguiente acción usando únicamente el repositorio.
- [ ] Existe autorización para ejecutar el commit. Esta tarea no la ejecuta ni sustituye.

**Evolución futura:** incorporar el lote técnico después de revisar sensibilidad, reproducibilidad sin datos privados y dependencias documentales. La validación operativa de S0 y el discovery externo son trabajos separados.

**Archivo creado por autorización posterior:** `04_VALIDATION/AUDITS/TIVIPLAY/JUMOCOL_OS_GITHUB_MIGRATION_READINESS_2026-10-05.md`. Razón operacional: entregar un artefacto persistente, revisable y reutilizable para decidir la migración. Ningún archivo preexistente fue modificado.  
**Git y configuraciones modificados:** ninguno.  
**Fuentes operativas modificadas:** ninguna.

---

**ESTADO**

Informe de preparación entregado y guardado como documento Markdown. La estructura es reutilizable. La migración completa y el primer commit todavía requieren la preparación indicada.

**BLOQUEOS**

Inventario del 05/10 y cierres posteriores no localizados; contexto principal desactualizado; protección raíz inexistente; datos sensibles distribuidos en documentos, capturas y pruebas; destino remoto sin verificar.

**DECISIONES REQUERIDAS**

Precedencia S0, aceptación o resolución de antecedentes faltantes, selección del lote documental, tratamiento de evidencias sensibles y consolidación de continuidad.

**PRIMER COMMIT PROPUESTO**

24 archivos de gobierno, contexto, runtime documental, contrato S0, informe y exclusiones. Sin aplicación ni datos vivos.

**NEXT ACTION**

Preparar, en una tarea de escritura explícitamente autorizada, los demás archivos del conjunto de 24 y revisar también este informe. Mantener el commit y la publicación pendientes hasta satisfacer la Definition of Done.