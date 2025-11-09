import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  ...props
}) => {
  // Classes base com animação shimmer
  const baseClasses = clsx(
    'bg-neutral-200 dark:bg-neutral-800',
    'animate-pulse',
    'relative overflow-hidden',
    // Efeito shimmer
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r',
    'before:from-transparent before:via-white/20 before:to-transparent',
    'before:animate-shimmer'
  );

  // Classes de variante
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  // Estilos inline
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={style}
      role="status"
      aria-label="Carregando"
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';

// Componentes de conveniência para casos comuns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx('p-4 space-y-4', className)}>
      <Skeleton variant="rectangular" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
};

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
};

SkeletonAvatar.displayName = 'SkeletonAvatar';

export default Skeleton;
