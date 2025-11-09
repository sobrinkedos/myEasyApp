import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { SparklineChart } from './SparklineChart';

// Dados de exemplo
const salesData = [
  { month: 'Jan', vendas: 4000, pedidos: 240 },
  { month: 'Fev', vendas: 3000, pedidos: 198 },
  { month: 'Mar', vendas: 5000, pedidos: 320 },
  { month: 'Abr', vendas: 4500, pedidos: 280 },
  { month: 'Mai', vendas: 6000, pedidos: 390 },
  { month: 'Jun', vendas: 5500, pedidos: 350 },
];

const categoryData = [
  { category: 'Bebidas', value: 4500 },
  { category: 'Pratos', value: 8200 },
  { category: 'Sobremesas', value: 2100 },
  { category: 'Entradas', value: 3400 },
];

const paymentData = [
  { name: 'Dinheiro', value: 3500 },
  { name: 'Cartão', value: 8200 },
  { name: 'PIX', value: 4800 },
  { name: 'Vale', value: 1500 },
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

export const ChartsExample = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Exemplos de Gráficos</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Componentes de gráficos responsivos com suporte a tema claro/escuro
        </p>
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Linha - Vendas Mensais</h3>
        <LineChart
          data={salesData}
          lines={[
            { dataKey: 'vendas', name: 'Vendas (R$)', color: '#f97316' },
            { dataKey: 'pedidos', name: 'Pedidos', color: '#3b82f6' },
          ]}
          xAxisKey="month"
          height={300}
        />
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Barras - Vendas por Categoria</h3>
        <BarChart
          data={categoryData}
          bars={[
            { dataKey: 'value', name: 'Vendas (R$)', color: '#10b981' },
          ]}
          xAxisKey="category"
          height={300}
        />
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Barras Horizontal</h3>
        <BarChart
          data={categoryData}
          bars={[
            { dataKey: 'value', name: 'Vendas (R$)', color: '#f59e0b' },
          ]}
          xAxisKey="category"
          height={300}
          horizontal
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Pizza - Métodos de Pagamento</h3>
        <PieChart
          data={paymentData}
          height={350}
        />
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Rosca - Métodos de Pagamento</h3>
        <PieChart
          data={paymentData}
          height={350}
          innerRadius={60}
        />
      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4">Gráfico de Barras Empilhadas</h3>
        <BarChart
          data={salesData}
          bars={[
            { dataKey: 'vendas', name: 'Vendas (R$)', color: '#f97316' },
            { dataKey: 'pedidos', name: 'Pedidos', color: '#3b82f6' },
          ]}
          xAxisKey="month"
          height={300}
          stacked
        />
      </div>

      {/* Sparkline Charts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sparkline Charts - Para Cards de Métricas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sparkline com tendência positiva */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Vendas do Mês</p>
                <p className="text-2xl font-bold">R$ 45.230</p>
              </div>
              <span className="text-sm font-medium text-success bg-success/10 px-2 py-1 rounded">
                +12.5%
              </span>
            </div>
            <SparklineChart
              data={sparklineData}
              trend="up"
              height={50}
            />
          </div>

          {/* Sparkline com tendência negativa */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pedidos Ativos</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <span className="text-sm font-medium text-error bg-error/10 px-2 py-1 rounded">
                -5.2%
              </span>
            </div>
            <SparklineChart
              data={sparklineData.map(d => ({ value: 30 - d.value }))}
              trend="down"
              height={50}
            />
          </div>

          {/* Sparkline neutra */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 85,40</p>
              </div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded">
                +0.3%
              </span>
            </div>
            <SparklineChart
              data={sparklineData.map(d => ({ value: d.value + Math.random() * 5 - 2.5 }))}
              trend="neutral"
              height={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
