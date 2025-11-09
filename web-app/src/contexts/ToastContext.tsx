import React, { createContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer from '../components/feedback/Toast/ToastContainer';
import { ToastType } from '../components/feedback/Toast/Toast';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Gerar ID único
  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Adicionar toast
  const addToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      type,
      message,
      description: options?.description,
      duration: options?.duration ?? 3000,
      action: options?.action,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  // Remover toast
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Remover todos os toasts
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Métodos de conveniência
  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('success', message, options);
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('error', message, options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('warning', message, options);
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      addToast('info', message, options);
    },
    [addToast]
  );

  const value: ToastContextType = {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={dismiss} position={position} />
    </ToastContext.Provider>
  );
};
