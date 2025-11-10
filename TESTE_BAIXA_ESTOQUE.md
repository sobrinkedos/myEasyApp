# Como Testar a Baixa de Estoque

## 1. Verificar se Produtos Têm Ingredientes

Execute o script de verificação:

```bash
npx ts-node scripts/check-product-ingredients.ts
```

Este script vai mostrar:
- ✅ Produtos com receita ou ingredientes (vão ter baixa de estoque)
- ❌ Produtos sem ingredientes (NÃO vão ter baixa de estoque)
- Lista de Stock Items (produtos de revenda, não precisam de ingredientes)

## 2. Cadastrar Ingredientes em um Produto (se necessário)

### Opção A: Via Receita (Recomendado)

1. Criar uma receita:
```bash
POST /api/v1/recipes
{
  "name": "Receita Pizza Margherita",
  "category": "Pizzas",
  "yield": 1,
  "yieldUnit": "unidade",
  "ingredients": [
    {
      "ingredientId": "uuid-massa",
      "quantity": 0.3,
      "unit": "kg"
    },
    {
      "ingredientId": "uuid-queijo",
      "quantity": 0.15,
      "unit": "kg"
    }
  ]
}
```

2. Vincular receita ao produto:
```bash
PATCH /api/v1/products/{productId}
{
  "recipeId": "uuid-receita"
}
```

### Opção B: Ingredientes Diretos

```bash
POST /api/v1/ingredients/{ingredientId}/link-product
{
  "productId": "uuid-produto",
  "quantity": 0.5
}
```

## 3. Testar Pedido de Comanda

### 3.1. Criar pedido
```bash
POST /api/v1/orders
{
  "commandId": "uuid-comanda",
  "items": [
    {
      "productId": "uuid-produto-com-ingredientes",
      "quantity": 2
    }
  ]
}
```

### 3.2. Mudar status para "preparing"
```bash
PATCH /api/v1/orders/{orderId}/status
{
  "status": "preparing"
}
```

**Neste momento deve acontecer a baixa de estoque!**

## 4. Testar Pedido de Balcão

### 4.1. Criar pedido
```bash
POST /api/v1/counter-orders
{
  "customerName": "João",
  "items": [
    {
      "productId": "uuid-produto-com-ingredientes",
      "quantity": 2
    }
  ]
}
```

### 4.2. Confirmar pagamento
```bash
POST /api/v1/counter-orders/{orderId}/confirm-payment
{
  "paymentMethod": "CASH"
}
```

### 4.3. Mudar status para "PREPARANDO"
```bash
PATCH /api/v1/counter-orders/{orderId}/status
{
  "status": "PREPARANDO"
}
```

**Neste momento deve acontecer a baixa de estoque!**

## 5. Verificar Logs

Com os logs adicionados, você verá no console:

```
StockIntegration - Verificando disponibilidade: { orderId: '...', itemsCount: 1 }
StockIntegration - Processando item: { productId: '...', quantity: 2 }
StockIntegration - Produto encontrado: {
  productName: 'Pizza Margherita',
  hasRecipe: true,
  recipeIngredientsCount: 2
}
StockIntegration - Usando ingredientes da receita
StockIntegration - Verificando ingrediente da receita: {
  ingredientName: 'Massa',
  required: 0.6,
  available: 5,
  sufficient: true
}
...
StockIntegration - Iniciando dedução de estoque
StockIntegration - Atualizando quantidade: {
  ingredientName: 'Massa',
  oldQuantity: 5,
  deduction: 0.6,
  newQuantity: 4.4
}
StockIntegration - Criando transações de estoque: 2
StockIntegration - Transações criadas com sucesso
```

## 6. Verificar Transações Criadas

```bash
GET /api/v1/stock/transactions
```

Deve retornar transações do tipo "out" com:
- `reason`: "Pedido {orderId} - {productName}"
- `quantity`: quantidade deduzida
- `unitCost`: custo médio do ingrediente

## 7. Verificar Estoque Atualizado

```bash
GET /api/v1/ingredients/{ingredientId}
```

O campo `currentQuantity` deve estar reduzido.

## Problemas Comuns

### ❌ Estoque não foi deduzido

**Causa 1: Produto sem ingredientes**
- Solução: Cadastrar receita ou ingredientes diretos (ver passo 2)

**Causa 2: Produto é StockItem (revenda)**
- Solução: StockItems não deduzem ingredientes, é esperado

**Causa 3: Status não mudou para "preparing" ou "PREPARANDO"**
- Solução: A baixa só acontece nessa transição de status

**Causa 4: Erro nos logs**
- Solução: Verificar logs do console para identificar o problema

### ❌ Erro "Estoque insuficiente"

**Causa: Ingrediente com quantidade menor que necessária**
- Solução: Adicionar estoque via transação de compra:
```bash
POST /api/v1/stock/transactions
{
  "ingredientId": "uuid",
  "type": "purchase",
  "quantity": 10,
  "unitCost": 5.50,
  "reason": "Compra para reposição"
}
```

## Exemplo Completo

```bash
# 1. Verificar produtos
npx ts-node scripts/check-product-ingredients.ts

# 2. Se produto não tem ingredientes, criar receita
POST /api/v1/recipes
{
  "name": "Receita Hambúrguer",
  "category": "Lanches",
  "yield": 1,
  "yieldUnit": "unidade",
  "ingredients": [
    { "ingredientId": "uuid-pao", "quantity": 1, "unit": "unidade" },
    { "ingredientId": "uuid-carne", "quantity": 0.15, "unit": "kg" }
  ]
}

# 3. Vincular receita ao produto
PATCH /api/v1/products/{productId}
{ "recipeId": "uuid-receita" }

# 4. Criar pedido de balcão
POST /api/v1/counter-orders
{
  "customerName": "Maria",
  "items": [{ "productId": "uuid-hamburguer", "quantity": 2 }]
}

# 5. Confirmar pagamento
POST /api/v1/counter-orders/{orderId}/confirm-payment
{ "paymentMethod": "CASH" }

# 6. Iniciar preparo (AQUI ACONTECE A BAIXA)
PATCH /api/v1/counter-orders/{orderId}/status
{ "status": "PREPARANDO" }

# 7. Verificar transações
GET /api/v1/stock/transactions

# 8. Verificar estoque
GET /api/v1/ingredients
```
