# 🐛 Correção - URL Duplicada no Registro

## Problema Identificado

### Erro
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
URL: http://localhost:3000/api/v1/api/v1/auth/register
```

### Causa
A URL estava sendo duplicada porque:
1. `VITE_API_URL` já incluía `/api/v1`: `http://localhost:3000/api/v1`
2. O código adicionava `/api/v1/auth/register` novamente
3. Resultado: `http://localhost:3000/api/v1/api/v1/auth/register` ❌

---

## Solução Aplicada

### Antes (❌ Errado)
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ...

const response = await axios.post(`${API_URL}/api/v1/auth/register`, registerData);
```

**Problema:** Criava nova instância do axios sem os interceptors configurados.

### Depois (✅ Correto)
```typescript
import api from '@/services/api';

// ...

const response = await api.post('/auth/register', registerData);
```

**Benefícios:**
- ✅ URL correta: `http://localhost:3000/api/v1/auth/register`
- ✅ Usa serviço de API configurado
- ✅ Inclui interceptors (auth token, error handling)
- ✅ Configuração centralizada

---

## Configuração Correta

### Arquivo: `web-app/.env.development`
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

### Arquivo: `web-app/src/services/api.ts`
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Uso nos Componentes
```typescript
// ✅ Correto
import api from '@/services/api';
const response = await api.post('/auth/register', data);

// ❌ Errado
import axios from 'axios';
const response = await axios.post(`${API_URL}/api/v1/auth/register`, data);
```

---

## URLs Resultantes

### Registro
```
POST http://localhost:3000/api/v1/auth/register
```

### Login
```
POST http://localhost:3000/api/v1/auth/login
```

### Estabelecimento
```
GET http://localhost:3000/api/v1/establishment
PUT http://localhost:3000/api/v1/establishment
```

---

## Vantagens do Serviço de API

### 1. Configuração Centralizada
- Uma única configuração de `baseURL`
- Fácil de mudar entre ambientes
- Timeout configurado

### 2. Interceptors Automáticos
```typescript
// Request Interceptor - Adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Trata erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. Consistência
- Todas as requisições usam a mesma configuração
- Headers padronizados
- Tratamento de erros unificado

---

## Como Usar o Serviço de API

### GET Request
```typescript
import api from '@/services/api';

const response = await api.get('/establishment');
const data = response.data;
```

### POST Request
```typescript
import api from '@/services/api';

const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
```

### PUT Request
```typescript
import api from '@/services/api';

const response = await api.put('/establishment', {
  name: 'Novo Nome',
});
```

### DELETE Request
```typescript
import api from '@/services/api';

await api.delete('/products/123');
```

---

## Checklist de Verificação

Ao criar novos componentes que fazem requisições:

- ✅ Importar `api` de `@/services/api`
- ✅ Usar apenas o path relativo (ex: `/auth/register`)
- ✅ Não adicionar `baseURL` manualmente
- ✅ Não criar nova instância do axios
- ✅ Confiar nos interceptors para adicionar token

---

## Testando a Correção

### 1. Verificar URL no Network
```
1. Abrir DevTools (F12)
2. Ir para aba Network
3. Tentar fazer registro
4. Verificar URL da requisição
5. Deve ser: http://localhost:3000/api/v1/auth/register
```

### 2. Verificar Token
```
1. Fazer registro com sucesso
2. Abrir DevTools > Application > Local Storage
3. Verificar se 'token' foi salvo
4. Verificar se redirecionou para /dashboard
```

### 3. Verificar Autenticação
```
1. Após registro, fazer uma requisição autenticada
2. Verificar no Network que o header Authorization foi adicionado
3. Deve ter: Authorization: Bearer eyJhbGc...
```

---

## Status

✅ **Correção Aplicada e Testada**

**Mudanças:**
- ✅ RegisterPage agora usa `api` service
- ✅ URL correta sem duplicação
- ✅ Interceptors funcionando
- ✅ Token sendo adicionado automaticamente

**Pronto para uso!** 🚀
