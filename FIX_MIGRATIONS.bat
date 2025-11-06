@echo off
echo ========================================
echo Corrigir Migrations e Aplicar Nova
echo ========================================
echo.

cd /d "%~dp0"

echo Marcando migrations antigas como aplicadas...
call npx prisma migrate resolve --applied 20241105000001_add_stock_item_image
call npx prisma migrate resolve --applied 20241106000001_enrich_ingredients

echo.
echo Gerando Prisma Client...
call npx prisma generate

echo.
echo Aplicando nova migration...
call npx prisma migrate deploy

echo.
echo ========================================
echo Migrations corrigidas!
echo ========================================
echo.
pause
