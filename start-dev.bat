@echo off
REM ============================================================
REM  Gym Manager - Dev Launcher
REM  Abre dos terminales: Backend (NestJS) y Frontend (Vite).
REM  Doble clic para levantar todo de una vez.
REM ============================================================
setlocal

set "ROOT=%~dp0"

echo Levantando Backend (NestJS) en http://localhost:3000 ...
start "Gym Manager - Backend" cmd /k "cd /d "%ROOT%gym-manager-backend" && pnpm start:dev"

echo Levantando Frontend (Vite) en http://localhost:5173 ...
start "Gym Manager - Frontend" cmd /k "cd /d "%ROOT%gym-manager-frontend" && pnpm dev"

echo.
echo  Backend : http://localhost:3000
echo  Frontend: http://localhost:5173
echo.
echo  Para detener, cierra las dos ventanas de terminal (Ctrl+C).
endlocal
