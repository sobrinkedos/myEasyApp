import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface CashSession {
  id: string;
  cashRegisterId: string;
  operatorId: string;
  openingAmount: number;
  expectedAmount?: number;
  countedAmount?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED' | 'TRANSFERRED' | 'RECEIVED' | 'REOPENED';
  openedAt: string;
  closedAt?: string;
  cashRegister: {
    id: string;
    number: number;
    name: string;
  };
  operator: {
    id: string;
    name: string;
    email: string;
  };
}

interface SessionBalance {
  openingAmount: number;
  salesTotal: number;
  cashSales: number;
  cardSales: number;
  pixSales: number;
  withdrawals: number;
  supplies: number;
  expectedCash: number;
  currentBalance: number;
}

export function CashSessionPage() {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<CashSession | null>(null);
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cash/sessions/active');
      
      if (response.data.success && response.data.data) {
        setActiveSession(response.data.data);
        loadBalance(response.data.data.id);
      } else {
        setActiveSession(null);
      }
    } catch (error: any) {
      console.error('Erro ao carregar sessão:', error);
      if (error.response?.status !== 404) {
        setError('Erro ao carregar sessão ativa');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalance = async (sessionId: string) => {
    try {
      const response = await api.get(`/cash/sessions/${sessionId}/balance`);
      
      if (response.data.success) {
        setBalance(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      TRANSFERRED: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-purple-100 text-purple-800',
      REOPENED: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      OPEN: 'Aberto',
      CLOSED: 'Fechado',
      TRANSFERRED: 'Transferido',
      RECEIVED: 'Recebido',
      REOPENED: 'Reaberto',
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Caixa</h1>
          <p className="text-gray-600 mt-1">Controle de caixa e movimentações financeiras</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum caixa aberto</h2>
          <p className="text-gray-600 mb-6">Abra um caixa para começar a registrar movimentações</p>
          <button
            onClick={() => navigate('/cash/open')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Abrir Caixa
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Informação</h3>
              <p className="text-sm text-blue-700 mt-1">
                Você pode ter apenas um caixa aberto por vez. O valor de abertura deve estar entre R$ 50,00 e R$ 500,00.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caixa Aberto</h1>
          <p className="text-gray-600 mt-1">
            {activeSession.cashRegister.name} - Aberto em {formatDateTime(activeSession.openedAt)}
          </p>
        </div>
        
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(activeSession.status)}`}>
          {getStatusText(activeSession.status)}
        </span>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Saldo Atual</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(balance.currentBalance)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Vendas em Dinheiro</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(balance.cashSales)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Vendas em Cartão</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(balance.cardSales)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Vendas PIX</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {formatCurrency(balance.pixSales)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate(`/cash/sessions/${activeSession.id}/withdrawal`)}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sangria</h3>
              <p className="text-sm text-gray-600">Retirar dinheiro do caixa</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/cash/sessions/${activeSession.id}/supply`)}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Suprimento</h3>
              <p className="text-sm text-gray-600">Adicionar dinheiro ao caixa</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/cash/pending-commands')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left border-2 border-yellow-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Comandas Pendentes</h3>
              <p className="text-sm text-gray-600">Receber pagamentos de comandas</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/cash/pending-counter-orders')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left border-2 border-blue-200"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pedidos Balcão</h3>
              <p className="text-sm text-gray-600">Receber pagamentos de pedidos</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/cash/sessions/${activeSession.id}/close`)}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fechar Caixa</h3>
              <p className="text-sm text-gray-600">Encerrar e conferir valores</p>
            </div>
          </div>
        </button>
      </div>

      {/* Transactions Link */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Movimentações</h3>
            <p className="text-sm text-gray-600 mt-1">Ver todas as transações do caixa</p>
          </div>
          <button
            onClick={() => navigate(`/cash/sessions/${activeSession.id}/transactions`)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
