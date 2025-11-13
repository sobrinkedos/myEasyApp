# Deploy no Railway.app - Guia Completo

## 🎯 Por que Railway?

- ✅ **Mais simples** que Render
- ✅ **$5 grátis/mês** (suficiente para desenvolvimento)
- ✅ **Melhor suporte** para Node.js/TypeScript
- ✅ **Deploy mais rápido** (2-3 minutos)
- ✅ **Logs melhores** e mais claros
- ✅ **Nixpacks** detecta automaticamente Node.js

## 📋 Pré-requisitos

1. Conta no Railway (https://railway.app)
2. GitHub conectado
3. Banco Neon e Redis Upstash (já configurados)

## 🚀 Passo a Passo

### 1. Criar Conta no Railway

1. Acesse https://railway.app
2. Clique em "Login with GitHub"
3. Autorize o Railway
4. Você ganha **$5 grátis/mês**

### 2. Criar Novo Projeto

1. No Dashboard, clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha `sobrinkedos/myEasyApp`
4. Selecione a branch `development`

### 3. Configurar Variáveis de Ambiente

Clique em "Variables" e adicione:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379
JWT_SECRET=<gere-uma-string-aleatoria>
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=*
LOG_LEVEL=info
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### 4. Deploy Automático

O Railway detecta automaticamente:
- ✅ Node.js project
- ✅ package.json
- ✅ Build command
- ✅ Start command

Aguarde 2-3 minutos e pronto!

### 5. Obter URL

Após o deploy:
1. Clique em "Settings"
2. Em "Domains", clique em "Generate Domain"
3. Copie a URL: `https://seu-app.up.railway.app`

## 🔄 Deploy Automático

- ✅ Cada push na branch `development` → Deploy automático
- ✅ Logs em tempo real
- ✅ Rollback fácil

## 💰 Custos

### Plano Gratuito ($5/mês)
- **$5 de crédito grátis** todo mês
- Suficiente para ~500 horas de execução
- Perfeito para desenvolvimento

### Plano Hobby ($5/mês + uso)
- $5 fixo + uso adicional
- Sem sleep
- Melhor para produção

## 📊 Monitoramento

### Logs
- Acesse: Dashboard → Seu serviço → Logs
- Logs em tempo real
- Filtros por nível

### Métricas
- CPU e memória
- Network usage
- Deployment history

## 🐛 Troubleshooting

### Build falha
- Veja os logs de build
- Verifique se todas as dependências estão no package.json
- Railway usa Nixpacks (mais inteligente que Docker)

### Aplicação não inicia
- Verifique variáveis de ambiente
- Veja logs de runtime
- Teste localmente primeiro

## ✅ Vantagens sobre Render

1. **Build mais rápido** - Nixpacks é otimizado
2. **Logs melhores** - Mais claros e organizados
3. **Configuração automática** - Detecta Node.js
4. **Sem sleep** - Mesmo no plano free (com créditos)
5. **Deploy mais confiável** - Menos erros de build

## 🔗 Próximos Passos

1. Copie a URL do Railway
2. Configure no frontend (Vercel):
   - `VITE_API_URL=https://seu-app.up.railway.app/api/v1`
3. Teste a API
4. Deploy do frontend

## 📚 Recursos

- [Documentação Railway](https://docs.railway.app)
- [Nixpacks](https://nixpacks.com)
- [Railway Discord](https://discord.gg/railway)

---

**Pronto!** Seu backend estará no Railway com deploy automático! 🎉
