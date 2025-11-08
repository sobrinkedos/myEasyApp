import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { commandService, Command } from '../../services/command.service';
import api from '../../services/api';

type PaymentMethod = 'CASH' | 'DEBIT' | 'CREDIT' | 'PIX' | 'VOUCHER' | 'OTHER';

export default function CommandPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [command, setCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

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
      alert('Erro ao carregar comanda');
      navigate('/cash/pending-commands');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPayment = async () => {
    if (!command) return;
    
    if (!window.confirm(`Confirmar pagamento de R$ ${Number(command.total).toFixed(2)} via ${getPaymentMethodLabel(paymentMethod)}?`)) {
      return;
    }

    try {
      setProcessing(true);
      
      // Confirm payment and register transaction
      await api.post(`/commands/${command.id}/confirm-payment`, {
        paymentMethod,
        amount: Number(command.total),
      });

      alert('Pagamento confirmado com sucesso!');
      navigate('/cash/pending-commands');
    } catch (error: any) {
      console.error('Erro ao confirmar pagamento:', error);
      alert(error.response?.data?.message || 'Erro ao confirmar pagamento');
    } finally {
      setProcessing(false);
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

  if (!command) {
    return (
      <div className="p-6">
        <p className="text-red-600">Comanda não encontrada</p>
      </div>
    );
  }

  const paymentMethods: PaymentMethod[] = ['CASH', 'DEBIT', 'CREDIT', 'PIX', 'VOUCHER', 'OTHER'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate('/cash/pending-commands')}
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

      {/* Command Details - Printable */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{command.code}</h1>
          <p className="text-gray-600 mt-2">
            {command.table ? `Mesa ${command.table.number}` : 'Balcão'}
          </p>
          <p className="text-sm text-gray-500">
            Aberta em: {new Date(command.openedAt).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Garçom:</p>
              <p className="font-medium">{command.waiter?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Pessoas:</p>
              <p className="font-medium">{command.numberOfPeople}</p>
            </div>
            {command.customerName && (
              <div>
                <p className="text-gray-600">Cliente:</p>
                <p className="font-medium">{command.customerName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Itens Consumidos</h2>
          <div className="space-y-3">
            {command.orders?.map((order) => (
              <div key={order.id} className="border-b pb-3">
                <p className="text-xs text-gray-500 mb-2">Pedido #{order.orderNumber}</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.productName || item.product?.name}
                      {item.observations && (
                        <p className="text-xs text-gray-500 ml-6">Obs: {item.observations}</p>
                      )}
                    </div>
                    <span className="font-medium">R$ {Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">R$ {Number(command.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Taxa de Serviço (10%):</span>
            <span className="font-medium">R$ {Number(command.serviceCharge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">R$ {Number(command.total).toFixed(2)}</span>
          </div>
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
          className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processando...' : `Confirmar Pagamento - R$ ${Number(command.total).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
