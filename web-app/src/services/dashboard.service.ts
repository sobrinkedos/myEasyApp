/**
 * Dashboard Service
 * Serviço para consumir dados do dashboard da API
 */

import api from './api';

export interface DashboardMetrics {
  sales: {
    today: number;
    yesterday: number;
    changePercentage: number;
  };
  orders: {
    active: number;
    yesterday: number;
    changePercentage: number;
  };
  tables: {
    occupied: number;
    total: number;
    changePercentage: number;
  };
  averageTicket: {
    value: number;
    yesterday: number;
    changePercentage: number;
  };
}

export interface SalesChartData {
  date: string;
  vendas: number;
  pedidos: number;
}

export interface CategorySalesData {
  category: string;
  value: number;
}

export interface PaymentMethodData {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'table';
  message: string;
  time: string;
}

class DashboardService {
  /**
   * Obter métricas principais do dashboard
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<{ success: boolean; data: DashboardMetrics }>(
      '/dashboard/metrics'
    );
    return response.data.data;
  }

  /**
   * Obter dados de vendas para gráfico
   */
  async getSalesChart(): Promise<SalesChartData[]> {
    const response = await api.get<{ success: boolean; data: SalesChartData[] }>(
      '/dashboard/sales-chart'
    );
    return response.data.data;
  }

  /**
   * Obter vendas por categoria
   */
  async getCategorySales(): Promise<CategorySalesData[]> {
    const response = await api.get<{ success: boolean; data: CategorySalesData[] }>(
      '/dashboard/category-sales'
    );
    return response.data.data;
  }

  /**
   * Obter dados de métodos de pagamento
   */
  async getPaymentMethods(): Promise<PaymentMethodData[]> {
    const response = await api.get<{ success: boolean; data: PaymentMethodData[] }>(
      '/dashboard/payment-methods'
    );
    return response.data.data;
  }

  /**
   * Obter atividades recentes
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await api.get<{ success: boolean; data: RecentActivity[] }>(
      '/dashboard/recent-activities'
    );
    return response.data.data;
  }
}

export default new DashboardService();
