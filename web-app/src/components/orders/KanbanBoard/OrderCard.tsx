import { Order } from './KanbanBoard';
import { Clock, AlertCircle, User, Printer } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  isDragging?: boolean;
  onClick?: () => void;
  onPrint?: (order: Order) => void;
}

export const OrderCard = ({ order, isDragging = false, onClick, onPrint }: OrderCardProps) => {
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPrint) {
      onPrint(order);
    }
  };
  const getElapsedTime = () => {
    return formatDistanceToNow(new Date(order.createdAt), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const getPriorityColor = () => {
    switch (order.priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'info';
      case 'low':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getPriorityLabel = () => {
    switch (order.priority) {
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 transition-all ${
        isDragging ? 'opacity-50 rotate-2' : 'hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Pedido #{order.orderNumber}
          </h4>
          {order.tableNumber && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              Mesa {order.tableNumber}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              title="Imprimir pedido"
            >
              <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
          {order.priority && order.priority !== 'normal' && (
            <Badge variant="soft" color={getPriorityColor()}>
              {getPriorityLabel()}
            </Badge>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="text-sm text-neutral-700 dark:text-neutral-300 flex justify-between"
          >
            <span>
              {item.quantity}x {item.name}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            +{order.items.length - 3} itens
          </p>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3 p-2 bg-warning/10 dark:bg-warning/20 rounded text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
          <AlertCircle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
          <span>{order.notes}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <Clock className="w-3 h-3" />
          <span>{getElapsedTime()}</span>
        </div>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          R$ {order.totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
