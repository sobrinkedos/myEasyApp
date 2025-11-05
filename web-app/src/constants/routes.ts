// Route constants for type-safe navigation
export const ROUTES = {
  // Public routes
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password/:token',
  },
  
  // Protected routes
  DASHBOARD: '/dashboard',
  
  PRODUCTS: {
    LIST: '/products',
    NEW: '/products/new',
    DETAIL: '/products/:id',
    EDIT: '/products/:id/edit',
  },
  
  CATEGORIES: {
    LIST: '/categories',
  },
  
  INGREDIENTS: {
    LIST: '/ingredients',
  },
  
  STOCK: {
    LIST: '/stock',
    TRANSACTIONS: '/stock/transactions',
  },
  
  SALES: {
    POS: '/sales/pos',
    HISTORY: '/sales/history',
  },
  
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders/:id',
  },
  
  TABLES: {
    LIST: '/tables',
  },
  
  CASH: {
    LIST: '/cash',
    OPEN: '/cash/open',
    CLOSE: '/cash/close',
  },
  
  REPORTS: {
    SALES: '/reports/sales',
    STOCK: '/reports/stock',
    FINANCIAL: '/reports/financial',
    PERFORMANCE: '/reports/performance',
  },
  
  SETTINGS: {
    ESTABLISHMENT: '/settings/establishment',
    PROFILE: '/settings/profile',
    USERS: '/settings/users',
    PERMISSIONS: '/settings/permissions',
  },
  
  // Error routes
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Helper function to build route with params
export function buildRoute(route: string, params: Record<string, string>): string {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}
