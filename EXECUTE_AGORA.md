# ⚡ Execute Agora para Testar o Upload de Imagem

## 🎯 O que foi implementado?

✅ Sistema completo de upload de imagem para produtos do estoque
✅ Migration aplicada no banco de dados
✅ Backend com endpoint de upload
✅ Frontend com preview e validação

## 🚀 Próximo Passo

### Execute este comando:

```
START_SERVERS.bat
```

**OU** se preferir manualmente, abra 2 terminais CMD:

**Terminal 1 (Backend):**
```cmd
node node_modules\ts-node-dev\lib\bin.js --respawn --transpile-only src/server.ts
```

**Terminal 2 (Frontend):**
```cmd
cd web-app
node node_modules\vite\bin\vite.js
```

## 📱 Depois de Iniciar

1. Abra o navegador em: **http://localhost:5173**
2. Faça login
3. Vá em **Estoque** → **+ Novo Item**
4. Preencha o formulário
5. **Clique em "Escolher arquivo"** e selecione uma imagem
6. Veja o preview aparecer
7. Clique em **Cadastrar**
8. Veja o item com a imagem na listagem e detalhes

## 🎨 Teste Completo

1. **Criar item com imagem** ✅
2. **Ver preview antes de salvar** ✅
3. **Ver imagem nos detalhes** ✅
4. **Editar e trocar a imagem** ✅

## 📸 Imagem de Teste Sugerida

Use qualquer imagem de produto (cerveja, refrigerante, etc.) em formato:
- JPG ou PNG
- Máximo 5MB

## ❓ Dúvidas?

- **Erro de conexão?** → Veja `COMO_INICIAR.md`
- **Como testar?** → Veja `TESTAR_UPLOAD_IMAGEM.md`
- **PowerShell bloqueado?** → Use `START_SERVERS.bat`

---

## 🎉 Está Tudo Pronto!

Basta executar `START_SERVERS.bat` e começar a testar!
