# Requirements Document - Backend API Core

## Introduction

Este documento especifica os requisitos para o módulo central do sistema integrado de restaurantes, incluindo a API RESTful escalável, autenticação, gestão de produtos, insumos e controle de estoque. Este módulo serve como fundação para todos os outros componentes do sistema (web app de gestão, apps de atendimento, delivery, etc.).

## Glossary

- **Sistema Backend**: O servidor de aplicação que expõe a API RESTful e gerencia a lógica de negócio central
- **API RESTful**: Interface de programação de aplicações que segue os princípios REST para comunicação entre cliente e servidor
- **Produto**: Item comercializável no cardápio (prato, bebida, lanche) que pode ser vendido ao cliente
- **Insumo**: Matéria-prima ou ingrediente utilizado na composição de produtos
- **Estoque**: Quantidade disponível de insumos e produtos no estabelecimento
- **Usuário Administrador**: Pessoa autorizada a gerenciar configurações do sistema, produtos e relatórios
- **Estabelecimento**: Restaurante, bar ou lanchonete que utiliza o sistema
- **Token JWT**: JSON Web Token utilizado para autenticação e autorização de requisições
- **Transação de Estoque**: Operação de entrada ou saída de insumos/produtos no estoque

## Requirements

### Requirement 1 - Autenticação e Autorização

**User Story:** Como um administrador do estabelecimento, eu quero fazer login seguro no sistema, para que apenas usuários autorizados possam acessar as funcionalidades de gestão.

#### Acceptance Criteria

1. QUANDO um usuário submete credenciais válidas (email e senha), O Sistema Backend DEVE retornar um Token JWT válido com tempo de expiração de 24 horas
2. QUANDO um usuário submete credenciais inválidas, O Sistema Backend DEVE retornar erro HTTP 401 com mensagem "Credenciais inválidas"
3. QUANDO uma requisição é recebida com Token JWT expirado, O Sistema Backend DEVE retornar erro HTTP 401 com mensagem "Token expirado"
4. QUANDO uma requisição é recebida sem Token JWT, O Sistema Backend DEVE retornar erro HTTP 401 com mensagem "Autenticação necessária"
5. O Sistema Backend DEVE criptografar senhas utilizando algoritmo bcrypt com fator de custo mínimo de 10

### Requirement 2 - Cadastro de Produtos

**User Story:** Como um administrador, eu quero cadastrar produtos no cardápio com suas informações detalhadas, para que possam ser vendidos e gerenciados no sistema.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador cria um Produto com nome, descrição, preço e categoria, O Sistema Backend DEVE persistir o Produto no banco de dados e retornar HTTP 201 com os dados do Produto criado
2. QUANDO um Usuário Administrador tenta criar um Produto sem nome obrigatório, O Sistema Backend DEVE retornar erro HTTP 400 com mensagem "Nome do produto é obrigatório"
3. QUANDO um Usuário Administrador tenta criar um Produto com preço negativo, O Sistema Backend DEVE retornar erro HTTP 400 com mensagem "Preço deve ser maior ou igual a zero"
4. O Sistema Backend DEVE permitir upload de imagem do Produto com tamanho máximo de 5MB em formatos JPEG ou PNG
5. QUANDO um Usuário Administrador atualiza informações de um Produto existente, O Sistema Backend DEVE persistir as alterações e retornar HTTP 200 com os dados atualizados

### Requirement 3 - Cadastro de Insumos

**User Story:** Como um administrador, eu quero cadastrar insumos e matérias-primas, para que possa controlar o estoque e a composição dos produtos.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador cria um Insumo com nome, unidade de medida e quantidade mínima, O Sistema Backend DEVE persistir o Insumo no banco de dados e retornar HTTP 201
2. QUANDO um Usuário Administrador tenta criar um Insumo sem unidade de medida, O Sistema Backend DEVE retornar erro HTTP 400 com mensagem "Unidade de medida é obrigatória"
3. O Sistema Backend DEVE suportar as seguintes unidades de medida: quilograma, grama, litro, mililitro, unidade
4. QUANDO um Usuário Administrador vincula Insumos a um Produto com quantidades específicas, O Sistema Backend DEVE persistir a receita do Produto
5. QUANDO a quantidade de um Insumo atinge o nível mínimo configurado, O Sistema Backend DEVE marcar o Insumo com status "Estoque Baixo"

### Requirement 4 - Controle de Estoque

**User Story:** Como um administrador, eu quero registrar entradas e saídas de estoque, para que possa manter o controle preciso das quantidades disponíveis.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador registra uma entrada de estoque com Insumo, quantidade e data, O Sistema Backend DEVE incrementar a quantidade disponível do Insumo e criar uma Transação de Estoque
2. QUANDO um Usuário Administrador registra uma saída de estoque com Insumo e quantidade, O Sistema Backend DEVE decrementar a quantidade disponível do Insumo
3. QUANDO uma saída de estoque resulta em quantidade negativa, O Sistema Backend DEVE retornar erro HTTP 400 com mensagem "Quantidade insuficiente em estoque"
4. O Sistema Backend DEVE registrar data, hora, tipo de operação e usuário responsável em cada Transação de Estoque
5. QUANDO um Usuário Administrador consulta o histórico de estoque de um Insumo, O Sistema Backend DEVE retornar todas as Transações de Estoque ordenadas por data decrescente

### Requirement 5 - Categorização de Produtos

**User Story:** Como um administrador, eu quero organizar produtos em categorias, para que o cardápio fique estruturado e fácil de navegar.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador cria uma categoria com nome e ordem de exibição, O Sistema Backend DEVE persistir a categoria e retornar HTTP 201
2. QUANDO um Usuário Administrador tenta criar uma categoria com nome duplicado, O Sistema Backend DEVE retornar erro HTTP 409 com mensagem "Categoria já existe"
3. O Sistema Backend DEVE permitir associar múltiplos Produtos a uma categoria
4. QUANDO um Usuário Administrador consulta categorias, O Sistema Backend DEVE retornar lista ordenada pela ordem de exibição configurada
5. QUANDO um Usuário Administrador desativa uma categoria, O Sistema Backend DEVE manter os Produtos associados mas ocultar a categoria das listagens ativas

### Requirement 6 - API RESTful e Documentação

**User Story:** Como um desenvolvedor de aplicações cliente, eu quero acessar uma API RESTful bem documentada, para que possa integrar facilmente os diferentes módulos do sistema.

#### Acceptance Criteria

1. O Sistema Backend DEVE expor endpoints REST seguindo convenções HTTP (GET para leitura, POST para criação, PUT para atualização, DELETE para remoção)
2. O Sistema Backend DEVE retornar respostas em formato JSON com estrutura consistente incluindo campos "success", "data" e "message"
3. QUANDO ocorre um erro de validação, O Sistema Backend DEVE retornar HTTP 400 com lista detalhada dos campos inválidos
4. O Sistema Backend DEVE incluir documentação OpenAPI 3.0 acessível via endpoint "/api/docs"
5. O Sistema Backend DEVE implementar versionamento de API com prefixo "/api/v1" em todas as rotas

### Requirement 7 - Segurança e Conformidade

**User Story:** Como um administrador, eu quero que o sistema proteja os dados sensíveis e siga boas práticas de segurança, para garantir a conformidade e proteção das informações do estabelecimento.

#### Acceptance Criteria

1. O Sistema Backend DEVE implementar HTTPS obrigatório para todas as comunicações em ambiente de produção
2. O Sistema Backend DEVE validar e sanitizar todas as entradas de usuário para prevenir injeção SQL e XSS
3. O Sistema Backend DEVE implementar rate limiting de 100 requisições por minuto por endereço IP
4. O Sistema Backend DEVE registrar logs de todas as operações de autenticação, criação, atualização e exclusão de dados
5. QUANDO um Usuário Administrador tenta acessar recurso sem permissão adequada, O Sistema Backend DEVE retornar erro HTTP 403 com mensagem "Acesso negado"

### Requirement 8 - Relatórios de Estoque

**User Story:** Como um administrador, eu quero gerar relatórios de estoque, para que possa tomar decisões informadas sobre compras e gestão de insumos.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador solicita relatório de estoque atual, O Sistema Backend DEVE retornar lista de todos os Insumos com quantidades disponíveis e status
2. QUANDO um Usuário Administrador solicita relatório de movimentação com período específico, O Sistema Backend DEVE retornar todas as Transações de Estoque no intervalo de datas fornecido
3. O Sistema Backend DEVE calcular e retornar valor total do estoque baseado no custo médio dos Insumos
4. QUANDO um Usuário Administrador solicita relatório de Insumos com estoque baixo, O Sistema Backend DEVE retornar apenas Insumos abaixo da quantidade mínima configurada
5. O Sistema Backend DEVE permitir exportação de relatórios em formato JSON e CSV

### Requirement 9 - Gestão de Estabelecimento

**User Story:** Como um administrador, eu quero configurar informações do estabelecimento, para que o sistema reflita corretamente os dados da empresa.

#### Acceptance Criteria

1. QUANDO um Usuário Administrador cadastra dados do Estabelecimento incluindo nome, CNPJ, endereço e telefone, O Sistema Backend DEVE persistir as informações e retornar HTTP 200
2. QUANDO um Usuário Administrador tenta cadastrar CNPJ inválido, O Sistema Backend DEVE retornar erro HTTP 400 com mensagem "CNPJ inválido"
3. O Sistema Backend DEVE permitir upload de logotipo do Estabelecimento com tamanho máximo de 2MB
4. O Sistema Backend DEVE armazenar configurações fiscais incluindo regime tributário e alíquotas de impostos
5. QUANDO um Usuário Administrador atualiza dados do Estabelecimento, O Sistema Backend DEVE registrar log de auditoria com data, hora e usuário responsável

### Requirement 10 - Performance e Escalabilidade

**User Story:** Como um administrador de sistema, eu quero que a API seja performática e escalável, para que possa atender múltiplos estabelecimentos simultaneamente sem degradação.

#### Acceptance Criteria

1. O Sistema Backend DEVE responder requisições de listagem de produtos em tempo máximo de 500 milissegundos para até 1000 produtos
2. O Sistema Backend DEVE suportar mínimo de 100 requisições simultâneas sem degradação de performance
3. O Sistema Backend DEVE implementar paginação em endpoints de listagem com limite padrão de 50 itens por página
4. O Sistema Backend DEVE implementar cache de consultas frequentes com tempo de expiração de 5 minutos
5. QUANDO a carga do sistema excede 80% da capacidade, O Sistema Backend DEVE registrar alerta em logs de monitoramento

### Requirement 11 - Containerização e Ambientes

**User Story:** Como um desenvolvedor ou administrador de infraestrutura, eu quero que o sistema seja containerizado com Docker, para que possa ser facilmente implantado em diferentes ambientes com configurações isoladas.

#### Acceptance Criteria

1. O Sistema Backend DEVE incluir arquivo Dockerfile que cria imagem executável da aplicação
2. O Sistema Backend DEVE incluir arquivo docker-compose.yml para ambiente de desenvolvimento com serviços de banco de dados, cache e aplicação
3. O Sistema Backend DEVE incluir arquivo docker-compose.prod.yml para ambiente de produção com configurações otimizadas de segurança e performance
4. QUANDO executado em ambiente de desenvolvimento, O Sistema Backend DEVE carregar variáveis de ambiente do arquivo .env.development
5. QUANDO executado em ambiente de produção, O Sistema Backend DEVE carregar variáveis de ambiente do arquivo .env.production
6. O Sistema Backend DEVE separar configurações sensíveis (senhas, chaves API) em variáveis de ambiente nunca commitadas no repositório
7. O Sistema Backend DEVE incluir health check endpoint "/health" que retorna HTTP 200 quando todos os serviços dependentes estão operacionais
8. O Sistema Backend DEVE implementar graceful shutdown respondendo a sinais SIGTERM com tempo máximo de 30 segundos para finalizar requisições em andamento
