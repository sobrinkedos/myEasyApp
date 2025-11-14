# Configurar Variáveis de Ambiente na Vercel

## 🎯 Objetivo

Conectar o frontend (Vercel) com o backend (Railway)

## 📋 Variáveis Necessárias

### VITE_API_URL
A URL base da API do backend hospedado no Railway.

**Formato:** `https://seu-app.up.railway.app/api/v1`

## 🚀 Passo a Passo

### 1. Obter URL do Backend (Railway)

1. Acesse https://railway.app
2. Entre no seu projeto
3. Clique no serviço do backend
4. Vá em **Settings** → **Domains**
5. Se não tiver domínio, clique em **Generate Domain**
6. Copie a URL gerada (ex: `https://myeasyapp-production.up.railway.app`)

### 2. Configurar na Vercel

1. Acesse https://vercel.com/rilton-oliveira-de-souzas-projects/myeasyapp
2. Clique em **Settings** (barra superior)
3. No menu lateral, clique em **Environment Variables**
4. Adicione a variável:

```
Key: VITE_API_URL
Value: https://seu-app.up.railway.app/api/v1
Environment: Production, Preview, Development (marque todos)
```

5. Clique em **Save**

### 3. Fazer Redeploy

Após adicionar as variáveis:

1. Vá para a aba **Deployments**
2. Clique nos 3 pontinhos do último deployment
3. Clique em **Redeploy**
4. Aguarde o build completar

## ✅ Verificar se Funcionou

1. Acesse seu app na Vercel: `https://vite-react-nu-one-62.vercel.app`
2. Abra o DevTools (F12)
3. Vá na aba **Network**
4. Tente fazer login ou qualquer ação que chame a API
5. Verifique se as requisições estão indo para a URL correta do Railway

## 🔧 Outras Variáveis (Opcionais)

Se o seu app precisar de outras configurações:

```bash
# WebSocket (se usar)
VITE_WS_URL=wss://seu-app.up.railway.app

# Outras configurações
VITE_APP_NAME=MyEasyApp
VITE_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### CORS Error
Se aparecer erro de CORS:
1. Vá no Railway
2. Adicione a variável `CORS_ORIGIN` com a URL da Vercel:
   ```
   CORS_ORIGIN=https://vite-react-nu-one-62.vercel.app
   ```

### API não responde
1. Verifique se o backend está rodando no Railway
2. Teste a URL diretamente no navegador: `https://seu-app.up.railway.app/api/v1/health`
3. Veja os logs no Railway

### Variável não está sendo usada
1. Certifique-se que o nome começa com `VITE_`
2. Faça um redeploy completo
3. Limpe o cache do navegador

## 📝 Notas Importantes

- ⚠️ Variáveis que começam com `VITE_` são expostas no frontend
- ⚠️ Nunca coloque secrets/senhas em variáveis `VITE_`
- ✅ Sempre faça redeploy após adicionar variáveis
- ✅ Teste em ambiente de Preview antes de Production

---

**Pronto!** Seu frontend estará conectado ao backend! 🎉
