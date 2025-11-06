@echo off
echo ========================================
echo Aplicando Nova Migration - CMV e Receitas
echo ========================================
echo.

cd /d "%~dp0"

echo Gerando Prisma Client...
call npx prisma generate

echo.
echo Aplicando migration deploy (produção)...
call npx prisma migrate deploy

echo.
echo ========================================
echo Migration aplicada!
echo ========================================
echo.
echo Se houver erros, execute RESET_AND_MIGRATE.bat
echo (AVISO: Isso vai apagar todos os dados!)
echo.
pause
