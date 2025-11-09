import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { SparklineChart } from '../../charts/SparklineChart';
import { motion } from 'framer-motion';

interface SparklineData {
  value: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  sparklineData?: SparklineData[];
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary-500',
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/20',
  sparklineData,
  trend,
  loading = false,
  className = '',
}: MetricCardProps) => {
  // Determinar tendência automaticamente se não fornecida
  const getTrend = (): 'up' | 'down' | 'neutral' => {
    if (trend) return trend;
    if (change === undefined) return 'neutral';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const currentTrend = getTrend();

  // Cores para o badge de mudança
  const getChangeColors = () => {
    if (currentTrend === 'up') {
      return 'text-success bg-success/10';
    }
    if (currentTrend === 'down') {
      return 'text-error bg-error/10';
    }
    return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700';
  };

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mb-2" />
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
            </div>
            {Icon && (
              <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            )}
          </div>
          {sparklineData && (
            <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded" />
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${getChangeColors()}`}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4">
          <SparklineChart
            data={sparklineData}
            trend={currentTrend}
            height={50}
          />
        </div>
      )}
    </motion.div>
  );
};
