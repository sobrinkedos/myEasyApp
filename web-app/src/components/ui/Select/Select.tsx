import React, { useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  loading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar opções baseado na busca
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  // Obter label(s) selecionada(s)
  const getSelectedLabel = () => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find((opt) => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} selecionados`;
    }

    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  };

  // Verificar se uma opção está selecionada
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}

      <Listbox
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        multiple={multiple as any}
      >
        {({ open }) => (
          <div className="relative">
            {/* Botão do Select */}
            <Listbox.Button
              className={clsx(
                'relative w-full',
                'px-4 py-3 pr-10',
                'text-left',
                'bg-white dark:bg-neutral-900',
                'border-2 rounded-lg',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                {
                  'border-neutral-300 dark:border-neutral-600': !error && !open,
                  'border-primary-500 dark:border-primary-400': !error && open,
                  'border-error-DEFAULT': error,
                  'opacity-60 cursor-not-allowed': disabled || loading,
                  'hover:border-neutral-400 dark:hover:border-neutral-500':
                    !disabled && !loading && !error && !open,
                }
              )}
            >
              <span
                className={clsx(
                  'block truncate',
                  !value || (Array.isArray(value) && value.length === 0)
                    ? 'text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-900 dark:text-neutral-100'
                )}
              >
                {loading ? 'Carregando...' : getSelectedLabel()}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown
                  className={clsx(
                    'w-5 h-5 text-neutral-400 transition-transform duration-200',
                    open && 'transform rotate-180'
                  )}
                />
              </span>
            </Listbox.Button>

            {/* Dropdown de opções */}
            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Listbox.Options
                className={clsx(
                  'absolute z-10 mt-2 w-full',
                  'bg-white dark:bg-neutral-900',
                  'border-2 border-neutral-200 dark:border-neutral-700',
                  'rounded-lg shadow-lg',
                  'max-h-60 overflow-auto',
                  'focus:outline-none'
                )}
              >
                {/* Campo de busca */}
                {searchable && (
                  <div className="sticky top-0 bg-white dark:bg-neutral-900 p-2 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        className={clsx(
                          'w-full pl-10 pr-8 py-2',
                          'bg-neutral-50 dark:bg-neutral-800',
                          'border border-neutral-200 dark:border-neutral-700',
                          'rounded-lg',
                          'text-sm',
                          'text-neutral-900 dark:text-neutral-100',
                          'placeholder-neutral-400 dark:placeholder-neutral-500',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500'
                        )}
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                        >
                          <X className="w-3 h-3 text-neutral-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Lista de opções */}
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    Nenhuma opção encontrada
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ active }) =>
                        clsx(
                          'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                          'transition-colors duration-150',
                          {
                            'bg-primary-50 dark:bg-primary-900/20': active,
                            'text-neutral-900 dark:text-neutral-100': !option.disabled,
                            'text-neutral-400 dark:text-neutral-600 cursor-not-allowed':
                              option.disabled,
                          }
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={clsx(
                              'block truncate',
                              selected ? 'font-medium' : 'font-normal'
                            )}
                          >
                            {option.label}
                          </span>

                          {isSelected(option.value) && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-500">
                              <Check className="w-5 h-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))
                )}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1.5 text-sm text-error-DEFAULT flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
