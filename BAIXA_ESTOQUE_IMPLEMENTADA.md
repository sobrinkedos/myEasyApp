# Baixa de Estoque em Pedidos - Implementação Completa

## Problema Identificado

O sistema tinha **dois tipos de pedidos** com comportamentos diferentes:

### ✅ Order (Pedidos de Comanda)
- **Tinha** verificação de estoque ao criar
- **Tinha** baixa automática ao mudar para "preparing"
- Usava `StockIntegrationService`

### ❌ CounterOrder (Pedidos de Balcão)
- **Não tinha** verificação de estoque
- **Não tinha** baixa de ingredientes
- **Não criava** transações de estoque

## Solução Implementada

### 1. Integração do StockIntegrationService

Adicionado ao `CounterOrderService`:
```typescript
private stockIntegrationService: StockIntegrationService;
```

### 2. Verificação de Estoque na Criação

Ao criar um pedido de balcão, agora:
- ✅ Verifica disponibilidade de ingredientes
- ✅ Cancela automaticamente se estoque insuficiente
- ✅ Retorna erro detalhado com itens faltantes

```typescript
// Verificar disponibilidade de estoque
const stockCheck = await this.stockIntegrationService.checkStockAvailability(order);

if (!stockCheck.success) {
  // Cancelar o pedido se estoque insuficiente
  await this.repository.cancel(order.id, `Estoque insuficiente: ...`);
  throw new BadRequestError(`Estoque insuficiente para: ${itemNames}`);
}
```

### 3. Baixa Automática ao Preparar

Ao mudar status para **PREPARANDO**:

**Para Produtos Manufaturados:**
- ✅ Deduz ingredientes do estoque
- ✅ Cria StockTransactions (tipo: 'out')
- ✅ Atualiza quantidade atual dos ingredientes
- ✅ Registra custo médio na transação

**Para Produtos de Revenda (StockItems):**
- ✅ Deduz quantidade do stock item
- ✅ Cria StockMovements (tipo: 'sale')
- ✅ Atualiza quantidade atual do item
- ✅ Registra custo de compra na movimentação

```typescript
// Deduzir estoque quando mudar para PREPARANDO
if (status === CounterOrderStatus.PREPARANDO && order.status === CounterOrderStatus.PENDENTE) {
  const stockResult = await this.stockIntegrationService.deductStockForOrder(order, userId);
  
  if (!stockResult.success) {
    throw new BadRequestError(`Estoque insuficiente para: ${itemNames}`);
  }
}
```

### 4. Suporte a Produtos Manufaturados e Revenda

O sistema agora diferencia:

#### Produtos Manufaturados (Product)
- **Têm receita** com ingredientes
- **Deduzem estoque** de ingredientes ao preparar
- Exemplo: Pizza, Hambúrguer, Suco

#### Produtos de Revenda (StockItem)
- **Não têm receita**
- **Não deduzem** ingredientes (são vendidos direto)
- Exemplo: Refrigerante, Cerveja, Água

## Fluxo Completo de Pedido de Balcão

### 1. Criação (Status: AGUARDANDO_PAGAMENTO)
```
Cliente faz pedido
  ↓
Valida produtos e preços
  ↓
Verifica disponibilidade de estoque ← NOVO
  ↓
Cria pedido no banco
  ↓
Adiciona à fila de pagamento
```

### 2. Pagamento (Status: PENDENTE)
```
Confirma pagamento
  ↓
Registra no caixa
  ↓
Adiciona ao Kanban
  ↓
Status → PENDENTE
```

### 3. Preparação (Status: PREPARANDO)
```
Inicia preparo
  ↓
Deduz ingredientes do estoque ← NOVO
  ↓
Cria transações de estoque ← NOVO
  ↓
Status → PREPARANDO
```

### 4. Finalização
```
PREPARANDO → PRONTO → ENTREGUE
```

## Transações de Estoque Criadas

### Para Produtos Manufaturados (Ingredientes)

Cria **StockTransaction** para cada ingrediente:

```typescript
{
  ingredientId: "uuid",
  type: "out",
  quantity: 0.5,  // kg, L, unidades, etc
  reason: "Pedido {orderId} - Pizza Margherita",
  userId: "uuid",
  unitCost: 15.50,
  createdAt: "2024-11-09T..."
}
```

### Para Produtos de Revenda (StockItems)

Cria **StockMovement** para cada item:

```typescript
{
  stockItemId: "uuid",
  type: "sale",
  quantity: 5,  // unidades vendidas
  costPrice: 3.50,
  reason: "Pedido {orderId}",
  userId: "uuid",
  createdAt: "2024-11-09T..."
}
```

## Exemplos Práticos

### Exemplo 1: Produto Manufaturado (2x Pizza Margherita)

**Receita da Pizza:**
- 300g Massa
- 150g Queijo Mussarela
- 100g Molho de Tomate
- 10g Manjericão

**Ao mudar para PREPARANDO:**

StockTransactions criadas:
```
- 600g Massa (2 pizzas × 300g)
- 300g Queijo (2 pizzas × 150g)
- 200g Molho (2 pizzas × 100g)
- 20g Manjericão (2 pizzas × 10g)
```

Estoque de ingredientes atualizado:
```
Massa: 5kg → 4.4kg
Queijo: 2kg → 1.7kg
Molho: 1kg → 0.8kg
Manjericão: 100g → 80g
```

### Exemplo 2: Produto de Revenda (5x Cerveja Brahma)

**Ao mudar para PREPARANDO:**

StockMovement criado:
```
- 5 unidades Cerveja Brahma 350ml
```

Estoque de stock item atualizado:
```
Cerveja Brahma 350ml: 50 un → 45 un
```

### Exemplo 3: Pedido Misto (1x Pizza + 2x Cerveja)

**Ao mudar para PREPARANDO:**

StockTransactions criadas (ingredientes da pizza):
```
- 300g Massa
- 150g Queijo
- 100g Molho
- 10g Manjericão
```

StockMovement criado (cervejas):
```
- 2 unidades Cerveja Brahma 350ml
```

Ambos os estoques atualizados!

## Arquivos Modificados

1. **src/services/counter-order.service.ts**
   - Adicionado `StockIntegrationService`
   - Verificação na criação
   - Baixa na mudança de status

2. **src/controllers/counter-order.controller.ts**
   - Passa `userId` ao atualizar status

3. **src/services/stock-integration.service.ts**
   - Melhorado suporte para CounterOrder
   - Diferencia produtos manufaturados de revenda

## Benefícios

✅ **Controle de estoque preciso** - Sabe exatamente quanto foi usado
✅ **Prevenção de vendas sem estoque** - Valida antes de aceitar pedido
✅ **Rastreabilidade** - Cada transação registrada com motivo
✅ **CMV correto** - Custos calculados com base no uso real
✅ **Relatórios confiáveis** - Dados de movimentação precisos

## Próximos Passos (Opcional)

- [ ] Adicionar opção de "forçar pedido" mesmo com estoque baixo
- [ ] Notificar cozinha quando ingrediente está acabando
- [ ] Sugerir produtos alternativos quando estoque insuficiente
- [ ] Dashboard de consumo de ingredientes por período
- [ ] Alertas de reposição baseados em vendas previstas

## ⚠️ IMPORTANTE: Pré-requisitos

Para que a baixa de estoque funcione, **o produto DEVE ter ingredientes cadastrados**:

### Opção 1: Via Receita (Recomendado)
```bash
# 1. Criar receita
POST /api/v1/recipes
{
  "name": "Receita Pizza",
  "ingredients": [...]
}

# 2. Vincular ao produto
PATCH /api/v1/products/{id}
{ "recipeId": "uuid-receita" }
```

### Opção 2: Ingredientes Diretos
```bash
POST /api/v1/ingredients/{ingredientId}/link-product
{
  "productId": "uuid-produto",
  "quantity": 0.5
}
```

### Verificar Produtos
Execute o script para ver quais produtos têm ingredientes:
```bash
npx ts-node scripts/check-product-ingredients.ts
```

## Testando

**Veja o guia completo em:** `TESTE_BAIXA_ESTOQUE.md`

### Resumo Rápido

1. **Verificar se produto tem ingredientes** (script acima)
2. **Criar pedido** (comanda ou balcão)
3. **Mudar status para "preparing" ou "PREPARANDO"** ← Baixa acontece aqui
4. **Verificar logs no console** (logs detalhados adicionados)
5. **Verificar transações:** `GET /api/v1/stock/transactions`
6. **Verificar estoque:** `GET /api/v1/ingredients`
