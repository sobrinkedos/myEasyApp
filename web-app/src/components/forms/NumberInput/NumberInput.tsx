import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import clsx from 'clsx';

export interface NumberInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  decimals?: number;
  placeholder?: string;
  disabled?: boolean;
  showControls?: boolean;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  format = 'number',
  currency = 'BRL',
  decimals = 2,
  placeholder,
  disabled = false,
  showControls = true,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Formatar valor para exibição
  const formatValue = (num: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    }

    if (format === 'percentage') {
      return `${num.toFixed(decimals)}%`;
    }

    return num.toFixed(decimals);
  };

  // Atualizar display quando value mudar
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value !== undefined ? formatValue(value) : '');
    }
  }, [value, isFocused, format, currency, decimals]);

  // Validar e aplicar limites
  const validateValue = (num: number): number => {
    let validated = num;

    if (min !== undefined && validated < min) {
      validated = min;
    }

    if (max !== undefined && validated > max) {
      validated = max;
    }

    return validated;
  };

  // Handler de mudança
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);

    // Remover formatação para obter número
    const cleanValue = rawValue.replace(/[^\d.,-]/g, '').replace(',', '.');
    const numValue = parseFloat(cleanValue);

    if (!isNaN(numValue)) {
      onChange(validateValue(numValue));
    } else if (rawValue === '' || rawValue === '-') {
      onChange(0);
    }
  };

  // Handler de blur
  const handleBlur = () => {
    setIsFocused(false);
    // Garantir que o valor seja válido
    onChange(validateValue(value));
  };

  // Handler de focus
  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar valor sem formatação durante edição
    setDisplayValue(value.toString());
  };

  // Incrementar
  const handleIncrement = () => {
    const newValue = validateValue(value + step);
    onChange(newValue);
  };

  // Decrementar
  const handleDecrement = () => {
    const newValue = validateValue(value - step);
    onChange(newValue);
  };

  // Verificar se pode incrementar/decrementar
  const canIncrement = max === undefined || value < max;
  const canDecrement = min === undefined || value > min;

  return (
    <div className={clsx('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* Botão de decrementar */}
        {showControls && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || !canDecrement}
            className={clsx(
              'absolute left-2 z-10',
              'p-1.5 rounded',
              'transition-colors duration-200',
              {
                'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800':
                  !disabled && canDecrement,
                'text-neutral-300 dark:text-neutral-700 cursor-not-allowed':
                  disabled || !canDecrement,
              }
            )}
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        {/* Input */}
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-3',
            'bg-white dark:bg-neutral-900',
            'border-2 rounded-lg',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder-neutral-400 dark:placeholder-neutral-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            {
              'border-neutral-300 dark:border-neutral-600': !isFocused,
              'border-primary-500 dark:border-primary-400': isFocused,
              'opacity-60 cursor-not-allowed': disabled,
              'hover:border-neutral-400 dark:hover:border-neutral-500': !disabled && !isFocused,
              'pl-10': showControls,
              'pr-10': showControls,
              'text-center': showControls,
            }
          )}
        />

        {/* Botão de incrementar */}
        {showControls && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || !canIncrement}
            className={clsx(
              'absolute right-2 z-10',
              'p-1.5 rounded',
              'transition-colors duration-200',
              {
                'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800':
                  !disabled && canIncrement,
                'text-neutral-300 dark:text-neutral-700 cursor-not-allowed':
                  disabled || !canIncrement,
              }
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Informação de range */}
      {(min !== undefined || max !== undefined) && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {min !== undefined && max !== undefined
            ? `Valor entre ${min} e ${max}`
            : min !== undefined
            ? `Valor mínimo: ${min}`
            : `Valor máximo: ${max}`}
        </p>
      )}
    </div>
  );
};

NumberInput.displayName = 'NumberInput';

export default NumberInput;
