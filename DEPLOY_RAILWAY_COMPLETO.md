# 🚀 Deploy Completo - Railway (Backend) + Vercel (Frontend)

## 📋 Visão Geral

- **Backend**: Railway (Node.js + Express + Prisma)
- **Frontend**: Vercel (React + Vite)
- **Banco**: Neon (PostgreSQL)
- **Cache**: Upstash (Redis)

**Tempo total: ~20 minutos**

---

## PARTE 1: Deploy do Backend no Railway (10 minutos)

### Passo 1: Criar Conta no Railway (2 minutos)

1. Acesse: https://railway.app
2. Clique em **"Login with GitHub"**
3. Autorize o Railway a acessar seus repositórios
4. Você ganha **$5 grátis/mês** (suficiente para desenvolvimento)

### Passo 2: Criar Novo Projeto (1 minuto)

1. No Dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: **`sobrinkedos/myEasyApp`**
4. Selecione a branch: **`master`**
5. Clique em **"Deploy Now"**

O Railway vai começar a fazer o build automaticamente usando Nixpacks.

### Passo 3: Gerar JWT_SECRET (30 segundos)

Enquanto o build acontece, abra o terminal e execute:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copie o resultado** (será algo como: `a1b2c3d4e5f6...`)

### Passo 4: Adicionar Variáveis de Ambiente (5 minutos)

1. No Railway, clique no seu projeto
2. Clique na aba **"Variables"**
3. Clique em **"New Variable"**
4. Adicione cada variável abaixo:

#### Variáveis Obrigatórias:

```bash
# 1. Node Environment
NODE_ENV=production

# 2. Port (Railway define automaticamente, mas é bom ter)
PORT=3000

# 3. Database URL (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# 4. Redis URL (Upstash)
REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379

# 5. JWT Secret (use o valor gerado no Passo 3)
JWT_SECRET=[COLE O VALOR GERADO]

# 6. JWT Expiration
JWT_EXPIRES_IN=7d

# 7. Bcrypt Rounds
BCRYPT_ROUNDS=12

# 8. CORS Origin (URL do frontend na Vercel)
CORS_ORIGIN=https://myeasyapp.vercel.app

# 9. Log Level
LOG_LEVEL=info

# 10. Max File Size
MAX_FILE_SIZE=5242880

# 11. Upload Directory
UPLOAD_DIR=./uploads

# 12. Rate Limit Window
RATE_LIMIT_WINDOW=60000

# 13. Rate Limit Max
RATE_LIMIT_MAX=100
```

**Importante:** Cole cada variável uma por vez no Railway.

### Passo 5: Aguardar o Deploy (2 minutos)

1. Vá na aba **"Deployments"**
2. Aguarde o build completar (você verá os logs em tempo real)
3. Quando aparecer **"Success"**, o backend está no ar!

### Passo 6: Gerar Domínio Público (1 minuto)

1. Clique na aba **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. **Copie a URL gerada** (ex: `myeasyapp-production.up.railway.app`)

### Passo 7: Testar o Backend (30 segundos)

Abra no navegador:
```
https://sua-url-railway.up.railway.app/health
```

Deve retornar JSON com:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

✅ **Backend funcionando!**

---

## PARTE 2: Configurar Frontend na Vercel (5 minutos)

### Passo 1: Adicionar Variável de Ambiente (2 minutos)

1. Acesse: https://vercel.com/rilton-oliveira-de-souzas-projects/myeasyapp
2. Clique em **"Settings"** (barra superior)
3. No menu lateral: **"Environment Variables"**
4. Clique em **"Add New"**

Adicione:

```
Key: VITE_API_URL
Value: https://sua-url-railway.up.railway.app/api/v1
```

**Importante:** Substitua `sua-url-railway.up.railway.app` pela URL que você copiou no Passo 6 da Parte 1.

5. Marque: ✅ **Production**, ✅ **Preview**, ✅ **Development**
6. Clique em **"Save"**

### Passo 2: Fazer Redeploy (1 minuto)

1. Vá para a aba **"Deployments"**
2. Clique nos **3 pontinhos** (...) do último deployment
3. Clique em **"Redeploy"**
4. Aguarde 2-3 minutos

### Passo 3: Testar o Frontend (2 minutos)

1. Acesse: https://myeasyapp.vercel.app
2. Tente fazer login
3. Abra DevTools (F12) → Network
4. Verifique se as requisições vão para a URL do Railway

✅ **Frontend conectado ao backend!**

---

## PARTE 3: Atualizar CORS no Backend (2 minutos)

Se você tiver problemas de CORS:

1. Volte no Railway
2. Vá em **"Variables"**
3. Edite a variável **`CORS_ORIGIN`**
4. Certifique-se que está: `https://myeasyapp.vercel.app`
5. O Railway vai fazer redeploy automaticamente

---

## 📋 Checklist Final

### Backend (Railway):
- [ ] Projeto criado no Railway
- [ ] Repositório conectado
- [ ] 13 variáveis de ambiente adicionadas
- [ ] Deploy completado com sucesso
- [ ] Domínio gerado
- [ ] `/health` retorna status "ok"

### Frontend (Vercel):
- [ ] `VITE_API_URL` adicionada
- [ ] Redeploy feito
- [ ] Login funciona
- [ ] Requisições vão para o Railway

---

## 🐛 Troubleshooting

### Backend não inicia no Railway

**Veja os logs:**
1. Railway → Seu projeto → **"Deployments"**
2. Clique no deployment ativo
3. Veja os logs de erro

**Problemas comuns:**
- `DATABASE_URL` incorreto → Verifique no Neon
- `REDIS_URL` incorreto → Verifique no Upstash
- `JWT_SECRET` não configurado → Gere e adicione

### Frontend não conecta ao backend

**Verifique:**
1. `VITE_API_URL` está correto?
2. Você fez redeploy após adicionar a variável?
3. A URL do Railway está acessível?

**Teste direto:**
```
https://sua-url-railway.up.railway.app/api/v1/health
```

### Erro de CORS

**Solução:**
1. Railway → **"Variables"**
2. Edite `CORS_ORIGIN`
3. Use a URL exata do Vercel: `https://myeasyapp.vercel.app`
4. Ou use `*` temporariamente para testar

### Database connection error

**Verifique:**
1. `DATABASE_URL` tem `?sslmode=require` no final
2. Banco está ativo no Neon Dashboard
3. IP do Railway não está bloqueado

### Redis connection error

**Verifique:**
1. `REDIS_URL` usa `rediss://` (com dois 's')
2. Redis está ativo no Upstash Dashboard
3. Credenciais estão corretas

---

## 💰 Custos

### Railway (Plano Gratuito)
- **$5 de crédito grátis** todo mês
- ~500 horas de execução
- Perfeito para desenvolvimento

### Vercel (Plano Gratuito)
- 100GB-hours/mês
- Deploy ilimitado
- Perfeito para frontend

### Neon (Plano Gratuito)
- 0.5GB de storage
- Perfeito para desenvolvimento

### Upstash (Plano Gratuito)
- 10,000 comandos/dia
- Perfeito para desenvolvimento

**Total: GRÁTIS para desenvolvimento!** 🎉

---

## 🎯 Próximos Passos

Após tudo funcionando:

1. **Criar usuário admin** (se ainda não existe)
2. **Testar todas as funcionalidades**
3. **Configurar domínio customizado** (opcional)
4. **Monitorar logs e performance**

---

## 📚 Recursos Úteis

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Upstash Docs](https://docs.upstash.com)

---

## ✅ Quando tudo estiver funcionando:

Você terá:
- ✅ Backend robusto no Railway
- ✅ Frontend rápido na Vercel
- ✅ Banco PostgreSQL no Neon
- ✅ Cache Redis no Upstash
- ✅ Deploy automático (push → deploy)
- ✅ HTTPS em tudo
- ✅ Logs e monitoramento

**Arquitetura profissional e escalável!** 🚀

---

**Comece pela PARTE 1 (Deploy do Backend no Railway)!**
