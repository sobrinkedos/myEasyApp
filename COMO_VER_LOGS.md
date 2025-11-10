# Como Ver os Logs de Baixa de Estoque

## Onde os Logs Aparecem

Os logs aparecem no **console do servidor Node.js** (não no navegador).

## Opções para Ver os Logs

### Opção 1: Terminal onde o servidor está rodando

Se você iniciou o servidor com `npm run dev`, os logs aparecem nesse mesmo terminal.

Procure por linhas que começam com:
- `StockIntegration -`
- `CounterOrderService -`

### Opção 2: Arquivo de logs (se configurado)

Se você tem logs em arquivo, verifique:
```bash
# Windows
type logs\combined.log | findstr "StockIntegration"
type logs\combined.log | findstr "Deduzindo"

# Linux/Mac
tail -f logs/combined.log | grep "StockIntegration"
```

### Opção 3: Ver logs em tempo real

```bash
# Windows PowerShell
Get-Content logs\combined.log -Wait -Tail 50

# Linux/Mac
tail -f logs/combined.log
```

## O Que Procurar nos Logs

### ✅ Logs de Sucesso (Baixa Funcionando)

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
StockIntegration - Resultado da verificação: {
  success: true,
  deductedItemsCount: 2
}
CounterOrderService - Deduzindo estoque para pedido: abc-123
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

### ❌ Logs de Problema (Produto Sem Ingredientes)

```
StockIntegration - Verificando disponibilidade: { orderId: '...', itemsCount: 1 }
StockIntegration - Processando item: { productId: '...', quantity: 2 }
StockIntegration - Produto encontrado: {
  productName: 'Pizza Margherita',
  hasRecipe: false,
  hasDirectIngredients: false,
  recipeIngredientsCount: 0,
  directIngredientsCount: 0
}
StockIntegration - Produto sem receita e sem ingredientes diretos
StockIntegration - Resultado da verificação: {
  success: true,
  deductedItemsCount: 0,  ← PROBLEMA AQUI!
  insufficientItemsCount: 0
}
```

### ❌ Logs de Estoque Insuficiente

```
StockIntegration - Verificando ingrediente da receita: {
  ingredientName: 'Massa',
  required: 0.6,
  available: 0.2,  ← Não tem suficiente!
  sufficient: false
}
StockIntegration - Resultado da verificação: {
  success: false,
  insufficientItemsCount: 1,
  insufficientItems: [ 'Massa: 0.6 (disponível: 0.2)' ]
}
```

### ❌ Logs de Produto Não Encontrado

```
StockIntegration - Processando item: { productId: '...', quantity: 2 }
StockIntegration - Produto não encontrado como manufaturado, pode ser stock item
```

## Passo a Passo para Testar e Ver Logs

### 1. Abrir terminal do servidor
Certifique-se que o servidor está rodando e você pode ver o console.

### 2. Fazer um pedido de teste
```bash
# Criar pedido de balcão
POST /api/v1/counter-orders
{
  "customerName": "Teste",
  "items": [{ "productId": "seu-produto-id", "quantity": 1 }]
}
```

### 3. Confirmar pagamento
```bash
POST /api/v1/counter-orders/{orderId}/confirm-payment
{ "paymentMethod": "CASH" }
```

### 4. Mudar para PREPARANDO (aqui aparecem os logs!)
```bash
PATCH /api/v1/counter-orders/{orderId}/status
{ "status": "PREPARANDO" }
```

**Neste momento, olhe o console do servidor!**

### 5. Interpretar os logs

- Se aparecer `deductedItemsCount: 0` → Produto não tem ingredientes
- Se aparecer `Produto sem receita e sem ingredientes diretos` → Precisa cadastrar
- Se aparecer `Transações criadas com sucesso` → Funcionou! ✅

## Comandos Úteis

### Ver últimas 100 linhas do log
```bash
# Windows
Get-Content logs\combined.log -Tail 100

# Linux/Mac
tail -n 100 logs/combined.log
```

### Filtrar apenas logs de estoque
```bash
# Windows PowerShell
Get-Content logs\combined.log | Select-String "StockIntegration"

# Linux/Mac
grep "StockIntegration" logs/combined.log
```

### Limpar logs antigos (para facilitar visualização)
```bash
# Windows
del logs\*.log

# Linux/Mac
rm logs/*.log
```

## Se Não Aparecer Nenhum Log

Isso significa que o código não está sendo executado. Verifique:

1. **Servidor está rodando?**
   ```bash
   npm run dev
   ```

2. **Status está mudando para PREPARANDO?**
   - Só funciona na transição PENDENTE → PREPARANDO

3. **Pedido foi pago antes?**
   - Precisa confirmar pagamento primeiro

4. **userId está sendo passado?**
   - Verifique se está autenticado na requisição

## Exemplo de Teste Completo com Logs

```bash
# Terminal 1: Servidor rodando
npm run dev

# Terminal 2: Fazer requisições
curl -X POST http://localhost:3000/api/v1/counter-orders \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Teste","items":[{"productId":"uuid","quantity":1}]}'

# Voltar para Terminal 1 e ver os logs aparecerem!
```

## Precisa de Ajuda?

Se os logs mostrarem:
- **"Produto sem ingredientes"** → Execute `npx ts-node scripts/check-product-ingredients.ts`
- **"Estoque insuficiente"** → Adicione estoque via transação de compra
- **"Produto não encontrado"** → Verifique se o productId está correto
- **Nenhum log aparece** → Verifique se o status mudou para PREPARANDO
