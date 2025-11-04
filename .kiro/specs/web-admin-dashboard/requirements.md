# Requirements Document - Web App de Gestão

## Introduction

Este documento especifica os requisitos para o Web App de Gestão, uma aplicação web responsiva para administração completa do sistema de restaurante. A aplicação permite gerenciar produtos, estoque, vendas no balcão, visualizar pedidos em tempo real e gerar relatórios gerenciais.

## Glossary

- **Dashboard**: Painel principal com visão geral de métricas e indicadores
- **Web App de Gestão**: Aplicação web frontend para administração do sistema
- **Interface Responsiva**: Interface que se adapta a diferentes tamanhos de tela
- **Venda no Balcão**: Transação de venda direta sem mesa, processada pelo atendente
- **Relatório Gerencial**: Documento com análises e métricas de negócio
- **Usuário Admin**: Pessoa com permissões completas de administração
- **Sessão**: Período de tempo em que usuário está autenticado no sistema

## Requirements

### Requirement 1 - Autenticação e Sessão

**User Story:** Como um administrador, eu quero fazer login no web app de forma segura, para que possa acessar as funcionalidades de gestão.

#### Acceptance Criteria

1. QUANDO um usuário acessa a página de login e submete credenciais válidas, O Web App de Gestão DEVE armazenar token JWT no localStorage e redirecionar para dashboard
2. QUANDO um usuário submete credenciais inválidas, O Web App de Gestão DEVE exibir mensagem de erro "Credenciais inválidas"
3. QUANDO token JWT expira durante uso, O Web App de Gestão DEVE redirecionar para página de login com mensagem "Sessão expirada"
4. QUANDO um usuário clica em logout, O Web App de Gestão DEVE remover token do localStorage e redirecionar para login
5. O Web App de Gestão DEVE incluir token JWT no header Authorization de todas as requisições à API

### Requirement 2 - Dashboard Principal

**User Story:** Como um administrador, eu quero visualizar um dashboard com métricas principais, para que possa acompanhar o desempenho do estabelecimento.

#### Acceptance Criteria

1. QUANDO um usuário acessa o dashboard, O Web App de Gestão DEVE exibir total de vendas do dia, semana e mês
2. O Web App de Gestão DEVE exibir número de comandas abertas em tempo real
3. O Web App de Gestão DEVE exibir lista de produtos com estoque baixo
4. O Web App de Gestão DEVE exibir gráfico de vendas dos últimos 7 dias
5. O Web App de Gestão DEVE atualizar métricas automaticamente a cada 30 segundos

### Requirement 3 - Gestão de Produtos

**User Story:** Como um administrador, eu quero gerenciar produtos do cardápio, para que possa manter o catálogo atualizado.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de produtos, O Web App de Gestão DEVE exibir lista paginada de produtos com imagem, nome, preço e categoria
2. QUANDO um usuário clica em "Novo Produto", O Web App de Gestão DEVE exibir formulário com campos nome, descrição, preço, categoria e upload de imagem
3. QUANDO um usuário submete formulário válido, O Web App de Gestão DEVE enviar requisição POST à API e exibir mensagem de sucesso
4. QUANDO um usuário clica em editar produto, O Web App de Gestão DEVE preencher formulário com dados existentes
5. QUANDO um usuário clica em excluir produto, O Web App de Gestão DEVE exibir confirmação e enviar requisição DELETE à API

### Requirement 4 - Gestão de Categorias

**User Story:** Como um administrador, eu quero gerenciar categorias de produtos, para que possa organizar o cardápio.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de categorias, O Web App de Gestão DEVE exibir lista ordenada de categorias
2. QUANDO um usuário cria nova categoria, O Web App de Gestão DEVE validar nome obrigatório antes de enviar à API
3. O Web App de Gestão DEVE permitir reordenar categorias via drag-and-drop
4. QUANDO um usuário altera ordem de categorias, O Web App de Gestão DEVE enviar requisição PUT à API com nova ordem
5. O Web App de Gestão DEVE exibir número de produtos em cada categoria



### Requirement 5 - Gestão de Insumos

**User Story:** Como um administrador, eu quero gerenciar insumos e matérias-primas, para que possa controlar o estoque.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de insumos, O Web App de Gestão DEVE exibir lista de insumos com nome, quantidade atual, unidade e status
2. QUANDO um usuário cria novo insumo, O Web App de Gestão DEVE validar campos obrigatórios (nome, unidade, quantidade mínima)
3. O Web App de Gestão DEVE exibir indicador visual para insumos com estoque baixo (cor vermelha ou ícone de alerta)
4. QUANDO um usuário vincula insumo a produto, O Web App de Gestão DEVE exibir modal para selecionar produto e informar quantidade
5. O Web App de Gestão DEVE permitir buscar insumos por nome

### Requirement 6 - Controle de Estoque

**User Story:** Como um administrador, eu quero registrar movimentações de estoque, para que possa manter controle preciso.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de estoque, O Web App de Gestão DEVE exibir formulário para registrar entrada ou saída
2. QUANDO um usuário seleciona tipo "entrada", O Web App de Gestão DEVE exibir campos insumo, quantidade e motivo opcional
3. QUANDO um usuário tenta registrar saída com quantidade maior que disponível, O Web App de Gestão DEVE exibir erro "Quantidade insuficiente em estoque"
4. O Web App de Gestão DEVE exibir histórico de transações com filtros por insumo e período
5. O Web App de Gestão DEVE permitir exportar histórico em formato CSV

### Requirement 7 - Vendas no Balcão

**User Story:** Como um atendente de balcão, eu quero registrar vendas diretas, para que possa atender clientes rapidamente.

#### Acceptance Criteria

1. QUANDO um usuário acessa módulo de vendas no balcão, O Web App de Gestão DEVE exibir catálogo de produtos com busca
2. QUANDO um usuário adiciona produto ao pedido, O Web App de Gestão DEVE exibir carrinho com itens, quantidades e valor total
3. O Web App de Gestão DEVE permitir adicionar observações a cada item do pedido
4. QUANDO um usuário finaliza pedido, O Web App de Gestão DEVE exibir resumo com valor total e opções de pagamento
5. QUANDO pedido é confirmado, O Web App de Gestão DEVE enviar à API e exibir número do pedido para o cliente

### Requirement 8 - Visualização de Comandas

**User Story:** Como um administrador, eu quero visualizar comandas abertas em tempo real, para que possa acompanhar o atendimento.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de comandas, O Web App de Gestão DEVE exibir grid com todas as comandas abertas
2. O Web App de Gestão DEVE exibir para cada comanda: número da mesa, garçom, tempo de abertura e valor atual
3. QUANDO um usuário clica em uma comanda, O Web App de Gestão DEVE exibir detalhes com todos os pedidos e status
4. O Web App de Gestão DEVE atualizar lista de comandas via WebSocket quando houver mudanças
5. O Web App de Gestão DEVE permitir filtrar comandas por garçom ou mesa

### Requirement 9 - Gestão de Mesas

**User Story:** Como um administrador, eu quero gerenciar mesas do estabelecimento, para que possam ser utilizadas no atendimento.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de mesas, O Web App de Gestão DEVE exibir grid visual com todas as mesas
2. O Web App de Gestão DEVE exibir status de cada mesa com cores distintas (verde=disponível, vermelho=ocupada, amarelo=reservada)
3. QUANDO um usuário cria nova mesa, O Web App de Gestão DEVE validar número único e capacidade mínima de 1 pessoa
4. QUANDO um usuário clica em mesa ocupada, O Web App de Gestão DEVE exibir detalhes da comanda associada
5. O Web App de Gestão DEVE permitir alterar status de mesa manualmente

### Requirement 10 - Relatórios Gerenciais

**User Story:** Como um administrador, eu quero gerar relatórios gerenciais, para que possa analisar o desempenho do negócio.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de relatórios, O Web App de Gestão DEVE exibir opções de relatórios disponíveis
2. QUANDO um usuário seleciona relatório de vendas, O Web App de Gestão DEVE exibir filtros de período e tipo
3. O Web App de Gestão DEVE exibir gráficos interativos de vendas por período, categoria e produto
4. O Web App de Gestão DEVE calcular e exibir métricas como ticket médio, total de vendas e crescimento percentual
5. O Web App de Gestão DEVE permitir exportar relatórios em formato PDF e CSV

### Requirement 11 - Configurações do Estabelecimento

**User Story:** Como um administrador, eu quero configurar dados do estabelecimento, para que o sistema reflita informações corretas.

#### Acceptance Criteria

1. QUANDO um usuário acessa página de configurações, O Web App de Gestão DEVE exibir formulário com dados do estabelecimento
2. O Web App de Gestão DEVE validar formato de CNPJ (14 dígitos) antes de enviar à API
3. QUANDO um usuário faz upload de logotipo, O Web App de Gestão DEVE validar formato (JPEG/PNG) e tamanho máximo (2MB)
4. O Web App de Gestão DEVE exibir preview do logotipo antes de confirmar upload
5. QUANDO usuário salva configurações, O Web App de Gestão DEVE exibir mensagem de sucesso

### Requirement 12 - Interface Responsiva

**User Story:** Como um usuário, eu quero acessar o sistema de qualquer dispositivo, para que possa gerenciar o estabelecimento de forma flexível.

#### Acceptance Criteria

1. O Web App de Gestão DEVE adaptar layout para telas de desktop (>1024px), tablet (768-1024px) e mobile (< 768px)
2. QUANDO acessado em mobile, O Web App de Gestão DEVE exibir menu hamburguer para navegação
3. O Web App de Gestão DEVE manter funcionalidades principais acessíveis em todos os tamanhos de tela
4. O Web App de Gestão DEVE usar componentes touch-friendly em dispositivos móveis
5. O Web App de Gestão DEVE carregar imagens otimizadas baseado no tamanho da tela

### Requirement 13 - Validação e Feedback

**User Story:** Como um usuário, eu quero receber feedback claro sobre minhas ações, para que possa usar o sistema com confiança.

#### Acceptance Criteria

1. QUANDO um usuário submete formulário com erros, O Web App de Gestão DEVE exibir mensagens de erro específicas em cada campo inválido
2. QUANDO uma operação é bem-sucedida, O Web App de Gestão DEVE exibir notificação toast com mensagem de sucesso
3. QUANDO uma requisição à API falha, O Web App de Gestão DEVE exibir mensagem de erro amigável
4. O Web App de Gestão DEVE exibir loading spinner durante requisições assíncronas
5. O Web App de Gestão DEVE desabilitar botões de submit durante processamento para evitar duplo clique

### Requirement 14 - Performance e Otimização

**User Story:** Como um usuário, eu quero que o web app seja rápido e responsivo, para que possa trabalhar com eficiência.

#### Acceptance Criteria

1. O Web App de Gestão DEVE carregar página inicial em tempo máximo de 2 segundos em conexão 3G
2. O Web App de Gestão DEVE implementar lazy loading de imagens de produtos
3. O Web App de Gestão DEVE implementar code splitting para reduzir bundle inicial
4. O Web App de Gestão DEVE cachear requisições de listagem usando React Query ou similar
5. O Web App de Gestão DEVE implementar debounce em campos de busca com delay de 300ms
