@echo off
echo ========================================
echo   Parando Serviços Portáteis
echo ========================================
echo.

echo 🛑 Parando PostgreSQL...
if exist "portable-db\postgresql\bin\pg_ctl.exe" (
    cd portable-db\postgresql
    bin\pg_ctl.exe -D data stop
    cd ..\..
    echo ✅ PostgreSQL parado
) else (
    echo ⚠️  PostgreSQL não encontrado
)

echo.
echo 🛑 Parando Redis...
taskkill /FI "WINDOWTITLE eq Redis*" /F > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis parado
) else (
    echo ⚠️  Redis não estava rodando
)

echo.
echo ========================================
echo   ✅ Serviços Parados!
echo ========================================
echo.
pause
