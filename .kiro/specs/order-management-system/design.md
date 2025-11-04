# Design Document - Sistema de Comandas e Pedidos

## Overview

O Sistema de Comandas e Pedidos é um módulo que estende o Backend API Core para gerenciar o ciclo completo de atendimento em restaurantes, desde a abertura de comandas até o fechamento e pagamento. O sistema utiliza WebSocket para atualizações em tempo real e integra-se com o módulo de estoque para baixa automática de insumos.

### Tecnologias Principais

- **Runtime**: Node.js 20 LTS com TypeScript 5.x
- **Framework Web**: Express.js 4.x (já existente no Backend Core)
- **Banco de Dados**: PostgreSQL 16 (compartilhado com Backend Core)
- **Cache**: Redis 7.x (compartilhado)
- **WebSocket**: Socket.io 4.x
- **ORM**: Prisma 5.x (estendendo schema existente)
- **Validação**: Zod
- **Testes**: Jest e Supertest

## Architecture

### Arquitetura de Módulos

```
┌─────────────────────────────────────────────────────────┐
│              Sistema de Comandas e Pedidos               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Table     │  │   Command    │  │    Order     │  │
│  │  Management  │  │  Management  │  │  Management  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                   ┌────────▼────────┐                    │
│                   │  WebSocket      │                    │
│                   │  Notifications  │                    │
│                   └────────┬────────┘                    │
│                            │                             │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │   Backend    │  │    Stock     │  │   Payment    │ │
│  │   API Core   │  │  Integration │  │  Integration │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Pedido

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Garçom  │────▶│ Comanda │────▶│ Pedido  │────▶│ Cozinha │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │                │               │
                     │                │               │
                     ▼                ▼               ▼
                ┌─────────┐     ┌─────────┐     ┌─────────┐
                │  Mesa   │     │ Estoque │     │  Status │
                └─────────┘     └─────────┘     └─────────┘
                                                      │
                                                      ▼
                                                 ┌─────────┐
                                                 │ Entrega │
                                                 └─────────┘
```

## Components and Interfaces

### 1. Table Management Module

**Responsabilidade**: Gerenciar mesas do estabelecimento.

**Componentes**:
- `TableController`: Endpoints REST para mesas
- `TableService`: Lógica de negócio de mesas
- `TableRepository`: Persistência de mesas

**Interfaces**:

```typescript
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved'
}

interface CreateTableDTO {
  number: number;
  capacity: number;
}

interface UpdateTableDTO {
  capacity?: number;
  status?: TableStatus;
  isActive?: boolean;
}
```

### 2. Command Management Module

**Responsabilidade**: Gerenciar comandas (agrupamento de pedidos).

**Componentes**:
- `CommandController`: Endpoints REST para comandas
- `CommandService`: Lógica de abertura, fechamento e cálculos
- `CommandRepository`: Persistência de comandas

**Interfaces**:

```typescript
interface Command {
  id: string;
  code: string; // Código único gerado
  tableId: string | null;
  type: CommandType;
  waiterId: string;
  numberOfPeople: number;
  status: CommandStatus;
  subtotal: number;
  serviceCharge: number;
  total: number;
  openedAt: Date;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

enum CommandType {
  TABLE = 'table',
  COUNTER = 'counter'
}

enum CommandStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAID = 'paid'
}

interface OpenCommandDTO {
  tableId?: string;
  numberOfPeople: number;
  type: CommandType;
}

interface CloseCommandDTO {
  serviceChargePercentage?: number; // Default 10%
}
```



### 3. Order Management Module

**Responsabilidade**: Gerenciar pedidos e itens de pedido.

**Componentes**:
- `OrderController`: Endpoints REST para pedidos
- `OrderService`: Lógica de criação, modificação e cancelamento
- `OrderRepository`: Persistência de pedidos

**Interfaces**:

```typescript
interface Order {
  id: string;
  commandId: string;
  orderNumber: number; // Número sequencial por comanda
  status: OrderStatus;
  subtotal: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  preparedAt: Date | null;
  readyAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
}

enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  observations: string | null;
  createdAt: Date;
}

interface CreateOrderDTO {
  commandId: string;
  items: CreateOrderItemDTO[];
}

interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
  observations?: string;
}

interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

interface CancelOrderDTO {
  reason: string;
}

interface ModifyOrderDTO {
  addItems?: CreateOrderItemDTO[];
  removeItemIds?: string[];
}
```

### 4. WebSocket Notification Module

**Responsabilidade**: Enviar notificações em tempo real.

**Componentes**:
- `WebSocketService`: Gerenciamento de conexões Socket.io
- `NotificationService`: Lógica de envio de notificações

**Interfaces**:

```typescript
interface WebSocketConnection {
  userId: string;
  socketId: string;
  role: string;
  connectedAt: Date;
}

interface OrderStatusNotification {
  type: 'order_status_changed';
  orderId: string;
  commandId: string;
  tableNumber: number | null;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: Date;
}

interface NewOrderNotification {
  type: 'new_order';
  orderId: string;
  commandId: string;
  tableNumber: number | null;
  items: OrderItem[];
  timestamp: Date;
}

interface WaiterCallNotification {
  type: 'waiter_called';
  tableNumber: number;
  timestamp: Date;
}
```

### 5. Stock Integration Module

**Responsabilidade**: Integrar com módulo de estoque para baixa automática.

**Componentes**:
- `StockIntegrationService`: Lógica de integração com estoque

**Interfaces**:

```typescript
interface StockDeductionRequest {
  orderId: string;
  items: StockDeductionItem[];
}

interface StockDeductionItem {
  ingredientId: string;
  quantity: number;
  productName: string;
}

interface StockDeductionResult {
  success: boolean;
  deductedItems: StockDeductionItem[];
  insufficientItems: InsufficientStockItem[];
}

interface InsufficientStockItem {
  ingredientId: string;
  ingredientName: string;
  required: number;
  available: number;
}
```

## Data Models

### Prisma Schema Extension

```prisma
// Adicionar ao schema existente do Backend Core

model Table {
  id        String      @id @default(uuid())
  number    Int         @unique
  capacity  Int
  status    String      @default("available")
  isActive  Boolean     @default(true)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  commands  Command[]
  
  @@index([status, isActive])
}

model Command {
  id                    String    @id @default(uuid())
  code                  String    @unique
  tableId               String?
  type                  String    @default("table")
  waiterId              String
  numberOfPeople        Int
  status                String    @default("open")
  subtotal              Decimal   @db.Decimal(10, 2) @default(0)
  serviceCharge         Decimal   @db.Decimal(10, 2) @default(0)
  total                 Decimal   @db.Decimal(10, 2) @default(0)
  openedAt              DateTime  @default(now())
  closedAt              DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  table                 Table?    @relation(fields: [tableId], references: [id])
  waiter                User      @relation(fields: [waiterId], references: [id])
  orders                Order[]
  
  @@index([status, openedAt])
  @@index([waiterId])
  @@index([tableId])
}

model Order {
  id                  String      @id @default(uuid())
  commandId           String
  orderNumber         Int
  status              String      @default("pending")
  subtotal            Decimal     @db.Decimal(10, 2)
  createdBy           String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  preparedAt          DateTime?
  readyAt             DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  cancellationReason  String?
  
  command             Command     @relation(fields: [commandId], references: [id])
  creator             User        @relation(fields: [createdBy], references: [id])
  items               OrderItem[]
  modifications       OrderModification[]
  
  @@unique([commandId, orderNumber])
  @@index([status, createdAt])
  @@index([commandId])
}

model OrderItem {
  id           String   @id @default(uuid())
  orderId      String
  productId    String
  quantity     Int
  unitPrice    Decimal  @db.Decimal(10, 2)
  subtotal     Decimal  @db.Decimal(10, 2)
  observations String?
  createdAt    DateTime @default(now())
  
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id])
  
  @@index([orderId])
}

model OrderModification {
  id          String   @id @default(uuid())
  orderId     String
  userId      String
  action      String   // 'add_item', 'remove_item', 'status_change', 'cancel'
  description String
  createdAt   DateTime @default(now())
  
  order       Order    @relation(fields: [orderId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([orderId, createdAt])
}
```

## Error Handling

### Erros Específicos do Módulo

```typescript
class TableOccupiedError extends AppError {
  constructor(tableNumber: number) {
    super(400, `Mesa ${tableNumber} já possui comanda aberta`);
  }
}

class CommandClosedError extends AppError {
  constructor(commandCode: string) {
    super(400, `Comanda ${commandCode} já está fechada`);
  }
}

class OrderNotModifiableError extends AppError {
  constructor(orderId: string, status: string) {
    super(400, `Pedido ${orderId} com status ${status} não pode ser modificado`);
  }
}

class PendingOrdersError extends AppError {
  constructor(pendingCount: number) {
    super(400, `Existem ${pendingCount} pedidos não entregues`);
  }
}

class InsufficientStockError extends AppError {
  constructor(public insufficientItems: InsufficientStockItem[]) {
    const itemNames = insufficientItems.map(i => i.ingredientName).join(', ');
    super(400, `Estoque insuficiente para: ${itemNames}`);
  }
}
```

## Testing Strategy

### 1. Testes Unitários

**Escopo**: Services isolados com mocks.

```typescript
describe('CommandService', () => {
  let commandService: CommandService;
  let mockRepository: jest.Mocked<CommandRepository>;
  let mockTableService: jest.Mocked<TableService>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    } as any;
    
    mockTableService = {
      updateStatus: jest.fn()
    } as any;
    
    commandService = new CommandService(mockRepository, mockTableService);
  });

  it('should open command and update table status', async () => {
    const commandData = {
      tableId: 'table-123',
      numberOfPeople: 4,
      type: CommandType.TABLE
    };

    mockRepository.create.mockResolvedValue({
      id: 'cmd-123',
      code: 'CMD001',
      ...commandData
    });

    const result = await commandService.openCommand(commandData, 'user-123');

    expect(result.code).toBe('CMD001');
    expect(mockTableService.updateStatus).toHaveBeenCalledWith('table-123', TableStatus.OCCUPIED);
  });

  it('should throw error when opening command for occupied table', async () => {
    mockRepository.findOpenByTable.mockResolvedValue({ id: 'existing-cmd' });

    await expect(
      commandService.openCommand({ tableId: 'table-123', numberOfPeople: 2, type: CommandType.TABLE }, 'user-123')
    ).rejects.toThrow(TableOccupiedError);
  });
});
```



### 2. Testes de Integração

**Escopo**: Endpoints REST com banco de teste.

```typescript
describe('POST /api/v1/orders', () => {
  let app: Express;
  let authToken: string;
  let commandId: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestAuthToken();
    
    // Criar comanda de teste
    const command = await createTestCommand();
    commandId = command.id;
  });

  it('should create order with items', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        commandId,
        items: [
          { productId: 'prod-1', quantity: 2, observations: 'Sem cebola' },
          { productId: 'prod-2', quantity: 1 }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.status).toBe('pending');
  });

  it('should return 400 when stock is insufficient', async () => {
    // Produto com insumo sem estoque
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        commandId,
        items: [{ productId: 'prod-out-of-stock', quantity: 1 }]
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Estoque insuficiente');
  });
});
```

### 3. Testes de WebSocket

```typescript
describe('WebSocket Notifications', () => {
  let io: Server;
  let clientSocket: Socket;

  beforeAll((done) => {
    io = createTestSocketServer();
    clientSocket = createTestSocketClient();
    clientSocket.on('connect', done);
  });

  it('should notify when order status changes', (done) => {
    clientSocket.on('order_status_changed', (notification) => {
      expect(notification.orderId).toBe('order-123');
      expect(notification.newStatus).toBe('ready');
      done();
    });

    // Simular mudança de status
    updateOrderStatus('order-123', 'ready');
  });
});
```

## WebSocket Implementation

### Socket.io Configuration

```typescript
import { Server } from 'socket.io';
import { verifyJWT } from './middlewares/auth';

export const initializeWebSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const payload = await verifyJWT(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.userId} connected`);

    // Entrar em sala baseado no papel
    if (socket.data.role === 'waiter') {
      socket.join('waiters');
    } else if (socket.data.role === 'kitchen') {
      socket.join('kitchen');
    }

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.userId} disconnected`);
    });
  });

  return io;
};
```

### Notification Service

```typescript
export class NotificationService {
  constructor(private io: Server) {}

  notifyOrderStatusChange(order: Order, oldStatus: OrderStatus) {
    const notification: OrderStatusNotification = {
      type: 'order_status_changed',
      orderId: order.id,
      commandId: order.commandId,
      tableNumber: order.command.table?.number || null,
      oldStatus,
      newStatus: order.status,
      timestamp: new Date()
    };

    // Notificar garçom responsável
    this.io.to(`user:${order.command.waiterId}`).emit('order_status_changed', notification);

    // Se ficou pronto, notificar todos os garçons
    if (order.status === OrderStatus.READY) {
      this.io.to('waiters').emit('order_ready', notification);
    }
  }

  notifyNewOrder(order: Order) {
    const notification: NewOrderNotification = {
      type: 'new_order',
      orderId: order.id,
      commandId: order.commandId,
      tableNumber: order.command.table?.number || null,
      items: order.items,
      timestamp: new Date()
    };

    // Notificar cozinha
    this.io.to('kitchen').emit('new_order', notification);
  }

  notifyWaiterCall(tableNumber: number) {
    const notification: WaiterCallNotification = {
      type: 'waiter_called',
      tableNumber,
      timestamp: new Date()
    };

    // Notificar todos os garçons
    this.io.to('waiters').emit('waiter_called', notification);
  }
}
```

## Stock Integration

### Stock Deduction Flow

```typescript
export class StockIntegrationService {
  constructor(
    private ingredientRepository: IngredientRepository,
    private stockRepository: StockRepository,
    private productRepository: ProductRepository
  ) {}

  async deductStockForOrder(order: Order): Promise<StockDeductionResult> {
    const deductionItems: StockDeductionItem[] = [];
    const insufficientItems: InsufficientStockItem[] = [];

    // Para cada item do pedido
    for (const orderItem of order.items) {
      // Buscar receita do produto (insumos necessários)
      const recipe = await this.productRepository.findRecipe(orderItem.productId);

      for (const ingredient of recipe) {
        const requiredQuantity = ingredient.quantity * orderItem.quantity;
        const currentStock = await this.ingredientRepository.findById(ingredient.ingredientId);

        if (currentStock.currentQuantity < requiredQuantity) {
          insufficientItems.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: currentStock.name,
            required: requiredQuantity,
            available: currentStock.currentQuantity
          });
        } else {
          deductionItems.push({
            ingredientId: ingredient.ingredientId,
            quantity: requiredQuantity,
            productName: orderItem.product.name
          });
        }
      }
    }

    // Se houver itens insuficientes, não deduzir nada
    if (insufficientItems.length > 0) {
      return {
        success: false,
        deductedItems: [],
        insufficientItems
      };
    }

    // Deduzir estoque
    for (const item of deductionItems) {
      await this.stockRepository.createTransaction({
        ingredientId: item.ingredientId,
        type: TransactionType.OUT,
        quantity: item.quantity,
        reason: `Pedido ${order.id} - ${item.productName}`,
        userId: order.createdBy
      });
    }

    return {
      success: true,
      deductedItems: deductionItems,
      insufficientItems: []
    };
  }
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache de comandas abertas
const OPEN_COMMANDS_CACHE_KEY = 'commands:open';
const CACHE_TTL = 120; // 2 minutos

export class CommandService {
  async getOpenCommands(): Promise<Command[]> {
    // Tentar buscar do cache
    const cached = await redis.get(OPEN_COMMANDS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco
    const commands = await this.repository.findOpen();

    // Cachear resultado
    await redis.setex(OPEN_COMMANDS_CACHE_KEY, CACHE_TTL, JSON.stringify(commands));

    return commands;
  }

  async openCommand(data: OpenCommandDTO, userId: string): Promise<Command> {
    const command = await this.repository.create({ ...data, waiterId: userId });

    // Invalidar cache
    await redis.del(OPEN_COMMANDS_CACHE_KEY);

    return command;
  }
}
```

### 2. Database Indexes

Índices já definidos no schema Prisma para otimizar queries frequentes:
- `Command`: status + openedAt, waiterId, tableId
- `Order`: status + createdAt, commandId
- `OrderItem`: orderId
- `OrderModification`: orderId + createdAt

### 3. Eager Loading

```typescript
// Buscar comanda com todos os relacionamentos necessários
const command = await prisma.command.findUnique({
  where: { id: commandId },
  include: {
    table: true,
    waiter: { select: { id: true, name: true } },
    orders: {
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    }
  }
});
```

## API Documentation

### Principais Endpoints

**Mesas**:
- `GET /api/v1/tables` - Listar mesas
- `POST /api/v1/tables` - Criar mesa
- `PUT /api/v1/tables/:id` - Atualizar mesa
- `DELETE /api/v1/tables/:id` - Remover mesa

**Comandas**:
- `GET /api/v1/commands` - Listar comandas (filtros: status, waiterId, tableId)
- `GET /api/v1/commands/:id` - Buscar comanda por ID
- `POST /api/v1/commands` - Abrir comanda
- `POST /api/v1/commands/:id/close` - Fechar comanda
- `GET /api/v1/commands/open` - Listar comandas abertas

**Pedidos**:
- `POST /api/v1/orders` - Criar pedido
- `GET /api/v1/orders/:id` - Buscar pedido por ID
- `PUT /api/v1/orders/:id/status` - Atualizar status
- `POST /api/v1/orders/:id/cancel` - Cancelar pedido
- `PUT /api/v1/orders/:id/modify` - Modificar pedido
- `GET /api/v1/orders/by-command/:commandId` - Listar pedidos de uma comanda

**Relatórios**:
- `GET /api/v1/reports/sales` - Relatório de vendas
- `GET /api/v1/reports/products` - Produtos mais vendidos
- `GET /api/v1/reports/waiters` - Performance de garçons

## Security Considerations

### 1. Autorização por Papel

```typescript
// Middleware para verificar papel do usuário
const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Acesso negado');
    }
    next();
  };
};

// Aplicar em rotas
router.post('/commands', requireRole('waiter', 'admin'), commandController.create);
router.put('/orders/:id/status', requireRole('kitchen', 'admin'), orderController.updateStatus);
```

### 2. Validação de Propriedade

```typescript
// Garçom só pode modificar suas próprias comandas
export class CommandService {
  async closeCommand(commandId: string, userId: string, userRole: string) {
    const command = await this.repository.findById(commandId);

    if (userRole !== 'admin' && command.waiterId !== userId) {
      throw new AuthorizationError('Você não pode fechar comanda de outro garçom');
    }

    // Prosseguir com fechamento
  }
}
```

## Deployment Considerations

### Environment Variables

```env
# WebSocket
WEBSOCKET_PORT=3001
WEBSOCKET_CORS_ORIGIN=http://localhost:3000

# Stock Integration
STOCK_CHECK_ENABLED=true
STOCK_AUTO_DEDUCT=true

# Command Settings
DEFAULT_SERVICE_CHARGE=10
COMMAND_CODE_PREFIX=CMD
```

### Docker Compose Update

```yaml
services:
  api:
    environment:
      - WEBSOCKET_PORT=3001
      - STOCK_CHECK_ENABLED=true
    ports:
      - "3000:3000"
      - "3001:3001"  # WebSocket port
```
