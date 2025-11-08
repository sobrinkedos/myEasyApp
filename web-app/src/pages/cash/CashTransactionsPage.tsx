import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

interface CashTransaction {
  id: string;
  type: 'SALE' | 'WITHDRAWAL' | 'SUPPLY' | 'OPENING' | 'CLOSING' | 'ADJUSTMENT';
  paymentMethod?: 'CASH' | 'DEBIT' | 'CREDIT' | 'PIX' | 'VOUCHER' | 'OTHER';
  amount: number;
  description?: string;
  saleId?: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  metadata?: any;
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

export function CashTransactionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [transactionsRes, balanceRes] = await Promise.all([
        api.get(`/cash/sessions/${id}/transactions`),
        api.get(`/cash/sessions/${id}/balance`),
      ]);

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data);
      }

      if (balanceRes.data.success) {
        setBalance(balanceRes.data.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
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

  const getTypeInfo = (type: string) => {
    const types = {
      SALE: { label: 'Venda', color: 'text-green-600', bgColor: 'bg-green-100', icon: '💰' },
      WITHDRAWAL: { label: 'Sangria', color: 'text-red-600', bgColor: 'bg-red-100', icon: '📤' },
      SUPPLY: { label: 'Suprimento', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📥' },
      OPENING: { label: 'Abertura', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '🔓' },
      CLOSING: { label: 'Fechamento', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🔒' },
      ADJUSTMENT: { label: 'Ajuste', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚙️' },
    };
    return types[type as keyof typeof types] || { label: type, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📝' };
  };

  const getPaymentMethodInfo = (method?: string) => {
    if (!method) return null;
    
    const methods = {
      CASH: { label: 'Dinheiro', icon: '💵' },
      DEBIT: { label: 'Débito', icon: '💳' },
      CREDIT: { label: 'Crédito', icon: '💳' },
      PIX: { label: 'PIX', icon: '📱' },
      VOUCHER: { label: 'Vale', icon: '🎟️' },
      OTHER: { label: 'Outro', icon: '💼' },
    };
    return methods[method as keyof typeof methods] || { label: method, icon: '💼' };
  };

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const getAmountColor = (type: string) => {
    if (type === 'WITHDRAWAL') return 'text-red-600';
    if (type === 'SALE' || type === 'SUPPLY' || type === 'OPENING') return 'text-green-600';
    return 'text-gray-900';
  };

  const formatAmount = (amount: number, type: string) => {
    const value = Math.abs(amount);
    const formatted = formatCurrency(value);
    
    if (type === 'WITHDRAWAL') {
      return `- ${formatted}`;
    }
    if (type === 'SALE' || type === 'SUPPLY' || type === 'OPENING') {
      return `+ ${formatted}`;
    }
    return formatted;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/cash')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Movimentações do Caixa</h1>
        <p className="text-gray-600 mt-1">Histórico completo de transações</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Balance Summary */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Saldo Atual</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(balance.currentBalance)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Vendas</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(balance.salesTotal)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Sangrias</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(balance.withdrawals)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Suprimentos</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatCurrency(balance.supplies)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('SALE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'SALE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vendas ({transactions.filter(t => t.type === 'SALE').length})
          </button>
          <button
            onClick={() => setFilterType('WITHDRAWAL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'WITHDRAWAL'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sangrias ({transactions.filter(t => t.type === 'WITHDRAWAL').length})
          </button>
          <button
            onClick={() => setFilterType('SUPPLY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'SUPPLY'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Suprimentos ({transactions.filter(t => t.type === 'SUPPLY').length})
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma movimentação</h3>
            <p className="text-gray-600">Não há transações registradas neste filtro</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const typeInfo = getTypeInfo(transaction.type);
                  const paymentInfo = getPaymentMethodInfo(transaction.paymentMethod);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(transaction.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                          <span className="mr-1">{typeInfo.icon}</span>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description || '-'}
                        {transaction.saleId && (
                          <span className="block text-xs text-gray-500 mt-1">
                            Ref: {transaction.saleId.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paymentInfo ? (
                          <span className="inline-flex items-center">
                            <span className="mr-1">{paymentInfo.icon}</span>
                            {paymentInfo.label}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.user.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${getAmountColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {balance && filteredTransactions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Dinheiro em Caixa</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(balance.expectedCash)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas em Dinheiro</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(balance.cashSales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendas em Cartão/PIX</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {formatCurrency(balance.cardSales + balance.pixSales)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
