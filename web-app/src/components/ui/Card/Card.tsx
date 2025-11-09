import React, { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  children: ReactNode;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, className, children, ...props }, ref) => {
    // Classes base
    const baseClasses = clsx(
      'rounded-lg',
      'bg-white dark:bg-neutral-900',
      'transition-all duration-200'
    );

    // Classes de variante
    const variantClasses = {
      default: 'shadow-sm',
      elevated: 'shadow-md',
      outlined: 'border-2 border-neutral-200 dark:border-neutral-700',
    };

    // Classes de hover
    const hoverClasses = hoverable
      ? clsx(
          'cursor-pointer',
          variant === 'default' && 'hover:shadow-md',
          variant === 'elevated' && 'hover:shadow-lg hover:-translate-y-0.5',
          variant === 'outlined' && 'hover:border-neutral-300 dark:hover:border-neutral-600'
        )
      : '';

    const cardClasses = clsx(baseClasses, variantClasses[variant], hoverClasses, className);

    if (hoverable) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Subcomponente CardHeader
export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => {
    const headerClasses = clsx(
      'px-6 py-4',
      'border-b border-neutral-200 dark:border-neutral-700',
      className
    );

    return (
      <div ref={ref} className={headerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Subcomponente CardBody
export const CardBody = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => {
    const bodyClasses = clsx('px-6 py-4', className);

    return (
      <div ref={ref} className={bodyClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Subcomponente CardFooter
export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => {
    const footerClasses = clsx(
      'px-6 py-4',
      'border-t border-neutral-200 dark:border-neutral-700',
      className
    );

    return (
      <div ref={ref} className={footerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
