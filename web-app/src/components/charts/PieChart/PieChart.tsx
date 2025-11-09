import { useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { useTheme } from '../../../hooks/useTheme';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  const { theme } = useTheme();
  
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];

  return (
    <div
      className={`rounded-lg border shadow-lg p-3 ${
        theme === 'dark'
          ? 'bg-neutral-800 border-neutral-700'
          : 'bg-white border-neutral-200'
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="font-medium">{data.name}:</span>
        <span className="font-semibold">
          {typeof data.value === 'number'
            ? data.value.toLocaleString('pt-BR')
            : data.value}
        </span>
      </div>
      {data.payload.percentage && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {data.payload.percentage}%
        </div>
      )}
    </div>
  );
};

const renderLabel = (entry: DataPoint & { percent?: number }) => {
  const percent = entry.percent ? (entry.percent * 100).toFixed(0) : 0;
  return `${percent}%`;
};

export const PieChart = ({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 80,
  colors,
  className = '',
}: PieChartProps) => {
  const { theme } = useTheme();

  const defaultColors = useMemo(
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

  const chartColors = colors || defaultColors;

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={showLabels ? renderLabel : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
              iconType="circle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
