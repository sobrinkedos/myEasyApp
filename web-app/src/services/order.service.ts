import api from './api';

export interface Order {
  id: string;
  commandId: string;
  orderNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  createdAt: string;
  preparedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  items: OrderItem[];
  command?: any;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  observations?: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface CreateOrderDTO {
  commandId: string;
  items: {
    productId: string;
    quantity: number;
    observations?: string;
  }[];
}

export interface UpdateStatusDTO {
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

export interface CancelOrderDTO {
  reason: string;
}

export interface ModifyOrderDTO {
  addItems?: {
    productId: string;
    quantity: number;
    observations?: string;
  }[];
  removeItemIds?: string[];
}

export const orderService = {
  async getById(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async getByCommand(commandId: string) {
    const response = await api.get(`/orders/by-command/${commandId}`);
    return response.data;
  },

  async getByStatus(status: string) {
    const response = await api.get(`/orders/by-status/${status}`);
    return response.data;
  },

  async create(data: CreateOrderDTO) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  async updateStatus(id: string, data: UpdateStatusDTO) {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },

  async cancel(id: string, data: CancelOrderDTO) {
    const response = await api.post(`/orders/${id}/cancel`, data);
    return response.data;
  },

  async modify(id: string, data: ModifyOrderDTO) {
    const response = await api.put(`/orders/${id}/modify`, data);
    return response.data;
  },
};
