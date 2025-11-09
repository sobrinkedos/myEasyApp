import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { counterOrderService } from '../../services/counter-order.service';

interface PendingOrder {
  id: string;
  orderNumber: number;
  customerName?: string;
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
  }>;
  notes?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export default function PendingPaymentOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPendingOrders();
    // Atualizar a cada 10 segundos
    const interval = setInterval(loadPendingOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingOrders = async () => {
    try {
      const response = await counterOrderService.getPendingPayment();
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    try {
      await counterOrderService.cancel(orderId, reason);
      alert('Pedido cancelado com sucesso');
      setSelectedOrder(null);
      await loadPendingOrders();
    } catch (error: any) {
      console.error('Erro ao cancelar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar pedido');
    }
  };

  const getTimeSinceCreation = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins === 1) return '1 minuto';
    if (diffMins < 60) return `${diffMins} minutos`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hora';
    return `${diffHours} horas`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar para Pedidos
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Pedidos Pendentes de Pagamento
        </h1>
        <p className="text-gray-600">
          {orders.length} {orders.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'} pagamento
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum pedido pendente
          </h2>
          <p className="text-gray-600 mb-6">
            Todos os pedidos foram pagos ou não há pedidos no momento
          </p>
          <button
            onClick={() => navigate('/orders/counter/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Novo Pedido Balcão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Pedido #{order.orderNumber}
                    </h3>
                    {order.customerName && (
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      R$ {order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTimeSinceCreation(order.createdAt)} atrás
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-sm text-gray-700">
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 3} mais...
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Criado por: {order.createdBy.name}
                </div>
              </div>
            ))}
          </div>

          {/* Detalhes do Pedido Selecionado */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Pedido #{selectedOrder.orderNumber}
                </h2>

                {selectedOrder.customerName && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Cliente</label>
                    <p className="text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Itens do Pedido
                  </label>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.quantity}x {item.productName}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-gray-600 italic">
                              Obs: {item.notes}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            R$ {item.unitPrice.toFixed(2)} cada
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">
                          R$ {item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Observações</label>
                    <p className="text-gray-900">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      R$ {selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 font-medium mb-2">
                      💰 Pagamento no Caixa
                    </p>
                    <p className="text-sm text-yellow-700">
                      Para confirmar o pagamento deste pedido, acesse o módulo de Caixa
                    </p>
                    <button
                      onClick={() => navigate('/cash/pending-counter-orders')}
                      className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      Ir para Caixa →
                    </button>
                  </div>

                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={processingPayment}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    ✕ Cancelar Pedido
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Criado {getTimeSinceCreation(selectedOrder.createdAt)} atrás por{' '}
                  {selectedOrder.createdBy.name}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-600">
                  Selecione um pedido para ver os detalhes e processar o pagamento
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
