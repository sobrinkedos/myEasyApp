import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import api from '@/services/api';

interface CMVPeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: 'open' | 'closed';
  cmv: number;
  revenue: number;
  cmvPercentage: number;
  openingStock: number;
  purchases: number;
  closingStock: number;
}

export function CMVDashboardPage() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<CMVPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cmv/periods?limit=5');
      const data = response.data.data || response.data;
      
      // Converter valores Decimal para number
      const periodsWithNumbers = (Array.isArray(data) ? data : []).map((period: any) => ({
        ...period,
        cmv: Number(period.cmv || 0),
        revenue: Number(period.revenue || 0),
        cmvPercentage: Number(period.cmvPercentage || 0),
        openingStock: Number(period.openingStock || 0),
        purchases: Number(period.purchases || 0),
        closingStock: Number(period.closingStock || 0),
      }));
      
      setPeriods(periodsWithNumbers);
    } catch (error) {
      console.error('Erro ao carregar períodos:', error);
      setPeriods([]);
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
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getStats = () => {
    const closedPeriods = periods.filter(p => p.status === 'closed');
    const avgCMV = closedPeriods.length > 0
      ? closedPeriods.reduce((sum, p) => sum + p.cmvPercentage, 0) / closedPeriods.length
      : 0;
    
    const totalRevenue = closedPeriods.reduce((sum, p) => sum + p.revenue, 0);
    const totalCMV = closedPeriods.reduce((sum, p) => sum + p.cmv, 0);
    const grossMargin = totalRevenue - totalCMV;
    const openPeriod = periods.find(p => p.status === 'open');

    return { avgCMV, totalRevenue, totalCMV, grossMargin, openPeriod };
  };

  const stats = getStats();
  const alerts = periods.filter(p => p.status === 'closed' && p.cmvPercentage > 40);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard CMV</h1>
          <p className="text-gray-600 mt-1">Custo de Mercadoria Vendida e análise de períodos</p>
        </div>
        
        <button
          onClick={() => navigate('/cmv/periods/new')}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Período
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">CMV Médio</p>
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <p className={`text-3xl font-bold ${stats.avgCMV > 40 ? 'text-red-600' : stats.avgCMV > 35 ? 'text-yellow-600' : 'text-green-600'}`}>
            {stats.avgCMV.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">sobre receita</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Receita Total</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">períodos fechados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">CMV Total</p>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalCMV)}</p>
          <p className="text-xs text-gray-500 mt-1">custo total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Margem Bruta</p>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.grossMargin)}</p>
          <p className="text-xs text-gray-500 mt-1">lucro bruto</p>
        </div>
      </div>

      {/* Open Period Alert */}
      {stats.openPeriod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Período Aberto</h3>
            <p className="text-sm text-blue-800 mt-1">
              Período de {formatDate(stats.openPeriod.startDate)} a {formatDate(stats.openPeriod.endDate)} está em andamento.
            </p>
          </div>
          <button
            onClick={() => navigate(`/cmv/periods/${stats.openPeriod.id}`)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      )}

      {/* High CMV Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Alertas de CMV Alto</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            {alerts.length} período(s) com CMV superior a 40%
          </p>
          <div className="space-y-2">
            {alerts.map(period => (
              <div key={period.id} className="flex items-center justify-between bg-white rounded p-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </p>
                  <p className="text-xs text-gray-600">CMV: {Number(period.cmvPercentage).toFixed(1)}%</p>
                </div>
                <button
                  onClick={() => navigate(`/cmv/periods/${period.id}`)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Analisar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Periods */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Períodos Recentes</h3>
          <button
            onClick={() => navigate('/cmv/periods')}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Ver Todos
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : periods.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">Nenhum período cadastrado</p>
            <button
              onClick={() => navigate('/cmv/periods/new')}
              className="text-orange-600 hover:text-orange-700"
            >
              Criar primeiro período
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receita</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CMV</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CMV %</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margem</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {periods.map((period) => {
                  const margin = period.revenue - period.cmv;
                  const marginPercentage = period.revenue > 0 ? (margin / period.revenue) * 100 : 0;

                  return (
                    <tr key={period.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>
                        <p className="text-xs text-gray-500">{period.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          period.status === 'open' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {period.status === 'open' ? 'Aberto' : 'Fechado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(period.revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">
                        {formatCurrency(period.cmv)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-bold ${
                          period.cmvPercentage > 40 ? 'text-red-600' :
                          period.cmvPercentage > 35 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {Number(period.cmvPercentage).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-medium text-blue-600">{formatCurrency(margin)}</p>
                        <p className="text-xs text-gray-500">{marginPercentage.toFixed(1)}%</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/cmv/periods/${period.id}`)}
                          className="text-sm text-orange-600 hover:text-orange-700"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/cmv/periods')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Gerenciar Períodos</h3>
          <p className="text-sm text-gray-600">Ver todos os períodos de CMV</p>
        </button>

        <button
          onClick={() => navigate('/cmv/reports')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Relatórios</h3>
          <p className="text-sm text-gray-600">Análises e comparações</p>
        </button>

        <button
          onClick={() => navigate('/appraisals')}
          className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Conferências</h3>
          <p className="text-sm text-gray-600">Inventários de estoque</p>
        </button>
      </div>
    </div>
  );
}
