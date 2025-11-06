import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/config/constants';

interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  costPrice: number;
  salePrice: number;
  status: string;
  barcode?: string;
  sku?: string;
  imageUrl?: string;
}

const STATUS_COLORS = {
  normal: 'bg-green-100 text-green-800',
  baixo: 'bg-yellow-100 text-yellow-800',
  zerado: 'bg-red-100 text-red-800',
  vencendo: 'bg-orange-100 text-orange-800',
  vencido: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  normal: 'Normal',
  baixo: 'Estoque Baixo',
  zerado: 'Zerado',
  vencendo: 'Vencendo',
  vencido: 'Vencido',
};

export function StockListPage() {
  const location = useLocation();
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadItems();
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/stock-management/items?${params}`);
      
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMargin = (cost: number, sale: number) => {
    if (cost === 0) return 0;
    return ((sale - cost) / cost * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600 mt-1">Gerencie seus produtos de revenda</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/stock/bulk-entry"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📦 Entrada em Massa
          </Link>
          <Link
            to="/stock/new"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            + Novo Item
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, código de barras, SKU..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="Bebidas Alcoólicas">Bebidas Alcoólicas</option>
              <option value="Bebidas Não Alcoólicas">Bebidas Não Alcoólicas</option>
              <option value="Salgadinhos">Salgadinhos</option>
              <option value="Doces">Doces</option>
              <option value="Congelados">Congelados</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="normal">Normal</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="zerado">Zerado</option>
              <option value="vencendo">Vencendo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhum item encontrado</p>
          <Link
            to="/stock/new"
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Cadastrar primeiro item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preços
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Margem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/stock/${item.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                        {item.imageUrl ? (
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sem foto
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                        {(item.barcode || item.sku) && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.sku && `SKU: ${item.sku}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {item.currentQuantity} {item.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mín: {item.minimumQuantity}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(item.salePrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item.costPrice)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    {getMargin(item.costPrice, item.salePrice)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}`}>
                        {item.status}
                      </span>
                      {!item.isActive && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Indisponível
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/stock/${item.id}`}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/stock/${item.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
