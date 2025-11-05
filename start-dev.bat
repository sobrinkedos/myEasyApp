@echo off
echo ========================================
echo   Iniciando Ambiente de Desenvolvimento
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Instale o Node.js 20+ de: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    echo.
)

REM Verificar se o Prisma foi gerado
if not exist "node_modules\.prisma" (
    echo 🔧 Gerando cliente Prisma...
    call npm run prisma:generate
    echo.
)

REM Verificar se o banco foi criado
echo 🗄️  Verificando banco de dados...
call npm run prisma:migrate > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Criando banco de dados...
    call npm run prisma:migrate
    echo.
    echo 🌱 Populando banco...
    call npm run prisma:seed
    echo.
)

echo.
echo ========================================
echo   🚀 Iniciando API
echo ========================================
echo.
echo API estará disponível em:
echo   - http://localhost:3000
echo   - Docs: http://localhost:3000/api/docs
echo   - Health: http://localhost:3000/health
echo.
echo Pressione Ctrl+C para parar
echo.

call npm run dev
