import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastStyles = {
  success: {
    container: 'bg-green-600',
    Icon: CheckCircle,
  },
  error: {
    container: 'bg-red-600',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-yellow-600',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-600',
    Icon: Info,
  },
};

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const styles = toastStyles[type];
  const IconComponent = styles.Icon;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.container} text-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}>
      <IconComponent className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
