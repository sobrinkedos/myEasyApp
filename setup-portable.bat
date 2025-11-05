@echo off
echo ========================================
echo   Setup PostgreSQL e Redis Portáteis
echo ========================================
echo.

REM Criar diretórios
if not exist "portable-db" mkdir portable-db
cd portable-db

echo 📦 Baixando PostgreSQL Portátil...
echo.
echo Por favor, baixe manualmente:
echo 1. PostgreSQL: https://www.enterprisedb.com/download-postgresql-binaries
echo    - Baixe a versão ZIP (Windows x86-64)
echo    - Extraia para: %cd%\postgresql
echo.
echo 2. Redis: https://github.com/tporadowski/redis/releases
echo    - Baixe: Redis-x64-5.0.14.1.zip
echo    - Extraia para: %cd%\redis
echo.
pause

echo.
echo ========================================
echo   Configurando PostgreSQL
echo ========================================
echo.

if not exist "postgresql\bin\initdb.exe" (
    echo ❌ PostgreSQL não encontrado em: %cd%\postgresql
    echo Por favor, extraia o PostgreSQL para esta pasta.
    pause
    exit /b 1
)

cd postgresql

REM Inicializar banco de dados
if not exist "data" (
    echo Inicializando banco de dados...
    bin\initdb.exe -D data -U postgres -W -E UTF8 -A scram-sha-256
)

echo.
echo Iniciando PostgreSQL...
bin\pg_ctl.exe -D data -l logfile start

REM Aguardar PostgreSQL iniciar
timeout /t 3 /nobreak > nul

echo.
echo Criando banco de dados...
bin\psql.exe -U postgres -c "CREATE DATABASE restaurant_dev;"
bin\psql.exe -U postgres -c "CREATE USER restaurant_user WITH PASSWORD 'dev_password';"
bin\psql.exe -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dev TO restaurant_user;"

cd ..

echo.
echo ========================================
echo   Configurando Redis
echo ========================================
echo.

if not exist "redis\redis-server.exe" (
    echo ❌ Redis não encontrado em: %cd%\redis
    echo Por favor, extraia o Redis para esta pasta.
    pause
    exit /b 1
)

echo Iniciando Redis...
start "Redis Server" redis\redis-server.exe

echo.
echo ========================================
echo   ✅ Setup Concluído!
echo ========================================
echo.
echo PostgreSQL rodando em: localhost:5432
echo Redis rodando em: localhost:6379
echo.
echo Banco criado: restaurant_dev
echo Usuário: restaurant_user
echo Senha: dev_password
echo.
echo Próximos passos:
echo 1. Volte para a pasta do projeto
echo 2. Execute: npm install
echo 3. Execute: npm run prisma:generate
echo 4. Execute: npm run prisma:migrate
echo 5. Execute: npm run prisma:seed
echo 6. Execute: npm run dev
echo.
pause
