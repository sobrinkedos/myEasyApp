@echo off
echo ========================================
echo   POPULANDO BANCO COM DADOS DE TESTE
echo ========================================
echo.
echo Este script vai criar:
echo - 1 estabelecimento (Restaurante Sabor e Arte)
echo - 1 usuario admin (admin@saborarte.com.br / admin123)
echo - 4 categorias
echo - 18 ingredientes
echo - 6 receitas completas
echo - 12 produtos (6 com receitas + 6 de revenda)
echo - Imagens baixadas da internet
echo.
pause

echo.
echo Instalando dependencias necessarias...
call npm install axios

echo.
echo Executando seed...
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
