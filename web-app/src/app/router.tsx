import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Products
import { ProductListPage } from '@/pages/products/ProductListPage';
import { ProductFormPage } from '@/pages/products/ProductFormPage';
import { ProductDetailPage } from '@/pages/products/ProductDetailPage';

// Settings
import { EstablishmentSettingsPage } from '@/pages/settings/EstablishmentSettingsPage';

// Categories
import { CategoryListPage } from '@/pages/categories/CategoryListPage';
import { CategoryFormPage } from '@/pages/categories/CategoryFormPage';

// Ingredients
import { IngredientListPage } from '@/pages/ingredients/IngredientListPage';
import { IngredientFormPage } from '@/pages/ingredients/IngredientFormPage';
import { IngredientDetailPage } from '@/pages/ingredients/IngredientDetailPage';
import { IngredientBulkEntryPage } from '@/pages/ingredients/IngredientBulkEntryPage';

// Recipes
import { RecipeListPage } from '@/pages/recipes/RecipeListPage';
import { RecipeFormPage } from '@/pages/recipes/RecipeFormPage';
import { RecipeDetailPage } from '@/pages/recipes/RecipeDetailPage';

// Stock
import { StockListPage } from '@/pages/stock/StockListPage';
import { StockFormPage } from '@/pages/stock/StockFormPage';
import { StockDetailPage } from '@/pages/stock/StockDetailPage';
import { StockBulkEntryPage } from '@/pages/stock/StockBulkEntryPage';
import { StockLowStockPage } from '@/pages/stock/StockLowStockPage';

// Appraisals
import { AppraisalListPage } from '@/pages/appraisals/AppraisalListPage';
import { AppraisalFormPage } from '@/pages/appraisals/AppraisalFormPage';
import { AppraisalCountPage } from '@/pages/appraisals/AppraisalCountPage';
import { AppraisalReviewPage } from '@/pages/appraisals/AppraisalReviewPage';
import { AppraisalDetailPage } from '@/pages/appraisals/AppraisalDetailPage';

// CMV
import { CMVDashboardPage } from '@/pages/cmv/CMVDashboardPage';
import { CMVPeriodListPage } from '@/pages/cmv/CMVPeriodListPage';
import { CMVPeriodFormPage } from '@/pages/cmv/CMVPeriodFormPage';
import { CMVPeriodDetailPage } from '@/pages/cmv/CMVPeriodDetailPage';
import { CMVPeriodClosePage } from '@/pages/cmv/CMVPeriodClosePage';
import { CMVReportPage } from '@/pages/cmv/CMVReportPage';

// Cash
import { CashSessionPage } from '@/pages/cash/CashSessionPage';
import { OpenCashPage } from '@/pages/cash/OpenCashPage';
import { WithdrawalPage } from '@/pages/cash/WithdrawalPage';
import { SupplyPage } from '@/pages/cash/SupplyPage';

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
            element: <ProductFormPage />,
          },
          {
            path: ':id',
            element: <ProductDetailPage />,
          },
          {
            path: ':id/edit',
            element: <ProductFormPage />,
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
        children: [
          {
            index: true,
            element: <IngredientListPage />,
          },
          {
            path: 'new',
            element: <IngredientFormPage />,
          },
          {
            path: 'bulk-entry',
            element: <IngredientBulkEntryPage />,
          },
          {
            path: ':id',
            element: <IngredientDetailPage />,
          },
          {
            path: ':id/edit',
            element: <IngredientFormPage />,
          },
        ],
      },
      
      // Recipes
      {
        path: 'recipes',
        children: [
          {
            index: true,
            element: <RecipeListPage />,
          },
          {
            path: 'new',
            element: <RecipeFormPage />,
          },
          {
            path: ':id',
            element: <RecipeDetailPage />,
          },
          {
            path: ':id/edit',
            element: <RecipeFormPage />,
          },
        ],
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
      
      // Appraisals
      {
        path: 'appraisals',
        children: [
          {
            index: true,
            element: <AppraisalListPage />,
          },
          {
            path: 'new',
            element: <AppraisalFormPage />,
          },
          {
            path: ':id',
            element: <AppraisalDetailPage />,
          },
          {
            path: ':id/count',
            element: <AppraisalCountPage />,
          },
          {
            path: ':id/review',
            element: <AppraisalReviewPage />,
          },
        ],
      },
      
      // CMV
      {
        path: 'cmv',
        children: [
          {
            index: true,
            element: <CMVDashboardPage />,
          },
          {
            path: 'periods',
            element: <CMVPeriodListPage />,
          },
          {
            path: 'periods/new',
            element: <CMVPeriodFormPage />,
          },
          {
            path: 'periods/:id',
            element: <CMVPeriodDetailPage />,
          },
          {
            path: 'periods/:id/close',
            element: <CMVPeriodClosePage />,
          },
          {
            path: 'reports',
            element: <CMVReportPage />,
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
            element: <CashSessionPage />,
          },
          {
            path: 'open',
            element: <OpenCashPage />,
          },
          {
            path: 'sessions/:id/withdrawal',
            element: <WithdrawalPage />,
          },
          {
            path: 'sessions/:id/supply',
            element: <SupplyPage />,
          },
          {
            path: 'sessions/:id/close',
            element: <div>Close Cash Page - Coming soon</div>,
          },
          {
            path: 'sessions/:id/transactions',
            element: <div>Transactions Page - Coming soon</div>,
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
