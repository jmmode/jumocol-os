---
name: tiviplay-apertura
description: Ejecutar y verificar el puesto de trabajo diario TiviPlay con agentes de datos, atención y QA.
disable-model-invocation: true
---
# Ejecución operacional TiviPlay — comando único

Objetivo: dejar funcionando en la instancia local JUMOCOL_HOY una jornada real, con cartera diaria, créditos, cola de clientes, búsqueda por nombre/teléfono/usuario, clasificación A/B/C y respuesta copiable.

NO vuelvas a elaborar roadmap, pedir otro prompt, crear CRM o generar documentos grandes. Restringe la exploración inicial a lo necesario para ejecutar. No fusiones el PR #12 hacia main. Conserva el estado Git actual y los cambios locales; si hay cambios sin commit, no hagas reset ni checkout destructivos. No despliegues a operadores ni escribas pagos/créditos sin autorización.

1. Comprueba rama y rutas reales de JUMOCOL_HOY, los scripts de test ya disponibles y las funciones existentes HOY/Runtime/getCreditosHoy. Registra un commit base o referencia SHA sin modificar el entorno ajeno.
2. Delega al subagente tiviplay-datos el backend: cola para fecha de Bogotá, cálculo de cobro por moneda y créditos con fuentes vivas, búsqueda autorizada y pruebas. Paraleliza únicamente lectura de otros módulos o pruebas independientes; no dupliques exploración.
3. Cuando haya contrato de backend concreto, delega a tiviplay-atencion la pantalla de apertura, búsqueda contextual, árbol A/B/C, ficha y Copiar; el coordinador conecta interfaces sin duplicar lectores.
4. Integra los cambios en la rama de trabajo, ejecuta typecheck, build y tests existentes. Delega a tiviplay-verificacion el QA de regresión y recorridos E2E. Corrige fallos reproducibles y repite pruebas; no eludas checks.
5. Inicia y prueba la aplicación local mediante su mecanismo actual. Prueba: cliente real autorizado en búsqueda, contacto de cobro con importe verificable, crédito según estado, caso técnico con script copiable, cierre/reapertura, permisos de operador. Si una fuente viva falla, marca BLOQUEADO ese dato sin fingir éxito global.
6. Deja commit trazable y la instancia lista para uso local autorizado. No crees PR nuevo si no es necesario para este gate; no publiques fichas pendientes de aprobación a operadores.

Salida final: máximo 10 líneas: ESTADO, URL local, rama+SHA, cantidad real de clientes a gestionar, importes por moneda, créditos por estado, búsqueda y script, pruebas reales/sintéticas, bloqueos y next action. No afirmes resultados antes de comprobarlos.