import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { getImageUrl, PLACEHOLDER_IMAGE } from '@/config/constants';

interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  costPrice: number;
  salePrice: number;
  status: string;
  supplier?: string;
  imageUrl?: string;
}

interface PurchaseItem {
  itemId: string;
  quantity: number;
}

export function StockLowStockPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState<Map<string, PurchaseItem>>(new Map());
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stock-management/items?status=baixo');
      
      if (response.data.success) {
        const lowStockItems = response.data.data.filter((item: StockItem) => 
          item.status === 'baixo' || item.status === 'zerado'
        );
        setItems(lowStockItems);

        // Inicializar quantidades sugeridas
        const initialPurchases = new Map<string, PurchaseItem>();
        lowStockItems.forEach((item: StockItem) => {
          const suggestedQty = Math.max(
            Number(item.minimumQuantity) - Number(item.currentQuantity),
            Number(item.minimumQuantity)
          );
          initialPurchases.set(item.id, {
            itemId: item.id,
            quantity: suggestedQty,
          });
        });
        setPurchases(initialPurchases);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newPurchases = new Map(purchases);
    newPurchases.set(itemId, { itemId, quantity });
    setPurchases(newPurchases);
  };

  const generateWhatsAppMessage = () => {
    const itemsToOrder = Array.from(purchases.values())
      .filter(p => p.quantity > 0)
      .map(p => {
        const item = items.find(i => i.id === p.itemId);
        return item ? { ...p, item } : null;
      })
      .filter(Boolean);

    if (itemsToOrder.length === 0) {
      alert('Adicione pelo menos um item para enviar');
      return;
    }

    let message = '🛒 *Lista de Compras - Estoque Baixo*\n\n';
    message += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    message += '📦 *Itens para Comprar:*\n\n';

    itemsToOrder.forEach((order, index) => {
      if (order && order.item) {
        message += `${index + 1}. *${order.item.name}*\n`;
        message += `   Quantidade: ${order.quantity} ${order.item.unit}\n`;
        message += `   Estoque atual: ${order.item.currentQuantity} ${order.item.unit}\n`;
        if (order.item.supplier) {
          message += `   Fornecedor: ${order.item.supplier}\n`;
        }
        message += `   Preço ref.: R$ ${Number(order.item.costPrice).toFixed(2)}\n\n`;
      }
    });

    const totalItems = itemsToOrder.length;
    const totalValue = itemsToOrder.reduce((sum, order) => {
      if (order && order.item) {
        return sum + (order.quantity * Number(order.item.costPrice));
      }
      return sum;
    }, 0);

    message += `\n📊 *Resumo:*\n`;
    message += `Total de itens: ${totalItems}\n`;
    message += `Valor estimado: R$ ${totalValue.toFixed(2)}\n\n`;
    message += `_Enviado pelo Sistema de Gestão de Estoque_`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTotalItems = () => {
    return Array.from(purchases.values()).filter(p => p.quantity > 0).length;
  };

  const getTotalValue = () => {
    return Array.from(purchases.values()).reduce((sum, p) => {
      const item = items.find(i => i.id === p.itemId);
      return sum + (p.quantity * Number(item?.costPrice || 0));
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Itens com Estoque Baixo</h1>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'item precisa' : 'itens precisam'} de reposição
          </p>
        </div>
        
        <button
          onClick={() => navigate('/stock')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tudo em ordem!
          </h2>
          <p className="text-gray-600 mb-4">
            Não há itens com estoque baixo no momento
          </p>
          <Link
            to="/stock"
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Voltar para Estoque
          </Link>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estoque Atual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Qtd. a Comprar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Preço Unit.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fornecedor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => {
                  const purchase = purchases.get(item.id);
                  const subtotal = (purchase?.quantity || 0) * Number(item.costPrice);
                  
                  return (
                    <tr key={item.id} className={purchase?.quantity ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                            {item.imageUrl ? (
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-red-600">
                          {item.currentQuantity} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {item.minimumQuantity}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={purchase?.quantity || 0}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(subtotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.supplier || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* WhatsApp Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Enviar Lista de Compras
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do WhatsApp (opcional)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Deixe em branco para escolher o contato no WhatsApp
                </p>
              </div>

              <div className="flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total de itens:</span>
                    <span className="font-semibold text-gray-900">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor estimado:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(getTotalValue())}
                    </span>
                  </div>
                </div>

                <button
                  onClick={generateWhatsAppMessage}
                  disabled={getTotalItems() === 0}
                  className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
