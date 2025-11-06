# Design Document - Establishment Management

## Overview

O sistema de gerenciamento de estabelecimentos implementa um CRUD completo seguindo a arquitetura em camadas do projeto (Routes → Controllers → Services → Repositories → Database). O design garante que todos os usuários criados por um administrador sejam automaticamente vinculados ao estabelecimento desse administrador, mantendo o isolamento de dados entre diferentes estabelecimentos (multi-tenancy).

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         API Routes Layer                │
│  /api/v1/establishment/*                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Establishment Controller           │
│  - Request validation (Zod)             │
│  - Response formatting                  │
│  - Error handling delegation            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Establishment Service              │
│  - Business logic                       │
│  - CNPJ validation                      │
│  - User-establishment linking           │
│  - File upload handling                 │
│  - Audit logging                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Establishment Repository             │
│  - Prisma queries                       │
│  - Data access abstraction              │
│  - Transaction management               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database             │
│  - Establishment table                  │
│  - Related entities (User, Role, etc)   │
└─────────────────────────────────────────┘
```

### Multi-Tenancy Strategy

O sistema implementa multi-tenancy através do campo `establishmentId`:
- Cada usuário pertence a um único estabelecimento
- Todas as queries são filtradas por `establishmentId` do usuário autenticado
- O `establishmentId` é extraído do JWT token em cada requisição
- Usuários não podem acessar dados de outros estabelecimentos

## Components and Interfaces

### 1. Routes (`src/routes/establishment.routes.ts`)

```typescript
import { Router } from 'express';
import { EstablishmentController } from '@/controllers/establishment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorize } from '@/middlewares/authorization.middleware';
import { upload } from '@/config/upload';

const router = Router();
const controller = new EstablishmentController();

// All routes require authentication
router.use(authenticate);

// Create establishment (only for system admins or during registration)
router.post('/', 
  authorize(['establishment:create']),
  controller.create
);

// Get current user's establishment
router.get('/me', controller.getMyEstablishment);

// Get establishment by ID
router.get('/:id',
  authorize(['establishment:read']),
  controller.getById
);

// Update establishment
router.put('/:id',
  authorize(['establishment:update']),
  controller.update
);

// Upload logo
router.post('/:id/logo',
  authorize(['establishment:update']),
  upload.single('logo'),
  controller.uploadLogo
);

// Delete establishment
router.delete('/:id',
  authorize(['establishment:delete']),
  controller.delete
);

// List establishments (admin only)
router.get('/',
  authorize(['establishment:list']),
  controller.list
);

export default router;
```

### 2. Controller (`src/controllers/establishment.controller.ts`)

**Responsibilities:**
- Validate request data using Zod schemas
- Extract user context from JWT (req.user)
- Delegate business logic to service layer
- Format responses consistently
- Handle errors gracefully

**Key Methods:**
- `create()` - Create new establishment
- `getById()` - Get establishment details
- `getMyEstablishment()` - Get current user's establishment
- `update()` - Update establishment data
- `uploadLogo()` - Handle logo file upload
- `delete()` - Delete establishment
- `list()` - List establishments with pagination

**Validation Schemas:**

```typescript
const createEstablishmentSchema = z.object({
  name: z.string().min(3).max(100),
  cnpj: z.string().regex(/^\d{14}$/),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    postalCode: z.string().regex(/^\d{8}$/)
  }),
  phone: z.string().regex(/^\d{10,11}$/),
  email: z.string().email(),
  taxSettings: z.object({
    taxRegime: z.enum(['SIMPLES', 'PRESUMIDO', 'REAL']),
    serviceChargePercentage: z.number().min(0).max(100)
  }).optional()
});

const updateEstablishmentSchema = createEstablishmentSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
```

### 3. Service (`src/services/establishment.service.ts`)

**Responsibilities:**
- Implement business logic
- Validate CNPJ using official algorithm
- Ensure user-establishment linking
- Handle file operations for logo upload
- Create audit logs for all operations
- Manage transactions for complex operations

**Key Methods:**

```typescript
class EstablishmentService {
  // Create establishment and link creator
  async create(data: CreateEstablishmentDTO, creatorId: string): Promise<Establishment>
  
  // Get establishment by ID with authorization check
  async getById(id: string, userId: string): Promise<Establishment>
  
  // Get user's establishment
  async getByUserId(userId: string): Promise<Establishment>
  
  // Update establishment with validation
  async update(id: string, data: UpdateEstablishmentDTO, userId: string): Promise<Establishment>
  
  // Upload and replace logo
  async uploadLogo(id: string, file: Express.Multer.File, userId: string): Promise<string>
  
  // Delete establishment with cascade
  async delete(id: string, userId: string): Promise<void>
  
  // List with pagination and filters
  async list(query: ListQueryDTO, userId: string): Promise<PaginatedResult<Establishment>>
  
  // Validate CNPJ format and check digits
  private validateCNPJ(cnpj: string): boolean
  
  // Normalize CNPJ to digits only
  private normalizeCNPJ(cnpj: string): string
  
  // Create audit log entry
  private createAuditLog(action: string, resourceId: string, userId: string, data: any): Promise<void>
}
```

**CNPJ Validation Algorithm:**

```typescript
private validateCNPJ(cnpj: string): boolean {
  // Remove formatting
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Validate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (checkDigit1 !== parseInt(digits[12])) return false;
  
  // Validate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (checkDigit2 !== parseInt(digits[13])) return false;
  
  return true;
}
```

### 4. Repository (`src/repositories/establishment.repository.ts`)

**Responsibilities:**
- Abstract Prisma queries
- Provide clean data access interface
- Handle query optimization
- Manage database transactions

**Key Methods:**

```typescript
class EstablishmentRepository {
  // Create establishment
  async create(data: Prisma.EstablishmentCreateInput): Promise<Establishment>
  
  // Find by ID
  async findById(id: string): Promise<Establishment | null>
  
  // Find by CNPJ
  async findByCNPJ(cnpj: string): Promise<Establishment | null>
  
  // Find by user ID
  async findByUserId(userId: string): Promise<Establishment | null>
  
  // Update establishment
  async update(id: string, data: Prisma.EstablishmentUpdateInput): Promise<Establishment>
  
  // Delete establishment
  async delete(id: string): Promise<void>
  
  // List with pagination
  async findMany(params: FindManyParams): Promise<{ data: Establishment[], total: number }>
  
  // Check if CNPJ exists
  async existsByCNPJ(cnpj: string, excludeId?: string): Promise<boolean>
}
```

## Data Models

### Establishment Entity (Prisma Schema)

```prisma
model Establishment {
  id          String   @id @default(uuid())
  name        String
  cnpj        String   @unique
  address     Json     // { street, number, complement, neighborhood, city, state, postalCode }
  phone       String
  email       String
  logoUrl     String?
  taxSettings Json     // { taxRegime, serviceChargePercentage, customFields }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users         User[]
  roles         Role[]
  cashRegisters CashRegister[]

  @@index([cnpj])
  @@map("establishments")
}
```

### DTOs (Data Transfer Objects)

```typescript
// Create DTO
interface CreateEstablishmentDTO {
  name: string;
  cnpj: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  taxSettings?: {
    taxRegime: 'SIMPLES' | 'PRESUMIDO' | 'REAL';
    serviceChargePercentage: number;
    [key: string]: any;
  };
}

// Update DTO (all fields optional)
type UpdateEstablishmentDTO = Partial<CreateEstablishmentDTO>;

// Response DTO
interface EstablishmentResponseDTO {
  id: string;
  name: string;
  cnpj: string;
  address: Address;
  phone: string;
  email: string;
  logoUrl: string | null;
  taxSettings: TaxSettings;
  createdAt: string;
  updatedAt: string;
}

// List Query DTO
interface ListQueryDTO {
  page: number;
  limit: number;
  search?: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

// Paginated Result
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

### Custom Error Classes

```typescript
// Business logic errors
class EstablishmentNotFoundError extends NotFoundError {
  constructor() {
    super('Estabelecimento não encontrado');
  }
}

class DuplicateCNPJError extends ConflictError {
  constructor() {
    super('CNPJ já cadastrado no sistema');
  }
}

class InvalidCNPJError extends ValidationError {
  constructor() {
    super('CNPJ inválido', { cnpj: ['Formato ou dígitos verificadores inválidos'] });
  }
}

class UnauthorizedEstablishmentAccessError extends ForbiddenError {
  constructor() {
    super('Você não tem permissão para acessar este estabelecimento');
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "CNPJ já cadastrado no sistema",
    "code": "DUPLICATE_CNPJ",
    "statusCode": 409
  }
}
```

## Testing Strategy

### Unit Tests

**Service Layer Tests:**
- CNPJ validation logic (valid and invalid cases)
- Business rules enforcement
- Error handling scenarios
- Audit log creation

**Repository Layer Tests:**
- CRUD operations
- Query filtering and pagination
- Transaction handling

### Integration Tests

**API Endpoint Tests:**
- POST /api/v1/establishment - Create establishment
- GET /api/v1/establishment/me - Get current establishment
- GET /api/v1/establishment/:id - Get by ID
- PUT /api/v1/establishment/:id - Update establishment
- POST /api/v1/establishment/:id/logo - Upload logo
- DELETE /api/v1/establishment/:id - Delete establishment
- GET /api/v1/establishment - List establishments

**Test Scenarios:**
- Successful creation with valid data
- Duplicate CNPJ rejection
- Invalid CNPJ format rejection
- Authorization checks (user can only access own establishment)
- Logo upload and replacement
- Cascade deletion of related entities
- Pagination and filtering
- Audit log creation for all operations

### Test Data

```typescript
const validEstablishment = {
  name: 'Restaurante Teste',
  cnpj: '11222333000181', // Valid CNPJ
  address: {
    street: 'Rua Teste',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01234567'
  },
  phone: '11987654321',
  email: 'contato@restaurante.com',
  taxSettings: {
    taxRegime: 'SIMPLES',
    serviceChargePercentage: 10
  }
};
```

## Security Considerations

### Authentication & Authorization

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Permission-Based Access**: Operations require specific permissions
3. **Establishment Isolation**: Users can only access their own establishment data
4. **Admin Override**: System admins can list all establishments

### Data Validation

1. **Input Sanitization**: All inputs validated with Zod schemas
2. **CNPJ Validation**: Official algorithm implementation
3. **File Upload Security**: 
   - Whitelist allowed file types (image/png, image/jpeg)
   - Limit file size (5MB max)
   - Generate unique filenames to prevent overwrites
   - Store outside web root

### Audit Trail

All operations logged with:
- User ID
- Action performed
- Resource ID
- Previous and new states
- IP address
- Timestamp

## File Upload Configuration

### Multer Setup (`src/config/upload.ts`)

```typescript
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logos');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use PNG ou JPEG.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

## Performance Optimization

### Database Indexes

```prisma
@@index([cnpj])  // Fast CNPJ lookups
```

### Caching Strategy

- Cache establishment data in Redis with 1-hour TTL
- Invalidate cache on update/delete operations
- Cache key format: `establishment:{id}`

### Query Optimization

- Use `select` to fetch only required fields
- Implement pagination for list operations
- Use database indexes for filtering

## API Response Examples

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante Exemplo",
    "cnpj": "11222333000181",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "postalCode": "01234567"
    },
    "phone": "11987654321",
    "email": "contato@exemplo.com",
    "logoUrl": "/uploads/logos/uuid.png",
    "taxSettings": {
      "taxRegime": "SIMPLES",
      "serviceChargePercentage": 10
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Estabelecimento criado com sucesso"
}
```

### Paginated List Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```
