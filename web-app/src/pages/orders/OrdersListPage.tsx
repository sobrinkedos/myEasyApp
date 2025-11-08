import { useState, useEffect } from 'react';
import { orderService, Order } from '../../services/order.service';

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getByStatus(filter);
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      preparing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Preparando' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pronto' },
      delivered: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Entregue' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Carregando...</div></div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>
      <div className="mb-6 flex gap-2">
        {['pending', 'preparing', 'ready', 'delivered'].map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-lg ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {status === 'pending' ? 'Pendentes' : status === 'preparing' ? 'Em Preparo' : status === 'ready' ? 'Prontos' : 'Entregues'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-semibold">Pedido #{order.orderNumber}</h3>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(order.status)}
                <p className="text-lg font-bold mt-2">R$ {Number(order.subtotal).toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product?.name}</span>
                  <span>R$ {Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {orders.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Nenhum pedido encontrado</p></div>}
    </div>
  );
}
