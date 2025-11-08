# Setup do Sistema de Caixa

## Problema: Erro 400 ao Abrir Caixa

Se você está recebendo erro 400 ao tentar abrir o caixa, é porque não existem CashRegisters cadastrados no banco de dados.

## Solução: Criar Caixas de Teste

Execute o seguinte comando para criar caixas de teste:

```bash
npx ts-node prisma/seed-cash-registers.ts
```

Isso criará 3 caixas:
- Caixa 1 - Principal
- Caixa 2 - Secundário  
- Caixa 3 - Delivery

## Verificar se os Caixas Foram Criados

Você pode verificar usando o Prisma Studio:

```bash
npm run prisma:studio
```

Ou fazendo uma query direta:

```bash
npx prisma db execute --stdin <<< "SELECT * FROM cash_registers;"
```

## Criar Caixas Manualmente

Se preferir criar manualmente via SQL:

```sql
INSERT INTO cash_registers (id, number, name, "establishmentId", "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 1, 'Caixa 1', 'SEU_ESTABLISHMENT_ID', true, NOW(), NOW()),
  (gen_random_uuid(), 2, 'Caixa 2', 'SEU_ESTABLISHMENT_ID', true, NOW(), NOW());
```

Substitua `SEU_ESTABLISHMENT_ID` pelo ID do seu estabelecimento.

## Testar o Sistema

Após criar os caixas:

1. Acesse: http://localhost:5173/cash
2. Clique em "Abrir Caixa"
3. Selecione um caixa da lista
4. Informe o valor de abertura (R$ 50 - R$ 500)
5. Clique em "Abrir Caixa"

## Endpoints Disponíveis

- `GET /api/v1/cash/registers` - Listar caixas disponíveis
- `POST /api/v1/cash/sessions` - Abrir caixa
- `GET /api/v1/cash/sessions/active` - Buscar caixa ativo
- `POST /api/v1/cash/sessions/:id/withdrawals` - Sangria
- `POST /api/v1/cash/sessions/:id/supplies` - Suprimento
- `POST /api/v1/cash/sessions/:id/close` - Fechar caixa

## Troubleshooting

### Erro: "Operador já possui um caixa aberto"
- Você só pode ter um caixa aberto por vez
- Feche o caixa atual antes de abrir outro

### Erro: "Valor de abertura deve estar entre R$ 50 e R$ 500"
- Verifique se o valor está no intervalo correto
- Use ponto (.) como separador decimal

### Erro: "Sangria não pode deixar saldo abaixo do valor de abertura"
- A sangria não pode retirar o fundo de troco
- Verifique o saldo disponível antes de fazer a sangria

## Próximos Passos

Após configurar os caixas, você pode:

1. ✅ Abrir caixa
2. ✅ Fazer sangrias
3. ✅ Fazer suprimentos
4. 🔄 Fechar caixa (em desenvolvimento)
5. 🔄 Ver histórico de transações (em desenvolvimento)
