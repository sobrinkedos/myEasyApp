import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Download } from 'lucide-react';
import api from '@/services/api';

interface CMVPeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  cmv: number;
  revenue: number;
  cmvPercentage: number;
  openingStock: number;
  purchases: number;
  closingStock: number;
  products?: any[];
}

export function CMVPeriodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<CMVPeriod | null>(null);
  const [loading, setLoading] = useState(true);

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

  const margin = period.revenue - period.cmv;
  const marginPercentage = period.revenue > 0 ? (margin / period.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cmv/periods')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes do Período</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(period.startDate)} - {formatDate(period.endDate)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {period.status === 'open' && (
            <button
              onClick={() => navigate(`/cmv/periods/${id}/close`)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Lock className="h-5 w-5 mr-2" />
              Fechar Período
            </button>
          )}
          <button
            onClick={() => alert('Exportação em desenvolvimento')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {period.status === 'closed' && (
        <div className={`border-2 rounded-lg p-6 ${
          period.cmvPercentage > 40 ? 'bg-red-50 text-red-600 border-red-200' :
          period.cmvPercentage > 35 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
          'bg-green-50 text-green-600 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">CMV do Período</h2>
              <p className="text-sm opacity-80">Custo de Mercadoria Vendida</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{period.cmvPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Estoque Inicial</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(period.openingStock)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Compras</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(period.purchases)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-2">Estoque Final</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(period.closingStock)}</p>
        </div>
      </div>

      {period.status === 'closed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Receita</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(period.revenue)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">CMV</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(period.cmv)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-2">Margem Bruta</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(margin)}</p>
            <p className="text-xs text-gray-500 mt-1">{marginPercentage.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Cálculo do CMV</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-gray-600">Estoque Inicial</span>
            <span className="font-semibold">{formatCurrency(period.openingStock)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-gray-600">+ Compras do Período</span>
            <span className="font-semibold text-blue-600">{formatCurrency(period.purchases)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-gray-600">- Estoque Final</span>
            <span className="font-semibold text-gray-600">({formatCurrency(period.closingStock)})</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-gray-900">= CMV</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(period.cmv)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
