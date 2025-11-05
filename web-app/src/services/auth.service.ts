import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  establishmentId: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    console.log('📡 Enviando requisição de login para:', '/auth/login');
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    console.log('📥 Resposta recebida:', data);
    
    if (!data.success || !data.data) {
      console.error('❌ Resposta inválida:', data);
      throw new Error('Resposta inválida do servidor');
    }
    
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<{ success: boolean; data: User }>('/auth/profile');
    return data.data;
  },

  async logout(): Promise<void> {
    // Optional: call backend logout endpoint if exists
    // await api.post('/auth/logout');
  },
};
