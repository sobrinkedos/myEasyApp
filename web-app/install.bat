@echo off
echo Instalando dependencias do frontend...
echo.

cd /d "%~dp0"
call npm install

echo.
echo Instalacao concluida!
echo.
echo Para iniciar o servidor de desenvolvimento:
echo npm run dev
echo.
pause
