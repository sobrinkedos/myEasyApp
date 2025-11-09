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

export default function CounterOrderPaymentPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingOrders();
    // Atualizar a cada 5 segundos
    const interval = setInterval(loadPendingOrders, 5000);
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
          onClick={() => navigate('/cash')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar para Caixa
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          💰 Pedidos Balcão - Pagamento
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
            Todos os pedidos balcão foram pagos
          </p>
        </div>
      ) : (
        <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/cash/counter-orders/${order.id}/payment`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md"
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
      )}
    </div>
  );
}
