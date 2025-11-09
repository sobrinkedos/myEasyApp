import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { counterOrderService } from '../../services/counter-order.service';

type PaymentMethod = 'CASH' | 'DEBIT' | 'CREDIT' | 'PIX' | 'VOUCHER' | 'OTHER';

interface CounterOrder {
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

export default function CounterOrderPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CounterOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await counterOrderService.getById(id!);
      setOrder(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      alert('Erro ao carregar pedido');
      navigate('/cash/pending-counter-orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    
    if (!window.confirm(`Confirmar pagamento de R$ ${order.totalAmount.toFixed(2)} via ${getPaymentMethodLabel(paymentMethod)}?`)) {
      return;
    }

    try {
      setProcessing(true);
      
      console.log('Enviando confirmação de pagamento:', {
        orderId: order.id,
        paymentMethod,
        amount: order.totalAmount,
      });
      
      // Confirm payment with payment method and amount
      await counterOrderService.confirmPaymentWithMethod(order.id, {
        paymentMethod,
        amount: order.totalAmount,
      });

      alert('Pagamento confirmado com sucesso! Pedido enviado para a cozinha.');
      navigate('/cash/pending-counter-orders');
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error);
      console.error('Detalhes do erro:', JSON.stringify(error.response?.data, null, 2));
      console.error('Status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao confirmar pagamento';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    try {
      await counterOrderService.cancel(order.id, reason);
      alert('Pedido cancelado com sucesso');
      navigate('/cash/pending-counter-orders');
    } catch (error: any) {
      console.error('Erro ao cancelar pedido:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar pedido');
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      CASH: 'Dinheiro',
      DEBIT: 'Cartão de Débito',
      CREDIT: 'Cartão de Crédito',
      PIX: 'PIX',
      VOUCHER: 'Vale/Voucher',
      OTHER: 'Outros',
    };
    return labels[method];
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons = {
      CASH: '💵',
      DEBIT: '💳',
      CREDIT: '💳',
      PIX: '📱',
      VOUCHER: '🎫',
      OTHER: '💰',
    };
    return icons[method];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-red-600">Pedido não encontrado</p>
      </div>
    );
  }

  const paymentMethods: PaymentMethod[] = ['CASH', 'DEBIT', 'CREDIT', 'PIX', 'VOUCHER', 'OTHER'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate('/cash/pending-counter-orders')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Voltar
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Order Details - Printable */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CMD{order.orderNumber.toString().padStart(3, '0')}</h1>
          <p className="text-gray-600 mt-2">Mesa 2</p>
          <p className="text-sm text-gray-500">
            Aberta em: {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Garçom:</p>
              <p className="font-medium">{order.createdBy.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Pessoas:</p>
              <p className="font-medium">1</p>
            </div>
            {order.customerName && (
              <div className="col-span-2">
                <p className="text-gray-600">Cliente:</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Itens Consumidos</h2>
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="text-xs text-gray-500 mb-2">Pedido #{order.orderNumber}</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <div className="flex-1">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.productName}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 ml-6">Obs: {item.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-6">
                      R$ {item.unitPrice.toFixed(2)} cada
                    </p>
                  </div>
                  <span className="font-medium">R$ {item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Observações do Pedido:</p>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span className="text-green-600">R$ {order.totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            * Pedidos balcão não incluem taxa de serviço
          </p>
        </div>
      </div>

      {/* Payment Method Selection - Not Printable */}
      <div className="bg-white rounded-lg shadow-lg p-6 print:hidden">
        <h2 className="text-xl font-semibold mb-4">Forma de Pagamento</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === method
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{getPaymentMethodIcon(method)}</div>
              <div className="text-sm font-medium">{getPaymentMethodLabel(method)}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirmPayment}
          disabled={processing}
          className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {processing ? 'Processando...' : `Confirmar Pagamento - R$ ${order.totalAmount.toFixed(2)}`}
        </button>

        <button
          onClick={handleCancel}
          disabled={processing}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar Pedido
        </button>
      </div>
    </div>
  );
}
