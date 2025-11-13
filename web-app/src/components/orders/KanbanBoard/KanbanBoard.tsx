import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';
import { motion } from 'framer-motion';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  priority?: 'low' | 'normal' | 'high';
  notes?: string;
  status: OrderStatus;
}

interface KanbanBoardProps {
  orders: Order[];
  onOrderMove: (orderId: string, newStatus: OrderStatus) => void;
  onOrderClick?: (order: Order) => void;
  onOrderPrint?: (order: Order) => void;
}

const COLUMNS: Array<{ id: OrderStatus; title: string; color: string }> = [
  { id: 'pending', title: 'Pendente', color: 'bg-neutral-100 dark:bg-neutral-800' },
  { id: 'preparing', title: 'Preparando', color: 'bg-warning/10 dark:bg-warning/20' },
  { id: 'ready', title: 'Pronto', color: 'bg-success/10 dark:bg-success/20' },
  { id: 'delivered', title: 'Entregue', color: 'bg-info/10 dark:bg-info/20' },
];

export const KanbanBoard = ({ orders, onOrderMove, onOrderClick, onOrderPrint }: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se estamos sobre uma coluna
    if (COLUMNS.some((col) => col.id === overId)) {
      const newStatus = overId as OrderStatus;
      setLocalOrders((orders) =>
        orders.map((order) =>
          order.id === activeId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar o pedido
    const activeOrder = localOrders.find((o) => o.id === activeId);
    if (!activeOrder) return;

    // Se estamos sobre uma coluna, mover para essa coluna
    if (COLUMNS.some((col) => col.id === overId)) {
      const newStatus = overId as OrderStatus;
      if (activeOrder.status !== newStatus) {
        onOrderMove(activeId, newStatus);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setLocalOrders(orders);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return localOrders.filter((order) => order.status === status);
  };

  const activeOrder = activeId ? localOrders.find((o) => o.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            orders={getOrdersByStatus(column.id)}
            onOrderClick={onOrderClick}
            onOrderPrint={onOrderPrint}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            className="cursor-grabbing"
          >
            <OrderCard order={activeOrder} isDragging />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
