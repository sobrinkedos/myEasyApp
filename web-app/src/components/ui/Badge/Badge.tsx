import React, { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'solid' | 'outline' | 'soft';
export type BadgeColor = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  children: ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'solid', color = 'neutral', className, children, ...props }, ref) => {
    // Classes base
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'px-2.5 py-0.5',
      'text-xs font-medium',
      'rounded-full',
      'transition-colors duration-200'
    );

    // Classes de cor por variante
    const colorClasses = {
      solid: {
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-error text-white',
        info: 'bg-info text-white',
        neutral: 'bg-neutral-600 text-white dark:bg-neutral-400 dark:text-neutral-900',
        primary: 'bg-primary-500 text-white',
      },
      outline: {
        success: 'border-2 border-success text-success dark:text-success bg-transparent',
        warning: 'border-2 border-warning text-warning dark:text-warning bg-transparent',
        error: 'border-2 border-error text-error dark:text-error bg-transparent',
        info: 'border-2 border-info text-info dark:text-info bg-transparent',
        neutral: 'border-2 border-neutral-400 text-neutral-700 dark:text-neutral-300 bg-transparent',
        primary: 'border-2 border-primary-500 text-primary-700 dark:text-primary-400 bg-transparent',
      },
      soft: {
        success: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
        warning: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
        error: 'bg-error/10 text-error dark:bg-error/20 dark:text-error',
        info: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
        neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
      },
    };

    const badgeClasses = clsx(
      baseClasses,
      colorClasses[variant]?.[color] || colorClasses.solid.neutral,
      className
    );

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
