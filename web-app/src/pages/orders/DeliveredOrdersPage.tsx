import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package } from 'lucide-react';
import { orderService, Order } from '../../services/order.service';
import { counterOrderService, CounterOrder } from '../../services/counter-order.service';

export default function DeliveredOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [counterOrders, setCounterOrders] = useState<CounterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    loadDeliveredOrders();
  }, [dateFilter]);

  const loadDeliveredOrders = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      // Load regular orders
      const ordersResponse = await orderService.getByStatus('delivered');
      const allOrders = ordersResponse.data.filter((order: Order) => {
        const orderDate = new Date(order.deliveredAt || order.createdAt);
        return orderDate >= startDate;
      });
      setOrders(allOrders);

      // Load counter orders
      try {
        const counterResponse = await counterOrderService.getActive();
        const deliveredCounterOrders = (counterResponse.data || []).filter(
          (order: CounterOrder) => order.status === 'ENTREGUE'
        );
        setCounterOrders(deliveredCounterOrders);
      } catch (error) {
        console.error('Erro ao carregar pedidos balcão:', error);
        setCounterOrders([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos entregues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber.toString().includes(search) ||
      order.command?.table?.number.toString().includes(search) ||
      order.command?.customerName?.toLowerCase().includes(search)
    );
  });

  const filteredCounterOrders = counterOrders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber.toString().includes(search) ||
      order.customerName?.toLowerCase().includes(search)
    );
  });

  const allFilteredOrders = [
    ...filteredOrders.map(o => ({ ...o, type: 'regular' as const })),
    ...filteredCounterOrders.map(o => ({ ...o, type: 'counter' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.deliveredAt || a.createdAt).getTime();
    const dateB = new Date(b.deliveredAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Pedidos
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos Entregues</h1>
            <p className="text-gray-600 mt-1">
              {allFilteredOrders.length} {allFilteredOrders.length === 1 ? 'pedido entregue' : 'pedidos entregues'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número do pedido, mesa ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg ${
              dateFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg ${
              dateFilter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-4 py-2 rounded-lg ${
              dateFilter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Último Mês
          </button>
        </div>
      </div>

      {/* Orders List */}
      {allFilteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhum pedido encontrado com os critérios de busca' : 'Nenhum pedido entregue no período selecionado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {allFilteredOrders.map((order) => (
            <div
              key={`${order.type}-${order.id}`}
              className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">Pedido #{order.orderNumber}</h3>
                    {order.type === 'counter' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                        BALCÃO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Entregue: {formatDateTime(order.deliveredAt || order.createdAt)}
                  </p>
                  {order.type === 'regular' && order.command && (
                    <p className="text-sm text-gray-600 mt-1">
                      {order.command.table ? `Mesa ${order.command.table.number}` : 'Balcão'}
                    </p>
                  )}
                  {order.type === 'counter' && order.customerName && (
                    <p className="text-sm text-gray-600 mt-1">Cliente: {order.customerName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(Number(order.type === 'regular' ? order.subtotal : order.totalAmount))}
                  </p>
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium mt-1">
                    ✓ Entregue
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Itens:</p>
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-sm">
                    <span className="font-medium">{item.quantity}x</span>{' '}
                    {item.productName || item.product?.name}
                    {(item.observations || item.notes) && (
                      <p className="text-xs text-gray-500 ml-4">
                        Obs: {item.observations || item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
