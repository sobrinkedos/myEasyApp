/**
 * Counter Order Models and Types
 * Modelos e tipos para o sistema de Pedidos Balcão
 */

// Enum de status do pedido balcão
export enum CounterOrderStatus {
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PENDENTE = 'PENDENTE',
  PREPARANDO = 'PREPARANDO',
  PRONTO = 'PRONTO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

// Interface para item do pedido balcão
export interface CounterOrderItem {
  id: string;
  counterOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// Interface para pedido balcão
export interface CounterOrder {
  id: string;
  orderNumber: number;
  customerName?: string;
  status: CounterOrderStatus;
  totalAmount: number;
  notes?: string;
  cancellationReason?: string;
  createdAt: Date;
  paidAt?: Date;
  startedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  establishmentId: string;
  createdById: string;
  items?: CounterOrderItem[];
}

// DTOs de Request

export interface CreateCounterOrderItemDTO {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateCounterOrderDTO {
  customerName?: string;
  notes?: string;
  items: CreateCounterOrderItemDTO[];
}

export interface UpdateCounterOrderStatusDTO {
  status: CounterOrderStatus;
}

export interface CancelCounterOrderDTO {
  reason: string;
}

// DTOs de Response

export interface CounterOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface CounterOrderResponse {
  id: string;
  orderNumber: number;
  customerName?: string;
  status: CounterOrderStatus;
  totalAmount: number;
  notes?: string;
  items: CounterOrderItemResponse[];
  createdAt: string;
  paidAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  createdBy: {
    id: string;
    name: string;
  };
}

// Interface para dados de criação no repositório
export interface CreateCounterOrderData {
  customerName?: string;
  notes?: string;
  totalAmount: number;
  items: CreateCounterOrderItemData[];
  establishmentId: string;
  createdById: string;
}

export interface CreateCounterOrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// Interface para métricas
export interface CounterOrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averagePaymentTime: number;
  averagePreparationTime: number;
  ordersByStatus: Record<CounterOrderStatus, number>;
}

// Tipos auxiliares para validação de transições de status
export const VALID_STATUS_TRANSITIONS: Record<CounterOrderStatus, CounterOrderStatus[]> = {
  [CounterOrderStatus.AGUARDANDO_PAGAMENTO]: [
    CounterOrderStatus.PENDENTE,
    CounterOrderStatus.CANCELADO,
  ],
  [CounterOrderStatus.PENDENTE]: [
    CounterOrderStatus.PREPARANDO,
    CounterOrderStatus.CANCELADO,
  ],
  [CounterOrderStatus.PREPARANDO]: [
    CounterOrderStatus.PRONTO,
  ],
  [CounterOrderStatus.PRONTO]: [
    CounterOrderStatus.ENTREGUE,
  ],
  [CounterOrderStatus.ENTREGUE]: [],
  [CounterOrderStatus.CANCELADO]: [],
};

// Helper para validar transição de status
export function isValidStatusTransition(
  currentStatus: CounterOrderStatus,
  newStatus: CounterOrderStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
