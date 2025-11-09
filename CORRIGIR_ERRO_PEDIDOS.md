# 🔧 Correção do Erro de Foreign Key - Pedidos Balcão

## ❌ Erro Atual
```
Foreign key constraint violated: `counter_order_items_productId_fkey (index)`
```

## 🎯 Causa do Problema
A tabela `counter_order_items` tem uma foreign key que força o campo `productId` a referenciar APENAS a tabela `Product`. Porém, o sistema precisa aceitar:
- ✅ Produtos manufaturados (tabela `Product`)
- ✅ Produtos de revenda (tabela `stock_items`)

## 🛠️ Solução

### Passo 1: Acessar o Neon Console
1. Abra: https://console.neon.tech/
2. Faça login
3. Selecione seu projeto: **neondb**

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Você verá uma área para escrever SQL

### Passo 3: Executar o SQL de Correção
Cole este código e clique em **"Run"**:

```sql
-- Remover a constraint problemática
ALTER TABLE "counter_order_items" 
    DROP CONSTRAINT IF EXISTS "counter_order_items_productId_fkey";

-- Criar índice para performance (opcional mas recomendado)
CREATE INDEX IF NOT EXISTS "counter_order_items_productId_idx" 
    ON "counter_order_items"("productId");

-- Verificar se funcionou
SELECT 'Constraint removida com sucesso!' as status;
```

### Passo 4: Verificar se Funcionou
Após executar, você deve ver a mensagem: **"Constraint removida com sucesso!"**

### Passo 5: Testar no Sistema
1. Volte para a página de criar pedido balcão
2. Adicione um produto (qualquer um)
3. Clique em "Criar Pedido Balcão"
4. ✅ Deve funcionar agora!

## 🔍 Como Verificar se a Constraint Existe
Se quiser verificar antes de remover, execute:

```sql
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'counter_order_items'::regclass
AND conname = 'counter_order_items_productId_fkey';
```

Se retornar alguma linha, a constraint existe e precisa ser removida.

## ⚠️ Importante
- Esta alteração é **segura** e **necessária** para o funcionamento correto
- Não afeta outros dados do sistema
- Permite que pedidos balcão usem qualquer tipo de produto
- A validação de que o produto existe continua sendo feita no código (service layer)

## 📞 Se Ainda Não Funcionar
Se após executar o SQL o erro persistir:
1. Verifique se você está conectado ao banco correto (neondb)
2. Tente recarregar a página do sistema (Ctrl+F5)
3. Verifique os logs do backend para ver se há outro erro
