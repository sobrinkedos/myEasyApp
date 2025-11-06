import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

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
    unit: 'kg',
    currentQuantity: 0,
    minimumQuantity: 0,
    averageCost: 0,
  });

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
          unit: ingredient.unit || 'kg',
          currentQuantity: Number(ingredient.currentQuantity) || 0,
          minimumQuantity: Number(ingredient.minimumQuantity) || 0,
          averageCost: Number(ingredient.averageCost) || 0,
        });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    try {
      setIsSaving(true);

      const dataToSend = {
        name: formData.name,
        unit: formData.unit,
        currentQuantity: Number(formData.currentQuantity),
        minimumQuantity: Number(formData.minimumQuantity),
        averageCost: Number(formData.averageCost),
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Insumo</h2>
          
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
