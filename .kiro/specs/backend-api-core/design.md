# Design Document - Backend API Core

## Overview

O Backend API Core é o módulo fundamental do sistema integrado para restaurantes, implementado como uma API RESTful escalável usando Node.js com TypeScript, Express.js, PostgreSQL e Redis. O sistema segue arquitetura em camadas (Controller → Service → Repository) e é totalmente containerizado com Docker para facilitar desenvolvimento e deploy.

### Tecnologias Principais

- **Runtime**: Node.js 20 LTS com TypeScript 5.x
- **Framework Web**: Express.js 4.x
- **Banco de Dados**: PostgreSQL 16
- **Cache**: Redis 7.x
- **ORM**: Prisma 5.x
- **Autenticação**: JWT (jsonwebtoken)
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI 3.0
- **Containerização**: Docker e Docker Compose
- **Testes**: Jest e Supertest

## Architecture

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│         API Layer (Controllers)          │
│  - Validação de entrada                  │
│  - Autenticação/Autorização              │
│  - Serialização de resposta              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Business Layer (Services)          │
│  - Lógica de negócio                     │
│  - Orquestração de operações             │
│  - Regras de validação complexas         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Data Layer (Repositories)           │
│  - Acesso ao banco de dados              │
│  - Queries e transações                  │
│  - Cache de dados                        │
└─────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
src/
├── config/           # Configurações (database, redis, jwt)
├── controllers/      # Controllers REST
├── services/         # Lógica de negócio
├── repositories/     # Acesso a dados
├── models/           # Tipos TypeScript e schemas Prisma
├── middlewares/      # Middlewares Express (auth, error, validation)
├── utils/            # Utilitários (logger, crypto, validators)
├── routes/           # Definição de rotas
└── app.ts            # Inicialização da aplicação
```


## Components and Interfaces

### 1. Authentication Module

**Responsabilidade**: Gerenciar autenticação de usuários e geração de tokens JWT.

**Componentes**:
- `AuthController`: Endpoints de login e refresh token
- `AuthService`: Lógica de autenticação e geração de tokens
- `AuthMiddleware`: Validação de tokens em requisições protegidas

**Interfaces**:

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

### 2. Product Management Module

**Responsabilidade**: CRUD de produtos do cardápio.

**Componentes**:
- `ProductController`: Endpoints REST para produtos
- `ProductService`: Regras de negócio de produtos
- `ProductRepository`: Persistência de produtos

**Interfaces**:

```typescript
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: File;
}

interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  isActive?: boolean;
}
```


### 3. Ingredient Management Module

**Responsabilidade**: Gerenciar insumos e matérias-primas.

**Componentes**:
- `IngredientController`: Endpoints REST para insumos
- `IngredientService`: Lógica de negócio de insumos
- `IngredientRepository`: Persistência de insumos

**Interfaces**:

```typescript
interface Ingredient {
  id: string;
  name: string;
  unit: MeasurementUnit;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  status: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

enum MeasurementUnit {
  KILOGRAM = 'kg',
  GRAM = 'g',
  LITER = 'l',
  MILLILITER = 'ml',
  UNIT = 'un'
}

enum StockStatus {
  NORMAL = 'normal',
  LOW = 'low',
  OUT_OF_STOCK = 'out_of_stock'
}

interface ProductIngredient {
  productId: string;
  ingredientId: string;
  quantity: number;
}
```

### 4. Stock Control Module

**Responsabilidade**: Controlar movimentações de estoque.

**Componentes**:
- `StockController`: Endpoints para movimentações
- `StockService`: Lógica de entrada/saída de estoque
- `StockRepository`: Persistência de transações

**Interfaces**:

```typescript
interface StockTransaction {
  id: string;
  ingredientId: string;
  type: TransactionType;
  quantity: number;
  reason: string | null;
  userId: string;
  createdAt: Date;
}

enum TransactionType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment'
}

interface CreateStockTransactionDTO {
  ingredientId: string;
  type: TransactionType;
  quantity: number;
  reason?: string;
}

interface StockReport {
  ingredient: Ingredient;
  transactions: StockTransaction[];
  totalIn: number;
  totalOut: number;
  currentQuantity: number;
}
```


### 5. Category Module

**Responsabilidade**: Organizar produtos em categorias.

**Componentes**:
- `CategoryController`: Endpoints REST para categorias
- `CategoryService`: Lógica de categorização
- `CategoryRepository`: Persistência de categorias

**Interfaces**:

```typescript
interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCategoryDTO {
  name: string;
  displayOrder: number;
}
```

### 6. Establishment Module

**Responsabilidade**: Gerenciar dados do estabelecimento.

**Componentes**:
- `EstablishmentController`: Endpoints de configuração
- `EstablishmentService`: Lógica de configuração
- `EstablishmentRepository`: Persistência de dados

**Interfaces**:

```typescript
interface Establishment {
  id: string;
  name: string;
  cnpj: string;
  address: Address;
  phone: string;
  email: string;
  logoUrl: string | null;
  taxSettings: TaxSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface TaxSettings {
  taxRegime: string;
  icmsRate: number;
  issRate: number;
  pisRate: number;
  cofinsRate: number;
}
```


## Data Models

### Prisma Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  stockTransactions StockTransaction[]
  auditLogs         AuditLog[]
}

model Category {
  id           String    @id @default(uuid())
  name         String    @unique
  displayOrder Int
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  products     Product[]
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  categoryId  String
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  category    Category @relation(fields: [categoryId], references: [id])
  ingredients ProductIngredient[]
}

model Ingredient {
  id              String   @id @default(uuid())
  name            String
  unit            String
  currentQuantity Decimal  @db.Decimal(10, 3)
  minimumQuantity Decimal  @db.Decimal(10, 3)
  averageCost     Decimal  @db.Decimal(10, 2)
  status          String   @default("normal")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  products        ProductIngredient[]
  transactions    StockTransaction[]
}

model ProductIngredient {
  productId    String
  ingredientId String
  quantity     Decimal @db.Decimal(10, 3)
  
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  
  @@id([productId, ingredientId])
}

model StockTransaction {
  id           String   @id @default(uuid())
  ingredientId String
  type         String
  quantity     Decimal  @db.Decimal(10, 3)
  reason       String?
  userId       String
  createdAt    DateTime @default(now())
  
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  user         User       @relation(fields: [userId], references: [id])
  
  @@index([ingredientId, createdAt])
}

model Establishment {
  id          String   @id @default(uuid())
  name        String
  cnpj        String   @unique
  address     Json
  phone       String
  email       String
  logoUrl     String?
  taxSettings Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String
  entity    String
  entityId  String
  changes   Json
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([entity, entityId])
  @@index([createdAt])
}
```


## Error Handling

### Estratégia de Tratamento de Erros

O sistema implementa uma hierarquia de erros customizados e um middleware centralizado para tratamento consistente.

**Classes de Erro**:

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(400, message);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = 'Autenticação necessária') {
    super(401, message);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(403, message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} não encontrado`);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
```

**Error Middleware**:

```typescript
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors })
    });
  }

  // Log de erros não operacionais
  logger.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
};
```

### Padrão de Resposta

Todas as respostas seguem estrutura consistente:

**Sucesso**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro**:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": {
    "field": ["mensagem de validação"]
  }
}
```


## Testing Strategy

### Pirâmide de Testes

```
        /\
       /  \      E2E Tests (10%)
      /────\     - Fluxos críticos completos
     /      \    
    /────────\   Integration Tests (30%)
   /          \  - Testes de API com banco real
  /────────────\ 
 /              \ Unit Tests (60%)
/________________\ - Lógica de negócio isolada
```

### 1. Testes Unitários (Jest)

**Escopo**: Services e utilitários isolados com mocks de dependências.

**Exemplo**:
```typescript
describe('ProductService', () => {
  let productService: ProductService;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    } as any;
    
    productService = new ProductService(mockRepository);
  });

  it('should create product with valid data', async () => {
    const productData = {
      name: 'Pizza Margherita',
      price: 35.90,
      categoryId: 'cat-123'
    };

    mockRepository.create.mockResolvedValue({
      id: 'prod-123',
      ...productData
    });

    const result = await productService.createProduct(productData);

    expect(result.id).toBe('prod-123');
    expect(mockRepository.create).toHaveBeenCalledWith(productData);
  });

  it('should throw ValidationError for negative price', async () => {
    const productData = {
      name: 'Pizza',
      price: -10,
      categoryId: 'cat-123'
    };

    await expect(
      productService.createProduct(productData)
    ).rejects.toThrow(ValidationError);
  });
});
```

### 2. Testes de Integração (Supertest)

**Escopo**: Endpoints REST com banco de dados de teste.

**Exemplo**:
```typescript
describe('POST /api/v1/products', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestAuthToken();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should create product and return 201', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Hambúrguer Artesanal',
        description: 'Carne 180g com queijo',
        price: 28.90,
        categoryId: 'cat-123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Hambúrguer Artesanal');
  });

  it('should return 401 without auth token', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Test' });

    expect(response.status).toBe(401);
  });
});
```

### 3. Testes E2E

**Escopo**: Fluxos críticos completos simulando uso real.

**Cenários Prioritários**:
- Login → Criar produto → Adicionar insumos → Registrar entrada de estoque
- Criar produto → Vincular insumos → Simular venda → Verificar baixa de estoque
- Consultar relatório de estoque com filtros

### Cobertura de Código

**Metas**:
- Services: 90% de cobertura
- Controllers: 80% de cobertura
- Repositories: 70% de cobertura
- Cobertura geral: mínimo 80%


## Docker Configuration

### Estrutura de Containerização

O sistema utiliza Docker multi-stage builds e Docker Compose para orquestração.

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "run", "start:prod"]
```

### docker-compose.yml (Desenvolvimento)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: restaurant-db-dev
    environment:
      POSTGRES_USER: restaurant_user
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: restaurant_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U restaurant_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: restaurant-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data_dev:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    container_name: restaurant-api-dev
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://restaurant_user:dev_password@postgres:5432/restaurant_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_jwt_secret_change_in_production
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

volumes:
  postgres_data_dev:
  redis_data_dev:
```

### docker-compose.prod.yml (Produção)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: restaurant-db-prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    networks:
      - restaurant-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: restaurant-redis-prod
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data_prod:/data
    networks:
      - restaurant-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: restaurant-api-prod
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - restaurant-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

networks:
  restaurant-network:
    driver: bridge

volumes:
  postgres_data_prod:
  redis_data_prod:
```

### Variáveis de Ambiente

**.env.development**:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://restaurant_user:dev_password@localhost:5432/restaurant_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

**.env.production** (template):
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://:password@host:6379
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```


## API Documentation

### OpenAPI/Swagger Configuration

O sistema expõe documentação interativa via Swagger UI no endpoint `/api/docs`.

**Configuração**:

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management API',
      version: '1.0.0',
      description: 'API RESTful para sistema integrado de gestão de restaurantes',
      contact: {
        name: 'API Support',
        email: 'support@restaurant-api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.restaurant.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### Principais Endpoints

**Autenticação**:
- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/refresh` - Renovar token

**Produtos**:
- `GET /api/v1/products` - Listar produtos (paginado)
- `GET /api/v1/products/:id` - Buscar produto por ID
- `POST /api/v1/products` - Criar produto
- `PUT /api/v1/products/:id` - Atualizar produto
- `DELETE /api/v1/products/:id` - Remover produto
- `POST /api/v1/products/:id/image` - Upload de imagem

**Categorias**:
- `GET /api/v1/categories` - Listar categorias
- `POST /api/v1/categories` - Criar categoria
- `PUT /api/v1/categories/:id` - Atualizar categoria
- `DELETE /api/v1/categories/:id` - Remover categoria

**Insumos**:
- `GET /api/v1/ingredients` - Listar insumos
- `GET /api/v1/ingredients/:id` - Buscar insumo por ID
- `POST /api/v1/ingredients` - Criar insumo
- `PUT /api/v1/ingredients/:id` - Atualizar insumo
- `POST /api/v1/ingredients/:id/link-product` - Vincular a produto

**Estoque**:
- `POST /api/v1/stock/transactions` - Registrar movimentação
- `GET /api/v1/stock/transactions` - Listar transações (paginado)
- `GET /api/v1/stock/report` - Relatório de estoque atual
- `GET /api/v1/stock/report/low` - Insumos com estoque baixo
- `GET /api/v1/stock/report/movement` - Relatório de movimentação

**Estabelecimento**:
- `GET /api/v1/establishment` - Buscar dados do estabelecimento
- `PUT /api/v1/establishment` - Atualizar dados
- `POST /api/v1/establishment/logo` - Upload de logotipo

**Health Check**:
- `GET /health` - Status da aplicação e dependências


## Security Considerations

### 1. Autenticação e Autorização

- **JWT com expiração**: Tokens expiram em 24h, forçando re-autenticação periódica
- **Bcrypt para senhas**: Fator de custo 10 (dev) / 12 (prod) para hash de senhas
- **HTTPS obrigatório**: Todas as comunicações em produção via TLS 1.3
- **Refresh tokens**: Implementar rotação de tokens para sessões longas

### 2. Proteção contra Ataques

**SQL Injection**:
- Uso de Prisma ORM com queries parametrizadas
- Validação de entrada com Zod antes de queries

**XSS (Cross-Site Scripting)**:
- Sanitização de inputs com biblioteca `validator`
- Content Security Policy headers
- Escape de dados em respostas JSON

**CSRF (Cross-Site Request Forgery)**:
- Tokens CSRF em operações state-changing
- SameSite cookies quando aplicável

**Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
```

### 3. Validação de Dados

Uso de Zod para validação tipada:

```typescript
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  image: z.instanceof(File).optional()
});

// Middleware de validação
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Dados inválidos', error.flatten().fieldErrors);
      }
      throw error;
    }
  };
};
```

### 4. Logging e Auditoria

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Audit log para operações críticas
const auditLog = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes: any
) => {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, changes }
  });
};
```

### 5. Segurança de Arquivos

- Validação de tipo MIME para uploads
- Limite de tamanho (5MB para imagens de produtos, 2MB para logos)
- Armazenamento em diretório isolado ou serviço externo (S3)
- Geração de nomes únicos para evitar sobrescrita

### 6. Headers de Segurança

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```


## Performance Optimization

### 1. Caching Strategy

**Redis para Cache de Dados**:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache wrapper
const cacheGet = async <T>(key: string): Promise<T | null> => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 300 // 5 minutos padrão
): Promise<void> => {
  await redis.setex(key, ttl, JSON.stringify(value));
};

// Exemplo de uso em service
class ProductService {
  async getProducts(page: number, limit: number) {
    const cacheKey = `products:${page}:${limit}`;
    
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    
    const products = await this.repository.findMany(page, limit);
    await cacheSet(cacheKey, products, 300);
    
    return products;
  }
}
```

**Cache Invalidation**:
- Invalidar cache ao criar/atualizar/deletar recursos
- Usar padrões de chave consistentes para facilitar invalidação em lote

### 2. Database Optimization

**Índices Estratégicos**:
```prisma
model Product {
  // ...
  @@index([categoryId])
  @@index([isActive])
  @@index([createdAt])
}

model StockTransaction {
  // ...
  @@index([ingredientId, createdAt])
}
```

**Connection Pooling**:
```typescript
// Prisma já gerencia pool automaticamente
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Pool size configurável via connection string
  // ?connection_limit=20
}
```

**Query Optimization**:
- Usar `select` para buscar apenas campos necessários
- Implementar paginação em todas as listagens
- Usar `include` com cuidado para evitar N+1 queries

### 3. Paginação

```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const paginate = async <T>(
  model: any,
  params: PaginationParams,
  where?: any
): Promise<PaginatedResponse<T>> => {
  const { page = 1, limit = 50 } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take: limit }),
    model.count({ where })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
```

### 4. Compression

```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));
```

### 5. Graceful Shutdown

```typescript
const gracefulShutdown = async () => {
  logger.info('Iniciando graceful shutdown...');
  
  // Parar de aceitar novas conexões
  server.close(() => {
    logger.info('Servidor HTTP fechado');
  });

  // Aguardar requisições em andamento (max 30s)
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Fechar conexões de banco
  await prisma.$disconnect();
  await redis.quit();

  logger.info('Shutdown completo');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

## Monitoring and Observability

### Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Metrics

Implementar métricas básicas:
- Tempo de resposta por endpoint
- Taxa de erro por endpoint
- Uso de memória e CPU
- Conexões ativas de banco de dados
- Hit rate do cache

## Deployment Considerations

### Ambiente de Produção

1. **Variáveis de Ambiente**: Usar secrets manager (AWS Secrets Manager, HashiCorp Vault)
2. **Logs Centralizados**: Integrar com ELK Stack ou CloudWatch
3. **Backup de Banco**: Backup automático diário com retenção de 30 dias
4. **SSL/TLS**: Certificados via Let's Encrypt ou AWS Certificate Manager
5. **Load Balancer**: Nginx ou AWS ALB para distribuição de carga
6. **Auto-scaling**: Configurar baseado em CPU/memória (threshold 70%)

### CI/CD Pipeline

```yaml
# Exemplo de workflow GitHub Actions
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: restaurant-api:${{ github.sha }}
```

