# Requirements Document - Sistema de Comandas e Pedidos

## Introduction

Este documento especifica os requisitos para o módulo de gestão de comandas e pedidos do sistema integrado de restaurantes. Este módulo gerencia o ciclo completo de pedidos desde a criação até o fechamento, incluindo comandas de mesa, pedidos de balcão e controle de status.

## Glossary

- **Comanda**: Registro que agrupa todos os pedidos de uma mesa ou cliente durante o atendimento
- **Pedido**: Solicitação de um ou mais produtos feita pelo cliente
- **Item de Pedido**: Produto individual dentro de um pedido com quantidade e observações
- **Mesa**: Local físico de atendimento no estabelecimento identificado por número
- **Status de Pedido**: Estado atual do pedido (pendente, em preparo, pronto, entregue, cancelado)
- **Status de Comanda**: Estado atual da comanda (aberta, fechada, paga)
- **Garçom**: Funcionário responsável pelo atendimento de mesas
- **Sistema de Pedidos**: Módulo que gerencia comandas, pedidos e seus estados

## Requirements

### Requirement 1 - Gestão de Mesas

**User Story:** Como um administrador, eu quero cadastrar e gerenciar mesas do estabelecimento, para que possam ser utilizadas no atendimento.

#### Acceptance Criteria

1. QUANDO um administrador cria uma Mesa com número e capacidade, O Sistema de Pedidos DEVE persistir a Mesa e retornar HTTP 201
2. QUANDO um administrador tenta criar uma Mesa com número duplicado, O Sistema de Pedidos DEVE retornar erro HTTP 409 com mensagem "Mesa já existe"
3. O Sistema de Pedidos DEVE permitir definir status da Mesa como disponível, ocupada ou reservada
4. QUANDO um administrador atualiza informações de uma Mesa, O Sistema de Pedidos DEVE persistir as alterações e retornar HTTP 200
5. O Sistema de Pedidos DEVE permitir desativar Mesa sem excluir histórico de comandas associadas

### Requirement 2 - Abertura de Comanda

**User Story:** Como um garçom, eu quero abrir uma comanda para uma mesa, para que possa registrar os pedidos do cliente.

#### Acceptance Criteria

1. QUANDO um garçom abre uma Comanda informando Mesa e número de pessoas, O Sistema de Pedidos DEVE criar Comanda com status "aberta" e retornar HTTP 201
2. QUANDO um garçom tenta abrir Comanda para Mesa já ocupada, O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Mesa já possui comanda aberta"
3. O Sistema de Pedidos DEVE registrar data/hora de abertura e garçom responsável na Comanda
4. O Sistema de Pedidos DEVE atualizar status da Mesa para "ocupada" ao abrir Comanda
5. O Sistema de Pedidos DEVE gerar código único identificador para cada Comanda

### Requirement 3 - Criação de Pedidos

**User Story:** Como um garçom, eu quero adicionar pedidos a uma comanda, para que os produtos solicitados pelo cliente sejam registrados.

#### Acceptance Criteria

1. QUANDO um garçom adiciona Pedido a uma Comanda com lista de produtos e quantidades, O Sistema de Pedidos DEVE criar Pedido com status "pendente" e retornar HTTP 201
2. QUANDO um garçom adiciona Item de Pedido com observações, O Sistema de Pedidos DEVE persistir as observações junto ao item
3. O Sistema de Pedidos DEVE calcular valor total do Pedido baseado nos preços dos produtos
4. O Sistema de Pedidos DEVE registrar data/hora de criação do Pedido
5. QUANDO um garçom tenta adicionar Pedido a Comanda fechada, O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Comanda já está fechada"

### Requirement 4 - Controle de Status de Pedidos

**User Story:** Como um funcionário da cozinha, eu quero atualizar o status dos pedidos, para que a equipe saiba o andamento da preparação.

#### Acceptance Criteria

1. QUANDO um funcionário atualiza status de Pedido para "em preparo", O Sistema de Pedidos DEVE persistir a alteração e registrar timestamp
2. QUANDO um funcionário atualiza status de Pedido para "pronto", O Sistema de Pedidos DEVE notificar mudança de status
3. QUANDO um garçom atualiza status de Pedido para "entregue", O Sistema de Pedidos DEVE registrar data/hora de entrega
4. O Sistema de Pedidos DEVE permitir transições de status apenas em sequência válida (pendente → em preparo → pronto → entregue)
5. QUANDO um funcionário tenta atualizar status de Pedido cancelado, O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Pedido cancelado não pode ser alterado"

### Requirement 5 - Cancelamento de Pedidos

**User Story:** Como um garçom, eu quero cancelar pedidos quando necessário, para que erros possam ser corrigidos.

#### Acceptance Criteria

1. QUANDO um garçom cancela um Pedido informando motivo, O Sistema de Pedidos DEVE atualizar status para "cancelado" e registrar motivo
2. QUANDO um garçom cancela Pedido com status "pendente", O Sistema de Pedidos DEVE permitir cancelamento imediato
3. QUANDO um garçom tenta cancelar Pedido com status "entregue", O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Pedido já entregue não pode ser cancelado"
4. O Sistema de Pedidos DEVE registrar usuário responsável e timestamp do cancelamento
5. O Sistema de Pedidos DEVE recalcular valor total da Comanda ao cancelar Pedido



### Requirement 6 - Fechamento de Comanda

**User Story:** Como um garçom, eu quero fechar uma comanda, para que o cliente possa efetuar o pagamento.

#### Acceptance Criteria

1. QUANDO um garçom fecha uma Comanda, O Sistema de Pedidos DEVE calcular valor total somando todos os Pedidos não cancelados
2. QUANDO um garçom fecha Comanda com Pedidos pendentes, O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Existem pedidos não entregues"
3. O Sistema de Pedidos DEVE atualizar status da Comanda para "fechada" e registrar data/hora de fechamento
4. O Sistema de Pedidos DEVE calcular e incluir taxas de serviço quando configurado (10% padrão)
5. O Sistema de Pedidos DEVE manter Mesa como "ocupada" até confirmação de pagamento

### Requirement 7 - Consulta de Comandas

**User Story:** Como um garçom, eu quero consultar comandas abertas e seus pedidos, para que possa acompanhar o atendimento.

#### Acceptance Criteria

1. QUANDO um garçom consulta Comandas abertas, O Sistema de Pedidos DEVE retornar lista de Comandas com status "aberta" ordenadas por data de abertura
2. QUANDO um garçom consulta detalhes de uma Comanda, O Sistema de Pedidos DEVE retornar Comanda com todos os Pedidos e itens associados
3. O Sistema de Pedidos DEVE incluir valor total atual da Comanda na resposta
4. O Sistema de Pedidos DEVE permitir filtrar Comandas por Mesa, garçom ou período
5. O Sistema de Pedidos DEVE implementar paginação em listagens com limite de 50 comandas por página

### Requirement 8 - Pedidos de Balcão

**User Story:** Como um atendente de balcão, eu quero registrar pedidos diretos sem mesa, para atender clientes no balcão.

#### Acceptance Criteria

1. QUANDO um atendente cria Pedido de balcão sem Mesa associada, O Sistema de Pedidos DEVE criar Comanda temporária com tipo "balcão"
2. O Sistema de Pedidos DEVE gerar número sequencial para identificação de Pedidos de balcão
3. QUANDO um atendente finaliza Pedido de balcão, O Sistema de Pedidos DEVE fechar Comanda automaticamente
4. O Sistema de Pedidos DEVE permitir identificar cliente por nome ou telefone em Pedidos de balcão
5. O Sistema de Pedidos DEVE calcular valor total e permitir pagamento imediato

### Requirement 9 - Modificação de Pedidos

**User Story:** Como um garçom, eu quero modificar pedidos antes da preparação, para que possa corrigir erros ou atender solicitações do cliente.

#### Acceptance Criteria

1. QUANDO um garçom adiciona Item de Pedido a Pedido existente com status "pendente", O Sistema de Pedidos DEVE adicionar item e recalcular valor total
2. QUANDO um garçom remove Item de Pedido com status "pendente", O Sistema de Pedidos DEVE remover item e recalcular valor total
3. QUANDO um garçom tenta modificar Pedido com status "em preparo", O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Pedido em preparo não pode ser modificado"
4. O Sistema de Pedidos DEVE registrar histórico de modificações com timestamp e usuário responsável
5. O Sistema de Pedidos DEVE atualizar valor total da Comanda ao modificar Pedido

### Requirement 10 - Relatórios de Pedidos

**User Story:** Como um administrador, eu quero gerar relatórios de pedidos, para que possa analisar vendas e performance.

#### Acceptance Criteria

1. QUANDO um administrador solicita relatório de vendas por período, O Sistema de Pedidos DEVE retornar total de Pedidos, valor total e ticket médio
2. QUANDO um administrador solicita relatório de produtos mais vendidos, O Sistema de Pedidos DEVE retornar lista ordenada por quantidade vendida
3. O Sistema de Pedidos DEVE permitir filtrar relatórios por período, garçom ou tipo de pedido (mesa/balcão)
4. O Sistema de Pedidos DEVE calcular tempo médio de preparo dos Pedidos
5. O Sistema de Pedidos DEVE permitir exportação de relatórios em formato JSON e CSV

### Requirement 11 - Integração com Estoque

**User Story:** Como um administrador, eu quero que pedidos atualizem o estoque automaticamente, para que o controle seja preciso.

#### Acceptance Criteria

1. QUANDO um Pedido é confirmado com status "em preparo", O Sistema de Pedidos DEVE decrementar quantidade de insumos vinculados aos produtos
2. QUANDO um Pedido é cancelado antes de "em preparo", O Sistema de Pedidos DEVE não afetar estoque
3. QUANDO um Pedido é cancelado após "em preparo", O Sistema de Pedidos DEVE registrar perda de insumos mas não devolver ao estoque
4. QUANDO quantidade de insumo é insuficiente, O Sistema de Pedidos DEVE retornar erro HTTP 400 com mensagem "Estoque insuficiente para produto X"
5. O Sistema de Pedidos DEVE registrar transação de estoque com referência ao Pedido

### Requirement 12 - Notificações em Tempo Real

**User Story:** Como um garçom, eu quero receber notificações quando pedidos ficarem prontos, para que possa servir o cliente rapidamente.

#### Acceptance Criteria

1. QUANDO status de Pedido muda para "pronto", O Sistema de Pedidos DEVE enviar notificação via WebSocket para garçom responsável
2. QUANDO novo Pedido é criado, O Sistema de Pedidos DEVE enviar notificação para cozinha
3. O Sistema de Pedidos DEVE incluir número da Mesa e código da Comanda nas notificações
4. O Sistema de Pedidos DEVE manter conexão WebSocket ativa para clientes conectados
5. QUANDO cliente desconecta, O Sistema de Pedidos DEVE remover listener de notificações

### Requirement 13 - Performance e Escalabilidade

**User Story:** Como um administrador de sistema, eu quero que o sistema de pedidos seja performático, para que possa atender múltiplos estabelecimentos simultaneamente.

#### Acceptance Criteria

1. O Sistema de Pedidos DEVE responder consultas de Comandas abertas em tempo máximo de 300 milissegundos
2. O Sistema de Pedidos DEVE suportar mínimo de 50 Pedidos simultâneos sem degradação
3. O Sistema de Pedidos DEVE implementar cache de Comandas abertas com TTL de 2 minutos
4. O Sistema de Pedidos DEVE invalidar cache ao criar, atualizar ou fechar Comanda
5. O Sistema de Pedidos DEVE implementar índices em campos de busca frequente (Mesa, status, data)
