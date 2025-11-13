# Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Backend já deployado em outro serviço (Railway, Render, etc.)
3. Branch `development` criada e com push feito

## 🚀 Passos para Deploy

### 1. Importar Projeto na Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New..." → "Project"
3. Selecione seu repositório GitHub: `sobrinkedos/myEasyApp`
4. Clique em "Import"

### 2. Configurar o Projeto

Na tela de configuração:

#### Framework Preset
- Selecione: **Vite**

#### Root Directory
- Deixe como está (raiz do projeto)
- O Vercel vai usar as configurações do `vercel.json`

#### Build and Output Settings
- Build Command: `cd web-app && npm install && npm run build`
- Output Directory: `web-app/dist`
- Install Command: `cd web-app && npm install`

(Essas configurações já estão no `vercel.json`, mas você pode verificar)

### 3. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

**Nome:** `VITE_API_URL`  
**Valor:** URL do seu backend em produção (ex: `https://seu-backend.railway.app/api/v1`)  
**Environments:** Production, Preview, Development

### 4. Configurar Branch de Deploy

1. Após o primeiro deploy, vá em "Settings" → "Git"
2. Em "Production Branch", mantenha `master` ou mude para `main`
3. Em "Deploy Hooks", você pode criar hooks para a branch `development`

### 5. Deploy Automático da Branch Development

Para ter um ambiente de preview da branch development:

1. Vá em "Settings" → "Git"
2. A Vercel automaticamente cria previews para todas as branches
3. Cada push na branch `development` criará um deploy de preview
4. URL será algo como: `myeasyapp-git-development-seu-usuario.vercel.app`

## 🔧 Configuração Manual (Alternativa)

Se preferir usar a CLI da Vercel:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy da branch development
git checkout development
vercel --prod

# Ou para preview
vercel
```

## 📝 Variáveis de Ambiente Necessárias

Certifique-se de configurar na Vercel:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_URL` | URL do backend | `https://api.seuapp.com/api/v1` |

## 🌐 URLs Após Deploy

- **Production (master):** `https://myeasyapp.vercel.app`
- **Development (preview):** `https://myeasyapp-git-development.vercel.app`
- **Pull Requests:** URLs únicas para cada PR

## ⚠️ Importante

1. **Backend Separado:** O backend (Node.js/Express) NÃO será deployado na Vercel
   - Use Railway, Render, Heroku, ou outro serviço para o backend
   - Configure a URL do backend na variável `VITE_API_URL`

2. **Banco de Dados:** 
   - Use Neon (PostgreSQL) - já configurado
   - Use Upstash (Redis) - já configurado

3. **Arquivos de Upload:**
   - A Vercel não suporta uploads persistentes
   - Use um serviço de storage (AWS S3, Cloudinary, etc.)

## 🔄 Workflow de Deploy

```
development branch → Push → Vercel Preview Deploy
       ↓
   Pull Request
       ↓
master branch → Merge → Vercel Production Deploy
```

## 🐛 Troubleshooting

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Verifique se o comando de build está correto
- Veja os logs de build na Vercel

### API não conecta
- Verifique se `VITE_API_URL` está configurada
- Verifique se o backend está rodando
- Verifique CORS no backend

### Página em branco
- Verifique o console do navegador
- Verifique se o build foi bem-sucedido
- Verifique as rotas do React Router

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Checklist Final

- [ ] Backend deployado e funcionando
- [ ] `VITE_API_URL` configurada na Vercel
- [ ] Build bem-sucedido
- [ ] Frontend carrega corretamente
- [ ] API conecta com sucesso
- [ ] Autenticação funciona
- [ ] Todas as páginas carregam

---

**Pronto!** Seu frontend estará disponível na Vercel com deploy automático a cada push! 🎉
