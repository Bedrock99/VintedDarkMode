# PowerShell Packaging Script für Vinted Dark Mode Firefox Extension
$ErrorActionPreference = "Stop"

$distDir = Join-Path $PSScriptRoot "dist"
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

$manifestContent = Get-Content -Raw -Path (Join-Path $PSScriptRoot "manifest.json") | ConvertFrom-Json
$version = $manifestContent.version

$xpiPath = Join-Path $distDir "vinted-dark-mode-v$version.xpi"
$zipPath = Join-Path $distDir "vinted-dark-mode-v$version.zip"

if (Test-Path $xpiPath) { Remove-Item -Force $xpiPath }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

# Run package.py
python (Join-Path $PSScriptRoot "package.py")

Write-Host "`nExtension erfolgreich gepackt in: $distDir" -ForegroundColor Green
