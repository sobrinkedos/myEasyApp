@echo off
echo Executando migration...
node node_modules\prisma\build\index.js migrate dev --name add_stock_item_image
pause
