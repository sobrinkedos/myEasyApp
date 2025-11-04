# Requirements Document - Web App de Autoatendimento

## Introduction

Este documento especifica os requisitos para o Web App de Autoatendimento, uma aplicação web progressiva (PWA) que permite aos clientes visualizar o cardápio, fazer pedidos e acompanhar o status diretamente de seus dispositivos móveis via QR Code na mesa.

## Glossary

- **Autoatendimento**: Sistema que permite cliente fazer pedidos sem intermediação de garçom
- **QR Code**: Código bidimensional escaneado pelo cliente para acessar cardápio
- **PWA**: Progressive Web App, aplicação web que funciona como app nativo
- **Cliente**: Pessoa que utiliza o sistema para fazer pedidos
- **Carrinho**: Lista temporária de produtos selecionados antes de confirmar pedido
- **Web App de Autoatendimento**: Aplicação web para clientes fazerem pedidos

## Requirements

### Requirement 1 - Acesso via QR Code

**User Story:** Como um cliente, eu quero escanear QR Code na mesa, para que possa acessar o cardápio rapidamente.

#### Acceptance Criteria

1. QUANDO um cliente escaneia QR Code da mesa, O Web App de Autoatendimento DEVE abrir automaticamente no navegador
2. O Web App de Autoatendimento DEVE identificar número da mesa através de parâmetro na URL
3. QUANDO mesa não possui comanda aberta, O Web App de Autoatendimento DEVE criar comanda automaticamente
4. QUANDO mesa já possui comanda aberta, O Web App de Autoatendimento DEVE carregar comanda existente
5. O Web App de Autoatendimento DEVE funcionar sem necessidade de instalação ou cadastro

### Requirement 2 - Visualização do Cardápio

**User Story:** Como um cliente, eu quero visualizar o cardápio completo, para que possa escolher o que desejo pedir.

#### Acceptance Criteria

1. QUANDO cliente acessa o app, O Web App de Autoatendimento DEVE exibir cardápio organizado por categorias
2. O Web App de Autoatendimento DEVE exibir imagem, nome, descrição e preço de cada produto
3. O Web App de Autoatendimento DEVE indicar produtos indisponíveis com overlay e texto "Indisponível"
4. O Web App de Autoatendimento DEVE permitir filtrar produtos por categoria
5. O Web App de Autoatendimento DEVE implementar busca de produtos por nome

### Requirement 3 - Seleção de Produtos

**User Story:** Como um cliente, eu quero adicionar produtos ao carrinho, para que possa montar meu pedido.

#### Acceptance Criteria

1. QUANDO cliente toca em produto, O Web App de Autoatendimento DEVE exibir modal com detalhes e botão "Adicionar"
2. O Web App de Autoatendimento DEVE permitir selecionar quantidade do produto
3. O Web App de Autoatendimento DEVE permitir adicionar observações ao item (ex: "sem cebola")
4. QUANDO cliente confirma adição, O Web App de Autoatendimento DEVE adicionar item ao carrinho e exibir feedback visual
5. O Web App de Autoatendimento DEVE exibir badge com número de itens no ícone do carrinho

### Requirement 4 - Gestão do Carrinho

**User Story:** Como um cliente, eu quero gerenciar itens do carrinho, para que possa revisar meu pedido antes de confirmar.

#### Acceptance Criteria

1. QUANDO cliente acessa carrinho, O Web App de Autoatendimento DEVE exibir lista de itens com imagem, nome, quantidade e preço
2. O Web App de Autoatendimento DEVE permitir alterar quantidade de cada item
3. O Web App de Autoatendimento DEVE permitir remover itens do carrinho
4. O Web App de Autoatendimento DEVE calcular e exibir subtotal, taxa de serviço e total
5. O Web App de Autoatendimento DEVE manter carrinho persistido no localStorage

### Requirement 5 - Confirmação de Pedido

**User Story:** Como um cliente, eu quero confirmar meu pedido, para que seja enviado à cozinha.

#### Acceptance Criteria

1. QUANDO cliente toca "Confirmar Pedido", O Web App de Autoatendimento DEVE exibir resumo com todos os itens e valor total
2. O Web App de Autoatendimento DEVE validar que carrinho não está vazio
3. QUANDO cliente confirma, O Web App de Autoatendimento DEVE enviar pedido à API e limpar carrinho
4. QUANDO pedido é criado com sucesso, O Web App de Autoatendimento DEVE exibir mensagem "Pedido enviado!" com número do pedido
5. O Web App de Autoatendimento DEVE exibir tempo estimado de preparo

### Requirement 6 - Acompanhamento de Pedidos

**User Story:** Como um cliente, eu quero acompanhar o status dos meus pedidos, para que saiba quando estarão prontos.

#### Acceptance Criteria

1. QUANDO cliente acessa aba "Meus Pedidos", O Web App de Autoatendimento DEVE exibir lista de pedidos da comanda
2. O Web App de Autoatendimento DEVE exibir status de cada pedido (Pendente, Em Preparo, Pronto, Entregue)
3. O Web App de Autoatendimento DEVE usar cores e ícones para indicar status visualmente
4. O Web App de Autoatendimento DEVE atualizar status em tempo real via WebSocket
5. QUANDO pedido fica pronto, O Web App de Autoatendimento DEVE exibir notificação "Seu pedido está pronto!"

### Requirement 7 - Solicitação de Atendimento

**User Story:** Como um cliente, eu quero chamar o garçom quando necessário, para que possa solicitar ajuda.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE exibir botão fixo "Chamar Garçom" em todas as telas
2. QUANDO cliente toca "Chamar Garçom", O Web App de Autoatendimento DEVE enviar notificação ao garçom responsável
3. O Web App de Autoatendimento DEVE exibir confirmação "Garçom chamado!"
4. O Web App de Autoatendimento DEVE desabilitar botão por 2 minutos após uso para evitar spam
5. O Web App de Autoatendimento DEVE incluir número da mesa na notificação

### Requirement 8 - Solicitação de Conta

**User Story:** Como um cliente, eu quero solicitar a conta, para que possa efetuar o pagamento.

#### Acceptance Criteria

1. QUANDO cliente toca "Solicitar Conta", O Web App de Autoatendimento DEVE validar que não há pedidos pendentes
2. QUANDO existem pedidos não entregues, O Web App de Autoatendimento DEVE exibir alerta "Aguarde a entrega dos pedidos"
3. QUANDO validação passa, O Web App de Autoatendimento DEVE exibir resumo da conta com todos os pedidos e total
4. QUANDO cliente confirma, O Web App de Autoatendimento DEVE fechar comanda e notificar garçom
5. O Web App de Autoatendimento DEVE exibir QR Code para pagamento digital

### Requirement 9 - Interface Responsiva e Acessível

**User Story:** Como um cliente, eu quero uma interface fácil de usar, para que possa fazer pedidos sem dificuldade.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE adaptar layout para diferentes tamanhos de tela mobile
2. O Web App de Autoatendimento DEVE usar fontes legíveis com tamanho mínimo de 16px
3. O Web App de Autoatendimento DEVE implementar contraste adequado para acessibilidade (WCAG AA)
4. O Web App de Autoatendimento DEVE usar botões grandes e espaçados para facilitar toque
5. O Web App de Autoatendimento DEVE suportar zoom sem quebrar layout



### Requirement 10 - Multilíngue

**User Story:** Como um cliente estrangeiro, eu quero visualizar o cardápio no meu idioma, para que possa entender as opções.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE detectar idioma do navegador automaticamente
2. O Web App de Autoatendimento DEVE suportar no mínimo português, inglês e espanhol
3. O Web App de Autoatendimento DEVE exibir seletor de idioma no menu
4. QUANDO cliente altera idioma, O Web App de Autoatendimento DEVE traduzir interface e nomes de categorias
5. O Web App de Autoatendimento DEVE manter idioma selecionado em localStorage

### Requirement 11 - Avaliação e Feedback

**User Story:** Como um cliente, eu quero avaliar minha experiência, para que o estabelecimento possa melhorar.

#### Acceptance Criteria

1. QUANDO comanda é fechada, O Web App de Autoatendimento DEVE exibir modal de avaliação
2. O Web App de Autoatendimento DEVE permitir avaliar atendimento com estrelas (1-5)
3. O Web App de Autoatendimento DEVE permitir adicionar comentário opcional
4. QUANDO cliente submete avaliação, O Web App de Autoatendimento DEVE enviar à API
5. O Web App de Autoatendimento DEVE permitir pular avaliação

### Requirement 12 - Informações Nutricionais

**User Story:** Como um cliente, eu quero visualizar informações nutricionais dos produtos, para que possa fazer escolhas informadas.

#### Acceptance Criteria

1. QUANDO cliente toca em produto, O Web App de Autoatendimento DEVE exibir informações nutricionais quando disponíveis
2. O Web App de Autoatendimento DEVE exibir calorias, proteínas, carboidratos e gorduras
3. O Web App de Autoatendimento DEVE indicar alergênicos presentes no produto
4. O Web App de Autoatendimento DEVE exibir ícones para restrições alimentares (vegetariano, vegano, sem glúten)
5. O Web App de Autoatendimento DEVE permitir filtrar produtos por restrição alimentar

### Requirement 13 - Progressive Web App (PWA)

**User Story:** Como um cliente, eu quero que o app funcione offline e seja rápido, para que possa usar mesmo com conexão ruim.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE implementar Service Worker para cache de assets
2. O Web App de Autoatendimento DEVE funcionar offline para visualização de cardápio já carregado
3. O Web App de Autoatendimento DEVE exibir indicador quando estiver offline
4. O Web App de Autoatendimento DEVE permitir adicionar à tela inicial do dispositivo
5. O Web App de Autoatendimento DEVE carregar em menos de 3 segundos em conexão 3G

### Requirement 14 - Segurança e Privacidade

**User Story:** Como um cliente, eu quero que meus dados estejam seguros, para que possa usar o sistema com confiança.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE usar HTTPS para todas as comunicações
2. O Web App de Autoatendimento DEVE não solicitar dados pessoais desnecessários
3. O Web App de Autoatendimento DEVE limpar dados da sessão ao fechar comanda
4. O Web App de Autoatendimento DEVE validar token de mesa para evitar acesso não autorizado
5. O Web App de Autoatendimento DEVE implementar rate limiting para prevenir abuso

### Requirement 15 - Performance e Otimização

**User Story:** Como um cliente, eu quero que o app seja rápido, para que possa fazer pedidos sem demora.

#### Acceptance Criteria

1. O Web App de Autoatendimento DEVE implementar lazy loading de imagens
2. O Web App de Autoatendimento DEVE comprimir imagens para tamanho otimizado mobile
3. O Web App de Autoatendimento DEVE implementar skeleton screens durante carregamento
4. O Web App de Autoatendimento DEVE cachear cardápio com TTL de 5 minutos
5. O Web App de Autoatendimento DEVE ter bundle JavaScript menor que 200KB gzipped
