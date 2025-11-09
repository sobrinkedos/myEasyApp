import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white' | 'neutral';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label,
}) => {
  // Classes de tamanho
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  // Classes de cor
  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    secondary: 'border-secondary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    neutral: 'border-neutral-500 border-t-transparent dark:border-neutral-400',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        className={clsx('rounded-full', sizeClasses[size], colorClasses[color])}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
        role="status"
        aria-label={label || 'Carregando'}
      />
      {label && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
      )}
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
