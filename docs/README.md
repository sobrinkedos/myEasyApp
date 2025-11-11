# Documentação do Sistema - Restaurant API Core

## 📖 Documentação Principal

### 🏗️ [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)
**📌 COMECE AQUI - Documentação completa e didática de todas as tecnologias do sistema**

Este é o documento principal que explica de forma clara e didática:
- ✅ Runtime e linguagem (Node.js 20, TypeScript 5)
- ✅ Framework web e middlewares (Express, helmet, CORS, compression, rate limiting)
- ✅ Camada de persistência (PostgreSQL 16, Prisma ORM 5, Redis 7)
- ✅ Sistema de segurança (JWT, bcrypt, RBAC, auth/authorization)
- ✅ Validação e utilitários (Zod, Winston, Multer, date-fns, uuid, validator)
- ✅ Stack do frontend (React 18, Vite 5, TailwindCSS 3, React Query 5, Axios, etc)
- ✅ Infraestrutura e Docker (containerização, docker-compose, variáveis de ambiente)
- ✅ Modelos de dados (User, Role, Product, Order, Cash, CMV, etc)
- ✅ Tratamento de erros (hierarquia de erros, error middleware, códigos HTTP)
- ✅ Estratégia de testes (unitários, integração, E2E, coverage)
- ✅ Fluxo de requisição completo (com exemplos práticos)
- ✅ Deployment e produção (CI/CD, monitoramento, graceful shutdown, otimizações)
- ✅ Diagramas arquiteturais (Mermaid)
- ✅ Tabelas resumo de todas as tecnologias

**👉 Recomendado para**: 
- Novos desenvolvedores que querem entender o sistema
- Arquitetos avaliando a stack tecnológica
- Desenvolvedores implementando novas features
- DevOps configurando infraestrutura

---

## 📚 Documentação por Módulo

### 💰 Gestão de Caixa
- [Cash Management API](CASH_MANAGEMENT_API.md) - Documentação completa da API de gestão de caixa
- [Cash Management README](CASH_MANAGEMENT_README.md) - Guia de uso do módulo de caixa
- [Cash Management Quickstart](CASH_MANAGEMENT_QUICKSTART.md) - Início rápido
- [Cash Management Implementation Status](CASH_MANAGEMENT_IMPLEMENTATION_STATUS.md) - Status da implementação
- [Cash Setup](CASH_SETUP.md) - Configuração inicial

### 🏢 Gestão de Estabelecimentos
- [Establishment API](ESTABLISHMENT_API.md) - API de estabelecimentos
- [Establishment CRUD Summary](ESTABLISHMENT_CRUD_SUMMARY.md) - Resumo das operações CRUD
- [Quick Start Establishment](QUICK_START_ESTABLISHMENT.md) - Início rápido
- [Multi-Tenant Changes](MULTI_TENANT_CHANGES.md) - Mudanças para multi-tenancy

### 📦 Gestão de Estoque e CMV
- [Stock Appraisal CMV API](STOCK_APPRAISAL_CMV_API.md) - API de apuração e CMV
- [Stock Appraisal CMV README](STOCK_APPRAISAL_CMV_README.md) - Guia completo
- [Stock Appraisal CMV User Guide](STOCK_APPRAISAL_CMV_USER_GUIDE.md) - Guia do usuário
- [Stock Appraisal CMV Workflows](STOCK_APPRAISAL_CMV_WORKFLOWS.md) - Fluxos de trabalho
- [Stock Appraisal CMV FAQ](STOCK_APPRAISAL_CMV_FAQ.md) - Perguntas frequentes
- [Stock Consolidation Proposal](STOCK_CONSOLIDATION_PROPOSAL.md) - Proposta de consolidação
- [Stock Consolidation Implementation](STOCK_CONSOLIDATION_IMPLEMENTATION.md) - Implementação
- [Stock Transactions Implementation](STOCK_TRANSACTIONS_IMPLEMENTATION.md) - Transações de estoque
- [Sistema Completo CMV](SISTEMA_COMPLETO_CMV.md) - Visão geral do sistema CMV

### 🗄️ Banco de Dados
- [Database Quick Guide](DATABASE_QUICK_GUIDE.md) - Guia rápido do banco de dados
- [Database Migration Strategy](DATABASE_MIGRATION_STRATEGY.md) - Estratégia de migrations

---

## 🚀 Como Usar Esta Documentação

### 👨‍💻 Para Novos Desenvolvedores
1. **Leia o [README principal](../README.md)** do projeto para entender o básico
2. **📖 Estude a [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)** - Este é o documento mais importante! Ele explica todas as tecnologias de forma didática
3. Configure seu ambiente seguindo o guia de instalação
4. Explore a documentação Swagger em `http://localhost:3000/api/docs`
5. Leia a documentação específica do módulo que vai trabalhar

### 🔨 Para Implementar Features
1. **Consulte a [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)** para entender:
   - Padrão de camadas (Routes → Controllers → Services → Repositories)
   - Como fazer validação com Zod
   - Como implementar autenticação e autorização
   - Como usar cache com Redis
   - Como escrever testes
2. Leia a documentação específica do módulo
3. Siga os padrões de código estabelecidos
4. Escreva testes seguindo a estratégia documentada

### 🏗️ Para Arquitetos e Tech Leads
1. **Revise a [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)** para entender:
   - Stack tecnológico completo
   - Decisões arquiteturais e justificativas
   - Padrões de segurança implementados
   - Estratégia de testes e qualidade
   - Infraestrutura e deployment
2. Avalie os diagramas arquiteturais
3. Consulte as tabelas resumo de tecnologias

### 🐛 Para Troubleshooting
1. Verifique os FAQs dos módulos específicos
2. Consulte os guias de implementação
3. Revise os logs da aplicação em `logs/`
4. Use o Prisma Studio para inspecionar dados: `npx prisma studio`
5. Consulte a seção de tratamento de erros na [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)

### 📡 Para Entender a API
1. **Acesse a documentação Swagger** em `http://localhost:3000/api/docs`
2. Consulte os arquivos de API específicos nesta pasta
3. Veja exemplos de requisições nos guias de quickstart
4. Entenda o fluxo de requisição na [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)

### 🚀 Para DevOps e Deploy
1. **Leia a seção de Deployment** na [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)
2. Consulte a configuração Docker e docker-compose
3. Revise as variáveis de ambiente necessárias
4. Entenda o processo de CI/CD
5. Configure monitoramento e health checks

---

## 🎯 Estrutura da Documentação

```
docs/
├── SYSTEM_ARCHITECTURE.md          ⭐ DOCUMENTO PRINCIPAL
├── README.md                        ← Você está aqui
│
├── Cash Management/                 💰 Gestão de Caixa
│   ├── CASH_MANAGEMENT_API.md
│   ├── CASH_MANAGEMENT_README.md
│   └── ...
│
├── Establishment/                   🏢 Estabelecimentos
│   ├── ESTABLISHMENT_API.md
│   ├── MULTI_TENANT_CHANGES.md
│   └── ...
│
├── Stock & CMV/                     📦 Estoque e CMV
│   ├── STOCK_APPRAISAL_CMV_README.md
│   ├── STOCK_CONSOLIDATION_PROPOSAL.md
│   └── ...
│
└── Database/                        🗄️ Banco de Dados
    ├── DATABASE_QUICK_GUIDE.md
    └── DATABASE_MIGRATION_STRATEGY.md
```

---

## 🛠️ Tecnologias Principais

### Backend
- **Node.js 20 LTS** - Runtime JavaScript
- **TypeScript 5.3** - Linguagem tipada
- **Express.js 4.18** - Framework web
- **Prisma ORM 5.7** - ORM type-safe
- **PostgreSQL 16** - Banco de dados
- **Redis 7** - Cache e sessões

### Frontend
- **React 18.2** - Biblioteca UI
- **Vite 5.0** - Build tool
- **TailwindCSS 3.4** - CSS framework
- **React Query 5.17** - State management
- **TypeScript 5.3** - Linguagem tipada

### Infraestrutura
- **Docker** - Containerização
- **docker-compose** - Orquestração
- **Nginx** - Reverse proxy (produção)

**📖 Para detalhes completos de cada tecnologia, consulte a [Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)**

---

## 📞 Links Úteis

### Documentação
- **[Arquitetura do Sistema](SYSTEM_ARCHITECTURE.md)** - Documentação técnica completa
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Prisma Studio**: `npx prisma studio`
- **Health Check**: `http://localhost:3000/health`

### Logs
- **Combined**: `logs/combined.log`
- **Errors**: `logs/error.log`

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev              # Iniciar servidor com hot-reload
npm run prisma:studio    # Abrir Prisma Studio

# Testes
npm test                 # Executar todos os testes
npm run test:watch       # Testes em watch mode
npm test -- --coverage   # Com cobertura

# Qualidade
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente
npm run format           # Formatar com Prettier

# Banco de Dados
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Executar migrations
npm run prisma:seed      # Popular banco

# Docker
docker-compose up -d     # Iniciar serviços
docker-compose logs -f   # Ver logs
docker-compose down      # Parar serviços
```

---

## 📝 Contribuindo

Ao adicionar nova documentação:

1. **Documentação de módulos**: Adicione na pasta apropriada
2. **Mudanças arquiteturais**: Atualize [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
3. **Novos endpoints**: Documente no Swagger e no arquivo de API do módulo
4. **Atualize este README**: Adicione links para novos documentos

---

## ✅ Status da Documentação

| Documento | Status | Última Atualização |
|-----------|--------|-------------------|
| Arquitetura do Sistema | ✅ Completo | Janeiro 2024 |
| Cash Management | ✅ Completo | 2024 |
| Establishment | ✅ Completo | 2024 |
| Stock & CMV | ✅ Completo | 2024 |
| Database | ✅ Completo | 2024 |

---

**Última atualização**: Janeiro 2024  
**Versão da API**: 1.0.0  
**Mantido por**: Equipe de Desenvolvimento
