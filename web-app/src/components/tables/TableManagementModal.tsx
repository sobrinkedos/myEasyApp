import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  History,
  DollarSign,
  Users,
  Receipt,
  ClipboardList,
} from 'lucide-react';
import { Table, TableStatus } from './TableGrid/TableGrid';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TableManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onStatusChange: (status: TableStatus) => Promise<void>;
  onViewHistory: () => void;
  onCloseService: () => void;
  onOpenCommand: () => void;
  onViewOrders: () => void;
}

const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    icon: React.ReactNode;
    color: 'success' | 'error' | 'info' | 'warning';
    description: string;
  }
> = {
  available: {
    label: 'Disponível',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'success',
    description: 'Mesa livre para novos clientes',
  },
  occupied: {
    label: 'Ocupada',
    icon: <Users className="w-5 h-5" />,
    color: 'error',
    description: 'Mesa em atendimento',
  },
  reserved: {
    label: 'Reservada',
    icon: <Clock className="w-5 h-5" />,
    color: 'info',
    description: 'Mesa reservada para cliente',
  },
  cleaning: {
    label: 'Em Limpeza',
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'warning',
    description: 'Mesa aguardando limpeza',
  },
};

export function TableManagementModal({
  isOpen,
  onClose,
  table,
  onStatusChange,
  onViewHistory,
  onCloseService,
  onOpenCommand,
  onViewOrders,
}: TableManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const currentConfig = STATUS_CONFIG[table.status];

  const handleStatusChange = async (newStatus: TableStatus) => {
    if (newStatus === table.status) return;
    
    // Se está mudando para "occupied" e não tem comanda, abrir fluxo de criação
    if (newStatus === 'occupied' && !table.commandId) {
      onOpenCommand();
      return;
    }
    
    try {
      setLoading(true);
      await onStatusChange(newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getOccupiedTime = () => {
    if (!table.occupiedSince) return null;
    return formatDistanceToNow(new Date(table.occupiedSince), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mesa ${table.number}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Status Atual */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Status Atual
            </span>
            <Badge variant="soft" color={currentConfig.color}>
              <div className="flex items-center gap-1">
                {currentConfig.icon}
                {currentConfig.label}
              </div>
            </Badge>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <Users className="w-4 h-4" />
              <span>Capacidade: {table.capacity} lugares</span>
            </div>

            {table.status === 'occupied' && (
              <>
                {table.commandNumber && (
                  <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Receipt className="w-4 h-4" />
                    <span>Comanda #{table.commandNumber}</span>
                  </div>
                )}
                {table.occupiedSince && (
                  <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <Clock className="w-4 h-4" />
                    <span>Ocupada {getOccupiedTime()}</span>
                  </div>
                )}
                {table.totalAmount !== undefined && table.totalAmount > 0 && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-success">
                    <DollarSign className="w-4 h-4" />
                    <span>R$ {table.totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {table.status === 'reserved' && table.reservedFor && (
              <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <Users className="w-4 h-4" />
                <span>Reservada para: {table.reservedFor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Alterar Status */}
        <div>
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Alterar Status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = status === table.status;
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading || isActive}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={isActive ? 'text-primary-600' : 'text-neutral-500'}>
                      {config.icon}
                    </div>
                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          {table.status === 'occupied' && (
            <Button
              variant="outline"
              fullWidth
              icon={<ClipboardList className="w-4 h-4" />}
              onClick={onViewOrders}
              disabled={!table.commandId}
            >
              Ver Pedidos da Mesa
            </Button>
          )}

          <Button
            variant="outline"
            fullWidth
            icon={<History className="w-4 h-4" />}
            onClick={onViewHistory}
          >
            Histórico do Dia
          </Button>

          {table.status === 'occupied' && (
            <Button
              variant="primary"
              fullWidth
              icon={<DollarSign className="w-4 h-4" />}
              onClick={onCloseService}
            >
              Fechar Atendimento
            </Button>
          )}
        </div>

        {/* Botão Fechar */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
