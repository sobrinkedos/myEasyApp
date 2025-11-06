@echo off
echo ========================================
echo   Diagnóstico do Sistema
echo ========================================
echo.

cd /d "%~dp0"

echo [1] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js não encontrado!
    echo Instale Node.js: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2] Verificando npm...
call npm --version
if %errorlevel% neq 0 (
    echo ERRO: npm não encontrado!
    pause
    exit /b 1
)

echo.
echo [3] Verificando dependências do backend...
if not exist "node_modules" (
    echo AVISO: node_modules não encontrado!
    echo Execute: npm install
) else (
    echo OK: node_modules encontrado
)

echo.
echo [4] Verificando dependências do frontend...
if not exist "web-app\node_modules" (
    echo AVISO: web-app/node_modules não encontrado!
    echo Execute: cd web-app && npm install
) else (
    echo OK: web-app/node_modules encontrado
)

echo.
echo [5] Verificando arquivo .env...
if not exist ".env" (
    echo AVISO: .env não encontrado!
    echo Copie .env.example para .env
) else (
    echo OK: .env encontrado
)

echo.
echo [6] Verificando Prisma Client...
if not exist "node_modules\.prisma\client" (
    echo AVISO: Prisma Client não gerado!
    echo Execute: npx prisma generate
) else (
    echo OK: Prisma Client gerado
)

echo.
echo [7] Verificando porta 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo AVISO: Porta 3000 em uso!
    echo Algo já está rodando na porta 3000
    netstat -ano | findstr :3000
) else (
    echo OK: Porta 3000 disponível
)

echo.
echo [8] Verificando porta 5173...
netstat -ano | findstr :5173 > nul
if %errorlevel% equ 0 (
    echo AVISO: Porta 5173 em uso!
    echo Algo já está rodando na porta 5173
    netstat -ano | findstr :5173
) else (
    echo OK: Porta 5173 disponível
)

echo.
echo ========================================
echo   Diagnóstico Completo
echo ========================================
echo.
echo Se houver avisos acima, corrija-os antes de iniciar.
echo.
pause
