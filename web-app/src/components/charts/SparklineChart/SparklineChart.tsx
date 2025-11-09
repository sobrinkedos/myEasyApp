import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface DataPoint {
  value: number;
  [key: string]: string | number;
}

interface SparklineChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  width?: number | string;
  strokeWidth?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const SparklineChart = ({
  data,
  dataKey = 'value',
  color,
  height = 40,
  width = '100%',
  strokeWidth = 2,
  trend,
  className = '',
}: SparklineChartProps) => {
  // Determinar cor baseada na tendência se não for fornecida
  const getColor = () => {
    if (color) return color;
    
    if (trend === 'up') return '#10b981'; // success
    if (trend === 'down') return '#ef4444'; // error
    return '#3b82f6'; // secondary
  };

  const lineColor = getColor();

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
