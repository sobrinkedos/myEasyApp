# Documentação - Sistema de Estabelecimento Multi-tenant

## 📚 Índice de Documentação

### 🚀 Início Rápido
- **[QUICK_START_ESTABLISHMENT.md](QUICK_START_ESTABLISHMENT.md)** - Guia rápido com exemplos práticos de uso da API

### 📖 Documentação Completa
- **[ESTABLISHMENT_API.md](ESTABLISHMENT_API.md)** - Documentação completa de todos os endpoints da API de Estabelecimento

### 🔧 Detalhes Técnicos
- **[MULTI_TENANT_CHANGES.md](MULTI_TENANT_CHANGES.md)** - Detalhes das mudanças implementadas para o sistema multi-tenant
- **[ESTABLISHMENT_CRUD_SUMMARY.md](ESTABLISHMENT_CRUD_SUMMARY.md)** - Resumo técnico da implementação completa

---

## 🎯 O que é o Sistema Multi-tenant?

O sistema foi desenvolvido para permitir que **múltiplos estabelecimentos** (restaurantes, bares, lanchonetes) usem a mesma aplicação de forma **isolada e segura**.

### Características Principais

✅ **Registro Automático**
- Ao se registrar, o usuário cria automaticamente seu estabelecimento
- O primeiro usuário se torna administrador do estabelecimento

✅ **Isolamento de Dados**
- Cada estabelecimento tem seus próprios dados
- Usuários não podem acessar dados de outros estabelecimentos
- Identificação via token JWT

✅ **Gestão Simplificada**
- Admin pode editar dados do estabelecimento
- Upload de logo personalizado
- Configurações fiscais específicas

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Web/Mobile)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API REST                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │ Establishment│  │   Products   │      │
│  │   /register  │  │     /GET     │  │   /orders    │      │
│  │    /login    │  │     /PUT     │  │   /tables    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE NEGÓCIO                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │ Repositories │  │  Validators  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BANCO DE DADOS                         │
│                                                               │
│  Establishment 1          Establishment 2                    │
│  ├── Users                ├── Users                          │
│  ├── Products             ├── Products                       │
│  ├── Orders               ├── Orders                         │
│  └── Tables               └── Tables                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
1. Usuário acessa /register
   ↓
2. Preenche dados pessoais + estabelecimento
   ↓
3. Sistema cria:
   - Estabelecimento
   - Usuário Admin
   - Role Admin
   ↓
4. Retorna Token JWT
   {
     userId: "uuid",
     email: "user@example.com",
     establishmentId: "uuid",  ← Identifica o tenant
     roles: ["admin"]
   }
   ↓
5. Token usado em todas as requisições
   ↓
6. Sistema identifica estabelecimento pelo token
```

---

## 📋 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registrar estabelecimento + admin
- `POST /api/v1/auth/login` - Login

### Estabelecimento
- `GET /api/v1/establishment` - Buscar dados
- `PUT /api/v1/establishment` - Atualizar (admin)
- `POST /api/v1/establishment/logo` - Upload logo (admin)

---

## 🚦 Como Começar

### 1. Leia o Guia Rápido
Comece com **[QUICK_START_ESTABLISHMENT.md](QUICK_START_ESTABLISHMENT.md)** para ver exemplos práticos.

### 2. Consulte a API Completa
Veja **[ESTABLISHMENT_API.md](ESTABLISHMENT_API.md)** para detalhes de todos os endpoints.

### 3. Entenda as Mudanças
Leia **[MULTI_TENANT_CHANGES.md](MULTI_TENANT_CHANGES.md)** para entender a arquitetura.

### 4. Explore o Código
Veja **[ESTABLISHMENT_CRUD_SUMMARY.md](ESTABLISHMENT_CRUD_SUMMARY.md)** para detalhes técnicos.

---

## 🧪 Testando

### Executar Testes
```bash
# Todos os testes
npm test

# Apenas testes de registro
npm test -- auth-register.test.ts

# Apenas testes de estabelecimento
npm test -- establishment.test.ts
```

### Swagger UI
Acesse: `http://localhost:3000/api/docs`

---

## 📊 Estrutura de Dados

### Establishment
```typescript
{
  id: string
  name: string
  cnpj: string (14 dígitos)
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string (2 chars)
    zipCode: string
  }
  phone: string
  email: string
  logoUrl?: string
  taxSettings: {
    taxRegime: 'simples' | 'presumido' | 'real'
    icmsRate: number (0-100)
    issRate: number (0-100)
    pisRate: number (0-100)
    cofinsRate: number (0-100)
  }
  createdAt: DateTime
  updatedAt: DateTime
}
```

### User
```typescript
{
  id: string
  email: string
  name: string
  phone?: string
  establishmentId: string  ← Vinculação ao tenant
  isActive: boolean
  roles: Role[]
}
```

---

## 🔒 Segurança

### Validações
- ✅ Senha forte obrigatória
- ✅ CNPJ válido e único
- ✅ Email válido e único
- ✅ Validação de todos os campos

### Autenticação
- ✅ JWT com 7 dias de validade
- ✅ Token contém establishmentId
- ✅ Middleware de autenticação

### Autorização
- ✅ Role-based access control (RBAC)
- ✅ Apenas admin pode editar estabelecimento
- ✅ Isolamento de dados por tenant

### Auditoria
- ✅ Log de todas as operações
- ✅ Rastreamento de usuário e timestamp
- ✅ Estado anterior e novo estado

---

## 🛠️ Tecnologias

- **Node.js 20** - Runtime
- **TypeScript 5** - Linguagem
- **Express.js 4** - Framework web
- **Prisma ORM 5** - ORM
- **PostgreSQL 16** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação
- **Jest** - Testes

---

## 📞 Suporte

### Documentação
- Swagger: `http://localhost:3000/api/docs`
- Logs: `logs/combined.log`

### Comandos Úteis
```bash
npm run dev          # Iniciar servidor
npm test             # Executar testes
npm run lint         # Verificar código
npm run format       # Formatar código
```

---

## ✅ Status do Projeto

**Sistema Multi-tenant:** ✅ Completo e Testado

**Funcionalidades Implementadas:**
- ✅ Registro automático de estabelecimento
- ✅ Criação de usuário admin
- ✅ Isolamento de dados por tenant
- ✅ Edição de estabelecimento
- ✅ Upload de logo
- ✅ Validações completas
- ✅ Auditoria
- ✅ Testes automatizados
- ✅ Documentação completa

---

## 📝 Licença

Este projeto é parte do sistema Restaurant Management API Core.

---

**Última atualização:** 2024
**Versão da API:** 1.0.0
