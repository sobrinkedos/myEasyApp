# Design Document - Restaurant Design System

## Overview

O Restaurant Design System é um sistema de design completo que fornece componentes, padrões e guidelines para todas as aplicações do ecossistema de gestão de restaurantes. O design é moderno, focado em experiência gastronômica e otimizado para performance em dispositivos móveis e web.

### Princípios de Design

1. **Apetitoso e Convidativo**: Uso de cores quentes, imagens de alta qualidade e tipografia que transmite confiança
2. **Simplicidade e Clareza**: Interfaces limpas com hierarquia visual clara e ações óbvias
3. **Performance First**: Componentes otimizados, lazy loading e feedback imediato
4. **Mobile-First**: Design pensado primeiro para mobile, expandindo progressivamente para desktop
5. **Acessível por Padrão**: Contraste adequado, navegação por teclado e suporte a screen readers

### Aplicações Suportadas

- **Web App de Autoatendimento (PWA)**: Interface para clientes fazerem pedidos via QR Code
- **Mobile App de Garçom**: App nativo para garçons gerenciarem mesas e pedidos
- **Web Admin Dashboard**: Interface administrativa para gestão completa
- **Futuras aplicações**: Delivery, Kitchen Display, etc.

## Architecture

### Estrutura de Pacotes

```
@restaurant-system/design-system/
├── tokens/                 # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   └── index.ts
├── components/            # Componentes React/React Native
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── index.ts
├── hooks/                # Custom hooks
├── utils/                # Utilitários
├── themes/               # Temas (light/dark)
└── index.ts
```

### Stack Tecnológica

- **Web**: React 18+, TypeScript, Styled Components
- **Mobile**: React Native, TypeScript, Styled Components
- **Documentação**: Storybook 7+
- **Build**: Vite para bundling
- **Testes**: Jest + React Testing Library

### Estratégia de Compartilhamento

- Componentes base compartilhados entre web e mobile quando possível
- Componentes específicos de plataforma quando necessário
- Design tokens exportados em múltiplos formatos (JS, CSS Variables, JSON)


## Components and Interfaces

### 1. Design Tokens

#### 1.1 Paleta de Cores

**Cores Primárias** (Laranja/Vermelho apetitoso)
- Primary 500: `#FF7A4D` (cor principal)
- Primary 600: `#E65A2E` (hover)
- Primary 700: `#CC4419` (active)
- Escala completa: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

**Cores Secundárias** (Verde para sucesso/disponível)
- Secondary 500: `#22C55E` (cor principal)
- Secondary 600: `#16A34A` (hover)
- Escala completa: 50 a 900

**Cores Neutras**
- Neutral 0: `#FFFFFF` (branco puro)
- Neutral 50-900: Escala de cinzas
- Neutral 950: `#0A0A0A` (quase preto)

**Cores de Feedback**
- Success: `#22C55E` (verde)
- Error: `#EF4444` (vermelho)
- Warning: `#F59E0B` (amarelo)
- Info: `#3B82F6` (azul)

**Cores de Status**
- Pedido Pendente: `#F59E0B` (amarelo)
- Pedido Em Preparo: `#3B82F6` (azul)
- Pedido Pronto: `#22C55E` (verde)
- Pedido Entregue: `#737373` (cinza)
- Pedido Cancelado: `#EF4444` (vermelho)
- Mesa Disponível: `#22C55E` (verde)
- Mesa Ocupada: `#EF4444` (vermelho)
- Mesa Reservada: `#3B82F6` (azul)

#### 1.2 Tipografia

**Família de Fontes**
- Display/Body: Inter (fallback: system fonts)
- Monospace: Fira Code

**Escala de Tamanhos**
- xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px
- 2xl: 24px, 3xl: 30px, 4xl: 36px, 5xl: 48px

**Pesos**
- Regular: 400, Medium: 500, Semibold: 600, Bold: 700


**Hierarquia Tipográfica**
- H1: 36px/bold/1.2 line-height
- H2: 30px/bold/1.2
- H3: 24px/semibold/1.3
- H4: 20px/semibold/1.4
- Body: 16px/regular/1.5
- Caption: 12px/regular/1.4
- Button: 16px/semibold/1

#### 1.3 Espaçamento

Escala baseada em múltiplos de 4px:
- 0: 0px, 1: 4px, 2: 8px, 3: 12px, 4: 16px
- 5: 20px, 6: 24px, 8: 32px, 10: 40px, 12: 48px, 16: 64px

#### 1.4 Border Radius

- xs: 4px (inputs, tags)
- sm: 8px (cards, buttons)
- md: 12px (modals, sheets)
- lg: 16px (imagens destacadas)
- xl: 24px (elementos especiais)
- full: 9999px (círculos, pills)

#### 1.5 Sombras (Elevações)

- Level 1: `0 1px 3px rgba(0,0,0,0.12)` (cards)
- Level 2: `0 4px 6px rgba(0,0,0,0.1)` (dropdowns)
- Level 3: `0 10px 15px rgba(0,0,0,0.1)` (modals)
- Level 4: `0 20px 25px rgba(0,0,0,0.15)` (overlays)

#### 1.6 Transições

- Fast: 150ms (hover states)
- Normal: 250ms (padrão)
- Slow: 400ms (modals, sheets)
- Easing: ease-in-out (padrão), ease-out (entrada), ease-in (saída)


### 2. Sistema de Grid e Layout

#### 2.1 Breakpoints

```typescript
breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
}
```

#### 2.2 Grid System

- 12 colunas
- Gutter: 16px (mobile), 24px (desktop)
- Container max-width: 1440px
- Padding lateral: 16px (mobile), 24px (tablet), 32px (desktop)

#### 2.3 Layout Patterns

**Mobile (320px-767px)**
- Single column layout
- Bottom navigation (56px height)
- Top bar (56px height)
- Content area: viewport - (top bar + bottom nav)

**Tablet (768px-1023px)**
- 2-column grid para cards
- Side navigation opcional
- Maior espaçamento entre elementos

**Desktop (1024px+)**
- 3-4 column grid para cards
- Sidebar navigation (240px width)
- Maior densidade de informação


### 3. Componentes Atômicos

#### 3.1 Button

**Variantes**
- Primary: Fundo primary-500, texto branco
- Secondary: Fundo secondary-500, texto branco
- Outline: Border primary-500, texto primary-500, fundo transparente
- Ghost: Sem border, texto primary-500, fundo transparente
- Danger: Fundo error, texto branco

**Tamanhos**
- Small: height 32px, padding 8px 12px, fontSize 14px
- Medium: height 40px, padding 10px 16px, fontSize 16px
- Large: height 48px, padding 12px 24px, fontSize 18px

**Estados**
- Default: Cor base
- Hover: Escurece 10% (web), scale 0.98 (mobile)
- Active: Escurece 20%
- Disabled: Opacity 0.5, cursor not-allowed
- Loading: Spinner + texto opcional

**Props Interface**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: ReactNode;
}
```


#### 3.2 Input

**Variantes**
- Text, Email, Password, Number, Tel, URL

**Estados**
- Default: Border neutral-300
- Focus: Border primary-500, ring primary-100
- Error: Border error, ring error-100
- Disabled: Background neutral-100, opacity 0.6

**Estrutura**
- Label (opcional): Typography caption, color neutral-700
- Input field: Height 40px, padding 10px 12px, border-radius sm
- Helper text (opcional): Typography caption, color neutral-500
- Error message: Typography caption, color error

**Props Interface**
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}
```

#### 3.3 Badge

**Variantes**
- Default: Background neutral-100, text neutral-700
- Primary: Background primary-100, text primary-700
- Success: Background success-100, text success-700
- Error: Background error-100, text error-700
- Warning: Background warning-100, text warning-700

**Tamanhos**
- Small: padding 2px 6px, fontSize xs
- Medium: padding 4px 8px, fontSize sm

**Props Interface**
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning';
  size?: 'small' | 'medium';
  children: ReactNode;
}
```


### 4. Componentes de Produto e Cardápio

#### 4.1 ProductCard

**Layout**
- Imagem: Aspect ratio 1:1, border-radius sm, object-fit cover
- Badge de disponibilidade: Position absolute, top-right
- Nome: Typography h4, color neutral-900, max 2 lines com ellipsis
- Descrição: Typography bodySmall, color neutral-600, max 2 lines
- Preço: Typography h3, color primary-500, bold
- Botão de ação: Button small, fullWidth

**Estados**
- Default: Shadow level-1
- Hover: Shadow level-2, transform translateY(-2px)
- Indisponível: Overlay com opacity 0.6, badge "Indisponível"

**Props Interface**
```typescript
interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  onAddToCart: (id: string) => void;
}
```

#### 4.2 CategoryCard

**Layout**
- Ícone: Size 32px, color primary-500
- Nome: Typography h4, color neutral-900
- Contador: Typography caption, color neutral-600
- Background: neutral-50, border-radius md
- Padding: spacing-4

**Estados**
- Default: Background neutral-50
- Hover: Background neutral-100
- Active: Background primary-50, border primary-500

**Props Interface**
```typescript
interface CategoryCardProps {
  id: string;
  icon: ReactNode;
  name: string;
  productCount: number;
  active?: boolean;
  onClick: (id: string) => void;
}
```


#### 4.3 ProductDetail (Modal/Sheet)

**Layout Mobile (Bottom Sheet)**
- Galeria de imagens: Swipeable, indicators
- Nome: Typography h2
- Preço: Typography h3, color primary-500
- Descrição: Typography body
- Informações nutricionais: Collapsible section
- Seletor de quantidade: QuantitySelector
- Observações: Textarea
- Botão adicionar: Button primary, fixed bottom

**Layout Desktop (Modal)**
- Grid 2 colunas: Imagem (60%) | Informações (40%)
- Mesma estrutura de informações
- Modal width: 800px, max-height: 90vh

**Props Interface**
```typescript
interface ProductDetailProps {
  product: {
    id: string;
    images: string[];
    name: string;
    description: string;
    price: number;
    nutritionalInfo?: NutritionalInfo;
    allergens?: string[];
  };
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number, notes: string) => void;
}
```

### 5. Componentes de Pedido e Carrinho

#### 5.1 CartItem

**Layout**
- Imagem: 60x60px, border-radius sm
- Nome: Typography body, semibold
- Observações: Typography caption, color neutral-600, italic
- Quantidade: QuantitySelector small
- Preço: Typography body, semibold, color primary-500
- Botão remover: Icon button, color error

**Props Interface**
```typescript
interface CartItemProps {
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}
```


#### 5.2 CartSummary

**Layout**
- Subtotal: Label + Valor
- Taxa de serviço: Label + Valor (opcional)
- Descontos: Label + Valor (opcional, color success)
- Divider
- Total: Label bold + Valor bold, maior, color primary-500

**Estilo**
- Background: neutral-50
- Padding: spacing-4
- Border-radius: md
- Typography: body para itens, h3 para total

**Props Interface**
```typescript
interface CartSummaryProps {
  subtotal: number;
  serviceCharge?: number;
  discount?: number;
  total: number;
}
```

#### 5.3 OrderCard

**Layout**
- Header: Número do pedido + Status badge
- Itens: Lista resumida (max 3 itens + "e mais X itens")
- Footer: Valor total + Timestamp
- Background: white, border neutral-200, border-radius md

**Estados**
- Default: Border neutral-200
- Clickable: Hover shadow level-2

**Props Interface**
```typescript
interface OrderCardProps {
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  timestamp: Date;
  onClick?: (orderNumber: string) => void;
}
```

#### 5.4 StatusBadge

**Mapeamento de Cores**
- Pending: warning (amarelo)
- Preparing: info (azul)
- Ready: success (verde)
- Delivered: neutral (cinza)
- Cancelled: error (vermelho)

**Layout**
- Ícone + Label
- Padding: 4px 8px
- Border-radius: full
- Typography: caption, semibold


#### 5.5 QuantitySelector

**Layout**
- Botão "-": Icon button, size 32px
- Input numérico: Width 48px, text-align center, readonly
- Botão "+": Icon button, size 32px
- Border: neutral-300, border-radius sm

**Estados**
- Botão "-" disabled quando quantity = 1
- Botão "+" disabled quando quantity = max (se definido)

**Props Interface**
```typescript
interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'small' | 'medium';
}
```

### 6. Componentes de Navegação

#### 6.1 BottomNavigation (Mobile)

**Layout**
- Height: 56px
- Background: white, shadow level-3
- 3-5 itens distribuídos igualmente
- Cada item: Ícone (24px) + Label (caption)
- Item ativo: Color primary-500, semibold
- Item inativo: Color neutral-600

**Props Interface**
```typescript
interface BottomNavigationProps {
  items: Array<{
    id: string;
    icon: ReactNode;
    label: string;
    path: string;
  }>;
  activeItem: string;
  onNavigate: (id: string) => void;
}
```

#### 6.2 TopBar/Header

**Layout**
- Height: 56px
- Background: white, shadow level-1
- Padding: 0 spacing-4
- Left: Botão voltar ou logo
- Center: Título (h4)
- Right: Ícones de ação (busca, notificações, menu)

**Variantes**
- Default: Com título centralizado
- WithBack: Botão voltar + título à esquerda
- Transparent: Background transparent (para uso com imagens)

**Props Interface**
```typescript
interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: Array<{
    icon: ReactNode;
    onClick: () => void;
    badge?: number;
  }>;
  transparent?: boolean;
}
```


#### 6.3 Sidebar (Web Admin)

**Layout**
- Width: 240px (expandido), 64px (colapsado)
- Background: neutral-900
- Logo: Top, padding spacing-4
- Menu items: Ícone + Label (quando expandido)
- User section: Bottom, avatar + nome + logout
- Item ativo: Background primary-500

**Props Interface**
```typescript
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  menuItems: Array<{
    id: string;
    icon: ReactNode;
    label: string;
    path: string;
    badge?: number;
  }>;
  activeItem: string;
  user: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
}
```

#### 6.4 Tabs

**Layout**
- Horizontal scroll em mobile
- Cada tab: Padding 12px 16px
- Indicador: Border-bottom 2px primary-500 ou background primary-50
- Typography: body, semibold quando ativo

**Props Interface**
```typescript
interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
  activeTab: string;
  onChange: (id: string) => void;
}
```

### 7. Componentes de Feedback

#### 7.1 Toast/Snackbar

**Layout**
- Position: Fixed bottom (mobile), top-right (desktop)
- Width: 100% - 32px (mobile), 360px (desktop)
- Padding: spacing-4
- Border-radius: md
- Shadow: level-3
- Ícone + Mensagem + Botão fechar (opcional)

**Variantes**
- Success: Background success-50, border success-500
- Error: Background error-50, border error-500
- Warning: Background warning-50, border warning-500
- Info: Background info-50, border info-500

**Comportamento**
- Auto-dismiss: 3s (success), 5s (error/warning), 4s (info)
- Animação entrada: Slide up (mobile), Slide left (desktop)
- Animação saída: Fade out


#### 7.2 Modal/Dialog

**Layout Desktop**
- Overlay: Background rgba(0,0,0,0.5)
- Container: Width 480px (small), 640px (medium), 800px (large)
- Background: white, border-radius lg, shadow level-4
- Header: Título (h3) + Botão fechar
- Content: Padding spacing-6, max-height 70vh, scroll
- Footer: Botões de ação, align right

**Layout Mobile (BottomSheet)**
- Slide up from bottom
- Border-radius top: lg
- Handle: Drag indicator no topo
- Gesture: Swipe down para fechar

**Props Interface**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
}
```

#### 7.3 Alert (Inline)

**Layout**
- Padding: spacing-4
- Border-radius: md
- Border-left: 4px solid (cor da variante)
- Ícone + Título + Descrição + Botão fechar (opcional)

**Variantes**
- Success, Error, Warning, Info (mesmas cores do Toast)

**Props Interface**
```typescript
interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description: string;
  closable?: boolean;
  onClose?: () => void;
}
```

#### 7.4 LoadingOverlay

**Layout**
- Position: Fixed, full screen
- Background: rgba(255,255,255,0.9)
- Center: Spinner + Mensagem (opcional)
- Z-index: 9999

**Props Interface**
```typescript
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}
```


### 8. Componentes de Mesa e Comanda

#### 8.1 TableCard

**Layout**
- Size: 120x120px (mobile), 140x140px (desktop)
- Border-radius: md
- Background: Cor baseada no status
- Center: Número da mesa (h2) + Ícone de status
- Bottom: Capacidade + Tempo de ocupação (se ocupada)

**Cores por Status**
- Disponível: Background success-50, border success-500
- Ocupada: Background error-50, border error-500
- Reservada: Background info-50, border info-500

**Props Interface**
```typescript
interface TableCardProps {
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  occupiedTime?: number; // minutos
  onClick: (number: string) => void;
}
```

#### 8.2 TableGrid

**Layout**
- Grid responsivo: 3 cols (mobile), 4 cols (tablet), 6 cols (desktop)
- Gap: spacing-4
- Permite drag & drop para reorganizar (admin)

**Props Interface**
```typescript
interface TableGridProps {
  tables: Table[];
  onTableClick: (tableNumber: string) => void;
  editable?: boolean;
  onReorder?: (tables: Table[]) => void;
}
```

#### 8.3 CommandaCard

**Layout**
- Background: white, border neutral-200, border-radius md
- Padding: spacing-4
- Header: Número comanda + Badge status
- Body: Mesa + Garçom + Tempo decorrido
- Footer: Valor total (h3, primary-500) + Botão ação

**Props Interface**
```typescript
interface CommandaCardProps {
  number: string;
  tableNumber: string;
  waiter: string;
  elapsedTime: number; // minutos
  total: number;
  status: 'open' | 'closed' | 'paid';
  onAction: (number: string) => void;
}
```


#### 8.4 CommandaDetail

**Layout**
- Header: Número + Mesa + Status + Tempo
- Timeline: Lista de pedidos com status e horários
- Cada pedido: OrderCard compacto
- Summary: CartSummary com totais
- Actions: Botões "Adicionar Pedido", "Fechar Conta"

**Props Interface**
```typescript
interface CommandaDetailProps {
  comanda: {
    number: string;
    tableNumber: string;
    waiter: string;
    openedAt: Date;
    orders: Order[];
    subtotal: number;
    serviceCharge: number;
    total: number;
  };
  onAddOrder: () => void;
  onClose: () => void;
}
```

### 9. Sistema de Ícones

**Biblioteca Base**: Lucide React / Lucide React Native

**Categorias de Ícones**

**Navegação** (15 ícones)
- Home, Search, Menu, User, ShoppingCart, Bell, Settings, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, MoreVertical, MoreHorizontal

**Ações** (20 ícones)
- Plus, Minus, Edit, Trash, Check, X, Save, Download, Upload, Share, Copy, Eye, EyeOff, Heart, Star, Filter, Sort, Refresh, Info, Help

**Status** (10 ícones)
- CheckCircle, XCircle, AlertCircle, AlertTriangle, Clock, Calendar, MapPin, Phone, Mail, Link

**Comida e Restaurante** (15 ícones)
- UtensilsCrossed, Coffee, Wine, Pizza, Salad, IceCream, Cake, Apple, Beef, Fish, Vegetable, Spoon, Fork, Knife, ChefHat

**Gestão** (20 ícones)
- Table (mesa), Receipt (comanda), ClipboardList (pedidos), Package (estoque), TrendingUp (relatórios), Users (equipe), DollarSign (pagamento), CreditCard, Barcode, QrCode, Printer, FileText, FolderOpen, Database, Server, Activity, PieChart, BarChart, LineChart, Grid

**Configuração de Ícones**
```typescript
interface IconProps {
  size?: 16 | 20 | 24 | 32;
  color?: string;
  strokeWidth?: 1.5 | 2 | 2.5;
}
```


### 10. Componentes de Busca e Filtros

#### 10.1 SearchBar

**Layout**
- Height: 40px
- Border-radius: full
- Background: neutral-100
- Padding: 0 spacing-4
- Ícone busca (left) + Input + Botão limpar (right, quando tem texto)

**Estados**
- Default: Background neutral-100
- Focus: Background white, border primary-500, shadow level-1

**Autocomplete**
- Dropdown abaixo do input
- Max 5 sugestões
- Highlight do termo buscado

**Props Interface**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSearch: (value: string) => void;
}
```

#### 10.2 FilterChip

**Layout**
- Padding: 8px 12px
- Border-radius: full
- Border: 1px solid neutral-300
- Typography: bodySmall

**Estados**
- Default: Background white, border neutral-300
- Selected: Background primary-500, color white, border primary-500
- Hover: Border primary-500

**Props Interface**
```typescript
interface FilterChipProps {
  label: string;
  selected: boolean;
  count?: number;
  icon?: ReactNode;
  onClick: () => void;
}
```

#### 10.3 FilterSheet/Modal

**Layout**
- Header: Título "Filtros" + Botão fechar
- Sections: Categorias, Preço, Avaliação, etc.
- Cada section: Label + Opções (checkboxes ou range)
- Footer: Botão "Limpar" (ghost) + Botão "Aplicar" (primary)

**Props Interface**
```typescript
interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  selectedFilters: SelectedFilters;
  onApply: (filters: SelectedFilters) => void;
  onClear: () => void;
}
```


### 11. Componentes de Imagem e Mídia

#### 11.1 Image

**Aspect Ratios**
- Square (1:1): Product cards
- Landscape (16:9): Banners, hero images
- Portrait (3:4): Product detail

**Comportamento**
- Lazy loading: Intersection Observer
- Placeholder: Skeleton com cor neutral-200
- Error fallback: Ícone + mensagem, background neutral-100
- Object-fit: cover (padrão)

**Props Interface**
```typescript
interface ImageProps {
  src: string;
  alt: string;
  aspectRatio?: '1:1' | '16:9' | '3:4';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';
  objectFit?: 'cover' | 'contain';
  onLoad?: () => void;
  onError?: () => void;
}
```

#### 11.2 ImageGallery

**Layout Mobile**
- Swipeable carousel
- Indicators (dots) no bottom
- Zoom: Pinch to zoom
- Fullscreen: Tap para expandir

**Layout Desktop**
- Thumbnails à esquerda (vertical) ou embaixo (horizontal)
- Imagem principal: Click para fullscreen
- Navegação: Arrows left/right

**Props Interface**
```typescript
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  initialIndex?: number;
  showThumbnails?: boolean;
  allowZoom?: boolean;
}
```

#### 11.3 Avatar

**Tamanhos**
- Small: 32x32px
- Medium: 40x40px
- Large: 56x56px

**Variantes**
- Image: Exibe imagem do usuário
- Initials: Exibe iniciais (ex: "JD" para João Dias)
- Icon: Exibe ícone de usuário genérico

**Props Interface**
```typescript
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  fallback?: 'initials' | 'icon';
}
```


## Data Models

### Theme Configuration

```typescript
interface Theme {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  transitions: Transitions;
}

interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  feedback: FeedbackColors;
  orderStatus: OrderStatusColors;
  tableStatus: TableStatusColors;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Main color
  600: string;
  700: string;
  800: string;
  900: string;
}
```

### Component Props Types

```typescript
// Base props compartilhadas
interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

// Props de tamanho
type Size = 'small' | 'medium' | 'large';

// Props de variante
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Props de status
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
type TableStatus = 'available' | 'occupied' | 'reserved';
type CommandaStatus = 'open' | 'closed' | 'paid';
```


## Error Handling

### Estratégias de Error Handling

#### 1. Imagens que Falham ao Carregar
- Exibir placeholder com ícone e mensagem
- Background neutral-100
- Ícone ImageOff, color neutral-400
- Mensagem "Imagem não disponível"

#### 2. Componentes com Dados Ausentes
- Validar props obrigatórias
- Exibir warning no console (dev mode)
- Renderizar fallback apropriado

#### 3. Estados de Loading
- Skeleton screens para conteúdo
- Spinners para ações
- Disable buttons durante loading
- Mostrar feedback visual claro

#### 4. Estados Vazios (Empty States)
- Ilustração ou ícone grande
- Título descritivo
- Mensagem explicativa
- Call-to-action quando aplicável

**Exemplo Empty State**
```typescript
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Error Boundaries

Implementar Error Boundaries para capturar erros em componentes:

```typescript
interface ErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}
```

## Testing Strategy

### Níveis de Teste

#### 1. Unit Tests (Jest + React Testing Library)
- Testar cada componente isoladamente
- Verificar renderização com diferentes props
- Testar interações do usuário (clicks, inputs)
- Verificar estados (hover, focus, disabled)
- Coverage mínimo: 80%

#### 2. Visual Regression Tests (Storybook + Chromatic)
- Capturar screenshots de todos os componentes
- Detectar mudanças visuais não intencionais
- Testar em diferentes viewports
- Testar temas light/dark

#### 3. Accessibility Tests
- Usar jest-axe para testes automatizados
- Verificar contraste de cores
- Testar navegação por teclado
- Verificar atributos ARIA
- Testar com screen readers (manual)

#### 4. Integration Tests
- Testar composição de componentes
- Verificar fluxos completos (ex: adicionar ao carrinho)
- Testar interações entre componentes

### Estrutura de Testes

```typescript
describe('Button', () => {
  it('renders with correct text', () => {});
  it('calls onClick when clicked', () => {});
  it('is disabled when disabled prop is true', () => {});
  it('shows loading state', () => {});
  it('renders with different variants', () => {});
  it('renders with different sizes', () => {});
  it('is accessible', () => {});
});
```


### Temas (Light/Dark Mode)

#### Implementação de Temas

**ThemeProvider**
```typescript
interface ThemeProviderProps {
  theme?: 'light' | 'dark' | 'auto';
  children: ReactNode;
}

// Hook para usar tema
function useTheme() {
  const { theme, setTheme } = useContext(ThemeContext);
  return { theme, setTheme, isDark: theme === 'dark' };
}
```

**Tema Light (Padrão)**
- Background: white (#FFFFFF)
- Surface: neutral-50 (#FAFAFA)
- Text primary: neutral-900 (#171717)
- Text secondary: neutral-600 (#525252)
- Border: neutral-200 (#E5E5E5)

**Tema Dark**
- Background: neutral-950 (#0A0A0A)
- Surface: neutral-900 (#171717)
- Text primary: neutral-50 (#FAFAFA)
- Text secondary: neutral-400 (#A3A3A3)
- Border: neutral-800 (#262626)

**Cores que Não Mudam**
- Primary, Secondary, Feedback colors mantêm mesmos valores
- Ajustar apenas opacity quando necessário para contraste

**Transição de Tema**
- Usar CSS transitions para suavizar mudança
- Transition: background-color 250ms ease-in-out, color 250ms ease-in-out
- Evitar flash/flickering ao carregar

#### Persistência de Preferência

- Salvar preferência em localStorage
- Respeitar preferência do sistema (prefers-color-scheme)
- Ordem de prioridade: localStorage > sistema > padrão (light)

### Acessibilidade (a11y)

#### Requisitos WCAG 2.1 AA

**Contraste de Cores**
- Texto normal (< 18px): Mínimo 4.5:1
- Texto grande (≥ 18px ou ≥ 14px bold): Mínimo 3:1
- Componentes UI: Mínimo 3:1

**Navegação por Teclado**
- Tab: Navegar entre elementos focáveis
- Enter/Space: Ativar botões e links
- Esc: Fechar modals e dropdowns
- Arrow keys: Navegar em listas e menus

**Focus Indicators**
- Outline: 2px solid primary-500
- Offset: 2px
- Border-radius: Seguir border-radius do elemento
- Nunca remover outline sem substituir por alternativa visível

**Atributos ARIA**
- aria-label: Para elementos sem texto visível
- aria-describedby: Para descrições adicionais
- aria-expanded: Para elementos expansíveis
- aria-selected: Para elementos selecionáveis
- role: Para elementos customizados

**Tamanhos de Toque (Mobile)**
- Mínimo: 44x44px (iOS), 48x48px (Android)
- Espaçamento entre elementos tocáveis: Mínimo 8px

**Screen Readers**
- Usar HTML semântico (button, nav, main, etc)
- Fornecer alt text para imagens
- Anunciar mudanças dinâmicas (aria-live)
- Ocultar elementos decorativos (aria-hidden)


### Animações e Transições

#### Princípios de Animação

1. **Propósito**: Toda animação deve ter propósito (feedback, guiar atenção, mostrar relação)
2. **Performance**: Usar transform e opacity (GPU accelerated)
3. **Duração**: Rápido o suficiente para não atrasar, lento o suficiente para ser percebido
4. **Easing**: Natural e consistente

#### Durações Padrão

```typescript
transitions = {
  fast: '150ms',    // Hover states, ripples
  normal: '250ms',  // Padrão para maioria das transições
  slow: '400ms',    // Modals, sheets, page transitions
}
```

#### Easing Functions

```typescript
easing = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',      // Aceleração
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',     // Desaceleração (padrão)
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Suave início e fim
}
```

#### Animações Específicas

**Button Hover (Web)**
```css
transition: background-color 150ms ease-out, transform 150ms ease-out;
&:hover {
  transform: translateY(-1px);
}
```

**Button Press (Mobile)**
```css
&:active {
  transform: scale(0.98);
  transition: transform 100ms ease-in;
}
```

**Modal Enter**
```css
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: modalEnter 250ms ease-out;
```

**Bottom Sheet Enter**
```css
@keyframes sheetEnter {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
animation: sheetEnter 300ms ease-out;
```

**Toast Enter**
```css
@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: toastEnter 250ms ease-out;
```

**Skeleton Loading**
```css
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}
animation: shimmer 1.5s infinite linear;
```

**Ripple Effect**
```css
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
animation: ripple 600ms ease-out;
```

#### Redução de Movimento

Respeitar preferência do usuário (prefers-reduced-motion):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```


### Documentação e Storybook

#### Estrutura do Storybook

```
.storybook/
├── main.js              # Configuração principal
├── preview.js           # Decorators e parâmetros globais
└── theme.js             # Tema customizado do Storybook

stories/
├── Introduction.stories.mdx
├── DesignTokens/
│   ├── Colors.stories.mdx
│   ├── Typography.stories.mdx
│   ├── Spacing.stories.mdx
│   └── Shadows.stories.mdx
├── Components/
│   ├── Atoms/
│   │   ├── Button.stories.tsx
│   │   ├── Input.stories.tsx
│   │   └── Badge.stories.tsx
│   ├── Molecules/
│   │   ├── ProductCard.stories.tsx
│   │   ├── CartItem.stories.tsx
│   │   └── SearchBar.stories.tsx
│   └── Organisms/
│       ├── BottomNavigation.stories.tsx
│       ├── TopBar.stories.tsx
│       └── CommandaDetail.stories.tsx
└── Templates/
    ├── MenuPage.stories.tsx
    ├── CartPage.stories.tsx
    └── OrdersPage.stories.tsx
```

#### Formato de Story

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
```

#### Documentação de Componente

Cada componente deve ter:

1. **Descrição**: O que é e quando usar
2. **Props**: Tabela com todas as props, tipos e valores padrão
3. **Variantes**: Exemplos visuais de todas as variantes
4. **Estados**: Default, hover, active, disabled, loading
5. **Tamanhos**: Exemplos de todos os tamanhos
6. **Exemplos de Uso**: Code snippets
7. **Acessibilidade**: Notas sobre a11y
8. **Best Practices**: Do's and Don'ts

#### Templates de Páginas

Fornecer templates completos para páginas principais:

1. **Menu/Cardápio**
   - TopBar com busca
   - Filtros por categoria
   - Grid de ProductCards
   - BottomNavigation

2. **Carrinho**
   - TopBar com título
   - Lista de CartItems
   - CartSummary fixo no bottom
   - Botão "Confirmar Pedido"

3. **Meus Pedidos**
   - TopBar
   - Lista de OrderCards
   - Empty state quando sem pedidos
   - BottomNavigation

4. **Gestão de Mesas (Garçom)**
   - TopBar com filtros
   - TableGrid
   - Floating action button "Nova Comanda"

5. **Dashboard Admin**
   - Sidebar
   - Header com breadcrumbs
   - Cards de métricas
   - Gráficos e tabelas


## Implementation Guidelines

### Estrutura de Arquivos de Componente

```
Button/
├── Button.tsx           # Componente principal
├── Button.styles.ts     # Styled components
├── Button.test.tsx      # Testes
├── Button.stories.tsx   # Storybook stories
├── index.ts            # Export
└── types.ts            # TypeScript types
```

### Padrões de Código

#### 1. TypeScript Strict Mode
- Usar strict mode
- Evitar `any`, usar `unknown` quando necessário
- Definir interfaces para todas as props

#### 2. Styled Components
```typescript
import styled from 'styled-components';

export const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  /* Use $ prefix para props transientes */
  background-color: ${({ theme, $variant }) => theme.colors[$variant][500]};
  padding: ${({ theme, $size }) => theme.spacing[$size]};
  
  /* Evite props que conflitam com HTML */
  /* Use theme para acessar tokens */
`;
```

#### 3. Composição de Componentes
```typescript
// Preferir composição a props complexas
<Card>
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Body>Conteúdo</Card.Body>
  <Card.Footer>
    <Button>Ação</Button>
  </Card.Footer>
</Card>
```

#### 4. Hooks Customizados
```typescript
// Extrair lógica complexa para hooks
function useProductCard(productId: string) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  
  // ... lógica
  
  return { product, loading, addToCart };
}
```

### Performance

#### 1. Code Splitting
- Lazy load componentes pesados
- Usar React.lazy e Suspense
- Split por rota quando possível

#### 2. Memoization
```typescript
// Usar memo para componentes que re-renderizam frequentemente
export const ProductCard = memo(({ product, onAddToCart }: Props) => {
  // ...
});

// Usar useMemo para cálculos pesados
const filteredProducts = useMemo(
  () => products.filter(p => p.category === selectedCategory),
  [products, selectedCategory]
);

// Usar useCallback para funções passadas como props
const handleAddToCart = useCallback(
  (id: string) => {
    addToCart(id);
  },
  [addToCart]
);
```

#### 3. Imagens
- Usar lazy loading
- Fornecer múltiplos tamanhos (srcset)
- Comprimir imagens (WebP quando possível)
- Usar placeholders durante carregamento

#### 4. Bundle Size
- Tree shaking: Exportar componentes individualmente
- Evitar importar bibliotecas inteiras
- Analisar bundle com webpack-bundle-analyzer

### Versionamento e Releases

#### Semantic Versioning
- MAJOR: Breaking changes
- MINOR: Novas features (backward compatible)
- PATCH: Bug fixes

#### Changelog
Manter CHANGELOG.md atualizado com:
- Added: Novos componentes/features
- Changed: Mudanças em componentes existentes
- Deprecated: Features que serão removidas
- Removed: Features removidas
- Fixed: Bug fixes
- Security: Correções de segurança

#### Release Process
1. Atualizar versão no package.json
2. Atualizar CHANGELOG.md
3. Criar tag no git
4. Publicar no npm
5. Atualizar documentação
6. Comunicar breaking changes

### Migration Guide

Quando houver breaking changes, fornecer guia de migração:

```markdown
## Migrating from v1 to v2

### Button Component

**Before (v1)**
```tsx
<Button color="primary" size="md">Click</Button>
```

**After (v2)**
```tsx
<Button variant="primary" size="medium">Click</Button>
```

**Changes**
- Renamed `color` prop to `variant`
- Renamed size `md` to `medium`
```

### Suporte e Contribuição

#### Issues
- Template para bug reports
- Template para feature requests
- Labels para categorização

#### Pull Requests
- Template de PR
- Checklist: testes, documentação, changelog
- Code review obrigatório
- CI/CD: testes automatizados, lint, build

#### Contribuindo
1. Fork do repositório
2. Criar branch feature/fix
3. Implementar mudanças
4. Adicionar testes
5. Atualizar documentação
6. Submeter PR
