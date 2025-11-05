# 🎯 COMECE AQUI - Guia Definitivo

## ✅ STATUS: TUDO CONFIGURADO!

Suas credenciais já estão no `.env.development`:
- ✅ Neon PostgreSQL
- ✅ Upstash Redis
- ✅ Todas as variáveis necessárias

---

## 🚀 EXECUTE AGORA (Escolha UMA opção)

### 🎬 Opção 1: Automático (Recomendado para Windows)

**Um único comando faz tudo:**

```bash
setup-completo.bat
```

**O que ele faz:**
1. ✅ Verifica Node.js
2. ✅ Instala dependências (npm install)
3. ✅ Gera cliente Prisma
4. ✅ Cria tabelas no banco
5. ✅ Popula com dados de teste
6. ✅ Inicia a API

**Tempo:** ~5 minutos
**Resultado:** API rodando automaticamente!

---

### 📝 Opção 2: Manual (Passo a Passo)

**Execute estes comandos em sequência:**

```bash
# 1. Instalar dependências (2-3 min)
npm install

# 2. Gerar cliente Prisma (10 seg)
npm run prisma:generate

# 3. Criar tabelas (20 seg)
npm run prisma:migrate

# 4. Popular banco (5 seg)
npm run prisma:seed

# 5. Iniciar API
npm run dev
```

**Tempo:** ~5 minutos
**Vantagem:** Você vê cada etapa

---

### 🔍 Opção 3: Verificar Primeiro

**Se quiser ver o que está faltando:**

```bash
node verificar-setup.js
```

Mostra o status de tudo e o que precisa ser feito.

---

## 🧪 TESTAR A API

Após a API iniciar, escolha uma forma de testar:

### Teste 1: Automático (Mais Rápido)

**Abra um NOVO terminal** e execute:

```bash
node test-api.js
```

**Resultado esperado:**
```
🧪 Iniciando testes da API...
1️⃣  Testando Health Check... ✅
2️⃣  Testando Login... ✅
3️⃣  Testando Categorias... ✅
4️⃣  Testando Produtos... ✅
5️⃣  Testando Insumos... ✅
6️⃣  Testando Criar Produto... ✅
7️⃣  Testando Relatório... ✅
8️⃣  Testando Segurança... ✅
🎉 Todos os testes concluídos!
```

---

### Teste 2: Visual (Swagger)

**Abra no navegador:**
```
http://localhost:3000/api/docs
```

**Como usar:**
1. Clique em `POST /api/v1/auth/login`
2. Clique em "Try it out"
3. Use estas credenciais:
   ```json
   {
     "email": "admin@restaurant.com",
     "password": "admin123"
   }
   ```
4. Clique em "Execute"
5. Copie o token da resposta
6. Clique em "Authorize" (cadeado no topo)
7. Cole o token
8. Agora teste qualquer endpoint!

---

### Teste 3: Health Check

**Abra no navegador:**
```
http://localhost:3000/health
```

**Deve mostrar:**
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

## 📊 VER DADOS NO BANCO

**Abra um NOVO terminal** e execute:

```bash
npm run prisma:studio
```

**Abre em:** http://localhost:5555

Aqui você pode:
- ✅ Ver todas as tabelas
- ✅ Ver todos os dados
- ✅ Editar dados
- ✅ Adicionar novos registros

---

## 🎓 CREDENCIAIS

### Login da API
- **Email:** admin@restaurant.com
- **Senha:** admin123

### Neon PostgreSQL
- **Dashboard:** https://console.neon.tech
- **Database:** neondb
- **Endpoint:** ep-ancient-smoke-aef5zrjy-pooler.c-2.us-east-2.aws.neon.tech

### Upstash Redis
- **Dashboard:** https://console.upstash.com
- **Database:** communal-imp-27661
- **Endpoint:** communal-imp-27661.upstash.io

---

## 🛑 PARAR A API

No terminal onde a API está rodando:
- Pressione `Ctrl + C`

Para iniciar novamente:
```bash
npm run dev
```

---

## ❓ PROBLEMAS COMUNS

### "npm: command not found"
**Solução:** Instale Node.js 20+ de https://nodejs.org

### Erro durante npm install
```bash
# Limpar cache e tentar novamente
npm cache clean --force
npm install
```

### "Cannot connect to database"
**Solução:** 
1. Verifique o `.env.development`
2. Teste no dashboard do Neon
3. Certifique-se de ter `?sslmode=require` no final da URL

### "Redis connection failed"
**Solução:**
1. Verifique o `.env.development`
2. Teste no dashboard do Upstash
3. Certifique-se de que a URL começa com `redis://`

### "Port 3000 already in use"
**Solução:** No `.env.development`, mude:
```env
PORT=3001
```

### Erro "relation does not exist"
**Solução:**
```bash
npm run prisma:migrate
npm run prisma:seed
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Se precisar de mais detalhes:

- **EXECUTAR_AGORA.md** - Comandos detalhados
- **INICIO_RAPIDO_SEM_DOCKER.md** - Setup do zero
- **GUIA_VISUAL.md** - Fluxogramas e diagramas
- **FAQ.md** - Perguntas frequentes
- **COMANDOS_UTEIS.md** - Referência completa

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Executei `setup-completo.bat` OU os comandos manuais
- [ ] API iniciou sem erros
- [ ] Vi a mensagem "Server running on port 3000"
- [ ] Executei `node test-api.js` e todos passaram
- [ ] Acessei http://localhost:3000/api/docs
- [ ] Fiz login com admin@restaurant.com
- [ ] Testei alguns endpoints

---

## 🎉 PRÓXIMOS PASSOS

Depois de tudo funcionando:

1. ✅ **Explore a API**
   - Teste todos os endpoints no Swagger
   - Crie produtos e categorias
   - Registre movimentações de estoque

2. ✅ **Veja os Dados**
   - Use o Prisma Studio
   - Explore as tabelas criadas
   - Veja os relacionamentos

3. ✅ **Desenvolva**
   - Adicione novos endpoints
   - Crie novas funcionalidades
   - Integre com frontend

4. 🚀 **Prioridade 2**
   - Sistema de Comandas
   - Gestão de Pedidos
   - WebSocket para notificações

---

## 💡 DICA FINAL

**Para começar AGORA:**

1. Abra o terminal nesta pasta
2. Execute: `setup-completo.bat` (Windows) ou os comandos manuais
3. Aguarde ~5 minutos
4. Teste com: `node test-api.js`
5. Acesse: http://localhost:3000/api/docs

**É ISSO! Simples assim!** 🚀

---

## 🆘 PRECISA DE AJUDA?

1. Execute: `node verificar-setup.js`
2. Leia a seção "Problemas Comuns" acima
3. Consulte o **FAQ.md**
4. Veja os logs no terminal

---

**Tudo está pronto! Escolha uma opção acima e execute!** 🎉

**Tempo total: ~5 minutos** ⏱️
