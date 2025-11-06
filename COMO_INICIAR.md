# 🚀 Como Iniciar o Sistema

## Problema com PowerShell

Se você está tendo erro de "não pode ser carregado" ou "não está assinado digitalmente", siga os passos abaixo:

## ✅ Solução Rápida

### Opção 1: Usar o Script Batch (Recomendado)

Execute o arquivo:
```
START_SERVERS.bat
```

Este script vai:
1. Iniciar o backend na porta 3000
2. Iniciar o frontend na porta 5173
3. Abrir duas janelas CMD separadas

### Opção 2: Iniciar Manualmente

**Terminal 1 - Backend:**
```cmd
node node_modules\ts-node-dev\lib\bin.js --respawn --transpile-only src/server.ts
```

**Terminal 2 - Frontend:**
```cmd
cd web-app
node node_modules\vite\bin\vite.js
```

### Opção 3: Habilitar Scripts PowerShell (Avançado)

Execute como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois pode usar:
```
npm run dev
```

## 📝 Após Iniciar

1. **Backend**: http://localhost:3000
2. **Frontend**: http://localhost:5173
3. **Login**: Use as credenciais do seu estabelecimento

## 🔧 Aplicar Migrations

Se precisar aplicar migrations:
```
apply-migration.bat
```

## ❌ Parar os Servidores

Feche as janelas CMD que foram abertas ou pressione `Ctrl+C` em cada terminal.

## 📦 Instalar Dependências

Se for a primeira vez:

**Backend:**
```cmd
npm install
```

**Frontend:**
```cmd
cd web-app
npm install
```

## 🐛 Problemas Comuns

### Porta já em uso
- Feche outros processos usando as portas 3000 ou 5173
- Ou altere as portas nos arquivos de configuração

### Erro de conexão com banco
- Verifique o arquivo `.env`
- Confirme que a `DATABASE_URL` está correta

### Erro "Cannot find module"
- Execute `npm install` no backend
- Execute `npm install` no frontend (dentro da pasta web-app)
