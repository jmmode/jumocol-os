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


## 14. Registro de localización del Excel histórico — 19/10/2026, noche

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
