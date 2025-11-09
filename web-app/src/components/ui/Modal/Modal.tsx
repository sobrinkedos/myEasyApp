import React, { Fragment, ReactNode, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Classes de tamanho
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnEscape ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Container centralizado */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Painel do Modal */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'w-full',
                  sizeClasses[size],
                  'bg-white dark:bg-neutral-900',
                  'rounded-xl shadow-2xl',
                  'transform transition-all'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                    {title && (
                      <Dialog.Title className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {title}
                      </Dialog.Title>
                    )}

                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={onClose}
                        className={clsx(
                          'rounded-lg p-2',
                          'text-neutral-400 hover:text-neutral-600',
                          'dark:text-neutral-500 dark:hover:text-neutral-300',
                          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                          'transition-colors duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500',
                          !title && 'ml-auto'
                        )}
                        aria-label="Fechar modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Subcomponente ModalFooter para ações
export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-3',
        'px-6 py-4',
        'border-t border-neutral-200 dark:border-neutral-700',
        'bg-neutral-50 dark:bg-neutral-800/50',
        'rounded-b-xl',
        className
      )}
    >
      {children}
    </div>
  );
};

ModalFooter.displayName = 'ModalFooter';

export default Modal;
