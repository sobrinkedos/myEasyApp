import { useState, useEffect } from 'react';
import { orderService, Order } from '../../services/order.service';

export default function OrdersListPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Load orders from all active statuses
      const statuses = ['pending', 'preparing', 'ready'];
      const promises = statuses.map(status => orderService.getByStatus(status));
      const responses = await Promise.all(promises);
      const orders = responses.flatMap(r => r.data);
      setAllOrders(orders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await orderService.updateStatus(orderId, { status: newStatus as any });
      await loadOrders();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrdersByStatus = (status: string) => {
    return allOrders.filter(order => order.status === status);
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">Pedido #{order.orderNumber}</h3>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
          {order.command && (
            <p className="text-sm text-gray-600 mt-1">
              {order.command.table ? `Mesa ${order.command.table.number}` : 'Balcão'}
            </p>
          )}
        </div>
        <p className="text-lg font-bold text-gray-900">R$ {Number(order.subtotal).toFixed(2)}</p>
      </div>
      
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="text-sm">
            <span className="font-medium">{item.quantity}x</span> {item.productName || item.product?.name}
            {item.observations && (
              <p className="text-xs text-gray-500 ml-4">Obs: {item.observations}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => handleUpdateStatus(order.id, 'preparing')}
            disabled={updatingOrderId === order.id}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingOrderId === order.id ? 'Processando...' : 'Iniciar Preparo'}
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => handleUpdateStatus(order.id, 'ready')}
            disabled={updatingOrderId === order.id}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingOrderId === order.id ? 'Processando...' : 'Marcar Pronto'}
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => handleUpdateStatus(order.id, 'delivered')}
            disabled={updatingOrderId === order.id}
            className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingOrderId === order.id ? 'Processando...' : 'Entregar'}
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const pendingOrders = getOrdersByStatus('pending');
  const preparingOrders = getOrdersByStatus('preparing');
  const readyOrders = getOrdersByStatus('ready');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos - Kanban</h1>
        <button
          onClick={loadOrders}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          🔄 Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pendentes */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-yellow-800">Pendentes</h2>
            <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
              {pendingOrders.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-center text-yellow-600 py-8">Nenhum pedido pendente</p>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Em Preparo */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-800">Em Preparo</h2>
            <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
              {preparingOrders.length}
            </span>
          </div>
          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <p className="text-center text-blue-600 py-8">Nenhum pedido em preparo</p>
            ) : (
              preparingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Prontos */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-800">Prontos</h2>
            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              {readyOrders.length}
            </span>
          </div>
          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <p className="text-center text-green-600 py-8">Nenhum pedido pronto</p>
            ) : (
              readyOrders.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
