# Documento de Requisitos - Sistema de Pedidos Balcão

## Introdução

Este documento especifica os requisitos para o sistema de Pedidos Balcão do Restaurant API Core, que permite o registro de pedidos sem vinculação a mesas, com pagamento antecipado antes da preparação. Este fluxo é diferente do sistema de comandas tradicional, sendo ideal para atendimento rápido no balcão, delivery ou retirada.

## Glossário

- **Sistema Balcão**: Módulo de pedidos sem vinculação a mesa que requer pagamento antes da preparação
- **Pedido Balcão**: Pedido criado sem comanda ou mesa associada
- **Status Pendente Pagamento**: Estado do pedido após criação e antes do pagamento
- **Caixa**: Módulo responsável pelo recebimento de pagamentos
- **Kanban de Pedidos**: Quadro visual com colunas de status (Pendente, Preparando, Pronto, Entregue)
- **Item de Pedido**: Produto com quantidade incluído no pedido
- **Valor Total**: Soma de todos os itens do pedido incluindo taxas e descontos

## Requisitos

### Requisito 1: Criação de Pedido Balcão

**História de Usuário:** Como atendente de balcão, eu quero criar pedidos rapidamente sem vincular a uma mesa, para que eu possa atender clientes de forma ágil no balcão.

#### Critérios de Aceitação

1. WHEN o atendente acessa a página de Pedidos, O Sistema Balcão DEVE exibir um botão "Pedidos Balcão" visível e acessível
2. WHEN o atendente clica no botão "Pedidos Balcão", O Sistema Balcão DEVE abrir uma interface de criação de pedido
3. THE Sistema Balcão DEVE permitir adicionar produtos ao pedido com quantidade e observações
4. THE Sistema Balcão DEVE calcular automaticamente o valor total do pedido incluindo todos os itens
5. WHEN o atendente finaliza o pedido, O Sistema Balcão DEVE criar o pedido com status "Pendente Pagamento"

### Requisito 2: Gestão de Itens do Pedido

**História de Usuário:** Como atendente, eu quero adicionar, remover e modificar itens no pedido, para que eu possa ajustar o pedido conforme solicitação do cliente.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE permitir buscar produtos por nome ou categoria
2. WHEN o atendente seleciona um produto, O Sistema Balcão DEVE adicionar o item ao pedido com quantidade padrão de 1
3. THE Sistema Balcão DEVE permitir ajustar a quantidade de cada item entre 1 e 99 unidades
4. THE Sistema Balcão DEVE permitir adicionar observações específicas para cada item com máximo de 200 caracteres
5. THE Sistema Balcão DEVE permitir remover itens do pedido antes da finalização
6. WHEN o atendente modifica itens, O Sistema Balcão DEVE recalcular o valor total em tempo real

### Requisito 3: Fluxo de Pagamento

**História de Usuário:** Como atendente, eu quero que o pedido seja pago antes da preparação, para que não haja inadimplência e o fluxo seja mais ágil.

#### Critérios de Aceitação

1. WHEN o pedido é finalizado, O Sistema Balcão DEVE criar o pedido com status "Pendente Pagamento"
2. THE Sistema Balcão DEVE enviar o pedido para a fila de pagamentos no Caixa
3. THE Sistema Balcão DEVE impedir que pedidos com status "Pendente Pagamento" apareçam no Kanban de Pedidos
4. WHEN o pagamento é confirmado no Caixa, O Sistema Balcão DEVE alterar o status do pedido para "Pendente"
5. WHEN o status muda para "Pendente", O Sistema Balcão DEVE adicionar o pedido à coluna "Pendente" do Kanban

### Requisito 4: Integração com Caixa

**História de Usuário:** Como operador de caixa, eu quero visualizar pedidos pendentes de pagamento, para que eu possa processar os pagamentos rapidamente.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE enviar pedidos com status "Pendente Pagamento" para o módulo Caixa
2. THE Caixa DEVE exibir pedidos balcão pendentes em uma seção específica
3. THE Caixa DEVE mostrar número do pedido, itens e valor total para cada pedido pendente
4. WHEN o operador registra o pagamento, O Caixa DEVE notificar o Sistema Balcão da confirmação
5. THE Sistema Balcão DEVE atualizar o status do pedido para "Pendente" em menos de 2 segundos após confirmação

### Requisito 5: Visualização no Kanban

**História de Usuário:** Como cozinheiro, eu quero ver apenas pedidos pagos no Kanban, para que eu prepare apenas pedidos confirmados.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE adicionar pedidos ao Kanban somente após pagamento confirmado
2. WHEN o pedido entra no Kanban, O Sistema Balcão DEVE posicioná-lo na coluna "Pendente"
3. THE Sistema Balcão DEVE exibir um indicador visual de que é um pedido balcão (sem mesa)
4. THE Sistema Balcão DEVE permitir movimentação do pedido entre colunas (Pendente → Preparando → Pronto → Entregue)
5. WHEN o pedido chega à coluna "Entregue", O Sistema Balcão DEVE marcar o pedido como concluído

### Requisito 6: Identificação e Rastreamento

**História de Usuário:** Como atendente, eu quero identificar facilmente pedidos balcão, para que eu possa chamar o cliente quando o pedido estiver pronto.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE gerar um número sequencial único para cada pedido
2. THE Sistema Balcão DEVE permitir registrar nome do cliente com máximo de 100 caracteres
3. THE Sistema Balcão DEVE exibir o número do pedido em tamanho grande após criação
4. THE Sistema Balcão DEVE permitir imprimir comprovante com número do pedido
5. THE Sistema Balcão DEVE exibir badge "BALCÃO" em todos os cards do pedido no Kanban

### Requisito 7: Cancelamento de Pedidos

**História de Usuário:** Como gerente, eu quero poder cancelar pedidos antes do pagamento, para que eu possa corrigir erros ou atender solicitações de cancelamento.

#### Critérios de Aceitação

1. WHILE o pedido está com status "Pendente Pagamento", O Sistema Balcão DEVE permitir cancelamento
2. WHEN o gerente cancela um pedido, O Sistema Balcão DEVE solicitar confirmação da ação
3. WHEN o cancelamento é confirmado, O Sistema Balcão DEVE remover o pedido da fila do Caixa
4. THE Sistema Balcão DEVE registrar o motivo do cancelamento com máximo de 200 caracteres
5. IF o pedido já foi pago, THEN O Sistema Balcão DEVE impedir o cancelamento e exigir estorno

### Requisito 8: Notificações e Alertas

**História de Usuário:** Como atendente, eu quero ser notificado quando o pedido estiver pronto, para que eu possa chamar o cliente imediatamente.

#### Critérios de Aceitação

1. WHEN o pedido muda para status "Pronto", O Sistema Balcão DEVE emitir notificação visual
2. THE Sistema Balcão DEVE exibir lista de pedidos prontos aguardando retirada
3. THE Sistema Balcão DEVE mostrar tempo decorrido desde que o pedido ficou pronto
4. WHEN o tempo de espera excede 5 minutos, O Sistema Balcão DEVE destacar o pedido com cor de alerta
5. THE Sistema Balcão DEVE permitir marcar pedido como "Entregue" após retirada pelo cliente

### Requisito 9: Relatórios e Métricas

**História de Usuário:** Como gerente, eu quero visualizar métricas de pedidos balcão, para que eu possa analisar o desempenho deste canal de venda.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE registrar data e hora de criação, pagamento e conclusão de cada pedido
2. THE Sistema Balcão DEVE calcular tempo médio entre criação e pagamento
3. THE Sistema Balcão DEVE calcular tempo médio de preparação dos pedidos
4. THE Sistema Balcão DEVE exibir total de vendas por período para pedidos balcão
5. THE Sistema Balcão DEVE permitir filtrar relatórios por data, status e valor

### Requisito 10: Validações e Regras de Negócio

**História de Usuário:** Como sistema, eu quero validar dados do pedido, para que não haja inconsistências ou erros no processo.

#### Critérios de Aceitação

1. THE Sistema Balcão DEVE exigir pelo menos 1 item para criar um pedido
2. THE Sistema Balcão DEVE validar que todos os produtos existem e estão ativos
3. THE Sistema Balcão DEVE impedir criar pedido com valor total igual a zero
4. WHEN um produto está indisponível, O Sistema Balcão DEVE exibir alerta e impedir adição
5. THE Sistema Balcão DEVE validar que quantidades são números inteiros positivos entre 1 e 99
