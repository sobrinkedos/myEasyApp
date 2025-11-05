# 🚀 EXECUTAR AGORA - Comandos Prontos

## ✅ Configuração Completa!

Suas credenciais já estão configuradas no `.env.development`:
- ✅ Neon PostgreSQL conectado
- ✅ Upstash Redis conectado

---

## 📋 Execute estes comandos em sequência:

### 1️⃣ Instalar Dependências (2-3 minutos)
```bash
npm install
```
⏱️ Aguarde a instalação completar...

---

### 2️⃣ Gerar Cliente Prisma (10 segundos)
```bash
npm run prisma:generate
```
✅ Gera os tipos TypeScript do banco de dados

---

### 3️⃣ Criar Tabelas no Banco (20 segundos)
```bash
npm run prisma:migrate
```
✅ Cria todas as tabelas no Neon PostgreSQL

---

### 4️⃣ Popular com Dados de Teste (5 segundos)
```bash
npm run prisma:seed
```
✅ Cria usuário admin e dados iniciais

**Credenciais criadas:**
- Email: `admin@restaurant.com`
- Senha: `admin123`

---

### 5️⃣ Iniciar a API (instantâneo)
```bash
npm run dev
```

**Você deve ver:**
```
✅ Redis connected
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🏥 Health check: http://localhost:3000/health
```

**DEIXE ESTE TERMINAL ABERTO!**

---

## 🧪 Testar a API

### Opção 1: Teste Automático (Recomendado)

Abra um **NOVO TERMINAL** e execute:

```bash
node test-api.js
```

**Resultado esperado:**
```
🧪 Iniciando testes da API...

1️⃣  Testando Health Check...
   ✅ Health check OK

2️⃣  Testando Login...
   ✅ Login OK

3️⃣  Testando Listar Categorias...
   ✅ Categorias OK

... (mais testes)

🎉 Todos os testes concluídos!
```

---

### Opção 2: Teste no Navegador

Abra: **http://localhost:3000/api/docs**

1. Clique em `POST /api/v1/auth/login`
2. Clique em "Try it out"
3. Use:
   ```json
   {
     "email": "admin@restaurant.com",
     "password": "admin123"
   }
   ```
4. Clique em "Execute"
5. Copie o token
6. Clique em "Authorize" (cadeado no topo)
7. Cole o token
8. Teste qualquer endpoint!

---

### Opção 3: Health Check Rápido

Abra: **http://localhost:3000/health**

Deve mostrar:
```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

---

## 📊 Ver Dados no Banco

Abra um **NOVO TERMINAL** e execute:

```bash
npm run prisma:studio
```

Abre em: **http://localhost:5555**

Aqui você pode ver e editar todos os dados!

---

## 🛑 Para Parar

No terminal onde a API está rodando:
- Pressione `Ctrl + C`

Para iniciar novamente:
```bash
npm run dev
```

---

## ❓ Problemas?

### "npm: command not found"
- Instale o Node.js 20+ de: https://nodejs.org

### Erro durante npm install
```bash
# Limpar cache e tentar novamente
npm cache clean --force
npm install
```

### Erro "Cannot connect to database"
- Verifique se o DATABASE_URL está correto no .env.development
- Teste a conexão no dashboard do Neon

### Erro "Redis connection failed"
- Verifique se o REDIS_URL está correto no .env.development
- Teste no dashboard do Upstash

### Porta 3000 em uso
No `.env.development`, mude:
```env
PORT=3001
```

---

## 🎯 Checklist Rápido

- [ ] `npm install` executado
- [ ] `npm run prisma:generate` executado
- [ ] `npm run prisma:migrate` executado
- [ ] `npm run prisma:seed` executado
- [ ] `npm run dev` rodando
- [ ] `node test-api.js` passou todos os testes
- [ ] Swagger acessível em http://localhost:3000/api/docs
- [ ] Login funcionando com admin@restaurant.com

---

## 🎉 Próximos Passos

Depois de tudo funcionando:

1. ✅ Explore todos os endpoints no Swagger
2. ✅ Veja os dados no Prisma Studio
3. ✅ Crie produtos e categorias
4. ✅ Registre movimentações de estoque
5. 🚀 Parta para a Prioridade 2 (Sistema de Comandas)!

---

**Suas credenciais estão configuradas e prontas! Basta executar os comandos acima!** 🚀

**Tempo total estimado: ~5 minutos** ⏱️
