# Plano de Implementação - Sistema de Pedidos Balcão

- [x] 1. Configurar estrutura base e modelos de dados


  - Criar migration do Prisma para tabelas `counter_orders` e `counter_order_items`
  - Adicionar enum `CounterOrderStatus` ao schema
  - Gerar Prisma client atualizado
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Implementar camada de modelos e validação
  - [x] 2.1 Criar interfaces TypeScript para entidades do domínio


    - Definir tipos `CounterOrder`, `CounterOrderItem`, `CounterOrderStatus`
    - Criar interfaces de DTOs de request e response
    - _Requisitos: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 2.2 Implementar schemas de validação com Zod


    - Criar `CreateCounterOrderSchema` com validação de itens
    - Criar `UpdateCounterOrderStatusSchema`
    - Criar `CancelCounterOrderSchema`
    - Validar limites (quantidade 1-99, tamanhos de string)
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 3. Implementar camada de repositório
  - [x] 3.1 Criar CounterOrderRepository com operações CRUD



    - Implementar `create()` com criação de itens em transação
    - Implementar `findById()`, `findByOrderNumber()`
    - Implementar `findPendingPayment()`, `findByStatus()`
    - Implementar `findActiveOrders()` para Kanban
    - _Requisitos: 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2_
  
  - [x] 3.2 Implementar métodos de atualização de status

    - Implementar `updateStatus()` com timestamp automático
    - Implementar `markAsPaid()` vinculando payment
    - Implementar `cancel()` com registro de motivo
    - _Requisitos: 3.4, 3.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 3.3 Implementar queries de métricas

    - Implementar `getMetrics()` com agregações
    - Implementar `getAveragePreparationTime()`
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 4. Implementar camada de serviço
  - [x] 4.1 Criar CounterOrderService com lógica de criação


    - Implementar `createOrder()` validando produtos ativos
    - Calcular preços unitários e total do pedido
    - Criar pedido com status AGUARDANDO_PAGAMENTO
    - Enviar para fila de pagamento via PaymentQueueService
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2_
  
  - [x] 4.2 Implementar gestão de status e pagamento

    - Implementar `updateOrderStatus()` com validação de transições
    - Implementar `confirmPayment()` alterando status para PENDENTE
    - Adicionar pedido ao Kanban após confirmação de pagamento
    - Implementar `cancelOrder()` com validação (apenas se não pago)
    - _Requisitos: 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 4.3 Implementar métodos de consulta e listagem

    - Implementar `getOrderById()` e `getOrderByNumber()`
    - Implementar `getPendingPaymentOrders()` para Caixa
    - Implementar `getActiveOrders()` para Kanban
    - Implementar `getReadyOrders()` para notificações
    - Adicionar cache Redis para consultas frequentes
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 4.4 Implementar validações de negócio

    - Validar existência e disponibilidade de produtos
    - Validar transições de status permitidas
    - Impedir cancelamento de pedidos pagos
    - Validar valor total maior que zero
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_
  

  - [x] 4.5 Implementar serviço de métricas

    - Implementar `getMetrics()` com cache
    - Calcular tempos médios (pagamento, preparação)
    - Agregar dados por status e período
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 5. Implementar serviços de integração
  - [x] 5.1 Criar PaymentQueueService para integração com Caixa


    - Implementar `addToPaymentQueue()` usando Redis Sorted Set
    - Implementar `removeFromPaymentQueue()` para cancelamentos
    - Implementar `onPaymentConfirmed()` callback
    - Configurar TTL de 24 horas para limpeza automática
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  

  - [x] 5.2 Criar KanbanIntegrationService

    - Implementar `addToKanban()` após pagamento confirmado
    - Implementar `updateKanbanStatus()` para mudanças de status
    - Implementar `removeFromKanban()` ao entregar/cancelar
    - Emitir eventos WebSocket para atualizações em tempo real
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.3 Criar NotificationService


    - Implementar `notifyStatusChange()` via WebSocket
    - Implementar `notifyOrderReady()` quando status = PRONTO
    - Implementar `notifyOrderDelayed()` para pedidos >5min prontos
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6. Implementar camada de controller
  - [x] 6.1 Criar CounterOrderController com endpoints de criação


    - Implementar `create()` validando DTO com Zod
    - Extrair userId e establishmentId do request
    - Retornar response formatado com número do pedido
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 6.2 Implementar endpoints de consulta

    - Implementar `getById()` e `getByNumber()`
    - Implementar `list()` com filtros opcionais
    - Implementar `listPendingPayment()` para Caixa
    - Implementar `listReady()` para notificações
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 8.1, 8.2, 8.3_
  


  - [ ] 6.3 Implementar endpoints de atualização
    - Implementar `updateStatus()` validando transições
    - Implementar `cancel()` com validação de permissões
    - _Requisitos: 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_


  
  - [ ] 6.4 Implementar endpoint de métricas
    - Implementar `getMetrics()` com filtros de data
    - Validar permissões (apenas GERENTE)
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Configurar rotas e middlewares


  - Criar arquivo de rotas `/api/v1/counter-orders`
  - Aplicar middleware `authenticate` em todas as rotas
  - Aplicar middleware `authorize` com roles apropriadas
  - Aplicar middleware `validateEstablishment`
  - Configurar rate limiting (100 req/min)
  - _Requisitos: Todos_

- [x] 8. Implementar tratamento de erros

  - Criar classes de erro específicas do domínio
  - Implementar `OrderNotFoundError`, `InvalidStatusTransitionError`
  - Implementar `ProductUnavailableError`, `CannotCancelPaidOrderError`
  - Configurar middleware de erro para formatar respostas
  - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9. Implementar estratégia de cache

  - Configurar chaves de cache Redis para pedidos ativos
  - Implementar invalidação de cache em operações de escrita
  - Configurar TTLs apropriados por tipo de dado
  - Implementar padrão Cache-Aside para leituras
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5_



- [ ] 10. Implementar sistema de auditoria e logging
  - Adicionar logs estruturados para criação de pedidos
  - Adicionar logs para mudanças de status
  - Adicionar logs de erro com contexto completo
  - Registrar usuário responsável por cada operação
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 11. Criar testes unitários
  - [ ]* 11.1 Testes do CounterOrderService
    - Testar criação de pedido com itens válidos
    - Testar validação de produtos indisponíveis
    - Testar cálculo de valores
    - Testar transições de status válidas e inválidas
    - Testar impedimento de cancelamento de pedidos pagos
    - _Requisitos: 1.5, 2.6, 7.5, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 11.2 Testes do CounterOrderRepository
    - Testar operações CRUD básicas
    - Testar queries com filtros
    - Testar cálculo de métricas
    - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12. Criar testes de integração
  - [ ]* 12.1 Testes de endpoints da API
    - Testar POST /counter-orders (criar pedido)
    - Testar GET /counter-orders/:id (buscar por ID)
    - Testar PATCH /counter-orders/:id/status (atualizar status)
    - Testar POST /counter-orders/:id/cancel (cancelar)
    - Testar GET /counter-orders/pending-payment (listar pendentes)
    - _Requisitos: 1.5, 3.5, 4.5, 5.5, 7.5_
  
  - [ ]* 12.2 Testes de integração com Caixa
    - Testar adição à fila de pagamento
    - Testar confirmação de pagamento
    - Testar remoção da fila ao cancelar
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 12.3 Testes de integração com Kanban
    - Testar adição ao Kanban após pagamento
    - Testar atualização de status no Kanban
    - Testar remoção do Kanban ao entregar
    - Testar eventos WebSocket

    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 13. Criar documentação da API

  - Adicionar anotações Swagger/OpenAPI nos controllers
  - Documentar schemas de request e response
  - Documentar códigos de erro possíveis
  - Adicionar exemplos de uso

  - _Requisitos: Todos_

- [x] 14. Configurar índices de banco de dados

  - Criar índice composto (establishmentId, status)
  - Criar índice em orderNumber
  - Criar índice em createdAt
  - Validar performance das queries
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 15. Implementar monitoramento e observabilidade
  - Configurar métricas de performance (tempo de resposta)
  - Configurar métricas de negócio (pedidos/hora, taxa cancelamento)
  - Configurar alertas para erros críticos
  - Configurar dashboard de métricas
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

