# Sistema de Controle de Acesso - Documento de Requisitos

## Introdução

Este documento especifica os requisitos para o Sistema de Controle de Acesso e Permissões, um módulo crítico que gerencia autenticação, autorização, perfis de usuário e segmentação de acesso baseada em funções (RBAC - Role-Based Access Control). O sistema garante que cada tipo de usuário tenha acesso apenas às funcionalidades apropriadas ao seu papel no estabelecimento.

## Glossário

- **RBAC**: Role-Based Access Control - controle de acesso baseado em funções
- **Função (Role)**: Conjunto de permissões associadas a um tipo de usuário
- **Permissão (Permission)**: Autorização para executar uma ação específica em um recurso
- **Recurso (Resource)**: Entidade do sistema que pode ser acessada (produtos, vendas, caixa, etc.)
- **Ação (Action)**: Operação que pode ser realizada em um recurso (criar, ler, atualizar, deletar)
- **Perfil de Usuário**: Conjunto de informações e configurações de um usuário
- **Sessão**: Período de tempo em que um usuário está autenticado
- **Token JWT**: JSON Web Token usado para autenticação stateless
- **Multi-tenancy**: Capacidade de isolar dados entre diferentes estabelecimentos
- **Trilha de Auditoria**: Registro de todas as ações realizadas por usuários
- **Autenticação de Dois Fatores (2FA)**: Autenticação em dois fatores para segurança adicional

## Requisitos

### Requisito 1 - Definição de Funções

**História de Usuário:** Como administrador do sistema, eu quero definir diferentes funções de usuário, para que possa controlar o acesso às funcionalidades.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE suportar as seguintes funções padrão: SUPER_ADMIN, ADMIN, MANAGER, SUPERVISOR, CASH_OPERATOR, WAITER, KITCHEN, TREASURER, DELIVERY, CUSTOMER
2. QUANDO administrador cria nova função customizada, O Sistema de Controle de Acesso DEVE permitir definir nome, descrição e permissões associadas
3. O Sistema de Controle de Acesso DEVE permitir hierarquia de funções onde função superior herda permissões de funções inferiores
4. O Sistema de Controle de Acesso DEVE armazenar funções no banco de dados com flag de sistema (não editável) ou customizada
5. QUANDO função é deletada, O Sistema de Controle de Acesso DEVE validar que não existem usuários ativos com essa função

### Requisito 2 - Definição de Permissões

**História de Usuário:** Como administrador, eu quero definir permissões granulares, para que possa controlar exatamente o que cada função pode fazer.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE definir permissões no formato "recurso:ação" (ex: "products:create", "sales:read")
2. O Sistema de Controle de Acesso DEVE suportar ações padrão: create, read, update, delete, list, export
3. O Sistema de Controle de Acesso DEVE permitir permissões especiais como "cash:reopen", "reports:financial", "users:manage"
4. QUANDO permissão é verificada, O Sistema de Controle de Acesso DEVE considerar hierarquia de funções
5. O Sistema de Controle de Acesso DEVE permitir permissões condicionais baseadas em contexto (ex: "sales:cancel" apenas para vendas do próprio usuário)

### Requisito 3 - Gestão de Usuários

**História de Usuário:** Como administrador, eu quero gerenciar usuários do estabelecimento, para que possa controlar quem tem acesso ao sistema.

#### Critérios de Aceitação

1. QUANDO administrador cria novo usuário, O Sistema de Controle de Acesso DEVE solicitar nome, email, senha, função e estabelecimento
2. O Sistema de Controle de Acesso DEVE validar que email é único dentro do estabelecimento
3. QUANDO usuário é criado, O Sistema de Controle de Acesso DEVE enviar email de boas-vindas com link para ativação
4. O Sistema de Controle de Acesso DEVE permitir desativar usuário sem deletar histórico
5. O Sistema de Controle de Acesso DEVE registrar data de criação, última modificação e último acesso

### Requisito 4 - Autenticação

**História de Usuário:** Como usuário, eu quero fazer login de forma segura, para que possa acessar o sistema.

#### Critérios de Aceitação

1. QUANDO usuário submete credenciais válidas, O Sistema de Controle de Acesso DEVE gerar token JWT com validade de 24 horas
2. O Sistema de Controle de Acesso DEVE incluir no token: userId, email, roles, establishmentId e permissions
3. QUANDO usuário submete credenciais inválidas, O Sistema de Controle de Acesso DEVE incrementar contador de tentativas falhas
4. SE usuário atinge 5 tentativas falhas, ENTÃO O Sistema de Controle de Acesso DEVE bloquear conta por 30 minutos
5. QUANDO usuário faz login com sucesso, O Sistema de Controle de Acesso DEVE registrar IP, user agent e timestamp

### Requisito 5 - Autenticação de Dois Fatores (2FA)

**História de Usuário:** Como usuário com acesso a dados sensíveis, eu quero habilitar autenticação de dois fatores, para que minha conta seja mais segura.

#### Critérios de Aceitação

1. ONDE usuário tem função ADMIN, MANAGER ou TREASURER, O Sistema de Controle de Acesso DEVE exigir 2FA obrigatório
2. QUANDO usuário habilita 2FA, O Sistema de Controle de Acesso DEVE gerar QR code para configuração em app autenticador
3. QUANDO usuário faz login com 2FA habilitado, O Sistema de Controle de Acesso DEVE solicitar código de 6 dígitos
4. O Sistema de Controle de Acesso DEVE validar código TOTP com janela de tolerância de 30 segundos
5. QUANDO usuário perde acesso ao 2FA, O Sistema de Controle de Acesso DEVE permitir recuperação via códigos de backup

### Requisito 6 - Autorização de Requisições

**História de Usuário:** Como sistema, eu quero validar permissões em cada requisição, para que apenas usuários autorizados possam executar ações.

#### Critérios de Aceitação

1. QUANDO requisição é recebida, O Sistema de Controle de Acesso DEVE validar token JWT no header Authorization
2. QUANDO token é válido, O Sistema de Controle de Acesso DEVE extrair permissões e anexar ao contexto da requisição
3. QUANDO endpoint requer permissão específica, O Sistema de Controle de Acesso DEVE verificar se usuário possui permissão
4. SE usuário não possui permissão, ENTÃO O Sistema de Controle de Acesso DEVE retornar erro 403 Forbidden
5. O Sistema de Controle de Acesso DEVE registrar tentativas de acesso não autorizado em log de auditoria

### Requisito 7 - Multi-tenancy e Isolamento de Dados

**História de Usuário:** Como sistema multi-estabelecimento, eu quero garantir isolamento de dados, para que cada estabelecimento acesse apenas seus próprios dados.

#### Critérios de Aceitação

1. QUANDO usuário faz login, O Sistema de Controle de Acesso DEVE incluir establishmentId no token JWT
2. QUANDO query é executada, O Sistema de Controle de Acesso DEVE adicionar filtro automático por establishmentId
3. ONDE usuário tem função SUPER_ADMIN, O Sistema de Controle de Acesso DEVE permitir acesso a múltiplos estabelecimentos
4. O Sistema de Controle de Acesso DEVE validar que usuário não pode acessar dados de outro estabelecimento
5. O Sistema de Controle de Acesso DEVE registrar violações de isolamento em log de segurança

### Requisito 8 - Perfis de Usuário

**História de Usuário:** Como usuário, eu quero gerenciar meu perfil, para que possa manter minhas informações atualizadas.

#### Critérios de Aceitação

1. QUANDO usuário acessa perfil, O Sistema de Controle de Acesso DEVE exibir nome, email, foto, telefone e função
2. O Sistema de Controle de Acesso DEVE permitir usuário alterar nome, foto e telefone
3. QUANDO usuário altera email, O Sistema de Controle de Acesso DEVE enviar confirmação para novo email
4. QUANDO usuário altera senha, O Sistema de Controle de Acesso DEVE exigir senha atual para confirmação
5. O Sistema de Controle de Acesso DEVE validar força da nova senha (mínimo 8 caracteres, maiúscula, minúscula, número, especial)

### Requisito 9 - Recuperação de Senha

**História de Usuário:** Como usuário que esqueceu a senha, eu quero recuperar acesso à minha conta, para que possa voltar a usar o sistema.

#### Critérios de Aceitação

1. QUANDO usuário solicita recuperação, O Sistema de Controle de Acesso DEVE enviar email com link de redefinição
2. O Sistema de Controle de Acesso DEVE gerar token de recuperação com validade de 1 hora
3. QUANDO usuário acessa link válido, O Sistema de Controle de Acesso DEVE permitir definir nova senha
4. QUANDO senha é redefinida, O Sistema de Controle de Acesso DEVE invalidar todos os tokens JWT existentes
5. O Sistema de Controle de Acesso DEVE notificar usuário por email sobre alteração de senha

### Requisito 10 - Gestão de Sessões

**História de Usuário:** Como usuário, eu quero gerenciar minhas sessões ativas, para que possa controlar onde estou logado.

#### Critérios de Aceitação

1. QUANDO usuário faz login, O Sistema de Controle de Acesso DEVE criar registro de sessão com informações do dispositivo
2. O Sistema de Controle de Acesso DEVE permitir usuário visualizar todas as sessões ativas
3. O Sistema de Controle de Acesso DEVE exibir para cada sessão: dispositivo, navegador, IP, localização aproximada e data de login
4. O Sistema de Controle de Acesso DEVE permitir usuário encerrar sessão específica remotamente
5. QUANDO usuário encerra sessão, O Sistema de Controle de Acesso DEVE invalidar token JWT correspondente



### Requisito 11 - Permissões por Função (SUPER_ADMIN)

**História de Usuário:** Como super administrador, eu quero ter acesso total ao sistema, para que possa gerenciar todos os estabelecimentos.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a SUPER_ADMIN todas as permissões do sistema
2. O Sistema de Controle de Acesso DEVE permitir SUPER_ADMIN acessar dados de qualquer estabelecimento
3. O Sistema de Controle de Acesso DEVE permitir SUPER_ADMIN criar, editar e deletar estabelecimentos
4. O Sistema de Controle de Acesso DEVE permitir SUPER_ADMIN gerenciar funções e permissões globais
5. O Sistema de Controle de Acesso DEVE registrar todas as ações de SUPER_ADMIN em log especial de auditoria

### Requisito 12 - Permissões por Função (ADMIN)

**História de Usuário:** Como administrador do estabelecimento, eu quero gerenciar todos os aspectos do meu estabelecimento, para que possa operar o negócio.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a ADMIN permissões: users:*, products:*, categories:*, ingredients:*, stock:*, sales:*, cash:*, reports:*, establishment:update
2. O Sistema de Controle de Acesso DEVE restringir ADMIN ao seu estabelecimento apenas
3. O Sistema de Controle de Acesso DEVE permitir ADMIN criar e gerenciar usuários do estabelecimento
4. O Sistema de Controle de Acesso DEVE permitir ADMIN configurar parâmetros do estabelecimento
5. O Sistema de Controle de Acesso DEVE exigir 2FA para ADMIN

### Requisito 13 - Permissões por Função (MANAGER)

**História de Usuário:** Como gerente, eu quero acessar relatórios e supervisionar operações, para que possa tomar decisões gerenciais.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a MANAGER permissões: products:read, sales:*, cash:read, reports:*, stock:read, users:read
2. O Sistema de Controle de Acesso DEVE permitir MANAGER visualizar todos os relatórios gerenciais
3. O Sistema de Controle de Acesso DEVE permitir MANAGER supervisionar caixas e vendas
4. O Sistema de Controle de Acesso DEVE permitir MANAGER exportar relatórios
5. O Sistema de Controle de Acesso DEVE exigir 2FA para MANAGER

### Requisito 14 - Permissões por Função (SUPERVISOR)

**História de Usuário:** Como supervisor, eu quero autorizar operações especiais, para que possa dar suporte aos operadores.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a SUPERVISOR permissões: sales:cancel, cash:reopen, cash:authorize, products:read, stock:read
2. O Sistema de Controle de Acesso DEVE permitir SUPERVISOR cancelar vendas
3. O Sistema de Controle de Acesso DEVE permitir SUPERVISOR reabrir caixas fechados
4. O Sistema de Controle de Acesso DEVE permitir SUPERVISOR autorizar sangrias e suprimentos acima do limite
5. O Sistema de Controle de Acesso DEVE registrar todas as autorizações de SUPERVISOR

### Requisito 15 - Permissões por Função (CASH_OPERATOR)

**História de Usuário:** Como operador de caixa, eu quero operar o caixa e registrar vendas, para que possa atender clientes.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a CASH_OPERATOR permissões: cash:open, cash:close, cash:withdrawal, cash:supply, sales:create, sales:read, products:read
2. O Sistema de Controle de Acesso DEVE permitir CASH_OPERATOR abrir e fechar seu próprio caixa
3. O Sistema de Controle de Acesso DEVE permitir CASH_OPERATOR registrar vendas no balcão
4. O Sistema de Controle de Acesso DEVE permitir CASH_OPERATOR realizar sangrias e suprimentos dentro do limite
5. O Sistema de Controle de Acesso DEVE restringir CASH_OPERATOR a visualizar apenas seu próprio caixa

### Requisito 16 - Permissões por Função (WAITER)

**História de Usuário:** Como garçom, eu quero gerenciar comandas e pedidos, para que possa atender as mesas.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a WAITER permissões: orders:*, tables:read, products:read, customers:read
2. O Sistema de Controle de Acesso DEVE permitir WAITER criar e gerenciar pedidos
3. O Sistema de Controle de Acesso DEVE permitir WAITER visualizar comandas abertas
4. O Sistema de Controle de Acesso DEVE permitir WAITER fechar comandas
5. O Sistema de Controle de Acesso DEVE restringir WAITER a visualizar apenas suas próprias comandas

### Requisito 17 - Permissões por Função (KITCHEN)

**História de Usuário:** Como cozinheiro, eu quero visualizar pedidos da cozinha, para que possa preparar os pratos.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a KITCHEN permissões: orders:read, orders:update-status, products:read
2. O Sistema de Controle de Acesso DEVE permitir KITCHEN visualizar pedidos pendentes
3. O Sistema de Controle de Acesso DEVE permitir KITCHEN atualizar status de preparação
4. O Sistema de Controle de Acesso DEVE permitir KITCHEN marcar itens como prontos
5. O Sistema de Controle de Acesso DEVE restringir KITCHEN a não visualizar valores financeiros

### Requisito 18 - Permissões por Função (TREASURER)

**História de Usuário:** Como tesoureiro, eu quero gerenciar recebimentos e consolidação financeira, para que possa controlar o fluxo de caixa.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a TREASURER permissões: treasury:*, cash:read, reports:financial
2. O Sistema de Controle de Acesso DEVE permitir TREASURER confirmar recebimentos de caixas
3. O Sistema de Controle de Acesso DEVE permitir TREASURER visualizar consolidação diária
4. O Sistema de Controle de Acesso DEVE permitir TREASURER gerar relatórios financeiros
5. O Sistema de Controle de Acesso DEVE exigir 2FA para TREASURER

### Requisito 19 - Permissões por Função (DELIVERY)

**História de Usuário:** Como entregador, eu quero visualizar e atualizar entregas, para que possa realizar as entregas.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a DELIVERY permissões: deliveries:read, deliveries:update-status
2. O Sistema de Controle de Acesso DEVE permitir DELIVERY visualizar entregas atribuídas
3. O Sistema de Controle de Acesso DEVE permitir DELIVERY atualizar status de entrega
4. O Sistema de Controle de Acesso DEVE permitir DELIVERY confirmar entrega realizada
5. O Sistema de Controle de Acesso DEVE restringir DELIVERY a visualizar apenas suas próprias entregas

### Requisito 20 - Permissões por Função (CUSTOMER)

**História de Usuário:** Como cliente, eu quero fazer pedidos e acompanhar meu histórico, para que possa usar o sistema de auto-atendimento.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE conceder a CUSTOMER permissões: orders:create, orders:read-own, products:read, profile:update
2. O Sistema de Controle de Acesso DEVE permitir CUSTOMER criar pedidos
3. O Sistema de Controle de Acesso DEVE permitir CUSTOMER visualizar apenas seus próprios pedidos
4. O Sistema de Controle de Acesso DEVE permitir CUSTOMER atualizar seu perfil
5. O Sistema de Controle de Acesso DEVE restringir CUSTOMER a não acessar dados de outros clientes

### Requisito 21 - Auditoria de Acesso

**História de Usuário:** Como auditor, eu quero rastrear todas as ações de usuários, para que possa garantir conformidade e segurança.

#### Critérios de Aceitação

1. O Sistema de Controle de Acesso DEVE registrar log para todas as ações que modificam dados
2. O Sistema de Controle de Acesso DEVE armazenar em log: userId, action, resource, timestamp, IP, user agent, dados anteriores e novos
3. O Sistema de Controle de Acesso DEVE registrar tentativas de acesso não autorizado
4. O Sistema de Controle de Acesso DEVE permitir busca de logs por usuário, ação, recurso e período
5. O Sistema de Controle de Acesso DEVE manter logs por período mínimo de 5 anos

### Requisito 22 - Delegação de Permissões

**História de Usuário:** Como gerente, eu quero delegar permissões temporárias, para que possa dar acesso especial quando necessário.

#### Critérios de Aceitação

1. ONDE usuário tem permissão "permissions:delegate", O Sistema de Controle de Acesso DEVE permitir conceder permissões temporárias
2. QUANDO permissão é delegada, O Sistema de Controle de Acesso DEVE solicitar data de expiração obrigatória
3. O Sistema de Controle de Acesso DEVE validar que usuário só pode delegar permissões que ele próprio possui
4. QUANDO permissão temporária expira, O Sistema de Controle de Acesso DEVE remover automaticamente
5. O Sistema de Controle de Acesso DEVE notificar usuário quando permissão delegada está próxima de expirar

### Requisito 23 - Notificações de Segurança

**História de Usuário:** Como usuário, eu quero ser notificado sobre eventos de segurança, para que possa proteger minha conta.

#### Critérios de Aceitação

1. QUANDO login é realizado de novo dispositivo, O Sistema de Controle de Acesso DEVE enviar notificação por email
2. QUANDO senha é alterada, O Sistema de Controle de Acesso DEVE enviar notificação por email
3. QUANDO tentativas de login falhas atingem limite, O Sistema de Controle de Acesso DEVE enviar alerta
4. QUANDO 2FA é desabilitado, O Sistema de Controle de Acesso DEVE enviar notificação por email
5. QUANDO permissões são alteradas, O Sistema de Controle de Acesso DEVE notificar usuário afetado

## Requisitos Não-Funcionais

### Segurança

**RNF-01:** O Sistema de Controle de Acesso DEVE armazenar senhas usando bcrypt com salt factor mínimo de 10

**RNF-02:** O Sistema de Controle de Acesso DEVE usar tokens JWT assinados com algoritmo RS256

**RNF-03:** O Sistema de Controle de Acesso DEVE implementar rate limiting de 100 requisições por minuto por IP

**RNF-04:** O Sistema de Controle de Acesso DEVE usar HTTPS obrigatório para todas as comunicações

**RNF-05:** O Sistema de Controle de Acesso DEVE implementar proteção contra CSRF em todas as operações de escrita

### Performance

**RNF-06:** QUANDO sistema valida permissões, O Sistema de Controle de Acesso DEVE completar verificação em menos que 50ms

**RNF-07:** O Sistema de Controle de Acesso DEVE cachear permissões de usuário por 5 minutos

**RNF-08:** O Sistema de Controle de Acesso DEVE suportar 1000 usuários simultâneos sem degradação

### Confiabilidade

**RNF-09:** O Sistema de Controle de Acesso DEVE garantir disponibilidade de 99,9%

**RNF-10:** O Sistema de Controle de Acesso DEVE manter logs de auditoria em storage redundante

### Conformidade

**RNF-11:** O Sistema de Controle de Acesso DEVE estar em conformidade com LGPD (Lei Geral de Proteção de Dados)

**RNF-12:** O Sistema de Controle de Acesso DEVE permitir exportação de dados pessoais mediante solicitação

**RNF-13:** O Sistema de Controle de Acesso DEVE permitir exclusão de dados pessoais mediante solicitação (direito ao esquecimento)

## Modelos de Dados

### Usuário (User)
```typescript
{
  id: string
  email: string
  password: string (hash)
  name: string
  phone: string
  photo: string
  establishmentId: string
  roles: Role[]
  isActive: boolean
  emailVerified: boolean
  twoFactorEnabled: boolean
  twoFactorSecret: string
  backupCodes: string[]
  failedLoginAttempts: number
  lockedUntil: timestamp
  lastLoginAt: timestamp
  lastLoginIp: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Função (Role)
```typescript
{
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: Permission[]
  parentRoleId: string
  establishmentId: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Permissão (Permission)
```typescript
{
  id: string
  resource: string
  action: string
  conditions: json
  description: string
}
```

### Sessão (Session)
```typescript
{
  id: string
  userId: string
  token: string
  device: string
  browser: string
  ipAddress: string
  location: string
  expiresAt: timestamp
  createdAt: timestamp
}
```

### Log de Auditoria (AuditLog)
```typescript
{
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  previousState: json
  newState: json
  ipAddress: string
  userAgent: string
  timestamp: timestamp
}
```

## Regras de Negócio

**RN-01:** Usuário deve ter pelo menos uma função ativa

**RN-02:** Email deve ser único dentro do estabelecimento

**RN-03:** Senha deve ter mínimo 8 caracteres com maiúscula, minúscula, número e caractere especial

**RN-04:** Token JWT expira após 24 horas de inatividade

**RN-05:** Conta é bloqueada após 5 tentativas de login falhas

**RN-06:** 2FA é obrigatório para funções ADMIN, MANAGER e TREASURER

**RN-07:** Permissões temporárias não podem exceder 30 dias

**RN-08:** Logs de auditoria são imutáveis e mantidos por 5 anos

**RN-09:** SUPER_ADMIN não pode ser desativado se for o único no sistema

**RN-10:** Usuário não pode alterar suas próprias permissões
