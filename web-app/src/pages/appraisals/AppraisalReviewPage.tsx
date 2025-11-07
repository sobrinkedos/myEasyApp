import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/services/api';

interface AppraisalItem {
  ingredientId: string;
  theoreticalQuantity: number;
  physicalQuantity: number;
  difference: number;
  differencePercentage: number;
  unitCost: number;
  totalDifference: number;
  reason?: string;
  ingredient: {
    name: string;
    unit: string;
  };
}

interface Appraisal {
  id: string;
  date: string;
  type: string;
  status: string;
  totalTheoretical: number;
  totalPhysical: number;
  totalDifference: number;
  accuracy: number;
  notes?: string;
  items: AppraisalItem[];
}

export function AppraisalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadAppraisal();
  }, [id]);

  const loadAppraisal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appraisals/${id}`);
      const data = response.data.data || response.data;
      setAppraisal(data);
    } catch (error) {
      console.error('Erro ao carregar conferência:', error);
      alert('Erro ao carregar conferência');
      navigate('/appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar esta conferência? O estoque teórico será ajustado para o físico.')) {
      return;
    }

    try {
      setApproving(true);
      await api.post(`/appraisals/${id}/approve`);
      alert('Conferência aprovada com sucesso!');
      navigate('/appraisals');
    } catch (error: any) {
      console.error('Erro ao aprovar conferência:', error);
      alert(error.response?.data?.message || 'Erro ao aprovar conferência');
    } finally {
      setApproving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 90) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 95) return '🟢';
    if (accuracy >= 90) return '🟡';
    return '🔴';
  };

  const criticalItems = appraisal?.items.filter(i => Math.abs(i.differencePercentage) > 10) || [];
  const positiveItems = appraisal?.items.filter(i => i.difference > 0) || [];
  const negativeItems = appraisal?.items.filter(i => i.difference < 0) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!appraisal) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/appraisals')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revisão da Conferência</h1>
            <p className="text-gray-600 mt-1">
              {new Date(appraisal.date).toLocaleDateString('pt-BR')} - {appraisal.type}
            </p>
          </div>
        </div>

        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {approving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Aprovando...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Aprovar Conferência
            </>
          )}
        </button>
      </div>

      {/* Accuracy Card */}
      <div className={`border-2 rounded-lg p-6 ${getAccuracyColor(appraisal.accuracy)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Acurácia Total</h2>
            <p className="text-sm opacity-80">Precisão do inventário físico</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getAccuracyIcon(appraisal.accuracy)}</span>
              <span className="text-5xl font-bold">{appraisal.accuracy.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Estoque Teórico</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(appraisal.totalTheoretical)}</p>
          <p className="text-xs text-gray-500 mt-1">valor no sistema</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Estoque Físico</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(appraisal.totalPhysical)}</p>
          <p className="text-xs text-gray-500 mt-1">valor contado</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Divergência Total</p>
          <p className={`text-2xl font-bold ${appraisal.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {appraisal.totalDifference >= 0 ? '+' : ''}{formatCurrency(appraisal.totalDifference)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {appraisal.totalDifference >= 0 ? 'sobra' : 'falta'}
          </p>
        </div>
      </div>

      {/* Divergence Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Sobras</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">{positiveItems.length}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(positiveItems.reduce((sum, i) => sum + i.totalDifference, 0))} em excesso
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Faltas</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-2">{negativeItems.length}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(Math.abs(negativeItems.reduce((sum, i) => sum + i.totalDifference, 0)))} em falta
          </p>
        </div>
      </div>

      {/* Critical Items */}
      {criticalItems.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                Divergências Críticas ({criticalItems.length})
              </h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Itens com divergência superior a 10%
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingrediente</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Teórico</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Físico</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Divergência</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {criticalItems.map((item) => (
                  <tr key={item.ingredientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.ingredient.name}</p>
                        <p className="text-sm text-gray-500">{item.ingredient.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {item.theoreticalQuantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {item.physicalQuantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${item.differencePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.differencePercentage >= 0 ? '+' : ''}{item.differencePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${item.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.totalDifference >= 0 ? '+' : ''}{formatCurrency(item.totalDifference)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{item.reason || '-'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-900">Atenção</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Ao aprovar esta conferência, o estoque teórico será ajustado para refletir as quantidades físicas contadas.
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/appraisals/${id}/count`)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar para Contagem
        </button>
        <button
          onClick={handleApprove}
          disabled={approving}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {approving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Aprovando...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Aprovar e Ajustar Estoque
            </>
          )}
        </button>
      </div>
    </div>
  );
}
