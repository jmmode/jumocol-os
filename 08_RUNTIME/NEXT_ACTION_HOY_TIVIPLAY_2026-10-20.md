# NEXT ACTION — HOY TiviPlay (estilo first-principles)

**Fecha:** 2026-10-20  
**Estado:** LISTO PARA EJECUTAR  
**Objetivo único:** Que el equipo abra la intranet y vea exactamente qué hacer hoy, usando el motor que ya existe. Dirección solo toca lo que el motor no puede decidir.

## Principio
El motor `05_AUTOMATION/tiviplay-monthly-close-v1` ya clasifica candidatos, excepciones y firmas.  
No se reescribe. Se hace visible y accionable.

## Qué construir (solo esto)

Nueva página:
```
/operaciones/tiviplay/hoy
```

Tres bloques únicos:

1. **Clientes por contactar hoy**  
   Lista concreta (cliente, teléfono, F.PRÓXIMO PAGO, última gestión si existe).  
   Fuente: salida FACTURAR_CANDIDATO del motor.

2. **Excepciones que bloquean**  
   Lista de las excepciones que el motor ya detecta (fila, tipo, valor).  
   Cada una con owner sugerido.

3. **Pendientes de Confirmado JM**  
   Casos con comprobante recibido que esperan firma de Dirección.  
   Solo visible / accionable por JM.

## Regla de uso
- Si el cliente está en esta página → no abrir el Sheet.
- Dirección solo entra al tercer bloque.
- Todo lo demás se pospone.

## Qué NO hacer
- No reescribir el motor.
- No agregar gráficos ni KPIs gerenciales.
- No crear login perfecto todavía.
- No tocar CONTROL P1/P2/P3.
- No escribir en Sheets.
- No documentar un nuevo contrato.

## Modelo recomendado para ejecutar
**Claude (Sonnet 4.5 / Opus) o Codex**  
Razón: mayor precisión para integrar la salida del motor existente en una página Next.js mínima sin inventar capas nuevas.

## Quién documenta la corrida
El mismo modelo que implemente, al terminar, deja un checkpoint corto en este mismo archivo (o en `08_RUNTIME/`) con:
- Fecha y hora
- Commit
- Qué se mostró
- Tiempo que Dirección dedicó a revisar
- Diferencia vs día anterior

## Resultado final esperado
- Página `/operaciones/tiviplay/hoy` funcional y usable por el equipo al día siguiente.
- El motor existente alimenta los tres bloques.
- Dirección solo revisa el bloque de Confirmado JM.
- Medición clara de minutos de Dirección antes/después.
- Todo lo demás queda explícitamente fuera de alcance.

**NEXT ACTION:** Implementar la página HOY usando exclusivamente la salida del motor monthly-close-v1.
