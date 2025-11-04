# Design Document - Web App de Gestão

## Overview

O Web App de Gestão é uma aplicação web responsiva construída com React e Next.js que fornece interface completa para administração do sistema de restaurante. A aplicação consome a API RESTful do backend e recebe atualizações em tempo real via WebSocket.

### Tecnologias Principais

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 com TypeScript
- **Styling**: TailwindCSS 3.x + shadcn/ui
- **State Management**: Zustand + React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **WebSocket**: Socket.io Client
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Architecture

### Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas de autenticação
│   │   └── login/
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   │   ├── layout.tsx     # Layout com sidebar
│   │   ├── page.tsx       # Dashboard principal
│   │   ├── products/
│   │   ├── categories/
│   │   ├── ingredients/
│   │   ├── stock/
│   │   ├── tables/
│   │   ├── commands/
│   │   ├── counter-sales/
│   │   ├── reports/
│   │   └── settings/
│   └── layout.tsx         # Root layout
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── forms/            # Componentes de formulário
│   ├── tables/           # Componentes de tabela
│   ├── charts/           # Componentes de gráfico
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
│   ├── api/             # Cliente API e endpoints
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── utils/           # Funções utilitárias
│   └── validations/     # Schemas Zod
├── types/               # TypeScript types
└── styles/              # Estilos globais
```

### Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────┐
│                   App Layout                         │
│  ┌───────────────────────────────────────────────┐  │
│  │              Navigation Bar                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────────────────────────┐    │
│  │          │  │                               │    │
│  │ Sidebar  │  │      Page Content             │    │
│  │          │  │                               │    │
│  │  - Home  │  │  ┌─────────────────────────┐ │    │
│  │  - Prod  │  │  │   Page Component        │ │    │
│  │  - Stock │  │  │                         │ │    │
│  │  - Sales │  │  │  - Fetch Data (React    │ │    │
│  │  - Rept  │  │  │    Query)               │ │    │
│  │          │  │  │  - Render UI            │ │    │
│  │          │  │  │  - Handle Actions       │ │    │
│  │          │  │  └─────────────────────────┘ │    │
│  └──────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Authentication Module

**Componentes**:
- `LoginPage`: Página de login
- `AuthProvider`: Context provider para autenticação
- `ProtectedRoute`: HOC para rotas protegidas

**Interfaces**:

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### 2. Dashboard Module

**Componentes**:
- `DashboardPage`: Página principal com métricas
- `MetricCard`: Card de métrica individual
- `SalesChart`: Gráfico de vendas
- `LowStockAlert`: Alerta de estoque baixo
- `OpenCommandsList`: Lista de comandas abertas

**Interfaces**:

```typescript
interface DashboardMetrics {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  openCommands: number;
  lowStockItems: number;
}

interface SalesChartData {
  date: string;
  sales: number;
}

interface LowStockItem {
  id: string;
  name: string;
  currentQuantity: number;
  minimumQuantity: number;
  unit: string;
}
```

### 3. Product Management Module

**Componentes**:
- `ProductsPage`: Listagem de produtos
- `ProductForm`: Formulário de produto
- `ProductCard`: Card de produto
- `ImageUpload`: Upload de imagem

**Interfaces**:

```typescript
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  category: Category;
  imageUrl: string | null;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: File;
}
```



### 4. Stock Management Module

**Componentes**:
- `StockPage`: Página de controle de estoque
- `StockTransactionForm`: Formulário de movimentação
- `StockHistoryTable`: Tabela de histórico
- `StockReportExport`: Exportação de relatórios

**Interfaces**:

```typescript
interface StockTransaction {
  id: string;
  ingredientId: string;
  ingredient: Ingredient;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string | null;
  user: User;
  createdAt: Date;
}

interface StockTransactionFormData {
  ingredientId: string;
  type: 'in' | 'out';
  quantity: number;
  reason?: string;
}
```

### 5. Counter Sales Module

**Componentes**:
- `CounterSalesPage`: Página de vendas no balcão
- `ProductCatalog`: Catálogo de produtos
- `ShoppingCart`: Carrinho de compras
- `CheckoutModal`: Modal de finalização

**Interfaces**:

```typescript
interface CartItem {
  product: Product;
  quantity: number;
  observations?: string;
  subtotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
}

interface CheckoutData {
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'pix';
}
```

### 6. Commands Visualization Module

**Componentes**:
- `CommandsPage`: Página de comandas
- `CommandCard`: Card de comanda
- `CommandDetailsModal`: Modal com detalhes
- `OrderStatusBadge`: Badge de status de pedido

**Interfaces**:

```typescript
interface Command {
  id: string;
  code: string;
  table: Table | null;
  waiter: User;
  numberOfPeople: number;
  status: 'open' | 'closed' | 'paid';
  total: number;
  openedAt: Date;
  orders: Order[];
}

interface Order {
  id: string;
  orderNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  createdAt: Date;
}
```

## State Management

### Zustand Stores

```typescript
// Auth Store
interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

// Cart Store (Counter Sales)
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, observations?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, quantity, observations) => {
    const items = get().items;
    const existingItem = items.find(i => i.product.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * product.price }
            : i
        )
      });
    } else {
      set({
        items: [...items, {
          product,
          quantity,
          observations,
          subtotal: quantity * product.price
        }]
      });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(i =>
        i.product.id === productId
          ? { ...i, quantity, subtotal: quantity * i.product.price }
          : i
      )
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0)
}));
```

### React Query Configuration

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Custom hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then(res => res.data.data)
  });
};

export const useOpenCommands = () => {
  return useQuery({
    queryKey: ['commands', 'open'],
    queryFn: () => api.get('/commands/open').then(res => res.data.data),
    refetchInterval: 30000 // Atualizar a cada 30s
  });
};
```

## API Integration

### Axios Configuration

```typescript
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000
});

// Request interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Service Layer

```typescript
// services/products.ts
export const productsService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },
  
  create: async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },
  
  update: async (id: string, data: Partial<ProductFormData>) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  }
};
```

## WebSocket Integration

### Socket.io Client Setup

```typescript
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth';

let socket: Socket | null = null;

export const initializeSocket = () => {
  const token = useAuthStore.getState().token;
  
  if (!token) return;
  
  socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
    auth: { token }
  });
  
  socket.on('connect', () => {
    console.log('WebSocket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Real-time Updates Hook

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';

export const useRealtimeCommands = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    // Atualizar quando novo pedido é criado
    socket.on('new_order', () => {
      queryClient.invalidateQueries({ queryKey: ['commands', 'open'] });
    });
    
    // Atualizar quando status de pedido muda
    socket.on('order_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['commands', 'open'] });
    });
    
    return () => {
      socket.off('new_order');
      socket.off('order_status_changed');
    };
  }, [queryClient]);
};
```



## Form Validation

### Zod Schemas

```typescript
import { z } from 'zod';

// Product validation
export const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('Preço deve ser maior que zero'),
  categoryId: z.string().uuid('Categoria inválida'),
  image: z.instanceof(File).optional()
});

// Stock transaction validation
export const stockTransactionSchema = z.object({
  ingredientId: z.string().uuid('Insumo inválido'),
  type: z.enum(['in', 'out']),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  reason: z.string().max(200).optional()
});

// Counter sale validation
export const counterSaleSchema = z.object({
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    observations: z.string().max(200).optional()
  })).min(1, 'Adicione pelo menos um item'),
  paymentMethod: z.enum(['cash', 'card', 'pix'])
});
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nome</label>
        <input {...register('name')} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>
      
      <div>
        <label>Preço</label>
        <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
        {errors.price && <span className="error">{errors.price.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
};
```

## UI Components (shadcn/ui)

### Component Library

```typescript
// Button component
import { Button } from '@/components/ui/button';

<Button variant="default" size="md" onClick={handleClick}>
  Salvar
</Button>

// Dialog component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Adicionar Produto</DialogTitle>
    </DialogHeader>
    <ProductForm onSubmit={handleSubmit} />
  </DialogContent>
</Dialog>

// Table component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Preço</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {products.map(product => (
      <TableRow key={product.id}>
        <TableCell>{product.name}</TableCell>
        <TableCell>{formatCurrency(product.price)}</TableCell>
        <TableCell>
          <Button size="sm" onClick={() => handleEdit(product)}>Editar</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Toast notifications
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

toast({
  title: 'Sucesso!',
  description: 'Produto criado com sucesso',
  variant: 'success'
});
```

## Responsive Design

### Breakpoints (TailwindCSS)

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large Desktop
      '2xl': '1536px'  // Extra Large
    }
  }
};
```

### Responsive Components

```tsx
// Sidebar responsivo
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile: Hamburger button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </button>
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        inset-y-0 left-0
        w-64 bg-white
        transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40
      `}>
        {/* Sidebar content */}
      </aside>
      
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading de páginas
import dynamic from 'next/dynamic';

const ReportsPage = dynamic(() => import('./reports/page'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// Lazy loading de componentes pesados
const ChartComponent = dynamic(() => import('@/components/charts/SalesChart'), {
  loading: () => <div>Carregando gráfico...</div>
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={product.imageUrl || '/placeholder.png'}
  alt={product.name}
  width={200}
  height={200}
  className="object-cover rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder-blur.png"
/>
```

### Debounce Search

```typescript
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

export const ProductSearch = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  
  const { data: products } = useQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: () => productsService.search(debouncedSearch),
    enabled: debouncedSearch.length > 0
  });
  
  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar produtos..."
    />
  );
};
```

## Testing Strategy

### Component Testing (Jest + React Testing Library)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  const queryClient = new QueryClient();
  
  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProductForm {...props} />
      </QueryClientProvider>
    );
  };
  
  it('should render form fields', () => {
    renderForm();
    
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    renderForm();
    
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome deve ter no mínimo 3 caracteres')).toBeInTheDocument();
    });
  });
  
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Pizza Margherita' } });
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '35.90' } });
    
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Pizza Margherita',
        price: 35.90,
        // ...
      });
    });
  });
});
```

### E2E Testing (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should create new product', async ({ page }) => {
    await page.goto('/dashboard/products');
    await page.click('text=Novo Produto');
    
    await page.fill('[name="name"]', 'Hambúrguer Artesanal');
    await page.fill('[name="price"]', '28.90');
    await page.selectOption('[name="categoryId"]', { label: 'Lanches' });
    
    await page.click('button:has-text("Salvar")');
    
    await expect(page.locator('text=Produto criado com sucesso')).toBeVisible();
    await expect(page.locator('text=Hambúrguer Artesanal')).toBeVisible();
  });
});
```

## Deployment

### Environment Variables

```env
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001

# .env.production
NEXT_PUBLIC_API_URL=https://api.restaurant.com/api/v1
NEXT_PUBLIC_WS_URL=https://ws.restaurant.com
```

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.restaurant.com'],
    formats: ['image/avif', 'image/webp']
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true
};

module.exports = nextConfig;
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

## Security Considerations

### XSS Protection

```typescript
// Sanitizar inputs
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(product.description);

// Usar dangerouslySetInnerHTML apenas quando necessário
<div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
```

### CSRF Protection

```typescript
// Next.js já inclui proteção CSRF por padrão
// Garantir que todas as mutações usem POST/PUT/DELETE
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

## Accessibility

### ARIA Labels

```tsx
<button
  aria-label="Adicionar produto ao carrinho"
  onClick={handleAddToCart}
>
  <ShoppingCart />
</button>

<input
  type="text"
  aria-label="Buscar produtos"
  aria-describedby="search-help"
  placeholder="Digite o nome do produto..."
/>
<span id="search-help" className="sr-only">
  Digite pelo menos 3 caracteres para buscar
</span>
```

### Keyboard Navigation

```tsx
// Garantir que todos os elementos interativos sejam acessíveis via teclado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Clique aqui
</div>
```

### Color Contrast

```css
/* Garantir contraste mínimo de 4.5:1 para texto normal */
/* e 3:1 para texto grande (WCAG AA) */

.text-primary {
  color: #1a202c; /* Contraste 12:1 com branco */
}

.bg-success {
  background-color: #22c55e; /* Verde acessível */
}
```
