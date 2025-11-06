@echo off
echo ========================================
echo Reset e Aplicar Todas as Migrations
echo ========================================
echo.
echo AVISO: Isso vai resetar o banco de dados!
echo Todos os dados serão perdidos.
echo.
pause

cd /d "%~dp0"

echo.
echo Resetando banco de dados...
call npx prisma migrate reset --force

echo.
echo Gerando Prisma Client...
call npx prisma generate

echo.
echo ========================================
echo Banco resetado e migrations aplicadas!
echo ========================================
echo.
pause
