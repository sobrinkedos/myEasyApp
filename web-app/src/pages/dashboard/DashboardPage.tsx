import { useState, useEffect } from 'react';
import { MetricCard } from '../../components/dashboard';
import { LineChart, BarChart, PieChart } from '../../components/charts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import dashboardService, {
  DashboardMetrics,
  SalesChartData,
  CategorySalesData,
  PaymentMethodData,
  RecentActivity,
} from '../../services/dashboard.service';
import { useToast } from '../../hooks/useToast';

const quickActions = [
  { label: 'Novo Pedido', icon: ShoppingCart, color: 'primary' },
  { label: 'Abrir Mesa', icon: Users, color: 'secondary' },
  { label: 'Novo Produto', icon: TrendingUp, color: 'success' },
  { label: 'Relatório', icon: Download, color: 'neutral' },
];

export function DashboardPage() {
  const toast = useToast();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySalesData[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentMethodData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, salesChart, categorySales, paymentMethods, activities] =
        await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getSalesChart(),
          dashboardService.getCategorySales(),
          dashboardService.getPaymentMethods(),
          dashboardService.getRecentActivities(),
        ]);

      setMetrics(metricsData);
      setSalesData(salesChart);
      setCategoryData(categorySales);
      setPaymentData(paymentMethods);
      setRecentActivities(activities);
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingCart;
      case 'payment':
        return DollarSign;
      case 'table':
        return Users;
      default:
        return ShoppingCart;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-primary-500';
      case 'payment':
        return 'text-success';
      case 'table':
        return 'text-secondary-500';
      default:
        return 'text-primary-500';
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-primary-100 dark:bg-primary-900/20';
      case 'payment':
        return 'bg-success/10';
      case 'table':
        return 'bg-secondary-100 dark:bg-secondary-900/20';
      default:
        return 'bg-primary-100 dark:bg-primary-900/20';
    }
  };

  // Dados de sparkline fictícios (podem ser removidos ou calculados dos dados reais)
  const sparklineData = [
    { value: 10 },
    { value: 15 },
    { value: 13 },
    { value: 17 },
    { value: 21 },
    { value: 18 },
    { value: 25 },
    { value: 28 },
    { value: 24 },
    { value: 30 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do seu restaurante"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => {}}
            >
              Filtrar Período
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Filtros de Período */}
      <div className="flex gap-2">
        <Button
          variant={period === 'today' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setPeriod('today')}
        >
          Hoje
        </Button>
        <Button
          variant={period === 'week' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setPeriod('week')}
        >
          Esta Semana
        </Button>
        <Button
          variant={period === 'month' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setPeriod('month')}
        >
          Este Mês
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas do Dia"
          value={metrics ? formatCurrency(metrics.sales.today) : 'R$ 0,00'}
          change={metrics?.sales.changePercentage || 0}
          changeLabel="vs ontem"
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          sparklineData={sparklineData}
          trend={
            !metrics
              ? 'neutral'
              : metrics.sales.changePercentage > 5
              ? 'up'
              : metrics.sales.changePercentage < -5
              ? 'down'
              : 'neutral'
          }
          loading={loading}
        />

        <MetricCard
          title="Pedidos Ativos"
          value={metrics?.orders.active || 0}
          change={metrics?.orders.changePercentage || 0}
          changeLabel="vs ontem"
          icon={ShoppingCart}
          iconColor="text-primary-500"
          iconBgColor="bg-primary-100 dark:bg-primary-900/20"
          sparklineData={sparklineData.map((d) => ({ value: 35 - d.value }))}
          trend={
            !metrics
              ? 'neutral'
              : metrics.orders.changePercentage > 5
              ? 'up'
              : metrics.orders.changePercentage < -5
              ? 'down'
              : 'neutral'
          }
          loading={loading}
        />

        <MetricCard
          title="Mesas Ocupadas"
          value={
            metrics
              ? `${metrics.tables.occupied}/${metrics.tables.total}`
              : '0/0'
          }
          change={metrics?.tables.changePercentage || 0}
          changeLabel="vs ontem"
          icon={Users}
          iconColor="text-secondary-500"
          iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
          sparklineData={sparklineData}
          loading={loading}
        />

        <MetricCard
          title="Ticket Médio"
          value={metrics ? formatCurrency(metrics.averageTicket.value) : 'R$ 0,00'}
          change={metrics?.averageTicket.changePercentage || 0}
          changeLabel="vs ontem"
          icon={TrendingUp}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          sparklineData={sparklineData.map((d) => ({
            value: d.value + Math.random() * 5 - 2.5,
          }))}
          trend={
            !metrics
              ? 'neutral'
              : metrics.averageTicket.changePercentage > 5
              ? 'up'
              : metrics.averageTicket.changePercentage < -5
              ? 'down'
              : 'neutral'
          }
          loading={loading}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas ao Longo do Tempo */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Vendas e Pedidos</h3>
          {salesData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Nenhuma venda nos últimos 7 dias
              </p>
            </div>
          ) : (
            <LineChart
              data={salesData}
              lines={[
                { dataKey: 'vendas', name: 'Vendas (R$)', color: '#f97316' },
                { dataKey: 'pedidos', name: 'Pedidos', color: '#3b82f6' },
              ]}
              xAxisKey="date"
              height={300}
            />
          )}
        </div>

        {/* Vendas por Categoria */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Nenhuma venda por categoria nos últimos 7 dias
              </p>
            </div>
          ) : (
            <BarChart
              data={categoryData}
              bars={[{ dataKey: 'value', name: 'Vendas (R$)', color: '#10b981' }]}
              xAxisKey="category"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Métodos de Pagamento e Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de Pagamento */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
          {paymentData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                Nenhum pagamento registrado nos últimos 7 dias
              </p>
            </div>
          ) : (
            <PieChart data={paymentData} height={300} innerRadius={60} />
          )}
        </div>

        {/* Atividade Recente */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                const bgColor = getActivityBgColor(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {activity.message}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    action.color === 'primary'
                      ? 'bg-primary-100 dark:bg-primary-900/20'
                      : action.color === 'secondary'
                      ? 'bg-secondary-100 dark:bg-secondary-900/20'
                      : action.color === 'success'
                      ? 'bg-success/10'
                      : 'bg-neutral-100 dark:bg-neutral-700'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      action.color === 'primary'
                        ? 'text-primary-500'
                        : action.color === 'secondary'
                        ? 'text-secondary-500'
                        : action.color === 'success'
                        ? 'text-success'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
