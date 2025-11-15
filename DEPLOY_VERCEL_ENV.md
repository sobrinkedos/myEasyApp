# Configurar Variáveis de Ambiente na Vercel (Fullstack)

## 🎯 Objetivo

Configurar todas as variáveis necessárias para o deploy fullstack (backend + frontend) na Vercel

## 📋 Variáveis Necessárias

### Backend (Node.js/Express)
Variáveis para o servidor rodar corretamente

### Frontend (React/Vite)
Variáveis para o frontend se conectar ao backend

## 🚀 Passo a Passo

### 1. Acessar Configurações da Vercel

1. Acesse https://vercel.com/rilton-oliveira-de-souzas-projects/myeasyapp
2. Clique em **Settings** (barra superior)
3. No menu lateral, clique em **Environment Variables**

### 2. Adicionar Variáveis do Backend

Adicione cada variável abaixo (clique em "Add" para cada uma):

#### Ambiente e Porta
```
NODE_ENV=production
```

#### Banco de Dados (Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Redis (Upstash)
```
REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379
```

#### JWT (Autenticação)
```
JWT_SECRET=<GERE-UM-SECRET-SEGURO-AQUI>
JWT_EXPIRES_IN=7d
```

**Como gerar JWT_SECRET:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou use: https://www.random.org/strings/
# Gere uma string de 64 caracteres
```

#### Bcrypt
```
BCRYPT_ROUNDS=12
```

#### CORS
```
CORS_ORIGIN=https://my-easy-app.vercel.app
```

#### Logs e Limites
```
LOG_LEVEL=info
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### 3. Adicionar Variável do Frontend

**IMPORTANTE:** Como backend e frontend estão na mesma URL, use caminho relativo:

```
VITE_API_URL=/api/v1
```

**NÃO use:** `https://...` (não precisa, está tudo na mesma URL)

### 4. Marcar Ambientes

Para **TODAS** as variáveis:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 5. Salvar e Fazer Redeploy

1. Clique em **Save** após adicionar todas
2. Vá para a aba **Deployments**
3. Clique nos 3 pontinhos do último deployment
4. Clique em **Redeploy**
5. Aguarde 3-5 minutos

## ✅ Verificar se Funcionou

### Testar o Frontend
1. Acesse a URL do seu projeto na Vercel
2. Deve carregar normalmente

### Testar o Backend
1. Acesse: `https://sua-url.vercel.app/api/v1/health`
2. Deve retornar JSON com status da API

### Testar Integração
1. Tente fazer login no app
2. Abra DevTools (F12) → Network
3. Veja se as requisições para `/api/v1/*` estão funcionando

## 🔧 Resumo das Variáveis

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `NODE_ENV` | Backend | Ambiente de execução |
| `DATABASE_URL` | Backend | Conexão PostgreSQL (Neon) |
| `REDIS_URL` | Backend | Conexão Redis (Upstash) |
| `JWT_SECRET` | Backend | Secret para tokens JWT |
| `JWT_EXPIRES_IN` | Backend | Tempo de expiração do token |
| `BCRYPT_ROUNDS` | Backend | Rounds de hash de senha |
| `CORS_ORIGIN` | Backend | URL permitida para CORS |
| `LOG_LEVEL` | Backend | Nível de logs |
| `MAX_FILE_SIZE` | Backend | Tamanho máximo de upload |
| `RATE_LIMIT_*` | Backend | Configuração de rate limiting |
| `VITE_API_URL` | Frontend | URL da API (relativa) |

## 🐛 Troubleshooting

### Build falha após adicionar variáveis
- Verifique se não há erros de sintaxe
- Confirme que todas as variáveis obrigatórias estão presentes
- Veja os logs de build na Vercel

### Backend não responde
- Teste: `https://sua-url.vercel.app/api/v1/health`
- Veja os logs de runtime: Deployments → Clique no deploy → Function Logs
- Verifique se o DATABASE_URL está correto

### Frontend não conecta ao backend
- Confirme que `VITE_API_URL=/api/v1` (caminho relativo)
- Faça um redeploy completo
- Limpe o cache do navegador (Ctrl+Shift+R)

### Erro de CORS
- Verifique se `CORS_ORIGIN` tem a URL correta
- Pode usar `*` temporariamente para testar
- Lembre-se de fazer redeploy após mudar

### Erro de Database
- Teste a conexão com o Neon
- Verifique se o DATABASE_URL está completo (com `?sslmode=require`)
- Confirme que as migrations foram executadas

## 📝 Notas Importantes

- ⚠️ **JWT_SECRET:** NUNCA compartilhe ou commite no Git
- ⚠️ **Variáveis VITE_:** São expostas no frontend (não coloque secrets)
- ✅ **Redeploy:** Sempre necessário após adicionar/mudar variáveis
- ✅ **Ambientes:** Marque todos (Production, Preview, Development)

## 🔐 Segurança

### Variáveis Sensíveis
- `JWT_SECRET` - Mínimo 32 caracteres, aleatório
- `DATABASE_URL` - Nunca exponha publicamente
- `REDIS_URL` - Mantenha privado

### Variáveis Públicas (VITE_)
- Apenas `VITE_API_URL` é necessária
- Não coloque secrets em variáveis `VITE_`
- São incluídas no bundle do frontend

---

**Pronto!** Seu app fullstack estará configurado e funcionando! 🎉
