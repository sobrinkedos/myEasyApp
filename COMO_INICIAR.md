# 🚀 Como Iniciar o Sistema

## Opção 1: Script Automático (Recomendado) ⚡

### Windows
```bash
# Clique duas vezes no arquivo:
INICIAR_SISTEMA.bat
```

Isso vai:
1. ✅ Instalar dependências (se necessário)
2. ✅ Executar migrations
3. ✅ Iniciar Backend (porta 3000)
4. ✅ Iniciar Frontend (porta 5173)

---

## Opção 2: Manual (2 Terminais) 🔧

### Terminal 1 - Backend
```bash
npm run dev
```

**Aguarde ver:**
```
🚀 Server running on port 3000
✅ Database connected
✅ Redis connected
```

### Terminal 2 - Frontend
```bash
cd web-app
npm run dev
```

**Aguarde ver:**
```
➜  Local:   http://localhost:5173/
```

---

## 🌐 Acessar o Sistema

### Abrir no Navegador
```
http://localhost:5173/auth/login
```

### Criar Primeira Conta
1. Clicar em "Criar conta"
2. Preencher dados pessoais
3. Preencher dados do estabelecimento
4. Clicar em "Criar Conta"
5. Será redirecionado para o dashboard

---

## ❓ Perguntas Frequentes

### Preciso instalar PostgreSQL?
**Não!** ❌ Você está usando Neon (PostgreSQL na nuvem)

### Preciso instalar Redis?
**Não!** ❌ Você está usando Upstash (Redis na nuvem)

### Preciso Docker?
**Não!** ❌ Tudo está na nuvem

### O que preciso ter instalado?
Apenas:
- ✅ Node.js 20+
- ✅ npm

### Primeira vez usando?
Execute uma vez:
```bash
npm install
cd web-app
npm install
cd ..
npm run prisma:migrate
```

---

## 🐛 Problemas?

### Backend não inicia
```bash
# Verificar se a porta 3000 está livre
netstat -ano | findstr :3000

# Se estiver ocupada, matar o processo
taskkill /PID <PID> /F
```

### Frontend não conecta
Verificar `web-app/.env.development`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Erro de banco de dados
```bash
# Executar migrations novamente
npm run prisma:migrate
```

---

## ✅ Checklist Rápido

Antes de começar:
- [ ] Node.js instalado (`node --version`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` existe na raiz
- [ ] Backend rodando (porta 3000)
- [ ] Frontend rodando (porta 5173)

---

## 🎯 Pronto!

Agora é só usar o sistema! 🎉

**Login:** http://localhost:5173/auth/login
**Registro:** http://localhost:5173/auth/register
