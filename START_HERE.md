# 🚀 COMECE AQUI - Teste do Sistema

## ⚠️ IMPORTANTE: Escolha sua opção

### 🐳 TEM DOCKER?
Siga os passos abaixo normalmente.

### ❌ NÃO TEM DOCKER?
**Escolha uma opção:**

1. **MAIS FÁCIL** ⭐ - Serviços Online (10 min)
   - Abra: **SETUP_ONLINE.md**
   - PostgreSQL: Neon (grátis)
   - Redis: Upstash (grátis)
   - Sem instalação!

2. **Portátil** - Sem permissões de admin
   - Abra: **SEM_DOCKER.md** (Opção 2)
   - Execute: `setup-portable.bat`

3. **Nativo** - Com instalação
   - Abra: **SEM_DOCKER.md** (Opção 1)

---

## 📋 Com Docker - Execute em sequência:

### 1️⃣ Verificar Docker
```bash
docker --version
docker-compose --version
```
✅ Se aparecer as versões, está OK!

### 2️⃣ Iniciar Containers (PostgreSQL + Redis)
```bash
docker-compose up -d
```
✅ Aguarde alguns segundos para os containers iniciarem

### 3️⃣ Verificar se os Containers estão Rodando
```bash
docker-compose ps
```
✅ Deve mostrar `restaurant-db-dev` e `restaurant-redis-dev` como "healthy"

### 4️⃣ Instalar Dependências (se ainda não instalou)
```bash
npm install
```

### 5️⃣ Gerar Cliente Prisma
```bash
npm run prisma:generate
```

### 6️⃣ Criar Banco de Dados (Migrations)
```bash
npm run prisma:migrate
```
✅ Vai criar todas as tabelas no PostgreSQL

### 7️⃣ Popular Banco com Dados Iniciais
```bash
npm run prisma:seed
```
✅ Cria usuário admin, categorias e insumos de exemplo

### 8️⃣ Iniciar a API
```bash
npm run dev
```
✅ Deve aparecer:
- ✅ Redis connected
- 🚀 Server running on port 3000
- 📚 API Documentation: http://localhost:3000/api/docs

**DEIXE ESTE TERMINAL ABERTO!**

---

## 🧪 Agora Teste a API

### Opção 1: Teste Automático (Recomendado)

Abra um **NOVO TERMINAL** e execute:

```bash
node test-api.js
```

Isso vai testar automaticamente:
- ✅ Health check
- ✅ Login
- ✅ Listar categorias
- ✅ Listar produtos
- ✅ Criar produto
- ✅ Relatório de estoque
- ✅ Segurança

### Opção 2: Teste Manual via Navegador

1. Abra: http://localhost:3000/api/docs
2. Clique em `POST /api/v1/auth/login`
3. Clique em "Try it out"
4. Use estas credenciais:
   ```json
   {
     "email": "admin@restaurant.com",
     "password": "admin123"
   }
   ```
5. Clique em "Execute"
6. Copie o `token` da resposta
7. Clique no botão "Authorize" no topo
8. Cole o token e clique em "Authorize"
9. Agora teste qualquer endpoint!

### Opção 3: Teste via curl

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@restaurant.com\",\"password\":\"admin123\"}"

# 3. Copie o token e use nos próximos comandos
# Substitua SEU_TOKEN_AQUI pelo token recebido

# 4. Listar Categorias
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 5. Listar Produtos
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📊 Visualizar Dados no Banco

Abra um **NOVO TERMINAL** e execute:

```bash
npm run prisma:studio
```

Abre em: http://localhost:5555

Aqui você pode ver e editar todos os dados diretamente!

---

## 🛑 Para Parar Tudo

```bash
# 1. Parar a API (Ctrl+C no terminal onde está rodando)

# 2. Parar os containers Docker
docker-compose down
```

---

## ❓ Problemas?

### "Port 3000 already in use"
```bash
# Mude a porta no .env.development
PORT=3001
```

### "Cannot connect to database"
```bash
# Reiniciar containers
docker-compose restart

# Ver logs
docker-compose logs postgres
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
npm run prisma:migrate
npm run prisma:seed
```

---

## 🎯 Próximos Passos

Depois de testar:

1. ✅ Explore todos os endpoints no Swagger
2. ✅ Crie produtos, categorias e insumos
3. ✅ Registre movimentações de estoque
4. ✅ Gere relatórios
5. 🚀 Parta para a Prioridade 2: Sistema de Comandas!

---

**Dúvidas? Todos os detalhes estão no QUICKSTART.md** 📖
