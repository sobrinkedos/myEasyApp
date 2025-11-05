import { useLocation, Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Produtos',
  categories: 'Categorias',
  ingredients: 'Insumos',
  stock: 'Estoque',
  orders: 'Pedidos',
  tables: 'Mesas',
  cash: 'Caixa',
  reports: 'Relatórios',
  sales: 'Vendas',
  financial: 'Financeiro',
  performance: 'Performance',
  settings: 'Configurações',
  establishment: 'Estabelecimento',
  profile: 'Perfil',
  users: 'Usuários',
  permissions: 'Permissões',
  new: 'Novo',
  edit: 'Editar',
};

export function Breadcrumbs() {
  const location = useLocation();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs: Breadcrumb[] = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return { label, path };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-400">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-gray-900">{breadcrumb.label}</span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
