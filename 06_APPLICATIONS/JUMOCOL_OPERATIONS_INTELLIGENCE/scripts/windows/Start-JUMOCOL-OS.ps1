[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$LocalAddress = "127.0.0.1"
$Port = 3000
$LocalUrl = "http://localhost:$Port/"
$ApplicationMarker = "JUMOCOL Operations Intelligence"
$StartupTimeoutSeconds = 90

function Write-Status {
  param([Parameter(Mandatory = $true)][string]$Message)

  Write-Host "[JUMOCOL OS] $Message" -ForegroundColor Cyan
}

function Test-JumocolOsAvailable {
  try {
    $response = Invoke-WebRequest -Uri $LocalUrl -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -eq 200 -and $response.Content.Contains($ApplicationMarker)
  }
  catch {
    return $false
  }
}

function Test-LocalPortInUse {
  try {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
      Select-Object -First 1
    return $null -ne $connection
  }
  catch {
    $client = [System.Net.Sockets.TcpClient]::new()

    try {
      $connectionAttempt = $client.BeginConnect($LocalAddress, $Port, $null, $null)
      if (-not $connectionAttempt.AsyncWaitHandle.WaitOne(750)) {
        return $false
      }

      $client.EndConnect($connectionAttempt)
      return $true
    }
    catch {
      return $false
    }
    finally {
      $client.Dispose()
    }
  }
}

function Get-NodeCommand {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($null -eq $nodeCommand) {
    throw "Node.js no esta disponible. Instala Node.js 24 o superior y vuelve a intentarlo."
  }

  $versionText = (& $nodeCommand.Source --version).Trim()
  $normalizedVersion = $versionText.TrimStart("v").Split("-")[0]
  if ([version]$normalizedVersion -lt [version]"24.0.0") {
    throw "JUMOCOL OS requiere Node.js 24 o superior. Version detectada: $versionText."
  }

  return $nodeCommand.Source
}

function Install-DependenciesIfRequired {
  $nextCli = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"
  if (Test-Path -LiteralPath $nextCli -PathType Leaf) {
    return $nextCli
  }

  Write-Status "No se encontraron las dependencias. Ejecutando pnpm install --frozen-lockfile..."

  $pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
  if ($null -ne $pnpmCommand) {
    & $pnpmCommand.Source install --frozen-lockfile
  }
  else {
    $corepackCommand = Get-Command corepack.cmd -ErrorAction SilentlyContinue
    if ($null -eq $corepackCommand) {
      throw "No se encontro pnpm ni Corepack. Instala pnpm y ejecuta pnpm install en el proyecto."
    }

    & $corepackCommand.Source pnpm install --frozen-lockfile
  }

  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $nextCli -PathType Leaf)) {
    throw "La instalacion de dependencias no termino correctamente."
  }

  return $nextCli
}

function Open-JumocolOs {
  Write-Status "Abriendo $LocalUrl en el navegador predeterminado..."
  Start-Process -FilePath $LocalUrl
}

function Pause-OnError {
  if ($Host.Name -eq "ConsoleHost") {
    [void](Read-Host "Presiona Enter para cerrar")
  }
}

try {
  try {
    $Host.UI.RawUI.WindowTitle = "JUMOCOL OS - Servidor local"
  }
  catch {
    # Algunos hosts no permiten cambiar el titulo; no afecta el inicio.
  }

  Set-Location -LiteralPath $ProjectRoot
  Write-Status "Proyecto: $ProjectRoot"

  if (Test-JumocolOsAvailable) {
    Write-Status "La intranet ya esta funcionando. No se iniciara otro servidor."
    Open-JumocolOs
    exit 0
  }

  if (Test-LocalPortInUse) {
    Write-Status "El puerto $Port esta ocupado. Esperando una instancia de JUMOCOL OS..."

    foreach ($attempt in 1..10) {
      Start-Sleep -Seconds 1
      if (Test-JumocolOsAvailable) {
        Write-Status "La instancia existente ya esta disponible."
        Open-JumocolOs
        exit 0
      }
    }

    throw "El puerto $Port esta ocupado por otra aplicacion. Cierra ese proceso o libera el puerto antes de iniciar JUMOCOL OS."
  }

  $nodeExecutable = Get-NodeCommand
  $nextCli = Install-DependenciesIfRequired

  Write-Status "Iniciando la intranet en modo desarrollo (equivalente a pnpm dev) en el puerto $Port..."
  $serverArguments = @(
    "`"$nextCli`"",
    "dev",
    "--hostname",
    $LocalAddress,
    "--port",
    [string]$Port
  )
  $serverProcessParameters = @{
    FilePath = $nodeExecutable
    ArgumentList = $serverArguments
    WorkingDirectory = $ProjectRoot
    NoNewWindow = $true
    PassThru = $true
  }
  $serverProcess = Start-Process @serverProcessParameters

  foreach ($elapsedSeconds in 1..$StartupTimeoutSeconds) {
    if ($serverProcess.HasExited) {
      throw "El servidor se detuvo antes de estar disponible. Codigo de salida: $($serverProcess.ExitCode)."
    }

    if (Test-JumocolOsAvailable) {
      Write-Status "JUMOCOL OS esta disponible."
      Open-JumocolOs
      Write-Host ""
      Write-Host "Servidor activo en $LocalUrl" -ForegroundColor Green
      Write-Host "Para cerrar la intranet, cierra esta ventana o presiona Ctrl+C." -ForegroundColor Yellow
      try {
        Wait-Process -Id $serverProcess.Id
      }
      finally {
        if (-not $serverProcess.HasExited) {
          Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
      }
      Write-Status "El servidor se detuvo."
      exit 0
    }

    Start-Sleep -Seconds 1
  }

  Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
  throw "JUMOCOL OS no respondio en $StartupTimeoutSeconds segundos. Revisa los mensajes anteriores."
}
catch {
  Write-Host ""
  Write-Host "[JUMOCOL OS] No fue posible iniciar la intranet." -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Pause-OnError
  exit 1
}
