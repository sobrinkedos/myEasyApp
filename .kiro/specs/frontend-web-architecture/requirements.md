# Requirements Document - Arquitetura Frontend Web

## Introduction

Este documento especifica os requisitos para a Arquitetura do Frontend Web do sistema de gestão de restaurantes. Define a estrutura completa de rotas, navegação, layouts, modais, componentes compartilhados e organização de código para garantir uma aplicação web escalável, manutenível e consistente. Este documento complementa as specs existentes (web-admin-dashboard, restaurant-design-system) focando especificamente na arquitetura e estrutura da aplicação.

## Glossary

- **SPA (Single Page Application)**: Aplicação web que carrega uma única página HTML e atualiza dinamicamente o conteúdo
- **Rota (Route)**: Caminho URL que mapeia para uma página ou componente específico
- **Layout**: Estrutura visual comum compartilhada entre múltiplas páginas
- **Modal**: Janela sobreposta que exige interação do usuário antes de retornar ao conteúdo principal
- **Drawer**: Painel lateral deslizante usado para navegação ou conteúdo adicional
- **Toast/Snackbar**: Notificação temporária não-intrusiva exibida na tela
- **Protected Route**: Rota que requer autenticação para acesso
- **Lazy Loading**: Técnica de carregar componentes sob demanda para otimizar performance
- **Code Splitting**: Divisão do código em chunks menores carregados conforme necessário
- **State Management**: Gerenciamento centralizado do estado da aplicação
- **Context Provider**: Componente React que fornece dados globais via Context API

## Requirements

### Requirement 1 - Estrutura de Rotas Principais

**User Story:** Como desenvolvedor, eu quero uma estrutura de rotas bem definida, para que possa navegar e organizar a aplicação de forma lógica.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar as seguintes rotas públicas: `/login`, `/forgot-password`, `/reset-password/:token`
2. A Arquitetura Frontend Web DEVE implementar as seguintes rotas protegidas: `/dashboard`, `/products`, `/categories`, `/ingredients`, `/stock`, `/sales`, `/orders`, `/tables`, `/cash`, `/reports`, `/settings`, `/users`
3. QUANDO usuário não autenticado tenta acessar rota protegida, A Arquitetura Frontend Web DEVE redirecionar para `/login` com parâmetro `redirect` contendo URL original
4. QUANDO usuário autenticado acessa `/login`, A Arquitetura Frontend Web DEVE redirecionar para `/dashboard`
5. A Arquitetura Frontend Web DEVE implementar rota 404 para URLs não encontradas com opção de voltar ao dashboard

### Requirement 2 - Hierarquia de Rotas e Subrotas

**User Story:** Como desenvolvedor, eu quero organizar rotas em hierarquia lógica, para que a estrutura reflita a organização do sistema.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar subrotas de produtos: `/products` (listagem), `/products/new` (criar), `/products/:id` (visualizar), `/products/:id/edit` (editar)
2. A Arquitetura Frontend Web DEVE implementar subrotas de pedidos: `/orders` (listagem), `/orders/:id` (detalhes), `/orders/pos` (ponto de venda)
3. A Arquitetura Frontend Web DEVE implementar subrotas de relatórios: `/reports/sales`, `/reports/stock`, `/reports/financial`, `/reports/performance`
4. A Arquitetura Frontend Web DEVE implementar subrotas de configurações: `/settings/establishment`, `/settings/profile`, `/settings/users`, `/settings/permissions`
5. A Arquitetura Frontend Web DEVE usar breadcrumbs para indicar localização do usuário na hierarquia de rotas

### Requirement 3 - Layouts e Templates

**User Story:** Como desenvolvedor, eu quero layouts reutilizáveis, para que possa manter consistência visual entre páginas.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar `AuthLayout` para páginas de autenticação com logo centralizado e fundo branded
2. A Arquitetura Frontend Web DEVE implementar `DashboardLayout` com sidebar, topbar, breadcrumbs e área de conteúdo principal
3. A Arquitetura Frontend Web DEVE implementar `FullscreenLayout` para páginas como ponto de venda que ocupam tela inteira
4. QUANDO usuário está em rota protegida, A Arquitetura Frontend Web DEVE usar `DashboardLayout` por padrão
5. A Arquitetura Frontend Web DEVE permitir que páginas específicas sobrescrevam layout padrão quando necessário

### Requirement 4 - Componente de Sidebar

**User Story:** Como usuário, eu quero uma sidebar de navegação consistente, para que possa acessar funcionalidades rapidamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE exibir sidebar com logo do estabelecimento no topo
2. A Arquitetura Frontend Web DEVE organizar menu em grupos: Dashboard, Vendas (Pedidos, Mesas, Caixa), Produtos (Produtos, Categorias, Insumos, Estoque), Relatórios, Configurações
3. A Arquitetura Frontend Web DEVE destacar visualmente item de menu ativo correspondente à rota atual
4. QUANDO usuário clica em item de menu, A Arquitetura Frontend Web DEVE navegar para rota correspondente e fechar sidebar em mobile
5. A Arquitetura Frontend Web DEVE exibir avatar e nome do usuário no rodapé da sidebar com opção de logout

### Requirement 5 - Componente de Topbar

**User Story:** Como usuário, eu quero uma topbar com ações contextuais, para que possa acessar funcionalidades importantes rapidamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE exibir topbar com botão de menu (mobile), breadcrumbs e ações à direita
2. A Arquitetura Frontend Web DEVE exibir ícone de notificações com badge indicando quantidade de notificações não lidas
3. QUANDO usuário clica em notificações, A Arquitetura Frontend Web DEVE exibir dropdown com lista de notificações recentes
4. A Arquitetura Frontend Web DEVE exibir avatar do usuário com dropdown contendo: Perfil, Configurações, Logout
5. A Arquitetura Frontend Web DEVE exibir indicador de status de conexão (online/offline) quando aplicável

### Requirement 6 - Sistema de Modais

**User Story:** Como desenvolvedor, eu quero sistema de modais padronizado, para que possa exibir conteúdo sobreposto de forma consistente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar componente `Modal` base com props: title, size (sm, md, lg, xl, full), onClose, children
2. A Arquitetura Frontend Web DEVE implementar `ConfirmModal` para confirmações com título, mensagem, botões cancelar e confirmar customizáveis
3. A Arquitetura Frontend Web DEVE implementar `FormModal` para formulários com título, conteúdo, botões cancelar e salvar
4. QUANDO modal é aberto, A Arquitetura Frontend Web DEVE bloquear scroll do body e exibir overlay escuro
5. QUANDO usuário pressiona ESC ou clica fora do modal, A Arquitetura Frontend Web DEVE fechar modal (comportamento pode ser desabilitado)

### Requirement 7 - Modais Específicos do Sistema

**User Story:** Como usuário, eu quero modais específicos para operações comuns, para que possa realizar ações rapidamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar `ProductFormModal` para criar/editar produtos com upload de imagem
2. A Arquitetura Frontend Web DEVE implementar `CategoryFormModal` para criar/editar categorias
3. A Arquitetura Frontend Web DEVE implementar `StockTransactionModal` para registrar entradas/saídas de estoque
4. A Arquitetura Frontend Web DEVE implementar `CashOperationModal` para sangrias e suprimentos de caixa
5. A Arquitetura Frontend Web DEVE implementar `OrderDetailModal` para visualizar detalhes completos de pedido

### Requirement 8 - Sistema de Notificações Toast

**User Story:** Como usuário, eu quero receber feedback visual de ações, para que possa confirmar que operações foram executadas.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar sistema de toast com variantes: success (verde), error (vermelho), warning (amarelo), info (azul)
2. A Arquitetura Frontend Web DEVE exibir toasts no canto superior direito com animação de entrada/saída
3. A Arquitetura Frontend Web DEVE auto-dismiss toasts após 5 segundos (configurável)
4. QUANDO múltiplos toasts são exibidos, A Arquitetura Frontend Web DEVE empilhá-los verticalmente
5. A Arquitetura Frontend Web DEVE permitir fechar toast manualmente clicando no botão X

### Requirement 9 - Componentes de Listagem

**User Story:** Como desenvolvedor, eu quero componentes de listagem reutilizáveis, para que possa exibir dados tabulares de forma consistente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar componente `DataTable` com suporte a: colunas customizáveis, ordenação, paginação, busca
2. A Arquitetura Frontend Web DEVE implementar `CardGrid` para exibir itens em grid responsivo (produtos, categorias)
3. A Arquitetura Frontend Web DEVE implementar `EmptyState` para quando não houver dados, com ilustração, mensagem e ação sugerida
4. QUANDO tabela está carregando, A Arquitetura Frontend Web DEVE exibir skeleton loading mantendo estrutura da tabela
5. A Arquitetura Frontend Web DEVE implementar paginação com controles: primeira página, anterior, números de página, próxima, última página

### Requirement 10 - Componentes de Formulário

**User Story:** Como desenvolvedor, eu quero componentes de formulário padronizados, para que possa criar forms consistentes rapidamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar componentes de input: `TextField`, `TextArea`, `Select`, `Checkbox`, `Radio`, `Switch`, `DatePicker`, `TimePicker`
2. A Arquitetura Frontend Web DEVE implementar `FileUpload` com preview de imagem, drag-and-drop e validação de tipo/tamanho
3. A Arquitetura Frontend Web DEVE implementar `CurrencyInput` com formatação automática de valores monetários
4. QUANDO campo tem erro de validação, A Arquitetura Frontend Web DEVE exibir mensagem de erro abaixo do campo com cor vermelha
5. A Arquitetura Frontend Web DEVE implementar `FormSection` para agrupar campos relacionados com título e divider

### Requirement 11 - Gerenciamento de Estado Global

**User Story:** Como desenvolvedor, eu quero gerenciamento de estado centralizado, para que possa compartilhar dados entre componentes facilmente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar `AuthContext` para gerenciar estado de autenticação (user, token, isAuthenticated)
2. A Arquitetura Frontend Web DEVE implementar `NotificationContext` para gerenciar notificações em tempo real via WebSocket
3. A Arquitetura Frontend Web DEVE implementar `ThemeContext` para gerenciar tema (light/dark) com persistência em localStorage
4. A Arquitetura Frontend Web DEVE implementar `CartContext` para gerenciar carrinho de vendas no balcão
5. A Arquitetura Frontend Web DEVE usar React Query para cache e sincronização de dados da API

### Requirement 12 - Navegação e Fluxos de Usuário

**User Story:** Como usuário, eu quero navegação intuitiva entre telas, para que possa completar tarefas com eficiência.

#### Acceptance Criteria

1. QUANDO usuário cria novo produto, A Arquitetura Frontend Web DEVE redirecionar para página de detalhes do produto após sucesso
2. QUANDO usuário cancela formulário com alterações não salvas, A Arquitetura Frontend Web DEVE exibir confirmação "Descartar alterações?"
3. QUANDO usuário deleta item, A Arquitetura Frontend Web DEVE exibir confirmação e permanecer na listagem após sucesso
4. A Arquitetura Frontend Web DEVE implementar botão "Voltar" em páginas de detalhes que retorna à listagem anterior
5. A Arquitetura Frontend Web DEVE manter scroll position ao navegar de volta para listagens

### Requirement 13 - Tratamento de Erros

**User Story:** Como usuário, eu quero mensagens de erro claras, para que possa entender e resolver problemas.

#### Acceptance Criteria

1. QUANDO requisição à API retorna erro 401, A Arquitetura Frontend Web DEVE fazer logout automático e redirecionar para login
2. QUANDO requisição à API retorna erro 403, A Arquitetura Frontend Web DEVE exibir toast "Você não tem permissão para esta ação"
3. QUANDO requisição à API retorna erro 404, A Arquitetura Frontend Web DEVE exibir mensagem "Recurso não encontrado"
4. QUANDO requisição à API retorna erro 500, A Arquitetura Frontend Web DEVE exibir mensagem "Erro no servidor. Tente novamente mais tarde"
5. A Arquitetura Frontend Web DEVE implementar Error Boundary para capturar erros de renderização e exibir fallback UI

### Requirement 14 - Loading States

**User Story:** Como usuário, eu quero feedback visual durante carregamento, para que possa saber que o sistema está processando.

#### Acceptance Criteria

1. QUANDO página está carregando dados iniciais, A Arquitetura Frontend Web DEVE exibir skeleton loading mantendo estrutura da página
2. QUANDO botão de submit é clicado, A Arquitetura Frontend Web DEVE exibir spinner no botão e desabilitá-lo
3. QUANDO tabela está recarregando dados, A Arquitetura Frontend Web DEVE exibir overlay transparente com spinner
4. A Arquitetura Frontend Web DEVE implementar `LoadingOverlay` para operações que bloqueiam toda a tela
5. A Arquitetura Frontend Web DEVE exibir progress bar no topo da página durante navegação entre rotas

### Requirement 15 - Responsividade e Mobile

**User Story:** Como usuário mobile, eu quero interface adaptada para telas pequenas, para que possa usar o sistema em qualquer dispositivo.

#### Acceptance Criteria

1. QUANDO largura da tela é menor que 768px, A Arquitetura Frontend Web DEVE ocultar sidebar e exibir botão de menu hamburguer
2. QUANDO usuário clica em menu hamburguer, A Arquitetura Frontend Web DEVE exibir sidebar como drawer deslizante da esquerda
3. QUANDO em mobile, A Arquitetura Frontend Web DEVE empilhar cards verticalmente ao invés de grid
4. QUANDO em mobile, A Arquitetura Frontend Web DEVE converter tabelas em cards expansíveis para melhor visualização
5. A Arquitetura Frontend Web DEVE usar bottom sheet ao invés de modais em mobile para melhor UX

### Requirement 16 - Busca e Filtros

**User Story:** Como usuário, eu quero buscar e filtrar dados facilmente, para que possa encontrar informações rapidamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar `SearchBar` com debounce de 300ms para evitar requisições excessivas
2. A Arquitetura Frontend Web DEVE implementar `FilterPanel` com chips selecionáveis para filtros rápidos
3. QUANDO usuário aplica filtros, A Arquitetura Frontend Web DEVE atualizar URL com query params para permitir compartilhamento
4. A Arquitetura Frontend Web DEVE exibir contador "X resultados encontrados" após busca/filtro
5. A Arquitetura Frontend Web DEVE implementar botão "Limpar filtros" que reseta todos os filtros aplicados

### Requirement 17 - Acessibilidade

**User Story:** Como usuário com necessidades especiais, eu quero interface acessível, para que possa usar o sistema sem barreiras.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE garantir que todos os elementos interativos sejam navegáveis por teclado (Tab, Enter, Esc)
2. A Arquitetura Frontend Web DEVE implementar focus indicators visíveis em todos os elementos focáveis
3. A Arquitetura Frontend Web DEVE usar atributos ARIA apropriados (aria-label, aria-describedby, role) em componentes
4. A Arquitetura Frontend Web DEVE garantir contraste mínimo WCAG AA (4.5:1) entre texto e fundo
5. QUANDO modal é aberto, A Arquitetura Frontend Web DEVE mover foco para primeiro elemento focável do modal

### Requirement 18 - Performance e Otimização

**User Story:** Como usuário, eu quero aplicação rápida e responsiva, para que possa trabalhar com eficiência.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar code splitting por rota usando React.lazy
2. A Arquitetura Frontend Web DEVE implementar lazy loading de imagens com placeholder blur
3. A Arquitetura Frontend Web DEVE cachear requisições GET usando React Query com staleTime de 5 minutos
4. A Arquitetura Frontend Web DEVE implementar virtual scrolling em listas com mais de 100 itens
5. A Arquitetura Frontend Web DEVE ter bundle inicial menor que 200KB (gzipped)

### Requirement 19 - Integração com WebSocket

**User Story:** Como usuário, eu quero atualizações em tempo real, para que possa ver mudanças sem recarregar a página.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE estabelecer conexão WebSocket após autenticação bem-sucedida
2. QUANDO pedido muda de status, A Arquitetura Frontend Web DEVE atualizar UI automaticamente sem refresh
3. QUANDO nova comanda é aberta, A Arquitetura Frontend Web DEVE adicionar à lista de comandas em tempo real
4. QUANDO conexão WebSocket é perdida, A Arquitetura Frontend Web DEVE exibir indicador "Offline" e tentar reconectar
5. A Arquitetura Frontend Web DEVE implementar heartbeat para detectar conexões inativas

### Requirement 20 - Temas e Personalização

**User Story:** Como usuário, eu quero personalizar aparência da interface, para que possa trabalhar confortavelmente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar toggle de tema light/dark no menu do usuário
2. QUANDO usuário altera tema, A Arquitetura Frontend Web DEVE aplicar mudança imediatamente e persistir em localStorage
3. A Arquitetura Frontend Web DEVE detectar preferência de tema do sistema operacional na primeira visita
4. A Arquitetura Frontend Web DEVE usar CSS variables para cores permitindo troca de tema sem re-render
5. A Arquitetura Frontend Web DEVE garantir que todos os componentes funcionem corretamente em ambos os temas

### Requirement 21 - Internacionalização (i18n)

**User Story:** Como desenvolvedor, eu quero estrutura preparada para múltiplos idiomas, para que possa adicionar traduções no futuro.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE usar biblioteca de i18n (react-i18next ou similar) para gerenciar traduções
2. A Arquitetura Frontend Web DEVE organizar traduções em arquivos JSON por namespace (common, products, orders, etc)
3. A Arquitetura Frontend Web DEVE implementar função `t()` para traduzir strings em componentes
4. A Arquitetura Frontend Web DEVE formatar datas, números e moedas de acordo com locale selecionado
5. A Arquitetura Frontend Web DEVE implementar português brasileiro (pt-BR) como idioma padrão

### Requirement 22 - Segurança Frontend

**User Story:** Como sistema, eu quero implementar práticas de segurança no frontend, para que dados sensíveis sejam protegidos.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE armazenar token JWT em localStorage (ou httpOnly cookie se disponível)
2. A Arquitetura Frontend Web DEVE limpar todos os dados sensíveis do localStorage ao fazer logout
3. A Arquitetura Frontend Web DEVE implementar timeout de sessão após 30 minutos de inatividade
4. A Arquitetura Frontend Web DEVE sanitizar inputs do usuário antes de renderizar para prevenir XSS
5. A Arquitetura Frontend Web DEVE validar permissões do usuário antes de exibir ações restritas

### Requirement 23 - Documentação de Componentes

**User Story:** Como desenvolvedor, eu quero documentação de componentes, para que possa entender e usar componentes corretamente.

#### Acceptance Criteria

1. A Arquitetura Frontend Web DEVE implementar Storybook com stories para todos os componentes reutilizáveis
2. A Arquitetura Frontend Web DEVE documentar props, tipos TypeScript e exemplos de uso para cada componente
3. A Arquitetura Frontend Web DEVE incluir stories mostrando diferentes estados (default, loading, error, empty)
4. A Arquitetura Frontend Web DEVE documentar padrões de composição e melhores práticas
5. A Arquitetura Frontend Web DEVE manter README.md na raiz do projeto com instruções de setup e desenvolvimento

## Non-Functional Requirements

### Performance

**NFR-01:** A Arquitetura Frontend Web DEVE carregar página inicial em menos de 2 segundos em conexão 3G

**NFR-02:** A Arquitetura Frontend Web DEVE manter First Contentful Paint (FCP) abaixo de 1.5 segundos

**NFR-03:** A Arquitetura Frontend Web DEVE manter Time to Interactive (TTI) abaixo de 3 segundos

**NFR-04:** A Arquitetura Frontend Web DEVE manter Cumulative Layout Shift (CLS) abaixo de 0.1

### Scalability

**NFR-05:** A Arquitetura Frontend Web DEVE suportar adição de novas rotas sem refatoração significativa

**NFR-06:** A Arquitetura Frontend Web DEVE permitir adição de novos módulos de forma modular

**NFR-07:** A Arquitetura Frontend Web DEVE suportar lazy loading de módulos inteiros

### Maintainability

**NFR-08:** A Arquitetura Frontend Web DEVE seguir padrões de código consistentes (ESLint + Prettier)

**NFR-09:** A Arquitetura Frontend Web DEVE ter cobertura de testes mínima de 70%

**NFR-10:** A Arquitetura Frontend Web DEVE usar TypeScript com strict mode habilitado

**NFR-11:** A Arquitetura Frontend Web DEVE organizar código em estrutura de pastas clara e lógica

### Browser Support

**NFR-12:** A Arquitetura Frontend Web DEVE suportar Chrome, Firefox, Safari e Edge (últimas 2 versões)

**NFR-13:** A Arquitetura Frontend Web DEVE funcionar em iOS Safari 13+ e Chrome Android 90+

### Accessibility

**NFR-14:** A Arquitetura Frontend Web DEVE atingir score mínimo de 90 no Lighthouse Accessibility

**NFR-15:** A Arquitetura Frontend Web DEVE ser compatível com leitores de tela (NVDA, JAWS, VoiceOver)

## Technical Stack

### Core Framework
- React 18+ com TypeScript
- React Router v6 para roteamento
- Vite ou Next.js como build tool

### State Management
- React Query para server state
- Context API para client state
- Zustand ou Jotai para estado global complexo (opcional)

### UI Components
- Design System próprio (conforme spec restaurant-design-system)
- Headless UI ou Radix UI para componentes acessíveis
- Tailwind CSS para estilização

### Forms
- React Hook Form para gerenciamento de formulários
- Zod para validação de schemas

### Real-time
- Socket.io-client para WebSocket
- React Query para sincronização otimista

### Testing
- Vitest para testes unitários
- React Testing Library para testes de componentes
- Playwright ou Cypress para testes E2E

## Folder Structure

```
src/
├── app/                    # App configuration
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── pages/                  # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── products/
│   │   ├── ProductListPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   └── ProductFormPage.tsx
│   └── ...
├── layouts/                # Layout components
│   ├── AuthLayout.tsx
│   ├── DashboardLayout.tsx
│   └── FullscreenLayout.tsx
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── common/            # Common composed components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── DataTable.tsx
│   │   └── ...
│   └── domain/            # Domain-specific components
│       ├── ProductCard.tsx
│       ├── OrderCard.tsx
│       └── ...
├── features/              # Feature modules
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── ...
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── ...
├── services/              # API services
│   ├── api.ts
│   ├── auth.service.ts
│   ├── products.service.ts
│   └── ...
├── contexts/              # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ...
├── utils/                 # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── ...
├── types/                 # TypeScript types
│   ├── api.types.ts
│   ├── models.types.ts
│   └── ...
├── constants/             # Constants
│   ├── routes.ts
│   ├── permissions.ts
│   └── ...
└── assets/               # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## Integration Points

### With Backend API
- Autenticação via JWT
- CRUD operations para todas as entidades
- Upload de arquivos (imagens de produtos)
- WebSocket para atualizações em tempo real

### With Design System
- Importar componentes do design system
- Usar design tokens para consistência visual
- Seguir guidelines de UX definidos

### With Mobile Apps
- Compartilhar tipos TypeScript via package
- Manter consistência de API contracts
- Sincronizar estados via WebSocket

## Business Rules

**BR-01:** Usuário deve estar autenticado para acessar rotas protegidas

**BR-02:** Sidebar deve exibir apenas itens de menu que usuário tem permissão

**BR-03:** Formulários devem validar dados antes de enviar à API

**BR-04:** Modais devem bloquear interação com conteúdo de fundo

**BR-05:** Toasts devem desaparecer automaticamente após 5 segundos

**BR-06:** Tabelas devem paginar resultados com máximo de 50 itens por página

**BR-07:** Busca deve ter debounce de 300ms para evitar requisições excessivas

**BR-08:** Imagens devem ser otimizadas e lazy loaded

**BR-09:** Tema selecionado deve persistir entre sessões

**BR-10:** Sessão deve expirar após 30 minutos de inatividade
