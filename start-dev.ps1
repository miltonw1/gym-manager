# ============================================================
#  Gym Manager - Dev Launcher (PowerShell)
#  Abre dos terminales: Backend (NestJS) y Frontend (Vite).
#
#  Uso:
#    .\start-dev.ps1        (desde PowerShell)
#    O doble clic en start-dev.bat (si preferís CMD)
# ============================================================

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendDir = Join-Path $root "gym-manager-backend"
$frontendDir = Join-Path $root "gym-manager-frontend"

foreach ($dir in @($backendDir, $frontendDir)) {
  if (-not (Test-Path $dir)) {
    Write-Warning "No se encontró la carpeta: $dir"
  }
}

Write-Host "Levantando Backend (NestJS) en http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; pnpm start:dev" -WorkingDirectory $backendDir

Write-Host "Levantando Frontend (Vite) en http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; pnpm dev" -WorkingDirectory $frontendDir

Write-Host ""
Write-Host "  Backend : http://localhost:3000" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  Para detener, cierra las dos ventanas de terminal (Ctrl+C)."
