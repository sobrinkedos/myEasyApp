# ✅ Baixa de Estoque para StockItems Implementada!

## O Que Foi Feito

Implementei a baixa de estoque para **produtos de revenda (StockItems)** como Cerveja, Refrigerante, Água, etc.

## Como Funciona Agora

### Produtos Manufaturados (com receita)
- Deduz **ingredientes** (Massa, Queijo, etc)
- Cria **StockTransaction** (tipo: 'out')
- Exemplo: Pizza, Hambúrguer, Suco Natural

### Produtos de Revenda (StockItems)
- Deduz **quantidade do item** diretamente
- Cria **StockMovement** (tipo: 'sale')
- Exemplo: Cerveja, Refrigerante, Água

## Teste Agora

### 1. Criar pedido com Cerveja Brahma
```bash
POST /api/v1/counter-orders
{
  "customerName": "Teste",
  "items": [
    {
      "productId": "id-cerveja-brahma-stock-item",
      "quantity": 5
    }
  ]
}
```

### 2. Confirmar pagamento
```bash
POST /api/v1/counter-orders/{orderId}/confirm-payment
{
  "paymentMethod": "CASH"
}
```

### 3. Mudar para PREPARANDO
```bash
PATCH /api/v1/counter-orders/{orderId}/status
{
  "status": "PREPARANDO"
}
```

## O Que Vai Acontecer

### Logs no Console:
```
StockIntegration - Verificando disponibilidade: { orderId: '...', itemsCount: 1 }
StockIntegration - Processando item: { productId: '...', quantity: 5 }
StockIntegration - Produto não encontrado como manufaturado, tentando como stock item
StockIntegration - Verificando stock item (via productId): {
  stockItemName: 'Cerveja Brahma 350ml lata',
  required: 5,
  available: 50,
  sufficient: true
}
StockIntegration - Resultado da verificação: {
  success: true,
  deductedStockItemsCount: 1,
  deductedStockItems: [ 'Cerveja Brahma 350ml lata: 5' ]
}
CounterOrderService - Deduzindo estoque para pedido: ...
StockIntegration - Iniciando dedução de estoque
StockIntegration - Stock items agrupados para dedução: {
  count: 1,
  items: [ 'Cerveja Brahma 350ml lata: 5' ]
}
StockIntegration - Atualizando quantidade de stock item: {
  stockItemName: 'Cerveja Brahma 350ml lata',
  oldQuantity: 50,
  deduction: 5,
  newQuantity: 45
}
StockIntegration - Criando movimentações de stock items: 1
StockIntegration - Movimentações de stock items criadas com sucesso
CounterOrderService - Estoque deduzido com sucesso: {
  orderId: '...',
  ingredientsDeducted: 0,
  stockItemsDeducted: 1
}
```

### Banco de Dados:

**Tabela: stock_items**
```
Cerveja Brahma 350ml lata
currentQuantity: 50 → 45
```

**Tabela: stock_movements**
```
{
  id: "uuid",
  stockItemId: "uuid-cerveja",
  type: "sale",
  quantity: 5,
  costPrice: 3.50,
  totalCost: 17.50,
  reason: "Pedido abc-123",
  userId: "uuid-usuario",
  createdAt: "2024-11-09T..."
}
```

## Verificar Resultados

### Ver movimentações criadas:
```bash
GET /api/v1/stock-movements?stockItemId={id-cerveja}
```

### Ver estoque atualizado:
```bash
GET /api/v1/stock-items/{id-cerveja}
```

Deve mostrar `currentQuantity` reduzida!

## Importante

### ⚠️ Use o StockItem correto!

Você tem produtos duplicados:
- ❌ "Cerveja Brahma 350ml" (Product sem receita) - NÃO vai deduzir
- ✅ "Cerveja Brahma 350ml lata" (StockItem) - VAI deduzir

**Solução:**
1. Desative os Products duplicados
2. Use apenas os StockItems nos pedidos

```bash
# Desativar produto duplicado
PATCH /api/v1/products/{id-cerveja-product}
{
  "isActive": false
}
```

## Arquivos Modificados

1. **src/services/stock-integration.service.ts**
   - Adicionado suporte para StockItems
   - Verifica disponibilidade de stock items
   - Deduz quantidade e cria movimentações

2. **src/repositories/stock-item.repository.ts**
   - Adicionado método `updateQuantity()`

3. **src/services/counter-order.service.ts**
   - Atualizado para lidar com stock items insuficientes

4. **src/services/order.service.ts**
   - Atualizado para lidar com stock items insuficientes

## Fluxo Completo

```
Pedido criado
  ↓
Verifica estoque (ingredientes + stock items)
  ↓
Pagamento confirmado
  ↓
Status → PREPARANDO
  ↓
Deduz ingredientes (se produto manufaturado)
  ↓
Deduz stock items (se produto de revenda)
  ↓
Cria transações/movimentações
  ↓
Estoque atualizado! ✅
```

## Teste com Pedido Misto

```bash
POST /api/v1/counter-orders
{
  "customerName": "Teste Misto",
  "items": [
    {
      "productId": "id-hamburguer",  // Produto manufaturado
      "quantity": 1
    },
    {
      "productId": "id-cerveja-stock-item",  // Stock item
      "quantity": 2
    }
  ]
}
```

Vai deduzir:
- ✅ Ingredientes do hambúrguer (Pão, Carne, etc)
- ✅ 2 unidades de cerveja

Ambos registrados corretamente! 🎉
