import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { FullscreenLayout } from '@/layouts/FullscreenLayout';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Products
import { ProductListPage } from '@/pages/products/ProductListPage';

// Settings
import { EstablishmentSettingsPage } from '@/pages/settings/EstablishmentSettingsPage';

// Categories
import { CategoryListPage } from '@/pages/categories/CategoryListPage';
import { CategoryFormPage } from '@/pages/categories/CategoryFormPage';

// Stock
import { StockListPage } from '@/pages/stock/StockListPage';
import { StockFormPage } from '@/pages/stock/StockFormPage';
import { StockDetailPage } from '@/pages/stock/StockDetailPage';
import { StockBulkEntryPage } from '@/pages/stock/StockBulkEntryPage';
import { StockLowStockPage } from '@/pages/stock/StockLowStockPage';

// Error pages
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  
  // Public routes - Auth
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
    ],
  },
  
  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      
      // Products
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductListPage />,
          },
          {
            path: 'new',
            element: <div>New Product Page - Coming soon</div>,
          },
          {
            path: ':id',
            element: <div>Product Detail Page - Coming soon</div>,
          },
          {
            path: ':id/edit',
            element: <div>Edit Product Page - Coming soon</div>,
          },
        ],
      },
      
      // Categories
      {
        path: 'categories',
        children: [
          {
            index: true,
            element: <CategoryListPage />,
          },
          {
            path: 'new',
            element: <CategoryFormPage />,
          },
          {
            path: ':id/edit',
            element: <CategoryFormPage />,
          },
        ],
      },
      
      // Ingredients
      {
        path: 'ingredients',
        element: <div>Ingredients Page - Coming soon</div>,
      },
      
      // Stock
      {
        path: 'stock',
        children: [
          {
            index: true,
            element: <StockListPage />,
          },
          {
            path: 'new',
            element: <StockFormPage />,
          },
          {
            path: 'bulk-entry',
            element: <StockBulkEntryPage />,
          },
          {
            path: 'low-stock',
            element: <StockLowStockPage />,
          },
          {
            path: ':id',
            element: <StockDetailPage />,
          },
          {
            path: ':id/edit',
            element: <StockFormPage />,
          },
          {
            path: 'transactions',
            element: <div>Stock Transactions Page - Coming soon</div>,
          },
        ],
      },
      
      // Sales
      {
        path: 'sales',
        children: [
          {
            path: 'pos',
            element: <div>POS Page - Coming soon</div>,
          },
          {
            path: 'history',
            element: <div>Sales History Page - Coming soon</div>,
          },
        ],
      },
      
      // Orders
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <div>Orders List Page - Coming soon</div>,
          },
          {
            path: ':id',
            element: <div>Order Detail Page - Coming soon</div>,
          },
        ],
      },
      
      // Tables
      {
        path: 'tables',
        element: <div>Tables Page - Coming soon</div>,
      },
      
      // Cash
      {
        path: 'cash',
        children: [
          {
            index: true,
            element: <div>Cash List Page - Coming soon</div>,
          },
          {
            path: 'open',
            element: <div>Open Cash Page - Coming soon</div>,
          },
          {
            path: 'close',
            element: <div>Close Cash Page - Coming soon</div>,
          },
        ],
      },
      
      // Reports
      {
        path: 'reports',
        children: [
          {
            path: 'sales',
            element: <div>Sales Report Page - Coming soon</div>,
          },
          {
            path: 'stock',
            element: <div>Stock Report Page - Coming soon</div>,
          },
          {
            path: 'financial',
            element: <div>Financial Report Page - Coming soon</div>,
          },
          {
            path: 'performance',
            element: <div>Performance Report Page - Coming soon</div>,
          },
        ],
      },
      
      // Settings
      {
        path: 'settings',
        children: [
          {
            path: 'establishment',
            element: <EstablishmentSettingsPage />,
          },
          {
            path: 'profile',
            element: <div>Profile Settings Page - Coming soon</div>,
          },
          {
            path: 'users',
            element: <div>Users Settings Page - Coming soon</div>,
          },
          {
            path: 'permissions',
            element: <div>Permissions Settings Page - Coming soon</div>,
          },
        ],
      },
    ],
  },
  
  // Error routes
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
