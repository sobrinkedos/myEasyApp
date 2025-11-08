import api from './api';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  isActive: boolean;
}

export interface Command {
  id: string;
  code: string;
  tableId?: string;
  type: 'table' | 'counter';
  waiterId: string;
  numberOfPeople: number;
  customerName?: string;
  customerPhone?: string;
  status: 'open' | 'closed' | 'paid';
  subtotal: number;
  serviceCharge: number;
  total: number;
  openedAt: string;
  closedAt?: string;
  table?: Table;
  waiter?: {
    id: string;
    name: string;
    email: string;
  };
  orders?: any[];
}

export interface OpenCommandDTO {
  tableId?: string;
  numberOfPeople: number;
  type: 'table' | 'counter';
  customerName?: string;
  customerPhone?: string;
}

export interface CloseCommandDTO {
  serviceChargePercentage?: number;
}

export const commandService = {
  async getAll(filters?: {
    status?: string;
    waiterId?: string;
    tableId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/commands', { params: filters });
    return response.data;
  },

  async getOpen() {
    const response = await api.get('/commands/open');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/commands/${id}`);
    return response.data;
  },

  async openCommand(data: OpenCommandDTO) {
    const response = await api.post('/commands', data);
    return response.data;
  },

  async closeCommand(id: string, data?: CloseCommandDTO) {
    const response = await api.post(`/commands/${id}/close`, data);
    return response.data;
  },

  async confirmPayment(id: string) {
    const response = await api.post(`/commands/${id}/confirm-payment`);
    return response.data;
  },
};
