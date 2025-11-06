@echo off
echo ========================================
echo   Setup - Sistema de Estoque
echo ========================================
echo.

echo [1/2] Gerando Prisma Client...
call npx prisma generate

echo.
echo [2/2] Criando Migration...
call npx prisma migrate dev --name add_stock_items

echo.
echo ========================================
echo   Setup Concluido!
echo ========================================
echo.
echo Agora reinicie o backend:
echo 1. Pare o servidor (Ctrl+C)
echo 2. Execute: npm run dev
echo.
pause
