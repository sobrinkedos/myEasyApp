import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/config/constants';

interface StockItem {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  costPrice: number;
  salePrice: number;
  supplier?: string;
  location?: string;
  expirationDate?: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  costPrice?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  user: {
    name: string;
  };
}

const STATUS_COLORS = {
  normal: 'bg-green-100 text-green-800',
  baixo: 'bg-yellow-100 text-yellow-800',
  zerado: 'bg-red-100 text-red-800',
  vencendo: 'bg-orange-100 text-orange-800',
  vencido: 'bg-red-100 text-red-800',
};

const MOVEMENT_LABELS = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
  perda: 'Perda',
  devolucao: 'Devolução',
  transferencia: 'Transferência',
};

export function StockDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<StockItem | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [itemResponse, movementsResponse] = await Promise.all([
        api.get(`/stock-management/items/${id}`),
        api.get(`/stock-management/items/${id}/movements`),
      ]);

      if (itemResponse.data.success) {
        setItem(itemResponse.data.data);
      }

      if (movementsResponse.data.success) {
        setMovements(movementsResponse.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getMargin = () => {
    if (!item || item.costPrice === 0) return 0;
    return (((item.salePrice - item.costPrice) / item.costPrice) * 100).toFixed(1);
  };

  const handleDelete = async () => {
    if (!item) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar "${item.name}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await api.delete(`/stock-management/items/${id}`);

      if (response.data.success) {
        navigate('/stock', { 
          state: { message: 'Item deletado com sucesso!' } 
        });
      }
    } catch (error: any) {
      console.error('Erro ao deletar item:', error);
      alert(error.response?.data?.message || 'Erro ao deletar item');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Item não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-6 flex-1">
          {/* Product Image */}
          {item.imageUrl && (
            <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600 mt-1">{item.category}</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to={`/stock/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </button>
          <button
            onClick={() => navigate('/stock')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Quantidade Atual</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {item.currentQuantity} {item.unit}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Preço de Venda</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(item.salePrice)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Margem de Lucro</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {getMargin()}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Status</p>
          <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {item.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="text-gray-900 mt-1">{item.description}</p>
            </div>
          )}

          {item.barcode && (
            <div>
              <p className="text-sm text-gray-600">Código de Barras</p>
              <p className="text-gray-900 mt-1">{item.barcode}</p>
            </div>
          )}

          {item.sku && (
            <div>
              <p className="text-sm text-gray-600">SKU</p>
              <p className="text-gray-900 mt-1">{item.sku}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">Quantidade Mínima</p>
            <p className="text-gray-900 mt-1">{item.minimumQuantity} {item.unit}</p>
          </div>

          {item.maximumQuantity && (
            <div>
              <p className="text-sm text-gray-600">Quantidade Máxima</p>
              <p className="text-gray-900 mt-1">{item.maximumQuantity} {item.unit}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">Preço de Custo</p>
            <p className="text-gray-900 mt-1">{formatCurrency(item.costPrice)}</p>
          </div>

          {item.supplier && (
            <div>
              <p className="text-sm text-gray-600">Fornecedor</p>
              <p className="text-gray-900 mt-1">{item.supplier}</p>
            </div>
          )}

          {item.location && (
            <div>
              <p className="text-sm text-gray-600">Localização</p>
              <p className="text-gray-900 mt-1">{item.location}</p>
            </div>
          )}

          {item.expirationDate && (
            <div>
              <p className="text-sm text-gray-600">Data de Validade</p>
              <p className="text-gray-900 mt-1">{formatDate(item.expirationDate)}</p>
            </div>
          )}

          {item.imageUrl && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-2">Imagem do Produto</p>
              <div className="w-64 h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movements History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Movimentações</h2>
        
        {movements.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhuma movimentação registrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDateTime(movement.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'entrada' ? 'bg-green-100 text-green-800' :
                        movement.type === 'saida' ? 'bg-blue-100 text-blue-800' :
                        movement.type === 'perda' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {MOVEMENT_LABELS[movement.type as keyof typeof MOVEMENT_LABELS]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.totalCost ? formatCurrency(movement.totalCost) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {movement.user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {movement.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
