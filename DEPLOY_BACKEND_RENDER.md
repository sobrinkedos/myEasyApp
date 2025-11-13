# Deploy do Backend no Render.com - Guia Completo

## 🎯 Por que Render?

- ✅ **Gratuito** - 750 horas/mês (suficiente para 1 serviço 24/7)
- ✅ **Fácil de usar** - Deploy automático do GitHub
- ✅ **PostgreSQL incluído** - Já temos Neon, mas Render também oferece
- ✅ **SSL automático** - HTTPS gratuito
- ✅ **Logs em tempo real** - Fácil debugging

## 📋 Pré-requisitos

1. Conta no Render.com (https://render.com)
2. Conta no GitHub com o repositório
3. Banco de dados Neon PostgreSQL (já configurado)
4. Redis Upstash (já configurado)

## 🚀 Passo a Passo

### 1. Criar Conta no Render

1. Acesse https://render.com
2. Clique em "Get Started"
3. Faça login com GitHub
4. Autorize o Render a acessar seus repositórios

### 2. Criar Novo Web Service

1. No Dashboard, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório: `sobrinkedos/myEasyApp`
4. Clique em "Connect"

### 3. Configurar o Serviço

#### Informações Básicas
- **Name:** `myeasyapp-api` (ou outro nome de sua preferência)
- **Region:** Oregon (US West) - mais próximo e gratuito
- **Branch:** `development` (ou `master` para produção)
- **Root Directory:** deixe vazio (raiz do projeto)
- **Runtime:** Node

#### Build & Deploy
- **Build Command:** 
  ```bash
  npm install && npm run build && npx prisma generate
  ```

- **Start Command:**
  ```bash
  npm run start:prod
  ```

#### Plan
- Selecione: **Free** (750 horas/mês)

### 4. Configurar Variáveis de Ambiente

Clique em "Advanced" e adicione as seguintes variáveis:

#### Obrigatórias

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `PORT` | `3000` | Porta do servidor |
| `DATABASE_URL` | `sua-url-neon` | URL do PostgreSQL Neon |
| `REDIS_URL` | `sua-url-upstash` | URL do Redis Upstash |
| `JWT_SECRET` | `gerar-string-aleatoria` | Secret para JWT (use gerador) |

#### Opcionais (com valores padrão)

| Variável | Valor Sugerido |
|----------|----------------|
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `12` |
| `CORS_ORIGIN` | `*` (ou URL do frontend) |
| `LOG_LEVEL` | `info` |
| `MAX_FILE_SIZE` | `5242880` |
| `UPLOAD_DIR` | `./uploads` |
| `RATE_LIMIT_WINDOW` | `60000` |
| `RATE_LIMIT_MAX` | `100` |

#### Como obter as URLs:

**DATABASE_URL (Neon):**
```
Já está no seu .env:
postgresql://neondb_owner:npg_7tyiCfQgXxl4@ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**REDIS_URL (Upstash):**
```
Já está no seu .env:
rediss://default:AWwNAAIncDI1YTc0ZTI2YTY0MTU0ZTBmOWViZGEwNjIyMDQxYWM2YnAyMjc2NjE@communal-imp-27661.upstash.io:6379
```

**JWT_SECRET:**
Gere uma string aleatória segura:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Deploy!

1. Clique em "Create Web Service"
2. O Render começará o build automaticamente
3. Aguarde 5-10 minutos para o primeiro deploy
4. Acompanhe os logs em tempo real

### 6. Verificar Deploy

Após o deploy bem-sucedido:

1. Você verá a URL do serviço: `https://myeasyapp-api.onrender.com`
2. Teste a API:
   ```bash
   curl https://myeasyapp-api.onrender.com/api/v1/health
   ```

### 7. Configurar CORS

Se necessário, atualize a variável `CORS_ORIGIN` com a URL do frontend:
```
https://myeasyapp.vercel.app
```

## 🔄 Deploy Automático

Após a configuração inicial:

- ✅ Cada push na branch configurada faz deploy automático
- ✅ Logs disponíveis em tempo real
- ✅ Rollback fácil para versões anteriores

## ⚠️ Limitações do Plano Free

1. **Sleep após inatividade:** Serviço "dorme" após 15 minutos sem requisições
   - Primeira requisição após sleep demora ~30 segundos
   - Solução: Use um serviço de ping (UptimeRobot, Cron-job.org)

2. **750 horas/mês:** Suficiente para 1 serviço rodando 24/7

3. **Sem persistência de arquivos:** Uploads são perdidos no redeploy
   - Solução: Use Cloudinary, AWS S3, ou outro storage

## 🐛 Troubleshooting

### Build falha

**Erro:** `Cannot find module`
- Verifique se todas as dependências estão no `package.json`
- Certifique-se que `npm install` está no build command

**Erro:** `Prisma Client not generated`
- Adicione `npx prisma generate` no build command

### Aplicação não inicia

**Erro:** `Port already in use`
- Certifique-se que está usando `process.env.PORT`
- Render injeta a porta automaticamente

**Erro:** `Database connection failed`
- Verifique se `DATABASE_URL` está correta
- Teste a conexão com o Neon

### API retorna 502

- Verifique os logs no Render Dashboard
- Certifique-se que o servidor está escutando na porta correta
- Verifique se há erros no código

## 📊 Monitoramento

### Logs
- Acesse: Dashboard → Seu serviço → Logs
- Logs em tempo real
- Filtros por nível (info, error, etc.)

### Métricas
- CPU e memória
- Requisições por minuto
- Tempo de resposta

### Alertas
- Configure notificações por email
- Alertas de deploy falho
- Alertas de downtime

## 🔒 Segurança

1. **Nunca commite secrets** no código
2. **Use variáveis de ambiente** para tudo sensível
3. **Ative HTTPS** (automático no Render)
4. **Configure CORS** corretamente
5. **Use rate limiting** (já configurado)

## 💰 Upgrade (Opcional)

Se precisar de mais recursos:

- **Starter ($7/mês):**
  - Sem sleep
  - 512 MB RAM
  - Melhor performance

- **Standard ($25/mês):**
  - 2 GB RAM
  - Escalabilidade automática

## 🔗 Próximos Passos

Após o deploy do backend:

1. Copie a URL do serviço: `https://myeasyapp-api.onrender.com`
2. Configure no frontend (Vercel):
   - Variável: `VITE_API_URL`
   - Valor: `https://myeasyapp-api.onrender.com/api/v1`
3. Faça deploy do frontend na Vercel
4. Teste a integração completa

## 📚 Recursos

- [Documentação Render](https://render.com/docs)
- [Node.js no Render](https://render.com/docs/deploy-node-express-app)
- [Variáveis de Ambiente](https://render.com/docs/environment-variables)
- [Troubleshooting](https://render.com/docs/troubleshooting-deploys)

## ✅ Checklist Final

- [ ] Conta criada no Render
- [ ] Repositório conectado
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] API responde corretamente
- [ ] CORS configurado
- [ ] URL copiada para configurar no frontend

---

**Pronto!** Seu backend estará rodando no Render com deploy automático! 🎉

## 🆘 Precisa de Ajuda?

- Render Community: https://community.render.com
- Discord do Render: https://render.com/discord
- Documentação: https://render.com/docs
