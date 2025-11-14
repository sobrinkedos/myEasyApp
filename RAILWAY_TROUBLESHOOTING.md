# Railway Troubleshooting

## Problema: Railway ainda usa Docker ao invés de Nixpacks

### Sintoma:
```
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci"
```

### Causa:
Railway está usando Docker (Dockerfile) ao invés de Nixpacks.

### Solução 1: Mudar Builder no Dashboard

1. Acesse seu projeto no Railway
2. Clique no serviço
3. Vá em **Settings**
4. Procure por **"Builder"** ou **"Build Method"**
5. Mude de **"Docker"** para **"Nixpacks"**
6. Salve e faça redeploy

### Solução 2: Deletar e Recriar Deployment

1. No Railway Dashboard, delete o deployment atual
2. Clique em **"New Deployment"**
3. Ou delete o serviço e crie um novo

### Solução 3: Forçar Nixpacks via Variável

Adicione esta variável de ambiente:
```
NIXPACKS_NO_MUSL=1
```

### Verificar se Nixpacks está sendo usado:

Nos logs de build, você deve ver:
```
Using Nixpacks
```

E NÃO deve ver:
```
Using Dockerfile
```

## Arquivos Importantes

- ✅ `nixpacks.toml` - Configuração explícita do Nixpacks
- ✅ `railway.toml` - Configuração do Railway
- ✅ `package-lock.json` - Lockfile das dependências
- ❌ `Dockerfile` - DELETADO (não deve existir)

## Se nada funcionar:

Use **Render.com** ou **Vercel** para o backend (com adaptações).

Ou considere usar **Heroku** que tem melhor suporte para Node.js.
