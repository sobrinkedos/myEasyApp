# Implementation Plan - Sistema de Comandas e Pedidos

- [x] 1. Estender schema do Prisma com novos models


  - Adicionar models Table, Command, Order, OrderItem e OrderModification ao schema.prisma
  - Definir relacionamentos entre models (Command → Table, Command → Orders, Order → OrderItems)
  - Adicionar índices para otimização de queries (status, createdAt, commandId, tableId)
  - Criar migration para adicionar novas tabelas ao banco de dados
  - Gerar cliente Prisma atualizado com novos types
  - _Requirements: 1.1, 2.1, 3.1_




- [ ] 2. Implementar gestão de mesas
- [x] 2.1 Criar módulo de mesas


  - Implementar TableRepository com métodos CRUD usando Prisma
  - Implementar TableService com validação de número único de mesa
  - Criar TableController com endpoints REST (GET, POST, PUT, DELETE)
  - Implementar validação com Zod para criação e atualização de mesas
  - Adicionar lógica para atualizar status da mesa (disponível, ocupada, reservada)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 2.2 Criar testes de mesas
  - Escrever testes unitários para TableService
  - Escrever testes de integração para endpoints de mesas
  - Testar validação de número duplicado
  - Testar mudanças de status
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implementar gestão de comandas

- [x] 3.1 Criar módulo de comandas base


  - Implementar CommandRepository com métodos CRUD e queries específicas (findOpen, findByTable)
  - Implementar CommandService com lógica de abertura e geração de código único
  - Criar CommandController com endpoints REST para comandas
  - Implementar validação com Zod para abertura de comanda
  - Adicionar lógica para validar que mesa não possui comanda aberta
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.2 Implementar fechamento de comanda


  - Adicionar método closeCommand no CommandService
  - Validar que todos os pedidos foram entregues antes de fechar
  - Calcular subtotal somando todos os pedidos não cancelados
  - Calcular taxa de serviço (10% padrão, configurável)
  - Calcular total (subtotal + taxa de serviço)
  - Atualizar status da comanda para "fechada" e registrar closedAt
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.3 Implementar consulta de comandas


  - Criar endpoint GET /commands com paginação e filtros (status, waiterId, tableId, período)
  - Implementar endpoint GET /commands/open para comandas abertas
  - Adicionar eager loading de relacionamentos (table, waiter, orders)
  - Implementar cache Redis para comandas abertas com TTL de 2 minutos
  - Invalidar cache ao abrir, fechar ou modificar comanda
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 3.4 Criar testes de comandas
  - Escrever testes unitários para CommandService
  - Testar abertura de comanda e atualização de status da mesa
  - Testar validação de mesa ocupada
  - Testar fechamento com pedidos pendentes
  - Testar cálculo de totais e taxa de serviço
  - Escrever testes de integração para endpoints
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 4. Implementar gestão de pedidos



- [x] 4.1 Criar módulo de pedidos base


  - Implementar OrderRepository com métodos CRUD e queries (findByCommand, findByStatus)
  - Implementar OrderService com lógica de criação de pedidos
  - Criar OrderController com endpoints REST para pedidos
  - Implementar validação com Zod para criação de pedidos
  - Gerar número sequencial de pedido por comanda
  - Calcular subtotal do pedido baseado nos preços dos produtos
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.2 Implementar controle de status de pedidos


  - Adicionar método updateStatus no OrderService
  - Validar transições de status (pendente → em preparo → pronto → entregue)
  - Registrar timestamps para cada mudança de status (preparedAt, readyAt, deliveredAt)
  - Impedir alteração de status de pedidos cancelados
  - Recalcular total da comanda ao mudar status de pedido
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 4.3 Implementar cancelamento de pedidos

  - Adicionar método cancelOrder no OrderService
  - Validar que motivo foi informado (mínimo 15 caracteres)
  - Permitir cancelamento imediato de pedidos pendentes
  - Impedir cancelamento de pedidos já entregues
  - Registrar userId, timestamp e motivo do cancelamento
  - Recalcular total da comanda após cancelamento
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.4 Implementar modificação de pedidos


  - Adicionar método modifyOrder no OrderService
  - Permitir adicionar novos itens a pedido pendente
  - Permitir remover itens de pedido pendente
  - Impedir modificação de pedidos em preparo ou posteriores
  - Registrar histórico de modificações em OrderModification
  - Recalcular subtotal do pedido e total da comanda
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 4.5 Criar testes de pedidos
  - Escrever testes unitários para OrderService
  - Testar criação de pedido e cálculo de subtotal
  - Testar validação de transições de status
  - Testar cancelamento com diferentes status
  - Testar modificação de pedidos
  - Escrever testes de integração para endpoints
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implementar integração com estoque


- [x] 5.1 Criar serviço de integração com estoque


  - Implementar StockIntegrationService com método deductStockForOrder
  - Buscar receita de cada produto do pedido (insumos necessários)
  - Calcular quantidade total de cada insumo necessário
  - Verificar disponibilidade de estoque para todos os insumos
  - Retornar lista de itens insuficientes se houver
  - _Requirements: 11.1, 11.2, 11.4_

- [x] 5.2 Integrar baixa de estoque com pedidos


  - Chamar StockIntegrationService ao mudar status para "em preparo"
  - Criar transações de estoque para cada insumo deduzido
  - Registrar referência ao pedido nas transações
  - Impedir criação de pedido se estoque insuficiente
  - Não devolver estoque ao cancelar pedido após "em preparo"
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 5.3 Criar testes de integração com estoque
  - Testar verificação de estoque antes de criar pedido
  - Testar baixa automática ao mudar para "em preparo"
  - Testar erro quando estoque insuficiente
  - Testar que cancelamento não devolve estoque
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 6. Implementar WebSocket para notificações em tempo real
- [ ] 6.1 Configurar Socket.io
  - Instalar socket.io e @types/socket.io
  - Criar função initializeWebSocket para configurar servidor Socket.io
  - Implementar middleware de autenticação JWT para WebSocket
  - Criar salas para diferentes papéis (waiters, kitchen)
  - Gerenciar conexões e desconexões de usuários
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 6.2 Criar serviço de notificações
  - Implementar NotificationService com métodos para cada tipo de notificação
  - Criar método notifyOrderStatusChange para mudanças de status
  - Criar método notifyNewOrder para novos pedidos à cozinha
  - Criar método notifyWaiterCall para chamadas de garçom
  - Incluir dados relevantes em cada notificação (mesa, pedido, timestamp)
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 6.3 Integrar notificações com eventos
  - Chamar NotificationService ao criar novo pedido
  - Chamar NotificationService ao mudar status de pedido
  - Notificar garçom responsável quando pedido ficar pronto
  - Notificar cozinha quando novo pedido for criado
  - Notificar garçons quando cliente chamar
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ]* 6.4 Criar testes de WebSocket
  - Configurar ambiente de teste para Socket.io
  - Testar autenticação de conexões WebSocket
  - Testar envio de notificações para salas específicas
  - Testar recebimento de notificações no cliente
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 7. Implementar pedidos de balcão


- [x] 7.1 Adicionar suporte a comandas de balcão


  - Permitir criar comanda sem tableId (type: "counter")
  - Gerar número sequencial para identificação de pedidos de balcão
  - Permitir informar nome ou telefone do cliente
  - Fechar comanda automaticamente ao finalizar pedido de balcão
  - Calcular valor total e permitir pagamento imediato
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 7.2 Criar testes de pedidos de balcão
  - Testar criação de comanda sem mesa
  - Testar fechamento automático
  - Testar geração de número sequencial
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8. Implementar relatórios de pedidos
- [ ] 8.1 Criar endpoints de relatórios
  - Implementar endpoint GET /reports/sales com filtros de período
  - Calcular total de pedidos, valor total e ticket médio
  - Implementar endpoint GET /reports/products para produtos mais vendidos
  - Calcular tempo médio de preparo dos pedidos
  - Permitir filtrar por período, garçom ou tipo (mesa/balcão)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.2 Implementar exportação de relatórios
  - Adicionar suporte para exportação em formato JSON
  - Adicionar suporte para exportação em formato CSV
  - Incluir todos os dados relevantes na exportação
  - _Requirements: 10.5_

- [ ]* 8.3 Criar testes de relatórios
  - Testar cálculo de métricas (total, ticket médio)
  - Testar filtros de período e tipo
  - Testar exportação em diferentes formatos
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [ ] 9. Implementar otimizações de performance
- [ ] 9.1 Configurar cache Redis
  - Implementar cache de comandas abertas com TTL de 2 minutos
  - Implementar cache de pedidos por comanda
  - Criar funções helper para invalidação de cache
  - Invalidar cache ao criar, atualizar ou fechar comanda
  - Invalidar cache ao criar ou modificar pedido
  - _Requirements: 13.3, 13.4_

- [ ] 9.2 Otimizar queries do banco
  - Adicionar eager loading em queries de comandas (include table, waiter, orders)
  - Adicionar eager loading em queries de pedidos (include items, product)
  - Usar select para buscar apenas campos necessários
  - Implementar paginação em listagens de comandas e pedidos
  - _Requirements: 13.1, 13.2_

- [ ] 9.3 Adicionar índices no banco
  - Verificar que índices definidos no schema estão criados
  - Analisar queries lentas e adicionar índices se necessário
  - Testar performance de queries com volume de dados
  - _Requirements: 13.5_

- [ ] 10. Configurar rotas e documentação
- [ ] 10.1 Criar sistema de rotas
  - Criar arquivo routes/tables.ts com rotas de mesas
  - Criar arquivo routes/commands.ts com rotas de comandas
  - Criar arquivo routes/orders.ts com rotas de pedidos
  - Criar arquivo routes/reports.ts com rotas de relatórios
  - Aplicar middleware de autenticação em todas as rotas
  - Aplicar middleware de autorização baseado em papel (waiter, kitchen, admin)
  - _Requirements: 1.1, 2.1, 3.1, 10.1_

- [ ] 10.2 Documentar API com Swagger
  - Adicionar anotações JSDoc em controllers de mesas
  - Adicionar anotações JSDoc em controllers de comandas
  - Adicionar anotações JSDoc em controllers de pedidos
  - Documentar schemas de request e response
  - Documentar códigos de status e mensagens de erro
  - Adicionar exemplos de requisições
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 11. Implementar logs e auditoria
- [ ] 11.1 Adicionar logs estruturados
  - Registrar log ao abrir comanda (userId, tableId, timestamp)
  - Registrar log ao fechar comanda (userId, commandId, total)
  - Registrar log ao criar pedido (userId, commandId, items)
  - Registrar log ao cancelar pedido (userId, orderId, reason)
  - Registrar log ao modificar pedido (userId, orderId, changes)
  - _Requirements: 2.3, 4.4, 5.4, 9.4_

- [ ] 11.2 Implementar histórico de modificações
  - Criar registro em OrderModification ao adicionar item
  - Criar registro em OrderModification ao remover item
  - Criar registro em OrderModification ao mudar status
  - Criar registro em OrderModification ao cancelar
  - Incluir descrição detalhada da modificação
  - _Requirements: 9.4_

- [ ] 12. Validação final e ajustes
- [ ] 12.1 Testar fluxo completo
  - Testar abertura de comanda → criação de pedidos → mudança de status → fechamento
  - Testar notificações WebSocket em tempo real
  - Testar integração com estoque (baixa automática)
  - Testar pedidos de balcão
  - Validar cálculos de totais e taxas
  - _Requirements: 2.1, 3.1, 4.1, 6.1, 8.1, 11.1_

- [ ] 12.2 Testar performance
  - Executar testes de carga com múltiplas comandas simultâneas
  - Validar tempo de resposta de endpoints (< 300ms para comandas abertas)
  - Testar cache Redis e invalidação
  - Verificar que índices estão sendo utilizados
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 12.3 Revisar segurança
  - Validar autorização por papel em todas as rotas
  - Testar que garçom não pode modificar comanda de outro
  - Validar que dados sensíveis não estão expostos
  - Testar autenticação WebSocket
  - _Requirements: 2.2, 4.5, 12.4_

- [ ] 12.4 Preparar documentação
  - Atualizar README com instruções de uso do módulo
  - Documentar eventos WebSocket disponíveis
  - Documentar integração com módulo de estoque
  - Criar exemplos de uso da API
  - Documentar variáveis de ambiente necessárias
  - _Requirements: 1.1, 2.1, 3.1, 11.1, 12.1_
