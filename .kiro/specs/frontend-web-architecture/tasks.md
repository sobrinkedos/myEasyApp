# Implementation Plan - Arquitetura Frontend Web

## Overview

Este plano de implementação detalha as tarefas necessárias para construir a arquitetura frontend web do sistema de gestão de restaurantes. As tarefas estão organizadas de forma incremental, começando pela configuração base e progredindo para funcionalidades mais complexas.

## Tasks

- [x] 1. Setup inicial do projeto e configuração base



  - Criar projeto React com Vite e TypeScript
  - Configurar ESLint, Prettier e Husky para qualidade de código
  - Configurar path aliases (@/) no tsconfig.json e vite.config.ts
  - Instalar dependências principais: react-router-dom, @tanstack/react-query, axios, socket.io-client
  - Criar estrutura de pastas conforme design (src/app, pages, layouts, components, etc)
  - Configurar variáveis de ambiente (.env.development, .env.production)
  - _Requirements: NFR-08, NFR-10_

- [x] 2. Implementar sistema de roteamento




  - [x] 2.1 Criar configuração do React Router v6

    - Implementar router.tsx com createBrowserRouter
    - Definir rotas públicas (/login, /forgot-password, /reset-password/:token)
    - Definir rotas protegidas (/dashboard, /products, /orders, etc)
    - Implementar rota 404 para URLs não encontradas
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  

  - [ ] 2.2 Implementar hierarquia de rotas e subrotas
    - Criar subrotas de produtos (/products, /products/new, /products/:id, /products/:id/edit)
    - Criar subrotas de pedidos (/orders, /orders/:id, /orders/pos)
    - Criar subrotas de relatórios (/reports/sales, /reports/stock, etc)
    - Criar subrotas de configurações (/settings/establishment, /settings/profile, etc)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  
  - [ ] 2.3 Implementar ProtectedRoute component
    - Criar componente que verifica autenticação
    - Redirecionar para /login se não autenticado, preservando URL original
    - Implementar verificação de permissões quando requiredPermission é fornecido
    - Exibir LoadingScreen durante verificação de autenticação
    - _Requirements: 1.3, 22.5_

- [x] 3. Criar layouts base




  - [x] 3.1 Implementar AuthLayout

    - Criar layout com fundo branded e logo centralizado
    - Adicionar container para conteúdo com max-width e padding
    - Implementar Outlet para renderizar páginas de autenticação
    - _Requirements: 3.1_
  

  - [ ] 3.2 Implementar DashboardLayout
    - Criar estrutura com Sidebar, Topbar e área de conteúdo
    - Implementar lógica de sidebar responsiva (drawer em mobile, permanent em desktop)
    - Adicionar Breadcrumbs abaixo do Topbar
    - Implementar Outlet para renderizar páginas protegidas
    - _Requirements: 3.2, 3.4_

  
  - [ ] 3.3 Implementar FullscreenLayout
    - Criar layout que ocupa tela inteira sem sidebar/topbar
    - Usar para páginas como ponto de venda (POS)
    - _Requirements: 3.3_

- [x] 4. Desenvolver componentes de navegação




  - [x] 4.1 Criar componente Sidebar

    - Implementar estrutura com logo, menu items e user section
    - Organizar menu em grupos (Dashboard, Vendas, Produtos, Relatórios, Configurações)
    - Destacar item ativo baseado na rota atual
    - Implementar variantes permanent e drawer para responsividade
    - Adicionar avatar e nome do usuário no rodapé com opção de logout
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  

  - [ ] 4.2 Criar componente Topbar
    - Implementar com botão de menu (mobile), breadcrumbs e ações
    - Adicionar ícone de notificações com badge de contagem
    - Criar dropdown de notificações com lista de notificações recentes
    - Adicionar avatar do usuário com dropdown (Perfil, Configurações, Logout)
    - Implementar indicador de status de conexão online/offline
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  
  - [ ] 4.3 Criar componente Breadcrumbs
    - Gerar breadcrumbs automaticamente baseado na rota atual
    - Implementar navegação ao clicar em breadcrumb
    - Estilizar com separadores e último item em negrito
    - _Requirements: 2.5_

- [ ] 5. Implementar sistema de modais
  - [ ] 5.1 Criar componente Modal base
    - Implementar com props: open, onClose, title, size, children, footer
    - Adicionar overlay escuro que bloqueia scroll do body
    - Implementar fechamento ao pressionar ESC ou clicar fora (configurável)
    - Suportar tamanhos: sm, md, lg, xl, full
    - Usar Portal para renderizar fora da hierarquia DOM
    - _Requirements: 6.1, 6.4, 6.5_
  
  - [ ] 5.2 Criar ConfirmModal component
    - Implementar modal de confirmação com título, mensagem e botões
    - Suportar variantes: danger, warning, info
    - Customizar textos dos botões (confirmar/cancelar)
    - _Requirements: 6.2_
  
  - [ ] 5.3 Criar FormModal component
    - Implementar modal para formulários com título, conteúdo e botões
    - Adicionar botões cancelar e salvar no footer
    - _Requirements: 6.3_
  
  - [ ] 5.4 Criar modais específicos do domínio
    - Implementar ProductFormModal para criar/editar produtos
    - Implementar CategoryFormModal para criar/editar categorias
    - Implementar StockTransactionModal para registrar movimentações
    - Implementar CashOperationModal para sangrias/suprimentos
    - Implementar OrderDetailModal para visualizar detalhes de pedido
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Desenvolver sistema de notificações toast
  - Implementar componente Toast com variantes (success, error, warning, info)
  - Posicionar toasts no canto superior direito
  - Implementar auto-dismiss após 5 segundos (configurável)
  - Empilhar múltiplos toasts verticalmente
  - Adicionar botão X para fechar manualmente
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Criar componentes de listagem
  - [ ] 7.1 Implementar DataTable component
    - Criar tabela com suporte a colunas customizáveis
    - Implementar ordenação por coluna (sortable)
    - Adicionar paginação com controles completos
    - Implementar busca integrada
    - Exibir skeleton loading durante carregamento
    - _Requirements: 9.1, 9.4_
  
  - [ ] 7.2 Implementar CardGrid component
    - Criar grid responsivo para exibir cards
    - Adaptar número de colunas baseado no tamanho da tela
    - _Requirements: 9.2_
  
  - [ ] 7.3 Criar EmptyState component
    - Exibir quando não houver dados
    - Incluir ilustração, mensagem e ação sugerida
    - _Requirements: 9.3_
  
  - [ ] 7.4 Implementar Pagination component
    - Criar controles: primeira, anterior, números, próxima, última
    - Exibir informações de página atual e total
    - _Requirements: 9.5_

- [ ] 8. Desenvolver componentes de formulário
  - [ ] 8.1 Criar componentes de input base
    - Implementar TextField com label, error, helperText, leftIcon, rightIcon
    - Implementar TextArea com auto-resize opcional
    - Implementar Select com busca e múltipla seleção
    - Implementar Checkbox, Radio e Switch
    - Implementar DatePicker e TimePicker
    - _Requirements: 10.1_
  
  - [ ] 8.2 Criar FileUpload component
    - Implementar upload com preview de imagem
    - Adicionar suporte a drag-and-drop
    - Validar tipo e tamanho de arquivo
    - Exibir progresso de upload
    - _Requirements: 10.2_
  
  - [ ] 8.3 Criar CurrencyInput component
    - Implementar formatação automática de valores monetários
    - Suportar prefixo R$ e separadores de milhar/decimal
    - _Requirements: 10.3_
  
  - [ ] 8.4 Implementar validação de formulários
    - Exibir mensagens de erro abaixo de campos inválidos
    - Estilizar campos com erro (borda vermelha)
    - _Requirements: 10.4_
  
  - [ ] 8.5 Criar FormSection component
    - Agrupar campos relacionados com título e divider
    - _Requirements: 10.5_

- [-] 9. Implementar gerenciamento de estado global


  - [x] 9.1 Criar AuthContext

    - Implementar context para gerenciar autenticação
    - Armazenar user, token, isAuthenticated
    - Implementar funções login, logout, updateProfile
    - Verificar token existente ao montar aplicação
    - _Requirements: 11.1_
  
  - [ ] 9.2 Criar NotificationContext
    - Implementar context para gerenciar notificações
    - Conectar ao WebSocket após autenticação
    - Escutar eventos de notificação e atualizar estado
    - Exibir toast quando nova notificação chegar
    - Implementar markAsRead e markAllAsRead
    - _Requirements: 11.2_
  
  - [ ] 9.3 Criar ThemeContext
    - Implementar context para gerenciar tema (light/dark)
    - Persistir preferência em localStorage
    - Detectar preferência do sistema operacional na primeira visita
    - _Requirements: 11.3, 20.1, 20.2, 20.3_
  
  - [ ] 9.4 Configurar React Query
    - Criar queryClient com configurações padrão
    - Configurar staleTime, cacheTime, retry
    - Envolver aplicação com QueryClientProvider
    - _Requirements: 11.5_

- [x] 10. Desenvolver camada de serviços

  - [x] 10.1 Criar API service base

    - Configurar axios com baseURL e timeout
    - Implementar request interceptor para adicionar token JWT
    - Implementar response interceptor para tratar erros (401, 403, 500)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 10.2 Criar services de recursos


    - Implementar productsService (getAll, getById, create, update, delete, uploadImage)
    - Implementar categoriesService
    - Implementar ingredientsService
    - Implementar stockService
    - Implementar ordersService
    - Implementar tablesService
    - Implementar cashService
    - Implementar reportsService
    - Implementar usersService
    - _Requirements: Integração com Backend API_
  
  - [ ] 10.3 Criar WebSocket service
    - Implementar classe WebSocketService com singleton pattern
    - Implementar métodos connect, disconnect, on, emit
    - Gerenciar listeners de eventos
    - Implementar reconexão automática
    - _Requirements: 19.1, 19.4_

- [ ] 11. Criar custom hooks com React Query
  - [ ] 11.1 Implementar hooks de produtos
    - Criar useProducts para listagem com paginação e busca
    - Criar useProduct para detalhes de produto específico
    - Criar useCreateProduct mutation
    - Criar useUpdateProduct mutation
    - Criar useDeleteProduct mutation
    - Invalidar queries após mutations
    - _Requirements: 18.1_
  
  - [ ] 11.2 Implementar hooks de outras entidades
    - Criar hooks para categories (useCategories, useCreateCategory, etc)
    - Criar hooks para ingredients
    - Criar hooks para stock
    - Criar hooks para orders
    - Criar hooks para tables
    - Criar hooks para cash
    - Seguir mesmo padrão de useProducts
    - _Requirements: 18.1_

- [ ] 12. Implementar páginas principais
  - [ ] 12.1 Criar páginas de autenticação
    - Implementar LoginPage com formulário de email/senha
    - Implementar ForgotPasswordPage para recuperação de senha
    - Implementar ResetPasswordPage para redefinir senha
    - _Requirements: 1.1_
  
  - [ ] 12.2 Criar DashboardPage
    - Exibir cards com métricas principais (vendas, comandas, estoque baixo)
    - Implementar gráfico de vendas dos últimos 7 dias
    - Atualizar métricas automaticamente a cada 30 segundos
    - _Requirements: web-admin-dashboard/2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 12.3 Criar páginas de produtos
    - Implementar ProductListPage com DataTable e busca
    - Implementar ProductDetailPage com informações completas
    - Implementar ProductFormPage para criar/editar
    - _Requirements: web-admin-dashboard/3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 12.4 Criar páginas de pedidos
    - Implementar OrderListPage com filtros e status
    - Implementar OrderDetailPage com timeline de status
    - Implementar POSPage para vendas no balcão
    - _Requirements: web-admin-dashboard/7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 12.5 Criar páginas de mesas
    - Implementar TableListPage com grid visual
    - Implementar gestão de mesas (criar, editar, status)
    - _Requirements: web-admin-dashboard/9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Implementar responsividade mobile
  - Adaptar layout para breakpoints (mobile < 768px, tablet 768-1024px, desktop > 1024px)
  - Ocultar sidebar em mobile e exibir botão hamburguer
  - Converter sidebar em drawer deslizante em mobile
  - Empilhar cards verticalmente em mobile
  - Converter tabelas em cards expansíveis em mobile
  - Usar bottom sheet ao invés de modais em mobile
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 14. Implementar busca e filtros
  - Criar SearchBar component com debounce de 300ms
  - Criar FilterPanel com chips selecionáveis
  - Atualizar URL com query params ao aplicar filtros
  - Exibir contador de resultados encontrados
  - Implementar botão "Limpar filtros"
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 15. Implementar acessibilidade
  - Garantir navegação por teclado (Tab, Enter, Esc)
  - Implementar focus indicators visíveis
  - Adicionar atributos ARIA apropriados
  - Garantir contraste mínimo WCAG AA
  - Mover foco para modal quando aberto
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, NFR-14, NFR-15_

- [ ] 16. Otimizar performance
  - [ ] 16.1 Implementar code splitting
    - Usar React.lazy para lazy load de páginas
    - Envolver com Suspense e PageSkeleton
    - Configurar manualChunks no vite.config.ts
    - _Requirements: 18.1, NFR-01, NFR-02_
  
  - [ ] 16.2 Implementar lazy loading de imagens
    - Criar OptimizedImage component
    - Adicionar loading="lazy" em imagens
    - Exibir placeholder durante carregamento
    - Implementar fallback para erro
    - _Requirements: 18.2_
  
  - [ ] 16.3 Implementar virtual scrolling
    - Criar VirtualList component usando @tanstack/react-virtual
    - Usar em listas com mais de 100 itens
    - _Requirements: 18.4_
  
  - [ ] 16.4 Otimizar bundle size
    - Analisar bundle com vite-bundle-visualizer
    - Garantir bundle inicial < 200KB gzipped
    - _Requirements: 18.5, NFR-01_

- [ ] 17. Implementar integração WebSocket
  - Estabelecer conexão após autenticação
  - Atualizar UI automaticamente quando pedido muda de status
  - Adicionar comandas em tempo real quando abertas
  - Exibir indicador "Offline" quando conexão é perdida
  - Implementar heartbeat para detectar conexões inativas
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 18. Implementar tratamento de erros
  - [ ] 18.1 Criar ErrorBoundary component
    - Capturar erros de renderização
    - Exibir fallback UI amigável
    - Enviar erros para serviço de tracking
    - _Requirements: 13.5_
  
  - [ ] 18.2 Implementar error handling de API
    - Criar função handleApiError para traduzir erros
    - Tratar status codes específicos (400, 401, 403, 404, 422, 500)
    - Exibir mensagens de erro amigáveis
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 19. Implementar segurança frontend
  - Armazenar token JWT em localStorage
  - Limpar dados sensíveis ao fazer logout
  - Implementar timeout de sessão após 30 minutos
  - Sanitizar inputs antes de renderizar
  - Validar permissões antes de exibir ações restritas
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 20. Implementar internacionalização (i18n)
  - Configurar react-i18next
  - Organizar traduções em arquivos JSON por namespace
  - Implementar função t() para traduzir strings
  - Formatar datas, números e moedas de acordo com locale
  - Implementar pt-BR como idioma padrão
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [ ]* 21. Implementar testes
  - [ ]* 21.1 Configurar ambiente de testes
    - Configurar Vitest e React Testing Library
    - Criar setup de testes com mocks
    - _Requirements: NFR-09_
  
  - [ ]* 21.2 Escrever testes de componentes
    - Testar componentes UI base (Button, Input, Modal, etc)
    - Testar componentes de navegação (Sidebar, Topbar)
    - Testar componentes de listagem (DataTable, CardGrid)
    - _Requirements: NFR-09_
  
  - [ ]* 21.3 Escrever testes de hooks
    - Testar useAuth hook
    - Testar custom hooks de React Query
    - _Requirements: NFR-09_
  
  - [ ]* 21.4 Escrever testes E2E
    - Configurar Playwright ou Cypress
    - Testar fluxos principais (login, criar produto, criar pedido)
    - _Requirements: NFR-09_

- [ ]* 22. Documentar componentes no Storybook
  - Configurar Storybook
  - Criar stories para todos os componentes reutilizáveis
  - Documentar props e tipos TypeScript
  - Incluir stories de diferentes estados (default, loading, error, empty)
  - Documentar padrões de composição
  - _Requirements: 23.1, 23.2, 23.3, 23.4_

- [ ] 23. Configurar build e deployment
  - Configurar vite.config.ts para produção
  - Configurar variáveis de ambiente de produção
  - Criar scripts de build e preview
  - Configurar CI/CD pipeline
  - Implementar análise de bundle size
  - _Requirements: NFR-01, NFR-02, NFR-03_

- [ ] 24. Implementar monitoramento e analytics
  - Integrar serviço de analytics (Google Analytics, Mixpanel)
  - Implementar tracking de page views
  - Implementar tracking de eventos importantes
  - Integrar serviço de error tracking (Sentry)
  - _Requirements: Monitoring and Analytics_

## Notes

- Tarefas marcadas com * são opcionais e focam em testes e documentação
- Cada tarefa deve ser implementada e testada antes de prosseguir para a próxima
- Commits devem ser atômicos e seguir conventional commits
- Code reviews são obrigatórios antes de merge
- Manter cobertura de testes acima de 70% (exceto para tarefas opcionais)
