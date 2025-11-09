import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Classes base
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'w-full': fullWidth,
      }
    );

    // Classes de variante
    const variantClasses = {
      primary: clsx(
        'bg-primary-500 text-white',
        'hover:bg-primary-600 active:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
        !isDisabled && 'hover:scale-[1.02]'
      ),
      secondary: clsx(
        'bg-secondary-500 text-white',
        'hover:bg-secondary-600 active:bg-secondary-700',
        'focus:ring-secondary-500',
        'shadow-sm hover:shadow-md',
        !isDisabled && 'hover:scale-[1.02]'
      ),
      outline: clsx(
        'bg-transparent border-2',
        'border-neutral-300 text-neutral-700',
        'hover:bg-neutral-50 active:bg-neutral-100',
        'dark:border-neutral-600 dark:text-neutral-200',
        'dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
        'focus:ring-neutral-500'
      ),
      ghost: clsx(
        'bg-transparent text-neutral-700',
        'hover:bg-neutral-100 active:bg-neutral-200',
        'dark:text-neutral-200',
        'dark:hover:bg-neutral-800 dark:active:bg-neutral-700',
        'focus:ring-neutral-500'
      ),
    };

    // Classes de tamanho
    const sizeClasses = {
      sm: clsx('px-3 py-2 text-sm gap-1.5', icon && 'min-h-[32px]'),
      md: clsx('px-4 py-2.5 text-base gap-2', icon && 'min-h-[40px]'),
      lg: clsx('px-5 py-3 text-lg gap-2.5', icon && 'min-h-[48px]'),
    };

    const buttonClasses = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        <span>{children}</span>

        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
