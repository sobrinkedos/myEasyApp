# 🚀 Iniciar Testes - Frontend Web App

## ✅ Verificação Completa

Todos os arquivos necessários estão presentes e prontos para teste!

## 📋 Passo a Passo para Testar

### 1️⃣ Instalar Dependências

```bash
cd web-app
npm install
```

**Tempo estimado**: 2-3 minutos

### 2️⃣ Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

**Resultado esperado**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3️⃣ Abrir no Navegador

Abrir: **http://localhost:5173**

## 🧪 Roteiro de Testes

### Teste 1: Página de Login ✅

**URL**: `http://localhost:5173/auth/login`

**O que verificar**:
- [ ] Fundo gradiente laranja/vermelho
- [ ] Logo do restaurante centralizado
- [ ] Card branco com formulário
- [ ] Campos de email e senha
- [ ] Botão "Entrar" laranja
- [ ] Link "Esqueceu sua senha?"
- [ ] Footer com copyright

### Teste 2: Navegação Automática ✅

**Ação**: Acessar `http://localhost:5173/`

**Resultado esperado**:
- Redireciona automaticamente para `/auth/login`

### Teste 3: Dashboard (Bypass Ativo) ✅

**URL**: `http://localhost:5173/dashboard`

**O que verificar**:
- [ ] Sidebar à esquerda (desktop)
- [ ] Logo "Restaurant Management"
- [ ] Menu com ícones
- [ ] Topbar com breadcrumbs
- [ ] 4 cards de métricas
- [ ] Seção "Atividade Recente"

### Teste 4: Sidebar - Menu Hierárquico ✅

**Ações**:
1. Clicar em "Vendas"
2. Verificar submenu (Pedidos, Mesas, Caixa)
3. Clicar em "Produtos"
4. Verificar submenu (Produtos, Categorias, Insumos, Estoque)
5. Clicar em "Relatórios"
6. Verificar submenu (4 tipos de relatórios)

**O que verificar**:
- [ ] Ícone chevron rotaciona ao expandir
- [ ] Submenu aparece com animação
- [ ] Itens do submenu têm indentação
- [ ] Hover muda cor de fundo

### Teste 5: Navegação entre Páginas ✅

**Ações**:
1. Clicar em "Dashboard" → Verifica breadcrumb "Dashboard"
2. Clicar em "Produtos" → Verifica breadcrumb "Produtos"
3. Clicar em "Categorias" → Verifica breadcrumb "Categorias"

**O que verificar**:
- [ ] URL muda corretamente
- [ ] Breadcrumbs atualizam
- [ ] Item ativo fica laranja na sidebar
- [ ] Conteúdo da página muda

### Teste 6: Topbar - Notificações ✅

**Ações**:
1. Clicar no ícone de sino (notificações)
2. Verificar dropdown com 3 notificações
3. Verificar badge vermelho com "2"
4. Clicar fora para fechar

**O que verificar**:
- [ ] Dropdown abre suavemente
- [ ] Notificações não lidas têm fundo azul
- [ ] Mostra tempo relativo ("5 min atrás")
- [ ] Link "Ver todas" no rodapé
- [ ] Fecha ao clicar fora

### Teste 7: Topbar - Menu de Usuário ✅

**Ações**:
1. Clicar no avatar do usuário
2. Verificar dropdown com opções
3. Clicar em "Meu Perfil"
4. Verificar navegação

**O que verificar**:
- [ ] Dropdown abre com nome e email
- [ ] Opções: Meu Perfil, Configurações
- [ ] Botão "Sair" em vermelho
- [ ] Navegação funciona

### Teste 8: Responsividade Mobile 📱

**Ações**:
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Selecionar "iPhone 12 Pro"
4. Recarregar página

**O que verificar**:
- [ ] Sidebar oculta por padrão
- [ ] Botão de menu (☰) aparece no topbar
- [ ] Clicar no menu abre drawer
- [ ] Overlay escuro aparece
- [ ] Clicar no overlay fecha drawer
- [ ] Conteúdo se adapta à tela pequena

### Teste 9: Breadcrumbs Dinâmicos ✅

**Ações**:
1. Navegar: Dashboard → Produtos → Categorias
2. Observar breadcrumbs no topbar

**O que verificar**:
- [ ] Breadcrumbs atualizam automaticamente
- [ ] Separador "/" entre itens
- [ ] Último item em negrito
- [ ] Itens anteriores são links clicáveis
- [ ] Clicar em breadcrumb navega corretamente

### Teste 10: Página 404 ✅

**URL**: `http://localhost:5173/pagina-inexistente`

**O que verificar**:
- [ ] Mostra "404"
- [ ] Mensagem "Página não encontrada"
- [ ] Botão "Voltar ao Dashboard"
- [ ] Botão funciona

## 🎨 Checklist Visual

### Cores
- [ ] Primária: Laranja (#f97316)
- [ ] Sidebar: Cinza escuro (#111827)
- [ ] Fundo: Cinza claro (#f9fafb)
- [ ] Item ativo: Laranja
- [ ] Hover: Cinza mais escuro

### Animações
- [ ] Sidebar drawer: slide suave (300ms)
- [ ] Dropdowns: fade in/out
- [ ] Menu expansível: chevron rotaciona
- [ ] Hover states: transições suaves

### Tipografia
- [ ] Títulos: Bold, tamanhos apropriados
- [ ] Texto: Legível, contraste adequado
- [ ] Ícones: Alinhados com texto

## 🐛 Problemas Esperados

### ✅ Normal (Não é Bug)
- Páginas mostram "Coming soon" → Ainda não implementadas
- Notificações são mockadas → Dados de teste
- Usuário é placeholder → Autenticação não implementada
- Formulários não funcionam → Backend não conectado

### ❌ Bugs Reais (Reportar)
- Erro no console do navegador
- Página em branco
- Sidebar não abre em mobile
- Dropdowns não fecham
- Navegação quebrada
- Estilos quebrados

## 📊 Resultado Esperado

Após todos os testes, você deve ter:

✅ Aplicação carregando sem erros
✅ Navegação fluida entre páginas
✅ Sidebar responsiva funcionando
✅ Dropdowns abrindo e fechando
✅ Breadcrumbs atualizando
✅ Design consistente e profissional
✅ Mobile responsivo

## 🎉 Próximos Passos

Após validar que tudo está funcionando:

1. **Implementar Autenticação Real** (Task 9)
2. **Criar Sistema de Modais** (Task 5)
3. **Desenvolver Formulários** (Task 8)
4. **Integrar com Backend** (Task 10)

---

**Dúvidas ou problemas?** Verifique os logs do console (F12) e o terminal onde o Vite está rodando.
