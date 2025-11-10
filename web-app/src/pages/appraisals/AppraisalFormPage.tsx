import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '@/services/api';

export function AppraisalFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    notes: '',
    includeIngredients: true,
    includeStockItems: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que pelo menos um tipo foi selecionado
    if (!formData.includeIngredients && !formData.includeStockItems) {
      alert('Selecione pelo menos um tipo de item para conferir');
      return;
    }
    
    try {
      setLoading(true);
      
      // Converter data para formato ISO datetime
      const dateTime = new Date(formData.date + 'T00:00:00').toISOString();
      
      const payload = {
        date: dateTime,
        type: formData.type,
        notes: formData.notes,
        includeIngredients: formData.includeIngredients,
        includeStockItems: formData.includeStockItems,
      };
      
      const response = await api.post('/appraisals', payload);
      const appraisalId = response.data.data?.id || response.data.id;
      
      // Redirecionar para tela de contagem
      navigate(`/appraisals/${appraisalId}/count`);
    } catch (error: any) {
      console.error('Erro ao criar conferência:', error);
      alert(error.response?.data?.message || 'Erro ao criar conferência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/appraisals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Conferência de Estoque</h1>
          <p className="text-gray-600 mt-1">Crie uma nova conferência para inventário físico</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6 max-w-3xl">
        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data da Conferência *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Conferência *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Selecione a periodicidade desta conferência
          </p>
        </div>

        {/* Tipos de Itens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Itens a Conferir *
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.includeIngredients}
                onChange={(e) => setFormData({ ...formData, includeIngredients: e.target.checked })}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Insumos (Produção)</div>
                <div className="text-sm text-gray-600">
                  Ingredientes utilizados na produção de pratos e receitas
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.includeStockItems}
                onChange={(e) => setFormData({ ...formData, includeStockItems: e.target.checked })}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Itens de Revenda</div>
                <div className="text-sm text-gray-600">
                  Produtos vendidos diretamente sem manipulação
                </div>
              </div>
            </label>
          </div>
          {!formData.includeIngredients && !formData.includeStockItems && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Selecione pelo menos um tipo de item para conferir
            </p>
          )}
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Adicione observações sobre esta conferência..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Próximos Passos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O sistema capturará automaticamente o estoque teórico atual</li>
            {formData.includeIngredients && (
              <li>• Insumos de produção serão incluídos na conferência</li>
            )}
            {formData.includeStockItems && (
              <li>• Itens de revenda serão incluídos na conferência</li>
            )}
            <li>• Você será direcionado para a tela de contagem</li>
            <li>• Insira as quantidades físicas de cada item</li>
            <li>• O sistema calculará as divergências automaticamente</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/appraisals')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Criar e Iniciar Contagem
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
