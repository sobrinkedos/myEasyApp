# 🔧 Correção Urgente - API URL

## ❌ Problema Atual

O frontend está tentando acessar:
```
/auth/login/api/v1/auth/login  ❌ ERRADO
```

Deveria ser:
```
/api/v1/auth/login  ✅ CORRETO
```

## 🎯 Causa

A variável `VITE_API_URL` não está configurada na Vercel, então o código está usando o fallback incorreto.

## ✅ Solução (5 minutos)

### Passo 1: Adicionar Variável na Vercel

1. Acesse: https://vercel.com/rilton-oliveira-de-souzas-projects/myeasyapp

2. Clique em **Settings** (barra superior)

3. No menu lateral: **Environment Variables**

4. Clique em **Add New**

5. Preencha:
   ```
   Key: VITE_API_URL
   Value: /api/v1
   ```

6. Marque: ✅ Production, ✅ Preview, ✅ Development

7. Clique em **Save**

### Passo 2: Adicionar Outras Variáveis Essenciais

Enquanto está lá, adicione também (se ainda não adicionou):

```bash
NODE_ENV=production

DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379

JWT_SECRET=[gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

JWT_EXPIRES_IN=7d

BCRYPT_ROUNDS=12

CORS_ORIGIN=https://vite-react-nu-one-62.vercel.app

LOG_LEVEL=info
```

### Passo 3: Redeploy

1. Vá para a aba **Deployments**

2. Clique nos **3 pontinhos** do último deployment

3. Clique em **Redeploy**

4. Aguarde 2-3 minutos

### Passo 4: Testar

1. Acesse: https://vite-react-nu-one-62.vercel.app

2. Tente fazer login novamente

3. Abra DevTools (F12) → Network

4. Verifique se a URL agora é: `/api/v1/auth/login` ✅

## 🐛 Se ainda der erro 500

O erro 500 significa que o backend está respondendo, mas com erro interno. Possíveis causas:

### 1. Banco de dados não conectado
- Verifique se `DATABASE_URL` está correto
- Teste no Neon Dashboard

### 2. Redis não conectado
- Verifique se `REDIS_URL` está correto (com `rediss://`)
- Teste no Upstash Dashboard

### 3. JWT_SECRET não configurado
- Gere um secret seguro
- Adicione na Vercel

### 4. Ver logs do erro

1. Na Vercel, vá em **Deployments**
2. Clique no deployment ativo
3. Vá na aba **Functions**
4. Clique em `/api/v1/auth/login`
5. Veja os logs de erro

## ✅ Checklist Rápido

- [ ] `VITE_API_URL=/api/v1` adicionado na Vercel
- [ ] `DATABASE_URL` adicionado na Vercel
- [ ] `REDIS_URL` adicionado na Vercel
- [ ] `JWT_SECRET` gerado e adicionado na Vercel
- [ ] Todas as outras variáveis adicionadas
- [ ] Redeploy feito
- [ ] Testado no navegador

---

**Tempo estimado: 5-10 minutos** ⏱️

**Após adicionar as variáveis e fazer redeploy, o login deve funcionar!** 🚀
