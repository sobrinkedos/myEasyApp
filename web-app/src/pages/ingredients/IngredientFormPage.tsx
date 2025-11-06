import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

const UNITS = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'un', label: 'Unidade (un)' },
];

export function IngredientFormPage() {
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
    barcode: '',
    sku: '',
    unit: 'kg',
    currentQuantity: 0,
    minimumQuantity: 0,
    maximumQuantity: 0,
    averageCost: 0,
    supplier: '',
    location: '',
    expirationDate: '',
    imageUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadIngredient();
    }
  }, [id]);

  const loadIngredient = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/ingredients/${id}`);
      
      if (response.data.success) {
        const ingredient = response.data.data;
        setFormData({
          name: ingredient.name || '',
          description: ingredient.description || '',
          barcode: ingredient.barcode || '',
          sku: ingredient.sku || '',
          unit: ingredient.unit || 'kg',
          currentQuantity: Number(ingredient.currentQuantity) || 0,
          minimumQuantity: Number(ingredient.minimumQuantity) || 0,
          maximumQuantity: Number(ingredient.maximumQuantity) || 0,
          averageCost: Number(ingredient.averageCost) || 0,
          supplier: ingredient.supplier || '',
          location: ingredient.location || '',
          expirationDate: ingredient.expirationDate ? ingredient.expirationDate.split('T')[0] : '',
          imageUrl: ingredient.imageUrl || '',
        });
        
        if (ingredient.imageUrl) {
          setImagePreview(getImageUrl(ingredient.imageUrl));
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar insumo:', err);
      setError('Erro ao carregar insumo');
    } finally {
      setIsLoading(false);
    }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

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
        name: formData.name,
        description: formData.description || undefined,
        barcode: formData.barcode || undefined,
        sku: formData.sku || undefined,
        unit: formData.unit,
        currentQuantity: Number(formData.currentQuantity),
        minimumQuantity: Number(formData.minimumQuantity),
        maximumQuantity: formData.maximumQuantity ? Number(formData.maximumQuantity) : undefined,
        averageCost: Number(formData.averageCost),
        supplier: formData.supplier || undefined,
        location: formData.location || undefined,
        expirationDate: formData.expirationDate || undefined,
        imageUrl: imageUrl || undefined,
      };

      const response = isEditing
        ? await api.put(`/ingredients/${id}`, dataToSend)
        : await api.post('/ingredients', dataToSend);

      if (response.data.success) {
        navigate('/ingredients', {
          state: { message: `Insumo ${isEditing ? 'atualizado' : 'criado'} com sucesso!` }
        });
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Erro ao salvar insumo');
    } finally {
      setIsSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Insumo' : 'Novo Insumo'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações do insumo' : 'Cadastre um novo insumo para produção'}
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
              Imagem do Insumo
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
                Nome do Insumo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Farinha de Trigo, Açúcar, Óleo..."
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
                placeholder="Descrição detalhada do insumo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Barras
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="7891234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quantidades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantidades</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Atual *
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.currentQuantity}
                onChange={(e) => handleChange('currentQuantity', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Mínima *
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.minimumQuantity}
                onChange={(e) => handleChange('minimumQuantity', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade Máxima
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.maximumQuantity}
                onChange={(e) => handleChange('maximumQuantity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preços e Fornecedor */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preços e Fornecedor</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Médio *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.averageCost}
                onChange={(e) => handleChange('averageCost', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Estoque A, Prateleira 1..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleChange('expirationDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/ingredients')}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploadingImage}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving || isUploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isUploadingImage ? 'Enviando imagem...' : 'Salvando...'}
              </>
            ) : (
              isEditing ? 'Atualizar' : 'Cadastrar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
