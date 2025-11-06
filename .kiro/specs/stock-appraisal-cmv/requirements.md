# Requirements Document - Conferência de Estoque e CMV

## Introduction

Este documento especifica os requisitos para o sistema de Conferência de Estoque Periódica e Cálculo de CMV (Custo de Mercadoria Vendida). O sistema permitirá realizar inventários físicos, comparar com o estoque teórico, calcular perdas e determinar o CMV real do período.

## Glossary

- **Sistema**: Aplicação de gestão de restaurante
- **Conferência de Estoque**: Processo de contagem física do estoque e comparação com o estoque teórico
- **Estoque Teórico**: Quantidade de estoque calculada pelo sistema baseada em entradas e saídas
- **Estoque Físico**: Quantidade real contada fisicamente no estabelecimento
- **CMV (Custo de Mercadoria Vendida)**: Custo total dos produtos vendidos em um período
- **Período CMV**: Intervalo de tempo para cálculo do CMV (diário, semanal, mensal)
- **Acurácia**: Percentual de precisão entre estoque teórico e físico
- **Divergência**: Diferença entre estoque teórico e físico
- **Usuário**: Pessoa autenticada que utiliza o sistema
- **Gerente**: Usuário com permissão para aprovar conferências

---

## Requirements

### Requirement 1: Criar Conferência de Estoque

**User Story:** Como gerente, eu quero criar uma nova conferência de estoque para iniciar o processo de inventário físico

#### Acceptance Criteria

1. WHEN o Usuário acessa a tela de conferências, THE Sistema SHALL exibir botão "Nova Conferência"
2. WHEN o Usuário clica em "Nova Conferência", THE Sistema SHALL exibir formulário com campos: data, tipo (diária/semanal/mensal), e observações
3. WHEN o Usuário submete o formulário, THE Sistema SHALL criar uma conferência com status "pendente"
4. WHEN a conferência é criada, THE Sistema SHALL capturar o estoque teórico atual de todos os ingredientes
5. THE Sistema SHALL gerar um ID único para cada conferência

### Requirement 2: Registrar Contagem Física

**User Story:** Como usuário, eu quero registrar as quantidades físicas contadas para cada ingrediente

#### Acceptance Criteria

1. WHEN o Usuário abre uma conferência pendente, THE Sistema SHALL exibir lista de todos os ingredientes com quantidade teórica
2. WHEN o Usuário insere a quantidade física, THE Sistema SHALL calcular automaticamente a divergência
3. WHEN há divergência, THE Sistema SHALL calcular o percentual de diferença
4. WHEN o Usuário adiciona motivo da divergência, THE Sistema SHALL salvar a justificativa
5. THE Sistema SHALL permitir adicionar observações por ingrediente

### Requirement 3: Calcular Divergências

**User Story:** Como gerente, eu quero visualizar as divergências entre estoque teórico e físico para identificar problemas

#### Acceptance Criteria

1. WHEN há quantidade física registrada, THE Sistema SHALL calcular divergência como (físico - teórico)
2. WHEN há divergência, THE Sistema SHALL calcular percentual como ((físico - teórico) / teórico) × 100
3. WHEN há divergência, THE Sistema SHALL calcular valor monetário da diferença
4. THE Sistema SHALL classificar divergências como positivas (sobra) ou negativas (falta)
5. THE Sistema SHALL somar o total de divergências em valor monetário

### Requirement 4: Calcular Acurácia do Inventário

**User Story:** Como gerente, eu quero ver a acurácia do inventário para avaliar a qualidade do controle de estoque

#### Acceptance Criteria

1. WHEN todos os ingredientes são contados, THE Sistema SHALL calcular acurácia total
2. THE Sistema SHALL calcular acurácia como (1 - |divergência total| / estoque teórico total) × 100
3. WHEN acurácia é maior que 95%, THE Sistema SHALL exibir indicador verde
4. WHEN acurácia está entre 90% e 95%, THE Sistema SHALL exibir indicador amarelo
5. WHEN acurácia é menor que 90%, THE Sistema SHALL exibir indicador vermelho

### Requirement 5: Aprovar Conferência

**User Story:** Como gerente, eu quero aprovar uma conferência para ajustar o estoque teórico ao físico

#### Acceptance Criteria

1. WHEN a conferência está completa, THE Sistema SHALL exibir botão "Aprovar"
2. WHEN o Gerente clica em "Aprovar", THE Sistema SHALL solicitar confirmação
3. WHEN o Gerente confirma, THE Sistema SHALL atualizar o estoque teórico para o físico
4. WHEN a conferência é aprovada, THE Sistema SHALL registrar data e usuário aprovador
5. WHEN a conferência é aprovada, THE Sistema SHALL mudar status para "aprovada"

### Requirement 6: Criar Período de CMV

**User Story:** Como gerente, eu quero criar um período de CMV para calcular os custos de um intervalo de tempo

#### Acceptance Criteria

1. WHEN o Usuário acessa CMV, THE Sistema SHALL exibir botão "Novo Período"
2. WHEN o Usuário cria período, THE Sistema SHALL solicitar data inicial e final
3. WHEN o período é criado, THE Sistema SHALL capturar estoque inicial (conferência de abertura)
4. THE Sistema SHALL criar período com status "aberto"
5. THE Sistema SHALL validar que não há períodos sobrepostos

### Requirement 7: Registrar Compras no Período

**User Story:** Como usuário, eu quero que as compras sejam automaticamente contabilizadas no período de CMV ativo

#### Acceptance Criteria

1. WHEN há um período CMV aberto, THE Sistema SHALL registrar automaticamente todas as entradas de estoque
2. WHEN uma compra é registrada, THE Sistema SHALL somar o valor ao total de compras do período
3. THE Sistema SHALL manter histórico detalhado de todas as compras
4. THE Sistema SHALL permitir visualizar compras por ingrediente
5. THE Sistema SHALL calcular total de compras em valor monetário

### Requirement 8: Calcular CMV do Período

**User Story:** Como gerente, eu quero calcular o CMV para entender os custos reais do período

#### Acceptance Criteria

1. WHEN o Gerente fecha o período, THE Sistema SHALL solicitar conferência de estoque final
2. WHEN a conferência final é aprovada, THE Sistema SHALL calcular CMV como: Estoque Inicial + Compras - Estoque Final
3. THE Sistema SHALL calcular CMV por categoria de produto
4. THE Sistema SHALL calcular percentual de CMV sobre receita
5. THE Sistema SHALL exibir relatório completo do período

### Requirement 9: Analisar CMV por Produto

**User Story:** Como gerente, eu quero ver o CMV por produto para identificar os mais custosos

#### Acceptance Criteria

1. WHEN o período é fechado, THE Sistema SHALL calcular CMV individual de cada produto vendido
2. THE Sistema SHALL calcular margem real de cada produto
3. THE Sistema SHALL comparar margem real com margem teórica
4. THE Sistema SHALL identificar produtos com maior divergência
5. THE Sistema SHALL gerar ranking de produtos por CMV

### Requirement 10: Gerar Relatórios de CMV

**User Story:** Como gerente, eu quero gerar relatórios de CMV para análise gerencial

#### Acceptance Criteria

1. WHEN o Usuário solicita relatório, THE Sistema SHALL exibir opções de período
2. THE Sistema SHALL gerar relatório com: CMV total, receita, percentual CMV, margem bruta
3. THE Sistema SHALL exibir gráfico de evolução do CMV
4. THE Sistema SHALL permitir comparar períodos
5. THE Sistema SHALL permitir exportar relatório em PDF

### Requirement 11: Alertas de Divergências

**User Story:** Como gerente, eu quero receber alertas quando há divergências significativas no estoque

#### Acceptance Criteria

1. WHEN divergência de um ingrediente é maior que 10%, THE Sistema SHALL gerar alerta
2. WHEN acurácia total é menor que 90%, THE Sistema SHALL gerar alerta crítico
3. WHEN há divergência negativa (falta), THE Sistema SHALL destacar em vermelho
4. THE Sistema SHALL exibir alertas no dashboard
5. THE Sistema SHALL permitir adicionar justificativa aos alertas

### Requirement 12: Histórico de Conferências

**User Story:** Como gerente, eu quero visualizar o histórico de conferências para análise de tendências

#### Acceptance Criteria

1. THE Sistema SHALL manter histórico completo de todas as conferências
2. WHEN o Usuário acessa histórico, THE Sistema SHALL exibir lista ordenada por data
3. THE Sistema SHALL permitir filtrar por período, tipo e status
4. THE Sistema SHALL exibir evolução da acurácia ao longo do tempo
5. THE Sistema SHALL permitir comparar conferências

---

## Business Rules

1. **Períodos CMV**: Não pode haver sobreposição de períodos CMV
2. **Conferências**: Uma conferência aprovada não pode ser editada
3. **Acurácia Mínima**: Acurácia abaixo de 85% requer justificativa obrigatória
4. **Divergências Críticas**: Divergências acima de 20% requerem aprovação de gerente
5. **Estoque Negativo**: Sistema não permite estoque físico negativo
6. **Período Aberto**: Apenas um período CMV pode estar aberto por vez
7. **Conferência Obrigatória**: Fechamento de período requer conferência de estoque
8. **Auditoria**: Todas as alterações em conferências são registradas em log

---

## Non-Functional Requirements

1. **Performance**: Cálculo de CMV deve completar em menos de 5 segundos
2. **Usabilidade**: Interface de contagem deve ser otimizada para dispositivos móveis
3. **Precisão**: Cálculos monetários com precisão de 4 casas decimais
4. **Disponibilidade**: Sistema deve estar disponível 99.5% do tempo
5. **Segurança**: Apenas usuários autorizados podem aprovar conferências
6. **Auditoria**: Todas as ações devem ser registradas com timestamp e usuário

---

## Success Metrics

1. **Acurácia Média**: Manter acurácia média acima de 95%
2. **Tempo de Conferência**: Reduzir tempo de conferência em 50%
3. **Divergências**: Reduzir divergências em 30% após 3 meses
4. **Adoção**: 100% das conferências realizadas pelo sistema
5. **CMV Real vs Teórico**: Diferença menor que 5%

---

**Status**: Draft  
**Version**: 1.0  
**Created**: 06/11/2025  
**Last Updated**: 06/11/2025
