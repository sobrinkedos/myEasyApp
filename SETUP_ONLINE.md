# ☁️ Setup com Serviços Online (MAIS FÁCIL!)

## 🎯 Recomendado para quem não pode instalar Docker

Esta é a forma **MAIS RÁPIDA** de começar a testar o sistema!

---

## Passo 1: PostgreSQL Online (Neon) - 2 minutos

### 1.1 Criar Conta
1. Acesse: https://neon.tech
2. Clique em "**Sign Up**" (canto superior direito)
3. Escolha uma opção:
   - **Google** (mais rápido - recomendado)
   - **GitHub**
   - **Email** (preencha formulário)

### 1.2 Criar Projeto
Após fazer login, você verá o Dashboard do Neon:

1. Clique em "**Create a project**" ou "**New Project**"
2. Preencha os dados:
   - **Project name:** `restaurant-api` (ou deixe o nome sugerido)
   - **Region:** Escolha a mais próxima de você:
     - `AWS / US East (Ohio)` - América do Norte
     - `AWS / Europe (Frankfurt)` - Europa
     - `AWS / Asia Pacific (Singapore)` - Ásia
   - **PostgreSQL Version:** Deixe a versão padrão (16)
   - **Compute size:** Deixe o padrão (0.25 vCPU, 1 GB RAM)
3. Clique em "**Create Project**"

⏱️ O projeto será criado em alguns segundos.

### 1.3 Copiar Connection String
Após a criação, você será redirecionado para a página do projeto:

1. Procure pela seção "**Connection string**" ou "**Connection Details**"
2. Você verá várias opções de connection string:
   - **Pooled connection** (recomendado para produção)
   - **Direct connection** (use esta para desenvolvimento)
3. A string terá este formato:
   ```
   postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Clique no ícone de **copiar** (📋) ao lado da string
5. **IMPORTANTE:** Certifique-se de que tem `?sslmode=require` no final

💡 **Componentes da Connection String:**
- `neondb_owner` - Usuário do banco
- `npg_AbCdEf123456` - Senha (gerada automaticamente)
- `ep-cool-name-123456.us-east-2.aws.neon.tech` - Endpoint
- `neondb` - Nome do banco de dados
- `?sslmode=require` - Requer conexão SSL (obrigatório)

### 1.4 Configurar no Projeto
Edite o arquivo `.env.development` e cole:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

✅ **PostgreSQL configurado!**

---

## Passo 2: Redis Online (Upstash) - 2 minutos

### 2.1 Criar Conta
1. Acesse: https://upstash.com
2. Clique em "**Sign Up**" (canto superior direito)
3. Escolha uma opção:
   - **Google** (mais rápido - recomendado)
   - **GitHub**
   - **Email** (preencha formulário)

### 2.2 Criar Database Redis
Após fazer login, você verá o Dashboard do Upstash:

1. Clique em "**Create database**" ou no botão verde "**Redis**"
2. Preencha os dados:
   - **Name:** `restaurant-redis` (ou qualquer nome descritivo)
   - **Type:** Selecione "**Regional**" (plano gratuito)
     - Regional: Dados em uma região (grátis)
     - Global: Dados replicados globalmente (pago)
   - **Region:** Escolha a mais próxima:
     - `us-east-1` (AWS US East - Virginia)
     - `eu-west-1` (AWS Europe - Ireland)
     - `ap-southeast-1` (AWS Asia Pacific - Singapore)
   - **TLS (SSL) Enabled:** Deixe marcado (recomendado)
   - **Eviction:** Selecione "**No eviction**" (padrão)
     - No eviction: Não remove dados automaticamente
     - Eviction: Remove dados antigos quando memória cheia
3. Clique em "**Create**"

⏱️ O database será criado instantaneamente.

### 2.3 Copiar Connection String
Após a criação, você será redirecionado para a página de detalhes:

**Opção 1: REST API (Recomendado para Node.js)**
1. Na seção "**REST API**", você verá:
   - `UPSTASH_REDIS_REST_URL`: `https://us1-xxxxx.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN`: `AbCdEf123456...`
2. Copie ambos (vamos usar no .env.development)

**Opção 2: Redis URL (Tradicional)**
1. Na seção "**Connect**" ou "**Details**", procure por "**Redis URL**"
2. A URL terá este formato:
   ```
   rediss://default:AbCdEf123456@us1-xxxxx.upstash.io:6379
   ```
3. Clique no ícone de **copiar** (📋)
4. **IMPORTANTE:** A URL deve começar com `rediss://` (com dois 's' para TLS)

💡 **Componentes da Redis URL:**
- `rediss://` - Protocolo com TLS/SSL
- `default` - Usuário padrão
- `AbCdEf123456` - Senha (token de autenticação)
- `us1-xxxxx.upstash.io` - Endpoint
- `6379` - Porta padrão do Redis

💡 **Qual usar?**
- Para este projeto: Use a **Redis URL** completa
- Para projetos serverless: Use REST API (URL + Token)

### 2.4 Configurar no Projeto
Edite o arquivo `.env.development` e adicione:

```env
REDIS_URL=rediss://default:AbCdEf123456@us1-xxxxx.upstash.io:6379
```

✅ **Redis configurado!**

---

## Passo 3: Configurar Projeto - 3 minutos

### 3.1 Arquivo .env.development Completo

Seu arquivo `.env.development` deve ficar assim:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Redis (Upstash)
REDIS_URL=rediss://default:xxx@us1-xxx.upstash.io:6379

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

### 3.2 Instalar Dependências

```bash
npm install
```

### 3.3 Gerar Cliente Prisma

```bash
npm run prisma:generate
```

### 3.4 Criar Tabelas no Banco

```bash
npm run prisma:migrate
```

### 3.5 Popular com Dados Iniciais

```bash
npm run prisma:seed
```

---

## Passo 4: Iniciar API - 1 minuto

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

## Passo 5: Testar - 1 minuto

### Opção 1: Teste Automático
Abra um **NOVO TERMINAL** e execute:

```bash
node test-api.js
```

### Opção 2: Teste no Navegador
Abra: http://localhost:3000/api/docs

### Opção 3: Health Check
Abra: http://localhost:3000/health

---

## 🎉 Pronto!

**Total de tempo: ~10 minutos**

Você agora tem:
- ✅ PostgreSQL na nuvem (Neon)
- ✅ Redis na nuvem (Upstash)
- ✅ API rodando localmente
- ✅ Dados de teste no banco

---

## 💡 Vantagens desta Abordagem

1. **Sem instalação** - Não precisa instalar nada além do Node.js
2. **Sem permissões** - Não precisa de admin
3. **Rápido** - Setup em 10 minutos
4. **Gratuito** - Ambos os serviços têm plano free
5. **Confiável** - Serviços profissionais
6. **Acessível** - Pode acessar de qualquer lugar

---

## 📊 Limites do Plano Gratuito

### Neon (PostgreSQL)
- ✅ 3 projetos
- ✅ 10 branches por projeto
- ✅ 3 GB de armazenamento
- ✅ Suficiente para desenvolvimento

### Upstash (Redis)
- ✅ 10,000 comandos/dia
- ✅ 256 MB de memória
- ✅ Suficiente para testes

---

## 🔧 Comandos Úteis

### Ver dados no Neon
1. Acesse o dashboard do Neon
2. Clique em "SQL Editor"
3. Execute queries SQL diretamente

### Ver dados no Upstash
1. Acesse o dashboard do Upstash
2. Clique em "Data Browser"
3. Veja as chaves e valores

### Prisma Studio (Local)
```bash
npm run prisma:studio
```
Abre em: http://localhost:5555

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se copiou a connection string completa
- Verifique se tem `?sslmode=require` no final
- Teste a conexão no dashboard do Neon

### Erro: "Redis connection failed"
- Verifique se copiou a URL completa do Upstash
- Verifique se começa com `rediss://` (com dois 's')
- Teste no dashboard do Upstash

### Erro: "relation does not exist"
```bash
# Recriar banco
npm run prisma:migrate reset
npm run prisma:seed
```

### Limpar e recomeçar
```bash
# Deletar node_modules
rmdir /s /q node_modules

# Reinstalar
npm install

# Recriar banco
npm run prisma:migrate
npm run prisma:seed
```

---

## 🎯 Próximos Passos

Depois de testar:

1. ✅ Explore a API no Swagger
2. ✅ Teste todos os endpoints
3. ✅ Veja os dados no Prisma Studio
4. 🚀 Parta para a Prioridade 2!

---

## 💰 Quando Migrar para Produção

Os planos gratuitos são ótimos para:
- ✅ Desenvolvimento
- ✅ Testes
- ✅ Protótipos
- ✅ Demos

Para produção, considere:
- Neon Pro: $19/mês
- Upstash Pro: $10/mês
- Ou migre para servidores próprios

---

**Esta é a forma mais rápida de começar! Qualquer dúvida, consulte a documentação dos serviços.** 🚀
