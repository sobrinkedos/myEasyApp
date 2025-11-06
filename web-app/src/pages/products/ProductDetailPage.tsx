import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, DollarSign, Package, Calculator, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
  };
  recipe?: {
    id: string;
    name: string;
    costPerPortion: number;
    portionSize: number;
    portionUnit: string;
    ingredients: Array<{
      ingredient: {
        name: string;
        unit: string;
      };
      quantity: number;
      cost: number;
    }>;
  };
  targetMargin?: number;
  currentMargin?: number;
  suggestedPrice?: number;
  markup?: number;
  preparationTime?: number;
  salesCount?: number;
  revenue?: number;
  imageUrl?: string;
}

interface PricingSimulation {
  margin: number;
  price: number;
  profit: number;
  markup: number;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<PricingSimulation[]>([]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const data = response.data.data || response.data;
      
      // Converter valores Decimal para number
      const productWithNumbers = {
        ...data,
        price: Number(data.price),
        targetMargin: data.targetMargin ? Number(data.targetMargin) : undefined,
        currentMargin: data.currentMargin ? Number(data.currentMargin) : undefined,
        suggestedPrice: data.suggestedPrice ? Number(data.suggestedPrice) : undefined,
        markup: data.markup ? Number(data.markup) : undefined,
        recipe: data.recipe ? {
          ...data.recipe,
          costPerPortion: Number(data.recipe.costPerPortion),
          portionSize: Number(data.recipe.portionSize),
        } : undefined,
      };
      
      setProduct(productWithNumbers);
      
      if (response.data.recipe) {
        generateSimulations(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSimulations = (prod: Product) => {
    if (!prod.recipe) return;

    const cost = prod.recipe.costPerPortion;
    const margins = [50, 55, 60, 65, 70, 75, 80];
    
    const sims = margins.map(margin => {
      const price = cost / (1 - margin / 100);
      const profit = price - cost;
      const markup = ((price - cost) / cost) * 100;
      
      return { margin, price, profit, markup };
    });
    
    setSimulations(sims);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Produto não encontrado</p>
      </div>
    );
  }

  const cost = product.recipe?.costPerPortion || 0;
  const profit = product.price - cost;
  const hasRecipe = !!product.recipe;
  const marginStatus = product.currentMargin && product.targetMargin 
    ? product.currentMargin >= product.targetMargin 
    : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">{product.category.name}</p>
          </div>
          <button
            onClick={() => navigate(`/products/${product.id}/edit`)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Edit className="h-5 w-5 mr-2" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Produto</h2>
            
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            
            {product.description && (
              <p className="text-gray-700 mb-4">{product.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Preço de Venda</span>
                <p className="text-2xl font-bold text-gray-900">R$ {product.price.toFixed(2)}</p>
              </div>
              {product.preparationTime && (
                <div>
                  <span className="text-sm text-gray-600">Tempo de Preparo</span>
                  <p className="text-2xl font-bold text-gray-900">{product.preparationTime} min</p>
                </div>
              )}
            </div>
          </div>

          {/* Análise de Custos */}
          {hasRecipe && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-orange-600" />
                Análise de Custos (CMV)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Custo</div>
                  <div className="text-xl font-bold text-blue-900">
                    R$ {cost.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Lucro</div>
                  <div className="text-xl font-bold text-green-900">
                    R$ {profit.toFixed(2)}
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${marginStatus ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-sm mb-1 ${marginStatus ? 'text-green-600' : 'text-red-600'}`}>
                    Margem Atual
                  </div>
                  <div className={`text-xl font-bold flex items-center ${marginStatus ? 'text-green-900' : 'text-red-900'}`}>
                    {marginStatus ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                    {product.currentMargin?.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">Markup</div>
                  <div className="text-xl font-bold text-purple-900">
                    {product.markup?.toFixed(1)}%
                  </div>
                </div>
              </div>

              {product.targetMargin && product.currentMargin && product.currentMargin < product.targetMargin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Margem Abaixo do Esperado</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Margem atual ({product.currentMargin.toFixed(1)}%) está abaixo da margem desejada ({product.targetMargin.toFixed(1)}%).
                        {product.suggestedPrice && (
                          <> Considere ajustar o preço para R$ {product.suggestedPrice.toFixed(2)}.</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Composição de Custos */}
              {product.recipe && product.recipe.ingredients.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Composição de Custos</h3>
                  <div className="space-y-2">
                    {product.recipe.ingredients.map((item, index) => {
                      const percentage = (item.cost / cost) * 100;
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-700">{item.ingredient.name}</span>
                              <span className="text-gray-900 font-medium">
                                R$ {item.cost.toFixed(2)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Simulação de Preços */}
          {hasRecipe && simulations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Simulação de Preços</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Margem</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Preço</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Lucro</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Markup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulations.map((sim, index) => {
                      const isCurrent = product.targetMargin && Math.abs(sim.margin - product.targetMargin) < 1;
                      return (
                        <tr
                          key={index}
                          className={`border-b ${isCurrent ? 'bg-orange-50' : ''}`}
                        >
                          <td className="py-2 text-sm">{sim.margin}%</td>
                          <td className="py-2 text-sm text-right font-medium">
                            R$ {sim.price.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-right text-green-600">
                            R$ {sim.profit.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-right">{sim.markup.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Receita Vinculada */}
          {product.recipe ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                Receita Vinculada
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Nome</span>
                  <p className="font-medium text-gray-900">{product.recipe.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Custo por Porção</span>
                  <p className="font-medium text-gray-900">
                    R$ {product.recipe.costPerPortion.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tamanho da Porção</span>
                  <p className="font-medium text-gray-900">
                    {product.recipe.portionSize} {product.recipe.portionUnit}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/recipes/${product.recipe?.id}`)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ver Receita Completa
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Sem Receita</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Este produto não possui receita vinculada. Vincule uma receita para análise de custos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metas */}
          {product.targetMargin && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-orange-600" />
                Metas
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Margem Desejada</span>
                  <p className="text-2xl font-bold text-gray-900">{product.targetMargin.toFixed(1)}%</p>
                </div>
                {product.suggestedPrice && (
                  <div>
                    <span className="text-sm text-gray-600">Preço Sugerido</span>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {product.suggestedPrice.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          {(product.salesCount || product.revenue) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
              <div className="space-y-3">
                {product.salesCount && (
                  <div>
                    <span className="text-sm text-gray-600">Vendas</span>
                    <p className="text-2xl font-bold text-gray-900">{product.salesCount}</p>
                  </div>
                )}
                {product.revenue && (
                  <div>
                    <span className="text-sm text-gray-600">Receita Total</span>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {product.revenue.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
