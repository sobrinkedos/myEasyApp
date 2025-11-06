@echo off
echo ========================================
echo   Iniciando Servidores
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend (porta 3000)...
start "Backend Server" cmd /k "node node_modules\ts-node-dev\lib\bin.js --respawn --transpile-only src/server.ts"

echo Aguardando backend iniciar...
timeout /t 5 /nobreak > nul

echo.
echo [2/2] Iniciando Frontend (porta 5173)...
start "Frontend Server" cmd /k "cd web-app && node node_modules\vite\bin\vite.js"

echo.
echo ========================================
echo   Servidores Iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Acesse o frontend no navegador.
echo Feche as janelas dos servidores para parar.
echo.
pause
