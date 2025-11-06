# 🚀 Como Iniciar o Sistema Completo

## Erro Atual
```
ERR_CONNECTION_REFUSED
Failed to load resource: http://localhost:3000/api/v1/categories
```

**Causa**: O backend não está rodando.

## Solução Rápida

### 1. Aplicar Migrations (Primeira Vez)
Execute: `FIX_MIGRATIONS.bat`

Ou manualmente:
```bash
npx prisma migrate resolve --applied 20241105000001_add_stock_item_image
npx prisma migrate resolve --applied 20241106000001_enrich_ingredients
npx prisma generate
npx prisma migrate deploy
```

### 2. Iniciar Backend e Frontend
Execute: `START_SERVERS.bat`

Ou manualmente:

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd web-app
npm run dev
```

### 3. Aguardar Inicialização

**Backend estará pronto quando ver:**
```
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
```

**Frontend estará pronto quando ver:**
```
VITE ready in XXXms
Local: http://localhost:5173/
```

### 4. Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api/docs

## Verificar se Backend Está Rodando

### Teste 1: Health Check
Abra no navegador:
```
http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Teste 2: Categorias
```
http://localhost:3000/api/v1/categories
```

Se retornar erro 401 (Unauthorized), está funcionando!
Se retornar erro de conexão, backend não está rodando.

## Problemas Comuns

### Problema 1: Porta 3000 em Uso
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**
1. Encontre o processo:
```bash
netstat -ano | findstr :3000
```

2. Mate o processo:
```bash
taskkill /PID <numero_do_pid> /F
```

3. Ou mude a porta no `.env`:
```
PORT=3001
```

### Problema 2: Erro de Migration
```
Error: P3006 Migration failed
```

**Solução:**
Execute: `FIX_MIGRATIONS.bat`

### Problema 3: Prisma Client Não Gerado
```
Error: Cannot find module '@prisma/client'
```

**Solução:**
```bash
npx prisma generate
```

### Problema 4: Variáveis de Ambiente
```
Error: DATABASE_URL is not defined
```

**Solução:**
1. Verifique se `.env` existe na raiz
2. Copie de `.env.example` se necessário
3. Configure `DATABASE_URL` corretamente

### Problema 5: Redis Não Conecta
```
Error: Redis connection failed
```

**Solução:**
1. Verifique se Redis está rodando
2. Ou desabilite Redis temporariamente no código
3. Ou use Redis em nuvem (Upstash)

## Ordem de Inicialização

### Primeira Vez (Setup Completo)
1. ✅ Instalar dependências: `npm install`
2. ✅ Instalar dependências frontend: `cd web-app && npm install`
3. ✅ Configurar `.env`
4. ✅ Aplicar migrations: `FIX_MIGRATIONS.bat`
5. ✅ Iniciar backend: `npm run dev`
6. ✅ Iniciar frontend: `cd web-app && npm run dev`

### Uso Diário
1. ✅ Iniciar backend: `npm run dev`
2. ✅ Iniciar frontend: `cd web-app && npm run dev`

Ou simplesmente: `START_SERVERS.bat`

## Scripts Disponíveis

### Backend
```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm run start:prod   # Rodar produção
npm test             # Rodar testes
```

### Frontend
```bash
cd web-app
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Prisma
```bash
npx prisma generate  # Gerar client
npx prisma migrate dev  # Aplicar migrations (dev)
npx prisma migrate deploy  # Aplicar migrations (prod)
npx prisma studio    # Interface visual do banco
```

## Logs e Debug

### Ver Logs do Backend
Os logs aparecem no terminal onde você rodou `npm run dev`

### Ver Logs do Frontend
Os logs aparecem no terminal onde você rodou `npm run dev` (web-app)

### Ver Logs do Navegador
Pressione F12 e vá para a aba Console

## Testar APIs

### Swagger UI
http://localhost:3000/api/docs

### Postman/Insomnia
Importe a collection da documentação Swagger

### cURL
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'

# Listar categorias (com token)
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Estrutura de Portas

- **3000**: Backend API
- **5173**: Frontend (Vite)
- **5432**: PostgreSQL (se local)
- **6379**: Redis (se local)

## Próximos Passos Após Iniciar

1. ✅ Fazer login no sistema
2. ✅ Testar criação de categoria
3. ✅ Testar criação de ingrediente
4. ✅ Testar criação de receita
5. ✅ Testar cálculo de custos

## Suporte

Se o problema persistir:
1. Verifique os logs do terminal
2. Verifique o console do navegador (F12)
3. Verifique se todas as dependências estão instaladas
4. Verifique se o `.env` está configurado
5. Tente reiniciar tudo

---

**Dica**: Use `START_SERVERS.bat` para iniciar tudo de uma vez!
