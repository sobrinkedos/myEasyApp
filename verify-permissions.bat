@echo off
echo ========================================
echo   VERIFICACAO DE PERMISSOES
echo ========================================
echo.
echo Verificando permissoes do usuario admin...
echo.

call npx ts-node scripts/verify-permissions.ts

echo.
pause
