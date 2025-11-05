# 🐛 Debug do Login

## Como Debugar

### 1. Abrir DevTools
- Pressione F12
- Vá para a aba "Console"

### 2. Fazer Login
- Email: `admin@restaurant.com`
- Senha: `admin123`
- Clicar em "Entrar"

### 3. Verificar Logs no Console

Você deve ver:
```
🔐 Tentando login... admin@restaurant.com
📡 Enviando requisição de login para: /auth/login
📥 Resposta recebida: { success: true, data: { token: "...", user: {...} } }
✅ Resposta do login: { token: "...", user: {...} }
💾 Dados salvos no localStorage
✅ Login bem-sucedido! Administrador
```

### 4. Verificar Network
- Aba "Network" no DevTools
- Procurar requisição `login`
- Status deve ser `200 OK`
- Response deve ter:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJ...",
      "user": {
        "id": "...",
        "email": "admin@restaurant.com",
        "name": "Administrador",
        "establishmentId": "...",
        "roles": [],
        "permissions": []
      }
    }
  }
  ```

### 5. Verificar LocalStorage
- Aba "Application" → "Local Storage" → `http://localhost:5173`
- Deve ter:
  - `token`: string JWT
  - `user`: JSON com dados do usuário

## Problemas Comuns

### Erro 500
- Backend não está rodando
- Erro no backend (verificar console do backend)
- Usuário não existe no banco

### Erro 401
- Credenciais inválidas
- Senha incorreta

### Não redireciona
- Verificar console para erros
- Verificar se token foi salvo
- Verificar se user foi salvo

### Volta para login
- Token não foi salvo corretamente
- Erro no AuthContext
- Verificar logs no console

## Solução Rápida

Se o login não funcionar:

1. **Limpar cache**:
   - DevTools → Application → Clear storage → Clear site data

2. **Recriar usuário**:
   ```bash
   node create-test-user.js
   ```

3. **Reiniciar servidores**:
   - Backend: Ctrl+C e `npm run dev`
   - Frontend: Ctrl+C e `npm run dev`

4. **Verificar backend**:
   - Abrir: http://localhost:3000/health
   - Deve retornar status OK

## Logs Esperados

### Console do Frontend:
```
🔐 Tentando login... admin@restaurant.com
📡 Enviando requisição de login para: /auth/login
📥 Resposta recebida: {...}
✅ Resposta do login: {...}
💾 Dados salvos no localStorage
✅ Login bem-sucedido! Administrador
```

### Console do Backend:
```
POST /api/v1/auth/login 200 - 150ms
```

## Teste Manual

Abra o console e execute:

```javascript
// Testar login manualmente
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@restaurant.com',
    password: 'admin123'
  })
});

const data = await response.json();
console.log('Resposta:', data);
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {...}
  }
}
```
