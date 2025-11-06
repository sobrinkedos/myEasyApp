import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

export function CategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    name: '',
    displayOrder: 1,
    isActive: true,
  });

  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/categories/${id}`);
      
      if (response.data.success) {
        const category = response.data.data;
        setFormData({
          name: category.name || '',
          displayOrder: category.displayOrder || 1,
          isActive: category.isActive !== undefined ? category.isActive : true,
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar categoria:', err);
      setError('Erro ao carregar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    try {
      setIsSaving(true);

      const dataToSend = {
        name: formData.name,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      };

      const response = isEditing
        ? await api.put(`/categories/${id}`, dataToSend)
        : await api.post('/categories', dataToSend);

      if (response.data.success) {
        navigate('/categories', {
          state: { message: `Categoria ${isEditing ? 'atualizada' : 'criada'} com sucesso!` }
        });
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Erro ao salvar categoria');
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Atualize as informações da categoria' : 'Cadastre uma nova categoria de produtos'}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Categoria</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Categoria *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Bebidas, Lanches, Sobremesas..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Exibição *
              </label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => handleChange('displayOrder', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Define a ordem de exibição no sistema
              </p>
              {errors.displayOrder && <p className="mt-1 text-sm text-red-600">{errors.displayOrder[0]}</p>}
            </div>

            <div className="flex items-center">
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Categoria ativa
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            disabled={isSaving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Salvando...
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
