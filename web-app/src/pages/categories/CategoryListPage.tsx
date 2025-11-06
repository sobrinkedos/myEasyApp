import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/services/api';

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    products: number;
  };
}

export function CategoryListPage() {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories');
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await api.delete(`/categories/${id}`);
      
      if (response.data.success) {
        setSuccessMessage('Categoria deletada com sucesso!');
        loadCategories();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      setError(err.response?.data?.message || 'Erro ao deletar categoria');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/categories/${id}`, {
        isActive: !currentStatus,
      });
      
      if (response.data.success) {
        setSuccessMessage(`Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`);
        loadCategories();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar categoria');
      setTimeout(() => setError(''), 5000);
    }
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
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie as categorias de produtos</p>
        </div>
        
        <Link
          to="/categories/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          + Nova Categoria
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total de Categorias</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Categorias Ativas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {categories.filter(c => c.isActive).length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Categorias Inativas</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {categories.filter(c => !c.isActive).length}
          </p>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Nenhuma categoria cadastrada</p>
          <Link
            to="/categories/new"
            className="inline-block mt-4 text-orange-600 hover:text-orange-700"
          >
            Cadastrar primeira categoria
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ordem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produtos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold">
                      {category.displayOrder}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category._count?.products || 0} produtos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(category.id, category.isActive)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {category.isActive ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/categories/${category.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
