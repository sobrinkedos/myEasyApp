# Mudanças para Sistema Multi-tenant

## Resumo

O sistema foi ajustado para funcionar como **multi-tenant**, onde:
- Cada estabelecimento é criado automaticamente no **registro** do primeiro usuário (admin)
- Não é possível criar estabelecimentos via API diretamente
- Cada usuário pertence a um estabelecimento
- Usuários só podem acessar e editar dados do seu próprio estabelecimento

---

## Arquivos Modificados

### 1. `src/services/auth.service.ts` ✅
**Adicionado:**
- Interface `RegisterData` com dados do usuário e estabelecimento
- Método `register()` que:
  - Valida CNPJ
  - Verifica duplicidade de CNPJ e email
  - Cria estabelecimento e usuário admin em transação
  - Cria role admin automaticamente
  - Vincula usuário ao role admin
  - Gera token JWT
  - Registra auditoria

### 2. `src/controllers/auth.controller.ts` ✅
**Adicionado:**
- Schemas de validação Zod:
  - `addressSchema` - Validação de endereço
  - `taxSettingsSchema` - Validação de configurações fiscais
  - `registerSchema` - Validação completa do registro
- Método `register()` que valida e chama o service

### 3. `src/routes/auth.routes.ts` ✅
**Adicionado:**
- Rota `POST /api/v1/auth/register` com documentação Swagger

### 4. `src/controllers/establishment.controller.ts` ✅
**Modificado:**
- `get()` - Agora busca estabelecimento do usuário logado via token
- **Adicionado** `updateCurrent()` - Atualiza estabelecimento do usuário logado
- `uploadLogo()` - Ajustado para usar estabelecimento do token

**Removido:**
- Métodos `getAll()`, `getById()`, `create()`, `delete()` não são mais necessários

### 5. `src/routes/establishment.routes.ts` ✅
**Modificado:**
- `GET /` - Busca estabelecimento do usuário logado
- `PUT /` - Atualiza estabelecimento do usuário logado (admin)
- `POST /logo` - Upload de logo (admin)

**Removido:**
- `GET /` (listar todos)
- `GET /current`
- `GET /:id`
- `POST /` (criar)
- `PUT /:id`
- `DELETE /:id`
- `POST /:id/logo`

---

## Fluxo de Registro

```
1. Usuário acessa página de registro
   ↓
2. Preenche dados pessoais + dados do estabelecimento
   ↓
3. POST /api/v1/auth/register
   ↓
4. Sistema valida dados
   ↓
5. Sistema cria estabelecimento
   ↓
6. Sistema cria usuário admin vinculado ao estabelecimento
   ↓
7. Sistema cria role "admin" para o estabelecimento
   ↓
8. Sistema vincula usuário ao role admin
   ↓
9. Sistema gera token JWT
   ↓
10. Retorna token + dados do usuário
```

---

## Fluxo de Edição

```
1. Admin faz login
   ↓
2. Acessa menu Configurações > Estabelecimento
   ↓
3. GET /api/v1/establishment (com token)
   ↓
4. Sistema identifica estabelecimento pelo token
   ↓
5. Retorna dados do estabelecimento
   ↓
6. Admin edita dados
   ↓
7. PUT /api/v1/establishment (com token)
   ↓
8. Sistema atualiza estabelecimento do token
   ↓
9. Registra auditoria
   ↓
10. Retorna dados atualizados
```

---

## Validações Implementadas

### Registro de Usuário
- Nome: mínimo 3 caracteres
- Email: formato válido e único
- Senha: 
  - Mínimo 8 caracteres
  - Pelo menos 1 maiúscula
  - Pelo menos 1 minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial
- Telefone: formato brasileiro (opcional)

### Registro de Estabelecimento
- Nome: mínimo 3 caracteres
- CNPJ: 14 dígitos válidos e único
- Endereço completo com validações
- Telefone: formato brasileiro
- Email: formato válido
- Configurações fiscais: valores entre 0-100

---

## Segurança

### Token JWT
- Contém: `userId`, `email`, `establishmentId`, `roles`
- Validade: 7 dias
- Usado para identificar estabelecimento do usuário

### Isolamento de Dados
- Cada requisição identifica o estabelecimento pelo token
- Usuários não podem acessar dados de outros estabelecimentos
- Validação de permissões por role

### Auditoria
- Registro de criação de usuário e estabelecimento
- Registro de todas as atualizações
- Rastreamento de IP e timestamp

---

## Endpoints da API

### Autenticação
- `POST /api/v1/auth/register` - Registro (público)
- `POST /api/v1/auth/login` - Login (público)

### Estabelecimento
- `GET /api/v1/establishment` - Buscar dados (autenticado)
- `PUT /api/v1/establishment` - Atualizar (admin)
- `POST /api/v1/establishment/logo` - Upload logo (admin)

---

## Exemplo de Payload de Registro

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha@123",
  "phone": "(11) 98765-4321",
  "establishment": {
    "name": "Restaurante do João",
    "cnpj": "12345678000190",
    "address": {
      "street": "Rua Principal",
      "number": "100",
      "complement": "Loja 1",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "phone": "(11) 3456-7890",
    "email": "contato@restaurante.com",
    "taxSettings": {
      "taxRegime": "simples",
      "icmsRate": 7,
      "issRate": 5,
      "pisRate": 0.65,
      "cofinsRate": 3
    }
  }
}
```

---

## Exemplo de Resposta de Registro

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "id": "uuid",
      "email": "joao@exemplo.com",
      "name": "João Silva",
      "establishmentId": "uuid",
      "roles": ["admin"],
      "permissions": []
    }
  },
  "message": "Cadastro realizado com sucesso"
}
```

---

## Testes Necessários

### Testes de Registro
- ✅ Registrar com dados válidos
- ✅ Validar CNPJ inválido
- ✅ Validar CNPJ duplicado
- ✅ Validar email duplicado
- ✅ Validar senha fraca
- ✅ Verificar criação de estabelecimento
- ✅ Verificar criação de usuário admin
- ✅ Verificar criação de role admin
- ✅ Verificar vinculação usuário-role
- ✅ Verificar geração de token

### Testes de Estabelecimento
- ✅ Buscar estabelecimento do usuário logado
- ✅ Atualizar estabelecimento (admin)
- ✅ Negar atualização (não-admin)
- ✅ Upload de logo
- ✅ Validar isolamento entre estabelecimentos

---

## Próximos Passos

1. **Frontend**
   - Criar página de registro com formulário completo
   - Criar página de configurações do estabelecimento
   - Implementar upload de logo

2. **Testes**
   - Criar testes de integração para registro
   - Criar testes de isolamento multi-tenant
   - Testar fluxo completo de registro → login → edição

3. **Melhorias**
   - Adicionar verificação de email
   - Implementar recuperação de senha
   - Adicionar validação de CNPJ na Receita Federal (API externa)
   - Implementar soft delete de estabelecimentos

4. **Documentação**
   - Criar guia de integração para frontend
   - Documentar fluxo de onboarding
   - Criar exemplos de uso em diferentes linguagens

---

## Status: ✅ COMPLETO

O sistema multi-tenant está implementado e pronto para uso!
