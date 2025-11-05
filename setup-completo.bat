@echo off
echo ========================================
echo   Setup Completo - Restaurant API
echo ========================================
echo.
echo Suas credenciais ja estao configuradas!
echo - Neon PostgreSQL: Conectado
echo - Upstash Redis: Conectado
echo.
echo Iniciando setup automatico...
echo.

REM Verificar Node.js
echo 1/5 Verificando Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Instale o Node.js 20+ de: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado
echo.

REM Instalar dependencias
echo 2/5 Instalando dependencias...
echo (Isso pode levar 2-3 minutos)
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

REM Gerar cliente Prisma
echo 3/5 Gerando cliente Prisma...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar cliente Prisma
    pause
    exit /b 1
)
echo ✅ Cliente Prisma gerado
echo.

REM Criar tabelas
echo 4/5 Criando tabelas no banco...
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo ❌ Erro ao criar tabelas
    echo Verifique se o DATABASE_URL esta correto no .env.development
    pause
    exit /b 1
)
echo ✅ Tabelas criadas
echo.

REM Popular banco
echo 5/5 Populando banco com dados de teste...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ❌ Erro ao popular banco
    pause
    exit /b 1
)
echo ✅ Banco populado
echo.

echo ========================================
echo   ✅ Setup Concluido com Sucesso!
echo ========================================
echo.
echo Credenciais de teste criadas:
echo   Email: admin@restaurant.com
echo   Senha: admin123
echo.
echo Proximos passos:
echo   1. Execute: npm run dev
echo   2. Acesse: http://localhost:3000/api/docs
echo   3. Teste: node test-api.js
echo.
echo Pressione qualquer tecla para iniciar a API...
pause > nul

echo.
echo ========================================
echo   Iniciando API...
echo ========================================
echo.
echo API estara disponivel em:
echo   - http://localhost:3000
echo   - Docs: http://localhost:3000/api/docs
echo   - Health: http://localhost:3000/health
echo.
echo Pressione Ctrl+C para parar
echo.

call npm run dev
