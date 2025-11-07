import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ 
  title = 'Erro ao carregar dados', 
  message, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}
