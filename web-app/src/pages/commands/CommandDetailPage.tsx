import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { commandService, Command } from '../../services/command.service';
import { orderService, Order } from '../../services/order.service';

export default function CommandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [command, setCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCommand();
    }
  }, [id]);

  const loadCommand = async () => {
    try {
      setLoading(true);
      const response = await commandService.getById(id!);
      setCommand(response.data);
    } catch (error) {
      console.error('Erro ao carregar comanda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCommand = async () => {
    if (!command || !window.confirm('Deseja enviar esta comanda para pagamento?')) return;

    try {
      await commandService.closeCommand(command.id);
      await loadCommand();
      alert('Comanda enviada para pagamento no caixa!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao fechar comanda');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus as any });
      await loadCommand();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar status');
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
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!command) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Comanda não encontrada</p>
          <button
            onClick={() => navigate('/commands')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Voltar para comandas
          </button>
        </div>
      </div>
    );
  }

  const orders = command.orders || [];
  const totalOrders = orders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + Number(order.subtotal) : sum, 0
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/commands')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {command.code}
              </h1>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{command.table ? `Mesa ${command.table.number}` : 'Balcão'}</p>
                <p>Garçom: {command.waiter?.name}</p>
                <p>Pessoas: {command.numberOfPeople}</p>
                {command.customerName && <p>Cliente: {command.customerName}</p>}
                <p>Aberta: {new Date(command.openedAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  command.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : command.status === 'pending_payment'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {command.status === 'open' ? 'Aberta' : command.status === 'pending_payment' ? 'Pendente de Pagamento' : 'Fechada'}
                </span>
              </div>
              
              {command.status === 'open' && (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/commands/${command.id}/new-order`)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Novo Pedido
                  </button>
                  <button
                    onClick={handleCloseCommand}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Enviar para Pagamento
                  </button>
                </div>
              )}
              {command.status === 'pending_payment' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-yellow-800 font-medium">
                    Aguardando pagamento no caixa
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            {command.status === 'open' ? (
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Atual</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {orders.reduce((sum, order) => sum + Number(order.subtotal), 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Taxa de serviço será calculada no fechamento)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-semibold">R$ {Number(command.subtotal).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Serviço</p>
                  <p className="text-lg font-semibold">R$ {Number(command.serviceCharge).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-green-600">R$ {Number(command.total).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Pedidos</h2>
        </div>

        <div className="divide-y">
          {orders.map((order: Order) => (
            <div key={order.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Pedido #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  {command.status === 'open' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pendente</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Pronto</option>
                      <option value="delivered">Entregue</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x</span>{' '}
                      {item.productName || item.product?.name}
                      {item.observations && (
                        <p className="text-xs text-gray-500 ml-6">Obs: {item.observations}</p>
                      )}
                    </div>
                    <span className="font-medium">R$ {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
                <span>Subtotal do Pedido</span>
                <span>R$ {Number(order.subtotal).toFixed(2)}</span>
              </div>

              {order.cancellationReason && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                  <strong>Cancelado:</strong> {order.cancellationReason}
                </div>
              )}
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Nenhum pedido ainda
          </div>
        )}
      </div>
    </div>
  );
}
