@echo off
echo ========================================
echo   Iniciando Servidores (Método Simples)
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend (porta 3000)...
start "Backend Server" cmd /k "npm run dev"

echo Aguardando backend iniciar...
timeout /t 5 /nobreak > nul

echo.
echo [2/2] Iniciando Frontend (porta 5173)...
start "Frontend Server" cmd /k "cd web-app && npm run dev"

echo.
echo ========================================
echo   Servidores Iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:3000/api/docs
echo.
echo Feche as janelas dos servidores para parar.
echo.
pause
