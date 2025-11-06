import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import api from '../../services/api';

interface Category {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  costPerPortion: number;
  portionSize: number;
  portionUnit: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  recipeId: string;
  targetMargin: number;
  preparationTime: number;
  imageUrl: string;
}

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    recipeId: '',
    targetMargin: 65,
    preparationTime: 0,
    imageUrl: '',
  });

  const [pricing, setPricing] = useState({
    cost: 0,
    suggestedPrice: 0,
    currentMargin: 0,
    markup: 0,
  });

  useEffect(() => {
    loadCategories();
    loadRecipes();
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (selectedRecipe) {
      calculatePricing();
    }
  }, [selectedRecipe, formData.price, formData.targetMargin]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        recipeId: product.recipeId || '',
        targetMargin: product.targetMargin || 65,
        preparationTime: product.preparationTime || 0,
        imageUrl: product.imageUrl || '',
      });

      if (product.recipeId) {
        const recipe = recipes.find(r => r.id === product.recipeId);
        if (recipe) {
          setSelectedRecipe(recipe);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!selectedRecipe) return;

    const cost = selectedRecipe.costPerPortion;
    const price = formData.price || 0;
    const targetMargin = formData.targetMargin || 65;

    // Preço sugerido = custo / (1 - margem/100)
    const suggestedPrice = cost / (1 - targetMargin / 100);
    
    // Margem atual = ((preço - custo) / preço) * 100
    const currentMargin = price > 0 ? ((price - cost) / price) * 100 : 0;
    
    // Markup = ((preço - custo) / custo) * 100
    const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;

    setPricing({
      cost,
      suggestedPrice,
      currentMargin,
      markup,
    });
  };

  const handleRecipeChange = (recipeId: string) => {
    setFormData({ ...formData, recipeId });
    const recipe = recipes.find(r => r.id === recipeId);
    setSelectedRecipe(recipe || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (id) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const useSuggestedPrice = () => {
    setFormData({ ...formData, price: Number(pricing.suggestedPrice.toFixed(2)) });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Pizza Margherita"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descrição do produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Preparo (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Receita e Precificação */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Receita e Precificação</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receita Vinculada
              </label>
              <select
                value={formData.recipeId}
                onChange={(e) => handleRecipeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Sem receita vinculada</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} - R$ {recipe.costPerPortion.toFixed(2)}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Vincule uma receita para cálculo automático de custos
              </p>
            </div>

            {selectedRecipe && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Custo da Receita</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Custo por Porção:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      R$ {selectedRecipe.costPerPortion.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {selectedRecipe.portionSize} {selectedRecipe.portionUnit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem Desejada (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.targetMargin}
                  onChange={(e) => setFormData({ ...formData, targetMargin: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Venda (R$) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {selectedRecipe && (
                    <button
                      type="button"
                      onClick={useSuggestedPrice}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Usar preço sugerido"
                    >
                      <TrendingUp className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {selectedRecipe && formData.price > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Análise de Precificação</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Preço Sugerido</div>
                    <div className="text-lg font-semibold text-green-600">
                      R$ {pricing.suggestedPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Margem Atual</div>
                    <div className={`text-lg font-semibold ${
                      pricing.currentMargin >= formData.targetMargin ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pricing.currentMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Markup</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {pricing.markup.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Lucro/Unidade</div>
                    <div className="text-lg font-semibold text-orange-600">
                      R$ {(formData.price - pricing.cost).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {pricing.currentMargin < formData.targetMargin && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ Margem atual está abaixo da margem desejada. Considere usar o preço sugerido.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Imagem */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Imagem</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
}
