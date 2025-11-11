# Design Document - Documentação Técnica do Sistema

## Overview

Este documento apresenta o design completo da documentação técnica do Restaurant API Core, um sistema backend robusto para gestão integrada de restaurantes. A documentação será estruturada em seções que cobrem desde o runtime e linguagens até infraestrutura e deployment, proporcionando uma visão clara e didática de como todas as peças do sistema funcionam e interagem.

O sistema utiliza uma arquitetura em camadas (layered architecture) com separação clara de responsabilidades, seguindo princípios SOLID e clean architecture. É construído com TypeScript sobre Node.js, utilizando Express.js como framework web, Prisma ORM para acesso a dados, PostgreSQL como banco principal e Redis para cache e sessões.

## Architecture

### Visão Geral da Arquitetura

```mermaid
graph TB
    Client[Cliente Web/Mobile]
    LB[Load Balancer/Nginx]
    API[Express API Server]
    Cache[Redis Cache]
    DB[(PostgreSQL)]
    Storage[File Storage]
    
    Client -->|HTTPS| LB
    LB -->|HTTP| API
    API -->|Query/Cache| Cache
    API -->|ORM Queries| DB
    API -->|Read/Write| Storage
    
    subgraph "Application Layer"
        API
    end
    
    subgraph "Data Layer"
        Cache
        DB
        Storage
    end
```

### Padrão Arquitetural: Layered Architecture

O sistema segue uma arquitetura em camadas com fluxo unidirecional:

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


## Components and Interfaces

### 1. Runtime e Linguagem

#### Node.js 20 LTS
- **Versão**: 20.x (Long Term Support)
- **Função**: Runtime JavaScript/TypeScript server-side
- **Características**:
  - Event-driven, non-blocking I/O
  - V8 JavaScript engine (Google Chrome)
  - Ideal para aplicações I/O intensive
  - Suporte nativo a ES Modules e CommonJS
- **Por que escolhemos**: Performance, ecossistema maduro, suporte LTS garantido até 2026

#### TypeScript 5.x
- **Versão**: 5.3.3
- **Função**: Superset tipado de JavaScript
- **Configuração** (tsconfig.json):
  ```json
  {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      // ... outros aliases
    }
  }
  ```
- **Benefícios**:
  - Type safety em tempo de desenvolvimento
  - IntelliSense e autocomplete
  - Refatoração segura
  - Documentação implícita via tipos
- **Path Aliases**: Simplificam imports (`@/services/user` em vez de `../../../services/user`)

### 2. Framework Web e Core

#### Express.js 4.x
- **Versão**: 4.18.2
- **Função**: Framework web minimalista e flexível
- **Características**:
  - Middleware-based architecture
  - Routing robusto
  - Suporte a múltiplos template engines
  - Grande ecossistema de plugins
- **Configuração no app.ts**:
  ```typescript
  const app = express();
  app.use(helmet());           // Security headers
  app.use(cors());             // Cross-origin requests
  app.use(express.json());     // JSON body parser
  app.use(compression());      // Response compression
  app.use(rateLimit());        // Rate limiting
  ```

#### Middlewares Essenciais

**helmet** (7.1.0)
- **Função**: Adiciona security headers HTTP
- **Headers configurados**:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS)
- **Configuração**:
  ```typescript
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  ```

**cors** (2.8.5)
- **Função**: Habilita Cross-Origin Resource Sharing
- **Configuração por ambiente**:
  ```typescript
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));
  ```

**compression** (1.7.4)
- **Função**: Comprime responses HTTP (gzip/deflate)
- **Benefícios**: Reduz bandwidth em ~70-80%
- **Configuração**: Level 6 (balanço entre velocidade e compressão)

**express-rate-limit** (7.1.5)
- **Função**: Limita requisições por IP
- **Configuração padrão**: 100 requisições por minuto
- **Proteção contra**: Brute force, DDoS, scraping

### 3. Camada de Persistência

#### PostgreSQL 16
- **Versão**: 16 (Alpine Linux no Docker)
- **Função**: Banco de dados relacional principal
- **Características**:
  - ACID compliant
  - Suporte a JSON/JSONB
  - Full-text search
  - Transações robustas
  - Índices avançados (B-tree, GiST, GIN)
- **Por que PostgreSQL**:
  - Open source e maduro
  - Performance excelente
  - Extensibilidade
  - Suporte a dados complexos

#### Prisma ORM 5.x
- **Versão**: 5.7.0
- **Função**: Object-Relational Mapping moderno
- **Componentes**:
  1. **Prisma Schema**: Define modelos de dados
  2. **Prisma Client**: Type-safe database client
  3. **Prisma Migrate**: Sistema de migrations
  4. **Prisma Studio**: GUI para visualizar dados

**Exemplo de Schema**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  
  roles     UserRole[]
  sessions  Session[]
  
  @@index([email])
  @@map("users")
}
```

**Vantagens do Prisma**:
- Type-safe queries (autocomplete completo)
- Migrations automáticas
- Relações intuitivas
- Performance otimizada
- Introspection de schemas existentes

**Comandos Principais**:
```bash
npx prisma generate      # Gera Prisma Client
npx prisma migrate dev   # Cria e aplica migration
npx prisma studio        # Abre GUI
npx prisma db push       # Push schema sem migration
```

#### Redis 7.x (ioredis)
- **Versão**: Redis 7 + ioredis 5.3.2
- **Função**: Cache em memória e gerenciamento de sessões
- **Características**:
  - In-memory data structure store
  - Suporte a strings, hashes, lists, sets, sorted sets
  - Pub/Sub para real-time
  - Persistência opcional (RDB/AOF)
- **Casos de uso no sistema**:
  - Cache de queries frequentes
  - Sessões de usuário (JWT blacklist)
  - Rate limiting
  - Filas de jobs (futuro)
- **Configuração**:
  ```typescript
  import Redis from 'ioredis';
  const redis = new Redis(process.env.REDIS_URL);
  ```

### 4. Segurança e Autenticação

#### JWT (jsonwebtoken 9.0.2)
- **Função**: Autenticação stateless via tokens
- **Estrutura do Token**:
  ```
  Header.Payload.Signature
  ```
- **Payload típico**:
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "roles": ["admin"],
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```
- **Configuração**:
  - Secret: Variável de ambiente `JWT_SECRET`
  - Expiração: 7 dias (configurável)
  - Algoritmo: HS256

#### bcrypt (5.1.1)
- **Função**: Hashing de senhas
- **Características**:
  - Algoritmo adaptativo (fica mais lento com hardware melhor)
  - Salt automático
  - Resistente a rainbow tables
- **Configuração**: 12 rounds em produção
- **Uso**:
  ```typescript
  const hash = await bcrypt.hash(password, 12);
  const isValid = await bcrypt.compare(password, hash);
  ```

#### Validator (13.11.0)
- **Função**: Validação e sanitização de strings
- **Validações comuns**:
  - Email
  - URLs
  - CPF/CNPJ
  - Números de telefone
  - Datas

### 5. Validação de Dados

#### Zod (3.22.4)
- **Função**: Schema validation com TypeScript-first
- **Características**:
  - Type inference automática
  - Validações compostas
  - Mensagens de erro customizáveis
  - Parse e transform
- **Exemplo**:
  ```typescript
  const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().optional()
  });
  
  type User = z.infer<typeof UserSchema>;
  ```
- **Integração**: Usado em controllers para validar request body


### 6. Logging e Monitoramento

#### Winston (3.11.0)
- **Função**: Logging estruturado e flexível
- **Níveis de log**:
  - error: Erros críticos
  - warn: Avisos
  - info: Informações gerais
  - http: Requisições HTTP
  - debug: Debugging detalhado
- **Transports configurados**:
  1. Console (desenvolvimento)
  2. File: combined.log (todos os logs)
  3. File: error.log (apenas erros)
- **Formato**:
  ```typescript
  {
    timestamp: '2024-01-15T10:30:00.000Z',
    level: 'info',
    message: 'User logged in',
    userId: 'uuid',
    ip: '192.168.1.1'
  }
  ```
- **Benefícios**:
  - Logs estruturados (JSON)
  - Múltiplos destinos
  - Rotação de arquivos
  - Integração com serviços externos (Datadog, Sentry)

### 7. Upload de Arquivos

#### Multer (1.4.5-lts.1)
- **Função**: Middleware para upload de arquivos multipart/form-data
- **Configuração**:
  ```typescript
  const upload = multer({
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${uuid()}.${ext(file.originalname)}`;
        cb(null, uniqueName);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    }
  });
  ```
- **Casos de uso**:
  - Fotos de produtos
  - Logos de estabelecimentos
  - Fotos de perfil de usuários

### 8. Utilitários

#### date-fns (4.1.0)
- **Função**: Manipulação de datas moderna e funcional
- **Vantagens sobre moment.js**:
  - Modular (tree-shakeable)
  - Imutável
  - TypeScript nativo
  - Menor bundle size
- **Funções comuns**:
  ```typescript
  import { format, addDays, differenceInDays } from 'date-fns';
  
  format(new Date(), 'yyyy-MM-dd');
  addDays(new Date(), 7);
  differenceInDays(endDate, startDate);
  ```

#### uuid (13.0.0)
- **Função**: Geração de UUIDs (v4)
- **Uso**: IDs únicos para entidades
- **Formato**: `550e8400-e29b-41d4-a716-446655440000`

### 9. Documentação da API

#### Swagger (swagger-jsdoc 6.2.8 + swagger-ui-express 5.0.0)
- **Função**: Documentação interativa da API REST
- **Características**:
  - Documentação OpenAPI 3.0
  - Interface interativa para testar endpoints
  - Geração automática a partir de JSDoc
- **Acesso**: `http://localhost:3000/api/docs`
- **Exemplo de documentação**:
  ```typescript
  /**
   * @swagger
   * /api/v1/users:
   *   get:
   *     summary: Lista todos os usuários
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de usuários
   */
  ```

### 10. Ferramentas de Desenvolvimento

#### ts-node-dev (2.0.0)
- **Função**: Execução de TypeScript com hot-reload
- **Características**:
  - Restart automático ao detectar mudanças
  - Transpilação rápida (sem type checking completo)
  - Ideal para desenvolvimento
- **Comando**: `npm run dev`
- **Configuração**:
  ```json
  "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/server.ts"
  ```

#### tsconfig-paths (4.2.0)
- **Função**: Resolve path aliases do TypeScript em runtime
- **Necessário para**: ts-node-dev reconhecer `@/` imports

### 11. Qualidade de Código

#### ESLint (8.56.0)
- **Função**: Linter para identificar problemas no código
- **Plugins**:
  - @typescript-eslint/eslint-plugin
  - @typescript-eslint/parser
  - eslint-plugin-prettier
- **Regras principais**:
  - no-unused-vars
  - no-console (warn)
  - @typescript-eslint/no-explicit-any
- **Comandos**:
  ```bash
  npm run lint        # Verifica código
  npm run lint:fix    # Corrige automaticamente
  ```

#### Prettier (3.1.1)
- **Função**: Formatador de código opinativo
- **Configuração** (.prettierrc):
  ```json
  {
    "semi": true,
    "trailingComma": "all",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```
- **Integração**: ESLint + Prettier via eslint-config-prettier

#### Jest (29.7.0)
- **Função**: Framework de testes
- **Características**:
  - Test runner
  - Assertions
  - Mocking
  - Coverage reports
- **Tipos de testes**:
  1. **Unit**: Testam funções isoladas
  2. **Integration**: Testam interação entre camadas
  3. **E2E**: Testam fluxos completos
- **Configuração**:
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };
  ```
- **Comandos**:
  ```bash
  npm test              # Roda todos os testes
  npm run test:watch    # Watch mode
  npm run test:e2e      # Testes E2E
  ```

#### Supertest (6.3.3)
- **Função**: Testes de API HTTP
- **Uso**: Simula requisições HTTP para testar endpoints
- **Exemplo**:
  ```typescript
  import request from 'supertest';
  import app from '@/app';
  
  describe('GET /api/v1/users', () => {
    it('should return 200', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
  });
  ```


### 12. Frontend Stack (web-app)

#### React 18.2.0
- **Função**: Biblioteca para construção de interfaces
- **Características**:
  - Component-based architecture
  - Virtual DOM
  - Hooks para gerenciamento de estado
  - Concurrent rendering
- **Por que React**: Ecossistema maduro, performance, comunidade ativa

#### Vite 5.0.11
- **Função**: Build tool e dev server
- **Vantagens sobre Webpack/CRA**:
  - Hot Module Replacement (HMR) instantâneo
  - Build otimizado com Rollup
  - Configuração mínima
  - Suporte nativo a TypeScript
- **Comando dev**: `npm run dev` (porta 5173)

#### React Router DOM 6.21.0
- **Função**: Roteamento client-side
- **Características**:
  - Nested routes
  - Lazy loading de componentes
  - Protected routes
  - URL parameters e query strings
- **Exemplo**:
  ```typescript
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetail />} />
    </Route>
  </Routes>
  ```

#### TanStack Query (React Query) 5.17.0
- **Função**: Gerenciamento de estado assíncrono e cache
- **Características**:
  - Cache automático de queries
  - Refetch em background
  - Optimistic updates
  - Infinite queries
  - Mutations com invalidação
- **Exemplo**:
  ```typescript
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
  
  const mutation = useMutation({
    mutationFn: (product) => api.post('/products', product),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });
  ```
- **Benefícios**:
  - Elimina necessidade de Redux para dados do servidor
  - Cache inteligente
  - Menos código boilerplate

#### Axios 1.6.5
- **Função**: Cliente HTTP
- **Configuração**:
  ```typescript
  const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
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
  ```

#### TailwindCSS 3.4.1
- **Função**: Utility-first CSS framework
- **Características**:
  - Classes utilitárias
  - Design system consistente
  - Purge automático (remove CSS não usado)
  - Responsive design fácil
- **Exemplo**:
  ```tsx
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Salvar
  </button>
  ```
- **Configuração** (tailwind.config.js):
  ```javascript
  module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981'
        }
      }
    }
  };
  ```

#### Headless UI 2.2.9
- **Função**: Componentes acessíveis sem estilo
- **Componentes**:
  - Dialog (modals)
  - Menu (dropdowns)
  - Listbox (select customizado)
  - Combobox (autocomplete)
  - Tabs, Disclosure, etc.
- **Vantagens**:
  - Acessibilidade (ARIA) built-in
  - Keyboard navigation
  - Focus management
  - Integração perfeita com Tailwind

#### Lucide React 0.552.0
- **Função**: Biblioteca de ícones
- **Características**:
  - 1000+ ícones
  - Tree-shakeable
  - Customizável (size, color, stroke)
- **Uso**:
  ```tsx
  import { User, ShoppingCart, Settings } from 'lucide-react';
  
  <User size={24} color="#3B82F6" />
  ```

#### Framer Motion 12.23.24
- **Função**: Biblioteca de animações
- **Características**:
  - Animações declarativas
  - Gestures (drag, hover, tap)
  - Layout animations
  - Variants para animações complexas
- **Exemplo**:
  ```tsx
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    Conteúdo
  </motion.div>
  ```

#### React Hook Form 7.66.0
- **Função**: Gerenciamento de formulários
- **Vantagens**:
  - Performance (menos re-renders)
  - Validação integrada (Zod, Yup)
  - API simples
  - TypeScript support
- **Exemplo**:
  ```tsx
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(UserSchema)
  });
  
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('email')} />
    {errors.email && <span>{errors.email.message}</span>}
  </form>
  ```

#### Recharts 3.3.0
- **Função**: Biblioteca de gráficos
- **Tipos de gráficos**:
  - Line, Bar, Area, Pie
  - Composed charts
  - Responsive
- **Uso**: Dashboard com métricas de vendas, CMV, estoque

#### Socket.IO Client 4.6.0
- **Função**: WebSocket client para comunicação real-time
- **Casos de uso**:
  - Notificações em tempo real
  - Atualização de pedidos
  - Status de comandas
- **Integração com backend**: Socket.IO server no Express

#### DnD Kit 6.3.1
- **Função**: Drag and drop acessível
- **Componentes**:
  - @dnd-kit/core: Core functionality
  - @dnd-kit/sortable: Listas ordenáveis
- **Uso**: Reordenação de categorias, produtos, etc.


### 13. Infraestrutura e Containerização

#### Docker
- **Função**: Containerização da aplicação
- **Componentes**:
  1. **Dockerfile**: Define imagem da aplicação
  2. **docker-compose.yml**: Orquestra múltiplos containers

**Dockerfile (Multi-stage build)**:
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**docker-compose.yml (Desenvolvimento)**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: restaurant_user
      POSTGRES_PASSWORD: dev_password
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

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  api:
    build: .
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://restaurant_user:dev_password@postgres:5432/restaurant_dev
      REDIS_URL: redis://redis:6379
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
  postgres_data:
  redis_data:
```

**Benefícios do Docker**:
- Ambiente consistente (dev = prod)
- Isolamento de dependências
- Fácil setup para novos desenvolvedores
- Escalabilidade horizontal

#### Variáveis de Ambiente

**Estrutura de .env**:
```bash
# Environment
NODE_ENV=development|production|staging

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/shadow"

# Redis
REDIS_URL="redis://host:6379"

# JWT
JWT_SECRET="secret-key"
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
LOG_LEVEL="info|debug|error"
```

**Gestão por Ambiente**:
- `.env.development`: Desenvolvimento local
- `.env.production`: Produção
- `.env.staging`: Staging
- `.env.example`: Template (commitado no git)

### 14. Estrutura de Diretórios

```
restaurant-api-core/
├── src/
│   ├── config/              # Configurações (database, redis, jwt)
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── jwt.ts
│   ├── controllers/         # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── ...
│   ├── services/            # Lógica de negócio
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── ...
│   ├── repositories/        # Acesso a dados
│   │   ├── user.repository.ts
│   │   ├── product.repository.ts
│   │   └── ...
│   ├── models/              # Types e Zod schemas
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   └── ...
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/              # Definição de rotas
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   └── ...
│   ├── utils/               # Utilitários
│   │   ├── logger.ts
│   │   ├── cache.ts
│   │   └── errors.ts
│   ├── __tests__/           # Testes
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Entry point
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   ├── migrations/          # Histórico de migrations
│   └── seed.ts              # Dados iniciais
├── web-app/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── uploads/                 # Arquivos enviados
├── logs/                    # Logs da aplicação
├── docs/                    # Documentação
├── scripts/                 # Scripts utilitários
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```


## Data Models

### Principais Entidades do Sistema

#### 1. User (Usuário)
```prisma
model User {
  id                     String    @id @default(uuid())
  email                  String
  password               String    // bcrypt hash
  name                   String
  phone                  String?
  photo                  String?
  establishmentId        String
  isActive               Boolean   @default(true)
  
  // 2FA
  twoFactorEnabled       Boolean   @default(false)
  twoFactorSecret        String?
  backupCodes            String[]
  
  // Security
  failedLoginAttempts    Int       @default(0)
  lockedUntil            DateTime?
  lastLoginAt            DateTime?
  
  // Relações
  establishment          Establishment @relation(...)
  roles                  UserRole[]
  sessions               Session[]
  
  @@unique([email, establishmentId])
  @@index([email])
}
```

**Características**:
- Multi-tenant (por estabelecimento)
- 2FA opcional
- Bloqueio por tentativas falhas
- Auditoria de login

#### 2. Role & Permission (RBAC)
```prisma
model Role {
  id              String   @id @default(uuid())
  name            String
  description     String?
  isSystem        Boolean  @default(false)
  parentRoleId    String?  // Hierarquia de roles
  establishmentId String?
  
  parentRole      Role?    @relation("RoleHierarchy", ...)
  childRoles      Role[]   @relation("RoleHierarchy")
  permissions     RolePermission[]
  users           UserRole[]
}

model Permission {
  id          String   @id @default(uuid())
  resource    String   // 'products', 'users', 'orders'
  action      String   // 'create', 'read', 'update', 'delete'
  description String?
  conditions  Json?    // Condições adicionais
  
  roles       RolePermission[]
}
```

**Sistema RBAC**:
- Roles hierárquicos (admin > manager > waiter)
- Permissions granulares por recurso e ação
- Delegação temporária de permissões
- Roles de sistema (não editáveis)

#### 3. Product & Category
```prisma
model Product {
  id              String   @id @default(uuid())
  name            String
  description     String?
  price           Decimal  @db.Decimal(10, 2)
  categoryId      String
  recipeId        String?
  suggestedPrice  Decimal?
  targetMargin    Decimal?
  currentMargin   Decimal?
  imageUrl        String?
  isActive        Boolean  @default(true)
  
  category        Category @relation(...)
  recipe          Recipe?  @relation(...)
  ingredients     ProductIngredient[]
  orderItems      OrderItem[]
}

model Category {
  id           String    @id @default(uuid())
  name         String    @unique
  displayOrder Int
  isActive     Boolean   @default(true)
  
  products     Product[]
}
```

**Características**:
- Produtos com receitas (manufaturados)
- Cálculo automático de margens
- Categorização para organização
- Controle de disponibilidade

#### 4. Ingredient & Stock
```prisma
model Ingredient {
  id              String    @id @default(uuid())
  name            String
  barcode         String?
  sku             String?
  unit            String    // 'kg', 'L', 'un'
  currentQuantity Decimal   @db.Decimal(10, 3)
  minimumQuantity Decimal   @db.Decimal(10, 3)
  averageCost     Decimal   @db.Decimal(10, 2)
  supplier        String?
  status          String    @default("normal")
  
  products        ProductIngredient[]
  transactions    StockTransaction[]
}

model StockTransaction {
  id           String   @id @default(uuid())
  ingredientId String
  type         String   // 'purchase', 'usage', 'adjustment', 'waste'
  quantity     Decimal
  unitCost     Decimal?
  totalValue   Decimal?
  reason       String?
  userId       String
  createdAt    DateTime @default(now())
}
```

**Gestão de Estoque**:
- Rastreamento de movimentações
- Alertas de estoque mínimo
- Custo médio ponderado
- Auditoria completa

#### 5. CashRegister & CashSession
```prisma
model CashRegister {
  id              String        @id @default(uuid())
  number          Int
  name            String
  establishmentId String
  isActive        Boolean       @default(true)
  
  sessions        CashSession[]
}

model CashSession {
  id                String              @id @default(uuid())
  cashRegisterId    String
  operatorId        String
  openingAmount     Decimal
  expectedAmount    Decimal?
  countedAmount     Decimal?
  difference        Decimal?
  status            CashSessionStatus
  openedAt          DateTime
  closedAt          DateTime?
  
  transactions      CashTransaction[]
  counts            CashCount[]
}

enum CashSessionStatus {
  OPEN
  CLOSED
  TRANSFERRED
  RECEIVED
  REOPENED
}
```

**Gestão de Caixa**:
- Múltiplos caixas por estabelecimento
- Abertura/fechamento com contagem
- Transferência para tesouraria
- Sangrias e suprimentos

#### 6. Command & Order
```prisma
model Command {
  id             String    @id @default(uuid())
  code           String    @unique
  tableId        String?
  type           String    @default("table")
  waiterId       String
  numberOfPeople Int
  status         String    @default("open")
  subtotal       Decimal
  serviceCharge  Decimal
  total          Decimal
  openedAt       DateTime
  closedAt       DateTime?
  
  table          Table?    @relation(...)
  waiter         User      @relation(...)
  orders         Order[]
}

model Order {
  id                 String    @id @default(uuid())
  commandId          String
  orderNumber        Int
  status             String    @default("pending")
  subtotal           Decimal
  createdBy          String
  
  command            Command   @relation(...)
  items              OrderItem[]
}
```

**Gestão de Comandas**:
- Comandas de mesa ou balcão
- Múltiplos pedidos por comanda
- Rastreamento de status
- Taxa de serviço configurável

#### 7. Recipe & CMV
```prisma
model Recipe {
  id              String   @id @default(uuid())
  name            String
  category        String
  yield           Decimal
  yieldUnit       String
  totalCost       Decimal
  costPerPortion  Decimal
  
  ingredients     RecipeIngredient[]
  products        Product[]
}

model CMVPeriod {
  id                      String    @id @default(uuid())
  startDate               DateTime
  endDate                 DateTime
  type                    String    // 'daily', 'weekly', 'monthly'
  status                  String    @default("open")
  openingStock            Decimal
  purchases               Decimal
  closingStock            Decimal
  cmv                     Decimal
  revenue                 Decimal
  cmvPercentage           Decimal
  
  products                CMVProduct[]
}
```

**Cálculo de CMV**:
- Fórmula: CMV = Estoque Inicial + Compras - Estoque Final
- Períodos configuráveis
- CMV por produto
- Análise de margem


## Error Handling

### Estratégia de Tratamento de Erros

#### 1. Hierarquia de Erros Customizados

```typescript
// Base Error
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

// Erros Específicos
class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(401, message);
  }
}

class ForbiddenError extends AppError {
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

#### 2. Error Middleware

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Erro operacional (esperado)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Registro duplicado'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
    }
  }

  // Erro de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors
    });
  }

  // Erro não tratado (crítico)
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
};
```

#### 3. Try-Catch Pattern

```typescript
// Controller
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.findById(id);
    
    if (!product) {
      throw new NotFoundError('Produto');
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error); // Passa para error middleware
  }
};
```

### Códigos de Status HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Sucesso geral |
| 201 | Created | Recurso criado |
| 204 | No Content | Sucesso sem retorno |
| 400 | Bad Request | Validação falhou |
| 401 | Unauthorized | Não autenticado |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não existe |
| 409 | Conflict | Conflito (duplicado) |
| 422 | Unprocessable Entity | Lógica de negócio falhou |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro não tratado |
| 503 | Service Unavailable | Serviço indisponível |

## Testing Strategy

### Pirâmide de Testes

```
        /\
       /  \
      / E2E \      ← Poucos, lentos, alto valor
     /--------\
    /Integration\ ← Médio número, médio tempo
   /--------------\
  /   Unit Tests   \ ← Muitos, rápidos, baixo custo
 /------------------\
```

### 1. Testes Unitários

**Objetivo**: Testar funções isoladas

**Exemplo**:
```typescript
// user.service.test.ts
describe('UserService', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Test123!';
      const hash = await userService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });
  });
  
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(userService.validateEmail('test@example.com')).toBe(true);
    });
    
    it('should return false for invalid email', () => {
      expect(userService.validateEmail('invalid')).toBe(false);
    });
  });
});
```

### 2. Testes de Integração

**Objetivo**: Testar interação entre camadas

**Exemplo**:
```typescript
// product.integration.test.ts
describe('Product API Integration', () => {
  let token: string;
  
  beforeAll(async () => {
    // Setup: criar usuário e fazer login
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123!' });
    
    token = response.body.token;
  });
  
  describe('POST /api/v1/products', () => {
    it('should create product with valid data', async () => {
      const productData = {
        name: 'Pizza Margherita',
        price: 35.90,
        categoryId: 'uuid-category'
      };
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send(productData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(productData);
    });
    
    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' }); // Nome vazio
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test' });
      
      expect(response.status).toBe(401);
    });
  });
});
```

### 3. Testes E2E

**Objetivo**: Testar fluxos completos

**Exemplo**:
```typescript
// order-flow.e2e.test.ts
describe('Order Flow E2E', () => {
  it('should complete full order flow', async () => {
    // 1. Login como garçom
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'waiter@test.com', password: 'Test123!' });
    
    const token = loginRes.body.token;
    
    // 2. Abrir comanda
    const commandRes = await request(app)
      .post('/api/v1/commands')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tableId: 'table-uuid',
        numberOfPeople: 4
      });
    
    const commandId = commandRes.body.data.id;
    expect(commandRes.status).toBe(201);
    
    // 3. Adicionar pedido
    const orderRes = await request(app)
      .post(`/api/v1/commands/${commandId}/orders`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { productId: 'product-uuid', quantity: 2 }
        ]
      });
    
    expect(orderRes.status).toBe(201);
    
    // 4. Fechar comanda
    const closeRes = await request(app)
      .post(`/api/v1/commands/${commandId}/close`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentMethod: 'CASH'
      });
    
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.data.status).toBe('closed');
  });
});
```

### Mocking

**Prisma Mock**:
```typescript
import { mockDeep, mockReset } from 'jest-mock-extended';
import prisma from '@/config/database';

jest.mock('@/config/database', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

// Uso
prismaMock.user.findUnique.mockResolvedValue({
  id: 'uuid',
  email: 'test@example.com',
  name: 'Test User'
});
```

### Coverage

**Configuração Jest**:
```javascript
coverageThreshold: {
  global: {
    branches: 70,    // 70% das branches
    functions: 80,   // 80% das funções
    lines: 80,       // 80% das linhas
    statements: 80   // 80% dos statements
  }
}
```

**Comando**: `npm test -- --coverage`


## Fluxo de Requisição Completo

### Diagrama de Sequência

```mermaid
sequenceDiagram
    participant C as Cliente
    participant M as Middlewares
    participant R as Route
    participant Ctrl as Controller
    participant S as Service
    participant Repo as Repository
    participant DB as Database
    participant Cache as Redis

    C->>M: HTTP Request
    M->>M: Rate Limit Check
    M->>M: CORS Validation
    M->>M: Body Parsing
    M->>M: JWT Verification
    M->>M: Permission Check
    
    M->>R: Validated Request
    R->>R: Zod Schema Validation
    R->>Ctrl: Call Controller
    
    Ctrl->>S: Call Service Method
    
    S->>Cache: Check Cache
    alt Cache Hit
        Cache-->>S: Return Cached Data
    else Cache Miss
        S->>Repo: Query Data
        Repo->>DB: Prisma Query
        DB-->>Repo: Return Data
        Repo-->>S: Return Entity
        S->>Cache: Store in Cache
    end
    
    S-->>Ctrl: Return Result
    Ctrl->>Ctrl: Format Response
    Ctrl-->>C: JSON Response
```

### Exemplo Prático: GET /api/v1/products/:id

#### 1. Route Definition
```typescript
// src/routes/product.routes.ts
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/permission.middleware';
import { getProduct } from '@/controllers/product.controller';

const router = Router();

router.get(
  '/:id',
  authenticate,                          // Verifica JWT
  authorize('products', 'read'),         // Verifica permissão
  getProduct                             // Controller
);

export default router;
```

#### 2. Controller
```typescript
// src/controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { productService } from '@/services/product.service';
import { NotFoundError } from '@/utils/errors';

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Chama service
    const product = await productService.findById(id);
    
    if (!product) {
      throw new NotFoundError('Produto');
    }
    
    // Retorna resposta padronizada
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error); // Passa para error middleware
  }
};
```

#### 3. Service
```typescript
// src/services/product.service.ts
import { productRepository } from '@/repositories/product.repository';
import { cacheService } from '@/utils/cache';

class ProductService {
  async findById(id: string) {
    // Tenta buscar do cache
    const cacheKey = `product:${id}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Busca do banco
    const product = await productRepository.findById(id);
    
    if (product) {
      // Armazena no cache (5 minutos)
      await cacheService.set(cacheKey, JSON.stringify(product), 300);
    }
    
    return product;
  }
  
  async calculateMargin(productId: string) {
    const product = await this.findById(productId);
    
    if (!product.recipe) {
      return null;
    }
    
    const cost = await this.calculateCost(product.recipe.id);
    const margin = ((product.price - cost) / product.price) * 100;
    
    return {
      cost,
      price: product.price,
      margin,
      markup: ((product.price - cost) / cost) * 100
    };
  }
}

export const productService = new ProductService();
```

#### 4. Repository
```typescript
// src/repositories/product.repository.ts
import prisma from '@/config/database';

class ProductRepository {
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        },
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });
  }
  
  async findAll(filters?: {
    categoryId?: string;
    isActive?: boolean;
    search?: string;
  }) {
    return prisma.product.findMany({
      where: {
        categoryId: filters?.categoryId,
        isActive: filters?.isActive,
        name: filters?.search ? {
          contains: filters.search,
          mode: 'insensitive'
        } : undefined
      },
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
  
  async create(data: CreateProductDto) {
    return prisma.product.create({
      data,
      include: {
        category: true
      }
    });
  }
  
  async update(id: string, data: UpdateProductDto) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });
  }
  
  async delete(id: string) {
    return prisma.product.delete({
      where: { id }
    });
  }
}

export const productRepository = new ProductRepository();
```

### Middlewares em Detalhe

#### Authentication Middleware
```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/utils/errors';
import { userRepository } from '@/repositories/user.repository';

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
    
    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    
    // Busca usuário
    const user = await userRepository.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuário inválido');
    }
    
    // Adiciona usuário ao request
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Token inválido'));
    } else {
      next(error);
    }
  }
};
```

#### Authorization Middleware
```typescript
// src/middlewares/permission.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@/utils/errors';
import { permissionService } from '@/services/permission.service';

export const authorize = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      
      // Verifica se usuário tem permissão
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

### Cache Strategy

#### Cache Service
```typescript
// src/utils/cache.ts
import redis from '@/config/redis';
import logger from '@/utils/logger';

class CacheService {
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }
  
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache del error:', error);
    }
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidate error:', error);
    }
  }
}

export const cacheService = new CacheService();
```

#### Cache Invalidation
```typescript
// Exemplo: ao atualizar produto, invalida cache
async updateProduct(id: string, data: UpdateProductDto) {
  const product = await productRepository.update(id, data);
  
  // Invalida cache do produto específico
  await cacheService.del(`product:${id}`);
  
  // Invalida lista de produtos
  await cacheService.invalidatePattern('products:*');
  
  return product;
}
```


## Deployment e Produção

### Ambientes

#### 1. Desenvolvimento (Local)
```bash
# Iniciar com Docker
docker-compose up -d

# Ou sem Docker
npm run dev

# Acesso
- API: http://localhost:3000
- Docs: http://localhost:3000/api/docs
- Frontend: http://localhost:5173
- Prisma Studio: npx prisma studio
```

#### 2. Staging
```bash
# Build
npm run build

# Migrations
npm run prisma:migrate:prod

# Start
NODE_ENV=staging npm run start:prod
```

#### 3. Produção
```bash
# Build otimizado
npm run build

# Deploy migrations
npm run prisma:migrate:prod

# Start com PM2
pm2 start dist/server.js --name restaurant-api -i max

# Ou com Docker
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline (Exemplo GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t restaurant-api:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push restaurant-api:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app/restaurant-api
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T api npm run prisma:migrate:prod
```

### Monitoramento e Observabilidade

#### Health Checks
```typescript
// src/app.ts
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

#### Métricas (Prometheus - Exemplo)
```typescript
import promClient from 'prom-client';

// Registrar métricas padrão
promClient.collectDefaultMetrics();

// Métricas customizadas
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

#### Logging em Produção
```typescript
// src/utils/logger.ts
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
    // Console
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
      maxsize: 5242880, // 5MB
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

// Em produção, pode adicionar transports para serviços externos
if (process.env.NODE_ENV === 'production') {
  // Exemplo: Datadog
  // logger.add(new DatadogTransport({ apiKey: process.env.DATADOG_API_KEY }));
  
  // Exemplo: Sentry
  // logger.add(new SentryTransport({ dsn: process.env.SENTRY_DSN }));
}

export default logger;
```

### Graceful Shutdown

```typescript
// src/server.ts
const gracefulShutdown = async () => {
  logger.info('🛑 Iniciando graceful shutdown...');

  // Para de aceitar novas conexões
  server.close(() => {
    logger.info('✅ Servidor HTTP fechado');
  });

  // Aguarda requisições em andamento (max 30s)
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Fecha conexões com banco
  await prisma.$disconnect();
  logger.info('✅ Prisma desconectado');

  // Fecha conexão com Redis
  await redis.quit();
  logger.info('✅ Redis desconectado');

  logger.info('✅ Shutdown completo');
  process.exit(0);
};

// Sinais de shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  gracefulShutdown();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});
```

### Otimizações de Performance

#### 1. Database Connection Pooling
```typescript
// Prisma já gerencia pool automaticamente
// Configuração via DATABASE_URL
// postgresql://user:pass@host:5432/db?connection_limit=10
```

#### 2. Redis Connection Pooling
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});
```

#### 3. Compression
```typescript
// Já configurado no app.ts
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Balanço entre velocidade e compressão
}));
```

#### 4. Query Optimization
```typescript
// Usar select para buscar apenas campos necessários
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
    // Não busca password, phone, etc.
  }
});

// Usar índices apropriados (definidos no schema)
@@index([email])
@@index([establishmentId, isActive])

// Paginação
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit
});
```

### Segurança em Produção

#### Checklist de Segurança

- [x] HTTPS obrigatório
- [x] Helmet para security headers
- [x] Rate limiting configurado
- [x] CORS restrito por domínio
- [x] JWT com secret forte
- [x] Senhas com bcrypt (12 rounds)
- [x] Validação de input (Zod)
- [x] SQL injection protection (Prisma)
- [x] XSS protection (sanitização)
- [x] CSRF tokens (se necessário)
- [x] Logs de auditoria
- [x] Variáveis de ambiente seguras
- [x] Dependências atualizadas
- [x] Secrets não commitados

#### Variáveis de Ambiente Sensíveis

```bash
# NUNCA commitar
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="..."

# Usar serviços de secrets management
# - AWS Secrets Manager
# - HashiCorp Vault
# - Kubernetes Secrets
```


## Diagramas Arquiteturais

### 1. Arquitetura de Alto Nível

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application<br/>React + Vite]
        Mobile[Mobile App<br/>Future]
    end
    
    subgraph "API Gateway"
        LB[Load Balancer<br/>Nginx/ALB]
    end
    
    subgraph "Application Layer"
        API1[API Server 1<br/>Express + TypeScript]
        API2[API Server 2<br/>Express + TypeScript]
        API3[API Server N<br/>Express + TypeScript]
    end
    
    subgraph "Cache Layer"
        Redis[(Redis<br/>Cache & Sessions)]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary Database)]
        PGReplica[(PostgreSQL<br/>Read Replica)]
    end
    
    subgraph "Storage Layer"
        S3[Object Storage<br/>S3/MinIO]
    end
    
    subgraph "Monitoring"
        Logs[Logs<br/>Winston]
        Metrics[Metrics<br/>Prometheus]
        APM[APM<br/>Datadog/Sentry]
    end
    
    WebApp -->|HTTPS| LB
    Mobile -->|HTTPS| LB
    LB -->|HTTP| API1
    LB -->|HTTP| API2
    LB -->|HTTP| API3
    
    API1 -->|Query| Redis
    API2 -->|Query| Redis
    API3 -->|Query| Redis
    
    API1 -->|Write| PG
    API2 -->|Write| PG
    API3 -->|Write| PG
    
    API1 -->|Read| PGReplica
    API2 -->|Read| PGReplica
    API3 -->|Read| PGReplica
    
    PG -->|Replication| PGReplica
    
    API1 -->|Upload| S3
    API2 -->|Upload| S3
    API3 -->|Upload| S3
    
    API1 -->|Logs| Logs
    API1 -->|Metrics| Metrics
    API1 -->|Errors| APM
```

### 2. Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as Database
    participant R as Redis
    
    U->>F: Enter credentials
    F->>A: POST /api/v1/auth/login
    A->>DB: Find user by email
    DB-->>A: User data
    A->>A: Verify password (bcrypt)
    
    alt Password valid
        A->>A: Generate JWT token
        A->>DB: Update lastLoginAt
        A->>DB: Create session record
        A->>R: Store session in cache
        A-->>F: Return token + user data
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    else Password invalid
        A->>DB: Increment failedLoginAttempts
        alt Too many attempts
            A->>DB: Set lockedUntil
            A-->>F: Account locked error
        else
            A-->>F: Invalid credentials error
        end
        F-->>U: Show error message
    end
    
    Note over F,A: Subsequent requests
    F->>A: GET /api/v1/products<br/>Authorization: Bearer {token}
    A->>A: Verify JWT signature
    A->>R: Check if token blacklisted
    
    alt Token valid
        A->>DB: Execute query
        DB-->>A: Return data
        A-->>F: Return response
    else Token invalid/expired
        A-->>F: 401 Unauthorized
        F->>F: Clear token
        F-->>U: Redirect to login
    end
```

### 3. Estrutura de Camadas Detalhada

```mermaid
graph LR
    subgraph "Presentation Layer"
        Routes[Routes<br/>Endpoint definitions]
    end
    
    subgraph "Application Layer"
        Controllers[Controllers<br/>HTTP handlers]
        Middlewares[Middlewares<br/>Auth, Validation, etc]
    end
    
    subgraph "Business Layer"
        Services[Services<br/>Business logic]
    end
    
    subgraph "Data Access Layer"
        Repositories[Repositories<br/>Data operations]
    end
    
    subgraph "Infrastructure Layer"
        Prisma[Prisma ORM]
        Redis[Redis Client]
        Storage[File Storage]
    end
    
    subgraph "External Layer"
        DB[(PostgreSQL)]
        Cache[(Redis)]
        Files[(S3/Local)]
    end
    
    Routes --> Middlewares
    Middlewares --> Controllers
    Controllers --> Services
    Services --> Repositories
    Repositories --> Prisma
    Repositories --> Redis
    Repositories --> Storage
    Prisma --> DB
    Redis --> Cache
    Storage --> Files
```

### 4. Modelo de Dados Simplificado

```mermaid
erDiagram
    User ||--o{ UserRole : has
    User ||--o{ Session : has
    User ||--o{ Order : creates
    User ||--o{ CashSession : operates
    
    Role ||--o{ UserRole : assigned
    Role ||--o{ RolePermission : has
    Permission ||--o{ RolePermission : granted
    
    Establishment ||--o{ User : employs
    Establishment ||--o{ CashRegister : owns
    Establishment ||--o{ Table : has
    
    CashRegister ||--o{ CashSession : has
    CashSession ||--o{ CashTransaction : contains
    
    Table ||--o{ Command : serves
    Command ||--o{ Order : contains
    Order ||--o{ OrderItem : has
    
    Product ||--o{ OrderItem : ordered
    Product }o--|| Category : belongs
    Product }o--o| Recipe : has
    Product ||--o{ ProductIngredient : contains
    
    Recipe ||--o{ RecipeIngredient : contains
    Ingredient ||--o{ RecipeIngredient : used_in
    Ingredient ||--o{ ProductIngredient : used_in
    Ingredient ||--o{ StockTransaction : tracked
    
    CMVPeriod ||--o{ CMVProduct : analyzes
    Product ||--o{ CMVProduct : analyzed
```

### 5. Fluxo de Pedido Completo

```mermaid
stateDiagram-v2
    [*] --> CommandOpen: Waiter opens command
    
    CommandOpen --> OrderPending: Add order
    OrderPending --> OrderPreparing: Kitchen starts
    OrderPreparing --> OrderReady: Kitchen finishes
    OrderReady --> OrderDelivered: Waiter delivers
    
    OrderDelivered --> CommandOpen: Add more orders
    OrderDelivered --> CommandClosed: Close command
    
    OrderPending --> OrderCancelled: Cancel order
    OrderPreparing --> OrderCancelled: Cancel order
    
    CommandClosed --> PaymentProcessing: Process payment
    PaymentProcessing --> PaymentCompleted: Payment success
    PaymentProcessing --> PaymentFailed: Payment failed
    
    PaymentFailed --> PaymentProcessing: Retry
    PaymentCompleted --> StockUpdate: Update stock
    StockUpdate --> [*]
    
    OrderCancelled --> CommandOpen: Continue
```

### 6. Sistema de Cache

```mermaid
graph TB
    Request[HTTP Request]
    
    Request --> CheckCache{Cache Hit?}
    
    CheckCache -->|Yes| ReturnCache[Return Cached Data]
    CheckCache -->|No| QueryDB[Query Database]
    
    QueryDB --> StoreCache[Store in Cache<br/>TTL: 5-60 min]
    StoreCache --> ReturnData[Return Data]
    
    ReturnCache --> Response[HTTP Response]
    ReturnData --> Response
    
    Update[Data Update] --> InvalidateCache[Invalidate Cache]
    InvalidateCache --> QueryDB
    
    style CheckCache fill:#f9f,stroke:#333
    style ReturnCache fill:#9f9,stroke:#333
    style InvalidateCache fill:#f99,stroke:#333
```

### 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevLocal[Local Machine<br/>Docker Compose]
    end
    
    subgraph "CI/CD"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        Registry[Docker Registry]
    end
    
    subgraph "Staging"
        StagingServer[Staging Server<br/>Docker Swarm]
        StagingDB[(Staging DB)]
        StagingRedis[(Staging Redis)]
    end
    
    subgraph "Production"
        LB[Load Balancer]
        Prod1[API Server 1]
        Prod2[API Server 2]
        Prod3[API Server N]
        ProdDB[(Production DB<br/>Primary)]
        ProdDBReplica[(Production DB<br/>Replica)]
        ProdRedis[(Production Redis<br/>Cluster)]
        S3[Object Storage]
    end
    
    DevLocal -->|Push| GitHub
    GitHub -->|Trigger| Actions
    Actions -->|Build & Test| Actions
    Actions -->|Push Image| Registry
    
    Registry -->|Deploy| StagingServer
    StagingServer --> StagingDB
    StagingServer --> StagingRedis
    
    Registry -->|Deploy| LB
    LB --> Prod1
    LB --> Prod2
    LB --> Prod3
    
    Prod1 --> ProdDB
    Prod2 --> ProdDB
    Prod3 --> ProdDB
    
    Prod1 --> ProdDBReplica
    Prod2 --> ProdDBReplica
    Prod3 --> ProdDBReplica
    
    ProdDB -->|Replication| ProdDBReplica
    
    Prod1 --> ProdRedis
    Prod2 --> ProdRedis
    Prod3 --> ProdRedis
    
    Prod1 --> S3
    Prod2 --> S3
    Prod3 --> S3
```

## Resumo das Tecnologias

### Backend Core
| Tecnologia | Versão | Função |
|------------|--------|--------|
| Node.js | 20 LTS | Runtime JavaScript |
| TypeScript | 5.3.3 | Linguagem tipada |
| Express.js | 4.18.2 | Framework web |
| Prisma ORM | 5.7.0 | ORM para banco de dados |
| PostgreSQL | 16 | Banco de dados relacional |
| Redis | 7 | Cache e sessões |

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
| Winston | 3.11.0 | Logging |
| Multer | 1.4.5 | Upload de arquivos |
| date-fns | 4.1.0 | Manipulação de datas |
| uuid | 13.0.0 | Geração de UUIDs |

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
| Nginx | Latest | Reverse proxy |

