import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Grid3x3,
  List,
  Filter,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../config/constants';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingSpinner } from '../../components/loading';
import { useToast } from '../../hooks/useToast';

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
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
      showToast('Produto excluído com sucesso', 'success');
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      showToast('Erro ao excluir produto', 'error');
    }
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const newProduct = {
        ...product,
        name: `${product.name} (Cópia)`,
        id: undefined,
      };
      await api.post('/products', newProduct);
      showToast('Produto duplicado com sucesso', 'success');
      loadProducts();
    } catch (error) {
      console.error('Erro ao duplicar produto:', error);
      showToast('Erro ao duplicar produto', 'error');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await api.patch(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      showToast(
        `Produto ${!product.isActive ? 'ativado' : 'desativado'} com sucesso`,
        'success'
      );
      loadProducts();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showToast('Erro ao alterar status do produto', 'error');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'low' && product.price < 20) ||
      (priceRange === 'medium' && product.price >= 20 && product.price < 50) ||
      (priceRange === 'high' && product.price >= 50);

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
  });

  const categories = Array.from(new Set(products.map((p) => p.category.name)));

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
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        subtitle={`${filteredProducts.length} ${
          filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'
        }`}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/products/new')}
          >
            Novo Produto
          </Button>
        }
      />

      {/* Filtros e Controles */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Linha 1: Busca e Toggle de Visualização */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefixIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="md"
                icon={<Grid3x3 className="w-4 h-4" />}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'outline'}
                size="md"
                icon={<List className="w-4 h-4" />}
                onClick={() => setViewMode('table')}
              >
                Lista
              </Button>
            </div>
          </div>

          {/* Linha 2: Filtros Avançados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'Todas as categorias' },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Ativos' },
                { value: 'inactive', label: 'Inativos' },
              ]}
            />

            <Select
              label="Faixa de Preço"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as any)}
              options={[
                { value: 'all', label: 'Todos os preços' },
                { value: 'low', label: 'Até R$ 20' },
                { value: 'medium', label: 'R$ 20 - R$ 50' },
                { value: 'high', label: 'Acima de R$ 50' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description={
            searchTerm || categoryFilter || statusFilter !== 'all' || priceRange !== 'all'
              ? 'Tente ajustar os filtros para encontrar produtos'
              : 'Comece criando seu primeiro produto'
          }
          action={
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/products/new')}
            >
              Criar Primeiro Produto
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const marginStatus = getMarginStatus(product);

            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Imagem do Produto */}
                <div className="relative h-48 bg-neutral-100 dark:bg-neutral-700">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <DollarSign className="w-16 h-16 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  )}
                  {/* Badge de Status */}
                  <div className="absolute top-2 right-2">
                    <Badge color={product.isActive ? 'success' : 'neutral'}>
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 space-y-3">
                  {/* Cabeçalho */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {product.category.name}
                    </p>
                  </div>

                  {/* Descrição */}
                  {product.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Preço */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary-500">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Informações de Receita */}
                  {product.recipe && (
                    <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Custo:</span>
                        <span className="font-medium">
                          R$ {product.recipe.costPerPortion.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Lucro:</span>
                        <span className="font-medium text-success">
                          R$ {(product.price - product.recipe.costPerPortion).toFixed(2)}
                        </span>
                      </div>
                      {product.currentMargin && marginStatus && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            Margem:
                          </span>
                          <div className="flex items-center gap-1">
                            <marginStatus.icon
                              className={`w-4 h-4 ${marginStatus.color}`}
                            />
                            <span className={`font-bold ${marginStatus.color}`}>
                              {product.currentMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon={<DollarSign className="w-4 h-4" />}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Copy className="w-4 h-4" />}
                      onClick={() => handleDuplicate(product)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDelete(product.id)}
                      className="text-error hover:bg-error/10"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Preço</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Custo</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Margem</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredProducts.map((product) => {
                  const marginStatus = getMarginStatus(product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={getImageUrl(product.imageUrl)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.category.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary-500">
                        R$ {product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {product.recipe
                          ? `R$ ${product.recipe.costPerPortion.toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {product.currentMargin && marginStatus ? (
                          <div className="flex items-center justify-end gap-1">
                            <marginStatus.icon
                              className={`w-4 h-4 ${marginStatus.color}`}
                            />
                            <span className={`font-medium ${marginStatus.color}`}>
                              {product.currentMargin.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={product.isActive ? 'success' : 'neutral'}>
                          {product.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<DollarSign className="w-4 h-4" />}
                            onClick={() => navigate(`/products/${product.id}`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDelete(product.id)}
                            className="text-error hover:bg-error/10"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
