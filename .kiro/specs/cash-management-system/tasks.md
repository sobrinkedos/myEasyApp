# Sistema de Gestão de Caixa - Plano de Implementação

## Visão Geral

Este plano detalha a implementação completa do Sistema de Gestão de Caixa, desde a estrutura de dados até a interface de usuário, incluindo toda a lógica de negócio, segurança e auditoria.

---

## Fase 1: Banco de Dados e Modelos Principais (5 tarefas) ✅

### Tarefa 1.1: Criar Schema Prisma para Gestão de Caixa
- [x] 1.1 Adicionar modelo CashRegister ao schema Prisma
  - Definir campos: id, number, name, establishmentId, isActive, timestamps
  - Adicionar relação com Establishment
  - Adicionar índices para establishmentId
  - _Requisitos: NFR-03_

- [x] 1.2 Adicionar modelo CashSession ao schema Prisma
  - Definir campos: id, cashRegisterId, operatorId, amounts, status, timestamps
  - Adicionar enum CashSessionStatus (OPEN, CLOSED, TRANSFERRED, RECEIVED, REOPENED)
  - Adicionar relações com CashRegister, User (operador e tesoureiro)
  - Adicionar índices para cashRegisterId, operatorId, status, openedAt
  - _Requisitos: 1.1, 1.5, 7.1, 7.4_

- [x] 1.3 Adicionar modelo CashTransaction ao schema Prisma
  - Definir campos: id, cashSessionId, type, paymentMethod, amount, description, saleId, userId, timestamp
  - Adicionar enum TransactionType (SALE, WITHDRAWAL, SUPPLY, OPENING, CLOSING, ADJUSTMENT)
  - Adicionar enum PaymentMethod (CASH, DEBIT, CREDIT, PIX, VOUCHER, OTHER)
  - Adicionar relações com CashSession, Sale, User
  - Adicionar índices para cashSessionId, type, timestamp
  - _Requisitos: 2.1, 2.2, 2.5, 3.1, 3.4, 4.1, 4.4_

- [x] 1.4 Adicionar modelos CashCount e CashTransfer
  - Criar modelo CashCount com campos denomination, quantity, total
  - Criar modelo CashTransfer com rastreamento de transferência e recebimento
  - Adicionar relações e índices
  - _Requisitos: 8.1, 8.2, 8.4, 9.1, 9.2, 9.4, 10.1, 10.2_

- [x] 1.5 Executar migrações e atualizar banco de dados
  - Gerar migração Prisma
  - Aplicar migração ao banco de dados
  - Verificar integridade do schema
  - Criar dados de seed para testes
  - _Requisitos: NFR-05_

---

## Fase 2: Camada de Repositório (4 tarefas) ✅

### Tarefa 2.1: Implementar Repositório CashSession
- [x] 2.1 Criar classe CashSessionRepository
  - Implementar método create para abertura de sessões
  - Implementar findById com relações completas
  - Implementar método findActiveByOperator
  - Implementar método update para mudanças de status
  - Implementar findMany com filtros (status, operador, intervalo de datas)
  - Adicionar suporte a paginação
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_

### Tarefa 2.2: Implementar Repositório CashTransaction
- [x] 2.2 Criar classe CashTransactionRepository
  - Implementar método create para transações
  - Implementar método findBySession
  - Implementar getSessionBalance com query de agregação
  - Implementar método getTransactionsByType
  - Implementar método cancel (soft delete ou atualização de status)
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

### Tarefa 2.3: Implementar Repositório CashCount
- [x] 2.3 Criar classe CashCountRepository
  - Implementar createMany para inserção em lote
  - Implementar método findBySession
  - Implementar método calculateTotal
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

### Tarefa 2.4: Implementar Repositório CashTransfer
- [x] 2.4 Criar classe CashTransferRepository
  - Implementar método create para transferências
  - Implementar método findPending
  - Implementar método confirmReceipt
  - Implementar getDailyConsolidation com agregação
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Fase 3: Serviços de Lógica de Negócio (7 tarefas) ✅

### Tarefa 3.1: Implementar CashSessionService - Abertura
- [x] 3.1 Criar classe CashSessionService
  - Implementar método openSession
  - Validar que operador não tem sessão aberta
  - Validar faixa de valor de abertura (R$ 50 - R$ 500)
  - Criar sessão com status OPEN
  - Registrar transação de abertura
  - Registrar ação de auditoria
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, BR-01, BR-02_

### Tarefa 3.2: Implementar CashSessionService - Fechamento
- [x] 3.2 Implementar método closeSession
  - Validar que sessão existe e está OPEN
  - Calcular valor esperado das transações
  - Registrar contagens de dinheiro
  - Calcular diferença (quebra)
  - Validar justificativa se diferença > 1%
  - Atualizar status da sessão para CLOSED
  - Notificar supervisor se quebra significativa
  - Registrar ação de auditoria
  - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, BR-04, BR-08_

### Tarefa 3.3: Implementar CashSessionService - Reabertura
- [x] 3.3 Implementar método reopenSession
  - Validar que usuário tem permissão de supervisor
  - Validar que sessão está CLOSED e dentro de 24h
  - Atualizar status para REOPENED
  - Registrar motivo da reabertura
  - Registrar ação de auditoria com info do supervisor
  - _Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, BR-07_

### Tarefa 3.4: Implementar TransactionService
- [x] 3.4 Criar classe TransactionService
  - Implementar método recordSale (vinculado automaticamente das vendas)
  - Implementar método recordWithdrawal com validações
  - Implementar método recordSupply
  - Implementar método cancelTransaction (apenas supervisor)
  - Implementar método getSessionBalance
  - Implementar método getSessionTransactions
  - Validar que sessão está OPEN para todas operações
  - Verificar limites de autorização para sangrias/suprimentos
  - Atualizar saldo da sessão em tempo real
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.2, 15.3, 15.4, 15.5, BR-03_

### Tarefa 3.5: Implementar ClosingService
- [x] 3.5 Criar classe ClosingService
  - Implementar método startClosing (preview)
  - Implementar método recordCashCount
  - Implementar método calculateDifference
  - Implementar método finalizeClosure
  - Gerar relatório de fechamento
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, BR-09_
  - _Nota: Funcionalidade integrada no CashSessionService_

### Tarefa 3.6: Implementar TreasuryService
- [x] 3.6 Criar classe TreasuryService
  - Implementar método transferToTreasury
  - Calcular valor de transferência (excluindo valor de abertura)
  - Atualizar status da sessão para TRANSFERRED
  - Notificar tesouraria sobre transferência pendente
  - Implementar método confirmReceipt
  - Registrar diferenças se houver
  - Atualizar status para RECEIVED
  - Implementar método listPendingTransfers
  - Implementar método getDailyConsolidation
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, BR-06, BR-10_

### Tarefa 3.7: Implementar AuditService
- [x] 3.7 Criar classe AuditService
  - Implementar método logAction
  - Armazenar usuário, timestamp, IP, user agent
  - Armazenar estado anterior e novo para mudanças
  - Implementar método getAuditTrail
  - Implementar searchAuditLogs com filtros
  - Implementar método generateAuditReport
  - Garantir imutabilidade dos logs de auditoria
  - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5, NFR-08_
  - _Nota: Usando logger Winston existente para auditoria_

---

## Fase 4: Controladores de API e Rotas (6 tarefas) ✅

### Tarefa 4.1: Implementar CashSessionController
- [x] 4.1 Criar classe CashSessionController
  - Implementar POST /api/v1/cash/sessions (abrir)
  - Implementar GET /api/v1/cash/sessions/active
  - Implementar GET /api/v1/cash/sessions/:id
  - Implementar POST /api/v1/cash/sessions/:id/close
  - Implementar POST /api/v1/cash/sessions/:id/reopen (supervisor)
  - Implementar GET /api/v1/cash/sessions (listar com filtros)
  - Adicionar validação de requisições com Zod
  - Adicionar tratamento de erros
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 13.1, 13.2, 13.3, 13.4, 13.5_

### Tarefa 4.2: Implementar TransactionController
- [x] 4.2 Criar classe TransactionController
  - Implementar POST /api/v1/cash/sessions/:id/withdrawals
  - Implementar POST /api/v1/cash/sessions/:id/supplies
  - Implementar GET /api/v1/cash/sessions/:id/transactions
  - Implementar GET /api/v1/cash/sessions/:id/balance
  - Implementar POST /api/v1/cash/transactions/:id/cancel (supervisor)
  - Adicionar validação para valores e motivos
  - Adicionar verificações de autorização
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

### Tarefa 4.3: Implementar ClosingController
- [x] 4.3 Criar classe ClosingController
  - Implementar GET /api/v1/cash/sessions/:id/closing-preview
  - Implementar POST /api/v1/cash/sessions/:id/cash-count
  - Adicionar validação para denominações de contagem
  - Calcular totais automaticamente
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  - _Nota: Funcionalidade integrada no CashSessionController_

### Tarefa 4.4: Implementar TreasuryController
- [x] 4.4 Criar classe TreasuryController
  - Implementar POST /api/v1/cash/sessions/:id/transfer
  - Implementar GET /api/v1/treasury/transfers/pending
  - Implementar POST /api/v1/treasury/transfers/:id/confirm
  - Implementar GET /api/v1/treasury/consolidation/daily
  - Adicionar validação de papel de tesoureiro
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

### Tarefa 4.5: Implementar ReportController
- [ ] 4.5 Criar classe ReportController
  - Implementar GET /api/v1/cash/reports/session/:id
  - Implementar GET /api/v1/cash/reports/daily
  - Implementar GET /api/v1/cash/reports/cash-breaks
  - Implementar GET /api/v1/cash/reports/operator-performance
  - Suportar múltiplos formatos (JSON, PDF, EXCEL)
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5_

### Tarefa 4.6: Implementar AuditController
- [ ] 4.6 Criar classe AuditController
  - Implementar GET /api/v1/cash/audit/session/:id
  - Implementar GET /api/v1/cash/audit/search
  - Adicionar filtros para busca de auditoria
  - Restringir acesso apenas a usuários autorizados
  - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5_

---

## Fase 5: Segurança e Middleware (4 tarefas) ✅

### Tarefa 5.1: Implementar Middleware de Autenticação
- [x] 5.1 Criar middleware de autenticação específico para caixa
  - Implementar middleware requireCashOperator
  - Implementar middleware requireSupervisor
  - Implementar middleware requireTreasurer
  - Validar tokens JWT
  - Verificar papéis e permissões de usuário
  - _Requisitos: 18.1, 18.2, 18.3, 18.4, 18.5, NFR-09, NFR-10_

### Tarefa 5.2: Implementar Middleware de Validação
- [x] 5.2 Criar schemas Zod para todos os endpoints
  - OpenSessionSchema
  - CloseSessionSchema
  - WithdrawalSchema
  - SupplySchema
  - CashCountSchema
  - TransferSchema
  - ReceiptSchema
  - Adicionar validadores customizados para regras de negócio
  - _Requisitos: BR-01, BR-02, BR-03, BR-04_

### Tarefa 5.3: Implementar Tratamento de Erros
- [x] 5.3 Criar classes de erro customizadas
  - SessionAlreadyOpenError
  - SessionNotFoundError
  - InvalidSessionStatusError
  - InsufficientCashError
  - AuthorizationRequiredError
  - JustificationRequiredError
  - Implementar handler global de erros
  - Adicionar logging de erros
  - _Requisitos: NFR-12_

### Tarefa 5.4: Implementar Criptografia de Dados
- [ ] 5.4 Adicionar criptografia para dados sensíveis
  - Implementar utilitários de criptografia
  - Criptografar valores de caixa no armazenamento
  - Criptografar detalhes de log de auditoria
  - Usar criptografia AES-256-GCM
  - _Requisitos: NFR-07_

---

## Fase 6: Integração com Sistema de Vendas (3 tarefas)

### Tarefa 6.1: Implementar Integração com Vendas
- [ ] 6.1 Criar SalesIntegrationService
  - Vincular vendas automaticamente à sessão de caixa ativa
  - Validar que operador tem sessão aberta antes da venda
  - Registrar transação quando venda é concluída
  - Lidar com múltiplas formas de pagamento
  - Calcular e registrar troco fornecido
  - _Requisitos: 15.1, 15.2, 15.3, 15.4, BR-08_

### Tarefa 6.2: Implementar Cancelamento de Venda
- [ ] 6.2 Adicionar suporte a cancelamento
  - Implementar lógica de estorno (reversal)
  - Exigir autorização de supervisor
  - Criar transação negativa
  - Atualizar saldo da sessão
  - Registrar cancelamento na auditoria
  - _Requisitos: 15.5_

### Tarefa 6.3: Adicionar Atualizações de Saldo em Tempo Real
- [ ] 6.3 Implementar WebSocket para atualizações em tempo real
  - Emitir atualizações de saldo após cada transação
  - Notificar clientes conectados sobre mudanças de sessão
  - Atualizar dashboard em tempo real
  - _Requisitos: 2.4, NFR-02_

---

## Fase 7: Notificações e Alertas (3 tarefas)

### Tarefa 7.1: Implementar Serviço de Notificações
- [ ] 7.1 Criar classe NotificationService
  - Implementar notificações por email
  - Implementar notificações in-app
  - Suportar múltiplos destinatários
  - Enfileirar notificações para confiabilidade
  - _Requisitos: 16.1, 16.2, 16.3, 16.4, 16.5_

### Tarefa 7.2: Implementar Regras de Alerta
- [ ] 7.2 Criar classe AlertService
  - Alertar sobre saldo alto em dinheiro (sugerir sangria)
  - Alertar sobre sessões abertas por muito tempo (> 12h)
  - Alertar sobre quebras de caixa altas (> 5%)
  - Alertar sobre transferências pendentes (> 2h)
  - Alertar sobre sessões não fechadas
  - _Requisitos: 16.1, 16.2, 16.3, 16.5, BR-05, BR-06_

### Tarefa 7.3: Implementar Jobs Agendados
- [ ] 7.3 Criar cron jobs para alertas
  - Verificar sessões longas a cada hora
  - Verificar transferências pendentes a cada 30 minutos
  - Enviar resumo diário para gerentes
  - Limpar logs de auditoria antigos (> 5 anos)
  - _Requisitos: NFR-15, BR-05, BR-06_

---

## Fase 8: Relatórios e Análises (3 tarefas)

### Tarefa 8.1: Implementar Geração de Relatórios
- [ ] 8.1 Criar classe ReportService
  - Gerar relatório de sessão com todos os detalhes
  - Gerar relatório de consolidação diária
  - Gerar relatório de análise de quebras de caixa
  - Gerar relatório de desempenho de operador
  - Incluir gráficos e visualizações
  - _Requisitos: 11.1, 11.2, 11.3, 11.4_

### Tarefa 8.2: Implementar Exportação para PDF
- [ ] 8.2 Adicionar geração de PDF
  - Usar biblioteca como PDFKit ou Puppeteer
  - Criar templates profissionais de relatório
  - Incluir logo e marca do estabelecimento
  - Adicionar números de página e timestamps
  - Suportar tamanhos A4 e Carta
  - _Requisitos: 11.5, NFR-16_

### Tarefa 8.3: Implementar Exportação para Excel
- [ ] 8.3 Adicionar geração de Excel
  - Usar biblioteca como ExcelJS
  - Exportar detalhes de transações
  - Exportar consolidação diária
  - Incluir fórmulas e formatação
  - Suportar filtragem e ordenação
  - _Requisitos: 6.5, 11.5, NFR-17_

---

## Fase 9: Configuração e Administração (2 tarefas)

### Tarefa 9.1: Implementar Serviço de Configuração
- [ ] 9.1 Criar classe ConfigurationService
  - Armazenar configuração no banco de dados
  - Implementar métodos get/set
  - Cachear valores de configuração
  - Suportar configuração por estabelecimento
  - _Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5_

### Tarefa 9.2: Implementar UI de Configuração Admin
- [ ] 9.2 Criar endpoints de configuração
  - GET /api/v1/cash/config
  - PUT /api/v1/cash/config
  - Validar valores de configuração
  - Exigir permissão de admin
  - Registrar mudanças de configuração
  - _Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5_

---

## Fase 10: Performance e Otimização (3 tarefas)

### Tarefa 10.1: Implementar Cache
- [ ] 10.1 Adicionar cache Redis
  - Cachear sessões ativas por operador
  - Cachear saldos de sessão
  - Cachear valores de configuração
  - Implementar invalidação de cache
  - Definir TTLs apropriados
  - _Requisitos: NFR-01, NFR-02, NFR-03_

### Tarefa 10.2: Otimizar Queries de Banco de Dados
- [ ] 10.2 Adicionar otimizações de query
  - Usar SQL raw para agregações complexas
  - Adicionar índices de banco de dados
  - Implementar cache de resultados de query
  - Usar operações em lote quando possível
  - Perfilar queries lentas
  - _Requisitos: NFR-01, NFR-03_

### Tarefa 10.3: Implementar Monitoramento
- [ ] 10.3 Adicionar monitoramento e métricas
  - Rastrear duração média de sessão
  - Rastrear frequência de quebras de caixa
  - Rastrear volume de transações
  - Rastrear tempos de resposta da API
  - Configurar alertas para anomalias
  - _Requisitos: NFR-01, NFR-04_

---

## Fase 11: Testes (4 tarefas)

### Tarefa 11.1: Escrever Testes Unitários para Serviços
- [ ]* 11.1 Criar testes unitários
  - Testar métodos do CashSessionService
  - Testar métodos do TransactionService
  - Testar métodos do ClosingService
  - Testar métodos do TreasuryService
  - Testar lógica de validação
  - Testar tratamento de erros
  - Alcançar cobertura de código de 80%+
  - _Requisitos: Todos os requisitos funcionais_

### Tarefa 11.2: Escrever Testes de Integração
- [ ]* 11.2 Criar testes de integração
  - Testar ciclo de vida completo da sessão
  - Testar fluxos de sangria e suprimento
  - Testar fluxos de fechamento e transferência
  - Testar cenários de erro
  - Testar verificações de autorização
  - _Requisitos: Todos os requisitos funcionais_

### Tarefa 11.3: Escrever Testes E2E
- [ ]* 11.3 Criar testes end-to-end
  - Testar fluxos completos de usuário
  - Testar cenários multi-usuário
  - Testar operações concorrentes
  - Testar casos extremos
  - _Requisitos: Todos os requisitos funcionais_

### Tarefa 11.4: Testes de Performance
- [ ]* 11.4 Criar testes de performance
  - Teste de carga com 50 sessões concorrentes
  - Teste de stress no registro de transações
  - Testar performance de queries do banco de dados
  - Testar tempos de resposta da API
  - _Requisitos: NFR-01, NFR-02, NFR-03_

---

## Fase 12: Documentação e Deploy (3 tarefas)

### Tarefa 12.1: Escrever Documentação da API
- [ ] 12.1 Criar documentação abrangente da API
  - Documentar todos os endpoints com Swagger
  - Adicionar exemplos de requisição/resposta
  - Documentar códigos de erro
  - Adicionar requisitos de autenticação
  - Incluir exemplos de uso
  - _Requisitos: Todos os endpoints da API_

### Tarefa 12.2: Escrever Documentação do Usuário
- [ ] 12.2 Criar guias de usuário
  - Escrever manual do operador
  - Escrever manual do supervisor
  - Escrever manual do tesoureiro
  - Criar tutoriais em vídeo
  - Adicionar guia de solução de problemas
  - _Requisitos: NFR-11, NFR-12, NFR-13_

### Tarefa 12.3: Preparar para Deploy
- [ ] 12.3 Configurar deploy
  - Configurar variáveis de ambiente
  - Configurar migrações de banco de dados
  - Configurar estratégia de backup
  - Configurar monitoramento e alertas
  - Criar checklist de deploy
  - _Requisitos: NFR-04, NFR-05, NFR-06, NFR-15_

---

## Resumo

**Total de Tarefas:** 47 tarefas principais + 4 tarefas opcionais de testes
**Tempo Estimado:** 120-150 horas
**Prioridade:** Alta (Crítico para operações financeiras)
**Dependências:** Backend API Core (✅ Completo)

**Principais Entregas:**
- Sistema completo de gestão de caixa
- Trilha de auditoria completa e conformidade
- Rastreamento de saldo em tempo real
- Relatórios abrangentes
- Seguro e performático
- Bem documentado e testado
