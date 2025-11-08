# Sistema de Movimentação de Estoque - Implementação

## 📋 Visão Geral

Sistema completo de rastreamento de movimentações de estoque com integração automática ao CMV (Custo de Mercadoria Vendida).

## ✅ Componentes Implementados

### 1. Backend

#### Schema Prisma (`prisma/schema.prisma`)
```prisma
model StockTransaction {
  id           String   @id @default(uuid())
  ingredientId String
  type         String   // 'purchase', 'usage', 'adjustment', 'waste'
  quantity     Decimal  @db.Decimal(10, 3)
  unitCost     Decimal? @db.Decimal(10, 4)
  totalValue   Decimal? @db.Decimal(12, 2)
  reason       String?
  reference    String?  // Reference to order, appraisal, etc.
  userId       String
  createdAt    DateTime @default(now())
  
  ingredient Ingredient @relation(...)
  user       User       @relation(...)
}
```

#### Models (`src/models/stock-transaction.model.ts`)
- `createStockTransactionSchema` - Validação Zod para criação
- `bulkCreateStockTransactionSchema` - Validação para criação em massa
- Tipos TypeScript exportados

#### Repository (`src/repositories/stock-transaction.repository.ts`)
**Métodos:**
- `create()` - Criar transação única
- `createMany()` - Criar múltiplas transações
- `findAll()` - Listar com filtros e paginação
- `findById()` - Buscar por ID
- `findByIngredient()` - Histórico por ingrediente
- `update()` - Atualizar transação
- `delete()` - Remover transação
- `getTotalPurchasesByPeriod()` - Agregação para CMV
- `getPurchasesByIngredientAndPeriod()` - Compras específicas

#### Service (`src/services/stock-transaction.service.ts`)
**Funcionalidades:**
- ✅ Criação de transações com validação
- ✅ Atualização automática de estoque
- ✅ Cálculo de preço médio ponderado
- ✅ **Integração automática com CMV**
- ✅ Suporte para transações em massa
- ✅ Reversão ao deletar

**Lógica de Integração CMV:**
```typescript
private async updateCMVPeriod(purchaseValue: number, transactionDate: Date) {
  // Busca períodos CMV abertos
  const openPeriods = await this.cmvService.getAll({ status: 'open' });
  
  // Verifica se a data da transação está dentro do período
  for (const period of openPeriods) {
    if (transactionDate >= startDate && transactionDate <= endDate) {
      // Soma automaticamente ao campo purchases
      await this.cmvService.update(period.id, {
        purchases: currentPurchases + purchaseValue,
      });
    }
  }
}
```

#### Controller (`src/controllers/stock-transaction.controller.ts`)
**Endpoints:**
- `POST /api/v1/stock/transactions` - Criar transação
- `POST /api/v1/stock/transactions/bulk` - Criar em massa
- `GET /api/v1/stock/transactions` - Listar com filtros
- `GET /api/v1/stock/transactions/:id` - Buscar por ID
- `GET /api/v1/stock/transactions/ingredient/:id` - Histórico do ingrediente
- `GET /api/v1/stock/transactions/purchases/period` - Total de compras
- `PUT /api/v1/stock/transactions/:id` - Atualizar
- `DELETE /api/v1/stock/transactions/:id` - Deletar

#### Routes (`src/routes/stock-transaction.routes.ts`)
- Documentação Swagger completa
- Autenticação obrigatória em todos os endpoints
- Validação de entrada com Zod

### 2. Frontend

#### Entrada em Massa (`web-app/src/pages/ingredients/IngredientBulkEntryPage.tsx`)
**Antes:**
```typescript
// Atualizava diretamente o ingrediente
await api.put(`/ingredients/${id}`, {
  currentQuantity: newQuantity,
  averageCost: newAverageCost,
});
```

**Depois:**
```typescript
// Usa sistema de transações
const transactions = entries.map(entry => ({
  ingredientId: entry.ingredientId,
  type: 'purchase',
  quantity: entry.quantity,
  unitCost: entry.cost,
  totalValue: entry.quantity * entry.cost,
  reason: `Entrada em massa - ${new Date().toLocaleDateString()}`,
}));

await api.post('/stock/transactions/bulk', { transactions });
```

#### Detalhes do Ingrediente (`web-app/src/pages/ingredients/IngredientDetailPage.tsx`)
**Nova Seção: Histórico de Movimentações**
- Últimas 10 transações
- Tipos coloridos (compra, uso, ajuste, perda)
- Quantidade e valor
- Motivo e custo unitário
- Usuário responsável
- Loading e empty states

## 🔄 Fluxo de Integração CMV

### Cenário: Entrada em Massa de Ingredientes

```
1. Usuário preenche entrada em massa
   ↓
2. Frontend envia POST /stock/transactions/bulk
   ↓
3. StockTransactionService.createBulk()
   ├─ Cria transações no banco
   ├─ Para cada transação:
   │  ├─ Atualiza estoque do ingrediente
   │  ├─ Calcula preço médio ponderado
   │  └─ Se tipo = 'purchase':
   │     └─ updateCMVPeriod()
   │        ├─ Busca períodos CMV abertos
   │        ├─ Verifica se data está no período
   │        └─ Soma ao campo 'purchases'
   └─ Retorna sucesso
```

### Tipos de Transação

| Tipo | Descrição | Afeta Estoque | Afeta CMV |
|------|-----------|---------------|-----------|
| `purchase` | Compra de ingrediente | ✅ Aumenta | ✅ Sim |
| `usage` | Uso em produção | ✅ Diminui | ❌ Não |
| `adjustment` | Ajuste manual | ✅ +/- | ❌ Não |
| `waste` | Perda/desperdício | ✅ Diminui | ❌ Não |

## 📊 Cálculo de Preço Médio Ponderado

```typescript
// Exemplo: Estoque atual = 10kg a R$5/kg
// Nova compra = 5kg a R$6/kg

const currentValue = 10 * 5 = 50
const newValue = 5 * 6 = 30
const totalValue = 50 + 30 = 80
const totalQuantity = 10 + 5 = 15

const newAverageCost = 80 / 15 = R$5,33/kg
```

## 🎯 Benefícios

### 1. Rastreabilidade Completa
- Histórico detalhado de todas as movimentações
- Quem fez, quando e por quê
- Referências a pedidos, conferências, etc.

### 2. Integração Automática com CMV
- Compras são automaticamente contabilizadas
- Não precisa inserir manualmente
- Reduz erros humanos

### 3. Preço Médio Ponderado
- Cálculo automático e preciso
- Reflete o custo real do estoque
- Base para cálculo de margem

### 4. Auditoria
- Todas as transações são registradas
- Impossível alterar histórico
- Compliance facilitado

## 🔧 Configuração

### 1. Gerar Prisma Client
```bash
npx prisma generate
```

### 2. Aplicar Migration (se necessário)
```bash
npx prisma migrate dev --name add_stock_transaction_fields
```

### 3. Iniciar Servidor
```bash
npm run dev
```

## 📝 Exemplos de Uso

### Criar Transação de Compra
```typescript
POST /api/v1/stock/transactions
{
  "ingredientId": "uuid-do-ingrediente",
  "type": "purchase",
  "quantity": 10,
  "unitCost": 5.50,
  "reason": "Compra semanal",
  "reference": "NF-12345"
}
```

### Entrada em Massa
```typescript
POST /api/v1/stock/transactions/bulk
{
  "transactions": [
    {
      "ingredientId": "uuid-1",
      "type": "purchase",
      "quantity": 10,
      "unitCost": 5.50
    },
    {
      "ingredientId": "uuid-2",
      "type": "purchase",
      "quantity": 5,
      "unitCost": 12.00
    }
  ]
}
```

### Buscar Histórico
```typescript
GET /api/v1/stock/transactions/ingredient/{ingredientId}?limit=10
```

### Total de Compras por Período
```typescript
GET /api/v1/stock/transactions/purchases/period?startDate=2024-01-01&endDate=2024-01-31
```

## 🚀 Próximos Passos

1. **Relatórios Avançados**
   - Gráficos de evolução de estoque
   - Análise de desperdício
   - Previsão de compras

2. **Alertas Inteligentes**
   - Movimentações suspeitas
   - Desperdício acima da média
   - Compras fora do padrão

3. **Integração com Fornecedores**
   - Importação automática de notas fiscais
   - Rastreamento de pedidos
   - Comparação de preços

4. **Mobile**
   - App para contagem de estoque
   - Registro rápido de movimentações
   - Notificações push

## 📚 Referências

- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [Express.js](https://expressjs.com)
- [React](https://react.dev)

---

**Status:** ✅ Implementado e Funcional  
**Versão:** 1.0.0  
**Data:** 07/01/2025
