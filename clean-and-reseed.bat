@echo off
echo ========================================
echo   LIMPEZA E RESEED DO BANCO
echo ========================================
echo.
echo Este script vai:
echo 1. Deletar produtos, receitas e ingredientes duplicados
echo 2. Recriar todos os dados do zero
echo.
pause

echo.
echo [1/2] Limpando dados duplicados...
call npx ts-node scripts/clean-duplicates.ts

echo.
echo [2/2] Executando seed novamente...
call npx ts-node scripts/seed-test-data.ts

echo.
echo ========================================
echo   CONCLUIDO!
echo ========================================
echo.
echo Credenciais de acesso:
echo Email: admin@saborarte.com.br
echo Senha: admin123
echo.
pause
