@echo off
echo ========================================
echo   Setup de Caixas - Sistema de Gestao
echo ========================================
echo.

echo Criando caixas de teste...
echo.

npx ts-node prisma/seed-cash-registers.ts

echo.
echo ========================================
echo   Setup concluido!
echo ========================================
echo.
echo Agora voce pode:
echo 1. Acessar http://localhost:5173/cash
echo 2. Clicar em "Abrir Caixa"
echo 3. Selecionar um caixa da lista
echo.
pause
