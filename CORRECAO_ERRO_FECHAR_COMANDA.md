# 🔧 Correção: Erro 500 ao Fechar Comanda

## 🐛 Problema Identificado

Ao tentar fechar uma comanda para enviar ao caixa, ocorria um erro 500 (Internal Server Error).

**Erro no console:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
POST /api/v1/commands/{id}/close
```

## 🔍 Causa Raiz

O problema estava no tipo `UpdateCommandDTO` no arquivo `src/repositories/command.repository.ts`.

O tipo definia apenas três status possíveis:
```typescript
status?: 'open' | 'closed' | 'paid';
```

Mas o código estava tentando atualizar para `'pending_payment'`:
```typescript
await this.repository.update(id, {
  status: 'pending_payment',  // ❌ Não estava no tipo!
  subtotal,
  serviceCharge,
  total,
  closedAt: new Date(),
});
```

## ✅ Solução Implementada

### 1. Atualização do Tipo UpdateCommandDTO

Adicionado o status `'pending_payment'` ao tipo:

```typescript
export interface UpdateCommandDTO {
  status?: 'open' | 'closed' | 'paid' | 'pending_payment';  // ✅ Adicionado
  subtotal?: number;
  serviceCharge?: number;
  total?: number;
  closedAt?: Date;
}
```

### 2. Melhorias no Tratamento de Erros

Adicionado try-catch e logs no método `closeCommand`:

```typescript
async closeCommand(id: string, serviceChargePercentage: number = 10): Promise<Command> {
  try {
    // ... código ...
  } catch (error) {
    console.error('Error closing command:', error);
    throw error;
  }
}
```

### 3. Tratamento Seguro de Orders

Melhorado o tratamento de orders para evitar erros de undefined:

```typescript
const orders = (command as any).orders || [];
const pendingOrders = orders.filter(
  (order: any) => order.status !== 'delivered' && order.status !== 'cancelled'
);
```

## 📊 Fluxo de Status da Comanda

```
open → pending_payment → closed
  ↓
cancelled
```

1. **open**: Comanda aberta, aceitando pedidos
2. **pending_payment**: Comanda fechada, aguardando pagamento no caixa
3. **closed**: Comanda paga e finalizada
4. **cancelled**: Comanda cancelada

## 🧪 Como Testar

### Teste 1: Fechar Comanda Sem Pedidos
```bash
POST /api/v1/commands/{id}/close
{
  "serviceChargePercentage": 10
}
```

**Resultado esperado**: ✅ Status 200, comanda com status `pending_payment`

### Teste 2: Fechar Comanda Com Pedidos Pendentes
```bash
POST /api/v1/commands/{id}/close
{
  "serviceChargePercentage": 10
}
```

**Resultado esperado**: ❌ Status 400, erro "Existem X pedidos não entregues"

### Teste 3: Fechar Comanda Já Fechada
```bash
POST /api/v1/commands/{id}/close
{
  "serviceChargePercentage": 10
}
```

**Resultado esperado**: ❌ Status 400, erro "Comanda já está fechada"

## 📝 Validações Implementadas

1. ✅ Comanda deve estar com status `open`
2. ✅ Todos os pedidos devem estar entregues ou cancelados
3. ✅ Cálculo correto de subtotal, taxa de serviço e total
4. ✅ Atualização do status para `pending_payment`
5. ✅ Registro da data de fechamento

## 🎯 Próximos Passos

Após fechar a comanda:
1. Comanda aparece na lista de "Comandas Pendentes" no caixa
2. Caixa pode confirmar o pagamento
3. Pagamento é registrado automaticamente no caixa
4. Comanda muda para status `closed`
5. Mesa é liberada (se for comanda de mesa)

## 📁 Arquivos Modificados

- `src/repositories/command.repository.ts` - Atualizado tipo UpdateCommandDTO
- `src/services/command.service.ts` - Melhorado tratamento de erros

---

**Status**: ✅ Corrigido  
**Versão**: 1.1  
**Data**: 08/11/2024
