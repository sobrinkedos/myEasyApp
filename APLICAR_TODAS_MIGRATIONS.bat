@echo off
echo ========================================
echo Aplicar TODAS as Migrations
echo ========================================
echo.
echo Este script vai aplicar todas as migrations
echo na ordem correta.
echo.
pause

cd /d "%~dp0"

echo.
echo [1/3] Gerando Prisma Client...
call npx prisma generate

echo.
echo [2/3] Aplicando migrations com deploy...
call npx prisma migrate deploy

echo.
echo [3/3] Verificando status...
call npx prisma migrate status

echo.
echo ========================================
echo Processo Concluído!
echo ========================================
echo.
echo Se ainda houver erros, execute:
echo RESET_AND_MIGRATE.bat (APAGA TODOS OS DADOS!)
echo.
pause
