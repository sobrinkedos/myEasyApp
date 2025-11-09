import api from './api';

export type CounterOrderStatus =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PENDENTE'
  | 'PREPARANDO'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface CounterOrder {
  id: string;
  orderNumber: number;
  customerName?: string;
  status: CounterOrderStatus;
  totalAmount: number;
  notes?: string;
  items: CounterOrderItem[];
  createdAt: string;
  paidAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CounterOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface CreateCounterOrderDTO {
  customerName?: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface UpdateCounterOrderStatusDTO {
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE';
}

export interface CancelCounterOrderDTO {
  reason: string;
}

export const counterOrderService = {
  async create(data: CreateCounterOrderDTO) {
    const response = await api.post('/counter-orders', data);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/counter-orders/${id}`);
    return response.data;
  },

  async getByNumber(orderNumber: number) {
    const response = await api.get(`/counter-orders/number/${orderNumber}`);
    return response.data;
  },

  async getActive() {
    const response = await api.get('/counter-orders');
    return response.data;
  },

  async getPendingPayment() {
    const response = await api.get('/counter-orders/pending-payment');
    return response.data;
  },

  async getReady() {
    const response = await api.get('/counter-orders/ready');
    return response.data;
  },

  async updateStatus(id: string, data: UpdateCounterOrderStatusDTO) {
    const response = await api.patch(`/counter-orders/${id}/status`, data);
    return response.data;
  },

  async confirmPayment(id: string) {
    const response = await api.post(`/counter-orders/${id}/confirm-payment`);
    return response.data;
  },

  async confirmPaymentWithMethod(
    id: string,
    data: { paymentMethod: string; amount: number }
  ) {
    const response = await api.post(`/counter-orders/${id}/confirm-payment`, data);
    return response.data;
  },

  async cancel(id: string, data: CancelCounterOrderDTO) {
    const response = await api.post(`/counter-orders/${id}/cancel`, data);
    return response.data;
  },

  async getMetrics(startDate: string, endDate: string) {
    const response = await api.get('/counter-orders/metrics', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
