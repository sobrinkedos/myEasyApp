import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (response?.data?.message) {
      return {
        message: response.data.message,
        code: response.data.code,
        field: response.data.field,
      };
    }
    
    if (response?.status === 401) {
      return { message: 'Sessão expirada. Faça login novamente.' };
    }
    
    if (response?.status === 403) {
      return { message: 'Você não tem permissão para realizar esta ação.' };
    }
    
    if (response?.status === 404) {
      return { message: 'Recurso não encontrado.' };
    }
    
    if (response?.status === 422) {
      return { message: 'Dados inválidos. Verifique os campos e tente novamente.' };
    }
    
    if (response?.status >= 500) {
      return { message: 'Erro no servidor. Tente novamente mais tarde.' };
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return { message: 'Erro de conexão. Verifique sua internet.' };
    }
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'Erro desconhecido. Tente novamente.' };
}

export function getErrorMessage(error: unknown): string {
  return handleApiError(error).message;
}
