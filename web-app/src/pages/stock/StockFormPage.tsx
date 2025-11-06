import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

const CATEGORIES = [
  'Bebidas Alcoólicas',
  'Bebidas Não Alcoólicas',
  'Salgadinhos',
  'Doces',
  'Congelados',
  'Outros',
];

const UNITS = [
  { value: 'un', label: 'Unidade' },
  { value: 'cx', label: 'Caixa' },
  { value: 'pct', label: 'Pacote' },
  { value: 'kg', label: 'Quilograma' },
  { value: 'l', label: 'Litro' },
  { value: 'ml', label: 'Mililitro' },
];

export function StockFormPage() {
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
    category: '',
    unit: 'un',
    currentQuantity: 0,
    minimumQuantity: 0,
    maximumQuantity: 0,
    costPrice: 0,
    salePrice: 0,
    supplier: '',
    location: '',
    expirationDate: '',
    imageUrl: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/stock-management/items/${id}`);
      
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          name: item.name || '',
          description: item.description || '',
          barcode: item.barcode || '',
          sku: item.sku || '',
          category: item.category || '',
          unit: item.unit || 'un',
          currentQuantity: Number(item.currentQuantity) || 0,
          minimumQuantity: Number(item.minimumQuantity) || 0,
          maximumQuantity: Number(item.maximumQuantity) || 0,
          costPrice: Number(item.costPrice) || 0,
          salePrice: Number(item.salePrice) || 0,
          supplier: item.supplier || '',
          location: item.location || '',
          expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
          imageUrl: item.imageUrl || '',
          isActive: item.isActive !== undefined ? item.isActive : true,
        });
        
        if (item.imageUrl) {
          setImagePreview(getImageUrl(item.imageUrl));
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar item:', err);
      setError('Erro ao carregar item');
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
        ...formData,
        currentQuantity: Number(formData.currentQuantity),
        minimumQuantity: Number(formData.minimumQuantity),
        maximumQuantity: formData.maximumQuantity ? Number(formData.maximumQuantity) : undefined,
        costPrice: Number(formData.costPrice),
        salePrice: Number(formData.salePrice),
        expirationDate: formData.expirationDate || undefined,
        imageUrl: imageUrl || undefined,
      };

      const response = isEditing
        ? await api.put(`/stock-management/items/${id}`, dataToSend)
        : await api.post('/stock-management/items', dataToSend);

      if (response.data.success) {
        navigate('/stock');
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Erro ao salvar item');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateMargin = () => {
    if (formData.costPrice === 0) return 0;
    return (((formData.salePrice - formData.costPrice) / formData.costPrice) * 100).toFixed(1);
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
          {isEditing ? 'Editar Item' : 'Novo Item'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações do item' : 'Cadastre um novo item no estoque'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Produto
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
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Cerveja Heineken 350ml"
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
                placeholder="Descrição detalhada do produto"
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
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade *
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

        {/* Preços */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Precificação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Custo *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço de Venda *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => handleChange('salePrice', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem de Lucro
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-lg font-semibold text-green-600">
                  {calculateMargin()}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Ex: Prateleira A1"
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

          {/* Disponibilidade */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                Disponível para venda
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 ml-7">
              Quando desmarcado, o produto não aparecerá como opção de venda no sistema
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/stock')}
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
