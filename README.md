# Restaurant API Core

Backend API Core para Sistema Integrado de Restaurantes, Bares e Lanchonetes.

## 🚀 Tecnologias

- **Node.js** 20 LTS
- **TypeScript** 5.x
- **Express.js** 4.x
- **PostgreSQL** 16
- **Redis** 7.x
- **Prisma** ORM 5.x
- **Docker** & Docker Compose

## 📋 Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker e Docker Compose (para desenvolvimento)

## 🔧 Instalação

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd restaurant-api-core
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.development.example .env.development
```

### 4. Iniciar serviços com Docker

```bash
docker-compose up -d
```

### 5. Executar migrations

```bash
npm run prisma:migrate
```

### 6. Popular banco de dados (opcional)

```bash
npm run prisma:seed
```

## 🏃 Executando a aplicação

### Desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

### Produção

```bash
npm run build
npm run start:prod
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Executar testes E2E

```bash
npm run test:e2e
```

### Gerar relatório de cobertura

```bash
npm test -- --coverage
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação Swagger em:

```
http://localhost:3000/api/docs
```

## 🐳 Docker

### Desenvolvimento

```bash
docker-compose up -d
```

### Produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Parar serviços

```bash
docker-compose down
```

### Ver logs

```bash
docker-compose logs -f api
```

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações (database, redis, jwt)
├── controllers/      # Controllers REST
├── services/         # Lógica de negócio
├── repositories/     # Acesso a dados
├── models/           # Tipos TypeScript e schemas
├── middlewares/      # Middlewares Express
├── utils/            # Utilitários
├── routes/           # Definição de rotas
└── app.ts            # Inicialização da aplicação
```

## 🔐 Variáveis de Ambiente

Veja `.env.development.example` para lista completa de variáveis necessárias.

Principais variáveis:

- `NODE_ENV` - Ambiente (development/production)
- `PORT` - Porta da aplicação
- `DATABASE_URL` - URL de conexão PostgreSQL
- `REDIS_URL` - URL de conexão Redis
- `JWT_SECRET` - Secret para geração de tokens JWT

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm test` - Executa testes
- `npm run lint` - Executa linter
- `npm run format` - Formata código com Prettier
- `npm run prisma:generate` - Gera cliente Prisma
- `npm run prisma:migrate` - Executa migrations
- `npm run prisma:studio` - Abre Prisma Studio

## 🚀 Deploy para Produção

### Checklist de Deploy

#### 1. Preparação

- [ ] Criar arquivo `.env.production` baseado em `.env.production.example`
- [ ] Gerar JWT_SECRET seguro (mínimo 32 caracteres)
- [ ] Configurar senhas fortes para PostgreSQL e Redis
- [ ] Configurar DATABASE_URL com credenciais de produção
- [ ] Configurar REDIS_URL com credenciais de produção
- [ ] Definir CORS_ORIGIN com domínio da aplicação
- [ ] Configurar BCRYPT_ROUNDS=12 para produção

#### 2. Build e Testes

- [ ] Executar `npm run build` e verificar se compila sem erros
- [ ] Executar `npm test` e garantir que todos os testes passam
- [ ] Testar build da imagem Docker: `docker build -t restaurant-api .`

#### 3. Banco de Dados

- [ ] Criar banco de dados PostgreSQL em produção
- [ ] Executar migrations: `npm run prisma:migrate:prod`
- [ ] Executar seed (se necessário): `npm run prisma:seed`
- [ ] Fazer backup do banco de dados

#### 4. Deploy

- [ ] Fazer upload do código para servidor
- [ ] Copiar arquivo `.env.production` para o servidor
- [ ] Executar `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Verificar logs: `docker-compose -f docker-compose.prod.yml logs -f api`
- [ ] Testar health check: `curl https://api.yourdomain.com/health`

#### 5. Pós-Deploy

- [ ] Verificar que todos os serviços estão rodando
- [ ] Testar endpoints principais via Swagger
- [ ] Configurar monitoramento e alertas
- [ ] Configurar backup automático do banco de dados
- [ ] Documentar processo de rollback

### Comandos Úteis de Produção

```bash
# Build da imagem Docker
docker build -t restaurant-api:latest .

# Iniciar serviços em produção
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Executar migrations em produção
docker-compose -f docker-compose.prod.yml exec api npm run prisma:migrate:prod

# Backup do banco de dados
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USER $DB_NAME < backup.sql
```

### Segurança em Produção

- ✅ HTTPS obrigatório (configurar certificado SSL/TLS)
- ✅ Rate limiting configurado (100 req/min por IP)
- ✅ Helmet configurado com headers de segurança
- ✅ CORS configurado com origem específica
- ✅ Senhas hasheadas com bcrypt (rounds=12)
- ✅ JWT com expiração de 24h
- ✅ Validação e sanitização de inputs
- ✅ Logs de auditoria para operações críticas

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
