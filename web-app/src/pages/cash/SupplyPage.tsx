import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

interface SessionBalance {
  openingAmount: number;
  cashSales: number;
  expectedCash: number;
  currentBalance: number;
}

export function SupplyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadBalance();
    }
  }, [id]);

  const loadBalance = async () => {
    try {
      const response = await api.get(`/cash/sessions/${id}/balance`);
      if (response.data.success) {
        setBalance(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      setError('Erro ao carregar saldo do caixa');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const supplyAmount = parseFloat(amount);

    if (isNaN(supplyAmount) || supplyAmount <= 0) {
      setError('Informe um valor válido');
      return;
    }

    if (!reason.trim()) {
      setError('Informe o motivo do suprimento');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(`/cash/sessions/${id}/supplies`, {
        amount: supplyAmount,
        reason: reason.trim(),
      });

      if (response.data.success) {
        navigate('/cash', {
          state: { message: 'Suprimento registrado com sucesso!' },
        });
      }
    } catch (err: any) {
      console.error('Erro ao registrar suprimento:', err);
      setError(err.response?.data?.error?.message || 'Erro ao registrar suprimento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold text-gray-900">Suprimento de Caixa</h1>
        <p className="text-gray-600 mt-1">Adicionar dinheiro ao caixa</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Balance Info */}
      {balance && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Saldo Atual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-green-700">Dinheiro em Caixa</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(balance.expectedCash)}</p>
            </div>
            <div>
              <p className="text-xs text-green-700">Saldo Total</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(balance.currentBalance)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Suprimento
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0,00"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Informe o valor que será adicionado ao caixa
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do Suprimento
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Necessidade de troco, reforço de caixa..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Mínimo de 5 caracteres
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Informação</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• O suprimento aumentará o saldo disponível no caixa</li>
                  <li>• O valor será somado ao saldo atual</li>
                  <li>• Esta operação será registrada no histórico</li>
                  <li>• Certifique-se de contar o dinheiro antes de adicionar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/cash')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registrar Suprimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
