import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from './KanbanBoard';
import { OrderCard } from './OrderCard';

interface SortableOrderCardProps {
  order: Order;
  onClick?: (order: Order) => void;
}

export const SortableOrderCard = ({ order, onClick }: SortableOrderCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard
        order={order}
        isDragging={isDragging}
        onClick={() => onClick?.(order)}
      />
    </div>
  );
};
