# 🐛 Debug - Erro 400 no Registro

## O que significa erro 400?

**400 Bad Request** significa que o servidor recebeu a requisição, mas os dados enviados estão inválidos ou incompletos.

---

## 🔍 Como Debugar

### 1. Abrir DevTools do Navegador
```
Pressione F12 ou Ctrl+Shift+I
```

### 2. Ir para aba Console
Você verá logs detalhados:
```
📤 Enviando dados: { ... }
❌ Erro no registro: ...
📥 Resposta do servidor: { ... }
🔍 Erros de validação: { ... }
```

### 3. Verificar os Dados Enviados
O log `📤 Enviando dados:` mostra exatamente o que está sendo enviado para o servidor.

### 4. Verificar a Resposta do Servidor
O log `📥 Resposta do servidor:` mostra o que o servidor retornou, incluindo os erros específicos.

---

## 📋 Checklist de Validação

### Dados Pessoais (Etapa 1)

#### Nome
- [ ] Mínimo 3 caracteres
- [ ] Exemplo: `João Silva`

#### Email
- [ ] Formato válido
- [ ] Exemplo: `joao@exemplo.com`

#### Senha
- [ ] Mínimo 8 caracteres
- [ ] Pelo menos 1 letra MAIÚSCULA
- [ ] Pelo menos 1 letra minúscula
- [ ] Pelo menos 1 número
- [ ] Pelo menos 1 caractere especial (@, #, $, %, etc)
- [ ] Exemplo válido: `Senha@123`
- [ ] Exemplo inválido: `senha123` (falta maiúscula e especial)

#### Telefone (opcional)
- [ ] Formato: `(11) 98765-4321`
- [ ] Pode deixar vazio

---

### Dados do Estabelecimento (Etapa 2)

#### Nome do Estabelecimento
- [ ] Mínimo 3 caracteres
- [ ] Exemplo: `Restaurante do João`

#### CNPJ
- [ ] Exatamente 14 dígitos
- [ ] Com formatação: `12.345.678/0001-90`
- [ ] Sem formatação: `12345678000190`
- [ ] Ambos funcionam

#### Endereço - Rua
- [ ] Mínimo 3 caracteres
- [ ] Exemplo: `Rua Principal`

#### Endereço - Número
- [ ] Obrigatório
- [ ] Exemplo: `100`

#### Endereço - Complemento
- [ ] Opcional
- [ ] Exemplo: `Loja 1`

#### Endereço - Bairro
- [ ] Mínimo 3 caracteres
- [ ] Exemplo: `Centro`

#### Endereço - Cidade
- [ ] Mínimo 3 caracteres
- [ ] Exemplo: `São Paulo`

#### Endereço - Estado
- [ ] Exatamente 2 caracteres (UF)
- [ ] Exemplo: `SP`
- [ ] Deve ser maiúsculo

#### Endereço - CEP
- [ ] Formato: `01234-567` ou `01234567`
- [ ] Exemplo: `01310-100`

#### Telefone do Estabelecimento
- [ ] Formato: `(11) 3456-7890` ou `(11) 98765-4321`
- [ ] Exemplo: `(11) 3456-7890`

#### Email do Estabelecimento
- [ ] Formato válido
- [ ] Exemplo: `contato@restaurante.com`

---

## 🧪 Dados de Teste Válidos

### Copie e Cole (Etapa 1)
```
Nome: João Silva
Email: joao.teste@exemplo.com
Telefone: (11) 98765-4321
Senha: Senha@123
Confirmar Senha: Senha@123
```

### Copie e Cole (Etapa 2)
```
Nome do Estabelecimento: Restaurante Teste
CNPJ: 12345678000190
Rua: Rua Principal
Número: 100
Complemento: Loja 1
Bairro: Centro
Cidade: São Paulo
Estado: SP
CEP: 01234-567
Telefone: (11) 3456-7890
Email: contato@restaurante.com
```

---

## 🔍 Erros Comuns

### 1. Senha Fraca
```json
{
  "password": [
    "Senha deve conter pelo menos uma letra maiúscula",
    "Senha deve conter pelo menos um caractere especial"
  ]
}
```

**Solução:** Use senha como `Senha@123`

---

### 2. CNPJ Inválido
```json
{
  "establishment.cnpj": ["CNPJ inválido"]
}
```

**Solução:** Use 14 dígitos: `12345678000190`

---

### 3. Estado Inválido
```json
{
  "establishment.address.state": ["Estado deve ter 2 caracteres (UF)"]
}
```

**Solução:** Use apenas 2 letras maiúsculas: `SP`

---

### 4. CEP Inválido
```json
{
  "establishment.address.zipCode": ["CEP inválido"]
}
```

**Solução:** Use formato `12345-678` ou `12345678`

---

### 5. Email Duplicado
```json
{
  "message": "Email já cadastrado"
}
```

**Solução:** Use outro email

---

### 6. CNPJ Duplicado
```json
{
  "message": "CNPJ já cadastrado"
}
```

**Solução:** Use outro CNPJ

---

## 📸 Como Ver os Erros

### No Console do Navegador (F12)
```javascript
// Você verá algo assim:
📤 Enviando dados: {
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",  // ❌ Senha fraca!
  ...
}

📥 Resposta do servidor: {
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "password": [
      "Senha deve conter pelo menos uma letra maiúscula",
      "Senha deve conter pelo menos um caractere especial"
    ]
  }
}
```

### Na Tela
Os erros aparecerão:
1. **No topo:** Mensagem geral em vermelho
2. **Abaixo de cada campo:** Erro específico do campo

---

## 🎯 Passo a Passo para Testar

### 1. Abrir DevTools
```
F12 → Aba Console
```

### 2. Limpar Console
```
Clicar no ícone 🚫 (Clear console)
```

### 3. Preencher Formulário
Use os dados de teste acima

### 4. Clicar em "Criar Conta"

### 5. Ver Logs no Console
```
📤 Enviando dados: ...
```

### 6. Se houver erro, ver detalhes
```
📥 Resposta do servidor: ...
🔍 Erros de validação: ...
```

### 7. Corrigir os campos indicados

### 8. Tentar novamente

---

## ✅ Sucesso!

Quando funcionar, você verá:
```
✅ Registro bem-sucedido!
→ Redirecionando para dashboard...
```

E será redirecionado automaticamente para `/dashboard`

---

## 🆘 Ainda com Problemas?

### Verificar Backend
```bash
# Ver logs do backend
# Procurar por erros ou avisos
```

### Verificar Banco de Dados
```bash
npm run prisma:studio
```

Abrir tabela `users` e verificar se há usuários cadastrados.

---

## 📝 Exemplo Completo de Requisição

### Dados Enviados (JSON)
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

### Resposta de Sucesso
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

**Última atualização:** 2024
**Status:** Guia de debug completo
