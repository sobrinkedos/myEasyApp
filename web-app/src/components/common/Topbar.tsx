import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from './Icon';
import { Breadcrumbs } from './Breadcrumbs';
import clsx from 'clsx';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 relative">
      {/* Menu button (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Icon name="menu" size={24} className="text-gray-600" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumbs />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Icon name="bell" size={24} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                          notification.unread && 'bg-blue-50'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Ver todas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
            <Icon name="chevronDown" size={16} className="text-gray-600" />
          </button>

          {/* User Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                  <p className="text-sm text-gray-500">{user?.email || ''}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/settings/profile');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Icon name="user" size={18} />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings/establishment');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Icon name="cog" size={18} />
                    Configurações
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Icon name="logout" size={18} />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
