# 🎯 COMO EXECUTAR - Guia Rápido

## ⚠️ PROBLEMA COM POWERSHELL?

O PowerShell pode bloquear scripts npm no Windows.
**Solução:** Use o CMD (Prompt de Comando) ou o arquivo .bat

---

## 🚀 3 FORMAS DE EXECUTAR

### 🎬 Forma 1: Arquivo BAT (MAIS FÁCIL!) ⭐

**Clique duas vezes no arquivo:**
```
INICIAR.bat
```

Isso vai:
1. ✅ Instalar dependências
2. ✅ Gerar cliente Prisma
3. ✅ Criar tabelas
4. ✅ Popular banco
5. ✅ Iniciar API

**Tempo:** ~5 minutos
**Vantagem:** Automático, sem digitar nada!

---

### 📝 Forma 2: CMD Manual

1. **Abra o CMD:**
   - Pressione `Win + R`
   - Digite: `cmd`
   - Pressione Enter

2. **Navegue até a pasta:**
   ```cmd
   cd C:\newProjects\myEasyApp
   ```

3. **Execute os comandos:**
   ```cmd
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

**Tempo:** ~5 minutos
**Vantagem:** Você vê cada etapa

---

### ⚡ Forma 3: CMD Tudo de Uma Vez

1. **Abra o CMD na pasta do projeto**

2. **Execute este comando único:**
   ```cmd
   npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && npm run dev
   ```

**Tempo:** ~5 minutos
**Vantagem:** Um único comando!

---

## 🧪 DEPOIS DE INICIAR

### Teste 1: Automático

**Abra um NOVO CMD** e execute:
```cmd
node test-api.js
```

### Teste 2: Navegador

Abra: http://localhost:3000/api/docs

### Teste 3: Health Check

Abra: http://localhost:3000/health

---

## 📊 CREDENCIAIS

**Login da API:**
- Email: `admin@restaurant.com`
- Senha: `admin123`

**Neon PostgreSQL:**
- Dashboard: https://console.neon.tech

**Upstash Redis:**
- Dashboard: https://console.upstash.com

---

## 🛑 PARAR A API

No CMD onde está rodando:
- Pressione `Ctrl + C`
- Confirme com `S`

---

## ❓ PROBLEMAS?

### "npm não é reconhecido"
**Solução:**
1. Feche e abra um novo CMD
2. Teste: `node --version`
3. Se não funcionar, reinstale Node.js

### Erro durante instalação
```cmd
npm cache clean --force
npm install
```

### Erro de conexão com banco
1. Verifique `.env.development`
2. Certifique-se de ter `?sslmode=require` no final

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **EXECUTAR_NO_CMD.md** - Guia detalhado para CMD
- **COMECE_AQUI.md** - Guia completo
- **FAQ.md** - Perguntas frequentes

---

## 🎯 RECOMENDAÇÃO

**Use a Forma 1 (INICIAR.bat):**
1. Clique duas vezes em `INICIAR.bat`
2. Aguarde ~5 minutos
3. Pronto!

**É a forma mais fácil e rápida!** 🚀

---

## 💡 DICA FINAL

Se o PowerShell estiver bloqueando, você tem 3 opções:

1. ✅ **Use INICIAR.bat** (recomendado)
2. ✅ **Use CMD** ao invés de PowerShell
3. ⚠️ Ou configure o PowerShell (mais complexo)

**Escolha a opção 1 ou 2!** 😊
