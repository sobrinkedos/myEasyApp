import api from './api';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableDTO {
  number: number;
  capacity: number;
}

export interface UpdateTableDTO {
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
  isActive?: boolean;
}

export const tableService = {
  async getAll() {
    const response = await api.get('/tables');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  async create(data: CreateTableDTO) {
    const response = await api.post('/tables', data);
    return response.data;
  },

  async update(id: string, data: UpdateTableDTO) {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },
};
