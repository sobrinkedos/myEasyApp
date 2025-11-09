import React, { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right', className }) => {
  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      {/* Trigger button */}
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>

      {/* Dropdown menu */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-50 mt-2 w-56',
            'bg-white dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-700',
            'rounded-lg shadow-lg',
            'focus:outline-none',
            'overflow-hidden',
            {
              'right-0 origin-top-right': align === 'right',
              'left-0 origin-top-left': align === 'left',
            }
          )}
        >
          <div className="py-1">
            {items.map((item, index) => {
              // Renderizar divider
              if (item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-neutral-200 dark:border-neutral-700"
                  />
                );
              }

              // Renderizar item do menu
              return (
                <Menu.Item key={index} disabled={item.disabled}>
                  {({ active }) => (
                    <button
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5',
                        'text-sm text-left',
                        'transition-colors duration-150',
                        {
                          // Estados normais
                          'text-neutral-700 dark:text-neutral-200': !item.danger && !item.disabled,
                          'bg-neutral-50 dark:bg-neutral-800': active && !item.danger && !item.disabled,

                          // Estado de perigo
                          'text-error-DEFAULT': item.danger && !item.disabled,
                          'bg-error-light dark:bg-error-dark/20': active && item.danger && !item.disabled,

                          // Estado disabled
                          'text-neutral-400 dark:text-neutral-600 cursor-not-allowed': item.disabled,
                        }
                      )}
                    >
                      {item.icon && (
                        <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                      )}
                      <span className="flex-1">{item.label}</span>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
