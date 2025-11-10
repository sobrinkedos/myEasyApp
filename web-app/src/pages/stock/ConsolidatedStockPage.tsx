import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { Search, Package, AlertTriangle, Calendar } from 'lucide-react';

interface ConsolidatedStockItem {
  id: string;
  type: 'ingredient' | 'stock_item';
  name: string;
  description?: string;
  currentQuantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  status: string;
  category?: string;
  barcode?: string;
  sku?: string;
  location?: string;
  minimumQuantity: number;
  maximumQuantity?: number;
}

interface ConsolidatedStockSummary {
  totalItems: number;
  totalIngredients: number;
  totalStockItems: number;
  totalValue: number;
  ingredientsValue: number;
  stockItemsValue: number;
  lowStockCount: number;
  expiringCount: number;
}

interface ConsolidatedStockData {
  ingredients: ConsolidatedStockItem[];
  stockItems: ConsolidatedStockItem[];
  summary: ConsolidatedStockSummary;
}

export function ConsolidatedStockPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ConsolidatedStockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ingredient' | 'stock_item'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filter, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filter !== 'all') {
        params.type = filter;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await api.get('/stock/consolidated', { params });
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      showToast('Erro ao carregar estoque consolidado', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/stock/consolidated', {
        params: { search: searchTerm, type: filter !== 'all' ? filter : undefined }
      });
      setData(response.data);
    } catch (error) {
      console.error('Erro ao buscar:', error);
      showToast('Erro ao buscar itens', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'baixo':
        return 'text-red-600 bg-red-50';
      case 'vencendo':
        return 'text-orange-600 bg-orange-50';
      case 'normal':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'baixo':
        return 'Estoque Baixo';
      case 'vencendo':
        return 'Vencendo';
      case 'normal':
        return 'Normal';
      default:
        return status;
    }
  }

  const filteredIngredients = data?.ingredients.filter(item =>
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode?.includes(searchTerm) ||
    item.sku?.includes(searchTerm)
  ) || [];

  const filteredStockItems = data?.stockItems.filter(item =>
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode?.includes(searchTerm) ||
    item.sku?.includes(searchTerm)
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estoque Consolidado
        </h1>
        <p className="text-gray-600">
          Visão unificada de insumos e itens de revenda
        </p>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.summary.totalItems}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {data.summary.totalValue.toFixed(2)}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-red-600">
                  {data.summary.lowStockCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencendo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.expiringCount}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="ingredient">Insumos</option>
              <option value="stock_item">Revenda</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="normal">Normal</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="vencendo">Vencendo</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nome, código de barras ou SKU..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Insumos (Produção)
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">
                Quantidade: {data.summary.totalIngredients} itens
              </p>
              <p className="text-sm text-blue-700">
                Valor: R$ {data.summary.ingredientsValue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Revenda
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-green-700">
                Quantidade: {data.summary.totalStockItems} itens
              </p>
              <p className="text-sm text-green-700">
                Valor: R$ {data.summary.stockItemsValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tables */}
      {(filter === 'all' || filter === 'ingredient') && filteredIngredients.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Insumos ({filteredIngredients.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.currentQuantity.toFixed(3)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {item.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.location || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(filter === 'all' || filter === 'stock_item') && filteredStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Itens de Revenda ({filteredStockItems.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.currentQuantity.toFixed(3)} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {item.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data && filteredIngredients.length === 0 && filteredStockItems.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}
    </div>
  );
}
