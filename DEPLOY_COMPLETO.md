# 🚀 Deploy Completo - Frontend + Backend

## 📋 Visão Geral

Este guia consolida o deploy completo da aplicação:
- **Backend:** Render.com (gratuito)
- **Frontend:** Vercel (gratuito)
- **Banco de Dados:** Neon PostgreSQL (já configurado)
- **Cache:** Upstash Redis (já configurado)

## 🎯 Ordem de Deploy

### 1️⃣ Deploy do Backend (Render)
### 2️⃣ Deploy do Frontend (Vercel)
### 3️⃣ Configuração Final

---

## 1️⃣ Deploy do Backend no Render

📖 **Guia completo:** `DEPLOY_BACKEND_RENDER.md`

### Resumo Rápido:

1. Acesse https://render.com e faça login com GitHub
2. Crie novo Web Service
3. Conecte o repositório `sobrinkedos/myEasyApp`
4. Configure:
   - Branch: `development`
   - Build: `npm install && npm run build && npx prisma generate`
   - Start: `npm run start:prod`
   - Plan: Free

5. Adicione variáveis de ambiente (copie do seu .env):
   - `DATABASE_URL`: URL do Neon
   - `REDIS_URL`: URL do Upstash
   - `JWT_SECRET`: Gere uma string aleatória
   - `NODE_ENV`: production
   - `PORT`: 3000

6. Clique em "Create Web Service"
7. Aguarde o deploy (~5-10 min)
8. **Copie a URL:** `https://seu-app.onrender.com`

---

## 2️⃣ Deploy do Frontend na Vercel

📖 **Guia completo:** `DEPLOY_VERCEL.md`

### Resumo Rápido:

1. Acesse https://vercel.com e faça login com GitHub
2. Clique em "Add New..." → "Project"
3. Selecione `sobrinkedos/myEasyApp`
4. Configure:
   - Framework: Vite
   - Branch: `development`
   - Root Directory: (deixe vazio)

5. Adicione variável de ambiente:
   - `VITE_API_URL`: `https://seu-app.onrender.com/api/v1`
   (Use a URL do passo 1)

6. Clique em "Deploy"
7. Aguarde o deploy (~3-5 min)
8. **Acesse:** `https://seu-app.vercel.app`

---

## 3️⃣ Configuração Final

### Atualizar CORS no Backend

1. No Render Dashboard, vá em seu serviço
2. Vá em "Environment"
3. Atualize `CORS_ORIGIN`:
   ```
   https://seu-app.vercel.app
   ```
4. Salve e aguarde redeploy automático

### Testar a Aplicação

1. Acesse o frontend: `https://seu-app.vercel.app`
2. Faça login com as credenciais de teste
3. Teste as funcionalidades principais
4. Verifique se a API está respondendo

---

## 🔄 Deploy Automático

Após a configuração inicial:

### Branch Development (Preview)
- Push na `development` → Deploy automático
- Frontend: `https://seu-app-git-development.vercel.app`
- Backend: `https://seu-app.onrender.com`

### Branch Master (Production)
- Merge na `master` → Deploy em produção
- Frontend: `https://seu-app.vercel.app`
- Backend: Criar novo serviço ou usar o mesmo

---

## ⚠️ Importante: Evitar Sleep do Render

O plano free do Render "dorme" após 15 min de inatividade.

### Solução: UptimeRobot

1. Acesse https://uptimerobot.com
2. Crie conta gratuita
3. Adicione novo monitor:
   - Type: HTTP(s)
   - URL: `https://seu-app.onrender.com/health`
   - Interval: 5 minutos
4. Salve

Isso mantém seu backend sempre ativo!

---

## 📊 Monitoramento

### Backend (Render)
- Logs: Dashboard → Seu serviço → Logs
- Métricas: CPU, RAM, Requests
- Alertas: Configure notificações

### Frontend (Vercel)
- Analytics: Dashboard → Seu projeto → Analytics
- Logs: Dashboard → Deployments → Logs
- Performance: Web Vitals automático

---

## 🐛 Troubleshooting Comum

### Backend não responde
- Verifique logs no Render
- Confirme variáveis de ambiente
- Teste: `curl https://seu-app.onrender.com/health`

### Frontend não conecta na API
- Verifique `VITE_API_URL` na Vercel
- Confirme CORS no backend
- Abra DevTools → Network

### Erro 502 Bad Gateway
- Backend pode estar em sleep (aguarde 30s)
- Verifique se o build foi bem-sucedido
- Veja logs de erro

---

## ✅ Checklist Final

- [ ] Backend deployado no Render
- [ ] Frontend deployado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] CORS atualizado
- [ ] UptimeRobot configurado
- [ ] Login funciona
- [ ] API responde corretamente
- [ ] Todas as páginas carregam

---

## 🎉 Pronto!

Sua aplicação está no ar com:
- ✅ Deploy automático
- ✅ HTTPS gratuito
- ✅ Monitoramento
- ✅ Logs em tempo real
- ✅ Zero custo

## 📚 Documentação

- Backend: `DEPLOY_BACKEND_RENDER.md`
- Frontend: `DEPLOY_VERCEL.md`
- Keep-alive: `keep-alive.js`

## 🆘 Suporte

- Render: https://community.render.com
- Vercel: https://vercel.com/support
- GitHub Issues: Crie uma issue no repositório
