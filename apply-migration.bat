@echo off
echo Aplicando migration para adicionar imageUrl...
echo.

cd /d "%~dp0"

echo Gerando Prisma Client...
node node_modules\prisma\build\index.js generate

echo.
echo Aplicando migration...
node node_modules\prisma\build\index.js migrate deploy

echo.
echo Migration aplicada com sucesso!
echo.
pause
