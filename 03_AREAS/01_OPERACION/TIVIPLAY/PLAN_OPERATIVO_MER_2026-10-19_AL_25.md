# TiviPlay — Plan semanal de ejecución MER | 19–25 octubre de 2026
**ID:** TIVI-MER-S3-2026-W43 · **Versión:** v0.1 propuesta · **Corte de preparación:** 2026-10-18 · **Estado:** REQUIERE DECISIÓN
**Dominio:** JUMOCOL OS / TiviPlay · **Dueño de decisiones:** Dirección (JM)
**Tipo:** orden de trabajo y contrato de coordinación multiagente. **NO** autoriza automatización de producción, cambios a datos vivos ni confirmaciones financieras.

## 0. Lectura obligatoria, precedencia y principio de enfoque
1. `AGENTS.md` (gobierno de cambios).
2. `00_GOVERNANCE/PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md` (GOV-MA-001, ciclo de ideas, revisión, decisión y Work Orders).
3. `02_RUNTIME/METODOLOGIA_EJECUCION_REPRODUCIBLE_MER_V1_2026-10-18.md (MER v1.0, propuesta).
4. `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md` (reglas TiviPlay aprobadas como **diseño**, aún no totalmente validadas).
5. `08_RUNTIME/SEMANA_2026-10-19_AL_25.md` (priorización ejecutiva general).
6. Antecedentes fechados: `TIVIPLAY_CIERRE_CICLO_Y_REPETIBILIDAD_2026-09-30.md` y auditoría de intranet 26/09, disponibles en contexto restringido; no presumir que ambos estén en GitHub.

**Precedencia:** contrato S0 gobierna negocio; MER gobierna la manera de construir/probar; S3 organiza estandarización, sin saltar gates S0/S2. El calendario no equivale a aprobación. Si S2 no tiene evidencia de cierre, la semana empieza validando sus brechas y S3 solo avanza en preparación explícita.

## 1. Norte de negocio y límites
**Objetivo P0 único:** disminuir carga manual del equipo y elevar la capacidad de recaudo/retención y facturación confiable, mediante un primer flujo TiviPlay reproducible e integrable a la intranet.
Se busca mejorar productividad, no mostrar métricas ficticias. Los ingresos dependerán de acciones comerciales y hechos de pago observados.

Resultados de esta semana, sujetos a gates:
- **R1 — Recaudo y datos:** obtener baseline verificable de cobrado confirmado, cartera de este ciclo, vencidos verdaderos, por vencer, renovaciones y gestiones pendientes, en USD/COP separados.
- **R2 — Replay funcional:** reconstruir la selección del ciclo septiembre→octubre sobre copia/snapshot gobernado, comparar contra salida aprobada y demostrar dos ejecuciones idempotentes o registrar bloqueo verificable.
- **R3 — Intranet útil:** entregar un flujo de lectura o prototipo de agenda/excepciones que un asesor pueda probar sin alterar fuentes; registrar fricción evitada.
- **R4 — Soporte y chatbot:** dejar SOPs y prototipos acotados para atención, diagnóstico y transferencia a humanos; ejecución piloto únicamente si R1/R2 y controles de acceso lo permiten.
- **R5 — Transferencia multiagente:** consolidar plan, contratos, tests, decisiones y checkpoint para que otro modelo reproduzca sin chats anteriores.

**Fuera de alcance sin autorización posterior:** escrituras productivas en Sheets, conciliación bancaria aprobada por agente, pago Confirmado JM autónomo, altas definitivas, modificación de paneles P1/P2/P3, chatbot público con datos sensibles, despliegue remoto de intranet sin login/RBAC, CRM nuevo o reingeniería total del stack.

## 2. Baseline histórico: evidencia versus estado vivo
- 30/09: se recorrió manualmente el paso septiembre→octubre; salida histórica `PAGOS OCTUBRE 2026` con **99 fichas**, cinco semanas **13/30/27/16/13**, cartera nominal **USD 4.090,50 + COP 375.730**. Estos son **valores esperados del replay del corte histórico**, no ingresos ni cartera actuales del 19/10.
- Auditoría 26/09: la intranet local Next.js tenía lectura histórica (snapshot Excel de 54 hojas) y visualizaciones; no soportaba operación transaccional completa, autenticación ni cierre financiero. No afirmar que esa auditoría describe el estado presente sin inspección reciente.
- Contrato S0 v0.2: S0-A a S0-F diseñados y aprobados, pero validación completa **PARCIAL**. El cierre de septiembre no certificó banco ni exportaciones de servicio.
- Esta semana debe revisar el **runtime real** y las fuentes reales antes de decidir integraciones y fechas de un MVP.
- Incertidumbres P0: identidad compuesta CLIENTE/USUARIO/PANEL; duplicados; canonicidad por corte; `Confirmado JM`; diferencias de valor/moneda; aprobación de reglas de cierre; privacidad/permisos del repo y app.

## 3. Arquitectura de fuentes y reglas que NO deben romperse
`VENTAS 2026 (Tiviplay)` → `GESTION_DIA_PAGOS_2026_TIVIPLAY` (`BASE GENERAL`, `PAGOS [MES]`, medios) → `TIVIPLAY_FORMATO_GESTION_OPERATIVA` (asignación/cierres/servicio). `GESTION_GENERAL (TIVIPLAY)` es **histórica**, retirada del flujo activo según S0.
- `F.PRÓXIMO PAGO` = fecha comercial; `F.VENCIMIENTO` = fecha técnica.
- `PENDIENTE DE PAGO` ≠ `VENCIDO`; comprobante ≠ ingreso bancario confirmado; conciliación financiera ≠ renovación del servicio.
- El asesor registra `PENDIENTE CONFIRMACIÓN`; solo JM convierte a `PAGO CONFIRMADO` tras fuente financiera independiente. Ningún algoritmo simula la firma JM.
- S0-A: `TC=1`, campos completos, pago JM y coincidencia de identidad/paridad antes de alta; ambiguos a Back Office.
- S0-B: `BASE GENERAL` gobernada para generar `PAGOS [MES+1]`; conservar cortes, excepciones y monedas.
- S0-C/D: cada gestión registra actor, fecha, resultado, siguiente acción y soporte; conciliación distingue método, monto, moneda, ciclo y referencia.
- S0-E: renovación sólo por pago autorizado o excepción aprobada; cotejo PANEL↔CONTROL↔BASE.
- S0-F: cierre debe derivarse y tener corte/backups rastreables, no requerir doble digitación ni ocultar excepciones.

## 4. Metodología MER aplicada: UN flujo vertical primero
**MER-0 (selección):** caso de uso rector: `venta/renovación → pago y verificación → actualización operativa → próxima acción`. Para esta semana se prioriza **replay y agenda de cobro**; no intentar automatizar S0-A–F íntegramente.
**MER-1 (referencia):** usar corte histórico septiembre→octubre y documentar cuánto tarda su ejecución manual o estimación histórica etiquetada. La salida del 30/09 es referencia observada, pero reconstrucción total de Base exige snapshot anterior a correcciones; si no existe, reportar límite y probar sólo reconstrucción de octubre.
**MER-2 (contrato):** derivar un paquete ejecutable mínimo del S0, sin cambiar la regla. Entradas/campos/cortes, decisiones JM, excepciones, garantías de idempotencia y DoD.
**MER-3 (mínimo ejecutable):** módulo de lectura/normalización/diff puro con pruebas sintéticas; exportar propuestas y excepciones, sin writes. Reutilizar adaptadores existentes si las revisiones de seguridad lo permiten; si el código local no está en GitHub, reportar rutas/diferencias antes de migrar.
**MER-4 (replay):** comparar ID lógico + cliente/usuario según contrato + fecha, ciclo, moneda, monto y clasificación, además de **99** filas / distribución semanal / totales. Ejecutar dos veces con misma entrada congelada; segunda corrida sin duplicados ni mutaciones.
**MER-5 (piloto):** mostrar resultados en intranet como lectura/agenda supervisada sólo tras auth, acceso mínimo y frescura de fuente verificadas; si faltan, demo aislada sintética.
**MER-6 (transferencia):** registrar pruebas, logs seguros, consumo/costos, tiempo del asesor antes/después, backlog y siguiente acción.

## 5. Entregables y gates diarios propuestos
| Fecha | Foco | Salida verificable | Owner propuesto | Criterio mínimo / condición |
|---|---|---|---|---|
| **Lun 19/10** | P0 fuentes + línea base + gate S2 | Inventario de fuentes vivas/cortes, mapa SOP pagos/facturación/conciliación/ventas/back office, baseline comercial con denominadores y responsable, lista P0 | Dirección + Back Office + ChatGPT | Conteos/fuentes reproducibles; ninguna cifra presentada como ingreso sin JM. Decidir si S2 pasa gate o se mantiene brecha documentada |
| **Mar 20/10** | P0 replay etapa MER-1/2 | Dataset congelado, contrato de entrada/salida, comparación manual esperada, decisiones identidad/fechas; backlog excepciones | Operaciones + Codex (propuesto) | Disponibilidad legal de snapshot, referencia de 99; si falta pre-corte, limitar alcance honestamente |
| **Mié 21/10** | P0 MER-3/4 + intranet | CLI/función de diff con tests sintéticos y segunda ejecución; maqueta de cola de recaudo solo lectura | Codex/desarrollo + auditoría ChatGPT | Dos corridas idempotentes; resultados y discrepancias documentadas; sin cambios productivos |
| **Jue 22/10** | P1 soporte técnico | Taxonomía inicial de incidencias frecuentes basada en tickets reales, SOP diagnóstico→resolución→escalamiento, prueba de 3 casos anonimizados | Soporte + Claude (propuesto) | Owner y evidencias por incidente; ninguna operación sobre panel sin autorización |
| **Vie 23/10** | P1 chatbot | Diseño de intenciones/FAQ desde fuente aprobada, handoff a asesor, prueba de conversaciones sintéticas, controles de identidad | Atención + modelo colaborador (propuesto) | Cero promesas financieras/falsas confirmaciones; no despliegue público si faltan permisos |
| **Sáb 24/10** | P0 QA y medición | Reporte diff, seguridad, reproducibilidad, tiempo humano, tokens/costo si medibles, retroalimentación asesor | Codex + operaciones + ChatGPT | Sin diferencias inexplicadas en casos aprobados; pendientes con owner y fecha |
| **Dom 25/10** | P0 gobierno | Checkpoint, semáforo S2/S3, decisión de MER-5 o continuar piloto, plan 26–31/10 | Dirección | Firma de gate o decisión explícita de avanzar con brecha conocida |

**Regla de capacidad:** si P0 tarda más, soporte/chatbot permanecen preparación documental. No competir por recursos con cobro, facturación ni atención diaria. No declarar S3 abierto sólo por ser semana 19–25.

## 6. Work Orders ejecutables para los colaboradores (propuestas, no encargos confirmados)
### WO-01 — Gobernanza y baseline (ChatGPT + Dirección)
Entradas: S0, reportes operativos y fuente real. Salida: matriz `fuente → campo → owner → corte → definición KPI`, excepciones de datos, backlog P0/P1/P2, gate de S2. Prohibidas inferencias de dinero cobrado desde hoja desactualizada.

### WO-02 — Motor replay (Codex)
Entradas: dataset autorizado congelado, contrato S0 y referencia de septiembre/octubre. Entregar lectura, normalización, `diff`, tests sintéticos, idempotencia, comandos reproducibles y reporte seguro. Sin secretos, datos reales ni escritura. Proponer integración intranet sólo tras inspeccionar repositorio/código actual y su compatibilidad.

### WO-03 — SOP soporte (Claude / revisión por el equipo)
Entradas: incidencias/tickets con datos anonimizados, manuales vigentes y responsables. Entregar taxonomía, árboles de diagnóstico, scripts, criterios de escalamiento, pruebas de escenarios, límites sobre credenciales/paneles y costo estimado de mantenerlo.

### WO-04 — Chatbot (Grok / OpenClaw / Claude según capacidades verificadas)
Entradas: FAQs aprobadas, canales/horarios, estados de tickets y criterios de identidad. Entregar mapa de intenciones, diagramas de handoff, pruebas de falsas confirmaciones y acceso mínimo. Prototipo sintético; ninguna activación productiva.

### WO-05 — Crítica de arquitectura/economía (todos)
Buscar riesgos, simplificaciones, funciones ya existentes, pruebas omitidas, costos, promesas no verificables y mejoras de alto impacto. Las propuestas **no** equivalen a decisiones ni cambios autorizados.
**Modelos disponibles no implica conectores autorizados.** Cada colaborador debe declarar acceso real, límites, supuestos, fuentes y resultados probados.

## 7. Métricas operativas (sin metas inventadas)
| KPI | Cálculo / origen | Estado al plan |
|---|---|---|
| Recaudo confirmado de la semana | Σ movimientos validados por JM, por moneda y fecha de ingreso | REQUIERE DECISIÓN de corte/fuentes; cifra no consultada |
| Facturación/cartera del ciclo | Obligaciones elegibles por plan, moneda y estado; separar nominal de ingreso | PARCIAL histórica; recomputar de fuente viva |
| Recuperación/renovación | Pagos autorizados + resultado de servicio; denominador de cartera elegible | No medido para 19–25 |
| Horas manuales por ciclo | Minutos de equipo medidos en método anterior vs nuevo | Línea base pendiente |
| Errores / excepciones | Diferencias abiertas con tipo, severidad, owner, tiempo de respuesta | Línea base pendiente |
| Tasa de resolución técnica | Tickets resueltos / tickets atendidos por periodo | Línea base pendiente |
| Deflexión chatbot segura | Casos resueltos sin humano y confirmados, sin falsos cierres | Aún no medible |
| Calidad de replay | Casos consistentes / casos comparables + reporte de excepciones | Se mide sólo con corte correcto |
| Costo de ejecución | Infraestructura + API + tokens + tiempo humano | Registrar como disponible; no inventar |

**Metas de proceso propuestas:** 0 escritura no autorizada; 0 confirmaciones JM artificiales; 2 corridas idempotentes; 100% de discrepancias del test descritas y clasificadas; un checkpoint reproducible. **Objetivo comercial:** tendencia creciente de recaudo y renovación, meta numérica por decidir tras baseline.

## 8. Definition of Done / condiciones de rechazo
- [ ] Fuentes, corte, derechos de acceso y propietario identificados; no confiar en fecha de modificación como consistencia.
- [ ] Gate S2 de SOPs verificado o brechas con decisión expresa para preparación S3.
- [ ] Contrato de entrada/salida y casos difíciles aprobados para el replay.
- [ ] Referencia histórica protegida; sin PII ni claves en repositorio.
- [ ] Pruebas con archivos sintéticos; replay en copia 2 veces, sin mutación.
- [ ] Comparación a nivel de caso y totales USD/COP, sin deduplicaciones silenciosas.
- [ ] Excepciones visibles con owner y siguiente acción.
- [ ] No cambia el estado financiero sin JM; no cambia panel técnico sin autorización.
- [ ] Prototipo intranet etiquetado como lectura/demo según evidencia, con evaluación de autenticación.
- [ ] SOP soporte y chatbot revisados, si se habilitaron por capacidad y gates.
- [ ] Tiempo/errores/costos documentados, aunque la línea base indique no disponible.
- [ ] Checkpoint, commit, evidencia, decisiones y plan siguiente conservados.
**RECHAZAR promoción:** si el dato es snapshot viejo, faltan accesos/autorizaciones, identity no resuelta, caso no reproducible, hay diferencia inexplicada o hay riesgo de exposición de clientes.

## 9. Consulta coordinada a Claude, Codex, Grok y OpenClaw
**Fase inmediata:** solo lectura/revisión. Cada modelo recibe este archivo, MER, contrato S0 y runtime general. Pedir **máximo 3 modificaciones sustantivas** y **1 riesgo crítico**; no autorizar commits ni creación de estructura antes de decisión Dirección.
Formato de respuesta:
```text
MODELO / FECHA / FUENTES LEÍDAS / CAPACIDADES Y LÍMITES REALES
1. RESUMEN EJECUTIVO (máx. 120 palabras)
2. CAMBIOS PROPUESTOS (máx. 3): ID, problema observado, propuesta, impacto, esfuerzo, dependencia, gate, evidencia necesaria
3. RIESGO CRÍTICO (1): condición de bloqueo + mitigación
4. REUTILIZACIÓN: archivos/funciones exactos existentes que evitarían duplicar trabajo
5. PLAN DE EJECUCIÓN ACOTADO: primera tarea < 90 minutos, salida verificable, tests y checkpoint
6. NO MODIFICADO / NO VERIFICADO: dejar constancia
```
ChatGPT consolida respuestas sin fusionar contradicciones; Dirección aprueba explícitamente el plan y las Work Orders según el gate G4 del protocolo GOV-MA-001. Ninguna propuesta pasa a implementación por consenso de modelos exclusivamente.

## 10. Continuidad
**ACTIVE CONTEXT:** semana 19–25; foco TiviPlay y caja; MER v1 en propuesta; contrato S0 rector; S2 gate por verificar; S3 condicionado.
**CHECKPOINT inicial (18/10):** documento de planificación, no ejecución TiviPlay de esta semana. Antecedente EVIDENCIA funcional reportado y commits técnicos documentados.
**DECISION LOG pendiente:** ratificar MER transversal; aprobar este plan v0.1; resolver fuentes/corte y jerarquía S0/S2/S3; autorizar implementaciones específicas.
**BACKLOG:** P0 verificación de ingresos, identidad, paridad y fuente; P0 auth y frescura; P1 servicio/soporte; P1 chatbot; P2 integraciones de escritura.
**EVIDENCIAS:** referencias sanitizadas al contrato S0 y al corte 30/09; no copiar archivos de clientes ni capturas.
**NEXT ACTION ACTUALIZADA — sesión de identificación de archivo y hojas:** verificar el Excel congelado que Dirección conserva del 30/09 (nombre, ubicación privada, fecha/hora de exportación, hash y pestañas); distinguir backup posterior a correcciones de posible snapshot anterior; fijar inputs/outputs y prueba de S0-B antes de iniciar comparación. Sin modificar hojas.

## 11. Handoff y cambio de estado
Cada agente deja en su entrega: `fecha, fuente/corte, objetivo, outputs, pruebas, estado permitido, diferencias, consumo/tiempo, archivos/commit, decisión pendiente, NEXT_ACTION + owner`. No modificar el estado global por narrativas de éxito.
Última actualización: 2026-10-18; no se han ejecutado pruebas nuevas de producción en esta planificación.

## 12. Coordinación multiagente, adopción de protocolo y revisión recibida (19/10)

**Protocolo transversal aprobado documentalmente:** [GOV-MA-001](../../../00_GOVERNANCE/PROTOCOLO_COLABORACION_MULTIAGENTE_V1.md); leer también `AGENTS.md`. Este plan v0.1 **sigue en estado REQUIERE DECISIÓN** y no constituye Work Orders aprobadas.

**Nombre corregido:** `OpenClaw` (agente/orquestador según implementación), NO `nombre anterior`.

**Respuestas recibidas en conversación y evaluadas por ChatGPT:**
- **Grok:** reutilizar `05_AUTOMATION/tiviplay-monthly-close-v1`, verificar datos vivos, priorizar agenda de cobro, señalar necesidad de corte anterior.
- **Claude:** no confundir 99 filas leídas del preliminar con reconstrucción desde Base General previa; extender oracle a montos y registros; consolidar lógica duplicada; revisar la evidencia JSON sensible y autenticación de intranet.

**Verificado en repo:** existen `05_AUTOMATION/tiviplay-monthly-close-v1/{run.mjs,src/core.mjs,src/google-sheets.mjs}`, módulo S0-A de conciliación, API `monthly-close` y vista `/operaciones/tiviplay/runtime`. El checkpoint 05/10 certifica repetibilidad de lectura, y el 09/10 la vertical técnica, **no el cierre financiero S0-B**. `run.mjs` serializa previews con campos sensibles en JSON bajo `evidence/`; priorizar aislamiento/saneamiento antes de ejecutar con datos reales dentro de Git.

**Consulta G2 cerrada por Dirección el 19/10/2026:** únicamente Claude y Grok para esta ronda. Codex y OpenClaw no son requisitos de revisión ni deben bloquear la consolidación G3; podrán ejecutar o revisar tareas posteriores solo tras Work Order y aprobación.

**Borrador de consolidación (NO aprobado):** (1) eliminar construcción redundante de CLI o dashboard; (2) P0 proteger salidas de evidencia; (3) ampliar prueba con montos USD/COP y comparación por registro; (4) buscar snapshot de `BASE GENERAL` anterior a 30/09 o preparar captura gobernada para octubre→noviembre; (5) agenda de recaudo privada/local después de permisos y fechas definidas.

**Gate siguiente:** ChatGPT presenta matriz G3 con solo Claude y Grok → Dirección ratifica G4 → se actualiza **este mismo archivo** a v0.2 con WOs, cronograma, owners y criterio de validación G5. Hasta entonces no ejecutar writes ni despliegues por este plan.

## 13. DECISIÓN DE DIRECCIÓN E INVENTARIO DE HOJAS — 19/10/2026

**Decisión G2:** cerrar esta ronda de revisión con **Claude y Grok únicamente**. Las propuestas recibidas pasan a G3 de consolidación. **Codex y OpenClaw** quedan fuera de la revisión obligatoria de esta ronda; no están descartados como ejecutores futuros. Este cierre no autoriza código, conciliaciones o despliegues.

### Hallazgo de fuentes — lectura de metadatos y encabezados, sin modificación
La fuente Google Sheets activa `GESTION_DIA_PAGOS_2026_TIVIPLAY` (spreadsheet ID `1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4`) tiene 84 pestañas al inventario del 19/10. Las siguientes **existen, con nombre literal confirmado** (algunos espacios son parte del nombre):

| Identificador | Archivo → pestaña exacta | Propósito autorizado para análisis | Grupo |
|---|---|---|---|
| HG-01 | `GESTION_DIA_PAGOS_2026_TIVIPLAY` → `BASE GENERAL` | Universo de clientes; solo snapshot del **30/09** si se verifica que corresponde al Excel descargado | P0 INPUT CONDICIONADO |
| HG-02 | `GESTION_DIA_PAGOS_2026_TIVIPLAY` → `PAGOS OCTUBRE 2026 - PRELIMINAR` | Oracle de salida del corte 30/09 (99 registros; semanas 13/30/27/16/13); no convertir lectura de esa salida en validación del algoritmo histórico | P0 REFERENCIA |
| HG-03 | `GESTION_DIA_PAGOS_2026_TIVIPLAY` → `PAGOS OCTUBRE 2026` | Comparación con hoja operativa del mes; puede haber mutaciones posteriores al corte | P0 COMPARACIÓN |
| HG-04 | `GESTION_DIA_PAGOS_2026_TIVIPLAY` → `PAGOS SEPTIEMBRE` | Casos vencidos, gestión y trazabilidad del mes anterior | P0 CONTEXTO |
| HV-01 | `VENTAS 2026 (Tiviplay)` → `VENTAS_SEPTIEMBRE` | Nuevas ventas, reactivaciones y columna `CONFIRMACION`; distinguir valor marcado de ingreso comprobado por JM | P0 PARIDAD S0-A |
| HF-01 | `GESTION_DIA_PAGOS_2026_TIVIPLAY` → `ZELLE (SEPT)` | Evidencia operacional de pagos; banco independiente aún requerido | P1 AUDITORÍA |
| HF-02 | idem → `PAYPAL (SEPT)` | Evidencia operacional de pagos y comisiones | P1 AUDITORÍA |
| HF-03 | idem → `TRANSF (SEPT)` | Evidencia operacional de transferencias, monedas y fechas | P1 AUDITORÍA |
| HS-01 | idem → `CONTROL ( SEPT) P1` | Servicio / renovación P1 | P1 SERVICIO |
| HS-02 | idem → `CONTROL (SEPT) P2` | Servicio / renovación P2 | P1 SERVICIO |
| HS-03 | idem → `CONTROL ( SEPT) P3` | Servicio / renovación P3 | P1 SERVICIO |
| HA-01 | idem → `AUDITORIA_CICLO_SEPT` | Contexto de excepciones del cierre; no es una entrada transaccional autorizada por sí sola | P1 EVIDENCIA |

**Fuentes nativas constatadas:** `https://docs.google.com/spreadsheets/d/1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4/edit`; `https://docs.google.com/spreadsheets/d/1y1yZSxHCz3HhfikgHNvhgKhU7rFCG9U8HH90QeTN6TQ/edit`.

**Distinción fundamental:** las hojas vivas y sus títulos/cabeceras se verificaron, pero **ninguna copia `.xlsx` del 30/09 se ha podido identificar inequívocamente en el contexto local o Drive conectado**. Dirección comunica que dispone del Excel: respetar esa afirmación; para su inspección concreta falta disponer del archivo exacto o de una referencia autenticada a él. Copias `BASE GENERAL (...).xlsx` halladas en Drive fueron modificadas en agosto y **no son prueba del corte 30/09**.

### Protocolo para fijar las hojas DEFINITIVAS del Excel (antes de correr el motor)
1. Leer archivo `.xlsx` **en privado**: nombre exacto, fecha/hora de exportación/creación, hash SHA-256, origen, pestañas y encabezados sin revelar filas de clientes.
2. Determinar si `BASE GENERAL` del Excel es **anterior o posterior** a las correcciones del 30/09. Según el reporte del 30/09, el backup descargado fue posterior a correcciones: si éste es ese mismo archivo, **sirve como salida/corte postcorrecciones, no como estado anterior para probar transformación completa**.
3. Asignar, por pestaña, rol `INPUT`, `ORACLE`, `CONTEXTO`, `EVIDENCIA`, `NO UTILIZAR` y evidencia de disponibilidad. Las equivalencias con pestañas nativas se verifican por nombre y encabezados, no por parecido.
4. Comparar conteos 99 / 13-30-27-16-13, luego **casos, fechas y montos USD/COP por separado**; no inferir cobros confirmados. Si no existe entrada precorrecciones, documentar limitación y preparar captura previa para octubre→noviembre.
5. No subir el Excel ni datos de clientes, pagos o contraseñas al repositorio. Publicar solamente nombres de pestañas, hashes, conteos, excepciones sanitizadas, dueño, gatillo y próxima acción.
6. **No consumir P1 de bancos/paneles** durante la primera corrida de S0-B salvo para documentar dependencias, y no usar `GESTION_GENERAL (TIVIPLAY)` histórica.

### Gate / checkpoint
**Documentación de selección:** PARCIAL (metadatos y cabeceras de fuente viva identificados; Excel exacto no inspeccionado).
**Disponibilidad de entrada histórica:** REQUIERE DECISIÓN de selección de artefacto exacto.
**Pruebas del motor sobre el corte congelado:** NO IMPLEMENTADO en esta sesión.
**Protocolo de revisión G2:** VALIDADO para alcance de esta ronda (Dirección decidió usar solo Claude y Grok).
**NEXT_ACTION:** inspeccionar **el Excel real del 30/09** en fuente privada y fijar matriz de tabs final; luego consolidar plan técnico v0.2 y someter Work Orders a aprobación G4. 


## 14. Registro inicial de localización del Excel histórico — 19/10/2026, noche

> **Histórico, sustituido parcialmente por el checkpoint §15:** la transferencia que aparecía bloqueada aquí fue verificada posteriormente. Conservar la trazabilidad del hallazgo anterior, pero consultar §15 para el estado vigente.

**Solicitud de Dirección:** usar el archivo local `C:\Users\USUARIO\Downloads\GESTION_DIA_PAGOS_TIVIPLAY_CORTE_2026-09-30.xlsx` como referencia del corte 30/09 y hacerlo descubrible para los agentes autorizados.

**Verificación actual:** NO fue posible acceder a la carpeta `C:\Users\USUARIO\Downloads` desde esta sesión; el Excel NO está montado aquí y la búsqueda por nombre exacto en el Drive conectado no devolvió resultados. **No afirmar que fue copiado o que sus pestañas ya fueron inspeccionadas.** Su disponibilidad para los agentes sigue **BLOQUEADO** hasta transferencia verificable.

### Arquitectura de acceso, sin exponer datos operativos
- **Archivo maestro fuente (local, declarado por Dirección):** `GESTION_DIA_PAGOS_TIVIPLAY_CORTE_2026-09-30.xlsx`.
- **Destino privado existente recomendado:** Google Drive → `99. ARCHIVO HISTÓRICO Y BACKUPS` → `Backups`, carpeta ID `1_8w-S8JJOugzL2QnsWjzvQDp4GlHwTbQ` — https://drive.google.com/drive/folders/1_8w-S8JJOugzL2QnsWjzvQDp4GlHwTbQ
- **Motivo de elección:** metadatos Drive consultados indican `shared=false` para `Backups` y su carpeta superior (sujeto a verificación de políticas reales). En contraste, la carpeta general `JUMOCOL_SYSTEM_OS` tiene permiso `anyone/reader`, por lo que NO sirve para custodiar esta fuente con PII, contraseñas técnicas y datos financieros.
- **Acceso entre agentes:** GitHub publica este manifiesto y un enlace privado verificable al archivo cuando exista. Cada agente requiere conector y permisos propios; **el enlace no habilita acceso universal ni acceso público**.
- **Repositorio:** conservar únicamente nombre, ubicación lógica/enlace privado, custodio, fecha de corte, SHA-256, pestañas/encabezados verificados, conteos y resultado sanitizado. **Prohibido subir el archivo binario, extractos con clientes, usuarios de panel, contraseñas o datos bancarios a GitHub.**
- **Operación manual pendiente:** Dirección sube el archivo exacto a `Backups`, manteniendo acceso restringido. Después el coordinador valida metadatos, fecha, integridad/hash y pestañas; registra enlace real y prueba permisos para cada agente que deba leerlo.

### Estado y siguiente acción
**Referencia local:** IMPLEMENTADO (ruta comunicada por Dirección; existencia física no verificada desde esta sesión).
**Transferencia a Drive privado:** BLOQUEADO (archivo local inaccesible desde herramientas de esta sesión).
**Acceso multiactor verificado:** NO IMPLEMENTADO (faltan archivo en Drive y validaciones individuales).
**NEXT_ACTION:** cargar el Excel exacto en la carpeta privada de Backups, compartir su enlace real en el chat y verificar pestañas y fecha/hora del corte en modo solo lectura. El plan técnico sigue `REQUIERE DECISIÓN`.


## 15. Verificación del XLSX cargado en Drive — 19/10/2026, 21:35 (Bogotá), verificación en sesión

**Estado vigente / reemplaza diagnóstico de disponibilidad de §§13–14.**
**Fuente comprobada:** archivo original **no convertido** `GESTION_DIA_PAGOS_TIVIPLAY_CORTE_2026-09-30.xlsx` localizado mediante listado de carpeta privada en Drive y descarga autenticada para inspección estructural en sesión.

| Campo | Verificación |
|---|---|
| Carpeta | `99. ARCHIVO HISTÓRICO Y BACKUPS/Backups` — ID `1_8w-S8JJOugzL2QnsWjzvQDp4GlHwTbQ` |
| Archivo | `GESTION_DIA_PAGOS_TIVIPLAY_CORTE_2026-09-30.xlsx` |
| Tamaño | **10.342.332 bytes** |
| SHA-256 de bytes descargados | `c71dd4b4353aab8da51cae6d969dac4d6b320367a9d447bd1a5fef7b28ab138f` |
| Contenido estructural | **66 pestañas** (64 visibles + 2 ocultas: `RESP_ORDEN_SEPT_20260924` y `RESP_PAGOS_SEPT_20260924`) |
| Pestaña `BASE GENERAL` | **PRESENTE**: candidata a entrada histórica congelada; validar si pre/postcorrección |
| Pestaña `PAGOS OCTUBRE 2026 - PRELIMINAR` | **PRESENTE**: referencia/salida preliminar del cierre; no emplear esta hoja como input para demostrar reconstrucción |
| Pestaña `PAGOS SEPTIEMBRE` | **PRESENTE**: contexto/excepciones/cartera anterior |
| Pestaña `PAGOS OCTUBRE 2026` | **AUSENTE DEL XLSX**: existe en la hoja de cálculo VIVA, distinta del backup. No mezclar versiones sin registrar fecha y fuente |
| `ZELLE (SEPT)`, `PAYPAL (SEPT)`, `TRANSF (SEPT)` | PRESENTES: evidencia de gestión financiera, no sustituyen fuente bancaria independiente |
| `CONTROL ( SEPT) P1`, `CONTROL (SEPT) P2`, `CONTROL ( SEPT) P3` | PRESENTES: evidencia de gestión técnica de servicio, fase posterior |
| Carga en Drive | Creado en Drive **2026-10-20 02:39:52Z**. Esta fecha **es de subida**, NO prueba el estado del archivo al 30/09 |
| Estado de permisos directo sobre el archivo | **RIESGO P0:** `anyone/reader` (cualquiera con el enlace tiene lectura), aun estando en carpeta con permisos `not_shared`. Confirmado por metadatos Drive. |

**Control de seguridad obligatorio y bloqueante:** Dirección debe cambiar acceso general del **archivo específico** a `Restringido`, verificar que la lista de lectores sea solo los usuarios autorizados, y confirmar nueva lectura de metadatos antes de compartir enlace directo entre agentes. **Mientras tanto NO publicar el URL/ID del archivo en GitHub ni pasárselo a modelos adicionales; los enlaces de carpeta ya existentes no confieren automáticamente seguridad al archivo.** Herramientas disponibles en esta sesión no revocan permisos públicos. El Excel y sus datos reales tampoco deben subirse al repositorio.

### Matriz canónica de hojas para la primera corrida MER / S0-B
| Orden | Fuente exacta | Rol | Condición |
|---|---|---|---|
| 1 | XLSX descargado `BASE GENERAL` | INPUT candidato, inmovilizado con hash | Determinar si corresponde al estado de Base antes o después de ajustes del 30/09 |
| 2 | MISMO XLSX `PAGOS OCTUBRE 2026 - PRELIMINAR` | ORACLE / salida histórica | Verificar referencia de 99 registros, cinco semanas y monedas con lectura controlada |
| 3 | MISMO XLSX `PAGOS SEPTIEMBRE` | CONTEXTO de exclusiones y movimientos previos | No introducir como facturable octubre sin clasificación S0-B |
| 4 | GOOGLE SHEETS VIVO `PAGOS OCTUBRE 2026` | Comparación posterior **opcional**, con otro corte temporal | No mezclar con snapshot 30/09 para afirmar replay validado |

**Por defecto, excluir** toda pestaña de otros meses, paneles, bancarias y controles hasta que S0-B requiera una excepción concreta. La primera corrida no incluye auditoría de bancos/paneles.

### Evidencia técnica y límites
- Se validó la existencia real del archivo y su estructura de hojas a través de ZIP/OOXML (sin volcar filas, clientes, contraseñas ni movimientos al repositorio).
- **No se ha ejecutado** `npm run run` ni una comparación de registros contra este XLSX en esta sesión.
- **No se ha demostrado** que `BASE GENERAL` sea anterior a correcciones ni que el motor reproduzca por completo la salida de 99.
- **No se han modificado** ni el XLSX original en Drive ni las fuentes operativas vivas.

### Checkpoint
- **Archivo histórico accesible para lectura desde conector autorizado:** VALIDADO (existencia, tamaño y hash).
- **Inventario estructural de pestañas:** VALIDADO (66; nombre exacto y visibilidad).
- **Control de privacidad del archivo:** BLOQUEADO (quitar `anyone/reader` antes de distribuirlo).
- **Criterio temporal input → salida:** REQUIERE DECISIÓN/validación de corte y correcciones.
- **Motor S0-B contra Excel:** PARCIAL por antecedentes; sin prueba nueva.
- **NEXT_ACTION:** (1) Restringir permisos del XLSX en Drive; (2) verificar control de acceso; (3) inspeccionar columnas y cortes de `BASE GENERAL` y `PAGOS OCTUBRE 2026 - PRELIMINAR` sin exponer PII; (4) preparar prueba de comparación controlada con motor existente y evidencias sanitizadas; (5) solicitar aprobación G4 para cualquier tarea de código/operación.


## 16. MER — Paso inicial lunes 19/10: baseline del corte y brecha gerencial (19/10, noche)

**Modo:** inspección LOCAL DE SOLO LECTURA sobre XLSX original verificado en §15. No se ejecutó el motor Node ni se modificaron Sheets, Drive o producción. No se incorporan filas, clientes ni secretos al repositorio.

### Ensayo de consistencia interna XLSX — REFERENCIA HISTÓRICA
Archivo protegido por hash SHA-256 registrado en §15: `c71dd4b4353aab8da51cae6d969dac4d6b320367a9d447bd1a5fef7b28ab138f`.

Se leyeron las pestañas **del mismo respaldo** `BASE GENERAL` y `PAGOS OCTUBRE 2026 - PRELIMINAR`. Filtro de selección: `TC=1`, `F. PRÓXIMO PAGO` entre 2026-10-01 y 2026-10-31, sin incluir vencidos anteriores ni filas de totales. El parser normalizó `TC=1.0` exportado como valor numérico y fechas de Excel. Montos nominales, no dinero cobrado.

| Indicador | BASE GENERAL en XLSX | PRELIMINAR en MISMO XLSX | Evaluación |
|---|---:|---:|---|
| Registros elegibles | 99 | 99 | Coincide |
| Semanas 1→5 | 13 / 30 / 27 / 16 / 13 | 13 / 30 / 27 / 16 / 13 | Coincide |
| USD nominal | 4.090,50 | 4.090,50 | Coincide |
| COP nominal | 375.730 | 375.730 | Coincide |
| Casos faltantes, cotejo por `USUARIO + CLIENTE + TELÉFONO/CORREO + PANEL` y fecha/moneda/monto | — | **0** | Coincide |
| Casos añadidos por el mismo cotejo | — | **0** | Coincide |
| Identidades compuestas repetidas dentro de universo octubre | 0 | 0 | Coincide |

**Estado: VALIDADO únicamente para CONSISTENCIA INTERNA del mismo backup** (estructura, filtros, moneda y cotejo 99↔99). No es prueba de que el motor `tiviplay-monthly-close-v1` haya regenerado la salida desde una Base General premodificación. No es prueba de conciliación financiera, ni banco ni facturación definitiva. El Excel podría representar un corte POSTERIOR a correcciones: determinar secuencia y hora contra bitácora del cierre.

**Precaución adicional:** `PAGOS SEPTIEMBRE` mantiene valores de meses mezclados y no debe usarse como entrada de facturación octubre sin reglas/segmentos. Fuera de alcance en este primer ensayo.

### Seguridad de la fuente
Verificación reciente por metadatos Drive: el XLSX tiene permiso de archivo `anyone/reader` pese a residir en carpeta privada. **BLOQUEADO** su distribución directa a modelos hasta que Dirección cambie el archivo a **Restringido** y se verifique el permiso; no colocar URL/ID público en este repositorio. El archivo puede ser leído solo por procesos/personas explícitamente autorizados; el hash no expone el contenido.

### Brecha intranet gerencial — AUDITORÍA DE CÓDIGO, NO PRUEBA DE ACCESO
Rutas encontradas en GitHub:
- `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src/app/(intranet)/operaciones/tiviplay/page.tsx`: existe tarjeta `Runtime operativo` que enlaza `/operaciones/tiviplay/runtime`.
- `06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/src/app/(intranet)/operaciones/tiviplay/runtime/page.tsx`: UI técnica de universo, facturar candidato, excepciones, semanas, integridad y firmas.
- No se encontró archivo en ruta esperada `.../operaciones/tiviplay/gerencial/page.tsx` en la rama consultada.
- Checkpoint `02_RUNTIME/TIVIPLAY_RUNTIME_OPERATIVO_CHECKPOINT_2026-10-09.md`: vertical lectura técnica validada **históricamente**; vista gerencial consolidada, recaudo y conciliación NO validados. El código actual de lectura no constituye KPI financiero aprobado.
- No se comprobó servidor local, despliegue, login ni permisos de sesión de Dirección. Un problema de entrada real debe diagnosticarse con URL exacta y síntoma reproducible.

**Decisión de diseño propuesta — REQUIERE DECISIÓN:** utilizar la **misma** intranet y motor común; distinguir (1) informe GERENCIAL autorizado, con corte, moneda, cobertura/fuente, tendencia y estados de validación, de (2) agenda OPERATIVA por asesor con mínimo privilegio. No presentar `FACTURAR_CANDIDATO` como facturación cobrada ni exponer clientes si no hay autenticación/RBAC. Primero recuperar acceso y validar controles, luego implementar vista en WO aprobada; prohibido abrir públicamente la ruta API de datos vivos.

### Orden de trabajo, paso siguiente
1. **Dirección** cambia el permiso del XLSX en Drive a `Restringido`; ChatGPT comprueba en metadatos (gate P0 seguridad).
2. Confirmar hora de corte y estado pre/postcorrecciones; si es POST, el replay septiembre→octubre se limita a consistencia histórica, mientras se prepara octubre→noviembre con snapshot pretransformación.
3. Ejecutar pruebas sintéticas del motor existente, **corrigiendo salida JSON sensible o aislándola fuera de Git antes** de permitir lectura de datos reales.
4. Diagnosticar acceso a la vista gerencial con ruta/URL concreta; establecer en **Work Order** datos/KPIs, auth/RBAC, usuario Dirección y pruebas.
5. **G2 de esta ronda: SOLO Grok y Claude.** Enviarles este mismo plan actualizado, recibir observaciones acotadas y consolidar G3. Después Dirección aprueba G4/WOs; no asumir autorización de producción.

### Checkpoint
- Evidencia corte XLSX: **VALIDADO** (existencia, SHA-256, pestañas).
- Consistencia XLSX `BASE GENERAL` ↔ `PAGOS OCTUBRE PRELIMINAR` para universo octubre: **VALIDADO**, límite **dentro del mismo backup**.
- Reproducción E2E del motor desde estado anterior a las correcciones: **PARCIAL**, falta entrada temporal canónica y corrida real del motor.
- Seguridad de compartir XLSX: **BLOQUEADO** hasta revocar `anyone/reader`.
- Acceso e indicadores de intranet gerencial actual: **REQUIERE DECISIÓN**; código parcial, servidor/sesión no verificados.
- **NEXT_ACTION:** permiso restringido del archivo + diagnóstico del acceso gerencial; retomar MER prueba técnica en entorno controlado con outputs saneados.


## 17. Evidencia de acceso local a JUMOCOL OS — 19/10/2026, 22:03 aprox. Bogotá

**Fuente:** capturas de pantalla entregadas por Dirección, no inspección remota del escritorio.

- `Test-Path "C:\Users\USUARIO\Documents\JUMOCOL_SYSTEM_OS"` → `True`.
- `Test-Path "...\06_APPLICATIONS\JUMOCOL_OPERATIONS_INTELLIGENCE"` → `True`.
- `pnpm dev` invocado dentro de la raíz de la app mostró `Next.js 16.3.1` y `Another next dev server is already running`, porque **ya había** una instancia local en `127.0.0.1:3000` (PID reportado por consola: **24960** en ese instante). El segundo arranque devolvió `ELIFECYCLE`, sin que eso pruebe una caída de la primera instancia.
- El navegador abrió `http://localhost:3000/login` y mostró formulario `JUMOCOL OS — Acceso individual`, usuario, contraseña y vínculo `Tengo un código de activación`. **No se observó intento de autenticación ni error de credenciales.**
- La comparación contra **rama principal GitHub** no encontró archivos en rutas probables `src/app/login/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(public)/login/page.tsx`, `src/app/api/auth/login/route.ts` ni `src/proxy.ts`; esto **no demuestra que el login local sea inválido**, sino que la implementación local puede diferir de GitHub o estar en otra ruta/commit.
- `/operaciones/tiviplay/runtime` aparece en código GitHub, pero no se verificó sesión gerencial activa, roles ni acceso al módulo en el servidor local.

**Estado:** raíz local y app accesible **VALIDADO por capturas**; instancia local **IMPLEMENTADO / verificada en ese instante**; autenticación de Dirección **REQUIERE DECISIÓN/diagnóstico**; paridad local–GitHub **PARCIAL**.

**NEXT_ACTION del bloque UI:** no crear un segundo servidor ni sincronizar destructivamente. En equipo local, identificar rutas reales de login/roles y `git status -sb` sin exponer secretos; que Dirección indique si dispone de credenciales de usuario ya activadas o si recibió código de activación. Probar acceso solo a través del formulario local y comunicar síntoma, sin compartir contraseña. Si entra, inspeccionar la vista gerencial real y el rol asignado antes de construir una pantalla paralela.


## 18. Revisión Claude: acceso administrativo local y separación de frentes — 19/10/2026 (reporte recibido)

**Fuente:** respuesta de Claude compartida por Dirección. Las observaciones de procesos locales se registran como **REPORTADAS POR CLAUDE**, no repetidas independientemente en esta sesión.

**Claude informa:**
- El formulario de login exige origen `http://localhost:3000` y rechaza `127.0.0.1` con 403; desde localhost, un usuario inexistente devolvió 401 (prueba de ruta y controles de origen, no acceso ADMIN).
- Identificó cuenta `julian` y bootstrap existente: `scripts/identity-admin.mjs` invoca `bootstrapAdmin`. Recuperación con `node --no-warnings scripts/identity-admin.mjs recover` desde raíz de app, solo mediante consola interactiva privada y si la contraseña existente no funciona.
- Reporta que `recover` sustituye contraseña y revoca sesiones; no efectuar recuperación sin necesidad, intervención/decisión directa del titular y conocimiento del impacto.
- Restricciones de operadores verificadas por Claude en código; no verificadas contra sesión de operador viva.
- Código local incorpora `runtimeForRole` para separar lectura ADMIN/operador y tiene rutas `/operaciones/tiviplay/dashboard` y `/pagos`, pero no una vista gerencial integrada validada. Puede diferir de rama GitHub; **no sincronizar destructivamente**.
- No hubo cambios de código, DB, archivos de configuración ni Github según Claude. No verificó autenticación real de ADMIN.

**Decisión de coordinación:** activar login gerencial y correr motor mensual son **frentes separables**. La verificación de acceso queda `PARCIAL` sin detener prueba read-only de `tiviplay-monthly-close-v1`. No gastar más sesiones de descubrimiento de identidad. Dirección intenta login en localhost y, solo si falla, sigue recuperación interactiva.

**WO técnica inmediata para motor, todavía sujeta a ejecución local y prueba:** utilizar el motor existente (sin rediseñar), ejecutar pruebas sintéticas, una lectura de `PAGOS OCTUBRE 2026 - PRELIMINAR` con referencia 99 / 13-30-27-16-13 y una lectura de `BASE GENERAL` viva, todo bajo credenciales readonly. Proteger salidas de evidencia con datos sensibles en copia privada fuera de Git, no publicar JSON con PII ni registrar ingresos bancarios ficticios. Documento/guion local `EJECUTAR_MOTOR_TIVIPLAY_SOLO_LECTURA_2026-10-19.ps1` entregado por ChatGPT, **no ejecutado ni auditado en Windows en esta sesión**.

**Criterio de resultado:** exponer solo RUN 1/RUN 2, semanas, repeatable, estabilidad, duplicados, excepciones, oracle y estado. `VALIDADO` emitido por el programa al cotejar solo conteos/semanas **no es** validación S0-B de negocio, conciliación bancaria ni histórico pre-correcciones. Conservar evidencia por caso en ubicación privada y checkpoint saneado en GitHub.

**NEXT_ACTION:** ejecutar el motor en copia privada local y compartir solo el resumen no sensible; analizar discrepancias y proponer siguiente WO para revisión/aprobación de Dirección. Claude completa acceso ADMIN en paralelo solo con credenciales provistas privadamente por Dirección.


## 19. Primer intento REAL del motor read-only — 19/10/2026, 22:54–22:56 Bogotá (salida aportada por Dirección)

**Componente:** `05_AUTOMATION/tiviplay-monthly-close-v1` ejecutado mediante copia local privada bajo `%LOCALAPPDATA%\JUMOCOL_OS\private_runs\tiviplay-monthly-close-20261019-225410\engine`. No hay ejecución en vivo comprobada desde esta sesión de ChatGPT; se evalúa el log reproducido íntegramente por Dirección.

### Evidencia del intento
- `npm test`: **7 tests / 7 aprobados / 0 fallidos** sobre la copia privada, en Node.js **v24.16.0**. Reglas sintéticas: fechas, cinco semanas, determinismo, excepciones y conciliación Confirmado JM a nivel de test.
- `01_LECTURA_REFERENCIA_99` (`PAGOS OCTUBRE 2026 - PRELIMINAR`, mes 2026-10): **BLOQUEADO antes de leer datos**, error `ERR_OSSL_UNSUPPORTED` / `DECODER routines::unsupported` al firmar JWT de Google con la clave privada; exit code **1**.
- `02_BASE_GENERAL_VIVA` (`BASE GENERAL`, mes 2026-10): **BLOQUEADO por el mismo error antes de leer datos**; exit code **1**.
- No hay `RUN 1/RUN 2`, `Oracle` ni `STATUS` calculados para ninguna de las dos fuentes en este intento. El código de salida 1 aquí **no equivale a PARCIAL por reglas de negocio**: el motor ni siquiera consiguió un token Google.
- La salida indicó ausencia de escrituras en Google Sheets, confirmaciones de pago o modificaciones del repositorio. Evidencias privadas en `%LOCALAPPDATA%\JUMOCOL_OS\private_runs\tiviplay-monthly-close-20261019-225410\reportes_sanitizados`; no copiar previews con PII a Git.

### Diagnóstico y mitigación
**Hipótesis principal a verificar:** la clave PEM entregada por variables de entorno/`.env.local` tiene comillas o saltos de línea escapados y la biblioteca no la decodifica; el error también sería compatible con una clave errónea/truncada u otro formato incompatible. No se ha visto la clave ni es necesario exponerla.

Se preparó un ejecutor PowerShell de **reintento en la copia privada** con prueba PEM por `crypto.createPrivateKey` y normalización **solo en memoria** de secuencias `\\n`; se comprobó su lógica PEM con claves sintéticas. No modifica credenciales, servidor, repositorio ni Sheets. Si la clave continúa inválida, **detenerse** y corregirla desde su origen autorizado, en privado; no desactivar OpenSSL ni controles de autenticación.

**Estado:** pruebas unitarias **VALIDADO**, acceso fuente Google Sheets **BLOQUEADO**, ejecución real del cierre **NO VALIDADA**. La evidencia previa del backup del 30/09 continúa siendo **consistencia interna** y no se ve alterada por este intento.

**NEXT_ACTION ÚNICA:** ejecutar una vez el script de reintento privado `EJECUTAR_MOTOR_TIVIPLAY_CORREGIR_CREDENCIAL_2026-10-19.ps1` en la terminal de Dirección, comprobar `AUTH_CONFIG` y obtener `RUN`/oracle sin compartir secretos; si es `PEM_INVALIDO`, escalar únicamente la corrección de credencial a custodio autorizado.
