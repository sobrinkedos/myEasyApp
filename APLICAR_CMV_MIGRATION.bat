@echo off
echo ========================================
echo Aplicar Migration de CMV (Corrigida)
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Marcando migration como não aplicada...
call npx prisma migrate resolve --rolled-back 20250106000001_add_recipes_and_cmv

echo.
echo [2/3] Gerando Prisma Client...
call npx prisma generate

echo.
echo [3/3] Aplicando migration corrigida...
call npx prisma migrate deploy

echo.
echo ========================================
echo Migration Aplicada!
echo ========================================
echo.
pause
