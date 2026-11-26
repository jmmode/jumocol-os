[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$StartScript = Join-Path $PSScriptRoot "Start-JUMOCOL-OS.ps1"
$IconPath = Join-Path $PSScriptRoot "jumocol-os.ico"
$PowerShellPath = Join-Path $PSHOME "powershell.exe"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "JUMOCOL OS.lnk"

foreach ($requiredFile in @($StartScript, $IconPath, $PowerShellPath)) {
  if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) {
    throw "No se encontro el archivo requerido: $requiredFile"
  }
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $PowerShellPath
$shortcut.Arguments = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$StartScript`""
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.IconLocation = "$IconPath,0"
$shortcut.Description = "Iniciar JUMOCOL Operations Intelligence"
$shortcut.WindowStyle = 1
$shortcut.Save()

Write-Host "Acceso directo creado: $ShortcutPath" -ForegroundColor Green
