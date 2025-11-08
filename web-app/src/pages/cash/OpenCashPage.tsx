import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface CashRegister {
  id: string;
  number: number;
  name: string;
  isActive: boolean;
}

export function OpenCashPage() {
  const navigate = useNavigate();
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [selectedRegister, setSelectedRegister] = useState('');
  const [openingAmount, setOpeningAmount] = useState('100.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCashRegisters();
  }, []);

  const loadCashRegisters = async () => {
    try {
      const response = await api.get('/cash/registers');
      if (response.data.success) {
        setCashRegisters(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      setError('Erro ao carregar caixas disponíveis');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(openingAmount);

    if (!selectedRegister) {
      setError('Selecione um caixa');
      return;
    }

    if (isNaN(amount) || amount < 50 || amount > 500) {
      setError('O valor de abertura deve estar entre R$ 50,00 e R$ 500,00');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/cash/sessions', {
        cashRegisterId: selectedRegister,
        openingAmount: amount,
      });

      if (response.data.success) {
        navigate('/cash', {
          state: { message: 'Caixa aberto com sucesso!' },
        });
      }
    } catch (err: any) {
      console.error('Erro ao abrir caixa:', err);
      setError(err.response?.data?.error?.message || 'Erro ao abrir caixa');
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
        <h1 className="text-2xl font-bold text-gray-900">Abrir Caixa</h1>
        <p className="text-gray-600 mt-1">Informe o valor inicial do fundo de troco</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Caixa
            </label>
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Selecione...</option>
              {cashRegisters.map((register) => (
                <option key={register.id} value={register.id}>
                  {register.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Abertura (Fundo de Troco)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="50"
                max="500"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Valor mínimo: R$ 50,00 | Valor máximo: R$ 500,00
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Importante</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Você pode ter apenas um caixa aberto por vez</li>
                  <li>• O valor de abertura será usado como fundo de troco</li>
                  <li>• Todas as movimentações serão registradas e auditadas</li>
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
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Abrindo...' : 'Abrir Caixa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
