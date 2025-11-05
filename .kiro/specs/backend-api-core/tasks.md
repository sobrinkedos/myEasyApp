# Implementation Plan - Backend API Core

- [x] 1. Configurar estrutura inicial do projeto


  - Inicializar projeto Node.js com TypeScript
  - Configurar tsconfig.json com strict mode e paths
  - Instalar dependências principais (Express, Prisma, Redis, JWT, Zod, etc.)
  - Criar estrutura de diretórios (src/config, controllers, services, repositories, models, middlewares, utils, routes)
  - Configurar ESLint e Prettier para padronização de código
  - _Requirements: 11.1, 11.2_



- [x] 2. Configurar Docker e ambientes

  - Criar Dockerfile com multi-stage build (builder e production)
  - Criar docker-compose.yml para ambiente de desenvolvimento com PostgreSQL, Redis e API
  - Criar docker-compose.prod.yml para ambiente de produção com configurações otimizadas
  - Criar arquivos .env.development e .env.production.example com todas as variáveis necessárias



  - Adicionar .dockerignore para otimizar build
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 3. Configurar banco de dados e Prisma

  - Criar schema Prisma com todos os models (User, Category, Product, Ingredient, ProductIngredient, StockTransaction, Establishment, AuditLog)
  - Adicionar índices estratégicos nos models para otimização de queries


  - Configurar connection string e pool de conexões
  - Criar migration inicial do banco de dados
  - Implementar seed script para dados iniciais (usuário admin, categorias básicas)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 9.1_



- [x] 4. Implementar sistema de autenticação

- [x] 4.1 Criar módulo de autenticação base

  - Implementar AuthService com métodos login, validateToken e hashPassword usando bcrypt
  - Criar AuthController com endpoint POST /auth/login
  - Implementar geração de JWT com payload contendo userId, email e role
  - Configurar tempo de expiração de token (24h)
  - _Requirements: 1.1, 1.5_

- [x] 4.2 Criar middleware de autenticação

  - Implementar AuthMiddleware para validar JWT em requisições protegidas
  - Adicionar verificação de token expirado e retornar erro 401
  - Adicionar verificação de token ausente e retornar erro 401
  - Anexar dados do usuário ao objeto request para uso nos controllers



  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 4.3 Criar testes de autenticação
  - Escrever testes unitários para AuthService (login válido, credenciais inválidas, hash de senha)
  - Escrever testes de integração para endpoint de login
  - Testar middleware de autenticação com tokens válidos, inválidos e expirados
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 5. Implementar gestão de categorias

- [x] 5.1 Criar módulo de categorias

  - Implementar CategoryRepository com métodos CRUD usando Prisma


  - Implementar CategoryService com lógica de negócio e validação de nome duplicado
  - Criar CategoryController com endpoints REST (GET, POST, PUT, DELETE)
  - Implementar validação com Zod para criação e atualização de categorias
  - Adicionar ordenação por displayOrder nas listagens
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ]* 5.2 Criar testes de categorias
  - Escrever testes unitários para CategoryService
  - Escrever testes de integração para endpoints de categorias
  - Testar validação de nome duplicado e retorno de erro 409
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [x] 6. Implementar gestão de produtos

- [x] 6.1 Criar módulo de produtos base

  - Implementar ProductRepository com métodos CRUD e paginação
  - Implementar ProductService com validações de preço e campos obrigatórios
  - Criar ProductController com endpoints REST (GET, POST, PUT, DELETE)
  - Implementar validação com Zod para criação e atualização de produtos
  - Adicionar filtro por categoria e status ativo nas listagens
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 10.3_

- [x] 6.2 Implementar upload de imagens de produtos

  - Configurar multer para upload de arquivos
  - Implementar validação de tipo MIME (JPEG, PNG) e tamanho máximo (5MB)


  - Criar endpoint POST /products/:id/image para upload
  - Gerar nomes únicos para arquivos usando UUID
  - Armazenar caminho da imagem no banco de dados
  - _Requirements: 2.4_

- [x] 6.3 Implementar cache de produtos


  - Adicionar cache Redis nas listagens de produtos
  - Implementar invalidação de cache ao criar, atualizar ou deletar produto
  - Configurar TTL de 5 minutos para cache de produtos
  - _Requirements: 10.4_

- [ ]* 6.4 Criar testes de produtos
  - Escrever testes unitários para ProductService
  - Escrever testes de integração para endpoints de produtos
  - Testar validações de preço negativo e campos obrigatórios
  - Testar upload de imagens com arquivos válidos e inválidos
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Implementar gestão de insumos

- [x] 7.1 Criar módulo de insumos


  - Implementar IngredientRepository com métodos CRUD
  - Implementar IngredientService com validação de unidades de medida
  - Criar IngredientController com endpoints REST
  - Implementar validação com Zod incluindo enum de unidades (kg, g, l, ml, un)
  - Adicionar lógica para marcar status "Estoque Baixo" quando quantidade atinge mínimo
  - _Requirements: 3.1, 3.2, 3.3, 3.5_


- [x] 7.2 Implementar vínculo de insumos a produtos

  - Criar endpoint POST /ingredients/:id/link-product para vincular insumo a produto
  - Implementar lógica no ProductService para gerenciar receitas (ProductIngredient)
  - Validar que produto e insumo existem antes de criar vínculo
  - Permitir especificar quantidade de insumo necessária por produto
  - _Requirements: 3.4_

- [ ]* 7.3 Criar testes de insumos
  - Escrever testes unitários para IngredientService
  - Escrever testes de integração para endpoints de insumos
  - Testar validação de unidades de medida
  - Testar vínculo de insumos a produtos
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_




- [x] 8. Implementar controle de estoque

- [x] 8.1 Criar módulo de transações de estoque

  - Implementar StockRepository com métodos para criar transações e consultar histórico
  - Implementar StockService com lógica de entrada e saída de estoque
  - Validar quantidade suficiente antes de permitir saída de estoque
  - Atualizar currentQuantity do insumo ao registrar transação
  - Registrar userId, data/hora e tipo de operação em cada transação
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8.2 Criar endpoints de estoque

  - Criar StockController com endpoint POST /stock/transactions
  - Implementar endpoint GET /stock/transactions com paginação e filtros


  - Adicionar validação com Zod para criação de transações
  - Implementar ordenação por data decrescente no histórico
  - _Requirements: 4.1, 4.2, 4.5_

- [ ]* 8.3 Criar testes de estoque
  - Escrever testes unitários para StockService

  - Testar validação de quantidade insuficiente
  - Testar atualização correta de currentQuantity
  - Escrever testes de integração para endpoints de estoque
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_




- [x] 9. Implementar relatórios de estoque



- [x] 9.1 Criar endpoints de relatórios

  - Implementar endpoint GET /stock/report para relatório de estoque atual
  - Implementar endpoint GET /stock/report/low para insumos com estoque baixo
  - Implementar endpoint GET /stock/report/movement com filtro de período
  - Adicionar cálculo de valor total do estoque baseado em averageCost
  - Implementar exportação em formato JSON e CSV
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 9.2 Criar testes de relatórios
  - Escrever testes de integração para endpoints de relatórios
  - Testar filtros de período e status
  - Testar cálculo de valor total do estoque
  - Testar exportação em diferentes formatos
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [ ] 10. Implementar gestão de estabelecimento
- [x] 10.1 Criar módulo de estabelecimento

  - Implementar EstablishmentRepository com métodos de leitura e atualização
  - Implementar EstablishmentService com validação de CNPJ
  - Criar EstablishmentController com endpoints GET e PUT
  - Implementar validação com Zod para dados do estabelecimento e endereço
  - Adicionar validação de formato de CNPJ (14 dígitos)
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 10.2 Implementar upload de logotipo

  - Configurar endpoint POST /establishment/logo para upload
  - Implementar validação de tipo MIME e tamanho máximo (2MB)
  - Armazenar caminho do logotipo no banco de dados
  - _Requirements: 9.3_

- [x] 10.3 Implementar auditoria de alterações

  - Criar função auditLog para registrar alterações no estabelecimento
  - Registrar userId, data/hora e campos alterados em AuditLog
  - Chamar auditLog ao atualizar dados do estabelecimento
  - _Requirements: 9.5_

- [ ]* 10.4 Criar testes de estabelecimento
  - Escrever testes unitários para EstablishmentService
  - Testar validação de CNPJ
  - Escrever testes de integração para endpoints
  - Testar upload de logotipo
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_



- [ ] 11. Implementar segurança e middlewares
- [x] 11.1 Criar middleware de tratamento de erros

  - Implementar classes de erro customizadas (AppError, ValidationError, AuthenticationError, etc.)
  - Criar errorHandler middleware centralizado
  - Implementar padrão de resposta consistente para erros
  - Adicionar logging de erros não operacionais
  - _Requirements: 7.2_

- [x] 11.2 Implementar validação e sanitização

  - Criar middleware de validação usando Zod
  - Implementar sanitização de inputs para prevenir SQL Injection e XSS
  - Adicionar validação de tipos e formatos em todos os endpoints
  - _Requirements: 7.2_

- [x] 11.3 Implementar rate limiting

  - Configurar express-rate-limit com 100 requisições por minuto por IP
  - Aplicar rate limiting em todas as rotas /api
  - Implementar mensagem de erro customizada para limite excedido
  - _Requirements: 7.3_

- [x] 11.4 Configurar headers de segurança

  - Instalar e configurar helmet para headers de segurança
  - Configurar Content Security Policy
  - Configurar HSTS para HTTPS obrigatório em produção
  - _Requirements: 7.1_

- [x] 11.5 Implementar logging estruturado

  - Configurar winston para logging estruturado
  - Criar logs de autenticação, criação, atualização e exclusão
  - Separar logs de erro em arquivo específico
  - Adicionar timestamp e nível de log em todas as entradas
  - _Requirements: 7.4_

- [ ]* 11.6 Criar testes de segurança
  - Testar rate limiting com múltiplas requisições
  - Testar validação de inputs maliciosos
  - Testar headers de segurança nas respostas
  - Testar middleware de erro com diferentes tipos de erro
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Implementar documentação OpenAPI

- [x] 12.1 Configurar Swagger


  - Instalar swagger-jsdoc e swagger-ui-express
  - Configurar definição OpenAPI 3.0 com informações da API
  - Adicionar configuração de segurança (bearerAuth)
  - Criar endpoint /api/docs para documentação interativa
  - _Requirements: 6.4_

- [x] 12.2 Documentar endpoints

  - Adicionar anotações JSDoc em todos os controllers
  - Documentar schemas de request e response
  - Documentar códigos de status HTTP e mensagens de erro
  - Adicionar exemplos de requisições e respostas
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 13. Implementar otimizações de performance

- [x] 13.1 Configurar Redis e caching


  - Configurar conexão com Redis usando ioredis
  - Implementar funções helper cacheGet e cacheSet
  - Adicionar cache em listagens de produtos e categorias
  - Implementar invalidação de cache nas operações de escrita
  - _Requirements: 10.4_

- [x] 13.2 Implementar paginação

  - Criar função helper paginate genérica
  - Aplicar paginação em todos os endpoints de listagem
  - Configurar limite padrão de 50 itens por página
  - Retornar metadados de paginação (total, totalPages, page, limit)
  - _Requirements: 10.3_


- [x] 13.3 Otimizar queries do banco


  - Adicionar índices nos campos mais consultados
  - Usar select para buscar apenas campos necessários
  - Implementar eager loading com include onde apropriado
  - Evitar N+1 queries em relacionamentos
  - _Requirements: 10.1_


- [x] 13.4 Implementar compression


  - Configurar middleware compression para respostas HTTP
  - Configurar nível de compressão adequado (6)
  - Adicionar filtro para não comprimir requisições específicas
  - _Requirements: 10.2_



- [ ] 14. Implementar health check e graceful shutdown
- [x] 14.1 Criar endpoint de health check

  - Implementar endpoint GET /health com status da aplicação
  - Verificar conectividade com PostgreSQL
  - Verificar conectividade com Redis
  - Retornar status 200 se tudo OK, 503 se algum serviço está degradado
  - Incluir uptime e timestamp na resposta
  - _Requirements: 11.7_

- [x] 14.2 Implementar graceful shutdown

  - Adicionar listeners para sinais SIGTERM e SIGINT
  - Parar de aceitar novas conexões ao receber sinal
  - Aguardar finalização de requisições em andamento (max 30s)
  - Fechar conexões de banco e Redis antes de encerrar
  - Adicionar logging de cada etapa do shutdown
  - _Requirements: 11.8_

- [x] 15. Configurar rotas e aplicação principal

- [x] 15.1 Criar sistema de rotas


  - Criar arquivos de rotas para cada módulo (auth, products, categories, ingredients, stock, establishment)
  - Implementar versionamento de API com prefixo /api/v1
  - Aplicar middleware de autenticação nas rotas protegidas
  - Organizar rotas por recurso de forma RESTful
  - _Requirements: 6.1, 6.5_


- [x] 15.2 Configurar aplicação Express

  - Criar arquivo app.ts com inicialização do Express
  - Configurar middlewares globais (helmet, compression, cors, rate-limit)
  - Configurar parsing de JSON e URL-encoded
  - Registrar todas as rotas
  - Adicionar middleware de erro no final da cadeia
  - Configurar servidor para escutar na porta configurada
  - _Requirements: 6.1, 6.5, 7.1, 7.3_

- [x] 16. Criar scripts e configurações finais

- [x] 16.1 Criar scripts npm

  - Adicionar script "dev" para desenvolvimento com hot-reload (ts-node-dev)
  - Adicionar script "build" para compilar TypeScript
  - Adicionar script "start:prod" para executar versão compilada
  - Adicionar script "test" para executar testes com Jest
  - Adicionar script "test:coverage" para relatório de cobertura
  - Adicionar script "prisma:migrate" para migrations
  - Adicionar script "prisma:seed" para popular banco
  - _Requirements: 11.1, 11.2_


- [x] 16.2 Criar documentação do projeto

  - Criar README.md com instruções de instalação e execução
  - Documentar variáveis de ambiente necessárias
  - Adicionar instruções para rodar com Docker
  - Documentar comandos principais (build, test, migrate)
  - Adicionar seção de arquitetura e estrutura do projeto
  - _Requirements: 6.4, 11.1, 11.2_

- [ ]* 16.3 Configurar testes E2E
  - Criar setup de testes E2E com banco de teste
  - Implementar testes de fluxos críticos (login → criar produto → registrar estoque)
  - Configurar limpeza de banco entre testes


  - Adicionar script "test:e2e" no package.json
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 17. Validação final e ajustes
- [x] 17.1 Testar aplicação completa


  - Executar aplicação com Docker Compose em ambiente de desenvolvimento
  - Testar todos os endpoints via Swagger UI
  - Verificar logs e tratamento de erros
  - Validar performance de endpoints com múltiplas requisições
  - Testar health check e graceful shutdown
  - _Requirements: 10.1, 10.2, 10.5, 11.7, 11.8_


- [x] 17.2 Revisar segurança e conformidade

  - Verificar que todas as senhas estão sendo hasheadas
  - Confirmar que HTTPS está configurado para produção
  - Validar que não há secrets commitados no repositório
  - Testar rate limiting e proteção contra ataques
  - Revisar logs de auditoria
  - _Requirements: 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17.3 Preparar para deploy


  - Criar arquivo .env.production.example com todas as variáveis
  - Documentar processo de deploy em README
  - Testar build de imagem Docker para produção
  - Validar que docker-compose.prod.yml está configurado corretamente
  - Criar checklist de deploy (migrations, seeds, variáveis de ambiente)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
