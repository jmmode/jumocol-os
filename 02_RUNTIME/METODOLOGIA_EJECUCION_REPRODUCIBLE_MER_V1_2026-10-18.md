# JUMOCOL OS — Metodología de Ejecución Reproducible (MER)
**Versión:** 1.0 · **Fecha:** 2026-10-18 · **Estado:** REQUIERE DECISIÓN para adopción como política transversal.
**Responsable:** Dirección · **Ámbitos:** JUMOCOL OS, TiviPlay, soporte, chatbot, ventas, ecommerce y EVIDENCIA.
**Procedencia:** transcripción estructurada del documento MER v1.0 preparado el 18/10/2026. Es referencia metodológica; no sustituye AGENTS.md, gobierno Q4 ni contratos operativos S0.

## 1. Propósito y precedente
Transformar una ejecución manual útil en un sistema ejecutable, repetible, medible, auditable y transferible a otros agentes, con menor esfuerzo humano, costo y errores.
Según Dirección, EVIDENCIA pasó en dos sesiones de un montaje manual a la generación de un tercer video mediante una primera versión automatizada. En GitHub están documentados contrato visual/sonoro, guion, voz y montaje. La experiencia reporta resultado funcional inicial; no demuestra operación desatendida ni ahorro recurrente medido.
**Aprendizaje:** primer resultado real → captura del procedimiento → contrato compartido → código determinístico → colaboración multiagente → replay/comparación → evidencia → mejora.

## 2. Principios no negociables
1. Resultado operacional verificable antes que infraestructura.
2. Ejecutar inicialmente un caso real supervisado, o copia segura si es sensible.
3. Capturar conocimiento una vez y reutilizar documentación existente.
4. Código para cálculos, filtros, normalización, comparaciones y otras reglas determinísticas.
5. Agentes con límites y entregables; modelos intercambiables por contrato.
6. Dirección conserva decisiones financieras y otras críticas.
7. Pruebas primero en solo lectura, copias o datos sintéticos.
8. Separar documentación, implementación, operación viva y evidencia.
9. Medir tiempo, calidad, errores, retrabajo, costo, tokens, APIs e intervención.
10. Promover capacidades únicamente a través de gates de seguridad y reproducibilidad.

## 3. Ciclo MER
| Etapa | Objetivo y salida | Gate |
|---|---|---|
| MER-0 Seleccionar | Caso, owner, fuente, KPI, riesgo, orden de trabajo | Problema y límites explícitos |
| MER-1 Ejecutar/descubrir | Primera salida manual/supervisada, evidencia, tiempo y excepciones | Resultado comprobable |
| MER-2 Formalizar | SOP/contrato: fuentes, identidad, estados, roles, pasos, excepciones, permisos, rollback e idempotencia | Un agente nuevo comprende sin recurrir al chat |
| MER-3 Construir mínimo | Código reproducible, herramientas, logs y pruebas | Ejecuta en copia o datos sintéticos sin aprobaciones inventadas |
| MER-4 Reproducir/comparar | Al menos dos corridas; diferencia contra referencia e idempotencia | No hay diferencias inexplicadas ni efectos secundarios |
| MER-5 Piloto supervisado | Permisos, respaldo, QA, alertas, medición real | Sin producción plena antes de seguridad, autorización y recuperación |
| MER-6 Optimizar/transferir | Reducir fricción; conservar evidencia y checkpoint; replicar adyacencias | Otro agente puede continuar y repetir |

## 4. Paquete mínimo de ejecución
Por proceso: ID, nombre, versión, owner, estado; problema, alcance, KPI, frecuencia, riesgo; fuentes y corte; contrato entrada/salida; pasos, estados, permisos y excepciones; referencia manual; división código/agentes/humanos; pruebas, idempotencia y rollback; métricas antes/después; ACTIVE_CONTEXT, CHECKPOINT, DECISION_LOG, BACKLOG, EVIDENCIAS, NEXT_ACTION.
**Checkpoint mínimo:** FECHA/PROCESO/VERSIÓN; objetivo y gate; fuentes/cortes; ejecutado; resultado/evidencia; cambios/commit; validado/no validado; excepciones, bloqueos y decisiones; métricas; próxima acción exacta y owner.
Reutilizar los documentos existentes: no crear nueve archivos nuevos por proceso.

## 5. Estados y evidencias
Estados permitidos: **IMPLEMENTADO / PARCIAL / NO IMPLEMENTADO / BLOQUEADO / REQUIERE DECISIÓN / VALIDADO**.
IMPLEMENTADO significa que existe el componente, no que esté certificado. VALIDADO requiere fuente, ejecución, prueba, resultado, corte y alcance explícitos. No declarar sistemas autónomos por una demostración.

## 6. Economía de recursos
Prioridad de ejecución: (1) Python/SQL/APIs/código determinístico, (2) automatizaciones y agentes livianos con permisos, (3) IA avanzada para ambigüedades, (4) Dirección para aprobaciones, seguridad y excepciones.
Medidas: tiempo_humano, duracion_total, errores, retrabajo, costo_API, tokens, intervenciones_humanas, calidad, ahorro_neto. Comparar contra línea base real.

## 7. TiviPlay como primer laboratorio operacional
Contrato rector: [S0 v0.2](../03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md) (ver también ruta absoluta desde raíz indicada abajo).
Secuencia: venta → Confirmado JM → identidad → Base General → Pagos [MES] → gestión → comprobante → verificación financiera → servicio → cierre.
Primer replay candidato: septiembre → octubre, salida histórica de 99 registros; comparar registro a registro y separar USD/COP; no crear pagos confirmados ni cambios de producción en las pruebas.
Recaudo: cartera, agenda, seguimiento. Conciliación: banco independiente y confirmación exclusiva JM. Servicio: diagnóstico/atención y escalamiento, sin modificar paneles sin autorización. Chatbot: FAQ desde fuente aprobada y ticket; no confirmar pagos. Renovaciones: F.PRÓXIMO PAGO comercial distinta de F.VENCIMIENTO técnico.
Secuencia de gobierno Q4: octubre documentar/estandarizar; noviembre medir/integrar/automatizar; diciembre validar autonomía. Un piloto en octubre no autoriza producción.

## 8. Coordinación y seguridad
GitHub: contratos, código, tests y evidencias sanitizadas. Drive/Sheets: datos vivos y evidencias de negocio conforme a permisos. ChatGPT: análisis y continuidad; Codex: implementación controlada; Claude/Grok/Otros: revisión crítica, SOP, experiencia y propuestas. Roles de colaboradores sujetos a confirmación.
Nunca publicar en GitHub credenciales, tokens, filas de clientes, comprobantes, extractos, usuarios/contraseñas de paneles ni capturas sensibles. Repositorio privado tampoco es excusa para incorporarlos.

## 9. Definition of Done MER
- Resultado manual o referencia funcional capturada.
- Fuentes de verdad y contrato identificados.
- Reglas determinísticas ejecutables o justificadas como humanas.
- Dos corridas controladas e idempotentes.
- Resultado contrastado; diferencias explicadas.
- Permisos, excepciones y escalamiento definidos.
- Logs, rollback y evidencia verificable.
- Tiempo, calidad, costos y tiempo humano medidos.
- Continuidad transferible a otro agente.
- Aprobación explícita para el nivel de operación permitido.

## 10. Propuesta de adopción y próxima acción
**Estado:** REQUIERE DECISIÓN. Se propone adoptar MER como estándar complementario.
**Prueba inmediata:** replay septiembre→octubre en copia con fuentes congeladas y comparación por registro; luego aplicar el patrón a soporte y chatbot como pilotos.
**Principio:** Descubrir una vez. Ejecutar una vez. Documentar lo aprendido. Codificar lo repetitivo. Validar con evidencia. Reutilizar repetidamente.

## 11. Texto compacto para instrucciones generales
> Adopta MER: seleccionar un objetivo real; ejecutar primero de forma manual o supervisada; capturar evidencia; formalizar un contrato; codificar lo determinístico; delegar tareas acotadas; repetir y comparar contra referencia; medir tiempos, errores, costos e intervención humana; dejar checkpoint; escalar solo tras gates. Reutiliza documentos y código existentes. Distingue documento, implementación, dato vivo y evidencia. Nunca declares VALIDADO sin pruebas. En procesos sensibles comienza en lectura/copia y conserva permisos, aprobación humana e idempotencia. Usa código para reglas, agentes para coordinación, IA fuerte para ambigüedades y Dirección para excepciones.

**Referencia operativa:** `03_AREAS/01_OPERACION/TIVIPLAY/01_CONTEXTO/TIVIPLAY_CONTRATO_OPERATIVO_S0_V0_2_2026-09-28.md`.
**Referencia precedente:** `07_YOUTUBE/SHORT_PRODUCTION_CONTRACT.md`.
