# Guia Rápido - Estabelecimento Multi-tenant

## 🚀 Início Rápido

### 1. Registrar Novo Estabelecimento

```bash
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
  }'
```

**Resposta:**
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

**💡 Dica:** Salve o token retornado para usar nas próximas requisições!

---

### 2. Buscar Dados do Estabelecimento

```bash
curl -X GET http://localhost:3000/api/v1/establishment \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante do João",
    "cnpj": "12345678000190",
    "address": { ... },
    "phone": "(11) 3456-7890",
    "email": "contato@restaurante.com",
    "logoUrl": null,
    "taxSettings": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Atualizar Estabelecimento

```bash
curl -X PUT http://localhost:3000/api/v1/establishment \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurante Atualizado",
    "phone": "(11) 91234-5678"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Restaurante Atualizado",
    "phone": "(11) 91234-5678",
    ...
  },
  "message": "Estabelecimento atualizado com sucesso"
}
```

---

### 4. Upload de Logo

```bash
curl -X POST http://localhost:3000/api/v1/establishment/logo \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "logo=@/caminho/para/logo.png"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "logoUrl": "/uploads/logo-1234567890.png"
  },
  "message": "Logo enviado com sucesso"
}
```

---

## 📋 Checklist de Validações

### Senha Forte
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial

**Exemplos válidos:**
- `Senha@123`
- `Admin#2024`
- `Teste$456`

**Exemplos inválidos:**
- `senha123` (sem maiúscula e caractere especial)
- `SENHA123` (sem minúscula e caractere especial)
- `Senha` (muito curta)

### CNPJ
- ✅ 14 dígitos
- ✅ Pode ter formatação: `12.345.678/0001-90`
- ✅ Ou sem formatação: `12345678000190`
- ✅ Deve ser único no sistema

### Telefone
- ✅ Formato: `(11) 98765-4321` (celular)
- ✅ Formato: `(11) 3456-7890` (fixo)
- ✅ Com ou sem espaços/hífens

### CEP
- ✅ Formato: `01234-567`
- ✅ Ou sem hífen: `01234567`

---

## 🔐 Autenticação

### Obter Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "Senha@123"
  }'
```

### Usar Token

Adicione o header em todas as requisições protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Validade:** 7 dias

---

## ⚠️ Erros Comuns

### 400 - Dados Inválidos

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

**Solução:** Verifique os campos indicados em `errors`

---

### 401 - Não Autenticado

```json
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

**Solução:** Faça login novamente para obter novo token

---

### 403 - Sem Permissão

```json
{
  "success": false,
  "message": "Acesso negado"
}
```

**Solução:** Apenas usuários admin podem atualizar estabelecimento

---

### 409 - Conflito

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

**Solução:** Use email/CNPJ diferente

---

## 🧪 Testar a API

### Usando Postman

1. Importe a collection do Swagger: `http://localhost:3000/api/docs`
2. Configure variável `{{token}}` com o token obtido no login
3. Execute as requisições

### Usando Insomnia

1. Crie novo request
2. Configure método e URL
3. Adicione header `Authorization: Bearer {{token}}`
4. Execute

### Usando JavaScript

```javascript
// Registrar
const registerResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* dados */ }),
});

const { data } = await registerResponse.json();
const token = data.token;

// Buscar estabelecimento
const establishmentResponse = await fetch('http://localhost:3000/api/v1/establishment', {
  headers: { 'Authorization': `Bearer ${token}` },
});

const establishment = await establishmentResponse.json();
```

---

## 📚 Documentação Completa

- **API Completa:** `docs/ESTABLISHMENT_API.md`
- **Mudanças Multi-tenant:** `docs/MULTI_TENANT_CHANGES.md`
- **Resumo Técnico:** `docs/ESTABLISHMENT_CRUD_SUMMARY.md`
- **Swagger:** `http://localhost:3000/api/docs`

---

## 🆘 Suporte

Em caso de dúvidas:

1. Verifique a documentação completa
2. Consulte os exemplos de código
3. Execute os testes: `npm test`
4. Verifique os logs: `logs/combined.log`

---

## ✅ Status

Sistema multi-tenant implementado e funcionando! 🎉
