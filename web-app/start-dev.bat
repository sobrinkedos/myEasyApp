@echo off
echo Iniciando servidor de desenvolvimento...
echo.
echo Frontend estara disponivel em: http://localhost:5173
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

cd /d "%~dp0"
call npm run dev

pause
