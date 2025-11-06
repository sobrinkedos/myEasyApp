import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  status: string;
  imageUrl?: string;
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
        
        <div className="flex gap-2">
          <Link
            to="/ingredients/bulk-entry"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📦 Entrada em Massa
          </Link>
          <Link
            to="/ingredients/new"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            + Novo Insumo
          </Link>
        </div>
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
                  Imagem
                </th>
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
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {ingredient.imageUrl ? (
                        <img
                          src={getImageUrl(ingredient.imageUrl)}
                          alt={ingredient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 break-words max-w-xs">{ingredient.name}</div>
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
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/ingredients/${ingredient.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver detalhes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/ingredients/${ingredient.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
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
