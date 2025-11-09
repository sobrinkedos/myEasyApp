# Documento de Design - Redesign Completo do Website

## Visão Geral

Este documento detalha o design técnico e visual para o redesign completo da aplicação web do Restaurant API Core. O redesign transformará a interface atual em uma experiência moderna, profissional e visualmente atraente, inspirada em componentes contemporâneos e padrões de design de alta qualidade.

### Objetivos do Design

- Criar uma identidade visual moderna e profissional
- Estabelecer um design system consistente e escalável
- Melhorar a experiência do usuário com interfaces intuitivas
- Garantir responsividade e acessibilidade em todos os dispositivos
- Otimizar performance e tempo de carregamento
- Implementar microinterações e feedback visual rico

### Stack Tecnológico

- **Framework**: React 18.2 com TypeScript 5.3
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4 com configuração customizada
- **Ícones**: Lucide React 0.552
- **Animações**: CSS Transitions + Framer Motion (a adicionar)
- **Gráficos**: Recharts ou Chart.js (a adicionar)
- **Drag & Drop**: @dnd-kit (a adicionar)
- **Formulários**: React Hook Form + Zod (já presente)
- **State Management**: React Query (já presente)

## Arquitetura de Componentes

### Estrutura de Diretórios Proposta

```
src/
├── components/
│   ├── ui/                    # Componentes base do design system
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Badge/
│   │   ├── Tooltip/
│   │   ├── Select/
│   │   ├── Dropdown/
│   │   ├── Table/
│   │   └── ...
│   ├── layout/                # Componentes de layout
│   │   ├── Sidebar/
│   │   ├── Topbar/
│   │   ├── PageHeader/
│   │   └── Container/
│   ├── charts/                # Componentes de gráficos
│   │   ├── LineChart/
│   │   ├── BarChart/
│   │   ├── PieChart/
│   │   └── SparklineChart/
│   ├── forms/                 # Componentes de formulário
│   │   ├── FormField/
│   │   ├── ImageUpload/
│   │   ├── DatePicker/
│   │   └── MultiSelect/
│   └── feedback/              # Componentes de feedback
│       ├── Toast/
│       ├── LoadingSpinner/
│       ├── Skeleton/
│       └── EmptyState/
├── design-system/
│   ├── tokens.ts              # Design tokens (cores, espaçamentos, etc)
│   ├── theme.ts               # Configuração de temas
│   └── animations.ts          # Animações reutilizáveis
├── hooks/
│   ├── useTheme.ts
│   ├── useMediaQuery.ts
│   └── useAnimation.ts
└── utils/
    ├── cn.ts                  # Utility para classes CSS
    └── format.ts              # Formatação de dados
```

## Design System

### 1. Paleta de Cores

#### Cores Primárias (Laranja/Âmbar)
```typescript
primary: {
  50: '#fff7ed',   // Muito claro
  100: '#ffedd5',  // Claro
  200: '#fed7aa',  // Claro médio
  300: '#fdba74',  // Médio claro
  400: '#fb923c',  // Médio
  500: '#f97316',  // Base (cor principal)
  600: '#ea580c',  // Escuro médio
  700: '#c2410c',  // Escuro
  800: '#9a3412',  // Muito escuro
  900: '#7c2d12',  // Extremamente escuro
  950: '#431407',  // Quase preto
}
```

#### Cores Secundárias (Azul)
```typescript
secondary: {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Base
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
}
```

#### Cores Neutras (Cinza)
```typescript
neutral: {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
}
```

#### Cores Semânticas
```typescript
semantic: {
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#065f46',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },
}
```

### 2. Tipografia

#### Família de Fontes
```css
font-family: 
  - Primary: 'Inter', system-ui, sans-serif
  - Monospace: 'JetBrains Mono', 'Fira Code', monospace
```

#### Escala Tipográfica
```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
}

fontWeight: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

### 3. Espaçamento

Sistema baseado em múltiplos de 4px:

```typescript
spacing: {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

### 4. Sombras

```typescript
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}
```

### 5. Bordas e Raios

```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}

borderWidth: {
  DEFAULT: '1px',
  0: '0',
  2: '2px',
  4: '4px',
  8: '8px',
}
```

### 6. Animações e Transições

```typescript
transitionDuration: {
  fast: '150ms',
  DEFAULT: '200ms',
  slow: '300ms',
  slower: '500ms',
}

transitionTimingFunction: {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

## Componentes UI Base

### Button Component

#### Variantes
- **Primary**: Fundo sólido com cor primária
- **Secondary**: Fundo sólido com cor secundária
- **Outline**: Borda com fundo transparente
- **Ghost**: Sem borda, hover com fundo sutil

#### Tamanhos
- **Small**: padding 8px 12px, texto sm
- **Medium**: padding 10px 16px, texto base (padrão)
- **Large**: padding 12px 20px, texto lg

#### Estados
- Default, Hover, Active, Focus, Disabled, Loading

#### Exemplo de Implementação
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

### Input Component

#### Características
- Label flutuante (floating label)
- Ícones de prefixo e sufixo
- Mensagens de validação inline
- Estados visuais claros

#### Estados
- Default, Focus, Error, Success, Disabled

#### Exemplo de Implementação
```typescript
interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
}
```

### Card Component

#### Características
- Sombra sutil
- Bordas arredondadas (8px)
- Padding consistente (16px ou 24px)
- Hover com elevação

#### Variantes
- **Default**: Fundo branco, sombra sm
- **Elevated**: Sombra md, hover com sombra lg
- **Outlined**: Borda, sem sombra

### Modal Component

#### Características
- Backdrop com blur
- Animação de entrada/saída (fade + scale)
- Posicionamento centralizado
- Fechamento por ESC ou clique fora

#### Tamanhos
- Small: max-width 400px
- Medium: max-width 600px (padrão)
- Large: max-width 800px
- Full: max-width 1200px

### Table Component

#### Características
- Cabeçalho fixo durante scroll
- Linhas com hover
- Ordenação por coluna
- Seleção múltipla
- Ações inline
- Paginação integrada

#### Densidade
- Compact: padding reduzido
- Default: padding normal
- Comfortable: padding aumentado

## Layout e Navegação

### Sidebar

#### Características
- Largura: 280px (expandida), 80px (colapsada)
- Animação suave de expansão/colapso
- Ícones + labels
- Indicador de seção ativa
- Agrupamento de itens por categoria
- Scroll independente

#### Estrutura
```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  badge?: number;
  children?: SidebarItem[];
}
```

### Topbar

#### Componentes
- Breadcrumbs (navegação hierárquica)
- Busca global (com atalho Cmd+K)
- Notificações (com badge de contagem)
- Menu de usuário (avatar + dropdown)
- Toggle de tema (claro/escuro)

#### Altura
- Desktop: 64px
- Mobile: 56px

### Page Layout

#### Estrutura Padrão
```tsx
<PageContainer>
  <PageHeader
    title="Título da Página"
    subtitle="Descrição opcional"
    actions={<Button>Ação Principal</Button>}
    breadcrumbs={[...]}
  />
  <PageContent>
    {/* Conteúdo da página */}
  </PageContent>
</PageContainer>
```

## Módulos Específicos

### Dashboard

#### Componentes Principais
1. **Metric Cards**: 4 cards no topo com métricas principais
   - Vendas do dia
   - Pedidos ativos
   - Mesas ocupadas
   - Ticket médio

2. **Charts Section**: Gráficos de desempenho
   - Gráfico de linha: Vendas ao longo do tempo
   - Gráfico de barra: Vendas por categoria
   - Gráfico de pizza: Métodos de pagamento

3. **Recent Activity**: Timeline de atividades recentes

4. **Quick Actions**: Atalhos para ações comuns

### Produtos e Receitas

#### Lista de Produtos
- Grid de cards (3-4 colunas)
- Cada card com:
  - Imagem do produto
  - Nome e categoria
  - Preço destacado
  - Badge de disponibilidade
  - Ações rápidas (editar, duplicar, excluir)

#### Detalhes do Produto
- Layout em 2 colunas
- Coluna esquerda: Galeria de imagens
- Coluna direita: Informações e ações
- Tabs para: Informações, Receita, Histórico

#### Editor de Receitas
- Lista de ingredientes com drag-and-drop
- Cálculo automático de custo
- Visualização de árvore de ingredientes
- Indicadores visuais de quantidade

### Pedidos e Comandas

#### Kanban Board
- 4 colunas: Pendente, Preparando, Pronto, Entregue
- Cards de pedido com drag-and-drop
- Cada card mostra:
  - Número do pedido
  - Mesa
  - Itens (resumo)
  - Tempo decorrido
  - Prioridade (cor)

#### Visualização de Comanda
- Modal ou sidebar com detalhes completos
- Lista de itens com preços
- Subtotal, taxas e total
- Opções de pagamento
- Histórico de alterações

### Mesas

#### Grid de Mesas
- Layout em grid responsivo
- Cada card de mesa mostra:
  - Número da mesa
  - Capacidade
  - Status (cor de fundo)
  - Tempo de ocupação
  - Comanda associada

#### Status de Mesa
- Livre: Verde claro
- Ocupada: Laranja
- Reservada: Azul
- Em limpeza: Cinza

### Caixa

#### Painel Principal
- Cards de resumo no topo
- Gráficos de desempenho
- Lista de transações recentes
- Filtros por período e tipo

#### Abertura/Fechamento
- Modal com formulário
- Validação de valores
- Registro de operações
- Impressão de relatório

### Estoque e CMV

#### Cards de Ingredientes
- Grid de cards
- Indicador visual de nível
- Alerta de estoque baixo (vermelho)
- Última movimentação

#### Gráficos de Estoque
- Evolução ao longo do tempo
- Marcadores de entrada/saída
- Filtros por ingrediente e período

#### Dashboard de CMV
- Comparativos de período
- Gráficos por categoria
- Alertas de variação
- Relatórios exportáveis

## Responsividade

### Breakpoints
```typescript
screens: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Adaptações por Breakpoint

#### Mobile (< 768px)
- Sidebar vira menu hamburguer
- Cards empilham verticalmente
- Tabelas viram cards
- Formulários em coluna única
- Topbar reduzida

#### Tablet (768px - 1024px)
- Sidebar colapsada por padrão
- Grid de 2 colunas
- Tabelas com scroll horizontal
- Formulários em 2 colunas

#### Desktop (> 1024px)
- Sidebar expandida
- Grid de 3-4 colunas
- Tabelas completas
- Formulários em múltiplas colunas

## Acessibilidade

### Requisitos WCAG 2.1

1. **Contraste de Cores**: Mínimo 4.5:1 para texto normal
2. **Navegação por Teclado**: Todos os elementos interativos acessíveis
3. **Focus Visible**: Indicadores claros de foco
4. **ARIA Labels**: Labels descritivos para leitores de tela
5. **Landmarks**: Estrutura semântica com roles ARIA
6. **Textos Alternativos**: Alt text para todas as imagens

### Implementação

```typescript
// Exemplo de componente acessível
<button
  aria-label="Adicionar produto"
  aria-pressed={isActive}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  <PlusIcon aria-hidden="true" />
  Adicionar
</button>
```

## Performance

### Estratégias de Otimização

1. **Code Splitting**: Lazy loading de rotas e componentes pesados
2. **Memoization**: React.memo para componentes puros
3. **Virtualization**: Para listas longas (react-window)
4. **Image Optimization**: Lazy loading e formatos modernos (WebP)
5. **Bundle Size**: Análise e redução de dependências
6. **Caching**: Service Worker para assets estáticos

### Métricas Alvo

- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms

## Temas

### Tema Claro (Padrão)

```typescript
lightTheme: {
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e5e5e5',
  },
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#a3a3a3',
  },
  border: '#e5e5e5',
}
```

### Tema Escuro

```typescript
darkTheme: {
  background: {
    primary: '#0a0a0a',
    secondary: '#171717',
    tertiary: '#262626',
  },
  text: {
    primary: '#fafafa',
    secondary: '#a3a3a3',
    tertiary: '#737373',
  },
  border: '#262626',
}
```

### Implementação de Tema

```typescript
// Hook useTheme
const { theme, setTheme, toggleTheme } = useTheme();

// Persistência
localStorage.setItem('theme', theme);

// Detecção de preferência do sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Animações e Microinterações

### Princípios

1. **Propósito**: Toda animação deve ter um propósito claro
2. **Duração**: 150-300ms para a maioria das interações
3. **Easing**: Usar cubic-bezier para movimento natural
4. **Performance**: Animar apenas transform e opacity

### Exemplos de Microinterações

1. **Button Hover**: Scale 1.02 + sombra aumentada
2. **Card Hover**: Elevação (sombra)
3. **Input Focus**: Borda animada + label flutuante
4. **Modal**: Fade in backdrop + scale in content
5. **Toast**: Slide in from top/bottom
6. **Loading**: Skeleton shimmer animation

### Implementação com Framer Motion

```typescript
// Exemplo de animação de modal
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Conteúdo do modal */}
</motion.div>
```

## Estratégia de Implementação

### Fase 1: Fundação (Design System)
1. Configurar Tailwind com tokens customizados
2. Criar componentes UI base
3. Implementar sistema de temas
4. Documentar componentes

### Fase 2: Layout e Navegação
1. Redesenhar Sidebar e Topbar
2. Implementar PageHeader e Container
3. Criar páginas de erro
4. Adicionar transições de rota

### Fase 3: Módulos Principais
1. Dashboard
2. Produtos e Receitas
3. Pedidos e Comandas
4. Mesas e Caixa
5. Estoque e CMV

### Fase 4: Refinamento
1. Adicionar animações e microinterações
2. Otimizar performance
3. Testes de acessibilidade
4. Ajustes responsivos
5. Testes de usabilidade

## Considerações Técnicas

### Compatibilidade de Navegadores

- Chrome/Edge: Últimas 2 versões
- Firefox: Últimas 2 versões
- Safari: Últimas 2 versões
- Mobile: iOS Safari 14+, Chrome Android 90+

### Dependências Adicionais Necessárias

```json
{
  "framer-motion": "^10.16.0",
  "recharts": "^2.10.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "react-hook-form": "^7.49.0",
  "date-fns": "^3.0.0",
  "@headlessui/react": "^1.7.0"
}
```

### Estrutura de Arquivos de Tema

```typescript
// src/design-system/tokens.ts
export const tokens = {
  colors: { /* ... */ },
  spacing: { /* ... */ },
  typography: { /* ... */ },
  shadows: { /* ... */ },
  borderRadius: { /* ... */ },
};

// src/design-system/theme.ts
export const lightTheme = { /* ... */ };
export const darkTheme = { /* ... */ };

// tailwind.config.js
import { tokens } from './src/design-system/tokens';

export default {
  theme: {
    extend: tokens,
  },
};
```

## Conclusão

Este design estabelece uma base sólida para um redesign completo e profissional da aplicação web. A implementação seguirá uma abordagem incremental, começando pelos componentes base do design system e progredindo para os módulos específicos. O foco está em criar uma experiência consistente, acessível e performática que atenda às necessidades dos usuários do Restaurant API Core.
