# ⚡ Início Rápido SEM Docker (10 minutos)

## 🎯 O Caminho Mais Fácil

Vamos usar serviços online gratuitos. É MUITO mais simples do que parece!

---

## Passo 1: PostgreSQL (3 minutos)

### 1. Abra este link: https://neon.tech

### 2. Clique em "Sign Up" (canto superior direito)
- **Opção 1:** Use sua conta Google (mais rápido)
- **Opção 2:** Use sua conta GitHub
- **Opção 3:** Crie com email

### 3. Após login, você verá o Dashboard

### 4. Criar Projeto
- Clique em "**Create a project**" ou "**New Project**"
- **Nome do projeto:** `restaurant-api` (ou deixe o nome sugerido)
- **Região:** Escolha a mais próxima (ex: `US East (Ohio)` ou `AWS / US East`)
- **PostgreSQL Version:** Deixe a versão padrão (16)
- Clique em "**Create Project**"

### 5. Copiar Connection String
Após criar o projeto, você verá a página de detalhes:

1. Procure por "**Connection string**" ou "**Connection Details**"
2. Você verá algo como:
   ```
   postgresql://neondb_owner:npg_xxxxx@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Clique no ícone de **copiar** (📋) ao lado da string
4. **IMPORTANTE:** A string completa deve ter `?sslmode=require` no final

**COPIE TUDO!** Vamos usar no Passo 3.

💡 **Dica:** Mantenha esta aba aberta para consultar depois!

✅ **PostgreSQL pronto!**

---

## Passo 2: Redis (3 minutos)

### 1. Abra este link: https://upstash.com

### 2. Clique em "Sign Up" (canto superior direito)
- **Opção 1:** Use sua conta Google (mais rápido)
- **Opção 2:** Use sua conta GitHub
- **Opção 3:** Crie com email

### 3. Após login, você verá o Dashboard

### 4. Criar Database Redis
- Clique em "**Create database**" ou botão verde "**Redis**"
- **Name:** `restaurant-redis` (ou qualquer nome)
- **Type:** Selecione "**Regional**" (plano gratuito)
- **Region:** Escolha a mais próxima (ex: `us-east-1` ou `AWS US East`)
- **Eviction:** Deixe "**No eviction**" (padrão)
- Clique em "**Create**"

### 5. Copiar Connection String
Após criar o database, você será redirecionado para a página de detalhes:

1. Na seção "**REST API**", procure por:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. **OU** na seção "**Connect**", procure por "**Redis URL**":
   ```
   rediss://default:AbCdEf123456@us1-xxxxx.upstash.io:6379
   ```

3. Clique no ícone de **copiar** (📋) ao lado da URL
4. **IMPORTANTE:** A URL deve começar com `rediss://` (com dois 's' para TLS)

**COPIE A URL COMPLETA!** Vamos usar no Passo 3.

💡 **Dica:** Mantenha esta aba aberta para consultar depois!

✅ **Redis pronto!**

---

## Passo 3: Configurar Projeto (2 minutos)

### 1. Abra o arquivo `.env.development` no seu editor

### 2. Cole as URLs que você copiou:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Cole aqui a URL do Neon)
DATABASE_URL=postgresql://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require

# Redis (Cole aqui a URL do Upstash)
REDIS_URL=rediss://default:xxxxx@us1-xxxxx.upstash.io:6379

# JWT
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=24h

# Bcrypt
BCRYPT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
```

### 3. Salve o arquivo

✅ **Configuração pronta!**

---

## Passo 4: Instalar e Configurar (2 minutos)

Abra o terminal na pasta do projeto e execute:

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma
npm run prisma:generate

# 3. Criar tabelas no banco
npm run prisma:migrate

# 4. Popular com dados de teste
npm run prisma:seed
```

Aguarde cada comando terminar antes de executar o próximo.

✅ **Banco configurado!**

---

## Passo 5: Iniciar API (1 minuto)

```bash
npm run dev
```

Você deve ver:
```
✅ Redis connected
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🏥 Health check: http://localhost:3000/health
```

✅ **API rodando!**

---

## Passo 6: Testar (1 minuto)

### Opção A: Teste Automático (Recomendado)

Abra um **NOVO TERMINAL** (deixe o anterior rodando) e execute:

```bash
node test-api.js
```

Você verá todos os testes passando! 🎉

### Opção B: Teste no Navegador

Abra no navegador:
```
http://localhost:3000/api/docs
```

1. Clique em `POST /api/v1/auth/login`
2. Clique em "Try it out"
3. Use:
   ```json
   {
     "email": "admin@restaurant.com",
     "password": "admin123"
   }
   ```
4. Clique em "Execute"
5. Copie o token
6. Clique em "Authorize" (cadeado no topo)
7. Cole o token
8. Agora teste qualquer endpoint!

### Opção C: Health Check Rápido

Abra no navegador:
```
http://localhost:3000/health
```

Deve mostrar:
```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

## 🎉 PRONTO!

Você agora tem:
- ✅ PostgreSQL na nuvem (Neon)
- ✅ Redis na nuvem (Upstash)
- ✅ API rodando no seu PC
- ✅ Banco populado com dados de teste
- ✅ Tudo funcionando!

**Tempo total: ~10 minutos**

---

## 🎯 Próximos Passos

### 1. Explore a API
- Abra: http://localhost:3000/api/docs
- Teste criar produtos, categorias, etc.

### 2. Veja os Dados
```bash
npm run prisma:studio
```
Abre em: http://localhost:5555

### 3. Teste Mais
- Crie produtos
- Registre movimentações de estoque
- Gere relatórios

---

## 🛑 Para Parar

No terminal onde a API está rodando:
- Pressione `Ctrl + C`

Para iniciar novamente:
```bash
npm run dev
```

---

## ❓ Problemas?

### "Cannot reach database server"
- Verifique se copiou a URL completa do Neon
- Deve ter `?sslmode=require` no final
- Teste no dashboard do Neon

### "Redis connection failed"
- Verifique se copiou a URL completa do Upstash
- Deve começar com `rediss://` (dois 's')
- Teste no dashboard do Upstash

### "Port 3000 already in use"
No `.env.development`, mude:
```env
PORT=3001
```

### Limpar e recomeçar
```bash
npm run prisma:migrate reset
npm run prisma:seed
```

---

## 💡 Dicas

1. **Mantenha as abas abertas** - Neon e Upstash dashboards
2. **Use o Swagger** - É a forma mais fácil de testar
3. **Prisma Studio** - Para ver os dados visualmente
4. **Logs** - Fique de olho no terminal da API

---

## 📊 Credenciais de Teste

Usuário criado pelo seed:
- **Email:** admin@restaurant.com
- **Senha:** admin123

Use para fazer login na API!

---

## 🎓 Entendendo o que Fizemos

1. **Neon** - Hospeda seu PostgreSQL na nuvem
2. **Upstash** - Hospeda seu Redis na nuvem
3. **API** - Roda no seu PC, conecta nos serviços
4. **Prisma** - Gerencia o banco de dados
5. **Express** - Servidor web da API

---

## 🚀 Tudo Funcionando?

Agora você pode:
- ✅ Desenvolver novas features
- ✅ Testar a API completa
- ✅ Partir para a Prioridade 2 (Sistema de Comandas)
- ✅ Criar os apps frontend

---

**Parabéns! Você configurou tudo sem Docker!** 🎉

**Dúvidas? Consulte:**
- SETUP_ONLINE.md (detalhes)
- COMANDOS_UTEIS.md (referência)
- QUICKSTART.md (guia completo)
