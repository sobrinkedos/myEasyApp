# 🚀 Guia Rápido de Teste - Restaurant API

## Passo 1: Verificar Pré-requisitos

Certifique-se de ter instalado:
- Docker Desktop (rodando)
- Node.js 20+ 
- npm 10+

```bash
# Verificar versões
docker --version
docker-compose --version
node --version
npm --version
```

## Passo 2: Configurar Ambiente

```bash
# 1. Copiar arquivo de ambiente
copy .env.development.example .env.development

# 2. (Opcional) Editar .env.development se necessário
# As configurações padrão já funcionam para desenvolvimento local
```

## Passo 3: Instalar Dependências

```bash
npm install
```

## Passo 4: Iniciar Serviços Docker

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps
```

Você deve ver:
- `restaurant-db-dev` (PostgreSQL) - healthy
- `restaurant-redis-dev` (Redis) - healthy

## Passo 5: Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrations (criar tabelas)
npm run prisma:migrate

# Popular banco com dados iniciais
npm run prisma:seed
```

## Passo 6: Iniciar API

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

## Passo 7: Testar a API

### 7.1 Health Check

Abra o navegador ou use curl:

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.123,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### 7.2 Documentação Swagger

Abra no navegador:
```
http://localhost:3000/api/docs
```

Aqui você pode testar todos os endpoints interativamente!

### 7.3 Fazer Login

**Via Swagger:**
1. Acesse http://localhost:3000/api/docs
2. Expanda `POST /api/v1/auth/login`
3. Clique em "Try it out"
4. Use as credenciais do seed:
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```
5. Clique em "Execute"
6. Copie o token da resposta

**Via curl:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@restaurant.com\",\"password\":\"admin123\"}"
```

### 7.4 Testar Endpoints Protegidos

**Listar Categorias:**

Via Swagger:
1. Clique no botão "Authorize" no topo
2. Cole o token (sem "Bearer")
3. Teste `GET /api/v1/categories`

Via curl:
```bash
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Listar Produtos:**
```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Criar Produto:**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Pizza Margherita\",
    \"description\": \"Molho de tomate, mussarela e manjericão\",
    \"price\": 45.90,
    \"categoryId\": \"CATEGORIA_ID_AQUI\"
  }"
```

## Passo 8: Explorar Prisma Studio (Opcional)

Para visualizar os dados no banco:

```bash
npm run prisma:studio
```

Abre em: http://localhost:5555

## Passo 9: Ver Logs

```bash
# Logs da API (se rodando via Docker)
docker-compose logs -f api

# Logs do PostgreSQL
docker-compose logs -f postgres

# Logs do Redis
docker-compose logs -f redis
```

## Passo 10: Parar Tudo

```bash
# Parar API (Ctrl+C no terminal onde está rodando)

# Parar containers Docker
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

## 🧪 Testes Automatizados

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm test -- --coverage
```

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou mude a porta no .env.development
PORT=3001
```

### Erro: "Cannot connect to database"
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar containers
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Erro: "Redis connection failed"
```bash
# Verificar Redis
docker-compose ps

# Reiniciar
docker-compose restart redis

# Ver logs
docker-compose logs redis
```

### Limpar tudo e recomeçar
```bash
# Parar containers
docker-compose down -v

# Remover node_modules
rmdir /s /q node_modules

# Reinstalar
npm install

# Recriar containers
docker-compose up -d

# Recriar banco
npm run prisma:migrate
npm run prisma:seed
```

## 📊 Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | /api/v1/auth/login | Login | ❌ |
| GET | /health | Health check | ❌ |
| GET | /api/v1/categories | Listar categorias | ✅ |
| POST | /api/v1/categories | Criar categoria | ✅ |
| GET | /api/v1/products | Listar produtos | ✅ |
| POST | /api/v1/products | Criar produto | ✅ |
| GET | /api/v1/ingredients | Listar insumos | ✅ |
| POST | /api/v1/stock/transactions | Registrar movimentação | ✅ |
| GET | /api/v1/stock/report | Relatório de estoque | ✅ |

## 🎯 Próximos Passos

1. ✅ Testar todos os endpoints via Swagger
2. ✅ Criar alguns produtos e categorias
3. ✅ Registrar movimentações de estoque
4. ✅ Gerar relatórios
5. 🚀 Partir para o desenvolvimento do frontend!

## 💡 Dicas

- Use o Swagger para explorar a API de forma interativa
- Use o Prisma Studio para visualizar os dados
- Mantenha os logs abertos para debug
- O token JWT expira em 24h
- Cache Redis tem TTL de 5 minutos

---

**Pronto para começar? Execute os comandos acima em sequência!** 🚀
