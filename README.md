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

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
