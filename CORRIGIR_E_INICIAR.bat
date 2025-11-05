@echo off
echo ========================================
echo   Corrigindo e Iniciando API
echo ========================================
echo.
echo Foi adicionado o tsconfig-paths para
echo resolver os path aliases (@/).
echo.
echo Reinstalando dependencias...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas!
echo.
echo ========================================
echo   Iniciando API...
echo ========================================
echo.
echo A API estara disponivel em:
echo   - http://localhost:3000
echo   - Docs: http://localhost:3000/api/docs
echo   - Health: http://localhost:3000/health
echo.
echo Pressione Ctrl+C para parar
echo.

call npm run dev
