import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  yield: number;
  yieldUnit: string;
  preparationTime?: number;
  imageUrl?: string;
  isActive: boolean;
  totalCost: number;
  costPerPortion: number;
  ingredients: any[];
}

const CATEGORIES = [
  'Entrada',
  'Prato Principal',
  'Acompanhamento',
  'Sobremesa',
  'Bebida',
  'Lanche',
  'Pizza',
  'Massa',
  'Outro',
];

export function RecipeListPage() {
  const location = useLocation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadRecipes();
  }, [search, categoryFilter, activeFilter]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (activeFilter !== undefined) params.append('isActive', String(activeFilter));

      const response = await api.get(`/recipes?${params}`);
      
      if (response.data.success) {
        setRecipes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
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
    const totalRecipes = recipes.length;
    const avgCost = recipes.length > 0
      ? recipes.reduce((sum, r) => sum + Number(r.costPerPortion), 0) / recipes.length
      : 0;
    const activeRecipes = recipes.filter(r => r.isActive).length;

    return { totalRecipes, avgCost, activeRecipes };
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
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600 mt-1">Gerencie as fichas técnicas dos produtos</p>
        </div>
        
        <Link
          to="/recipes/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Nova Receita
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Receitas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRecipes}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Custo Médio por Porção</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(stats.avgCost)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Receitas Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeRecipes}</p>
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
              placeholder="Nome da receita..."
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
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={activeFilter === undefined ? '' : String(activeFilter)}
              onChange={(e) => setActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma receita encontrada</p>
          <Link
            to="/recipes/new"
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Cadastrar primeira receita
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {recipe.imageUrl ? (
                  <img
                    src={getImageUrl(recipe.imageUrl)}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
                {!recipe.isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    Inativa
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {recipe.name}
                  </h3>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {recipe.category}
                  </span>
                </div>

                {recipe.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rendimento:</span>
                    <span className="font-medium">{recipe.yield} {recipe.yieldUnit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Custo Total:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(Number(recipe.totalCost))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Custo/Porção:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(Number(recipe.costPerPortion))}
                    </span>
                  </div>
                  {recipe.preparationTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tempo:</span>
                      <span className="font-medium">{recipe.preparationTime} min</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ingredientes:</span>
                    <span className="font-medium">{recipe.ingredients?.length || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="flex-1 px-3 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Ver Detalhes
                  </Link>
                  <Link
                    to={`/recipes/${recipe.id}/edit`}
                    className="flex-1 px-3 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
