import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/services/api';
import { Download, FileText, AlertCircle, CheckCircle, AlertTriangle, Filter, X } from 'lucide-react';

interface ClosureSummary {
  id: string;
  sessionId?: string;
  documentNumber: string;
  date: string;
  operator: string;
  cashRegister: string;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  differencePercent: number;
  status: 'normal' | 'warning' | 'alert';
  hasDocument?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Statistics {
  totalClosures: number;
  normalCount: number;
  warningCount: number;
  alertCount: number;
  totalDifference: number;
}

interface Filters {
  startDate: string;
  endDate: string;
  operatorId: string;
  cashRegisterId: string;
  status: string;
}

export function ClosureHistoryPage() {
  const navigate = useNavigate();
  const [closures, setClosures] = useState<ClosureSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    operatorId: '',
    cashRegisterId: '',
    status: '',
  });
  const [sortBy, setSortBy] = useState<'date' | 'difference'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadClosures();
  }, [pagination.page, sortBy, sortOrder]);

  const loadClosures = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.operatorId) params.operatorId = filters.operatorId;
      if (filters.cashRegisterId) params.cashRegisterId = filters.cashRegisterId;
      if (filters.status) params.status = filters.status;

      const response = await api.get('/cash/closures', { params });

      if (response.data.success) {
        let data = response.data.data;

        // Apply sorting
        data = sortClosures(data);

        setClosures(data);
        setPagination(response.data.pagination);
        setStatistics(response.data.statistics);
      }
    } catch (error: any) {
      console.error('Erro ao carregar fechamentos:', error);
      setError('Erro ao carregar histórico de fechamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const sortClosures = (data: ClosureSummary[]) => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'difference') {
        comparison = Math.abs(a.difference) - Math.abs(b.difference);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    loadClosures();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      operatorId: '',
      cashRegisterId: '',
      status: '',
    });
    setPagination({ ...pagination, page: 1 });
    loadClosures();
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const params: any = {
        format,
        startDate: filters.startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        endDate: filters.endDate || format(new Date(), 'yyyy-MM-dd'),
      };

      const response = await api.get('/cash/closures/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fechamentos-${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar fechamentos');
    }
  };

  const handleGenerateDocument = async (sessionId: string) => {
    try {
      const response = await api.post(`/cash/sessions/${sessionId}/generate-document`);
      
      if (response.data.success) {
        alert('Documento gerado com sucesso!');
        loadClosures(); // Reload the list
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento');
    }
  };

  const handleDownloadDocument = async (closureId: string, documentNumber: string) => {
    try {
      const response = await api.get(`/cash/documents/${closureId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fechamento-${documentNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento');
    }
  };

  const getStatusBadge = (status: string, differencePercent: number) => {
    if (status === 'alert') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Alerta
        </span>
      );
    } else if (status === 'warning') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Atenção
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Normal
        </span>
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading && closures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando fechamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Fechamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consulte e exporte fechamentos de caixa realizados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Total de Fechamentos</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{statistics.totalClosures}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Normais</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{statistics.normalCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Atenção</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-600">{statistics.warningCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Alertas</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">{statistics.alertCount}</div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="normal">Normal</option>
                <option value="warning">Atenção</option>
                <option value="alert">Alerta</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Closures Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('date');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Data/Hora {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operador
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caixa
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Esperado
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contado
              </th>
              <th
                className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('difference');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Diferença {sortBy === 'difference' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {closures.map((closure) => (
              <tr key={closure.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {closure.documentNumber}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(closure.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {closure.operator}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {closure.cashRegister}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(closure.expectedAmount)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(closure.countedAmount)}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium text-right ${
                  closure.difference >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(closure.difference)} ({closure.differencePercent.toFixed(2)}%)
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                  {getStatusBadge(closure.status, closure.differencePercent)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/cash/closures/${closure.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Ver detalhes"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  {closure.documentNumber && !closure.documentNumber.startsWith('Sessão') ? (
                    <button
                      onClick={() => handleDownloadDocument(closure.id, closure.documentNumber)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Baixar documento"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateDocument(closure.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                      title="Gerar documento"
                    >
                      Gerar Documento
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {closures.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum fechamento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há fechamentos de caixa no período selecionado.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> até{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  Anterior
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === pagination.page
                        ? 'z-10 bg-blue-600 text-white focus:z-20'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  Próxima
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
