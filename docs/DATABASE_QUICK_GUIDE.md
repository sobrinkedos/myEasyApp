# 🚀 Guia Rápido - Migrations Seguras

## 📋 Comandos por Ambiente

### 🟢 Desenvolvimento (Local)

```bash
# Criar nova migration
npm run db:migrate -- --name add_new_feature

# Aplicar migration existente
npm run db:migrate

# Push rápido (sem criar migration)
npm run db:push

# Resetar banco (CUIDADO!)
npm run db:reset

# Gerar cliente Prisma
npm run db:generate

# Abrir Prisma Studio
npm run db:studio

# Seed (popular com dados)
npm run db:seed
```

### 🟡 Staging

```bash
# Aplicar migrations
NODE_ENV=staging npm run migrate:deploy

# Verificar status
NODE_ENV=staging npm run migrate:status

# Gerar cliente
npm run db:generate
```

### 🔴 Produção

```bash
# 1. SEMPRE criar backup primeiro!
NODE_ENV=production npm run db:backup

# 2. Verificar migrations pendentes
NODE_ENV=production npm run migrate:status

# 3. Aplicar migrations
NODE_ENV=production npm run migrate:deploy

# 4. Listar backups
npm run db:backup:list
```

---

## 🛡️ Proteções Implementadas

### ❌ Bloqueado em Produção

- `npm run db:reset` - BLOQUEADO
- `npm run db:push` - BLOQUEADO
- `npm run db:migrate` - BLOQUEADO

### ✅ Permitido em Produção

- `npm run migrate:deploy` - Aplicar migrations
- `npm run migrate:status` - Ver status
- `npm run db:generate` - Gerar cliente
- `npm run db:backup` - Criar backup

---

## 📝 Fluxo de Trabalho

### 1. Desenvolvimento

```bash
# 1. Editar schema
vim prisma/schema.prisma

# 2. Criar migration
npm run db:migrate -- --name add_user_avatar

# 3. Testar localmente
npm run dev

# 4. Commit
git add .
git commit -m "feat: adicionar avatar do usuário"
git push
```

### 2. Deploy para Staging

```bash
# 1. Pull do código
git pull origin staging

# 2. Aplicar migrations
NODE_ENV=staging npm run migrate:deploy

# 3. Reiniciar app
pm2 restart api-staging

# 4. Testar
curl https://staging-api.myeasyapp.com/health
```

### 3. Deploy para Produção

```bash
# 1. BACKUP!
NODE_ENV=production npm run db:backup

# 2. Pull do código
git pull origin main

# 3. Verificar migrations
NODE_ENV=production npm run migrate:status

# 4. Aplicar migrations
NODE_ENV=production npm run migrate:deploy

# 5. Reiniciar app
pm2 restart api-production

# 6. Monitorar
pm2 logs api-production
```

---

## 🆘 Troubleshooting

### Erro: "Operation blocked in production"

✅ **Solução**: Use `npm run migrate:deploy` ao invés de `npm run db:migrate`

### Erro: "Reset blocked in this environment"

✅ **Solução**: Configure `ALLOW_DB_RESET=true` no `.env` (apenas desenvolvimento!)

### Erro: "pg_dump not found"

✅ **Solução**: Instale PostgreSQL client:
- macOS: `brew install postgresql`
- Ubuntu: `sudo apt-get install postgresql-client`
- Windows: Instale PostgreSQL

### Migration falhou em produção

✅ **Solução**:
```bash
# 1. Restaurar backup
psql $DATABASE_URL < backups/backup-TIMESTAMP.sql

# 2. Investigar erro
NODE_ENV=production npm run migrate:status

# 3. Corrigir e tentar novamente
```

---

## 📚 Mais Informações

- [Estratégia Completa](./DATABASE_MIGRATION_STRATEGY.md)
- [Documentação do Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)
