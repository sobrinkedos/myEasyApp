import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

interface SessionBalance {
  openingAmount: number;
  cashSales: number;
  expectedCash: number;
  currentBalance: number;
}

export function WithdrawalPage() {
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

    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Informe um valor válido');
      return;
    }

    if (!reason.trim()) {
      setError('Informe o motivo da sangria');
      return;
    }

    if (balance && withdrawalAmount > balance.expectedCash - balance.openingAmount) {
      setError('Sangria não pode deixar saldo abaixo do valor de abertura');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(`/cash/sessions/${id}/withdrawals`, {
        amount: withdrawalAmount,
        reason: reason.trim(),
      });

      if (response.data.success) {
        navigate('/cash', {
          state: { message: 'Sangria registrada com sucesso!' },
        });
      }
    } catch (err: any) {
      console.error('Erro ao registrar sangria:', err);
      setError(err.response?.data?.error?.message || 'Erro ao registrar sangria');
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
        <h1 className="text-2xl font-bold text-gray-900">Sangria de Caixa</h1>
        <p className="text-gray-600 mt-1">Retirar dinheiro do caixa</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Balance Info */}
      {balance && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Saldo Atual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-700">Dinheiro em Caixa</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(balance.expectedCash)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Valor de Abertura</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(balance.openingAmount)}</p>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Disponível para sangria: {formatCurrency(balance.expectedCash - balance.openingAmount)}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Sangria
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
              Valores acima de R$ 200,00 podem requerer autorização
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Sangria
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Excesso de dinheiro no caixa, segurança..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Mínimo de 5 caracteres
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Atenção</h3>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• A sangria reduzirá o saldo disponível no caixa</li>
                  <li>• O valor não pode deixar o saldo abaixo do fundo de troco</li>
                  <li>• Esta operação será registrada no histórico</li>
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
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registrar Sangria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
