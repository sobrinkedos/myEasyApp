# Plano de Implementação - Redesign Completo do Website

## Fase 1: Fundação do Design System

- [x] 1. Configurar tokens de design e sistema de temas



  - Criar arquivo `src/design-system/tokens.ts` com todas as cores, espaçamentos, tipografia, sombras e bordas
  - Criar arquivo `src/design-system/theme.ts` com configurações de tema claro e escuro
  - Atualizar `tailwind.config.js` para importar e usar os tokens customizados
  - Adicionar suporte a CSS variables para troca dinâmica de temas
  - _Requisitos: 1.1, 1.2, 1.3, 1.5, 11.1, 11.5_

- [x] 2. Implementar hook de gerenciamento de temas


  - Criar `src/hooks/useTheme.ts` com funções para get/set/toggle tema
  - Implementar detecção automática de preferência do sistema operacional
  - Adicionar persistência de tema no localStorage
  - Criar ThemeProvider para contexto global de tema
  - _Requisitos: 11.1, 11.2, 11.3_


- [x] 3. Instalar e configurar dependências adicionais


  - Instalar framer-motion para animações
  - Instalar recharts para gráficos
  - Instalar @dnd-kit para drag-and-drop
  - Instalar date-fns para manipulação de datas
  - Instalar @headlessui/react para componentes acessíveis
  - Atualizar package.json e executar instalação
  - _Requisitos: 7.5, 4.2, 13.3_

## Fase 2: Componentes UI Base

- [x] 4. Criar componente Button


  - Implementar `src/components/ui/Button/Button.tsx` com 4 variantes (primary, secondary, outline, ghost)
  - Adicionar 3 tamanhos (sm, md, lg) com padding e texto apropriados
  - Implementar estados (default, hover, active, focus, disabled, loading)
  - Adicionar suporte a ícones (left/right) e fullWidth
  - Implementar animações de hover e ripple effect
  - _Requisitos: 2.1, 7.6_


- [x] 5. Criar componente Input

  - Implementar `src/components/ui/Input/Input.tsx` com label flutuante
  - Adicionar suporte a ícones de prefixo e sufixo
  - Implementar estados visuais (default, focus, error, success, disabled)
  - Adicionar mensagens de validação inline
  - Implementar animações de transição suaves
  - _Requisitos: 2.3, 5.1_

- [x] 6. Criar componente Card


  - Implementar `src/components/ui/Card/Card.tsx` com 3 variantes (default, elevated, outlined)
  - Adicionar sombras sutis e bordas arredondadas (8px)
  - Implementar hover com elevação e transição suave
  - Criar subcomponentes CardHeader, CardBody, CardFooter
  - _Requisitos: 2.2_

- [x] 7. Criar componente Modal


  - Implementar `src/components/ui/Modal/Modal.tsx` com backdrop blur
  - Adicionar animações de entrada/saída (fade + scale) usando framer-motion
  - Implementar 4 tamanhos (sm, md, lg, full)
  - Adicionar fechamento por ESC e clique fora
  - Implementar focus trap e acessibilidade
  - _Requisitos: 2.4, 9.1, 9.4_


- [x] 8. Criar componentes Badge e Tooltip

  - Implementar `src/components/ui/Badge/Badge.tsx` com cores semânticas
  - Criar variantes (solid, outline, soft) para badges
  - Implementar `src/components/ui/Tooltip/Tooltip.tsx` com posicionamento inteligente
  - Adicionar animações suaves de entrada/saída
  - _Requisitos: 2.5, 2.6_

- [x] 9. Criar componente Select e Dropdown



  - Implementar `src/components/ui/Select/Select.tsx` com busca integrada
  - Adicionar suporte a multi-seleção e criação de novas opções
  - Implementar estados de loading e empty state
  - Criar `src/components/ui/Dropdown/Dropdown.tsx` para menus
  - Adicionar navegação por teclado e acessibilidade
  - _Requisitos: 2.7, 9.1_

## Fase 3: Componentes de Feedback e Loading

- [x] 10. Criar sistema de Toast notifications


  - Implementar `src/components/feedback/Toast/Toast.tsx` com ícones e cores semânticas
  - Criar ToastProvider e hook useToast para gerenciamento global
  - Adicionar animações de slide in/out
  - Implementar auto-dismiss após 3 segundos
  - Adicionar suporte a ações e fechamento manual
  - _Requisitos: 7.2, 7.3_

- [x] 11. Criar componentes de Loading


  - Implementar `src/components/loading/LoadingSpinner.tsx` com animação suave
  - Criar `src/components/loading/Skeleton.tsx` com animação shimmer
  - Implementar skeleton variants para diferentes tipos de conteúdo
  - Adicionar duração mínima de 200ms para evitar flicker
  - _Requisitos: 7.1, 7.4_


- [x] 12. Criar componente EmptyState


  - Implementar `src/components/feedback/EmptyState/EmptyState.tsx`
  - Adicionar suporte a ilustrações, título, descrição e call-to-action
  - Criar variantes para diferentes contextos (sem dados, sem resultados, erro)
  - _Requisitos: 3.5_

## Fase 4: Componentes de Tabela e Lista

- [x] 13. Criar componente Table avançado


  - Implementar `src/components/ui/Table/Table.tsx` com cabeçalho fixo
  - Adicionar ordenação por coluna com indicadores visuais
  - Implementar seleção múltipla com checkbox
  - Adicionar estados de hover e ações inline
  - Criar 3 densidades (compact, default, comfortable)
  - _Requisitos: 6.1, 6.2, 4.3_

- [x] 14. Criar componente Pagination



  - Implementar `src/components/ui/Pagination/Pagination.tsx`
  - Adicionar controles de navegação (primeira, anterior, próxima, última)
  - Criar seletor de itens por página
  - Adicionar indicador de posição (ex: "1-10 de 100")
  - _Requisitos: 6.3_

- [x] 15. Implementar sistema de filtros avançados


  - Criar `src/components/ui/Filters/FilterPanel.tsx`
  - Adicionar suporte a múltiplos critérios e operadores lógicos
  - Implementar salvamento e carregamento de filtros
  - Adicionar badges visuais de filtros ativos
  - _Requisitos: 6.4_

- [x] 16. Criar visualização em Grid alternativa



  - Implementar `src/components/ui/GridView/GridView.tsx`
  - Criar cards informativos para itens da lista
  - Adicionar toggle entre visualização tabela/grid
  - Implementar grid responsivo (1-4 colunas)
  - _Requisitos: 6.6_

## Fase 5: Componentes de Formulário

- [x] 17. Criar componente FormField wrapper


  - Implementar `src/components/forms/FormField/FormField.tsx`
  - Integrar com React Hook Form
  - Adicionar validação automática com Zod
  - Implementar mensagens de erro e sucesso
  - _Requisitos: 5.1_

- [x] 18. Criar componente ImageUpload



  - Implementar `src/components/forms/ImageUpload/ImageUpload.tsx`
  - Adicionar preview de imagem e crop
  - Implementar drag-and-drop
  - Adicionar indicador de progresso de upload
  - Implementar validação de tipo e tamanho
  - _Requisitos: 5.3_

- [x] 19. Criar componente DatePicker


  - Implementar `src/components/forms/DatePicker/DatePicker.tsx`
  - Adicionar calendário visual com date-fns
  - Criar seleção rápida de períodos comuns
  - Implementar range de datas
  - _Requisitos: 5.6, 4.5_

- [x] 20. Criar componente NumberInput


  - Implementar `src/components/forms/NumberInput/NumberInput.tsx`
  - Adicionar incrementadores (+/-)
  - Implementar formatação de moeda
  - Adicionar validação de range (min/max)
  - _Requisitos: 5.4_

- [x] 21. Criar componente MultiStepForm



  - Implementar `src/components/forms/MultiStepForm/MultiStepForm.tsx`
  - Adicionar indicador de progresso visual
  - Criar navegação entre etapas (anterior/próximo)
  - Implementar validação por etapa
  - _Requisitos: 5.5_

## Fase 6: Layout e Navegação

- [x] 22. Redesenhar componente Sidebar



  - Atualizar `src/components/common/Sidebar.tsx` com novo design
  - Implementar expansão/colapso com animação suave (280px/80px)
  - Adicionar indicadores visuais de seção ativa
  - Criar agrupamento de itens por categoria
  - Implementar scroll independente
  - _Requisitos: 3.1_

- [x] 23. Redesenhar componente Topbar



  - Atualizar `src/components/common/Topbar.tsx` com novo design
  - Implementar breadcrumbs com navegação hierárquica
  - Adicionar busca global com atalho Cmd+K
  - Criar dropdown de notificações com badge de contagem
  - Implementar menu de usuário com avatar
  - Adicionar toggle de tema (claro/escuro)
  - _Requisitos: 3.2, 11.1_

- [x] 24. Criar componente PageHeader



  - Implementar `src/components/layout/PageHeader/PageHeader.tsx`
  - Adicionar suporte a título, subtítulo e breadcrumbs
  - Criar área de ações (botões principais)
  - Implementar tabs de navegação quando aplicável
  - _Requisitos: 3.2_

- [x] 25. Implementar transições de rota


  - Adicionar animações de página usando framer-motion
  - Implementar fade/slide transitions com duração de 200-300ms
  - Criar AnimatedRoute wrapper
  - _Requisitos: 3.3_


- [x] 26. Criar páginas de erro redesenhadas


  - Atualizar `src/pages/NotFoundPage.tsx` (404)
  - Atualizar `src/pages/UnauthorizedPage.tsx` (403)
  - Criar `src/pages/ServerErrorPage.tsx` (500)
  - Adicionar ilustrações, mensagens claras e navegação de retorno
  - _Requisitos: 3.6_

## Fase 7: Componentes de Gráficos

- [x] 27. Criar componentes de gráficos base





  - Implementar `src/components/charts/LineChart/LineChart.tsx` usando recharts
  - Criar `src/components/charts/BarChart/BarChart.tsx`
  - Implementar `src/components/charts/PieChart/PieChart.tsx`
  - Adicionar cores consistentes e tooltips informativos
  - Implementar responsividade dos gráficos
  - _Requisitos: 4.2_

- [x] 28. Criar componente SparklineChart



  - Implementar `src/components/charts/SparklineChart/SparklineChart.tsx`
  - Criar versão minimalista para cards de métricas
  - Adicionar animações suaves
  - _Requisitos: 4.1_

## Fase 8: Dashboard

- [x] 29. Criar componente MetricCard



  - Implementar `src/components/dashboard/MetricCard/MetricCard.tsx`
  - Adicionar ícone, valor destacado e variação percentual
  - Integrar SparklineChart
  - Implementar cores semânticas para variação (positiva/negativa)
  - _Requisitos: 4.1_

- [x] 30. Redesenhar página Dashboard




  - Atualizar `src/pages/dashboard/DashboardPage.tsx`
  - Implementar grid de 4 MetricCards no topo
  - Adicionar seção de gráficos (vendas, categorias, pagamentos)
  - Criar widget de atividade recente com timeline
  - Adicionar seção de ações rápidas
  - Implementar filtros de período
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

## Fase 9: Módulo de Produtos e Receitas

- [ ] 31. Redesenhar lista de produtos



  - Atualizar página de listagem com grid de cards (3-4 colunas)
  - Implementar ProductCard com imagem, nome, preço, categoria e badges
  - Adicionar ações rápidas (editar, duplicar, excluir)
  - Implementar busca e filtros (categoria, preço, disponibilidade)
  - Adicionar toggle entre visualização grid/tabela
  - _Requisitos: 12.1, 12.5_

- [x] 32. Redesenhar página de detalhes do produto



  - Atualizar ProductDetailPage com layout em 2 colunas
  - Implementar galeria de imagens na coluna esquerda
  - Adicionar informações e ações na coluna direita
  - Criar tabs para Informações, Receita e Histórico
  - _Requisitos: 12.2_

- [x] 33. Implementar editor de receitas



  - Criar componente RecipeEditor com lista de ingredientes
  - Implementar drag-and-drop para reordenar ingredientes usando @dnd-kit
  - Adicionar cálculo automático de custo total
  - Criar visualização de árvore de ingredientes
  - Implementar indicadores visuais de quantidade e custo
  - _Requisitos: 12.3, 12.4_

## Fase 10: Módulo de Pedidos e Comandas

- [x] 34. Implementar Kanban Board para pedidos



  - Criar `src/components/orders/KanbanBoard/KanbanBoard.tsx`
  - Implementar 4 colunas (Pendente, Preparando, Pronto, Entregue)
  - Adicionar drag-and-drop entre colunas usando @dnd-kit
  - Criar OrderCard com número, mesa, itens e tempo decorrido
  - Implementar indicadores de prioridade com cores semânticas
  - _Requisitos: 13.1, 13.2, 13.3, 13.5_

- [x] 35. Criar visualização de comanda



  - Implementar modal/sidebar de detalhes da comanda
  - Adicionar lista de itens com preços
  - Mostrar subtotal, taxas e total
  - Implementar opções de pagamento
  - Adicionar histórico de alterações
  - _Requisitos: 13.4_

## Fase 11: Módulo de Mesas

- [ ] 36. Implementar grid visual de mesas



  - Redesenhar página de mesas com grid responsivo
  - Criar TableCard com número, capacidade e status
  - Implementar cores de status (livre, ocupada, reservada, em limpeza)
  - Adicionar tempo de ocupação e comanda associada
  - Implementar ações rápidas (abrir comanda, limpar, reservar)
  - _Requisitos: 14.1, 14.2_

## Fase 12: Módulo de Caixa

- [ ] 37. Redesenhar painel de caixa
  - Atualizar página principal do caixa
  - Implementar cards de resumo no topo
  - Adicionar gráficos de desempenho (vendas, métodos de pagamento)
  - Criar lista de transações recentes
  - Implementar filtros por período e tipo
  - _Requisitos: 14.3, 14.5_

- [ ] 38. Criar interface de abertura/fechamento de caixa
  - Implementar modal de abertura com formulário de valores iniciais
  - Criar modal de fechamento com validação e conferência
  - Adicionar registro de operações
  - Implementar opção de impressão de relatório
  - _Requisitos: 14.4_

## Fase 13: Módulo de Estoque e CMV

- [ ] 39. Redesenhar lista de ingredientes
  - Atualizar página de estoque com grid de cards
  - Criar IngredientCard com nível de estoque visual
  - Implementar alerta de estoque baixo (cor vermelha)
  - Adicionar última movimentação
  - Implementar busca e filtros
  - _Requisitos: 15.1_

- [ ] 40. Criar gráficos de evolução de estoque
  - Implementar gráfico de linha para evolução temporal
  - Adicionar marcadores de entrada e saída
  - Criar filtros por ingrediente e período
  - _Requisitos: 15.2, 15.5_

- [ ] 41. Implementar dashboard de CMV
  - Criar página de CMV com comparativos de período
  - Adicionar gráficos de custo por categoria
  - Implementar alertas de variação significativa
  - Criar relatórios exportáveis
  - _Requisitos: 15.3_

- [ ] 42. Criar visualização de apuração de estoque
  - Implementar interface de apuração com diferenças destacadas
  - Adicionar ações de ajuste (adicionar, remover, corrigir)
  - Criar histórico de apurações
  - _Requisitos: 15.4_

## Fase 14: Responsividade

- [ ] 43. Implementar adaptações mobile (< 768px)
  - Converter sidebar em menu hamburguer
  - Empilhar cards verticalmente
  - Transformar tabelas em cards mobile-friendly
  - Ajustar formulários para coluna única
  - Reduzir topbar e ajustar controles
  - _Requisitos: 8.2, 8.3_

- [ ] 44. Implementar adaptações tablet (768px - 1024px)
  - Configurar sidebar colapsada por padrão
  - Ajustar grid para 2 colunas
  - Implementar scroll horizontal em tabelas quando necessário
  - Ajustar formulários para 2 colunas
  - _Requisitos: 8.1_

- [ ] 45. Implementar touch gestures para mobile
  - Adicionar swipe para ações em listas
  - Implementar long-press para menus contextuais
  - Adicionar pull-to-refresh onde aplicável
  - _Requisitos: 8.4_

- [ ] 46. Otimizar fontes e espaçamentos para mobile
  - Ajustar tamanhos de fonte para legibilidade em telas pequenas
  - Aumentar áreas de toque (mínimo 44x44px)
  - Ajustar espaçamentos para melhor uso do espaço
  - _Requisitos: 8.5_

## Fase 15: Acessibilidade

- [ ] 47. Implementar navegação por teclado completa
  - Adicionar tabIndex apropriado em todos os elementos interativos
  - Implementar indicadores visuais de foco (outline)
  - Criar atalhos de teclado para ações comuns
  - Implementar focus trap em modais
  - _Requisitos: 9.1_

- [ ] 48. Adicionar ARIA labels e roles
  - Implementar landmarks ARIA (main, nav, aside, etc)
  - Adicionar aria-label em ícones e botões sem texto
  - Implementar aria-live para notificações
  - Adicionar roles semânticos em componentes customizados
  - _Requisitos: 9.4, 9.6_

- [ ] 49. Garantir contraste de cores adequado
  - Validar contraste mínimo de 4.5:1 para texto normal
  - Validar contraste mínimo de 3:1 para texto grande
  - Ajustar cores que não atendem aos requisitos
  - _Requisitos: 9.3_

- [ ] 50. Adicionar textos alternativos
  - Implementar alt text em todas as imagens
  - Adicionar aria-hidden em ícones decorativos
  - Criar labels descritivos para campos de formulário
  - _Requisitos: 9.2, 9.5_

## Fase 16: Performance e Otimização

- [ ] 51. Implementar code splitting e lazy loading
  - Adicionar React.lazy para rotas não críticas
  - Implementar lazy loading de componentes pesados
  - Configurar Suspense boundaries apropriados
  - _Requisitos: 10.3_

- [ ] 52. Otimizar re-renderizações
  - Adicionar React.memo em componentes puros
  - Implementar useMemo e useCallback onde apropriado
  - Adicionar virtualization em listas longas (react-window)
  - _Requisitos: 10.4_

- [ ] 53. Otimizar bundle size
  - Analisar bundle com vite-bundle-visualizer
  - Remover dependências não utilizadas
  - Implementar tree-shaking apropriado
  - _Requisitos: 10.5_

- [ ] 54. Implementar otimizações de imagem
  - Adicionar lazy loading de imagens
  - Implementar responsive images com srcset
  - Converter imagens para formatos modernos (WebP)
  - _Requisitos: 8.6_

- [ ] 55. Configurar caching de assets
  - Configurar service worker para cache de assets estáticos
  - Implementar estratégia cache-first
  - Adicionar versionamento de assets
  - _Requisitos: 10.6_

## Fase 17: Testes e Refinamento

- [ ]* 56. Criar testes de componentes UI
  - Escrever testes para Button, Input, Card, Modal
  - Testar estados e variantes de cada componente
  - Validar acessibilidade com jest-axe
  - _Requisitos: 2.1, 2.2, 2.3, 2.4_

- [ ]* 57. Criar testes de integração
  - Testar fluxos principais (login, criar produto, fazer pedido)
  - Validar navegação entre páginas
  - Testar formulários e validações
  - _Requisitos: Todos os módulos_

- [ ]* 58. Realizar testes de performance
  - Medir métricas Core Web Vitals (FCP, LCP, TTI, CLS, FID)
  - Validar tempos de carregamento
  - Testar em conexões lentas (3G)
  - _Requisitos: 10.1, 10.2_

- [ ]* 59. Realizar testes de acessibilidade
  - Executar auditoria com Lighthouse
  - Testar com leitores de tela (NVDA, JAWS)
  - Validar navegação por teclado
  - Verificar contraste de cores
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ]* 60. Realizar testes de responsividade
  - Testar em diferentes tamanhos de tela (320px - 2560px)
  - Validar em dispositivos reais (iOS, Android)
  - Testar orientação portrait e landscape
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 61. Ajustes finais e polish
  - Revisar e ajustar animações e transições
  - Validar consistência visual em todas as páginas
  - Corrigir bugs identificados nos testes
  - Otimizar detalhes de UX baseado em feedback
  - _Requisitos: Todos_
