# Design Document - Arquitetura Frontend Web

## Overview

Este documento detalha o design técnico da arquitetura frontend web do sistema de gestão de restaurantes. A aplicação será uma SPA (Single Page Application) construída com React 18+, TypeScript, React Router v6 e Tailwind CSS, seguindo princípios de componentização, separação de responsabilidades e performance otimizada.

A arquitetura é projetada para ser escalável, manutenível e performática, com foco em:
- Componentização e reutilização de código
- Gerenciamento eficiente de estado (client e server)
- Navegação fluida e intuitiva
- Atualizações em tempo real via WebSocket
- Performance otimizada com code splitting e lazy loading
- Acessibilidade e responsividade

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   React Application                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   Router    │  │   Contexts   │  │  React Query│  │  │
│  │  │  (Routes)   │  │  (Global     │  │  (Server    │  │  │
│  │  │             │  │   State)     │  │   State)    │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │         │                 │                 │          │  │
│  │  ┌──────▼─────────────────▼─────────────────▼──────┐  │  │
│  │  │              Pages & Layouts                     │  │  │
│  │  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │  │
│  │  │  │ Dashboard  │  │  Products  │  │  Orders   │  │  │  │
│  │  │  │   Layout   │  │   Layout   │  │  Layout   │  │  │  │
│  │  │  └────────────┘  └────────────┘  └───────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │         │                                                │  │
│  │  ┌──────▼────────────────────────────────────────────┐  │  │
│  │  │           Reusable Components                     │  │  │
│  │  │  UI • Common • Domain • Forms • Modals           │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│  REST Endpoints • WebSocket Server • Authentication          │
└─────────────────────────────────────────────────────────────┘
```

### Layer Architecture


**1. Presentation Layer (Pages & Layouts)**
- Páginas específicas de cada rota
- Layouts compartilhados (Auth, Dashboard, Fullscreen)
- Composição de componentes para formar interfaces completas

**2. Component Layer**
- UI Components: Componentes base do design system
- Common Components: Componentes compostos reutilizáveis
- Domain Components: Componentes específicos do domínio (produtos, pedidos)

**3. State Management Layer**
- React Query: Gerenciamento de server state (cache, sync, mutations)
- Context API: Estado global do cliente (auth, theme, notifications)
- Local State: Estado específico de componentes (useState, useReducer)

**4. Service Layer**
- API Services: Funções para comunicação com backend
- WebSocket Service: Gerenciamento de conexão real-time
- Storage Service: Persistência local (localStorage, sessionStorage)

**5. Utility Layer**
- Formatters: Formatação de datas, moedas, números
- Validators: Validação de dados
- Helpers: Funções auxiliares genéricas

## Components and Interfaces

### Core Components

#### 1. Router Configuration

```typescript
// src/app/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'products',
        children: [
          { index: true, element: <ProductListPage /> },
          { path: 'new', element: <ProductFormPage /> },
          { path: ':id', element: <ProductDetailPage /> },
          { path: ':id/edit', element: <ProductFormPage /> },
        ],
      },
      // ... outras rotas
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

#### 2. Layout Components

**DashboardLayout**
```typescript
// src/layouts/DashboardLayout.tsx
interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        variant={isMobile ? 'drawer' : 'permanent'}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**AuthLayout**
```typescript
// src/layouts/AuthLayout.tsx
export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
```

#### 3. Navigation Components

**Sidebar**
```typescript
// src/components/common/Sidebar.tsx
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'drawer';
}

const menuItems = [
  { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
  {
    icon: ShoppingBagIcon,
    label: 'Vendas',
    children: [
      { label: 'Pedidos', path: '/orders' },
      { label: 'Mesas', path: '/tables' },
      { label: 'Caixa', path: '/cash' },
    ],
  },
  // ... outros itens
];

export function Sidebar({ open, onClose, variant }: SidebarProps) {
  const location = useLocation();
  
  const content = (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Logo variant="light" />
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.path || item.label}
            item={item}
            active={location.pathname === item.path}
          />
        ))}
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <UserMenu />
      </div>
    </div>
  );
  
  if (variant === 'drawer') {
    return (
      <Drawer open={open} onClose={onClose} side="left">
        {content}
      </Drawer>
    );
  }
  
  return <aside className="w-64 flex-shrink-0">{content}</aside>;
}
```

**Topbar**
```typescript
// src/components/common/Topbar.tsx
interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      {/* Menu Button (Mobile) */}
      <button onClick={onMenuClick} className="md:hidden mr-4">
        <MenuIcon />
      </button>
      
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown 
          notifications={notifications}
          unreadCount={unreadCount}
        />
        
        {/* User Menu */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
```

#### 4. Modal System

**Base Modal Component**
```typescript
// src/components/ui/Modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ 
  open, 
  onClose, 
  title, 
  size = 'md', 
  children,
  footer 
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  
  if (!open) return null;
  
  return (
    <Portal>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={cn(
            'bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={onClose}>
                <XIcon />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
```

**Specialized Modals**
```typescript
// src/components/common/ConfirmModal.tsx
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}
```


#### 5. Data Table Component

```typescript
// src/components/common/DataTable.tsx
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }
  
  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'hover:bg-gray-50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}
```

#### 6. Form Components

```typescript
// src/components/ui/TextField.tsx
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              error && 'border-red-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
```

## Data Models

### State Management Models

#### Auth State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  establishmentId: string;
  roles: string[];
  permissions: string[];
}
```

#### Notification State
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
}

interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'stock_low' | 'cash_alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}
```

#### Theme State
```typescript
interface ThemeState {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### API Response Models

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

## Service Layer Design

### API Service

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Resource Services

```typescript
// src/services/products.service.ts
import api from './api';
import { Product, CreateProductDto, UpdateProductDto } from '@/types';

export const productsService = {
  getAll: async (params?: { 
    page?: number; 
    search?: string; 
    categoryId?: string;
  }) => {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },
  
  create: async (product: CreateProductDto) => {
    const { data } = await api.post<ApiResponse<Product>>('/products', product);
    return data.data;
  },
  
  update: async (id: string, product: UpdateProductDto) => {
    const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    return data.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
  
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post<ApiResponse<{ imageUrl: string }>>(
      `/products/${id}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data.imageUrl;
  },
};
```

### WebSocket Service

```typescript
// src/services/websocket.service.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  connect(token: string) {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    // Setup event listeners
    this.socket.onAny((event, ...args) => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.forEach((handler) => handler(...args));
      }
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }
  
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const wsService = new WebSocketService();
```

## Context Providers

### Auth Context

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const loadUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    const { token, user } = await authService.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    wsService.disconnect();
  };
  
  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Notification Context

```typescript
// src/contexts/NotificationContext.tsx
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      // Connect to WebSocket
      const token = localStorage.getItem('token')!;
      wsService.connect(token);
      
      // Listen for notifications
      const unsubscribe = wsService.on('notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        
        // Show toast
        toast.info(notification.title, {
          description: notification.message,
        });
      });
      
      return () => {
        unsubscribe();
        wsService.disconnect();
      };
    }
  }, [isAuthenticated]);
  
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
```


## React Query Integration

### Query Configuration

```typescript
// src/app/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Custom Hooks

```typescript
// src/features/products/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { toast } from '@/components/ui/Toast';

export function useProducts(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getAll(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar produto');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      toast.success('Produto atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir produto');
    },
  });
}
```

## Routing Strategy

### Protected Routes

```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  if (requiredPermission && !user?.permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

### Navigation Utilities

```typescript
// src/utils/navigation.ts
import { useNavigate, useLocation } from 'react-router-dom';

export function useNavigateWithState() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return {
    goBack: () => navigate(-1),
    goToProducts: () => navigate('/products'),
    goToProductDetail: (id: string) => navigate(`/products/${id}`),
    goToProductEdit: (id: string) => navigate(`/products/${id}/edit`),
    // ... outras navegações
  };
}

export function useBreadcrumbs() {
  const location = useLocation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return { label, path };
  });
  
  return breadcrumbs;
}
```

## Error Handling

### Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry, etc)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-8">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// src/utils/errorHandler.ts
export function handleApiError(error: any): string {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Dados inválidos';
      case 401:
        return 'Sessão expirada. Faça login novamente';
      case 403:
        return 'Você não tem permissão para esta ação';
      case 404:
        return 'Recurso não encontrado';
      case 422:
        // Validation errors
        if (data.errors) {
          return Object.values(data.errors).flat().join(', ');
        }
        return data.message || 'Erro de validação';
      case 500:
        return 'Erro no servidor. Tente novamente mais tarde';
      default:
        return data.message || 'Erro desconhecido';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Sem conexão com o servidor';
  } else {
    // Something else happened
    return error.message || 'Erro desconhecido';
  }
}
```

## Performance Optimization

### Code Splitting

```typescript
// src/app/router.tsx
import { lazy, Suspense } from 'react';

// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));

// Wrap with Suspense
function LazyPage({ Component }: { Component: React.LazyExoticComponent<any> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

// Use in routes
{
  path: 'dashboard',
  element: <LazyPage Component={DashboardPage} />,
}
```

### Image Optimization

```typescript
// src/components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <ImageIcon className="text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
```

### Virtual Scrolling

```typescript
// src/components/common/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize: number;
}

export function VirtualList<T>({ 
  items, 
  renderItem, 
  estimateSize 
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Strategy

### Component Testing

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';

describe('useAuth', () => {
  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
    });
  });
});
```

## Deployment

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
```

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.restaurant.com/api/v1
VITE_WS_URL=https://api.restaurant.com
```

## Security Considerations

1. **XSS Prevention**: Sanitize user inputs, use React's built-in escaping
2. **CSRF Protection**: Include CSRF token in requests when needed
3. **Secure Storage**: Store sensitive data securely (JWT in httpOnly cookies if possible)
4. **Input Validation**: Validate all inputs on client and server
5. **Permission Checks**: Verify permissions before showing UI elements
6. **HTTPS Only**: Enforce HTTPS in production
7. **Content Security Policy**: Implement CSP headers
8. **Dependency Scanning**: Regular security audits of dependencies

## Monitoring and Analytics

```typescript
// src/utils/analytics.ts
export const analytics = {
  pageView: (path: string) => {
    // Send to analytics service
    console.log('Page view:', path);
  },
  
  event: (category: string, action: string, label?: string) => {
    // Send to analytics service
    console.log('Event:', { category, action, label });
  },
  
  error: (error: Error, context?: Record<string, any>) => {
    // Send to error tracking service (Sentry)
    console.error('Error:', error, context);
  },
};

// Usage in components
useEffect(() => {
  analytics.pageView(location.pathname);
}, [location]);
```

## Conclusion

Esta arquitetura fornece uma base sólida e escalável para o frontend web do sistema de gestão de restaurantes. Os principais benefícios incluem:

- **Componentização**: Componentes reutilizáveis e bem organizados
- **Performance**: Code splitting, lazy loading e otimizações
- **Manutenibilidade**: Código limpo, tipado e testável
- **Escalabilidade**: Estrutura modular que suporta crescimento
- **UX**: Interface responsiva, acessível e com feedback claro
- **Real-time**: Atualizações em tempo real via WebSocket
- **Segurança**: Práticas de segurança implementadas

A implementação seguirá as melhores práticas do ecossistema React e TypeScript, garantindo uma aplicação moderna, performática e fácil de manter.
