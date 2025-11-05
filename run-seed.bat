@echo off
echo Executando seed do banco de dados...
node node_modules\ts-node\dist\bin.js prisma/seed.ts
pause
