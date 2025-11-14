# Deploy Fullstack na Vercel - Frontend + Backend

## 🎯 Solução Completa

Deploy de **frontend E backend** na Vercel em um único projeto!

## ✅ Vantagens

- ✅ **Tudo em um lugar** - Frontend + Backend juntos
- ✅ **100% Gratuito** - Plano Hobby suficiente
- ✅ **Deploy rápido** - 2-3 minutos
- ✅ **Serverless** - Backend escala automaticamente
- ✅ **HTTPS automático** - SSL grátis
- ✅ **Deploy automático** - Push → Deploy

## ⚠️ Limitações

- ⚠️ **Serverless Functions** - Backend roda como functions (não servidor contínuo)
- ⚠️ **Timeout 10s** - Requisições não podem demorar mais que 10s
- ⚠️ **Cold Start** - Primeira requisição pode demorar ~1s
- ⚠️ **Sem WebSockets** - Socket.io não funciona
- ⚠️ **Sem uploads persistentes** - Use Cloudinary/S3

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Banco Neon PostgreSQL (já configurado)
3. Redis Upstash (já configurado)

## 🚀 Passo a Passo

### 1. Criar Conta na Vercel

1. Acesse https://vercel.com
2. Login com GitHub
3. Autorize a Vercel

### 2. Importar Projeto

1. No Dashboard, clique em "Add New..." → "Project"
2. Selecione `sobrinkedos/myEasyApp`
3. Branch: `development`
4. Clique em "Import"

### 3. Configurar Projeto

#### Framework Preset
- Selecione: **Other** (projeto monorepo)

#### Root Directory
- Deixe vazio (raiz do projeto)

#### Build Settings
A Vercel vai usar o `vercel.json` automaticamente

### 4. Configurar Variáveis de Ambiente

Adicione todas as variáveis:

```bash
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379
JWT_SECRET=<gere-string-aleatoria>
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=*
LOG_LEVEL=info

# Frontend
VITE_API_URL=/api/v1
```

**Importante:** `VITE_API_URL=/api/v1` (relativo, não absoluto)

### 5. Deploy!

Clique em "Deploy" e aguarde 3-5 minutos.

## 🔄 Como Funciona

### Frontend (Vite)
- Build estático em `web-app/dist`
- Servido pela CDN da Vercel
- Super rápido

### Backend (Serverless Functions)
- Cada rota vira uma function
- Escala automaticamente
- Pay-per-use (mas gratuito no Hobby)

### Roteamento
```
https://seu-app.vercel.app/          → Frontend
https://seu-app.vercel.app/api/v1/*  → Backend
```

## 📊 Monitoramento

### Logs
- Dashboard → Seu projeto → Deployments → Logs
- Logs em tempo real
- Filtros por function

### Analytics
- Dashboard → Analytics
- Pageviews, performance
- Web Vitals automático

## 🐛 Troubleshooting

### Backend não responde
- Verifique variáveis de ambiente
- Veja logs da function
- Teste: `curl https://seu-app.vercel.app/api/v1/health`

### Frontend não conecta
- Verifique `VITE_API_URL=/api/v1`
- Deve ser relativo, não absoluto
- Rebuild se mudou variável

### Timeout 10s
- Otimize queries lentas
- Use cache (Redis)
- Considere Railway para backend se precisar >10s

## 💰 Custos

### Plano Hobby (Gratuito)
- **100GB bandwidth/mês**
- **100 GB-hours serverless**
- **Unlimited deployments**
- Suficiente para desenvolvimento e pequenos projetos

### Plano Pro ($20/mês)
- Mais bandwidth
- Mais GB-hours
- Suporte prioritário

## ✅ Vantagens vs Railway/Render

| Característica | Vercel Fullstack | Railway | Render |
|----------------|------------------|---------|--------|
| **Custo** | Gratuito | $5/mês | Gratuito |
| **Setup** | Muito fácil | Fácil | Médio |
| **Frontend** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Backend** | ⭐⭐⭐⭐ Serverless | ⭐⭐⭐⭐⭐ Server | ⭐⭐⭐ Server |
| **WebSockets** | ❌ | ✅ | ✅ |
| **Long Running** | ❌ (10s max) | ✅ | ✅ |

## 🎯 Quando Usar Vercel Fullstack?

### ✅ Use se:
- Projeto pequeno/médio
- Não precisa de WebSockets
- Requisições rápidas (<10s)
- Quer simplicidade máxima
- Quer tudo gratuito

### ❌ Não use se:
- Precisa de WebSockets (Socket.io)
- Tem requisições longas (>10s)
- Precisa de servidor contínuo
- Tem muito processamento pesado

## 🔗 Alternativa Híbrida

Se precisar de WebSockets ou long-running:

1. **Frontend na Vercel** (gratuito, rápido)
2. **Backend no Railway** ($5/mês, completo)

Melhor dos dois mundos!

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Monorepo](https://vercel.com/docs/monorepos)

---

**Pronto!** Deploy fullstack na Vercel em menos de 10 minutos! 🎉
