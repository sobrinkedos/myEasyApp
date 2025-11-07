import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  completedAt?: string;
  items: AppraisalItem[];
}

const TYPE_LABELS = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

const STATUS_LABELS = {
  pending: 'Pendente',
  completed: 'Completa',
  approved: 'Aprovada',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
};

const STATUS_ICONS = {
  pending: Clock,
  completed: AlertCircle,
  approved: CheckCircle,
};

export function AppraisalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);
  const [loading, setLoading] = useState(true);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 90) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getDivergenceColor = (percentage: number) => {
    const abs = Math.abs(percentage);
    if (abs <= 5) return 'text-green-600';
    if (abs <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!appraisal) return null;

  const StatusIcon = STATUS_ICONS[appraisal.status];
  const criticalItems = appraisal.items.filter(i => Math.abs(i.differencePercentage) > 10);

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
            <h1 className="text-2xl font-bold text-gray-900">Detalhes da Conferência</h1>
            <p className="text-gray-600 mt-1">
              {TYPE_LABELS[appraisal.type as keyof typeof TYPE_LABELS]} - {new Date(appraisal.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {appraisal.status === 'pending' && (
            <button
              onClick={() => navigate(`/appraisals/${id}/count`)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Edit className="h-5 w-5 mr-2" />
              Continuar Contagem
            </button>
          )}
          <button
            onClick={() => alert('Exportação em desenvolvimento')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`border-2 rounded-lg p-6 ${STATUS_COLORS[appraisal.status as keyof typeof STATUS_COLORS]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-semibold">
                {STATUS_LABELS[appraisal.status as keyof typeof STATUS_LABELS]}
              </h2>
              <p className="text-sm opacity-80">
                Criada em {formatDate(appraisal.createdAt)}
              </p>
            </div>
          </div>
          {appraisal.status !== 'pending' && (
            <div className={`text-right border-2 rounded-lg p-4 ${getAccuracyColor(appraisal.accuracy)}`}>
              <p className="text-sm font-medium mb-1">Acurácia</p>
              <p className="text-3xl font-bold">{appraisal.accuracy.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {appraisal.status !== 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Estoque Teórico</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(appraisal.totalTheoretical)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Estoque Físico</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(appraisal.totalPhysical)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Divergência</p>
            <p className={`text-2xl font-bold ${appraisal.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {appraisal.totalDifference >= 0 ? '+' : ''}{formatCurrency(appraisal.totalDifference)}
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      {appraisal.notes && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
          <p className="text-gray-700">{appraisal.notes}</p>
        </div>
      )}

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-1">
            ⚠️ {criticalItems.length} Divergências Críticas
          </h3>
          <p className="text-sm text-red-700">
            Itens com divergência superior a 10%
          </p>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Itens da Conferência ({appraisal.items.length})
          </h3>
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
              {appraisal.items.map((item) => (
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
                    <span className={`font-bold ${getDivergenceColor(item.differencePercentage)}`}>
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

      {/* Approval Info */}
      {appraisal.status === 'approved' && appraisal.approvedAt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-1">✓ Conferência Aprovada</h3>
          <p className="text-sm text-green-700">
            Aprovada em {formatDate(appraisal.approvedAt)}
            {appraisal.approvedBy && ` por ${appraisal.approvedBy}`}
          </p>
        </div>
      )}
    </div>
  );
}
