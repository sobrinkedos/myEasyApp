# Project Structure

## Architecture Pattern

Layered architecture with clear separation of concerns:
- **Routes** → **Controllers** → **Services** → **Repositories** → **Database**

## Directory Organization

```
src/
├── config/          # Configuration modules (database, redis, jwt, upload)
├── controllers/     # HTTP request handlers (thin layer)
├── services/        # Business logic (core application logic)
├── repositories/    # Data access layer (Prisma queries)
├── models/          # TypeScript types and Zod schemas
├── middlewares/     # Express middlewares (auth, error handling)
├── routes/          # Route definitions and endpoint mapping
├── utils/           # Shared utilities (logger, cache, errors)
├── __tests__/       # Test files and test setup
├── app.ts           # Express app configuration
└── server.ts        # Server entry point

prisma/
├── schema.prisma    # Database schema definition
├── migrations/      # Database migration history
└── seed.ts          # Database seeding script

design-system/       # Separate design system package
```

## Code Organization Principles

### Controllers
- Handle HTTP request/response
- Validate input with Zod schemas
- Delegate business logic to services
- Return standardized JSON responses
- Keep thin - no business logic here

### Services
- Contain all business logic
- Orchestrate repository calls
- Handle transactions
- Implement domain rules
- Cache frequently accessed data

### Repositories
- Abstract database operations
- Use Prisma client
- Return domain entities
- Handle query optimization
- No business logic

### Models
- Define TypeScript interfaces/types
- Zod validation schemas
- DTOs for API requests/responses
- Keep aligned with Prisma schema

### Middlewares
- Authentication (JWT verification)
- Authorization (permission checks)
- Error handling (centralized)
- Request validation
- Logging

## File Naming Conventions

- Use kebab-case for files: `user-role.service.ts`
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Repositories: `*.repository.ts`
- Routes: `*.routes.ts`
- Middlewares: `*.middleware.ts`
- Tests: `*.test.ts` or `*.spec.ts`

## API Route Structure

All routes prefixed with `/api/v1/`:
- `/api/v1/auth` - Authentication endpoints
- `/api/v1/categories` - Product categories
- `/api/v1/products` - Product management
- `/api/v1/ingredients` - Ingredient management
- `/api/v1/stock` - Stock transactions
- `/api/v1/establishment` - Establishment settings
- `/api/v1/tables` - Table management

## Special Directories

- `logs/` - Application logs (combined.log, error.log)
- `uploads/` - User uploaded files
- `.kiro/` - Kiro AI assistant configuration
- `.specify/` - Specification and documentation templates
- `design-system/` - Separate monorepo for UI components

## Configuration Files

- `tsconfig.json` - TypeScript compiler configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration
- `docker-compose.yml` - Development Docker setup
- `docker-compose.prod.yml` - Production Docker setup
- `Dockerfile` - Container image definition
