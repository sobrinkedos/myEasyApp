# Requirements Document - App de Delivery

## Introduction

Este documento especifica os requisitos para o App de Delivery, uma aplicação mobile nativa que permite clientes fazerem pedidos para entrega em domicílio, acompanharem o status e rastrearem a entrega em tempo real.

## Glossary

- **App de Delivery**: Aplicação mobile para pedidos com entrega
- **Cliente**: Pessoa que faz pedidos para entrega
- **Entregador**: Pessoa responsável por entregar pedidos
- **Endereço de Entrega**: Local onde pedido será entregue
- **Taxa de Entrega**: Valor cobrado pelo serviço de entrega
- **Rastreamento**: Acompanhamento em tempo real da localização do entregador
- **Pedido de Delivery**: Pedido com entrega em domicílio

## Requirements

### Requirement 1 - Cadastro e Autenticação

**User Story:** Como um cliente, eu quero criar conta no app, para que possa fazer pedidos de delivery.

#### Acceptance Criteria

1. QUANDO um cliente abre o app pela primeira vez, O App de Delivery DEVE exibir opções "Criar Conta" e "Entrar"
2. QUANDO cliente seleciona "Criar Conta", O App de Delivery DEVE solicitar nome, email, telefone e senha
3. O App de Delivery DEVE validar formato de email e telefone antes de enviar à API
4. QUANDO cadastro é bem-sucedido, O App de Delivery DEVE fazer login automaticamente
5. O App de Delivery DEVE permitir login com Google e Facebook

### Requirement 2 - Gestão de Endereços

**User Story:** Como um cliente, eu quero cadastrar múltiplos endereços, para que possa escolher onde receber o pedido.

#### Acceptance Criteria

1. QUANDO cliente acessa "Meus Endereços", O App de Delivery DEVE exibir lista de endereços cadastrados
2. QUANDO cliente adiciona novo endereço, O App de Delivery DEVE solicitar CEP, rua, número, complemento, bairro e cidade
3. O App de Delivery DEVE buscar dados do endereço automaticamente ao informar CEP válido
4. O App de Delivery DEVE permitir marcar um endereço como "Principal"
5. O App de Delivery DEVE validar que endereço está dentro da área de entrega do estabelecimento

### Requirement 3 - Seleção de Estabelecimento

**User Story:** Como um cliente, eu quero escolher o estabelecimento, para que possa fazer pedido no restaurante desejado.

#### Acceptance Criteria

1. QUANDO cliente acessa tela inicial, O App de Delivery DEVE exibir lista de estabelecimentos disponíveis
2. O App de Delivery DEVE exibir foto, nome, avaliação e tempo estimado de entrega de cada estabelecimento
3. O App de Delivery DEVE permitir buscar estabelecimentos por nome ou tipo de comida
4. O App de Delivery DEVE filtrar estabelecimentos que atendem o endereço selecionado
5. O App de Delivery DEVE exibir status "Aberto" ou "Fechado" baseado no horário de funcionamento

### Requirement 4 - Visualização do Cardápio

**User Story:** Como um cliente, eu quero visualizar o cardápio do estabelecimento, para que possa escolher o que pedir.

#### Acceptance Criteria

1. QUANDO cliente seleciona estabelecimento, O App de Delivery DEVE exibir cardápio organizado por categorias
2. O App de Delivery DEVE exibir imagem, nome, descrição e preço de cada produto
3. O App de Delivery DEVE indicar produtos indisponíveis
4. O App de Delivery DEVE permitir filtrar por categoria e buscar por nome
5. O App de Delivery DEVE exibir tempo estimado de preparo do estabelecimento

### Requirement 5 - Montagem do Pedido

**User Story:** Como um cliente, eu quero adicionar produtos ao carrinho, para que possa montar meu pedido.

#### Acceptance Criteria

1. QUANDO cliente toca em produto, O App de Delivery DEVE exibir detalhes com opção de adicionar ao carrinho
2. O App de Delivery DEVE permitir selecionar quantidade e adicionar observações
3. QUANDO cliente adiciona item, O App de Delivery DEVE exibir feedback visual e atualizar badge do carrinho
4. O App de Delivery DEVE calcular subtotal dos itens em tempo real
5. O App de Delivery DEVE manter carrinho persistido localmente

### Requirement 6 - Revisão e Checkout

**User Story:** Como um cliente, eu quero revisar meu pedido antes de finalizar, para que possa confirmar todos os detalhes.

#### Acceptance Criteria

1. QUANDO cliente acessa carrinho, O App de Delivery DEVE exibir lista de itens com preços
2. O App de Delivery DEVE exibir endereço de entrega selecionado com opção de alterar
3. O App de Delivery DEVE calcular e exibir subtotal, taxa de entrega e total
4. O App de Delivery DEVE permitir adicionar cupom de desconto
5. QUANDO cliente toca "Finalizar Pedido", O App de Delivery DEVE navegar para tela de pagamento

### Requirement 7 - Pagamento

**User Story:** Como um cliente, eu quero escolher forma de pagamento, para que possa pagar pelo pedido.

#### Acceptance Criteria

1. QUANDO cliente acessa pagamento, O App de Delivery DEVE exibir opções disponíveis (cartão, PIX, dinheiro)
2. QUANDO cliente seleciona cartão, O App de Delivery DEVE permitir cadastrar novo cartão ou usar salvo
3. O App de Delivery DEVE validar dados do cartão antes de processar
4. QUANDO cliente seleciona PIX, O App de Delivery DEVE gerar QR Code para pagamento
5. QUANDO cliente seleciona dinheiro, O App de Delivery DEVE solicitar valor para troco

### Requirement 8 - Confirmação de Pedido

**User Story:** Como um cliente, eu quero receber confirmação do pedido, para que saiba que foi processado.

#### Acceptance Criteria

1. QUANDO pedido é criado com sucesso, O App de Delivery DEVE exibir tela de confirmação com número do pedido
2. O App de Delivery DEVE exibir tempo estimado de entrega
3. O App de Delivery DEVE enviar notificação push confirmando pedido
4. O App de Delivery DEVE limpar carrinho após confirmação
5. O App de Delivery DEVE navegar automaticamente para tela de acompanhamento



### Requirement 9 - Acompanhamento de Pedido

**User Story:** Como um cliente, eu quero acompanhar o status do meu pedido, para que saiba quando chegará.

#### Acceptance Criteria

1. QUANDO cliente acessa "Meus Pedidos", O App de Delivery DEVE exibir pedido ativo com status atual
2. O App de Delivery DEVE exibir timeline com etapas (Confirmado, Preparando, Saiu para Entrega, Entregue)
3. O App de Delivery DEVE atualizar status em tempo real via WebSocket
4. QUANDO status muda, O App de Delivery DEVE enviar notificação push ao cliente
5. O App de Delivery DEVE exibir tempo estimado restante para entrega

### Requirement 10 - Rastreamento em Tempo Real

**User Story:** Como um cliente, eu quero rastrear a localização do entregador, para que saiba quando chegará.

#### Acceptance Criteria

1. QUANDO pedido sai para entrega, O App de Delivery DEVE exibir mapa com localização do entregador
2. O App de Delivery DEVE atualizar localização do entregador a cada 10 segundos
3. O App de Delivery DEVE exibir rota estimada do entregador até o endereço
4. O App de Delivery DEVE exibir foto e nome do entregador
5. O App de Delivery DEVE permitir ligar para o entregador via botão no app

### Requirement 11 - Histórico de Pedidos

**User Story:** Como um cliente, eu quero consultar meus pedidos anteriores, para que possa repetir ou revisar.

#### Acceptance Criteria

1. QUANDO cliente acessa "Histórico", O App de Delivery DEVE exibir lista de pedidos concluídos
2. O App de Delivery DEVE exibir data, estabelecimento, itens e valor de cada pedido
3. QUANDO cliente toca em pedido do histórico, O App de Delivery DEVE exibir detalhes completos
4. O App de Delivery DEVE permitir "Pedir Novamente" adicionando itens ao carrinho
5. O App de Delivery DEVE implementar paginação com scroll infinito

### Requirement 12 - Avaliação e Feedback

**User Story:** Como um cliente, eu quero avaliar pedidos, para que possa compartilhar minha experiência.

#### Acceptance Criteria

1. QUANDO pedido é entregue, O App de Delivery DEVE solicitar avaliação após 5 minutos
2. O App de Delivery DEVE permitir avaliar estabelecimento e entregador separadamente com estrelas (1-5)
3. O App de Delivery DEVE permitir adicionar comentário e foto
4. QUANDO cliente submete avaliação, O App de Delivery DEVE enviar à API
5. O App de Delivery DEVE permitir pular avaliação

### Requirement 13 - Cupons e Promoções

**User Story:** Como um cliente, eu quero usar cupons de desconto, para que possa economizar nos pedidos.

#### Acceptance Criteria

1. QUANDO cliente acessa "Cupons", O App de Delivery DEVE exibir lista de cupons disponíveis
2. O App de Delivery DEVE exibir valor ou percentual de desconto e validade de cada cupom
3. QUANDO cliente aplica cupom no carrinho, O App de Delivery DEVE validar e calcular desconto
4. O App de Delivery DEVE exibir valor economizado no resumo do pedido
5. O App de Delivery DEVE permitir apenas um cupom por pedido

### Requirement 14 - Notificações Push

**User Story:** Como um cliente, eu quero receber notificações sobre meu pedido, para que fique informado.

#### Acceptance Criteria

1. QUANDO pedido é confirmado, O App de Delivery DEVE enviar notificação "Pedido confirmado!"
2. QUANDO pedido está sendo preparado, O App de Delivery DEVE enviar notificação "Seu pedido está sendo preparado"
3. QUANDO pedido sai para entrega, O App de Delivery DEVE enviar notificação "Pedido saiu para entrega"
4. QUANDO entregador está próximo, O App de Delivery DEVE enviar notificação "Entregador chegando em 5 minutos"
5. O App de Delivery DEVE permitir desabilitar notificações nas configurações

### Requirement 15 - Favoritos

**User Story:** Como um cliente, eu quero salvar estabelecimentos e produtos favoritos, para que possa acessar rapidamente.

#### Acceptance Criteria

1. O App de Delivery DEVE exibir ícone de coração para favoritar estabelecimentos e produtos
2. QUANDO cliente toca no coração, O App de Delivery DEVE adicionar aos favoritos e mudar cor do ícone
3. QUANDO cliente acessa "Favoritos", O App de Delivery DEVE exibir lista de estabelecimentos e produtos salvos
4. O App de Delivery DEVE sincronizar favoritos com servidor para acesso em outros dispositivos
5. O App de Delivery DEVE permitir remover itens dos favoritos

### Requirement 16 - Suporte ao Cliente

**User Story:** Como um cliente, eu quero contatar suporte quando necessário, para que possa resolver problemas.

#### Acceptance Criteria

1. O App de Delivery DEVE exibir opção "Ajuda" no menu principal
2. QUANDO cliente acessa ajuda, O App de Delivery DEVE exibir FAQ com perguntas frequentes
3. O App de Delivery DEVE permitir abrir chat com suporte
4. O App de Delivery DEVE permitir reportar problema com pedido específico
5. O App de Delivery DEVE exibir telefone de contato do estabelecimento

### Requirement 17 - Performance e Otimização

**User Story:** Como um cliente, eu quero que o app seja rápido, para que possa fazer pedidos sem demora.

#### Acceptance Criteria

1. O App de Delivery DEVE iniciar em tempo máximo de 3 segundos
2. O App de Delivery DEVE cachear cardápios localmente com TTL de 10 minutos
3. O App de Delivery DEVE implementar lazy loading de imagens
4. O App de Delivery DEVE comprimir imagens para otimizar consumo de dados
5. O App de Delivery DEVE consumir máximo de 150MB de memória RAM

### Requirement 18 - Segurança

**User Story:** Como um cliente, eu quero que meus dados estejam seguros, para que possa usar o app com confiança.

#### Acceptance Criteria

1. O App de Delivery DEVE armazenar dados sensíveis em keychain/keystore seguro
2. O App de Delivery DEVE criptografar dados de cartão antes de enviar à API
3. O App de Delivery DEVE implementar autenticação biométrica para pagamentos
4. O App de Delivery DEVE validar certificado SSL em todas as requisições
5. O App de Delivery DEVE limpar dados de pagamento após transação
