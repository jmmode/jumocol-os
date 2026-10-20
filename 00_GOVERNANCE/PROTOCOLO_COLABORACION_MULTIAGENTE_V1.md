# JUMOCOL OS — Protocolo de Colaboración, Decisión y Ejecución Multiagente
**ID:** GOV-MA-001 · **Versión:** 1.0 · **Fecha de adopción documental:** 2026-10-19
**Estado:** IMPLEMENTADO como protocolo documental por instrucción expresa de Dirección; su cumplimiento operativo en cada proyecto requiere evidencia.
**Alcance:** Todas las iniciativas, proyectos y agentes que colaboren bajo JUMOCOL OS, incluidos TiviPlay, intranet, EVIDENCIA, servicios, marketing y comercio.
**Autoridad:** Dirección (JM) aprueba prioridades, planes, propietarios, permisos, despliegues y excepciones críticas.
**Repositorio canónico:** `jmmode/jumocol-os` · **Entrada para agentes:** `AGENTS.md` → este protocolo → `02_RUNTIME/METODOLOGIA_EJECUCION_REPRODUCIBLE_MER_V1_2026-10-18.md` → documentos del dominio.

## 1. Objetivo
Convertir ideas en resultados operacionales **sin perder contexto ni duplicar trabajo**, aprovechando revisión independiente de múltiples sistemas de IA y reutilizando código/documentación existentes.

**Ciclo obligatorio:**
```text
IDEA / NECESIDAD (Dirección / equipo)
    ↓
CHATGPT: propuesta inicial fundamentada
    ↓
REVISIÓN INDEPENDIENTE: Claude + Codex + Grok + OpenClaw
    ↓
CHATGPT: consolidación única, desacuerdos y recomendación
    ↓
DIRECCIÓN: aprueba, modifica, rechaza o pospone
    ↓
GITHUB: plan aprobado + backlog + Work Orders + owner + gates + cronograma
    ↓
COLABORADORES: reciben la MISMA versión aprobada y confirman su tarea
    ↓
EJECUCIÓN CONTROLADA: código / pruebas / PR / evidencia
    ↓
REVISIÓN CRUZADA + VALIDACIÓN HUMANA SEGÚN RIESGO
    ↓
CHECKPOINT + KPIs + DECISION LOG + NEXT ACTION en GitHub
    ↺
```

**Regla estructural:** los modelos proponen y ejecutan tareas autorizadas; **no votan aprobaciones de negocio ni sustituyen a Dirección**. Ninguna idea, revisión favorable o propuesta consolidada es autorización tácita para desplegar, gastar, escribir en sistemas vivos o publicar.

## 2. Participantes y roles funcionales
Los roles son **por fase y Work Order**, no permisos permanentes. No presumir conexiones, accesos o disponibilidad de agentes.

| Participante | Responsabilidad base | Restricciones |
|---|---|---|
| **Dirección / JM** | Define problema, prioriza, aprueba versión, cronograma, owners, costos, seguridad, gates y despliegue; conserva `Confirmado JM` | Puede delegar ejecución rutinaria, no la firma financiera vigente sin nueva decisión formal |
| **ChatGPT (coordinación)** | Investiga contexto, propone primera versión; reúne aportes, compara fuentes, resuelve duplicidad conceptual, redacta consolidado y checkpoints | No sustituye la aprobación de Dirección; no puede afirmar que otros agentes leyeron GitHub hasta tener confirmación |
| **Claude** | Revisión de reglas, procesos, SOP, riesgos, pruebas y código según Work Order | No cambia documentos ni producción sin alcance autorizado |
| **Codex** | Auditoría del repositorio, diseño de cambios acotados, implementación y pruebas en rama/PR autorizados | Prohibido fusionar/desplegar por presunción; respetar `AGENTS.md` |
| **Grok** | Revisión independiente, simplificación, valor comercial, detección de desperdicio y riesgos | No convierte opinión en evidencia de producción |
| **OpenClaw** | Agente/orquestador de ejecución e integraciones cuando esté configurado; contribuye a revisión y Work Orders según herramientas reales | OpenClaw no debe suponerse un modelo LLM específico ni contar con credenciales/permisos hasta verificarlos |
| **Otros agentes/modelos** | Roles puntuales definidos en Work Orders aprobados | Mismos gates, evidencia, trazabilidad y controles |

**Terminología canónica:** escribir **OpenClaw**, nunca `OpenCloud`. Distinguir `Grok` (asistente/modelo) de `Groq` (proveedor/plataforma de inferencia cuando aplique); no asumir equivalencia.

## 3. Fuente de verdad y repositorio obligatorio
1. **GitHub = fuente canónica del trabajo técnico y del gobierno:** protocolos, AGENTS, contratos, planes versionados, revisiones resumidas, decisiones, Work Orders, backlog, código, pruebas reproducibles, evidencias no sensibles y checkpoints.
2. **Drive/Sheets/bancos/paneles = fuentes operacionales reales según dominio:** NO migrar registros personales, credenciales, pagos, extractos, bases vivas, capturas sensibles ni tokens a GitHub. En GitHub conservar únicamente referencias lógicas, ubicación autorizada, fecha/corte, custodio y evidencias sanitizadas.
3. **Chats de cada modelo = canales de trabajo efímeros:** una conversación no es registro de decisión. El cambio relevante se conserva en GitHub antes de pretender continuidad.
4. En cada respuesta/revisión, registrar **repositorio + ruta + rama/commit consultado + fecha + qué se probó/no se probó**. Un enlace no prueba que fue leído.
5. Antes de crear archivo o función, buscar la capacidad existente. Reutilizar carpetas, módulos y `ACTIVE_CONTEXT`, `CHECKPOINTS`, `DECISION_LOG`, `BACKLOG`, `EVIDENCIAS` y `NEXT_ACTION` disponibles; no generar duplicados.
6. Nunca subir secretos o información sensible, aunque el repositorio sea privado. Sanitizar también salida de tests/logs/JSON generados antes de `git add`.

## 4. Gates de la colaboración: secuencia exigida

### G0 — Captura de idea y elegibilidad
Origen: Dirección, equipo, incidencia real o necesidad demostrada. Registrar: ID, problema, beneficio, dueño propuesto, urgencia, sistema afectado, fuente/evidencia, costo y vínculo con gate activo. Si no aporta al foco activo → BACKLOG, sin abrir trabajo paralelo.

### G1 — Propuesta inicial (ChatGPT)
Entregar: objetivo único, hechos comprobados con fuentes y cortes, recursos reutilizables, brechas, solución mínima, alternativas, dependencias, riesgos, indicadores, estimación de esfuerzo como hipótesis y cronograma tentativo. Identificar explícitamente qué **ya existe** en código y cuál es su verdadero nivel de validación.
**Salida:** propuesta v0.x con estado `REQUIERE DECISIÓN`. Publicar una única ruta del plan; no enviar variantes distintas a cada modelo.

### G2 — Revisión independiente multiactor
Compartir a Claude, Codex, Grok y OpenClaw **el mismo commit/rutas y el mismo encargo**. Cada uno responde sin sobrescribir el plan:
- Nombre/sistema, fecha, versión revisada, archivos efectivamente leídos y capacidad real.
- Hasta **3 mejoras** con impacto, esfuerzo, riesgos, fuente, dependencia, gate y evidencia.
- **1 riesgo crítico**, contradicción y mitigación.
- Inventario exacto de código reutilizable; pruebas y datos faltantes.
- Primera tarea ejecutable, resultado verificable; no modificar nada en esta fase.
Si un participante no puede consultar GitHub, debe declararlo y pedir un extracto/archivo de la versión exacta. **No bloquear indefinidamente por falta de respuesta**: Dirección puede cerrar consulta con las revisiones disponibles y registrar cuáles faltaron.

### G3 — Consolidación única (ChatGPT)
Construir **matriz de discrepancias**: propuesta, autores, fuente, verificación, costo/beneficio, riesgo, decisión recomendada y estado (**ACEPTAR / AJUSTAR / POSPONER / DESCARTAR**, como *tratamiento de propuestas*, NO estados operativos).
Detectar solapamientos, contradicciones, supuestos falsos, seguridad, tareas innecesarias y duplicidad. Si dos propuestas discrepan, resolver con evidencia o escalar a Dirección; no fusionarlas silenciosamente.
**Salida:** una sola propuesta de plan **v0.x consolidada**, con diferencias explícitas respecto de la versión previa y acciones recomendadas. No borrar las razones de las propuestas rechazadas.

### G4 — Aprobación expresa de Dirección
Dirección decide alcance, gates, responsables, cronograma, presupuesto, nivel de riesgo, accesos y qué puede modificar cada agente. Registrar fecha, autor de aprobación, ID/versión/commit, límites y condiciones en `DECISION_LOG.md` o referencia al plan si el registro tiene función de decisión.
**Sin aprobación → `REQUIERE DECISIÓN`, solo análisis/lectura/pruebas sintéticas ya autorizadas.**
Una aprobación del **protocolo** NO aprueba automáticamente ningún plan de ejecución.

### G5 — Publicación del plan aprobado y asignación
Actualizar **el plan existente**, no crear otro plan paralelo. Cada Work Order (WO) debe incluir:
```text
WO-ID | versión/commit base | prioridad | entregable | alcance/no alcance
owner humano | agente ejecutor | revisor independiente | dependencias
inicio/fecha límite o ventana | esfuerzo/costo aprobado | entradas autorizadas
permisos de lectura/escritura | rama/rutas a modificar | pruebas/DoD
gates/riesgos/rollback | evidencia pública saneada | checkpoint/NEXT_ACTION
```
Entregar a **todos** los colaboradores el mismo commit del plan aprobado y la lista de WOs. Cada uno confirma su WO, disponibilidad y restricciones, sin interpretarlo como permiso para otros cambios.
Evitar ediciones concurrentes del mismo archivo: un owner por ruta/cambio, otros revisan por PR o revisión textual.

### G6 — Implementación y prueba controlada
Ejecutar únicamente WOs aprobadas. Preferir rama/PR para código, pruebas sintéticas, validación de tipos, lint, tests y reproducciones idempotentes. Separar cambios técnicos de financieros y productivos. Cambios sensibles requieren mínimo privilegio, respaldo, procedimiento de reversión y aprobación específica.
**No alterar producción por el mero hecho de que `npm test` pase.** No usar salidas generadas con PII como evidencia versionable.

### G7 — Revisión cruzada y aceptación
Un participante distinto al ejecutor inspecciona cambios, pruebas y riesgos. Dirección o dueño operacional valida contra fuente real y criterios del dominio antes de habilitar producción.
Estados oficiales de ejecución/auditoría: **IMPLEMENTADO, PARCIAL, NO IMPLEMENTADO, BLOQUEADO, REQUIERE DECISIÓN, VALIDADO**.
`VALIDADO` siempre dice **qué capacidad**, **con qué evidencia**, **cuándo y con qué límites**. `IMPLEMENTADO` no significa cierre de gate.

### G8 — Checkpoint, métricas y siguiente iteración
Dejar evidencia durable en el **runtime existente**: fecha/hora/corte; objetivo y WO; fuente y versión; cambios y commit/PR; pruebas/resultados; tiempo humano antes/después si medido; incidentes; decisiones y riesgos; pendientes/owners; siguiente acción exacta. Dirección determina si se promueve un gate o se vuelve a revisar.
No reabrir discovery ni reescribir contrato validado en sesiones posteriores; agregar solo regla, excepción, test o corrección sustentada.

## 5. Gestión de propuestas, aprobaciones y cronograma
- **Un único plan vigente por iniciativa** (ruta estable); actualizar versión e historial dentro del archivo. Guardar propuestas/modelos como sección resumida en el plan o enlace a una discusión/issue/PR existente, evitando crear un archivo por respuesta de IA.
- **Un único equipo sobre una única versión aprobada**: plan propuesto no equivale a asignaciones confirmadas.
- Cada WO especifica no solo *qué* sino *quién*, *cuándo*, *evidencia*, *qué no se hace* y *qué condición habilita la siguiente*.
- **Cambio de alcance**: proponer diff y efecto en backlog/cronograma; volver a G3/G4 si modifica permisos, riesgo, fechas, presupuesto, fuente canónica o Definition of Done.
- Si surge incidente operacional urgente, Dirección puede autorizar **excepción de coordinación** acotada (alcance, owner y control); esto NO elimina controles financieros, protección de datos, ni obligación de registrar posterior checkpoint.

## 6. MER y pruebas de valor
El protocolo gobierna **cómo los modelos deliberan y reciben autorizaciones**. MER gobierna **cómo un proceso pasa de manual a repetible y medible**. Se aplican juntos sin duplicar sus fases.
Prioridad: proteger flujo de caja y operaciones → ejecutar/reutilizar lo existente → medir errores y tiempo humano → extender solo brecha demostrada → escalar.
Usar cálculo determinístico antes de IA, agentes para pasos repetitivos y un modelo de más capacidad solo para ambigüedades. Nunca exigir cinco modelos para una corrección menor: en G2 puede bastar revisión proporcional al riesgo por decisión explícita de Dirección.

## 7. Aplicación inmediata: TiviPlay, semana 19–25 octubre 2026
Plan: `03_AREAS/01_OPERACION/TIVIPLAY/PLAN_OPERATIVO_MER_2026-10-19_AL_25.md`.
- **Revisiones recibidas y evaluadas en conversación, pendientes de consolidación formal:** Grok y Claude.
- **Revisiones pendientes, si Dirección mantiene consulta:** Codex y OpenClaw.
- **Hallazgo reiterado:** existe `05_AUTOMATION/tiviplay-monthly-close-v1` y runtime de lectura, por tanto no reescribir su motor.
- **Riesgos P0:** JSON de evidence contiene preview con posibles credenciales/PII; oracle basado en conteos no prueba reconciliación por registro; dos lógicas de selección pueden divergir; el replay 99 contra la hoja preliminar prueba lectura, no reconstrucción de `BASE GENERAL` anterior.
- **Siguiente decisión:** consolidar las propuestas y aprobar WO para saneamiento de evidencia, baseline/replay seguro, motor compartido y agenda piloto. `Confirmado JM` sigue siendo aprobación exclusiva de Dirección.
- **No autorizado por la adopción de este protocolo:** editar datos productivos, abrir intranet públicamente, desplegar chatbot o dar poderes financieros al agente.

## 8. Checklist rápido por sesión
- [ ] ¿Leí `AGENTS.md`, protocolo, MER, contrato del dominio y plan/commit vigente?
- [ ] ¿Existe ya una función o documento que resuelva el problema?
- [ ] ¿Estoy en G0–G8 y conozco el gate activo?
- [ ] ¿Mi fase es proponer, revisar, consolidar, aprobar, ejecutar o validar?
- [ ] ¿Tengo WO y permisos explícitos para modificar algo?
- [ ] ¿Respeto datos privados y permisos humanos?
- [ ] ¿Puedo mostrar prueba reproducible sin exponer datos?
- [ ] ¿Actualicé el checkpoint y la siguiente acción?

**NEXT ACTION:** terminar la consulta multiagente TiviPlay, consolidar en el mismo plan semanal, solicitar aprobación de Dirección y publicar WOs/cronograma antes de ejecución.
