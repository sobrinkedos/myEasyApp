import { MetricCard } from './MetricCard';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
} from 'lucide-react';

// Dados de exemplo para sparklines
const generateSparklineData = (trend: 'up' | 'down' | 'neutral') => {
  const baseData = [10, 15, 13, 17, 21, 18, 25, 28, 24, 30];
  
  if (trend === 'down') {
    return baseData.map((v) => ({ value: 35 - v }));
  }
  
  if (trend === 'neutral') {
    return baseData.map((v) => ({ value: v + Math.random() * 5 - 2.5 }));
  }
  
  return baseData.map((v) => ({ value: v }));
};

export const MetricCardExample = () => {
  return (
    <div className="p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Exemplos de MetricCard</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Cards de métricas com ícones, variação percentual e gráficos sparkline
        </p>
      </div>

      {/* Grid de 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Vendas do Dia"
          value="R$ 12.450"
          change={12.5}
          changeLabel="vs ontem"
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          sparklineData={generateSparklineData('up')}
          trend="up"
        />

        <MetricCard
          title="Pedidos Ativos"
          value={127}
          change={-5.2}
          changeLabel="vs ontem"
          icon={ShoppingCart}
          iconColor="text-primary-500"
          iconBgColor="bg-primary-100 dark:bg-primary-900/20"
          sparklineData={generateSparklineData('down')}
          trend="down"
        />

        <MetricCard
          title="Mesas Ocupadas"
          value="18/24"
          change={8.3}
          changeLabel="vs ontem"
          icon={Users}
          iconColor="text-secondary-500"
          iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
          sparklineData={generateSparklineData('up')}
        />

        <MetricCard
          title="Ticket Médio"
          value="R$ 85,40"
          change={0.3}
          changeLabel="vs ontem"
          icon={TrendingUp}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          sparklineData={generateSparklineData('neutral')}
          trend="neutral"
        />
      </div>

      {/* Cards sem sparkline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cards sem Sparkline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Produtos"
            value={245}
            icon={ShoppingCart}
            iconColor="text-primary-500"
            iconBgColor="bg-primary-100 dark:bg-primary-900/20"
          />

          <MetricCard
            title="Estoque Baixo"
            value={12}
            change={-15.5}
            icon={TrendingUp}
            iconColor="text-error"
            iconBgColor="bg-error/10"
          />

          <MetricCard
            title="Receita Mensal"
            value="R$ 145.230"
            change={18.2}
            changeLabel="vs mês anterior"
            icon={DollarSign}
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />

          <MetricCard
            title="Clientes Ativos"
            value={1.234}
            icon={Users}
            iconColor="text-secondary-500"
            iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
          />
        </div>
      </div>

      {/* Cards sem ícone */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Cards sem Ícone</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Vendas Hoje"
            value="R$ 8.450"
            change={5.2}
            sparklineData={generateSparklineData('up')}
          />

          <MetricCard
            title="Pedidos"
            value={89}
            change={-2.1}
            sparklineData={generateSparklineData('down')}
          />

          <MetricCard
            title="Taxa de Conversão"
            value="68%"
            change={3.5}
            sparklineData={generateSparklineData('up')}
          />

          <MetricCard
            title="Tempo Médio"
            value="12 min"
            change={-8.2}
            changeLabel="vs ontem"
            sparklineData={generateSparklineData('down')}
          />
        </div>
      </div>

      {/* Estado de loading */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estado de Loading</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Carregando..."
            value="..."
            loading
            icon={DollarSign}
            sparklineData={generateSparklineData('up')}
          />

          <MetricCard
            title="Carregando..."
            value="..."
            loading
            icon={ShoppingCart}
            sparklineData={generateSparklineData('up')}
          />

          <MetricCard
            title="Carregando..."
            value="..."
            loading
          />

          <MetricCard
            title="Carregando..."
            value="..."
            loading
          />
        </div>
      </div>
    </div>
  );
};
