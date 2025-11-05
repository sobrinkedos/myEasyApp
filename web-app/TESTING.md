# Guia de Teste - Frontend Web App

## 🧪 Como Testar

### 1. Instalar Dependências

```bash
cd web-app
npm install
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

## ✅ O que Testar

### Páginas de Autenticação

1. **Login Page** (`/auth/login`)
   - ✅ Layout centralizado com fundo gradiente
   - ✅ Logo do restaurante no topo
   - ✅ Formulário de email e senha
   - ✅ Link "Esqueceu sua senha?"

2. **Forgot Password** (`/auth/forgot-password`)
   - ✅ Formulário de recuperação de senha
   - ✅ Link "Voltar ao login"

3. **Reset Password** (`/auth/reset-password/:token`)
   - ✅ Formulário de nova senha
   - ✅ Confirmação de senha

### Dashboard (Rotas Protegidas)

**Nota:** Como a autenticação ainda não está implementada, você verá um loading infinito ou redirecionamento para login. Para testar, você pode temporariamente mudar `isAuthenticated` para `true` em `ProtectedRoute.tsx`.

4. **Sidebar** (Desktop e Mobile)
   - ✅ Logo do restaurante
   - ✅ Menu hierárquico com ícones
   - ✅ Grupos expansíveis (Vendas, Produtos, Relatórios, Configurações)
   - ✅ Item ativo destacado em laranja
   - ✅ Seção de usuário no rodapé
   - ✅ Botão de logout
   - ✅ Em mobile: drawer deslizante com overlay

5. **Topbar**
   - ✅ Botão de menu (mobile)
   - ✅ Breadcrumbs dinâmicos
   - ✅ Ícone de notificações com badge
   - ✅ Dropdown de notificações
   - ✅ Avatar do usuário
   - ✅ Dropdown do usuário (Perfil, Configurações, Sair)

6. **Breadcrumbs**
   - ✅ Navegação hierárquica
   - ✅ Links clicáveis
   - ✅ Último item em negrito

7. **Dashboard Page** (`/dashboard`)
   - ✅ Cards de métricas
   - ✅ Seção de atividade recente

8. **Products Page** (`/products`)
   - ✅ Título e botão "Novo Produto"
   - ✅ Placeholder de lista vazia

### Navegação

9. **Testar Rotas**
   - `/dashboard` → Dashboard
   - `/products` → Produtos
   - `/categories` → Categorias (placeholder)
   - `/ingredients` → Insumos (placeholder)
   - `/stock` → Estoque (placeholder)
   - `/orders` → Pedidos (placeholder)
   - `/tables` → Mesas (placeholder)
   - `/cash` → Caixa (placeholder)
   - `/reports/sales` → Relatório de Vendas (placeholder)
   - `/settings/profile` → Perfil (placeholder)

10. **Testar 404**
    - Acessar rota inexistente → Página 404
    - Botão "Voltar ao Dashboard"

## 🔧 Teste Temporário (Bypass Auth)

Para testar as rotas protegidas sem implementar autenticação completa:

1. Abra `web-app/src/components/auth/ProtectedRoute.tsx`
2. Mude a linha:
   ```typescript
   const isAuthenticated = false; // Placeholder
   ```
   Para:
   ```typescript
   const isAuthenticated = true; // Teste temporário
   ```
3. Salve e recarregue a página

Agora você pode navegar livremente pelas rotas protegidas!

## 📱 Teste Responsivo

### Desktop (> 1024px)
- Sidebar fixa à esquerda
- Topbar com breadcrumbs
- Layout completo

### Tablet (768px - 1024px)
- Sidebar oculta
- Botão de menu no topbar
- Sidebar abre como drawer

### Mobile (< 768px)
- Sidebar como drawer
- Overlay escuro quando aberto
- Topbar compacto

## 🎨 Teste Visual

### Cores
- Primária: Laranja (#f97316)
- Sidebar: Cinza escuro (#111827)
- Fundo: Cinza claro (#f9fafb)
- Item ativo: Laranja (#f97316)

### Animações
- Sidebar drawer: slide suave
- Dropdowns: fade in/out
- Hover states: transições suaves
- Menu expansível: rotação do chevron

## 🐛 Problemas Conhecidos

1. **Autenticação não implementada**: Rotas protegidas redirecionam para login
2. **Dados mockados**: Notificações e usuário são placeholders
3. **Páginas placeholder**: Maioria das páginas mostra "Coming soon"

## 📝 Próximos Passos

Após testar, os próximos desenvolvimentos serão:
1. Implementar AuthContext (Task 9)
2. Criar sistema de modais (Task 5)
3. Desenvolver componentes de formulário (Task 8)
4. Integrar com backend API
