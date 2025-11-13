import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Order, OrderStatus } from './KanbanBoard';
import { SortableOrderCard } from './SortableOrderCard';

interface KanbanColumnProps {
  id: OrderStatus;
  title: string;
  color: string;
  orders: Order[];
  onOrderClick?: (order: Order) => void;
  onOrderPrint?: (order: Order) => void;
}

export const KanbanColumn = ({
  id,
  title,
  color,
  orders,
  onOrderClick,
  onOrderPrint,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border-2 transition-colors ${
        isOver
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-neutral-200 dark:border-neutral-700'
      }`}
    >
      {/* Header */}
      <div className={`p-4 rounded-t-lg ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-white dark:bg-neutral-800 rounded-full">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 p-3 space-y-3 min-h-[200px] bg-neutral-50 dark:bg-neutral-900/50">
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-neutral-400 dark:text-neutral-500">
              Nenhum pedido
            </div>
          ) : (
            orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onClick={onOrderClick}
                onPrint={onOrderPrint}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};
