@echo off
echo Aplicando schema ao banco de dados...
node node_modules\prisma\build\index.js db push
pause
