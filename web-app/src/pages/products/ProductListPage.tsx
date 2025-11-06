import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../config/constants';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category: {
    name: string;
  };
  recipeId?: string;
  recipe?: {
    name: string;
    costPerPortion: number;
  };
  targetMargin?: number;
  currentMargin?: number;
  suggestedPrice?: number;
  isActive: boolean;
  imageUrl?: string;
}

export function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const data = response.data.data || response.data;
      
      // Converter valores Decimal para number
      const productsWithNumbers = Array.isArray(data) ? data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        targetMargin: p.targetMargin ? Number(p.targetMargin) : undefined,
        currentMargin: p.currentMargin ? Number(p.currentMargin) : undefined,
        suggestedPrice: p.suggestedPrice ? Number(p.suggestedPrice) : undefined,
        markup: p.markup ? Number(p.markup) : undefined,
        recipe: p.recipe ? {
          ...p.recipe,
          costPerPortion: Number(p.recipe.costPerPortion),
        } : undefined,
      })) : [];
      
      setProducts(productsWithNumbers);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category.name)));

  const getMarginStatus = (product: Product) => {
    if (!product.currentMargin || !product.targetMargin) return null;
    
    const diff = product.currentMargin - product.targetMargin;
    if (diff >= 0) {
      return { status: 'good', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    } else {
      return { status: 'bad', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const marginStatus = getMarginStatus(product);
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {product.imageUrl && (
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Preço de Venda:</span>
                      <span className="text-lg font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>

                    {product.recipe && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Custo (CMV):</span>
                          <span className="font-semibold text-gray-700">
                            R$ {product.recipe.costPerPortion.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Lucro/Unidade:</span>
                          <span className="font-semibold text-green-600">
                            R$ {(product.price - product.recipe.costPerPortion).toFixed(2)}
                          </span>
                        </div>

                        {product.currentMargin && (
                          <div className={`flex justify-between items-center p-2 rounded ${marginStatus?.bg}`}>
                            <span className="text-sm font-medium">Margem Atual:</span>
                            <div className="flex items-center">
                              {marginStatus && <marginStatus.icon className={`h-4 w-4 mr-1 ${marginStatus.color}`} />}
                              <span className={`font-bold ${marginStatus?.color}`}>
                                {product.currentMargin.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {product.suggestedPrice && product.suggestedPrice !== product.price && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 Preço sugerido: R$ {product.suggestedPrice.toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Detalhes
                    </button>
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
