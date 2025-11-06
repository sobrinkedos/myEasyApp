import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  averageCost: number;
  status: string;
}

interface BulkEntry {
  ingredientId: string;
  quantity: number;
  cost: number;
}

export function IngredientBulkEntryPage() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [entries, setEntries] = useState<Map<string, BulkEntry>>(new Map());
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadIngredients();
  }, [search, showLowStockOnly]);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (showLowStockOnly) params.append('status', 'baixo');

      const response = await api.get(`/ingredients?${params}`);
      
      if (response.data.success) {
        setIngredients(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      setError('Erro ao carregar insumos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntryChange = (ingredientId: string, field: keyof BulkEntry, value: any) => {
    const newEntries = new Map(entries);
    const entry = newEntries.get(ingredientId) || {
      ingredientId,
      quantity: 0,
      cost: 0,
    };
    
    newEntries.set(ingredientId, { ...entry, [field]: value });
    setEntries(newEntries);
  };

  const handleSubmit = async () => {
    const entriesToSave = Array.from(entries.values()).filter(
      entry => entry.quantity > 0
    );

    if (entriesToSave.length === 0) {
      setError('Adicione pelo menos uma quantidade para salvar');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      // Criar transações para cada insumo
      const promises = entriesToSave.map(entry =>
        api.post('/stock/transactions', {
          ingredientId: entry.ingredientId,
          type: 'entrada',
          quantity: entry.quantity,
          reason: `Compra - Entrada em massa - ${new Date().toLocaleDateString()}`,
        })
      );

      await Promise.all(promises);

      setSuccessMessage(`${entriesToSave.length} insumo(s) atualizado(s) com sucesso!`);
      setEntries(new Map());
      loadIngredients();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.response?.data?.message || 'Erro ao salvar entradas');
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

  const getTotalItems = () => {
    return Array.from(entries.values()).filter(e => e.quantity > 0).length;
  };

  const getTotalQuantity = () => {
    return Array.from(entries.values()).reduce((sum, e) => sum + e.quantity, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrada de Insumos em Massa</h1>
          <p className="text-gray-600 mt-1">Adicione quantidades a múltiplos insumos de uma vez</p>
        </div>
        
        <button
          onClick={() => navigate('/ingredients')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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
              placeholder="Nome do insumo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Apenas estoque baixo
              </span>
            </label>
          </div>

          <div className="flex items-end justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-600">Itens selecionados</p>
              <p className="text-2xl font-bold text-orange-600">{getTotalItems()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhum insumo encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Insumo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estoque Atual
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qtd. a Adicionar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Custo Unitário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Novo Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingredients.map((ingredient) => {
                const entry = entries.get(ingredient.id);
                const newTotal = Number(ingredient.currentQuantity) + Number(entry?.quantity || 0);
                
                return (
                  <tr key={ingredient.id} className={entry?.quantity ? 'bg-orange-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                        <div className="text-xs text-gray-500">{ingredient.unit}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {ingredient.currentQuantity} {ingredient.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mín: {ingredient.minimumQuantity}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={entry?.quantity || ''}
                        onChange={(e) => handleEntryChange(ingredient.id, 'quantity', Number(e.target.value))}
                        placeholder="0"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry?.cost || ''}
                        onChange={(e) => handleEntryChange(ingredient.id, 'cost', Number(e.target.value))}
                        placeholder={formatCurrency(ingredient.averageCost)}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {newTotal} {ingredient.unit}
                      </div>
                      {entry?.quantity > 0 && (
                        <div className="text-xs text-green-600">
                          +{entry.quantity}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total de itens a adicionar: <span className="font-semibold text-gray-900">{getTotalItems()}</span>
              </p>
              <p className="text-sm text-gray-600">
                Quantidade total: <span className="font-semibold text-gray-900">{getTotalQuantity().toFixed(3)} unidades</span>
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setEntries(new Map())}
                disabled={isSaving || getTotalItems() === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Limpar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || getTotalItems() === 0}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  `Salvar ${getTotalItems()} Entrada(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
