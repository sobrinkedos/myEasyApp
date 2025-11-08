import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, Lock, Unlock } from 'lucide-react';
import api from '@/services/api';

interface CMVPeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'open' | 'closed';
  cmv: number;
  revenue: number;
  cmvPercentage: number;
  openingStock: number;
  purchases: number;
  closingStock: number;
  createdAt: string;
  closedAt?: string;
}

const TYPE_LABELS = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export function CMVPeriodListPage() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<CMVPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadPeriods();
  }, [typeFilter, statusFilter]);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/cmv/periods?${params}`);
      const data = response.data.data || response.data;
      setPeriods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar períodos:', error);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este período?')) return;

    try {
      await api.delete(`/cmv/periods/${id}`);
      loadPeriods();
    } catch (error) {
      console.error('Erro ao excluir período:', error);
      alert('Erro ao excluir período');
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

  const filteredPeriods = periods.filter((period) => {
    const matchesSearch = 
      formatDate(period.startDate).includes(searchTerm) ||
      formatDate(period.endDate).includes(searchTerm);
    return matchesSearch;
  });

  const getStats = () => {
    const totalPeriods = periods.length;
    const openCount = periods.filter(p => p.status === 'open').length;
    const avgCMV = periods.filter(p => p.status === 'closed').length > 0
      ? periods.filter(p => p.status === 'closed').reduce((sum, p) => sum + p.cmvPercentage, 0) / periods.filter(p => p.status === 'closed').length
      : 0;
    const totalRevenue = periods.reduce((sum, p) => sum + p.revenue, 0);

    return { totalPeriods, openCount, avgCMV, totalRevenue };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Períodos de CMV</h1>
          <p className="text-gray-600 mt-1">Gerencie períodos de cálculo de CMV</p>
        </div>
        
        <button
          onClick={() => navigate('/cmv/periods/new')}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Período
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Períodos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPeriods}</p>
            <p className="text-xs text-gray-500 mt-1">períodos cadastrados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Períodos Abertos</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.openCount}</p>
            <p className="text-xs text-gray-500 mt-1">em andamento</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">CMV Médio</p>
            <p className={`text-2xl font-bold mt-1 ${stats.avgCMV > 40 ? 'text-red-600' : stats.avgCMV > 35 ? 'text-yellow-600' : 'text-green-600'}`}>
              {stats.avgCMV.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">períodos fechados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Receita Total</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">todos os períodos</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="open">Aberto</option>
            <option value="closed">Fechado</option>
          </select>
        </div>
      </div>

      {/* Periods List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredPeriods.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhum período encontrado</p>
          <button
            onClick={() => navigate('/cmv/periods/new')}
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Criar primeiro período
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeriods.map((period) => {
            const margin = period.revenue - period.cmv;
            const marginPercentage = period.revenue > 0 ? (margin / period.revenue) * 100 : 0;

            return (
              <div key={period.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {TYPE_LABELS[period.type]}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      period.status === 'open' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {period.status === 'open' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {period.status === 'open' ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>

                  {/* CMV Indicator */}
                  {period.status === 'closed' && (
                    <div className={`p-3 rounded-lg mb-3 ${
                      period.cmvPercentage > 40 ? 'bg-red-50 text-red-600' :
                      period.cmvPercentage > 35 ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CMV</span>
                        <span className="text-2xl font-bold">{Number(period.cmvPercentage).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Receita:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(period.revenue)}</span>
                    </div>
                    {period.status === 'closed' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">CMV:</span>
                          <span className="font-semibold text-red-600">{formatCurrency(period.cmv)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Margem:</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(margin)} ({marginPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </>
                    )}
                    {period.status === 'open' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Compras:</span>
                        <span className="font-semibold">{formatCurrency(period.purchases)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/cmv/periods/${period.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    
                    {period.status === 'open' && (
                      <button
                        onClick={() => navigate(`/cmv/periods/${period.id}/close`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Fechar
                      </button>
                    )}
                    
                    {period.status === 'open' && (
                      <button
                        onClick={() => handleDelete(period.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
