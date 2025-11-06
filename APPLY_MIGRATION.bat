@echo off
echo ========================================
echo Aplicando Migration - CMV e Receitas
echo ========================================
echo.

cd /d "%~dp0"

echo Gerando Prisma Client...
call npx prisma generate

echo.
echo Aplicando migration...
call npx prisma migrate dev --name add_recipes_and_cmv

echo.
echo ========================================
echo Migration aplicada com sucesso!
echo ========================================
echo.
pause
