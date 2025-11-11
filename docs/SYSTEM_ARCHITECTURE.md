# Arquitetura do Sistema - Restaurant API Core

## Índice

1. [Visão Geral](#visão-geral)
2. [Runtime e Linguagem](#runtime-e-linguagem)
3. [Framework Web e Core](#framework-web-e-core)
4. [Camada de Persistência](#camada-de-persistência)
5. [Sistema de Segurança](#sistema-de-segurança)
6. [Validação e Utilitários](#validação-e-utilitários)
7. [Stack do Frontend](#stack-do-frontend)
8. [Infraestrutura e Containerização](#infraestrutura-e-containerização)
9. [Modelos de Dados](#modelos-de-dados)
10. [Tratamento de Erros](#tratamento-de-erros)
11. [Estratégia de Testes](#estratégia-de-testes)
12. [Fluxo de Requisição](#fluxo-de-requisição)
13. [Deployment e Produção](#deployment-e-produção)
14. [Diagramas Arquiteturais](#diagramas-arquiteturais)
15. [Referências](#referências)

---

## Visão Geral

O **Restaurant API Core** é um sistema backend robusto para gestão integrada de restaurantes, bares e lanchonetes. Construído com TypeScript sobre Node.js, utiliza uma arquitetura em camadas (layered architecture) com separação clara de responsabilidades, seguindo princípios SOLID e clean architecture.

### Características Principais

- **Multi-tenant**: Suporte a múltiplos estabelecimentos
- **Autenticação robusta**: JWT com suporte a 2FA
- **RBAC**: Sistema de permissões hierárquico
- **Gestão completa**: Produtos, estoque, pedidos, caixa, CMV
- **Real-time**: WebSocket para atualizações em tempo real
- **API RESTful**: Documentada com Swagger/OpenAPI
- **Type-safe**: TypeScript em todo o stack

### Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← Define endpoints e validação inicial
├─────────────────────────────────────┤
│       Controllers Layer             │  ← Manipula HTTP request/response
├─────────────────────────────────────┤
│        Services Layer               │  ← Lógica de negócio
├─────────────────────────────────────┤
│      Repositories Layer             │  ← Acesso a dados
├─────────────────────────────────────┤
│         Database Layer              │  ← PostgreSQL + Prisma ORM
└─────────────────────────────────────┘
```

**Fluxo de uma Requisição HTTP:**

1. **Routes**: Recebe requisição, aplica middlewares (auth, validation)
2. **Controllers**: Extrai dados da requisição, chama services
3. **Services**: Executa lógica de negócio, orquestra repositories
4. **Repositories**: Executa queries no banco via Prisma
5. **Database**: Retorna dados
6. **Response**: Fluxo inverso até o cliente

[↑ Voltar ao topo](#índice)

---

## Runtime e Linguagem

### Node.js 20 LTS

**Versão**: 20.x (Long Term Support)

**Função**: Runtime JavaScript/TypeScript server-side que executa código JavaScript fora do navegador.

**Características**:
- **Event-driven**: Arquitetura baseada em eventos
- **Non-blocking I/O**: Operações assíncronas que não bloqueiam a thread principal
- **V8 Engine**: Motor JavaScript do Google Chrome, extremamente rápido
- **Single-threaded**: Com event loop para concorrência
- **Ideal para I/O intensive**: Perfeito para APIs que fazem muitas operações de I/O

**Por que escolhemos Node.js 20 LTS**:
- Performance excepcional para aplicações I/O intensive
- Ecossistema npm maduro com milhões de pacotes
- Suporte LTS garantido até abril de 2026
- Mesma linguagem no frontend e backend (JavaScript/TypeScript)
- Comunidade ativa e grande disponibilidade de desenvolvedores

**Instalação**:
```bash
# Usando nvm (recomendado)
nvm install 20
nvm use 20

# Verificar versão
node --version  # v20.x.x
npm --version   # 10.x.x
```

### TypeScript 5.x

**Versão**: 5.3.3

**Função**: Superset tipado de JavaScript que adiciona tipos estáticos opcionais.

**Benefícios**:
- **Type Safety**: Erros de tipo detectados em tempo de desenvolvimento
- **IntelliSense**: Autocomplete inteligente em IDEs
- **Refatoração Segura**: Renomear variáveis/funções com confiança
- **Documentação Implícita**: Tipos servem como documentação
- **Melhor Manutenibilidade**: Código mais fácil de entender e manter

**Configuração (tsconfig.json)**:
```json
{
  "compilerOptions": {
    "target": "ES2022",              // Código JavaScript moderno
    "module": "commonjs",            // Sistema de módulos Node.js
    "lib": ["ES2022"],               // APIs JavaScript disponíveis
    "outDir": "./dist",              // Pasta de saída da compilação
    "rootDir": "./src",              // Pasta raiz do código fonte
    "strict": true,                  // Modo estrito (recomendado)
    "esModuleInterop": true,         // Interop com módulos ES6
    "skipLibCheck": true,            // Pula verificação de .d.ts
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,       // Permite importar JSON
    "moduleResolution": "node",      // Resolução de módulos Node.js
    "declaration": true,             // Gera arquivos .d.ts
    "sourceMap": true,               // Gera source maps para debug
    
    // Path Aliases - Simplificam imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@repositories/*": ["src/repositories/*"],
      "@models/*": ["src/models/*"],
      "@middlewares/*": ["src/middlewares/*"],
      "@utils/*": ["src/utils/*"],
      "@routes/*": ["src/routes/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Path Aliases em Ação**:
```typescript
// Sem path aliases ❌
import { userService } from '../../../services/user.service';
import { logger } from '../../../utils/logger';

// Com path aliases ✅
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
```

**Compilação**:
```bash
# Desenvolvimento (com watch)
npm run dev

# Build para produção
npm run build

# Resultado em ./dist/
```

[↑ Voltar ao topo](#índice)

---

## Framework Web e Core

### Express.js 4.x

**Versão**: 4.18.2

**Função**: Framework web minimalista e flexível para Node.js.

**Características**:
- **Middleware-based**: Arquitetura baseada em middlewares encadeados
- **Routing robusto**: Sistema de rotas flexível e poderoso
- **Minimalista**: Core pequeno, funcionalidades via middlewares
- **Maduro**: Framework battle-tested usado por milhões
- **Grande ecossistema**: Milhares de middlewares disponíveis

**Configuração no app.ts**:
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Rate limiting
app.use(rateLimit({
  windowMs: 60000,  // 1 minuto
  max: 100          // 100 requisições
}));

// Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);

// Error handler
app.use(errorHandler);

export default app;
```

### Middlewares Essenciais

#### helmet (7.1.0)

**Função**: Adiciona security headers HTTP para proteger contra vulnerabilidades comuns.

**Headers Configurados**:
- `X-Content-Type-Options: nosniff` - Previne MIME sniffing
- `X-Frame-Options: DENY` - Previne clickjacking
- `X-XSS-Protection: 1; mode=block` - Proteção XSS
- `Strict-Transport-Security` - Força HTTPS
- `Content-Security-Policy` - Controla recursos carregados

**Configuração**:
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

#### cors (2.8.5)

**Função**: Habilita Cross-Origin Resource Sharing, permitindo que o frontend acesse a API.

**Configuração por Ambiente**:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',  // Domínio permitido
  credentials: true,                        // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Ambientes**:
- **Desenvolvimento**: `*` (qualquer origem)
- **Produção**: `https://app.restaurant.com` (específico)

#### compression (1.7.4)

**Função**: Comprime responses HTTP usando gzip/deflate.

**Benefícios**:
- Reduz bandwidth em ~70-80%
- Melhora tempo de carregamento
- Economiza custos de transferência

**Configuração**:
```typescript
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Balanço entre velocidade e compressão (0-9)
}));
```

#### express-rate-limit (7.1.5)

**Função**: Limita número de requisições por IP para prevenir abuso.

**Proteção Contra**:
- Brute force attacks
- DDoS simples
- Scraping excessivo
- Abuso de API

**Configuração**:
```typescript
const limiter = rateLimit({
  windowMs: 60000,  // 1 minuto
  max: 100,         // 100 requisições por minuto
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,   // Retorna headers RateLimit-*
  legacyHeaders: false     // Desabilita X-RateLimit-*
});

app.use('/api/', limiter);
```

[↑ Voltar ao topo](#índice)

---


## Camada de Persistência

### PostgreSQL 16

**Versão**: 16 (Alpine Linux no Docker)

**Função**: Banco de dados relacional principal do sistema.

**Características**:
- **ACID Compliant**: Atomicidade, Consistência, Isolamento, Durabilidade
- **Suporte a JSON/JSONB**: Dados semi-estruturados com índices
- **Full-text Search**: Busca textual nativa
- **Transações Robustas**: MVCC (Multi-Version Concurrency Control)
- **Índices Avançados**: B-tree, Hash, GiST, GIN, BRIN
- **Extensível**: Suporte a extensões (PostGIS, pg_trgm, etc)

**Por que PostgreSQL**:
- Open source e maduro (30+ anos)
- Performance excelente mesmo com grandes volumes
- Suporte a dados complexos (arrays, JSON, ranges)
- Integridade referencial forte
- Comunidade ativa e documentação excelente

**Configuração Docker**:
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: restaurant_user
    POSTGRES_PASSWORD: secure_password
    POSTGRES_DB: restaurant_dev
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U restaurant_user"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Prisma ORM 5.x

**Versão**: 5.7.0

**Função**: Object-Relational Mapping moderno e type-safe.

**Componentes**:

1. **Prisma Schema**: Define modelos de dados em linguagem declarativa
2. **Prisma Client**: Cliente type-safe gerado automaticamente
3. **Prisma Migrate**: Sistema de migrations versionadas
4. **Prisma Studio**: GUI para visualizar e editar dados

**Exemplo de Schema**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  phone     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  roles     UserRole[]
  sessions  Session[]
  orders    Order[]
  
  // Índices
  @@index([email])
  @@index([isActive])
  @@map("users")  // Nome da tabela no banco
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  
  users       UserRole[]
  permissions RolePermission[]
  
  @@map("roles")
}
```

**Vantagens do Prisma**:
- **Type-safe**: Autocomplete completo e verificação de tipos
- **Migrations Automáticas**: Gera migrations a partir do schema
- **Relações Intuitivas**: Navegação fácil entre entidades
- **Performance**: Queries otimizadas automaticamente
- **Introspection**: Pode gerar schema de banco existente

**Comandos Principais**:
```bash
# Gerar Prisma Client (após mudanças no schema)
npx prisma generate

# Criar migration
npx prisma migrate dev --name add_user_table

# Aplicar migrations em produção
npx prisma migrate deploy

# Abrir Prisma Studio (GUI)
npx prisma studio

# Push schema sem criar migration (dev)
npx prisma db push

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

**Exemplo de Uso**:
```typescript
import prisma from '@/config/database';

// Buscar usuário
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    roles: {
      include: {
        role: true
      }
    }
  }
});

// Criar produto com transação
const product = await prisma.$transaction(async (tx) => {
  const newProduct = await tx.product.create({
    data: {
      name: 'Pizza Margherita',
      price: 35.90,
      categoryId: 'uuid-category'
    }
  });
  
  await tx.auditLog.create({
    data: {
      action: 'CREATE',
      resource: 'product',
      resourceId: newProduct.id,
      userId: currentUser.id
    }
  });
  
  return newProduct;
});

// Query complexa
const products = await prisma.product.findMany({
  where: {
    AND: [
      { isActive: true },
      { category: { name: 'Pizzas' } },
      { price: { gte: 20, lte: 50 } }
    ]
  },
  include: {
    category: true,
    ingredients: {
      include: {
        ingredient: true
      }
    }
  },
  orderBy: {
    name: 'asc'
  },
  take: 10,
  skip: 0
});
```

### Redis 7.x (ioredis)

**Versão**: Redis 7 + ioredis 5.3.2

**Função**: Cache em memória e gerenciamento de sessões.

**Características**:
- **In-memory**: Extremamente rápido (sub-millisecond)
- **Estruturas de Dados**: Strings, Hashes, Lists, Sets, Sorted Sets
- **Pub/Sub**: Mensageria para real-time
- **Persistência Opcional**: RDB snapshots ou AOF (Append-Only File)
- **Clustering**: Suporte a sharding e replicação

**Casos de Uso no Sistema**:
1. **Cache de Queries**: Produtos, categorias, usuários
2. **Sessões**: JWT blacklist, sessões ativas
3. **Rate Limiting**: Contadores por IP
4. **Filas**: Jobs assíncronos (futuro)
5. **Real-time**: Pub/Sub para notificações

**Configuração**:
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

export default redis;
```

**Exemplo de Cache**:
```typescript
// Cache Service
class CacheService {
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
  }
  
  async del(key: string): Promise<void> {
    await redis.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Uso em Service
async findById(id: string) {
  const cacheKey = `product:${id}`;
  
  // Tenta buscar do cache
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Busca do banco
  const product = await productRepository.findById(id);
  
  // Armazena no cache (5 minutos)
  if (product) {
    await cacheService.set(cacheKey, JSON.stringify(product), 300);
  }
  
  return product;
}
```

**TTL Recomendados**:
- Dados estáticos (categorias): 1 hora (3600s)
- Produtos: 5 minutos (300s)
- Usuários: 10 minutos (600s)
- Listas: 1 minuto (60s)

[↑ Voltar ao topo](#índice)

---

## Sistema de Segurança

### JWT (jsonwebtoken 9.0.2)

**Função**: Autenticação stateless via tokens JSON Web Token.

**Estrutura do Token**:
```
Header.Payload.Signature
```

**Exemplo Real**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJ1dWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Payload Típico**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "establishmentId": "uuid-establishment",
  "roles": ["admin", "manager"],
  "iat": 1640995200,  // Issued At
  "exp": 1641600000   // Expiration
}
```

**Configuração**:
```typescript
import jwt from 'jsonwebtoken';

// Gerar token
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      establishmentId: user.establishmentId,
      roles: user.roles.map(r => r.role.name)
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256'
    }
  );
};

// Verificar token
const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expirado');
    }
    throw new UnauthorizedError('Token inválido');
  }
};
```

**Fluxo de Autenticação**:
1. Cliente envia credenciais (email + senha)
2. Servidor valida credenciais
3. Servidor gera JWT e retorna ao cliente
4. Cliente armazena JWT (localStorage/sessionStorage)
5. Cliente envia JWT em todas as requisições (header Authorization)
6. Servidor valida JWT em cada requisição

### bcrypt (5.1.1)

**Função**: Hashing seguro de senhas.

**Características**:
- **Algoritmo Adaptativo**: Fica mais lento conforme hardware melhora
- **Salt Automático**: Cada hash tem salt único
- **Resistente a Rainbow Tables**: Impossível pré-computar hashes
- **One-way**: Impossível reverter hash para senha original

**Configuração**:
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;

// Hash de senha
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Comparar senha
const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

**Número de Rounds**:
- **10 rounds**: ~100ms (desenvolvimento)
- **12 rounds**: ~400ms (produção recomendado)
- **14 rounds**: ~1.6s (alta segurança)

**Uso no Login**:
```typescript
async login(email: string, password: string) {
  // Buscar usuário
  const user = await userRepository.findByEmail(email);
  
  if (!user) {
    throw new UnauthorizedError('Credenciais inválidas');
  }
  
  // Verificar senha
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    // Incrementar tentativas falhas
    await userRepository.incrementFailedAttempts(user.id);
    throw new UnauthorizedError('Credenciais inválidas');
  }
  
  // Resetar tentativas falhas
  await userRepository.resetFailedAttempts(user.id);
  
  // Gerar token
  const token = generateToken(user);
  
  return { user, token };
}
```

### Middlewares de Auth e Authorization

#### Authentication Middleware

**Função**: Verifica se usuário está autenticado (tem token válido).

```typescript
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extrai token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token não fornecido');
    }
    
    const token = authHeader.substring(7);
    
    // Verifica se token está na blacklist (logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token inválido');
    }
    
    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Busca usuário
    const user = await userRepository.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuário inválido');
    }
    
    // Adiciona usuário ao request
    req.user = user;
    
    next();
  } catch (error) {
    next(error);
  }
};
```

#### Authorization Middleware

**Função**: Verifica se usuário tem permissão para acessar recurso.

```typescript
export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      
      // Verifica permissão
      const hasPermission = await permissionService.checkPermission(
        user.id,
        resource,
        action
      );
      
      if (!hasPermission) {
        throw new ForbiddenError(
          `Sem permissão para ${action} em ${resource}`
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

**Uso em Rotas**:
```typescript
router.get(
  '/products',
  authenticate,                      // Verifica autenticação
  authorize('products', 'read'),     // Verifica permissão
  getProducts                        // Controller
);

router.post(
  '/products',
  authenticate,
  authorize('products', 'create'),
  createProduct
);

router.delete(
  '/products/:id',
  authenticate,
  authorize('products', 'delete'),
  deleteProduct
);
```

### Sistema RBAC (Role-Based Access Control)

**Hierarquia de Roles**:
```
admin
  ├── manager
  │   ├── waiter
  │   └── cashier
  └── treasurer
      └── cashier
```

**Permissões por Role**:
```typescript
// Admin: todas as permissões
// Manager: gestão de produtos, usuários, relatórios
// Waiter: criar pedidos, visualizar comandas
// Cashier: abrir/fechar caixa, processar pagamentos
// Treasurer: receber transferências, relatórios financeiros
```

[↑ Voltar ao topo](#índice)

---


## Validação e Utilitários

### Zod (3.22.4)

**Função**: Schema validation com TypeScript-first approach.

**Características**:
- **Type Inference**: Tipos TypeScript gerados automaticamente
- **Validações Compostas**: Combine validações complexas
- **Mensagens Customizáveis**: Erros personalizados
- **Parse e Transform**: Valida e transforma dados

**Exemplo de Schema**:
```typescript
import { z } from 'zod';

// Schema de usuário
const UserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número'),
  name: z.string().min(2, 'Nome muito curto'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  establishmentId: z.string().uuid()
});

// Type inference automática
type User = z.infer<typeof UserSchema>;

// Schema de produto
const ProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('Preço deve ser positivo'),
  categoryId: z.string().uuid(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true)
});

// Schema com relacionamentos
const OrderSchema = z.object({
  commandId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    observations: z.string().max(200).optional()
  })).min(1, 'Pedido deve ter pelo menos 1 item')
});
```

**Uso em Controllers**:
```typescript
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Valida body com Zod
    const validatedData = ProductSchema.parse(req.body);
    
    // Se chegou aqui, dados são válidos
    const product = await productService.create(validatedData);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors
      });
    }
    next(error);
  }
};
```

### Winston (3.11.0)

**Função**: Logging estruturado e flexível.

**Níveis de Log**:
- `error`: Erros críticos que precisam atenção imediata
- `warn`: Avisos de situações anormais
- `info`: Informações gerais sobre operações
- `http`: Logs de requisições HTTP
- `debug`: Informações detalhadas para debugging

**Configuração**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'restaurant-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console (desenvolvimento)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Arquivo de erros
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,  // 5MB
      maxFiles: 5
    }),
    
    // Arquivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

export default logger;
```

**Uso**:
```typescript
// Log simples
logger.info('Usuário criado com sucesso');
logger.error('Erro ao conectar ao banco de dados');

// Log com contexto
logger.info('Produto criado', {
  productId: product.id,
  userId: user.id,
  action: 'CREATE'
});

// Log de erro com stack trace
try {
  await someOperation();
} catch (error) {
  logger.error('Operação falhou', {
    error: error.message,
    stack: error.stack,
    userId: user.id
  });
}
```

### Multer (1.4.5-lts.1)

**Função**: Middleware para upload de arquivos multipart/form-data.

**Configuração**:
```typescript
import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuid()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

export default upload;
```

**Uso em Rotas**:
```typescript
// Upload único
router.post('/products/:id/image', 
  authenticate,
  upload.single('image'),
  uploadProductImage
);

// Upload múltiplo
router.post('/products/:id/images',
  authenticate,
  upload.array('images', 5),  // Máximo 5 imagens
  uploadProductImages
);

// Controller
export const uploadProductImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;
  
  if (!file) {
    throw new ValidationError('Nenhum arquivo enviado');
  }
  
  const imageUrl = `/uploads/${file.filename}`;
  
  await productService.updateImage(id, imageUrl);
  
  res.json({
    success: true,
    data: { imageUrl }
  });
};
```

### date-fns (4.1.0)

**Função**: Manipulação de datas moderna e funcional.

**Vantagens sobre moment.js**:
- Modular (tree-shakeable) - menor bundle size
- Imutável - funções puras
- TypeScript nativo
- Mais rápido

**Funções Comuns**:
```typescript
import {
  format,
  addDays,
  subDays,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatação
format(new Date(), 'yyyy-MM-dd');                    // "2024-01-15"
format(new Date(), 'dd/MM/yyyy HH:mm');              // "15/01/2024 14:30"
format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });  // "segunda-feira, 15 de janeiro"

// Manipulação
const tomorrow = addDays(new Date(), 1);
const lastWeek = subDays(new Date(), 7);

// Comparação
const days = differenceInDays(endDate, startDate);
const isExpired = isAfter(new Date(), expirationDate);

// Períodos
const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(new Date());

// Parse
const date = parseISO('2024-01-15T14:30:00Z');
```

**Uso no Sistema**:
```typescript
// Relatório de CMV mensal
const startDate = startOfMonth(new Date());
const endDate = endOfMonth(new Date());

const cmvPeriod = await cmvService.calculatePeriod(startDate, endDate);

// Verificar expiração de ingrediente
const isExpiringSoon = (expirationDate: Date) => {
  const daysUntilExpiration = differenceInDays(expirationDate, new Date());
  return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
};

// Formatar data para exibição
const formatOrderDate = (date: Date) => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};
```

### uuid (13.0.0)

**Função**: Geração de UUIDs (Universally Unique Identifiers) versão 4.

**Características**:
- **Único**: Probabilidade de colisão praticamente zero
- **Aleatório**: UUID v4 usa números aleatórios
- **Formato**: `550e8400-e29b-41d4-a716-446655440000`

**Uso**:
```typescript
import { v4 as uuid } from 'uuid';

// Gerar ID único
const userId = uuid();  // "550e8400-e29b-41d4-a716-446655440000"

// Uso em modelos Prisma
model User {
  id String @id @default(uuid())
  // ...
}

// Gerar nome único para arquivo
const filename = `${uuid()}.jpg`;
```

### validator (13.11.0)

**Função**: Validação e sanitização de strings.

**Validações Comuns**:
```typescript
import validator from 'validator';

// Email
validator.isEmail('user@example.com');  // true

// URL
validator.isURL('https://example.com');  // true

// CPF/CNPJ (com biblioteca adicional)
import { cpf, cnpj } from 'cpf-cnpj-validator';
cpf.isValid('123.456.789-00');
cnpj.isValid('12.345.678/0001-00');

// Telefone
validator.isMobilePhone('+5511999999999', 'pt-BR');

// Números
validator.isInt('123');
validator.isFloat('123.45');

// Datas
validator.isISO8601('2024-01-15T14:30:00Z');

// Sanitização
validator.escape('<script>alert("xss")</script>');  // Remove HTML
validator.trim('  texto  ');  // Remove espaços
validator.normalizeEmail('User@Example.COM');  // user@example.com
```

[↑ Voltar ao topo](#índice)

---


## Stack do Frontend

### Resumo das Tecnologias Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | 18.2.0 | Biblioteca UI component-based |
| Vite | 5.0.11 | Build tool com HMR instantâneo |
| TypeScript | 5.3.3 | Linguagem tipada |
| React Router | 6.21.0 | Roteamento client-side |
| TanStack Query | 5.17.0 | State management assíncrono |
| Axios | 1.6.5 | Cliente HTTP |
| TailwindCSS | 3.4.1 | Utility-first CSS framework |
| Headless UI | 2.2.9 | Componentes acessíveis |
| Lucide React | 0.552.0 | Biblioteca de ícones |
| Framer Motion | 12.23.24 | Animações |
| React Hook Form | 7.66.0 | Gerenciamento de formulários |
| Recharts | 3.3.0 | Gráficos e dashboards |
| Socket.IO Client | 4.6.0 | WebSocket para real-time |

### Arquitetura do Frontend

```
web-app/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/          # Componentes base (Button, Input, etc)
│   │   ├── forms/       # Formulários
│   │   └── layout/      # Layout components
│   ├── pages/           # Páginas da aplicação
│   │   ├── auth/        # Login, Register
│   │   ├── products/    # Gestão de produtos
│   │   ├── orders/      # Pedidos
│   │   └── dashboard/   # Dashboard
│   ├── hooks/           # Custom hooks
│   ├── services/        # API calls
│   ├── utils/           # Utilitários
│   ├── types/           # TypeScript types
│   └── app/             # Configuração (router, providers)
```

### Comunicação Frontend-Backend

```typescript
// Configuração Axios
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query para Cache

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Hook para buscar produtos
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data.data;
    },
    staleTime: 5 * 60 * 1000  // 5 minutos
  });
};

// Hook para criar produto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: CreateProductDto) => {
      const { data } = await api.post('/products', product);
      return data.data;
    },
    onSuccess: () => {
      // Invalida cache de produtos
      queryClient.invalidateQueries(['products']);
    }
  });
};

// Uso em componente
function ProductList() {
  const { data: products, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

[↑ Voltar ao topo](#índice)

---

## Infraestrutura e Containerização

### Docker Compose

**Serviços Configurados**:

1. **PostgreSQL**: Banco de dados principal
2. **Redis**: Cache e sessões
3. **API**: Aplicação Node.js

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: restaurant-db
    environment:
      POSTGRES_USER: restaurant_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: restaurant_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U restaurant_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - restaurant-network

  redis:
    image: redis:7-alpine
    container_name: restaurant-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - restaurant-network

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: restaurant-api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://restaurant_user:${DB_PASSWORD}@postgres:5432/restaurant_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
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
    networks:
      - restaurant-network

volumes:
  postgres_data:
  redis_data:

networks:
  restaurant-network:
    driver: bridge
```

### Comandos Docker Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar serviços
docker-compose down

# Rebuild
docker-compose up -d --build

# Executar comando no container
docker-compose exec api npm run prisma:migrate

# Limpar volumes (CUIDADO!)
docker-compose down -v
```

### Variáveis de Ambiente

**Estrutura de .env**:
```bash
# Environment
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/restaurant_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"

# Logs
LOG_LEVEL="info"
```

[↑ Voltar ao topo](#índice)

---

## Resumo das Tecnologias

### Backend Core

| Tecnologia | Versão | Função | Por que escolhemos |
|------------|--------|--------|-------------------|
| Node.js | 20 LTS | Runtime JavaScript | Performance, ecossistema maduro, LTS até 2026 |
| TypeScript | 5.3.3 | Linguagem tipada | Type safety, melhor DX, refatoração segura |
| Express.js | 4.18.2 | Framework web | Minimalista, flexível, grande ecossistema |
| Prisma ORM | 5.7.0 | ORM type-safe | Queries type-safe, migrations automáticas |
| PostgreSQL | 16 | Banco de dados | ACID, performance, extensível |
| Redis | 7 | Cache e sessões | Extremamente rápido, estruturas de dados ricas |

### Segurança

| Tecnologia | Versão | Função |
|------------|--------|--------|
| jsonwebtoken | 9.0.2 | Autenticação JWT |
| bcrypt | 5.1.1 | Hash de senhas |
| helmet | 7.1.0 | Security headers |
| express-rate-limit | 7.1.5 | Rate limiting |
| cors | 2.8.5 | CORS |

### Validação e Utilitários

| Tecnologia | Versão | Função |
|------------|--------|--------|
| Zod | 3.22.4 | Validação de schemas |
| Winston | 3.11.0 | Logging estruturado |
| Multer | 1.4.5 | Upload de arquivos |
| date-fns | 4.1.0 | Manipulação de datas |
| uuid | 13.0.0 | Geração de UUIDs |
| validator | 13.11.0 | Validação de strings |

### Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| React | 18.2.0 | Biblioteca UI |
| Vite | 5.0.11 | Build tool |
| TailwindCSS | 3.4.1 | CSS framework |
| React Query | 5.17.0 | State management |
| React Router | 6.21.0 | Roteamento |
| Axios | 1.6.5 | Cliente HTTP |

### Desenvolvimento

| Tecnologia | Versão | Função |
|------------|--------|--------|
| ts-node-dev | 2.0.0 | Dev server com hot-reload |
| Jest | 29.7.0 | Framework de testes |
| ESLint | 8.56.0 | Linter |
| Prettier | 3.1.1 | Formatador de código |
| Supertest | 6.3.3 | Testes de API |

### Infraestrutura

| Tecnologia | Versão | Função |
|------------|--------|--------|
| Docker | Latest | Containerização |
| docker-compose | 3.8 | Orquestração local |

---

## Referências

### Documentação Oficial

- [Node.js](https://nodejs.org/docs/latest-v20.x/api/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/16/)
- [Redis](https://redis.io/docs/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

### Guias e Tutoriais

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React Patterns](https://reactpatterns.com/)

### Ferramentas

- [Prisma Studio](https://www.prisma.io/studio)
- [Swagger Editor](https://editor.swagger.io/)
- [Postman](https://www.postman.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Conclusão

Este documento apresentou uma visão completa e didática de todas as tecnologias, ferramentas e componentes que compõem o Restaurant API Core. Desde o runtime Node.js até a infraestrutura Docker, cada peça foi explicada com seu propósito, configuração e exemplos práticos.

O sistema utiliza tecnologias modernas e battle-tested, seguindo best practices da indústria para criar uma aplicação robusta, segura, escalável e de fácil manutenção.

Para mais informações sobre funcionalidades específicas, consulte a documentação técnica em `/docs` ou a documentação interativa da API em `/api/docs`.

[↑ Voltar ao topo](#índice)

---

**Última atualização**: Janeiro 2024  
**Versão do documento**: 1.0  
**Mantido por**: Equipe de Desenvolvimento
