# API de Gestão de Caixa

## Visão Geral

Sistema completo de gestão de caixa para restaurantes, incluindo abertura, fechamento, sangrias, suprimentos e transferência para tesouraria.

## Autenticação

Todas as rotas requerem autenticação via Bearer Token JWT.

```
Authorization: Bearer <token>
```

## Permissões

- **CASH_OPERATOR**: Pode operar caixas (abrir, fechar, sangrias, suprimentos)
- **SUPERVISOR**: Pode reabrir caixas e cancelar transações
- **TREASURER**: Pode confirmar recebimentos e visualizar consolidações
- **ADMIN**: Tem todas as permissões

## Endpoints

### Sessões de Caixa

#### POST /api/v1/cash/sessions
Abre uma nova sessão de caixa.

**Permissão**: CASH_OPERATOR

**Body**:
```json
{
  "cashRegisterId": "uuid",
  "openingAmount": 100.00
}
```

**Validações**:
- Valor de abertura entre R$ 50,00 e R$ 500,00
- Operador não pode ter outro caixa aberto

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cashRegisterId": "uuid",
    "operatorId": "uuid",
    "openingAmount": 100.00,
    "status": "OPEN",
    "openedAt": "2024-01-01T10:00:00Z",
    "cashRegister": {...},
    "operator": {...}
  },
  "message": "Caixa aberto com sucesso"
}
```

---

#### GET /api/v1/cash/sessions/active
Retorna a sessão ativa do operador autenticado.

**Permissão**: CASH_OPERATOR

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "OPEN",
    "openingAmount": 100.00,
    "openedAt": "2024-01-01T10:00:00Z",
    ...
  }
}
```

---

#### GET /api/v1/cash/sessions/:id
Retorna detalhes completos de uma sessão.

**Permissão**: CASH_OPERATOR

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "OPEN",
    "openingAmount": 100.00,
    "transactions": [...],
    "counts": [...],
    "transfer": {...}
  }
}
```

---

#### POST /api/v1/cash/sessions/:id/close
Fecha uma sessão de caixa.

**Permissão**: CASH_OPERATOR

**Body**:
```json
{
  "countedAmount": 450.00,
  "counts": [
    { "denomination": 100, "quantity": 3, "total": 300 },
    { "denomination": 50, "quantity": 2, "total": 100 },
    { "denomination": 20, "quantity": 2, "total": 40 },
    { "denomination": 10, "quantity": 1, "total": 10 }
  ],
  "notes": "Justificativa se houver quebra > 1%"
}
```

**Validações**:
- Sessão deve estar OPEN
- Justificativa obrigatória se quebra > 1%

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CLOSED",
    "expectedAmount": 445.00,
    "countedAmount": 450.00,
    "difference": 5.00,
    "closedAt": "2024-01-01T18:00:00Z"
  },
  "message": "Caixa fechado com sucesso"
}
```

---

#### POST /api/v1/cash/sessions/:id/reopen
Reabre uma sessão fechada (apenas supervisores).

**Permissão**: SUPERVISOR

**Body**:
```json
{
  "reason": "Erro na contagem, necessário recontagem"
}
```

**Validações**:
- Sessão deve estar CLOSED
- Reabertura permitida apenas dentro de 24h

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "REOPENED",
    "reopenReason": "Erro na contagem..."
  },
  "message": "Caixa reaberto com sucesso"
}
```

---

#### GET /api/v1/cash/sessions
Lista sessões com filtros.

**Permissão**: CASH_OPERATOR

**Query Parameters**:
- `status`: OPEN | CLOSED | TRANSFERRED | RECEIVED | REOPENED
- `operatorId`: UUID do operador
- `startDate`: Data inicial (ISO 8601)
- `endDate`: Data final (ISO 8601)
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)

**Response 200**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### Transações

#### POST /api/v1/cash/sessions/:id/withdrawals
Registra uma sangria (retirada de dinheiro).

**Permissão**: CASH_OPERATOR

**Body**:
```json
{
  "amount": 200.00,
  "reason": "Excesso de dinheiro no caixa",
  "authorizedBy": "uuid" // Obrigatório se > R$ 200
}
```

**Validações**:
- Sessão deve estar OPEN
- Não pode deixar saldo abaixo do valor de abertura
- Autorização obrigatória para valores > R$ 200

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "amount": -200.00,
    "description": "Excesso de dinheiro no caixa",
    "timestamp": "2024-01-01T14:00:00Z"
  },
  "message": "Sangria registrada com sucesso"
}
```

---

#### POST /api/v1/cash/sessions/:id/supplies
Registra um suprimento (adição de dinheiro).

**Permissão**: CASH_OPERATOR

**Body**:
```json
{
  "amount": 100.00,
  "reason": "Necessidade de troco",
  "authorizedBy": "uuid" // Opcional
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "SUPPLY",
    "amount": 100.00,
    "description": "Necessidade de troco",
    "timestamp": "2024-01-01T15:00:00Z"
  },
  "message": "Suprimento registrado com sucesso"
}
```

---

#### GET /api/v1/cash/sessions/:id/transactions
Lista todas as transações de uma sessão.

**Permissão**: CASH_OPERATOR

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "OPENING",
      "amount": 100.00,
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "type": "SALE",
      "paymentMethod": "CASH",
      "amount": 45.00,
      "timestamp": "2024-01-01T12:30:00Z"
    }
  ]
}
```

---

#### GET /api/v1/cash/sessions/:id/balance
Retorna o saldo atual da sessão.

**Permissão**: CASH_OPERATOR

**Response 200**:
```json
{
  "success": true,
  "data": {
    "openingAmount": 100.00,
    "salesTotal": 345.00,
    "cashSales": 245.00,
    "cardSales": 80.00,
    "pixSales": 20.00,
    "withdrawals": 200.00,
    "supplies": 50.00,
    "expectedCash": 195.00,
    "currentBalance": 295.00
  }
}
```

---

#### POST /api/v1/cash/transactions/:id/cancel
Cancela uma transação (apenas supervisores).

**Permissão**: SUPERVISOR

**Body**:
```json
{
  "reason": "Transação registrada incorretamente"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Transação cancelada com sucesso"
}
```

---

### Tesouraria

#### POST /api/v1/cash/sessions/:id/transfer
Transfere valores para a tesouraria.

**Permissão**: CASH_OPERATOR

**Body**:
```json
{
  "notes": "Observações opcionais"
}
```

**Validações**:
- Sessão deve estar CLOSED
- Valor de transferência = valor contado - valor de abertura

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "cashSessionId": "uuid",
    "expectedAmount": 350.00,
    "transferredAt": "2024-01-01T18:30:00Z"
  },
  "message": "Transferência para tesouraria realizada com sucesso"
}
```

---

#### GET /api/v1/treasury/transfers/pending
Lista transferências pendentes de confirmação.

**Permissão**: TREASURER

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cashSessionId": "uuid",
      "expectedAmount": 350.00,
      "transferredAt": "2024-01-01T18:30:00Z",
      "cashSession": {...}
    }
  ]
}
```

---

#### POST /api/v1/treasury/transfers/:id/confirm
Confirma o recebimento de uma transferência.

**Permissão**: TREASURER

**Body**:
```json
{
  "receivedAmount": 350.00,
  "notes": "Observações sobre divergências"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "expectedAmount": 350.00,
    "receivedAmount": 350.00,
    "difference": 0.00,
    "receivedAt": "2024-01-01T19:00:00Z"
  },
  "message": "Recebimento confirmado com sucesso"
}
```

---

#### GET /api/v1/treasury/consolidation/daily
Retorna a consolidação diária de todos os caixas.

**Permissão**: TREASURER

**Query Parameters**:
- `date`: Data da consolidação (ISO 8601, padrão: hoje)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "totalSessions": 5,
    "totalSales": 2500.00,
    "totalCash": 1800.00,
    "totalCard": 500.00,
    "totalPix": 200.00,
    "totalWithdrawals": 400.00,
    "totalSupplies": 100.00,
    "totalTransferred": 1500.00,
    "totalBreaks": 15.00,
    "sessions": [...]
  }
}
```

---

## Códigos de Erro

- **400**: Dados inválidos
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Recurso não encontrado
- **409**: Conflito (ex: operador já tem caixa aberto)
- **422**: Regra de negócio violada
- **500**: Erro interno do servidor

## Fluxo Típico

1. **Abertura**: Operador abre o caixa com fundo de troco
2. **Operação**: Registra vendas, sangrias e suprimentos durante o dia
3. **Fechamento**: Conta o dinheiro e fecha o caixa
4. **Transferência**: Transfere valores para a tesouraria
5. **Confirmação**: Tesoureiro confirma o recebimento

## Regras de Negócio

- Operador pode ter apenas 1 caixa aberto por vez
- Fundo de troco: R$ 50,00 a R$ 500,00
- Sangria não pode deixar saldo abaixo do fundo de troco
- Quebra > 1% requer justificativa obrigatória
- Reabertura permitida apenas dentro de 24h
- Autorização obrigatória para sangrias > R$ 200,00
