/**
 * Dashboard Service
 * Serviço para agregar métricas e dados do dashboard
 */

import prisma from '@/config/database';
import { CounterOrderStatus } from '@/models/counter-order.model';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

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

export class DashboardService {
  /**
   * Obter métricas principais do dashboard
   */
  async getMetrics(establishmentId: string): Promise<DashboardMetrics> {
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Vendas de hoje
    const salesToday = await this.getSalesForPeriod(
      establishmentId,
      startOfDay(today),
      endOfDay(today)
    );

    // Vendas de ontem
    const salesYesterday = await this.getSalesForPeriod(
      establishmentId,
      startOfDay(yesterday),
      endOfDay(yesterday)
    );

    // Pedidos ativos (comandas abertas + pedidos balcão ativos)
    const activeOrders = await this.getActiveOrdersCount(establishmentId);
    const ordersYesterday = await this.getOrdersCountForPeriod(
      establishmentId,
      startOfDay(yesterday),
      endOfDay(yesterday)
    );

    // Mesas ocupadas
    const tablesData = await this.getTablesOccupancy(establishmentId);

    // Ticket médio
    const avgTicketToday = salesToday.count > 0 ? salesToday.total / salesToday.count : 0;
    const avgTicketYesterday = salesYesterday.count > 0 ? salesYesterday.total / salesYesterday.count : 0;

    return {
      sales: {
        today: salesToday.total,
        yesterday: salesYesterday.total,
        changePercentage: this.calculateChangePercentage(salesToday.total, salesYesterday.total),
      },
      orders: {
        active: activeOrders,
        yesterday: ordersYesterday,
        changePercentage: this.calculateChangePercentage(activeOrders, ordersYesterday),
      },
      tables: {
        occupied: tablesData.occupied,
        total: tablesData.total,
        changePercentage: 0, // Pode ser calculado se houver histórico
      },
      averageTicket: {
        value: avgTicketToday,
        yesterday: avgTicketYesterday,
        changePercentage: this.calculateChangePercentage(avgTicketToday, avgTicketYesterday),
      },
    };
  }

  /**
   * Obter dados de vendas para gráfico (últimos 7 dias)
   */
  async getSalesChartData(establishmentId: string): Promise<SalesChartData[]> {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);

    // Buscar todos os pedidos dos últimos 7 dias de uma vez
    const orders = await prisma.counterOrder.findMany({
      where: {
        establishmentId,
        paidAt: {
          gte: startOfDay(sevenDaysAgo),
          lte: endOfDay(today),
        },
        status: { not: CounterOrderStatus.CANCELADO },
      },
      select: {
        paidAt: true,
        totalAmount: true,
      },
    });

    // Agrupar por dia
    const salesByDay = new Map<string, { total: number; count: number }>();
    
    // Inicializar todos os dias com zero
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      salesByDay.set(dateKey, { total: 0, count: 0 });
    }

    // Agregar vendas por dia
    orders.forEach(order => {
      if (order.paidAt) {
        const dateKey = format(order.paidAt, 'yyyy-MM-dd');
        const current = salesByDay.get(dateKey);
        if (current) {
          current.total += Number(order.totalAmount);
          current.count += 1;
        }
      }
    });

    // Converter para array de resultado
    const data: SalesChartData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const sales = salesByDay.get(dateKey) || { total: 0, count: 0 };
      
      data.push({
        date: format(date, 'dd/MM'),
        vendas: sales.total,
        pedidos: sales.count,
      });
    }

    return data;
  }

  /**
   * Obter vendas por categoria
   */
  async getCategorySales(establishmentId: string): Promise<CategorySalesData[]> {
    const today = new Date();

    // Vendas de pedidos balcão
    const counterOrderSales = await prisma.counterOrderItem.groupBy({
      by: ['productId'],
      where: {
        counterOrder: {
          establishmentId,
          createdAt: {
            gte: startOfDay(subDays(today, 7)),
            lte: endOfDay(today),
          },
          status: {
            not: CounterOrderStatus.CANCELADO,
          },
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Buscar produtos e suas categorias
    const productIds = counterOrderSales.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    // Agrupar por categoria
    const categoryMap = new Map<string, number>();

    counterOrderSales.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if (product && product.category) {
        const current = categoryMap.get(product.category.name) || 0;
        categoryMap.set(product.category.name, current + (sale._sum.totalPrice || 0));
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categorias
  }

  /**
   * Obter dados de métodos de pagamento
   */
  async getPaymentMethodsData(establishmentId: string): Promise<PaymentMethodData[]> {
    const today = new Date();

    // Pagamentos de pedidos balcão
    const counterPayments = await prisma.counterOrder.groupBy({
      by: ['paymentMethod'],
      where: {
        establishmentId,
        paidAt: {
          gte: startOfDay(subDays(today, 7)),
          lte: endOfDay(today),
        },
        paymentMethod: { not: null },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Consolidar dados
    const paymentMap = new Map<string, number>();

    counterPayments.forEach(payment => {
      if (payment.paymentMethod) {
        const current = paymentMap.get(payment.paymentMethod) || 0;
        paymentMap.set(payment.paymentMethod, current + (payment._sum.totalAmount || 0));
      }
    });

    const paymentLabels: Record<string, string> = {
      CASH: 'Dinheiro',
      CREDIT_CARD: 'Cartão Crédito',
      DEBIT_CARD: 'Cartão Débito',
      PIX: 'PIX',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
    };

    return Array.from(paymentMap.entries()).map(([method, value]) => ({
      name: paymentLabels[method] || method,
      value,
    }));
  }

  /**
   * Obter atividades recentes
   */
  async getRecentActivities(establishmentId: string): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Últimos pedidos balcão
    const recentOrders = await prisma.counterOrder.findMany({
      where: { establishmentId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { createdBy: true },
    });

    recentOrders.forEach(order => {
      const minutesAgo = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
      activities.push({
        id: order.id,
        type: 'order',
        message: `Novo pedido #${order.orderNumber}${order.customerName ? ` - ${order.customerName}` : ''}`,
        time: this.formatTimeAgo(minutesAgo),
      });
    });

    return activities.slice(0, 10);
  }

  // Métodos auxiliares privados

  private async getSalesForPeriod(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ total: number; count: number }> {
    // Vendas de pedidos balcão (apenas pedidos pagos)
    const counterOrders = await prisma.counterOrder.aggregate({
      where: {
        establishmentId,
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: CounterOrderStatus.CANCELADO },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // TODO: Adicionar vendas de comandas quando o modelo tiver campos de pagamento
    // Por enquanto, usando apenas pedidos de balcão

    return {
      total: counterOrders._sum.totalAmount || 0,
      count: counterOrders._count,
    };
  }

  private async getActiveOrdersCount(establishmentId: string): Promise<number> {
    // Pedidos balcão ativos
    const counterOrders = await prisma.counterOrder.count({
      where: {
        establishmentId,
        status: {
          in: [
            CounterOrderStatus.AGUARDANDO_PAGAMENTO,
            CounterOrderStatus.PENDENTE,
            CounterOrderStatus.PREPARANDO,
            CounterOrderStatus.PRONTO,
          ],
        },
      },
    });

    // TODO: Adicionar comandas abertas quando necessário
    // Por enquanto, usando apenas pedidos de balcão

    return counterOrders;
  }

  private async getOrdersCountForPeriod(
    establishmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const counterOrders = await prisma.counterOrder.count({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // TODO: Adicionar comandas quando necessário
    // Por enquanto, usando apenas pedidos de balcão

    return counterOrders;
  }

  private async getTablesOccupancy(
    establishmentId: string
  ): Promise<{ occupied: number; total: number }> {
    const total = await prisma.table.count({
      where: { establishmentId },
    });

    const occupied = await prisma.table.count({
      where: {
        establishmentId,
        status: 'OCCUPIED',
      },
    });

    return { occupied, total };
  }

  private calculateChangePercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private formatTimeAgo(minutes: number): string {
    if (minutes < 1) return 'agora';
    if (minutes === 1) return '1 minuto atrás';
    if (minutes < 60) return `${minutes} minutos atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hora atrás';
    return `${hours} horas atrás`;
  }
}
