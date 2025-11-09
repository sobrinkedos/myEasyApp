import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

/**
 * Hook para usar o sistema de Toast
 * Fornece métodos para exibir notificações
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }

  return context;
};
