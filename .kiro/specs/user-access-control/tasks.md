# Sistema de Controle de Acesso - Plano de Implementação

## Visão Geral

Este plano detalha a implementação completa do Sistema de Controle de Acesso (RBAC), incluindo autenticação, autorização, multi-tenancy, 2FA e auditoria.

---

## Fase 1: Database e Modelos (4 tasks)

### Task 1.1: Criar Schema Prisma para Usuários e Autenticação
- [ ] 1.1 Adicionar model User ao schema Prisma
  - Campos: id, email, password, name, phone, photo, establishmentId
  - Campos de segurança: twoFactorEnabled, twoFactorSecret, backupCodes
  - Campos de controle: failedLoginAttempts, lockedUntil, lastLoginAt, lastLoginIp
  - Campos de recuperação: passwordResetToken, passwordResetExpires
  - Relações: establishment, roles, sessions, auditLogs
  - Índices: [email, establishmentId], [email]
  - Constraint unique: [email, establishmentId]
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

### Task 1.2: Criar Schema Prisma para RBAC
- [ ] 1.2 Adicionar models Role, Permission, UserRole, RolePermission
  - Model Role: id, name, description, isSystem, parentRoleId, establishmentId
  - Model Permission: id, resource, action, description, conditions
  - Model UserRole: userId, roleId (many-to-many)
  - Model RolePermission: roleId, permissionId (many-to-many)
  - Model DelegatedPermission: userId, permissionId, delegatedBy, expiresAt
  - Adicionar relações e índices apropriados
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 22.1, 22.2, 22.3, 22.4, 22.5_

### Task 1.3: Criar Schema Prisma para Sessões e Auditoria
- [ ] 1.3 Adicionar models Session e AuditLog
  - Model Session: id, userId, token, device, browser, os, ipAddress, location, expiresAt
  - Model AuditLog: id, userId, action, resource, resourceId, previousState, newState, ipAddress, userAgent, timestamp
  - Adicionar índices para performance
  - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5, 21.1, 21.2, 21.3, 21.4, 21.5_

### Task 1.4: Executar Migrations e Seed
- [ ] 1.4 Gerar e aplicar migrations
  - Gerar migration do Prisma
  - Aplicar migration ao banco de dados
  - Criar seed com funções padrão (SUPER_ADMIN, ADMIN, MANAGER, etc.)
  - Criar seed com permissões padrão
  - Criar usuário SUPER_ADMIN inicial
  - _Requisitos: 1.1, 11.1, 12.1, 13.1, 14.1, 15.1, 16.1, 17.1, 18.1, 19.1, 20.1_

---

## Fase 2: Repositories (4 tasks)

### Task 2.1: Implementar User Repository
- [ ] 2.1 Criar UserRepository class
  - Método create para criar usuário
  - Método findByEmail com filtro de estabelecimento
  - Método findById com relações (roles, permissions)
  - Método update para atualizar dados
  - Método updatePassword
  - Método incrementFailedAttempts
  - Método lockAccount e unlockAccount
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

### Task 2.2: Implementar Role e Permission Repositories
- [ ] 2.2 Criar RoleRepository e PermissionRepository
  - RoleRepository: create, findById, findAll, update, delete
  - RoleRepository: findByEstablishment, findWithPermissions
  - PermissionRepository: findAll, findByResource
  - UserRoleRepository: assignRole, removeRole, findByUserId
  - RolePermissionRepository: assignPermission, removePermission, findByRoleId
  - DelegatedPermissionRepository: create, findActive, expire
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 22.1, 22.2, 22.3, 22.4, 22.5_

### Task 2.3: Implementar Session Repository
- [ ] 2.3 Criar SessionRepository class
  - Método create para criar sessão
  - Método findByToken
  - Método findByUserId (sessões ativas)
  - Método terminate para encerrar sessão
  - Método terminateAll para encerrar todas as sessões de um usuário
  - Método cleanExpired para limpar sessões expiradas
  - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

### Task 2.4: Implementar Audit Repository
- [ ] 2.4 Criar AuditLogRepository class
  - Método create para registrar log
  - Método findByFilters com paginação
  - Método findByUser
  - Método findByResource
  - Método generateReport
  - _Requisitos: 21.1, 21.2, 21.3, 21.4, 21.5_

---

## Fase 3: Services Core (6 tasks)

### Task 3.1: Implementar Auth Service - Login
- [ ] 3.1 Criar AuthService class com método login
  - Buscar usuário por email e estabelecimento
  - Verificar se conta está bloqueada
  - Validar senha com bcrypt
  - Incrementar tentativas falhas se senha inválida
  - Bloquear conta após 5 tentativas
  - Verificar 2FA se habilitado
  - Resetar tentativas falhas em login bem-sucedido
  - Gerar JWT token
  - Criar sessão
  - Registrar auditoria
  - Notificar se novo dispositivo
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, RN-04, RN-05_

### Task 3.2: Implementar Auth Service - Logout e Tokens
- [ ] 3.2 Implementar métodos de logout e refresh
  - Método logout: invalidar sessão e token
  - Método refreshToken: validar refresh token e gerar novo JWT
  - Método validateToken: verificar validade do JWT
  - Implementar geração de JWT com RS256
  - Incluir userId, email, roles, permissions, establishmentId no payload
  - Configurar expiração de 24 horas
  - _Requisitos: 4.1, 4.2, 6.1, 6.2, RN-04, RNF-02_

### Task 3.3: Implementar Auth Service - Recuperação de Senha
- [ ] 3.3 Implementar recuperação e redefinição de senha
  - Método requestPasswordReset: gerar token e enviar email
  - Token com validade de 1 hora
  - Método resetPassword: validar token e atualizar senha
  - Invalidar todos os tokens JWT ao redefinir senha
  - Método changePassword: validar senha atual e atualizar
  - Validar força da senha (8 chars, maiúscula, minúscula, número, especial)
  - Notificar usuário por email sobre alteração
  - _Requisitos: 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 23.2, RN-03_

### Task 3.4: Implementar RBAC Service
- [ ] 3.4 Criar RBACService class
  - Método checkPermission: verificar se usuário tem permissão
  - Método getUserPermissions: buscar todas as permissões do usuário
  - Método getRolePermissionsRecursive: incluir hierarquia de funções
  - Suportar permissões wildcard (products:*, *:*)
  - Suportar permissões condicionais
  - Cachear permissões por 5 minutos
  - Invalidar cache ao alterar permissões
  - Método assignRole, removeRole
  - Método delegatePermission com expiração
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5, 22.1, 22.2, 22.3, 22.4, 22.5, RNF-06, RNF-07_

### Task 3.5: Implementar 2FA Service
- [ ] 3.5 Criar TwoFactorService class
  - Método enable2FA: gerar secret TOTP e QR code
  - Gerar 10 códigos de backup
  - Método verify2FACode: validar código TOTP com janela de 30s
  - Método disable2FA: desabilitar com validação de código
  - Método regenerateBackupCodes
  - Método useBackupCode: validar e invalidar código de backup
  - Usar biblioteca speakeasy ou similar para TOTP
  - Usar biblioteca qrcode para gerar QR
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, RN-06_

### Task 3.6: Implementar Session Service
- [ ] 3.6 Criar SessionService class
  - Método createSession: criar sessão com device info
  - Extrair informações de device, browser, OS do user agent
  - Obter localização aproximada do IP (opcional)
  - Método getActiveSessions: listar sessões ativas do usuário
  - Método terminateSession: encerrar sessão específica
  - Método terminateAllSessions: encerrar todas exceto atual
  - Método cleanExpiredSessions: job para limpar sessões expiradas
  - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Fase 4: Services Auxiliares (3 tasks)

### Task 4.1: Implementar Audit Service
- [ ] 4.1 Criar AuditService class
  - Método log: registrar ação de auditoria
  - Capturar userId, action, resource, resourceId
  - Capturar previousState e newState para alterações
  - Capturar ipAddress e userAgent
  - Método getAuditTrail: buscar logs com filtros
  - Método getUserActions: histórico de ações do usuário
  - Método getResourceHistory: histórico de um recurso
  - Método generateAuditReport: gerar relatório PDF/Excel
  - Garantir imutabilidade dos logs
  - _Requisitos: 21.1, 21.2, 21.3, 21.4, 21.5, RN-08, RNF-10_

### Task 4.2: Implementar Tenant Service
- [ ] 4.2 Criar TenantService class
  - Método validateTenantAccess: verificar se usuário pode acessar tenant
  - Método getCurrentTenant: obter tenant do contexto
  - Método switchTenant: trocar tenant (apenas SUPER_ADMIN)
  - Implementar Prisma middleware para filtro automático
  - Adicionar filtro de establishmentId em queries
  - Adicionar establishmentId em creates
  - Registrar violações de isolamento
  - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_

### Task 4.3: Implementar Notification Service
- [ ] 4.3 Criar NotificationService class
  - Método sendNewDeviceAlert: notificar login de novo dispositivo
  - Método sendPasswordChangedAlert: notificar alteração de senha
  - Método sendAccountLockedAlert: notificar bloqueio de conta
  - Método send2FADisabledAlert: notificar desabilitação de 2FA
  - Método sendPermissionChangedAlert: notificar alteração de permissões
  - Método sendPasswordResetEmail: enviar link de recuperação
  - Usar template de emails
  - _Requisitos: 9.1, 9.5, 23.1, 23.2, 23.3, 23.4, 23.5_

---

## Fase 5: Middlewares (3 tasks)

### Task 5.1: Implementar Auth Middleware
- [ ] 5.1 Criar AuthMiddleware
  - Extrair token do header Authorization
  - Validar token JWT
  - Verificar se token não expirou
  - Verificar se sessão ainda está ativa
  - Anexar dados do usuário ao request
  - Retornar 401 se não autenticado
  - Registrar tentativas de acesso não autorizado
  - _Requisitos: 6.1, 6.2, 6.5, RNF-01, RNF-02_

### Task 5.2: Implementar Permission Middleware
- [ ] 5.2 Criar PermissionMiddleware
  - Decorator @RequirePermission(permission: string)
  - Verificar se usuário tem permissão necessária
  - Usar RBACService.checkPermission
  - Retornar 403 Forbidden se não autorizado
  - Registrar tentativas de acesso negado em auditoria
  - Suportar múltiplas permissões (OR/AND)
  - _Requisitos: 6.3, 6.4, 6.5, 18.1, 18.2, 18.3, 18.4, 18.5_

### Task 5.3: Implementar Tenant Middleware
- [ ] 5.3 Criar TenantMiddleware
  - Extrair establishmentId do token JWT
  - Anexar tenantId ao contexto da requisição
  - Validar se não está tentando acessar outro tenant
  - Permitir acesso multi-tenant para SUPER_ADMIN
  - Registrar violações de isolamento
  - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_

---

## Fase 6: Controllers e Routes (6 tasks)

### Task 6.1: Implementar Auth Controller
- [ ] 6.1 Criar AuthController class
  - POST /api/v1/auth/login
  - POST /api/v1/auth/logout
  - POST /api/v1/auth/refresh
  - POST /api/v1/auth/forgot-password
  - POST /api/v1/auth/reset-password
  - POST /api/v1/auth/change-password
  - Adicionar validação com Zod
  - Adicionar rate limiting (5 tentativas / 15 min)
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, RNF-03_

### Task 6.2: Implementar User Controller
- [ ] 6.2 Criar UserController class
  - POST /api/v1/users (criar usuário)
  - GET /api/v1/users (listar com paginação)
  - GET /api/v1/users/:id (obter usuário)
  - PUT /api/v1/users/:id (atualizar usuário)
  - DELETE /api/v1/users/:id (desativar usuário)
  - GET /api/v1/users/me (perfil próprio)
  - PUT /api/v1/users/me (atualizar perfil próprio)
  - Adicionar permissões: users:create, users:read, users:update, users:delete
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3_

### Task 6.3: Implementar 2FA Controller
- [ ] 6.3 Criar TwoFactorController class
  - POST /api/v1/auth/2fa/enable
  - POST /api/v1/auth/2fa/confirm
  - POST /api/v1/auth/2fa/disable
  - POST /api/v1/auth/2fa/backup-codes
  - Validar código antes de habilitar/desabilitar
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

### Task 6.4: Implementar Session Controller
- [ ] 6.4 Criar SessionController class
  - GET /api/v1/sessions (listar sessões ativas)
  - DELETE /api/v1/sessions/:id (encerrar sessão)
  - DELETE /api/v1/sessions/all (encerrar todas)
  - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5_

### Task 6.5: Implementar Role e Permission Controllers
- [ ] 6.5 Criar RoleController e PermissionController
  - POST /api/v1/roles (criar função)
  - GET /api/v1/roles (listar funções)
  - PUT /api/v1/roles/:id (atualizar função)
  - DELETE /api/v1/roles/:id (deletar função)
  - GET /api/v1/permissions (listar permissões)
  - POST /api/v1/permissions/delegate (delegar permissão)
  - Adicionar permissões: roles:*, permissions:*
  - Validar que função não está em uso antes de deletar
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 22.1, 22.2, 22.3, 22.4, 22.5_

### Task 6.6: Implementar Audit Controller
- [ ] 6.6 Criar AuditController class
  - GET /api/v1/audit (buscar logs)
  - GET /api/v1/audit/resource/:type/:id (histórico de recurso)
  - POST /api/v1/audit/report (gerar relatório)
  - Adicionar permissão: audit:read, audit:export
  - Suportar filtros: userId, action, resource, período
  - _Requisitos: 21.1, 21.2, 21.3, 21.4, 21.5_

---

## Fase 7: Segurança e Validação (3 tasks)

### Task 7.1: Implementar Validações com Zod
- [ ] 7.1 Criar schemas de validação
  - LoginSchema: email, password, twoFactorCode
  - CreateUserSchema: email, password, name, phone, roleIds
  - UpdateUserSchema: name, phone, photo
  - ChangePasswordSchema: currentPassword, newPassword
  - CreateRoleSchema: name, description, permissionIds
  - Validar força de senha
  - Validar formato de email
  - Validar formato de telefone
  - _Requisitos: RN-02, RN-03_

### Task 7.2: Implementar Rate Limiting
- [ ] 7.2 Adicionar rate limiting
  - Rate limit por IP: 100 req/min
  - Rate limit para login: 5 tentativas / 15 min
  - Rate limit para password reset: 3 tentativas / hora
  - Rate limit por usuário: 100 req/min
  - Usar express-rate-limit
  - _Requisitos: RNF-03_

### Task 7.3: Implementar Proteção CSRF
- [ ] 7.3 Adicionar proteção CSRF
  - Gerar token CSRF
  - Validar token em operações de escrita
  - Usar biblioteca csurf
  - _Requisitos: RNF-05_

---

## Fase 8: Seed de Dados (2 tasks)

### Task 8.1: Criar Seed de Funções e Permissões
- [ ] 8.1 Implementar seed de funções padrão
  - Criar 10 funções: SUPER_ADMIN, ADMIN, MANAGER, SUPERVISOR, CASH_OPERATOR, WAITER, KITCHEN, TREASURER, DELIVERY, CUSTOMER
  - Definir permissões para cada função conforme requisitos
  - Criar hierarquia de funções
  - Marcar funções como isSystem: true
  - _Requisitos: 11.1, 12.1, 13.1, 14.1, 15.1, 16.1, 17.1, 18.1, 19.1, 20.1_

### Task 8.2: Criar Seed de Usuário Inicial
- [ ] 8.2 Criar usuário SUPER_ADMIN inicial
  - Email: admin@system.com
  - Senha: gerada aleatoriamente e exibida no console
  - Função: SUPER_ADMIN
  - Estabelecimento: criar estabelecimento padrão
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5, RN-09_

---

## Fase 9: Jobs e Tarefas Agendadas (2 tasks)

### Task 9.1: Implementar Job de Limpeza de Sessões
- [ ] 9.1 Criar job para limpar sessões expiradas
  - Executar a cada hora
  - Deletar sessões com expiresAt < now()
  - Registrar quantidade de sessões removidas
  - Usar node-cron ou similar
  - _Requisitos: 10.5_

### Task 9.2: Implementar Job de Expiração de Permissões
- [ ] 9.2 Criar job para expirar permissões delegadas
  - Executar a cada hora
  - Remover permissões com expiresAt < now()
  - Notificar usuário 24h antes da expiração
  - _Requisitos: 22.4, 22.5_

---

## Fase 10: LGPD e Conformidade (2 tasks)

### Task 10.1: Implementar Exportação de Dados
- [ ] 10.1 Criar endpoint para exportar dados pessoais
  - GET /api/v1/users/me/export
  - Exportar todos os dados do usuário em JSON
  - Incluir: perfil, sessões, logs de auditoria
  - _Requisitos: RNF-11, RNF-12_

### Task 10.2: Implementar Exclusão de Dados
- [ ] 10.2 Criar endpoint para solicitar exclusão
  - POST /api/v1/users/me/delete-request
  - Anonimizar dados pessoais
  - Manter logs de auditoria por 5 anos
  - Enviar confirmação por email
  - _Requisitos: RNF-11, RNF-13, RN-08_

---

## Fase 11: Testes (4 tasks)

### Task 11.1: Testes Unitários de Services
- [ ]* 11.1 Criar testes unitários
  - Testar AuthService (login, logout, tokens)
  - Testar RBACService (permissões, hierarquia)
  - Testar 2FAService (TOTP, backup codes)
  - Testar SessionService
  - Testar AuditService
  - Cobertura mínima: 80%
  - _Requisitos: Todos os requisitos funcionais_

### Task 11.2: Testes de Integração
- [ ]* 11.2 Criar testes de integração
  - Testar fluxo completo de login
  - Testar fluxo de recuperação de senha
  - Testar fluxo de 2FA
  - Testar verificação de permissões
  - Testar isolamento multi-tenant
  - _Requisitos: Todos os requisitos funcionais_

### Task 11.3: Testes de Segurança
- [ ]* 11.3 Criar testes de segurança
  - Testar proteção contra SQL injection
  - Testar proteção contra XSS
  - Testar proteção contra CSRF
  - Testar rate limiting
  - Testar bloqueio de conta
  - Testar isolamento de tenant
  - _Requisitos: RNF-01, RNF-02, RNF-03, RNF-04, RNF-05_

### Task 11.4: Testes de Performance
- [ ]* 11.4 Criar testes de performance
  - Testar validação de permissões < 50ms
  - Testar login com 1000 usuários simultâneos
  - Testar cache de permissões
  - _Requisitos: RNF-06, RNF-07, RNF-08_

---

## Fase 12: Documentação (2 tasks)

### Task 12.1: Documentar API com Swagger
- [ ] 12.1 Adicionar documentação Swagger
  - Documentar todos os endpoints
  - Adicionar exemplos de request/response
  - Documentar códigos de erro
  - Documentar autenticação
  - Documentar permissões necessárias
  - _Requisitos: Todos os endpoints_

### Task 12.2: Criar Guia de Usuário
- [ ] 12.2 Escrever documentação de usuário
  - Guia de configuração inicial
  - Guia de gestão de usuários
  - Guia de gestão de funções e permissões
  - Guia de 2FA
  - Guia de auditoria
  - FAQ
  - _Requisitos: Todos os requisitos_

---

## Resumo

**Total de Tasks:** 47 principais + 4 opcionais (testes)
**Tempo Estimado:** 100-120 horas
**Prioridade:** Crítica (base para todo o sistema)
**Dependências:** Backend API Core (✅ Completo)

**Principais Entregas:**
- Sistema RBAC completo com 10 tipos de usuários
- Autenticação segura com JWT e 2FA
- Multi-tenancy com isolamento de dados
- Auditoria completa e imutável
- Conformidade com LGPD
- Performance otimizada com cache
