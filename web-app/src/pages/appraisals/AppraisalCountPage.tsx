import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '@/services/api';

interface AppraisalItem {
  ingredientId: string;
  theoreticalQuantity: number;
  physicalQuantity: number;
  difference: number;
  differencePercentage: number;
  unitCost: number;
  totalDifference: number;
  reason?: string;
  notes?: string;
  ingredient: {
    id: string;
    name: string;
    unit: string;
    currentStock: number;
  };
}

interface Appraisal {
  id: string;
  date: string;
  type: string;
  status: string;
  notes?: string;
  items: AppraisalItem[];
}

export function AppraisalCountPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState<Appraisal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<AppraisalItem[]>([]);

  useEffect(() => {
    loadAppraisal();
  }, [id]);

  const loadAppraisal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appraisals/${id}`);
      const data = response.data.data || response.data;
      
      // Converter valores Decimal para number
      const itemsWithNumbers = (data.items || []).map((item: any) => ({
        ...item,
        theoreticalQuantity: Number(item.theoreticalQuantity),
        physicalQuantity: Number(item.physicalQuantity || 0),
        difference: Number(item.difference || 0),
        differencePercentage: Number(item.differencePercentage || 0),
        unitCost: Number(item.unitCost),
        totalDifference: Number(item.totalDifference || 0),
        ingredient: {
          ...item.ingredient,
          currentStock: Number(item.ingredient.currentStock),
        },
      }));
      
      setAppraisal(data);
      setItems(itemsWithNumbers);
    } catch (error) {
      console.error('Erro ao carregar conferência:', error);
      alert('Erro ao carregar conferência');
      navigate('/appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handlePhysicalQuantityChange = async (ingredientId: string, value: string) => {
    const physicalQuantity = parseFloat(value) || 0;
    
    const updatedItems = items.map(item => {
      if (item.ingredientId === ingredientId) {
        const difference = physicalQuantity - item.theoreticalQuantity;
        const differencePercentage = item.theoreticalQuantity > 0
          ? (difference / item.theoreticalQuantity) * 100
          : 0;
        const totalDifference = difference * item.unitCost;

        return {
          ...item,
          physicalQuantity,
          difference,
          differencePercentage,
          totalDifference,
        };
      }
      return item;
    });

    setItems(updatedItems);

    // Auto-save
    try {
      await api.put(`/appraisals/${id}/items/${ingredientId}`, {
        physicalQuantity,
      });
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  const handleReasonChange = async (ingredientId: string, reason: string) => {
    const updatedItems = items.map(item =>
      item.ingredientId === ingredientId ? { ...item, reason } : item
    );
    setItems(updatedItems);

    try {
      await api.put(`/appraisals/${id}/items/${ingredientId}`, { reason });
    } catch (error) {
      console.error('Erro ao salvar motivo:', error);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Deseja completar esta conferência? Após completar, você poderá revisar antes de aprovar.')) {
      return;
    }

    try {
      setSaving(true);
      await api.post(`/appraisals/${id}/complete`);
      navigate(`/appraisals/${id}/review`);
    } catch (error: any) {
      console.error('Erro ao completar conferência:', error);
      alert(error.response?.data?.message || 'Erro ao completar conferência');
    } finally {
      setSaving(false);
    }
  };

  const getDivergenceColor = (percentage: number) => {
    const abs = Math.abs(percentage);
    if (abs <= 5) return 'text-green-600 bg-green-50';
    if (abs <= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDivergenceIcon = (percentage: number) => {
    const abs = Math.abs(percentage);
    if (abs <= 5) return '🟢';
    if (abs <= 10) return '🟡';
    return '🔴';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredItems = items.filter(item =>
    item.ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: items.length,
    counted: items.filter(i => i.physicalQuantity > 0).length,
    critical: items.filter(i => Math.abs(i.differencePercentage) > 10).length,
    totalDivergence: items.reduce((sum, i) => sum + Math.abs(i.totalDifference), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!appraisal) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/appraisals')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contagem de Estoque</h1>
            <p className="text-gray-600 mt-1">
              {new Date(appraisal.date).toLocaleDateString('pt-BR')} - {appraisal.type}
            </p>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={saving || stats.counted === 0}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Completando...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Completar Conferência
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Itens</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Contados</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.counted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Divergências Críticas</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Divergência Total</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.totalDivergence)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingrediente</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Teórico</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Físico</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Divergência</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.ingredientId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.ingredient.name}</p>
                      <p className="text-sm text-gray-500">{item.ingredient.unit}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-900">{item.theoreticalQuantity.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.physicalQuantity || ''}
                      onChange={(e) => handlePhysicalQuantityChange(item.ingredientId, e.target.value)}
                      placeholder="0.00"
                      className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {item.physicalQuantity > 0 && (
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${getDivergenceColor(item.differencePercentage)}`}>
                        <span>{getDivergenceIcon(item.differencePercentage)}</span>
                        <span className="font-medium">
                          {item.differencePercentage >= 0 ? '+' : ''}{item.differencePercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.physicalQuantity > 0 && (
                      <span className={`font-medium ${item.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.totalDifference >= 0 ? '+' : ''}{formatCurrency(item.totalDifference)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {Math.abs(item.differencePercentage) > 10 && (
                      <input
                        type="text"
                        value={item.reason || ''}
                        onChange={(e) => handleReasonChange(item.ingredientId, e.target.value)}
                        placeholder="Motivo da divergência..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      {stats.critical > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Atenção: Divergências Críticas</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Existem {stats.critical} itens com divergência superior a 10%. 
              Por favor, adicione o motivo da divergência antes de completar a conferência.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
