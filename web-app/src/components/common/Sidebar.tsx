import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from './Icon';
import clsx from 'clsx';

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'drawer';
}

const menuItems: MenuItem[] = [
  {
    icon: 'home',
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: 'shoppingBag',
    label: 'Vendas',
    children: [
      { icon: 'clipboard', label: 'Pedidos', path: '/orders' },
      { icon: 'table', label: 'Mesas', path: '/tables' },
      { icon: 'cash', label: 'Caixa', path: '/cash' },
    ],
  },
  {
    icon: 'package',
    label: 'Produtos',
    children: [
      { icon: 'package', label: 'Produtos', path: '/products' },
      { icon: 'tag', label: 'Categorias', path: '/categories' },
      { icon: 'clipboard', label: 'Receitas', path: '/recipes' },
      { icon: 'clipboard', label: 'Insumos', path: '/ingredients' },
      { icon: 'clipboard', label: 'Estoque', path: '/stock' },
    ],
  },
  {
    icon: 'chartBar',
    label: 'Relatórios',
    children: [
      { icon: 'chartBar', label: 'Vendas', path: '/reports/sales' },
      { icon: 'chartBar', label: 'Estoque', path: '/reports/stock' },
      { icon: 'chartBar', label: 'Financeiro', path: '/reports/financial' },
      { icon: 'chartBar', label: 'Performance', path: '/reports/performance' },
    ],
  },
  {
    icon: 'cog',
    label: 'Configurações',
    children: [
      { icon: 'cog', label: 'Estabelecimento', path: '/settings/establishment' },
      { icon: 'user', label: 'Perfil', path: '/settings/profile' },
      { icon: 'user', label: 'Usuários', path: '/settings/users' },
      { icon: 'cog', label: 'Permissões', path: '/settings/permissions' },
    ],
  },
];

function MenuItem({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const isActive = item.path === location.pathname;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-left',
          isActive
            ? 'bg-orange-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white',
          level > 0 && 'pl-12'
        )}
      >
        <Icon name={item.icon} size={20} />
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        {hasChildren && (
          <Icon
            name="chevronDown"
            size={16}
            className={clsx('transition-transform', expanded && 'rotate-180')}
          />
        )}
      </button>

      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <MenuItem key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ open, onClose, variant }: SidebarProps) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const content = (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <Icon name="shoppingBag" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Restaurant</h1>
            <p className="text-xs text-gray-400">Management</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <Icon name="user" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Icon name="logout" size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  if (variant === 'drawer') {
    return (
      <>
        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Drawer */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64',
            'transform transition-transform duration-300 ease-in-out lg:hidden',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      {content}
    </aside>
  );
}
