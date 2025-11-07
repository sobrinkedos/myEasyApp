import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-800',
    button: 'bg-green-600 hover:bg-green-700',
    Icon: CheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-800',
    button: 'bg-red-600 hover:bg-red-700',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-800',
    button: 'bg-yellow-600 hover:bg-yellow-700',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700',
    Icon: Info,
  },
};

export function AlertBanner({ type, title, message, onClose, action }: AlertBannerProps) {
  const styles = alertStyles[type];
  const IconComponent = styles.Icon;

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          <p className={`text-sm mt-1 ${styles.message}`}>{message}</p>
          
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-3 py-1 text-sm text-white rounded ${styles.button} transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
