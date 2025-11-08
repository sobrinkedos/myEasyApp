import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl } from '@/config/constants';

interface Ingredient {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  averageCost: number;
  supplier?: string;
  location?: string;
  expirationDate?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS = {
  normal: 'bg-green-100 text-green-800',
  baixo: 'bg-yellow-100 text-yellow-800',
  zerado: 'bg-red-100 text-red-800',
};

export function IngredientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (id) {
      loadIngredient();
      loadTransactions();
    }
  }, [id]);

  const loadIngredient = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/ingredients/${id}`);
      
      if (response.data.success) {
        setIngredient(response.data.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar insumo:', err);
      setError('Erro ao carregar insumo');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await api.get(`/stock/transactions/ingredient/${id}?limit=10`);
      const data = response.data.data || response.data;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      purchase: 'Compra',
      usage: 'Uso',
      adjustment: 'Ajuste',
      waste: 'Perda',
    };
    return types[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: 'text-green-600 bg-green-50',
      usage: 'text-blue-600 bg-blue-50',
      adjustment: 'text-yellow-600 bg-yellow-50',
      waste: 'text-red-600 bg-red-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar este insumo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`/ingredients/${id}`);
      navigate('/ingredients');
    } catch (err: any) {
      console.error('Erro ao deletar insumo:', err);
      alert(err.response?.data?.message || 'Erro ao deletar insumo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error || 'Insumo não encontrado'}</p>
        </div>
        <button
          onClick={() => navigate('/ingredients')}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ingredients')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ingredient.name}</h1>
            <p className="text-gray-600 mt-1">Detalhes do insumo</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/ingredients/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletar
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image and Status */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {ingredient.imageUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(ingredient.imageUrl)}
                  alt={ingredient.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${STATUS_COLORS[ingredient.status as keyof typeof STATUS_COLORS]}`}>
                {ingredient.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="text-base font-medium text-gray-900 mt-1">{ingredient.name}</p>
              </div>

              {ingredient.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="text-base text-gray-900 mt-1">{ingredient.description}</p>
                </div>
              )}

              {ingredient.barcode && (
                <div>
                  <p className="text-sm text-gray-600">Código de Barras</p>
                  <p className="text-base font-mono text-gray-900 mt-1">{ingredient.barcode}</p>
                </div>
              )}

              {ingredient.sku && (
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="text-base font-mono text-gray-900 mt-1">{ingredient.sku}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Unidade de Medida</p>
                <p className="text-base text-gray-900 mt-1">{ingredient.unit}</p>
              </div>
            </div>
          </div>

          {/* Quantities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Quantidade Atual</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {ingredient.currentQuantity} {ingredient.unit}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Quantidade Mínima</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {ingredient.minimumQuantity} {ingredient.unit}
                </p>
              </div>

              {ingredient.maximumQuantity && (
                <div>
                  <p className="text-sm text-gray-600">Quantidade Máxima</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {ingredient.maximumQuantity} {ingredient.unit}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Precificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Custo Médio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(ingredient.averageCost)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Valor Total em Estoque</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(Number(ingredient.currentQuantity) * Number(ingredient.averageCost))}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(ingredient.supplier || ingredient.location || ingredient.expirationDate) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ingredient.supplier && (
                  <div>
                    <p className="text-sm text-gray-600">Fornecedor</p>
                    <p className="text-base text-gray-900 mt-1">{ingredient.supplier}</p>
                  </div>
                )}

                {ingredient.location && (
                  <div>
                    <p className="text-sm text-gray-600">Localização</p>
                    <p className="text-base text-gray-900 mt-1">{ingredient.location}</p>
                  </div>
                )}

                {ingredient.expirationDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data de Validade</p>
                    <p className="text-base text-gray-900 mt-1">{formatDate(ingredient.expirationDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <p className="text-base text-gray-900 mt-1">{formatDate(ingredient.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Última atualização</p>
                <p className="text-base text-gray-900 mt-1">{formatDate(ingredient.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Histórico de Movimentações
            </h2>
            
            {loadingTransactions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.type === 'usage' || transaction.type === 'waste' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'usage' || transaction.type === 'waste' ? '-' : '+'}
                          {Number(transaction.quantity).toFixed(2)} {ingredient?.unit}
                        </div>
                        {transaction.totalValue && (
                          <div className="text-sm text-gray-600">
                            {formatCurrency(Number(transaction.totalValue))}
                          </div>
                        )}
                      </div>
                    </div>
                    {transaction.reason && (
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Motivo:</strong> {transaction.reason}
                      </div>
                    )}
                    {transaction.unitCost && (
                      <div className="text-sm text-gray-600">
                        <strong>Custo unitário:</strong> {formatCurrency(Number(transaction.unitCost))}/{ingredient?.unit}
                      </div>
                    )}
                    {transaction.user && (
                      <div className="text-xs text-gray-500 mt-2">
                        Por: {transaction.user.name}
                      </div>
                    )}
                  </div>
                ))}
                {transactions.length === 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando as 10 movimentações mais recentes
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p>Nenhuma movimentação registrada</p>
                <p className="text-sm mt-1">As movimentações aparecerão aqui quando houver entradas, saídas ou ajustes de estoque.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
