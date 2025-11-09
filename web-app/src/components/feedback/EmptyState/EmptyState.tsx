import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Search, AlertCircle, Inbox } from 'lucide-react';
import clsx from 'clsx';

export type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'default';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className,
}) => {
  // Ícones padrão por variante
  const defaultIcons = {
    'no-data': <Inbox className="w-16 h-16" />,
    'no-results': <Search className="w-16 h-16" />,
    error: <AlertCircle className="w-16 h-16" />,
    default: <FileQuestion className="w-16 h-16" />,
  };

  // Cores por variante
  const colorClasses = {
    'no-data': 'text-neutral-400 dark:text-neutral-600',
    'no-results': 'text-info-DEFAULT',
    error: 'text-error-DEFAULT',
    default: 'text-neutral-400 dark:text-neutral-600',
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'flex flex-col items-center justify-center',
        'py-12 px-4 text-center',
        className
      )}
    >
      {/* Ícone */}
      <div className={clsx('mb-4', colorClasses[variant])}>{displayIcon}</div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      {/* Descrição */}
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Ação */}
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-primary-500 text-white',
            'hover:bg-primary-600 active:bg-primary-700',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'font-medium text-sm'
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
