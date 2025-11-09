# 🚀 Como Iniciar o Servidor

## ✅ Status Atual

- ✅ **Prisma Client gerado com sucesso!**
- ✅ **Todos os processos Node.js foram fechados**
- ✅ **Sistema de Pedidos Balcão 100% implementado**

## 🎯 Próximos Passos

### 1. Aplicar Migration no Banco (SE AINDA NÃO FEZ)

Abra o Neon Console e execute o script:
- Arquivo: `scripts/migration-commands.sql`
- Instruções: `APPLY_MIGRATION_NOW.md`

### 2. Iniciar o Servidor

**Opção A: Via CMD (Recomendado)**
```cmd
cd C:\newProjects\myEasyApp
npm run dev
```

**Opção B: Via PowerShell (Como Administrador)**
```powershell
# Abra PowerShell como Administrador
cd C:\newProjects\myEasyApp
npm run dev
```

**Opção C: Via VS Code Terminal**
1. Abra o terminal integrado do VS Code
2. Execute: `npm run dev`

### 3. Verificar se Funcionou

Você deve ver:
```
✅ Server running on port 3000
✅ Redis connected
✅ API Documentation: http://localhost:3000/api/docs
```

### 4. Testar os Endpoints

Acesse no navegador:
```
http://localhost:3000/api/docs
```

Procure pela tag **"Counter Orders"** - você verá 9 endpoints!

## 🎨 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/counter-orders` | Criar pedido |
| GET | `/api/v1/counter-orders` | Listar ativos |
| GET | `/api/v1/counter-orders/pending-payment` | Pendentes |
| GET | `/api/v1/counter-orders/ready` | Prontos |
| GET | `/api/v1/counter-orders/metrics` | Métricas |
| GET | `/api/v1/counter-orders/:id` | Por ID |
| GET | `/api/v1/counter-orders/number/:orderNumber` | Por número |
| PATCH | `/api/v1/counter-orders/:id/status` | Atualizar status |
| POST | `/api/v1/counter-orders/:id/confirm-payment` | Confirmar pagamento |
| POST | `/api/v1/counter-orders/:id/cancel` | Cancelar |

## 🧪 Teste Rápido

### 1. Obter Token de Autenticação
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "seu-email@example.com",
  "password": "sua-senha"
}
```

### 2. Criar Pedido Balcão
```bash
POST http://localhost:3000/api/v1/counter-orders
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "customerName": "João Silva",
  "notes": "Teste do sistema",
  "items": [
    {
      "productId": "{uuid-de-um-produto}",
      "quantity": 2,
      "notes": "Sem cebola"
    }
  ]
}
```

### 3. Listar Pedidos Ativos
```bash
GET http://localhost:3000/api/v1/counter-orders
Authorization: Bearer {seu-token}
```

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"
```bash
# Windows CMD
netstat -ano | findstr :3000
taskkill /PID {numero-do-pid} /F
```

### Erro: "Cannot find module"
```bash
npm install
npx prisma generate
```

### Erro: "Database connection failed"
- Verifique o arquivo `.env`
- Teste a conexão no Neon Console

## 📊 Verificar Logs

O servidor mostra logs detalhados:
- ✅ Conexões bem-sucedidas
- ⚠️ Avisos
- ❌ Erros

## 🎉 Sucesso!

Quando o servidor estiver rodando:
1. Acesse a documentação Swagger
2. Teste os endpoints
3. Veja os logs em tempo real
4. Monitore as requisições

---

**Tempo estimado:** 2 minutos ⏱️
**Status:** Pronto para uso! 🚀
