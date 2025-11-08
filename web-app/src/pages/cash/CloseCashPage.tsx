import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

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

interface CashCount {
  denomination: number;
  quantity: number;
  total: number;
}

const DENOMINATIONS = [
  { value: 200, label: 'R$ 200,00' },
  { value: 100, label: 'R$ 100,00' },
  { value: 50, label: 'R$ 50,00' },
  { value: 20, label: 'R$ 20,00' },
  { value: 10, label: 'R$ 10,00' },
  { value: 5, label: 'R$ 5,00' },
  { value: 2, label: 'R$ 2,00' },
  { value: 1, label: 'R$ 1,00' },
  { value: 0.50, label: 'R$ 0,50' },
  { value: 0.25, label: 'R$ 0,25' },
  { value: 0.10, label: 'R$ 0,10' },
  { value: 0.05, label: 'R$ 0,05' },
];

export function CloseCashPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'preview' | 'count' | 'confirm'>('preview');

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

  const handleCountChange = (denomination: number, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setCounts(prev => ({
      ...prev,
      [denomination]: qty,
    }));
  };

  const calculateCountedTotal = () => {
    return Object.entries(counts).reduce((total, [denomination, quantity]) => {
      return total + (parseFloat(denomination) * quantity);
    }, 0);
  };

  const calculateDifference = () => {
    if (!balance) return 0;
    return calculateCountedTotal() - balance.expectedCash;
  };

  const getDifferencePercent = () => {
    if (!balance || balance.expectedCash === 0) return 0;
    return Math.abs((calculateDifference() / balance.expectedCash) * 100);
  };

  const handleSubmit = async () => {
    setError('');

    const countedAmount = calculateCountedTotal();
    const difference = calculateDifference();
    const differencePercent = getDifferencePercent();

    // Validar justificativa se quebra > 1%
    if (differencePercent > 1 && !notes.trim()) {
      setError('Justificativa obrigatória para quebra de caixa acima de 1%');
      return;
    }

    try {
      setIsLoading(true);

      const countsArray: CashCount[] = Object.entries(counts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([denomination, quantity]) => ({
          denomination: parseFloat(denomination),
          quantity,
          total: parseFloat(denomination) * quantity,
        }));

      const response = await api.post(`/cash/sessions/${id}/close`, {
        countedAmount,
        counts: countsArray,
        notes: notes.trim() || undefined,
      });

      if (response.data.success) {
        navigate('/cash', {
          state: { message: 'Caixa fechado com sucesso!' },
        });
      }
    } catch (err: any) {
      console.error('Erro ao fechar caixa:', err);
      setError(err.response?.data?.error?.message || 'Erro ao fechar caixa');
    } finally {
      setIsLoading(false);
    }
  };

  if (!balance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
        <h1 className="text-2xl font-bold text-gray-900">Fechar Caixa</h1>
        <p className="text-gray-600 mt-1">Confira os valores e feche o caixa</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step === 'preview' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Resumo</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step !== 'preview' ? 'bg-orange-600' : 'bg-gray-200'}`} />
          </div>
          <div className={`flex items-center ${step === 'count' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'count' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Contagem</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step === 'confirm' ? 'bg-orange-600' : 'bg-gray-200'}`} />
          </div>
          <div className={`flex items-center ${step === 'confirm' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Step 1: Preview */}
      {step === 'preview' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Caixa</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Valor de Abertura</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(balance.openingAmount)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(balance.salesTotal)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Vendas em Dinheiro</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(balance.cashSales)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Vendas em Cartão</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(balance.cardSales)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Vendas PIX</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(balance.pixSales)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Sangrias</p>
                <p className="text-xl font-bold text-red-600">- {formatCurrency(balance.withdrawals)}</p>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600">Suprimentos</p>
                <p className="text-xl font-bold text-blue-600">+ {formatCurrency(balance.supplies)}</p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium">Dinheiro Esperado</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(balance.expectedCash)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/cash')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => setStep('count')}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Iniciar Contagem
            </button>
          </div>
        </>
      )}

      {/* Step 2: Count */}
      {step === 'count' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contagem de Dinheiro</h2>
            
            <div className="space-y-3">
              {DENOMINATIONS.map((denom) => (
                <div key={denom.value} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">{denom.label}</div>
                  <input
                    type="number"
                    min="0"
                    value={counts[denom.value] || ''}
                    onChange={(e) => handleCountChange(denom.value, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <div className="flex-1 text-right text-sm font-medium text-gray-900">
                    {formatCurrency((counts[denom.value] || 0) * denom.value)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Contado:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(calculateCountedTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('preview')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep('confirm')}
              disabled={calculateCountedTotal() === 0}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmação de Fechamento</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Esperado</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(balance.expectedCash)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Contado</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(calculateCountedTotal())}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                Math.abs(calculateDifference()) < 0.01 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Diferença:</span>
                  <span className={`text-xl font-bold ${
                    Math.abs(calculateDifference()) < 0.01 
                      ? 'text-green-600' 
                      : calculateDifference() > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                  }`}>
                    {calculateDifference() > 0 ? '+' : ''}{formatCurrency(calculateDifference())}
                  </span>
                </div>
                {Math.abs(calculateDifference()) >= 0.01 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getDifferencePercent().toFixed(2)}% de diferença
                  </p>
                )}
              </div>

              {getDifferencePercent() > 1 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-900 mb-2">
                    ⚠️ Justificativa Obrigatória
                  </p>
                  <p className="text-xs text-red-700 mb-3">
                    A diferença é superior a 1%. Por favor, justifique a quebra de caixa.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Descreva o motivo da diferença..."
                    required
                  />
                </div>
              )}

              {getDifferencePercent() <= 1 && getDifferencePercent() > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Adicione observações sobre o fechamento..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Atenção</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Após confirmar o fechamento, o caixa não poderá mais receber vendas. 
                  Verifique se todos os valores estão corretos antes de prosseguir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('count')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (getDifferencePercent() > 1 && !notes.trim())}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Fechando...' : 'Confirmar Fechamento'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
