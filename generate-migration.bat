@echo off
echo Gerando migration do Prisma...
node node_modules\prisma\build\index.js migrate dev --name add_rbac_and_access_control
pause
