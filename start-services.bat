@echo off
echo ========================================
echo   Iniciando Serviços Portáteis
echo ========================================
echo.

REM Verificar se os serviços existem
if not exist "portable-db\postgresql\bin\pg_ctl.exe" (
    echo ❌ PostgreSQL não encontrado!
    echo Execute setup-portable.bat primeiro.
    pause
    exit /b 1
)

if not exist "portable-db\redis\redis-server.exe" (
    echo ❌ Redis não encontrado!
    echo Execute setup-portable.bat primeiro.
    pause
    exit /b 1
)

echo 🚀 Iniciando PostgreSQL...
cd portable-db\postgresql
start "PostgreSQL" bin\pg_ctl.exe -D data -l logfile start
cd ..\..

timeout /t 2 /nobreak > nul

echo 🚀 Iniciando Redis...
cd portable-db\redis
start "Redis" redis-server.exe
cd ..\..

timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo   ✅ Serviços Iniciados!
echo ========================================
echo.
echo PostgreSQL: localhost:5432
echo Redis: localhost:6379
echo.
echo Para iniciar a API, execute: npm run dev
echo.
pause
