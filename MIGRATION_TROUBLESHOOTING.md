# 🔧 Troubleshooting - Migrations

## Problema Atual

Erro ao aplicar migration:
```
Error: P3006
Migration `20241105000001_add_stock_item_image` failed to apply cleanly to the shadow database.
```

## Soluções

### Opção 1: Marcar Migrations Antigas como Aplicadas (Recomendado)
Execute: `FIX_MIGRATIONS.bat`

Isso vai:
1. Marcar migrations antigas como já aplicadas
2. Gerar Prisma Client
3. Aplicar apenas a nova migration de CMV

### Opção 2: Reset Completo (⚠️ APAGA TODOS OS DADOS!)
Execute: `RESET_AND_MIGRATE.bat`

Isso vai:
1. Resetar o banco de dados completamente
2. Aplicar todas as migrations do zero
3. Gerar Prisma Client

**AVISO**: Todos os dados serão perdidos!

### Opção 3: Aplicar Manualmente via SQL

1. Conecte ao banco de dados
2. Execute o SQL da migration manualmente:

```sql
-- Copie o conteúdo de:
prisma/migrations/20250106000001_add_recipes_and_cmv/migration.sql
```

3. Marque a migration como aplicada:
```bash
npx prisma migrate resolve --applied 20250106000001_add_recipes_and_cmv
```

4. Gere o Prisma Client:
```bash
npx prisma generate
```

## Verificar Status das Migrations

```bash
npx prisma migrate status
```

## Entender o Erro

O erro P3006 ocorre quando:
- Uma migration antiga referencia uma tabela que não existe no shadow database
- Há conflito entre migrations
- O schema do banco não está sincronizado

## Prevenção

Para evitar esse problema no futuro:
1. Sempre use `npx prisma migrate dev` em desenvolvimento
2. Use `npx prisma migrate deploy` em produção
3. Não edite migrations já aplicadas
4. Mantenha o schema.prisma sincronizado

## Comandos Úteis

### Ver status
```bash
npx prisma migrate status
```

### Resolver migration como aplicada
```bash
npx prisma migrate resolve --applied NOME_DA_MIGRATION
```

### Resolver migration como revertida
```bash
npx prisma migrate resolve --rolled-back NOME_DA_MIGRATION
```

### Gerar apenas o client
```bash
npx prisma generate
```

### Reset completo (⚠️ APAGA DADOS!)
```bash
npx prisma migrate reset --force
```

## Após Resolver

1. Reinicie o backend:
```bash
npm run dev
```

2. Teste as APIs:
```
http://localhost:3000/api/docs
```

3. Verifique se as novas tabelas existem:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('recipes', 'recipe_ingredients', 'cmv_periods');
```

## Suporte

Se o problema persistir:
1. Verifique os logs do Prisma
2. Verifique a conexão com o banco
3. Verifique se o usuário tem permissões adequadas
4. Considere usar `RESET_AND_MIGRATE.bat` (⚠️ apaga dados!)
