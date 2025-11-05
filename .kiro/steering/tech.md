# Technology Stack

## Runtime & Language

- Node.js 20 LTS
- TypeScript 5.x with strict mode enabled
- Target: ES2022

## Core Framework & Libraries

- Express.js 4.x - Web framework
- Prisma ORM 5.x - Database ORM
- PostgreSQL 16 - Primary database
- Redis 7.x (ioredis) - Caching and sessions
- Zod - Schema validation

## Security & Authentication

- JWT (jsonwebtoken) - Token-based auth
- bcrypt - Password hashing (12 rounds in production)
- helmet - Security headers
- express-rate-limit - Rate limiting (100 req/min)
- CORS configured per environment

## Development Tools

- ts-node-dev - Development server with hot reload
- Jest - Testing framework
- ESLint + Prettier - Code quality
- tsconfig-paths - Path aliases support

## Path Aliases

Use TypeScript path aliases for imports:
- `@/*` - src root
- `@config/*` - Configuration files
- `@controllers/*` - Request handlers
- `@services/*` - Business logic
- `@repositories/*` - Data access layer
- `@models/*` - Type definitions
- `@middlewares/*` - Express middlewares
- `@utils/*` - Utility functions
- `@routes/*` - Route definitions

## Common Commands

### Development
```bash
npm run dev              # Start dev server with hot reload
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with initial data
```

### Testing
```bash
npm test                 # Run all tests with coverage
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
```

### Code Quality
```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
```

### Production
```bash
npm run build            # Compile TypeScript to JavaScript
npm run start:prod       # Start production server
npm run prisma:migrate:prod  # Deploy migrations to production
```

### Docker
```bash
docker-compose up -d                           # Start dev services
docker-compose -f docker-compose.prod.yml up -d  # Start prod services
docker-compose down                            # Stop services
docker-compose logs -f api                     # View API logs
```

## Environment Configuration

- `.env.development` - Development environment
- `.env.production` - Production environment
- Use `NODE_ENV` to switch between environments
- Never commit `.env` files with real credentials

## Database

- Prisma schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Always generate client after schema changes
- Use transactions for multi-step operations
