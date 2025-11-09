import { Table, TableStatus } from './TableGrid';
import { Users, Clock, DollarSign, Sparkles, Receipt } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TableCardProps {
  table: Table;
  onClick?: () => void;
  onOpenCommand?: () => void;
  onCleanTable?: () => void;
  onReserveTable?: () => void;
}

const STATUS_CONFIG: Record<
  TableStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeColor: 'success' | 'error' | 'info' | 'warning';
  }
> = {
  available: {
    label: 'Disponível',
    color: 'text-success',
    bgColor: 'bg-success/5 dark:bg-success/10',
    borderColor: 'border-success/20 hover:border-success',
    badgeColor: 'success',
  },
  occupied: {
    label: 'Ocupada',
    color: 'text-error',
    bgColor: 'bg-error/5 dark:bg-error/10',
    borderColor: 'border-error/20 hover:border-error',
    badgeColor: 'error',
  },
  reserved: {
    label: 'Reservada',
    color: 'text-info',
    bgColor: 'bg-info/5 dark:bg-info/10',
    borderColor: 'border-info/20 hover:border-info',
    badgeColor: 'info',
  },
  cleaning: {
    label: 'Em Limpeza',
    color: 'text-warning',
    bgColor: 'bg-warning/5 dark:bg-warning/10',
    borderColor: 'border-warning/20 hover:border-warning',
    badgeColor: 'warning',
  },
};

export const TableCard = ({
  table,
  onClick,
  onOpenCommand,
  onCleanTable,
  onReserveTable,
}: TableCardProps) => {
  const config = STATUS_CONFIG[table.status];

  const getOccupiedTime = () => {
    if (!table.occupiedSince) return null;
    return formatDistanceToNow(new Date(table.occupiedSince), {
      addSuffix: false,
      locale: ptBR,
    });
  };

  return (
    <div
      className={`relative rounded-lg border-2 p-4 transition-all ${config.bgColor} ${config.borderColor} hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Mesa {table.number}
          </h3>
          <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            <Users className="w-3 h-3" />
            <span>{table.capacity} lugares</span>
          </div>
        </div>
        <Badge variant="soft" color={config.badgeColor}>
          {config.label}
        </Badge>
      </div>

      {/* Informações Adicionais */}
      <div className="space-y-2 mb-3">
        {table.status === 'occupied' && (
          <>
            {table.commandNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Receipt className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Comanda #{table.commandNumber}
                </span>
              </div>
            )}
            {table.occupiedSince && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  {getOccupiedTime()}
                </span>
              </div>
            )}
            {table.totalAmount !== undefined && table.totalAmount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">
                  R$ {table.totalAmount.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}

        {table.status === 'reserved' && table.reservedFor && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-neutral-500" />
            <span className="text-neutral-700 dark:text-neutral-300">
              {table.reservedFor}
            </span>
          </div>
        )}

        {table.status === 'cleaning' && (
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-warning" />
            <span className="text-neutral-700 dark:text-neutral-300">
              Aguardando limpeza
            </span>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="flex gap-2">
        {table.status === 'available' && onOpenCommand && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked - Abrir Comanda');
              onOpenCommand();
            }}
          >
            Abrir Comanda
          </Button>
        )}

        {table.status === 'occupied' && onOpenCommand && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked - Ver Comanda');
              onOpenCommand();
            }}
          >
            Ver Comanda
          </Button>
        )}

        {table.status === 'cleaning' && onCleanTable && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked - Marcar Limpa');
              onCleanTable();
            }}
            className="bg-success hover:bg-success/90"
          >
            Marcar Limpa
          </Button>
        )}

        {table.status === 'available' && onReserveTable && (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked - Reservar');
              onReserveTable();
            }}
          >
            Reservar
          </Button>
        )}
      </div>
    </div>
  );
};
