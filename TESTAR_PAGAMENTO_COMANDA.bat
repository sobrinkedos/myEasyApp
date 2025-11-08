@echo off
echo ========================================
echo   TESTE DE PAGAMENTO DE COMANDA
echo ========================================
echo.
echo Este script testa se o pagamento de comandas
echo esta sendo lancado corretamente no caixa.
echo.
echo Pressione qualquer tecla para iniciar...
pause > nul

node test-command-payment.js

echo.
echo ========================================
echo Pressione qualquer tecla para sair...
pause > nul
