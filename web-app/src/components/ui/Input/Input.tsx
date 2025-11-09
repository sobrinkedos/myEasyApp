import React, { InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  success?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      disabled = false,
      prefixIcon,
      suffixIcon,
      className,
      value,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    // Determinar estado visual
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    // Classes do container
    const containerClasses = clsx(
      'relative w-full',
      disabled && 'opacity-60 cursor-not-allowed'
    );

    // Classes do wrapper do input
    const wrapperClasses = clsx(
      'relative flex items-center',
      'border-2 rounded-lg',
      'bg-white dark:bg-neutral-900',
      'transition-all duration-200',
      {
        // Estados normais
        'border-neutral-300 dark:border-neutral-600': !hasError && !hasSuccess && !isFocused,
        'border-primary-500 dark:border-primary-400': !hasError && !hasSuccess && isFocused,
        
        // Estado de erro
        'border-error-DEFAULT': hasError,
        
        // Estado de sucesso
        'border-success-DEFAULT': hasSuccess,
        
        // Hover (apenas se não estiver disabled)
        'hover:border-neutral-400 dark:hover:border-neutral-500': !disabled && !hasError && !hasSuccess && !isFocused,
      }
    );

    // Classes do input
    const inputClasses = clsx(
      'w-full px-4 py-3',
      'bg-transparent',
      'text-neutral-900 dark:text-neutral-100',
      'placeholder-transparent',
      'focus:outline-none',
      'transition-all duration-200',
      {
        'pl-11': prefixIcon,
        'pr-11': suffixIcon,
        'cursor-not-allowed': disabled,
      }
    );

    // Classes do label flutuante
    const labelClasses = clsx(
      'absolute left-4 pointer-events-none',
      'text-neutral-500 dark:text-neutral-400',
      'transition-all duration-200',
      {
        // Label flutuante (quando focused ou tem valor)
        'text-xs -top-2.5 bg-white dark:bg-neutral-900 px-1': isFloating,
        'text-base top-3': !isFloating,
        
        // Cores baseadas no estado
        'text-primary-500 dark:text-primary-400': isFocused && !hasError && !hasSuccess,
        'text-error-DEFAULT': hasError,
        'text-success-DEFAULT': hasSuccess,
        
        // Ajuste de posição com ícone
        'left-11': prefixIcon && !isFloating,
      }
    );

    // Classes dos ícones
    const iconClasses = clsx(
      'absolute flex items-center justify-center',
      'w-10 h-full',
      'text-neutral-400 dark:text-neutral-500',
      {
        'text-primary-500 dark:text-primary-400': isFocused && !hasError && !hasSuccess,
        'text-error-DEFAULT': hasError,
        'text-success-DEFAULT': hasSuccess,
      }
    );

    return (
      <div className={containerClasses}>
        <div className={wrapperClasses}>
          {/* Ícone de prefixo */}
          {prefixIcon && (
            <div className={clsx(iconClasses, 'left-0')}>
              {prefixIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            value={value}
            disabled={disabled}
            className={inputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Label flutuante */}
          <label className={labelClasses}>
            {label}
          </label>

          {/* Ícone de sufixo */}
          {suffixIcon && (
            <div className={clsx(iconClasses, 'right-0')}>
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Mensagens de validação */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-sm text-error-DEFAULT flex items-center gap-1"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-sm text-success-DEFAULT flex items-center gap-1"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
