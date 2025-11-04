# Sistema Integrado para Restaurantes - Especificações

Este diretório contém todas as especificações (specs) do sistema integrado para restaurantes, bares e lanchonetes.

## Visão Geral do Sistema

O sistema é composto por 7 módulos principais que trabalham de forma integrada:

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA INTEGRADO                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Backend    │  │   Comandas   │  │  Pagamentos  │      │
│  │   API Core   │◄─┤   e Pedidos  │◄─┤  Integração  │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                     │
│         ├──────────────┬──────────────┬──────────────┐      │
│         ▼              ▼              ▼              ▼      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Web    │  │  Mobile  │  │   Web    │  │  Mobile  │   │
│  │  Admin   │  │  Waiter  │  │Customer  │  │ Delivery │   │
│  │Dashboard │  │   App    │  │Self-Serv │  │   App    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Sistema de Emissão de Notas Fiscais          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Módulos e Dependências

### 1. Backend API Core ⭐ (FUNDAÇÃO)
**Diretório**: `backend-api-core/`  
**Status**: Requirements completo  
**Dependências**: Nenhuma

Módulo fundamental que fornece:
- API RESTful escalável
- Autenticação e autorização
- Gestão de produtos, categorias e insumos
- Controle de estoque
- Gestão de estabelecimento
- Containerização com Docker

**Começar por este módulo** - todos os outros dependem dele.

---

### 2. Sistema de Comandas e Pedidos
**Diretório**: `order-management-system/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core

Funcionalidades:
- Gestão de mesas
- Abertura e fechamento de comandas
- Criação e modificação de pedidos
- Controle de status (pendente → em preparo → pronto → entregue)
- Pedidos de balcão
- Integração com estoque
- Notificações em tempo real (WebSocket)

---

### 3. Integração de Pagamentos
**Diretório**: `payment-integration/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas

Funcionalidades:
- Processamento de cartão de crédito/débito
- Pagamento via PIX
- Carteiras digitais (Apple Pay, Google Pay)
- Pagamento em dinheiro
- Divisão de pagamento
- Reembolsos
- Webhooks e notificações
- Conformidade PCI-DSS

---

### 4. Sistema de Emissão de Notas Fiscais
**Diretório**: `fiscal-invoice-system/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas, Integração de Pagamentos

Funcionalidades:
- Emissão de NF-e e NFC-e
- Integração com SEFAZ
- Geração de DANFE
- Cancelamento e carta de correção
- Contingência offline
- Tributação de produtos
- Relatórios fiscais
- Conformidade legal brasileira

---

### 5. Web App de Gestão
**Diretório**: `web-admin-dashboard/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas

Funcionalidades:
- Dashboard com métricas
- Gestão de produtos, categorias e insumos
- Controle de estoque
- Vendas no balcão
- Visualização de comandas em tempo real
- Gestão de mesas
- Relatórios gerenciais
- Interface responsiva

---

### 6. App Mobile de Atendimento (Garçons)
**Diretório**: `mobile-waiter-app/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas

Funcionalidades:
- Visualização de mesas
- Abertura de comandas
- Criação de pedidos
- Cardápio digital
- Acompanhamento de status
- Notificações push
- Fechamento de comandas
- Modo offline
- Interface intuitiva para tablets/smartphones

---

### 7. Web App de Autoatendimento (Clientes)
**Diretório**: `customer-self-service/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas

Funcionalidades:
- Acesso via QR Code na mesa
- Visualização do cardápio
- Seleção de produtos e carrinho
- Confirmação de pedidos
- Acompanhamento em tempo real
- Solicitação de atendimento
- Solicitação de conta
- PWA (Progressive Web App)
- Multilíngue

---

### 8. App Mobile de Delivery
**Diretório**: `delivery-app/`  
**Status**: Requirements completo  
**Dependências**: Backend API Core, Sistema de Comandas, Integração de Pagamentos

Funcionalidades:
- Cadastro e autenticação de clientes
- Gestão de endereços
- Seleção de estabelecimento
- Visualização do cardápio
- Montagem de pedido
- Checkout e pagamento
- Acompanhamento de pedido
- Rastreamento em tempo real
- Histórico e avaliações
- Cupons e promoções

---

## Ordem de Implementação Recomendada

### Fase 1 - Fundação (MVP Básico)
1. **Backend API Core** - Implementar completamente
2. **Sistema de Comandas e Pedidos** - Funcionalidades básicas
3. **Web App de Gestão** - Módulos essenciais (produtos, estoque, vendas balcão)

**Resultado**: Sistema funcional para vendas no balcão e gestão básica

### Fase 2 - Atendimento em Mesas
4. **App Mobile de Atendimento** - Para garçons
5. **Sistema de Comandas** - Completar funcionalidades avançadas
6. **Web App de Gestão** - Adicionar visualização de comandas e mesas

**Resultado**: Sistema completo para atendimento em mesas

### Fase 3 - Autoatendimento
7. **Web App de Autoatendimento** - Para clientes
8. **Integração de Pagamentos** - Implementar métodos digitais

**Resultado**: Clientes podem fazer pedidos sem garçom

### Fase 4 - Delivery
9. **App Mobile de Delivery** - Para clientes
10. **Integração de Pagamentos** - Completar todos os métodos
11. **Backend** - Adicionar funcionalidades específicas de delivery

**Resultado**: Sistema completo com delivery

### Fase 5 - Conformidade Fiscal
12. **Sistema de Emissão de Notas Fiscais** - Integração completa

**Resultado**: Sistema em conformidade legal

---

## Tecnologias Principais

### Backend
- Node.js 20 LTS + TypeScript
- Express.js
- PostgreSQL 16
- Redis 7
- Prisma ORM
- Docker

### Web Apps
- React 18 + TypeScript
- Next.js (Admin Dashboard)
- Vite (Customer Self-Service)
- TailwindCSS
- React Query

### Mobile Apps
- React Native + TypeScript
- Expo
- React Navigation
- AsyncStorage

### Infraestrutura
- Docker Compose
- NGINX
- WebSocket (Socket.io)
- CI/CD (GitHub Actions)

---

## Como Usar Este Repositório

### 1. Revisar Requirements
Cada módulo possui um arquivo `requirements.md` com requisitos detalhados seguindo padrão EARS e INCOSE.

### 2. Implementar Módulos
Siga a ordem recomendada acima. Cada módulo terá:
- `requirements.md` - Requisitos (✅ Completo)
- `design.md` - Design técnico (A criar)
- `tasks.md` - Plano de implementação (A criar)

### 3. Executar Tasks
Após criar design e tasks para um módulo:
1. Abra o arquivo `tasks.md`
2. Clique em "Start task" ao lado de cada tarefa
3. Implemente seguindo as instruções

---

## Status Atual

| Módulo | Requirements | Design | Tasks | Implementação |
|--------|-------------|--------|-------|---------------|
| Backend API Core | ✅ | ✅ | ✅ | ⏳ Pronto para iniciar |
| Comandas e Pedidos | ✅ | ✅ | ✅ | ⏳ Pronto para iniciar |
| Pagamentos | ✅ | ⏳ | ⏳ | ⏳ |
| Notas Fiscais | ✅ | ⏳ | ⏳ | ⏳ |
| Web Admin | ✅ | 🔄 Em progresso | ⏳ | ⏳ |
| Mobile Waiter | ✅ | ⏳ | ⏳ | ⏳ |
| Web Self-Service | ✅ | ⏳ | ⏳ | ⏳ |
| Mobile Delivery | ✅ | ⏳ | ⏳ | ⏳ |

---

## Próximos Passos

1. **Implementar Backend API Core** - Começar pelas tasks definidas
2. **Criar Design para Sistema de Comandas** - Após backend estar funcional
3. **Implementar Sistema de Comandas** - Base para apps de atendimento
4. **Continuar com Web Admin** - Interface de gestão

---

## Contribuindo

Ao trabalhar em qualquer módulo:
1. Leia completamente o `requirements.md`
2. Revise o `design.md` quando disponível
3. Siga as tasks em ordem
4. Marque tasks como concluídas
5. Teste cada funcionalidade implementada
6. Documente código e APIs

---

## Suporte

Para dúvidas sobre as specs ou implementação:
1. Revise a documentação do módulo específico
2. Consulte o README.md de cada módulo
3. Verifique exemplos de código nos designs

---

**Última atualização**: 2025-11-04  
**Versão das Specs**: 1.0.0
