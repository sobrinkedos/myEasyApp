# 🚀 Dependências do Sistema - O que precisa estar rodando?

## ✅ Resposta Rápida

Para fazer **login** ou **registro**, você precisa apenas:

1. ✅ **Backend rodando** (`npm run dev`)
2. ✅ **Frontend rodando** (`cd web-app && npm run dev`)

**NÃO precisa instalar ou iniciar:**
- ❌ PostgreSQL local
- ❌ Redis local
- ❌ Docker

---

## 🌐 Serviços na Nuvem (Já Configurados)

### 1. Neon PostgreSQL ☁️
**Status:** ✅ Configurado e funcionando

```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**O que é:**
- PostgreSQL hospedado na nuvem
- Sem necessidade de instalação local
- Sempre disponível

**Acesso:**
- Via Prisma ORM no código
- Dashboard: https://console.neon.tech

---

### 2. Upstash Redis ☁️
**Status:** ✅ Configurado e funcionando

```env
REDIS_URL=rediss://default:AWwN...@communal-imp-27661.upstash.io:6379
```

**O que é:**
- Redis hospedado na nuvem
- Usado para cache e sessões
- Sem necessidade de instalação local

**Acesso:**
- Via ioredis no código
- Dashboard: https://console.upstash.com

---

## 🔧 O que você PRECISA fazer

### 1. Instalar Dependências (Uma vez)

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd web-app
npm install
```

---

### 2. Executar Migrations (Uma vez ou quando houver mudanças)

```bash
npm run prisma:migrate
```

Isso cria as tabelas no banco Neon.

---

### 3. Iniciar os Servidores

#### Terminal 1 - Backend
```bash
npm run dev
```

**Deve mostrar:**
```
🚀 Server running on port 3000
✅ Database connected
✅ Redis connected
```

#### Terminal 2 - Frontend
```bash
cd web-app
npm run dev
```

**Deve mostrar:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Testando as Conexões

### Testar Backend
```bash
# Health check
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Testar Frontend
```
Abrir navegador: http://localhost:5173/auth/login
```

---

## ❌ O que NÃO precisa fazer

### Não precisa instalar PostgreSQL local
```bash
# ❌ NÃO PRECISA
brew install postgresql
apt-get install postgresql
choco install postgresql
```

**Por quê?** Você está usando Neon (PostgreSQL na nuvem)

---

### Não precisa instalar Redis local
```bash
# ❌ NÃO PRECISA
brew install redis
apt-get install redis
choco install redis
```

**Por quê?** Você está usando Upstash (Redis na nuvem)

---

### Não precisa Docker
```bash
# ❌ NÃO PRECISA
docker-compose up
```

**Por quê?** Todos os serviços estão na nuvem

---

## 🔍 Verificando se está tudo OK

### Checklist Antes de Testar

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `DATABASE_URL` está configurado (Neon)
- [ ] `REDIS_URL` está configurado (Upstash)
- [ ] Dependências instaladas (`npm install`)
- [ ] Migrations executadas (`npm run prisma:migrate`)
- [ ] Backend rodando (`npm run dev`)
- [ ] Frontend rodando (`cd web-app && npm run dev`)

---

## 🐛 Problemas Comuns

### 1. Erro: "Database connection failed"

**Causa:** Neon pode estar inativo (free tier hiberna após inatividade)

**Solução:**
```bash
# Fazer uma query para "acordar" o banco
npm run prisma:studio
```

Ou acessar o dashboard do Neon e clicar no banco.

---

### 2. Erro: "Redis connection failed"

**Causa:** URL do Redis incorreta ou token expirado

**Solução:**
1. Verificar `.env` tem `REDIS_URL` correto
2. Verificar se começa com `rediss://` (com dois 's')
3. Acessar dashboard Upstash e verificar credenciais

---

### 3. Erro: "Port 3000 already in use"

**Causa:** Outro processo usando a porta

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Ou mudar a porta no `.env`:
```env
PORT=3001
```

---

### 4. Frontend não conecta no Backend

**Causa:** URL da API incorreta

**Solução:**
Verificar `web-app/.env.development`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📊 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    SEU COMPUTADOR                       │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Frontend   │         │   Backend    │            │
│  │  (Vite/React)│         │  (Node.js)   │            │
│  │  Port: 5173  │────────▶│  Port: 3000  │            │
│  └──────────────┘         └──────┬───────┘            │
│                                   │                     │
└───────────────────────────────────┼─────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │   Neon PostgreSQL   │       │   Upstash Redis     │
        │   (Nuvem - AWS)     │       │   (Nuvem)           │
        │   ✅ Sempre ativo   │       │   ✅ Sempre ativo   │
        └─────────────────────┘       └─────────────────────┘
```

---

## 🎯 Comandos Essenciais

### Desenvolvimento Diário

```bash
# 1. Iniciar Backend (Terminal 1)
npm run dev

# 2. Iniciar Frontend (Terminal 2)
cd web-app
npm run dev

# 3. Acessar aplicação
# http://localhost:5173/auth/login
```

### Quando houver mudanças no Schema

```bash
# Executar migrations
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate
```

### Visualizar Banco de Dados

```bash
# Abrir Prisma Studio
npm run prisma:studio

# Acessa: http://localhost:5555
```

---

## 💡 Dicas

### 1. Manter Terminais Abertos
- Terminal 1: Backend (`npm run dev`)
- Terminal 2: Frontend (`cd web-app && npm run dev`)
- Terminal 3: Comandos avulsos

### 2. Hot Reload
- Backend: Reinicia automaticamente ao salvar arquivos
- Frontend: Atualiza automaticamente no navegador

### 3. Logs
- Backend: Mostra no terminal
- Frontend: DevTools do navegador (F12)

### 4. Prisma Studio
- Útil para visualizar/editar dados
- Não precisa estar sempre aberto
- Abrir quando precisar ver o banco

---

## ✅ Resumo Final

### Para Login/Registro você precisa:

1. ✅ **Backend rodando** → `npm run dev`
2. ✅ **Frontend rodando** → `cd web-app && npm run dev`

### Você NÃO precisa:

- ❌ PostgreSQL local (usando Neon ☁️)
- ❌ Redis local (usando Upstash ☁️)
- ❌ Docker
- ❌ Nenhum outro serviço

### Tudo pronto! 🚀

Basta iniciar os dois servidores e começar a usar!

---

**Última atualização:** 2024
**Status:** ✅ Configuração validada e funcionando
