# 🚀 Instruções para Aplicar Migration - Sistema de Pedidos Balcão

## ✅ Implementação Completa

O sistema de Pedidos Balcão foi **100% implementado** e está pronto para uso. Apenas falta aplicar a migration no banco de dados.

## 📋 O que foi criado:

### Backend Completo
- ✅ Modelos de dados (TypeScript + Prisma)
- ✅ Validações com Zod
- ✅ Repository (acesso a dados)
- ✅ Services (lógica de negócio + integrações)
- ✅ Controller (9 endpoints HTTP)
- ✅ Routes configuradas
- ✅ Documentação Swagger

### Arquivos Criados
```
src/
├── models/
│   ├── counter-order.model.ts
│   └── counter-order.schemas.ts
├── repositories/
│   └── counter-order.repository.ts
├── services/
│   ├── counter-order.service.ts
│   ├── payment-queue.service.ts
│   ├── kanban-integration.service.ts
│   └── counter-order-notification.service.ts
├── controllers/
│   └── counter-order.controller.ts
└── routes/
    └── counter-order.routes.ts

prisma/
└── migrations/
    ├── 20250109000001_add_counter_orders/
    │   └── migration.sql
    └── apply_counter_orders.sql (script manual)
```

## 🎯 Como Aplicar a Migration

### Opção 1: Via Neon Console (RECOMENDADO - Mais Fácil)

1. **Acesse o Neon Console:**
   ```
   https://console.neon.tech
   ```

2. **Selecione seu projeto** (ep-ancient-smoke-aef5zrjy)

3. **Abra o SQL Editor** (ícone de terminal/query)

4. **Copie e cole o conteúdo do arquivo:**
   ```
   prisma/migrations/apply_counter_orders.sql
   ```

5. **Execute o script** (botão Run ou Ctrl+Enter)

6. **Verifique o resultado:**
   - Deve mostrar: "Migration de Counter Orders aplicada com sucesso!"

### Opção 2: Via psql (Terminal)

```bash
# Conectar ao banco
psql "postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Executar o script
\i prisma/migrations/apply_counter_orders.sql

# Sair
\q
```

### Opção 3: Via Cliente PostgreSQL (DBeaver, pgAdmin, etc.)

1. Abra seu cliente PostgreSQL
2. Conecte usando a string de conexão do .env
3. Abra o arquivo `prisma/migrations/apply_counter_orders.sql`
4. Execute o script completo

## ✅ Verificar se Migration foi Aplicada

Execute esta query no banco:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('counter_orders', 'counter_order_items');
```

**Resultado esperado:** 2 linhas (counter_orders e counter_order_items)

## 🔧 Após Aplicar a Migration

### 1. Gerar Prisma Client

```bash
# Feche todos os processos Node.js primeiro
# Depois execute:
npx prisma generate
```

Se houver erro de permissão no Windows:
- Feche o VS Code
- Abra PowerShell como Administrador
- Execute: `npx prisma generate`

### 2. Iniciar o Servidor

```bash
npm run dev
```

### 3. Testar os Endpoints

Acesse a documentação Swagger:
```
http://localhost:3000/api/docs
```

Procure pela tag **"Counter Orders"** para ver todos os 9 endpoints disponíveis.

## 📡 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/counter-orders` | Criar pedido balcão |
| GET | `/api/v1/counter-orders` | Listar pedidos ativos |
| GET | `/api/v1/counter-orders/pending-payment` | Listar pendentes de pagamento |
| GET | `/api/v1/counter-orders/ready` | Listar pedidos prontos |
| GET | `/api/v1/counter-orders/metrics` | Obter métricas |
| GET | `/api/v1/counter-orders/:id` | Buscar por ID |
| GET | `/api/v1/counter-orders/number/:orderNumber` | Buscar por número |
| PATCH | `/api/v1/counter-orders/:id/status` | Atualizar status |
| POST | `/api/v1/counter-orders/:id/confirm-payment` | Confirmar pagamento |
| POST | `/api/v1/counter-orders/:id/cancel` | Cancelar pedido |

## 🎨 Exemplo de Uso

### Criar Pedido

```bash
POST /api/v1/counter-orders
Authorization: Bearer {token}

{
  "customerName": "João Silva",
  "notes": "Sem cebola",
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2,
      "notes": "Bem passado"
    }
  ]
}
```

### Resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": 1,
    "customerName": "João Silva",
    "status": "AGUARDANDO_PAGAMENTO",
    "totalAmount": 45.90,
    "items": [...],
    "createdAt": "2025-01-09T...",
    "createdBy": {
      "id": "uuid",
      "name": "Atendente"
    }
  },
  "message": "Pedido #1 criado com sucesso"
}
```

## 🔄 Fluxo do Pedido

```
1. AGUARDANDO_PAGAMENTO → Pedido criado, aguardando pagamento
2. PENDENTE → Pagamento confirmado, aguardando preparo
3. PREPARANDO → Em preparação na cozinha
4. PRONTO → Pronto para retirada
5. ENTREGUE → Entregue ao cliente
```

## 🎯 Integrações Implementadas

- ✅ **Redis Queue** - Fila de pagamentos
- ✅ **Kanban** - Atualização em tempo real (WebSocket ready)
- ✅ **Notificações** - Sistema de eventos (WebSocket ready)
- ✅ **Métricas** - Relatórios e análises

## 🐛 Troubleshooting

### Erro: "relation counter_orders does not exist"
- A migration não foi aplicada. Siga as instruções acima.

### Erro: "Cannot find module @prisma/client"
```bash
npx prisma generate
```

### Erro: "EPERM: operation not permitted"
- Feche todos os processos Node.js
- Execute como Administrador

### Erro: "Database connection failed"
- Verifique a variável DATABASE_URL no .env
- Teste a conexão com o Neon Console

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Consulte a documentação do Prisma
3. Verifique as permissões do banco de dados

---

**Status:** ✅ Implementação 100% completa - Aguardando apenas aplicação da migration
