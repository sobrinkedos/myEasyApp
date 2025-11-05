# 🎨 Guia Visual - Setup em 3 Passos

## 🎯 Objetivo: Rodar a API em 10 minutos

---

## 📍 PASSO 1: Configurar Banco de Dados (3 min)

### PostgreSQL na Nuvem (Neon)

```
🌐 https://neon.tech
    ↓
📝 Sign Up (Google/GitHub/Email)
    ↓
➕ Create a project
    ↓
📋 Copiar Connection String
    ↓
✅ Pronto!
```

**Você vai copiar algo assim:**
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 📍 PASSO 2: Configurar Cache (3 min)

### Redis na Nuvem (Upstash)

```
🌐 https://upstash.com
    ↓
📝 Sign Up (Google/GitHub/Email)
    ↓
➕ Create Database
    ↓
📋 Copiar Redis URL
    ↓
✅ Pronto!
```

**Você vai copiar algo assim:**
```
rediss://default:xxx@us1-xxx.upstash.io:6379
```

---

## 📍 PASSO 3: Configurar e Rodar (4 min)

### 3.1 Editar .env.development

```
📝 Abrir arquivo: .env.development
    ↓
📋 Colar DATABASE_URL (do Passo 1)
    ↓
📋 Colar REDIS_URL (do Passo 2)
    ↓
💾 Salvar arquivo
    ↓
✅ Pronto!
```

### 3.2 Instalar e Configurar

```bash
# Terminal - Execute em sequência:

npm install                    # ⏱️ 1-2 min
    ↓
npm run prisma:generate       # ⏱️ 10 seg
    ↓
npm run prisma:migrate        # ⏱️ 20 seg
    ↓
npm run prisma:seed           # ⏱️ 5 seg
    ↓
npm run dev                   # 🚀 API rodando!
```

---

## 🎉 SUCESSO!

Você deve ver:

```
✅ Redis connected
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🏥 Health check: http://localhost:3000/health
```

---

## 🧪 Testar Tudo

### Opção A: Teste Automático (Recomendado)

```bash
# Abra NOVO terminal
node test-api.js
```

**Resultado esperado:**
```
🧪 Iniciando testes da API...

1️⃣  Testando Health Check...
   ✅ Health check OK

2️⃣  Testando Login...
   ✅ Login OK

3️⃣  Testando Listar Categorias...
   ✅ Categorias OK

... (mais testes)

🎉 Todos os testes concluídos!
```

### Opção B: Teste Visual (Swagger)

```
🌐 Abrir navegador
    ↓
🔗 http://localhost:3000/api/docs
    ↓
🔓 POST /api/v1/auth/login
    ↓
📝 Email: admin@restaurant.com
📝 Senha: admin123
    ↓
🔑 Copiar token
    ↓
🔒 Authorize (botão no topo)
    ↓
🎮 Testar qualquer endpoint!
```

---

## 📊 Fluxograma Completo

```
┌─────────────────────────────────────────┐
│  🎯 INÍCIO                               │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │  Tem Docker?              │
    └─────┬──────────────┬──────┘
          │              │
       ✅ SIM         ❌ NÃO
          │              │
          │              │
    ┌─────▼──────┐  ┌───▼────────────────┐
    │ Docker     │  │ Serviços Online    │
    │ Compose    │  │ (Neon + Upstash)   │
    └─────┬──────┘  └───┬────────────────┘
          │              │
          └──────┬───────┘
                 │
    ┌────────────▼────────────┐
    │  npm install            │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  prisma:generate        │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  prisma:migrate         │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  prisma:seed            │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  npm run dev            │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  🎉 API RODANDO!        │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  Testar com:            │
    │  - test-api.js          │
    │  - Swagger UI           │
    │  - Prisma Studio        │
    └─────────────────────────┘
```

---

## 🎨 Mapa de Arquivos

```
📁 Projeto
│
├── 📘 LEIA_ME_PRIMEIRO.md ⭐ COMECE AQUI
│
├── 📗 INICIO_RAPIDO_SEM_DOCKER.md ⭐⭐⭐ RECOMENDADO
│
├── 📙 GUIA_VISUAL.md (você está aqui!)
│
├── 📕 SETUP_ONLINE.md (detalhes Neon + Upstash)
│
├── 📔 START_HERE.md (com Docker)
│
├── 🧪 test-api.js (teste automático)
│
├── 🔍 verificar-setup.js (verificar configuração)
│
└── 📂 src/ (código da API)
```

---

## 🎯 Checklist Visual

### Antes de Começar
- [ ] 💻 Node.js 20+ instalado
- [ ] 📝 Editor de código aberto
- [ ] 🌐 Navegador aberto
- [ ] ☕ Café preparado (opcional)

### Passo 1: Banco de Dados
- [ ] 🌐 Conta criada no Neon
- [ ] 📋 Connection string copiada
- [ ] ✅ Testado no dashboard

### Passo 2: Cache
- [ ] 🌐 Conta criada no Upstash
- [ ] 📋 Redis URL copiada
- [ ] ✅ Testado no dashboard

### Passo 3: Configuração
- [ ] 📝 .env.development editado
- [ ] 📋 URLs coladas
- [ ] 💾 Arquivo salvo

### Passo 4: Instalação
- [ ] ⬇️ npm install executado
- [ ] 🔧 prisma:generate executado
- [ ] 🗄️ prisma:migrate executado
- [ ] 🌱 prisma:seed executado

### Passo 5: Execução
- [ ] 🚀 npm run dev executado
- [ ] ✅ Mensagem de sucesso apareceu
- [ ] 🌐 API respondendo

### Passo 6: Testes
- [ ] 🧪 test-api.js executado
- [ ] ✅ Todos os testes passaram
- [ ] 🌐 Swagger acessado
- [ ] 🔐 Login testado

---

## 🎓 Entendendo o Fluxo

```
┌──────────────┐
│   VOCÊ       │ ← Desenvolve localmente
└──────┬───────┘
       │
       │ HTTP Requests
       │
┌──────▼───────┐
│   API        │ ← Roda no seu PC (localhost:3000)
│  (Express)   │
└──────┬───────┘
       │
       ├─────────────┐
       │             │
┌──────▼───────┐ ┌──▼──────────┐
│ PostgreSQL   │ │   Redis     │ ← Rodam na nuvem
│   (Neon)     │ │  (Upstash)  │    (ou local)
└──────────────┘ └─────────────┘
```

---

## 💡 Dicas Visuais

### ✅ Sinais de Sucesso

```
Terminal mostrando:
✅ Redis connected
🚀 Server running on port 3000

Navegador mostrando:
✅ Health check: {"status":"ok"}
✅ Swagger UI carregado
✅ Login retornou token
```

### ❌ Sinais de Problema

```
Terminal mostrando:
❌ Cannot connect to database
❌ Redis connection failed
❌ Port 3000 already in use

Solução:
📖 Veja seção Troubleshooting
🔍 Execute: node verificar-setup.js
```

---

## 🎯 Próximos Passos

```
1. ✅ API rodando
   ↓
2. 🎮 Testar endpoints no Swagger
   ↓
3. 📊 Ver dados no Prisma Studio
   ↓
4. 🚀 Desenvolver novas features
   ↓
5. 🎉 Partir para Prioridade 2!
```

---

## 🆘 Ajuda Rápida

| Problema | Solução |
|----------|---------|
| 🔴 Erro de conexão DB | Verifique DATABASE_URL |
| 🔴 Erro de conexão Redis | Verifique REDIS_URL |
| 🔴 Porta em uso | Mude PORT no .env |
| 🔴 Comando não encontrado | Execute npm install |
| 🔴 Tabela não existe | Execute prisma:migrate |

---

## 📞 Onde Buscar Mais Ajuda

```
📘 LEIA_ME_PRIMEIRO.md
    ↓ Índice completo
    
📗 INICIO_RAPIDO_SEM_DOCKER.md
    ↓ Passo a passo detalhado
    
📕 SETUP_ONLINE.md
    ↓ Detalhes dos serviços
    
📔 COMANDOS_UTEIS.md
    ↓ Referência de comandos
```

---

**Siga este guia visual e em 10 minutos você terá tudo rodando!** 🚀

**Dúvidas? Todos os detalhes estão nos outros guias!** 📚
