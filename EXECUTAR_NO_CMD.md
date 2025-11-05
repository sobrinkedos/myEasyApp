# 🚀 EXECUTAR NO CMD (Prompt de Comando)

## ⚠️ IMPORTANTE: Use o CMD, não o PowerShell!

O PowerShell está bloqueando a execução de scripts npm.
Use o **Prompt de Comando (CMD)** ao invés.

---

## 📋 Como Abrir o CMD

### Opção 1: Pelo Explorador de Arquivos
1. Abra a pasta do projeto no Explorador
2. Clique na barra de endereço (onde mostra o caminho)
3. Digite: `cmd`
4. Pressione Enter

### Opção 2: Pelo Menu Iniciar
1. Pressione `Win + R`
2. Digite: `cmd`
3. Pressione Enter
4. Navegue até a pasta do projeto:
   ```cmd
   cd C:\newProjects\myEasyApp
   ```

---

## 🎯 COMANDOS PARA EXECUTAR

**Copie e cole estes comandos no CMD, um por vez:**

### 1️⃣ Instalar Dependências (2-3 minutos)
```cmd
npm install
```
⏱️ Aguarde a instalação completar...

---

### 2️⃣ Gerar Cliente Prisma (10 segundos)
```cmd
npm run prisma:generate
```
✅ Gera os tipos TypeScript do banco de dados

---

### 3️⃣ Criar Tabelas no Banco (20 segundos)
```cmd
npm run prisma:migrate
```
✅ Cria todas as tabelas no Neon PostgreSQL

---

### 4️⃣ Popular com Dados de Teste (5 segundos)
```cmd
npm run prisma:seed
```
✅ Cria usuário admin e dados iniciais

**Credenciais criadas:**
- Email: `admin@restaurant.com`
- Senha: `admin123`

---

### 5️⃣ Iniciar a API
```cmd
npm run dev
```

**Você deve ver:**
```
✅ Redis connected
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🏥 Health check: http://localhost:3000/health
```

**DEIXE ESTE CMD ABERTO!**

---

## 🧪 TESTAR A API

### Abra um NOVO CMD e execute:

```cmd
node test-api.js
```

**Resultado esperado:**
```
🧪 Iniciando testes da API...
1️⃣  Testando Health Check... ✅
2️⃣  Testando Login... ✅
3️⃣  Testando Categorias... ✅
... (mais testes)
🎉 Todos os testes concluídos!
```

---

## 🌐 TESTAR NO NAVEGADOR

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

## 📊 VER DADOS NO BANCO

Abra um NOVO CMD e execute:

```cmd
npm run prisma:studio
```

Abre em: **http://localhost:5555**

---

## 🛑 PARAR A API

No CMD onde a API está rodando:
- Pressione `Ctrl + C`
- Confirme com `S` (Sim)

Para iniciar novamente:
```cmd
npm run dev
```

---

## ❓ PROBLEMAS?

### Erro "npm: command not found"
**Solução:** 
1. Feche e abra um novo CMD
2. Teste: `node --version`
3. Se não funcionar, reinstale Node.js de https://nodejs.org

### Erro durante npm install
```cmd
npm cache clean --force
npm install
```

### Erro "Cannot connect to database"
1. Verifique o `.env.development`
2. Certifique-se de ter `?sslmode=require` no final da URL do banco

### Erro "Redis connection failed"
1. Verifique o `.env.development`
2. Certifique-se de que a URL do Redis está correta

---

## 🎯 CHECKLIST

- [ ] Abri o CMD (não PowerShell)
- [ ] Naveguei até a pasta do projeto
- [ ] Executei `npm install`
- [ ] Executei `npm run prisma:generate`
- [ ] Executei `npm run prisma:migrate`
- [ ] Executei `npm run prisma:seed`
- [ ] Executei `npm run dev`
- [ ] API iniciou sem erros
- [ ] Testei com `node test-api.js`
- [ ] Acessei http://localhost:3000/api/docs

---

## 💡 DICA

**Copie todos os comandos de uma vez:**

```cmd
npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && npm run dev
```

Isso executa tudo em sequência automaticamente!

---

## 🎉 PRONTO!

Depois de executar tudo:
- ✅ API rodando em http://localhost:3000
- ✅ Documentação em http://localhost:3000/api/docs
- ✅ Banco de dados configurado
- ✅ Dados de teste criados

**Bora desenvolver!** 🚀
