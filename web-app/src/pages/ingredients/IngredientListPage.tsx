import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  status: string;
}

const STATUS_COLORS = {
  normal: 'bg-green-100 text-green-800',
  baixo: 'bg-yellow-100 text-yellow-800',
  zerado: 'bg-red-100 text-red-800',
};

export function IngredientListPage() {
  const location = useLocation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadIngredients();
  }, [search, statusFilter]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/ingredients?${params}`);
      
      if (response.data.success) {
        setIngredients(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
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

  const getStats = () => {
    const totalValue = ingredients.reduce((sum, item) => 
      sum + (Number(item.currentQuantity) * Number(item.averageCost)), 0
    );
    const lowStockCount = ingredients.filter(item => 
      item.status === 'baixo' || item.status === 'zerado'
    ).length;

    return { totalValue, lowStockCount, totalItems: ingredients.length };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
          <p className="text-gray-600 mt-1">Gerencie os insumos para produção</p>
        </div>
        
        <Link
          to="/ingredients/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Novo Insumo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Insumos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Valor Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Estoque Baixo</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome do insumo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
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
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      {ingredients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhum insumo encontrado</p>
          <Link
            to="/ingredients/new"
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Cadastrar primeiro insumo
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Custo Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ingredient.currentQuantity} {ingredient.unit}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mín: {ingredient.minimumQuantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(ingredient.averageCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(ingredient.currentQuantity) * Number(ingredient.averageCost))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[ingredient.status as keyof typeof STATUS_COLORS]}`}>
                      {ingredient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/ingredients/${ingredient.id}/edit`}
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
