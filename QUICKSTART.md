# 🚀 Guia de Início Rápido

## Pré-requisitos

- Node.js >= 20.0.0
- Docker e Docker Compose
- npm >= 10.0.0

## Passos para Iniciar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.development.example .env.development
```

### 3. Iniciar Serviços Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL na porta 5432
- Redis na porta 6379

### 4. Gerar Cliente Prisma

```bash
npm run prisma:generate
```

### 5. Executar Migrations

```bash
npm run prisma:migrate
```

Quando solicitado, dê um nome para a migration (ex: "init")

### 6. Popular Banco de Dados

```bash
npm run prisma:seed
```

Isso criará:
- Usuário admin (email: admin@restaurant.com, senha: admin123)
- Categorias básicas
- Insumos de exemplo
- Estabelecimento exemplo

### 7. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em: http://localhost:3000

## 📚 Acessar Documentação

Abra no navegador: http://localhost:3000/api/docs

## 🧪 Testar a API

### 1. Fazer Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'
```

Copie o `token` retornado.

### 2. Listar Categorias

```bash
curl -X GET http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Criar Nova Categoria

```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizzas",
    "displayOrder": 6
  }'
```

## 🛠️ Comandos Úteis

### Ver Logs do Docker

```bash
docker-compose logs -f
```

### Acessar Prisma Studio

```bash
npm run prisma:studio
```

Abre interface visual do banco em: http://localhost:5555

### Executar Testes

```bash
npm test
```

### Parar Serviços Docker

```bash
docker-compose down
```

### Limpar Tudo e Recomeçar

```bash
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 📝 Próximos Passos

1. Explore a documentação Swagger em `/api/docs`
2. Implemente novos módulos seguindo o padrão existente
3. Adicione testes para suas funcionalidades
4. Configure CI/CD para deploy automático

## ❓ Problemas Comuns

### Erro de Conexão com PostgreSQL

Verifique se o Docker está rodando:
```bash
docker ps
```

### Erro "Port already in use"

Algum serviço já está usando a porta. Pare o serviço ou mude a porta no docker-compose.yml

### Erro no Prisma Generate

Limpe e reinstale:
```bash
rm -rf node_modules
npm install
npm run prisma:generate
```

## 🎉 Pronto!

Seu backend está rodando e pronto para desenvolvimento!
