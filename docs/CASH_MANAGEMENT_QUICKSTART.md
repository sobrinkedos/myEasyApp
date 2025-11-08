# Guia de Início Rápido - Sistema de Gestão de Caixa

## Pré-requisitos

- Backend rodando na porta 3000
- Usuário autenticado com papel CASH_OPERATOR
- Pelo menos 1 CashRegister cadastrado no sistema

## 1. Obter Token de Autenticação

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@restaurant.com",
    "password": "senha123"
  }'
```

Salve o token retornado para usar nas próximas requisições.

## 2. Abrir Caixa

```bash
curl -X POST http://localhost:3000/api/v1/cash/sessions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cashRegisterId": "uuid-do-caixa",
    "openingAmount": 100.00
  }'
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "status": "OPEN",
    "openingAmount": 100.00,
    "openedAt": "2024-01-01T10:00:00Z"
  }
}
```

Salve o `session-uuid` para usar nas próximas operações.

## 3. Consultar Saldo

```bash
curl -X GET http://localhost:3000/api/v1/cash/sessions/SESSION_UUID/balance \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 4. Registrar Sangria (Opcional)

```bash
curl -X POST http://localhost:3000/api/v1/cash/sessions/SESSION_UUID/withdrawals \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "reason": "Excesso de dinheiro no caixa"
  }'
```

## 5. Registrar Suprimento (Opcional)

```bash
curl -X POST http://localhost:3000/api/v1/cash/sessions/SESSION_UUID/supplies \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "reason": "Necessidade de troco"
  }'
```

## 6. Fechar Caixa

```bash
curl -X POST http://localhost:3000/api/v1/cash/sessions/SESSION_UUID/close \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "countedAmount": 195.00,
    "counts": [
      { "denomination": 100, "quantity": 1, "total": 100 },
      { "denomination": 50, "quantity": 1, "total": 50 },
      { "denomination": 20, "quantity": 2, "total": 40 },
      { "denomination": 5, "quantity": 1, "total": 5 }
    ],
    "notes": "Fechamento normal"
  }'
```

## 7. Transferir para Tesouraria

```bash
curl -X POST http://localhost:3000/api/v1/cash/sessions/SESSION_UUID/transfer \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Transferência do turno da manhã"
  }'
```

## 8. Confirmar Recebimento (Tesoureiro)

```bash
curl -X POST http://localhost:3000/api/v1/treasury/transfers/TRANSFER_UUID/confirm \
  -H "Authorization: Bearer TOKEN_TESOUREIRO" \
  -H "Content-Type: application/json" \
  -d '{
    "receivedAmount": 95.00,
    "notes": "Recebido conforme"
  }'
```

## Exemplos com JavaScript/TypeScript

### Abrir Caixa

```typescript
const response = await fetch('http://localhost:3000/api/v1/cash/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cashRegisterId: 'uuid-do-caixa',
    openingAmount: 100.00,
  }),
});

const data = await response.json();
console.log('Caixa aberto:', data.data.id);
```

### Consultar Saldo

```typescript
const response = await fetch(
  `http://localhost:3000/api/v1/cash/sessions/${sessionId}/balance`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { data } = await response.json();
console.log('Saldo atual:', data.currentBalance);
console.log('Vendas em dinheiro:', data.cashSales);
```

### Fechar Caixa

```typescript
const counts = [
  { denomination: 100, quantity: 2, total: 200 },
  { denomination: 50, quantity: 1, total: 50 },
  { denomination: 20, quantity: 3, total: 60 },
  { denomination: 10, quantity: 1, total: 10 },
  { denomination: 5, quantity: 2, total: 10 },
  { denomination: 2, quantity: 5, total: 10 },
  { denomination: 1, quantity: 5, total: 5 },
];

const totalCounted = counts.reduce((sum, c) => sum + c.total, 0);

const response = await fetch(
  `http://localhost:3000/api/v1/cash/sessions/${sessionId}/close`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      countedAmount: totalCounted,
      counts,
      notes: 'Fechamento normal',
    }),
  }
);

const { data } = await response.json();
console.log('Diferença:', data.difference);
```

## Tratamento de Erros

```typescript
try {
  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!result.success) {
    console.error('Erro:', result.error);
    // Tratar erro específico
  }
} catch (error) {
  console.error('Erro de rede:', error);
}
```

## Próximos Passos

1. Integrar com o sistema de vendas para registro automático
2. Implementar notificações em tempo real
3. Criar relatórios gerenciais
4. Adicionar dashboard de monitoramento

## Suporte

Para mais informações, consulte:
- [Documentação completa da API](./CASH_MANAGEMENT_API.md)
- [Swagger UI](http://localhost:3000/api/docs)
