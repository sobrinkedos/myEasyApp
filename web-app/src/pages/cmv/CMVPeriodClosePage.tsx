import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import api from '@/services/api';

export function CMVPeriodClosePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [appraisalId, setAppraisalId] = useState('');

  useEffect(() => {
    loadPeriod();
  }, [id]);

  const loadPeriod = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cmv/periods/${id}`);
      setPeriod(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao carregar período:', error);
      navigate('/cmv/periods');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    if (!appraisalId) {
      alert('Selecione uma conferência de estoque final');
      return;
    }

    if (!confirm('Deseja fechar este período? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setClosing(true);
      await api.post(`/cmv/periods/${id}/close`, { closingAppraisalId: appraisalId });
      alert('Período fechado com sucesso!');
      navigate(`/cmv/periods/${id}`);
    } catch (error: any) {
      console.error('Erro ao fechar período:', error);
      alert(error.response?.data?.message || 'Erro ao fechar período');
    } finally {
      setClosing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!period) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/cmv/periods/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fechar Período</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-900">Atenção</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Para fechar o período, é necessário realizar uma conferência de estoque final.
            O CMV será calculado automaticamente após o fechamento.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Resumo do Período</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estoque Inicial</p>
            <p className="text-lg font-semibold">{formatCurrency(period.openingStock)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Compras</p>
            <p className="text-lg font-semibold text-blue-600">{formatCurrency(period.purchases)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Receita</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(period.revenue)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Conferência de Estoque Final</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Conferência *
          </label>
          <select
            value={appraisalId}
            onChange={(e) => setAppraisalId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Selecione uma conferência aprovada...</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Apenas conferências aprovadas podem ser usadas
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 Dica: Realize uma conferência de estoque antes de fechar o período para garantir
            que o CMV seja calculado com precisão.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/cmv/periods/${id}`)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleClose}
          disabled={closing || !appraisalId}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {closing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Fechando...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Confirmar Fechamento
            </>
          )}
        </button>
      </div>
    </div>
  );
}
