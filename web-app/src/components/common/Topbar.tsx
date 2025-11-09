import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from './Icon';
import { Breadcrumbs } from './Breadcrumbs';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const notifications = [
    { id: 1, title: 'Pedido #123 pronto', time: '5 min atrás', unread: true },
    { id: 2, title: 'Estoque baixo: Tomate', time: '1 hora atrás', unread: true },
    { id: 3, title: 'Nova comanda aberta', time: '2 horas atrás', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Menu items do usuário
  const userMenuItems = [
    {
      label: 'Meu Perfil',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/settings/profile'),
    },
    {
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings/establishment'),
    },
    { divider: true },
    {
      label: 'Sair',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 md:px-6 relative z-30">
      {/* Menu button (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <Menu size={24} className="text-neutral-600 dark:text-neutral-400" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors hidden md:flex items-center gap-2"
          title="Buscar (Cmd+K)"
        >
          <Search size={20} className="text-neutral-600 dark:text-neutral-400" />
          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden lg:inline">
            Buscar...
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-neutral-600 dark:text-neutral-400" />
          ) : (
            <Sun size={20} className="text-neutral-600 dark:text-neutral-400" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
          >
            <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
            {unreadCount > 0 && (
              <Badge
                color="error"
                variant="solid"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-1"
              >
                {unreadCount}
              </Badge>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border-2 border-neutral-200 dark:border-neutral-700 z-20"
                >
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Notificações
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={clsx(
                            'p-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors',
                            notification.unread &&
                              'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500'
                          )}
                        >
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <button className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                      Ver todas
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <Dropdown
          align="right"
          items={userMenuItems}
          trigger={
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown size={16} className="text-neutral-600 dark:text-neutral-400 hidden md:block" />
            </button>
          }
        />
      </div>

      {/* Search Modal (placeholder) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl mx-4 bg-white dark:bg-neutral-900 rounded-lg shadow-2xl border-2 border-neutral-200 dark:border-neutral-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <Search size={20} className="text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded">
                    ESC
                  </kbd>
                </div>
              </div>
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  Digite para buscar...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
