# API de Estabelecimento - Multi-tenant

Documentação da API de Estabelecimento para sistema multi-tenant.

## Modelo Multi-tenant

No sistema multi-tenant:
- Cada estabelecimento é criado automaticamente durante o **registro** do primeiro usuário (administrador)
- O administrador pode **editar** os dados do seu estabelecimento
- Todos os usuários criados pelo administrador são vinculados ao mesmo estabelecimento
- **Não é possível criar estabelecimentos via API** - apenas através do registro inicial

---

## Endpoints

### 1. Registro (Cria Estabelecimento + Admin)

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Body:**
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

**Validações:**

**Usuário:**
- `name`: mínimo 3 caracteres
- `email`: email válido
- `password`: 
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial
- `phone`: formato (11) 98765-4321 (opcional)

**Estabelecimento:**
- `name`: mínimo 3 caracteres
- `cnpj`: 14 dígitos (com ou sem formatação)
- `address.street`: mínimo 3 caracteres
- `address.number`: obrigatório
- `address.neighborhood`: mínimo 3 caracteres
- `address.city`: mínimo 3 caracteres
- `address.state`: exatamente 2 caracteres (UF)
- `address.zipCode`: formato 12345-678 ou 12345678
- `phone`: formato (11) 98765-4321 ou (11) 3456-7890
- `email`: email válido
- `taxSettings.taxRegime`: "simples", "presumido" ou "real"
- `taxSettings.*Rate`: entre 0 e 100

**Resposta de Sucesso (201):**
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

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "password": ["Senha deve conter pelo menos uma letra maiúscula"],
    "establishment.cnpj": ["CNPJ inválido"]
  }
}
```

**Resposta de Erro (409):**
```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

ou

```json
{
  "success": false,
  "message": "CNPJ já cadastrado"
}
```

---

### 2. Buscar Estabelecimento Atual

```http
GET /api/v1/establishment
Authorization: Bearer {token}
```

Retorna os dados do estabelecimento do usuário logado.

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
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
    "logoUrl": "/uploads/logo.png",
    "taxSettings": {
      "taxRegime": "simples",
      "icmsRate": 7,
      "issRate": 5,
      "pisRate": 0.65,
      "cofinsRate": 3
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Atualizar Estabelecimento

```http
PUT /api/v1/establishment
Authorization: Bearer {token}
Content-Type: application/json
```

**Permissão Necessária:** `admin`

Atualiza os dados do estabelecimento do usuário logado.

**Body (todos os campos opcionais):**
```json
{
  "name": "Restaurante Atualizado",
  "phone": "(11) 91234-5678",
  "email": "novo@email.com",
  "address": {
    "street": "Nova Rua",
    "number": "200",
    "neighborhood": "Novo Bairro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "taxSettings": {
    "taxRegime": "presumido",
    "icmsRate": 12,
    "issRate": 5,
    "pisRate": 1.65,
    "cofinsRate": 7.6
  }
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante Atualizado",
    ...
  },
  "message": "Estabelecimento atualizado com sucesso"
}
```

**Resposta de Erro (403):**
```json
{
  "success": false,
  "message": "Acesso negado"
}
```

---

### 4. Upload de Logo

```http
POST /api/v1/establishment/logo
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Permissão Necessária:** `admin`

**Form Data:**
- `logo` (file) - Arquivo de imagem (PNG, JPG, JPEG)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "logoUrl": "/uploads/logo-1234567890.png"
  },
  "message": "Logo enviado com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Nenhum arquivo foi enviado",
  "errors": {
    "file": ["Arquivo é obrigatório"]
  }
}
```

---

## Fluxo de Uso

### 1. Registro Inicial

```bash
# Registrar novo estabelecimento e usuário admin
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 2. Buscar Dados do Estabelecimento

```bash
# Buscar estabelecimento do usuário logado
curl -X GET http://localhost:3000/api/v1/establishment \
  -H "Authorization: Bearer {token}"
```

### 3. Atualizar Estabelecimento

```bash
# Atualizar dados do estabelecimento
curl -X PUT http://localhost:3000/api/v1/establishment \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurante Atualizado",
    "phone": "(11) 91234-5678"
  }'
```

### 4. Upload de Logo

```bash
# Fazer upload do logo
curl -X POST http://localhost:3000/api/v1/establishment/logo \
  -H "Authorization: Bearer {token}" \
  -F "logo=@/path/to/logo.png"
```

---

## Exemplos JavaScript

### Registro

```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'Senha@123',
    phone: '(11) 98765-4321',
    establishment: {
      name: 'Restaurante do João',
      cnpj: '12345678000190',
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      phone: '(11) 3456-7890',
      email: 'contato@restaurante.com',
      taxSettings: {
        taxRegime: 'simples',
        icmsRate: 7,
        issRate: 5,
        pisRate: 0.65,
        cofinsRate: 3,
      },
    },
  }),
});

const data = await response.json();
const token = data.data.token;
```

### Buscar Estabelecimento

```javascript
const response = await fetch('http://localhost:3000/api/v1/establishment', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
console.log(data.data); // Dados do estabelecimento
```

### Atualizar Estabelecimento

```javascript
const response = await fetch('http://localhost:3000/api/v1/establishment', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Restaurante Atualizado',
    phone: '(11) 91234-5678',
  }),
});

const data = await response.json();
```

### Upload de Logo

```javascript
const formData = new FormData();
formData.append('logo', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/establishment/logo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const data = await response.json();
console.log(data.data.logoUrl); // URL do logo
```

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso (registro)
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou ausente
- `403 Forbidden` - Sem permissão para acessar o recurso
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: CNPJ ou email duplicado)
- `500 Internal Server Error` - Erro interno do servidor

---

## Auditoria

Todas as operações são registradas na tabela `audit_logs`:

- **Registro**: Cria log de criação do usuário e estabelecimento
- **Atualização**: Registra estado anterior e novo estado
- **Upload de logo**: Registra atualização do estabelecimento

---

## Regras de Negócio

1. **Criação de Estabelecimento**
   - Apenas via registro inicial
   - Cria automaticamente usuário admin
   - Valida CNPJ único
   - Valida email único

2. **Edição de Estabelecimento**
   - Apenas admin pode editar
   - Usuário só pode editar seu próprio estabelecimento
   - CNPJ pode ser alterado (se único)

3. **Multi-tenancy**
   - Cada usuário pertence a um estabelecimento
   - Usuários não podem acessar dados de outros estabelecimentos
   - Estabelecimento é identificado pelo token JWT

4. **Segurança**
   - Senha forte obrigatória no registro
   - Token JWT com 7 dias de validade
   - Rate limiting aplicado
   - Auditoria completa
