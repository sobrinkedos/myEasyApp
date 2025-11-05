@echo off
echo Gerando Prisma Client...
node node_modules\prisma\build\index.js generate
pause
