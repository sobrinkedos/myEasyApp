import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from './Icon';
import {
  Home,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '../ui/Badge';

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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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
      { icon: 'clipboard', label: 'Comandas', path: '/commands' },
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
      { icon: 'clipboard', label: 'Conferências', path: '/appraisals' },
      { icon: 'chartBar', label: 'CMV', path: '/cmv' },
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

function MenuItem({
  item,
  level = 0,
  collapsed,
}: {
  item: MenuItem;
  level?: number;
  collapsed?: boolean;
}) {
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
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: collapsed ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
          {
            'bg-primary-500 text-white shadow-md': isActive,
            'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800':
              !isActive,
            'pl-10': level > 0 && !collapsed,
            'justify-center': collapsed,
          }
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon name={item.icon} size={20} />
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {hasChildren && (
              <ChevronDown
                size={16}
                className={clsx('transition-transform duration-200', expanded && 'rotate-180')}
              />
            )}
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {hasChildren && expanded && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {item.children!.map((child, index) => (
                <MenuItem key={index} item={child} level={level + 1} collapsed={collapsed} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
  variant,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  const content = (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800"
    >
      {/* Logo */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className={clsx('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={24} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Restaurant
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Management</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button (apenas em desktop) */}
      {variant === 'permanent' && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'absolute -right-3 top-20 z-10',
            'w-6 h-6 rounded-full',
            'bg-white dark:bg-neutral-800',
            'border-2 border-neutral-200 dark:border-neutral-700',
            'flex items-center justify-center',
            'hover:bg-neutral-50 dark:hover:bg-neutral-700',
            'transition-colors duration-200',
            'shadow-md'
          )}
        >
          {collapsed ? (
            <ChevronRight size={14} className="text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronLeft size={14} className="text-neutral-600 dark:text-neutral-400" />
          )}
        </button>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );

  if (variant === 'drawer') {
    return (
      <>
        {/* Overlay */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Drawer */}
        <motion.aside
          initial={{ x: -256 }}
          animate={{ x: open ? 0 : -256 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
        >
          {content}
        </motion.aside>
      </>
    );
  }

  return (
    <aside className={clsx('flex-shrink-0 hidden lg:block relative', sidebarWidth)}>
      {content}
    </aside>
  );
}
