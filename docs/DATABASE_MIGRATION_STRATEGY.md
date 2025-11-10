# 🛡️ Estratégia de Migração de Banco de Dados

## 🎯 Objetivo

Garantir que:
1. ❌ **NUNCA** seja possível resetar o banco de dados em produção
2. ✅ Migrações sejam aplicadas de forma segura sem perda de dados
3. ✅ Desenvolvimento continue ágil com resets quando necessário
4. ✅ Processo de deploy seja seguro e auditável

---

## 🚨 Problema Identificado

### Situação Atual
- `prisma migrate dev` pode resetar o banco
- `prisma db push` sobrescreve schema sem histórico
- Sem proteção contra operações destrutivas em produção
- Risco de perda de dados em produção

### Riscos
- 🔴 **CRÍTICO**: Reset acidental em produção
- 🔴 **CRÍTICO**: Perda de dados de clientes
- 🟡 **ALTO**: Migrations não testadas em produção
- 🟡 **ALTO**: Rollback difícil ou impossível

---

## ✅ Solução Proposta

### 1. Ambientes Separados

```
┌─────────────────────────────────────────────┐
│  DESENVOLVIMENTO (Local)                     │
│  - Resets permitidos                        │
│  - prisma migrate dev                       │
│  - prisma db push                           │
│  - Dados de teste                           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  STAGING (Neon - Branch)                    │
│  - Resets NÃO permitidos                    │
│  - prisma migrate deploy                    │
│  - Dados similares a produção               │
│  - Testes de migração                       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  PRODUÇÃO (Neon - Main)                     │
│  - Resets BLOQUEADOS                        │
│  - prisma migrate deploy APENAS             │
│  - Dados reais                              │
│  - Backup automático                        │
└─────────────────────────────────────────────┘
```

### 2. Variáveis de Ambiente

```env
# .env.development (Local)
DATABASE_URL="postgresql://user:pass@localhost:5432/myeasyapp_dev"
NODE_ENV="development"
ALLOW_DB_RESET="true"

# .env.staging
DATABASE_URL="postgresql://...neon.tech/myeasyapp_staging"
NODE_ENV="staging"
ALLOW_DB_RESET="false"

# .env.production
DATABASE_URL="postgresql://...neon.tech/myeasyapp_prod"
NODE_ENV="production"
ALLOW_DB_RESET="false"
```

---

## 🔒 Implementação de Proteções

### 1. Script de Proteção

Criar `scripts/check-environment.js`:

```javascript
const environment = process.env.NODE_ENV;
const allowReset = process.env.ALLOW_DB_RESET === 'true';
const databaseUrl = process.env.DATABASE_URL;

// Verificar se é produção
const isProduction = environment === 'production' || 
                     databaseUrl?.includes('neon.tech') && 
                     !databaseUrl?.includes('staging');

// Verificar comando executado
const command = process.argv[2];
const dangerousCommands = ['reset', 'push', 'migrate dev'];

if (isProduction && dangerousCommands.some(cmd => command?.includes(cmd))) {
  console.error('❌ ERRO: Operação bloqueada em produção!');
  console.error('🚨 Comandos destrutivos não são permitidos em produção.');
  console.error('✅ Use: npm run migrate:deploy');
  process.exit(1);
}

if (!allowReset && command?.includes('reset')) {
  console.error('❌ ERRO: Reset bloqueado neste ambiente!');
  console.error('🔒 ALLOW_DB_RESET=false');
  process.exit(1);
}

console.log('✅ Verificação de ambiente: OK');
```

### 2. Atualizar package.json

```json
{
  "scripts": {
    // Desenvolvimento (Local)
    "db:reset": "node scripts/check-environment.js reset && prisma migrate reset --force",
    "db:push": "node scripts/check-environment.js push && prisma db push",
    "db:migrate": "node scripts/check-environment.js migrate && prisma migrate dev",
    
    // Staging e Produção
    "migrate:deploy": "prisma migrate deploy",
    "migrate:status": "prisma migrate status",
    
    // Geração de cliente (seguro em todos os ambientes)
    "db:generate": "prisma generate",
    
    // Backup (produção)
    "db:backup": "node scripts/backup-database.js",
    
    // Seed (cuidado em produção)
    "db:seed": "node scripts/check-environment.js seed && prisma db seed"
  }
}
```

### 3. Configurar Prisma

Atualizar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Adicionar proteção contra migrations acidentais
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

---

## 📋 Processo de Migração Seguro

### Desenvolvimento (Local)

```bash
# 1. Fazer alterações no schema
# Editar prisma/schema.prisma

# 2. Criar migration
npm run db:migrate -- --name add_new_feature

# 3. Testar localmente
npm run dev

# 4. Se necessário, resetar
npm run db:reset
```

### Staging

```bash
# 1. Deploy para staging
git push origin staging

# 2. Aplicar migrations
NODE_ENV=staging npm run migrate:deploy

# 3. Verificar status
NODE_ENV=staging npm run migrate:status

# 4. Testar aplicação
# Executar testes E2E
```

### Produção

```bash
# 1. Backup OBRIGATÓRIO
npm run db:backup

# 2. Verificar migrations pendentes
NODE_ENV=production npm run migrate:status

# 3. Aplicar migrations
NODE_ENV=production npm run migrate:deploy

# 4. Verificar aplicação
# Monitorar logs e métricas

# 5. Rollback se necessário
# Restaurar backup se algo der errado
```

---

## 🔐 Checklist de Segurança

### Antes de Criar Migration

- [ ] Schema alterado está correto
- [ ] Migration testada localmente
- [ ] Dados de teste validados
- [ ] Rollback planejado

### Antes de Deploy em Staging

- [ ] Código revisado (PR aprovado)
- [ ] Testes passando
- [ ] Migration testada localmente
- [ ] Documentação atualizada

### Antes de Deploy em Produção

- [ ] ✅ **BACKUP CRIADO**
- [ ] Migration testada em staging
- [ ] Janela de manutenção agendada
- [ ] Equipe notificada
- [ ] Plano de rollback pronto
- [ ] Monitoramento ativo

---

## 🛠️ Scripts Auxiliares

### 1. Backup Automático

Criar `scripts/backup-database.js`:

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, '../backups');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Criar diretório se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Extrair dados da DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
const command = `pg_dump "${dbUrl}" > "${backupFile}"`;

console.log('🔄 Criando backup do banco de dados...');

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro ao criar backup:', error);
    process.exit(1);
  }
  
  console.log('✅ Backup criado com sucesso!');
  console.log(`📁 Arquivo: ${backupFile}`);
  
  // Manter apenas últimos 10 backups
  cleanOldBackups(backupDir);
});

function cleanOldBackups(dir) {
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('backup-'))
    .sort()
    .reverse();
  
  if (files.length > 10) {
    files.slice(10).forEach(file => {
      fs.unlinkSync(path.join(dir, file));
      console.log(`🗑️  Backup antigo removido: ${file}`);
    });
  }
}
```

### 2. Verificação de Ambiente

Criar `scripts/verify-production.js`:

```javascript
const databaseUrl = process.env.DATABASE_URL;

const isProduction = 
  process.env.NODE_ENV === 'production' ||
  databaseUrl?.includes('neon.tech') && !databaseUrl?.includes('staging');

if (isProduction) {
  console.log('🔴 AMBIENTE DE PRODUÇÃO DETECTADO');
  console.log('⚠️  Operações destrutivas estão BLOQUEADAS');
  console.log('✅ Use apenas: npm run migrate:deploy');
  
  // Verificar se há migrations pendentes
  const { execSync } = require('child_process');
  try {
    const status = execSync('npx prisma migrate status', { encoding: 'utf-8' });
    console.log('\n📊 Status das migrations:');
    console.log(status);
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
  }
} else {
  console.log('🟢 Ambiente de desenvolvimento/staging');
  console.log('✅ Operações de desenvolvimento permitidas');
}
```

---

## 📊 Monitoramento

### Logs de Migration

Criar `scripts/log-migration.js`:

```javascript
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/migrations.log');
const timestamp = new Date().toISOString();
const environment = process.env.NODE_ENV;
const migration = process.argv[2];

const logEntry = `
[${timestamp}] ${environment.toUpperCase()}
Migration: ${migration}
User: ${process.env.USER || 'unknown'}
Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'}
---
`;

fs.appendFileSync(logFile, logEntry);
console.log('📝 Migration registrada no log');
```

---

## 🚀 Configuração do Neon (Recomendado)

### Branches do Neon

```bash
# Criar branch de staging
neon branches create --name staging --parent main

# Criar branch de desenvolvimento (opcional)
neon branches create --name development --parent main
```

### Configurar URLs

```env
# .env.development
DATABASE_URL="postgresql://...@...neon.tech/myeasyapp?options=endpoint%3Ddevelopment"

# .env.staging
DATABASE_URL="postgresql://...@...neon.tech/myeasyapp?options=endpoint%3Dstaging"

# .env.production
DATABASE_URL="postgresql://...@...neon.tech/myeasyapp?options=endpoint%3Dmain"
```

---

## 📚 Boas Práticas

### DO ✅

1. **Sempre criar backup antes de migration em produção**
2. **Testar migrations em staging primeiro**
3. **Usar `prisma migrate deploy` em produção**
4. **Documentar todas as migrations**
5. **Manter histórico de migrations no git**
6. **Usar transactions em migrations complexas**
7. **Planejar rollback antes de aplicar**

### DON'T ❌

1. **NUNCA usar `prisma migrate reset` em produção**
2. **NUNCA usar `prisma db push` em produção**
3. **NUNCA deletar migrations aplicadas**
4. **NUNCA modificar migrations já aplicadas**
5. **NUNCA aplicar migrations sem backup**
6. **NUNCA aplicar migrations sem testar**
7. **NUNCA ignorar warnings do Prisma**

---

## 🆘 Plano de Recuperação

### Se algo der errado em Produção

```bash
# 1. PARAR A APLICAÇÃO IMEDIATAMENTE
pm2 stop all

# 2. RESTAURAR BACKUP
psql "${DATABASE_URL}" < backups/backup-TIMESTAMP.sql

# 3. REVERTER CÓDIGO
git revert HEAD
git push origin main

# 4. REINICIAR APLICAÇÃO
pm2 start all

# 5. VERIFICAR FUNCIONAMENTO
curl https://api.myeasyapp.com/health

# 6. NOTIFICAR EQUIPE
# Enviar relatório do incidente
```

---

## 📝 Checklist de Deploy

### Pré-Deploy

- [ ] Código revisado e aprovado
- [ ] Testes passando (unit + integration + e2e)
- [ ] Migration testada em staging
- [ ] Backup criado
- [ ] Janela de manutenção agendada
- [ ] Equipe notificada
- [ ] Plano de rollback documentado

### Durante Deploy

- [ ] Aplicar migration
- [ ] Verificar logs
- [ ] Testar endpoints críticos
- [ ] Monitorar métricas

### Pós-Deploy

- [ ] Verificar funcionamento
- [ ] Monitorar por 1 hora
- [ ] Documentar mudanças
- [ ] Notificar conclusão

---

## 🎯 Resumo

### Comandos por Ambiente

**Desenvolvimento (Local)**:
```bash
npm run db:migrate    # Criar e aplicar migration
npm run db:reset      # Resetar banco (permitido)
npm run db:push       # Push rápido (permitido)
```

**Staging**:
```bash
npm run migrate:deploy  # Aplicar migrations
npm run migrate:status  # Verificar status
```

**Produção**:
```bash
npm run db:backup       # SEMPRE primeiro!
npm run migrate:deploy  # Aplicar migrations
npm run migrate:status  # Verificar status
```

---

**Criado**: 10/11/2025  
**Versão**: 1.0  
**Status**: Pronto para implementação
