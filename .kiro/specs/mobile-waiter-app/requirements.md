# Requirements Document - App Mobile de Atendimento

## Introduction

Este documento especifica os requisitos para o App Mobile de Atendimento, uma aplicação nativa para tablets e smartphones utilizada por garçons para gerenciar mesas, criar pedidos e acompanhar o status em tempo real.

## Glossary

- **App de Atendimento**: Aplicação mobile nativa para garçons
- **Garçom**: Funcionário que utiliza o app para atender mesas
- **Notificação Push**: Alerta enviado ao dispositivo mesmo com app em background
- **Modo Offline**: Capacidade de funcionar sem conexão com internet
- **Sincronização**: Processo de enviar dados locais para servidor quando conexão é restabelecida
- **Cardápio Digital**: Visualização de produtos disponíveis no app

## Requirements

### Requirement 1 - Autenticação Mobile

**User Story:** Como um garçom, eu quero fazer login no app com minhas credenciais, para que possa acessar minhas funcionalidades.

#### Acceptance Criteria

1. QUANDO um garçom abre o app pela primeira vez, O App de Atendimento DEVE exibir tela de login
2. QUANDO um garçom submete credenciais válidas, O App de Atendimento DEVE armazenar token JWT de forma segura e navegar para tela principal
3. QUANDO um garçom marca opção "Manter conectado", O App de Atendimento DEVE manter sessão ativa por 30 dias
4. QUANDO token expira, O App de Atendimento DEVE redirecionar para login com mensagem "Sessão expirada"
5. O App de Atendimento DEVE suportar autenticação biométrica (impressão digital/Face ID) após primeiro login

### Requirement 2 - Visualização de Mesas

**User Story:** Como um garçom, eu quero visualizar o status de todas as mesas, para que possa gerenciar meu atendimento.

#### Acceptance Criteria

1. QUANDO um garçom acessa tela principal, O App de Atendimento DEVE exibir grid visual com todas as mesas
2. O App de Atendimento DEVE exibir status de cada mesa com cores distintas (verde=disponível, vermelho=ocupada, amarelo=reservada)
3. QUANDO um garçom toca em mesa disponível, O App de Atendimento DEVE exibir opção "Abrir Comanda"
4. QUANDO um garçom toca em mesa ocupada, O App de Atendimento DEVE exibir detalhes da comanda
5. O App de Atendimento DEVE atualizar status das mesas em tempo real via WebSocket

### Requirement 3 - Abertura de Comanda

**User Story:** Como um garçom, eu quero abrir comandas para mesas, para que possa iniciar o atendimento.

#### Acceptance Criteria

1. QUANDO um garçom seleciona mesa disponível e toca "Abrir Comanda", O App de Atendimento DEVE exibir formulário com número de pessoas
2. QUANDO um garçom confirma abertura, O App de Atendimento DEVE enviar requisição à API e exibir mensagem de sucesso
3. O App de Atendimento DEVE associar garçom automaticamente à comanda baseado no usuário logado
4. QUANDO abertura falha, O App de Atendimento DEVE exibir mensagem de erro e permitir tentar novamente
5. O App de Atendimento DEVE navegar automaticamente para tela de pedidos após abrir comanda

### Requirement 4 - Criação de Pedidos

**User Story:** Como um garçom, eu quero adicionar pedidos a uma comanda, para que possa registrar solicitações do cliente.

#### Acceptance Criteria

1. QUANDO um garçom acessa comanda aberta, O App de Atendimento DEVE exibir botão "Novo Pedido"
2. QUANDO um garçom toca "Novo Pedido", O App de Atendimento DEVE exibir cardápio digital com categorias e produtos
3. O App de Atendimento DEVE permitir buscar produtos por nome
4. QUANDO um garçom seleciona produto, O App de Atendimento DEVE exibir modal para definir quantidade e observações
5. QUANDO um garçom confirma pedido, O App de Atendimento DEVE enviar à API e exibir confirmação visual

### Requirement 5 - Cardápio Digital

**User Story:** Como um garçom, eu quero visualizar o cardápio completo no app, para que possa apresentar opções ao cliente.

#### Acceptance Criteria

1. QUANDO um garçom acessa cardápio, O App de Atendimento DEVE exibir produtos organizados por categoria
2. O App de Atendimento DEVE exibir imagem, nome, descrição e preço de cada produto
3. O App de Atendimento DEVE indicar visualmente produtos indisponíveis por falta de estoque
4. O App de Atendimento DEVE permitir filtrar produtos por categoria
5. O App de Atendimento DEVE cachear cardápio localmente para acesso rápido

### Requirement 6 - Acompanhamento de Pedidos

**User Story:** Como um garçom, eu quero acompanhar o status dos pedidos, para que possa informar o cliente.

#### Acceptance Criteria

1. QUANDO um garçom visualiza comanda, O App de Atendimento DEVE exibir lista de todos os pedidos com status
2. O App de Atendimento DEVE usar cores para indicar status (cinza=pendente, amarelo=em preparo, verde=pronto, azul=entregue)
3. QUANDO status de pedido muda, O App de Atendimento DEVE atualizar interface em tempo real
4. QUANDO um garçom toca em pedido pronto, O App de Atendimento DEVE exibir opção "Marcar como Entregue"
5. O App de Atendimento DEVE exibir tempo decorrido desde criação do pedido

### Requirement 7 - Notificações Push

**User Story:** Como um garçom, eu quero receber notificações quando pedidos ficarem prontos, para que possa servir rapidamente.

#### Acceptance Criteria

1. QUANDO pedido de comanda do garçom fica pronto, O App de Atendimento DEVE exibir notificação push com número da mesa
2. QUANDO garçom toca na notificação, O App de Atendimento DEVE navegar para detalhes da comanda
3. O App de Atendimento DEVE reproduzir som ao receber notificação de pedido pronto
4. O App de Atendimento DEVE exibir badge com número de pedidos prontos não entregues
5. O App de Atendimento DEVE permitir desabilitar notificações nas configurações

### Requirement 8 - Fechamento de Comanda

**User Story:** Como um garçom, eu quero fechar comandas, para que o cliente possa efetuar pagamento.

#### Acceptance Criteria

1. QUANDO um garçom visualiza comanda e toca "Fechar Comanda", O App de Atendimento DEVE validar que todos os pedidos foram entregues
2. QUANDO existem pedidos não entregues, O App de Atendimento DEVE exibir alerta "Existem pedidos pendentes"
3. QUANDO validação passa, O App de Atendimento DEVE exibir resumo com valor total e taxa de serviço
4. QUANDO garçom confirma fechamento, O App de Atendimento DEVE enviar requisição à API
5. O App de Atendimento DEVE exibir comprovante digital com QR code para pagamento



### Requirement 9 - Cancelamento de Pedidos

**User Story:** Como um garçom, eu quero cancelar pedidos quando necessário, para que possa corrigir erros.

#### Acceptance Criteria

1. QUANDO um garçom toca em pedido pendente e seleciona "Cancelar", O App de Atendimento DEVE exibir modal para informar motivo
2. O App de Atendimento DEVE validar que motivo foi informado antes de permitir cancelamento
3. QUANDO garçom confirma cancelamento, O App de Atendimento DEVE enviar requisição à API
4. QUANDO pedido já está em preparo, O App de Atendimento DEVE exibir confirmação adicional "Pedido já está sendo preparado. Confirma cancelamento?"
5. O App de Atendimento DEVE atualizar valor total da comanda após cancelamento

### Requirement 10 - Modo Offline

**User Story:** Como um garçom, eu quero que o app funcione sem internet, para que possa trabalhar mesmo com conexão instável.

#### Acceptance Criteria

1. QUANDO conexão com internet é perdida, O App de Atendimento DEVE exibir indicador de modo offline
2. QUANDO em modo offline, O App de Atendimento DEVE permitir visualizar comandas e pedidos já carregados
3. QUANDO garçom cria pedido em modo offline, O App de Atendimento DEVE armazenar localmente com status "pendente sincronização"
4. QUANDO conexão é restabelecida, O App de Atendimento DEVE sincronizar automaticamente pedidos pendentes
5. O App de Atendimento DEVE exibir notificação quando sincronização for concluída

### Requirement 11 - Histórico de Comandas

**User Story:** Como um garçom, eu quero consultar histórico de comandas, para que possa revisar atendimentos anteriores.

#### Acceptance Criteria

1. QUANDO um garçom acessa histórico, O App de Atendimento DEVE exibir lista de comandas fechadas ordenadas por data
2. O App de Atendimento DEVE permitir filtrar por período (hoje, semana, mês)
3. QUANDO garçom toca em comanda do histórico, O App de Atendimento DEVE exibir detalhes completos
4. O App de Atendimento DEVE exibir total de vendas do garçom no período selecionado
5. O App de Atendimento DEVE implementar paginação com scroll infinito

### Requirement 12 - Modificação de Pedidos

**User Story:** Como um garçom, eu quero modificar pedidos antes da preparação, para que possa atender solicitações do cliente.

#### Acceptance Criteria

1. QUANDO garçom toca em pedido pendente e seleciona "Editar", O App de Atendimento DEVE exibir lista de itens
2. O App de Atendimento DEVE permitir adicionar novos itens ao pedido
3. O App de Atendimento DEVE permitir remover itens do pedido
4. QUANDO pedido já está em preparo, O App de Atendimento DEVE exibir mensagem "Pedido em preparo não pode ser modificado"
5. O App de Atendimento DEVE recalcular e exibir novo valor total após modificações

### Requirement 13 - Interface Intuitiva

**User Story:** Como um garçom, eu quero uma interface simples e rápida, para que possa atender clientes com eficiência.

#### Acceptance Criteria

1. O App de Atendimento DEVE usar gestos nativos (swipe, long-press) para ações rápidas
2. O App de Atendimento DEVE exibir ações principais com no máximo 2 toques de distância
3. O App de Atendimento DEVE usar ícones intuitivos e cores consistentes
4. O App de Atendimento DEVE exibir feedback visual imediato para todas as ações
5. O App de Atendimento DEVE suportar modo escuro para uso em ambientes com pouca luz

### Requirement 14 - Performance Mobile

**User Story:** Como um garçom, eu quero que o app seja rápido e fluido, para que possa trabalhar sem interrupções.

#### Acceptance Criteria

1. O App de Atendimento DEVE iniciar em tempo máximo de 3 segundos
2. O App de Atendimento DEVE renderizar listas com virtualização para suportar centenas de itens
3. O App de Atendimento DEVE cachear imagens de produtos localmente
4. O App de Atendimento DEVE manter animações a 60 FPS
5. O App de Atendimento DEVE consumir máximo de 100MB de memória RAM em uso normal

### Requirement 15 - Segurança Mobile

**User Story:** Como um administrador, eu quero que o app seja seguro, para que dados sensíveis estejam protegidos.

#### Acceptance Criteria

1. O App de Atendimento DEVE armazenar token JWT em keychain/keystore seguro do sistema
2. O App de Atendimento DEVE limpar dados sensíveis ao fazer logout
3. O App de Atendimento DEVE bloquear screenshots em telas com informações sensíveis
4. O App de Atendimento DEVE implementar timeout de sessão após 30 minutos de inatividade
5. O App de Atendimento DEVE validar certificado SSL em todas as requisições HTTPS
