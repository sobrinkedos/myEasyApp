import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  description,
  duration = 3000,
  onClose,
  action,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Ícones por tipo
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  // Classes de cor por tipo
  const colorClasses = {
    success: {
      bg: 'bg-success-light dark:bg-success-dark/20',
      border: 'border-success-DEFAULT',
      icon: 'text-success-DEFAULT',
      text: 'text-success-dark dark:text-success-DEFAULT',
    },
    error: {
      bg: 'bg-error-light dark:bg-error-dark/20',
      border: 'border-error-DEFAULT',
      icon: 'text-error-DEFAULT',
      text: 'text-error-dark dark:text-error-DEFAULT',
    },
    warning: {
      bg: 'bg-warning-light dark:bg-warning-dark/20',
      border: 'border-warning-DEFAULT',
      icon: 'text-warning-DEFAULT',
      text: 'text-warning-dark dark:text-warning-DEFAULT',
    },
    info: {
      bg: 'bg-info-light dark:bg-info-dark/20',
      border: 'border-info-DEFAULT',
      icon: 'text-info-DEFAULT',
      text: 'text-info-dark dark:text-info-DEFAULT',
    },
  };

  const colors = colorClasses[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4',
        'min-w-[320px] max-w-md',
        colors.bg,
        colors.border
      )}
    >
      {/* Ícone */}
      <div className={clsx('flex-shrink-0 mt-0.5', colors.icon)}>{icons[type]}</div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium', colors.text)}>{message}</p>
        {description && (
          <p className={clsx('mt-1 text-sm', colors.text, 'opacity-90')}>{description}</p>
        )}

        {/* Ação */}
        {action && (
          <button
            onClick={action.onClick}
            className={clsx(
              'mt-2 text-sm font-medium underline',
              colors.text,
              'hover:opacity-80 transition-opacity'
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Botão de fechar */}
      <button
        onClick={() => onClose(id)}
        className={clsx(
          'flex-shrink-0 p-1 rounded',
          colors.text,
          'hover:bg-black/5 dark:hover:bg-white/5',
          'transition-colors'
        )}
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

Toast.displayName = 'Toast';

export default Toast;
