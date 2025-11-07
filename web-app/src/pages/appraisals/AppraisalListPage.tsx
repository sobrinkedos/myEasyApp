import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/services/api';

interface StockAppraisal {
  id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'approved';
  totalTheoretical: number;
  totalPhysical: number;
  totalDifference: number;
  accuracy: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  completedAt?: string;
  itemCount?: number;
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
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
};

const STATUS_ICONS = {
  pending: Clock,
  completed: AlertCircle,
  approved: CheckCircle,
};

export function AppraisalListPage() {
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<StockAppraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAppraisals();
  }, [typeFilter, statusFilter]);

  const loadAppraisals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/appraisals?${params}`);
      const data = response.data.data || response.data;
      
      const appraisalsWithNumbers = Array.isArray(data) ? data.map((a: any) => ({
        ...a,
        totalTheoretical: Number(a.totalTheoretical || 0),
        totalPhysical: Number(a.totalPhysical || 0),
        totalDifference: Number(a.totalDifference || 0),
        accuracy: Number(a.accuracy || 0),
      })) : [];
      
      setAppraisals(appraisalsWithNumbers);
    } catch (error) {
      console.error('Erro ao carregar conferências:', error);
      setAppraisals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conferência?')) return;

    try {
      await api.delete(`/appraisals/${id}`);
      loadAppraisals();
    } catch (error) {
      console.error('Erro ao excluir conferência:', error);
      alert('Erro ao excluir conferência');
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600 bg-green-50';
    if (accuracy >= 90) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 95) return '🟢';
    if (accuracy >= 90) return '🟡';
    return '🔴';
  };

  const filteredAppraisals = appraisals.filter((appraisal) => {
    const matchesSearch = 
      appraisal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(appraisal.date).includes(searchTerm);
    return matchesSearch;
  });

  const getStats = () => {
    const totalAppraisals = appraisals.length;
    const pendingCount = appraisals.filter(a => a.status === 'pending').length;
    const avgAccuracy = appraisals.length > 0
      ? appraisals.reduce((sum, a) => sum + a.accuracy, 0) / appraisals.length
      : 0;
    const totalDivergence = appraisals.reduce((sum, a) => sum + Math.abs(a.totalDifference), 0);

    return { totalAppraisals, pendingCount, avgAccuracy, totalDivergence };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conferências de Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie inventários físicos e divergências</p>
        </div>
        
        <button
          onClick={() => navigate('/appraisals/new')}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Conferência
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Conferências</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppraisals}</p>
            <p className="text-xs text-gray-500 mt-1">inventários realizados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">aguardando contagem</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Acurácia Média</p>
            <p className={`text-2xl font-bold mt-1 ${getAccuracyColor(stats.avgAccuracy).split(' ')[0]}`}>
              {stats.avgAccuracy.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">precisão do estoque</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Divergências Totais</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(stats.totalDivergence)}
            </p>
            <p className="text-xs text-gray-500 mt-1">valor das diferenças</p>
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
              placeholder="Buscar por data ou observações..."
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
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="completed">Completa</option>
            <option value="approved">Aprovada</option>
          </select>
        </div>
      </div>

      {/* Appraisals List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredAppraisals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma conferência encontrada</p>
          <button
            onClick={() => navigate('/appraisals/new')}
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Criar primeira conferência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppraisals.map((appraisal) => {
            const StatusIcon = STATUS_ICONS[appraisal.status];
            
            return (
              <div key={appraisal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {TYPE_LABELS[appraisal.type]}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(appraisal.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[appraisal.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {STATUS_LABELS[appraisal.status]}
                    </span>
                  </div>

                  {/* Accuracy Indicator */}
                  {appraisal.status !== 'pending' && (
                    <div className={`p-3 rounded-lg mb-3 ${getAccuracyColor(appraisal.accuracy)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Acurácia</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getAccuracyIcon(appraisal.accuracy)}</span>
                          <span className="text-xl font-bold">{appraisal.accuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    {appraisal.status !== 'pending' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estoque Teórico:</span>
                          <span className="font-semibold">{formatCurrency(appraisal.totalTheoretical)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estoque Físico:</span>
                          <span className="font-semibold">{formatCurrency(appraisal.totalPhysical)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Divergência:</span>
                          <span className={`font-bold ${appraisal.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {appraisal.totalDifference >= 0 ? '+' : ''}{formatCurrency(appraisal.totalDifference)}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {appraisal.itemCount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Itens:</span>
                        <span className="font-semibold">{appraisal.itemCount} ingredientes</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {appraisal.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {appraisal.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/appraisals/${appraisal.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    
                    {appraisal.status === 'pending' && (
                      <button
                        onClick={() => navigate(`/appraisals/${appraisal.id}/count`)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Contar
                      </button>
                    )}
                    
                    {appraisal.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(appraisal.id)}
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
