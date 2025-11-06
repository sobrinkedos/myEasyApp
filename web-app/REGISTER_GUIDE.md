# Guia - Página de Registro

## ✅ Implementação Completa

A página de registro foi implementada com sucesso, permitindo que novos usuários criem sua conta e estabelecimento automaticamente.

---

## 📍 Acesso

### URL
```
http://localhost:5173/auth/register
```

### Link na Página de Login
Na página de login, agora existe um link "Criar conta" que direciona para a página de registro.

---

## 🎯 Funcionalidades

### Formulário em 2 Etapas

**Etapa 1 - Dados Pessoais:**
- Nome completo
- Email
- Telefone (opcional)
- Senha
- Confirmação de senha

**Etapa 2 - Dados do Estabelecimento:**
- Nome do estabelecimento
- CNPJ
- Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)
- Telefone do estabelecimento
- Email do estabelecimento

### Validações Implementadas

**Senha Forte:**
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial

**Outras Validações:**
- ✅ Email válido
- ✅ Senhas devem coincidir
- ✅ Nome mínimo 3 caracteres
- ✅ CNPJ formato válido
- ✅ Estado com 2 caracteres (UF)

### Indicador de Progresso
- Mostra visualmente em qual etapa o usuário está
- Permite voltar para a etapa anterior

### Feedback Visual
- Mensagens de erro específicas para cada campo
- Loading state durante o envio
- Mensagens de erro do servidor

---

## 🔄 Fluxo de Uso

```
1. Usuário acessa /auth/login
   ↓
2. Clica em "Criar conta"
   ↓
3. Preenche dados pessoais (Etapa 1)
   ↓
4. Clica em "Próximo"
   ↓
5. Sistema valida dados da Etapa 1
   ↓
6. Preenche dados do estabelecimento (Etapa 2)
   ↓
7. Clica em "Criar Conta"
   ↓
8. Sistema envia para API POST /api/v1/auth/register
   ↓
9. API cria estabelecimento + usuário admin
   ↓
10. Retorna token JWT
   ↓
11. Token salvo no localStorage
   ↓
12. Redireciona para /dashboard
```

---

## 📝 Exemplo de Dados

### Dados Pessoais
```
Nome: João Silva
Email: joao@exemplo.com
Telefone: (11) 98765-4321
Senha: Senha@123
Confirmar Senha: Senha@123
```

### Dados do Estabelecimento
```
Nome: Restaurante do João
CNPJ: 12.345.678/0001-90
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

## 🎨 Interface

### Etapa 1 - Dados Pessoais
```
┌─────────────────────────────────────┐
│         Criar Conta                 │
│   Preencha seus dados pessoais      │
│                                     │
│   ●━━━━━━━━○                       │
│   1        2                        │
│                                     │
│   Nome Completo *                   │
│   [João Silva              ]        │
│                                     │
│   Email *                           │
│   [joao@exemplo.com        ]        │
│                                     │
│   Telefone                          │
│   [(11) 98765-4321         ]        │
│                                     │
│   Senha *                           │
│   [••••••••                ]        │
│   Mínimo 8 caracteres...            │
│                                     │
│   Confirmar Senha *                 │
│   [••••••••                ]        │
│                                     │
│   [      Próximo      ]             │
│                                     │
│   Já tem uma conta? Fazer login     │
└─────────────────────────────────────┘
```

### Etapa 2 - Dados do Estabelecimento
```
┌─────────────────────────────────────┐
│         Criar Conta                 │
│   Dados do seu estabelecimento      │
│                                     │
│   ●━━━━━━━━●                       │
│   1        2                        │
│                                     │
│   Nome do Estabelecimento *         │
│   [Restaurante do João     ]        │
│                                     │
│   CNPJ *                            │
│   [12.345.678/0001-90      ]        │
│                                     │
│   Rua *                             │
│   [Rua Principal           ]        │
│                                     │
│   Número *    Complemento           │
│   [100  ]     [Loja 1      ]        │
│                                     │
│   Bairro *    Cidade *              │
│   [Centro]    [São Paulo   ]        │
│                                     │
│   Estado *    CEP *                 │
│   [SP]        [01234-567   ]        │
│                                     │
│   Telefone *                        │
│   [(11) 3456-7890          ]        │
│                                     │
│   Email *                           │
│   [contato@restaurante.com ]        │
│                                     │
│   [Voltar]    [Criar Conta]         │
│                                     │
│   Já tem uma conta? Fazer login     │
└─────────────────────────────────────┘
```

---

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos
- ✅ `web-app/src/pages/auth/RegisterPage.tsx` - Página de registro

### Arquivos Modificados
- ✅ `web-app/src/pages/auth/LoginPage.tsx` - Adicionado link "Criar conta"
- ✅ `web-app/src/app/router.tsx` - Adicionada rota `/auth/register`

---

## 🧪 Testando

### 1. Iniciar o Frontend
```bash
cd web-app
npm run dev
```

### 2. Acessar a Página
```
http://localhost:5173/auth/login
```

### 3. Clicar em "Criar conta"

### 4. Preencher Formulário
- Etapa 1: Dados pessoais
- Etapa 2: Dados do estabelecimento

### 5. Verificar Validações
- Tentar senha fraca
- Tentar senhas diferentes
- Tentar email inválido
- Verificar mensagens de erro

### 6. Criar Conta
- Preencher todos os campos corretamente
- Clicar em "Criar Conta"
- Verificar redirecionamento para dashboard

---

## 🐛 Tratamento de Erros

### Erros de Validação (Frontend)
```javascript
// Senha fraca
{
  password: [
    'Senha deve conter pelo menos uma letra maiúscula',
    'Senha deve conter pelo menos um caractere especial'
  ]
}
```

### Erros da API (Backend)
```javascript
// CNPJ duplicado
{
  success: false,
  message: 'CNPJ já cadastrado'
}

// Email duplicado
{
  success: false,
  message: 'Email já cadastrado'
}

// Validação de campos
{
  success: false,
  message: 'Dados inválidos',
  errors: {
    'establishment.cnpj': ['CNPJ inválido'],
    'email': ['Email inválido']
  }
}
```

---

## 🎯 Próximos Passos

### Melhorias Sugeridas
1. **Máscara de Campos**
   - CNPJ: `99.999.999/9999-99`
   - Telefone: `(99) 99999-9999`
   - CEP: `99999-999`

2. **Busca de CEP**
   - Integrar com API ViaCEP
   - Preencher endereço automaticamente

3. **Validação de CNPJ**
   - Validar dígitos verificadores
   - Consultar Receita Federal (opcional)

4. **Upload de Logo**
   - Permitir upload durante registro
   - Preview da imagem

5. **Confirmação de Email**
   - Enviar email de verificação
   - Confirmar email antes de ativar conta

6. **Termos de Uso**
   - Adicionar checkbox de aceite
   - Link para termos e política de privacidade

---

## 📱 Responsividade

A página é totalmente responsiva e funciona em:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

---

## 🔐 Segurança

### Frontend
- ✅ Validação de senha forte
- ✅ Confirmação de senha
- ✅ Sanitização de inputs
- ✅ HTTPS (produção)

### Backend
- ✅ Validação com Zod
- ✅ Hash de senha com bcrypt
- ✅ Validação de CNPJ
- ✅ Verificação de duplicidade
- ✅ Rate limiting
- ✅ CORS configurado

---

## ✅ Status

**Página de Registro:** ✅ Completa e Funcional

**Funcionalidades:**
- ✅ Formulário em 2 etapas
- ✅ Validações completas
- ✅ Indicador de progresso
- ✅ Feedback visual
- ✅ Tratamento de erros
- ✅ Integração com API
- ✅ Redirecionamento automático
- ✅ Link na página de login
- ✅ Responsiva

**Pronto para uso!** 🚀
