@echo off
echo ========================================
echo   SEED OFICIAL DO PRISMA
echo ========================================
echo.
echo Este script vai criar:
echo - Super Admin com TODAS as permissoes (62)
echo - 10 roles diferentes
echo - Estabelecimento padrao
echo - Categorias, ingredientes, receitas
echo - Produtos manufaturados e de revenda
echo - Stock items, mesas e caixa
echo.
pause

echo.
echo Executando seed do Prisma...
call npx ts-node prisma/seed.ts

echo.
echo ========================================
echo   CONCLUIDO!
echo ========================================
echo.
echo IMPORTANTE: Anote as credenciais exibidas acima!
echo.
pause
