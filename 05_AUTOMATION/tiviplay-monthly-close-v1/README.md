# TIVIPLAY_MONTHLY_CLOSE_V1

Motor determinístico read-only para validar el cierre mensual TiviPlay contra fuentes vivas de Google Sheets.

## Objetivo

Ejecutar:

`fuente viva → captura gobernada → cálculo → segunda ejecución sobre el mismo input → verificación de drift → evidencia`

sin escribir en producción.

## Requisitos

- Node.js 20+
- credenciales Google ya usadas por JUMOCOL:
  - `GOOGLE_SHEETS_CLIENT_EMAIL`
  - `GOOGLE_SHEETS_PRIVATE_KEY`
- permiso de lectura sobre el spreadsheet fuente

También puede usarse Application Default Credentials / `GOOGLE_APPLICATION_CREDENTIALS`.

## Instalación

```powershell
cd 05_AUTOMATION\tiviplay-monthly-close-v1
npm install
npm test
```

## Prueba histórica controlada — octubre 2026

Usar el corte preliminar preservado como oracle del cierre 30/09:

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
Source stable during run: YES
Duplicates: 0
Oracle: MATCH
STATUS: VALIDADO
```

## Ejecución contra BASE GENERAL viva

Para validar el estado vivo actual sin un oracle histórico:

```powershell
$env:TIVIPLAY_SOURCE_SHEET="BASE GENERAL"
$env:TIVIPLAY_TARGET_MONTH="2026-10"
Remove-Item Env:TIVIPLAY_EXPECTED_COUNT -ErrorAction SilentlyContinue
Remove-Item Env:TIVIPLAY_EXPECTED_WEEKS -ErrorAction SilentlyContinue

npm run run
```

Si la fuente permanece estable durante la ejecución, no hay duplicados y la lógica es determinística:

```text
STATUS: VALIDADO_TECNICO
```

Esto no certifica la corrección de negocio del universo; certifica que el motor reproduce de forma estable el estado vivo leído.

## Snapshot privado de corte

Opcional y **desactivado por defecto**. Solo se escribe si se pide explícitamente:

```powershell
$env:TIVIPLAY_PERSIST_SNAPSHOT="true"
```

Ubicación local (fuera de Git mediante la política `data/private`):

```text
06_APPLICATIONS/JUMOCOL_OPERATIONS_INTELLIGENCE/data/private/
  tiviplay-monthly-close-v1/snapshots/
```

El snapshot contiene datos operativos de clientes (nunca la contraseña) y no debe subirse al repositorio.

## Datos sensibles

- La columna `CONTRASEÑA` (y equivalentes) **no se solicita a la API**: la lectura localiza la fila de encabezados y pide solo los tramos de columnas permitidos. La columna llega vacía.
- `core.mjs` además vacía cualquier columna sensible de la entrada (`redactSensitiveColumns`) y no expone `password` en el preview.
- La clave privada de `.env.local` se normaliza (comillas, `\n` literales, CRLF) para evitar `ERR_OSSL_UNSUPPORTED`.

## Evidencia sanitizada

La ejecución escribe en `evidence/` (ignorada por Git; compartir solo copias revisadas):

- `evidence/monthly-close-YYYY-MM.json`
- `evidence/monthly-close-YYYY-MM.md`

La evidencia contiene conteos, semanas, filas de origen, fechas, hashes, firmas, excepciones y cartera vencida. **No contiene el preview** (cliente, teléfono, correo, usuario, observaciones). Antes de escribir, `run.mjs` verifica que ningún valor personal del preview aparezca en el JSON o el Markdown; si aparece, no escribe nada y termina con código 2. La consola solo imprime conteos.

Fecha de corte explícita: `TIVIPLAY_CUTOFF_DATE=YYYY-MM-DD` (el motor nunca usa la fecha de ejecución).

Ejecución local recomendada en el equipo de Dirección: `scripts/ejecutar-solo-lectura.ps1` (oracle 99 + BASE GENERAL viva, copia privada, sin snapshots).

## Estados

- `VALIDADO`: determinismo + fuente estable + cero duplicados + oracle suministrado y coincidente.
- `VALIDADO_TECNICO`: determinismo + fuente estable + cero duplicados, sin oracle de negocio.
- `PARCIAL`: diferencia técnica, drift durante el run, duplicados o oracle no coincidente.

## Exit codes

- `0`: VALIDADO o VALIDADO_TECNICO
- `1`: PARCIAL
- `2`: configuración inválida o evidencia bloqueada por datos personales

## Estado funcional

V1 implementa:

- lectura Google Sheets viva;
- selección por `F. PRÓXIMO PAGO`;
- cinco buckets semanales;
- detección de duplicados;
- captura privada de fuente;
- replay determinístico sobre el mismo input;
- detección de cambios de la fuente durante la ejecución;
- oracle opcional;
- evidencia auditable.

No habilita escritura en producción.

## Preview operacional privado

Con `TIVIPLAY_PERSIST_SNAPSHOT=true`, la ejecución sobre `BASE GENERAL` genera también, fuera de Git (sin contraseña):

- `YYYY-MM__preview.json`
- `YYYY-MM__preview.csv`
- `YYYY-MM__exceptions.json`

El preview contiene las filas candidatas para `PAGOS [MES]` con origen `BASE GENERAL!fila`, semana operacional y clasificación inicial `FACTURAR_CANDIDATO`.

`FACTURAR_CANDIDATO` no sustituye todavía las reglas S0-B de mes gratis, desactivado, plan/acuerdo especial o excepción. Es una salida determinística intermedia que permite iterar esas reglas sin escribir en producción.

Las excepciones de calidad de datos se separan en una cola explícita y nunca se corrigen silenciosamente. Una ficha `TC=1` con F. PRÓXIMO PAGO vacía o no interpretable aparece como `INVALID_NEXT_PAYMENT_DATE`, con `cause` igual a `EMPTY_NEXT_PAYMENT_DATE` o `UNPARSEABLE_NEXT_PAYMENT_DATE`.

## Fecha de corte y cartera vencida (S0-B)

- `TIVIPLAY_CUTOFF_DATE=YYYY-MM-DD` fija la fecha de referencia. El motor nunca usa la fecha de ejecución. Sin ella, `daysPastDue` queda en `null`.
- `carteraVencida[]` reúne las fichas `TC=1` con F. PRÓXIMO PAGO válida anterior al inicio del mes objetivo. Es una población separada del ciclo mensual, sin datos personales, con `origin`, `dueMonth`, `lastPaymentDate`, `daysPastDue` y `signals`.
- Las señales (`USUARIO_LIBERADO`, `DESACTIVADO`, `NO_RENUEVA`, `MES_GRATIS`, `EXCEPCION`, `MIGRACION`, `CUENTA_UNIFICADA`) marcan `REQUIERE_REVISION`, pero nunca excluyen la ficha.
- `signature` se conserva para el ciclo mensual. `outputSignature` firma ciclo, cartera, excepciones y corte.
