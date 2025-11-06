@echo off
echo ========================================
echo   Sistema de Gestao de Restaurante
echo ========================================
echo.

echo [1/3] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias do backend...
    call npm install
)

if not exist "web-app\node_modules\" (
    echo Instalando dependencias do frontend...
    cd web-app
    call npm install
    cd ..
)

echo.
echo [2/3] Verificando banco de dados...
echo Executando migrations...
call npm run prisma:generate
call npm run prisma:migrate dev

echo.
echo [3/3] Iniciando servidores...
echo.
echo ========================================
echo   IMPORTANTE: Mantenha esta janela aberta!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Pressione Ctrl+C para parar os servidores
echo ========================================
echo.

start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd web-app && npm run dev"

echo.
echo Servidores iniciados!
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173/auth/login
echo.
echo Aguarde alguns segundos e acesse o frontend no navegador.
echo.
pause
