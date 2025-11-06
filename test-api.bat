@echo off
echo Testando API - Detalhes do Item
echo.

REM Substitua o ID e TOKEN pelos valores corretos
set ITEM_ID=ba5f7313-5c36-4070-8557-b40d490b9bb3
set TOKEN=seu_token_aqui

curl -X GET "http://localhost:3000/api/v1/stock-management/items/%ITEM_ID%" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.
pause
