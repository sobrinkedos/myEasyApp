import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
    averageCost: number;
    imageUrl?: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  yield: number;
  yieldUnit: string;
  preparationTime?: number;
  instructions?: string;
  imageUrl?: string;
  isActive: boolean;
  version: number;
  totalCost: number;
  costPerPortion: number;
  ingredients: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/recipes/${id}`);
      
      if (response.data.success) {
        setRecipe(response.data.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar receita:', err);
      setError('Erro ao carregar receita');
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar esta receita? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/recipes/${id}`);
      navigate('/recipes');
    } catch (err: any) {
      console.error('Erro ao deletar receita:', err);
      alert(err.response?.data?.message || 'Erro ao deletar receita');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error || 'Receita não encontrada'}</p>
        </div>
        <button
          onClick={() => navigate('/recipes')}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/recipes')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {recipe.category}
              </span>
              {!recipe.isActive && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Inativa
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">Ficha técnica completa</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/recipes/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {recipe.imageUrl ? (
              <img
                src={getImageUrl(recipe.imageUrl)}
                alt={recipe.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Informações Rápidas</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rendimento:</span>
                <span className="font-medium">{recipe.yield} {recipe.yieldUnit}</span>
              </div>
              
              {recipe.preparationTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo de Preparo:</span>
                  <span className="font-medium">{recipe.preparationTime} min</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ingredientes:</span>
                <span className="font-medium">{recipe.ingredients.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Versão:</span>
                <span className="font-medium">v{recipe.version}</span>
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Custos</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Custo Total</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(Number(recipe.totalCost))}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Custo por {recipe.yieldUnit}</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(Number(recipe.costPerPortion))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {recipe.description && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-700">{recipe.description}</p>
            </div>
          )}

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ingredientes</h3>
            
            <div className="space-y-3">
              {recipe.ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {ing.ingredient.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={getImageUrl(ing.ingredient.imageUrl)}
                        alt={ing.ingredient.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{ing.ingredient.name}</p>
                    <p className="text-sm text-gray-600">
                      {ing.quantity} {ing.unit}
                      {ing.notes && ` - ${ing.notes}`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(Number(ing.cost))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(Number(ing.ingredient.averageCost))}/{ing.ingredient.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(Number(recipe.totalCost))}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {recipe.instructions && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Modo de Preparo</h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {recipe.instructions}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Criada em</p>
                <p className="font-medium text-gray-900">{formatDate(recipe.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Última atualização</p>
                <p className="font-medium text-gray-900">{formatDate(recipe.updatedAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Versão</p>
                <p className="font-medium text-gray-900">v{recipe.version}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900">
                  {recipe.isActive ? 'Ativa' : 'Inativa'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
