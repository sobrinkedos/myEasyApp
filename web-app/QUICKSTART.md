# Quick Start Guide - Frontend Web App

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
cd web-app
npm install
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em: **http://localhost:5173**

### 3. Verificar Backend

Certifique-se de que o backend está rodando em: **http://localhost:3000**

```bash
# Na pasta raiz do projeto
npm run dev
```

## 📁 Estrutura Criada

```
web-app/
├── src/
│   ├── app/
│   │   ├── App.tsx          # Componente principal
│   │   └── router.tsx       # Configuração de rotas
│   ├── index.css            # Estilos globais + Tailwind
│   └── main.tsx             # Entry point
├── index.html               # HTML template
├── package.json             # Dependências
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── tailwind.config.js       # Tailwind config
├── .env.development         # Variáveis de ambiente
└── README.md                # Documentação
```

## ✅ O que foi configurado

- ✅ React 18 + TypeScript
- ✅ Vite (build tool rápido)
- ✅ React Router v6 (roteamento)
- ✅ TanStack Query (server state)
- ✅ Tailwind CSS (estilização)
- ✅ Axios (HTTP client)
- ✅ Socket.IO Client (WebSocket)
- ✅ ESLint + Prettier (qualidade de código)
- ✅ Path aliases (@/)
- ✅ Proxy para API (/api → http://localhost:3000)

## 🎨 Páginas Iniciais

- `/` → Redireciona para `/auth/login`
- `/auth/login` → Página de login (placeholder)
- `/dashboard` → Dashboard (placeholder)
- `/*` → Página 404

## 📝 Próximos Passos

1. **Task 2**: Implementar sistema de roteamento completo
2. **Task 3**: Criar layouts (AuthLayout, DashboardLayout)
3. **Task 4**: Desenvolver componentes de navegação (Sidebar, Topbar)
4. **Task 9**: Implementar AuthContext e autenticação

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

## 🌐 Variáveis de Ambiente

Arquivo `.env.development`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Porta 5173 já está em uso
```bash
# Matar processo na porta 5173
npx kill-port 5173
```

### Erro de conexão com API
- Verifique se o backend está rodando em http://localhost:3000
- Verifique as variáveis de ambiente em `.env.development`

### Erro de módulos não encontrados
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/)
- [Tailwind CSS](https://tailwindcss.com/)
