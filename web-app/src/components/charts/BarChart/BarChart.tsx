import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface DataPoint {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

interface BarChartProps {
  data: DataPoint[];
  bars: BarConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { theme } = useTheme();
  
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={`rounded-lg border shadow-lg p-3 ${
        theme === 'dark'
          ? 'bg-neutral-800 border-neutral-700'
          : 'bg-white border-neutral-200'
      }`}
    >
      <p className="text-sm font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            {entry.name}:
          </span>
          <span className="font-semibold">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('pt-BR')
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const BarChart = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  horizontal = false,
  stacked = false,
  className = '',
}: BarChartProps) => {
  const { theme } = useTheme();

  const colors = useMemo(
    () => [
      '#f97316', // primary-500
      '#3b82f6', // secondary-500
      '#10b981', // success
      '#f59e0b', // warning
      '#ef4444', // error
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
    ],
    []
  );

  const axisColor = theme === 'dark' ? '#737373' : '#a3a3a3';
  const gridColor = theme === 'dark' ? '#262626' : '#e5e5e5';

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          )}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
              />
              <YAxis
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={{ stroke: axisColor }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
            </>
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || colors[index % colors.length]}
              stackId={stacked ? (bar.stackId || 'stack') : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
