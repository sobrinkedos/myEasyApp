# 📝 Comandos Úteis - Restaurant API

## 🐳 Docker

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Parar e remover volumes (APAGA DADOS!)
docker-compose down -v

# Ver status dos containers
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas da API
docker-compose logs -f api

# Ver logs do PostgreSQL
docker-compose logs -f postgres

# Ver logs do Redis
docker-compose logs -f redis

# Reiniciar um serviço específico
docker-compose restart postgres
docker-compose restart redis

# Entrar no container do PostgreSQL
docker-compose exec postgres psql -U restaurant_user -d restaurant_dev

# Entrar no container do Redis
docker-compose exec redis redis-cli
```

## 🗄️ Prisma (Banco de Dados)

```bash
# Gerar cliente Prisma (após mudar schema)
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Aplicar migrations em produção
npm run prisma:migrate:prod

# Popular banco com dados iniciais
npm run prisma:seed

# Abrir Prisma Studio (interface visual)
npm run prisma:studio

# Resetar banco de dados (APAGA TUDO!)
npx prisma migrate reset

# Ver status das migrations
npx prisma migrate status

# Formatar schema.prisma
npx prisma format
```

## 🚀 Aplicação

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm run start:prod

# Executar versão compilada
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes E2E
npm run test:e2e

# Gerar relatório de cobertura
npm test -- --coverage

# Executar script de teste da API
node test-api.js
```

## 🔍 Linting e Formatação

```bash
# Executar linter
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format
```

## 📊 Monitoramento

```bash
# Ver uso de memória dos containers
docker stats

# Ver processos rodando
docker-compose top

# Inspecionar container
docker inspect restaurant-api-dev

# Ver logs em tempo real com filtro
docker-compose logs -f | grep ERROR
```

## 🔧 Manutenção

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Limpar build
rm -rf dist

# Limpar logs
rm -rf logs/*.log

# Limpar uploads
rm -rf uploads/*

# Ver espaço usado pelo Docker
docker system df

# Limpar recursos não utilizados do Docker
docker system prune -a
```

## 🗃️ Backup e Restore

```bash
# Backup do banco de dados
docker-compose exec postgres pg_dump -U restaurant_user restaurant_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U restaurant_user restaurant_dev < backup.sql

# Backup de uploads
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# Restaurar uploads
tar -xzf uploads_backup.tar.gz
```

## 🔐 Segurança

```bash
# Gerar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar senha segura
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"

# Verificar variáveis de ambiente
cat .env.development

# Verificar se há secrets no código
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules
```

## 📈 Performance

```bash
# Analisar bundle size
npm run build
du -sh dist/

# Ver tempo de build
time npm run build

# Benchmark de endpoints (precisa do Apache Bench)
ab -n 1000 -c 10 http://localhost:3000/health

# Monitorar uso de CPU e memória
docker stats restaurant-api-dev
```

## 🌐 Rede

```bash
# Ver portas em uso
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Testar conectividade
curl http://localhost:3000/health
curl -I http://localhost:3000/api/docs

# Ver IPs dos containers
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' restaurant-api-dev
```

## 📦 Produção

```bash
# Build da imagem Docker
docker build -t restaurant-api:latest .

# Executar em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver logs de produção
docker-compose -f docker-compose.prod.yml logs -f

# Parar produção
docker-compose -f docker-compose.prod.yml down

# Atualizar em produção (zero downtime)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api
```

## 🐛 Debug

```bash
# Executar com debug do Node.js
node --inspect src/server.ts

# Ver variáveis de ambiente carregadas
node -e "require('dotenv').config(); console.log(process.env)"

# Testar conexão com PostgreSQL
docker-compose exec postgres pg_isready -U restaurant_user

# Testar conexão com Redis
docker-compose exec redis redis-cli ping

# Ver queries SQL do Prisma
DEBUG=prisma:query npm run dev

# Ver todas as queries e eventos do Prisma
DEBUG=prisma:* npm run dev
```

## 📱 Endpoints Úteis

```bash
# Health check
curl http://localhost:3000/health

# Documentação Swagger
open http://localhost:3000/api/docs

# Prisma Studio
open http://localhost:5555

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'

# Listar categorias (com token)
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 🎯 Atalhos Rápidos

```bash
# Setup completo do zero
docker-compose up -d && npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed

# Reiniciar tudo
docker-compose restart && npm run dev

# Limpar e recomeçar
docker-compose down -v && docker-compose up -d && npm run prisma:migrate && npm run prisma:seed

# Deploy rápido
npm run build && docker build -t restaurant-api:latest . && docker-compose -f docker-compose.prod.yml up -d
```

---

**💡 Dica:** Adicione estes comandos como aliases no seu terminal para acesso rápido!
