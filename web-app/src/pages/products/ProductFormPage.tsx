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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
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
      const data = response.data.data || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    }
  };

  const loadRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      const data = response.data.data || response.data;
      
      // Converter valores Decimal para number
      const recipesWithNumbers = Array.isArray(data) ? data.map((r: any) => ({
        ...r,
        costPerPortion: Number(r.costPerPortion),
        portionSize: Number(r.portionSize),
      })) : [];
      
      setRecipes(recipesWithNumbers);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setRecipes([]);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data.data || response.data;
      
      setFormData({
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        categoryId: product.categoryId,
        recipeId: product.recipeId || '',
        targetMargin: product.targetMargin ? Number(product.targetMargin) : 65,
        preparationTime: product.preparationTime || 0,
        imageUrl: product.imageUrl || '',
      });

      if (product.recipeId) {
        const recipe = recipes.find(r => r.id === product.recipeId);
        if (recipe) {
          setSelectedRecipe(recipe);
        }
      }
      
      if (product.imageUrl) {
        // Use getImageUrl to get full URL for preview
        const fullUrl = product.imageUrl.startsWith('http') 
          ? product.imageUrl 
          : `http://localhost:3000${product.imageUrl}`;
        setImagePreview(fullUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imageUrl || null;

    try {
      setIsUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);

      const response = await api.post('/upload/image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      }
      return null;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setIsUploadingImage(false);
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
      
      // Upload image first if there's a new one
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      const dataToSend = {
        ...formData,
        imageUrl: imageUrl || undefined,
      };
      
      if (id) {
        await api.put(`/products/${id}`, dataToSend);
      } else {
        await api.post('/products', dataToSend);
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
          <h2 className="text-xl font-semibold mb-4">Imagem do Produto</h2>
          
          <div className="space-y-4">
            {/* Preview da Imagem */}
            {imagePreview && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setFormData({ ...formData, imageUrl: '' });
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload de Arquivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fazer Upload de Imagem
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Clique para selecionar uma imagem
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, WebP até 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Ou URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou use uma URL</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
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
            disabled={loading || isUploadingImage}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {loading || isUploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isUploadingImage ? 'Enviando imagem...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Produto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
