# TIVIPLAY — Runtime Operativo — Checkpoint

**Fecha:** 2026-10-09  
**Módulo:** Runtime Operativo TiviPlay  
**Ruta:** `/operaciones/tiviplay/runtime`  
**Estado:** VALIDADO  
**Gate:** Fuente viva → Motor → API → JUMOCOL OS → Usuario consulta

## Resultado validado

La vertical mínima quedó operativa de extremo a extremo:

```text
FUENTE VIVA
    ↓
MOTOR
    ↓
API
    ↓
JUMOCOL OS
    ↓
USUARIO CONSULTA
```

### Evidencia visible en Runtime

- Universo: 76
- Facturar candidato: 69
- Requiere revisión: 7
- Duplicados: 0
- Errores de datos: 1
- Semanas operativas: 7 / 18 / 20 / 16 / 15
- Posible mes gratis: 5
- Posible no renovación: 1
- Excepción explícita: 1
- Fuente estable durante lectura: SÍ
- Estado técnico: VALIDADO_TECNICO

### Excepción de calidad identificada

- Fuente: `BASE GENERAL`
- Fila: 782
- Tipo: `INVALID_NEXT_PAYMENT_DATE`
- Valor: `04-027`

El sistema no corrige silenciosamente la anomalía; la expone para revisión.

## Qué valida este checkpoint

VALIDADO:
- lectura de Google Sheets vivo;
- motor determinístico;
- doble lectura con estabilidad de fuente;
- API interna;
- render en JUMOCOL OS;
- consulta humana desde intranet;
- exposición de excepciones y firma de resultado.

NO VALIDADO AÚN:
- calidad final de indicadores gerenciales;
- cumplimiento / recaudo;
- meta diaria;
- conciliación financiera completa;
- cartera / recaudos pendientes;
- vista operacional por operador;
- vista gerencial consolidada;
- acciones sobre excepciones;
- write model.

## Alcance temporal operativo

**Regla canónica:** el Runtime Operativo TiviPlay procesa por defecto únicamente información desde **2026-06-01** en adelante.

Aplicación:
- junio 2026 → presente = ventana operacional activa;
- enero–mayo 2026 = excluido del flujo operativo diario;
- periodos anteriores = solo consulta histórica explícita;
- esta regla debe aplicarse en motor/API antes de construir KPIs gerenciales y operativos para evitar ruido, sobrecarga y mezcla de reglas históricas.

Identificador de regla:

`TIVIPLAY_RUNTIME_DATE_SCOPE_V1`

Estado: **VALIDADO COMO DECISIÓN DE ALCANCE**.

## Brecha de navegación

La ruta Runtime existe y funciona, pero todavía no está enlazada desde la pantalla principal de `/operaciones/tiviplay`.

Acceso actual directo:

`http://127.0.0.1:3000/operaciones/tiviplay/runtime`

Siguiente ajuste de UX:
- agregar botón / tarjeta `Runtime Operativo` dentro de `/operaciones/tiviplay`;
- mantener una única ruta canónica para acceso al módulo.

## Próxima fase del mismo módulo

Objetivo: convertir el Runtime de visor técnico en estación operacional útil para Dirección y equipo.

Prioridad:
1. aplicar `TIVIPLAY_RUNTIME_DATE_SCOPE_V1` en motor/API;
2. navegación visible desde Operaciones → TiviPlay;
3. definir indicadores vivos realmente útiles;
4. separar vista gerencial y vista operacional;
5. mostrar cumplimiento, recaudo, meta del día, pendientes, conciliaciones y excepciones;
6. mantener cada indicador ligado a fuente viva, regla y evidencia;
7. no escribir en producción hasta validar gates.

## NEXT ACTION

Aplicar el corte temporal desde 2026-06-01 en motor/API, agregar acceso visible a Runtime desde `/operaciones/tiviplay` y luego redefinir el contrato de datos del dashboard con indicadores gerenciales y operativos alimentados desde las fuentes vivas.
