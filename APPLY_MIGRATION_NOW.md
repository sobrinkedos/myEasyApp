# 🚀 Aplicar Migration AGORA - Guia Passo a Passo

## ⚡ Método Rápido (5 minutos)

### Passo 1: Abrir Neon Console
1. Acesse: **https://console.neon.tech**
2. Faça login
3. Selecione o projeto: **ep-ancient-smoke-aef5zrjy**

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"** ou **"Query"**
2. Você verá um editor de SQL

### Passo 3: Executar o Script
1. Abra o arquivo: **`scripts/migration-commands.sql`**
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** do Neon (Ctrl+V)
4. Clique em **"Run"** ou pressione **Ctrl+Enter**

### Passo 4: Verificar Resultado
Você deve ver:
```
✓ CREATE TYPE
✓ CREATE TABLE (counter_orders)
✓ CREATE TABLE (counter_order_items)
✓ CREATE INDEX (5x)
✓ ALTER TABLE (4x)
✓ SELECT "Migration concluída com sucesso!"
```

### Passo 5: Gerar Prisma Client
No terminal do projeto:
```bash
# Feche o VS Code primeiro
# Abra PowerShell como Administrador
cd C:\newProjects\myEasyApp
npx prisma generate
```

### Passo 6: Iniciar Servidor
```bash
npm run dev
```

### Passo 7: Testar
Acesse: **http://localhost:3000/api/docs**

Procure pela tag **"Counter Orders"** - você verá 9 endpoints disponíveis!

---

## 🆘 Se der erro "type already exists"

Execute este comando primeiro no Neon SQL Editor:
```sql
DROP TYPE IF EXISTS "CounterOrderStatus" CASCADE;
```

Depois execute o script completo novamente.

---

## 🆘 Se der erro "table already exists"

Execute estes comandos no Neon SQL Editor:
```sql
DROP TABLE IF EXISTS "counter_order_items" CASCADE;
DROP TABLE IF EXISTS "counter_orders" CASCADE;
DROP TYPE IF EXISTS "CounterOrderStatus" CASCADE;
```

Depois execute o script completo novamente.

---

## ✅ Como Verificar se Funcionou

Execute no Neon SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'counter_%';
```

**Resultado esperado:**
```
counter_orders
counter_order_items
```

---

## 🎯 Teste Rápido da API

Depois de iniciar o servidor, teste criar um pedido:

```bash
POST http://localhost:3000/api/v1/counter-orders
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "customerName": "Teste",
  "items": [
    {
      "productId": "{uuid-de-um-produto}",
      "quantity": 1
    }
  ]
}
```

Se retornar status 201 com um pedido criado, **SUCESSO!** 🎉

---

## 📞 Precisa de Ajuda?

1. Verifique se está logado no Neon Console
2. Verifique se selecionou o projeto correto
3. Copie e cole o script exatamente como está
4. Execute tudo de uma vez (não linha por linha)

**Tempo estimado:** 5 minutos ⏱️
