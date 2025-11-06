import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  averageCost: number;
  currentQuantity: number;
}

interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
  ingredient?: Ingredient;
  cost?: number;
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

const YIELD_UNITS = [
  'unidade',
  'porção',
  'kg',
  'g',
  'l',
  'ml',
];

export function RecipeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Prato Principal',
    yield: 1,
    yieldUnit: 'porção',
    preparationTime: 0,
    instructions: '',
    imageUrl: '',
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [totalCost, setTotalCost] = useState(0);
  const [costPerPortion, setCostPerPortion] = useState(0);

  useEffect(() => {
    loadAvailableIngredients();
    if (isEditing) {
      loadRecipe();
    }
  }, [id]);

  useEffect(() => {
    calculateCosts();
  }, [ingredients, formData.yield]);

  const loadAvailableIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      if (response.data.success) {
        setAvailableIngredients(response.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar ingredientes:', err);
    }
  };

  const loadRecipe = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/recipes/${id}`);
      
      if (response.data.success) {
        const recipe = response.data.data;
        setFormData({
          name: recipe.name || '',
          description: recipe.description || '',
          category: recipe.category || 'Prato Principal',
          yield: Number(recipe.yield) || 1,
          yieldUnit: recipe.yieldUnit || 'porção',
          preparationTime: recipe.preparationTime || 0,
          instructions: recipe.instructions || '',
          imageUrl: recipe.imageUrl || '',
        });
        
        setIngredients(recipe.ingredients || []);
        
        if (recipe.imageUrl) {
          setImagePreview(getImageUrl(recipe.imageUrl));
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar receita:', err);
      setError('Erro ao carregar receita');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCosts = () => {
    let total = 0;
    ingredients.forEach(ing => {
      const ingredient = availableIngredients.find(i => i.id === ing.ingredientId);
      if (ingredient) {
        total += ing.quantity * Number(ingredient.averageCost);
      }
    });
    setTotalCost(total);
    setCostPerPortion(formData.yield > 0 ? total / formData.yield : 0);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const addIngredient = (ingredientId: string) => {
    const ingredient = availableIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const exists = ingredients.find(i => i.ingredientId === ingredientId);
    if (exists) {
      alert('Ingrediente já adicionado!');
      return;
    }

    setIngredients([...ingredients, {
      ingredientId,
      quantity: 1,
      unit: ingredient.unit,
      ingredient,
    }]);
    setShowIngredientSelector(false);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (ingredients.length === 0) {
      setError('Adicione pelo menos um ingrediente');
      return;
    }

    try {
      setIsSaving(true);

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
        ingredients: ingredients.map(ing => ({
          ingredientId: ing.ingredientId,
          quantity: Number(ing.quantity),
          unit: ing.unit,
          notes: ing.notes || undefined,
        })),
      };

      const response = isEditing
        ? await api.put(`/recipes/${id}`, dataToSend)
        : await api.post('/recipes', dataToSend);

      if (response.data.success) {
        navigate('/recipes', {
          state: { message: `Receita ${isEditing ? 'atualizada' : 'criada'} com sucesso!` }
        });
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Erro ao salvar receita');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Receita' : 'Nova Receita'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações da receita' : 'Crie uma nova ficha técnica'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem da Receita
            </label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG ou JPEG (máx. 5MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Receita *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Pizza Margherita, Bolo de Chocolate..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Descrição da receita..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Preparo (minutos)
              </label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleChange('preparationTime', Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendimento *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.yield}
                onChange={(e) => handleChange('yield', Number(e.target.value))}
                required
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Rendimento *
              </label>
              <select
                value={formData.yieldUnit}
                onChange={(e) => handleChange('yieldUnit', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {YIELD_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modo de Preparo
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="1. Passo a passo do preparo..."
              />
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ingredientes</h2>
            <button
              type="button"
              onClick={() => setShowIngredientSelector(!showIngredientSelector)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + Adicionar Ingrediente
            </button>
          </div>

          {showIngredientSelector && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione um ingrediente:
              </label>
              <select
                onChange={(e) => e.target.value && addIngredient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value=""
              >
                <option value="">Escolha...</option>
                {availableIngredients
                  .filter(ing => !ingredients.find(i => i.ingredientId === ing.id))
                  .map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit}) - {formatCurrency(Number(ing.averageCost))}/{ing.unit}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum ingrediente adicionado. Clique em "Adicionar Ingrediente" para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {ingredients.map((ing, index) => {
                const ingredient = availableIngredients.find(i => i.id === ing.ingredientId);
                const cost = ingredient ? ing.quantity * Number(ingredient.averageCost) : 0;
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ingredient?.name}</p>
                      <p className="text-sm text-gray-600">
                        Custo: {formatCurrency(cost)}
                      </p>
                    </div>
                    
                    <div className="w-32">
                      <input
                        type="number"
                        step="0.001"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Qtd"
                      />
                    </div>
                    
                    <div className="w-24">
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Un"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custos Calculados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Custo Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalCost)}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Custo por {formData.yieldUnit}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(costPerPortion)}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rendimento</p>
              <p className="text-2xl font-bold text-purple-600">
                {formData.yield} {formData.yieldUnit}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploadingImage || ingredients.length === 0}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving || isUploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isUploadingImage ? 'Enviando imagem...' : 'Salvando...'}
              </>
            ) : (
              isEditing ? 'Atualizar Receita' : 'Criar Receita'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
