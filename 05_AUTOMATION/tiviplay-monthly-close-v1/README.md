# TIVIPLAY_MONTHLY_CLOSE_V1

Motor determinístico read-only para validar el corte mensual TiviPlay contra una fuente viva de Google Sheets.

## Objetivo

Ejecutar:

`fuente viva → lectura → cálculo → segunda lectura → comparación → evidencia`

sin escribir en producción.

## Requisitos

- Node.js 20+
- acceso Google configurado mediante Application Default Credentials o `GOOGLE_APPLICATION_CREDENTIALS`
- permiso de lectura sobre el spreadsheet fuente

## Instalación

```powershell
cd 05_AUTOMATION\tiviplay-monthly-close-v1
npm install
npm test
```

## Prueba histórica controlada — octubre 2026

Usar el corte preliminar preservado como oracle vivo del cierre 30/09:

```powershell
$env:TIVIPLAY_SPREADSHEET_ID="<ID_DE_GESTION_DIA_PAGOS>"
$env:TIVIPLAY_SOURCE_SHEET="PAGOS OCTUBRE 2026 - PRELIMINAR"
$env:TIVIPLAY_TARGET_MONTH="2026-10"
$env:TIVIPLAY_EXPECTED_COUNT="99"
$env:TIVIPLAY_EXPECTED_WEEKS="13,30,27,16,13"

npm run run
```

Resultado esperado:

```text
RUN 1: 99 | weeks 13/30/27/16/13
RUN 2: 99 | weeks 13/30/27/16/13
Repeatable: YES
Duplicates: 0
Oracle: MATCH
STATUS: VALIDADO
```

## Operación futura

En un cierre real, usar `BASE GENERAL` como `TIVIPLAY_SOURCE_SHEET` **antes de mutar la base** y conservar la evidencia generada.

El motor no modifica Google Sheets.

## Evidencia

Cada ejecución escribe, localmente:

- `evidence/monthly-close-YYYY-MM.json`
- `evidence/monthly-close-YYYY-MM.md`

Los archivos no contienen nombres de clientes; la evidencia se basa en conteos, hashes, excepciones y resultados de validación.

## Exit codes

- `0`: VALIDADO
- `1`: PARCIAL / diferencia
- `2`: configuración inválida

## Estado

V1 valida lectura viva, selección mensual, distribución semanal, duplicados, repeatability y oracle. No habilita escritura en producción.
