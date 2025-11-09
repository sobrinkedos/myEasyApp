import { useState } from 'react';
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

// Dados de exemplo - em produção viriam da API
const salesData = [
  { date: '01/01', vendas: 4200, pedidos: 28 },
  { date: '02/01', vendas: 3800, pedidos: 24 },
  { date: '03/01', vendas: 5100, pedidos: 35 },
  { date: '04/01', vendas: 4600, pedidos: 31 },
  { date: '05/01', vendas: 6200, pedidos: 42 },
  { date: '06/01', vendas: 5800, pedidos: 38 },
  { date: '07/01', vendas: 7100, pedidos: 48 },
];

const categoryData = [
  { category: 'Bebidas', value: 4500 },
  { category: 'Pratos Principais', value: 8200 },
  { category: 'Sobremesas', value: 2100 },
  { category: 'Entradas', value: 3400 },
  { category: 'Lanches', value: 2800 },
];

const paymentData = [
  { name: 'Dinheiro', value: 3500 },
  { name: 'Cartão Crédito', value: 8200 },
  { name: 'Cartão Débito', value: 3100 },
  { name: 'PIX', value: 4800 },
];

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

const recentActivities = [
  {
    id: 1,
    type: 'order',
    message: 'Novo pedido #1234 - Mesa 5',
    time: '2 minutos atrás',
    icon: ShoppingCart,
    color: 'text-primary-500',
  },
  {
    id: 2,
    type: 'payment',
    message: 'Pagamento recebido - R$ 145,00',
    time: '5 minutos atrás',
    icon: DollarSign,
    color: 'text-success',
  },
  {
    id: 3,
    type: 'table',
    message: 'Mesa 8 liberada',
    time: '12 minutos atrás',
    icon: Users,
    color: 'text-secondary-500',
  },
  {
    id: 4,
    type: 'order',
    message: 'Pedido #1233 finalizado',
    time: '18 minutos atrás',
    icon: ShoppingCart,
    color: 'text-primary-500',
  },
];

const quickActions = [
  { label: 'Novo Pedido', icon: ShoppingCart, color: 'primary' },
  { label: 'Abrir Mesa', icon: Users, color: 'secondary' },
  { label: 'Novo Produto', icon: TrendingUp, color: 'success' },
  { label: 'Relatório', icon: Download, color: 'neutral' },
];

export function DashboardPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

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
          value="R$ 12.450"
          change={12.5}
          changeLabel="vs ontem"
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          sparklineData={sparklineData}
          trend="up"
          loading={loading}
        />

        <MetricCard
          title="Pedidos Ativos"
          value={127}
          change={-5.2}
          changeLabel="vs ontem"
          icon={ShoppingCart}
          iconColor="text-primary-500"
          iconBgColor="bg-primary-100 dark:bg-primary-900/20"
          sparklineData={sparklineData.map((d) => ({ value: 35 - d.value }))}
          trend="down"
          loading={loading}
        />

        <MetricCard
          title="Mesas Ocupadas"
          value="18/24"
          change={8.3}
          changeLabel="vs ontem"
          icon={Users}
          iconColor="text-secondary-500"
          iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
          sparklineData={sparklineData}
          loading={loading}
        />

        <MetricCard
          title="Ticket Médio"
          value="R$ 85,40"
          change={0.3}
          changeLabel="vs ontem"
          icon={TrendingUp}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          sparklineData={sparklineData.map((d) => ({
            value: d.value + Math.random() * 5 - 2.5,
          }))}
          trend="neutral"
          loading={loading}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas ao Longo do Tempo */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Vendas e Pedidos</h3>
          <LineChart
            data={salesData}
            lines={[
              { dataKey: 'vendas', name: 'Vendas (R$)', color: '#f97316' },
              { dataKey: 'pedidos', name: 'Pedidos', color: '#3b82f6' },
            ]}
            xAxisKey="date"
            height={300}
          />
        </div>

        {/* Vendas por Categoria */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
          <BarChart
            data={categoryData}
            bars={[{ dataKey: 'value', name: 'Vendas (R$)', color: '#10b981' }]}
            xAxisKey="category"
            height={300}
          />
        </div>
      </div>

      {/* Métodos de Pagamento e Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de Pagamento */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Métodos de Pagamento</h3>
          <PieChart data={paymentData} height={300} innerRadius={60} />
        </div>

        {/* Atividade Recente */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.color === 'text-primary-500'
                        ? 'bg-primary-100 dark:bg-primary-900/20'
                        : activity.color === 'text-success'
                        ? 'bg-success/10'
                        : 'bg-secondary-100 dark:bg-secondary-900/20'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activity.color}`} />
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
