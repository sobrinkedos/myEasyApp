@echo off
echo ========================================
echo   Restaurant API - Iniciar Sistema
echo ========================================
echo.
echo IMPORTANTE: Este script vai executar todos
echo os comandos necessarios automaticamente.
echo.
echo Tempo estimado: 5 minutos
echo.
pause

echo.
echo ========================================
echo   1/5 Instalando Dependencias...
echo ========================================
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar dependencias
    echo.
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas!
echo.

echo ========================================
echo   2/5 Gerando Cliente Prisma...
echo ========================================
echo.
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao gerar cliente Prisma
    echo.
    pause
    exit /b 1
)
echo ✅ Cliente Prisma gerado!
echo.

echo ========================================
echo   3/5 Criando Tabelas no Banco...
echo ========================================
echo.
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao criar tabelas
    echo Verifique se o DATABASE_URL esta correto
    echo.
    pause
    exit /b 1
)
echo ✅ Tabelas criadas!
echo.

echo ========================================
echo   4/5 Populando Banco com Dados...
echo ========================================
echo.
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao popular banco
    echo.
    pause
    exit /b 1
)
echo ✅ Banco populado!
echo.

echo ========================================
echo   ✅ SETUP CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Credenciais de teste:
echo   Email: admin@restaurant.com
echo   Senha: admin123
echo.
echo ========================================
echo   5/5 Iniciando API...
echo ========================================
echo.
echo A API estara disponivel em:
echo   - http://localhost:3000
echo   - Docs: http://localhost:3000/api/docs
echo   - Health: http://localhost:3000/health
echo.
echo Para testar, abra um NOVO CMD e execute:
echo   node test-api.js
echo.
echo Pressione Ctrl+C para parar a API
echo.
echo ========================================
echo.

call npm run dev
