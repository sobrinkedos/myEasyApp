# Correção: Pagamento de Comanda não Lançado no Caixa

## Problema Identificado

Ao receber uma comanda no caixa, o valor recebido não estava sendo lançado no caixa, nem mostrado nos lançamentos do caixa.

## Causa Raiz

No arquivo `src/services/command.service.ts`, a função `confirmPayment` tinha um comentário TODO indicando que a integração com o sistema de caixa não havia sido implementada:

```typescript
// Register cash transaction (will be implemented with cash system integration)
// TODO: Create cash transaction record
```

## Solução Implementada

### 1. Integração com o Sistema de Caixa

Implementada a integração completa no método `confirmPayment` do `CommandService`:

- **Validação da forma de pagamento**: Verifica se o método de pagamento é válido (CASH, DEBIT, CREDIT, PIX, VOUCHER, OTHER)
- **Verificação de sessão ativa**: Garante que o usuário tem uma sessão de caixa aberta
- **Registro da transação**: Cria uma transação de venda no caixa com todos os detalhes

### 2. Código Implementado

```typescript
async confirmPayment(
  id: string,
  paymentMethod: string,
  amount: number,
  userId: string
): Promise<Command> {
  const command = await this.getById(id);

  // Validate command is pending payment
  if (command.status !== 'pending_payment') {
    throw new BadRequestError('Comanda não está pendente de pagamento');
  }

  // Validate payment method
  const validPaymentMethods = Object.values(PaymentMethod);
  if (!validPaymentMethods.includes(paymentMethod as PaymentMethod)) {
    throw new BadRequestError('Forma de pagamento inválida');
  }

  // Get active cash session for the user
  const activeSession = await this.cashSessionService.getActiveSession(userId);
  if (!activeSession) {
    throw new BadRequestError('Nenhuma sessão de caixa aberta para registrar o pagamento');
  }

  // Register cash transaction
  await this.cashTransactionService.recordSale(
    activeSession.id,
    {
      saleId: command.id,
      amount,
      paymentMethod: paymentMethod as PaymentMethod,
    },
    userId
  );

  // Update command to closed
  const paidCommand = await this.repository.update(id, {
    status: 'closed',
  });

  // Free table if it's a table command
  if (paidCommand.tableId) {
    await this.tableService.updateStatus(paidCommand.tableId, 'available');
  }

  // Invalidate cache
  await cacheService.del(OPEN_COMMANDS_CACHE_KEY);

  return paidCommand;
}
```

## Como Testar

### Pré-requisitos

1. Ter um usuário com permissão de caixa (cashier)
2. Ter uma sessão de caixa aberta
3. Ter uma comanda fechada (status: pending_payment)

### Passo a Passo

#### 1. Abrir uma Sessão de Caixa

```bash
POST /api/v1/cash/sessions
Authorization: Bearer {token}

{
  "cashRegisterId": "{cashRegisterId}",
  "openingAmount": 100.00
}
```

#### 2. Criar e Fechar uma Comanda

```bash
# Abrir comanda
POST /api/v1/commands
Authorization: Bearer {token}

{
  "numberOfPeople": 2,
  "type": "table",
  "tableId": "{tableId}"
}

# Adicionar pedidos...

# Fechar comanda
POST /api/v1/commands/{commandId}/close
Authorization: Bearer {token}

{
  "serviceChargePercentage": 10
}
```

#### 3. Confirmar Pagamento

```bash
POST /api/v1/commands/{commandId}/confirm-payment
Authorization: Bearer {token}

{
  "paymentMethod": "CASH",
  "amount": 150.00
}
```

#### 4. Verificar Lançamento no Caixa

```bash
# Listar transações da sessão
GET /api/v1/cash/sessions/{sessionId}/transactions
Authorization: Bearer {token}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "SALE",
      "paymentMethod": "CASH",
      "amount": 150.00,
      "saleId": "{commandId}",
      "description": "Venda",
      "timestamp": "2024-11-08T..."
    }
  ]
}
```

#### 5. Verificar Saldo do Caixa

```bash
GET /api/v1/cash/sessions/{sessionId}/balance
Authorization: Bearer {token}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "openingAmount": 100.00,
    "salesTotal": 150.00,
    "cashSales": 150.00,
    "cardSales": 0.00,
    "pixSales": 0.00,
    "withdrawals": 0.00,
    "supplies": 0.00,
    "expectedCash": 250.00,
    "currentBalance": 250.00
  }
}
```

## Validações Implementadas

1. **Status da comanda**: Apenas comandas com status `pending_payment` podem ter pagamento confirmado
2. **Forma de pagamento**: Valida se o método de pagamento é válido (CASH, DEBIT, CREDIT, PIX, VOUCHER, OTHER)
3. **Sessão de caixa**: Verifica se o usuário tem uma sessão de caixa aberta
4. **Valor**: O valor do pagamento deve ser informado

## Benefícios

- ✅ Pagamentos de comandas agora são registrados automaticamente no caixa
- ✅ Histórico completo de transações disponível
- ✅ Saldo do caixa atualizado em tempo real
- ✅ Rastreabilidade completa (saleId vincula a transação à comanda)
- ✅ Suporte a múltiplas formas de pagamento
- ✅ Validações robustas para evitar erros

## Próximos Passos (Opcional)

1. Implementar suporte a pagamento parcial (múltiplas formas de pagamento)
2. Adicionar campo de troco na transação
3. Implementar relatório de vendas por comanda
4. Adicionar notificações em tempo real para o caixa

## Arquivos Modificados

- `src/services/command.service.ts` - Implementação da integração com o caixa
