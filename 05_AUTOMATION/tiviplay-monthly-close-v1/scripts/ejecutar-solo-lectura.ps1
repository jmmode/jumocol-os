# JUMOCOL OS / TiviPlay — Ejecución local del motor en SOLO LECTURA
# Basado en EJECUTAR_MOTOR_TIVIPLAY_SOLO_LECTURA_2026-10-19.ps1 (antecedente; nunca ejecutado con éxito).
# Cambios respecto del 19/10: el motor ya no pide la columna CONTRASEÑA a la API ni guarda datos
# personales en evidence/, así que el JSON sanitizado se conserva; se agrega fecha de corte y mes vivo.
# Seguridad: copia privada fuera de Git; sin snapshots; scope spreadsheets.readonly; sin escrituras en Sheets.
param(
  [string]$LiveMonth = '2026-11',
  [string]$CutoffDate = '2026-10-31'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = 'C:\Users\USUARIO\Documents\JUMOCOL_SYSTEM_OS'
$app = Join-Path $root '06_APPLICATIONS\JUMOCOL_OPERATIONS_INTELLIGENCE'
$source = Join-Path $root '05_AUTOMATION\tiviplay-monthly-close-v1'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$privateRoot = Join-Path $env:LOCALAPPDATA "JUMOCOL_OS\private_runs\tiviplay-monthly-close-$timestamp"
$engine = Join-Path $privateRoot 'engine'
$reports = Join-Path $privateRoot 'reportes_sanitizados'
$envFile = Join-Path $app '.env.local'

if (-not (Test-Path -LiteralPath (Join-Path $source 'src\evidence.mjs'))) {
  throw 'El motor local no tiene la versión sanitizada (falta src\evidence.mjs). No se ejecuta.'
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js no está en PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm no está en PATH.' }

New-Item -ItemType Directory -Path $engine,$reports -Force | Out-Null
foreach ($fileName in @('package.json','package-lock.json','run.mjs')) {
  $path = Join-Path $source $fileName
  if (Test-Path -LiteralPath $path) { Copy-Item -LiteralPath $path -Destination (Join-Path $engine $fileName) -Force }
}
foreach ($dirName in @('src','test')) {
  $path = Join-Path $source $dirName
  if (Test-Path -LiteralPath $path -PathType Container) {
    Copy-Item -LiteralPath $path -Destination (Join-Path $engine $dirName) -Recurse -Force
  }
}

$env:TIVIPLAY_SPREADSHEET_ID = '1bOgUMrHoAyAm-aoRhXgylWfbHph7tsvJYz1mIujdi-4'
$env:TIVIPLAY_SOURCE_RANGE = 'A1:W5000'
$env:TIVIPLAY_PERSIST_SNAPSHOT = 'false'
$envArgs = @()
if (Test-Path -LiteralPath $envFile -PathType Leaf) {
  $envArgs = @("--env-file=$envFile")
  Write-Host 'Configuracion privada: .env.local existente (no se imprimiran sus valores).'
} else {
  Write-Warning 'No encontre .env.local; intentare credenciales del entorno/ADC sin mostrarlas.'
}

Push-Location $engine
try {
  Write-Host "`n========== PRUEBAS DEL MOTOR (COPIA PRIVADA) =========="
  if (Test-Path -LiteralPath (Join-Path $engine 'package-lock.json')) {
    & npm ci --ignore-scripts --no-audit --no-fund
  } else {
    & npm install --ignore-scripts --no-audit --no-fund
  }
  if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar las dependencias en copia privada.' }
  & npm test
  if ($LASTEXITCODE -ne 0) { throw 'Tests fallidos. Se detiene la ejecucion sin leer datos vivos.' }

  function Run-SafeClose {
    param(
      [Parameter(Mandatory)][string]$Sheet,
      [Parameter(Mandatory)][string]$Label,
      [Parameter(Mandatory)][string]$Month,
      [string]$Cutoff = '',
      [string]$ExpectedCount = '',
      [string]$ExpectedWeeks = ''
    )
    $env:TIVIPLAY_SOURCE_SHEET = $Sheet
    $env:TIVIPLAY_TARGET_MONTH = $Month
    if ($Cutoff) { $env:TIVIPLAY_CUTOFF_DATE = $Cutoff } else { Remove-Item Env:TIVIPLAY_CUTOFF_DATE -ErrorAction SilentlyContinue }
    if ($ExpectedCount) { $env:TIVIPLAY_EXPECTED_COUNT = $ExpectedCount } else { Remove-Item Env:TIVIPLAY_EXPECTED_COUNT -ErrorAction SilentlyContinue }
    if ($ExpectedWeeks) { $env:TIVIPLAY_EXPECTED_WEEKS = $ExpectedWeeks } else { Remove-Item Env:TIVIPLAY_EXPECTED_WEEKS -ErrorAction SilentlyContinue }

    Write-Host "`n========== $Label =========="
    Write-Host "Fuente: $Sheet. Mes: $Month. Corte: $Cutoff. SOLO LECTURA."
    & node @envArgs '.\run.mjs' | Out-Host
    $code = $LASTEXITCODE
    foreach ($ext in @('md','json')) {
      $file = Join-Path $engine "evidence\monthly-close-$Month.$ext"
      if (Test-Path -LiteralPath $file) { Copy-Item -LiteralPath $file -Destination (Join-Path $reports "$Label.$ext") -Force }
    }
    Write-Host "RESULTADO_$($Label)_EXITCODE: $code (0=OK tecnico; 1=PARCIAL; 2=configuracion invalida o evidencia bloqueada)"
    return $code
  }

  $historicalCode = Run-SafeClose -Sheet 'PAGOS OCTUBRE 2026 - PRELIMINAR' -Label '01_LECTURA_REFERENCIA_99' -Month '2026-10' -Cutoff '2026-09-30' -ExpectedCount '99' -ExpectedWeeks '13,30,27,16,13'
  $liveCode = Run-SafeClose -Sheet 'BASE GENERAL' -Label '02_BASE_GENERAL_VIVA' -Month $LiveMonth -Cutoff $CutoffDate

  Write-Host "`n========== CHECKPOINT =========="
  Write-Host 'No se han modificado Google Sheets, ni confirmado pagos, ni escrito dentro del repositorio.'
  Write-Host 'Oracle 99 comprueba conteos y semanas, NO reconstruccion historica ni conciliacion bancaria.'
  Write-Host "Reporte historico: $historicalCode | Reporte vivo: $liveCode"
  Write-Host "Reportes sanitizados (MD y JSON, sin datos de clientes): $reports"
  Write-Host 'Comparte SOLO los reportes sanitizados o las lineas RUN/Repeatable/Source stable/Duplicates/Exceptions/Cartera/Oracle/STATUS/Exitcode.'
  if ($historicalCode -ne 0 -or $liveCode -ne 0) {
    Write-Warning 'Hubo PARCIAL o bloqueo tecnico. Conservar los reportes, no declarar el gate validado.'
  }
} finally {
  Pop-Location
}
