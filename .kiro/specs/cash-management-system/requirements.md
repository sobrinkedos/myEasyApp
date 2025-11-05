# Sistema de Gestão de Caixa - Requirements Document

## Introduction

Este documento especifica os requisitos para o Sistema de Gestão de Caixa, um módulo crítico que controla todo o fluxo financeiro do estabelecimento, desde a abertura do caixa até o fechamento e transferência para tesouraria. O sistema garante rastreabilidade completa de todas as transações financeiras, conferência de valores e auditoria.

## Glossary

- **Caixa**: Terminal de ponto de venda onde são registradas transações financeiras
- **Operador de Caixa**: Usuário responsável por operar um caixa específico
- **Turno de Caixa**: Período entre abertura e fechamento de um caixa
- **Fundo de Troco**: Valor inicial em dinheiro disponibilizado para iniciar operações
- **Sangria**: Retirada parcial de dinheiro do caixa durante operação
- **Suprimento**: Adição de dinheiro ao caixa durante operação
- **Fechamento de Caixa**: Processo de encerramento de turno com conferência de valores
- **Tesouraria**: Setor responsável pela gestão centralizada dos recursos financeiros
- **Quebra de Caixa**: Diferença entre valor esperado e valor contado no fechamento
- **Movimento Financeiro**: Qualquer entrada ou saída de dinheiro registrada no caixa
- **Forma de Pagamento**: Método utilizado para pagamento (dinheiro, cartão, PIX, etc.)
- **Conferência de Caixa**: Processo de contagem e validação de valores no fechamento

## Requirements

### Requirement 1 - Abertura de Caixa

**User Story:** Como operador de caixa, eu quero abrir meu caixa no início do turno, para que possa começar a registrar vendas.

#### Acceptance Criteria

1. WHEN um operador acessa a função de abertura de caixa, THE Sistema de Gestão de Caixa SHALL exibir formulário solicitando valor do fundo de troco
2. WHEN um operador informa valor de fundo de troco, THE Sistema de Gestão de Caixa SHALL validar que o valor é maior que zero
3. WHEN um operador confirma abertura com dados válidos, THE Sistema de Gestão de Caixa SHALL criar registro de turno com timestamp, operador, valor inicial e status "ABERTO"
4. IF já existe caixa aberto para o operador, THEN THE Sistema de Gestão de Caixa SHALL exibir mensagem de erro "Você já possui um caixa aberto"
5. WHEN abertura é concluída, THE Sistema de Gestão de Caixa SHALL gerar número único de identificação do turno

### Requirement 2 - Registro de Vendas

**User Story:** Como operador de caixa, eu quero registrar vendas no caixa aberto, para que todas as transações sejam contabilizadas.

#### Acceptance Criteria

1. WHEN uma venda é finalizada no sistema, THE Sistema de Gestão de Caixa SHALL vincular a transação ao caixa aberto do operador
2. WHEN pagamento é recebido, THE Sistema de Gestão de Caixa SHALL registrar forma de pagamento, valor e timestamp
3. WHERE pagamento é em dinheiro, THE Sistema de Gestão de Caixa SHALL calcular e registrar valor de troco fornecido
4. WHEN venda é registrada, THE Sistema de Gestão de Caixa SHALL atualizar saldo atual do caixa em tempo real
5. THE Sistema de Gestão de Caixa SHALL permitir múltiplas formas de pagamento em uma única venda

### Requirement 3 - Sangria de Caixa

**User Story:** Como operador de caixa, eu quero realizar sangrias quando o volume de dinheiro está alto, para que possa manter segurança e facilitar o fechamento.

#### Acceptance Criteria

1. WHILE caixa está com status "ABERTO", THE Sistema de Gestão de Caixa SHALL permitir registro de sangria
2. WHEN operador solicita sangria, THE Sistema de Gestão de Caixa SHALL exibir formulário solicitando valor e motivo
3. WHEN operador confirma sangria, THE Sistema de Gestão de Caixa SHALL validar que valor não excede saldo disponível em dinheiro
4. WHEN sangria é registrada, THE Sistema de Gestão de Caixa SHALL subtrair valor do saldo atual e criar registro de movimentação tipo "SANGRIA"
5. WHEN sangria é concluída, THE Sistema de Gestão de Caixa SHALL gerar comprovante com número único, valor, operador e timestamp

### Requirement 4 - Suprimento de Caixa

**User Story:** Como operador de caixa, eu quero registrar suprimentos quando preciso de mais troco, para que possa continuar operando normalmente.

#### Acceptance Criteria

1. WHILE caixa está com status "ABERTO", THE Sistema de Gestão de Caixa SHALL permitir registro de suprimento
2. WHEN operador solicita suprimento, THE Sistema de Gestão de Caixa SHALL exibir formulário solicitando valor e motivo
3. WHEN operador confirma suprimento, THE Sistema de Gestão de Caixa SHALL validar que valor é maior que zero
4. WHEN suprimento é registrado, THE Sistema de Gestão de Caixa SHALL adicionar valor ao saldo atual e criar registro de movimentação tipo "SUPRIMENTO"
5. WHEN suprimento é concluído, THE Sistema de Gestão de Caixa SHALL gerar comprovante com número único, valor, operador e timestamp

### Requirement 5 - Consulta de Movimentações

**User Story:** Como operador de caixa, eu quero consultar as movimentações do meu turno, para que possa acompanhar o desempenho e preparar o fechamento.

#### Acceptance Criteria

1. WHILE caixa está aberto, THE Sistema de Gestão de Caixa SHALL exibir resumo com saldo inicial, entradas, saídas e saldo atual
2. WHEN operador acessa detalhes, THE Sistema de Gestão de Caixa SHALL listar todas as transações do turno ordenadas por timestamp
3. THE Sistema de Gestão de Caixa SHALL exibir totalizadores por forma de pagamento (dinheiro, débito, crédito, PIX)
4. THE Sistema de Gestão de Caixa SHALL exibir quantidade e valor total de vendas realizadas
5. THE Sistema de Gestão de Caixa SHALL exibir histórico de sangrias e suprimentos com valores e horários

### Requirement 6 - Pré-Fechamento de Caixa

**User Story:** Como operador de caixa, eu quero visualizar um pré-fechamento antes de fechar definitivamente, para que possa conferir os valores esperados.

#### Acceptance Criteria

1. WHILE caixa está com status "ABERTO", THE Sistema de Gestão de Caixa SHALL permitir acesso à função de pré-fechamento
2. WHEN operador acessa pré-fechamento, THE Sistema de Gestão de Caixa SHALL calcular valor esperado em dinheiro (fundo + vendas - sangrias + suprimentos - trocos)
3. WHEN pré-fechamento é exibido, THE Sistema de Gestão de Caixa SHALL mostrar totalizadores por forma de pagamento
4. THE Sistema de Gestão de Caixa SHALL exibir quantidade de transações realizadas no turno
5. THE Sistema de Gestão de Caixa SHALL permitir impressão do relatório de pré-fechamento

### Requirement 7 - Fechamento de Caixa

**User Story:** Como operador de caixa, eu quero fechar meu caixa ao final do turno, para que possa realizar a conferência e transferir valores para tesouraria.

#### Acceptance Criteria

1. WHEN operador inicia fechamento, THE Sistema de Gestão de Caixa SHALL exibir valor esperado em dinheiro e solicitar valor contado
2. WHEN operador informa valor contado, THE Sistema de Gestão de Caixa SHALL calcular diferença (quebra de caixa)
3. WHERE existe diferença entre esperado e contado, THE Sistema de Gestão de Caixa SHALL solicitar justificativa obrigatória
4. WHEN operador confirma fechamento, THE Sistema de Gestão de Caixa SHALL alterar status do turno para "FECHADO" e registrar timestamp
5. WHEN fechamento é concluído, THE Sistema de Gestão de Caixa SHALL gerar relatório completo com todas as movimentações e totalizadores

### Requirement 8 - Conferência Detalhada

**User Story:** Como operador de caixa, eu quero registrar a contagem detalhada de cédulas e moedas, para que a conferência seja precisa e auditável.

#### Acceptance Criteria

1. WHEN operador está no processo de fechamento, THE Sistema de Gestão de Caixa SHALL exibir formulário de contagem por denominação (R$ 200, R$ 100, R$ 50, R$ 20, R$ 10, R$ 5, R$ 2, R$ 1, R$ 0,50, R$ 0,25, R$ 0,10, R$ 0,05)
2. WHEN operador informa quantidade de cada denominação, THE Sistema de Gestão de Caixa SHALL calcular automaticamente o total
3. WHEN contagem é finalizada, THE Sistema de Gestão de Caixa SHALL comparar total calculado com valor esperado
4. THE Sistema de Gestão de Caixa SHALL armazenar detalhamento completo da contagem para auditoria
5. THE Sistema de Gestão de Caixa SHALL exibir diferença por denominação se houver divergência

### Requirement 9 - Transferência para Tesouraria

**User Story:** Como operador de caixa, eu quero transferir os valores para a tesouraria após o fechamento, para que o dinheiro seja centralizado e guardado com segurança.

#### Acceptance Criteria

1. WHEN caixa está com status "FECHADO", THE Sistema de Gestão de Caixa SHALL permitir registro de transferência para tesouraria
2. WHEN operador inicia transferência, THE Sistema de Gestão de Caixa SHALL exibir valores a serem transferidos por forma de pagamento
3. WHERE forma de pagamento é dinheiro, THE Sistema de Gestão de Caixa SHALL descontar valor do fundo de troco que permanece no caixa
4. WHEN operador confirma transferência, THE Sistema de Gestão de Caixa SHALL solicitar identificação do responsável pela tesouraria que recebeu
5. WHEN transferência é concluída, THE Sistema de Gestão de Caixa SHALL alterar status para "TRANSFERIDO" e gerar comprovante de transferência

### Requirement 10 - Recebimento na Tesouraria

**User Story:** Como responsável pela tesouraria, eu quero receber e conferir os valores transferidos dos caixas, para que possa consolidar o movimento financeiro do dia.

#### Acceptance Criteria

1. WHEN tesoureiro acessa módulo de recebimento, THE Sistema de Gestão de Caixa SHALL listar todos os caixas com status "TRANSFERIDO" pendentes de confirmação
2. WHEN tesoureiro seleciona um caixa, THE Sistema de Gestão de Caixa SHALL exibir detalhamento completo dos valores transferidos
3. WHEN tesoureiro confirma recebimento, THE Sistema de Gestão de Caixa SHALL solicitar valor efetivamente recebido para conferência
4. WHERE existe diferença entre valor transferido e recebido, THEN THE Sistema de Gestão de Caixa SHALL registrar divergência e solicitar justificativa
5. WHEN recebimento é confirmado, THE Sistema de Gestão de Caixa SHALL alterar status para "RECEBIDO" e registrar timestamp e responsável

### Requirement 11 - Relatórios Gerenciais

**User Story:** Como gerente, eu quero visualizar relatórios consolidados de caixa, para que possa analisar o desempenho financeiro e identificar problemas.

#### Acceptance Criteria

1. THE Sistema de Gestão de Caixa SHALL gerar relatório de turnos por período com totalizadores de vendas
2. THE Sistema de Gestão de Caixa SHALL exibir relatório de quebras de caixa com valores e justificativas
3. THE Sistema de Gestão de Caixa SHALL gerar relatório de sangrias e suprimentos por operador e período
4. THE Sistema de Gestão de Caixa SHALL exibir relatório de formas de pagamento com percentuais e valores
5. THE Sistema de Gestão de Caixa SHALL permitir exportação de relatórios em formato PDF e Excel

### Requirement 12 - Auditoria e Rastreabilidade

**User Story:** Como auditor, eu quero rastrear todas as operações realizadas nos caixas, para que possa garantir conformidade e identificar irregularidades.

#### Acceptance Criteria

1. THE Sistema de Gestão de Caixa SHALL registrar log de todas as operações com usuário, timestamp e dados alterados
2. THE Sistema de Gestão de Caixa SHALL impedir exclusão ou alteração de registros de movimentações financeiras
3. THE Sistema de Gestão de Caixa SHALL manter histórico completo de todos os turnos de caixa
4. THE Sistema de Gestão de Caixa SHALL permitir consulta de auditoria por operador, período e tipo de operação
5. THE Sistema de Gestão de Caixa SHALL gerar relatório de auditoria com todas as ações realizadas em um turno específico

### Requirement 13 - Reabertura de Caixa

**User Story:** Como supervisor, eu quero reabrir um caixa fechado em caso de erro, para que possa corrigir problemas identificados após o fechamento.

#### Acceptance Criteria

1. WHERE usuário possui permissão de supervisor, THE Sistema de Gestão de Caixa SHALL permitir reabertura de caixa fechado
2. WHEN supervisor solicita reabertura, THE Sistema de Gestão de Caixa SHALL exibir confirmação com aviso de impacto
3. WHEN reabertura é confirmada, THE Sistema de Gestão de Caixa SHALL alterar status para "REABERTO" e registrar motivo
4. WHEN caixa é reaberto, THE Sistema de Gestão de Caixa SHALL registrar log de auditoria com supervisor responsável
5. THE Sistema de Gestão de Caixa SHALL permitir apenas um fechamento definitivo após reabertura

### Requirement 14 - Múltiplos Caixas

**User Story:** Como estabelecimento com múltiplos pontos de venda, eu quero gerenciar vários caixas simultaneamente, para que possa operar com eficiência.

#### Acceptance Criteria

1. THE Sistema de Gestão de Caixa SHALL permitir abertura simultânea de múltiplos caixas por diferentes operadores
2. THE Sistema de Gestão de Caixa SHALL identificar cada caixa com número único e nome do operador
3. WHEN gerente acessa visão geral, THE Sistema de Gestão de Caixa SHALL exibir status de todos os caixas (aberto, fechado, transferido)
4. THE Sistema de Gestão de Caixa SHALL consolidar valores de todos os caixas no relatório de tesouraria
5. THE Sistema de Gestão de Caixa SHALL permitir filtros por caixa específico em relatórios

### Requirement 15 - Integração com Vendas

**User Story:** Como sistema integrado, eu quero que as vendas sejam automaticamente vinculadas ao caixa correto, para que não haja necessidade de registro manual.

#### Acceptance Criteria

1. WHEN venda é finalizada, THE Sistema de Gestão de Caixa SHALL identificar automaticamente o caixa aberto do usuário
2. IF usuário não possui caixa aberto, THEN THE Sistema de Gestão de Caixa SHALL impedir finalização da venda
3. WHEN pagamento é processado, THE Sistema de Gestão de Caixa SHALL registrar transação vinculada ao turno atual
4. THE Sistema de Gestão de Caixa SHALL atualizar saldo do caixa em tempo real após cada venda
5. THE Sistema de Gestão de Caixa SHALL permitir cancelamento de venda com estorno no caixa mediante autorização

### Requirement 16 - Notificações e Alertas

**User Story:** Como operador de caixa, eu quero receber alertas sobre situações importantes, para que possa tomar ações preventivas.

#### Acceptance Criteria

1. WHEN saldo em dinheiro ultrapassa limite configurado, THE Sistema de Gestão de Caixa SHALL exibir alerta sugerindo sangria
2. WHEN turno ultrapassa tempo máximo configurado, THE Sistema de Gestão de Caixa SHALL exibir notificação para fechamento
3. WHERE existe quebra de caixa acima de percentual configurado, THE Sistema de Gestão de Caixa SHALL notificar supervisor
4. WHEN operador tenta fechar caixa com vendas pendentes, THE Sistema de Gestão de Caixa SHALL exibir aviso
5. THE Sistema de Gestão de Caixa SHALL enviar notificação para tesouraria quando houver transferências pendentes

### Requirement 17 - Configurações do Sistema

**User Story:** Como administrador, eu quero configurar parâmetros do sistema de caixa, para que possa adaptar às necessidades do estabelecimento.

#### Acceptance Criteria

1. THE Sistema de Gestão de Caixa SHALL permitir configuração de valor mínimo e máximo para fundo de troco
2. THE Sistema de Gestão de Caixa SHALL permitir configuração de limite de dinheiro para alerta de sangria
3. THE Sistema de Gestão de Caixa SHALL permitir configuração de tempo máximo de turno
4. THE Sistema de Gestão de Caixa SHALL permitir configuração de percentual máximo de quebra sem justificativa obrigatória
5. THE Sistema de Gestão de Caixa SHALL permitir configuração de formas de pagamento aceitas

### Requirement 18 - Segurança e Permissões

**User Story:** Como administrador, eu quero controlar permissões de acesso às funções de caixa, para que apenas usuários autorizados possam realizar operações críticas.

#### Acceptance Criteria

1. THE Sistema de Gestão de Caixa SHALL exigir autenticação para todas as operações
2. THE Sistema de Gestão de Caixa SHALL permitir apenas operadores autorizados a abrir caixas
3. WHERE operação é sangria ou suprimento acima de valor configurado, THE Sistema de Gestão de Caixa SHALL exigir autorização de supervisor
4. THE Sistema de Gestão de Caixa SHALL restringir reabertura de caixa apenas para perfil supervisor
5. THE Sistema de Gestão de Caixa SHALL restringir acesso a relatórios de auditoria apenas para perfis gerenciais

## Non-Functional Requirements

### Performance

**NFR-01:** WHEN sistema processa fechamento de caixa, THE Sistema de Gestão de Caixa SHALL completar operação em menos que 3 segundos

**NFR-02:** WHEN sistema atualiza saldo após venda, THE Sistema de Gestão de Caixa SHALL refletir mudança em menos que 1 segundo

**NFR-03:** THE Sistema de Gestão de Caixa SHALL suportar operação simultânea de até 50 caixas sem degradação de performance

### Reliability

**NFR-04:** THE Sistema de Gestão de Caixa SHALL garantir disponibilidade de 99,9% durante horário comercial

**NFR-05:** IF ocorre falha durante fechamento de caixa, THEN THE Sistema de Gestão de Caixa SHALL preservar dados parciais para recuperação

**NFR-06:** THE Sistema de Gestão de Caixa SHALL realizar backup automático de dados financeiros a cada 15 minutos

### Security

**NFR-07:** THE Sistema de Gestão de Caixa SHALL criptografar dados financeiros sensíveis em repouso e em trânsito

**NFR-08:** THE Sistema de Gestão de Caixa SHALL registrar log de auditoria para todas as operações financeiras

**NFR-09:** THE Sistema de Gestão de Caixa SHALL bloquear acesso após 3 tentativas de autenticação falhas

**NFR-10:** THE Sistema de Gestão de Caixa SHALL exigir senha forte com mínimo de 8 caracteres para operadores

### Usability

**NFR-11:** THE Sistema de Gestão de Caixa SHALL permitir conclusão de abertura de caixa em menos que 30 segundos

**NFR-12:** THE Sistema de Gestão de Caixa SHALL exibir mensagens de erro em linguagem clara e objetiva

**NFR-13:** THE Sistema de Gestão de Caixa SHALL fornecer atalhos de teclado para operações frequentes

**NFR-14:** THE Sistema de Gestão de Caixa SHALL funcionar em dispositivos com resolução mínima de 1024x768

### Compliance

**NFR-15:** THE Sistema de Gestão de Caixa SHALL manter registros financeiros por período mínimo de 5 anos

**NFR-16:** THE Sistema de Gestão de Caixa SHALL gerar relatórios compatíveis com requisitos fiscais brasileiros

**NFR-17:** THE Sistema de Gestão de Caixa SHALL permitir exportação de dados para sistemas contábeis

## Data Models

### CashRegister (Caixa)
```typescript
{
  id: string
  number: number
  name: string
  establishmentId: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### CashSession (Turno de Caixa)
```typescript
{
  id: string
  cashRegisterId: string
  operatorId: string
  openingAmount: decimal
  expectedAmount: decimal
  countedAmount: decimal
  difference: decimal
  status: enum ['OPEN', 'CLOSED', 'TRANSFERRED', 'RECEIVED', 'REOPENED']
  openedAt: timestamp
  closedAt: timestamp
  transferredAt: timestamp
  receivedAt: timestamp
  treasurerUserId: string
  notes: string
}
```

### CashTransaction (Transação de Caixa)
```typescript
{
  id: string
  cashSessionId: string
  type: enum ['SALE', 'WITHDRAWAL', 'SUPPLY', 'OPENING', 'CLOSING']
  paymentMethod: enum ['CASH', 'DEBIT', 'CREDIT', 'PIX', 'OTHER']
  amount: decimal
  description: string
  saleId: string (nullable)
  userId: string
  timestamp: timestamp
}
```

### CashCount (Contagem de Caixa)
```typescript
{
  id: string
  cashSessionId: string
  denomination: decimal
  quantity: number
  total: decimal
  createdAt: timestamp
}
```

### CashTransfer (Transferência para Tesouraria)
```typescript
{
  id: string
  cashSessionId: string
  transferredBy: string
  receivedBy: string
  expectedAmount: decimal
  receivedAmount: decimal
  difference: decimal
  notes: string
  transferredAt: timestamp
  receivedAt: timestamp
}
```

## Integration Points

### With Sales System
- Vincular vendas ao caixa aberto
- Registrar formas de pagamento
- Processar cancelamentos e estornos

### With User Management
- Autenticar operadores
- Validar permissões
- Registrar ações de usuários

### With Reporting System
- Gerar relatórios gerenciais
- Exportar dados financeiros
- Consolidar informações

### With Audit System
- Registrar logs de operações
- Rastrear alterações
- Manter histórico completo

## Business Rules

**BR-01:** Operador pode ter apenas um caixa aberto por vez

**BR-02:** Fundo de troco deve estar entre R$ 50,00 e R$ 500,00

**BR-03:** Sangria não pode deixar saldo em dinheiro abaixo do fundo de troco

**BR-04:** Quebra de caixa acima de 1% requer justificativa obrigatória

**BR-05:** Turno não pode exceder 12 horas sem fechamento

**BR-06:** Transferência para tesouraria deve ocorrer em até 2 horas após fechamento

**BR-07:** Reabertura de caixa só pode ocorrer dentro de 24 horas após fechamento

**BR-08:** Caixa só pode ser fechado se não houver vendas pendentes

**BR-09:** Valor contado no fechamento deve incluir contagem detalhada por denominação

**BR-10:** Todos os registros financeiros são imutáveis após confirmação
