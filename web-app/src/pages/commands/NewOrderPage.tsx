import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { commandService, Command } from '../../services/command.service';
import { orderService } from '../../services/order.service';
import api from '../../services/api';

interface Product {
  id: string;
  name: string;
  price: number;
  category?: { name: string };
}

interface OrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  observations: string;
}

export default function NewOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [command, setCommand] = useState<Command | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [commandRes, productsRes, stockItemsRes] = await Promise.all([
        commandService.getById(id!),
        api.get('/products', { params: { limit: 1000, isActive: true } }),
        api.get('/stock/items', { params: { limit: 1000 } }),
      ]);
      
      setCommand(commandRes.data);
      
      // Combinar produtos manufaturados e produtos de revenda
      const manufacturedProducts = productsRes.data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
      }));
      
      const resaleProducts = (stockItemsRes.data.data || [])
        .filter((item: any) => item.isActive && Number(item.salePrice) > 0)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.salePrice,
          category: { name: item.category },
        }));
      
      const allProducts = [...manufacturedProducts, ...resaleProducts];
      console.log('Produtos carregados:', allProducts.length, '(', manufacturedProducts.length, 'manufaturados +', resaleProducts.length, 'revenda)');
      setProducts(allProducts);
      
      const uniqueCategories = [...new Set(allProducts.map((p: Product) => p.category?.name).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        product,
        quantity: 1,
        observations: '',
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter(item => item.productId !== productId));
    } else {
      setItems(items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const updateObservations = (productId: string, observations: string) => {
    setItems(items.map(item =>
      item.productId === productId ? { ...item, observations } : item
    ));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }

    try {
      setLoading(true);
      await orderService.create({
        commandId: id!,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          observations: item.observations || undefined,
        })),
      });
      navigate(`/commands/${id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.name === selectedCategory)
    : products;

  const total = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/commands/${id}`)}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
        {command && (
          <p className="text-gray-600">
            {command.code} - {command.table ? `Mesa ${command.table.number}` : 'Balcão'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Produtos</h2>
            
            {/* Filtro de Categorias */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Lista de Produtos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {products.length === 0 
                    ? 'Nenhum produto cadastrado. Cadastre produtos primeiro.'
                    : 'Nenhum produto encontrado nesta categoria.'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-green-600 font-semibold text-sm mt-1">
                      R$ {Number(product.price).toFixed(2)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Itens do Pedido</h2>
            
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum item adicionado
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product?.name}</div>
                          <div className="text-xs text-gray-500">
                            R$ {Number(item.product?.price || 0).toFixed(2)} cada
                          </div>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.productId, 0)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                        <span className="ml-auto font-semibold">
                          R$ {(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="Observações..."
                        value={item.observations}
                        onChange={(e) => updateObservations(item.productId, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Enviando...' : 'Enviar Pedido'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
