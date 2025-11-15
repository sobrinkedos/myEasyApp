# Deploy Fullstack na Vercel - Guia Completo

## 🎯 Configuração Atual

Seu projeto está configurado para rodar **backend e frontend juntos na Vercel**:
- Frontend (React + Vite): `/` 
- Backend (Node.js + Express): `/api/*`

## 📋 Variáveis de Ambiente Necessárias

### 1. Acesse a Vercel

1. Vá para: https://vercel.com/rilton-oliveira-de-souzas-projects/myeasyapp
2. Clique em **Settings**
3. No menu lateral, clique em **Environment Variables**

### 2. Adicione as Variáveis do Backend

Clique em **Add New** e adicione cada variável abaixo:

#### Variáveis Essenciais:

```bash
# Node Environment
NODE_ENV=production

# Database (Neon)
DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Redis (Upstash)
REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379

# JWT (gere uma string aleatória segura)
JWT_SECRET=sua-chave-secreta-muito-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=12

# CORS (URL do seu frontend na Vercel)
CORS_ORIGIN=https://vite-react-nu-one-62.vercel.app

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

#### Variável do Frontend:

```bash
# URL da API (mesma URL do projeto, pois backend e frontend estão juntos)
VITE_API_URL=/api/v1
```

**Importante:** Para cada variável, marque **Production**, **Preview** e **Development**.

### 3. Gerar JWT_SECRET Seguro

Execute no terminal local:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e use como `JWT_SECRET`.

### 4. Fazer Redeploy

Após adicionar todas as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos **3 pontinhos** do último deployment
3. Clique em **Redeploy**
4. Aguarde o build completar (2-3 minutos)

## ✅ Verificar se Funcionou

### 1. Testar o Backend

Abra no navegador:
```
https://vite-react-nu-one-62.vercel.app/api/v1/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T..."
}
```

### 2. Testar o Frontend

1. Acesse: https://vite-react-nu-one-62.vercel.app
2. Tente fazer login
3. Abra DevTools (F12) → Network
4. Verifique se as requisições para `/api/v1/*` estão funcionando

## 🐛 Troubleshooting

### Backend retorna 404

**Problema:** O backend não está sendo executado.

**Solução:**
1. Verifique se todas as variáveis de ambiente foram adicionadas
2. Veja os logs do deployment na Vercel
3. Confirme que o `vercel.json` está correto

### Erro de CORS

**Problema:** Frontend não consegue acessar o backend.

**Solução:**
1. Verifique se `CORS_ORIGIN` está configurado corretamente
2. Use a URL exata do frontend (sem barra no final)
3. Ou use `*` temporariamente para testar

### Database Connection Error

**Problema:** Backend não consegue conectar ao banco.

**Solução:**
1. Verifique se `DATABASE_URL` está correto
2. Teste a conexão no Neon Dashboard
3. Confirme que o IP da Vercel não está bloqueado

### Redis Connection Error

**Problema:** Backend não consegue conectar ao Redis.

**Solução:**
1. Verifique se `REDIS_URL` está correto
2. Teste a conexão no Upstash Dashboard
3. Confirme que a URL usa `rediss://` (com dois 's')

## 📊 Estrutura do Projeto na Vercel

```
https://vite-react-nu-one-62.vercel.app/
├── /                    → Frontend (React + Vite)
├── /login              → Página de login
├── /dashboard          → Dashboard
└── /api/v1/            → Backend (Node.js + Express)
    ├── /auth/login     → Login endpoint
    ├── /auth/register  → Register endpoint
    ├── /products       → Products API
    └── ...             → Outras rotas
```

## 🎯 Vantagens desta Configuração

✅ **Um único deploy** - Backend e frontend juntos
✅ **Sem CORS issues** - Mesma origem
✅ **URLs relativas** - `/api/v1` funciona automaticamente
✅ **Mais simples** - Menos configuração
✅ **Mais barato** - Um projeto só

## 📝 Notas Importantes

- ⚠️ A Vercel tem limite de **10 segundos** para funções serverless
- ⚠️ Operações longas devem ser otimizadas
- ⚠️ Upload de arquivos tem limite de **4.5MB** no plano gratuito
- ✅ Para produção séria, considere separar backend (Railway) e frontend (Vercel)

## 🔄 Próximos Passos

1. ✅ Adicionar todas as variáveis de ambiente
2. ✅ Fazer redeploy
3. ✅ Testar o backend (`/api/v1/health`)
4. ✅ Testar o frontend (fazer login)
5. ✅ Verificar logs se houver erros

---

**Pronto!** Seu app fullstack estará rodando na Vercel! 🚀
